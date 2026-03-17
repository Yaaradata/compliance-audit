"""Shared JSON utilities for AWS evidence (PostgreSQL JSONB-safe strings)."""
import re


def sanitize_for_jsonb(obj):
    """
    Recursively remove null bytes and other control characters from strings
    so PostgreSQL JSONB accepts them (it rejects \\u0000 and some other chars).
    """
    if obj is None:
        return None
    if isinstance(obj, dict):
        return {k: sanitize_for_jsonb(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [sanitize_for_jsonb(v) for v in obj]
    if isinstance(obj, str):
        # Remove NULL and C0/C1 control chars (0x00-0x1F, 0x7F-0x9F); replace \ufffd with ?
        return re.sub(
            r"[\x00-\x1f\x7f-\x9f\ufffd]",
            lambda m: "?" if m.group(0) == "\ufffd" else "",
            obj,
        )
    return obj
