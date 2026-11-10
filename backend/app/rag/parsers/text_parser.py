from pathlib import Path
from backend.app.rag.parsers.base_parser import BaseParser, ParsedDocument, ExtractedPage
from backend.app.core.exceptions import ValidationException

class TextParser(BaseParser):
    def parse(self, file_path: str, original_filename: str) -> ParsedDocument:
        path = Path(file_path)
        if not path.exists():
            raise ValidationException(f"Text file not found at {file_path}")

        raw_bytes = path.read_bytes()
        if len(raw_bytes) == 0:
            raise ValidationException("Text file is empty (0 bytes).")

        # Encoding fallback detection
        text = None
        for enc in ("utf-8", "utf-8-sig", "latin-1", "cp1252"):
            try:
                text = raw_bytes.decode(enc)
                break
            except UnicodeDecodeError:
                continue

        if text is None:
            raise ValidationException("Unable to decode text file. Ensure it is encoded in UTF-8 or standard Latin-1.")

        cleaned_text = text.strip()
        if not cleaned_text:
            raise ValidationException("Text file contains only whitespace.")

        # For text documents, treat as page 1
        page = ExtractedPage(
            page_number=1,
            text=cleaned_text,
            char_count=len(cleaned_text)
        )

        return ParsedDocument(
            filename=original_filename,
            file_type="txt",
            page_count=1,
            total_chars=len(cleaned_text),
            pages=[page],
            summary_candidate_text=cleaned_text[:1500]
        )

