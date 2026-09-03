from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any


@dataclass
class ToolContext:
	user_id: int
	db: Any = None


class BaseTool(ABC):
	name: str
	description: str
	input_schema: dict[str, Any]
	permissions: set[str] = set()

	def definition(self) -> dict[str, Any]:
		return {
			"name": self.name,
			"description": self.description,
			"parameters": self.input_schema,
			"permissions": sorted(self.permissions),
		}

	@abstractmethod
	async def execute(self, arguments: dict[str, Any], context: ToolContext) -> dict[str, Any]:
		raise NotImplementedError
