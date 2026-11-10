from datetime import datetime, timezone
from fastapi import Request, Depends, Header
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.workspace import Workspace
from backend.app.config import settings
from backend.app.core.security import generate_session_token, verify_csrf_token
from backend.app.core.exceptions import CSRFException

def get_or_create_workspace(
    request: Request,
    db: Session = Depends(get_db)
) -> Workspace:
    """
    Extracts session token from httpOnly cookie (or X-Session-Token header for automated testing).
    Resolves the tenant workspace or provisions a new isolated workspace.
    """
    token = request.cookies.get(settings.SESSION_COOKIE_NAME)
    header_token = request.headers.get("X-Session-Token")
    session_token = token or header_token

    workspace = None
    if session_token:
        workspace = db.query(Workspace).filter(Workspace.session_token == session_token).first()

    if not workspace:
        # If client provided a 64-char hex token, adopt it; otherwise generate fresh 256-bit token
        if session_token and len(session_token) == 64:
            new_token = session_token
        else:
            new_token = generate_session_token()

        workspace = Workspace(
            session_token=new_token,
            created_at=datetime.now(timezone.utc),
            last_active_at=datetime.now(timezone.utc)
        )
        db.add(workspace)
        db.commit()
        db.refresh(workspace)
        request.state.new_session_token = new_token
    else:
        # Touch last active timestamp
        workspace.last_active_at = datetime.now(timezone.utc)
        db.commit()

    request.state.workspace_id = workspace.id
    request.state.session_token = workspace.session_token
    return workspace

def verify_csrf(
    request: Request,
    workspace: Workspace = Depends(get_or_create_workspace),
    x_csrf_token: str = Header(None, alias=settings.CSRF_HEADER_NAME)
):
    """
    Double-Submit CSRF check on state-changing methods (POST, PUT, DELETE, PATCH).
    Exempts safe read methods (GET, HEAD, OPTIONS).
    """
    if request.method in ("POST", "PUT", "DELETE", "PATCH"):
        # If request has an active session cookie, verify CSRF header
        cookie_token = request.cookies.get(settings.SESSION_COOKIE_NAME)
        if cookie_token:
            if not x_csrf_token or not verify_csrf_token(workspace.session_token, x_csrf_token):
                raise CSRFException("CSRF token verification failed on state-changing request.")
