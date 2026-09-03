from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, create_refresh_token, hash_password, verify_password
from app.models.user import User


class AuthService:
    @staticmethod
    def register_user(db: Session, email: str, full_name: str, password: str) -> User:
        user_exists = db.query(User).filter(User.email == email).first()
        if user_exists:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists")

        user = User(
            email=email,
            full_name=full_name,
            hashed_password=hash_password(password),
            is_active=True,
            is_superuser=False,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> User:
        user = db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User is inactive")
        return user

    @staticmethod
    def create_token_pair(user: User) -> dict:
        return {
            "access_token": create_access_token(str(user.id)),
            "refresh_token": create_refresh_token(str(user.id)),
            "token_type": "bearer",
        }

    @staticmethod
    def refresh_access_token(refresh_token: str) -> str:
        payload = None
        try:
            payload = __import__("app.core.security", fromlist=["decode_token"]).decode_token(refresh_token)
        except HTTPException:
            raise

        if payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing user id")

        return create_access_token(str(user_id))
