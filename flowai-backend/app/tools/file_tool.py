from pathlib import Path
from typing import Any

from app.models.document import Document
from app.tools.base_tool import BaseTool, ToolContext


class FileTool(BaseTool):
    name = "file"
    description = "List or read files owned by the authenticated business user."
    permissions = {"file.read"}
    input_schema = {"type": "object", "properties": {"action": {"type": "string", "enum": ["list", "read"]}, "document_id": {"type": "integer"}}, "required": ["action"]}

    async def execute(self, arguments: dict[str, Any], context: ToolContext) -> dict[str, Any]:
        query = context.db.query(Document).filter(Document.user_id == context.user_id)
        if arguments.get("action") == "list":
            return {"documents": [{"id": doc.id, "filename": doc.filename, "status": doc.status} for doc in query.all()]}
        document = query.filter(Document.id == arguments.get("document_id")).first()
        if document is None: return {"error": "Document not found"}
        return {"document": {"id": document.id, "filename": document.filename, "content": document.extracted_text or Path(document.storage_path).read_text(errors="replace")}}