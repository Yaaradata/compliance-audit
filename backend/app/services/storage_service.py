"""
Abstraction over file storage. Supports GCS (production) and local filesystem (dev fallback).
Uses Application Default Credentials for GCS.
"""

from __future__ import annotations

import logging
import os
from datetime import timedelta
from pathlib import Path

from ..config import settings

logger = logging.getLogger(__name__)

_LOCAL_UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"

# Lazy-init GCS client
_gcs_client = None


def _get_gcs_client():
    global _gcs_client
    if _gcs_client is None:
        from google.cloud import storage as gcs  # type: ignore[import-untyped]
        _gcs_client = gcs.Client()
    return _gcs_client


def _bucket():
    return _get_gcs_client().bucket(settings.GCS_BUCKET_NAME)


def _is_gcs() -> bool:
    return settings.STORAGE_BACKEND == "gcs" and bool(settings.GCS_BUCKET_NAME)


def _gcs_object_path(relative_path: str) -> str:
    prefix = settings.GCS_PREFIX.strip("/")
    return f"{prefix}/{relative_path}" if prefix else relative_path


# ──────────────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────────────

def upload(relative_path: str, data: bytes, content_type: str = "application/octet-stream") -> str:
    """Upload bytes and return the storage path (GCS object path or local path)."""
    if _is_gcs():
        obj_path = _gcs_object_path(relative_path)
        blob = _bucket().blob(obj_path)
        blob.upload_from_string(data, content_type=content_type)
        logger.info("Uploaded to GCS: gs://%s/%s (%d bytes)", settings.GCS_BUCKET_NAME, obj_path, len(data))
        return f"gs://{settings.GCS_BUCKET_NAME}/{obj_path}"
    else:
        local_path = _LOCAL_UPLOAD_DIR / relative_path
        local_path.parent.mkdir(parents=True, exist_ok=True)
        local_path.write_bytes(data)
        logger.info("Uploaded locally: %s (%d bytes)", local_path, len(data))
        return str(local_path)


def download(storage_path: str) -> bytes:
    """Download bytes from a storage path."""
    if storage_path.startswith("gs://"):
        parts = storage_path.replace("gs://", "").split("/", 1)
        bucket_name, obj_path = parts[0], parts[1]
        client = _get_gcs_client()
        blob = client.bucket(bucket_name).blob(obj_path)
        return blob.download_as_bytes()
    else:
        return Path(storage_path).read_bytes()


def get_signed_url(storage_path: str, expiry_minutes: int = 15) -> str:
    """Return a short-lived signed URL for frontend display. Falls back to local endpoint."""
    if storage_path.startswith("gs://"):
        parts = storage_path.replace("gs://", "").split("/", 1)
        bucket_name, obj_path = parts[0], parts[1]
        client = _get_gcs_client()
        blob = client.bucket(bucket_name).blob(obj_path)
        return blob.generate_signed_url(
            version="v4",
            expiration=timedelta(minutes=expiry_minutes),
            method="GET",
        )
    return storage_path


def delete(storage_path: str) -> None:
    """Delete a file from storage. Idempotent: no-op if the file does not exist."""
    if not storage_path:
        return
    try:
        if storage_path.startswith("gs://"):
            parts = storage_path.replace("gs://", "").split("/", 1)
            bucket_name, obj_path = parts[0], parts[1]
            client = _get_gcs_client()
            blob = client.bucket(bucket_name).blob(obj_path)
            blob.delete()
            logger.info("Deleted from GCS: %s", storage_path)
        else:
            p = Path(storage_path)
            if p.exists():
                p.unlink()
                logger.info("Deleted locally: %s", storage_path)
    except Exception as e:
        err_msg = str(e).lower()
        if (
            "404" in err_msg
            or "no such object" in err_msg
            or "not found" in err_msg
            or type(e).__name__ == "NotFound"
        ):
            logger.debug("Storage object already missing: %s", storage_path)
            return
        raise


def upload_diagram(filename: str, data: bytes, content_type: str = "image/png") -> str:
    """Upload an architecture diagram and return the storage path."""
    return upload(f"diagrams/{filename}", data, content_type)


def get_diagram_url(filename: str, expiry_minutes: int = 60) -> str:
    """Get a URL for an architecture diagram."""
    if _is_gcs():
        obj_path = _gcs_object_path(f"diagrams/{filename}")
        full_path = f"gs://{settings.GCS_BUCKET_NAME}/{obj_path}"
        return get_signed_url(full_path, expiry_minutes)
    return f"/architecture-diagrams/{filename}"
