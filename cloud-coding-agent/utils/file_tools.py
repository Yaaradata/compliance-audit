"""Filesystem helpers — keep writes confined to cloud-coding-agent output."""
from __future__ import annotations

import re
from pathlib import Path


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def assert_under_parent(path: Path, parent: Path) -> Path:
    """Resolve path and raise if it escapes parent (safety)."""
    resolved = path.resolve()
    parent_resolved = parent.resolve()
    try:
        resolved.relative_to(parent_resolved)
    except ValueError as e:
        raise ValueError(f"Refusing to write outside {parent_resolved}: {resolved}") from e
    return resolved


def to_snake_case(name: str) -> str:
    s = name.strip()
    s = re.sub(r"[^\w\s-]", "", s, flags=re.UNICODE)
    s = re.sub(r"[\s-]+", "_", s)
    s = re.sub(r"_+", "_", s).strip("_").lower()
    if not s:
        s = "collector"
    if s[0].isdigit():
        s = f"c_{s}"
    return s


def collector_module_filename(collector_name: str) -> str:
    base = to_snake_case(collector_name)
    if not base.endswith("_collector"):
        base = f"{base}_collector"
    return f"{base}.py"
