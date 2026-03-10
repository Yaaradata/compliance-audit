#!/usr/bin/env python3
"""
Load 2025 control architecture applicability from control_architecture_applicability_2025.json
into swift_2025.controls (update name and architecture_applicability).

Run from repo root:
  python backend/sql/scripts/load_2025_control_architecture.py

Requires: 02_seed_reference_data.sql (or equivalent swift_2025 controls seed) applied first.
Uses app.database engine (same as API).
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BACKEND))

REPO_ROOT = BACKEND.parent
JSON_PATH = REPO_ROOT / "ref-docs" / "swift" / "2025" / "control_architecture_applicability_2025.json"
SCHEMA = "swift_2025"


def main() -> None:
    if not JSON_PATH.exists():
        print(f"Not found: {JSON_PATH}", file=sys.stderr)
        sys.exit(1)

    with open(JSON_PATH, encoding="utf-8") as f:
        data = json.load(f)

    try:
        from sqlalchemy import text
        from app.database import engine
    except ImportError as e:
        print(f"Import error: {e}. Run from repo root with backend on PYTHONPATH.", file=sys.stderr)
        sys.exit(1)

    controls = data.get("controls") or []
    if not controls:
        print("No controls in JSON", file=sys.stderr)
        sys.exit(1)

    with engine.connect() as conn:
        conn.execute(text(f"SET search_path TO {SCHEMA}, public"))
        for c in controls:
            cid = c["control_id"]
            name = c["control_name"]
            arch = c["architecture_applicability"]
            arr = "{" + ",".join(arch) + "}" if isinstance(arch, list) else "{}"
            conn.execute(
                text(
                    """
                    UPDATE swift_2025.controls
                    SET name = :name, architecture_applicability = :arch::text[]
                    WHERE id = :id
                    """
                ),
                {"id": cid, "name": name, "arch": arr},
            )
        conn.commit()

    print(f"Updated {len(controls)} controls in {SCHEMA}.controls from {JSON_PATH.name}")


if __name__ == "__main__":
    main()
