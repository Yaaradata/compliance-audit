"""D4, D5, E1, H — Security Command Center findings (vuln, threat, remediation signals)."""
from __future__ import annotations

from collections import Counter
from datetime import datetime

from google.api_core import exceptions as gcp_exceptions
from google.cloud import securitycenter_v1
from google.cloud.securitycenter_v1 import types as scc_types

from .control_mappings import swift_control_pairs

COLLECTOR_NAME = "scc_findings"
SOURCE_SYSTEM = "gcp-securitycenter"
CONTROL_MAPPINGS = swift_control_pairs("D4", "D5", "E1", "H")


def _evidence_type(item_code: str) -> str:
    return {
        "D4": "Vulnerability scan results",
        "D5": "Remediation tracking",
        "E1": "Malware protection",
        "H": "Incident signal data",
    }.get(item_code, "Security findings")


def _finding_brief(f) -> dict:
    fc = f.finding_class if getattr(f, "finding_class", None) is not None else None
    fc_name = fc.name if fc is not None else None
    return {
        "name_suffix": (f.name or "").split("/")[-1],
        "category": (f.category or "")[:300],
        "state": str(f.state) if f.state is not None else None,
        "severity": str(f.severity) if f.severity is not None else None,
        "finding_class": fc_name,
    }


def collect(project_id: str) -> list[tuple[dict, str, str, str, str]]:
    results: list[tuple[dict, str, str, str, str]] = []
    now = datetime.utcnow()
    parent = f"projects/{project_id}/sources/-"
    try:
        client = securitycenter_v1.SecurityCenterClient()
        req = scc_types.ListFindingsRequest(
            parent=parent,
            page_size=50,
            filter='state="ACTIVE"',
        )
        samples: list[dict] = []
        by_class: Counter[str] = Counter()
        by_category: Counter[str] = Counter()
        total = 0
        for row in client.list_findings(request=req):
            total += 1
            f = row.finding
            if not f:
                continue
            fc = f.finding_class
            fc_key = fc.name if fc is not None else "UNSPECIFIED"
            by_class[fc_key] += 1
            if f.category:
                by_category[f.category] += 1
            if len(samples) < 80:
                samples.append(_finding_brief(f))
            if total >= 500:
                break
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "active_findings_seen": total,
            "counts_by_finding_class": dict(by_class.most_common(30)),
            "top_categories": dict(by_category.most_common(25)),
            "sample_findings": samples,
            "note": "SCC aggregates vuln and threat findings; use CSV/export for full evidence packs.",
        }
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, _evidence_type(item_code), SOURCE_SYSTEM))
    except gcp_exceptions.PermissionDenied as e:
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "error": f"Permission denied: {e.message}",
        }
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, _evidence_type(item_code), SOURCE_SYSTEM))
    except Exception as e:
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "error": str(e),
        }
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, _evidence_type(item_code), SOURCE_SYSTEM))
    return results
