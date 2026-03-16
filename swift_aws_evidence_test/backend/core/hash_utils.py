"""SHA256 hashing for evidence integrity (SWIFT audit validation)."""
import hashlib
from pathlib import Path


def sha256_file(path: Path) -> str:
    """Compute SHA256 hash of a file. Returns hex digest."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def sha256_bytes(data: bytes) -> str:
    """Compute SHA256 hash of bytes. Returns hex digest."""
    return hashlib.sha256(data).hexdigest()
