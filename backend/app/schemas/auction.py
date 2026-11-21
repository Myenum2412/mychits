from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.member import MemberResponse


class AuctionBase(BaseModel):
    chit_group_id: int
    auction_number: int = Field(..., gt=0)
    auction_date: date
    bid_discount_amount: float = Field(default=0.0, ge=0.0)
    winner_member_id: Optional[int] = None
    status: str = Field(default="completed")


class AuctionCreate(AuctionBase):
    pass


class AuctionUpdate(BaseModel):
    bid_discount_amount: Optional[float] = None
    winner_member_id: Optional[int] = None
    status: Optional[str] = None
    auction_date: Optional[date] = None


class AuctionResponse(AuctionBase):
    id: int
    foreperson_commission: float
    dividend_total: float
    dividend_per_member: float
    net_payable_amount: float
    prize_amount: float
    created_at: datetime
    winner: Optional[MemberResponse] = None

    model_config = ConfigDict(from_attributes=True)
