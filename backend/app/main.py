import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.routers import (
    members_router,
    chit_groups_router,
    auctions_router,
    payments_router,
    dashboard_router,
    whatsapp_router,
)

logger = logging.getLogger("uvicorn")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Automatically create tables in PostgreSQL on startup if available
    logger.info("Initializing Chit Fund Management System Database...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("PostgreSQL database tables verified/created successfully (no data seeded).")
    except Exception as e:
        logger.warning(
            f"Could not connect to PostgreSQL to create tables automatically ({e}). "
            "Please ensure your PostgreSQL server is running and DATABASE_URL in .env is correct."
        )
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="Full-featured RESTful API for Chit Fund Management System with PostgreSQL and FastAPI.",
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
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(members_router, prefix=settings.API_V1_STR)
app.include_router(chit_groups_router, prefix=settings.API_V1_STR)
app.include_router(auctions_router, prefix=settings.API_V1_STR)
app.include_router(payments_router, prefix=settings.API_V1_STR)
app.include_router(whatsapp_router, prefix=settings.API_V1_STR)


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
