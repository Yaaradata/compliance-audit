"""Build a simple generation plan from collector specs."""
from __future__ import annotations

from models import CollectorSpec
from utils.file_tools import collector_module_filename


def build_plan(specs: list[CollectorSpec]) -> dict:
    """Return a JSON-serializable plan for logging and orchestration."""
    collectors = []
    files: list[str] = []
    for s in specs:
        fn = collector_module_filename(s.name)
        files.append(fn)
        collectors.append(
            {
                "name": s.name,
                "evidence_type": s.evidence_type,
                "source_system": s.source_system,
                "control_mapping_count": len(s.control_mappings),
                "output_file": f"cloud-coding-agent/output/azure_evidence/collectors/{fn}",
            }
        )
    return {
        "total_collectors": len(specs),
        "collectors": collectors,
        "files": files,
    }
