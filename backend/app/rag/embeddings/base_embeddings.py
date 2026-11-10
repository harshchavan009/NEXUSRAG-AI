from abc import ABC, abstractmethod
from typing import List

class EmbeddingProvider(ABC):
    @property
    @abstractmethod
    def model_name(self) -> str:
        """Returns the canonical model name identifier."""
        pass

    @property
    @abstractmethod
    def dimension(self) -> int:
        """Returns the embedding vector dimension."""
        pass

    @abstractmethod
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Generates embedding vectors for a list of document chunk texts."""
        pass

    @abstractmethod
    def embed_query(self, text: str) -> List[float]:
        """Generates an embedding vector for a single search query."""
        pass

