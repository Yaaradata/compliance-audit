"""Config for interactive coding agent (Vertex AI — same env as backend + cloud-coding-agent/.env)."""
from __future__ import annotations

import os
import sys
from pathlib import Path

INTERACTIVE_ROOT = Path(__file__).resolve().parent
AGENT_ROOT = INTERACTIVE_ROOT.parent
REPO_ROOT = AGENT_ROOT.parent

if str(AGENT_ROOT) not in sys.path:
    sys.path.insert(0, str(AGENT_ROOT))

from config import load_agent_dotenv_files  # noqa: E402

load_agent_dotenv_files()


def get_settings() -> dict:
    project = (os.getenv("GOOGLE_CLOUD_PROJECT") or "").strip()
    return {
        "project": project,
        "location": (os.getenv("VERTEX_AI_LOCATION") or "us-central1").strip(),
        "model": (os.getenv("VERTEX_AI_MODEL") or "gemini-2.5-flash-lite").strip(),
    }
