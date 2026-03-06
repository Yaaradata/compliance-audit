#!/usr/bin/env python3
"""
Sync swift_2026 names from swift_2025 and align evidence_item_name with CEI name.

Logic:
  - In swift_2026, match canonical_evidence_items.id with evidence_sufficiency_matrix.item_code.
  - For items that exist in swift_2025 (A1–A6, etc.): copy name from swift_2025.canonical_evidence_items
    into swift_2026.canonical_evidence_items, then set swift_2026.evidence_sufficiency_matrix.evidence_item_name
    from swift_2026.canonical_evidence_items.name so both are aligned.
  - A7 is new in 2026: leave swift_2026.canonical_evidence_items.name and
    swift_2026.evidence_sufficiency_matrix.evidence_item_name unchanged for item_code = 'A7'.

Run from repo root: python backend/sql/scripts/sync_esm_names_from_cei.py
Or from backend: python sql/scripts/sync_esm_names_from_cei.py (with PYTHONPATH=.)
"""
from __future__ import annotations

import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BACKEND))

SCHEMA_2025 = "swift_2025"
SCHEMA_2026 = "swift_2026"
# New in 2026; do not overwrite name or evidence_item_name.
SKIP_ITEM_CODE = "A7"


def main() -> None:
    from sqlalchemy import text
    from app.database import engine

    with engine.connect() as conn:
        # -------------------------------------------------------------------------
        # Step 1: In swift_2026, set CEI.name from swift_2025 for all items except A7
        # -------------------------------------------------------------------------
        conn.execute(
            text("SET search_path TO core, public")
        )
        r1 = conn.execute(
            text("""
                UPDATE swift_2026.canonical_evidence_items cei_2026
                SET name = cei_2025.name
                FROM swift_2025.canonical_evidence_items cei_2025
                WHERE cei_2026.id = cei_2025.id
                  AND cei_2026.id <> :skip
                  AND (cei_2026.name IS DISTINCT FROM cei_2025.name)
            """),
            {"skip": SKIP_ITEM_CODE},
        )
        cei_updated = r1.rowcount

        # -------------------------------------------------------------------------
        # Step 2: In swift_2026, set evidence_sufficiency_matrix.evidence_item_name
        #         from canonical_evidence_items.name where item_code = id, excluding A7
        # -------------------------------------------------------------------------
        r2 = conn.execute(
            text("""
                UPDATE swift_2026.evidence_sufficiency_matrix esm
                SET evidence_item_name = cei.name
                FROM swift_2026.canonical_evidence_items cei
                WHERE esm.item_code = cei.id
                  AND esm.item_code <> :skip
                  AND (esm.evidence_item_name IS DISTINCT FROM cei.name)
            """),
            {"skip": SKIP_ITEM_CODE},
        )
        esm_updated = r2.rowcount

        conn.commit()

    print(
        f"swift_2026 sync (excluding {SKIP_ITEM_CODE}): "
        f"canonical_evidence_items.name updated from 2025: {cei_updated} row(s); "
        f"evidence_sufficiency_matrix.evidence_item_name aligned with CEI: {esm_updated} row(s)."
    )


if __name__ == "__main__":
    main()
