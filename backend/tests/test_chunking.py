from backend.app.rag.chunking import TokenChunker
from backend.app.rag.parsers.base_parser import ParsedDocument, ExtractedPage

def test_token_chunker_basic_and_token_count():
    chunker = TokenChunker(chunk_size=100, chunk_overlap=20)
    
    text = (
        "Retrieval-Augmented Generation (RAG) is an architectural pattern that optimizes the output of large language models. "
        "It references an authoritative knowledge base outside of its training data sources before generating a response. "
        "LLMs are trained on vast volumes of data and use billions of parameters to generate original output. "
        "However, LLMs can be unpredictable, hallucinating facts or presenting outdated information."
    )
    
    doc = ParsedDocument(
        filename="rag_guide.txt",
        file_type="txt",
        page_count=1,
        total_chars=len(text),
        pages=[ExtractedPage(page_number=1, text=text, char_count=len(text))],
        summary_candidate_text=text[:200]
    )

    chunks = chunker.chunk_document(doc)
    assert len(chunks) >= 1
    for c in chunks:
        assert c.token_count <= 100
        assert c.start_page == 1
        assert c.end_page == 1
        assert c.start_char >= 0
        assert c.end_char > c.start_char
        # The slice of text matching offsets
        assert len(c.content) > 10

def test_token_chunker_multi_page_offsets():
    chunker = TokenChunker(chunk_size=15, chunk_overlap=3)
    
    page1_text = "Chapter 1 discusses the fundamental mathematics of linear vector spaces and projections."
    page2_text = "Chapter 2 covers neural network embeddings and high-dimensional cosine similarity metrics."

    doc = ParsedDocument(
        filename="book.pdf",
        file_type="pdf",
        page_count=2,
        total_chars=len(page1_text) + len(page2_text),
        pages=[
            ExtractedPage(page_number=1, text=page1_text, char_count=len(page1_text)),
            ExtractedPage(page_number=2, text=page2_text, char_count=len(page2_text))
        ],
        summary_candidate_text=page1_text
    )

    chunks = chunker.chunk_document(doc)
    assert len(chunks) >= 2
    
    # Verify page tracking
    page_numbers = {c.start_page for c in chunks}
    assert 1 in page_numbers
    assert 2 in page_numbers
