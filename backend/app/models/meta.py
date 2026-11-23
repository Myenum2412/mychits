from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from app.core.database import Base


class MetaConnection(Base):
    """
    Stores Meta Graph API (v21.0) connection credentials for Facebook Pages & Instagram Business Accounts.
    Reference: https://developers.facebook.com/docs/graph-api/
    """
    __tablename__ = "meta_connections"

    id = Column(Integer, primary_key=True, index=True)
    app_id = Column(String(64), nullable=True)
    app_secret = Column(String(128), nullable=True)
    api_version = Column(String(16), default="v21.0", nullable=False)
    webhook_verify_token = Column(String(64), default="chitstream_meta_verify_token_2026", nullable=False)

    # User Token
    user_access_token = Column(Text, nullable=True)

    # Facebook Page Details
    facebook_page_id = Column(String(64), nullable=True)
    facebook_page_name = Column(String(128), nullable=True)
    facebook_page_access_token = Column(Text, nullable=True)
    is_facebook_connected = Column(Boolean, default=False)

    # Instagram Business Account Details (linked to Facebook Page)
    instagram_account_id = Column(String(64), nullable=True)
    instagram_username = Column(String(128), nullable=True)
    instagram_name = Column(String(128), nullable=True)
    instagram_profile_pic = Column(String(512), nullable=True)
    is_instagram_connected = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
