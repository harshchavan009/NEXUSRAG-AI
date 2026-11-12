from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, status, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.workspace import Workspace
from backend.app.models.document import Document
from backend.app.models.collection import Collection
from backend.app.models.chunk import Chunk
from backend.app.schemas.document import (
    DocumentResponse,
    DocumentListResponse,
    DocumentUploadResponse,
    UploadJobItem,
    DocumentUpdate,
    BulkMoveRequest
)
from backend.app.schemas.common import ActionStatusResponse
from backend.app.core.dependencies import get_or_create_workspace, verify_csrf
from backend.app.core.rate_limit import check_upload_rate_limit
from backend.app.core.exceptions import NotFoundException, APIException, DuplicateException
from backend.app.services.document_service import DocumentService
from backend.app.services.storage_service import StorageService
from backend.app.services.ingestion_service import IngestionService
from backend.app.rag.vector_store import FAISSVectorStore

router = APIRouter(prefix="/documents", tags=["Documents"])

def _run_ingestion_background(document_id: str):
    from backend.app.database import SessionLocal
    db = SessionLocal()
    try:
        IngestionService.process_document(document_id, db)
    except Exception as e:
        # Avoid crashing background task threads
        pass
    finally:
        db.close()

@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(verify_csrf), Depends(check_upload_rate_limit)])
async def upload_documents(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    collection_id: Optional[str] = Form(None),
    workspace: Workspace = Depends(get_or_create_workspace),
    db: Session = Depends(get_db)
):
    """
    Multi-file upload endpoint supporting PDF, TXT, and Markdown files.
    Performs comprehensive validation: size cap, magic bytes, extension, duplicate SHA-256.
    Triggers automated parsing, chunking, embedding, and FAISS indexing pipeline.
    """
    uploaded_items: List[UploadJobItem] = []
    failed_items: List[UploadJobItem] = []

    for file in files:
        try:
            content = await file.read()
            doc = DocumentService.handle_upload(
                workspace_id=workspace.id,
                filename=file.filename or "unnamed_document",
                content=content,
                collection_id=collection_id,
                db=db
            )
            # Queue background ingestion task
            background_tasks.add_task(_run_ingestion_background, doc.id)

            uploaded_items.append(
                UploadJobItem(
                    document_id=doc.id,
                    filename=doc.filename,
                    file_size_bytes=doc.file_size_bytes,
                    status=doc.status,
                    message="Document uploaded successfully and queued for extraction."
                )
            )
        except APIException as e:
            failed_items.append(
                UploadJobItem(
                    document_id="",
                    filename=file.filename or "unnamed",
                    file_size_bytes=len(content) if 'content' in locals() else 0,
                    status="failed",
                    message=e.message
                )
            )
        except Exception as e:
            failed_items.append(
                UploadJobItem(
                    document_id="",
                    filename=file.filename or "unnamed",
                    file_size_bytes=len(content) if 'content' in locals() else 0,
                    status="failed",
                    message=f"Upload processing failed: {str(e)}"
                )
            )

    return DocumentUploadResponse(
        uploaded=uploaded_items,
        failed=failed_items
    )

@router.post("/sample", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(verify_csrf)])
async def load_sample_documents(
    background_tasks: BackgroundTasks,
    workspace: Workspace = Depends(get_or_create_workspace),
    db: Session = Depends(get_db)
):
    """
    One-click ingestion of authentic sample research documents.
    Loads reference texts into the current workspace for instant query evaluation.
    """
    from pathlib import Path
    sample_dir = Path("data/sample_documents")
    if not sample_dir.exists():
        sample_dir = Path(__file__).resolve().parents[4] / "data" / "sample_documents"

    sample_files = sorted(list(sample_dir.glob("*.*")))
    uploaded_items: List[UploadJobItem] = []
    failed_items: List[UploadJobItem] = []

    for sample_path in sample_files:
        try:
            content = sample_path.read_bytes()
            doc = DocumentService.handle_upload(
                workspace_id=workspace.id,
                filename=sample_path.name,
                content=content,
                collection_id=None,
                db=db
            )
            background_tasks.add_task(_run_ingestion_background, doc.id)
            uploaded_items.append(
                UploadJobItem(
                    document_id=doc.id,
                    filename=doc.filename,
                    file_size_bytes=doc.file_size_bytes,
                    status=doc.status,
                    message="Sample document ingested successfully."
                )
            )
        except DuplicateException:
            existing = db.query(Document).filter(
                Document.workspace_id == workspace.id,
                Document.filename == sample_path.name
            ).first()
            if existing:
                uploaded_items.append(
                    UploadJobItem(
                        document_id=existing.id,
                        filename=existing.filename,
                        file_size_bytes=existing.file_size_bytes,
                        status=existing.status,
                        message="Sample document already loaded in this workspace."
                    )
                )
        except Exception as e:
            failed_items.append(
                UploadJobItem(
                    document_id="",
                    filename=sample_path.name,
                    file_size_bytes=0,
                    status="failed",
                    message=str(e)
                )
            )

    return DocumentUploadResponse(
        uploaded=uploaded_items,
        failed=failed_items
    )

@router.get("", response_model=DocumentListResponse)
@router.get("/", response_model=DocumentListResponse)
def list_documents(
    collection_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    workspace: Workspace = Depends(get_or_create_workspace),
    db: Session = Depends(get_db)
):
    """Lists documents for current workspace with live counts, summaries, and statuses."""
    query = db.query(Document, Collection.name.label("collection_name")).outerjoin(
        Collection, Document.collection_id == Collection.id
    ).filter(Document.workspace_id == workspace.id)

    if collection_id:
        query = query.filter(Document.collection_id == collection_id)
        
    if status:
        query = query.filter(Document.status == status)

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            (Document.filename.ilike(search_pattern)) | 
            (Document.original_filename.ilike(search_pattern))
        )

    total = query.count()
    offset = (page - 1) * page_size
    results = query.order_by(Document.created_at.desc()).offset(offset).limit(page_size).all()

    docs: List[DocumentResponse] = []
    for doc, coll_name in results:
        docs.append(
            DocumentResponse(
                id=doc.id,
                workspace_id=doc.workspace_id,
                collection_id=doc.collection_id,
                collection_name=coll_name,
                filename=doc.filename,
                original_filename=doc.original_filename,
                file_type=doc.file_type,
                file_size_bytes=doc.file_size_bytes,
                page_count=doc.page_count,
                chunk_count=doc.chunk_count,
                summary=doc.summary,
                status=doc.status,
                error_reason=doc.error_reason,
                sha256_hash=doc.sha256_hash,
                created_at=doc.created_at,
                updated_at=doc.updated_at
            )
        )

    return DocumentListResponse(documents=docs, total=total)

@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: str,
    workspace: Workspace = Depends(get_or_create_workspace),
    db: Session = Depends(get_db)
):
    """Retrieves document details."""
    result = db.query(Document, Collection.name.label("collection_name")).outerjoin(
        Collection, Document.collection_id == Collection.id
    ).filter(
        Document.id == document_id,
        Document.workspace_id == workspace.id
    ).first()

    if not result:
        raise NotFoundException("Document", document_id)

    doc, coll_name = result
    return DocumentResponse(
        id=doc.id,
        workspace_id=doc.workspace_id,
        collection_id=doc.collection_id,
        collection_name=coll_name,
        filename=doc.filename,
        original_filename=doc.original_filename,
        file_type=doc.file_type,
        file_size_bytes=doc.file_size_bytes,
        page_count=doc.page_count,
        chunk_count=doc.chunk_count,
        summary=doc.summary,
        status=doc.status,
        error_reason=doc.error_reason,
        sha256_hash=doc.sha256_hash,
        created_at=doc.created_at,
        updated_at=doc.updated_at
    )

@router.get("/{document_id}/file")
@router.get("/{document_id}/export")
def get_document_file(
    document_id: str,
    workspace: Workspace = Depends(get_or_create_workspace),
    db: Session = Depends(get_db)
):
    """Streams the raw physical document file with tenant isolation and correct media type."""
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.workspace_id == workspace.id
    ).first()

    if not doc:
        raise NotFoundException("Document", document_id)

    path = Path(doc.storage_path)
    if not path.exists() or not path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Physical file for document {document_id} was not found on disk."
        )

    media_type = "application/pdf"
    if doc.file_type == "md":
        media_type = "text/markdown"
    elif doc.file_type == "txt":
        media_type = "text/plain"

    return FileResponse(
        path=str(path),
        media_type=media_type,
        filename=doc.original_filename
    )

@router.get("/{document_id}/chunks")
def get_document_chunks(
    document_id: str,
    workspace: Workspace = Depends(get_or_create_workspace),
    db: Session = Depends(get_db)
):
    """Retrieves all parsed text chunks for a document, ordered by sequential chunk index."""
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.workspace_id == workspace.id
    ).first()

    if not doc:
        raise NotFoundException("Document", document_id)

    chunks = db.query(Chunk).filter(
        Chunk.document_id == document_id
    ).order_by(Chunk.chunk_index.asc()).all()

    return {
        "document_id": doc.id,
        "filename": doc.original_filename,
        "total_chunks": len(chunks),
        "chunks": [
            {
                "id": c.id,
                "chunk_index": c.chunk_index,
                "page_number": c.page_number,
                "char_start": c.char_start,
                "char_end": c.char_end,
                "token_count": c.token_count,
                "content": c.content,
            }
            for c in chunks
        ]
    }

@router.patch("/{document_id}", response_model=DocumentResponse, dependencies=[Depends(verify_csrf)])
def update_document(
    document_id: str,
    data: DocumentUpdate,
    workspace: Workspace = Depends(get_or_create_workspace),
    db: Session = Depends(get_db)
):
    """Updates document metadata, including collection assignment."""
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.workspace_id == workspace.id
    ).first()
    if not doc:
        raise NotFoundException("Document", document_id)

    coll_name = None
    if data.collection_id:
        coll = db.query(Collection).filter(
            Collection.id == data.collection_id,
            Collection.workspace_id == workspace.id
        ).first()
        if not coll:
            raise NotFoundException("Collection", data.collection_id)
        doc.collection_id = coll.id
        coll_name = coll.name
    else:
        doc.collection_id = None

    db.commit()
    db.refresh(doc)

    return DocumentResponse(
        id=doc.id,
        workspace_id=doc.workspace_id,
        collection_id=doc.collection_id,
        collection_name=coll_name,
        filename=doc.filename,
        original_filename=doc.original_filename,
        file_type=doc.file_type,
        file_size_bytes=doc.file_size_bytes,
        page_count=doc.page_count,
        chunk_count=doc.chunk_count,
        summary=doc.summary,
        status=doc.status,
        error_reason=doc.error_reason,
        sha256_hash=doc.sha256_hash,
        created_at=doc.created_at,
        updated_at=doc.updated_at
    )

@router.post("/bulk-move", response_model=ActionStatusResponse, dependencies=[Depends(verify_csrf)])
def bulk_move_documents(
    data: BulkMoveRequest,
    workspace: Workspace = Depends(get_or_create_workspace),
    db: Session = Depends(get_db)
):
    """Assigns multiple documents to a target collection (or unassigns if collection_id is None)."""
    coll_id = None
    coll_name = "Unassigned"
    if data.collection_id:
        coll = db.query(Collection).filter(
            Collection.id == data.collection_id,
            Collection.workspace_id == workspace.id
        ).first()
        if not coll:
            raise NotFoundException("Collection", data.collection_id)
        coll_id = coll.id
        coll_name = coll.name

    docs = db.query(Document).filter(
        Document.id.in_(data.document_ids),
        Document.workspace_id == workspace.id
    ).all()

    for doc in docs:
        doc.collection_id = coll_id

    db.commit()

    return ActionStatusResponse(
        success=True,
        message=f"Moved {len(docs)} documents to '{coll_name}'."
    )

@router.delete("/{document_id}", response_model=ActionStatusResponse, dependencies=[Depends(verify_csrf)])
def delete_document(
    document_id: str,
    workspace: Workspace = Depends(get_or_create_workspace),
    db: Session = Depends(get_db)
):
    """
    Deletes document record, raw file from storage, database chunks,
    and removes all associated vectors from FAISS index.
    """
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.workspace_id == workspace.id
    ).first()

    if not doc:
        raise NotFoundException("Document", document_id)

    # 1. Fetch chunk IDs to remove from FAISS
    chunks = db.query(Chunk.id).filter(Chunk.document_id == doc.id).all()
    chunk_ids = [c[0] for c in chunks]

    if chunk_ids:
        try:
            vector_store = FAISSVectorStore(workspace_id=workspace.id)
            vector_store.remove_vectors(chunk_ids)
        except Exception as e:
            pass

    # 2. Remove physical file from disk
    StorageService.delete_file(doc.storage_path)

    # 3. Delete document row from DB (foreign key cascades will remove chunks and citations)
    filename = doc.filename
    db.delete(doc)
    db.commit()

    return ActionStatusResponse(
        success=True,
        message=f"Document '{filename}' deleted successfully from workspace."
    )

@router.post("/{document_id}/reindex", response_model=ActionStatusResponse, dependencies=[Depends(verify_csrf)])
def reindex_document(
    document_id: str,
    background_tasks: BackgroundTasks,
    workspace: Workspace = Depends(get_or_create_workspace),
    db: Session = Depends(get_db)
):
    """Reindexes document: re-parses text, creates new chunks, and re-embeds into FAISS."""
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.workspace_id == workspace.id
    ).first()

    if not doc:
        raise NotFoundException("Document", document_id)

    background_tasks.add_task(_run_ingestion_background, doc.id)

    return ActionStatusResponse(
        success=True,
        message=f"Document '{doc.filename}' queued for reindexing."
    )
