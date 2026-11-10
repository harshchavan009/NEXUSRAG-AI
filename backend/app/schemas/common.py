from typing import Any, Dict, Optional, Generic, TypeVar, List
from pydantic import BaseModel, Field

T = TypeVar("T")

class ErrorDetail(BaseModel):
    code: str = Field(description="Stable error code, e.g. NOT_FOUND, VALIDATION_ERROR")
    message: str = Field(description="Human-readable error description")
    details: Optional[Dict[str, Any]] = Field(default=None, description="Optional diagnostic details")

class ErrorEnvelope(BaseModel):
    error: ErrorDetail

class PaginationMeta(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    pagination: PaginationMeta

class ActionStatusResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None

