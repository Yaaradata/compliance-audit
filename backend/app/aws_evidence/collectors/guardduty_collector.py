"""E1, E6, E7 — GuardDuty detector, malware protection, findings (IDS/IPS, admin monitoring)."""
import json
from pathlib import Path
from datetime import datetime
import boto3
from botocore.exceptions import ClientError

COLLECTOR_NAME = "guardduty"
EVIDENCE_TYPE = "config"
SOURCE_SYSTEM = "aws-guardduty"
CONTROL_MAPPINGS = [("E1", "6.1"), ("E6", "6.5A"), ("E7", "6.4")]


def collect(region: str, account_id: str, output_dir: Path, session=None) -> list:
    now = datetime.utcnow()
    results = []
    try:
        _collect(region, account_id, output_dir, now, results, session)
    except Exception as e:
        path = output_dir / f"{COLLECTOR_NAME}_{now.strftime('%Y%m%d_%H%M%S')}.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump({"collector": COLLECTOR_NAME, "account_id": account_id, "region": region, "collected_at": now.isoformat(), "error": str(e), "detector_configs": [], "findings_statistics": []}, f, indent=2, default=str)
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((path, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    return results


def _collect(region: str, account_id: str, output_dir: Path, now: datetime, results: list, session=None) -> None:
    try:
        gd = session.client("guardduty", region_name=region) if session else boto3.client("guardduty", region_name=region)
        detectors = gd.list_detectors().get("DetectorIds", [])
    except ClientError as e:
        payload = {"collector": COLLECTOR_NAME, "account_id": account_id, "region": region, "collected_at": now.isoformat(), "error": str(e), "detectors": []}
        path = output_dir / f"{COLLECTOR_NAME}_{now.strftime('%Y%m%d_%H%M%S')}.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, default=str)
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((path, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
        return

    detector_configs = []
    findings_summary = []
    for det_id in detectors[:3]:
        try:
            det = gd.get_detector(DetectorId=det_id)
            detector_configs.append({"DetectorId": det_id, "Config": det.get("Configuration", {})})
        except ClientError:
            pass
        try:
            find = gd.get_findings_statistics(DetectorId=det_id, FindingStatisticTypes=["COUNT_BY_SEVERITY"])
            findings_summary.append({"DetectorId": det_id, "FindingStatistics": find.get("FindingStatistics", {})})
        except ClientError:
            pass

    payload = {
        "collector": COLLECTOR_NAME,
        "account_id": account_id,
        "region": region,
        "collected_at": now.isoformat(),
        "detector_configs": detector_configs,
        "findings_statistics": findings_summary,
    }

    path = output_dir / f"{COLLECTOR_NAME}_{now.strftime('%Y%m%d_%H%M%S')}.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, default=str)
    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((path, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
