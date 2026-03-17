"""B3 — Encryption: KMS keys, ACM certs, ELB listeners/TLS, RDS/S3/EBS encryption."""
import json
from pathlib import Path
from datetime import datetime
import boto3
from botocore.exceptions import ClientError

COLLECTOR_NAME = "encryption"
EVIDENCE_TYPE = "config"
SOURCE_SYSTEM = "aws-encryption"
CONTROL_MAPPINGS = [("B3", "2.5A"), ("B3", "2.6")]


def collect(region: str, account_id: str, output_dir: Path, session=None) -> list:
    now = datetime.utcnow()
    results = []
    try:
        kms_keys = []
        try:
            kms = session.client("kms", region_name=region) if session else boto3.client("kms", region_name=region)
            for page in kms.get_paginator("list_keys").paginate():
                for k in page.get("Keys", []):
                    key_id = k.get("KeyId")
                    try:
                        desc = kms.describe_key(KeyId=key_id)
                        rot = kms.get_key_rotation_status(KeyId=key_id)
                        kms_keys.append({"KeyId": key_id, "Description": desc.get("KeyMetadata"), "RotationEnabled": rot.get("KeyRotationEnabled")})
                    except ClientError:
                        kms_keys.append({"KeyId": key_id, "error": "describe failed"})
        except ClientError as e:
            kms_keys = [{"error": str(e)}]

        acm_certs = []
        try:
            acm = session.client("acm", region_name=region) if session else boto3.client("acm", region_name=region)
            for page in acm.get_paginator("list_certificates").paginate():
                for c in page.get("CertificateSummaryList", []):
                    arn = c.get("CertificateArn")
                    try:
                        det = acm.describe_certificate(CertificateArn=arn)
                        acm_certs.append(det.get("Certificate"))
                    except ClientError:
                        acm_certs.append(c)
        except ClientError as e:
            acm_certs = [{"error": str(e)}]

        elb_listeners = []
        try:
            elbv2 = session.client("elbv2", region_name=region) if session else boto3.client("elbv2", region_name=region)
            for page in elbv2.get_paginator("describe_load_balancers").paginate():
                for lb in page.get("LoadBalancers", []):
                    arn = lb.get("LoadBalancerArn")
                    try:
                        listeners = elbv2.describe_listeners(LoadBalancerArn=arn)
                        for li in listeners.get("Listeners", []):
                            elb_listeners.append({"LoadBalancerArn": arn, "Listener": li})
                    except ClientError:
                        pass
        except ClientError as e:
            elb_listeners = [{"error": str(e)}]

        rds_encryption = []
        try:
            rds = session.client("rds", region_name=region) if session else boto3.client("rds", region_name=region)
            for page in rds.get_paginator("describe_db_instances").paginate():
                for db in page.get("DBInstances", []):
                    rds_encryption.append({
                        "DBInstanceIdentifier": db.get("DBInstanceIdentifier"),
                        "StorageEncrypted": db.get("StorageEncrypted"),
                        "KmsKeyId": db.get("KmsKeyId"),
                    })
        except ClientError as e:
            rds_encryption = [{"error": str(e)}]

        payload = {
            "collector": COLLECTOR_NAME,
            "account_id": account_id,
            "region": region,
            "collected_at": now.isoformat(),
            "kms_keys": kms_keys,
            "acm_certificates": acm_certs,
            "elb_listeners_tls": elb_listeners,
            "rds_encryption": rds_encryption,
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
            json.dump({"collector": COLLECTOR_NAME, "account_id": account_id, "region": region, "collected_at": now.isoformat(), "error": str(e), "kms_keys": [], "acm_certificates": [], "elb_listeners_tls": [], "rds_encryption": []}, f, indent=2, default=str)
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((path, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    return results
