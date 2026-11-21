from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.member import MemberResponse


class PaymentBase(BaseModel):
    chit_group_id: int
    member_id: int
    auction_id: Optional[int] = None
    installment_number: int = Field(..., gt=0)
    amount_paid: float = Field(..., gt=0.0)
    payment_mode: str = Field(default="upi")  # upi, cash, bank_transfer, cheque
    transaction_ref: Optional[str] = None
    status: str = Field(default="completed")
    remarks: Optional[str] = None


class PaymentCreate(PaymentBase):
    payment_date: Optional[datetime] = None


class PaymentUpdate(BaseModel):
    amount_paid: Optional[float] = None
    payment_mode: Optional[str] = None
    transaction_ref: Optional[str] = None
    status: Optional[str] = None
    remarks: Optional[str] = None


class PaymentResponse(PaymentBase):
    id: int
    payment_date: datetime
    created_at: datetime
    member: Optional[MemberResponse] = None

    model_config = ConfigDict(from_attributes=True)
