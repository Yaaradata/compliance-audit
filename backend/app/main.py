import asyncio
import logging
import sys
import warnings
from contextlib import asynccontextmanager

# Windows: default ProactorEventLoop + abrupt client disconnects (browser abort, timeout) can raise
# ConnectionResetError in _ProactorBasePipeTransport._call_connection_lost during socket.shutdown.
# Selector policy matches Linux/macOS behavior and avoids noisy asyncio ERROR logs (WinError 10054).
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# Suppress noisy Google Auth warning when using user credentials (e.g. gcloud auth application-default login).
# For production, use a service account key; then signed URLs work and this warning does not apply.
warnings.filterwarnings(
    "ignore",
    message=".*end user credentials from Google Cloud SDK without a quota project.*",
    category=UserWarning,
)
# Vertex AI SDK deprecation noise (generative_models); remove from CMD until SDK upgrade.
warnings.filterwarnings(
    "ignore",
    message=".*deprecated as of June 24, 2025.*",
    category=UserWarning,
)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


def _configure_app_logging() -> None:
    """Ensure app loggers emit INFO to the console (uvicorn may leave root unconfigured)."""
    fmt = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
    root = logging.getLogger()
    if not root.handlers:
        logging.basicConfig(level=logging.INFO, format=fmt, datefmt="%Y-%m-%d %H:%M:%S")
    else:
        root.setLevel(logging.INFO)
    for name in ("app", "app.services", "app.services.ai_service"):
        logging.getLogger(name).setLevel(logging.INFO)


_configure_app_logging()

from .config import settings
from .database import (
    ensure_optional_columns,
    ensure_control_scoping_columns,
    ensure_notes_notifications_tables,
    ensure_tenant_aws_config_table,
    ensure_cycle_user_gcp_config_table,
    ensure_cycle_user_azure_config_table,
    ensure_evidence_submission_history_table,
    ensure_review_hold_enum,
    ensure_user_group_name,
    ensure_user_is_external,
    ensure_user_role_nullable,
    ensure_cycle_role_assignments,
    ensure_cycle_evidence_assignments,
    ensure_artifact_registry_schema,
    ensure_swift_2025_evidence_questions_azure_columns,
    ensure_swift_2026_evidence_questions_azure_columns,
    ensure_compliance_pipelines_table,
)
from .aws_evidence.core.db import ensure_schema as ensure_aws_evidence_schema
from .routers import (
    auth,
    tenants,
    users,
    assessments,
    cycle_assignments,
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
    gcp,
    azure,
    compliance,
    artifact_registry,
    demo,
)
from .compliance_pipeline.router import router as compliance_pipeline_router


def _run_startup_migrations_sync() -> None:
    """Idempotent DB/schema fixes. Runs in a worker thread so Uvicorn can bind PORT first (Cloud Run)."""
    try:
        ensure_optional_columns()
        ensure_control_scoping_columns()
        ensure_notes_notifications_tables()
        ensure_tenant_aws_config_table()
        ensure_cycle_user_gcp_config_table()
        ensure_cycle_user_azure_config_table()
        ensure_evidence_submission_history_table()
        ensure_review_hold_enum()
        ensure_user_group_name()
        ensure_user_is_external()
        ensure_user_role_nullable()
        ensure_cycle_role_assignments()
        ensure_cycle_evidence_assignments()
        ensure_artifact_registry_schema()
        ensure_compliance_pipelines_table()
        ensure_swift_2025_evidence_questions_azure_columns()
        # swift_2026 schema must exist before altering evidence_based_questions (Azure columns also applied inside ensure_aws_evidence_schema).
        ensure_aws_evidence_schema()  # swift_2026 schema + migrations (collector_runs, evidence, ebq Azure cols if table exists)
        ensure_swift_2026_evidence_questions_azure_columns()
        logger.info("Startup migrations completed successfully.")
    except Exception:
        logger.exception("Startup migrations failed (API is up; fix DB/config and redeploy or retry).")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Uvicorn runs lifespan startup BEFORE binding the socket. Heavy sync work here blocks Cloud Run
    # from seeing PORT=8080 until finished. Defer migrations to a thread so the server listens immediately.
    asyncio.create_task(asyncio.to_thread(_run_startup_migrations_sync))
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


class RequestLogMiddleware(BaseHTTPMiddleware):
    """Log every request so we can see when the backend receives traffic (helps debug proxy/connection issues)."""

    async def dispatch(self, request, call_next):
        print(f"[Backend] {request.method} {request.url.path}", flush=True)
        try:
            response = await call_next(request)
            print(f"[Backend] {request.method} {request.url.path} -> {response.status_code}", flush=True)
            return response
        except Exception as e:
            print(f"[Backend] {request.method} {request.url.path} -> ERROR: {e}", flush=True)
            logger.exception("%s %s -> error: %s", request.method, request.url.path, e)
            raise


app.add_middleware(RequestLogMiddleware)

PREFIX = "/api/v1"
# Separated HTTP namespaces: AWS vs GCP evidence APIs (no shared /aws vs /gcp root path).
CLOUD_AWS_API_PREFIX = f"{PREFIX}/cloud/aws"
CLOUD_GCP_API_PREFIX = f"{PREFIX}/cloud/gcp"
CLOUD_AZURE_API_PREFIX = f"{PREFIX}/cloud/azure"

app.include_router(auth.router,          prefix=PREFIX, tags=["auth"])
app.include_router(compliance.router,   prefix=PREFIX)
# Notes and notifications registered early so /api/v1/notes and /api/v1/notifications are matched first
app.include_router(notes.router,        prefix=PREFIX, tags=["notes"])
app.include_router(notifications.router, prefix=PREFIX, tags=["notifications"])
app.include_router(tenants.router,      prefix=PREFIX, tags=["tenants"])
app.include_router(users.router,        prefix=PREFIX, tags=["users"])
# Register cycle_assignments before assessments so /{cycle_id}/role-assignments etc. match before /{cycle_id}
app.include_router(cycle_assignments.router, prefix=PREFIX)
app.include_router(assessments.router,  prefix=PREFIX, tags=["assessments"])
app.include_router(controls.router,     prefix=PREFIX, tags=["controls"])
app.include_router(evidence.router,     prefix=PREFIX, tags=["evidence"])
app.include_router(files.router,        prefix=PREFIX, tags=["files"])
app.include_router(sufficiency.router,  prefix=PREFIX, tags=["sufficiency"])
app.include_router(reviews.router,      prefix=PREFIX, tags=["reviews"])
app.include_router(approval.router,     prefix=PREFIX, tags=["approval"])
app.include_router(reports.router,      prefix=PREFIX, tags=["reports"])
app.include_router(vendors.router,      prefix=PREFIX, tags=["vendors"])
# Diagram image bytes: public route so <img src="/api/v1/ref/diagrams/.../content"> works (no Authorization header).
app.include_router(reference.diagrams_content_router, prefix=PREFIX)
app.include_router(reference.router, prefix=PREFIX)
app.include_router(audit_log.router,    prefix=PREFIX, tags=["audit-log"])
app.include_router(aws.router, prefix=CLOUD_AWS_API_PREFIX, tags=["cloud-aws-evidence"])
app.include_router(gcp.router, prefix=CLOUD_GCP_API_PREFIX, tags=["cloud-gcp-evidence"])
app.include_router(azure.router, prefix=CLOUD_AZURE_API_PREFIX, tags=["cloud-azure-evidence"])
app.include_router(artifact_registry.router, prefix=PREFIX, tags=["artifact-registry"])
app.include_router(compliance_pipeline_router, prefix=PREFIX, tags=["compliance-pipeline"])
app.include_router(demo.router,             prefix=PREFIX, tags=["demo"])


@app.get("/health")
def health():
    return {"status": "ok"}
