from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.workspace import Workspace
from backend.app.models.workflow_run import WorkflowRun
from backend.app.schemas.inspector import WorkflowRunResponse
from backend.app.schemas.query import CitationResponse
from backend.app.core.dependencies import get_or_create_workspace
from backend.app.core.exceptions import NotFoundException

router = APIRouter(prefix="/inspector", tags=["Retrieval Inspector"])

@router.get("/runs", response_model=List[WorkflowRunResponse])
def list_workflow_runs(
    limit: int = Query(default=20, ge=1, le=100),
    workspace: Workspace = Depends(get_or_create_workspace),
    db: Session = Depends(get_db)
):
    """Lists recent retrieval workflow trace runs for the current workspace."""
    runs = (
        db.query(WorkflowRun)
        .filter(WorkflowRun.workspace_id == workspace.id)
        .order_by(WorkflowRun.created_at.desc())
        .limit(limit)
        .all()
    )

    result = []
    for r in runs:
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
            for c in r.citations
        ]
        result.append(
            WorkflowRunResponse(
                id=r.id,
                workspace_id=r.workspace_id,
                query=r.query,
                rewritten_query=r.rewritten_query,
                retrieved_candidates=r.retrieved_candidates or [],
                reranked_results=r.reranked_results or [],
                sufficiency_score=r.sufficiency_score,
                groundedness_score=r.groundedness_score,
                stage_durations=r.stage_durations or {},
                status=r.status,
                error_message=r.error_message,
                created_at=r.created_at,
                citations=citations_out
            )
        )
    return result

@router.get("/runs/{run_id}", response_model=WorkflowRunResponse)
def get_workflow_run_detail(
    run_id: str,
    workspace: Workspace = Depends(get_or_create_workspace),
    db: Session = Depends(get_db)
):
    """Retrieves full inspectable execution trace for a specific workflow run."""
    run = (
        db.query(WorkflowRun)
        .filter(
            WorkflowRun.id == run_id,
            WorkflowRun.workspace_id == workspace.id
        )
        .first()
    )

    if not run:
        raise NotFoundException("WorkflowRun", run_id)

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
        for c in run.citations
    ]

    return WorkflowRunResponse(
        id=run.id,
        workspace_id=run.workspace_id,
        query=run.query,
        rewritten_query=run.rewritten_query,
        retrieved_candidates=run.retrieved_candidates or [],
        reranked_results=run.reranked_results or [],
        sufficiency_score=run.sufficiency_score,
        groundedness_score=run.groundedness_score,
        stage_durations=run.stage_durations or {},
        status=run.status,
        error_message=run.error_message,
        created_at=run.created_at,
        citations=citations_out
    )
