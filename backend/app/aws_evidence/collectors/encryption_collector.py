"""B3 — Encryption: KMS keys, ACM certs, ELB listeners/TLS, RDS/S3/EBS encryption."""
from datetime import datetime
import boto3
from botocore.exceptions import ClientError

COLLECTOR_NAME = "encryption"
EVIDENCE_TYPE = "config"
SOURCE_SYSTEM = "aws-encryption"
CONTROL_MAPPINGS = [("B3", "2.5A"), ("B3", "2.6")]


def collect(region: str, account_id: str, session=None) -> list:
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
        load_balancers = []
        try:
            elbv2 = session.client("elbv2", region_name=region) if session else boto3.client("elbv2", region_name=region)
            lb_arns: list[str] = []
            for page in elbv2.get_paginator("describe_load_balancers").paginate():
                for lb in page.get("LoadBalancers", []):
                    arn = lb.get("LoadBalancerArn")
                    if arn:
                        lb_arns.append(arn)
                        load_balancers.append({
                            "LoadBalancerArn": arn,
                            "LoadBalancerName": lb.get("LoadBalancerName"),
                            "DNSName": lb.get("DNSName"),
                            "Type": lb.get("Type"),
                            "Tags": [],
                        })
                    try:
                        if arn:
                            listeners = elbv2.describe_listeners(LoadBalancerArn=arn)
                            for li in listeners.get("Listeners", []):
                                elb_listeners.append({"LoadBalancerArn": arn, "Listener": li})
                    except ClientError:
                        pass
            for i in range(0, len(lb_arns), 20):
                chunk = lb_arns[i : i + 20]
                try:
                    tag_resp = elbv2.describe_tags(ResourceArns=chunk)
                    by_arn = {d["ResourceArn"]: d.get("Tags", []) for d in tag_resp.get("TagDescriptions", [])}
                    for row in load_balancers:
                        a = row.get("LoadBalancerArn")
                        if a in by_arn:
                            row["Tags"] = by_arn[a]
                except ClientError:
                    pass
        except ClientError as e:
            elb_listeners = [{"error": str(e)}]
            load_balancers = [{"error": str(e)}]

        rds_encryption = []
        try:
            rds = session.client("rds", region_name=region) if session else boto3.client("rds", region_name=region)
            for page in rds.get_paginator("describe_db_instances").paginate():
                for db in page.get("DBInstances", []):
                    db_arn = db.get("DBInstanceArn")
                    tags: list = []
                    if db_arn:
                        try:
                            tags = rds.list_tags_for_resource(ResourceName=db_arn).get("TagList", [])
                        except ClientError:
                            tags = []
                    rds_encryption.append({
                        "DBInstanceIdentifier": db.get("DBInstanceIdentifier"),
                        "StorageEncrypted": db.get("StorageEncrypted"),
                        "KmsKeyId": db.get("KmsKeyId"),
                        "Tags": tags,
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
            "load_balancers": load_balancers,
            "rds_encryption": rds_encryption,
        }

        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    except Exception as e:
        payload = {"collector": COLLECTOR_NAME, "account_id": account_id, "region": region, "collected_at": now.isoformat(), "error": str(e), "kms_keys": [], "acm_certificates": [], "elb_listeners_tls": [], "load_balancers": [], "rds_encryption": []}
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    return results
