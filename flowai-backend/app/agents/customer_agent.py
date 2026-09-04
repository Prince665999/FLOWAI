from typing import Any
from app.agents.base_agent import BaseAgent
from app.agents.permissions import CUSTOMER_TOOLS
from app.agents.memory import AgentMemory


class CustomerAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__(allowed_tools=CUSTOMER_TOOLS)
        self.role = "customer_agent"
        self.description = "Specialized AI customer representative for CRM management, support ticket resolution, and email drafting."

    async def execute_task(self, task_objective: str, user_id: int, db: Any = None, shared_memory: AgentMemory | None = None) -> dict[str, Any]:
        result = await self.run(
            objective=f"[Customer Agent Task] {task_objective}",
            user_id=user_id,
            db=db,
            memory=shared_memory,
        )
        return {
            "agent": self.role,
            "status": "succeeded",
            "customer_action_result": result["result"],
            "steps": result["steps"],
        }


customer_agent = CustomerAgent()
