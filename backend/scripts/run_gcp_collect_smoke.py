"""One-off: run GCP collectors and print DB counts (uses backend/.env)."""
from __future__ import annotations

import os
import sys
from pathlib import Path
from uuid import uuid4

from dotenv import load_dotenv
from sqlalchemy import text

# Ensure `app` package resolves when run as script
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

from app.aws_evidence.core.db import SessionLocal  # noqa: E402
from app.aws_evidence.models import CollectorRun, Evidence  # noqa: E402
from app.gcp_evidence.services.collector_service import run_all_gcp_collectors  # noqa: E402


def main() -> None:
    tid, cid, uid = uuid4(), uuid4(), uuid4()
    pid = (os.environ.get("GCP_EVIDENCE_PROJECT_ID") or "").strip() or "complianceaudit-488314"
    run_id = run_all_gcp_collectors(tid, cid, uid, pid, "smoke_script")
    db = SessionLocal()
    try:
        n_ev = db.query(Evidence).filter(Evidence.run_id == run_id).count()
        r = db.query(CollectorRun).filter(CollectorRun.run_id == run_id).first()
        print("run_id", run_id)
        print("status", r.status if r else None)
        print("evidence_rows_for_run", n_ev)
        gcp_runs = db.query(CollectorRun).filter(CollectorRun.cloud_provider == "gcp").count()
        row = db.execute(
            text(
                "SELECT COUNT(*) FROM swift_2026.evidence e "
                "JOIN swift_2026.collector_runs r ON e.run_id = r.run_id "
                "WHERE r.cloud_provider = 'gcp'"
            )
        ).scalar()
        print("total_gcp_runs", gcp_runs)
        print("total_gcp_evidence_join", int(row or 0))
    finally:
        db.close()


if __name__ == "__main__":
    main()
