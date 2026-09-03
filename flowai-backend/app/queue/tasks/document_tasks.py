from datetime import datetime, timezone

from app.ai.rag.chroma_store import chroma_store
from app.db.session import SessionLocal
from app.models.document import Document
from app.models.job import Job
from app.queue.celery_app import celery_app


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


@celery_app.task(name="flowai.document.index")
def index_document_task(job_id: int, document_id: int) -> dict:
	db = SessionLocal()
	job = db.query(Job).filter(Job.id == job_id).first()
	document = db.query(Document).filter(Document.id == document_id).first()
	try:
		if not job or not document:
			raise ValueError("Document job resources not found")
		job.status = "running"
		job.attempts += 1
		document.status = "processing"
		db.commit()
		chunks = chunk_text(document.extracted_text or "")
		chroma_store.add_chunks([{"id": f"document-{document.id}-chunk-{index}", "content": chunk, "metadata": {"document_id": document.id, "user_id": document.user_id, "filename": document.filename, "chunk_index": index}} for index, chunk in enumerate(chunks)])
		document.status = "ready"
		job.status = "succeeded"
		job.result = {"document_id": document.id, "chunks": len(chunks)}
		job.completed_at = datetime.now(timezone.utc)
		db.commit()
		return job.result
	except Exception as exc:
		if job:
			job.status = "failed"
			job.error = str(exc)
			job.completed_at = datetime.now(timezone.utc)
			db.commit()
		raise
	finally:
		db.close()
