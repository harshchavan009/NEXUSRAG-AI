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
            # Allow mock provider only in automated pytest test environment when no external key is available
            if settings.ENVIRONMENT == "testing":
                return MockEmbeddingProvider(dimension=settings.EMBEDDING_DIMENSION)
            raise ValueError(
                "Gemini API key is not configured. Set GEMINI_API_KEY in your environment to enable vector embeddings."
            )
        return GeminiEmbeddingProvider()
    elif prov == "mock":
        return MockEmbeddingProvider(dimension=settings.EMBEDDING_DIMENSION)
    else:
        raise ValueError(f"Unsupported embedding provider: '{prov}'. Supported providers: 'gemini', 'mock'.")

