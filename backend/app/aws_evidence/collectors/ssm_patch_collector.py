"""Collect SSM Patch Manager compliance for SWIFT CEI E1 / Control 5.1."""
import json
from pathlib import Path
from datetime import datetime
import boto3
from botocore.exceptions import ClientError


COLLECTOR_NAME = "ssm_patch"
EVIDENCE_TYPE = "config"
SOURCE_SYSTEM = "aws-ssm"
CONTROL_MAPPINGS = [("E1", "5.1"), ("E1", "2.2")]  # Patch management, security updates


def collect(region: str, account_id: str, output_dir: Path) -> list[tuple[Path, str, str, str, str]]:
    """Collect SSM patch compliance summary, write JSON. Requires instance IDs from EC2."""
    client = boto3.client("ssm", region_name=region)
    ec2 = boto3.client("ec2", region_name=region)
    results = []
    now = datetime.utcnow()

    instance_ids = []
    try:
        for page in ec2.get_paginator("describe_instances").paginate():
            for r in page.get("Reservations", []):
                for i in r.get("Instances", []):
                    if i.get("InstanceId"):
                        instance_ids.append(i["InstanceId"])
    except ClientError:
        pass

    patch_summary = []
    if instance_ids:
        try:
            paginator = client.get_paginator("describe_instance_patch_states")
            for page in paginator.paginate(InstanceIds=instance_ids):
                for s in page.get("InstancePatchStates", []):
                    patch_summary.append({
                        "InstanceId": s.get("InstanceId"),
                        "PatchGroup": s.get("PatchGroup"),
                        "InstalledCount": s.get("InstalledCount"),
                        "MissingCount": s.get("MissingCount"),
                        "FailedCount": s.get("FailedCount"),
                    })
        except ClientError as e:
            patch_summary = [{"error": str(e)}]
    else:
        patch_summary = [{"note": "No EC2 instances in region; no patch states to report"}]

    # Patch baselines
    baselines = []
    try:
        resp = client.describe_patch_baselines()
        for b in resp.get("BaselineIdentities", []):
            baselines.append({
                "BaselineId": b.get("BaselineId"),
                "BaselineName": b.get("BaselineName"),
            })
    except ClientError:
        pass

    payload = {
        "collector": COLLECTOR_NAME,
        "account_id": account_id,
        "region": region,
        "collected_at": now.isoformat(),
        "instance_patch_states": patch_summary,
        "patch_baselines": baselines,
    }

    path = output_dir / f"{COLLECTOR_NAME}_{now.strftime('%Y%m%d_%H%M%S')}.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, default=str)
    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((path, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    return results
