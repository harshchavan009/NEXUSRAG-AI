from pathlib import Path
import fitz  # PyMuPDF
from backend.app.rag.parsers.base_parser import BaseParser, ParsedDocument, ExtractedPage
from backend.app.core.exceptions import ValidationException

class PDFParser(BaseParser):
    def parse(self, file_path: str, original_filename: str) -> ParsedDocument:
        path = Path(file_path)
        if not path.exists():
            raise ValidationException(f"PDF file not found at {file_path}")

        try:
            doc = fitz.open(file_path)
        except Exception as e:
            raise ValidationException(f"Failed to open PDF document: {str(e)}")

        if doc.is_encrypted:
            doc.close()
            raise ValidationException("Password-protected PDF files are not supported. Please remove encryption before uploading.")

        page_count = len(doc)
        if page_count == 0:
            doc.close()
            raise ValidationException("PDF document has 0 pages.")

        extracted_pages = []
        total_chars = 0
        all_text_snippets = []

        for idx, page in enumerate(doc):
            page_num = idx + 1
            # Extract plain text preserving layout
            text = page.get_text("text").strip()
            # Normalize whitespace
            lines = [line.strip() for line in text.splitlines() if line.strip()]
            normalized_text = "\n".join(lines)
            
            char_count = len(normalized_text)
            total_chars += char_count
            
            if normalized_text:
                all_text_snippets.append(normalized_text)

            extracted_pages.append(
                ExtractedPage(
                    page_number=page_num,
                    text=normalized_text,
                    char_count=char_count
                )
            )

        doc.close()

        # Scanned PDF check: if characters are virtually nonexistent across all pages
        if total_chars < 50:
            raise ValidationException(
                "Scanned document detected. Optical Character Recognition (OCR) is not currently enabled. "
                "Please upload a PDF with an embedded selectable text layer."
            )

        full_sample = "\n\n".join(all_text_snippets)
        summary_candidate = full_sample[:1500].strip()

        return ParsedDocument(
            filename=original_filename,
            file_type="pdf",
            page_count=page_count,
            total_chars=total_chars,
            pages=extracted_pages,
            summary_candidate_text=summary_candidate
        )

