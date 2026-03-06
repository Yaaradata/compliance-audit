"""
Abstraction over file storage. Supports GCS (production) and local filesystem (dev fallback).
Uses Application Default Credentials for GCS.
"""

from __future__ import annotations

import logging
import os
import shutil
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


def get_signed_url(storage_path: str, expiry_minutes: int = 15) -> str | None:
    """
    Return a short-lived signed URL for frontend display, or None if credentials
    cannot sign (e.g. user OAuth token without a private key). Caller should
    fall back to streaming the file through the backend when None is returned.
    """
    if storage_path.startswith("gs://"):
        parts = storage_path.replace("gs://", "").split("/", 1)
        bucket_name, obj_path = parts[0], parts[1]
        client = _get_gcs_client()
        blob = client.bucket(bucket_name).blob(obj_path)
        try:
            return blob.generate_signed_url(
                version="v4",
                expiration=timedelta(minutes=expiry_minutes),
                method="GET",
            )
        except AttributeError as e:
            err = str(e).lower()
            if "private key" in err or "sign" in err or "credentials" in err:
                # Log once per process to avoid flooding logs; stream fallback is used for diagrams.
                if not getattr(get_signed_url, "_logged_no_signing", False):
                    logger.info(
                        "GCS signed URLs unavailable (no private key). Diagram and file URLs will be streamed through the backend. Use a service account key for production signing."
                    )
                    setattr(get_signed_url, "_logged_no_signing", True)
                return None
            raise
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


def delete_prefix(relative_prefix: str) -> int:
    """
    Delete all objects under the given relative prefix (e.g. evidence/{submission_id}/).
    Removes every blob (files and any folder-placeholder objects) under that path.
    For local storage, removes the directory and all its contents.
    Returns the number of objects/blobs deleted.
    """
    if not relative_prefix or not relative_prefix.strip():
        return 0
    prefix = relative_prefix.strip("/")
    if not prefix:
        return 0
    deleted = 0
    if _is_gcs():
        obj_prefix = _gcs_object_path(prefix)
        if not obj_prefix.endswith("/"):
            obj_prefix += "/"
        bucket = _bucket()
        blobs = list(bucket.list_blobs(prefix=obj_prefix))
        for blob in blobs:
            try:
                blob.delete()
                deleted += 1
                logger.debug("Deleted from GCS: %s", blob.name)
            except Exception as e:
                logger.warning("Failed to delete blob %s: %s", blob.name, e)
        if blobs:
            logger.info("Deleted %d blob(s) under GCS prefix %s", deleted, obj_prefix)
    else:
        dir_path = _LOCAL_UPLOAD_DIR / prefix
        if dir_path.exists() and dir_path.is_dir():
            shutil.rmtree(dir_path)
            deleted = 1
            logger.info("Deleted local directory: %s", dir_path)
    return deleted


def _diagram_version_folder(version: str | None) -> str:
    """Map version param to GCS folder name: swift_2025 or swift_2026."""
    if not version:
        return "swift_2025"
    v = str(version).strip().lower()
    if v in ("2026", "swift_2026"):
        return "swift_2026"
    return "swift_2025"


def upload_diagram(filename: str, data: bytes, content_type: str = "image/png", version: str | None = None) -> str:
    """Upload an architecture diagram and return the storage path. version: 2025|2026 or swift_2025|swift_2026."""
    folder = _diagram_version_folder(version)
    return upload(f"diagrams/{folder}/{filename}", data, content_type)


# Base path for diagram stream fallback when GCS signed URL cannot be generated (e.g. user credentials without private key).
_DIAGRAM_STREAM_PATH = "/api/v1/ref/diagrams"


def get_diagram_bytes(filename: str, version: str | None = None) -> bytes:
    """Download diagram bytes from GCS or local. Raises if not found."""
    folder = _diagram_version_folder(version)
    if _is_gcs():
        obj_path = _gcs_object_path(f"diagrams/{folder}/{filename}")
        full_path = f"gs://{settings.GCS_BUCKET_NAME}/{obj_path}"
        return download(full_path)
    local_path = _LOCAL_UPLOAD_DIR / "diagrams" / folder / filename
    if not local_path.exists():
        raise FileNotFoundError(f"Diagram not found: {local_path}")
    return local_path.read_bytes()


def get_diagram_url(filename: str, expiry_minutes: int = 60, version: str | None = None) -> str:
    """Get a URL for an architecture diagram. When GCS signing fails (e.g. no private key), returns backend stream URL."""
    from urllib.parse import quote
    folder = _diagram_version_folder(version)
    if _is_gcs():
        obj_path = _gcs_object_path(f"diagrams/{folder}/{filename}")
        full_path = f"gs://{settings.GCS_BUCKET_NAME}/{obj_path}"
        signed = get_signed_url(full_path, expiry_minutes)
        if signed is not None:
            return signed
        # Fallback: stream through backend so images still load without a service account key.
        version_param = quote(version or "swift_2025")
        return f"{_DIAGRAM_STREAM_PATH}/{quote(filename)}/content?version={version_param}"
    return f"/architecture-diagrams/{folder}/{filename}"
