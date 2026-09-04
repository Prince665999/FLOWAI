from celery import Celery

from app.config import settings


celery_app = Celery("flowai", broker=settings.REDIS_URL, backend=settings.REDIS_URL)
celery_app.conf.update(
	task_serializer="json",
	result_serializer="json",
	accept_content=["json"],
	task_track_started=True,
	task_always_eager=settings.CELERY_TASK_ALWAYS_EAGER,
	task_eager_propagates=True,
	broker_transport_options={"protocol": 2},
	result_backend_transport_options={"protocol": 2},
)

celery_app.autodiscover_tasks(["app.queue.tasks"])
