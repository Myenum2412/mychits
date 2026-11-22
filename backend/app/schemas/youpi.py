from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class YouPISettingsResponse(BaseModel):
    id: int
    merchant_id: str
    merchant_name: str
    primary_vpa: str
    account_number: str
    ifsc_code: str
    bank_name: str
    mcc: str
    api_key: str
    webhook_secret: str
    min_amount: float
    max_amount: float
    is_active: bool

    class Config:
        from_attributes = True


class YouPISettingsUpdate(BaseModel):
    merchant_name: Optional[str] = None
    primary_vpa: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    bank_name: Optional[str] = None
    mcc: Optional[str] = None
    api_key: Optional[str] = None
    webhook_secret: Optional[str] = None
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None
    is_active: Optional[bool] = None


class YouPICreateSessionRequest(BaseModel):
    chit_group_id: Optional[int] = None
    member_id: Optional[int] = None
    installment_number: Optional[int] = 1
    amount: float
    customer_name: Optional[str] = "Subscriber"
    customer_phone: Optional[str] = None
    note: Optional[str] = None


class YouPICreateSessionResponse(BaseModel):
    session_id: str
    order_id: str
    amount: float
    currency: str
    merchant_vpa: str
    merchant_name: str
    upi_intent_uri: str
    gpay_uri: str
    phonepe_uri: str
    paytm_uri: str
    bhim_uri: str
    cred_uri: str
    qr_data: str
    expires_at: str
    status: str


class YouPISubmitUTRRequest(BaseModel):
    session_id: str
    utr: str  # 12 digits bank reference
    customer_vpa: Optional[str] = None
    notes: Optional[str] = None


class YouPITransactionResponse(BaseModel):
    id: str
    session_id: str
    order_id: str
    chit_group_id: Optional[int] = None
    member_id: Optional[int] = None
    amount: float
    currency: str
    merchant_vpa: str
    customer_vpa: Optional[str] = None
    utr: Optional[str] = None
    status: str
    payment_method: str
    observer_matched: bool
    observer_source: Optional[str] = None
    verified_at: Optional[datetime] = None
    admin_notes: Optional[str] = None
    created_at: datetime
    member_name: Optional[str] = None
    group_name: Optional[str] = None

    class Config:
        from_attributes = True


class YouPIVerifyRequest(BaseModel):
    action: str  # "verify" | "investigate" | "reject"
    admin_notes: Optional[str] = None


class ObserverStatus(BaseModel):
    name: str
    type: str  # "ANDROID" | "SMS" | "GMAIL"
    status: str  # "active" | "syncing" | "idle"
    details: str
    last_ping: str
    battery: Optional[str] = None
