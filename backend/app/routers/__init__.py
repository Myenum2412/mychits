from app.routers.auth import router as auth_router
from app.routers.members import router as members_router
from app.routers.chit_groups import router as chit_groups_router
from app.routers.auctions import router as auctions_router
from app.routers.payments import router as payments_router
from app.routers.dashboard import router as dashboard_router
from app.routers.whatsapp import router as whatsapp_router
from app.routers.messages import router as messages_router
from app.routers.youpi import router as youpi_router

__all__ = [
    "auth_router",
    "members_router",
    "chit_groups_router",
    "auctions_router",
    "payments_router",
    "dashboard_router",
    "whatsapp_router",
    "messages_router",
    "youpi_router",
]
