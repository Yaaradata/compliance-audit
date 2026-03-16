"""SQLAlchemy engine and session for PostgreSQL (Cloud SQL). Schema: swift_2026."""
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import get_database_url, SWIFT_SCHEMA

engine = create_engine(get_database_url(), pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

_SQL_DIR = Path(__file__).resolve().parent.parent / "sql"
_MIGRATIONS = ["01_swift_2026_schema.sql", "02_add_ended_at.sql"]


def _run_sql_file(conn, filepath: Path) -> None:
    """Execute SQL file statement by statement (split at ; then newline)."""
    import re
    sql = filepath.read_text(encoding="utf-8")
    # Remove single-line comments
    lines = []
    for line in sql.splitlines():
        if line.strip().startswith("--"):
            continue
        lines.append(line)
    block = "\n".join(lines)
    # Split at semicolon followed by newline (so we don't split inside (...) or strings)
    parts = re.split(r";\s*\n", block)
    for stmt in parts:
        stmt = stmt.strip().strip(";").strip()
        if not stmt:
            continue
        conn.execute(text(stmt + ";"))
    conn.commit()


def ensure_schema():
    """Create schema swift_2026 and run migrations so all tables exist (GCP Cloud SQL)."""
    with engine.connect() as conn:
        conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {SWIFT_SCHEMA}"))
        conn.commit()
    for name in _MIGRATIONS:
        path = _SQL_DIR / name
        if path.exists():
            with engine.connect() as conn:
                _run_sql_file(conn, path)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
