"""
Demo autofill: same mapping as scripts/test_run/run_full_cycle.py (load_csv_rows + prepare_form_data).
Reads Test Data/2026/SWIFT_CSCF2026_Combined_with_Answers.csv (or DEMO_AUTOFILL_CSV_PATH).

Also exposes DB-backed helpers that read from demo."2026_demo" and download matching files
from GCS under the "demo/" prefix (same bucket as normal evidence uploads).
"""

from __future__ import annotations

import csv
import logging
import mimetypes
import os
from pathlib import Path

logger = logging.getLogger(__name__)

CSV_NAME = "SWIFT_CSCF2026_Combined_with_Answers.csv"
CSV_REL = ("Test Data", "2026", CSV_NAME)


def _find_csv_under_parents() -> Path | None:
    """
    Walk up from this file until we find repo/Test Data/2026/<CSV_NAME>.
    More reliable than a fixed parents[N] when the package is nested differently.
    """
    here = Path(__file__).resolve().parent
    for _ in range(8):
        candidate = here.joinpath(*CSV_REL)
        if candidate.is_file():
            return candidate
        if here.parent == here:
            break
        here = here.parent
    return None


def default_csv_path() -> Path:
    found = _find_csv_under_parents()
    if found:
        return found
    # Fallback: same layout as run_full_cycle.py (repo root = parents[3] of this file)
    return Path(__file__).resolve().parents[3].joinpath(*CSV_REL)


def resolve_csv_path() -> Path:
    env = os.getenv("DEMO_AUTOFILL_CSV_PATH", "").strip()
    if env:
        return Path(env)
    return default_csv_path()


def prepare_form_data_for_item(evidence_item_id: str, csv_path: Path | None = None) -> dict[str, str]:
    """
    Non-file questions only; skips empty answers (matches run_full_cycle.prepare_form_data).
    """
    path = csv_path or resolve_csv_path()
    eid = evidence_item_id.strip().upper()
    form_data: dict[str, str] = {}
    if not path.is_file():
        return form_data

    with path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if (row.get("evidence_item_id") or "").strip().upper() != eid:
                continue
            question_key = (row.get("question_key") or "").strip()
            question_type = (row.get("question_type") or "").strip().lower()
            answer = (row.get("answers") or "").strip()
            if not question_key or question_type == "file":
                continue
            if answer:
                form_data[question_key] = answer
    return form_data


# ──────────────────────────────────────────────────────────────────────────────
# DB-backed helpers (reads from demo."2026_demo" table + GCS demo/ prefix)
# ──────────────────────────────────────────────────────────────────────────────

def prepare_form_data_from_db(evidence_item_id: str, db_session) -> dict[str, str]:
    """
    Read non-file answers from demo."2026_demo" for the given evidence_item_id.

    The table schema mirrors the CSV columns: evidence_item_id, question_key,
    question_type, answers (all TEXT).  Rows with question_type = 'file' or
    empty answers are skipped — identical behaviour to prepare_form_data_for_item.
    """
    from sqlalchemy import text as sa_text

    eid = evidence_item_id.strip().upper()
    rows = db_session.execute(
        sa_text(
            'SELECT question_key, question_type, answers '
            'FROM demo."2026_demo" '
            'WHERE UPPER(evidence_item_id) = :eid'
        ),
        {"eid": eid},
    ).fetchall()

    form_data: dict[str, str] = {}
    for r in rows:
        question_key = (r.question_key or "").strip()
        question_type = (r.question_type or "").strip().lower()
        answer = (r.answers or "").strip()
        if not question_key or question_type == "file":
            continue
        if answer:
            form_data[question_key] = answer

    logger.debug("prepare_form_data_from_db(%s): %d fields", eid, len(form_data))
    return form_data


def match_gcs_demo_file(evidence_item_id: str) -> tuple[bytes, str, str] | None:
    """
    Download the first matching blob from the GCS bucket under the ``demo/``
    folder.

    The demo files live at the **bucket root** level:
        gs://<GCS_BUCKET_NAME>/demo/<files>

    NOT under GCS_PREFIX (which is used only for uploaded evidence artifacts).
    The folder structure seen in the bucket is:
        compliance_audit01/
          demo/
            A1.png
            A2_SWIFT_Component_Inventory_....xlsx
            ...

    Matching logic (same as run_full_cycle.match_upload_file):
        1. Exact   → demo/<EID>.png / .pdf / .xlsx / .docx / .zip
        2. Prefix  → demo/<EID>_*  (first alphabetical hit)

    Returns (file_bytes, file_name, content_type) or None when not found.
    Returns None silently if GCS is not configured (dev/local mode).
    """
    from ..config import settings

    if settings.STORAGE_BACKEND != "gcs" or not settings.GCS_BUCKET_NAME:
        logger.info("match_gcs_demo_file: GCS not configured, skipping file match.")
        return None

    from google.cloud import storage as gcs  # type: ignore[import-untyped]

    eid = evidence_item_id.strip().upper()

    # Demo files are stored directly in the bucket under demo/ (no GCS_PREFIX)
    demo_prefix = "demo/"

    client = gcs.Client()
    bucket = client.bucket(settings.GCS_BUCKET_NAME)

    blobs = list(bucket.list_blobs(prefix=demo_prefix))
    logger.info(
        "match_gcs_demo_file(%s): found %d blob(s) under gs://%s/%s",
        eid, len(blobs), settings.GCS_BUCKET_NAME, demo_prefix,
    )
    if not blobs:
        return None

    # Build upper-cased filename → blob map (skip folder placeholder blobs)
    blob_map: dict[str, object] = {}
    for b in blobs:
        fname = b.name.split("/")[-1]
        if fname:  # skip empty (folder placeholder)
            blob_map[fname.upper()] = b

    # 1. Exact match: <EID>.<ext>
    for ext in (".PNG", ".PDF", ".XLSX", ".DOCX", ".ZIP", ".JPG", ".JPEG"):
        candidate = f"{eid}{ext}"
        if candidate in blob_map:
            blob = blob_map[candidate]
            data = blob.download_as_bytes()  # type: ignore[union-attr]
            original_name = blob.name.split("/")[-1]  # type: ignore[union-attr]
            ct = mimetypes.guess_type(original_name)[0] or "application/octet-stream"
            logger.info("match_gcs_demo_file(%s): exact match → %s", eid, original_name)
            return data, original_name, ct

    # 2. Prefix match: <EID>_* (first alphabetical)
    prefix_upper = f"{eid}_"
    candidates = sorted(
        [(name, b) for name, b in blob_map.items() if name.startswith(prefix_upper)],
        key=lambda x: x[0],
    )
    if candidates:
        _, blob = candidates[0]
        data = blob.download_as_bytes()  # type: ignore[union-attr]
        original_name = blob.name.split("/")[-1]  # type: ignore[union-attr]
        ct = mimetypes.guess_type(original_name)[0] or "application/octet-stream"
        logger.info("match_gcs_demo_file(%s): prefix match → %s", eid, original_name)
        return data, original_name, ct

    logger.info(
        "match_gcs_demo_file(%s): no match found in %d blob(s). Available: %s",
        eid, len(blob_map), list(blob_map.keys())[:20],
    )
    return None
