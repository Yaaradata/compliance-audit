"""Mutable pipeline state shared by LangChain tools (one run per CLI invocation)."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from models import CollectorSpec


@dataclass
class PipelineState:
    """Holds CollectorSpecs and generated sources for the current agent run."""

    specs_by_name: dict[str, CollectorSpec] = field(default_factory=dict)
    sources: dict[str, str] = field(default_factory=dict)
    written: set[str] = field(default_factory=set)
    dry_run: bool = False
    excel_path: str | None = None
    last_error: str | None = None
    # Set by interactive wizard (main.py)
    evidence_framework: str | None = None
    evidence_reference_path: str | None = None
    target_cloud: str | None = None

    def reset(self) -> None:
        self.specs_by_name.clear()
        self.sources.clear()
        self.written.clear()
        self.last_error = None
        self.excel_path = None
        self.evidence_framework = None
        self.evidence_reference_path = None
        self.target_cloud = None


STATE = PipelineState()
