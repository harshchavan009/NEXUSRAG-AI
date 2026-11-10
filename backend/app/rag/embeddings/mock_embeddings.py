import hashlib
import re
import numpy as np
from typing import List
from backend.app.rag.embeddings.base_embeddings import EmbeddingProvider

class MockEmbeddingProvider(EmbeddingProvider):
    """
    Deterministic pseudo-embedding provider for testing.
    Projects word tokens into vector space via SHA-256 seed projection,
    producing non-random, mathematically reproducible unit vectors that reflect semantic keyword overlap.
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
        words = re.findall(r"\w+", text.lower())
        vec = np.zeros(self._dimension, dtype=np.float32)

        if not words:
            # Fallback for empty text: fixed seed
            rng = np.random.RandomState(42)
            vec = rng.randn(self._dimension).astype(np.float32)
        else:
            for w in words:
                seed = int(hashlib.sha256(w.encode("utf-8")).hexdigest()[:8], 16)
                rng = np.random.RandomState(seed)
                vec += rng.randn(self._dimension).astype(np.float32)

        # L2-normalize for cosine similarity inner product
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self._generate_vector(t) for t in texts]

    def embed_query(self, text: str) -> List[float]:
        return self._generate_vector(text)

