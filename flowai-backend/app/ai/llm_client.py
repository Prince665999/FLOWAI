from collections.abc import AsyncIterator, Iterable

from openai import AsyncOpenAI

from app.ai.model_router import ModelRouter, model_router
from app.config import settings


class LLMConfigurationError(RuntimeError):
	pass


class GroqLLMClient:
	def __init__(self, router: ModelRouter | None = None) -> None:
		self.router = router or model_router
		self._client: AsyncOpenAI | None = None

	@property
	def client(self) -> AsyncOpenAI:
		if not settings.GROQ_API_KEY:
			raise LLMConfigurationError("GROQ_API_KEY is not configured")
		if self._client is None:
			self._client = AsyncOpenAI(
				api_key=settings.GROQ_API_KEY,
				base_url=settings.GROQ_BASE_URL,
				timeout=settings.LLM_REQUEST_TIMEOUT_SECONDS,
			)
		return self._client

	async def complete(
		self,
		messages: Iterable[dict[str, str]],
		*,
		task: str = "chat",
		complex_reasoning: bool = False,
	) -> str:
		selection = self.router.select(task, complex_reasoning=complex_reasoning)
		response = await self.client.chat.completions.create(
			model=selection.model,
			messages=list(messages),
		)
		return response.choices[0].message.content or ""

	async def stream(
		self,
		messages: Iterable[dict[str, str]],
		*,
		task: str = "chat",
		complex_reasoning: bool = False,
	) -> AsyncIterator[str]:
		selection = self.router.select(task, complex_reasoning=complex_reasoning)
		response = await self.client.chat.completions.create(
			model=selection.model,
			messages=list(messages),
			stream=True,
		)
		async for chunk in response:
			content = chunk.choices[0].delta.content if chunk.choices else None
			if content:
				yield content


llm_client = GroqLLMClient()
