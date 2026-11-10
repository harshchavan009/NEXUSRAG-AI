import time
from typing import Dict, List, Tuple
from collections import defaultdict
from fastapi import Request, Response
from backend.app.core.exceptions import RateLimitException
from backend.app.config import settings

class SlidingWindowRateLimiter:
    """
    In-memory sliding window rate limiter tracking requests by key (IP or workspace ID).
    Thread-safe for standard ASGI async execution with millisecond precision.
    """
    def __init__(self):
        # Maps key -> list of float timestamps (epoch seconds)
        self._records: Dict[str, List[float]] = defaultdict(list)

    def is_allowed(self, key: str, limit: int, window_seconds: int = 60) -> Tuple[bool, int, int]:
        """
        Evaluates whether request with given key is within the limit in window_seconds.
        Returns: (is_allowed: bool, remaining: int, reset_seconds: int)
        """
        now = time.time()
        cutoff = now - window_seconds
        
        # Filter timestamps outside the window
        timestamps = [t for t in self._records[key] if t > cutoff]
        
        if len(timestamps) >= limit:
            oldest = timestamps[0]
            reset_seconds = max(1, int(oldest + window_seconds - now))
            self._records[key] = timestamps
            return False, 0, reset_seconds

        # Record this request
        timestamps.append(now)
        self._records[key] = timestamps
        remaining = max(0, limit - len(timestamps))
        reset_seconds = window_seconds
        return True, remaining, reset_seconds

    def reset(self, key: str = None):
        """Resets recorded hits for a specific key or all keys."""
        if key:
            self._records.pop(key, None)
        else:
            self._records.clear()

# Global rate limiter instance
limiter = SlidingWindowRateLimiter()

def rate_limit_check(
    request: Request,
    response: Response,
    limit: int = 60,
    window_seconds: int = 60
):
    """
    FastAPI dependency that enforces sliding window rate limiting per IP / workspace.
    Injects X-RateLimit headers into the response.
    """
    # Prefer workspace ID if resolved, otherwise fallback to client IP
    client_ip = request.client.host if request.client else "127.0.0.1"
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        client_ip = forwarded.split(",")[0].strip()

    workspace_id = getattr(request.state, "workspace_id", None)
    key = f"ws_{workspace_id}" if workspace_id else f"ip_{client_ip}"

    allowed, remaining, reset_sec = limiter.is_allowed(key, limit, window_seconds)

    if response:
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(reset_sec)

    if not allowed:
        raise RateLimitException(
            message=f"Rate limit exceeded ({limit} requests per {window_seconds}s). Please slow down and try again.",
            retry_after=reset_sec
        )

def check_query_rate_limit(request: Request, response: Response):
    """Enforces per-minute query rate limiting from settings."""
    rate_limit_check(request, response, limit=settings.RATE_LIMIT_PER_MINUTE, window_seconds=60)

def check_upload_rate_limit(request: Request, response: Response):
    """Enforces per-minute upload rate limiting from settings."""
    rate_limit_check(request, response, limit=settings.RATE_LIMIT_PER_MINUTE, window_seconds=60)

