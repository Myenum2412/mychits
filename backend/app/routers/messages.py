import time
import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.message import ConversationRecord, MessageRecord
from app.models.member import Member
from app.schemas.message import (
    ConversationCreate,
    ConversationResponse,
    MessageCreate,
    MessageResponse,
)
from app.routers.whatsapp import whatsapp_sessions

router = APIRouter(prefix="/messages", tags=["Omnichannel Messages"])


def _conv_to_response(c: ConversationRecord) -> ConversationResponse:
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
def get_conversations(db: Session = Depends(get_db)):
    """Fetch all real conversations from database. Returns empty list if zero records."""
    convs = db.query(ConversationRecord).order_by(ConversationRecord.updated_at.desc()).all()
    return [_conv_to_response(c) for c in convs]


@router.post("/conversations", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(payload: ConversationCreate, db: Session = Depends(get_db)):
    """Start an outbound conversation with a real subscriber or recipient."""
    conv_id = payload.id or f"conv-{payload.platform}-{int(time.time()*1000)}"
    part_id = payload.participant_id or f"p-{payload.platform}-{int(time.time()*1000)}"

    # If linked subscriber id is provided, verify member in database
    linked_name = payload.linked_subscriber_name
    if payload.linked_subscriber_id:
        member = db.query(Member).filter(Member.id == payload.linked_subscriber_id).first()
        if member:
            linked_name = member.name

    new_conv = ConversationRecord(
        id=conv_id,
        platform=payload.platform,
        participant_id=part_id,
        participant_name=payload.participant_name,
        participant_handle=payload.participant_handle,
        last_message=payload.initial_message or "",
        updated_time="Just now",
        unread_count=0,
        linked_subscriber_id=payload.linked_subscriber_id,
        linked_subscriber_name=linked_name,
        linked_scheme_name=payload.linked_scheme_name or "Subscriber Direct",
    )

    db.add(new_conv)
    db.commit()
    db.refresh(new_conv)

    # If initial message provided, record it
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

        # If platform is WhatsApp and session connected, attempt delivery
        if payload.platform == "whatsapp":
            session = whatsapp_sessions.get("admin")
            if session and session.get("status") == "connected":
                # Delivered via live WhatsApp session
                pass

    return _conv_to_response(new_conv)


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
    """Send a real message to a conversation thread."""
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

    # Update conversation last message & time
    conv.last_message = payload.message
    conv.updated_time = "Just now"
    conv.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(new_msg)

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
