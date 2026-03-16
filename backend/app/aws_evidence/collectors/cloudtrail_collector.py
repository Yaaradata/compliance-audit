"""Collect CloudTrail configuration for SWIFT CEI C1 / Control 3.1."""
import json
from pathlib import Path
from datetime import datetime
import boto3
from botocore.exceptions import ClientError


COLLECTOR_NAME = "cloudtrail"
EVIDENCE_TYPE = "config"
SOURCE_SYSTEM = "aws-cloudtrail"
CONTROL_MAPPINGS = [("C1", "3.1"), ("C1", "6.4")]  # Logging and monitoring


def collect(region: str, account_id: str, output_dir: Path) -> list[tuple[Path, str, str, str, str]]:
    """Collect CloudTrail trails and status, write JSON."""
    client = boto3.client("cloudtrail", region_name=region)
    results = []
    now = datetime.utcnow()

    trails = []
    try:
        resp = client.describe_trails()
        for t in resp.get("trails", []):
            trails.append({
                "Name": t.get("Name"),
                "TrailARN": t.get("TrailARN"),
                "IsMultiRegionTrail": t.get("IsMultiRegionTrail"),
                "HomeRegion": t.get("HomeRegion"),
            })
        # Get event selectors for first trail if any
        if trails:
            status_resp = client.get_trail_status(Name=trails[0]["Name"])
            trails[0]["Status"] = status_resp
    except ClientError as e:
        trails = [{"error": str(e)}]

    payload = {
        "collector": COLLECTOR_NAME,
        "account_id": account_id,
        "region": region,
        "collected_at": now.isoformat(),
        "trails": trails,
    }

    path = output_dir / f"{COLLECTOR_NAME}_{now.strftime('%Y%m%d_%H%M%S')}.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, default=str)
    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((path, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    return results
