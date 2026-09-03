from typing import Any

from app.workflow_engine.nodes.base import NodeResult, WorkflowNodeHandler


class ApprovalNode(WorkflowNodeHandler):
	async def execute(self, config: dict[str, Any], data: dict[str, Any], context: Any) -> NodeResult:
		return NodeResult({"approval_required": True, "message": config.get("message", "Approval required"), "data": data}, status="awaiting_approval")
