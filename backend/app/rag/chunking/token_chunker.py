import re
from typing import List
from pydantic import BaseModel
import tiktoken
from backend.app.rag.parsers.base_parser import ParsedDocument, ExtractedPage
from backend.app.config import settings

class RawChunk(BaseModel):
    chunk_index: int
    content: str
    token_count: int
    start_page: int
    end_page: int
    start_char: int
    end_char: int

class TokenChunker:
    """
    Token-aware, sentence-preserving chunker using tiktoken (cl100k_base).
    Preserves page boundaries and records character offsets for interactive passage highlighting.
    """
    def __init__(
        self,
        chunk_size: int = settings.DEFAULT_CHUNK_SIZE,
        chunk_overlap: int = settings.DEFAULT_CHUNK_OVERLAP,
        tokenizer_name: str = "cl100k_base"
    ):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        try:
            self.tokenizer = tiktoken.get_encoding(tokenizer_name)
        except Exception:
            self.tokenizer = tiktoken.get_encoding("cl100k_base")

    def count_tokens(self, text: str) -> int:
        return len(self.tokenizer.encode(text, disallowed_special=()))

    def _split_into_sentences(self, text: str) -> List[str]:
        """Splits text along paragraph breaks or sentence boundaries."""
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        units = []
        for para in paragraphs:
            sentences = re.split(r"(?<=[.?!;])\s+", para)
            for s in sentences:
                s_clean = s.strip()
                if s_clean:
                    units.append(s_clean)
        return units

    def chunk_document(self, doc: ParsedDocument) -> List[RawChunk]:
        """
        Chunks all pages of a parsed document while strictly preserving page boundaries
        and recording character offsets.
        """
        chunks: List[RawChunk] = []
        chunk_index = 0

        for page in doc.pages:
            if not page.text.strip():
                continue

            page_units = self._split_into_sentences(page.text)
            page_char_offset = 0

            current_units: List[str] = []
            current_tokens = 0
            current_start_char = 0
            current_end_char = 0

            for unit in page_units:
                unit_tokens = self.count_tokens(unit)
                unit_start_char = page.text.find(unit, page_char_offset)
                if unit_start_char == -1:
                    unit_start_char = page_char_offset
                unit_end_char = unit_start_char + len(unit)
                page_char_offset = unit_end_char

                # If a single sentence exceeds chunk size, split by tokens
                if unit_tokens > self.chunk_size:
                    if current_units:
                        content_str = " ".join(current_units)
                        chunks.append(
                            RawChunk(
                                chunk_index=chunk_index,
                                content=content_str,
                                token_count=self.count_tokens(content_str),
                                start_page=page.page_number,
                                end_page=page.page_number,
                                start_char=current_start_char,
                                end_char=current_end_char
                            )
                        )
                        chunk_index += 1
                        current_units = []
                        current_tokens = 0

                    tokens = self.tokenizer.encode(unit, disallowed_special=())
                    for i in range(0, len(tokens), max(1, self.chunk_size - self.chunk_overlap)):
                        slice_toks = tokens[i : i + self.chunk_size]
                        slice_text = self.tokenizer.decode(slice_toks).strip()
                        if slice_text:
                            chunks.append(
                                RawChunk(
                                    chunk_index=chunk_index,
                                    content=slice_text,
                                    token_count=len(slice_toks),
                                    start_page=page.page_number,
                                    end_page=page.page_number,
                                    start_char=unit_start_char,
                                    end_char=unit_end_char
                                )
                            )
                            chunk_index += 1
                    continue

                if current_tokens + unit_tokens > self.chunk_size and current_units:
                    content_str = " ".join(current_units)
                    chunks.append(
                        RawChunk(
                            chunk_index=chunk_index,
                            content=content_str,
                            token_count=self.count_tokens(content_str),
                            start_page=page.page_number,
                            end_page=page.page_number,
                            start_char=current_start_char,
                            end_char=current_end_char
                        )
                    )
                    chunk_index += 1

                    # Compute overlap
                    overlap_units = []
                    overlap_tokens = 0
                    for u in reversed(current_units):
                        u_tok = self.count_tokens(u)
                        if overlap_tokens + u_tok <= self.chunk_overlap:
                            overlap_units.insert(0, u)
                            overlap_tokens += u_tok
                        else:
                            break

                    current_units = list(overlap_units)
                    current_tokens = overlap_tokens
                    current_start_char = unit_start_char

                if not current_units:
                    current_start_char = unit_start_char

                current_units.append(unit)
                current_tokens += unit_tokens
                current_end_char = unit_end_char

            # Flush page chunks so boundaries are strictly preserved per page
            if current_units:
                content_str = " ".join(current_units)
                chunks.append(
                    RawChunk(
                        chunk_index=chunk_index,
                        content=content_str,
                        token_count=self.count_tokens(content_str),
                        start_page=page.page_number,
                        end_page=page.page_number,
                        start_char=current_start_char,
                        end_char=current_end_char
                    )
                )
                chunk_index += 1

        return chunks
