from backend.app.rag.parsers.base_parser import BaseParser, ParsedDocument, ExtractedPage
from backend.app.rag.parsers.pdf_parser import PDFParser
from backend.app.rag.parsers.text_parser import TextParser
from backend.app.rag.parsers.markdown_parser import MarkdownParser
from backend.app.core.exceptions import ValidationException

def get_parser_for_file_type(file_type: str) -> BaseParser:
    normalized = file_type.lower().strip().replace(".", "")
    if normalized == "pdf":
        return PDFParser()
    elif normalized in ("txt", "text"):
        return TextParser()
    elif normalized in ("md", "markdown"):
        return MarkdownParser()
    else:
        raise ValidationException(f"Unsupported document format: '{file_type}'. Supported: pdf, txt, md.")

__all__ = [
    "BaseParser",
    "ParsedDocument",
    "ExtractedPage",
    "PDFParser",
    "TextParser",
    "MarkdownParser",
    "get_parser_for_file_type"
]

