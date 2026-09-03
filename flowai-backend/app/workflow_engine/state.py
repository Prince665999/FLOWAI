from dataclasses import dataclass, field
from typing import Any


@dataclass
class WorkflowState:
	run_id: int
	current_node_id: str | None = None
	data: dict[str, Any] = field(default_factory=dict)
	status: str = "queued"
	visited_nodes: list[str] = field(default_factory=list)
