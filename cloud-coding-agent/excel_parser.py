"""Parse Azure evidence Excel into CollectorSpec objects."""
from __future__ import annotations

import os
import re
import sys
from pathlib import Path
from typing import Any

import pandas as pd

from models import CollectorSpec

AGENT_ROOT = Path(__file__).resolve().parent
REPO_ROOT = AGENT_ROOT.parent

EVIDENCE_REGISTRY_CACHE: list[dict[str, Any]] | None | bool = False  # False = not loaded


def _normalize_column(name: str) -> str:
    s = str(name).strip().lower()
    s = re.sub(r"\s+", "_", s)
    s = re.sub(r"[^a-z0-9_]", "", s)
    return s


EXPECTED_ALIASES: dict[str, tuple[str, ...]] = {
    "collector_name": ("collector_name", "collector", "name", "collector_id", "module"),
    "item_code": ("item_code", "item", "swift_item", "evidence_item"),
    "control_id": ("control_id", "control", "cscf_control", "controlid"),
    "evidence_type": ("evidence_type", "type", "evidence_category"),
    "source_system": ("source_system", "source", "system"),
}


def _build_rename_map(columns: list[str]) -> dict[str, str]:
    """Map original column header -> canonical name."""
    norm_to_orig = {_normalize_column(c): c for c in columns}
    out: dict[str, str] = {}
    for canonical, aliases in EXPECTED_ALIASES.items():
        for a in aliases:
            key = _normalize_column(a)
            if key in norm_to_orig:
                out[norm_to_orig[key]] = canonical
                break
    return out


def _first_non_empty(values: list[Any]) -> str:
    for v in values:
        if v is None or (isinstance(v, float) and pd.isna(v)):
            continue
        t = str(v).strip()
        if t and t.lower() != "nan":
            return t
    return ""


def _try_load_evidence_registry() -> list[dict[str, Any]] | None:
    """Load SWIFT CSCF control_ids from backend (same as GCP/Azure collectors)."""
    global EVIDENCE_REGISTRY_CACHE
    if EVIDENCE_REGISTRY_CACHE not in (False, None):
        return EVIDENCE_REGISTRY_CACHE  # type: ignore[return-value]
    if EVIDENCE_REGISTRY_CACHE is None:
        return None
    backend = REPO_ROOT / "backend"
    if not backend.is_dir():
        EVIDENCE_REGISTRY_CACHE = None
        return None
    if str(backend) not in sys.path:
        sys.path.insert(0, str(backend))
    try:
        from app.aws_evidence.collectors.evidence_mapping import EVIDENCE_REGISTRY as reg  # type: ignore[import-untyped]

        EVIDENCE_REGISTRY_CACHE = list(reg)
        print(f"[excel] Loaded {len(EVIDENCE_REGISTRY_CACHE)} SWIFT evidence items from evidence_mapping.EVIDENCE_REGISTRY")
        return EVIDENCE_REGISTRY_CACHE
    except Exception as e:
        print(f"[excel] Could not import EVIDENCE_REGISTRY ({e}); control_ids may be empty.")
        EVIDENCE_REGISTRY_CACHE = None
        return None


def _control_pairs_for_item(item_id: str) -> list[tuple[str, str]]:
    reg = _try_load_evidence_registry()
    want = item_id.strip().upper()
    if reg:
        for spec in reg:
            iid = str(spec.get("item_id", "")).strip().upper()
            if iid == want:
                cids = spec.get("control_ids") or []
                return [(want, str(cid)) for cid in cids]
    return [(want, "")]


# SWIFT items are A1, B3, …; a few are single-letter (G, H) per evidence_mapping.
_ITEM_CODE_RE = re.compile(r"^([A-H]\d*)\b", re.IGNORECASE)


def _parse_item_code_from_evidence_item(text: str) -> str | None:
    if not text or not str(text).strip():
        return None
    t = str(text).replace("\u2013", "-").replace("\u2014", "-").strip()
    m = _ITEM_CODE_RE.match(t)
    if not m:
        return None
    code = m.group(1).upper()
    return code if code else None


def _collector_name_from_row(item_id: str, evidence_item: str) -> str:
    rest = str(evidence_item).replace("\u2013", "-").replace("\u2014", "-")
    rest = re.sub(r"^[A-H]\d+\s*[-–]?\s*", "", rest, flags=re.IGNORECASE).strip()
    slug = re.sub(r"[^a-z0-9]+", "_", rest.lower()).strip("_")[:60]
    if not slug:
        slug = "evidence"
    return f"azure_{item_id.lower()}_{slug}"


def _infer_source_system(api_or_services: str) -> str:
    s = (api_or_services or "").lower()
    if "resources |" in s or "resources|" in s:
        return "azure-resource-graph"
    if "get /" in s or "microsoft." in s:
        return "azure-rest-api"
    return "azure-evidence"


def _pick_sheet_name(path: Path, xl: pd.ExcelFile) -> str:
    env = (os.getenv("AZURE_EVIDENCE_EXCEL_SHEET") or "").strip()
    if env:
        if env not in xl.sheet_names:
            raise ValueError(f"Sheet {env!r} not found. Available: {xl.sheet_names}")
        return env
    for name in xl.sheet_names:
        if re.match(r"1_.*Evidence", name, re.I):
            return name
    return xl.sheet_names[0]


def _find_header_row_index(df_raw: pd.DataFrame) -> int | None:
    for i in range(min(35, len(df_raw))):
        cells = []
        for x in df_raw.iloc[i].tolist():
            if x is None or (isinstance(x, float) and pd.isna(x)):
                cells.append("")
            else:
                cells.append(str(x).strip().lower())
        joined = " ".join(cells)
        if "evidence item" in joined and ("swift" in joined or "domain" in joined):
            return i
    return None


def _parse_swift_azure_mapping_sheet(path: Path) -> list[CollectorSpec]:
    """Parse ``Azure_Evidence_Collection_SWIFT_v2026.xlsx`` style sheet (title rows + header on row 3)."""
    xl = pd.ExcelFile(path, engine="openpyxl")
    sheet = _pick_sheet_name(path, xl)
    print(f"[excel] Using workbook layout: SWIFT Azure mapping (sheet={sheet!r})")

    df_raw = pd.read_excel(path, sheet_name=sheet, header=None, engine="openpyxl")
    h_idx = _find_header_row_index(df_raw)
    if h_idx is None:
        raise ValueError(
            "Could not find a header row containing 'Evidence Item' and SWIFT domain. "
            "Set AZURE_EVIDENCE_EXCEL_SHEET if the mapping is on another sheet."
        )

    headers = []
    for c in df_raw.iloc[h_idx].tolist():
        if c is None or (isinstance(c, float) and pd.isna(c)):
            headers.append("")
        else:
            headers.append(str(c).strip())
    norm_headers = [_normalize_column(h) or f"col_{i}" for i, h in enumerate(headers)]

    # Deduplicate empty normalized names
    seen: dict[str, int] = {}
    uniq: list[str] = []
    for h in norm_headers:
        if h in seen:
            seen[h] += 1
            uniq.append(f"{h}_{seen[h]}")
        else:
            seen[h] = 0
            uniq.append(h)

    data = df_raw.iloc[h_idx + 1 :].copy()
    data.columns = uniq

    col_evidence = None
    col_type = None
    col_api = None
    for name in ("evidence_item", "evidenceitem"):
        if name in data.columns:
            col_evidence = name
            break
    for name in ("evidence_type", "evidencetype"):
        if name in data.columns:
            col_type = name
            break
    for c in data.columns:
        cn = str(c).lower()
        if "api" in cn and "data" in cn and "source" in cn.replace("_", ""):
            col_api = c
            break
    if col_evidence is None:
        for c in data.columns:
            if "evidence" in str(c).lower() and "item" in str(c).lower():
                col_evidence = c
                break
    if col_type is None:
        for c in data.columns:
            if "evidence" in str(c).lower() and "type" in str(c).lower():
                col_type = c
                break

    # Positional fallback for ``Azure_Evidence_Collection_SWIFT_v2026.xlsx`` (cols A–I)
    if col_evidence is None and len(data.columns) > 1:
        col_evidence = data.columns[1]
        print(f"[excel] Using column index 1 {col_evidence!r} as Evidence Item.")
    if col_type is None and len(data.columns) > 7:
        col_type = data.columns[7]
    if col_api is None and len(data.columns) > 6:
        col_api = data.columns[6]

    if col_evidence is None:
        raise ValueError("SWIFT Azure sheet: no 'Evidence Item' column found.")

    specs: list[CollectorSpec] = []
    for idx, row in data.iterrows():
        raw_ev = row.get(col_evidence)
        if raw_ev is None or (isinstance(raw_ev, float) and pd.isna(raw_ev)):
            continue
        evidence_item = str(raw_ev).strip()
        if not evidence_item or evidence_item.lower() == "nan":
            continue

        item_id = _parse_item_code_from_evidence_item(evidence_item)
        if not item_id:
            print(f"[excel] Skipping row {idx}: no A1-style item code in {evidence_item!r}")
            continue

        cname = _collector_name_from_row(item_id, evidence_item)
        et = ""
        if col_type:
            et = str(row.get(col_type) or "").strip()
        if not et:
            et = "config"
        api_cell = ""
        if col_api:
            v = row.get(col_api)
            if v is not None and not (isinstance(v, float) and pd.isna(v)):
                api_cell = str(v)
        src = _infer_source_system(api_cell)

        mappings = _control_pairs_for_item(item_id)
        if not any(cid for _, cid in mappings):
            print(f"[excel] Warning: no CSCF control_ids for {item_id}; add backend on PYTHONPATH or use flat Excel.")

        spec = CollectorSpec(name=cname, evidence_type=et, source_system=src, control_mappings=mappings)
        spec.control_mappings = spec.normalized_mappings()
        if spec.control_mappings:
            specs.append(spec)

    return specs


def _standard_columns_ok(df: pd.DataFrame) -> bool:
    rename_map = _build_rename_map([str(c) for c in df.columns])
    df2 = df.rename(columns=rename_map)
    return (
        "collector_name" in df2.columns
        and "item_code" in df2.columns
        and "control_id" in df2.columns
    )


def _parse_standard_format(df: pd.DataFrame) -> list[CollectorSpec]:
    df.columns = [str(c) for c in df.columns]
    rename_map = _build_rename_map(list(df.columns))
    df = df.rename(columns=rename_map)

    if "evidence_type" not in df.columns:
        df["evidence_type"] = "config"
    if "source_system" not in df.columns:
        df["source_system"] = "azure-generated"

    groups: dict[str, list[Any]] = {}
    for idx, row in df.iterrows():
        try:
            cname = str(row["collector_name"]).strip()
        except Exception:
            cname = ""
        if not cname or cname.lower() in ("nan", "none"):
            print(f"[excel] Skipping row {idx}: empty collector_name")
            continue
        groups.setdefault(cname, []).append(idx)

    specs: list[CollectorSpec] = []
    for collector_name in sorted(groups.keys(), key=str.lower):
        row_indices = groups[collector_name]
        sub = df.loc[row_indices]
        mappings: list[tuple[str, str]] = []
        for _, row in sub.iterrows():
            try:
                ic = str(row["item_code"]).strip()
                cid = str(row["control_id"]).strip()
            except Exception:
                continue
            if not ic or ic.lower() == "nan":
                continue
            if not cid or cid.lower() == "nan":
                cid = ""
            mappings.append((ic, cid))

        et = _first_non_empty(sub["evidence_type"].tolist())
        if not et:
            et = "config"
        src = _first_non_empty(sub["source_system"].tolist())
        if not src:
            src = "azure-generated"

        spec = CollectorSpec(
            name=collector_name,
            evidence_type=et,
            source_system=src,
            control_mappings=mappings,
        )
        spec.control_mappings = spec.normalized_mappings()
        if not spec.control_mappings:
            print(f"[excel] Warning: collector '{collector_name}' has no valid control mappings; skipping.")
            continue
        specs.append(spec)

    return specs


def parse_excel(path: Path) -> list[CollectorSpec]:
    """
    Read Excel with pandas.

    Supports two layouts:

    1. **Flat agent format**: columns ``collector_name``, ``item_code``, ``control_id`` (+ optional
       ``evidence_type``, ``source_system``).

    2. **SWIFT Azure workbook** (e.g. ``Azure_Evidence_Collection_SWIFT_v2026.xlsx``): sheet
       ``1_Evidence_Azure_Mapping`` with title rows and a header row containing
       ``SWIFT Domain`` / ``Evidence Item`` / ``Evidence Type`` / ``API / Data Source``.
       CSCF control IDs are filled from ``app.aws_evidence...evidence_mapping.EVIDENCE_REGISTRY`` when
       the backend package is importable.
    """
    if not path.exists():
        raise FileNotFoundError(f"Excel file not found: {path}")

    suf = path.suffix.lower()
    if suf not in (".xlsx", ".xls", ".xlsm"):
        raise ValueError(
            f"Expected an Excel workbook (.xlsx / .xls / .xlsm), not {path.suffix!r}. "
            "Use the Azure collector mapping workbook (e.g. Azure_Evidence_Collection_SWIFT_v2026.xlsx), "
            "not Evidence_Based_Questions CSV files."
        )

    try:
        df = pd.read_excel(path, engine="openpyxl")
    except Exception as e:
        raise RuntimeError(f"Failed to read Excel {path}: {e}") from e

    if df.empty:
        print("[excel] Warning: workbook has no rows.")
        return []

    if _standard_columns_ok(df):
        print("[excel] Using workbook layout: flat agent columns (collector_name / item_code / control_id).")
        return _parse_standard_format(df)

    try:
        return _parse_swift_azure_mapping_sheet(path)
    except Exception as e:
        raise ValueError(
            f"Not a flat agent sheet and SWIFT Azure mapping parse failed: {e}. "
            f"First-sheet columns were: {list(df.columns)}"
        ) from e
