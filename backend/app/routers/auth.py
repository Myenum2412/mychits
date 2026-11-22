import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse

logger = logging.getLogger("uvicorn")
router = APIRouter(prefix="/auth", tags=["Authentication & Users"])


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user strictly against the database.
    Email and hashed password must match the record stored in the database.
    """
    email_clean = credentials.email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. User not found in database.",
        )

    if not user.verify_password(credentials.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Password mismatch in database.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Please contact the administrator.",
        )

    token = f"session_{user.id}_{user.role}"
    return TokenResponse(
        user=user,
        token=token,
        message=f"Successfully authenticated as {user.role} ({user.name}) from database",
    )


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user and store credentials securely into the database.
    """
    email_clean = user_in.email.strip().lower()
    existing = db.query(User).filter(User.email == email_clean).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A user with email '{email_clean}' is already registered in the database.",
        )

    role_val = user_in.role.lower().strip()
    if role_val not in ["orgmenu", "chits"]:
        role_val = "orgmenu"

    new_user = User(
        name=user_in.name.strip(),
        email=email_clean,
        role=role_val,
        is_active=True,
    )
    new_user.set_password(user_in.password)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    logger.info(f"New user registered and stored in database: {new_user.email} (Role: {new_user.role})")
    return new_user


@router.get("/users", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db)):
    """List all user accounts currently stored in the database."""
    return db.query(User).order_by(User.id.asc()).all()


@router.get("/me", response_model=UserResponse)
def get_current_user(email: str, db: Session = Depends(get_db)):
    """Retrieve user details from the database by email."""
    email_clean = email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User '{email_clean}' not found in database.",
        )
    return user
