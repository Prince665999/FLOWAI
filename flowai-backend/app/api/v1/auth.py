from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    LogoutRequest,
    RefreshTokenRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenPair,
    UserRead,
    VerifyEmailRequest,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenPair, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> dict:
    user = AuthService.register_user(
        db,
        payload.email,
        payload.full_name,
        payload.password,
        account_type=payload.account_type,
    )
    return AuthService.create_token_pair(db, user)


@router.post("/login", response_model=TokenPair)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> dict:
    user = AuthService.authenticate_user(db, payload.email, payload.password)
    return AuthService.create_token_pair(db, user)


@router.post("/refresh", response_model=TokenPair)
def refresh(payload: RefreshTokenRequest, db: Session = Depends(get_db)) -> dict:
    return AuthService.refresh_access_token(db, payload.refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    payload: LogoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    AuthService.logout(db, current_user, payload.refresh_token)


@router.get("/me", response_model=UserRead)
def me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    return AuthService.build_user_read(db, current_user)


@router.post("/verify-email/request", response_model=dict)
def request_email_verification(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    token = AuthService.request_email_verification(db, current_user)
    return {"detail": "Verification email prepared", "token": token}


@router.post("/verify-email/confirm", response_model=UserRead)
def confirm_email_verification(
    payload: VerifyEmailRequest,
    db: Session = Depends(get_db),
) -> dict:
    user = AuthService.verify_email(db, payload.token)
    return AuthService.build_user_read(db, user)


@router.post("/password-reset/request", response_model=dict)
def request_password_reset(payload: ForgotPasswordRequest, db: Session = Depends(get_db)) -> dict:
    reset_token = AuthService.request_password_reset(db, payload.email)
    if reset_token is None:
        return {"detail": "If that email exists, a reset link has been prepared"}
    return {"detail": "If that email exists, a reset link has been prepared", "token": reset_token}


@router.post("/password-reset/confirm", response_model=UserRead)
def confirm_password_reset(payload: ResetPasswordRequest, db: Session = Depends(get_db)) -> dict:
    user = AuthService.reset_password(db, payload.token, payload.new_password)
    return AuthService.build_user_read(db, user)
