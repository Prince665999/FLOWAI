from datetime import datetime, timedelta, timezone
from typing import Any
import re
from sqlalchemy.orm import Session

from app.models.job import Job
from app.models.schedule import Schedule
from app.models.workflow import Workflow
from app.models.workflow_run import WorkflowRun
from app.workflow_engine.executor import execute_workflow


def parse_simple_cron_interval(cron_expression: str) -> timedelta:
    """
    Standard or fallback cron parser:
    e.g. '0 8 * * *' -> daily (24 hours)
         '*/5 * * * *' -> every 5 minutes
         '0 * * * *' -> hourly
         '0 0 * * 1' -> weekly (7 days)
    """
    expr = cron_expression.strip()
    minute_match = re.match(r"^\*/(\d+)\s+", expr)
    if minute_match:
        minutes = int(minute_match.group(1))
        return timedelta(minutes=max(1, minutes))
    
    parts = expr.split()
    if len(parts) == 5:
        minute, hour, dom, month, dow = parts
        if dow != "*" and dow != "?":
            return timedelta(days=7)
        if dom != "*":
            return timedelta(days=30)
        if hour != "*":
            return timedelta(days=1)
        if minute != "*":
            return timedelta(hours=1)
    
    return timedelta(hours=24)


def compute_next_run(cron_expression: str, base_time: datetime | None = None) -> datetime:
    now = base_time or datetime.now(timezone.utc)
    interval = parse_simple_cron_interval(cron_expression)
    return now + interval


class WorkflowScheduler:
    async def process_due_schedules(self, db: Session) -> list[dict[str, Any]]:
        now = datetime.now(timezone.utc)
        due_schedules = (
            db.query(Schedule)
            .filter(
                Schedule.is_active.is_(True),
                (Schedule.next_run_at <= now) | (Schedule.next_run_at.is_(None)),
            )
            .all()
        )

        results = []
        for schedule in due_schedules:
            workflow = (
                db.query(Workflow)
                .filter(Workflow.id == schedule.workflow_id, Workflow.is_active.is_(True))
                .first()
            )
            if not workflow:
                schedule.last_status = "workflow_missing"
                schedule.next_run_at = compute_next_run(schedule.cron_expression, now)
                db.commit()
                continue

            run = WorkflowRun(
                workflow_id=workflow.id,
                user_id=schedule.user_id,
                input_data={"scheduled": True, "schedule_id": schedule.id, "schedule_name": schedule.name},
                status="queued",
            )
            db.add(run)
            db.commit()
            db.refresh(run)

            job = Job(
                user_id=schedule.user_id,
                job_type="scheduled_workflow",
                idempotency_key=f"schedule-{schedule.id}-{int(now.timestamp())}",
                payload={"workflow_id": workflow.id, "run_id": run.id, "schedule_id": schedule.id},
                status="running",
            )
            db.add(job)
            db.commit()

            try:
                executed_run = await execute_workflow(workflow, run, db)
                schedule.last_run_at = now
                schedule.next_run_at = compute_next_run(schedule.cron_expression, now)
                schedule.last_status = executed_run.status
                schedule.failure_count = 0 if executed_run.status == "succeeded" else schedule.failure_count + 1
                job.status = "succeeded" if executed_run.status in {"succeeded", "awaiting_approval"} else "failed"
                job.result = {"run_id": executed_run.id, "status": executed_run.status}
                job.completed_at = datetime.now(timezone.utc)
                results.append({"schedule_id": schedule.id, "run_id": executed_run.id, "status": executed_run.status})
            except Exception as exc:
                schedule.last_run_at = now
                schedule.next_run_at = compute_next_run(schedule.cron_expression, now)
                schedule.last_status = "failed"
                schedule.failure_count += 1
                job.status = "failed"
                job.error = str(exc)
                job.completed_at = datetime.now(timezone.utc)
                results.append({"schedule_id": schedule.id, "error": str(exc), "status": "failed"})

            db.commit()

        return results


workflow_scheduler = WorkflowScheduler()
