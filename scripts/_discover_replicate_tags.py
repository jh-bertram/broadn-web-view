#!/usr/bin/env python3
"""
Temporary discovery script — COL_SAMPLE_REPLICATE unique values.
Run once for discovery; do NOT commit to production.
"""

import re
import warnings
from pathlib import Path
from collections import Counter

import pandas as pd

REPO_ROOT = Path(__file__).resolve().parent.parent
XLSX_PATH = REPO_ROOT / "Bdb-317.xlsx"

COL_SAMPLE_CATEGORY = "Sample Category"
COL_SAMPLE_REPLICATE = "Sample Replicate"
FIELD_SAMPLE_CATEGORY = "Field Sample"

# ── Token classification patterns ───────────────────────────────────────────
RE_TIME_OF_DAY = re.compile(r"^(am|pm)$", re.IGNORECASE)
RE_REPLICATE = re.compile(r"^R\d+$", re.IGNORECASE)
RE_POSITION = re.compile(r"^[ATB]$", re.IGNORECASE)
RE_CLOCK_QUADRANT = re.compile(r"^Q\d{1,2}(/\d{1,2})?$", re.IGNORECASE)
RE_FIELD_CONTROL = re.compile(r"^F[BC]$", re.IGNORECASE)

AMBIGUOUS_TOKENS = {"B", "b"}  # could be position-bottom OR field-blank


def classify_token(tok: str) -> str:
    t = tok.strip()
    if RE_TIME_OF_DAY.match(t):
        return "time_of_day"
    if RE_REPLICATE.match(t):
        return "replicate"
    if RE_CLOCK_QUADRANT.match(t):
        return "clock_quadrant"
    if RE_FIELD_CONTROL.match(t):
        return "field_controls"
    if RE_POSITION.match(t):
        return "position"
    return "other"


def main() -> None:
    print(f"Loading {XLSX_PATH} ...")
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        df = pd.read_excel(XLSX_PATH, engine="openpyxl")

    field_samples = df[df[COL_SAMPLE_CATEGORY] == FIELD_SAMPLE_CATEGORY].copy()
    print(f"Total field samples: {len(field_samples)}")

    if COL_SAMPLE_REPLICATE not in field_samples.columns:
        print(f"ERROR: Column '{COL_SAMPLE_REPLICATE}' not found in xlsx")
        return

    raw_series = field_samples[COL_SAMPLE_REPLICATE].dropna().astype(str)
    print(f"Non-null replicate values: {len(raw_series)}")
    fill_rate = len(raw_series) / len(field_samples) * 100
    print(f"Fill rate (field samples): {fill_rate:.1f}%\n")

    # ── 1. Raw value counts ──────────────────────────────────────────────────
    raw_counts = raw_series.value_counts().sort_index()
    print("=== RAW VALUE COUNTS (sorted alphabetically) ===")
    for val, cnt in raw_counts.items():
        print(f"  {cnt:4d}  {repr(val)}")
    print(f"\nTotal unique raw values: {len(raw_counts)}\n")

    # ── 2. Multi-value (comma-separated) entries ─────────────────────────────
    multi = [(val, cnt) for val, cnt in raw_counts.items() if "," in val]
    print("=== COMMA-SEPARATED MULTI-VALUE ENTRIES ===")
    if multi:
        for val, cnt in multi:
            print(f"  {cnt:4d}  {repr(val)}")
    else:
        print("  (none found)")
    print()

    # ── 3. Atomic token extraction & classification ──────────────────────────
    token_counter: Counter = Counter()
    token_in_raw: dict[str, list[str]] = {}  # token → raw values it appeared in

    for val in raw_series:
        tokens = [t.strip() for t in val.split(",") if t.strip()]
        for tok in tokens:
            token_counter[tok] += 1
            token_in_raw.setdefault(tok, [])
            if val not in token_in_raw[tok]:
                token_in_raw[tok].append(val)

    print("=== ATOMIC TOKEN CLASSIFICATION ===")
    print(f"  {'TOKEN':<20} {'COUNT':>6}  {'CATEGORY':<20}  {'AMBIGUOUS?'}")
    print("  " + "-" * 65)

    categories: dict[str, list[str]] = {}
    ambiguous_tokens: list[tuple[str, int]] = []

    for tok, cnt in sorted(token_counter.items(), key=lambda x: x[0]):
        cat = classify_token(tok)
        is_ambiguous = tok in AMBIGUOUS_TOKENS
        flag = "** AMBIGUOUS **" if is_ambiguous else ""
        print(f"  {tok:<20} {cnt:>6}  {cat:<20}  {flag}")
        categories.setdefault(cat, []).append(tok)
        if is_ambiguous:
            ambiguous_tokens.append((tok, cnt))

    print()

    # ── 4. Category summary ──────────────────────────────────────────────────
    print("=== CATEGORY SUMMARY ===")
    for cat in ["time_of_day", "replicate", "position", "clock_quadrant", "field_controls", "other"]:
        toks = categories.get(cat, [])
        print(f"  {cat:<20}: {toks}")
    print()

    # ── 5. Ambiguous token detail ────────────────────────────────────────────
    print("=== AMBIGUOUS TOKEN DETAIL ===")
    if ambiguous_tokens:
        for tok, cnt in ambiguous_tokens:
            raw_contexts = token_in_raw.get(tok, [])
            print(f"  Token: {repr(tok)}  count={cnt}")
            print(f"  Appears in raw values: {raw_contexts[:10]}")
    else:
        print("  (no ambiguous tokens detected by heuristic)")
    print()

    # ── 6. Unexpected / other tokens ────────────────────────────────────────
    other_toks = categories.get("other", [])
    print("=== 'OTHER' (unclassified) TOKENS ===")
    if other_toks:
        for tok in other_toks:
            cnt = token_counter[tok]
            print(f"  {cnt:4d}  {repr(tok)}")
    else:
        print("  (none — all tokens classified)")
    print()

    print("Discovery complete.")


if __name__ == "__main__":
    main()
