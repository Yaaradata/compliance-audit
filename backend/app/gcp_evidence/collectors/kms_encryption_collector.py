"""B3 — KMS key rings/keys, SSL policies, optional Certificate Manager."""
from __future__ import annotations

from datetime import datetime

from google.api_core import exceptions as gcp_exceptions
from google.cloud.compute_v1 import SslPoliciesClient
from google.cloud.kms_v1 import KeyManagementServiceClient

from .control_mappings import swift_control_pairs

COLLECTOR_NAME = "kms_encryption"
EVIDENCE_TYPE = "Encryption posture"
SOURCE_SYSTEM = "gcp-kms"
CONTROL_MAPPINGS = swift_control_pairs("B3")

_LOCATIONS = ("global", "us-central1", "us-east1", "europe-west1", "asia-south1", "australia-southeast1")


def collect(project_id: str) -> list[tuple[dict, str, str, str, str]]:
    results: list[tuple[dict, str, str, str, str]] = []
    now = datetime.utcnow()
    try:
        kms = KeyManagementServiceClient()
        keys_out: list[dict] = []
        for loc in _LOCATIONS:
            parent = f"projects/{project_id}/locations/{loc}"
            try:
                for kr in kms.list_key_rings(request={"parent": parent}):
                    for ck in kms.list_crypto_keys(request={"parent": kr.name}):
                        primary = ck.primary
                        keys_out.append(
                            {
                                "location": loc,
                                "key_ring": kr.name.split("/")[-1],
                                "crypto_key": ck.name.split("/")[-1],
                                "purpose": str(ck.purpose) if ck.purpose else None,
                                "rotation_period": str(ck.rotation_period) if ck.rotation_period else None,
                                "version_state": str(primary.state) if primary and primary.state else None,
                                "algorithm": str(primary.algorithm) if primary and primary.algorithm else None,
                            }
                        )
            except Exception:
                continue
        ssl_policies = []
        for sp in SslPoliciesClient().list(project=project_id):
            prof = sp.profile or None
            ssl_policies.append({"name": sp.name, "profile": str(prof), "min_tls_version": str(sp.min_tls_version) if sp.min_tls_version else None})
        certs: list[dict] = []
        try:
            from google.cloud.certificate_manager_v1 import CertificateManagerClient

            cmg = CertificateManagerClient()
            cparent = f"projects/{project_id}/locations/-/certificates"
            for cert in cmg.list_certificates(parent=cparent):
                certs.append(
                    {
                        "name": cert.name.split("/")[-1],
                        "san_dns_names": list(cert.san_dnsnames or [])[:20],
                        "expire_time": cert.expire_time.isoformat() if cert.expire_time else None,
                    }
                )
        except Exception as e:
            certs = [{"note": f"certificatemanager optional: {e}"}]
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "crypto_keys_summary": keys_out[:300],
            "ssl_policies": ssl_policies[:50],
            "certificates": certs[:80],
        }
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    except gcp_exceptions.PermissionDenied as e:
        payload = {"collector": COLLECTOR_NAME, "project_id": project_id, "collected_at": now.isoformat(), "error": f"Permission denied: {e.message}"}
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    except Exception as e:
        payload = {"collector": COLLECTOR_NAME, "project_id": project_id, "collected_at": now.isoformat(), "error": str(e)}
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    return results
