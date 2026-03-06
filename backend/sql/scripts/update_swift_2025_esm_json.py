#!/usr/bin/env python3
"""
Update swift_2025.evidence_sufficiency_matrix from CSCF_v2025_Complete_Sufficiency_Matrix_JSON.xlsx.
Sets sufficiency_criteria and evaluation_criteria from sheet columns (JSON).
evaluation_criteria format: {"pass_if": [], "fail_if": [], "cross_checks": []}.
Run from repo root: python backend/sql/scripts/update_swift_2025_esm_json.py
Requires: openpyxl, migration 12 applied (swift_2025 exists).
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BACKEND))

REPO_ROOT = BACKEND.parent
XLSX_PATH = REPO_ROOT / "ref-docs" / "swift" / "2025" / "CSCF_v2025_Complete_Sufficiency_Matrix_JSON.xlsx"
SCHEMA = "swift_2025"


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

    if len(rows) < 4:
        return []
    data_rows = rows[3:]

    out: list[dict] = []
    for r in data_rows:
        r = list(r) + [None] * 10
        item_code = str(r[0] or "").strip()[:5]
        control_id = str(r[2] or "").strip()[:10]
        if not item_code or not control_id:
            continue
        sufficiency_criteria = _parse_json_cell(r[6])
        evaluation_criteria = _parse_json_cell(r[7])
        out.append({
            "item_code": item_code,
            "control_id": control_id,
            "sufficiency_criteria": sufficiency_criteria,
            "evaluation_criteria": evaluation_criteria,
        })
    return out


def update_db(rows: list[dict]) -> None:
    from sqlalchemy import text
    from app.database import engine

    with engine.connect() as conn:
        conn.execute(text(f"SET search_path TO {SCHEMA}, core, public"))
        updated = 0
        for row in rows:
            r = conn.execute(
                text("""
                    UPDATE evidence_sufficiency_matrix
                    SET sufficiency_criteria = :suff, evaluation_criteria = :eval_crit
                    WHERE item_code = :item_code AND control_id = :control_id
                """),
                {
                    "item_code": row["item_code"],
                    "control_id": row["control_id"],
                    "suff": row["sufficiency_criteria"],
                    "eval_crit": row["evaluation_criteria"],
                },
            )
            updated += r.rowcount
        conn.commit()

    print(f"Updated {updated} rows in {SCHEMA}.evidence_sufficiency_matrix.")


def main():
    rows = read_excel(XLSX_PATH)
    if not rows:
        print("No data rows found.", file=sys.stderr)
        sys.exit(1)
    update_db(rows)


if __name__ == "__main__":
    main()
