"""Collect IAM users, roles, and policies for SWIFT CEI A2 / Control 1.1, 1.2."""
from datetime import datetime
import boto3
from botocore.exceptions import ClientError


COLLECTOR_NAME = "iam"
EVIDENCE_TYPE = "config"
SOURCE_SYSTEM = "aws-iam"
# One IAM snapshot can support multiple controls (environment, privileged access, password/access, logical access)
CONTROL_MAPPINGS = [("A2", "1.1"), ("A2", "1.2"), ("A2", "4.1"), ("A2", "5.1")]


def collect(region: str, account_id: str, session=None) -> list[tuple[dict, str, str, str, str]]:
    """Collect IAM data and return in-memory rows for DB persistence."""
    results = []
    now = datetime.utcnow()
    try:
        client = session.client("iam") if session else boto3.client("iam")
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
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    except Exception as e:
        payload = {
            "collector": COLLECTOR_NAME,
            "account_id": account_id,
            "region": region,
            "collected_at": now.isoformat(),
            "error": str(e),
            "users": [],
            "roles": [],
        }
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    return results
