"""Shared JSON utilities for AWS evidence (PostgreSQL JSONB-safe serialization)."""
import math
import re
import uuid
from datetime import datetime, date
from decimal import Decimal


def sanitize_for_jsonb(obj):
    """
    Recursively coerce every value in an AWS SDK response to a PostgreSQL
    JSONB-compatible Python primitive so SQLAlchemy never sees a datetime,
    Decimal, bytes, or set that the JSONB driver cannot serialize.

    Conversions applied:
      datetime / date  → ISO-8601 string
      Decimal          → int if whole number, else float
      bytes            → hex string
      set / frozenset  → sorted list (for determinism)
      str              → control-char-stripped string (NULL bytes etc.)
      anything else unknown → str(value) so the INSERT never fails
    """
    if obj is None:
        return None

    if isinstance(obj, dict):
        # JSON object keys must be strings; also normalizes accidental UUID keys.
        return {str(k): sanitize_for_jsonb(v) for k, v in obj.items()}

    if isinstance(obj, list):
        return [sanitize_for_jsonb(v) for v in obj]

    if isinstance(obj, (set, frozenset)):
        return sorted(sanitize_for_jsonb(v) for v in obj)

    # datetime before date because datetime IS-A date
    if isinstance(obj, datetime):
        return obj.isoformat()

    if isinstance(obj, date):
        return obj.isoformat()

    if isinstance(obj, Decimal):
        return int(obj) if obj == obj.to_integral_value() else float(obj)

    if isinstance(obj, bytes):
        return obj.hex()

    if isinstance(obj, str):
        # Remove NULL bytes (0x00) and C0/C1 control chars that PostgreSQL JSONB rejects
        return re.sub(
            r"[\x00-\x1f\x7f-\x9f\ufffd]",
            lambda m: "?" if m.group(0) == "\ufffd" else "",
            obj,
        )

    if isinstance(obj, uuid.UUID):
        return str(obj)

    if isinstance(obj, bool):
        return obj

    if isinstance(obj, int):
        return obj

    if isinstance(obj, float):
        # Standard JSON (and FastAPI's encoder with allow_nan=False) cannot emit NaN/Infinity.
        if not math.isfinite(obj):
            return None
        return obj

    # Fallback: stringify anything else (e.g. botocore StreamingBody, Enum)
    return str(obj)
