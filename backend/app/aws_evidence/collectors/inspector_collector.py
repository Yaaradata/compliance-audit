"""D4, D2 (partial) — Inspector v2 findings (vulnerability scan reports)."""
import json
from pathlib import Path
from datetime import datetime
import boto3
from botocore.exceptions import ClientError

COLLECTOR_NAME = "inspector"
EVIDENCE_TYPE = "config"
SOURCE_SYSTEM = "aws-inspector"
CONTROL_MAPPINGS = [("D4", "2.7"), ("D2", "2.2")]


def collect(region: str, account_id: str, output_dir: Path, session=None) -> list:
    now = datetime.utcnow()
    results = []
    try:
        _collect_inspector(region, account_id, output_dir, now, results, session)
    except Exception as e:
        path = output_dir / f"{COLLECTOR_NAME}_{now.strftime('%Y%m%d_%H%M%S')}.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump({"collector": COLLECTOR_NAME, "account_id": account_id, "region": region, "collected_at": now.isoformat(), "error": str(e), "finding_report_status": [], "findings_sample": []}, f, indent=2, default=str)
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((path, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    return results


def _collect_inspector(region: str, account_id: str, output_dir: Path, now: datetime, results: list, session=None) -> None:
    try:
        insp = session.client("inspector2", region_name=region) if session else boto3.client("inspector2", region_name=region)
    except ClientError as e:
        payload = {"collector": COLLECTOR_NAME, "account_id": account_id, "region": region, "collected_at": now.isoformat(), "error": str(e)}
        path = output_dir / f"{COLLECTOR_NAME}_{now.strftime('%Y%m%d_%H%M%S')}.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, default=str)
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((path, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
        return

    finding_aggs = []
    try:
        aggs = insp.list_finding_aggregations(aggregationType="FINDING_TYPE")
        finding_aggs.append(aggs)
    except ClientError as e:
        finding_aggs.append({"error": str(e)})

    findings_sample = []
    try:
        for page in insp.get_paginator("list_findings").paginate(maxResults=100):
            findings_sample.extend(page.get("findings", [])[:50])
            if len(findings_sample) >= 50:
                break
    except ClientError as e:
        findings_sample = [{"error": str(e)}]

    payload = {
        "collector": COLLECTOR_NAME,
        "account_id": account_id,
        "region": region,
        "collected_at": now.isoformat(),
        "finding_report_status": finding_aggs,
        "findings_sample": findings_sample,
    }

    path = output_dir / f"{COLLECTOR_NAME}_{now.strftime('%Y%m%d_%H%M%S')}.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, default=str)
    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((path, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
