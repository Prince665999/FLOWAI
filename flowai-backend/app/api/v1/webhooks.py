from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.integrations.webhooks.verifier import webhook_verifier
from app.models.webhook_event import WebhookEvent
from app.models.workflow import Workflow
from app.models.workflow_run import WorkflowRun
from app.models.job import Job
from app.schemas.webhook import WebhookEventRead
from app.workflow_engine.executor import execute_workflow

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/{source}", response_model=WebhookEventRead, status_code=status.HTTP_201_CREATED)
async def handle_inbound_webhook(
    source: str,
    request: Request,
    x_signature: str | None = Header(default=None, alias="X-Signature"),
    db: Session = Depends(get_db),
) -> WebhookEvent:
    body_bytes = await request.body()
    try:
        payload_json = await request.json()
    except Exception:
        payload_json = {"raw": body_bytes.decode("utf-8", errors="ignore")}

    # Verify signature if secret configured
    secret = "flowai_webhook_secret_key"
    is_valid = webhook_verifier.verify_signature(body_bytes, x_signature or "", secret)
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid webhook signature")

    event_type = payload_json.get("event_type", f"{source}.event")
    event = WebhookEvent(
        source=source,
        event_type=event_type,
        payload=payload_json,
        status="received",
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    # Check for workflows triggered by this webhook
    workflows = db.query(Workflow).filter(Workflow.is_active.is_(True)).all()
    for wf in workflows:
        trigger_node = next((n for n in wf.definition.get("nodes", []) if n.get("type") == "trigger"), None)
        if trigger_node:
            trig_config = trigger_node.get("config", {})
            if trig_config.get("event") in (event_type, f"webhook_{source}", "webhook"):
                run = WorkflowRun(
                    workflow_id=wf.id,
                    user_id=wf.user_id,
                    input_data={"webhook_source": source, "event_type": event_type, "payload": payload_json},
                    status="queued",
                )
                db.add(run)
                db.commit()
                db.refresh(run)

                job = Job(
                    user_id=wf.user_id,
                    job_type="webhook_workflow",
                    idempotency_key=f"webhook-{event.id}-{wf.id}",
                    payload={"workflow_id": wf.id, "run_id": run.id},
                    status="running",
                )
                db.add(job)
                db.commit()

                try:
                    await execute_workflow(wf, run, db)
                    event.status = "processed"
                except Exception as exc:
                    event.status = "failed"
                    event.error = str(exc)

    event.processed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(event)
    return event


@router.get("/events", response_model=list[WebhookEventRead])
def list_webhook_events(
    source: str | None = None,
    db: Session = Depends(get_db),
) -> list[WebhookEvent]:
    query = db.query(WebhookEvent)
    if source:
        query = query.filter(WebhookEvent.source == source)
    return query.order_by(WebhookEvent.created_at.desc()).limit(100).all()
