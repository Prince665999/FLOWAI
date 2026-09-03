from typing import Any

from app.services.notification_service import notification_service
from app.workflow_engine.nodes.base import NodeResult, WorkflowNodeHandler


class NotificationNode(WorkflowNodeHandler):
	async def execute(self, config: dict[str, Any], data: dict[str, Any], context: Any) -> NodeResult:
		notification = notification_service.create(context.db, context.user_id, {"title": config.get("title", "Workflow update"), "body": config.get("body", str(data)), "channel": config.get("channel", "in_app")})
		return NodeResult({"notification_id": notification.id})
