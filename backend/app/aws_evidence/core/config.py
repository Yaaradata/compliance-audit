"""Configuration for embedded SWIFT AWS Evidence components.

This is adapted from `swift_aws_evidence_test/backend/core/config.py` so that the
main FastAPI backend can use the same environment variables without depending
on a separate backend project.
"""
from pathlib import Path
import os


_backend_dir = Path(__file__).resolve().parents[3]  # points at compliance-audit/backend
_env_local = _backend_dir / ".env"


def _load_env() -> None:
    if _env_local.exists():
        with open(_env_local, encoding="utf-8") as f:
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
USE_SWIFT_2026 = os.getenv("USE_SWIFT_2026", "false").lower() in ("true", "1", "yes")


def get_database_url() -> str:
    """Match main app `Settings.database_url`: Cloud Run uses Unix socket when CLOUD_SQL_INSTANCE is set."""
    cloud_sql = os.getenv("CLOUD_SQL_INSTANCE", "").strip()
    if cloud_sql:
        ssl = "&sslmode=require" if DB_SSL else ""
        return f"postgresql://{DB_USER}:{DB_PASSWORD}@/{DB_NAME}?host=/cloudsql/{cloud_sql}{ssl}"
    ssl = "?sslmode=require" if DB_SSL else ""
    return f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}{ssl}"

