"""Dynamic schema DDL for compliance pipelines.

Handles:
- Creating a new schema with staging tables (pipeline_stage_outputs, pipeline_chat_messages).
- Finalizing: templating swift_2026 DDL with new schema name, seeding from AI output.
"""

from __future__ import annotations

import json
import logging
import re
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
    return "medium"


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
    """Insert Stage 1 output (controls, domains, evidence items, mappings) into the finalized schema."""
    version_tag = data.get("framework_version", schema_name)
    inserted_control_ids: set[str] = set()
    inserted_item_ids: set[str] = set()

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

    for item in data.get("canonical_evidence_items", []):
        if not isinstance(item, dict) or "id" not in item or "domain_id" not in item or "name" not in item:
            continue
        item_id = str(item.get("id") or "").strip()
        domain_id = str(item.get("domain_id") or "").strip()
        if not item_id or not domain_id:
            continue
        priority = _coerce_collection_priority(item.get("priority", "medium"))
        db.execute(text(f"""
            INSERT INTO "{schema_name}".canonical_evidence_items
                (id, domain_id, sort_order, name, priority, evidence_type, description,
                 reduction_note, control_count, cscf_version)
            VALUES (:id, :domain_id, :sort_order, :name, :priority, :evidence_type, :description,
                    :reduction_note, :control_count, :version)
            ON CONFLICT (id) DO NOTHING
        """), {
            "id": item_id, "domain_id": domain_id,
            "sort_order": item.get("sort_order", 0), "name": item["name"],
            "priority": priority,
            "evidence_type": item.get("evidence_type", "document"),
            "description": item.get("description", ""),
            "reduction_note": item.get("reduction_note"),
            "control_count": item.get("control_count", 0),
            "version": version_tag,
        })
        inserted_item_ids.add(item_id)

    for mapping in data.get("item_control_mappings", []):
        if not isinstance(mapping, dict):
            continue
        evidence_item_id = str(mapping.get("evidence_item_id") or "").strip()
        control_id = str(mapping.get("control_id") or "").strip()
        if not evidence_item_id or not control_id:
            continue
        if evidence_item_id not in inserted_item_ids or control_id not in inserted_control_ids:
            logger.warning(
                "Skipping invalid item_control_mapping in %s: evidence_item_id=%s control_id=%s",
                schema_name,
                evidence_item_id,
                control_id,
            )
            continue
        db.execute(text(f"""
            INSERT INTO "{schema_name}".item_control_mappings (evidence_item_id, control_id, is_primary, cscf_version)
            VALUES (:evidence_item_id, :control_id, :is_primary, :version)
            ON CONFLICT (evidence_item_id, control_id) DO NOTHING
        """), {
            "evidence_item_id": evidence_item_id,
            "control_id": control_id,
            "is_primary": mapping.get("is_primary", False),
            "version": version_tag,
        })


def seed_stage2_data(db: Session, schema_name: str, data: dict) -> None:
    """Insert Stage 2 output (sufficiency matrix) into the finalized schema."""
    version_tag = data.get("framework_version", schema_name)
    for row in data.get("sufficiency_matrix", []):
        ma = _coerce_ma(row.get("ma", "M"))
        db.execute(text(f"""
            INSERT INTO "{schema_name}".evidence_sufficiency_matrix
                (item_code, control_id, evidence_item_name, control_name, ma, evidence_type,
                 sufficiency_criteria, evaluation_criteria, cscf_version)
            VALUES (:item_code, :control_id, :evidence_item_name, :control_name, :ma, :evidence_type,
                    :sufficiency_criteria, :evaluation_criteria, :version)
            ON CONFLICT (item_code, control_id) DO NOTHING
        """), {
            "item_code": row["item_code"], "control_id": row["control_id"],
            "evidence_item_name": row.get("evidence_item_name", ""),
            "control_name": row.get("control_name", ""),
            "ma": ma,
            "evidence_type": row.get("evidence_type", "document"),
            "sufficiency_criteria": row.get("sufficiency_criteria", ""),
            "evaluation_criteria": row.get("evaluation_criteria", ""),
            "version": version_tag,
        })


def seed_stage3_data(db: Session, schema_name: str, data: dict) -> None:
    """Insert Stage 3 output (evaluation questions) into the finalized schema."""
    version_tag = data.get("framework_version", schema_name)

    db.execute(text(f"""
        CREATE TABLE IF NOT EXISTS "{schema_name}".evidence_based_questions (
            id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            evidence_item_id  VARCHAR(5) NOT NULL,
            question_key      VARCHAR(100) NOT NULL,
            label             TEXT NOT NULL,
            question_type     VARCHAR(20) NOT NULL,
            required          BOOLEAN NOT NULL DEFAULT true,
            placeholder       TEXT,
            options           JSONB DEFAULT '[]',
            sort_order        INTEGER NOT NULL DEFAULT 0,
            control_id        VARCHAR(255),
            rows              INTEGER,
            accept            VARCHAR(255),
            upload_label      VARCHAR(255),
            cscf_version      VARCHAR(255) NOT NULL DEFAULT '{version_tag}',
            created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
            guide             TEXT,
            evidence_required_raw TEXT,
            evidence_source   TEXT,
            collection_method TEXT
        )
    """))
    db.execute(
        text(f"""
            ALTER TABLE "{schema_name}".evidence_based_questions
                ALTER COLUMN control_id TYPE VARCHAR(255),
                ALTER COLUMN cscf_version TYPE VARCHAR(255)
        """)
    )

    for q in data.get("evaluation_questions", []):
        db.execute(text(f"""
            INSERT INTO "{schema_name}".evidence_based_questions
                (evidence_item_id, question_key, label, question_type, required, placeholder,
                 options, sort_order, control_id, accept, upload_label, guide, cscf_version)
            VALUES (:evidence_item_id, :question_key, :label, :question_type, :required, :placeholder,
                    :options, :sort_order, :control_id, :accept, :upload_label, :guide, :version)
        """), {
            "evidence_item_id": q["evidence_item_id"],
            "question_key": q["question_key"],
            "label": q["label"],
            "question_type": q.get("question_type", "text"),
            "required": q.get("required", True),
            "placeholder": q.get("placeholder"),
            "options": json.dumps(q.get("options", [])),
            "sort_order": q.get("sort_order", 0),
            "control_id": q.get("control_id"),
            "accept": q.get("accept"),
            "upload_label": q.get("upload_label"),
            "guide": q.get("guide"),
            "version": version_tag,
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
