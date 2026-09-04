from typing import Any
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


class AuditService:
    def log_event(
        self,
        db: Session,
        action: str,
        resource_type: str,
        user_id: int | None = None,
        actor_type: str = "user",
        resource_id: str | int | None = None,
        details: dict[str, Any] | None = None,
        ip_address: str | None = None,
    ) -> AuditLog:
        entry = AuditLog(
            user_id=user_id,
            actor_type=actor_type,
            action=action,
            resource_type=resource_type,
            resource_id=str(resource_id) if resource_id is not None else None,
            details=details or {},
            ip_address=ip_address,
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry


audit_service = AuditService()
