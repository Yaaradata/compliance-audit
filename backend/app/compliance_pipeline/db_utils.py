"""Dynamic schema DDL for compliance pipelines.

Handles:
- Creating a new schema with staging tables (pipeline_stage_outputs, pipeline_chat_messages).
- Finalizing: templating swift_2026 DDL with new schema name, seeding from AI output.
"""

from __future__ import annotations

import json
import logging
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from sqlalchemy import text
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


def _coerce_control_objective(raw: Any) -> int:
    """`controls.objective` is INTEGER 1–3 (CSCF pillar). LLM output often puts prose here."""
    if isinstance(raw, bool):
        return 1
    if isinstance(raw, int) and 1 <= raw <= 3:
        return raw
    if isinstance(raw, float) and raw.is_integer():
        i = int(raw)
        if 1 <= i <= 3:
            return i
    if isinstance(raw, str):
        s = raw.strip()
        if s.isdigit():
            i = int(s)
            if 1 <= i <= 3:
                return i
        if len(s) == 1 and s in "123":
            return int(s)
    return 1


def _merge_misplaced_objective_text(ctrl: dict, description: str) -> str:
    """If `objective` held narrative instead of 1–3, append it to description."""
    raw = ctrl.get("objective")
    desc = (description or "").strip()
    if not isinstance(raw, str):
        return desc
    s = raw.strip()
    if not s or s in ("1", "2", "3"):
        return desc
    if s.isdigit() and len(s) == 1 and s in "123":
        return desc
    if s not in desc:
        return f"{desc}\n\n{s}".strip() if desc else s
    return desc


def _coerce_control_type(raw: Any) -> str:
    """`controls.control_type` enum is only 'mandatory' | 'advisory'. LLM returns phrases like 'mandatory / advisory for B'."""
    s = str(raw or "").lower().strip()
    if s in ("mandatory", "advisory"):
        return s
    has_m = "mandatory" in s
    has_a = "advisory" in s
    if has_m and not has_a:
        return "mandatory"
    if has_a and not has_m:
        return "advisory"
    if has_m and has_a:
        return "mandatory"
    if "advisory" in s:
        return "advisory"
    if "mandatory" in s:
        return "mandatory"
    return "mandatory"


def _merge_control_type_prose(ctrl: dict, description: str) -> str:
    """Preserve original CSCF wording when we collapse hybrid types to the enum."""
    raw = ctrl.get("control_type")
    desc = (description or "").strip()
    if not isinstance(raw, str):
        return desc
    s = raw.strip()
    if s.lower() in ("mandatory", "advisory"):
        return desc
    if s and s not in desc:
        note = f"CSCF control type (source): {s}"
        return f"{desc}\n\n{note}".strip() if desc else note
    return desc


def _coerce_collection_priority(raw: Any) -> str:
    """`canonical_evidence_items.priority` enum is: critical | high | medium."""
    s = str(raw or "").strip().lower()
    if s in ("critical", "high", "medium"):
        return s
    if s in ("standard", "normal", "moderate", "default"):
        return "medium"
    if s in ("low", "minor", "optional", "nice_to_have"):
        return "medium"
    if s in ("highest", "urgent", "severe", "blocker", "p0"):
        return "critical"
    if s in ("important", "major", "p1"):
        return "high"
    if s in ("conditional",):
        return "medium"
    return "medium"


def _coerce_collection_model(raw: Any) -> str:
    """Map redesign collection_model values to current enum values."""
    s = str(raw or "").strip().lower()
    if s in ("standard", "singleton"):
        return "standard"
    if s in ("per_system",):
        return "per_system"
    if s in ("per_quarter",):
        return "per_quarter"
    if s in ("per_vendor", "per_zone", "per_access_point"):
        return "per_vendor"
    return "standard"


def _coerce_reuse_tier(raw: Any) -> str:
    """Map redesign reuse tier values to current enum values."""
    s = str(raw or "").strip().lower()
    if s in ("foundational", "ultra_high", "high", "moderate", "control_specific"):
        return s
    if s in ("medium",):
        return "moderate"
    if s in ("low",):
        return "control_specific"
    return "control_specific"


def _coerce_ma(raw: Any) -> str:
    """`evidence_sufficiency_matrix.ma` is VARCHAR(1): M or A."""
    s = str(raw or "").strip().lower()
    if s in ("m", "mandatory", "must", "required"):
        return "M"
    if s in ("a", "advisory", "optional", "recommended"):
        return "A"
    if "mandatory" in s:
        return "M"
    if "advisory" in s:
        return "A"
    if s == "m":
        return "M"
    if s == "a":
        return "A"
    return "M"


_SWIFT_TEMPLATE_SQL = Path(__file__).resolve().parents[2] / "sql" / "13_swift_2026_schema.sql"


def create_pipeline_schema(db: Session, schema_name: str) -> None:
    """Create <schema_name> with staging tables only."""
    db.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{schema_name}"'))
    db.execute(text("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\""))

    db.execute(text(f"""
        CREATE TABLE IF NOT EXISTS "{schema_name}".pipeline_stage_outputs (
            id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            pipeline_id     UUID NOT NULL REFERENCES core.compliance_pipelines(id) ON DELETE CASCADE,
            stage           INTEGER NOT NULL,
            version         INTEGER NOT NULL DEFAULT 1,
            output_data     JSONB NOT NULL DEFAULT '{{}}'::jsonb,
            status          VARCHAR(20) NOT NULL DEFAULT 'draft',
            created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    """))

    db.execute(text(f"""
        CREATE TABLE IF NOT EXISTS "{schema_name}".pipeline_chat_messages (
            id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            pipeline_id     UUID NOT NULL REFERENCES core.compliance_pipelines(id) ON DELETE CASCADE,
            stage           INTEGER NOT NULL,
            role            VARCHAR(20) NOT NULL,
            content         TEXT NOT NULL,
            created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    """))

    db.execute(text(
        f'CREATE INDEX IF NOT EXISTS idx_pso_pipeline ON "{schema_name}".pipeline_stage_outputs(pipeline_id, stage)'
    ))
    db.execute(text(
        f'CREATE INDEX IF NOT EXISTS idx_pcm_pipeline ON "{schema_name}".pipeline_chat_messages(pipeline_id, stage, created_at)'
    ))


def _template_ddl(schema_name: str) -> str:
    """Read swift_2026 DDL and replace all occurrences of swift_2026 with the target schema name."""
    if not _SWIFT_TEMPLATE_SQL.exists():
        raise FileNotFoundError(f"Template DDL not found: {_SWIFT_TEMPLATE_SQL}")
    ddl = _SWIFT_TEMPLATE_SQL.read_text(encoding="utf-8")
    ddl = ddl.replace("swift_2026", schema_name)
    ddl = re.sub(r"DEFAULT '2026v'", f"DEFAULT '{schema_name}'", ddl)
    return ddl


def create_full_schema_tables(db: Session, schema_name: str) -> None:
    """Apply the full framework DDL (enums, tables, indexes) for a finalized compliance schema."""
    ddl = _template_ddl(schema_name)
    raw_conn = db.connection().connection
    cur = raw_conn.cursor()
    try:
        cur.execute(ddl)
    finally:
        cur.close()


def ensure_dynamic_schema_control_ids(db: Session, schema_name: str) -> None:
    """
    Widen controls.id and every control_id FK column to VARCHAR(255) so AI prose IDs
    do not fail inserts. Drops FKs to controls, alters columns, re-adds constraints.
    """
    row = db.execute(
        text("""
            SELECT c.oid
            FROM pg_catalog.pg_class c
            JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = :schema_name
              AND c.relname = 'controls'
              AND c.relkind = 'r'
        """),
        {"schema_name": schema_name},
    ).first()
    if not row:
        return
    controls_oid = row[0]

    fks = db.execute(
        text("""
            SELECT c.conname AS conname,
                   rel.relname AS src_table,
                   pg_get_constraintdef(c.oid, true) AS def
            FROM pg_catalog.pg_constraint c
            JOIN pg_catalog.pg_class rel ON rel.oid = c.conrelid
            JOIN pg_catalog.pg_namespace n ON n.oid = rel.relnamespace
            WHERE c.contype = 'f'
              AND c.confrelid = :controls_oid
              AND n.nspname = :schema_name
        """),
        {"controls_oid": controls_oid, "schema_name": schema_name},
    ).mappings().all()

    for fk in fks:
        st = fk["src_table"]
        cn = fk["conname"]
        db.execute(text(f'ALTER TABLE "{schema_name}"."{st}" DROP CONSTRAINT "{cn}"'))

    db.execute(text(f'ALTER TABLE "{schema_name}".controls ALTER COLUMN id TYPE VARCHAR(255)'))

    src_tables = sorted({fk["src_table"] for fk in fks})
    for tbl in src_tables:
        db.execute(
            text(f'ALTER TABLE "{schema_name}"."{tbl}" ALTER COLUMN control_id TYPE VARCHAR(255)')
        )

    for fk in fks:
        st = fk["src_table"]
        cn = fk["conname"]
        d = fk["def"]
        db.execute(
            text(f'ALTER TABLE "{schema_name}"."{st}" ADD CONSTRAINT "{cn}" {d}')
        )

    rc = db.execute(
        text("""
            SELECT 1
            FROM pg_catalog.pg_class c
            JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = :schema_name
              AND c.relname = 'reviewer_checklist'
              AND c.relkind = 'r'
        """),
        {"schema_name": schema_name},
    ).first()
    if rc:
        db.execute(
            text(
                f'ALTER TABLE "{schema_name}".reviewer_checklist '
                f"ALTER COLUMN control_id TYPE VARCHAR(255)"
            )
        )


def ensure_dynamic_schema_text_columns(db: Session, schema_name: str) -> None:
    """
    Dynamic-schema-only widening for canonical_evidence_items.
    Does NOT touch swift_2026 or any static template schema.
    """
    db.execute(text(f"""
        ALTER TABLE IF EXISTS "{schema_name}".canonical_evidence_items
            ALTER COLUMN name TYPE VARCHAR(255),
            ALTER COLUMN evidence_type TYPE TEXT,
            ALTER COLUMN description TYPE TEXT,
            ALTER COLUMN reduction_note TYPE TEXT
    """))
    db.execute(text(f"""
        ALTER TABLE IF EXISTS "{schema_name}".canonical_evidence_items
            ADD COLUMN IF NOT EXISTS item_code TEXT
    """))
    db.execute(text(f"""
        UPDATE "{schema_name}".canonical_evidence_items
        SET item_code = id
        WHERE item_code IS NULL OR item_code = ''
    """))
    db.execute(text(f"""
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint
            WHERE conname = 'uq_pipeline_item_code'
              AND conrelid = '"{schema_name}".canonical_evidence_items'::regclass
          ) THEN
            ALTER TABLE "{schema_name}".canonical_evidence_items
              ADD CONSTRAINT uq_pipeline_item_code UNIQUE (item_code);
          END IF;
        END $$;
    """))

    # Widen cscf_version in all tables within this dynamic schema (many are VARCHAR(10) in template DDL).
    # This keeps dynamic schemas resilient to long framework version labels from AI outputs.
    rows = db.execute(
        text("""
            SELECT c.relname AS table_name
            FROM pg_catalog.pg_class c
            JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
            JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid
            WHERE n.nspname = :schema_name
              AND c.relkind = 'r'
              AND a.attname = 'cscf_version'
              AND a.attnum > 0
              AND NOT a.attisdropped
              AND NOT EXISTS (
                  SELECT 1 FROM pg_catalog.pg_inherits i WHERE i.inhrelid = c.oid
              )
        """),
        {"schema_name": schema_name},
    ).mappings().all()
    for r in rows:
        tbl = r["table_name"]
        db.execute(
            text(f'ALTER TABLE "{schema_name}"."{tbl}" ALTER COLUMN cscf_version TYPE VARCHAR(255)')
        )


def seed_stage1_data(db: Session, schema_name: str, data: dict) -> None:
    """Insert Stage 1 output (evidence_domains + controls) into finalized schema."""
    version_tag = data.get("cscf_version") or data.get("framework_version", schema_name)
    inserted_control_ids: set[str] = set()

    for domain in data.get("evidence_domains", []):
        db.execute(text(f"""
            INSERT INTO "{schema_name}".evidence_domains (id, name, color, accent_color, item_count, sort_order, cscf_version)
            VALUES (:id, :name, :color, :accent_color, :item_count, :sort_order, :version)
            ON CONFLICT (id) DO NOTHING
        """), {
            "id": domain["id"], "name": domain["name"],
            "color": domain.get("color", "#6366f1"), "accent_color": domain.get("accent_color", "#818cf8"),
            "item_count": domain.get("item_count", 0), "sort_order": domain.get("sort_order", 0),
            "version": version_tag,
        })

    for ctrl in data.get("controls", []):
        if not isinstance(ctrl, dict) or "id" not in ctrl or "name" not in ctrl:
            continue
        control_id = str(ctrl.get("id") or "").strip()
        if not control_id:
            continue
        objective = _coerce_control_objective(ctrl.get("objective", 1))
        description = _merge_misplaced_objective_text(ctrl, str(ctrl.get("description") or ""))
        control_type = _coerce_control_type(ctrl.get("control_type", "mandatory"))
        description = _merge_control_type_prose(ctrl, description)
        db.execute(text(f"""
            INSERT INTO "{schema_name}".controls (id, name, control_type, objective, architecture_applicability, description, cscf_version)
            VALUES (:id, :name, :control_type, :objective, :arch, :description, :version)
            ON CONFLICT (id) DO NOTHING
        """), {
            "id": control_id, "name": ctrl["name"],
            "control_type": control_type,
            "objective": objective,
            "arch": ctrl.get("architecture_applicability", []),
            "description": description,
            "version": version_tag,
        })
        inserted_control_ids.add(control_id)

    if len(inserted_control_ids) < 5:
        logger.warning("Stage 1 inserted fewer than 5 controls in %s", schema_name)


def seed_stage2_data(db: Session, schema_name: str, data: dict) -> None:
    """Insert Stage 2 output (canonical evidence catalog) into finalized schema."""
    version_tag = data.get("cscf_version") or data.get("framework_version", schema_name)
    rows = data.get("canonical_evidence_items") or []
    for item in rows:
        if not isinstance(item, dict):
            continue
        item_code = str(item.get("item_code") or "").strip()
        domain_id = str(item.get("domain_id") or "").strip()
        if not item_code or not domain_id:
            continue
        priority = _coerce_collection_priority(item.get("priority", "medium"))
        db.execute(text(f"""
            INSERT INTO "{schema_name}".canonical_evidence_items
                (id, item_code, domain_id, sort_order, name, priority, evidence_type, description,
                 reduction_note, control_count, collection_model, reuse_tier, input_schema,
                 sufficiency_dimensions, per_system, per_zone, per_quarter, per_access_point,
                 is_advisory, is_conditional, conditional_note, evidence_description,
                 sufficiency_definition, evaluation_criteria, cscf_version)
            VALUES
                (:id, :item_code, :domain_id, :sort_order, :name, :priority, :evidence_type, :description,
                 :reduction_note, :control_count, :collection_model, :reuse_tier, CAST(:input_schema AS jsonb),
                 CAST(:sufficiency_dimensions AS jsonb), :per_system, :per_zone, :per_quarter, :per_access_point,
                 :is_advisory, :is_conditional, :conditional_note, :evidence_description,
                 :sufficiency_definition, :evaluation_criteria, :version)
            ON CONFLICT (id) DO NOTHING
        """), {
            "id": item_code,
            "item_code": item_code,
            "domain_id": domain_id,
            "sort_order": item.get("sort_order", 0),
            "name": item.get("name", item_code),
            "priority": priority,
            "evidence_type": item.get("evidence_type", "document"),
            "description": item.get("description", ""),
            "reduction_note": item.get("reduction_note"),
            "control_count": int(item.get("control_count", 0) or 0),
            "collection_model": _coerce_collection_model(item.get("collection_model", "standard")),
            "reuse_tier": _coerce_reuse_tier(item.get("reuse_tier", "control_specific")),
            "input_schema": json.dumps(item.get("input_schema", {})),
            "sufficiency_dimensions": json.dumps(item.get("sufficiency_dimensions", {})),
            "per_system": bool(item.get("per_system", False)),
            "per_zone": bool(item.get("per_zone", False)),
            "per_quarter": bool(item.get("per_quarter", False)),
            "per_access_point": bool(item.get("per_access_point", False)),
            "is_advisory": bool(item.get("is_advisory", False)),
            "is_conditional": bool(item.get("is_conditional", False)),
            "conditional_note": item.get("conditional_note"),
            "evidence_description": item.get("evidence_description"),
            "sufficiency_definition": item.get("sufficiency_definition"),
            "evaluation_criteria": item.get("evaluation_criteria"),
            "version": version_tag,
        })

    db.execute(text(f"""
        UPDATE "{schema_name}".evidence_domains d
        SET item_count = x.cnt
        FROM (
            SELECT domain_id, COUNT(*)::int AS cnt
            FROM "{schema_name}".canonical_evidence_items
            GROUP BY domain_id
        ) x
        WHERE d.id = x.domain_id
    """))


def seed_stage3_data(db: Session, schema_name: str, data: dict) -> None:
    """Insert Stage 3 output (item_control_mappings) into finalized schema."""
    version_tag = data.get("cscf_version") or data.get("framework_version", schema_name)
    rows = data.get("item_control_mappings") or []
    for mapping in rows:
        if not isinstance(mapping, dict):
            continue
        item_code = str(mapping.get("evidence_item_code") or "").strip()
        control_id = str(mapping.get("control_id") or "").strip()
        if not item_code or not control_id:
            continue
        map_id = mapping.get("id")
        params = {
            "evidence_item_id": item_code,
            "control_id": control_id,
            "is_primary": bool(mapping.get("is_primary", True)),
            "weight": mapping.get("weight", 1.0),
            "sufficiency_requirement": mapping.get("sufficiency_requirement"),
            "version": version_tag,
        }
        if map_id:
            params["id"] = str(map_id).strip()
            db.execute(
                text(f"""
                INSERT INTO "{schema_name}".item_control_mappings
                    (id, evidence_item_id, control_id, is_primary, weight, sufficiency_requirement, cscf_version)
                VALUES
                    (CAST(:id AS uuid), :evidence_item_id, :control_id, :is_primary, :weight, :sufficiency_requirement, :version)
                ON CONFLICT (evidence_item_id, control_id) DO NOTHING
            """),
                params,
            )
        else:
            db.execute(
                text(f"""
                INSERT INTO "{schema_name}".item_control_mappings
                    (evidence_item_id, control_id, is_primary, weight, sufficiency_requirement, cscf_version)
                VALUES
                    (:evidence_item_id, :control_id, :is_primary, :weight, :sufficiency_requirement, :version)
                ON CONFLICT (evidence_item_id, control_id) DO NOTHING
            """),
                params,
            )


def seed_stage4_data(db: Session, schema_name: str, data: dict) -> None:
    """Insert Stage 4 output (evidence_sufficiency_matrix) into finalized schema."""
    version_tag = data.get("cscf_version") or data.get("framework_version", schema_name)
    rows = data.get("evidence_sufficiency_matrix") or []
    for row in rows:
        if not isinstance(row, dict):
            continue
        item_code = str(row.get("item_code") or "").strip()
        control_id = str(row.get("control_id") or "").strip()
        if not item_code or not control_id:
            continue
        ma = _coerce_ma(row.get("ma", "M"))
        db.execute(text(f"""
            INSERT INTO "{schema_name}".evidence_sufficiency_matrix
                (item_code, control_id, evidence_item_name, control_name, ma, evidence_type,
                 sufficiency_criteria, evaluation_criteria, cscf_version)
            VALUES
                (:item_code, :control_id, :evidence_item_name, :control_name, :ma, :evidence_type,
                 :sufficiency_criteria, :evaluation_criteria, :version)
            ON CONFLICT (item_code, control_id) DO NOTHING
        """), {
            "item_code": item_code,
            "control_id": control_id,
            "evidence_item_name": row.get("evidence_item_name", ""),
            "control_name": row.get("control_name", ""),
            "ma": ma,
            "evidence_type": row.get("evidence_type", "document"),
            "sufficiency_criteria": json.dumps(row.get("sufficiency_criteria", {})),
            "evaluation_criteria": json.dumps(row.get("evaluation_criteria", {})),
            "version": version_tag,
        })


def _coerce_question_created_at(val: Any) -> datetime | None:
    """Bindable timestamp for evidence_based_questions.created_at, or None to use server now()."""
    if val is None or val == "":
        return None
    if isinstance(val, datetime):
        if val.tzinfo is None:
            return val.replace(tzinfo=timezone.utc)
        return val.astimezone(timezone.utc)
    if isinstance(val, str):
        s = val.strip()
        if not s:
            return None
        if s.endswith("Z"):
            s = s[:-1] + "+00:00"
        try:
            dt = datetime.fromisoformat(s)
        except ValueError:
            return None
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    return None


def _normalize_question_uuid(val: Any) -> str:
    """
    Stage 5 / LLM output may include malformed UUID strings (wrong segment length).
    PostgreSQL rejects ::uuid on those before COALESCE can fall back — only pass valid UUIDs or ''.
    """
    if val is None:
        return ""
    if isinstance(val, uuid.UUID):
        return str(val)
    s = str(val).strip()
    if not s:
        return ""
    try:
        return str(uuid.UUID(s))
    except ValueError:
        logger.warning(
            "evidence_based_questions: invalid id %r from pipeline output; will use uuid_generate_v4()",
            s[:80],
        )
        return ""


def seed_stage5_data(db: Session, schema_name: str, data: dict) -> None:
    """Insert Stage 5 output (evidence_based_questions) into finalized schema."""
    version_tag = data.get("cscf_version") or data.get("framework_version", schema_name)

    db.execute(text(f"""
        CREATE TABLE IF NOT EXISTS "{schema_name}".evidence_based_questions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            evidence_item_id VARCHAR(20) NOT NULL,
            question_key VARCHAR(100) NOT NULL,
            label TEXT NOT NULL,
            question_type VARCHAR(20) NOT NULL,
            required BOOLEAN NOT NULL DEFAULT true,
            placeholder TEXT,
            options JSONB DEFAULT '[]',
            sort_order INTEGER NOT NULL DEFAULT 0,
            control_id VARCHAR(255),
            rows INTEGER,
            accept VARCHAR(255),
            upload_label TEXT,
            cscf_version VARCHAR(255) NOT NULL DEFAULT 'generated',
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            guide TEXT,
            show_when_question VARCHAR(100),
            show_when_values JSONB DEFAULT '[]',
            gcs_auto_level TEXT,
            gcs_services JSONB DEFAULT '[]',
            question_level_gcs_sources TEXT,
            evidence_required_raw TEXT,
            evidence_source TEXT,
            collection_method TEXT,
            aws_auto_level TEXT,
            aws_services JSONB DEFAULT '[]',
            question_level_aws_sources TEXT,
            reason_rationale TEXT,
            answers JSONB DEFAULT '{{}}',
            azure_auto_level TEXT,
            azure_services JSONB DEFAULT '[]',
            question_level_azure_sources TEXT
        )
    """))

    # Prior finalize attempts may have committed rows while later steps failed (e.g. mixed
    # connection usage) or an admin retried finalize against the same schema. CREATE TABLE IF NOT EXISTS
    # does not clear data — INSERT would hit duplicate PK on the same ids.
    db.execute(text(f'DELETE FROM "{schema_name}".evidence_based_questions'))

    used_question_ids: set[str] = set()
    for q in data.get("evidence_based_questions", []):
        if not isinstance(q, dict):
            continue
        qid = _normalize_question_uuid(q.get("id"))
        if not qid:
            qid = str(uuid.uuid4())
        elif qid in used_question_ids:
            logger.warning(
                "evidence_based_questions: duplicate id %s in finalize payload; assigning new UUID",
                qid,
            )
            qid = str(uuid.uuid4())
        used_question_ids.add(qid)

        db.execute(text(f"""
            INSERT INTO "{schema_name}".evidence_based_questions
                (id, evidence_item_id, question_key, label, question_type, required, placeholder,
                 options, sort_order, control_id, rows, accept, upload_label, cscf_version, created_at,
                 guide, show_when_question, show_when_values, gcs_auto_level, gcs_services,
                 question_level_gcs_sources, evidence_required_raw, evidence_source, collection_method,
                 aws_auto_level, aws_services, question_level_aws_sources, reason_rationale, answers,
                 azure_auto_level, azure_services, question_level_azure_sources)
            VALUES
                (COALESCE(NULLIF(:id, '')::uuid, uuid_generate_v4()), :evidence_item_id, :question_key, :label, :question_type, :required, :placeholder,
                 CAST(:options AS jsonb), :sort_order, :control_id, :rows, :accept, :upload_label, :version, COALESCE(:created_at, now()),
                 :guide, :show_when_question, CAST(:show_when_values AS jsonb), :gcs_auto_level, CAST(:gcs_services AS jsonb),
                 :question_level_gcs_sources, :evidence_required_raw, :evidence_source, :collection_method,
                 :aws_auto_level, CAST(:aws_services AS jsonb), :question_level_aws_sources, :reason_rationale, CAST(:answers AS jsonb),
                 :azure_auto_level, CAST(:azure_services AS jsonb), :question_level_azure_sources)
        """), {
            "id": qid,
            "evidence_item_id": q.get("evidence_item_id"),
            "question_key": q.get("question_key"),
            "label": q.get("label"),
            "question_type": q.get("question_type", "text"),
            "required": bool(q.get("required", True)),
            "placeholder": q.get("placeholder"),
            "options": json.dumps(q.get("options", [])),
            "sort_order": int(q.get("sort_order", 0) or 0),
            "control_id": q.get("control_id"),
            "rows": q.get("rows"),
            "accept": q.get("accept"),
            "upload_label": q.get("upload_label"),
            "version": q.get("cscf_version") or version_tag,
            "created_at": _coerce_question_created_at(q.get("created_at")),
            "guide": q.get("guide"),
            "show_when_question": q.get("show_when_question"),
            "show_when_values": json.dumps(q.get("show_when_values", [])),
            "gcs_auto_level": q.get("gcs_auto_level"),
            "gcs_services": json.dumps(q.get("gcs_services", [])),
            "question_level_gcs_sources": q.get("question_level_gcs_sources"),
            "evidence_required_raw": q.get("evidence_required_raw"),
            "evidence_source": q.get("evidence_source"),
            "collection_method": q.get("collection_method"),
            "aws_auto_level": q.get("aws_auto_level"),
            "aws_services": json.dumps(q.get("aws_services", [])),
            "question_level_aws_sources": q.get("question_level_aws_sources"),
            "reason_rationale": q.get("reason_rationale"),
            "answers": json.dumps(q.get("answers", {})),
            "azure_auto_level": q.get("azure_auto_level"),
            "azure_services": json.dumps(q.get("azure_services", [])),
            "question_level_azure_sources": q.get("question_level_azure_sources"),
        })


def register_framework(db: Session, pipeline_id: str, name: str, schema_name: str, version: str) -> None:
    """Register the new compliance framework in core.audit_frameworks."""
    def fit_col(column: str, value: str) -> str:
        max_len = db.execute(
            text("""
                SELECT character_maximum_length
                FROM information_schema.columns
                WHERE table_schema = 'core'
                  AND table_name = 'audit_frameworks'
                  AND column_name = :column
            """),
            {"column": column},
        ).scalar()
        s = str(value or "")
        if isinstance(max_len, int) and max_len > 0:
            return s[:max_len]
        return s

    # Keep cscf_version semantic (framework version label), never schema_name.
    # Some environments still have narrow VARCHAR columns (e.g. 10), so fit values safely.
    safe_code = fit_col("code", schema_name)
    safe_name = fit_col("name", name)
    safe_version = fit_col("version", version)
    safe_schema_name = fit_col("schema_name", schema_name)
    safe_cscf_version = fit_col("cscf_version", version)

    db.execute(text("""
        INSERT INTO core.audit_frameworks (code, name, version, schema_name, is_active, cscf_version)
        VALUES (:code, :name, :version, :schema_name, true, :cscf_version)
        ON CONFLICT DO NOTHING
    """), {
        "code": safe_code,
        "name": safe_name,
        "version": safe_version,
        "schema_name": safe_schema_name,
        "cscf_version": safe_cscf_version,
    })
