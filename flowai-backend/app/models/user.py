from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    ACCOUNT_CUSTOMER = "customer"
    ACCOUNT_STAFF = "staff"
    ACCOUNT_TYPES = {ACCOUNT_CUSTOMER, ACCOUNT_STAFF}

    ROLE_CUSTOMER = "customer"
    ROLE_EMPLOYEE = "employee"
    ROLE_MANAGER = "manager"
    ROLE_ADMIN = "admin"
    ROLES = {ROLE_CUSTOMER, ROLE_EMPLOYEE, ROLE_MANAGER, ROLE_ADMIN}

    # Roles that may never be selected via public self-registration.
    PRIVILEGED_ROLES = {ROLE_MANAGER, ROLE_ADMIN}

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    # Distinguishes a store customer from internal staff.
    account_type: Mapped[str] = mapped_column(
        String(20), default=ACCOUNT_STAFF, index=True, nullable=False
    )
    # Granular internal role: customer / employee / manager / admin.
    role_name: Mapped[str] = mapped_column(String(50), default=ROLE_EMPLOYEE, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    email_verified_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    @property
    def is_staff(self) -> bool:
        return self.account_type == self.ACCOUNT_STAFF

    @property
    def is_customer(self) -> bool:
        return self.account_type == self.ACCOUNT_CUSTOMER
