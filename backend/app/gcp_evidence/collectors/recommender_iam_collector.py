"""C5 — IAM / role recommender insights (access review signals)."""
from __future__ import annotations

from datetime import datetime

from google.api_core import exceptions as gcp_exceptions
from google.cloud import recommender_v1

from .control_mappings import swift_control_pairs

COLLECTOR_NAME = "recommender_iam"
EVIDENCE_TYPE = "Access review data"
SOURCE_SYSTEM = "gcp-recommender"
CONTROL_MAPPINGS = swift_control_pairs("C5")


def collect(project_id: str) -> list[tuple[dict, str, str, str, str]]:
    results: list[tuple[dict, str, str, str, str]] = []
    now = datetime.utcnow()
    parent = f"projects/{project_id}/locations/global/insightTypes/google.iam.policy.Insight"
    try:
        client = recommender_v1.RecommenderClient()
        insights: list[dict] = []
        for ins in client.list_insights(parent=parent, page_size=50):
            insights.append(
                {
                    "name": (ins.name or "").split("/")[-1],
                    "description": (ins.description or "")[:800],
                    "category": str(ins.category) if ins.category else None,
                    "state": str(ins.state) if ins.state else None,
                    "severity": str(ins.severity) if ins.severity else None,
                }
            )
            if len(insights) >= 120:
                break
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "insight_type": "google.iam.policy.Insight",
            "insights": insights,
            "note": "Recommender IAM insights support quarterly access review; enable Recommender API and IAM recommender.",
        }
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    except gcp_exceptions.PermissionDenied as e:
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "error": f"Permission denied: {e.message}",
        }
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    except Exception as e:
        payload = {
            "collector": COLLECTOR_NAME,
            "project_id": project_id,
            "collected_at": now.isoformat(),
            "error": str(e),
        }
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((payload, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    return results
