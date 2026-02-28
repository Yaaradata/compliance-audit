#!/usr/bin/env python3
"""One-time script to upload architecture diagrams from frontend/public to GCS."""

import sys
from pathlib import Path

# Add backend to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.services import storage_service  # noqa: E402

DIAGRAMS_DIR = backend_dir.parent / "frontend" / "public" / "architecture-diagrams"

MIME_TYPES = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
}


def main():
    if not DIAGRAMS_DIR.is_dir():
        print(f"Diagrams directory not found: {DIAGRAMS_DIR}")
        sys.exit(1)

    files = sorted(DIAGRAMS_DIR.glob("*"))
    image_files = [f for f in files if f.suffix.lower() in MIME_TYPES and f.is_file()]

    if not image_files:
        print("No image files found in", DIAGRAMS_DIR)
        sys.exit(0)

    print(f"Found {len(image_files)} diagrams to upload:")
    for f in image_files:
        mime = MIME_TYPES.get(f.suffix.lower(), "application/octet-stream")
        data = f.read_bytes()
        path = storage_service.upload_diagram(f.name, data, mime)
        print(f"  {f.name} -> {path} ({len(data):,} bytes)")

    print("Done.")


if __name__ == "__main__":
    main()
