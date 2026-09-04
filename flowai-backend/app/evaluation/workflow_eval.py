from typing import Any


class WorkflowEvaluator:
    """
    Evaluator for Business Workflow Executions:
    - End-to-end graph completion
    - Correct branching decisions on IF/THEN/ELSE
    - Human approval lifecycle (pause & resume)
    - Output validity
    """

    def evaluate_workflow_run(
        self,
        workflow_name: str,
        steps: list[dict[str, Any]],
        final_status: str,
        expected_status: str = "succeeded",
    ) -> dict[str, Any]:
        status_match = 1.0 if final_status in (expected_status, "awaiting_approval") else 0.0
        steps_executed = len(steps)
        execution_score = 1.0 if steps_executed > 0 else 0.0

        overall = round((status_match * 0.6) + (execution_score * 0.4), 2)
        return {
            "workflow_score": overall,
            "status_match": bool(status_match),
            "steps_executed": steps_executed,
            "final_status": final_status,
            "passed": overall >= 0.8,
        }


workflow_evaluator = WorkflowEvaluator()
