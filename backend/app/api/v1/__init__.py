from fastapi import APIRouter
from backend.app.api.v1.health import router as health_router
from backend.app.api.v1.workspaces import router as workspaces_router
from backend.app.api.v1.collections import router as collections_router
from backend.app.api.v1.documents import router as documents_router
from backend.app.api.v1.user import router as user_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(health_router)
api_v1_router.include_router(workspaces_router)
api_v1_router.include_router(collections_router)
api_v1_router.include_router(documents_router)
api_v1_router.include_router(user_router)

