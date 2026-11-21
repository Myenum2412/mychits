from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    phone = Column(String(20), unique=True, nullable=False, index=True)
    email = Column(String(120), unique=True, nullable=True, index=True)
    address = Column(Text, nullable=True)
    id_proof = Column(String(50), nullable=True)  # PAN, Aadhaar, etc.
    status = Column(String(20), default="active", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    group_memberships = relationship("GroupMember", back_populates="member", cascade="all, delete-orphan")
    won_auctions = relationship("Auction", back_populates="winner")
    payments = relationship("Payment", back_populates="member")
