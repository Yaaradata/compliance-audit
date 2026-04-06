"""Domain models for parsed Excel and planning."""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class CollectorSpec:
    """One logical Azure collector derived from grouped Excel rows."""

    name: str
    evidence_type: str
    source_system: str
    control_mappings: list[tuple[str, str]] = field(default_factory=list)

    def normalized_mappings(self) -> list[tuple[str, str]]:
        seen: set[tuple[str, str]] = set()
        out: list[tuple[str, str]] = []
        for ic, cid in self.control_mappings:
            key = (str(ic).strip(), str(cid).strip())
            if key in seen:
                continue
            seen.add(key)
            out.append(key)
        return out
