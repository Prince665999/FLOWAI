from typing import Any

from app.integrations.crm.provider import CRMProvider
from app.tools.base_tool import BaseTool, ToolContext


class CRMTool(BaseTool):
    name = "crm"
    description = "Find, create, or update business customer records."
    permissions = {"crm.read", "crm.write"}
    input_schema = {"type": "object", "properties": {"action": {"type": "string", "enum": ["find", "create", "update"]}, "query": {"type": "string"}, "customer_id": {"type": "integer"}, "data": {"type": "object"}}, "required": ["action"]}

    def __init__(self, provider: CRMProvider | None = None) -> None:
        self.provider = provider or CRMProvider()

    async def execute(self, arguments: dict[str, Any], context: ToolContext) -> dict[str, Any]:
        action = arguments.get("action")
        if action == "find":
            customers = self.provider.find_customers(context.db, arguments.get("query", ""))
            return {"customers": [{"id": c.id, "name": c.name, "email": c.email, "company": c.company} for c in customers]}
        if action == "create":
            customer = self.provider.create_customer(context.db, arguments.get("data", {}))
            return {"customer": {"id": customer.id, "name": customer.name, "email": customer.email}}
        if action == "update":
            customer = self.provider.update_customer(context.db, arguments["customer_id"], arguments.get("data", {}))
            if customer is None:
                return {"error": "Customer not found"}
            return {"customer": {"id": customer.id, "name": customer.name, "email": customer.email}}
        return {"error": "Unsupported CRM action"}