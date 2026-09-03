from app.agents.base_agent import BaseAgent
from app.agents.guardrails import AgentGuardrails


class AgentExecutor:
	def __init__(self, agent: BaseAgent | None = None) -> None:
		self.agent = agent or BaseAgent(guardrails=AgentGuardrails())

	async def execute(self, objective: str, *, user_id: int, db=None, allowed_tools: set[str] | None = None) -> dict:
		if allowed_tools is not None:
			self.agent.allowed_tools = allowed_tools
		return await self.agent.run(objective, user_id=user_id, db=db)
