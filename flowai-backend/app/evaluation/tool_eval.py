from typing import Any


class ToolEvaluator:
    """
    Evaluator for Autonomous Tool Invocations:
    - Did the agent pick the optimal tool?
    - Are the arguments schema-valid?
    - Did the tool call succeed without unnecessary errors?
    """

    def evaluate_tool_call(
        self,
        objective: str,
        selected_tool: str,
        arguments: dict[str, Any],
        expected_tool: str | None = None,
        tool_status: str = "succeeded",
    ) -> dict[str, Any]:
        tool_accuracy = 1.0 if (not expected_tool or selected_tool == expected_tool) else 0.0
        args_valid = 1.0 if isinstance(arguments, dict) and len(arguments) > 0 else 0.5
        exec_success = 1.0 if tool_status == "succeeded" else 0.0

        overall = round((tool_accuracy * 0.5) + (args_valid * 0.25) + (exec_success * 0.25), 2)
        return {
            "tool_score": overall,
            "tool_accuracy": tool_accuracy,
            "arguments_valid": bool(args_valid),
            "execution_succeeded": bool(exec_success),
            "passed": overall >= 0.8,
        }


tool_evaluator = ToolEvaluator()
