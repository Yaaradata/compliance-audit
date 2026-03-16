from uuid import UUID
from datetime import datetime, timezone
import logging
import time

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from ..dependencies import get_db, get_db_scoped, get_current_user
from ..models.tenant import User
from ..models.approval import AssessmentReport
from ..schemas.approval import ReportOut, CreateReportRequest, UpdateReportRequest
from ..services.report_builder import build_report_snapshot
from ..services.ai_service import generate_report_section

logger = logging.getLogger(__name__)

router = APIRouter()

REPORT_SECTION_ORDER = [
    {"key": "executive_summary", "name": "Executive Summary", "ai": True},
    {"key": "scope_methodology", "name": "Scope & Methodology", "ai": True},
    {"key": "domain_A", "name": "Domain A — Network & Architecture", "ai": True},
    {"key": "domain_B", "name": "Domain B — System Hardening & Config", "ai": True},
    {"key": "domain_C", "name": "Domain C — Access Management", "ai": True},
    {"key": "domain_D", "name": "Domain D — Vulnerability & Patch Mgmt", "ai": True},
    {"key": "domain_E", "name": "Domain E — Monitoring & Detection", "ai": True},
    {"key": "domain_F", "name": "Domain F — Third-Party & Outsourcing", "ai": True},
    {"key": "domain_G", "name": "Domain G — Physical Security", "ai": True},
    {"key": "domain_H", "name": "Domain H — Policies & Governance", "ai": True},
    {"key": "gap_analysis", "name": "Gap Analysis", "ai": True},
    {"key": "attestation", "name": "Final Attestation", "ai": True},
    {"key": "evidence_index", "name": "Evidence Index", "ai": True},
    {"key": "glossary", "name": "Glossary", "ai": False},
]


def _default_sections() -> list[dict]:
    return [
        {"key": s["key"], "name": s["name"], "ai": s["ai"], "status": "draft", "content": ""}
        for s in REPORT_SECTION_ORDER
    ]


# ── CRUD ──────────────────────────────────────────────────────


@router.get("/assessments/{cycle_id}/reports", response_model=list[ReportOut])
def list_reports(cycle_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(AssessmentReport).filter(AssessmentReport.cycle_id == cycle_id).order_by(AssessmentReport.created_at.desc()).all()


@router.post("/assessments/{cycle_id}/reports", response_model=ReportOut, status_code=201)
def create_report(cycle_id: UUID, req: CreateReportRequest, db: Session = Depends(get_db_scoped), user: User = Depends(get_current_user)):
    report = AssessmentReport(
        cycle_id=cycle_id,
        report_kind=req.report_kind,
        sections=_default_sections(),
        generated_by=user.id,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("/assessments/{cycle_id}/reports/{report_id}", response_model=ReportOut)
def get_report(cycle_id: UUID, report_id: UUID, db: Session = Depends(get_db_scoped), user: User = Depends(get_current_user)):
    report = db.query(AssessmentReport).filter(AssessmentReport.id == report_id, AssessmentReport.cycle_id == cycle_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.put("/assessments/{cycle_id}/reports/{report_id}", response_model=ReportOut)
def update_report(cycle_id: UUID, report_id: UUID, req: UpdateReportRequest, db: Session = Depends(get_db_scoped), user: User = Depends(get_current_user)):
    report = db.query(AssessmentReport).filter(AssessmentReport.id == report_id, AssessmentReport.cycle_id == cycle_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if req.sections is not None:
        report.sections = req.sections
        flag_modified(report, "sections")
    report.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(report)
    return report


@router.post("/assessments/{cycle_id}/reports/{report_id}/finalize", response_model=ReportOut)
def finalize_report(cycle_id: UUID, report_id: UUID, db: Session = Depends(get_db_scoped), user: User = Depends(get_current_user)):
    report = db.query(AssessmentReport).filter(AssessmentReport.id == report_id, AssessmentReport.cycle_id == cycle_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.report_kind = "final"
    report.finalized_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(report)
    return report


# ── AI Generation ─────────────────────────────────────────────


@router.post("/assessments/{cycle_id}/reports/{report_id}/generate", response_model=ReportOut)
def generate_full_report(
    cycle_id: UUID,
    report_id: UUID,
    db: Session = Depends(get_db_scoped),
    user: User = Depends(get_current_user),
):
    """Build snapshot, then generate ALL AI sections sequentially."""
    report = db.query(AssessmentReport).filter(AssessmentReport.id == report_id, AssessmentReport.cycle_id == cycle_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    snapshot = build_report_snapshot(db, cycle_id)
    report.snapshot_data = snapshot
    flag_modified(report, "snapshot_data")

    sections = list(report.sections or _default_sections())
    ai_sections_generated = 0

    for i, sec in enumerate(sections):
        key = sec.get("key", "")
        if not sec.get("ai", True):
            if key == "glossary" and not sec.get("content"):
                sec["content"] = generate_report_section(snapshot, "glossary")
                sec["status"] = "complete"
            continue

        if ai_sections_generated > 0:
            time.sleep(3)
        ai_sections_generated += 1

        sec["status"] = "generating"
        report.sections = sections
        flag_modified(report, "sections")
        db.commit()

        try:
            content = generate_report_section(snapshot, key)
            sec["content"] = content
            sec["status"] = "complete"
        except Exception as e:
            logger.exception("Failed to generate section %s", key)
            sec["content"] = (
                f"*Generation failed due to Vertex AI rate limit. "
                f"Please try again in a few minutes or use **Regenerate** for this section.*"
            )
            sec["status"] = "draft"

        report.sections = sections
        flag_modified(report, "sections")
        db.commit()

    report.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(report)
    return report


@router.post("/assessments/{cycle_id}/reports/{report_id}/sections/{section_index}/regenerate", response_model=ReportOut)
def regenerate_section(
    cycle_id: UUID,
    report_id: UUID,
    section_index: int,
    db: Session = Depends(get_db_scoped),
    user: User = Depends(get_current_user),
):
    """Regenerate a single section using the stored snapshot."""
    report = db.query(AssessmentReport).filter(AssessmentReport.id == report_id, AssessmentReport.cycle_id == cycle_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    sections = list(report.sections or [])
    if section_index < 0 or section_index >= len(sections):
        raise HTTPException(status_code=400, detail="Invalid section index")

    snapshot = report.snapshot_data or {}
    if not snapshot:
        snapshot = build_report_snapshot(db, cycle_id)
        report.snapshot_data = snapshot
        flag_modified(report, "snapshot_data")

    sec = sections[section_index]
    key = sec.get("key", "")
    sec["status"] = "generating"
    report.sections = sections
    flag_modified(report, "sections")
    db.commit()

    try:
        content = generate_report_section(snapshot, key)
        sec["content"] = content
        sec["status"] = "complete"
    except Exception as e:
        logger.exception("Failed to regenerate section %s", key)
        sec["content"] = (
            f"*Regeneration failed due to Vertex AI rate limit. "
            f"Please try again in a few minutes or use **Regenerate** for this section.*"
        )
        sec["status"] = "draft"

    report.sections = sections
    flag_modified(report, "sections")
    report.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(report)
    return report


# ── Export ─────────────────────────────────────────────────────


@router.get("/assessments/{cycle_id}/reports/{report_id}/export")
def export_report(
    cycle_id: UUID,
    report_id: UUID,
    format: str = Query("docx", pattern="^(docx|pdf)$"),
    db: Session = Depends(get_db_scoped),
    user: User = Depends(get_current_user),
):
    """Export report as PDF or Word document."""
    report = db.query(AssessmentReport).filter(AssessmentReport.id == report_id, AssessmentReport.cycle_id == cycle_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    sections = report.sections or []
    metadata = (report.snapshot_data or {}).get("metadata", {})

    from ..services.report_export import export_docx, export_pdf

    if format == "docx":
        buf = export_docx(sections, metadata)
        filename = f"SWIFT_CSP_Report_{metadata.get('assessment_year', 'draft')}.docx"
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    else:
        buf = export_pdf(sections, metadata)
        filename = f"SWIFT_CSP_Report_{metadata.get('assessment_year', 'draft')}.pdf"
        media_type = "application/pdf"

    return StreamingResponse(
        buf,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
