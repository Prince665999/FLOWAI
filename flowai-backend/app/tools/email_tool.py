from typing import Any

from app.integrations.email.provider import EmailProvider
from app.tools.base_tool import BaseTool, ToolContext


class EmailTool(BaseTool):
    name = "email"
    description = "Read, search, draft, categorize, or send email messages."
    permissions = {"email.read", "email.draft", "email.send"}
    input_schema = {"type": "object", "properties": {"action": {"type": "string", "enum": ["read", "search", "draft", "send", "categorize"]}, "query": {"type": "string"}, "to": {"type": "string"}, "subject": {"type": "string"}, "body": {"type": "string"}, "category": {"type": "string"}}, "required": ["action"]}

    def __init__(self, provider: EmailProvider | None = None) -> None:
        self.provider = provider or EmailProvider()

    async def execute(self, arguments: dict[str, Any], context: ToolContext) -> dict[str, Any]:
        action = arguments.get("action")
        if action == "read": return {"messages": self.provider.read()}
        if action == "search": return {"messages": self.provider.search(arguments.get("query", ""))}
        if action == "draft": return {"message": self.provider.draft(arguments["to"], arguments["subject"], arguments["body"])}
        if action == "send": return {"message": self.provider.send(arguments["to"], arguments["subject"], arguments["body"])}
        if action == "categorize": return {"category": arguments.get("category", "uncategorized")}
        return {"error": "Unsupported email action"}