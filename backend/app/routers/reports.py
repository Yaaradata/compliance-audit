from uuid import UUID
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user
from ..models.tenant import User
from ..models.approval import AssessmentReport
from ..schemas.approval import ReportOut, CreateReportRequest, UpdateReportRequest

router = APIRouter()


@router.get("/assessments/{cycle_id}/reports", response_model=list[ReportOut])
def list_reports(cycle_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(AssessmentReport).filter(AssessmentReport.cycle_id == cycle_id).order_by(AssessmentReport.created_at.desc()).all()


@router.post("/assessments/{cycle_id}/reports", response_model=ReportOut, status_code=201)
def create_report(cycle_id: UUID, req: CreateReportRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    report = AssessmentReport(
        cycle_id=cycle_id,
        report_kind=req.report_kind,
        generated_by=user.id,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("/assessments/{cycle_id}/reports/{report_id}", response_model=ReportOut)
def get_report(cycle_id: UUID, report_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    report = db.query(AssessmentReport).filter(AssessmentReport.id == report_id, AssessmentReport.cycle_id == cycle_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.put("/assessments/{cycle_id}/reports/{report_id}", response_model=ReportOut)
def update_report(cycle_id: UUID, report_id: UUID, req: UpdateReportRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    report = db.query(AssessmentReport).filter(AssessmentReport.id == report_id, AssessmentReport.cycle_id == cycle_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if req.sections is not None:
        report.sections = req.sections
    db.commit()
    db.refresh(report)
    return report


@router.post("/assessments/{cycle_id}/reports/{report_id}/finalize", response_model=ReportOut)
def finalize_report(cycle_id: UUID, report_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    report = db.query(AssessmentReport).filter(AssessmentReport.id == report_id, AssessmentReport.cycle_id == cycle_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.report_kind = "final"
    report.finalized_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(report)
    return report
