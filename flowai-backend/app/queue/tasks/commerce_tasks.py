from app.queue.celery_app import celery_app
from app.db.session import SessionLocal
from app.models.order import Order
from app.models.workflow import Workflow
from app.models.workflow_run import WorkflowRun
from app.workflow_engine.engine import workflow_engine
from app.workflow_engine.templates.order_processing import WORKFLOW_TEMPLATE
import asyncio


def process_order_created_sync(db, order_id: int, user_id: int) -> dict:
    order = db.query(Order).filter_by(id=order_id).first()
    if order is None:
        return {"status": "missing"}
    workflow = db.query(Workflow).filter(Workflow.name == WORKFLOW_TEMPLATE["name"], Workflow.user_id == user_id).first()
    if workflow is None:
        workflow = Workflow(
            user_id=user_id,
            name=WORKFLOW_TEMPLATE["name"],
            description=WORKFLOW_TEMPLATE.get("description"),
            definition=WORKFLOW_TEMPLATE["definition"],
            is_active=True,
        )
        db.add(workflow)
        db.flush()
    run = WorkflowRun(workflow_id=workflow.id, user_id=user_id, status="queued", input_data={"order_id": order.id})
    db.add(run)
    db.commit()
    db.refresh(run)
    try:
        asyncio.run(workflow_engine.run(workflow, run, db))
    except RuntimeError:
        # Already inside an event loop (FastAPI); persist queued run for the worker.
        pass
    return {"workflow_run_id": run.id, "order_id": order.id}


@celery_app.task(name="flowai.commerce.order_created")
def process_order_created(order_id: int, user_id: int) -> dict:
    db = SessionLocal()
    try:
        return process_order_created_sync(db, order_id, user_id)
    finally:
        db.close()
