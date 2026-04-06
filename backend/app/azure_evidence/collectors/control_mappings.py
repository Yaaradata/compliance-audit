"""Reuse SWIFT (item_code, control_id) pairs from the canonical AWS evidence registry."""
from app.gcp_evidence.collectors.control_mappings import swift_control_pairs

__all__ = ["swift_control_pairs"]
