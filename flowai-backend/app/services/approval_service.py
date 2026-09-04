from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.approval import Approval
from app.models.workflow import Workflow
from app.models.workflow_run import WorkflowRun
from app.models.user import User
from app.workflow_engine.executor import resume_workflow


class ApprovalService:
    def get_approvals(
        self, db: Session, user: User, status: str | None = None
    ) -> list[Approval]:
        query = db.query(Approval).filter(Approval.user_id == user.id)
        if status:
            query = query.filter(Approval.status == status)
        return query.order_by(Approval.created_at.desc()).all()

    def get_approval_by_id(self, db: Session, user: User, approval_id: int) -> Approval:
        approval = (
            db.query(Approval)
            .filter(Approval.id == approval_id, Approval.user_id == user.id)
            .first()
        )
        if not approval:
            raise HTTPException(status_code=404, detail="Approval request not found")
        return approval

    async def process_approval_action(
        self,
        db: Session,
        user: User,
        approval_id: int,
        action: str,  # "approve", "reject", "edit"
        new_payload: dict[str, Any] | None = None,
        comment: str | None = None,
    ) -> Approval:
        approval = self.get_approval_by_id(db, user, approval_id)
        if approval.status != "pending":
            raise HTTPException(
                status_code=400,
                detail=f"Approval has already been processed with status '{approval.status}'",
            )

        approval.reviewer_id = user.id
        approval.review_comment = comment
        approval.reviewed_at = datetime.now(timezone.utc)

        if action == "approve":
            approval.status = "approved"
        elif action == "reject":
            approval.status = "rejected"
        elif action == "edit":
            approval.status = "edited"
            if new_payload:
                approval.payload = new_payload
        else:
            raise HTTPException(status_code=400, detail=f"Invalid approval action: {action}")

        db.commit()
        db.refresh(approval)

        # If linked to a workflow run, resume or fail the workflow run
        if approval.workflow_run_id:
            run = (
                db.query(WorkflowRun)
                .filter(WorkflowRun.id == approval.workflow_run_id)
                .first()
            )
            if run:
                workflow = (
                    db.query(Workflow)
                    .filter(Workflow.id == run.workflow_id)
                    .first()
                )
                if workflow:
                    if action in ("approve", "edit"):
                        approved_data = approval.payload or {}
                        approved_data["human_approval_decision"] = approval.status
                        approved_data["human_approval_comment"] = comment
                        await resume_workflow(
                            workflow=workflow,
                            run=run,
                            db=db,
                            approved_data=approved_data,
                        )
                    elif action == "reject":
                        run.status = "cancelled"
                        run.error = f"Workflow rejected by human reviewer: {comment or 'No comment'}"
                        run.completed_at = datetime.now(timezone.utc)
                        db.commit()

        return approval


approval_service = ApprovalService()
