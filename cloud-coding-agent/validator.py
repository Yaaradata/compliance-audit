"""Validate generated Python collector source before writing."""
from __future__ import annotations

import ast
from typing import NamedTuple


class ValidationResult(NamedTuple):
    ok: bool
    errors: list[str]


_REQUIRED_SUBSTRINGS = ("COLLECTOR_NAME", "CONTROL_MAPPINGS", "def collect(")


def validate_collector_source(source: str) -> ValidationResult:
    errors: list[str] = []
    for sub in _REQUIRED_SUBSTRINGS:
        if sub not in source:
            errors.append(f"Missing required fragment: {sub!r}")

    if "return" not in source:
        errors.append("No 'return' statement found")

    stripped = source.strip()
    if stripped.startswith("```"):
        errors.append("Output looks like markdown fenced code; expected raw Python only")

    try:
        ast.parse(source)
    except SyntaxError as e:
        errors.append(f"Syntax error: {e}")

    return ValidationResult(ok=len(errors) == 0, errors=errors)
