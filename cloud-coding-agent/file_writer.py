"""Write validated collector sources only under cloud-coding-agent/output."""
from __future__ import annotations

from pathlib import Path

from config import COLLECTORS_OUTPUT_DIR
from utils.file_tools import assert_under_parent, ensure_dir


def write_collector_file(filename: str, content: str, output_dir: Path | None = None) -> Path:
    """Write a single .py file; filename must be basename only."""
    base = output_dir or COLLECTORS_OUTPUT_DIR
    ensure_dir(base)
    if Path(filename).name != filename or ".." in filename:
        raise ValueError(f"Unsafe filename: {filename!r}")
    target = (base / filename).resolve()
    assert_under_parent(target, base.resolve())
    target.write_text(content, encoding="utf-8", newline="\n")
    return target
