from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base


class ConversationRecord(Base):
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
