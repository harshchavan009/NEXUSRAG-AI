from pathlib import Path
from backend.app.rag.parsers.base_parser import BaseParser, ParsedDocument, ExtractedPage
from backend.app.core.exceptions import ValidationException

class MarkdownParser(BaseParser):
    def parse(self, file_path: str, original_filename: str) -> ParsedDocument:
        path = Path(file_path)
        if not path.exists():
            raise ValidationException(f"Markdown file not found at {file_path}")

        raw_bytes = path.read_bytes()
        if len(raw_bytes) == 0:
            raise ValidationException("Markdown file is empty (0 bytes).")

        try:
            text = raw_bytes.decode("utf-8")
        except UnicodeDecodeError:
            try:
                text = raw_bytes.decode("latin-1")
            except UnicodeDecodeError:
                raise ValidationException("Markdown file could not be decoded. Please ensure UTF-8 encoding.")

        cleaned_text = text.strip()
        if not cleaned_text:
            raise ValidationException("Markdown file contains only whitespace.")

        page = ExtractedPage(
            page_number=1,
            text=cleaned_text,
            char_count=len(cleaned_text)
        )

        return ParsedDocument(
            filename=original_filename,
            file_type="md",
            page_count=1,
            total_chars=len(cleaned_text),
            pages=[page],
            summary_candidate_text=cleaned_text[:1500]
        )
