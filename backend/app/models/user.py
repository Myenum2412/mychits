import hashlib
import hmac
import secrets
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    role = Column(String(20), nullable=False, default="orgmenu")  # "orgmenu" (Admin) or "chits" (Common User)
    hashed_password = Column(String(255), nullable=False)
    salt = Column(String(64), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def set_password(self, plain_password: str):
        """Generate a random salt and compute PBKDF2-HMAC-SHA256 password hash."""
        self.salt = secrets.token_hex(16)
        key = hashlib.pbkdf2_hmac(
            hash_name="sha256",
            password=plain_password.encode("utf-8"),
            salt=self.salt.encode("utf-8"),
            iterations=100000,
        )
        self.hashed_password = key.hex()

    def verify_password(self, plain_password: str) -> bool:
        """Verify plain password against stored salt and hash using constant-time comparison."""
        if not self.hashed_password or not self.salt:
            return False
        test_key = hashlib.pbkdf2_hmac(
            hash_name="sha256",
            password=plain_password.encode("utf-8"),
            salt=self.salt.encode("utf-8"),
            iterations=100000,
        )
        return hmac.compare_digest(self.hashed_password, test_key.hex())
