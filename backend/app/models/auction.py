from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Auction(Base):
    __tablename__ = "auctions"

    id = Column(Integer, primary_key=True, index=True)
    chit_group_id = Column(Integer, ForeignKey("chit_groups.id", ondelete="CASCADE"), nullable=False)
    auction_number = Column(Integer, nullable=False)  # Auction installment number (1, 2, ..., N)
    auction_date = Column(Date, nullable=False)
    bid_discount_amount = Column(Float, default=0.0, nullable=False)  # Discount bid by member
    foreperson_commission = Column(Float, default=0.0, nullable=False)  # Commission kept by organizer
    dividend_total = Column(Float, default=0.0, nullable=False)  # bid_discount - foreperson_commission
    dividend_per_member = Column(Float, default=0.0, nullable=False)  # dividend_total / max_members
    net_payable_amount = Column(Float, nullable=False)  # monthly_installment - dividend_per_member
    prize_amount = Column(Float, nullable=False)  # total_value - bid_discount_amount
    winner_member_id = Column(Integer, ForeignKey("members.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(20), default="scheduled", nullable=False)  # scheduled, completed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    group = relationship("ChitGroup", back_populates="auctions")
    winner = relationship("Member", back_populates="won_auctions")
    payments = relationship("Payment", back_populates="auction")
