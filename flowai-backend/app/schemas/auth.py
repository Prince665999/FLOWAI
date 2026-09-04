from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=1, max_length=255)
    # Public self-registration may only ever create customer or plain staff
    # accounts; manager/admin roles are never accepted here.
    account_type: Literal["customer", "staff"] = "customer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    # The refresh token being revoked. Access tokens expire on their own.
    refresh_token: str


class VerifyEmailRequest(BaseModel):
    token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


class UserRead(BaseModel):
    id: int
    email: str
    full_name: str
    account_type: str
    role_name: str
    is_active: bool
    is_superuser: bool
    email_verified_at: datetime | None = None
    customer_id: int | None = None

    model_config = {"from_attributes": True}
