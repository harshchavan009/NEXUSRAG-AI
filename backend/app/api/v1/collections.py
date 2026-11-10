from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.database import get_db
from backend.app.models.workspace import Workspace
from backend.app.models.collection import Collection
from backend.app.models.document import Document
from backend.app.schemas.collection import (
    CollectionCreate,
    CollectionUpdate,
    CollectionResponse,
    CollectionListResponse
)
from backend.app.schemas.common import ActionStatusResponse
from backend.app.core.dependencies import get_or_create_workspace, verify_csrf
from backend.app.core.exceptions import NotFoundException, DuplicateException

router = APIRouter(prefix="/collections", tags=["Collections"])

@router.post("", response_model=CollectionResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(verify_csrf)])
@router.post("/", response_model=CollectionResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(verify_csrf)])
def create_collection(
    data: CollectionCreate,
    workspace: Workspace = Depends(get_or_create_workspace),
    db: Session = Depends(get_db)
):
    """Creates a new knowledge base collection within the authenticated workspace."""
    # Check duplicate name within this workspace
    existing = db.query(Collection).filter(
        Collection.workspace_id == workspace.id,
        func.lower(Collection.name) == data.name.strip().lower()
    ).first()
    if existing:
        raise DuplicateException(f"A collection named '{data.name}' already exists in this workspace.")

    coll = Collection(
        workspace_id=workspace.id,
        name=data.name.strip(),
        description=data.description.strip() if data.description else None
    )
    db.add(coll)
    db.commit()
    db.refresh(coll)
    
    return CollectionResponse(
        id=coll.id,
        workspace_id=coll.workspace_id,
        name=coll.name,
        description=coll.description,
        created_at=coll.created_at,
        document_count=0
    )

@router.get("", response_model=CollectionListResponse)
@router.get("/", response_model=CollectionListResponse)
def list_collections(
    workspace: Workspace = Depends(get_or_create_workspace),
    db: Session = Depends(get_db)
):
    """Lists all collections belonging strictly to the authenticated workspace."""
    collections = db.query(Collection).filter(Collection.workspace_id == workspace.id).order_by(Collection.created_at.desc()).all()
    
    # Batch calculate document counts
    doc_counts = dict(
        db.query(Document.collection_id, func.count(Document.id))
        .filter(Document.workspace_id == workspace.id)
        .group_by(Document.collection_id)
        .all()
    )

    items = [
        CollectionResponse(
            id=c.id,
            workspace_id=c.workspace_id,
            name=c.name,
            description=c.description,
            created_at=c.created_at,
            document_count=doc_counts.get(c.id, 0)
        )
        for c in collections
    ]
    return CollectionListResponse(collections=items, total=len(items))

@router.get("/{collection_id}", response_model=CollectionResponse)
def get_collection(
    collection_id: str,
    workspace: Workspace = Depends(get_or_create_workspace),
    db: Session = Depends(get_db)
):
    """Gets collection details by ID."""
    coll = db.query(Collection).filter(
        Collection.id == collection_id,
        Collection.workspace_id == workspace.id
    ).first()
    if not coll:
        raise NotFoundException("Collection", collection_id)
        
    doc_count = db.query(Document).filter(
        Document.collection_id == coll.id,
        Document.workspace_id == workspace.id
    ).count()

    return CollectionResponse(
        id=coll.id,
        workspace_id=coll.workspace_id,
        name=coll.name,
        description=coll.description,
        created_at=coll.created_at,
        document_count=doc_count
    )

@router.put("/{collection_id}", response_model=CollectionResponse, dependencies=[Depends(verify_csrf)])
def update_collection(
    collection_id: str,
    data: CollectionUpdate,
    workspace: Workspace = Depends(get_or_create_workspace),
    db: Session = Depends(get_db)
):
    """Renames or updates a collection."""
    coll = db.query(Collection).filter(
        Collection.id == collection_id,
        Collection.workspace_id == workspace.id
    ).first()
    if not coll:
        raise NotFoundException("Collection", collection_id)

    if data.name:
        existing = db.query(Collection).filter(
            Collection.workspace_id == workspace.id,
            func.lower(Collection.name) == data.name.strip().lower(),
            Collection.id != collection_id
        ).first()
        if existing:
            raise DuplicateException(f"Another collection named '{data.name}' already exists.")
        coll.name = data.name.strip()

    if data.description is not None:
        coll.description = data.description.strip() if data.description else None

    db.commit()
    db.refresh(coll)
    
    doc_count = db.query(Document).filter(
        Document.collection_id == coll.id,
        Document.workspace_id == workspace.id
    ).count()

    return CollectionResponse(
        id=coll.id,
        workspace_id=coll.workspace_id,
        name=coll.name,
        description=coll.description,
        created_at=coll.created_at,
        document_count=doc_count
    )

@router.delete("/{collection_id}", response_model=ActionStatusResponse, dependencies=[Depends(verify_csrf)])
def delete_collection(
    collection_id: str,
    workspace: Workspace = Depends(get_or_create_workspace),
    db: Session = Depends(get_db)
):
    """Deletes collection and unlinks or removes associated documents."""
    coll = db.query(Collection).filter(
        Collection.id == collection_id,
        Collection.workspace_id == workspace.id
    ).first()
    if not coll:
        raise NotFoundException("Collection", collection_id)

    db.delete(coll)
    db.commit()
    return ActionStatusResponse(success=True, message=f"Collection '{coll.name}' deleted successfully.")
