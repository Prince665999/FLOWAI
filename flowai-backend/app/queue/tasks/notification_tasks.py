from datetime import datetime, timezone

from app.db.session import SessionLocal
from app.models.job import Job
from app.models.notification import Notification
from app.queue.celery_app import celery_app


@celery_app.task(name="flowai.notification.deliver")
def deliver_notification_task(job_id: int, user_id: int, payload: dict) -> dict:
	db = SessionLocal()
	job = db.query(Job).filter(Job.id == job_id).first()
	try:
		if not job:
			raise ValueError("Notification job not found")
		job.status = "running"
		job.attempts += 1
		db.commit()
		notification = Notification(user_id=user_id, title=payload["title"], body=payload["body"], channel=payload.get("channel", "in_app"), metadata_json=payload.get("metadata"))
		db.add(notification)
		db.flush()
		job.status = "succeeded"
		job.result = {"notification_id": notification.id}
		job.completed_at = datetime.now(timezone.utc)
		db.commit()
		return job.result
	except Exception as exc:
		if job:
			job.status = "failed"
			job.error = str(exc)
			job.completed_at = datetime.now(timezone.utc)
			db.commit()
		raise
	finally:
		db.close()
