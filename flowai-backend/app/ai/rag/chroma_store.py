from pathlib import Path
from typing import Any

import chromadb

from app.ai.embeddings import embedding_service
from app.config import settings


class ChromaStore:
    def __init__(self, path: str | None = None) -> None:
        persist_path = Path(path or settings.CHROMA_PERSIST_PATH)
        persist_path.mkdir(parents=True, exist_ok=True)
        self.client = chromadb.PersistentClient(path=str(persist_path))
        self.collection = self.client.get_or_create_collection("flowai_business_documents")

    def add_chunks(self, chunks: list[dict[str, Any]]) -> None:
        if not chunks:
            return
        self.collection.upsert(
            ids=[chunk["id"] for chunk in chunks],
            documents=[chunk["content"] for chunk in chunks],
            metadatas=[chunk["metadata"] for chunk in chunks],
            embeddings=embedding_service.embed_many([chunk["content"] for chunk in chunks]),
        )

    def query(self, text: str, user_id: int, limit: int = 5) -> list[dict[str, Any]]:
        result = self.collection.query(
            query_embeddings=[embedding_service.embed(text)],
            n_results=limit,
            where={"user_id": user_id},
        )
        documents = result.get("documents", [[]])[0]
        metadatas = result.get("metadatas", [[]])[0]
        distances = result.get("distances", [[]])[0]
        return [
            {"content": content, "metadata": metadata, "score": max(0.0, 1.0 - distance)}
            for content, metadata, distance in zip(documents, metadatas, distances)
        ]


chroma_store = ChromaStore()