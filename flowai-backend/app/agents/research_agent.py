from typing import Any
from app.agents.base_agent import BaseAgent
from app.agents.permissions import RESEARCH_TOOLS
from app.agents.memory import AgentMemory


class ResearchAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__(allowed_tools=RESEARCH_TOOLS)
        self.role = "research_agent"
        self.description = "Specialized AI researcher for web search, document knowledge retrieval, and data synthesis."

    async def execute_task(self, task_objective: str, user_id: int, db: Any = None, shared_memory: AgentMemory | None = None) -> dict[str, Any]:
        result = await self.run(
            objective=f"[Research Agent Task] {task_objective}",
            user_id=user_id,
            db=db,
            memory=shared_memory,
        )
        return {
            "agent": self.role,
            "status": "succeeded",
            "findings": result["result"],
            "steps": result["steps"],
        }


research_agent = ResearchAgent()
