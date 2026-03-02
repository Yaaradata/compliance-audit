from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import ensure_optional_columns
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
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_optional_columns()
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

app.include_router(auth.router,         prefix=PREFIX, tags=["auth"])
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


@app.get("/health")
def health():
    return {"status": "ok"}
