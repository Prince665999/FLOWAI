from pathlib import Path
from typing import Any

from app.ai.vision import vision_service
from app.models.document import Document
from app.tools.base_tool import BaseTool, ToolContext


class FileTool(BaseTool):
    name = "file"
    description = "List, read, or perform OCR vision analysis on business files and documents."
    permissions = {"file.read"}
    input_schema = {
        "type": "object",
        "properties": {
            "action": {
                "type": "string",
                "enum": ["list", "read", "ocr_analyze"],
            },
            "document_id": {"type": "integer"},
            "prompt": {"type": "string"},
        },
        "required": ["action"],
    }

    async def execute(self, arguments: dict[str, Any], context: ToolContext) -> dict[str, Any]:
        query = context.db.query(Document).filter(Document.user_id == context.user_id)
        action = arguments.get("action")

        if action == "list":
            return {
                "documents": [
                    {"id": doc.id, "filename": doc.filename, "status": doc.status}
                    for doc in query.all()
                ]
            }

        document = query.filter(Document.id == arguments.get("document_id")).first()
        if document is None:
            return {"error": "Document not found"}

        file_content = document.extracted_text
        if not file_content and document.storage_path:
            file_path = Path(document.storage_path)
            if file_path.exists():
                file_content = file_path.read_text(errors="replace")

        if action == "ocr_analyze":
            prompt = arguments.get("prompt", "Analyze this document and extract all key data fields.")
            vision_res = await vision_service.analyze_image(
                image_data=file_content or document.filename,
                prompt=prompt,
            )
            return {
                "document_id": document.id,
                "filename": document.filename,
                "ocr_result": vision_res,
            }

        return {
            "document": {
                "id": document.id,
                "filename": document.filename,
                "content": file_content,
            }
        }