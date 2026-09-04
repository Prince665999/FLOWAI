from dataclasses import dataclass, field
from time import monotonic
from typing import Any

from app.agents.permissions import requires_human_approval, AgentApprovalRequiredError


class AgentLimitError(RuntimeError):
    pass


@dataclass
class AgentGuardrails:
    max_steps: int = 10
    max_retries: int = 2
    max_runtime_seconds: float = 120.0
    max_cost_usd: float = 5.0
    current_cost_usd: float = 0.0
    started_at: float = field(default_factory=monotonic)

    def check(self, completed_steps: int) -> None:
        if completed_steps >= self.max_steps:
            raise AgentLimitError(f"Agent maximum step limit of {self.max_steps} reached")
        if monotonic() - self.started_at > self.max_runtime_seconds:
            raise AgentLimitError(f"Agent maximum runtime of {self.max_runtime_seconds}s reached")
        if self.current_cost_usd > self.max_cost_usd:
            raise AgentLimitError(f"Agent maximum cost limit of ${self.max_cost_usd:.2f} reached")

    def validate_tool_execution(self, tool_name: str, arguments: dict[str, Any], is_approved: bool = False) -> None:
        action = arguments.get("action") if isinstance(arguments, dict) else None
        if requires_human_approval(tool_name, action) and not is_approved:
            raise AgentApprovalRequiredError(
                tool_name=tool_name,
                message=f"Action '{action or 'execute'}' on tool '{tool_name}' requires human approval",
            )
