from fastapi import HTTPException, status

from app.models.user import User


def require_admin(user: User) -> None:
    role_name = str(getattr(user, "role_name", "")).lower()
    if not user.is_superuser and role_name != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")


def require_manager_or_admin(user: User) -> None:
    role_name = str(getattr(user, "role_name", "")).lower()
    if not user.is_superuser and role_name not in {"admin", "manager"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Manager or admin access required")


def require_employee_or_manager_or_admin(user: User) -> None:
    role_name = str(getattr(user, "role_name", "")).lower()
    if not user.is_superuser and role_name not in {"admin", "manager", "employee"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")


def require_staff(user: User) -> None:
    """Any internal staff account. Store customers are always rejected."""
    if user.is_superuser or getattr(user, "is_staff", False) or getattr(user, "account_type", "staff") == "staff":
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Staff access required")


def require_customer(user: User) -> None:
    """Store-customer account. Staff is rejected from customer-owned routes."""
    if user.is_superuser or getattr(user, "is_customer", False):
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customer access required")


def require_role(user: User, *allowed_roles: str) -> None:
    allowed = {str(r).lower() for r in allowed_roles}
    if not user.is_superuser and getattr(user, "role_name", "").lower() not in allowed:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
