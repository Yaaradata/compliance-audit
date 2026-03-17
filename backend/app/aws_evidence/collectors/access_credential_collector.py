"""C2, C3, C7, C8 — Privileged inventory, credential report, tokens/certs, credential storage (Secrets Manager, SSM)."""
import base64
import json
import re
from pathlib import Path
from datetime import datetime
import boto3
from botocore.exceptions import ClientError

COLLECTOR_NAME = "access_credential"
EVIDENCE_TYPE = "config"
SOURCE_SYSTEM = "aws-iam"
CONTROL_MAPPINGS = [("C2", "1.2"), ("C2", "5.1"), ("C3", "5.1"), ("C7", "5.2"), ("C8", "5.4")]


def collect(region: str, account_id: str, output_dir: Path, session=None) -> list:
    now = datetime.utcnow()
    results = []
    try:
        iam = session.client("iam") if session else boto3.client("iam")
        users_with_policies = []
        try:
            for page in iam.get_paginator("list_users").paginate():
                for u in page.get("Users", []):
                    uname = u.get("UserName")
                    attached = iam.list_attached_user_policies(UserName=uname).get("AttachedPolicies", [])
                    users_with_policies.append({"User": u, "AttachedPolicies": attached})
        except ClientError as e:
            users_with_policies = [{"error": str(e)}]

        credential_report = {}
        try:
            iam.generate_credential_report()
            import time
            time.sleep(2)
            rep = iam.get_credential_report()
            raw = rep.get("Content") or b""
            if isinstance(raw, bytes):
                raw = raw.decode("ascii")
            # Strip whitespace/newlines and non-base64 chars (can fix length mod 4)
            raw = re.sub(r"[^A-Za-z0-9+/]", "", raw)
            # Base64 length must be multiple of 4; add padding or truncate if needed
            n = len(raw) % 4
            if n == 1:
                raw = raw[:-1]  # drop 1 char so length is multiple of 4 (avoids b64decode error)
            elif n:
                raw += "=" * (4 - n)
            credential_report = {"Content": base64.b64decode(raw).decode("utf-8", errors="replace")[:5000]}
        except ClientError as e:
            credential_report = {"error": str(e)}

        roles_summary = []
        try:
            for page in iam.get_paginator("list_roles").paginate():
                roles_summary.extend(page.get("Roles", [])[:100])
        except ClientError as e:
            roles_summary = [{"error": str(e)}]

        acm_certs = []
        try:
            acm = session.client("acm", region_name=region) if session else boto3.client("acm", region_name=region)
            for page in acm.get_paginator("list_certificates").paginate():
                acm_certs.extend(page.get("CertificateSummaryList", []))
        except ClientError as e:
            acm_certs = [{"error": str(e)}]

        access_keys_summary = []
        try:
            for page in iam.get_paginator("list_users").paginate():
                for u in page.get("Users", []):
                    uname = u.get("UserName")
                    try:
                        keys = iam.list_access_keys(UserName=uname)
                        for k in keys.get("AccessKeyMetadata", []):
                            last = iam.get_access_key_last_used(AccessKeyId=k.get("AccessKeyId"))
                            access_keys_summary.append({"UserName": uname, "AccessKeyId": k.get("AccessKeyId"), "LastUsed": last.get("AccessKeyLastUsed")})
                    except ClientError:
                        pass
        except ClientError as e:
            access_keys_summary = [{"error": str(e)}]

        secrets_list = []
        try:
            sm = session.client("secretsmanager", region_name=region) if session else boto3.client("secretsmanager", region_name=region)
            for page in sm.get_paginator("list_secrets").paginate():
                secrets_list.extend(page.get("SecretList", [])[:50])
        except ClientError as e:
            secrets_list = [{"error": str(e)}]

        payload = {
            "collector": COLLECTOR_NAME,
            "account_id": account_id,
            "region": region,
            "collected_at": now.isoformat(),
            "users_with_policies": users_with_policies,
            "credential_report_preview": credential_report,
            "roles_summary": roles_summary,
            "acm_certificates": acm_certs,
            "access_keys_last_used": access_keys_summary,
            "secrets_manager_list": secrets_list,
        }

        path = output_dir / f"{COLLECTOR_NAME}_{now.strftime('%Y%m%d_%H%M%S')}.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, default=str)
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((path, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    except Exception as e:
        path = output_dir / f"{COLLECTOR_NAME}_{now.strftime('%Y%m%d_%H%M%S')}.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump({"collector": COLLECTOR_NAME, "account_id": account_id, "region": region, "collected_at": now.isoformat(), "error": str(e), "users_with_policies": [], "credential_report_preview": {}, "roles_summary": [], "acm_certificates": [], "access_keys_last_used": [], "secrets_manager_list": []}, f, indent=2, default=str)
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((path, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    return results
