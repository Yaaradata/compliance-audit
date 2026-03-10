#!/usr/bin/env python3
"""
Remove control 2.4A and all rows referencing it from schema swift_2026.
Deletes in dependency order to satisfy foreign keys:
  item_control_mappings, control_applicability, sufficiency_scores,
  evidence_sufficiency_matrix, reviewer_checklist, then controls.

Run from repo root: python backend/sql/scripts/remove_control_2_4a_swift_2026.py
Uses DATABASE_URL from backend/.env or environment.
"""
from __future__ import annotations

import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[2]
if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))

SCHEMA = "swift_2026"
CONTROL_ID = "2.4A"

# Tables that reference swift_2026.controls(id), in safe delete order (children first).
DELETE_ORDER = [
    "item_control_mappings",   # control_id FK
    "control_applicability",  # control_id FK
    "sufficiency_scores",     # control_id FK
    "evidence_sufficiency_matrix",  # control_id FK
    "reviewer_checklist",     # control_id (no FK but stores 2.4A)
]


def run() -> None:
    from sqlalchemy import text
    from app.database import engine

    with engine.connect() as conn:
        conn.execute(text(f"SET search_path TO {SCHEMA}, core, public"))

        for table in DELETE_ORDER:
            result = conn.execute(
                text(f'DELETE FROM {SCHEMA}.{table} WHERE control_id = :cid'),
                {"cid": CONTROL_ID},
            )
            n = result.rowcount
            print(f"  {SCHEMA}.{table}: deleted {n} row(s) where control_id = {CONTROL_ID!r}")

        result = conn.execute(
            text(f"DELETE FROM {SCHEMA}.controls WHERE id = :cid"),
            {"cid": CONTROL_ID},
        )
        n = result.rowcount
        if n:
            print(f"  {SCHEMA}.controls: deleted 1 row id = {CONTROL_ID!r}")
        else:
            print(f"  {SCHEMA}.controls: no row with id = {CONTROL_ID!r} (may already be removed)")

        conn.commit()

    print("Done.")


if __name__ == "__main__":
    run()
