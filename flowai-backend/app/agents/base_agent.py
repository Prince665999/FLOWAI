from types import SimpleNamespace
from typing import Any

from app.agents.guardrails import AgentGuardrails
from app.agents.memory import AgentMemory
from app.agents.permissions import validate_tool_access
from app.agents.planner import Planner, planner
from app.tools.base_tool import ToolContext
from app.tools.registry import tool_registry


class BaseAgent:
	def __init__(self, *, planner_instance: Planner | None = None, allowed_tools: set[str] | None = None, guardrails: AgentGuardrails | None = None) -> None:
		self.planner = planner_instance or planner
		self.allowed_tools = allowed_tools or set(tool_registry.names())
		self.guardrails = guardrails or AgentGuardrails()

	async def run(self, objective: str, *, user_id: int, db: Any = None, memory: AgentMemory | None = None) -> dict[str, Any]:
		agent_memory = memory or AgentMemory()
		plan = self.planner.plan(objective, self.allowed_tools)
		data: dict[str, Any] = {"objective": objective}
		steps = []
		context = SimpleNamespace(user_id=user_id, db=db)
		for index, task in enumerate(plan, start=1):
			self.guardrails.check(index - 1)
			arguments = self._resolve_arguments(task.get("arguments", {}), data)
			record = {"step": index, "description": task["description"], "tool": task.get("tool"), "status": "running", "arguments": arguments}
			try:
				if task.get("tool"):
					validate_tool_access(task["tool"], self.allowed_tools)
					observation = await tool_registry.get(task["tool"]).execute(arguments, ToolContext(user_id=user_id, db=db))
				else:
					observation = {"message": "Objective recorded for analysis", "objective": objective}
				data = {**data, **observation}
				agent_memory.remember(index, observation)
				record.update({"status": "succeeded", "observation": observation})
			except Exception as exc:
				record.update({"status": "failed", "error": str(exc)})
				steps.append(record)
				raise
			steps.append(record)
		return {"plan": plan, "steps": steps, "result": data, "memory": agent_memory.context()}

	@staticmethod
	def _resolve_arguments(arguments: dict[str, Any], data: dict[str, Any]) -> dict[str, Any]:
		return {key: (data.get(value[1:], value) if isinstance(value, str) and value.startswith("$") else value) for key, value in arguments.items()}
