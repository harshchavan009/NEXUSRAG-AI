from abc import ABC, abstractmethod
from typing import List, Optional
from pydantic import BaseModel

class ExtractedPage(BaseModel):
    page_number: int  # 1-indexed
    text: str
    char_count: int

class ParsedDocument(BaseModel):
    filename: str
    file_type: str
    page_count: int
    total_chars: int
    pages: List[ExtractedPage]
    summary_candidate_text: str  # First ~1000 characters for generating summary

class BaseParser(ABC):
    @abstractmethod
    def parse(self, file_path: str, original_filename: str) -> ParsedDocument:
        """Parses document from disk into normalized structured pages."""
        pass
