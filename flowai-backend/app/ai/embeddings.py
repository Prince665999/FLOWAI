import hashlib
import math
import re

from app.config import settings


class EmbeddingService:
    """Creates dependency-free, deterministic vectors for local semantic indexing."""

    def __init__(self, dimensions: int | None = None) -> None:
        self.dimensions = dimensions or settings.EMBEDDING_DIMENSIONS

    def embed(self, text: str) -> list[float]:
        vector = [0.0] * self.dimensions
        tokens = re.findall(r"\w+", text.lower())
        for token in tokens:
            digest = hashlib.sha256(token.encode("utf-8")).digest()
            index = int.from_bytes(digest[:4], "big") % self.dimensions
            sign = 1.0 if digest[4] % 2 else -1.0
            vector[index] += sign
        norm = math.sqrt(sum(value * value for value in vector)) or 1.0
        return [value / norm for value in vector]

    def embed_many(self, texts: list[str]) -> list[list[float]]:
        return [self.embed(text) for text in texts]


embedding_service = EmbeddingService()