"""B1, D2 — OS Config vulnerability reports per zone (when VM Manager enabled)."""
from __future__ import annotations

from datetime import datetime

from google.cloud.compute_v1 import ZonesClient
from google.cloud.osconfig_v1 import OsConfigZonalServiceClient

from .control_mappings import swift_control_pairs

COLLECTOR_NAME = "osconfig_posture"
SOURCE_SYSTEM = "gcp-osconfig"
CONTROL_MAPPINGS = swift_control_pairs("B1", "D2")


def _evidence_type(item_code: str) -> str:
    return "Patch compliance snapshot" if item_code == "D2" else "OS config + compliance"


def collect(project_id: str) -> list[tuple[dict, str, str, str, str]]:
    results: list[tuple[dict, str, str, str, str]] = []
    now = datetime.utcnow()
    zclient = OsConfigZonalServiceClient()
    reports: list[dict] = []
    try:
        zc = ZonesClient()
        for z in zc.list(project=project_id):
            zone = z.name or ""
            if not zone:
                continue
            parent = f"projects/{project_id}/locations/{zone}"
            try:
                for vr in zclient.list_vulnerability_reports(parent=parent):
                    reports.append(
                        {
                            "zone": zone,
                            "name": vr.name.split("/")[-1] if vr.name else None,
                            "update_time": vr.update_time.isoformat() if vr.update_time else None,
                            "vulnerabilities_count": len(vr.vulnerabilities) if vr.vulnerabilities else 0,
                        }
                    )
                    if len(reports) >= 400:
                        break
            except Exception:
                continue
            if len(reports) >= 400:
                break
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "vulnerability_report_summaries": reports,
        }
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, _evidence_type(item_code), SOURCE_SYSTEM))
    except Exception as e:
        payload = {"collector": COLLECTOR_NAME, "project_id": project_id, "collected_at": now.isoformat(), "error": str(e)}
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, _evidence_type(item_code), SOURCE_SYSTEM))
    return results
