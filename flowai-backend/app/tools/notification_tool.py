from typing import Any

from app.services.notification_service import notification_service
from app.tools.base_tool import BaseTool, ToolContext


class NotificationTool(BaseTool):
	name = "notification"
	description = "Create an in-app notification for the authenticated user."
	permissions = {"notification.create"}
	input_schema = {"type": "object", "properties": {"title": {"type": "string"}, "body": {"type": "string"}, "channel": {"type": "string", "enum": ["in_app", "email", "push"]}, "metadata": {"type": "object"}}, "required": ["title", "body"]}

	async def execute(self, arguments: dict[str, Any], context: ToolContext) -> dict[str, Any]:
		notification = notification_service.create(context.db, context.user_id, arguments)
		return {"notification": {"id": notification.id, "title": notification.title, "channel": notification.channel}}
