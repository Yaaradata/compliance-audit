"""Map Google API / client exceptions to stable codes and user-facing messages."""
from __future__ import annotations

from typing import Any

try:
    from google.api_core import exceptions as google_exceptions
except ImportError:  # pragma: no cover
    google_exceptions = None  # type: ignore


def is_permission_denied(exc: BaseException) -> bool:
    if google_exceptions and isinstance(exc, google_exceptions.PermissionDenied):
        return True
    msg = str(exc).lower()
    return "permission denied" in msg or "403" in msg


def is_api_not_enabled(exc: BaseException) -> bool:
    msg = str(exc).lower()
    return "has not been used" in msg or "is disabled" in msg or "serviceusage" in msg or "not enabled" in msg


def is_not_found(exc: BaseException) -> bool:
    if google_exceptions and isinstance(exc, google_exceptions.NotFound):
        return True
    msg = str(exc).lower()
    return "not found" in msg or "404" in msg


def classify_google_exception(exc: BaseException) -> tuple[str, str]:
    """
    Returns (code, message) for structured logging / API responses.
    message is safe to show operators (no stack traces).
    """
    if google_exceptions:
        if isinstance(exc, google_exceptions.PermissionDenied):
            return "PERMISSION_DENIED", (getattr(exc, "message", None) or str(exc))[:2000]
        if isinstance(exc, google_exceptions.NotFound):
            return "NOT_FOUND", (getattr(exc, "message", None) or str(exc))[:2000]
        if isinstance(exc, google_exceptions.FailedPrecondition):
            return "FAILED_PRECONDITION", (getattr(exc, "message", None) or str(exc))[:2000]
        if isinstance(exc, google_exceptions.ServiceUnavailable):
            return "SERVICE_UNAVAILABLE", (getattr(exc, "message", None) or str(exc))[:2000]
        if isinstance(exc, google_exceptions.DeadlineExceeded):
            return "DEADLINE_EXCEEDED", (getattr(exc, "message", None) or str(exc))[:2000]
    if is_api_not_enabled(exc):
        return "API_NOT_ENABLED", str(exc)[:2000]
    if is_permission_denied(exc):
        return "PERMISSION_DENIED", str(exc)[:2000]
    if is_not_found(exc):
        return "NOT_FOUND", str(exc)[:2000]
    return "UNKNOWN", str(exc)[:2000]


def client_http_json(exc: Any) -> dict | None:
    """Best-effort extract {error: {code, message}} from googleapiclient HttpError."""
    try:
        content = getattr(exc, "content", None)
        if content and isinstance(content, bytes):
            import json

            return json.loads(content.decode("utf-8", errors="replace"))
    except Exception:
        return None
    return None
