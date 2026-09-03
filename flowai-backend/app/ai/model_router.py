from dataclasses import dataclass

from app.config import settings


@dataclass(frozen=True)
class ModelSelection:
	model: str
	reason: str


class ModelRouter:
	"""Selects a configured Groq model without coupling callers to model IDs."""

	def select(self, task: str = "chat", *, complex_reasoning: bool = False) -> ModelSelection:
		if complex_reasoning or task in {"planning", "analysis", "complex"}:
			return ModelSelection(settings.GROQ_POWERFUL_MODEL, "complex reasoning")
		return ModelSelection(settings.GROQ_DEFAULT_MODEL, "standard assistant task")


model_router = ModelRouter()
