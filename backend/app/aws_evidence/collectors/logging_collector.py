"""E2 — SIEM/Logging: CloudTrail trails, Log Groups retention, VPC Flow Logs, S3 logging."""
from datetime import datetime
import boto3
from botocore.exceptions import ClientError

COLLECTOR_NAME = "logging"
EVIDENCE_TYPE = "config"
SOURCE_SYSTEM = "aws-logging"
CONTROL_MAPPINGS = [("E2", "6.4")]


def collect(region: str, account_id: str, session=None) -> list:
    now = datetime.utcnow()
    results = []
    try:
        trails = []
        try:
            ct = session.client("cloudtrail", region_name=region) if session else boto3.client("cloudtrail", region_name=region)
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
            logs = session.client("logs", region_name=region) if session else boto3.client("logs", region_name=region)
            for page in logs.get_paginator("describe_log_groups").paginate():
                for lg in page.get("logGroups", [])[:100]:
                    log_groups.append({"logGroupName": lg.get("logGroupName"), "retentionInDays": lg.get("retentionInDays")})
        except ClientError as e:
            log_groups = [{"error": str(e)}]

        flow_logs = []
        try:
            ec2 = session.client("ec2", region_name=region) if session else boto3.client("ec2", region_name=region)
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

        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    except Exception as e:
        payload = {"collector": COLLECTOR_NAME, "account_id": account_id, "region": region, "collected_at": now.isoformat(), "error": str(e), "cloudtrail_trails": [], "log_groups_retention": [], "flow_logs": []}
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    return results
