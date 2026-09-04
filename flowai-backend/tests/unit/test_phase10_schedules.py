from datetime import datetime, timezone
import pytest

from app.models.schedule import Schedule
from app.models.workflow import Workflow
from app.workflow_engine.scheduler import compute_next_run, parse_simple_cron_interval, workflow_scheduler


def test_cron_interval_parser():
    assert parse_simple_cron_interval("*/10 * * * *").total_seconds() == 600
    assert parse_simple_cron_interval("0 8 * * *").total_seconds() == 86400
    next_time = compute_next_run("0 8 * * *", datetime(2026, 1, 1, 8, 0, tzinfo=timezone.utc))
    assert next_time > datetime(2026, 1, 1, 8, 0, tzinfo=timezone.utc)


@pytest.mark.asyncio
async def test_scheduler_process_due_schedules(db_session):
    wf = Workflow(
        user_id=1,
        name="Scheduled Daily Report",
        definition={
            "nodes": [
                {"id": "t", "type": "trigger", "config": {"event": "schedule"}},
                {"id": "n", "type": "notification", "config": {"message": "Report generated"}},
            ],
            "edges": [{"source": "t", "target": "n"}],
        },
        status="published",
    )
    db_session.add(wf)
    db_session.commit()

    schedule = Schedule(
        user_id=1,
        workflow_id=wf.id,
        name="Morning Trigger",
        cron_expression="0 8 * * *",
        is_active=True,
        next_run_at=datetime.now(timezone.utc),
    )
    db_session.add(schedule)
    db_session.commit()

    results = await workflow_scheduler.process_due_schedules(db_session)
    assert len(results) == 1
    assert results[0]["status"] == "succeeded"

    db_session.refresh(schedule)
    assert schedule.last_status == "succeeded"
    assert schedule.next_run_at is not None
