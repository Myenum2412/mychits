from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class MetaConnectRequest(BaseModel):
    user_access_token: Optional[str] = Field(None, description="Meta Graph User Access Token or System User Token")
    app_id: Optional[str] = Field(None, description="Meta App ID from Meta App Dashboard")
    app_secret: Optional[str] = Field(None, description="Meta App Secret")
    page_id: Optional[str] = Field(None, description="Facebook Page ID (optional override)")
    page_name: Optional[str] = Field(None, description="Facebook Page Name (optional override)")
    page_access_token: Optional[str] = Field(None, description="Facebook Page Access Token (optional override)")
    instagram_account_id: Optional[str] = Field(None, description="Instagram Business Account ID (optional override)")
    instagram_username: Optional[str] = Field(None, description="Instagram Username (optional override)")


class MetaFacebookStatus(BaseModel):
    connected: bool = False
    page_id: Optional[str] = None
    page_name: Optional[str] = None
    category: Optional[str] = "Chit Fund & Financial Organization"


class MetaInstagramStatus(BaseModel):
    connected: bool = False
    account_id: Optional[str] = None
    username: Optional[str] = None
    name: Optional[str] = None
    profile_picture_url: Optional[str] = None


class MetaStatusResponse(BaseModel):
    connected: bool
    api_version: str = "v21.0"
    documentation_url: str = "https://developers.facebook.com/docs/graph-api/"
    facebook: MetaFacebookStatus
    instagram: MetaInstagramStatus
    app_id: Optional[str] = None
    webhook_url: str
    webhook_verify_token: str


class MetaSendMessageRequest(BaseModel):
    platform: str = Field(..., description="'facebook' or 'instagram'")
    recipient_id: str = Field(..., description="PSID for Facebook or IGSID for Instagram")
    message: str = Field(..., min_length=1, description="Message text content")
    conversation_id: Optional[str] = None


class MetaSendMessageResponse(BaseModel):
    success: bool
    platform: str
    message_id: str
    recipient_id: str
    status: str = "delivered"
    api_endpoint: str
    meta_response: Optional[Dict[str, Any]] = None


class MetaOAuthUrlResponse(BaseModel):
    oauth_url: str
    scopes: List[str]
    api_version: str
    docs_url: str = "https://developers.facebook.com/docs/graph-api/"
