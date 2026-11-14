import os
from pathlib import Path
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    # Application Info
    APP_NAME: str = "NexusRAG"
    APP_VERSION: str = "1.3.0"
    ENVIRONMENT: str = Field(default="development", description="development, staging, production")
    DEBUG: bool = False
    
    # Security & Isolation
    SESSION_COOKIE_NAME: str = "nexus_session"
    SESSION_COOKIE_SECURE: bool = False  # Set to True in production (HTTPS)
    SESSION_COOKIE_SAMESITE: str = "lax"
    SESSION_MAX_AGE_SECONDS: int = 7 * 24 * 60 * 60  # 7 days retention
    CSRF_HEADER_NAME: str = "X-CSRF-Token"
    CORS_ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    # Database Configuration
    DATABASE_URL: str = Field(
        default=f"sqlite:///{BASE_DIR / 'storage' / 'nexus_dev.db'}",
        description="PostgreSQL URL for production or SQLite for local zero-config execution"
    )
    
    # Storage Paths
    STORAGE_DIR: Path = BASE_DIR / "storage"
    UPLOADS_DIR: Path = BASE_DIR / "storage" / "uploads"
    FAISS_DIR: Path = BASE_DIR / "storage" / "faiss"
    
    # Upload Validation Rules
    MAX_FILE_SIZE_BYTES: int = 25 * 1024 * 1024  # 25 MB
    MAX_PDF_PAGES: int = 60
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".txt", ".md", ".markdown"]
    ALLOWED_MIME_TYPES: List[str] = [
        "application/pdf",
        "text/plain",
        "text/markdown",
        "text/x-markdown",
        "application/octet-stream"  # For some markdown uploads
    ]
    
    # AI Provider Settings
    AI_PROVIDER: str = Field(default="gemini", description="gemini or openai")
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    
    # Default Models (Verified Active Google AI Studio Models)
    DEFAULT_EMBEDDING_MODEL: str = "gemini-embedding-2"
    DEFAULT_GENERATION_MODEL: str = "gemini-3.5-flash-lite"
    EMBEDDING_DIMENSION: int = 768
    
    # RAG Parameters
    DEFAULT_CHUNK_SIZE: int = 700
    DEFAULT_CHUNK_OVERLAP: int = 100
    DEFAULT_TOP_K: int = 8
    DEFAULT_FINAL_CONTEXT_K: int = 4
    EVIDENCE_SUFFICIENCY_THRESHOLD: float = 0.65
    GROUNDEDNESS_THRESHOLD: float = 0.70
    MAX_RETRIES: int = 1
    
    # Rate Limiting & Quotas
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_QUERIES_PER_DAY: int = 200
    RATE_LIMIT_UPLOADS_PER_DAY: int = 50

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }

    def model_post_init(self, __context: Optional[dict] = None) -> None:
        if self.AI_PROVIDER in ["local", "huggingface", "sentence-transformers"]:
            if self.DEFAULT_EMBEDDING_MODEL == "gemini-embedding-2":
                self.DEFAULT_EMBEDDING_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
            if self.EMBEDDING_DIMENSION == 768:
                self.EMBEDDING_DIMENSION = 384
            if self.DEFAULT_GENERATION_MODEL == "gemini-3.5-flash-lite":
                self.DEFAULT_GENERATION_MODEL = "local-grounded-synthesis"

settings = Settings()

# Ensure required persistent storage directories exist
settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
settings.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
settings.FAISS_DIR.mkdir(parents=True, exist_ok=True)

