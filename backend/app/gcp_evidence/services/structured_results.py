"""Assemble StandardEvidenceResult list from workbook rows + collector outcomes."""
from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING

from app.gcp_evidence.schemas.standard_evidence import EvidenceStatus, StandardEvidenceResult
from app.gcp_evidence.workbook.collector_index import item_code_to_collector_ids

if TYPE_CHECKING:
    from app.gcp_evidence.workbook.excel_spec import WorkbookEvidenceRow


@dataclass
class CollectorOutcome:
    name: str
    ok: bool
    error: str | None
    payload: dict | None


def build_standard_evidence_results(
    workbook_rows: list[WorkbookEvidenceRow],
    outcomes: dict[str, CollectorOutcome],
) -> list[StandardEvidenceResult]:
    index = item_code_to_collector_ids()
    seen: set[str] = set()
    ordered_codes: list[str] = []
    for w in workbook_rows:
        code = w.item_code
        if not code or code in seen:
            continue
        seen.add(code)
        ordered_codes.append(code)

    results: list[StandardEvidenceResult] = []
    for code in ordered_codes:
        coll_ids = index.get(code, [])
        if not coll_ids:
            results.append(
                StandardEvidenceResult(
                    evidence_id=code,
                    status=EvidenceStatus.FAIL,
                    data={},
                    errors=[
                        "No API collector registered for this evidence item in the current backend release; "
                        "see workbook automation feasibility (may require SCC, Workspace, or manual evidence)."
                    ],
                )
            )
            continue

        data: dict = {}
        errs: list[str] = []
        all_ok = True
        for cid in coll_ids:
            o = outcomes.get(cid)
            if o is None:
                all_ok = False
                errs.append(f"Collector {cid}: missing outcome")
                continue
            if o.ok and o.payload is not None:
                data[cid] = o.payload
            else:
                all_ok = False
                msg = o.error or f"Collector {cid} failed"
                errs.append(f"{cid}: {msg}")

        if all_ok and data:
            status = EvidenceStatus.PASS
        elif data and not all_ok:
            status = EvidenceStatus.ERROR
        elif not data and not all_ok:
            status = EvidenceStatus.ERROR
        else:
            status = EvidenceStatus.FAIL

        results.append(
            StandardEvidenceResult(evidence_id=code, status=status, data=data, errors=errs)
        )

    return results
