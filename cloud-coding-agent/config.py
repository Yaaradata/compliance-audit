"""Configuration for the Azure evidence code-generation agent."""
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

# Directory containing this file (cloud-coding-agent/)
AGENT_ROOT = Path(__file__).resolve().parent
REPO_ROOT = AGENT_ROOT.parent

DEFAULT_EXCEL_PATH = REPO_ROOT / "Azure_Evidence_Collection_SWIFT_v2026.xlsx"
OUTPUT_ROOT = AGENT_ROOT / "output" / "azure_evidence"
COLLECTORS_OUTPUT_DIR = OUTPUT_ROOT / "collectors"

# Match backend/app/config.py defaults (Vertex AI)
_DEFAULT_VERTEX_MODEL = "gemini-2.5-flash-lite"
_DEFAULT_VERTEX_LOCATION = "us-central1"


def load_agent_dotenv_files() -> None:
    """
    Load env files in order:
    1. backend/.env — shared app defaults (override=False: respect existing shell vars)
    2. repo root .env — optional monorepo overrides
    3. cloud-coding-agent/.env — agent-only settings (override=True so agent file wins over 1–2 for same keys)
    """
    try:
        from dotenv import load_dotenv
    except ImportError:
        return
    for p in (REPO_ROOT / "backend" / ".env", REPO_ROOT / ".env"):
        if p.is_file():
            load_dotenv(p, override=False)
    agent_env = AGENT_ROOT / ".env"
    if agent_env.is_file():
        load_dotenv(agent_env, override=True)


# Values that are documentation placeholders — reject to avoid confusing 403 CONSUMER_INVALID errors.
_INVALID_PROJECT_PLACEHOLDERS = frozenset(
    {
        "your-gcp-project",
        "your-project-id",
        "my-gcp-project",
        "changeme",
        "replace-me",
    }
)


def assert_real_vertex_project(project: str | None) -> str:
    """
    Return stripped project ID or raise if missing / looks like a docs placeholder.
    Call before ChatVertexAI or Vertex code generation.
    """
    p = (project or "").strip()
    if not p:
        raise ValueError(
            "GOOGLE_CLOUD_PROJECT is not set. Set it in cloud-coding-agent/.env or backend/.env or the environment to your real "
            "GCP project ID (same as the backend). Example: gcloud config get-value project"
        )
    pl = p.lower()
    if pl in _INVALID_PROJECT_PLACEHOLDERS or (pl.startswith("your-") and "project" in pl):
        raise ValueError(
            f"GOOGLE_CLOUD_PROJECT={p!r} is not a real project ID (it looks like a placeholder). "
            "Set it to your actual Google Cloud project ID."
        )
    return p


@dataclass(frozen=True)
class AgentConfig:
    """Runtime settings — Vertex AI env vars align with backend ``app.config.Settings``."""

    excel_path: Path
    google_cloud_project: str | None
    vertex_ai_location: str
    vertex_ai_model: str
    llm_max_retries: int
    max_resources_in_payload: int
    dry_run: bool

    @staticmethod
    def load() -> "AgentConfig":
        load_agent_dotenv_files()

        excel = os.getenv("AZURE_EVIDENCE_EXCEL_PATH", "").strip()
        if excel:
            path = Path(excel)
            path = path.resolve() if path.is_absolute() else (REPO_ROOT / path).resolve()
        else:
            path = DEFAULT_EXCEL_PATH.resolve()

        gcp = (os.getenv("GOOGLE_CLOUD_PROJECT") or "").strip() or None

        return AgentConfig(
            excel_path=path,
            google_cloud_project=gcp,
            vertex_ai_location=(
                os.getenv("VERTEX_AI_LOCATION", _DEFAULT_VERTEX_LOCATION).strip() or _DEFAULT_VERTEX_LOCATION
            ),
            vertex_ai_model=(
                os.getenv("VERTEX_AI_MODEL", _DEFAULT_VERTEX_MODEL).strip() or _DEFAULT_VERTEX_MODEL
            ),
            llm_max_retries=max(0, int(os.getenv("LLM_MAX_RETRIES", "3"))),
            max_resources_in_payload=max(10, int(os.getenv("MAX_RESOURCES_IN_PAYLOAD", "600"))),
            dry_run=os.getenv("DRY_RUN", "").lower() in ("1", "true", "yes"),
        )
