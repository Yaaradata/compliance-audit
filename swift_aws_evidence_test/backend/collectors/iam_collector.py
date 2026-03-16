"""Collect IAM users, roles, and policies for SWIFT CEI A2 / Control 1.1, 1.2."""
import json
from pathlib import Path
from datetime import datetime
import boto3
from botocore.exceptions import ClientError


COLLECTOR_NAME = "iam"
EVIDENCE_TYPE = "config"
SOURCE_SYSTEM = "aws-iam"
# One IAM snapshot can support multiple controls (environment, privileged access, password/access, logical access)
CONTROL_MAPPINGS = [("A2", "1.1"), ("A2", "1.2"), ("A2", "4.1"), ("A2", "5.1")]


def collect(region: str, account_id: str, output_dir: Path) -> list[tuple[Path, str, str, str, str]]:
    """Collect IAM data, write JSON, return list of (path, item_code, control_id, evidence_type, source_system)."""
    client = boto3.client("iam")
    results = []
    now = datetime.utcnow()

    # Users
    users = []
    try:
        paginator = client.get_paginator("list_users")
        for page in paginator.paginate():
            for u in page.get("Users", []):
                users.append({
                    "UserName": u.get("UserName"),
                    "UserId": u.get("UserId"),
                    "Arn": u.get("Arn"),
                    "CreateDate": u.get("CreateDate").isoformat() if u.get("CreateDate") else None,
                })
    except ClientError as e:
        users = {"error": str(e)}

    # Roles (summary)
    roles = []
    try:
        paginator = client.get_paginator("list_roles")
        for page in paginator.paginate():
            for r in page.get("Roles", []):
                roles.append({
                    "RoleName": r.get("RoleName"),
                    "RoleId": r.get("RoleId"),
                    "Arn": r.get("Arn"),
                })
    except ClientError as e:
        roles = {"error": str(e)}

    payload = {
        "collector": COLLECTOR_NAME,
        "account_id": account_id,
        "region": region,
        "collected_at": now.isoformat(),
        "users": users,
        "roles": roles,
    }

    path = output_dir / f"{COLLECTOR_NAME}_{now.strftime('%Y%m%d_%H%M%S')}.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, default=str)
    for item_code, control_id in CONTROL_MAPPINGS:
        results.append((path, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    return results
