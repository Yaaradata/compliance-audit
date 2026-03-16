"""Configuration for SWIFT AWS Evidence Test. Loads from .env in backend or parent backend."""
from pathlib import Path
import os

# Prefer local .env, then parent compliance-audit/backend/.env
_backend_dir = Path(__file__).resolve().parent.parent
_env_local = _backend_dir / ".env"
_env_parent = _backend_dir.parent.parent / "backend" / ".env"
_env_file = _env_local if _env_local.exists() else _env_parent

def _load_env():
    if _env_file.exists():
        with open(_env_file, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, _, v = line.partition("=")
                    os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

_load_env()

DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "compliance")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_SSL = os.getenv("DB_SSL", "false").lower() in ("true", "1", "yes")

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "")
AWS_DEFAULT_REGION = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
AWS_ACCOUNT_ID = os.getenv("AWS_ACCOUNT_ID", "").strip()

S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "swift-evidence")
SWIFT_SCHEMA = os.getenv("SWIFT_SCHEMA", "swift_2026")
# When true, read controls and evidence_sufficiency_matrix from swift_2026 (same DB) for control-wise view
USE_SWIFT_2026 = os.getenv("USE_SWIFT_2026", "false").lower() in ("true", "1", "yes")

def get_database_url() -> str:
    ssl = "?sslmode=require" if DB_SSL else ""
    return f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}{ssl}"
