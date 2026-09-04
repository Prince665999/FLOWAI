from typing import Any
from app.agents.base_agent import BaseAgent
from app.agents.permissions import REPORTING_TOOLS
from app.agents.memory import AgentMemory


class ReportingAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__(allowed_tools=REPORTING_TOOLS)
        self.role = "reporting_agent"
        self.description = "Specialized AI analyst for database querying, metrics calculation, and management report generation."

    async def execute_task(self, task_objective: str, user_id: int, db: Any = None, shared_memory: AgentMemory | None = None) -> dict[str, Any]:
        result = await self.run(
            objective=f"[Reporting Agent Task] {task_objective}",
            user_id=user_id,
            db=db,
            memory=shared_memory,
        )
        return {
            "agent": self.role,
            "status": "succeeded",
            "report": result["result"],
            "steps": result["steps"],
        }


reporting_agent = ReportingAgent()
