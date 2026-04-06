"""Heuristic cloud detection from collector-mapping Excel workbooks."""
from __future__ import annotations

from pathlib import Path
from typing import Any

import pandas as pd


def detect_cloud_from_excel(path: Path, *, max_sheets: int = 5, sample_rows: int = 40) -> tuple[str, dict[str, int]]:
    """
    Return (best_guess, scores) where best_guess is 'azure' | 'gcp' | 'aws' | 'unknown'.
    Uses sheet names + first rows of the first sheets.
    """
    if not path.is_file():
        return "unknown", {"azure": 0, "gcp": 0, "aws": 0}

    try:
        xl = pd.ExcelFile(path, engine="openpyxl")
    except Exception:
        return "unknown", {"azure": 0, "gcp": 0, "aws": 0}

    chunks: list[str] = []
    for sn in xl.sheet_names:
        chunks.append(str(sn))
    for sn in xl.sheet_names[:max_sheets]:
        try:
            df = pd.read_excel(path, sheet_name=sn, header=None, nrows=sample_rows, engine="openpyxl")
            chunks.append(df.to_string())
        except Exception:
            continue

    blob = "\n".join(chunks).lower()

    azure_kw = (
        "azure",
        "microsoft",
        "resource graph",
        "kql",
        "subscription id",
        "entra",
        "microsoft.network",
        "microsoft.authorization",
    )
    gcp_kw = (
        "gcp",
        "google cloud",
        "bigquery",
        "cloud asset",
        "gcloud",
        "google.cloud",
        "projects/",
        "cloud resource manager",
    )
    aws_kw = (
        "aws",
        "amazon",
        "cloudtrail",
        "boto",
        "ec2:",
        "arn:aws",
        "describeinstances",
    )

    def score(keys: tuple[str, ...]) -> int:
        return sum(blob.count(k) for k in keys)

    scores = {
        "azure": score(azure_kw),
        "gcp": score(gcp_kw),
        "aws": score(aws_kw),
    }
    mx = max(scores.values())
    if mx == 0:
        return "unknown", scores
    # Prefer single winner; tie → unknown so user must confirm
    winners = [k for k, v in scores.items() if v == mx]
    if len(winners) != 1:
        return "unknown", scores
    return winners[0], scores
