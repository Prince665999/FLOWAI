from typing import Any
from app.agents.base_agent import BaseAgent
from app.agents.guardrails import AgentGuardrails
from app.agents.supervisor import supervisor_agent


class AgentExecutor:
    def __init__(self, agent: BaseAgent | None = None) -> None:
        self.agent = agent or BaseAgent(guardrails=AgentGuardrails())

    async def execute(
        self,
        objective: str,
        *,
        user_id: int,
        db: Any = None,
        allowed_tools: set[str] | None = None,
        use_multi_agent_supervisor: bool = False,
    ) -> dict[str, Any]:
        if use_multi_agent_supervisor:
            supervisor_res = await supervisor_agent.run(objective=objective, user_id=user_id, db=db)
            return {
                "plan": supervisor_res["delegation_tree"],
                "steps": [
                    {
                        "step": entry["step"],
                        "description": f"[{entry['sub_agent'].upper()}] {entry['description']}",
                        "tool": entry["sub_agent"],
                        "status": entry["status"],
                        "arguments": {"task": entry["task"]},
                        "observation": entry.get("output"),
                        "error": entry.get("error"),
                    }
                    for entry in supervisor_res["delegation_tree"]
                ],
                "result": supervisor_res["aggregated_findings"],
                "delegation_tree": supervisor_res["delegation_tree"],
                "summary": supervisor_res.get("summary"),
            }

        if allowed_tools is not None:
            self.agent.allowed_tools = allowed_tools
        return await self.agent.run(objective, user_id=user_id, db=db)
