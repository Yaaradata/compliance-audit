import logging

from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from .config import settings

logger = logging.getLogger(__name__)

# Default schema for connections: core + public only. Framework schema (swift_2025/swift_2026) is set per-request via get_db_scoped.
SCHEMA = "swift_2025"

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
    """Default: core, swift_2025, public so reference data (domains, controls, CEI) is visible. Per-request get_db_scoped(cycle_id) overrides to cycle's schema (swift_2025 or swift_2026)."""
    cursor = dbapi_conn.cursor()
    cursor.execute("SET search_path TO core, swift_2025, public")
    cursor.close()
    dbapi_conn.commit()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def ensure_control_scoping_columns():
    """
    Ensure control scoping columns exist on control_applicability in both schemas.
    Idempotent: safe to call on every startup.
    """
    for schema in ("swift_2025", "swift_2026"):
        try:
            with engine.connect() as conn:
                conn.execute(
                    text(
                        f'ALTER TABLE "{schema}"."control_applicability" '
                        "ADD COLUMN IF NOT EXISTS scoping_decision VARCHAR(20) NOT NULL DEFAULT 'applicable'"
                    )
                )
                conn.execute(
                    text(
                        f'ALTER TABLE "{schema}"."control_applicability" '
                        "ADD COLUMN IF NOT EXISTS scoping_justification_text TEXT"
                    )
                )
                conn.execute(
                    text(
                        f'ALTER TABLE "{schema}"."control_applicability" '
                        "ADD COLUMN IF NOT EXISTS scoping_justification_file_path VARCHAR(500)"
                    )
                )
                conn.commit()
        except Exception as e:
            logger.warning(
                "Could not ensure control_scoping columns in %s: %s",
                schema,
                e,
            )


def ensure_optional_columns():
    """
    Ensure optional columns exist on evidence_submissions (and review_assignments) in both
    swift_2025 and swift_2026. Idempotent: safe to call on every startup.
    """
    for schema in ("swift_2025", "swift_2026"):
        try:
            with engine.connect() as conn:
                conn.execute(
                    text(
                        f'ALTER TABLE "{schema}"."evidence_submissions" '
                        'ADD COLUMN IF NOT EXISTS "evaluation_result" JSONB'
                    )
                )
                conn.execute(
                    text(
                        f'ALTER TABLE "{schema}"."evidence_submissions" '
                        "ADD COLUMN IF NOT EXISTS \"evaluation_edits\" JSONB NOT NULL DEFAULT '{}'"
                    )
                )
                conn.execute(
                    text(
                        f'ALTER TABLE "{schema}"."evidence_submissions" '
                        'ADD COLUMN IF NOT EXISTS "evaluation_remediation" TEXT'
                    )
                )
                conn.execute(
                    text(
                        f'ALTER TABLE "{schema}"."review_assignments" '
                        "ADD COLUMN IF NOT EXISTS \"checklist_results\" JSONB NOT NULL DEFAULT '{}'"
                    )
                )
                conn.commit()
        except Exception as e:
            logger.warning(
                "Could not ensure optional columns in %s (table may not exist yet): %s",
                schema,
                e,
            )


def ensure_notes_notifications_tables():
    """
    Create notes and notifications tables if they do not exist.
    Idempotent: safe to call on every startup. Uses same schema as migration 11.
    """
    try:
        with engine.connect() as conn:
            conn.execute(
                text(
                    f"""
                    CREATE TABLE IF NOT EXISTS "{SCHEMA}"."notes" (
                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                        tenant_id UUID NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
                        resource_type VARCHAR(50) NOT NULL,
                        resource_id UUID NOT NULL,
                        parent_id UUID REFERENCES "{SCHEMA}"."notes"(id) ON DELETE CASCADE,
                        author_id UUID NOT NULL REFERENCES core.users(id),
                        body TEXT NOT NULL,
                        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
                    )
                    """
                )
            )
            conn.execute(
                text(f'ALTER TABLE "{SCHEMA}"."notes" ADD COLUMN IF NOT EXISTS criterion_id VARCHAR(100)')
            )
            conn.execute(
                text(
                    f"""
                    CREATE TABLE IF NOT EXISTS "{SCHEMA}"."notifications" (
                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                        user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
                        resource_type VARCHAR(50) NOT NULL,
                        resource_id UUID NOT NULL,
                        action VARCHAR(50) NOT NULL,
                        actor_id UUID REFERENCES core.users(id),
                        title VARCHAR(255),
                        body TEXT,
                        read_at TIMESTAMPTZ,
                        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
                    )
                    """
                )
            )
            # Index names are not schema-qualified in PostgreSQL; index is created in table's schema
            conn.execute(text(f'CREATE INDEX IF NOT EXISTS idx_notes_resource ON "{SCHEMA}"."notes"(resource_type, resource_id)'))
            conn.execute(text(f'CREATE INDEX IF NOT EXISTS idx_notes_created ON "{SCHEMA}"."notes"(resource_type, resource_id, created_at)'))
            conn.execute(text(f'CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON "{SCHEMA}"."notifications"(user_id, created_at DESC)'))
            conn.execute(
                text(
                    f'CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON "{SCHEMA}"."notifications"(user_id) WHERE read_at IS NULL'
                )
            )
            conn.commit()
        logger.info("Notes and notifications tables ensured.")
    except Exception as e:
        logger.warning("Could not ensure notes/notifications tables (tenant/user tables may not exist yet): %s", e)


def ensure_review_hold_enum():
    """
    Add 'hold' to review_status and review_decision enums for SWIFT schemas (v2025, v2026).
    Hold allows reviewers to place items on hold for later (per-reviewer).
    Idempotent: safe to call on every startup. Uses IF NOT EXISTS (PostgreSQL 9.1+).
    """
    for schema in ("swift_2025", "swift_2026"):
        try:
            with engine.connect() as conn:
                conn.execute(text(f'ALTER TYPE "{schema}"."review_status" ADD VALUE IF NOT EXISTS \'hold\''))
                conn.execute(text(f'ALTER TYPE "{schema}"."review_decision" ADD VALUE IF NOT EXISTS \'hold\''))
                conn.commit()
        except Exception as e:
            logger.warning(
                "Could not add hold to review enums in %s (table may not exist yet): %s",
                schema,
                e,
            )


def ensure_tenant_aws_config_table():
    """
    Create core.tenant_aws_config if it does not exist.
    Stores per-tenant AWS connection (encrypted credentials) for evidence collection.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("CREATE SCHEMA IF NOT EXISTS core"))
            conn.execute(
                text(
                    """
                    CREATE TABLE IF NOT EXISTS core.tenant_aws_config (
                        tenant_id UUID PRIMARY KEY REFERENCES core.tenants(id) ON DELETE CASCADE,
                        aws_account_id VARCHAR(20),
                        aws_region VARCHAR(32) NOT NULL DEFAULT 'us-east-1',
                        connection_type VARCHAR(32) NOT NULL DEFAULT 'access_key',
                        encrypted_access_key_id TEXT,
                        encrypted_secret_access_key TEXT,
                        is_active BOOLEAN NOT NULL DEFAULT true,
                        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
                    )
                    """
                )
            )
            conn.execute(
                text(
                    "ALTER TABLE core.tenant_aws_config ADD COLUMN IF NOT EXISTS connection_type VARCHAR(32) NOT NULL DEFAULT 'access_key'"
                )
            )
            conn.execute(
                text(
                    "ALTER TABLE core.tenant_aws_config ADD COLUMN IF NOT EXISTS connected_at TIMESTAMPTZ NULL"
                )
            )
            conn.execute(
                text(
                    "ALTER TABLE core.tenant_aws_config ADD COLUMN IF NOT EXISTS sso_start_url TEXT NULL"
                )
            )
            conn.execute(
                text(
                    "ALTER TABLE core.tenant_aws_config ADD COLUMN IF NOT EXISTS sso_region VARCHAR(32) NULL"
                )
            )
            conn.execute(
                text(
                    "ALTER TABLE core.tenant_aws_config ADD COLUMN IF NOT EXISTS encrypted_refresh_token TEXT NULL"
                )
            )
            conn.execute(
                text(
                    "ALTER TABLE core.tenant_aws_config ADD COLUMN IF NOT EXISTS sso_account_id VARCHAR(20) NULL"
                )
            )
            conn.execute(
                text(
                    "ALTER TABLE core.tenant_aws_config ADD COLUMN IF NOT EXISTS sso_role_name VARCHAR(255) NULL"
                )
            )
            conn.execute(
                text(
                    "ALTER TABLE core.tenant_aws_config ADD COLUMN IF NOT EXISTS role_arn VARCHAR(512) NULL"
                )
            )
            conn.execute(
                text(
                    "ALTER TABLE core.tenant_aws_config ADD COLUMN IF NOT EXISTS external_id VARCHAR(255) NULL"
                )
            )
            conn.commit()
        logger.info("Tenant AWS config table ensured.")
    except Exception as e:
        logger.warning("Could not ensure tenant_aws_config table (core.tenants may not exist yet): %s", e)


def ensure_evidence_submission_history_table():
    """
    Create evidence_submission_history table if it does not exist.
    Idempotent: safe to call on every startup. Uses same schema as migration 10.
    """
    try:
        with engine.connect() as conn:
            conn.execute(
                text(
                    f"""
                    CREATE TABLE IF NOT EXISTS "{SCHEMA}"."evidence_submission_history" (
                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                        submission_id UUID NOT NULL REFERENCES "{SCHEMA}"."evidence_submissions"(id) ON DELETE CASCADE,
                        version INTEGER NOT NULL,
                        changed_by UUID REFERENCES core.users(id),
                        changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                        change_type VARCHAR(50) NOT NULL,
                        snapshot_before JSONB,
                        snapshot_after JSONB,
                        justification TEXT
                    )
                    """
                )
            )
            # Index names are not schema-qualified in PostgreSQL
            conn.execute(
                text(
                    f'CREATE INDEX IF NOT EXISTS idx_esh_submission ON "{SCHEMA}"."evidence_submission_history"(submission_id)'
                )
            )
            conn.execute(
                text(
                    f'CREATE INDEX IF NOT EXISTS idx_esh_changed_at ON "{SCHEMA}"."evidence_submission_history"(changed_at)'
                )
            )
            conn.commit()
        logger.info("Evidence submission history table ensured.")
    except Exception as e:
        logger.warning(
            "Could not ensure evidence_submission_history table (evidence_submissions may not exist yet): %s", e
        )
