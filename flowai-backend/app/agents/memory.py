from dataclasses import dataclass, field
from typing import Any


@dataclass
class AgentMemory:
	conversation: list[dict[str, str]] = field(default_factory=list)
	task: dict[str, Any] = field(default_factory=dict)
	workflow: dict[str, Any] = field(default_factory=dict)
	observations: list[dict[str, Any]] = field(default_factory=list)

	def remember(self, step: int, observation: dict[str, Any]) -> None:
		self.observations.append({"step": step, "observation": observation})
		self.task["last_step"] = step
		self.task["last_observation"] = observation

	def context(self) -> dict[str, Any]:
		return {"task": self.task, "workflow": self.workflow, "observations": self.observations}
