"""Collect CloudTrail configuration for SWIFT CEI C1 / Control 3.1."""
from datetime import datetime
import boto3
from botocore.exceptions import ClientError


COLLECTOR_NAME = "cloudtrail"
EVIDENCE_TYPE = "config"
SOURCE_SYSTEM = "aws-cloudtrail"
CONTROL_MAPPINGS = [("C1", "3.1"), ("C1", "6.4")]  # Logging and monitoring


def collect(region: str, account_id: str, session=None) -> list[tuple[dict, str, str, str, str]]:
    """Collect CloudTrail trails and status in memory."""
    results = []
    now = datetime.utcnow()
    try:
        return _collect(region, account_id, now, results, session)
    except Exception as e:
        payload = {"collector": COLLECTOR_NAME, "account_id": account_id, "region": region, "collected_at": now.isoformat(), "error": str(e), "trails": []}
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
        return results


def _collect(region: str, account_id: str, now: datetime, results: list, session=None) -> list:
    client = session.client("cloudtrail", region_name=region) if session else boto3.client("cloudtrail", region_name=region)
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

    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    return results
