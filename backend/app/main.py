from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse, FileResponse, PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.middleware.base import BaseHTTPMiddleware
import logging

from backend.app.config import settings, BASE_DIR
from backend.app.core.logging import setup_logging
from backend.app.core.exceptions import APIException
from backend.app.database import init_db
from backend.app.api.v1 import api_v1_router

logger = logging.getLogger("nexusrag.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    setup_logging()
    logger.info("Initializing NexusRAG backend...")
    init_db()
    logger.info(f"NexusRAG backend ready in {settings.ENVIRONMENT} mode.")
    yield
    # Shutdown actions
    logger.info("Shutting down NexusRAG backend...")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="NexusRAG: Reference-Driven, Production-Grade RAG Assistant",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# 1. Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com data:; "
            "img-src 'self' data: blob:; "
            "connect-src 'self' http: https: ws:; "
            "frame-ancestors 'none';"
        )
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"

        # Private API responses must never be stored in browser or intermediary caches
        if request.url.path.startswith("/api/"):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
            response.headers["Pragma"] = "no-cache"

        # Automatically issue secure session cookie if a fresh workspace was provisioned
        if hasattr(request.state, "new_session_token") and request.state.new_session_token:
            response.set_cookie(
                key=settings.SESSION_COOKIE_NAME,
                value=request.state.new_session_token,
                max_age=settings.SESSION_MAX_AGE_SECONDS,
                httponly=True,
                secure=settings.SESSION_COOKIE_SECURE,
                samesite=settings.SESSION_COOKIE_SAMESITE,
                path="/"
            )
        return response

app.add_middleware(SecurityHeadersMiddleware)

# 2. CORS Middleware with explicit origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-CSRF-Token", "Set-Cookie", "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"]
)

# 3. Standardized Error Envelope Handlers
@app.exception_handler(APIException)
async def api_exception_handler(request: Request, exc: APIException):
    headers = {}
    if hasattr(exc, "retry_after"):
        headers["Retry-After"] = str(exc.retry_after)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details
            }
        },
        headers=headers
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field = ".".join(str(loc) for loc in err.get("loc", []))
        errors.append({"field": field, "message": err.get("msg")})
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Input validation failed. Please check the submitted fields.",
                "details": {"validation_errors": errors}
            }
        }
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception during request {request.method} {request.url}: {str(exc)}", exc_info=True)
    message = "An unexpected internal server error occurred."
    details = {"error": str(exc)} if settings.DEBUG else None
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": message,
                "details": details
            }
        }
    )

# 4. Attach API v1 Router
app.include_router(api_v1_router)

# 5. Static Assets & Production Single-Container SPA Mount
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dist = os.path.abspath(os.getenv("FRONTEND_DIST_DIR", "frontend/dist"))
if not os.path.isdir(frontend_dist):
    alt_dist = "/app/frontend/dist"
    if os.path.isdir(alt_dist):
        frontend_dist = alt_dist

if os.path.isdir(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    screenshots_dir = os.path.join(frontend_dist, "screenshots")
    if os.path.isdir(screenshots_dir):
        app.mount("/screenshots", StaticFiles(directory=screenshots_dir), name="screenshots")

    @app.get("/favicon.svg", include_in_schema=False)
    def serve_favicon():
        return FileResponse(os.path.join(frontend_dist, "favicon.svg"))

    @app.get("/robots.txt", include_in_schema=False)
    def serve_robots():
        return FileResponse(os.path.join(frontend_dist, "robots.txt"))

    @app.get("/sitemap.xml", include_in_schema=False)
    def serve_sitemap():
        return FileResponse(os.path.join(frontend_dist, "sitemap.xml"))

    @app.get("/manifest.webmanifest", include_in_schema=False)
    def serve_manifest():
        return FileResponse(os.path.join(frontend_dist, "manifest.webmanifest"))

    @app.get("/security", include_in_schema=False)
    @app.get("/faq", include_in_schema=False)
    @app.get("/status", include_in_schema=False)
    @app.get("/about", include_in_schema=False)
    @app.get("/privacy", include_in_schema=False)
    @app.get("/terms", include_in_schema=False)
    @app.get("/app/{full_path:path}", include_in_schema=False)
    def serve_spa_pages(full_path: str = ""):
        return FileResponse(os.path.join(frontend_dist, "index.html"))

@app.get("/.well-known/security.txt", include_in_schema=False)
def serve_security_txt():
    sec_file = os.path.join(frontend_dist, ".well-known", "security.txt") if os.path.isdir(frontend_dist) else None
    if sec_file and os.path.isfile(sec_file):
        return FileResponse(sec_file, media_type="text/plain")
    root_sec = os.path.join(str(BASE_DIR), ".well-known", "security.txt")
    if os.path.isfile(root_sec):
        return FileResponse(root_sec, media_type="text/plain")
    return PlainTextResponse(
        "Contact: mailto:security@nexusrag.internal\n"
        "Contact: https://github.com/harshchavan009/NEXUSRAG-AI/security/advisories/new\n"
        "Expires: 2027-12-31T23:59:59.000Z\n"
        "Preferred-Languages: en\n"
        "Canonical: https://github.com/harshchavan009/NEXUSRAG-AI/blob/main/.well-known/security.txt\n"
        "Policy: https://github.com/harshchavan009/NEXUSRAG-AI/blob/main/SECURITY.md\n",
        media_type="text/plain"
    )

@app.get("/")
def root(request: Request):
    accept = request.headers.get("accept", "")
    index_html = os.path.join(frontend_dist, "index.html") if os.path.isdir(frontend_dist) else None
    if "text/html" in accept and index_html and os.path.isfile(index_html):
        return FileResponse(index_html)
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/api/v1/health"
    }

