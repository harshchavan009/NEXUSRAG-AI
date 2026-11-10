import logging
from typing import Optional
from sqlalchemy.orm import Session
from backend.app.models.document import Document
from backend.app.models.chunk import Chunk
from backend.app.rag.parsers import get_parser_for_file_type
from backend.app.rag.chunking import TokenChunker
from backend.app.rag.embeddings import get_embedding_provider
from backend.app.rag.vector_store import FAISSVectorStore
from backend.app.config import settings

logger = logging.getLogger("nexusrag.ingestion")

class IngestionService:
    @staticmethod
    def generate_document_summary(sample_text: str) -> str:
        """
        Generates a concise one-sentence abstract for the document summary column.
        Uses active LLM if available; otherwise extracts the leading substantive sentence.
        """
        if not sample_text:
            return "No text content available for summary."

        # If Gemini key is available, attempt real generation
        if settings.GEMINI_API_KEY and settings.AI_PROVIDER == "gemini":
            try:
                from google import genai
                client = genai.Client(api_key=settings.GEMINI_API_KEY)
                prompt = (
                    "Summarize the following document excerpt into exactly one concise, factual, objective sentence "
                    "describing its core subject matter:\n\n" + sample_text[:1200]
                )
                res = client.models.generate_content(
                    model=settings.DEFAULT_GENERATION_MODEL,
                    contents=prompt
                )
                if res and res.text:
                    return res.text.strip().replace("\n", " ")
            except Exception as e:
                logger.warning(f"Could not generate summary via Gemini API: {e}. Falling back to leading sentence extraction.")

        # Heuristic fallback: clean leading sentence
        lines = [line.strip() for line in sample_text.splitlines() if line.strip() and not line.startswith("#")]
        if lines:
            first_block = " ".join(lines[:3])
            # Find first period, exclamation or question
            period_idx = first_block.find(". ")
            if period_idx != -1 and period_idx > 20:
                return first_block[: period_idx + 1].strip()
            return (first_block[:140] + "...").strip()

        return "Document content ingested successfully."

    @staticmethod
    def process_document(document_id: str, db: Session, mock_embeddings: bool = False) -> Document:
        """
        Executes end-to-end ingestion pipeline:
        uploaded -> validating -> extracting -> chunking -> embedding -> indexing -> indexed.
        """
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            raise ValueError(f"Document {document_id} not found.")

        try:
            # Stage 1: Validating & Extracting
            doc.status = "extracting"
            doc.error_reason = None
            db.commit()

            parser = get_parser_for_file_type(doc.file_type)
            parsed = parser.parse(doc.storage_path, doc.original_filename)
            doc.page_count = parsed.page_count
            doc.summary = IngestionService.generate_document_summary(parsed.summary_candidate_text)
            db.commit()

            # Stage 2: Chunking
            doc.status = "chunking"
            db.commit()

            chunker = TokenChunker(
                chunk_size=settings.DEFAULT_CHUNK_SIZE,
                chunk_overlap=settings.DEFAULT_CHUNK_OVERLAP
            )
            raw_chunks = chunker.chunk_document(parsed)

            if not raw_chunks:
                raise ValueError("Chunking produced 0 chunks from extracted document text.")

            # If reindexing, clear existing chunks and FAISS vectors first
            existing_chunks = db.query(Chunk).filter(Chunk.document_id == doc.id).all()
            if existing_chunks:
                vector_store = FAISSVectorStore(workspace_id=doc.workspace_id)
                vector_store.remove_vectors([c.id for c in existing_chunks])
                for c in existing_chunks:
                    db.delete(c)
                db.commit()

            # Stage 3: Embedding
            doc.status = "embedding"
            db.commit()

            embedding_provider = get_embedding_provider(mock_mode=mock_embeddings)
            chunk_texts = [rc.content for rc in raw_chunks]
            embeddings = embedding_provider.embed_documents(chunk_texts)

            if len(embeddings) != len(raw_chunks):
                raise ValueError(f"Embedding count ({len(embeddings)}) mismatch with chunk count ({len(raw_chunks)}).")

            # Stage 4: Indexing in DB & FAISS
            doc.status = "indexing"
            db.commit()

            db_chunks: list[Chunk] = []
            for rc in raw_chunks:
                c = Chunk(
                    document_id=doc.id,
                    workspace_id=doc.workspace_id,
                    chunk_index=rc.chunk_index,
                    content=rc.content,
                    token_count=rc.token_count,
                    start_page=rc.start_page,
                    end_page=rc.end_page,
                    start_char=rc.start_char,
                    end_char=rc.end_char,
                    embedding_model=embedding_provider.model_name
                )
                db.add(c)
                db_chunks.append(c)

            db.commit()
            for c in db_chunks:
                db.refresh(c)

            # Insert vectors into FAISS with exact integer Chunk IDs
            vector_store = FAISSVectorStore(
                workspace_id=doc.workspace_id,
                dimension=embedding_provider.dimension,
                model_name=embedding_provider.model_name
            )
            chunk_ids = [c.id for c in db_chunks]
            vector_store.add_vectors(chunk_ids=chunk_ids, vectors=embeddings)

            # Stage 5: Finalized
            doc.chunk_count = len(db_chunks)
            doc.status = "indexed"
            doc.error_reason = None
            db.commit()
            db.refresh(doc)
            logger.info(f"Document {doc.filename} ({doc.id}) successfully indexed into FAISS ({len(db_chunks)} chunks).")
            return doc

        except Exception as e:
            logger.error(f"Ingestion failed for document {doc.id}: {str(e)}", exc_info=True)
            doc.status = "failed"
            doc.error_reason = str(e)
            db.commit()
            db.refresh(doc)
            raise
