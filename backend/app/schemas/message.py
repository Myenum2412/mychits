from typing import Optional
from pydantic import BaseModel


class MessageCreate(BaseModel):
    message: str
    direction: Optional[str] = "outgoing"
    sender_name: Optional[str] = "Foreperson Admin"
    delivery_status: Optional[str] = "delivered"


class MessageResponse(BaseModel):
    id: str
    conversationId: str
    accountId: Optional[str] = None
    platform: str
    message: str
    direction: str
    createdAt: str
    senderName: str
    deliveryStatus: Optional[str] = "delivered"


class ConversationCreate(BaseModel):
    id: Optional[str] = None
    platform: str = "whatsapp"
    participant_name: str
    participant_handle: str
    participant_id: Optional[str] = None
    linked_subscriber_id: Optional[int] = None
    linked_subscriber_name: Optional[str] = None
    linked_scheme_name: Optional[str] = None
    initial_message: Optional[str] = None


class ConversationResponse(BaseModel):
    id: str
    accountId: str
    platform: str
    participantId: str
    participantName: str
    participantHandle: str
    participantAvatar: Optional[str] = None
    participantVerified: bool = False
    lastMessage: str = ""
    updatedTime: str = ""
    unreadCount: int = 0
    linkedSubscriberId: Optional[int] = None
    linkedSubscriberName: Optional[str] = None
    linkedSchemeName: Optional[str] = None
    linkedTicketNo: Optional[int] = None
    dueAmount: int = 0
