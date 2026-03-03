import logging

from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from .config import settings

logger = logging.getLogger(__name__)

SCHEMA = "cscf_2025_new"

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    pool_recycle=300,
    echo=False,
)


@event.listens_for(engine, "connect")
def set_search_path(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute(f"SET search_path TO {SCHEMA}, public")
    cursor.close()
    dbapi_conn.commit()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def ensure_optional_columns():
    """
    Ensure optional columns exist on evidence_submissions without requiring a separate migration.
    Idempotent: safe to call on every startup.
    """
    try:
        with engine.connect() as conn:
            conn.execute(
                text(
                    f'ALTER TABLE "{SCHEMA}"."evidence_submissions" '
                    "ADD COLUMN IF NOT EXISTS \"evaluation_edits\" JSONB NOT NULL DEFAULT '{}'"
                )
            )
            conn.execute(
                text(
                    f'ALTER TABLE "{SCHEMA}"."evidence_submissions" '
                    'ADD COLUMN IF NOT EXISTS "evaluation_remediation" TEXT'
                )
            )
            conn.execute(
                text(
                    f'ALTER TABLE "{SCHEMA}"."review_assignments" '
                    "ADD COLUMN IF NOT EXISTS \"checklist_results\" JSONB NOT NULL DEFAULT '{}'"
                )
            )
            conn.commit()
    except Exception as e:
        logger.warning("Could not ensure optional evidence_submissions columns (table may not exist yet): %s", e)
