import asyncio
from app.db.session import SessionLocal
from app.queue.celery_app import celery_app
from app.workflow_engine.scheduler import workflow_scheduler


@celery_app.task(name="app.queue.tasks.scheduled_tasks.check_due_schedules_task")
def check_due_schedules_task() -> dict:
    db = SessionLocal()
    try:
        results = asyncio.run(workflow_scheduler.process_due_schedules(db))
        return {"processed": len(results), "results": results}
    finally:
        db.close()
