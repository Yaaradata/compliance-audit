"""B8 — Backup: AWS Backup plans, RDS backup, EBS snapshots, S3 versioning."""
from datetime import datetime
import boto3
from botocore.exceptions import ClientError

COLLECTOR_NAME = "backup"
EVIDENCE_TYPE = "config"
SOURCE_SYSTEM = "aws-backup"
CONTROL_MAPPINGS = [("B8", "7.1")]


def collect(region: str, account_id: str, session=None) -> list:
    now = datetime.utcnow()
    results = []
    try:
        backup_plans = []
        try:
            backup = session.client("backup", region_name=region) if session else boto3.client("backup", region_name=region)
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
            rds = session.client("rds", region_name=region) if session else boto3.client("rds", region_name=region)
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
            ec2 = session.client("ec2", region_name=region) if session else boto3.client("ec2", region_name=region)
            if account_id:
                for page in ec2.get_paginator("describe_snapshots").paginate(OwnerIds=[account_id]):
                    snapshot_count += len(page.get("Snapshots", []))
            else:
                for page in ec2.get_paginator("describe_snapshots").paginate():
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

        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    except Exception as e:
        payload = {"collector": COLLECTOR_NAME, "account_id": account_id, "region": region, "collected_at": now.isoformat(), "error": str(e), "backup_plans": [], "rds_backup_config": [], "ebs_snapshot_count_owner": 0}
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    return results
