from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.workspace import Workspace
from backend.app.models.collection import Collection
from backend.app.models.document import Document
from backend.app.models.session import ResearchSession, Message
from backend.app.schemas.common import ActionStatusResponse
from backend.app.core.dependencies import get_or_create_workspace, verify_csrf
from backend.app.services.storage_service import StorageService
from backend.app.config import settings

router = APIRouter(prefix="/user", tags=["User Data & Privacy"])

@router.post("/export", dependencies=[Depends(verify_csrf)])
def export_user_data(
    workspace: Workspace = Depends(get_or_create_workspace),
    db: Session = Depends(get_db)
):
    """Exports all data belonging strictly to the caller's workspace."""
    collections = db.query(Collection).filter(Collection.workspace_id == workspace.id).all()
    documents = db.query(Document).filter(Document.workspace_id == workspace.id).all()
    sessions = db.query(ResearchSession).filter(ResearchSession.workspace_id == workspace.id).all()

    return {
        "workspace_id": workspace.id,
        "exported_at": workspace.last_active_at.isoformat(),
        "collections": [
            {"id": c.id, "name": c.name, "description": c.description, "created_at": c.created_at.isoformat()}
            for c in collections
        ],
        "documents": [
            {
                "id": d.id,
                "collection_id": d.collection_id,
                "filename": d.filename,
                "file_type": d.file_type,
                "size_bytes": d.file_size_bytes,
                "pages": d.page_count,
                "chunks": d.chunk_count,
                "summary": d.summary,
                "sha256": d.sha256_hash,
                "created_at": d.created_at.isoformat()
            }
            for d in documents
        ],
        "sessions": [
            {
                "id": s.id,
                "title": s.title,
                "created_at": s.created_at.isoformat(),
                "messages": [
                    {"id": m.id, "role": m.role, "content": m.content, "created_at": m.created_at.isoformat()}
                    for m in s.messages
                ]
            }
            for s in sessions
        ]
    }

@router.post("/purge", response_model=ActionStatusResponse, dependencies=[Depends(verify_csrf)])
def purge_user_data(
    response: Response,
    workspace: Workspace = Depends(get_or_create_workspace),
    db: Session = Depends(get_db)
):
    """
    Permanently purges all files, vector indices, database records, and sessions for this workspace,
    and clears the visitor session cookie.
    """
    # 1. Purge physical files on disk
    StorageService.delete_workspace_files(workspace.id)

    # 2. Delete workspace from DB (cascade removes collections, documents, chunks, sessions, workflow runs)
    db.delete(workspace)
    db.commit()

    # 3. Clear cookie
    response.delete_cookie(
        key=settings.SESSION_COOKIE_NAME,
        path="/"
    )

    return ActionStatusResponse(
        success=True,
        message="All workspace data, documents, chunks, and sessions permanently purged."
    )

