import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.models.user import User
from app.routers import (
    auth_router,
    members_router,
    chit_groups_router,
    auctions_router,
    payments_router,
    dashboard_router,
    whatsapp_router,
    messages_router,
    youpi_router,
)

logger = logging.getLogger("uvicorn")


def seed_database_users():
    """Ensure initial users exist in the database with hashed credentials."""
    db = SessionLocal()
    try:
        # Check & create OrgMenu Admin user in the database
        orgmenu_email = "admin@orgmenu.com"
        existing_orgmenu = db.query(User).filter(User.email == orgmenu_email).first()
        if not existing_orgmenu:
            orgmenu_user = User(
                name="OrgMenu Admin",
                email=orgmenu_email,
                role="orgmenu",
                is_active=True,
            )
            orgmenu_user.set_password("admin")
            db.add(orgmenu_user)
            db.commit()
            logger.info(f"Created OrgMenu Admin user in database: {orgmenu_email} (password: admin)")

        # Check & create Chits Common User in the database
        chits_email = "user@chits.com"
        existing_chits = db.query(User).filter(User.email == chits_email).first()
        if not existing_chits:
            chits_user = User(
                name="Chits Member",
                email=chits_email,
                role="chits",
                is_active=True,
            )
            chits_user.set_password("user")
            db.add(chits_user)
            db.commit()
            logger.info(f"Created Chits Common user in database: {chits_email} (password: user)")
    except Exception as e:
        logger.error(f"Error seeding database users: {e}")
        db.rollback()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Automatically create tables in database on startup
    logger.info("Initializing Chit Fund Management System Database...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified/created successfully.")
        seed_database_users()
    except Exception as e:
        logger.warning(f"Database initialization warning: {e}")
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="Full-featured RESTful API for Chit Fund Management System with dual user roles (OrgMenu & Chits).",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(members_router, prefix=settings.API_V1_STR)
app.include_router(chit_groups_router, prefix=settings.API_V1_STR)
app.include_router(auctions_router, prefix=settings.API_V1_STR)
app.include_router(payments_router, prefix=settings.API_V1_STR)
app.include_router(whatsapp_router, prefix=settings.API_V1_STR)
app.include_router(messages_router, prefix=settings.API_V1_STR)
app.include_router(youpi_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Health"])
def root():
    return {
        "status": "online",
        "service": settings.APP_NAME,
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR,
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
