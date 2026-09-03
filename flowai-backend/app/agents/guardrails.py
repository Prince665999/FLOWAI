from dataclasses import dataclass, field
from time import monotonic


class AgentLimitError(RuntimeError):
	pass


@dataclass
class AgentGuardrails:
	max_steps: int = 10
	max_retries: int = 2
	max_runtime_seconds: float = 120.0
	started_at: float = field(default_factory=monotonic)

	def check(self, completed_steps: int) -> None:
		if completed_steps >= self.max_steps:
			raise AgentLimitError("Agent maximum step limit reached")
		if monotonic() - self.started_at > self.max_runtime_seconds:
			raise AgentLimitError("Agent maximum runtime reached")
