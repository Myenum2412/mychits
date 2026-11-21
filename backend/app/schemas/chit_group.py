from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.member import MemberResponse


class ChitGroupBase(BaseModel):
    group_name: str = Field(..., min_length=2, max_length=100)
    total_value: float = Field(..., gt=0, description="Total chit pot value, e.g. 100000")
    duration_months: int = Field(..., gt=0, description="Duration in months, e.g. 20")
    monthly_installment: float = Field(..., gt=0, description="Monthly installment, e.g. 5000")
    max_members: int = Field(..., gt=0, description="Total participants, e.g. 20")
    commission_rate: float = Field(default=5.0, ge=0, le=100, description="Organizer commission %")
    start_date: date
    status: str = Field(default="planned")


class ChitGroupCreate(ChitGroupBase):
    pass


class ChitGroupUpdate(BaseModel):
    group_name: Optional[str] = None
    total_value: Optional[float] = None
    duration_months: Optional[int] = None
    monthly_installment: Optional[float] = None
    max_members: Optional[int] = None
    commission_rate: Optional[float] = None
    start_date: Optional[date] = None
    status: Optional[str] = None


class GroupMemberCreate(BaseModel):
    member_id: int
    ticket_number: int = Field(..., gt=0)


class GroupMemberResponse(BaseModel):
    id: int
    chit_group_id: int
    member_id: int
    ticket_number: int
    has_prized: bool
    joined_at: datetime
    member: Optional[MemberResponse] = None

    model_config = ConfigDict(from_attributes=True)


class ChitGroupResponse(ChitGroupBase):
    id: int
    created_at: datetime
    updated_at: datetime
    memberships: List[GroupMemberResponse] = []

    model_config = ConfigDict(from_attributes=True)
