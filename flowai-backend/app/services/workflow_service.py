from datetime import datetime, timezone
from typing import Any
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.workflow import Workflow
from app.models.workflow_run import WorkflowRun
from app.models.workflow_step import WorkflowStep
from app.models.user import User
from app.services.audit_service import audit_service
from app.services.notification_service import notification_service
from app.workflow_engine.engine import workflow_engine
from app.workflow_engine.versioning import workflow_versioning


class WorkflowService:
    def list_workflows(self, db: Session, user: User) -> list[Workflow]:
        return (
            db.query(Workflow)
            .filter(Workflow.user_id == user.id)
            .order_by(Workflow.updated_at.desc())
            .all()
        )

    def get_workflow(self, db: Session, user: User, workflow_id: int) -> Workflow:
        wf = (
            db.query(Workflow)
            .filter(Workflow.id == workflow_id, Workflow.user_id == user.id)
            .first()
        )
        if not wf:
            raise HTTPException(status_code=404, detail="Workflow not found")
        return wf

    def create_workflow(
        self,
        db: Session,
        user: User,
        name: str,
        definition: dict[str, Any],
        description: str | None = None,
        status: str = "published",
    ) -> Workflow:
        workflow_engine.validate(definition)
        workflow = Workflow(
            user_id=user.id,
            name=name,
            description=description,
            definition=definition,
            status=status,
            version=1,
            version_history=[],
        )
        db.add(workflow)
        db.commit()
        db.refresh(workflow)

        audit_service.log_event(
            db=db,
            action="workflow.create",
            resource_type="workflow",
            resource_id=workflow.id,
            user_id=user.id,
            actor_type="user",
            details={"name": name, "version": 1, "status": status},
        )
        return workflow

    def update_workflow(
        self,
        db: Session,
        user: User,
        workflow_id: int,
        updates: dict[str, Any],
    ) -> Workflow:
        wf = self.get_workflow(db, user, workflow_id)
        if "definition" in updates and updates["definition"] is not None:
            workflow_engine.validate(updates["definition"])

        for k, v in updates.items():
            if v is not None:
                setattr(wf, k, v)

        db.commit()
        db.refresh(wf)

        audit_service.log_event(
            db=db,
            action="workflow.update",
            resource_type="workflow",
            resource_id=wf.id,
            user_id=user.id,
            actor_type="user",
            details={"updated_fields": list(updates.keys())},
        )
        return wf

    def delete_workflow(self, db: Session, user: User, workflow_id: int) -> None:
        wf = self.get_workflow(db, user, workflow_id)
        audit_service.log_event(
            db=db,
            action="workflow.delete",
            resource_type="workflow",
            resource_id=wf.id,
            user_id=user.id,
            actor_type="user",
            details={"deleted_workflow_name": wf.name},
        )
        db.delete(wf)
        db.commit()

    async def execute_and_log(
        self,
        db: Session,
        workflow: Workflow,
        run: WorkflowRun,
    ) -> WorkflowRun:
        try:
            executed_run = await workflow_engine.run(workflow, run, db)
            audit_service.log_event(
                db=db,
                action="workflow.run.complete",
                resource_type="workflow_run",
                resource_id=run.id,
                user_id=workflow.user_id,
                actor_type="system",
                details={"workflow_id": workflow.id, "status": executed_run.status},
            )
            if executed_run.status == "succeeded":
                notification_service.create(
                    db=db,
                    user_id=workflow.user_id,
                    data={
                        "title": f"Workflow Succeeded: {workflow.name}",
                        "body": f"Workflow run #{run.id} completed all steps successfully.",
                        "channel": "workflow",
                    },
                )
            elif executed_run.status == "awaiting_approval":
                notification_service.create(
                    db=db,
                    user_id=workflow.user_id,
                    data={
                        "title": f"Human Approval Needed: {workflow.name}",
                        "body": f"Workflow run #{run.id} is paused awaiting manager review.",
                        "channel": "approval",
                    },
                )
            return executed_run
        except Exception as exc:
            run.status = "failed"
            run.error = str(exc)
            run.completed_at = datetime.now(timezone.utc)
            db.commit()
            audit_service.log_event(
                db=db,
                action="workflow.run.failed",
                resource_type="workflow_run",
                resource_id=run.id,
                user_id=workflow.user_id,
                actor_type="system",
                details={"error": str(exc)},
            )
            return run


workflow_service = WorkflowService()
