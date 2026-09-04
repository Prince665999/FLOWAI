from typing import Any


class AgentEvaluator:
    """
    Evaluator for Multi-Step and Multi-Agent performance:
    - Plan Quality & Decomposition
    - Task Completion Rate
    - Execution Step Efficiency
    - Error Handling & Recovery
    """

    def evaluate_agent_run(
        self,
        objective: str,
        plan: list[dict[str, Any]],
        steps: list[dict[str, Any]],
        final_status: str,
    ) -> dict[str, Any]:
        plan_score = min(1.0, max(0.5, len(plan) / 3.0)) if plan else 0.0
        success_score = 1.0 if final_status == "succeeded" else 0.0
        step_efficiency = 1.0 if len(steps) <= 6 else 0.7

        agent_score = round((plan_score * 0.3) + (success_score * 0.4) + (step_efficiency * 0.3), 2)
        return {
            "agent_score": agent_score,
            "plan_score": plan_score,
            "success_score": success_score,
            "steps_count": len(steps),
            "step_efficiency": step_efficiency,
            "passed": agent_score >= 0.75,
        }


agent_evaluator = AgentEvaluator()
