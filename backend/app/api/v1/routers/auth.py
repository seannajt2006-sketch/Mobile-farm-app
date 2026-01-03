from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.db.session import get_session
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserRead
from app.services.security import hash_password, verify_password

router = APIRouter()


def _ensure_password_length(password: str) -> None:
    # bcrypt only supports up to 72 bytes; refuse longer inputs to avoid runtime errors
    if len(password) > 72:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password too long; max 72 characters.",
        )


@router.post("/signup", response_model=UserRead)
def signup(payload: UserCreate, session: Session = Depends(get_session)):
    _ensure_password_length(payload.password)
    existing = session.exec(select(User).where(User.email == payload.email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.post("/login", response_model=UserRead)
def login(payload: UserLogin, session: Session = Depends(get_session)):
    _ensure_password_length(payload.password)
    user = session.exec(select(User).where(User.email == payload.email)).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email or password",
        )
    return user
