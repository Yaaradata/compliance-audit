#!/usr/bin/env python3
"""
Load swift_2026.canonical_evidence_items from SWIFT_CSCF_v2026_Canonical_Evidence_Model.xlsx.
Also inserts item_control_mappings from "Controls Served" column.
Run from repo root: python backend/sql/scripts/load_2026_cei.py
Requires: openpyxl, 14_seed_swift_2026_domains_controls.sql applied first.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BACKEND))

REPO_ROOT = BACKEND.parent
XLSX_PATH = REPO_ROOT / "ref-docs" / "swift" / "2026" / "SWIFT_CSCF_v2026_Canonical_Evidence_Model.xlsx"
SCHEMA = "swift_2026"


def _parse_priority(s: str) -> str:
    s = (s or "").strip().upper()
    if "CRITICAL" in s:
        return "critical"
    if "HIGH" in s:
        return "high"
    return "medium"


def _domain_id(domain_cell: str) -> str:
    """Extract single char A–H from 'A: Network & Architecture'."""
    if not domain_cell:
        return "A"
    m = re.match(r"^([A-H])", (domain_cell or "").strip(), re.I)
    return m.group(1).upper() if m else "A"


def _control_ids(controls_served: str) -> list[str]:
    """Parse '1.1, 1.4, 1.5, 2.1, 2.4, 2.5A' -> ['1.1','1.4','1.5','2.1','2.4','2.5A']."""
    if not controls_served:
        return []
    return [c.strip() for c in re.split(r"[,;]", str(controls_served)) if c.strip()]


def read_excel(path: Path) -> list[dict]:
    try:
        import openpyxl
    except ImportError:
        print("pip install openpyxl", file=sys.stderr)
        sys.exit(1)
    if not path.exists():
        print(f"Not found: {path}", file=sys.stderr)
        sys.exit(1)

    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    wb.close()

    # Header row 3 (0-indexed row 3)
    if len(rows) < 5:
        return []
    header = [str(c or "").strip() for c in rows[3]]
    data_rows = rows[4:]

    out: list[dict] = []
    for r in data_rows:
        r = list(r) + [None] * max(0, 20 - len(r))
        item_code = str(r[0] or "").strip()[:5]
        if not item_code:
            continue
        name = str(r[1] or "").strip()[:255]
        domain = _domain_id(str(r[2] or ""))
        evidence_type = str(r[3] or "Document")[:100]
        priority = _parse_priority(str(r[4] or ""))
        controls_served = str(r[5] or "").strip()
        control_count = int(r[6]) if r[6] is not None else 0
        evidence_desc = str(r[8] or "")[:5000] if len(r) > 8 else ""
        sufficiency_def = str(r[9] or "")[:5000] if len(r) > 9 else ""
        evaluation_criteria = str(r[10] or "")[:5000] if len(r) > 10 else ""

        control_ids = _control_ids(controls_served) or ([f"_{i}" for i in range(control_count)] and [])

        out.append({
            "id": item_code,
            "domain_id": domain,
            "sort_order": len(out) + 1,
            "name": name or item_code,
            "priority": priority,
            "evidence_type": evidence_type,
            "description": evidence_desc or name,
            "control_count": max(control_count, len(control_ids)),
            "evidence_description": evidence_desc,
            "sufficiency_definition": sufficiency_def or None,
            "evaluation_criteria": evaluation_criteria or None,
            "control_ids": control_ids,
        })
    return out


def load_into_db(rows: list[dict]) -> None:
    from sqlalchemy import text
    from app.database import engine

    with engine.connect() as conn:
        conn.execute(text(f"SET search_path TO {SCHEMA}, core, public"))
        for row in rows:
            conn.execute(
                text("""
                    INSERT INTO canonical_evidence_items (
                        id, domain_id, sort_order, name, priority, evidence_type, description,
                        control_count, evidence_description, sufficiency_definition, evaluation_criteria, cscf_version
                    ) VALUES (
                        :id, :domain_id, :sort_order, :name, :priority, :evidence_type, :description,
                        :control_count, :evidence_description, :sufficiency_definition, :evaluation_criteria, '2026v'
                    )
                    ON CONFLICT (id) DO UPDATE SET
                        domain_id = EXCLUDED.domain_id,
                        sort_order = EXCLUDED.sort_order,
                        name = EXCLUDED.name,
                        priority = EXCLUDED.priority,
                        evidence_type = EXCLUDED.evidence_type,
                        description = EXCLUDED.description,
                        control_count = EXCLUDED.control_count,
                        evidence_description = EXCLUDED.evidence_description,
                        sufficiency_definition = EXCLUDED.sufficiency_definition,
                        evaluation_criteria = EXCLUDED.evaluation_criteria
                """),
                {
                    "id": row["id"],
                    "domain_id": row["domain_id"],
                    "sort_order": row["sort_order"],
                    "name": row["name"],
                    "priority": row["priority"],
                    "evidence_type": row["evidence_type"],
                    "description": row["description"],
                    "control_count": row["control_count"],
                    "evidence_description": row["evidence_description"] or None,
                    "sufficiency_definition": row["sufficiency_definition"] or None,
                    "evaluation_criteria": row["evaluation_criteria"] or None,
                },
            )
        conn.commit()

        for row in rows:
            for i, ctrl_id in enumerate(row["control_ids"]):
                if not ctrl_id or ctrl_id.startswith("_"):
                    continue
                try:
                    conn.execute(
                        text("""
                            INSERT INTO item_control_mappings (evidence_item_id, control_id, is_primary, cscf_version)
                            VALUES (:item_id, :control_id, :is_primary, '2026v')
                            ON CONFLICT (evidence_item_id, control_id) DO NOTHING
                        """),
                        {"item_id": row["id"], "control_id": ctrl_id[:10], "is_primary": 1 if i == 0 else 0},
                    )
                except Exception as e:
                    # Log so A7/2.4 etc. can be debugged if control_id missing in swift_2026.controls
                    print(f"  Warning: item_control_mapping {row['id']} -> {ctrl_id[:10]}: {e}", file=sys.stderr)
        conn.commit()

    print(f"Loaded {len(rows)} CEI rows into {SCHEMA}.canonical_evidence_items.")


def main():
    rows = read_excel(XLSX_PATH)
    if not rows:
        print("No data rows found.", file=sys.stderr)
        sys.exit(1)
    load_into_db(rows)


if __name__ == "__main__":
    main()
