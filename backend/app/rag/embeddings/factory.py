from typing import Optional
from backend.app.config import settings
from backend.app.rag.embeddings.base_embeddings import EmbeddingProvider
from backend.app.rag.embeddings.gemini_embeddings import GeminiEmbeddingProvider
from backend.app.rag.embeddings.mock_embeddings import MockEmbeddingProvider

def get_embedding_provider(
    provider_type: Optional[str] = None,
    mock_mode: bool = False
) -> EmbeddingProvider:
    if mock_mode:
        return MockEmbeddingProvider(dimension=settings.EMBEDDING_DIMENSION)

    prov = (provider_type or settings.AI_PROVIDER).lower()
    if prov == "gemini":
        if not settings.GEMINI_API_KEY:
            # Fall back to mock if in development/test and key is absent
            return MockEmbeddingProvider(dimension=settings.EMBEDDING_DIMENSION)
        return GeminiEmbeddingProvider()
    elif prov == "mock":
        return MockEmbeddingProvider(dimension=settings.EMBEDDING_DIMENSION)
    else:
        # Default fallback
        return MockEmbeddingProvider(dimension=settings.EMBEDDING_DIMENSION)

