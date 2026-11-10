from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    workspace_id: str
    collection_id: Optional[str] = None
    collection_name: Optional[str] = None
    filename: str
    original_filename: str
    file_type: str
    file_size_bytes: int
    page_count: int
    chunk_count: int
    summary: Optional[str] = None
    status: str
    error_reason: Optional[str] = None
    sha256_hash: str
    created_at: datetime
    updated_at: datetime

class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int

class UploadJobItem(BaseModel):
    document_id: str
    filename: str
    file_size_bytes: int
    status: str
    message: str

class DocumentUploadResponse(BaseModel):
    uploaded: List[UploadJobItem]
    failed: List[UploadJobItem]
