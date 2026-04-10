#!/usr/bin/env python3
"""
SWIFT CSCF 2026 end-to-end API test (demo autofill + AI evaluation + selective reviews).

Same env logins as before (compliance officer, IT SME, L1, L2, external assessor).

Flow:
1) Login as compliance officer
2) Create cycle "test-2026" (~6 months from today, phased deadlines)
3) Set architecture A2 (UI "variant 2" is A2-2 — backend stores architecture_type "A2" only)
4) Assign IT SME, L1, L2, external assessor (unchanged)
5) Mark all controls applicable; assign all evidence items to IT SME
6) Login as IT SME: for each evidence item — POST demo autofill, POST AI evaluation
7) Submit for review for the first 12 items (in CSV order), partitioned as:
   - 5 items: approve L1 → L2 → L3 (full sign-off)
   - 3 items: approve L1 → L2 only (left pending at L3 / approver queue)
   - 4 items: L1 adds comment + decision return (to evidence uploader)

Requires: backend running, demo."2026_demo" populated, GCS demo files if items use uploads.
Env: TEST_RUN_BASE_URL, TEST_RUN_*_EMAIL / PASSWORD, TEST_RUN_HTTP_TIMEOUT, etc.
"""

from __future__ import annotations

import csv
import json
import os
import sys
from collections import OrderedDict
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
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
L1_PASSWORD = os.getenv("TEST_RUN_L1_PASSWORD", IT_SME_PASSWORD)
L2_EMAIL = os.getenv("TEST_RUN_L2_EMAIL", "l2_reviewer@gmail.com")
L2_PASSWORD = os.getenv("TEST_RUN_L2_PASSWORD", IT_SME_PASSWORD)
EXTERNAL_EMAIL = os.getenv("TEST_RUN_EXTERNAL_EMAIL", "external_approver@gmail.com")
EXTERNAL_PASSWORD = os.getenv("TEST_RUN_EXTERNAL_PASSWORD", IT_SME_PASSWORD)

CYCLE_LABEL = os.getenv("TEST_RUN_CYCLE_LABEL", "test-2026")
CYCLE_YEAR = int(os.getenv("TEST_RUN_CYCLE_YEAR", "2026"))
ARCHITECTURE_TYPE = os.getenv("TEST_RUN_ARCHITECTURE", "A2")
REQUEST_TIMEOUT_SECONDS = int(os.getenv("TEST_RUN_HTTP_TIMEOUT", "300"))
SKIP_REVIEW_ACTIONS = os.getenv("TEST_RUN_SKIP_REVIEWS", "").lower() in ("1", "true", "yes")

REPO_ROOT = Path(__file__).resolve().parents[3]
CSV_PATH = Path(
    os.getenv(
        "TEST_RUN_CSV_PATH",
        str(REPO_ROOT / "Test Data" / "2026" / "SWIFT_CSCF2026_Combined_with_Answers.csv"),
    )
)

# Review matrix sizes (first N evidence IDs in CSV order)
N_FULL_APPROVAL = int(os.getenv("TEST_RUN_N_FULL_APPROVAL", "5"))
N_L2_ONLY = int(os.getenv("TEST_RUN_N_L2_ONLY", "3"))
N_L1_RETURN = int(os.getenv("TEST_RUN_N_L1_RETURN", "4"))


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


def load_csv_evidence_order(csv_path: Path) -> OrderedDict[str, list[EvidenceQuestionRow]]:
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


def _dt(d: date, *, end_of_day: bool = False) -> str:
    if end_of_day:
        t = datetime.max.time().replace(tzinfo=timezone.utc)
    else:
        t = datetime.min.time().replace(tzinfo=timezone.utc)
    return datetime.combine(d, t, tzinfo=timezone.utc).isoformat()


def build_cycle_dates_6_months() -> dict[str, Any]:
    """~6 month window from today; phase deadlines span the cycle."""
    start = date.today()
    end = start + timedelta(days=183)
    target = start + timedelta(days=90)

    # Quarter-ish slices inside 6 months
    d1 = start + timedelta(days=46)
    d2 = start + timedelta(days=92)
    d3 = start + timedelta(days=138)

    return {
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
        "target_submission_date": target.isoformat(),
        "phase_deadlines": {
            "evidence_upload": {"start_at": _dt(start), "end_at": _dt(d1)},
            "l1_review": {"start_at": _dt(d1), "end_at": _dt(d2)},
            "l2_review": {"start_at": _dt(d2), "end_at": _dt(d3)},
            "approval": {"start_at": _dt(d3), "end_at": _dt(end, end_of_day=True)},
        },
    }


def partition_review_targets(
    evidence_ids: list[str],
) -> tuple[list[str], list[str], list[str]]:
    need = N_FULL_APPROVAL + N_L2_ONLY + N_L1_RETURN
    if len(evidence_ids) < need:
        print(
            f"[WARN] Only {len(evidence_ids)} evidence items in CSV; need {need} for full review matrix.",
            file=sys.stderr,
        )
    full = evidence_ids[:N_FULL_APPROVAL]
    l2_only = evidence_ids[N_FULL_APPROVAL : N_FULL_APPROVAL + N_L2_ONLY]
    returns = evidence_ids[N_FULL_APPROVAL + N_L2_ONLY : N_FULL_APPROVAL + N_L2_ONLY + N_L1_RETURN]
    return full, l2_only, returns


def norm_eid(s: str | None) -> str:
    return (s or "").strip().upper()


def list_reviews(api: ApiClient, cycle_id: str, level: str, status: str | None = "assigned") -> list[dict[str, Any]]:
    q = f"?level={level}"
    if status:
        q += f"&status={status}"
    data = api.request("GET", f"/assessments/{cycle_id}/reviews{q}")
    return data if isinstance(data, list) else []


def main() -> int:
    print("=== Test run: demo autofill + AI evaluation + L1/L2/L3 matrix ===")
    print(f"Base URL: {BASE_URL}")
    print(f"Cycle label: {CYCLE_LABEL!r}, architecture: {ARCHITECTURE_TYPE} (UI variant 2 = A2-2; API stores A2)")
    print(f"CSV (order): {CSV_PATH}")

    evidence_map = load_csv_evidence_order(CSV_PATH)
    evidence_ids = list(evidence_map.keys())
    if not evidence_ids:
        print("[ERROR] No evidence rows found in CSV.", file=sys.stderr)
        return 1

    full_ids, l2_only_ids, return_ids = partition_review_targets(evidence_ids)
    submit_ids = full_ids + l2_only_ids + return_ids
    full_set = {norm_eid(x) for x in full_ids}
    l2_only_set = {norm_eid(x) for x in l2_only_ids}
    return_set = {norm_eid(x) for x in return_ids}

    print(f"Evidence items (CSV order): {len(evidence_ids)}")
    print(f"  Full L1+L2+approver: {full_ids}")
    print(f"  L1+L2 only (pending L3): {l2_only_ids}")
    print(f"  L1 return w/ comment: {return_ids}")

    api = ApiClient(BASE_URL)

    print("\n[CO] Login compliance officer")
    api.login(COMPLIANCE_OFFICER_EMAIL, COMPLIANCE_OFFICER_PASSWORD)

    print("[CO] Create cycle")
    cycle_payload = {"label": CYCLE_LABEL, "cycle_year": CYCLE_YEAR, **build_cycle_dates_6_months()}
    cycle = api.request("POST", "/assessments", json_body=cycle_payload)
    cycle_id = str(cycle["id"])
    print(f"  cycle_id={cycle_id}")

    print("[CO] Set architecture")
    api.request("PUT", f"/assessments/{cycle_id}", json_body={"architecture_type": ARCHITECTURE_TYPE})

    print("[CO] Role assignments")
    users = api.request("GET", "/users")
    it_sme_user_id = find_user_id_by_email(users, IT_SME_EMAIL)
    l1_user_id = find_user_id_by_email(users, L1_EMAIL)
    l2_user_id = find_user_id_by_email(users, L2_EMAIL)
    ext_user_id = find_user_id_by_email(users, EXTERNAL_EMAIL)

    api.request(
        "PUT",
        f"/assessments/{cycle_id}/role-assignments",
        json_body={
            "assignments": [
                {"role": "it_sme", "assignment_type": "user", "user_id": it_sme_user_id},
                {"role": "internal_reviewer_l1", "assignment_type": "user", "user_id": l1_user_id},
                {"role": "internal_reviewer_l2", "assignment_type": "user", "user_id": l2_user_id},
                {"role": "external_assessor", "assignment_type": "user", "user_id": ext_user_id},
            ],
            "apply_cycle_dates_if_missing": False,
        },
    )

    print("[CO] Control scoping — all applicable")
    scoping_items = api.request("GET", f"/assessments/{cycle_id}/control-scoping")
    decisions: list[dict[str, Any]] = []
    for item in scoping_items:
        control_id = str(item.get("control_id", "")).strip()
        if not control_id or control_id.upper() == "ALL":
            continue
        decisions.append({"control_id": control_id, "scoping_decision": "applicable"})
    if decisions:
        api.request("PATCH", f"/assessments/{cycle_id}/control-scoping", json_body={"decisions": decisions})
    print(f"  {len(decisions)} controls marked applicable")

    print("[CO] Evidence assignments — all items → IT SME")
    api.request(
        "PUT",
        f"/assessments/{cycle_id}/evidence-assignments",
        json_body={
            "assignments": [
                {"evidence_item_id": eid, "assignment_type": "user", "user_id": it_sme_user_id}
                for eid in evidence_ids
            ],
            "apply_it_expert_dates_if_missing": False,
        },
    )

    print("\n[IT SME] Login")
    api.login(IT_SME_EMAIL, IT_SME_PASSWORD)

    submission_by_item: dict[str, str] = {}
    print("\n[IT SME] Demo autofill + AI evaluation (all items)")
    for idx, eid in enumerate(evidence_ids, start=1):
        print(f"  [{idx}/{len(evidence_ids)}] {eid} …", flush=True)
        af = api.request("POST", f"/demo/autofill/{cycle_id}/{eid}", json_body={})
        sid = str((af or {}).get("submission_id") or "")
        if not sid:
            sub = api.request(
                "POST",
                f"/assessments/{cycle_id}/evidence",
                json_body={"evidence_item_id": eid},
            )
            sid = str(sub["id"])
        submission_by_item[norm_eid(eid)] = sid

        eval_result = api.request(
            "POST",
            f"/assessments/{cycle_id}/evidence/evaluate",
            json_body={"evidence_item_id": eid, "submission_id": sid},
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        print(f"       evaluate overall_met={eval_result.get('overall_met')}")

    if not submit_ids:
        print("\n[SKIP] No items partitioned for submit/review.")
        print(f"\nDone. cycle_id={cycle_id}")
        return 0

    print(f"\n[IT SME] Submit for review ({len(submit_ids)} items)")
    for eid in submit_ids:
        sid = submission_by_item.get(norm_eid(eid))
        if not sid:
            print(f"  [WARN] No submission for {eid}, skip submit", file=sys.stderr)
            continue
        api.request(
            "POST",
            f"/assessments/{cycle_id}/evidence/{sid}/submit",
            json_body={"evaluation_edits": {}},
        )
        print(f"  submitted {eid} submission={sid}")

    if SKIP_REVIEW_ACTIONS:
        print("\n[SKIP] TEST_RUN_SKIP_REVIEWS set — stopping before L1/L2/L3 actions.")
        print(f"\nDone. cycle_id={cycle_id}")
        return 0

    l1_comment = (
        "L1 review (automated test): please update evidence per CSCF feedback and resubmit. "
        "See gap notes on the evaluation."
    )

    print("\n[L1] Login")
    api.login(L1_EMAIL, L1_PASSWORD)

    print("[L1] Open assigned reviews")
    l1_rows = list_reviews(api, cycle_id, "L1", "assigned")
    by_item: dict[str, dict[str, Any]] = {}
    for r in l1_rows:
        eid = norm_eid(r.get("evidence_item_id"))
        if eid:
            by_item[eid] = r

    for eid in return_ids:
        e = norm_eid(eid)
        row = by_item.get(e)
        if not row:
            print(f"  [WARN] No L1 review row for return item {eid}", file=sys.stderr)
            continue
        rid = str(row["id"])
        api.request("POST", f"/reviews/{rid}/comments", json_body={"body": l1_comment})
        api.request("PUT", f"/reviews/{rid}", json_body={"decision": "return"})
        print(f"  returned {eid} review={rid}")

    for eid in full_ids + l2_only_ids:
        e = norm_eid(eid)
        row = by_item.get(e)
        if not row:
            print(f"  [WARN] No L1 review row for {eid}", file=sys.stderr)
            continue
        rid = str(row["id"])
        api.request("PUT", f"/reviews/{rid}", json_body={"decision": "approve"})
        print(f"  approved L1 {eid} review={rid}")

    print("\n[L2] Login")
    api.login(L2_EMAIL, L2_PASSWORD)

    l2_rows = list_reviews(api, cycle_id, "L2", "assigned")
    for r in l2_rows:
        eid = norm_eid(r.get("evidence_item_id"))
        if eid not in full_set and eid not in l2_only_set:
            continue
        rid = str(r["id"])
        api.request("PUT", f"/reviews/{rid}", json_body={"decision": "approve"})
        print(f"  approved L2 {eid} review={rid}")

    print("\n[External / L3] Login")
    api.login(EXTERNAL_EMAIL, EXTERNAL_PASSWORD)

    l3_rows = list_reviews(api, cycle_id, "L3", "assigned")
    for r in l3_rows:
        eid = norm_eid(r.get("evidence_item_id"))
        if eid not in full_set:
            continue
        rid = str(r["id"])
        api.request("PUT", f"/reviews/{rid}", json_body={"decision": "approve"})
        print(f"  approved L3 {eid} review={rid}")

    pending_l3 = [norm_eid(r.get("evidence_item_id")) for r in list_reviews(api, cycle_id, "L3", "assigned")]
    pending_l3 = [x for x in pending_l3 if x in l2_only_set]
    print(f"\n[SUMMARY] cycle_id={cycle_id}")
    print(f"  Fully approved (L1+L2+L3): {sorted(full_set)}")
    print(f"  Approved L1+L2, still pending L3 (if assigned): {sorted(l2_only_set)} — remaining L3 assigned: {sorted(set(pending_l3))}")
    print(f"  Returned at L1: {sorted(return_set)}")
    print("\nDone.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        print("\nStopped.")
        raise SystemExit(0)
