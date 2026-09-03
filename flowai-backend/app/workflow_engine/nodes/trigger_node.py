from typing import Any

from app.workflow_engine.nodes.base import NodeResult, WorkflowNodeHandler


class TriggerNode(WorkflowNodeHandler):
	async def execute(self, config: dict[str, Any], data: dict[str, Any], context: Any) -> NodeResult:
		return NodeResult({"trigger": config.get("event", "manual"), "data": data})
