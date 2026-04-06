"""Thread-local override for google.auth.default during GCP collector runs (user OAuth credentials)."""
from __future__ import annotations

import threading
from contextlib import contextmanager
from typing import Any

import google.auth as ga

_tls = threading.local()
_orig_default = ga.default


def _patched_default(scopes=None, request=None, quota_project_id=None, default_scopes=None):
    c = getattr(_tls, "credentials", None)
    if c is not None:
        return c, getattr(_tls, "quota_project_id", None)
    return _orig_default(scopes=scopes, request=request, quota_project_id=quota_project_id, default_scopes=default_scopes)


ga.default = _patched_default


@contextmanager
def gcp_user_credentials_scope(creds: Any | None, quota_project_id: str | None = None):
    """When creds is set, all google.auth.default() calls in this thread return those credentials."""
    if creds is None:
        yield
        return
    _tls.credentials = creds
    _tls.quota_project_id = quota_project_id
    try:
        yield
    finally:
        _tls.credentials = None
        _tls.quota_project_id = None
