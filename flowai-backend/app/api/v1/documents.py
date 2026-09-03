from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.ai.rag.chroma_store import chroma_store
from app.db.session import get_db
from app.dependencies import get_current_active_user
from app.models.document import Document
from app.models.user import User
from app.schemas.document import DocumentRead
from app.services.file_service import file_service

router = APIRouter(prefix="/documents", tags=["documents"])


def chunk_text(text: str, size: int = 1200, overlap: int = 150) -> list[str]:
    if not text:
        return []
    chunks = []
    start = 0
    while start < len(text):
        chunk = text[start : start + size].strip()
        if chunk:
            chunks.append(chunk)
        start += size - overlap
    return chunks


@router.post("", response_model=DocumentRead, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
) -> Document:
    try:
        storage_path, content = await file_service.save_upload(file)
        text = file_service.extract_text(file.filename or "document", file.content_type or "application/octet-stream", content)
        chunks = chunk_text(text)
        document = Document(
            user_id=user.id,
            filename=file.filename or "document",
            storage_path=storage_path,
            content_type=file.content_type or "application/octet-stream",
            size_bytes=len(content),
            extracted_text=text,
            status="ready",
        )
        db.add(document)
        db.commit()
        db.refresh(document)
        chroma_store.add_chunks([
            {
                "id": f"document-{document.id}-chunk-{index}",
                "content": chunk,
                "metadata": {"document_id": document.id, "user_id": user.id, "filename": document.filename, "chunk_index": index},
            }
            for index, chunk in enumerate(chunks)
        ])
        return document
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("", response_model=list[DocumentRead])
def list_documents(
    db: Session = Depends(get_db), user: User = Depends(get_current_active_user)
) -> list[Document]:
    return db.query(Document).filter(Document.user_id == user.id).order_by(Document.created_at.desc()).all()