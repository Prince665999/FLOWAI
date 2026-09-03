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
