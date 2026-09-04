from typing import Iterable
from app.tools.registry import tool_registry


class AgentPermissionError(PermissionError):
    pass


class AgentApprovalRequiredError(PermissionError):
    def __init__(self, tool_name: str, message: str = "Human approval required"):
        self.tool_name = tool_name
        self.message = message
        super().__init__(f"{message} for tool: {tool_name}")


# Tools that mutate critical data or perform external communication
SENSITIVE_TOOLS = {
    "send_email",
    "delete_customer",
    "financial_action",
    "modify_database",
    "publish_content",
}

# Role-scoped allowed tools defaults
RESEARCH_TOOLS = {"web_search", "file", "calculator", "weather"}
CUSTOMER_TOOLS = {"crm", "email", "calendar", "notification", "calculator"}
REPORTING_TOOLS = {"database", "file", "calculator", "notification"}


def validate_tool_access(tool_name: str, allowed_tools: set[str]) -> None:
    if tool_name not in allowed_tools:
        raise AgentPermissionError(f"Agent is not allowed to use tool: {tool_name}")
    tool_registry.get(tool_name)


def requires_human_approval(tool_name: str, action: str | None = None) -> bool:
    if tool_name in SENSITIVE_TOOLS:
        return True
    if tool_name == "email" and action in {"send", "send_email"}:
        return True
    if tool_name == "crm" and action in {"delete", "delete_customer"}:
        return True
    return False
