import asyncio
from datetime import datetime, timezone

from app.db.session import SessionLocal
from app.models.job import Job
from app.models.workflow import Workflow
from app.models.workflow_run import WorkflowRun
from app.queue.celery_app import celery_app
from app.workflow_engine.engine import workflow_engine


@celery_app.task(bind=True, max_retries=3, name="flowai.workflow.execute")
def execute_workflow_task(self, job_id: int, workflow_id: int, run_id: int) -> dict:
	db = SessionLocal()
	job = db.query(Job).filter(Job.id == job_id).first()
	try:
		workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
		run = db.query(WorkflowRun).filter(WorkflowRun.id == run_id).first()
		if not job or not workflow or not run:
			raise ValueError("Workflow job resources not found")
		job.status = "running"
		job.attempts += 1
		job.started_at = datetime.now(timezone.utc)
		db.commit()
		result = asyncio.run(workflow_engine.run(workflow, run, db))
		job.status = "succeeded" if result.status in {"succeeded", "awaiting_approval"} else "failed"
		job.result = {"workflow_run_id": result.id, "status": result.status}
		job.error = result.error
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
