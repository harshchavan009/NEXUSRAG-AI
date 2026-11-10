from typing import List, Optional
from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.database import get_db
from backend.app.models.workspace import Workspace
from backend.app.models.session import ResearchSession, Message
from backend.app.models.citation import Citation
from backend.app.schemas.query import QueryRequest, QueryResponse, CitationResponse
from backend.app.schemas.session import (
    SessionCreate,
    SessionResponse,
    SessionDetailResponse,
    MessageResponse
)
from backend.app.schemas.common import ActionStatusResponse
from backend.app.core.dependencies import get_or_create_workspace, verify_csrf
from backend.app.core.rate_limit import check_query_rate_limit
from backend.app.core.exceptions import NotFoundException
from backend.app.services.rag_service import RAGService

router = APIRouter(tags=["Query & Research Sessions"])

# --- RAG Query Endpoints ---

@router.post(
    "/query",
    response_model=QueryResponse,
    dependencies=[Depends(verify_csrf), Depends(check_query_rate_limit)]
)
def query_rag(
    payload: QueryRequest,
    workspace: Workspace = Depends(get_or_create_workspace),
    db: Session = Depends(get_db)
):
    """
    Executes a synchronous RAG query through the 9-node LangGraph state machine.
    Returns grounded answer, citations, and execution telemetry.
    """
    return RAGService.execute_query(
        db=db,
        workspace_id=workspace.id,
        query=payload.query,
        session_id=payload.session_id,
        scope_collection_ids=payload.scope.collection_ids,
        scope_document_ids=payload.scope.document_ids,
        top_k=payload.top_k
    )

@router.post(
    "/query/stream",
    dependencies=[Depends(verify_csrf), Depends(check_query_rate_limit)]
)
async def query_rag_stream(
    payload: QueryRequest,
    workspace: Workspace = Depends(get_or_create_workspace)
):
    """
    Executes RAG query asynchronously, streaming Server-Sent Events (SSE) in real time:
    - event: stage (node transitions)
    - event: token (streaming answer deltas)
    - event: final (answer, citations, telemetry)
    - event: error
    """
    generator = RAGService.execute_query_stream(
        workspace_id=workspace.id,
        query=payload.query,
        session_id=payload.session_id,
        scope_collection_ids=payload.scope.collection_ids,
        scope_document_ids=payload.scope.document_ids,
        top_k=payload.top_k
    )
    return StreamingResponse(
        generator,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

# --- Research Session Management Endpoints ---

@router.get("/sessions", response_model=List[SessionResponse])
def list_sessions(
    workspace: Workspace = Depends(get_or_create_workspace),
    db: Session = Depends(get_db)
):
    """Lists all research sessions in the authenticated workspace."""
    sessions = (
        db.query(
            ResearchSession,
            func.count(Message.id).label("message_count")
        )
        .outerjoin(Message, ResearchSession.id == Message.session_id)
        .filter(ResearchSession.workspace_id == workspace.id)
        .group_by(ResearchSession.id)
        .order_by(ResearchSession.updated_at.desc())
        .all()
    )

    result = []
    for s, count in sessions:
        result.append(
            SessionResponse(
                id=s.id,
                workspace_id=s.workspace_id,
                title=s.title,
                created_at=s.created_at,
                updated_at=s.updated_at,
                message_count=count or 0
            )
        )
    return result

@router.post(
    "/sessions",
    response_model=SessionResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(verify_csrf)]
)
def create_session(
    payload: SessionCreate,
    workspace: Workspace = Depends(get_or_create_workspace),
    db: Session = Depends(get_db)
):
    """Explicitly provisions a new research session."""
    session = ResearchSession(
        workspace_id=workspace.id,
        title=payload.title.strip() if payload.title else "New Research Session"
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return SessionResponse(
        id=session.id,
        workspace_id=session.workspace_id,
        title=session.title,
        created_at=session.created_at,
        updated_at=session.updated_at,
        message_count=0
    )

@router.get("/sessions/{session_id}", response_model=SessionDetailResponse)
def get_session_detail(
    session_id: str,
    workspace: Workspace = Depends(get_or_create_workspace),
    db: Session = Depends(get_db)
):
    """Retrieves a research session including all messages and their associated citations."""
    session = db.query(ResearchSession).filter(
        ResearchSession.id == session_id,
        ResearchSession.workspace_id == workspace.id
    ).first()

    if not session:
        raise NotFoundException("ResearchSession", session_id)

    messages_out: List[MessageResponse] = []
    for msg in session.messages:
        citations_out = [
            CitationResponse(
                index=c.citation_index,
                chunk_id=c.chunk_id,
                document_id=c.document_id,
                filename=c.filename,
                page_number=c.page_number,
                excerpt=c.excerpt,
                relevance_score=c.relevance_score
            )
            for c in msg.citations
        ]
        messages_out.append(
            MessageResponse(
                id=msg.id,
                session_id=msg.session_id,
                role=msg.role,
                content=msg.content,
                workflow_run_id=msg.workflow_run_id,
                created_at=msg.created_at,
                citations=citations_out
            )
        )

    return SessionDetailResponse(
        id=session.id,
        workspace_id=session.workspace_id,
        title=session.title,
        created_at=session.created_at,
        updated_at=session.updated_at,
        messages=messages_out
    )

@router.delete(
    "/sessions/{session_id}",
    response_model=ActionStatusResponse,
    dependencies=[Depends(verify_csrf)]
)
def delete_session(
    session_id: str,
    workspace: Workspace = Depends(get_or_create_workspace),
    db: Session = Depends(get_db)
):
    """Deletes a research session and all associated messages and citations."""
    session = db.query(ResearchSession).filter(
        ResearchSession.id == session_id,
        ResearchSession.workspace_id == workspace.id
    ).first()

    if not session:
        raise NotFoundException("ResearchSession", session_id)

    db.delete(session)
    db.commit()

    return ActionStatusResponse(
        success=True,
        message=f"Research session '{session_id}' deleted successfully."
    )
