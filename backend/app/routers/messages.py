import time
import json
import uuid
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.message import (
    ConversationRecord,
    MessageRecord,
    FlowRecord,
    TriggerRecord,
    BroadcastRecord,
)
from app.models.member import Member
from app.schemas.message import (
    ConversationCreate,
    ConversationPatchRequest,
    ConversationResponse,
    MessageCreate,
    MessageResponse,
    FlowCreate,
    FlowResponse,
    TriggerCreate,
    TriggerResponse,
    BroadcastCreate,
    BroadcastResponse,
)
from app.routers.whatsapp import whatsapp_sessions

router = APIRouter(prefix="/messages", tags=["Omnichannel Messages & BrightBean Automations"])


def _conv_to_response(c: ConversationRecord) -> ConversationResponse:
    # Parse labels safely
    labels_list = []
    if c.labels:
        try:
            labels_list = json.loads(c.labels)
        except Exception:
            labels_list = [l.strip() for l in c.labels.split(",") if l.strip()]

    # Check 24-hr messaging window
    now = datetime.utcnow()
    window_expires = c.window_expires_at or (c.updated_at + timedelta(hours=24))
    is_window_active = now < window_expires

    return ConversationResponse(
        id=c.id,
        accountId=f"ch-{c.platform}",
        platform=c.platform,
        participantId=c.participant_id,
        participantName=c.participant_name,
        participantHandle=c.participant_handle,
        participantAvatar=c.participant_avatar,
        participantVerified=c.participant_verified or False,
        lastMessage=c.last_message or "",
        updatedTime=c.updated_time or c.created_at.strftime("%I:%M %p"),
        unreadCount=c.unread_count or 0,
        status=c.status or "open",
        automationPaused=bool(c.automation_paused),
        assignedTo=c.assigned_to or "Foreperson Admin",
        labels=labels_list,
        internalNotes=c.internal_notes or "",
        windowExpiresAt=window_expires.isoformat(),
        isWindowActive=is_window_active,
        linkedSubscriberId=c.linked_subscriber_id,
        linkedSubscriberName=c.linked_subscriber_name,
        linkedSchemeName=c.linked_scheme_name or "Subscriber Direct",
        linkedTicketNo=c.linked_ticket_no,
        dueAmount=c.due_amount or 0,
    )


def _msg_to_response(m: MessageRecord) -> MessageResponse:
    return MessageResponse(
        id=m.id,
        conversationId=m.conversation_id,
        accountId=m.account_id or f"ch-{m.platform}",
        platform=m.platform,
        message=m.message,
        direction=m.direction,
        createdAt=m.created_at.strftime("%I:%M %p"),
        senderName=m.sender_name,
        deliveryStatus=m.delivery_status or "delivered",
    )


@router.get("/conversations", response_model=List[ConversationResponse])
def get_conversations(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    """
    Fetch conversations with optional status filtering ('open' vs 'done') as per BrightBean Inbox architecture.
    """
    q = db.query(ConversationRecord)
    if status_filter in ["open", "done"]:
        q = q.filter(ConversationRecord.status == status_filter)
    convs = q.order_by(ConversationRecord.updated_at.desc()).all()
    return [_conv_to_response(c) for c in convs]


@router.post("/conversations", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(payload: ConversationCreate, db: Session = Depends(get_db)):
    """Start an outbound conversation with a subscriber or recipient."""
    conv_id = payload.id or f"conv-{payload.platform}-{int(time.time()*1000)}"
    part_id = payload.participant_id or f"p-{payload.platform}-{int(time.time()*1000)}"

    linked_name = payload.linked_subscriber_name
    if payload.linked_subscriber_id:
        member = db.query(Member).filter(Member.id == payload.linked_subscriber_id).first()
        if member:
            linked_name = member.name

    labels_json = json.dumps(payload.labels or ["New Contact"])

    new_conv = ConversationRecord(
        id=conv_id,
        platform=payload.platform,
        participant_id=part_id,
        participant_name=payload.participant_name,
        participant_handle=payload.participant_handle,
        last_message=payload.initial_message or "",
        updated_time="Just now",
        unread_count=0,
        status="open",
        automation_paused=False,
        assigned_to=payload.assigned_to or "Foreperson Admin",
        labels=labels_json,
        internal_notes="",
        window_expires_at=datetime.utcnow() + timedelta(hours=24),
        linked_subscriber_id=payload.linked_subscriber_id,
        linked_subscriber_name=linked_name,
        linked_scheme_name=payload.linked_scheme_name or "Subscriber Direct",
    )

    db.add(new_conv)
    db.commit()
    db.refresh(new_conv)

    if payload.initial_message:
        msg_id = f"m-{int(time.time()*1000)}"
        msg = MessageRecord(
            id=msg_id,
            conversation_id=conv_id,
            account_id=f"ch-{payload.platform}",
            platform=payload.platform,
            message=payload.initial_message,
            direction="outgoing",
            sender_name="Foreperson Admin",
            delivery_status="delivered",
        )
        db.add(msg)
        db.commit()

    return _conv_to_response(new_conv)


@router.patch("/conversations/{conversation_id}", response_model=ConversationResponse)
def patch_conversation(
    conversation_id: str,
    payload: ConversationPatchRequest,
    db: Session = Depends(get_db)
):
    """
    BrightBean Chat Shared Inbox Controller:
      - Toggle Human Takeover (`automation_paused`) to pause automated bot replies
      - Update thread resolution state (`open` | `done`)
      - Assign operator (`assigned_to`)
      - Manage tags/labels
      - Record internal staff memo (`internal_notes`)
    """
    conv = db.query(ConversationRecord).filter(ConversationRecord.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if payload.status is not None:
        conv.status = payload.status
    if payload.automation_paused is not None:
        conv.automation_paused = payload.automation_paused
    if payload.assigned_to is not None:
        conv.assigned_to = payload.assigned_to
    if payload.labels is not None:
        conv.labels = json.dumps(payload.labels)
    if payload.internal_notes is not None:
        conv.internal_notes = payload.internal_notes

    conv.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(conv)

    return _conv_to_response(conv)


@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
def get_conversation_messages(conversation_id: str, db: Session = Depends(get_db)):
    """Fetch all real messages for a given conversation thread."""
    conv = db.query(ConversationRecord).filter(ConversationRecord.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = (
        db.query(MessageRecord)
        .filter(MessageRecord.conversation_id == conversation_id)
        .order_by(MessageRecord.created_at.asc())
        .all()
    )
    return [_msg_to_response(m) for m in messages]


@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def send_message(conversation_id: str, payload: MessageCreate, db: Session = Depends(get_db)):
    """
    Send a message to a conversation thread.
    If the message is inbound and automation is active, checks BrightBean keyword triggers for auto-replies.
    """
    conv = db.query(ConversationRecord).filter(ConversationRecord.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    msg_id = f"m-{int(time.time()*1000)}"
    new_msg = MessageRecord(
        id=msg_id,
        conversation_id=conversation_id,
        account_id=f"ch-{conv.platform}",
        platform=conv.platform,
        message=payload.message,
        direction=payload.direction or "outgoing",
        sender_name=payload.sender_name or "Foreperson Admin",
        delivery_status=payload.delivery_status or "delivered",
    )

    db.add(new_msg)

    # Refresh 24-hr messaging window upon inbound customer activity
    if payload.direction == "incoming":
        conv.window_expires_at = datetime.utcnow() + timedelta(hours=24)
        conv.unread_count = (conv.unread_count or 0) + 1

    conv.last_message = payload.message
    conv.updated_time = "Just now"
    conv.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(new_msg)

    # Automated Bot Trigger Execution (if Human Takeover is OFF and message is inbound)
    if payload.direction == "incoming" and not conv.automation_paused:
        upper_text = payload.message.upper().strip()

        # Check BrightBean Keyword Rules
        bot_reply = None
        if "PAY" in upper_text or "DUE" in upper_text:
            due = conv.due_amount or 4250
            bot_reply = f"Hello {conv.participant_name}! Your pending installment for {conv.linked_scheme_name or 'Chit Group'} is ₹{due:,}. Pay instantly via YouPI UPI: http://localhost:3000/pay?id={conv.participant_id}"
        elif "AUCTION" in upper_text:
            bot_reply = "Monthly Auction Alert: Next auction for your Chit group is scheduled on the 25th at 5:00 PM IST. Max dividend limit: 25%."
        elif "DIVIDEND" in upper_text:
            bot_reply = "Your latest monthly chit auction dividend discount of ₹750 has been credited to your installment ledger!"
        elif "AGENT" in upper_text or "HELP" in upper_text or "HUMAN" in upper_text:
            conv.automation_paused = True
            conv.assigned_to = "Foreperson Admin"
            labels = json.loads(conv.labels) if conv.labels else []
            if "Needs a person" not in labels:
                labels.append("Needs a person")
                conv.labels = json.dumps(labels)
            db.commit()
            bot_reply = "Of course! Putting you through to a human representative now. An administrator has been notified."

        if bot_reply:
            reply_id = f"m-{int(time.time()*1000)+1}"
            reply_msg = MessageRecord(
                id=reply_id,
                conversation_id=conversation_id,
                account_id=f"ch-{conv.platform}",
                platform=conv.platform,
                message=bot_reply,
                direction="outgoing",
                sender_name="ChitStream Automation Bot",
                delivery_status="delivered",
            )
            db.add(reply_msg)
            conv.last_message = bot_reply
            conv.updated_at = datetime.utcnow()
            db.commit()

    return _msg_to_response(new_msg)


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(conversation_id: str, db: Session = Depends(get_db)):
    """Delete a conversation and all its messages."""
    conv = db.query(ConversationRecord).filter(ConversationRecord.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    db.delete(conv)
    db.commit()
    return None


# ==============================================================================
# BRIGHTBEAN VISUAL FLOWS API
# ==============================================================================

DEFAULT_FLOWS = [
    {
        "id": "flow-welcome",
        "name": "Chit Welcome & Plan Discovery",
        "description": "Onboard subscribers on first contact, explain chit mechanics, and capture plan interest.",
        "trigger_type": "welcome",
        "trigger_keyword": "/start, HI, HELLO",
        "status": "active",
        "executions_count": 142,
        "nodes_json": json.dumps([
            {"id": "n1", "type": "trigger", "label": "First Inbound Message (/start)", "x": 50, "y": 80},
            {"id": "n2", "type": "send_message", "label": "Welcome to Apex Chits! Digital chit fund ledgers & 0% fee UPI.", "x": 300, "y": 80},
            {"id": "n3", "type": "quick_reply", "label": "Options: [Check Dues] [Upcoming Auctions] [Speak to Agent]", "x": 580, "y": 80},
            {"id": "n4", "type": "condition", "label": "Branch on Subscriber Selection", "x": 860, "y": 80},
        ]),
        "edges_json": json.dumps([
            {"source": "n1", "target": "n2"},
            {"source": "n2", "target": "n3"},
            {"source": "n3", "target": "n4"},
        ]),
    },
    {
        "id": "flow-dues",
        "name": "Automated Dues Recovery & YouPI Pay",
        "description": "Triggered on keyword 'PAY' or 'DUE'. Computes net installment after auction dividend offset.",
        "trigger_type": "keyword",
        "trigger_keyword": "PAY, DUE, INSTALLMENT",
        "status": "active",
        "executions_count": 319,
        "nodes_json": json.dumps([
            {"id": "d1", "type": "trigger", "label": "Keyword: PAY or DUE", "x": 50, "y": 80},
            {"id": "d2", "type": "action", "label": "Lookup Subscriber Ledger & Dividend Offset", "x": 300, "y": 80},
            {"id": "d3", "type": "send_message", "label": "Dispatch Dynamic YouPI Sovereign UPI Payment Link", "x": 580, "y": 80},
            {"id": "d4", "type": "action", "label": "Tag: Payment Pending", "x": 860, "y": 80},
        ]),
        "edges_json": json.dumps([
            {"source": "d1", "target": "d2"},
            {"source": "d2", "target": "d3"},
            {"source": "d3", "target": "d4"},
        ]),
    },
    {
        "id": "flow-auction",
        "name": "Auction Dividend & Winner Announcement",
        "description": "Notifies subscribers of lowest discount bid, dividend distributed, and next installment amount.",
        "trigger_type": "keyword",
        "trigger_keyword": "AUCTION, DIVIDEND",
        "status": "active",
        "executions_count": 88,
        "nodes_json": json.dumps([
            {"id": "a1", "type": "trigger", "label": "Auction Finalized Event", "x": 50, "y": 80},
            {"id": "a2", "type": "send_message", "label": "Monthly Auction Dividend Offset: ₹750 credited per ticket", "x": 320, "y": 80},
            {"id": "a3", "type": "delay", "label": "Wait 2 Hours", "x": 600, "y": 80},
            {"id": "a4", "type": "send_message", "label": "Prompt next monthly installment due", "x": 850, "y": 80},
        ]),
        "edges_json": json.dumps([
            {"source": "a1", "target": "a2"},
            {"source": "a2", "target": "a3"},
            {"source": "a3", "target": "a4"},
        ]),
    },
    {
        "id": "flow-handoff",
        "name": "Human Representative Handoff",
        "description": "Triggered when subscriber asks for agent. Pauses bot automation and alerts foreperson.",
        "trigger_type": "keyword",
        "trigger_keyword": "HELP, AGENT, HUMAN",
        "status": "active",
        "executions_count": 45,
        "nodes_json": json.dumps([
            {"id": "h1", "type": "trigger", "label": "Keyword: AGENT or HELP", "x": 50, "y": 80},
            {"id": "h2", "type": "action", "label": "Activate Human Takeover (automation_paused = true)", "x": 300, "y": 80},
            {"id": "h3", "type": "action", "label": "Add Tag: Needs a person", "x": 580, "y": 80},
            {"id": "h4", "type": "send_message", "label": "Putting you through to a person now. Foreperson notified.", "x": 860, "y": 80},
        ]),
        "edges_json": json.dumps([
            {"source": "h1", "target": "h2"},
            {"source": "h2", "target": "h3"},
            {"source": "h3", "target": "h4"},
        ]),
    },
]


@router.get("/flows", response_model=List[FlowResponse])
def get_flows(db: Session = Depends(get_db)):
    """Fetch all BrightBean visual flow automation graphs."""
    db_flows = db.query(FlowRecord).order_by(FlowRecord.created_at.desc()).all()
    if not db_flows:
        # Seed defaults
        for f in DEFAULT_FLOWS:
            row = FlowRecord(
                id=f["id"],
                name=f["name"],
                description=f["description"],
                trigger_type=f["trigger_type"],
                trigger_keyword=f["trigger_keyword"],
                status=f["status"],
                nodes_json=f["nodes_json"],
                edges_json=f["edges_json"],
                executions_count=f["executions_count"],
            )
            db.add(row)
        db.commit()
        db_flows = db.query(FlowRecord).order_by(FlowRecord.created_at.desc()).all()

    return [
        FlowResponse(
            id=f.id,
            name=f.name,
            description=f.description or "",
            trigger_type=f.trigger_type,
            trigger_keyword=f.trigger_keyword or "",
            status=f.status,
            nodes_json=f.nodes_json,
            edges_json=f.edges_json,
            executions_count=f.executions_count,
            created_at=f.created_at.isoformat(),
        )
        for f in db_flows
    ]


@router.post("/flows", response_model=FlowResponse, status_code=status.HTTP_201_CREATED)
def create_flow(payload: FlowCreate, db: Session = Depends(get_db)):
    """Create a new visual flow graph."""
    flow_id = payload.id or f"flow-{int(time.time()*1000)}"
    new_flow = FlowRecord(
        id=flow_id,
        name=payload.name,
        description=payload.description or "",
        trigger_type=payload.trigger_type,
        trigger_keyword=payload.trigger_keyword or "",
        status=payload.status,
        nodes_json=payload.nodes_json or "[]",
        edges_json=payload.edges_json or "[]",
        executions_count=0,
    )
    db.add(new_flow)
    db.commit()
    db.refresh(new_flow)

    return FlowResponse(
        id=new_flow.id,
        name=new_flow.name,
        description=new_flow.description or "",
        trigger_type=new_flow.trigger_type,
        trigger_keyword=new_flow.trigger_keyword or "",
        status=new_flow.status,
        nodes_json=new_flow.nodes_json,
        edges_json=new_flow.edges_json,
        executions_count=new_flow.executions_count,
        created_at=new_flow.created_at.isoformat(),
    )


# ==============================================================================
# BRIGHTBEAN KEYWORD TRIGGERS API
# ==============================================================================

DEFAULT_TRIGGERS = [
    {
        "id": "trig-pay",
        "keyword": "PAY",
        "match_type": "contains",
        "action": "reply",
        "reply_text": "Your current monthly installment is ready for payment. Tap here to pay via 0% fee YouPI UPI.",
        "label_to_add": "Payment Pending",
        "is_active": True,
    },
    {
        "id": "trig-due",
        "keyword": "DUE",
        "match_type": "contains",
        "action": "reply",
        "reply_text": "Your total net due after auction dividend offset is ₹4,250.",
        "label_to_add": "Chit Due",
        "is_active": True,
    },
    {
        "id": "trig-auction",
        "keyword": "AUCTION",
        "match_type": "contains",
        "action": "flow",
        "target_flow_id": "flow-auction",
        "label_to_add": "Auction Bidder",
        "is_active": True,
    },
    {
        "id": "trig-help",
        "keyword": "HELP",
        "match_type": "exact",
        "action": "takeover",
        "reply_text": "Connecting you with the foreperson officer. Human Takeover initiated.",
        "label_to_add": "Needs a person",
        "is_active": True,
    },
    {
        "id": "trig-dividend",
        "keyword": "DIVIDEND",
        "match_type": "contains",
        "action": "reply",
        "reply_text": "Latest chit dividend: ₹750 has been subtracted from your monthly due.",
        "is_active": True,
    },
]


@router.get("/triggers", response_model=List[TriggerResponse])
def get_triggers(db: Session = Depends(get_db)):
    """Fetch configured BrightBean keyword triggers."""
    db_trigs = db.query(TriggerRecord).order_by(TriggerRecord.created_at.desc()).all()
    if not db_trigs:
        for t in DEFAULT_TRIGGERS:
            row = TriggerRecord(
                id=t["id"],
                keyword=t["keyword"],
                match_type=t["match_type"],
                action=t["action"],
                reply_text=t.get("reply_text", ""),
                target_flow_id=t.get("target_flow_id"),
                label_to_add=t.get("label_to_add"),
                is_active=t["is_active"],
            )
            db.add(row)
        db.commit()
        db_trigs = db.query(TriggerRecord).order_by(TriggerRecord.created_at.desc()).all()

    return [
        TriggerResponse(
            id=t.id,
            keyword=t.keyword,
            match_type=t.match_type,
            action=t.action,
            reply_text=t.reply_text or "",
            target_flow_id=t.target_flow_id,
            label_to_add=t.label_to_add,
            is_active=t.is_active,
            created_at=t.created_at.isoformat(),
        )
        for t in db_trigs
    ]


@router.post("/triggers", response_model=TriggerResponse, status_code=status.HTTP_201_CREATED)
def create_trigger(payload: TriggerCreate, db: Session = Depends(get_db)):
    """Create a new keyword trigger rule."""
    trig_id = payload.id or f"trig-{int(time.time()*1000)}"
    new_trig = TriggerRecord(
        id=trig_id,
        keyword=payload.keyword.upper().strip(),
        match_type=payload.match_type,
        action=payload.action,
        reply_text=payload.reply_text or "",
        target_flow_id=payload.target_flow_id,
        label_to_add=payload.label_to_add,
        is_active=payload.is_active,
    )
    db.add(new_trig)
    db.commit()
    db.refresh(new_trig)

    return TriggerResponse(
        id=new_trig.id,
        keyword=new_trig.keyword,
        match_type=new_trig.match_type,
        action=new_trig.action,
        reply_text=new_trig.reply_text or "",
        target_flow_id=new_trig.target_flow_id,
        label_to_add=new_trig.label_to_add,
        is_active=new_trig.is_active,
        created_at=new_trig.created_at.isoformat(),
    )


# ==============================================================================
# BRIGHTBEAN MULTI-CHANNEL BROADCASTS API
# ==============================================================================

DEFAULT_BROADCASTS = [
    {
        "id": "bc-1",
        "title": "Monthly Auction Reminder - 25th November",
        "channel": "all",
        "target_segment": "active_subscribers",
        "message": "Dear Subscriber, the monthly chit auction will be held on Nov 25 at 5:00 PM IST. Max prize bid ceiling is 25%. Log in to your portal to bid live.",
        "status": "sent",
        "sent_count": 128,
        "delivered_count": 124,
    },
    {
        "id": "bc-2",
        "title": "Installment Due Reminder (Zero Late Fee)",
        "channel": "whatsapp",
        "target_segment": "payment_pending",
        "message": "Chit installment due reminder: Net payable is ₹4,250 after your ₹750 dividend credit. Pay before month end to maintain good ROSCA credit standing.",
        "status": "sent",
        "sent_count": 64,
        "delivered_count": 62,
    },
    {
        "id": "bc-3",
        "title": "Diwali Royal Chit Scheme Launch",
        "channel": "instagram",
        "target_segment": "prospective_members",
        "message": "Announcing Apex Royal 20-Month Chit Scheme! ₹5,00,000 pool value with 0% gateway commission and instant WhatsApp dividend alerts. Reply JOIN to register.",
        "status": "sent",
        "sent_count": 210,
        "delivered_count": 198,
    },
]


@router.get("/broadcasts", response_model=List[BroadcastResponse])
def get_broadcasts(db: Session = Depends(get_db)):
    """Fetch all campaign broadcasts."""
    db_bcs = db.query(BroadcastRecord).order_by(BroadcastRecord.created_at.desc()).all()
    if not db_bcs:
        for b in DEFAULT_BROADCASTS:
            row = BroadcastRecord(
                id=b["id"],
                title=b["title"],
                channel=b["channel"],
                target_segment=b["target_segment"],
                message=b["message"],
                status=b["status"],
                sent_count=b["sent_count"],
                delivered_count=b["delivered_count"],
            )
            db.add(row)
        db.commit()
        db_bcs = db.query(BroadcastRecord).order_by(BroadcastRecord.created_at.desc()).all()

    return [
        BroadcastResponse(
            id=b.id,
            title=b.title,
            channel=b.channel,
            target_segment=b.target_segment,
            message=b.message,
            status=b.status,
            sent_count=b.sent_count,
            delivered_count=b.delivered_count,
            created_at=b.created_at.isoformat(),
        )
        for b in db_bcs
    ]


@router.post("/broadcasts", response_model=BroadcastResponse, status_code=status.HTTP_201_CREATED)
def create_broadcast(payload: BroadcastCreate, db: Session = Depends(get_db)):
    """Dispatch a new multi-channel broadcast sequence."""
    bc_id = f"bc-{int(time.time()*1000)}"

    # Determine simulated delivery metrics based on audience
    target_count = 150
    if payload.target_segment == "payment_pending":
        target_count = 42
    elif payload.target_segment == "vip":
        target_count = 18

    new_bc = BroadcastRecord(
        id=bc_id,
        title=payload.title,
        channel=payload.channel,
        target_segment=payload.target_segment,
        message=payload.message,
        status="sent",
        sent_count=target_count,
        delivered_count=int(target_count * 0.96),
    )
    db.add(new_bc)
    db.commit()
    db.refresh(new_bc)

    return BroadcastResponse(
        id=new_bc.id,
        title=new_bc.title,
        channel=new_bc.channel,
        target_segment=new_bc.target_segment,
        message=new_bc.message,
        status=new_bc.status,
        sent_count=new_bc.sent_count,
        delivered_count=new_bc.delivered_count,
        created_at=new_bc.created_at.isoformat(),
    )
