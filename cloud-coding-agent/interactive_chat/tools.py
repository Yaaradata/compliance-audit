"""Filesystem tools for the interactive agent (path-safe)."""
from __future__ import annotations

from pathlib import Path
from typing import Any

from .config import REPO_ROOT

# Reads: anywhere under repo (except .git by default)
# Writes: only under these roots
WRITE_ALLOW_PREFIXES: tuple[Path, ...] = (
    REPO_ROOT / "backend",
    REPO_ROOT / "cloud-coding-agent" / "output",
)

MAX_READ_CHARS = 120_000
MAX_SEARCH_MATCHES = 40
MAX_SEARCH_FILES = 400


def _under_root(path: Path, root: Path) -> bool:
    try:
        path.resolve().relative_to(root.resolve())
        return True
    except ValueError:
        return False


def resolve_repo_relative(relative_path: str) -> Path:
    rel = (relative_path or "").strip().replace("\\", "/").lstrip("/")
    if ".." in rel.split("/"):
        raise ValueError("Path must not contain '..'")
    p = (REPO_ROOT / rel).resolve()
    if not _under_root(p, REPO_ROOT):
        raise ValueError("Path escapes repository root")
    return p


def tool_read_file(relative_path: str) -> dict[str, Any]:
    try:
        p = resolve_repo_relative(relative_path)
    except ValueError as e:
        return {"ok": False, "error": str(e)}
    if not p.is_file():
        return {"ok": False, "error": f"Not a file: {relative_path}"}
    try:
        text = p.read_text(encoding="utf-8", errors="replace")
    except OSError as e:
        return {"ok": False, "error": str(e)}
    truncated = len(text) > MAX_READ_CHARS
    if truncated:
        text = text[:MAX_READ_CHARS] + "\n...[truncated]"
    return {"ok": True, "path": str(p.relative_to(REPO_ROOT)), "content": text, "truncated": truncated}


def tool_search_repo(query: str, subpath: str = "backend/app") -> dict[str, Any]:
    q = (query or "").strip()
    if len(q) < 2:
        return {"ok": False, "error": "Query must be at least 2 characters"}
    try:
        root = resolve_repo_relative(subpath)
    except ValueError as e:
        return {"ok": False, "error": str(e)}
    if not root.is_dir():
        return {"ok": False, "error": f"Not a directory: {subpath}"}

    matches: list[dict[str, Any]] = []
    files_scanned = 0
    for p in root.rglob("*.py"):
        if ".venv" in p.parts or "node_modules" in p.parts:
            continue
        files_scanned += 1
        if files_scanned > MAX_SEARCH_FILES:
            break
        try:
            text = p.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        if q in text:
            line_no = None
            for i, line in enumerate(text.splitlines(), start=1):
                if q in line:
                    line_no = i
                    snippet = line.strip()[:240]
                    break
            matches.append(
                {
                    "path": str(p.relative_to(REPO_ROOT)).replace("\\", "/"),
                    "line": line_no,
                    "snippet": snippet,
                }
            )
            if len(matches) >= MAX_SEARCH_MATCHES:
                break

    return {
        "ok": True,
        "query": q,
        "matches": matches,
        "truncated": len(matches) >= MAX_SEARCH_MATCHES,
        "files_scanned": files_scanned,
    }


def tool_write_file(relative_path: str, content: str) -> dict[str, Any]:
    """Write file; prompts on stdin for backend/ paths (handled in runner)."""
    try:
        p = resolve_repo_relative(relative_path)
    except ValueError as e:
        return {"ok": False, "error": str(e)}

    allowed = any(_under_root(p, prefix) for prefix in WRITE_ALLOW_PREFIXES)
    if not allowed:
        return {
            "ok": False,
            "error": f"Writes only allowed under: {', '.join(str(x.relative_to(REPO_ROOT)) for x in WRITE_ALLOW_PREFIXES)}",
        }

    if _under_root(p, REPO_ROOT / "backend"):
        print("\n" + "=" * 60)
        print(f"PROPOSED WRITE: {p.relative_to(REPO_ROOT)}")
        print("=" * 60)
        preview = content if len(content) <= 14_000 else content[:14_000] + "\n...[truncated for display]"
        print(preview)
        print("=" * 60)
        ans = input("Apply this write to backend? [y/N]: ").strip().lower()
        if ans != "y":
            return {"ok": False, "cancelled": True, "path": str(p.relative_to(REPO_ROOT))}

    try:
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content, encoding="utf-8", newline="\n")
    except OSError as e:
        return {"ok": False, "error": str(e)}

    return {"ok": True, "path": str(p.relative_to(REPO_ROOT))}


def dispatch(name: str, args: dict[str, Any]) -> dict[str, Any]:
    if name == "read_file":
        return tool_read_file(str(args.get("relative_path", "")))
    if name == "search_repo":
        return tool_search_repo(
            str(args.get("query", "")),
            str(args.get("subpath") or "backend/app"),
        )
    if name == "write_file":
        return tool_write_file(
            str(args.get("relative_path", "")),
            str(args.get("content", "")),
        )
    return {"ok": False, "error": f"Unknown tool: {name}"}
