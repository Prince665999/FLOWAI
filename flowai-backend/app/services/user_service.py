from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import UserCreate


class UserService:
    @staticmethod
    def create_user(db: Session, payload: UserCreate) -> User:
        user_exists = db.query(User).filter(User.email == payload.email).first()
        if user_exists:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists")

        user = User(
            email=payload.email,
            full_name=payload.full_name,
            hashed_password=hash_password(payload.password),
            role_name=payload.role_name,
            is_active=True,
            is_superuser=False,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
