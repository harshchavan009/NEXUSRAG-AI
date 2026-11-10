import logging
import sys
import re

SENSITIVE_PATTERNS = [
    re.compile(r"(api[_-]?key|token|secret|password)=([^\s&]+)", re.IGNORECASE),
    re.compile(r"Bearer\s+([a-zA-Z0-9_\-\.]+)", re.IGNORECASE)
]

class SecretSanitizingFormatter(logging.Formatter):
    def format(self, record):
        original = super().format(record)
        sanitized = original
        for pattern in SENSITIVE_PATTERNS:
            sanitized = pattern.sub(r"\1=***", sanitized)
        return sanitized

def setup_logging():
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(
        SecretSanitizingFormatter(
            fmt="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
    )
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.handlers = [handler]
