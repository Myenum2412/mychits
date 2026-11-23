from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base


class ConversationRecord(Base):
    """
    Carries threaded conversations across WhatsApp, Meta Graph API (IG & FB), and Telegram.
    Enhanced with BrightBean Chat shared inbox state:
      - status: 'open' | 'done'
      - automation_paused: Human takeover toggle (pauses automated bot replies)
      - assigned_to: Operator assignment
      - labels: JSON array of tags (e.g. ['Chit Due', 'Auction Bidder'])
      - internal_notes: Private staff memo
      - window_expires_at: 24-hour compliance messaging window expiry
    """
    __tablename__ = "conversations"

    id = Column(String(64), primary_key=True, index=True)
    platform = Column(String(32), nullable=False, default="whatsapp", index=True)
    participant_id = Column(String(128), nullable=False)
    participant_name = Column(String(128), nullable=False)
    participant_handle = Column(String(128), nullable=False)
    participant_avatar = Column(String(256), nullable=True)
    participant_verified = Column(Boolean, default=False)
    last_message = Column(Text, default="")
    updated_time = Column(String(64), default="")
    unread_count = Column(Integer, default=0)

    # BrightBean Shared Inbox Architecture
    status = Column(String(20), default="open", nullable=False)  # "open" | "done"
    automation_paused = Column(Boolean, default=False, nullable=False)  # Human takeover switch
    assigned_to = Column(String(100), default="Foreperson Admin", nullable=False)
    labels = Column(Text, default="[]", nullable=False)  # JSON array string
    internal_notes = Column(Text, default="", nullable=False)
    window_expires_at = Column(DateTime, nullable=True)  # 24-hr Meta/WhatsApp window

    # Chit fund subscriber association
    linked_subscriber_id = Column(Integer, ForeignKey("members.id", ondelete="SET NULL"), nullable=True)
    linked_subscriber_name = Column(String(128), nullable=True)
    linked_scheme_name = Column(String(128), nullable=True)
    linked_ticket_no = Column(Integer, nullable=True)
    due_amount = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship to messages
    messages = relationship(
        "MessageRecord",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="MessageRecord.created_at.asc()",
    )
    member = relationship("Member")


class MessageRecord(Base):
    __tablename__ = "messages"

    id = Column(String(64), primary_key=True, index=True)
    conversation_id = Column(String(64), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    account_id = Column(String(64), nullable=True)
    platform = Column(String(32), nullable=False)
    message = Column(Text, nullable=False)
    direction = Column(String(16), nullable=False, default="outgoing")  # "incoming" | "outgoing"
    sender_name = Column(String(128), nullable=False, default="Foreperson Admin")
    delivery_status = Column(String(20), nullable=False, default="delivered")  # "sent" | "delivered" | "read" | "failed"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    conversation = relationship("ConversationRecord", back_populates="messages")


class FlowRecord(Base):
    """
    BrightBean Chat Visual Flow Builder Graph & Execution State.
    Supports node-based automation for Chit marketing, dues recovery, auction alerts, and human handoff.
    """
    __tablename__ = "flows"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    description = Column(String(256), nullable=True)
    trigger_type = Column(String(32), default="keyword", nullable=False)  # "keyword" | "welcome" | "story_mention" | "default_reply"
    trigger_keyword = Column(String(64), default="", nullable=False)
    status = Column(String(20), default="active", nullable=False)  # "active" | "draft" | "offline"
    nodes_json = Column(Text, default="[]", nullable=False)
    edges_json = Column(Text, default="[]", nullable=False)
    executions_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class TriggerRecord(Base):
    """
    BrightBean Keyword Trigger & Automations Engine.
    Listens for keywords like 'DUE', 'PAY', 'AUCTION', 'DIVIDEND', 'HELP' across channels.
    """
    __tablename__ = "triggers"

    id = Column(String(64), primary_key=True, index=True)
    keyword = Column(String(64), nullable=False, index=True)
    match_type = Column(String(20), default="contains", nullable=False)  # "exact" | "contains" | "starts_with"
    action = Column(String(64), default="reply", nullable=False)  # "reply" | "flow" | "takeover" | "label"
    reply_text = Column(Text, default="", nullable=False)
    target_flow_id = Column(String(64), nullable=True)
    label_to_add = Column(String(64), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class BroadcastRecord(Base):
    """
    BrightBean Multi-Channel Broadcast & Sequence Campaign Engine.
    Dispatches targeted announcements with 24-hr compliance checks.
    """
    __tablename__ = "broadcasts"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(128), nullable=False)
    channel = Column(String(32), default="all", nullable=False)  # "all" | "whatsapp" | "instagram" | "facebook" | "telegram"
    target_segment = Column(String(64), default="all_subscribers", nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(20), default="sent", nullable=False)  # "draft" | "scheduled" | "sent" | "cancelled"
    sent_count = Column(Integer, default=0, nullable=False)
    delivered_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
