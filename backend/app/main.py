import warnings
from contextlib import asynccontextmanager

# Suppress noisy Google Auth warning when using user credentials (e.g. gcloud auth application-default login).
# For production, use a service account key; then signed URLs work and this warning does not apply.
warnings.filterwarnings(
    "ignore",
    message=".*end user credentials from Google Cloud SDK without a quota project.*",
    category=UserWarning,
)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import (
    ensure_optional_columns,
    ensure_control_scoping_columns,
    ensure_notes_notifications_tables,
    ensure_tenant_aws_config_table,
    ensure_evidence_submission_history_table,
    ensure_review_hold_enum,
    ensure_user_group_name,
)
from .aws_evidence.core.db import ensure_schema as ensure_aws_evidence_schema
from .routers import (
    auth,
    tenants,
    users,
    assessments,
    controls,
    evidence,
    files,
    sufficiency,
    reviews,
    approval,
    reports,
    vendors,
    reference,
    audit_log,
    notes,
    notifications,
    aws,
    compliance,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_optional_columns()
    ensure_control_scoping_columns()
    ensure_notes_notifications_tables()
    ensure_tenant_aws_config_table()
    ensure_evidence_submission_history_table()
    ensure_review_hold_enum()
    ensure_user_group_name()
    ensure_aws_evidence_schema()  # swift_2026 schema + migrations (collector_runs, evidence, etc.)
    yield


app = FastAPI(
    title="SWIFT Compliance Platform API",
    version="1.0.0",
    root_path="",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PREFIX = "/api/v1"

app.include_router(auth.router,          prefix=PREFIX, tags=["auth"])
# Notes and notifications registered early so /api/v1/notes and /api/v1/notifications are matched first
app.include_router(notes.router,        prefix=PREFIX, tags=["notes"])
app.include_router(notifications.router, prefix=PREFIX, tags=["notifications"])
app.include_router(tenants.router,      prefix=PREFIX, tags=["tenants"])
app.include_router(users.router,        prefix=PREFIX, tags=["users"])
app.include_router(assessments.router,  prefix=PREFIX, tags=["assessments"])
app.include_router(controls.router,     prefix=PREFIX, tags=["controls"])
app.include_router(evidence.router,     prefix=PREFIX, tags=["evidence"])
app.include_router(files.router,        prefix=PREFIX, tags=["files"])
app.include_router(sufficiency.router,  prefix=PREFIX, tags=["sufficiency"])
app.include_router(reviews.router,      prefix=PREFIX, tags=["reviews"])
app.include_router(approval.router,     prefix=PREFIX, tags=["approval"])
app.include_router(reports.router,      prefix=PREFIX, tags=["reports"])
app.include_router(vendors.router,      prefix=PREFIX, tags=["vendors"])
app.include_router(reference.router,    prefix=PREFIX, tags=["reference"])
app.include_router(audit_log.router,    prefix=PREFIX, tags=["audit-log"])
app.include_router(compliance.router,   prefix=PREFIX)
app.include_router(aws.router,          prefix=PREFIX, tags=["aws"])


@app.get("/health")
def health():
    return {"status": "ok"}
