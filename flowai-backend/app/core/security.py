from datetime import datetime, timedelta, timezone
import secrets

from fastapi import HTTPException, status
from jose import JWTError, jwt
import bcrypt
if not hasattr(bcrypt, "__about__"):
    class _About:
        __version__ = getattr(bcrypt, "__version__", "4.0.0")
    bcrypt.__about__ = _About()

from app.config import settings
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 7
VERIFY_EMAIL_EXPIRE_HOURS = 24
PASSWORD_RESET_EXPIRE_MINUTES = 30


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def generate_jti() -> str:
    """Unique identifier embedded in a signed token so it can be revoked server-side."""
    return secrets.token_urlsafe(32)


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode = {"sub": subject, "exp": expire}
    return jwt.encode(to_encode, settings.APP_NAME, algorithm=ALGORITHM)


def create_refresh_token(
    subject: str,
    jti: str | None = None,
    expires_delta: timedelta | None = None,
) -> str:
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    to_encode: dict = {"sub": subject, "type": "refresh", "exp": expire}
    if jti:
        to_encode["jti"] = jti
    return jwt.encode(to_encode, settings.APP_NAME, algorithm=ALGORITHM)


def create_temporary_token(
    subject: str,
    token_type: str,
    expires_delta: timedelta,
) -> str:
    """Short-lived single-purpose token used for email verification / password reset."""
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode = {"sub": subject, "type": token_type, "exp": expire}
    return jwt.encode(to_encode, settings.APP_NAME, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.APP_NAME, algorithms=[ALGORITHM])
        return payload
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from exc


def get_user_id_from_token(token: str) -> int:
    payload = decode_token(token)
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token missing user id")
    return int(user_id)
