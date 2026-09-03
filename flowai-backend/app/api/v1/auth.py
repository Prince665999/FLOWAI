from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_user_id_from_token
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, RefreshTokenRequest, RegisterRequest, TokenPair
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenPair)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> dict:
    user = AuthService.register_user(db, payload.email, payload.full_name, payload.password)
    return AuthService.create_token_pair(user)


@router.post("/login", response_model=TokenPair)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> dict:
    user = AuthService.authenticate_user(db, payload.email, payload.password)
    return AuthService.create_token_pair(user)


@router.post("/refresh", response_model=dict)
def refresh(payload: RefreshTokenRequest) -> dict:
    user_id = get_user_id_from_token(payload.refresh_token)
    token = AuthService.refresh_access_token(payload.refresh_token)
    return {
        "access_token": token,
        "refresh_token": payload.refresh_token,
        "token_type": "bearer",
        "user_id": user_id,
    }


@router.get("/me")
def me(current_user: User = Depends(get_current_user)) -> dict:
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role_name": current_user.role_name,
    }
