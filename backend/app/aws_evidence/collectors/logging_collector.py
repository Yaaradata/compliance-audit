"""E2 — SIEM/Logging: CloudTrail trails, Log Groups retention, VPC Flow Logs, S3 logging."""
import json
from pathlib import Path
from datetime import datetime
import boto3
from botocore.exceptions import ClientError

COLLECTOR_NAME = "logging"
EVIDENCE_TYPE = "config"
SOURCE_SYSTEM = "aws-logging"
CONTROL_MAPPINGS = [("E2", "6.4")]


def collect(region: str, account_id: str, output_dir: Path) -> list:
    now = datetime.utcnow()
    results = []

    trails = []
    try:
        ct = boto3.client("cloudtrail", region_name=region)
        resp = ct.describe_trails()
        for t in resp.get("trails", []):
            name = t.get("Name")
            status = {}
            try:
                status = ct.get_trail_status(Name=name)
            except ClientError:
                pass
            trails.append({"Trail": t, "Status": status})
    except ClientError as e:
        trails = [{"error": str(e)}]

    log_groups = []
    try:
        logs = boto3.client("logs", region_name=region)
        for page in logs.get_paginator("describe_log_groups").paginate():
            for lg in page.get("logGroups", [])[:100]:
                log_groups.append({"logGroupName": lg.get("logGroupName"), "retentionInDays": lg.get("retentionInDays")})
    except ClientError as e:
        log_groups = [{"error": str(e)}]

    flow_logs = []
    try:
        ec2 = boto3.client("ec2", region_name=region)
        for page in ec2.get_paginator("describe_flow_logs").paginate():
            flow_logs.extend(page.get("FlowLogs", []))
    except ClientError as e:
        flow_logs = [{"error": str(e)}]

    payload = {
        "collector": COLLECTOR_NAME,
        "account_id": account_id,
        "region": region,
        "collected_at": now.isoformat(),
        "cloudtrail_trails": trails,
        "log_groups_retention": log_groups,
        "flow_logs": flow_logs,
    }

    path = output_dir / f"{COLLECTOR_NAME}_{now.strftime('%Y%m%d_%H%M%S')}.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, default=str)
    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((path, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    return results
