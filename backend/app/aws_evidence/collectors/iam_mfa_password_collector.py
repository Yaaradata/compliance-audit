"""B4 (MFA), B5 (Password policy) — IAM MFA devices, account password policy."""
from datetime import datetime
import boto3
from botocore.exceptions import ClientError

COLLECTOR_NAME = "iam_mfa_password"
EVIDENCE_TYPE = "config"
SOURCE_SYSTEM = "aws-iam"
CONTROL_MAPPINGS = [("B4", "4.2"), ("B5", "4.1")]


def collect(region: str, account_id: str, session=None) -> list:
    now = datetime.utcnow()
    results = []
    try:
        iam = session.client("iam") if session else boto3.client("iam")
        password_policy = {}
        try:
            password_policy = iam.get_account_password_policy().get("PasswordPolicy", {})
        except ClientError as e:
            if "NoSuchEntity" in str(e):
                password_policy = {"note": "No custom password policy (defaults apply)"}
            else:
                password_policy = {"error": str(e)}

        mfa_devices_by_user = []
        try:
            for page in iam.get_paginator("list_users").paginate():
                for u in page.get("Users", []):
                    uname = u.get("UserName")
                    try:
                        mfa = iam.list_mfa_devices(UserName=uname)
                        mfa_devices_by_user.append({"UserName": uname, "MFADevices": mfa.get("MFADevices", [])})
                    except ClientError:
                        mfa_devices_by_user.append({"UserName": uname, "MFADevices": []})
        except ClientError as e:
            mfa_devices_by_user = [{"error": str(e)}]

        account_summary = {}
        try:
            account_summary = iam.get_account_summary()
        except ClientError as e:
            account_summary = {"error": str(e)}

        payload = {
            "collector": COLLECTOR_NAME,
            "account_id": account_id,
            "region": region,
            "collected_at": now.isoformat(),
            "password_policy": password_policy,
            "mfa_devices_by_user": mfa_devices_by_user,
            "account_summary": account_summary.get("SummaryMap", account_summary),
        }

        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    except Exception as e:
        payload = {"collector": COLLECTOR_NAME, "account_id": account_id, "region": region, "collected_at": now.isoformat(), "error": str(e), "password_policy": {}, "mfa_devices_by_user": [], "account_summary": {}}
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    return results
