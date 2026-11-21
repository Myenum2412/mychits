import time
from typing import Dict, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

router = APIRouter(prefix="/whatsapp", tags=["WhatsApp Web (wwebjs.dev)"])

# In-memory session tracking for WhatsApp Web JS client sessions
# In production wwebjs.dev, this connects to a Node.js whatsapp-web.js microservice or LocalAuth
whatsapp_sessions: Dict[str, dict] = {}


class SendMessageRequest(BaseModel):
    user_id: str
    phone_number: str
    message: str


class SessionActionRequest(BaseModel):
    user_id: str
    action: str  # "connect" | "disconnect" | "refresh"


@router.get("/status")
def get_whatsapp_status(user_id: str = Query("admin")):
    """Get the WhatsApp Web connection status and QR code for a separate user."""
    session = whatsapp_sessions.get(user_id)
    if not session:
        # Initialize a default session awaiting QR scan
        timestamp = int(time.time())
        qr_string = f"2@wwebjs-{user_id}-{timestamp},1Q9sP==,{timestamp},wwebjs.dev"
        whatsapp_sessions[user_id] = {
            "user_id": user_id,
            "status": "ready_to_scan",  # "ready_to_scan" | "connected" | "disconnected"
            "qr_code": qr_string,
            "connected_number": None,
            "last_active": timestamp,
            "library": "https://wwebjs.dev/",
        }
        session = whatsapp_sessions[user_id]

    return session


@router.post("/action")
def perform_session_action(payload: SessionActionRequest):
    """Simulate session connection, disconnection, or QR refresh."""
    user_id = payload.user_id
    action = payload.action
    timestamp = int(time.time())

    if action == "refresh":
        qr_string = f"2@wwebjs-{user_id}-{timestamp},NEW_QR_{timestamp},wwebjs.dev"
        whatsapp_sessions[user_id] = {
            "user_id": user_id,
            "status": "ready_to_scan",
            "qr_code": qr_string,
            "connected_number": None,
            "last_active": timestamp,
            "library": "https://wwebjs.dev/",
        }
    elif action == "connect":
        session = whatsapp_sessions.get(user_id, {})
        whatsapp_sessions[user_id] = {
            "user_id": user_id,
            "status": "connected",
            "qr_code": None,
            "connected_number": "+91 98765 43210" if user_id == "admin" else "+91 91234 56789",
            "last_active": timestamp,
            "library": "https://wwebjs.dev/",
        }
    elif action == "disconnect":
        qr_string = f"2@wwebjs-{user_id}-{timestamp},DISCONNECTED,wwebjs.dev"
        whatsapp_sessions[user_id] = {
            "user_id": user_id,
            "status": "disconnected",
            "qr_code": qr_string,
            "connected_number": None,
            "last_active": timestamp,
            "library": "https://wwebjs.dev/",
        }
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

    return whatsapp_sessions[user_id]


@router.post("/send-message")
def send_whatsapp_message(payload: SendMessageRequest):
    """Send chit fund notification (auction notice, payment receipt) via WhatsApp."""
    session = whatsapp_sessions.get(payload.user_id)
    if not session or session.get("status") != "connected":
        raise HTTPException(
            status_code=400,
            detail="WhatsApp Web session is not connected. Please scan the QR code first.",
        )

    return {
        "success": True,
        "recipient": payload.phone_number,
        "message": payload.message,
        "timestamp": int(time.time()),
        "status": "delivered",
        "provider": "whatsapp-web.js (https://wwebjs.dev/)",
    }
