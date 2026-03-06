#!/usr/bin/env python3
"""
Setup GCS diagram folders: create swift_2025 and swift_2026 under compliance-audit/diagrams/,
move existing flat images into swift_2025, and upload 2026 arch-diagrams from ref-docs to swift_2026.

GCS structure after run:
  compliance-audit/diagrams/swift_2025/A1-1.png, A1-2.png, ...
  compliance-audit/diagrams/swift_2026/A1-1.png, A1-2.png, ...

Run from repo root: python backend/scripts/setup_gcs_diagram_folders.py
Requires: GOOGLE_APPLICATION_CREDENTIALS or gcloud auth, GCS_BUCKET_NAME in .env
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parent.parent
REPO_ROOT = BACKEND.parent
sys.path.insert(0, str(BACKEND))

REF_2025 = REPO_ROOT / "ref-docs" / "swift" / "2025" / "arch-diagrams"
REF_2026 = REPO_ROOT / "ref-docs" / "swift" / "2026" / "arch-diagrams"


def _normalize_filename(name: str) -> str:
    """Convert 'A1 - 1.png' -> 'A1-1.png' for frontend compatibility."""
    base = name.rsplit(".", 1)[0] if "." in name else name
    ext = name.rsplit(".", 1)[1] if "." in name else "png"
    # Remove spaces: "A1 - 1" -> "A1-1", "B -1" -> "B-1"
    base_clean = re.sub(r"\s+", "", base)
    return f"{base_clean}.{ext}"


def _get_client_and_bucket():
    from app.config import settings
    if not settings.GCS_BUCKET_NAME:
        print("ERROR: GCS_BUCKET_NAME not set in .env", file=sys.stderr)
        sys.exit(1)
    from google.cloud import storage
    client = storage.Client()
    return client, client.bucket(settings.GCS_BUCKET_NAME)


def _gcs_prefix() -> str:
    from app.config import settings
    p = (settings.GCS_PREFIX or "compliance-audit").strip("/")
    return f"{p}/diagrams" if p else "diagrams"


def copy_flat_to_swift_2025(bucket) -> int:
    """Copy objects from diagrams/*.png to diagrams/swift_2025/."""
    prefix = _gcs_prefix()
    flat_prefix = f"{prefix}/"
    target_prefix = f"{prefix}/swift_2025/"
    blobs = list(bucket.list_blobs(prefix=flat_prefix))
    # Only direct children: diagrams/X.png (not diagrams/swift_2025/X.png)
    to_copy = [
        b for b in blobs
        if b.name.startswith(flat_prefix)
        and "/swift_2025/" not in b.name
        and "/swift_2026/" not in b.name
        and b.name[len(flat_prefix):].count("/") == 0
        and len(b.name) > len(flat_prefix)
    ]
    copied = 0
    for blob in to_copy:
        short_name = blob.name.split("/")[-1]
        if not short_name or short_name.endswith("/"):
            continue
        dest_name = f"{target_prefix}{short_name}"
        bucket.copy_blob(blob, bucket, dest_name)
        print(f"  Copied {blob.name} -> {dest_name}")
        copied += 1
    return copied


def upload_from_ref(bucket, ref_dir: Path, folder: str) -> int:
    """Upload images from ref-docs arch-diagrams to GCS diagrams/{folder}/."""
    if not ref_dir.exists():
        print(f"  Skip (not found): {ref_dir}")
        return 0
    prefix = _gcs_prefix()
    target_prefix = f"{prefix}/{folder}/"
    uploaded = 0
    for f in sorted(ref_dir.glob("*.png")):
        norm_name = _normalize_filename(f.name)
        dest_name = f"{target_prefix}{norm_name}"
        blob = bucket.blob(dest_name)
        blob.upload_from_filename(str(f), content_type="image/png")
        print(f"  Uploaded {f.name} -> {norm_name} ({folder})")
        uploaded += 1
    return uploaded


def main() -> int:
    print("GCS Diagram Folders Setup")
    print("=" * 50)
    try:
        client, bucket = _get_client_and_bucket()
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)
    prefix = _gcs_prefix()
    print(f"Bucket: {bucket.name}")
    print(f"Prefix: {prefix}")
    print()

    # 1. Copy flat diagrams/* to swift_2025
    print("Step 1: Copy flat diagrams/ to swift_2025/")
    n1 = copy_flat_to_swift_2025(bucket)
    print(f"  Copied {n1} objects.")
    print()

    # 2. Upload ref-docs 2025 to swift_2025
    print("Step 2: Upload ref-docs/swift/2025/arch-diagrams to swift_2025/")
    n2 = upload_from_ref(bucket, REF_2025, "swift_2025")
    print(f"  Uploaded {n2} files.")
    print()

    # 3. Upload ref-docs 2026 to swift_2026
    print("Step 3: Upload ref-docs/swift/2026/arch-diagrams to swift_2026/")
    n3 = upload_from_ref(bucket, REF_2026, "swift_2026")
    print(f"  Uploaded {n3} files.")
    print()

    print("Done. GCS structure:")
    print(f"  {prefix}/swift_2025/  <- {n1 + n2} images")
    print(f"  {prefix}/swift_2026/  <- {n3} images")
    return 0


if __name__ == "__main__":
    sys.exit(main())
