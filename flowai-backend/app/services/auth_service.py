from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import (
    PASSWORD_RESET_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
    VERIFY_EMAIL_EXPIRE_HOURS,
    create_access_token,
    create_refresh_token,
    create_temporary_token,
    decode_token,
    generate_jti,
    hash_password,
    verify_password,
)
from app.models.customer import Customer
from app.models.token import Token
from app.models.user import User

PRIVILEGED_ROLES = {User.ROLE_MANAGER, User.ROLE_ADMIN}


class AuthService:
    @staticmethod
    def register_user(
        db: Session,
        email: str,
        full_name: str,
        password: str,
        account_type: str = User.ACCOUNT_CUSTOMER,
    ) -> User:
        if account_type not in User.ACCOUNT_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid account type",
            )

        user_exists = db.query(User).filter(User.email == email).first()
        if user_exists:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists")

        role_name = User.ROLE_CUSTOMER if account_type == User.ACCOUNT_CUSTOMER else User.ROLE_EMPLOYEE

        user = User(
            email=email,
            full_name=full_name,
            hashed_password=hash_password(password),
            account_type=account_type,
            role_name=role_name,
            is_active=True,
            is_superuser=False,
        )
        db.add(user)
        db.flush()

        # Auto-link a CRM Customer profile for storefront accounts. Staff-created
        # CRM contacts that pre-date this change are untouched (user_id stays NULL).
        if account_type == User.ACCOUNT_CUSTOMER:
            db.add(Customer(user_id=user.id, name=full_name, email=email))

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
    def create_token_pair(db: Session, user: User) -> dict:
        jti = generate_jti()
        expires_at = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        db.add(
            Token(
                user_id=user.id,
                jti=jti,
                token_type="refresh",
                expires_at=expires_at,
            )
        )
        db.commit()
        return {
            "access_token": create_access_token(str(user.id)),
            "refresh_token": create_refresh_token(str(user.id), jti=jti),
            "token_type": "bearer",
        }

    @staticmethod
    def _persisted_refresh_token(db: Session, refresh_token: str) -> Token:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        user_id = payload.get("sub")
        jti = payload.get("jti")
        if user_id is None or jti is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing id")

        token = db.query(Token).filter(Token.jti == jti).first()
        if token is None or token.revoked:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token is revoked")
        if token.user_id != int(user_id):
            db.delete(token)
            db.commit()
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token mismatch")
        if token.expires_at and token.expires_at.tzinfo is None:
            token.expires_at = token.expires_at.replace(tzinfo=timezone.utc)
        if token.expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")
        return token

    @staticmethod
    def refresh_access_token(db: Session, refresh_token: str) -> dict:
        AuthService._persisted_refresh_token(db, refresh_token)
        payload = decode_token(refresh_token)
        user_id = int(payload["sub"])
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.is_active:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User unavailable")

        # Rotate: revoke the old refresh token and issue a fresh pair.
        old = db.query(Token).filter(Token.jti == payload["jti"]).first()
        if old:
            old.revoked = True
            old.revoked_at = datetime.now(timezone.utc)
            db.commit()

        return AuthService.create_token_pair(db, user)

    @staticmethod
    def logout(db: Session, user: User, refresh_token: str) -> None:
        token = AuthService._persisted_refresh_token(db, refresh_token)
        token.revoked = True
        token.revoked_at = datetime.now(timezone.utc)
        db.commit()

    @staticmethod
    def request_email_verification(db: Session, user: User) -> str:
        # Returns the token directly in development; wire to the email provider
        # for outbound delivery in production (Phase 9).
        return create_temporary_token(
            str(user.id),
            "verify_email",
            timedelta(hours=VERIFY_EMAIL_EXPIRE_HOURS),
        )

    @staticmethod
    def verify_email(db: Session, token: str) -> User:
        payload = decode_token(token)
        if payload.get("type") != "verify_email":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid verification token")
        user_id = int(payload["sub"])
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        user.email_verified_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def request_password_reset(db: Session, email: str) -> str | None:
        user = db.query(User).filter(User.email == email).first()
        # Do not reveal whether the email exists; same response either way.
        if user is None:
            return None
        # Returned directly in development; send out of band in production.
        return create_temporary_token(
            str(user.id),
            "password_reset",
            timedelta(minutes=PASSWORD_RESET_EXPIRE_MINUTES),
        )

    @staticmethod
    def reset_password(db: Session, token: str, new_password: str) -> User:
        payload = decode_token(token)
        if payload.get("type") != "password_reset":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid reset token")
        user_id = int(payload["sub"])
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        user.hashed_password = hash_password(new_password)
        # Revoke all outstanding refresh tokens after a password change.
        for t in db.query(Token).filter(Token.user_id == user.id, Token.revoked.is_(False)):
            t.revoked = True
            t.revoked_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def build_user_read(db: Session, user: User) -> dict:
        customer_id = None
        if user.is_customer:
            customer = db.query(Customer).filter(Customer.user_id == user.id).first()
            customer_id = customer.id if customer else None
        return {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "account_type": user.account_type,
            "role_name": user.role_name,
            "is_active": user.is_active,
            "is_superuser": user.is_superuser,
            "email_verified_at": user.email_verified_at,
            "customer_id": customer_id,
        }
