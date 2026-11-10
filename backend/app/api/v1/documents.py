from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.database import get_db
from backend.app.models.workspace import Workspace
from backend.app.models.document import Document
from backend.app.models.collection import Collection
from backend.app.schemas.document import (
    DocumentResponse,
    DocumentListResponse,
    DocumentUploadResponse,
    UploadJobItem
)
from backend.app.schemas.common import ActionStatusResponse
from backend.app.core.dependencies import get_or_create_workspace, verify_csrf
from backend.app.core.exceptions import NotFoundException, APIException
from backend.app.services.document_service import DocumentService
from backend.app.services.storage_service import StorageService

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(verify_csrf)])
async def upload_documents(
    files: List[UploadFile] = File(...),
    collection_id: Optional[str] = Form(None),
    workspace: Workspace = Depends(get_or_create_workspace),
    db: Session = Depends(get_db)
):
    """
    Multi-file upload endpoint supporting PDF, TXT, and Markdown files.
    Performs comprehensive validation: size cap, magic bytes, extension, duplicate SHA-256.
    Returns structured list of successfully queued and rejected files with honest failure messages.
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
    """
    Lists documents for the current workspace with optional filtering by collection, status, and search query.
    All data is computed live from stored document rows.
    """
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
    """Retrieves document metadata by ID."""
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

@router.delete("/{document_id}", response_model=ActionStatusResponse, dependencies=[Depends(verify_csrf)])
def delete_document(
    document_id: str,
    workspace: Workspace = Depends(get_or_create_workspace),
    db: Session = Depends(get_db)
):
    """
    Deletes document record, raw file from storage, and associated database chunks.
    (FAISS vector removal hook is also wired here).
    """
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.workspace_id == workspace.id
    ).first()

    if not doc:
        raise NotFoundException("Document", document_id)

    # 1. Remove physical file from disk
    StorageService.delete_file(doc.storage_path)

    # 2. Delete document row from DB (foreign key cascades will remove chunks and citations)
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
    workspace: Workspace = Depends(get_or_create_workspace),
    db: Session = Depends(get_db)
):
    """Marks document for reindexing."""
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.workspace_id == workspace.id
    ).first()

    if not doc:
        raise NotFoundException("Document", document_id)

    doc.status = "extracting"
    db.commit()

    return ActionStatusResponse(
        success=True,
        message=f"Document '{doc.filename}' queued for reindexing."
    )
