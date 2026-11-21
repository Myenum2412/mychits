from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base


class ChitGroup(Base):
    __tablename__ = "chit_groups"

    id = Column(Integer, primary_key=True, index=True)
    group_name = Column(String(100), unique=True, nullable=False, index=True)
    total_value = Column(Float, nullable=False)  # Total pot value (e.g., 100,000)
    duration_months = Column(Integer, nullable=False)  # e.g., 20 months
    monthly_installment = Column(Float, nullable=False)  # e.g., 5,000
    max_members = Column(Integer, nullable=False)  # e.g., 20
    commission_rate = Column(Float, default=5.0, nullable=False)  # Foreperson commission % (e.g. 5%)
    start_date = Column(Date, nullable=False)
    status = Column(String(20), default="planned", nullable=False)  # planned, active, completed
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    memberships = relationship("GroupMember", back_populates="group", cascade="all, delete-orphan")
    auctions = relationship("Auction", back_populates="group", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="group", cascade="all, delete-orphan")


class GroupMember(Base):
    __tablename__ = "group_members"

    id = Column(Integer, primary_key=True, index=True)
    chit_group_id = Column(Integer, ForeignKey("chit_groups.id", ondelete="CASCADE"), nullable=False)
    member_id = Column(Integer, ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    ticket_number = Column(Integer, nullable=False)  # Chit ticket # (1 to max_members)
    joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    has_prized = Column(Boolean, default=False, nullable=False)

    # Relationships
    group = relationship("ChitGroup", back_populates="memberships")
    member = relationship("Member", back_populates="group_memberships")
