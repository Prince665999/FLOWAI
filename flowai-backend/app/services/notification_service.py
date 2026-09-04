import asyncio
from typing import Any
from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.websockets.manager import connection_manager


class NotificationService:
    def create(self, db: Session, user_id: int, data: dict[str, Any]) -> Notification:
        notification = Notification(
            user_id=user_id,
            title=data["title"],
            body=data["body"],
            channel=data.get("channel", "in_app"),
            metadata_json=data.get("metadata"),
            is_read=False,
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)

        # Broadcast real-time notification to user via websocket if event loop is running
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.create_task(
                    connection_manager.broadcast_to_user(
                        user_id=user_id,
                        event_type="notification.created",
                        data={
                            "id": notification.id,
                            "title": notification.title,
                            "body": notification.body,
                            "channel": notification.channel,
                        },
                    )
                )
        except Exception:
            pass

        return notification

    def list_for_user(self, db: Session, user_id: int) -> list[Notification]:
        return (
            db.query(Notification)
            .filter(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .all()
        )

    def mark_as_read(self, db: Session, user_id: int, notification_id: int) -> Notification | None:
        notif = (
            db.query(Notification)
            .filter(Notification.id == notification_id, Notification.user_id == user_id)
            .first()
        )
        if notif:
            notif.is_read = True
            db.commit()
            db.refresh(notif)
        return notif


notification_service = NotificationService()
