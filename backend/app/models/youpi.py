from datetime import datetime
import uuid
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base


class YouPISettings(Base):
    __tablename__ = "youpi_settings"

    id = Column(Integer, primary_key=True, index=True)
    merchant_id = Column(String(64), nullable=False, default=lambda: str(uuid.uuid4()))
    merchant_name = Column(String(128), nullable=False, default="Apex Chits & Finance Ltd")
    primary_vpa = Column(String(128), nullable=False, default="apexchits@okaxis")
    account_number = Column(String(64), nullable=False, default="918273645019")
    ifsc_code = Column(String(32), nullable=False, default="UTIB0000123")
    bank_name = Column(String(128), nullable=False, default="Axis Bank Ltd (Current Account)")
    mcc = Column(String(16), nullable=False, default="6012")  # Financial Institutions / ROSCA
    api_key = Column(String(128), nullable=False, default="youpi_live_sec_78941029384756")
    webhook_secret = Column(String(128), nullable=False, default="whsec_youpi_prod_9918273645")
    min_amount = Column(Float, default=1.0)
    max_amount = Column(Float, default=200000.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class YouPITransaction(Base):
    __tablename__ = "youpi_transactions"

    id = Column(String(64), primary_key=True, index=True, default=lambda: f"youpi_txn_{uuid.uuid4().hex[:12]}")
    session_id = Column(String(64), unique=True, index=True, nullable=False)
    order_id = Column(String(64), nullable=False, index=True)
    chit_group_id = Column(Integer, ForeignKey("chit_groups.id", ondelete="SET NULL"), nullable=True)
    member_id = Column(Integer, ForeignKey("members.id", ondelete="SET NULL"), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    merchant_vpa = Column(String(128), nullable=False, default="apexchits@okaxis")
    customer_vpa = Column(String(128), nullable=True)
    utr = Column(String(64), nullable=True, index=True)
    status = Column(
        String(32),
        default="pending",
        nullable=False,
        index=True,
    )  # pending | manual_review | verified | under_investigation | rejected
    payment_method = Column(String(32), default="MANUAL_UPI", nullable=False)  # MANUAL_UPI | UPI_INTENT | DYNAMIC_QR
    observer_matched = Column(Boolean, default=False)
    observer_source = Column(String(32), nullable=True)  # SMS_OBSERVER | GMAIL_OBSERVER | ANDROID_OBSERVER
    verified_at = Column(DateTime, nullable=True)
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    group = relationship("ChitGroup")
    member = relationship("Member")
