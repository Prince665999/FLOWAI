from typing import Any

from app.workflow_engine.nodes.base import NodeResult, WorkflowNodeHandler


class ConditionNode(WorkflowNodeHandler):
	async def execute(self, config: dict[str, Any], data: dict[str, Any], context: Any) -> NodeResult:
		field = config.get("field")
		expected = config.get("equals")
		actual = data.get(field) if field else None
		return NodeResult({"branch": "true" if actual == expected else "false", "value": actual})
