import pytest
import fitz
from pathlib import Path
from backend.app.rag.parsers import PDFParser, TextParser, MarkdownParser, get_parser_for_file_type
from backend.app.core.exceptions import ValidationException

def test_text_parser_utf8_and_latin1(tmp_path):
    parser = TextParser()

    # 1. UTF-8 file
    txt_file = tmp_path / "sample.txt"
    txt_file.write_text("This is an artificial intelligence research document.\nIt covers neural retrieval pipelines.", encoding="utf-8")
    
    parsed = parser.parse(str(txt_file), "sample.txt")
    assert parsed.page_count == 1
    assert parsed.file_type == "txt"
    assert "artificial intelligence" in parsed.pages[0].text
    assert parsed.total_chars > 50

    # 2. Empty file rejection
    empty_file = tmp_path / "empty.txt"
    empty_file.write_bytes(b"")
    with pytest.raises(ValidationException) as exc:
        parser.parse(str(empty_file), "empty.txt")
    assert "empty" in str(exc.value).lower()

def test_markdown_parser(tmp_path):
    parser = MarkdownParser()
    md_file = tmp_path / "architecture.md"
    md_file.write_text("# Overview\n\nNexusRAG is a retrieval engine.\n\n## Features\n- FAISS indexing\n- LangGraph DAG", encoding="utf-8")

    parsed = parser.parse(str(md_file), "architecture.md")
    assert parsed.page_count == 1
    assert parsed.file_type == "md"
    assert "# Overview" in parsed.pages[0].text
    assert "FAISS indexing" in parsed.pages[0].text

def test_pdf_parser_valid_multi_page(tmp_path):
    # Create a real 2-page PDF using PyMuPDF
    pdf_path = tmp_path / "valid_document.pdf"
    doc = fitz.open()
    
    page1 = doc.new_page()
    page1.insert_text((50, 72), "Page One: Introduction to Retrieval-Augmented Generation workflows.")
    
    page2 = doc.new_page()
    page2.insert_text((50, 72), "Page Two: Vector databases, inner product metrics, and grounded citations.")
    
    doc.save(str(pdf_path))
    doc.close()

    parser = PDFParser()
    parsed = parser.parse(str(pdf_path), "valid_document.pdf")
    
    assert parsed.page_count == 2
    assert parsed.file_type == "pdf"
    assert parsed.pages[0].page_number == 1
    assert "Page One" in parsed.pages[0].text
    assert parsed.pages[1].page_number == 2
    assert "Page Two" in parsed.pages[1].text
    assert len(parsed.summary_candidate_text) > 20

def test_pdf_parser_scanned_ocr_detection(tmp_path):
    # Create a blank PDF (simulating scanned image without text layer)
    pdf_path = tmp_path / "scanned_doc.pdf"
    doc = fitz.open()
    doc.new_page()  # Blank page with 0 text
    doc.save(str(pdf_path))
    doc.close()

    parser = PDFParser()
    with pytest.raises(ValidationException) as exc:
        parser.parse(str(pdf_path), "scanned_doc.pdf")
    
    # Must report honest OCR unavailable message
    assert "scanned document detected" in str(exc.value).lower()
    assert "ocr" in str(exc.value).lower()
    assert "not currently enabled" in str(exc.value).lower()

def test_parser_factory():
    assert isinstance(get_parser_for_file_type("pdf"), PDFParser)
    assert isinstance(get_parser_for_file_type(".txt"), TextParser)
    assert isinstance(get_parser_for_file_type("markdown"), MarkdownParser)
    
    with pytest.raises(ValidationException):
        get_parser_for_file_type("docx")
