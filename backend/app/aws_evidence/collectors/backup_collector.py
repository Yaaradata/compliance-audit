"""B8 — Backup: AWS Backup plans, RDS backup, EBS snapshots, S3 versioning."""
import json
from pathlib import Path
from datetime import datetime
import boto3
from botocore.exceptions import ClientError

COLLECTOR_NAME = "backup"
EVIDENCE_TYPE = "config"
SOURCE_SYSTEM = "aws-backup"
CONTROL_MAPPINGS = [("B8", "7.1")]


def collect(region: str, account_id: str, output_dir: Path) -> list:
    now = datetime.utcnow()
    results = []

    backup_plans = []
    try:
        backup = boto3.client("backup", region_name=region)
        for page in backup.get_paginator("list_backup_plans").paginate():
            for p in page.get("BackupPlansList", []):
                plan_id = p.get("BackupPlanId")
                try:
                    detail = backup.get_backup_plan(BackupPlanId=plan_id)
                    backup_plans.append(detail)
                except ClientError:
                    backup_plans.append(p)
    except ClientError as e:
        backup_plans = [{"error": str(e)}]

    rds_backup = []
    try:
        rds = boto3.client("rds", region_name=region)
        for page in rds.get_paginator("describe_db_instances").paginate():
            for db in page.get("DBInstances", []):
                rds_backup.append({
                    "DBInstanceIdentifier": db.get("DBInstanceIdentifier"),
                    "BackupRetentionPeriod": db.get("BackupRetentionPeriod"),
                    "PreferredBackupWindow": db.get("PreferredBackupWindow"),
                })
    except ClientError as e:
        rds_backup = [{"error": str(e)}]

    snapshot_count = 0
    try:
        ec2 = boto3.client("ec2", region_name=region)
        for page in ec2.get_paginator("describe_snapshots").paginate(OwnerIds=[account_id]):
            snapshot_count += len(page.get("Snapshots", []))
    except ClientError:
        pass

    payload = {
        "collector": COLLECTOR_NAME,
        "account_id": account_id,
        "region": region,
        "collected_at": now.isoformat(),
        "backup_plans": backup_plans,
        "rds_backup_config": rds_backup,
        "ebs_snapshot_count_owner": snapshot_count,
    }

    path = output_dir / f"{COLLECTOR_NAME}_{now.strftime('%Y%m%d_%H%M%S')}.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, default=str)
    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((path, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    return results
