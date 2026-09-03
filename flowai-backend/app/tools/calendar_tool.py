from typing import Any

from app.integrations.calendar.provider import CalendarProvider
from app.tools.base_tool import BaseTool, ToolContext


class CalendarTool(BaseTool):
    name = "calendar"
    description = "Check availability and create, update, or cancel calendar events."
    permissions = {"calendar.read", "calendar.write"}
    input_schema = {"type": "object", "properties": {"action": {"type": "string", "enum": ["availability", "create", "update", "cancel"]}, "event_id": {"type": "string"}, "start": {"type": "string"}, "end": {"type": "string"}, "data": {"type": "object"}}, "required": ["action"]}

    def __init__(self, provider: CalendarProvider | None = None) -> None:
        self.provider = provider or CalendarProvider()

    async def execute(self, arguments: dict[str, Any], context: ToolContext) -> dict[str, Any]:
        action = arguments.get("action")
        if action == "availability": return self.provider.availability(arguments["start"], arguments["end"])
        if action == "create": return {"event": self.provider.create_event(arguments.get("data", {}))}
        if action == "update": return {"event": self.provider.update_event(arguments["event_id"], arguments.get("data", {}))}
        if action == "cancel": return {"cancelled": self.provider.cancel_event(arguments["event_id"])}
        return {"error": "Unsupported calendar action"}