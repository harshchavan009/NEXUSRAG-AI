import os
import shutil
from pathlib import Path
from typing import Optional
from backend.app.config import settings
from backend.app.core.security import sanitize_filename

class StorageService:
    @staticmethod
    def get_workspace_dir(workspace_id: str) -> Path:
        wdir = settings.UPLOADS_DIR / workspace_id
        wdir.mkdir(parents=True, exist_ok=True)
        return wdir

    @staticmethod
    def save_file(workspace_id: str, document_id: str, filename: str, content: bytes) -> str:
        safe_name = sanitize_filename(filename)
        dest_dir = StorageService.get_workspace_dir(workspace_id)
        storage_path = dest_dir / f"{document_id}_{safe_name}"
        
        with open(storage_path, "wb") as f:
            f.write(content)
            
        return str(storage_path)

    @staticmethod
    def delete_file(storage_path: str) -> bool:
        path = Path(storage_path)
        if path.exists() and path.is_file():
            try:
                path.unlink()
                return True
            except OSError:
                return False
        return False

    @staticmethod
    def delete_workspace_files(workspace_id: str) -> bool:
        wdir = settings.UPLOADS_DIR / workspace_id
        if wdir.exists() and wdir.is_dir():
            shutil.rmtree(wdir, ignore_errors=True)
            return True
        return False
