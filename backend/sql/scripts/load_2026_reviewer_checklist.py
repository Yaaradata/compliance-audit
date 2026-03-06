#!/usr/bin/env python3
"""
Load swift_2026.reviewer_checklist from ref-docs/swift/2026/reviewer_checklist_v2026.csv.
CSV columns: id, item_code, evidence_item, control_id, control_name, mandatory_advisory, cscf_version, l1_check, l2_check, l3_check (JSON strings).
Run from repo root: python backend/sql/scripts/load_2026_reviewer_checklist.py
"""
from __future__ import annotations

import csv
import json
import sys
import uuid
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BACKEND))

REPO_ROOT = BACKEND.parent
CSV_PATH = REPO_ROOT / "ref-docs" / "swift" / "2026" / "reviewer_checklist_v2026.csv"
SCHEMA = "swift_2026"


def read_csv(path: Path) -> list[dict]:
    if not path.exists():
        print(f"Not found: {path}", file=sys.stderr)
        sys.exit(1)

    rows: list[dict] = []
    for encoding in ("utf-8", "cp1252", "latin-1"):
        try:
            with open(path, newline="", encoding=encoding) as f:
                reader = csv.DictReader(f)
                for r in reader:
                    item_code = (r.get("item_code") or "").strip()[:5]
                    control_id = (r.get("control_id") or "").strip()[:20]
                    if not item_code or not control_id:
                        continue
                    l1 = r.get("l1_check", "").strip()
                    l2 = r.get("l2_check", "").strip()
                    l3 = r.get("l3_check", "").strip()
                    l1_obj = json.loads(l1) if l1 and l1.startswith("{") else None
                    l2_obj = json.loads(l2) if l2 and l2.startswith("{") else None
                    l3_obj = json.loads(l3) if l3 and l3.startswith("{") else None

                    rows.append({
                        "id": (r.get("id") or "").strip() or str(uuid.uuid4()),
                        "item_code": item_code,
                        "evidence_item": (r.get("evidence_item") or "")[:500],
                        "control_id": control_id,
                        "control_name": (r.get("control_name") or "")[:500],
                        "mandatory_advisory": (r.get("mandatory_advisory") or "M")[:10],
                        "l1_check": l1_obj,
                        "l2_check": l2_obj,
                        "l3_check": l3_obj,
                    })
            return rows
        except UnicodeDecodeError:
            continue
    return rows


def load_into_db(rows: list[dict]) -> None:
    from sqlalchemy import text
    from app.database import engine

    with engine.connect() as conn:
        conn.execute(text(f"SET search_path TO {SCHEMA}, core, public"))
        conn.execute(text("TRUNCATE reviewer_checklist CASCADE"))
        conn.commit()

        for row in rows:
            l1 = json.dumps(row["l1_check"], ensure_ascii=False) if row["l1_check"] else None
            l2 = json.dumps(row["l2_check"], ensure_ascii=False) if row["l2_check"] else None
            l3 = json.dumps(row["l3_check"], ensure_ascii=False) if row["l3_check"] else None
            conn.execute(
                text("""
                    INSERT INTO reviewer_checklist (id, item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check, cscf_version)
                    VALUES (CAST(:id AS uuid), :item_code, :evidence_item, :control_id, :control_name, :mandatory_advisory, CAST(:l1 AS jsonb), CAST(:l2 AS jsonb), CAST(:l3 AS jsonb), '2026v')
                """),
                {
                    "id": row["id"],
                    "item_code": row["item_code"],
                    "evidence_item": row["evidence_item"],
                    "control_id": row["control_id"],
                    "control_name": row["control_name"],
                    "mandatory_advisory": row["mandatory_advisory"],
                    "l1": l1,
                    "l2": l2,
                    "l3": l3,
                },
            )
        conn.commit()

    print(f"Loaded {len(rows)} rows into {SCHEMA}.reviewer_checklist.")


def main():
    rows = read_csv(CSV_PATH)
    if not rows:
        print("No data rows found.", file=sys.stderr)
        sys.exit(1)
    load_into_db(rows)


if __name__ == "__main__":
    main()
