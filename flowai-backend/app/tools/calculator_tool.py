import ast
import operator
from typing import Any

from app.tools.base_tool import BaseTool, ToolContext


class CalculatorTool(BaseTool):
    name = "calculator"
    description = "Evaluate a safe arithmetic expression."
    permissions = {"calculator.use"}
    input_schema = {"type": "object", "properties": {"expression": {"type": "string"}}, "required": ["expression"]}

    async def execute(self, arguments: dict[str, Any], context: ToolContext) -> dict[str, Any]:
        operations = {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul, ast.Div: operator.truediv, ast.Pow: operator.pow, ast.Mod: operator.mod, ast.USub: operator.neg}
        def evaluate(node: ast.AST) -> float:
            if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)): return node.value
            if isinstance(node, ast.BinOp) and type(node.op) in operations: return operations[type(node.op)](evaluate(node.left), evaluate(node.right))
            if isinstance(node, ast.UnaryOp) and type(node.op) in operations: return operations[type(node.op)](evaluate(node.operand))
            raise ValueError("Only arithmetic expressions are allowed")
        tree = ast.parse(arguments["expression"], mode="eval")
        return {"result": evaluate(tree.body)}