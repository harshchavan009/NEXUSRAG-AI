from typing import Any, Dict, Optional

class APIException(Exception):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        details: Optional[Dict[str, Any]] = None
    ):
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details or {}
        super().__init__(self.message)

class NotFoundException(APIException):
    def __init__(self, resource: str, identifier: str):
        super().__init__(
            status_code=404,
            code="NOT_FOUND",
            message=f"{resource} with identifier '{identifier}' was not found.",
            details={"resource": resource, "identifier": identifier}
        )

class ValidationException(APIException):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=422,
            code="VALIDATION_ERROR",
            message=message,
            details=details
        )

class ForbiddenException(APIException):
    def __init__(self, message: str = "Access forbidden for this workspace."):
        super().__init__(
            status_code=403,
            code="FORBIDDEN",
            message=message
        )

class DuplicateException(APIException):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=409,
            code="CONFLICT_DUPLICATE",
            message=message,
            details=details
        )

class CSRFException(APIException):
    def __init__(self, message: str = "Invalid or missing CSRF token."):
        super().__init__(
            status_code=403,
            code="CSRF_VALIDATION_FAILED",
            message=message
        )
