from app.tools.registry import tool_registry


class AgentPermissionError(PermissionError):
	pass


def validate_tool_access(tool_name: str, allowed_tools: set[str]) -> None:
	if tool_name not in allowed_tools:
		raise AgentPermissionError(f"Agent is not allowed to use tool: {tool_name}")
	tool_registry.get(tool_name)
