import uuid
from typing import List, Tuple, Optional
from pathlib import Path
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.models.document import Document
from backend.app.models.collection import Collection
from backend.app.core.security import calculate_sha256, sanitize_filename
from backend.app.core.exceptions import ValidationException, DuplicateException
from backend.app.services.storage_service import StorageService

class DocumentService:
    @staticmethod
    def validate_file_content(filename: str, content: bytes) -> str:
        """
        Validates extension, size, empty content, and magic bytes.
        Returns normalized file type: 'pdf', 'txt', or 'md'.
        """
        if len(content) == 0:
            raise ValidationException("File is empty (0 bytes).")
            
        if len(content) > settings.MAX_FILE_SIZE_BYTES:
            max_mb = settings.MAX_FILE_SIZE_BYTES // (1024 * 1024)
            raise ValidationException(f"File size exceeds maximum allowed limit of {max_mb}MB.")

        ext = Path(filename).suffix.lower()
        if ext not in settings.ALLOWED_EXTENSIONS:
            raise ValidationException(
                f"File extension '{ext}' is not supported. Supported extensions: {', '.join(settings.ALLOWED_EXTENSIONS)}"
            )

        # Magic bytes check for PDF
        if ext == ".pdf":
            if not content.startswith(b"%PDF-"):
                raise ValidationException("Invalid PDF document: missing '%PDF-' header signature.")
            return "pdf"
        
        # Binary check for TXT / MD: reject executables, zip archives, or raw binary
        if content.startswith(b"\x7fELF") or content.startswith(b"MZ") or content.startswith(b"PK\x03\x04"):
            raise ValidationException("Binary or archive file masquerading as text.")
            
        if ext in (".md", ".markdown"):
            return "md"
        return "txt"

    @staticmethod
    def handle_upload(
        workspace_id: str,
        filename: str,
        content: bytes,
        collection_id: Optional[str],
        db: Session
    ) -> Document:
        """
        Validates, saves file to disk, and records document in DB.
        """
        file_type = DocumentService.validate_file_content(filename, content)
        sha256 = calculate_sha256(content)
        
        # Check duplicate within this workspace
        existing = db.query(Document).filter(
            Document.workspace_id == workspace_id,
            Document.sha256_hash == sha256
        ).first()
        
        if existing:
            raise DuplicateException(
                f"Document '{filename}' has already been uploaded to this workspace (matches '{existing.filename}').",
                details={"existing_document_id": existing.id, "sha256": sha256}
            )

        # Validate collection if specified
        if collection_id:
            coll = db.query(Collection).filter(
                Collection.id == collection_id,
                Collection.workspace_id == workspace_id
            ).first()
            if not coll:
                raise ValidationException(f"Collection '{collection_id}' not found in this workspace.")

        doc_id = str(uuid.uuid4())
        safe_name = sanitize_filename(filename)
        storage_path = StorageService.save_file(workspace_id, doc_id, safe_name, content)
        
        doc = Document(
            id=doc_id,
            workspace_id=workspace_id,
            collection_id=collection_id,
            filename=safe_name,
            original_filename=filename,
            file_type=file_type,
            file_size_bytes=len(content),
            page_count=0,
            chunk_count=0,
            status="uploaded",
            storage_path=storage_path,
            sha256_hash=sha256
        )
        
        db.add(doc)
        db.commit()
        db.refresh(doc)
        return doc

