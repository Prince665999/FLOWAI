from typing import Any
from app.agents.memory import AgentMemory
from app.agents.research_agent import research_agent
from app.agents.customer_agent import customer_agent
from app.agents.reporting_agent import reporting_agent


class SupervisorAgent:
    """
    Supervisor Agent coordinating specialized sub-agents:
    - Research Agent
    - Customer Agent
    - Reporting Agent
    """

    def __init__(self) -> None:
        self.sub_agents = {
            "research": research_agent,
            "customer": customer_agent,
            "reporting": reporting_agent,
        }

    def decompose_objective(self, objective: str) -> list[dict[str, str]]:
        text = objective.lower()
        plan = []

        # Research requirement
        if any(w in text for w in ["research", "competitor", "market", "look up", "search", "investigate"]):
            plan.append({
                "sub_agent": "research",
                "task": f"Conduct research on: {objective}",
                "description": "Gather market, competitor, or web intelligence",
            })

        # Customer/CRM requirement
        if any(w in text for w in ["customer", "crm", "complaint", "inquiry", "ticket", "email", "client"]):
            plan.append({
                "sub_agent": "customer",
                "task": f"Retrieve and process customer records for: {objective}",
                "description": "Query CRM, classify requests, draft responses",
            })

        # Reporting requirement
        if any(w in text for w in ["report", "summary", "analyze", "analytics", "dashboard", "metric", "compare"]):
            plan.append({
                "sub_agent": "reporting",
                "task": f"Compile comprehensive business report for: {objective}",
                "description": "Aggregate findings into an executive report",
            })

        if not plan:
            # Default delegation to research then reporting
            plan = [
                {
                    "sub_agent": "research",
                    "task": f"Investigate background data for: {objective}",
                    "description": "Initial data gathering",
                },
                {
                    "sub_agent": "reporting",
                    "task": f"Compile findings for: {objective}",
                    "description": "Generate executive summary",
                },
            ]

        return plan

    async def run(
        self,
        objective: str,
        user_id: int,
        db: Any = None,
    ) -> dict[str, Any]:
        shared_memory = AgentMemory(task={"objective": objective})
        delegation_plan = self.decompose_objective(objective)
        delegation_tree = []
        aggregated_findings = {}

        for index, item in enumerate(delegation_plan, start=1):
            agent_key = item["sub_agent"]
            sub_agent = self.sub_agents.get(agent_key, research_agent)

            delegation_entry = {
                "step": index,
                "sub_agent": agent_key,
                "description": item["description"],
                "task": item["task"],
                "status": "running",
            }

            try:
                result = await sub_agent.execute_task(
                    task_objective=item["task"],
                    user_id=user_id,
                    db=db,
                    shared_memory=shared_memory,
                )
                delegation_entry["status"] = "succeeded"
                delegation_entry["output"] = result
                aggregated_findings[agent_key] = result
                shared_memory.remember(index, result)
            except Exception as exc:
                delegation_entry["status"] = "failed"
                delegation_entry["error"] = str(exc)
                delegation_tree.append(delegation_entry)
                raise

            delegation_tree.append(delegation_entry)

        final_summary = {
            "objective": objective,
            "delegation_tree": delegation_tree,
            "aggregated_findings": aggregated_findings,
            "status": "completed",
            "summary": f"Supervisor successfully orchestrated {len(delegation_plan)} specialized agents to achieve objective.",
        }

        return final_summary


supervisor_agent = SupervisorAgent()
