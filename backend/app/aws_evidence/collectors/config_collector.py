"""Collect AWS Config configuration for SWIFT CEI D1 / Control 4.1."""
import json
from pathlib import Path
from datetime import datetime
import boto3
from botocore.exceptions import ClientError


COLLECTOR_NAME = "config"
EVIDENCE_TYPE = "config"
SOURCE_SYSTEM = "aws-config"
CONTROL_MAPPINGS = [("D1", "4.1"), ("D1", "2.3")]  # Config compliance, system hardening


def collect(region: str, account_id: str, output_dir: Path, session=None) -> list[tuple[Path, str, str, str, str]]:
    """Collect AWS Config recorders and status, write JSON."""
    results = []
    now = datetime.utcnow()
    try:
        _collect_config(region, account_id, output_dir, now, results, session)
    except Exception as e:
        path = output_dir / f"{COLLECTOR_NAME}_{now.strftime('%Y%m%d_%H%M%S')}.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump({"collector": COLLECTOR_NAME, "account_id": account_id, "region": region, "collected_at": now.isoformat(), "error": str(e), "configuration_recorders": [], "recorder_statuses": []}, f, indent=2, default=str)
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((path, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    return results


def _collect_config(region: str, account_id: str, output_dir: Path, now: datetime, results: list, session=None) -> None:
    client = session.client("config", region_name=region) if session else boto3.client("config", region_name=region)
    configuration_recorders = []
    recorder_statuses = []
    try:
        resp = client.describe_configuration_recorders()
        for r in resp.get("ConfigurationRecorders", []):
            configuration_recorders.append({
                "name": r.get("name"),
                "roleARN": r.get("roleARN"),
                "recordingGroup": r.get("recordingGroup"),
            })
        status_resp = client.describe_configuration_recorder_status()
        for s in status_resp.get("ConfigurationRecorderStatuses", []):
            recorder_statuses.append(s)
    except ClientError as e:
        configuration_recorders = [{"error": str(e)}]

    payload = {
        "collector": COLLECTOR_NAME,
        "account_id": account_id,
        "region": region,
        "collected_at": now.isoformat(),
        "configuration_recorders": configuration_recorders,
        "recorder_statuses": recorder_statuses,
    }

    path = output_dir / f"{COLLECTOR_NAME}_{now.strftime('%Y%m%d_%H%M%S')}.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, default=str)
    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((path, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
