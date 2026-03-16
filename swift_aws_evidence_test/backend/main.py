"""FastAPI backend for SWIFT AWS Evidence Test."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import runs_router, evidence_router, controls_router
from core.db import ensure_schema

app = FastAPI(title="SWIFT AWS Evidence Test API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(runs_router)
app.include_router(evidence_router)
app.include_router(controls_router)


@app.on_event("startup")
def startup():
    ensure_schema()


@app.get("/health")
def health():
    return {"status": "ok"}
