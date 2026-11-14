"""
Local SentenceTransformer Embedding Provider
Executes local neural semantic vector embeddings using Hugging Face SentenceTransformers
on Apple Silicon MPS / CPU without external cloud API dependencies.
"""
from typing import List
import numpy as np
from sentence_transformers import SentenceTransformer
from backend.app.rag.embeddings.base_embeddings import EmbeddingProvider

_local_model_instance = None

def get_sentence_transformer_model(model_name: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2") -> SentenceTransformer:
    global _local_model_instance
    if _local_model_instance is None:
        _local_model_instance = SentenceTransformer(model_name)
    return _local_model_instance

class LocalSentenceTransformerEmbeddingProvider(EmbeddingProvider):
    def __init__(self, model_name: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"):
        self._model_name = model_name
        self._model = get_sentence_transformer_model(model_name)
        self._dimension = 384

    @property
    def model_name(self) -> str:
        return self._model_name

    @property
    def dimension(self) -> int:
        return self._dimension

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        embeddings = self._model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
        return embeddings.tolist()

    def embed_query(self, text: str) -> List[float]:
        emb = self._model.encode([text], normalize_embeddings=True, show_progress_bar=False)
        return emb[0].tolist()

