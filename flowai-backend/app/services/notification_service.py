from sqlalchemy.orm import Session

from app.models.notification import Notification


class NotificationService:
	def create(self, db: Session, user_id: int, data: dict) -> Notification:
		notification = Notification(
			user_id=user_id,
			title=data["title"],
			body=data["body"],
			channel=data.get("channel", "in_app"),
			metadata_json=data.get("metadata"),
		)
		db.add(notification)
		db.commit()
		db.refresh(notification)
		return notification

	def list_for_user(self, db: Session, user_id: int) -> list[Notification]:
		return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()


notification_service = NotificationService()
