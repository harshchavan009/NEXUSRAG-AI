from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.workspace import Workspace
from backend.app.models.document import Document
from backend.app.models.collection import Collection
from backend.app.models.chunk import Chunk
from backend.app.models.session import ResearchSession
from backend.app.schemas.workspace import WorkspaceResponse, WorkspaceStatsResponse
from backend.app.core.dependencies import get_or_create_workspace
from backend.app.core.security import generate_csrf_token
from backend.app.config import settings

router = APIRouter(prefix="/workspaces", tags=["Workspaces"])

@router.post("", response_model=WorkspaceResponse)
@router.post("/", response_model=WorkspaceResponse)
def provision_or_get_workspace(
    response: Response,
    workspace: Workspace = Depends(get_or_create_workspace),
    db: Session = Depends(get_db)
):
    """Provisions or returns the isolated visitor workspace and sets the secure session cookie."""
    # Ensure cookie is set
    response.set_cookie(
        key=settings.SESSION_COOKIE_NAME,
        value=workspace.session_token,
        max_age=settings.SESSION_MAX_AGE_SECONDS,
        httponly=True,
        secure=settings.SESSION_COOKIE_SECURE,
        samesite=settings.SESSION_COOKIE_SAMESITE,
        path="/"
    )
    
    # Calculate live stats
    doc_count = db.query(Document).filter(Document.workspace_id == workspace.id).count()
    coll_count = db.query(Collection).filter(Collection.workspace_id == workspace.id).count()
    chunk_count = db.query(Chunk).filter(Chunk.workspace_id == workspace.id).count()
    session_count = db.query(ResearchSession).filter(ResearchSession.workspace_id == workspace.id).count()

    # Issue CSRF token in header
    response.headers["X-CSRF-Token"] = generate_csrf_token(workspace.session_token)

    return WorkspaceResponse(
        id=workspace.id,
        created_at=workspace.created_at,
        last_active_at=workspace.last_active_at,
        stats=WorkspaceStatsResponse(
            document_count=doc_count,
            collection_count=coll_count,
            chunk_count=chunk_count,
            session_count=session_count
        )
    )

@router.get("/current", response_model=WorkspaceResponse)
def get_current_workspace_info(
    response: Response,
    workspace: Workspace = Depends(get_or_create_workspace),
    db: Session = Depends(get_db)
):
    """Retrieves current workspace details and live-calculated metrics."""
    doc_count = db.query(Document).filter(Document.workspace_id == workspace.id).count()
    coll_count = db.query(Collection).filter(Collection.workspace_id == workspace.id).count()
    chunk_count = db.query(Chunk).filter(Chunk.workspace_id == workspace.id).count()
    session_count = db.query(ResearchSession).filter(ResearchSession.workspace_id == workspace.id).count()

    response.headers["X-CSRF-Token"] = generate_csrf_token(workspace.session_token)

    return WorkspaceResponse(
        id=workspace.id,
        created_at=workspace.created_at,
        last_active_at=workspace.last_active_at,
        stats=WorkspaceStatsResponse(
            document_count=doc_count,
            collection_count=coll_count,
            chunk_count=chunk_count,
            session_count=session_count
        )
    )

