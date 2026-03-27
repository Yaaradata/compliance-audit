#!/usr/bin/env python3
"""
Run SWIFT CSCF 2026 end-to-end test flow via API only.

Flow:
1) Login as compliance officer
2) Create cycle "test 2026" with deadlines
3) Set architecture to A1
4) Assign IT SME + L1 + L2 + External assessor
5) Mark all controls as applicable
6) Assign all evidence items to IT SME
7) Login as IT SME
8) For each evidence item from CSV:
   - create/get submission
   - fill form_data using answers from CSV (non-file questions)
   - upload matched file for file questions
   - run AI evaluation

No submit step is performed.
Press Ctrl+C to stop gracefully at any time during evidence loop.
"""

from __future__ import annotations

import csv
import json
import mimetypes
import os
import sys
import uuid
from collections import OrderedDict
from dataclasses import dataclass
from datetime import date, timedelta
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


BASE_URL = os.getenv("TEST_RUN_BASE_URL", "http://localhost:8000/api/v1").rstrip("/")

COMPLIANCE_OFFICER_EMAIL = os.getenv("TEST_RUN_COMPLIANCE_EMAIL", "ranjith.bk@yaaralabs.ai")
COMPLIANCE_OFFICER_PASSWORD = os.getenv("TEST_RUN_COMPLIANCE_PASSWORD", "Ranjith154@$#")
IT_SME_EMAIL = os.getenv("TEST_RUN_IT_SME_EMAIL", "itsme@gmail.com")
IT_SME_PASSWORD = os.getenv("TEST_RUN_IT_SME_PASSWORD", "12345678")
L1_EMAIL = os.getenv("TEST_RUN_L1_EMAIL", "l1@gmail.com")
L2_EMAIL = os.getenv("TEST_RUN_L2_EMAIL", "l2_reviewer@gmail.com")
EXTERNAL_EMAIL = os.getenv("TEST_RUN_EXTERNAL_EMAIL", "external_approver@gmail.com")

CYCLE_LABEL = os.getenv("TEST_RUN_CYCLE_LABEL", "test 2026")
CYCLE_YEAR = int(os.getenv("TEST_RUN_CYCLE_YEAR", "2026"))
ARCHITECTURE_TYPE = os.getenv("TEST_RUN_ARCHITECTURE", "A1")
REQUEST_TIMEOUT_SECONDS = int(os.getenv("TEST_RUN_HTTP_TIMEOUT", "300"))

REPO_ROOT = Path(__file__).resolve().parents[3]
CSV_PATH = Path(os.getenv("TEST_RUN_CSV_PATH", str(REPO_ROOT / "Test Data" / "2026" / "SWIFT_CSCF2026_Combined_with_Answers.csv")))
UPLOAD_DOCS_DIR = Path(os.getenv("TEST_RUN_UPLOAD_DOCS_DIR", str(REPO_ROOT / "Test Data" / "2026" / "upload_docs")))


@dataclass
class EvidenceQuestionRow:
    evidence_item_id: str
    question_key: str
    question_type: str
    answer: str


class ApiClient:
    def __init__(self, base_url: str) -> None:
        self.base_url = base_url.rstrip("/")
        self.token: str | None = None

    def set_token(self, token: str) -> None:
        self.token = token

    def login(self, email: str, password: str) -> dict[str, Any]:
        payload = {"email": email, "password": password}
        data = self.request("POST", "/auth/login", json_body=payload)
        token = data.get("token")
        if not token:
            raise RuntimeError(f"Login succeeded but token missing for user: {email}")
        self.set_token(token)
        return data

    def request(
        self,
        method: str,
        path: str,
        json_body: dict[str, Any] | list[Any] | None = None,
        headers: dict[str, str] | None = None,
        raw_body: bytes | None = None,
        timeout: int = REQUEST_TIMEOUT_SECONDS,
    ) -> Any:
        full_url = f"{self.base_url}{path}"
        req_headers: dict[str, str] = {"Accept": "application/json"}
        if headers:
            req_headers.update(headers)
        if self.token:
            req_headers["Authorization"] = f"Bearer {self.token}"

        body: bytes | None = None
        if json_body is not None:
            body = json.dumps(json_body).encode("utf-8")
            req_headers["Content-Type"] = "application/json"
        elif raw_body is not None:
            body = raw_body

        req = Request(full_url, data=body, method=method.upper(), headers=req_headers)
        try:
            with urlopen(req, timeout=timeout) as resp:
                content = resp.read().decode("utf-8")
                if not content.strip():
                    return {}
                try:
                    return json.loads(content)
                except json.JSONDecodeError:
                    return {"raw": content}
        except HTTPError as e:
            detail = e.read().decode("utf-8", errors="replace")
            print(f"[ERROR] {method.upper()} {path} -> HTTP {e.code}", file=sys.stderr)
            print(detail, file=sys.stderr)
            sys.exit(1)
        except URLError as e:
            print(f"[ERROR] {method.upper()} {path} -> URL error: {e}", file=sys.stderr)
            sys.exit(1)

    def upload_file(self, submission_id: str, file_path: Path) -> Any:
        boundary = f"----test-run-{uuid.uuid4().hex}"
        content_type = mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"
        file_bytes = file_path.read_bytes()

        parts: list[bytes] = []
        parts.append(f"--{boundary}\r\n".encode("utf-8"))
        parts.append(
            (
                f'Content-Disposition: form-data; name="file"; filename="{file_path.name}"\r\n'
                f"Content-Type: {content_type}\r\n\r\n"
            ).encode("utf-8")
        )
        parts.append(file_bytes)
        parts.append(b"\r\n")
        parts.append(f"--{boundary}--\r\n".encode("utf-8"))
        body = b"".join(parts)

        return self.request(
            "POST",
            f"/evidence/{submission_id}/files",
            headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
            raw_body=body,
        )


def load_csv_rows(csv_path: Path) -> OrderedDict[str, list[EvidenceQuestionRow]]:
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV not found: {csv_path}")

    grouped: OrderedDict[str, list[EvidenceQuestionRow]] = OrderedDict()
    with csv_path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            evidence_item_id = (row.get("evidence_item_id") or "").strip().upper()
            question_key = (row.get("question_key") or "").strip()
            question_type = (row.get("question_type") or "").strip().lower()
            answer = (row.get("answers") or "").strip()
            if not evidence_item_id or not question_key:
                continue
            grouped.setdefault(evidence_item_id, []).append(
                EvidenceQuestionRow(
                    evidence_item_id=evidence_item_id,
                    question_key=question_key,
                    question_type=question_type,
                    answer=answer,
                )
            )
    return grouped


def find_user_id_by_email(users: list[dict[str, Any]], email: str) -> str:
    email_l = email.lower().strip()
    for u in users:
        if str(u.get("email", "")).lower().strip() == email_l:
            return str(u["id"])
    raise RuntimeError(f"User not found by email: {email}")


def build_cycle_dates() -> dict[str, Any]:
    start = date.today()
    end = start + timedelta(days=90)
    target = start + timedelta(days=45)

    def d(days: int) -> str:
        return (start + timedelta(days=days)).isoformat()

    return {
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
        "target_submission_date": target.isoformat(),
        "phase_deadlines": {
            "evidence_upload": {"start_at": d(0), "end_at": d(30)},
            "l1_review": {"start_at": d(31), "end_at": d(45)},
            "l2_review": {"start_at": d(46), "end_at": d(60)},
            "approval": {"start_at": d(61), "end_at": d(90)},
        },
    }


def match_upload_file(evidence_item_id: str, upload_docs_dir: Path) -> Path | None:
    if not upload_docs_dir.exists():
        return None

    prefix = f"{evidence_item_id.upper()}_"
    exact_candidates = [upload_docs_dir / f"{evidence_item_id.upper()}.png", upload_docs_dir / f"{evidence_item_id.upper()}.pdf"]
    for p in exact_candidates:
        if p.exists() and p.is_file():
            return p

    for p in sorted(upload_docs_dir.iterdir(), key=lambda x: x.name.lower()):
        if p.is_file() and p.name.upper().startswith(prefix):
            return p
    return None


def prepare_form_data(rows: list[EvidenceQuestionRow]) -> dict[str, Any]:
    form_data: dict[str, Any] = {}
    for r in rows:
        if r.question_type == "file":
            continue
        if not r.answer:
            continue
        form_data[r.question_key] = r.answer
    return form_data


def main() -> int:
    print("=== Test Run Automation (AI evaluation only) ===")
    print(f"Base URL: {BASE_URL}")
    print(f"CSV: {CSV_PATH}")
    print(f"Upload docs: {UPLOAD_DOCS_DIR}")

    evidence_map = load_csv_rows(CSV_PATH)
    evidence_ids = list(evidence_map.keys())
    if not evidence_ids:
        print("[ERROR] No evidence rows found in CSV.", file=sys.stderr)
        return 1
    print(f"Loaded {len(evidence_ids)} evidence items from CSV.")

    api = ApiClient(BASE_URL)

    print("\n[1/8] Login as Compliance Officer")
    api.login(COMPLIANCE_OFFICER_EMAIL, COMPLIANCE_OFFICER_PASSWORD)

    print("[2/8] Create cycle")
    cycle_payload = {"label": CYCLE_LABEL, "cycle_year": CYCLE_YEAR, **build_cycle_dates()}
    cycle = api.request("POST", "/assessments", json_body=cycle_payload)
    cycle_id = str(cycle["id"])
    print(f"Created cycle: {cycle_id}")

    print("[3/8] Set architecture")
    api.request("PUT", f"/assessments/{cycle_id}", json_body={"architecture_type": ARCHITECTURE_TYPE})

    print("[4/8] Get users and assign roles (IT SME, L1, L2, External)")
    users = api.request("GET", "/users")
    it_sme_user_id = find_user_id_by_email(users, IT_SME_EMAIL)
    l1_user_id = find_user_id_by_email(users, L1_EMAIL)
    l2_user_id = find_user_id_by_email(users, L2_EMAIL)
    ext_user_id = find_user_id_by_email(users, EXTERNAL_EMAIL)

    role_assignments = {
        "assignments": [
            {"role": "it_sme", "assignment_type": "user", "user_id": it_sme_user_id},
            {"role": "internal_reviewer_l1", "assignment_type": "user", "user_id": l1_user_id},
            {"role": "internal_reviewer_l2", "assignment_type": "user", "user_id": l2_user_id},
            {"role": "external_assessor", "assignment_type": "user", "user_id": ext_user_id},
        ],
        "apply_cycle_dates_if_missing": False,
    }
    api.request("PUT", f"/assessments/{cycle_id}/role-assignments", json_body=role_assignments)

    print("[5/8] Mark all controls as applicable")
    scoping_items = api.request("GET", f"/assessments/{cycle_id}/control-scoping")
    decisions: list[dict[str, Any]] = []
    for item in scoping_items:
        control_id = str(item.get("control_id", "")).strip()
        if not control_id or control_id.upper() == "ALL":
            continue
        decisions.append({"control_id": control_id, "scoping_decision": "applicable"})
    if decisions:
        api.request("PATCH", f"/assessments/{cycle_id}/control-scoping", json_body={"decisions": decisions})
    print(f"Marked {len(decisions)} controls as applicable.")

    print("[6/8] Assign all evidence items to IT SME")
    evidence_assignments = {
        "assignments": [
            {"evidence_item_id": eid, "assignment_type": "user", "user_id": it_sme_user_id}
            for eid in evidence_ids
        ],
        "apply_it_expert_dates_if_missing": False,
    }
    api.request("PUT", f"/assessments/{cycle_id}/evidence-assignments", json_body=evidence_assignments)

    print("[7/8] Login as IT SME")
    api.login(IT_SME_EMAIL, IT_SME_PASSWORD)

    print("[8/8] Run evidence loop (create/update/upload/evaluate)")
    completed = 0
    total = len(evidence_ids)

    try:
        for idx, evidence_item_id in enumerate(evidence_ids, start=1):
            rows = evidence_map[evidence_item_id]
            print(f"\n[{idx}/{total}] Evidence {evidence_item_id}")

            submission = api.request(
                "POST",
                f"/assessments/{cycle_id}/evidence",
                json_body={"evidence_item_id": evidence_item_id},
            )
            submission_id = str(submission["id"])
            print(f"  - Submission: {submission_id}")

            form_data = prepare_form_data(rows)
            api.request(
                "PUT",
                f"/assessments/{cycle_id}/evidence/{submission_id}",
                json_body={"form_data": form_data},
            )
            print(f"  - Form answers updated: {len(form_data)} fields")

            file_questions = [r for r in rows if r.question_type == "file"]
            if file_questions:
                file_path = match_upload_file(evidence_item_id, UPLOAD_DOCS_DIR)
                if file_path and file_path.exists():
                    api.upload_file(submission_id, file_path)
                    print(f"  - File uploaded: {file_path.name}")
                else:
                    print(f"  - [WARN] No matching upload document found for {evidence_item_id}")

            eval_result = api.request(
                "POST",
                f"/assessments/{cycle_id}/evidence/evaluate",
                json_body={"evidence_item_id": evidence_item_id, "submission_id": submission_id},
                timeout=REQUEST_TIMEOUT_SECONDS,
            )
            overall_met = eval_result.get("overall_met")
            print(f"  - AI evaluation done (overall_met={overall_met})")
            completed += 1

    except KeyboardInterrupt:
        print(f"\nStopped. Completed {completed} / {total} evidence items.")
        return 0

    print(f"\nCompleted successfully. Evaluated {completed} / {total} evidence items.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        print("\nStopped.")
        raise SystemExit(0)
