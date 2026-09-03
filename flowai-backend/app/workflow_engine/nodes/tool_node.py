from typing import Any

from app.tools.base_tool import ToolContext
from app.tools.registry import tool_registry
from app.workflow_engine.nodes.base import NodeResult, WorkflowNodeHandler


class ToolNode(WorkflowNodeHandler):
	async def execute(self, config: dict[str, Any], data: dict[str, Any], context: Any) -> NodeResult:
		tool = tool_registry.get(config["tool"])
		arguments = {**config.get("arguments", {}), **data.get("tool_arguments", {})}
		return NodeResult(await tool.execute(arguments, ToolContext(user_id=context.user_id, db=context.db)))
