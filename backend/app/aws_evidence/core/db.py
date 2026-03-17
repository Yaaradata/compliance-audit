"""SQLAlchemy engine and session for the SWIFT AWS evidence schema."""
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

from .config import get_database_url, SWIFT_SCHEMA


engine = create_engine(get_database_url(), pool_pre_ping=True)
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


def ensure_schema() -> None:
    """Create schema swift_2026 and run migrations so all tables exist."""
    with engine.connect() as conn:
        conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {SWIFT_SCHEMA}"))
        conn.commit()
    for name in _MIGRATIONS:
        path = _SQL_DIR / name
        if path.exists():
            with engine.connect() as conn:
                _run_sql_file(conn, path)
    # Ensure error_message and tenant_id exist (in case migrations didn't run or failed)
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
        conn.commit()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

