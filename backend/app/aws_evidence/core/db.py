"""SQLAlchemy engine and session for the SWIFT AWS evidence schema."""
from pathlib import Path

from sqlalchemy import text
from sqlalchemy.orm import declarative_base, sessionmaker

from app.database import engine

from .config import SWIFT_SCHEMA

# Use the main FastAPI engine so GCP/AWS evidence routes share one connection pool
# (defaults on a second engine were pool_size=5 / max_overflow=10 and exhausted under concurrent dashboard calls).
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

_SQL_DIR = Path(__file__).resolve().parents[2] / "sql"
_MIGRATIONS = [
    "01_swift_2026_schema.sql",
    "02_add_ended_at.sql",
    "03_add_response_json.sql",
    "04_drop_storage_uri.sql",
    "05_add_run_error_message.sql",
    "06_add_tenant_id.sql",
    "07_evidence_cloud_provider.sql",
]


def _run_sql_file(conn, filepath: Path) -> None:
    """Execute SQL file statement by statement (split at ; then newline)."""
    import re

    sql = filepath.read_text(encoding="utf-8")
    lines: list[str] = []
    for line in sql.splitlines():
        if line.strip().startswith("--"):
            continue
        lines.append(line)
    block = "\n".join(lines)
    parts = re.split(r";\s*\n", block)
    for stmt in parts:
        stmt = stmt.strip().strip(";").strip()
        if not stmt:
            continue
        conn.execute(text(stmt + ";"))
    conn.commit()


_schema_ensured = False


def ensure_schema() -> None:
    """Create schema swift_2026 and run migrations so all tables exist.

    Runs only once per process — subsequent calls are no-ops.  The heavy
    UPDATE that backfills ``cloud_provider`` from ``collector_runs`` would
    lock the evidence table for seconds on a remote DB; doing that on
    every AWS-click request caused the "step 2/5" hang.
    """
    global _schema_ensured
    if _schema_ensured:
        return

    with engine.connect() as conn:
        conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {SWIFT_SCHEMA}"))
        conn.commit()
    for name in _MIGRATIONS:
        path = _SQL_DIR / name
        if path.exists():
            with engine.connect() as conn:
                _run_sql_file(conn, path)
    with engine.connect() as conn:
        conn.execute(text(
            f"ALTER TABLE {SWIFT_SCHEMA}.collector_runs ADD COLUMN IF NOT EXISTS error_message TEXT NULL"
        ))
        conn.execute(text(
            f"ALTER TABLE {SWIFT_SCHEMA}.collector_runs ADD COLUMN IF NOT EXISTS tenant_id UUID NULL"
        ))
        conn.execute(text(
            f"ALTER TABLE {SWIFT_SCHEMA}.evidence ADD COLUMN IF NOT EXISTS tenant_id UUID NULL"
        ))
        conn.execute(text(
            f"ALTER TABLE {SWIFT_SCHEMA}.evidence ADD COLUMN IF NOT EXISTS cloud_provider VARCHAR(16) NULL"
        ))
        conn.execute(text(
            f"""
            UPDATE {SWIFT_SCHEMA}.evidence AS e
            SET cloud_provider = cr.cloud_provider
            FROM {SWIFT_SCHEMA}.collector_runs AS cr
            WHERE e.run_id = cr.run_id
              AND (e.cloud_provider IS NULL OR e.cloud_provider = '')
            """
        ))
        conn.execute(
            text(
                """
DO $ebq_azure$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'swift_2026' AND table_name = 'evidence_based_questions'
  ) THEN
    ALTER TABLE swift_2026.evidence_based_questions
      ADD COLUMN IF NOT EXISTS azure_auto_level TEXT,
      ADD COLUMN IF NOT EXISTS azure_services TEXT,
      ADD COLUMN IF NOT EXISTS question_level_azure_sources TEXT;
  END IF;
END
$ebq_azure$;
"""
            )
        )
        conn.commit()

    _schema_ensured = True


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Shared SWIFT evidence schema (collector_runs, evidence) for both AWS and GCP HTTP routers.
get_swift_evidence_db = get_db

