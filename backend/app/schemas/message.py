from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field


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
    labels: Optional[List[str]] = []
    assigned_to: Optional[str] = "Foreperson Admin"


class ConversationPatchRequest(BaseModel):
    status: Optional[str] = None  # "open" | "done"
    automation_paused: Optional[bool] = None  # Human takeover toggle
    assigned_to: Optional[str] = None
    labels: Optional[List[str]] = None
    internal_notes: Optional[str] = None


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

    # BrightBean Shared Inbox Attributes
    status: str = "open"  # "open" | "done"
    automationPaused: bool = False  # Human takeover active
    assignedTo: str = "Foreperson Admin"
    labels: List[str] = []
    internalNotes: str = ""
    windowExpiresAt: Optional[str] = None
    isWindowActive: bool = True

    # Chit Fund Association
    linkedSubscriberId: Optional[int] = None
    linkedSubscriberName: Optional[str] = None
    linkedSchemeName: Optional[str] = None
    linkedTicketNo: Optional[int] = None
    dueAmount: int = 0


# BrightBean Visual Flow Builder Schemas
class FlowCreate(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = ""
    trigger_type: str = "keyword"
    trigger_keyword: Optional[str] = ""
    status: str = "active"
    nodes_json: Optional[str] = "[]"
    edges_json: Optional[str] = "[]"


class FlowResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = ""
    trigger_type: str = "keyword"
    trigger_keyword: str = ""
    status: str = "active"
    nodes_json: str = "[]"
    edges_json: str = "[]"
    executions_count: int = 0
    created_at: str


# BrightBean Keyword Trigger Schemas
class TriggerCreate(BaseModel):
    id: Optional[str] = None
    keyword: str
    match_type: str = "contains"
    action: str = "reply"
    reply_text: Optional[str] = ""
    target_flow_id: Optional[str] = None
    label_to_add: Optional[str] = None
    is_active: bool = True


class TriggerResponse(BaseModel):
    id: str
    keyword: str
    match_type: str = "contains"
    action: str = "reply"
    reply_text: str = ""
    target_flow_id: Optional[str] = None
    label_to_add: Optional[str] = None
    is_active: bool = True
    created_at: str


# BrightBean Multi-Channel Broadcast Schemas
class BroadcastCreate(BaseModel):
    id: Optional[str] = None
    title: str
    channel: str = "all"
    target_segment: str = "all_subscribers"
    message: str


class BroadcastResponse(BaseModel):
    id: str
    title: str
    channel: str
    target_segment: str
    message: str
    status: str
    sent_count: int
    delivered_count: int
    created_at: str
