from collections.abc import Iterable

from fastapi import HTTPException, status

from app.models.user import User


class RBAC:
    ADMIN = "admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"
    AI_AGENT = "ai_agent"

    @staticmethod
    def require_roles(user: User, allowed_roles: Iterable[str]) -> None:
        if user.is_superuser:
            return

        allowed = {str(role).lower() for role in allowed_roles}
        if not allowed:
            return

        if user.role_name.lower() not in allowed:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")


# Backward-compatible helper for simple checks.
def has_permission(user: User, required_role: str) -> bool:
    if user.is_superuser:
        return True
    return getattr(user, "role_name", None,).lower() == str(required_role).lower()
