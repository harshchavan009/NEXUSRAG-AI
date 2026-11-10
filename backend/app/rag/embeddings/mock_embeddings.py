import hashlib
import numpy as np
from typing import List
from backend.app.rag.embeddings.base_embeddings import EmbeddingProvider

class MockEmbeddingProvider(EmbeddingProvider):
    """
    Deterministic pseudo-embedding provider for testing.
    Uses SHA-256 seed projection to produce non-random, mathematically reproducible unit vectors.
    """
    def __init__(self, dimension: int = 768, model_name: str = "mock-embedding-v1"):
        self._dimension = dimension
        self._model_name = model_name

    @property
    def model_name(self) -> str:
        return self._model_name

    @property
    def dimension(self) -> int:
        return self._dimension

    def _generate_vector(self, text: str) -> List[float]:
        # Hash text to an integer seed
        seed = int(hashlib.sha256(text.encode("utf-8")).hexdigest()[:8], 16)
        rng = np.random.RandomState(seed)
        vec = rng.randn(self._dimension).astype(np.float32)
        # L2-normalize
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self._generate_vector(t) for t in texts]

    def embed_query(self, text: str) -> List[float]:
        return self._generate_vector(text)
