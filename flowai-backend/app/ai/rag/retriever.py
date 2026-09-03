from app.ai.rag.chroma_store import ChromaStore, chroma_store
from app.schemas.document import Citation


class BusinessRetriever:
    def __init__(self, store: ChromaStore | None = None) -> None:
        self.store = store or chroma_store

    def retrieve(self, query: str, user_id: int, limit: int = 5) -> list[Citation]:
        return [
            Citation(
                document_id=int(item["metadata"]["document_id"]),
                filename=str(item["metadata"]["filename"]),
                chunk_index=int(item["metadata"]["chunk_index"]),
                content=item["content"],
                score=round(item["score"], 4),
            )
            for item in self.store.query(query, user_id, limit)
        ]

    def build_context(self, query: str, user_id: int, limit: int = 5) -> tuple[str, list[Citation]]:
        citations = self.retrieve(query, user_id, limit)
        context = "\n\n".join(
            f"[Source: {citation.filename}, section {citation.chunk_index}]\n{citation.content}"
            for citation in citations
        )
        return context, citations


business_retriever = BusinessRetriever()