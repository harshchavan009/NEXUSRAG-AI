import time
import logging
from typing import List
from google import genai
from google.genai import types
from backend.app.rag.embeddings.base_embeddings import EmbeddingProvider
from backend.app.config import settings
from backend.app.core.exceptions import ValidationException

logger = logging.getLogger("nexusrag.embeddings.gemini")

class GeminiEmbeddingProvider(EmbeddingProvider):
    """
    Official Google GenAI Python SDK embedding provider (text-embedding-004).
    Implements batching and exponential backoff retry for rate limits.
    """
    def __init__(self, api_key: str = None, model: str = None):
        self._model = model or settings.DEFAULT_EMBEDDING_MODEL
        self._dimension = settings.EMBEDDING_DIMENSION
        key = api_key or settings.GEMINI_API_KEY
        if not key:
            raise ValidationException(
                "Gemini API key is not configured. Set GEMINI_API_KEY in .env to enable embedding generation."
            )
        self.client = genai.Client(api_key=key)

    @property
    def model_name(self) -> str:
        return self._model

    @property
    def dimension(self) -> int:
        return self._dimension

    def _call_with_retry(self, texts: List[str], task_type: str) -> List[List[float]]:
        max_retries = 3
        backoff = 1.0
        
        for attempt in range(max_retries):
            try:
                response = self.client.models.embed_content(
                    model=self._model,
                    contents=texts,
                    config=types.EmbedContentConfig(
                        task_type=task_type
                    )
                )
                embeddings = [e.values for e in response.embeddings]
                return embeddings
            except Exception as e:
                err_msg = str(e)
                if ("429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg) and attempt < max_retries - 1:
                    logger.warning(f"Rate limited by Gemini Embeddings API. Retrying in {backoff:.1f}s...")
                    time.sleep(backoff)
                    backoff *= 2.0
                else:
                    logger.error(f"Failed to generate embeddings via Gemini: {err_msg}")
                    raise

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        
        # Batch requests (max 50 per batch)
        batch_size = 50
        all_embeddings: List[List[float]] = []

        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            batch_vectors = self._call_with_retry(batch, task_type="RETRIEVAL_DOCUMENT")
            all_embeddings.extend(batch_vectors)

        return all_embeddings

    def embed_query(self, text: str) -> List[float]:
        vectors = self._call_with_retry([text], task_type="RETRIEVAL_QUERY")
        return vectors[0]
