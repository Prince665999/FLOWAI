from abc import ABC, abstractmethod
from typing import Any


class NodeResult:
    def __init__(self, output: dict[str, Any] | None = None, *, status: str = "succeeded") -> None:
        self.output = output or {}
        self.status = status


class WorkflowNodeHandler(ABC):
    @abstractmethod
    async def execute(self, config: dict[str, Any], data: dict[str, Any], context: Any) -> NodeResult:
        raise NotImplementedError