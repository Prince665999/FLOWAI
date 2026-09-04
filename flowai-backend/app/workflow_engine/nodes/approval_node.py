from typing import Any
from app.models.approval import Approval
from app.workflow_engine.nodes.base import NodeResult, WorkflowNodeHandler


class ApprovalNode(WorkflowNodeHandler):
    async def execute(self, config: dict[str, Any], data: dict[str, Any], context: Any) -> NodeResult:
        message = config.get("message", "Human approval required to proceed")
        action_type = config.get("action_type", "workflow_action")
        title = config.get("title", f"Approval Request: {action_type}")

        # If context has db and run_id, create or find an approval record
        if hasattr(context, "db") and context.db and hasattr(context, "run_id"):
            db = context.db
            approval = Approval(
                user_id=getattr(context, "user_id", 1),
                workflow_run_id=context.run_id,
                title=title,
                description=message,
                action_type=action_type,
                payload=data,
                status="pending",
            )
            db.add(approval)
            db.commit()
            db.refresh(approval)
            return NodeResult(
                {
                    "approval_required": True,
                    "approval_id": approval.id,
                    "message": message,
                    "data": data,
                },
                status="awaiting_approval",
            )

        return NodeResult(
            {"approval_required": True, "message": message, "data": data},
            status="awaiting_approval",
        )
