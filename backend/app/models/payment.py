from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    chit_group_id = Column(Integer, ForeignKey("chit_groups.id", ondelete="CASCADE"), nullable=False)
    member_id = Column(Integer, ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    auction_id = Column(Integer, ForeignKey("auctions.id", ondelete="SET NULL"), nullable=True)
    installment_number = Column(Integer, nullable=False)  # 1 to duration_months
    amount_paid = Column(Float, nullable=False)
    payment_mode = Column(String(50), default="upi", nullable=False)  # cash, upi, bank_transfer, cheque
    transaction_ref = Column(String(100), nullable=True)
    payment_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(String(20), default="completed", nullable=False)  # completed, pending, refunded
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    group = relationship("ChitGroup", back_populates="payments")
    member = relationship("Member", back_populates="payments")
    auction = relationship("Auction", back_populates="payments")
