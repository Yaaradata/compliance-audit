"""Collect EC2 instances and security groups for SWIFT CEI B1/B2."""
from datetime import datetime
import boto3
from botocore.exceptions import ClientError


COLLECTOR_NAME = "ec2"
EVIDENCE_TYPE = "config"
SOURCE_SYSTEM = "aws-ec2"
# EC2 data supports data flow, network security, system hardening
CONTROL_MAPPINGS = [("B1", "2.1"), ("B2", "2.2"), ("B2", "2.3")]


def collect(region: str, account_id: str, session=None) -> list[tuple[dict, str, str, str, str]]:
    """Collect EC2 data and return in-memory rows for DB persistence."""
    results = []
    now = datetime.utcnow()
    try:
        ec2 = session.client("ec2", region_name=region) if session else boto3.client("ec2", region_name=region)
        instances = []
        try:
            paginator = ec2.get_paginator("describe_instances")
            for page in paginator.paginate():
                for r in page.get("Reservations", []):
                    for i in r.get("Instances", []):
                        instances.append({
                            "InstanceId": i.get("InstanceId"),
                            "InstanceType": i.get("InstanceType"),
                            "State": i.get("State", {}).get("Name"),
                            "LaunchTime": i.get("LaunchTime").isoformat() if i.get("LaunchTime") else None,
                            "SecurityGroups": [sg.get("GroupId") for sg in i.get("SecurityGroups", [])],
                        })
        except ClientError as e:
            instances = [{"error": str(e)}]

        security_groups = []
        try:
            paginator = ec2.get_paginator("describe_security_groups")
            for page in paginator.paginate():
                for sg in page.get("SecurityGroups", []):
                    security_groups.append({
                        "GroupId": sg.get("GroupId"),
                        "GroupName": sg.get("GroupName"),
                        "VpcId": sg.get("VpcId"),
                    })
        except ClientError as e:
            security_groups = [{"error": str(e)}]

        payload = {
            "collector": COLLECTOR_NAME,
            "account_id": account_id,
            "region": region,
            "collected_at": now.isoformat(),
            "instances": instances,
            "security_groups": security_groups,
        }

        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    except Exception as e:
        payload = {
            "collector": COLLECTOR_NAME,
            "account_id": account_id,
            "region": region,
            "collected_at": now.isoformat(),
            "error": str(e),
            "instances": [],
            "security_groups": [],
        }
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    return results
