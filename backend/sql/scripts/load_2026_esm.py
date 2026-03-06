#!/usr/bin/env python3
"""
Load swift_2026.evidence_sufficiency_matrix from CSCF_v2026_Complete_Sufficiency_Matrix.xlsx.
Columns: Item Code, Evidence Item Name, Control ID, Control Name, M/A, Evidence Type,
         Sufficiency Criteria (JSON), Evaluation / AI Scoring Criteria (JSON with pass_if, fail_if, cross_checks).
Run from repo root: python backend/sql/scripts/load_2026_esm.py
Requires: openpyxl, swift_2026 schema and CEI/controls loaded.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BACKEND))

REPO_ROOT = BACKEND.parent
XLSX_PATH = REPO_ROOT / "ref-docs" / "swift" / "2026" / "CSCF_v2026_Complete_Sufficiency_Matrix.xlsx"
SCHEMA = "swift_2026"


def _parse_json_cell(raw) -> str | None:
    if raw is None:
        return None
    s = str(raw).strip()
    if not s or not s.startswith("{"):
        return None
    try:
        json.loads(s)
        return s
    except json.JSONDecodeError:
        return None


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

    # Data starts after header row (row index 2 = "Item Code", ...)
    if len(rows) < 4:
        return []
    data_rows = rows[3:]

    out: list[dict] = []
    for r in data_rows:
        r = list(r) + [None] * 10
        item_code = str(r[0] or "").strip()[:5]
        evidence_item_name = str(r[1] or "").strip()[:255]
        control_id = str(r[2] or "").strip()[:10]
        control_name = str(r[3] or "").strip()[:255]
        ma = (str(r[4] or "M").strip()[:1] or "M").upper()
        if ma not in ("M", "A"):
            ma = "M"
        evidence_type = str(r[5] or "").strip()[:100]
        sufficiency_criteria = _parse_json_cell(r[6])
        evaluation_criteria = _parse_json_cell(r[7])

        if not item_code or not control_id:
            continue

        out.append({
            "item_code": item_code,
            "control_id": control_id,
            "evidence_item_name": evidence_item_name,
            "control_name": control_name,
            "ma": ma,
            "evidence_type": evidence_type,
            "sufficiency_criteria": sufficiency_criteria,
            "evaluation_criteria": evaluation_criteria,
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
                    INSERT INTO evidence_sufficiency_matrix
                    (item_code, control_id, evidence_item_name, control_name, ma, evidence_type, sufficiency_criteria, evaluation_criteria, cscf_version)
                    VALUES (:item_code, :control_id, :evidence_item_name, :control_name, :ma, :evidence_type, :suff, :eval_crit, '2026v')
                    ON CONFLICT (item_code, control_id) DO UPDATE SET
                        evidence_item_name = EXCLUDED.evidence_item_name,
                        control_name = EXCLUDED.control_name,
                        ma = EXCLUDED.ma,
                        evidence_type = EXCLUDED.evidence_type,
                        sufficiency_criteria = EXCLUDED.sufficiency_criteria,
                        evaluation_criteria = EXCLUDED.evaluation_criteria
                """),
                {
                    "item_code": row["item_code"],
                    "control_id": row["control_id"],
                    "evidence_item_name": row["evidence_item_name"],
                    "control_name": row["control_name"],
                    "ma": row["ma"],
                    "evidence_type": row["evidence_type"],
                    "suff": row["sufficiency_criteria"],
                    "eval_crit": row["evaluation_criteria"],
                },
            )
        conn.commit()

    print(f"Loaded {len(rows)} rows into {SCHEMA}.evidence_sufficiency_matrix.")


def main():
    rows = read_excel(XLSX_PATH)
    if not rows:
        print("No data rows found.", file=sys.stderr)
        sys.exit(1)
    load_into_db(rows)


if __name__ == "__main__":
    main()
