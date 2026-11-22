from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=120)
    role: str = Field(default="orgmenu", description="'orgmenu' (Admin) or 'chits' (Common User)")


class UserCreate(UserBase):
    password: str = Field(..., min_length=4, max_length=128)


class UserLogin(BaseModel):
    email: str = Field(..., min_length=3, max_length=120)
    password: str = Field(..., min_length=1)


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    user: UserResponse
    token: str
    message: str
