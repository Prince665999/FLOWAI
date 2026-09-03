from typing import Any

from app.models.customer import Customer
from app.tools.base_tool import BaseTool, ToolContext


class DatabaseTool(BaseTool):
    name = "database"
    description = "Query approved business data sources."
    permissions = {"database.read"}
    input_schema = {"type": "object", "properties": {"resource": {"type": "string", "enum": ["customers"]}, "limit": {"type": "integer", "maximum": 100}}, "required": ["resource"]}

    async def execute(self, arguments: dict[str, Any], context: ToolContext) -> dict[str, Any]:
        if arguments.get("resource") != "customers": return {"error": "Unsupported resource"}
        rows = context.db.query(Customer).limit(min(arguments.get("limit", 50), 100)).all()
        return {"customers": [{"id": row.id, "name": row.name, "email": row.email, "company": row.company} for row in rows]}