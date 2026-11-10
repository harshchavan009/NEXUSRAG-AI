import secrets
import hashlib
import hmac
import re
from pathlib import Path
from backend.app.config import settings

def generate_session_token() -> str:
    """Generates a cryptographically secure 256-bit random session token."""
    return secrets.token_hex(32)

def generate_csrf_token(session_token: str) -> str:
    """Generates a keyed CSRF token tied to the session token."""
    key = (settings.GEMINI_API_KEY or "nexusrag-secret-csrf-salt").encode("utf-8")
    h = hmac.new(key, session_token.encode("utf-8"), hashlib.sha256)
    return h.hexdigest()

def verify_csrf_token(session_token: str, csrf_token: str) -> bool:
    """Constant-time verification of CSRF token."""
    if not csrf_token or not session_token:
        return False
    expected = generate_csrf_token(session_token)
    return hmac.compare_digest(expected, csrf_token)

def calculate_sha256(data: bytes) -> str:
    """Computes SHA-256 hash of file bytes for duplicate detection."""
    return hashlib.sha256(data).hexdigest()

def sanitize_filename(filename: str) -> str:
    """Sanitizes filename removing path traversal and unsafe characters."""
    clean = Path(filename).name
    # Strip any dangerous directory traversal or unusual characters
    clean = re.sub(r"[^\w\.\-\s]", "_", clean).strip()
    if not clean:
        clean = f"document_{secrets.token_hex(4)}.txt"
    return clean
