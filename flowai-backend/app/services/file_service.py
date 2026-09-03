import io
import re
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile
from pypdf import PdfReader

from app.config import settings


class FileService:
    def __init__(self, storage_path: str | None = None) -> None:
        self.storage_path = Path(storage_path or settings.DOCUMENT_STORAGE_PATH)

    async def save_upload(self, upload: UploadFile) -> tuple[str, bytes]:
        content = await upload.read(settings.DOCUMENT_MAX_SIZE_BYTES + 1)
        if len(content) > settings.DOCUMENT_MAX_SIZE_BYTES:
            raise ValueError("Document exceeds the maximum allowed size")
        safe_name = re.sub(r"[^A-Za-z0-9._-]", "_", upload.filename or "document")
        self.storage_path.mkdir(parents=True, exist_ok=True)
        path = self.storage_path / f"{uuid4().hex}_{safe_name}"
        path.write_bytes(content)
        return str(path), content

    def extract_text(self, filename: str, content_type: str, content: bytes) -> str:
        suffix = Path(filename).suffix.lower()
        if suffix == ".pdf" or content_type == "application/pdf":
            reader = PdfReader(io.BytesIO(content))
            return "\n".join(page.extract_text() or "" for page in reader.pages).strip()
        if suffix in {".txt", ".md", ".csv", ".json", ".html"} or content_type.startswith("text/"):
            return content.decode("utf-8", errors="replace").strip()
        raise ValueError("Unsupported document type; upload PDF, TXT, Markdown, CSV, JSON, or HTML")


file_service = FileService()