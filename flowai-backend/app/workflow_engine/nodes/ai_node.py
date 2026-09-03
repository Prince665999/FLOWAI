from typing import Any

from app.ai.llm_client import llm_client
from app.workflow_engine.nodes.base import NodeResult, WorkflowNodeHandler


class AINode(WorkflowNodeHandler):
	async def execute(self, config: dict[str, Any], data: dict[str, Any], context: Any) -> NodeResult:
		prompt = config.get("prompt", "Analyze the following business data")
		result = await llm_client.complete([{"role": "system", "content": prompt}, {"role": "user", "content": str(data)}], task="analysis")
		return NodeResult({"text": result})
