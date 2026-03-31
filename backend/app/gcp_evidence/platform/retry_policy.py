"""
Retry policy for GCP client calls.

Prefer `google.api_core.retry.Retry` on individual RPCs, e.g.:

    from google.api_core import retry as grpc_retry
    client.list_something(..., retry=grpc_retry.Retry(...))

This module documents the standard: transient errors (503, 429, deadline) should retry with
exponential backoff; PERMISSION_DENIED and NOT_FOUND should not retry.
"""

from google.api_core import retry as api_retry
from google.api_core import exceptions as core_exceptions

# Default predicate: retry transient failures only
GCP_TRANSIENT_RETRY: api_retry.Retry = api_retry.Retry(
    predicate=api_retry.if_exception_type(
        core_exceptions.ServiceUnavailable,
        core_exceptions.InternalServerError,
        core_exceptions.TooManyRequests,
        core_exceptions.DeadlineExceeded,
    ),
    initial=1.0,
    maximum=32.0,
    multiplier=2.0,
    deadline=120.0,
)

__all__ = ["GCP_TRANSIENT_RETRY"]
