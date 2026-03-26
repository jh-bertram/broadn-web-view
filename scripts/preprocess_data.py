#!/usr/bin/env python3
"""
preprocess_data.py — BROADN Aerobiome web dashboard data aggregator.

Reads Bdb-317.xlsx and produces data/data.json.
Coordinates for the sites array are sourced from data/sites.json.

Idempotent: safe to run multiple times; overwrites output each run.

SEQUENCING DETECTION (human-confirmed rule):
  A sample is counted as sequenced if and only if at least one of the
  sequencing columns ('Sequence 16s', 'Sequence ITS', 'Sequence 18s',
  'MetaGenome Sequence') contains a non-empty, non-null STRING on a
  derivative row whose parent specimen ID matches a field sample ID.
  Boolean/numeric coercion is NOT used. Empty string or NaN = not sequenced.

  Because the xlsx stores sequencing run IDs (e.g. 'SR40', 'PTSR26',
  'SR33') exclusively on derivative (Sample Product) rows — never on
  the originating Field Sample row — we must join derivatives back to
  their parent specimen IDs before counting.

SITE CODE:
  The Originating Location is derived by concatenating chars [1:3] of
  the BROADN ID, which encodes Collection Site letter + Specific Site
  letter per the BROADN_ID-protocol.md Appendix A.  The xlsx does not
  have a literal 'Originating Location' column; the two-char composite
  code is embedded in the BROADN ID.

  Example: BSE0042P → site_code = 'SE' (SGRC-East)

SLICE VIEWS (added 2026-03-17):
  slice_views.project — field samples grouped by 'Project ID' column
  slice_views.location — field samples grouped by 'Sample Collection Location' column
  slice_views.lab_group — field samples grouped by 'Project Lead' column

  Collection Height column does NOT exist in xlsx — height_distribution omitted.
  'Sample Collected Time' exists at 19.1% fill rate — time_distribution included
  in location entries where at least 1 non-null time value exists.
"""

import json
import os
import sys
import warnings
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

# ── Paths ──────────────────────────────────────────────────────────────────────
REPO_ROOT = Path(__file__).resolve().parent.parent
XLSX_PATH = REPO_ROOT / "Bdb-317.xlsx"
SITES_JSON_PATH = REPO_ROOT / "data" / "sites.json"
OUTPUT_PATH = REPO_ROOT / "data" / "data.json"

# ── Column name mapping ─────────────────────────────────────────────────────────
# Actual xlsx column names (verified via inspect_bdb.py on 2026-03-17).
# Listed here so deviations from any prior documentation are explicit.
COL_BROADN_ID = "BROADN ID"
COL_SAMPLE_CATEGORY = "Sample Category"
COL_SAMPLE_SOURCE_TYPE = "Sample Source Type"         # air/soil/plant/liquid — used as sample_type
COL_COLLECTION_LOCATION = "Sample Collection Location"
COL_COLLECTION_SPECIFIC = "Sample Collection Specific Site"
COL_COLLECTED_DATE = "Sample Collected Date"
COL_PRODUCT = "Product"                               # 'DNA', 'Isolate', or NaN on field samples
COL_PROJECT_ID = "Project ID"
COL_PROJECT_LEAD = "Project Lead"
COL_COLLECTED_TIME = "Sample Collected Time"
COL_SAMPLER_TYPE = "Sampler Type"       # device/method used (e.g. 'SASS', 'SKC BioSampler') — 73.9% fill on field samples (verified 2026-03-22)
COL_SAMPLE_REPLICATE = "Sample Replicate"  # batch/replicate tag (e.g. 'AM', 'PM') — 45.9% fill on field samples (verified 2026-03-22)

# New typed tag columns (added in xlsx split — may not yet exist in current xlsx).
# parse_replicate_tags() still references COL_SAMPLE_REPLICATE for the legacy single-column flow.
COL_SAMPLE_AMPM        = "Sample AM/PM"
COL_SAMPLE_REPLICATE_R = "Sample Replicate"   # alias for new typed replicate column
COL_SAMPLE_QUADRANT    = "Sample Quadrant"
COL_SAMPLE_POSITION    = "Sample Position"
COL_SAMPLE_FC          = "Sample Field Control"

# Sequencing columns — values are run IDs (filenames/strings) stored on
# derivative rows only.  Empty / NaN = not sequenced.
SEQ_COLS = [
    "Sequence 16s",
    "Sequence ITS",
    "Sequence 18s",
    "MetaGenome Sequence",
]

FIELD_SAMPLE_CATEGORY = "Field Sample"


def load_xlsx(path: Path) -> pd.DataFrame:
    """Load the workbook with openpyxl engine."""
    if not path.exists():
        print(f"ERROR: xlsx not found at {path}", file=sys.stderr)
        sys.exit(1)
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        df = pd.read_excel(path, engine="openpyxl")
    return df


def load_sites(path: Path) -> dict:
    """Load sites.json and index by 2-char composite code."""
    with open(path) as f:
        sites_list = json.load(f)
    return {s["code"]: s for s in sites_list}


def has_sequencing_string(row: pd.Series) -> bool:
    """Return True if any sequencing column contains a non-empty, non-null string.

    IMPORTANT: No boolean or numeric coercion is performed.  Only a
    truthy string value (length > 0 after strip) counts as 'sequenced'.
    """
    for col in SEQ_COLS:
        val = row[col]
        if pd.notna(val) and isinstance(val, str) and val.strip():
            return True
    return False


def compute_pipeline_counts(df: pd.DataFrame, field_ids: set) -> tuple[int, int, int]:
    """Return (collected, dna_extracted, sequenced) for field samples.

    - collected: count of field sample rows
    - dna_extracted: count of unique field specimen IDs that have a DNA
      derivative row (Product == 'DNA').  Derivative IDs contain '.' so
      the specimen ID is the part before '.'.
    - sequenced: count of unique field specimen IDs that have a
      derivative row with at least one non-empty sequencing column.
    """
    collected = len(field_ids)

    # DNA extraction count
    dna_rows = df[df[COL_PRODUCT] == "DNA"].copy()
    dna_rows["_specimen_id"] = dna_rows[COL_BROADN_ID].str.split(".").str[0]
    dna_extracted = len(set(dna_rows["_specimen_id"]) & field_ids)

    # Sequencing count — via derivative rows
    seq_mask = df[SEQ_COLS].apply(
        lambda col: col.notna() & col.astype(str).str.strip().ne("")
    ).any(axis=1)
    seq_rows = df[seq_mask].copy()
    seq_rows["_specimen_id"] = seq_rows[COL_BROADN_ID].str.split(".").str[0]
    sequenced = len(set(seq_rows["_specimen_id"]) & field_ids)

    return collected, dna_extracted, sequenced


def print_fill_rates(df: pd.DataFrame, field_samples: pd.DataFrame) -> None:
    """Print fill-rate summary for sequencing and lat/lon columns."""
    print("\n=== FILL RATES (all rows) ===")
    for col in SEQ_COLS:
        non_null = df[col].notna().sum()
        pct = 100 * non_null / len(df)
        print(f"  {col}: {non_null}/{len(df)} ({pct:.1f}%)")

    print("\n=== FILL RATES (field samples only) ===")
    for col in SEQ_COLS:
        non_null = field_samples[col].notna().sum()
        pct = 100 * non_null / len(field_samples)
        print(f"  {col}: {non_null}/{len(field_samples)} ({pct:.1f}%)")
        print(f"    NOTE: Sequencing run IDs are stored on derivative rows, not field sample rows.")

    print("\n=== LAT/LON FILL (all rows) ===")
    for col in ["Latitude", "Longitude"]:
        non_null = df[col].notna().sum()
        pct = 100 * non_null / len(df)
        print(f"  {col}: {non_null}/{len(df)} ({pct:.1f}%)")


def print_data_quality_warnings(df: pd.DataFrame, field_samples: pd.DataFrame) -> None:
    """Print any data quality anomalies observed."""
    print("\n=== DATA QUALITY WARNINGS ===")

    # Rows with unknown specific site
    unknown_specific = field_samples[
        field_samples[COL_COLLECTION_SPECIFIC] == "Unknown"
    ]
    if len(unknown_specific) > 0:
        by_loc = unknown_specific[COL_COLLECTION_LOCATION].value_counts()
        print(
            f"  WARNING: {len(unknown_specific)} field sample rows have "
            f"'Unknown' Specific Site. These map to 'X' in the 2nd char of "
            f"BROADN ID. Sites affected: {dict(by_loc)}"
        )

    # Rows with Unknown collection location
    unknown_loc = field_samples[
        field_samples[COL_COLLECTION_LOCATION] == "Unknown"
    ]
    if len(unknown_loc) > 0:
        print(f"  WARNING: {len(unknown_loc)} field sample rows have 'Unknown' Collection Location.")

    # Rows missing collection date
    missing_date = field_samples[COL_COLLECTED_DATE].isna().sum()
    if missing_date > 0:
        pct = 100 * missing_date / len(field_samples)
        print(f"  WARNING: {missing_date} field samples ({pct:.1f}%) have no collection date — excluded from temporal array.")

    # Rows with longitude > 0 (Doane University is at ~+96.9, which is in Nebraska)
    pos_lon = field_samples[field_samples["Longitude"] > 0]
    if len(pos_lon) > 0:
        print(
            f"  INFO: {len(pos_lon)} field sample rows have positive longitude "
            f"(expected for Doane University, Nebraska ~+96.9 E). "
            f"Locations: {pos_lon[COL_COLLECTION_LOCATION].value_counts().to_dict()}"
        )

    # SGRC South ('SS') site code has no field samples in xlsx
    ss_count = field_samples[field_samples[COL_BROADN_ID].str[1:3] == "SS"].shape[0]
    if ss_count == 0:
        print("  INFO: SGRC-South ('SS') has 0 field samples in this dataset but is included in sites.json per protocol.")

    # PGF sites only have 'Unknown' specific site (PX code)
    pgf_samples = field_samples[field_samples[COL_COLLECTION_LOCATION] == "PGF"]
    if len(pgf_samples) > 0 and (pgf_samples[COL_COLLECTION_SPECIFIC] == "Unknown").all():
        print("  INFO: All PGF field samples use 'Unknown' specific site (BROADN ID code 'PX'). PI/PG codes have no field samples.")


def build_temporal(field_samples: pd.DataFrame) -> list:
    """One entry per year-month for field samples with a valid collection date."""
    dated = field_samples.dropna(subset=[COL_COLLECTED_DATE]).copy()
    dated["_ym"] = dated[COL_COLLECTED_DATE].dt.to_period("M").astype(str)
    counts = dated.groupby("_ym").size().reset_index(name="count")
    counts = counts.sort_values("_ym")
    return [{"month": row["_ym"], "count": int(row["count"])} for _, row in counts.iterrows()]


def build_sample_types(field_samples: pd.DataFrame) -> list:
    """Count by Sample Source Type for field samples."""
    counts = field_samples[COL_SAMPLE_SOURCE_TYPE].value_counts()
    return [{"type": t, "count": int(c)} for t, c in counts.items()]


def build_sites_array(field_samples: pd.DataFrame, sites_lookup: dict) -> list:
    """Build sites array grouped by 2-char composite code, lat/lon from sites.json."""
    # Extract 2-char composite code from BROADN ID chars [1:3]
    # Per protocol: B{CollectionSite}{SpecificSite}{IDNumber}{SampleType}
    # chars [1:3] = CollectionSite + SpecificSite
    field_samples = field_samples.copy()
    field_samples["_code"] = field_samples[COL_BROADN_ID].str[1:3]

    results = []
    code_counts = field_samples.groupby("_code").size()

    for code, count in code_counts.items():
        site_info = sites_lookup.get(code)
        site_rows = field_samples[field_samples["_code"] == code]

        # Primary sample types for this site
        type_counts = site_rows[COL_SAMPLE_SOURCE_TYPE].value_counts()
        primary_types = type_counts.index.tolist()[:3]  # top 3

        if site_info:
            lat = site_info["lat"]
            lon = site_info["lon"]
            name = site_info["site_name"]
        else:
            # Fallback to median coords from data if site not in sites.json
            lat_vals = site_rows["Latitude"].dropna()
            lon_vals = site_rows["Longitude"].dropna()
            lat = round(float(lat_vals.median()), 4) if len(lat_vals) > 0 else None
            lon = round(float(lon_vals.median()), 4) if len(lon_vals) > 0 else None
            name = f"Unknown site ({code})"
            print(f"  WARNING: site code '{code}' not found in sites.json — using median coords from data.")

        results.append({
            "code": code,
            "name": name,
            "lat": lat,
            "lon": lon,
            "count": int(count),
            "primary_types": primary_types,
        })

    # Sort by count descending
    results.sort(key=lambda x: x["count"], reverse=True)
    return results


def build_by_site(field_samples: pd.DataFrame, sites_lookup: dict) -> list:
    """Build by_site array with full site name and count."""
    field_samples = field_samples.copy()
    field_samples["_code"] = field_samples[COL_BROADN_ID].str[1:3]
    code_counts = field_samples.groupby("_code").size()

    results = []
    for code, count in code_counts.items():
        site_info = sites_lookup.get(code)
        if site_info:
            site_name = site_info["site_name"]
        else:
            # Fallback: build from collection location + specific site
            rows = field_samples[field_samples["_code"] == code]
            loc = rows[COL_COLLECTION_LOCATION].mode().iloc[0] if len(rows) > 0 else "Unknown"
            spec = rows[COL_COLLECTION_SPECIFIC].mode().iloc[0] if len(rows) > 0 else "Unknown"
            site_name = f"{loc} — {spec}"

        results.append({
            "site": site_name,
            "code": code,
            "count": int(count),
        })

    results.sort(key=lambda x: x["count"], reverse=True)
    return results


def build_recent_samples(field_samples: pd.DataFrame, n: int = 100) -> list:
    """Return up to n most recent field samples by collection date."""
    dated = field_samples.dropna(subset=[COL_COLLECTED_DATE]).copy()
    dated = dated.sort_values(COL_COLLECTED_DATE, ascending=False).head(n)

    results = []
    for _, row in dated.iterrows():
        results.append({
            "id": str(row[COL_BROADN_ID]),
            "date": row[COL_COLLECTED_DATE].strftime("%Y-%m-%d"),
            "site": str(row[COL_COLLECTION_LOCATION]),
            "type": str(row[COL_SAMPLE_SOURCE_TYPE]),
            "category": FIELD_SAMPLE_CATEGORY,
        })
    return results


# ── Location name mapping ───────────────────────────────────────────────────────
LOCATION_NAMES: dict[str, str] = {
    "ARDEC": "ARDEC",
    "Big Spring, Texas": "Big Spring, Texas",
    "CPER": "CPER (Central Plains Experimental Range)",
    "Foothills Campus": "Foothills Campus",
    "IMPROVE": "IMPROVE Network",
    "NWT": "Niwot Ridge (NWT)",
    "Other": "Other",
    "PGF": "PGF",
    "SGRC": "SGRC (Sagebrush Grassland Research Center)",
    "Unknown": "Unknown",
}

# ── Time period bin boundaries (inclusive start, inclusive end in hours) ───────
TIME_PERIODS = [
    ("Night (00:00–05:59)", 0, 5),
    ("Morning (06:00–11:59)", 6, 11),
    ("Afternoon (12:00–17:59)", 12, 17),
    ("Evening (18:00–23:59)", 18, 23),
]


def _time_to_hour(val) -> int | None:
    """Extract the hour integer from a datetime.time object or HH:MM string.

    Returns None if the value is null or unparseable.
    """
    if pd.isna(val) if not hasattr(val, 'hour') else False:
        return None
    try:
        if hasattr(val, 'hour'):
            return val.hour
        # fallback: try string parse
        parts = str(val).split(":")
        return int(parts[0])
    except Exception:
        return None


def build_time_distribution(subset: pd.DataFrame) -> list:
    """Bin 'Sample Collected Time' values into 4 time periods.

    Only rows with a non-null time value are counted.
    Returns empty list if no valid times exist.
    """
    valid = subset[COL_COLLECTED_TIME].dropna()
    if len(valid) == 0:
        return []

    counts = {label: 0 for label, _, _ in TIME_PERIODS}
    for val in valid:
        hour = _time_to_hour(val)
        if hour is None:
            continue
        for label, start, end in TIME_PERIODS:
            if start <= hour <= end:
                counts[label] += 1
                break

    return [{"time_period": label, "count": counts[label]} for label, _, _ in TIME_PERIODS]


def build_sampler_type_dist(group: pd.DataFrame) -> list:
    """Return sampler type distribution sorted descending by count.

    Uses COL_SAMPLER_TYPE ('Sampler Type') which was verified at 73.9% fill
    on field samples (2026-03-22).  Returns [] if the column is absent or the
    fill rate within this group is below 5%.
    """
    if COL_SAMPLER_TYPE not in group.columns:
        # Column absent from xlsx — emit empty list per task spec
        return []
    valid = group[COL_SAMPLER_TYPE].dropna()
    fill_rate = len(valid) / len(group) if len(group) > 0 else 0.0
    if fill_rate < 0.05:
        # Below 5% fill threshold — emit empty list per task spec
        return []
    counts = valid.value_counts()
    return [{"sampler": str(s), "count": int(c)} for s, c in counts.items()]


def parse_replicate_tags(raw_tags_series: pd.Series) -> dict:
    """Parse and group Sample Replicate tags from a pandas Series.

    Splits each cell on comma, strips whitespace, drops empty tokens.
    Returns dict with 6 keys always present:
      time_of_day, replicate, position, clock_quadrant, field_controls, other.
    Each value is a deduplicated sorted list of atomic token strings.

    Grouping rules (human-confirmed 2026-03-23, revised 2026-03-23):
      time_of_day    -- 'am', 'pm', '7a', '7p' (case-insensitive)
      replicate      -- matches ^R[0-9]+$ or ^A[0-9]+$ (case-insensitive)
      position       -- 'A', 'B', 'T', 'C', 'L', 'R' exact match (case-insensitive)
      clock_quadrant -- matches ^Q[0-9]+(/[0-9]+)?$ (e.g. Q1, Q11/12)
      field_controls -- 'FC', 'FB', 'LB', 'KB', 'PT', 'Blank', 'EC' (case-insensitive)
      other          -- everything else (RH, Extra, 1a, 1p, ...)
    """
    import re
    TIME_OF_DAY = {'am', 'pm', '7a', '7p'}
    POSITION = {'a', 'b', 't', 'c', 'l', 'r'}
    FIELD_CONTROLS = {'fc', 'fb', 'lb', 'kb', 'pt', 'blank', 'ec'}

    groups: dict = {
        'time_of_day': set(),
        'replicate': set(),
        'position': set(),
        'clock_quadrant': set(),
        'field_controls': set(),
        'other': set(),
    }

    for cell in raw_tags_series.dropna():
        for token in str(cell).split(','):
            token = token.strip()
            if not token:
                continue
            tl = token.lower()
            if tl in TIME_OF_DAY:
                groups['time_of_day'].add(token)
            elif re.match(r'^[RA]\d+$', token, re.IGNORECASE):
                groups['replicate'].add(token.upper())
            elif tl in POSITION:
                groups['position'].add(token.upper())
            elif re.match(r'^Q\d+(/\d+)?$', token, re.IGNORECASE):
                groups['clock_quadrant'].add(token.upper())
            elif tl in FIELD_CONTROLS:
                groups['field_controls'].add(token)
            else:
                groups['other'].add(token)

    return {k: sorted(v) for k, v in groups.items()}


def parse_tag_column(series: pd.Series) -> list[str]:
    """Return deduplicated sorted list of all token values from a column.

    Handles comma-separated values within cells.
    Returns [] if series is all-NaN or column was absent.
    """
    tokens: set[str] = set()
    for cell in series.dropna():
        for token in str(cell).split(','):
            token = token.strip()
            if token:
                tokens.add(token)
    return sorted(tokens)


# Display label order for tag_groups — FE renders columns in this sequence.
TAG_COL_DISPLAY = [
    (COL_SAMPLE_AMPM,        "AM/PM"),
    (COL_SAMPLE_REPLICATE_R, "Replicate"),
    (COL_SAMPLE_QUADRANT,    "Quadrant"),
    (COL_SAMPLE_POSITION,    "Position"),
    (COL_SAMPLE_FC,          "Field Control"),
]


def build_tag_groups(group: pd.DataFrame, df_col_map: dict) -> dict:
    """Build per-column token counts grouped by source column for display + filtering.

    group: DataFrame slice for this project/location/lab_group
    df_col_map: dict mapping column name -> Series (present) or None (absent)

    Returns ordered dict: { display_label: { token: count } }
    Only includes columns that have at least one non-null value in this group.
    Tokens within each column are sorted by count descending.

    Example:
      { "AM/PM": {"AM": 192, "PM": 192},
        "Quadrant": {"Q1": 48, "Q2": 48, ...} }
    """
    result: dict[str, dict[str, int]] = {}
    for col, label in TAG_COL_DISPLAY:
        if df_col_map.get(col) is None:
            continue
        col_slice = group[col] if col in group.columns else pd.Series(dtype=object)
        token_counts: dict[str, int] = {}
        for cell in col_slice.dropna():
            for token in str(cell).split(','):
                token = token.strip()
                if token:
                    token_counts[token] = token_counts.get(token, 0) + 1
        if token_counts:
            result[label] = dict(sorted(token_counts.items(), key=lambda x: -x[1]))
    return result


def build_tag_charts(
    group: pd.DataFrame,
    df_col_map: dict,
    df: pd.DataFrame,
) -> dict:
    """Per-token cross-tab chart data for tag-filtered slice chart rendering.

    For each token in each typed tag column, filters the group to rows that
    contain that token and computes temporal, sample_types, pipeline, and
    sampler_type_dist for the filtered subset.

    Returns: { colLabel: { token: { temporal, sample_types, pipeline, sampler_type_dist } } }
    Only includes columns/tokens with at least one matching row.
    """
    result: dict[str, dict[str, dict]] = {}

    for col, label in TAG_COL_DISPLAY:
        if df_col_map.get(col) is None:
            continue
        if col not in group.columns:
            continue

        # One pass: build token → list of DataFrame index labels
        token_indices: dict[str, list] = {}
        for idx, cell in group[col].dropna().items():
            for token in str(cell).split(','):
                token = token.strip()
                if not token:
                    continue
                if token not in token_indices:
                    token_indices[token] = []
                token_indices[token].append(idx)

        if not token_indices:
            continue

        col_result: dict[str, dict] = {}
        for token, indices in token_indices.items():
            tok_group = group.loc[list(set(indices))]
            tok_field_ids = set(tok_group[COL_BROADN_ID].tolist())

            # temporal
            dated = tok_group.dropna(subset=[COL_COLLECTED_DATE]).copy()
            if len(dated) > 0:
                dated["_ym"] = dated[COL_COLLECTED_DATE].dt.to_period("M").astype(str)
                ym_counts = dated.groupby("_ym").size().reset_index(name="count")
                temporal = [
                    {"month": row["_ym"], "count": int(row["count"])}
                    for _, row in ym_counts.sort_values("_ym").iterrows()
                ]
            else:
                temporal = []

            # sample_types
            type_counts = tok_group[COL_SAMPLE_SOURCE_TYPE].value_counts()
            sample_types = [{"type": str(t), "count": int(c)} for t, c in type_counts.items()]

            # pipeline (joins derivatives back to field sample IDs)
            collected, dna_extracted, sequenced = compute_pipeline_counts(df, tok_field_ids)

            # sampler_type_dist
            sampler_type_dist = build_sampler_type_dist(tok_group)

            col_result[token] = {
                "temporal": temporal,
                "sample_types": sample_types,
                "pipeline": {
                    "collected": collected,
                    "dna_extracted": dna_extracted,
                    "sequenced": sequenced,
                },
                "sampler_type_dist": sampler_type_dist,
            }

        if col_result:
            result[label] = col_result

    return result


def build_slice_project(
    df: pd.DataFrame,
    field_samples: pd.DataFrame,
    df_col_map: dict,
) -> list:
    """Build slice_views.project — group field samples by 'Project ID'.

    Pipeline counts use the same derivative-join methodology as global pipeline,
    filtered to each project's field sample IDs.
    """
    # Drop rows where Project ID is NaN
    fs = field_samples.dropna(subset=[COL_PROJECT_ID]).copy()

    project_groups = fs.groupby(COL_PROJECT_ID)
    results = []

    for project_id, group in project_groups:
        sample_count = len(group)
        proj_field_ids = set(group[COL_BROADN_ID].tolist())

        # sample_types sorted by count desc
        type_counts = group[COL_SAMPLE_SOURCE_TYPE].value_counts()
        sample_types = [{"type": str(t), "count": int(c)} for t, c in type_counts.items()]

        # pipeline filtered to this project's field IDs
        collected, dna_extracted, sequenced = compute_pipeline_counts(df, proj_field_ids)

        # temporal: group by year-month from Sample Collected Date
        dated = group.dropna(subset=[COL_COLLECTED_DATE]).copy()
        dated["_ym"] = dated[COL_COLLECTED_DATE].dt.to_period("M").astype(str)
        ym_counts = dated.groupby("_ym").size().reset_index(name="count")
        ym_counts = ym_counts.sort_values("_ym")
        temporal = [{"month": row["_ym"], "count": int(row["count"])} for _, row in ym_counts.iterrows()]

        results.append({
            "project_id": str(project_id),
            "sample_count": sample_count,
            "sample_types": sample_types,
            "pipeline": {
                "collected": collected,
                "dna_extracted": dna_extracted,
                "sequenced": sequenced,
            },
            "temporal": temporal,
            "sampler_type_dist": build_sampler_type_dist(group),
            "replicate_tags": parse_replicate_tags(group[COL_SAMPLE_REPLICATE]),
            "tag_groups": build_tag_groups(group, df_col_map),
            "tag_charts": build_tag_charts(group, df_col_map, df),
        })

    # Sort by sample_count descending, cap at 20
    results.sort(key=lambda x: x["sample_count"], reverse=True)
    return results[:20]


def build_slice_location(
    df: pd.DataFrame,
    field_samples: pd.DataFrame,
    df_col_map: dict,
) -> list:
    """Build slice_views.location — group field samples by 'Sample Collection Location'.

    Collection Height column does NOT exist — height_distribution is omitted.
    'Sample Collected Time' exists at 19.1% fill — time_distribution included
    where at least 1 non-null time value exists.
    """
    location_groups = field_samples.groupby(COL_COLLECTION_LOCATION)
    results = []

    for loc_code, group in location_groups:
        sample_count = len(group)
        site_name = LOCATION_NAMES.get(str(loc_code), str(loc_code))

        # sub_sites: group by 'Sample Collection Specific Site'
        sub_site_groups = group.groupby(COL_COLLECTION_SPECIFIC)
        sub_sites = []
        for sub_code, sub_group in sub_site_groups:
            sub_type_counts = sub_group[COL_SAMPLE_SOURCE_TYPE].value_counts()
            sub_sample_types = [{"type": str(t), "count": int(c)} for t, c in sub_type_counts.items()]
            sub_sites.append({
                "sub_code": str(sub_code),
                "sub_name": str(sub_code),
                "count": len(sub_group),
                "sample_types": sub_sample_types,
            })
        sub_sites.sort(key=lambda x: x["count"], reverse=True)

        # sample_types for whole site
        type_counts = group[COL_SAMPLE_SOURCE_TYPE].value_counts()
        sample_types = [{"type": str(t), "count": int(c)} for t, c in type_counts.items()]

        # temporal
        dated = group.dropna(subset=[COL_COLLECTED_DATE]).copy()
        dated["_ym"] = dated[COL_COLLECTED_DATE].dt.to_period("M").astype(str)
        ym_counts = dated.groupby("_ym").size().reset_index(name="count")
        ym_counts = ym_counts.sort_values("_ym")
        temporal = [{"month": row["_ym"], "count": int(row["count"])} for _, row in ym_counts.iterrows()]

        # time_distribution — only if at least 1 non-null time value exists
        time_dist = build_time_distribution(group)

        entry: dict = {
            "site_code": str(loc_code),
            "site_name": site_name,
            "sample_count": sample_count,
            "sub_sites": sub_sites,
            "sample_types": sample_types,
            "temporal": temporal,
            "sampler_type_dist": build_sampler_type_dist(group),
            "replicate_tags": parse_replicate_tags(group[COL_SAMPLE_REPLICATE]),
            "tag_groups": build_tag_groups(group, df_col_map),
            "tag_charts": build_tag_charts(group, df_col_map, df),
        }
        if time_dist:
            entry["time_distribution"] = time_dist

        results.append(entry)

    # Sort by sample_count descending
    results.sort(key=lambda x: x["sample_count"], reverse=True)
    return results


def build_slice_lab_group(
    df: pd.DataFrame,
    field_samples: pd.DataFrame,
    df_col_map: dict,
) -> list:
    """Build slice_views.lab_group — group field samples by 'Project Lead'.

    Pipeline counts use the same derivative-join methodology as global pipeline,
    filtered to each lead's field sample IDs.
    """
    # Drop rows where Project Lead is NaN
    fs = field_samples.dropna(subset=[COL_PROJECT_LEAD]).copy()

    lead_groups = fs.groupby(COL_PROJECT_LEAD)
    results = []

    for lead_name, group in lead_groups:
        sample_count = len(group)
        lead_field_ids = set(group[COL_BROADN_ID].tolist())

        # sample_types sorted by count desc
        type_counts = group[COL_SAMPLE_SOURCE_TYPE].value_counts()
        sample_types = [{"type": str(t), "count": int(c)} for t, c in type_counts.items()]

        # pipeline filtered to this lead's field IDs
        collected, dna_extracted, sequenced = compute_pipeline_counts(df, lead_field_ids)

        # temporal
        dated = group.dropna(subset=[COL_COLLECTED_DATE]).copy()
        dated["_ym"] = dated[COL_COLLECTED_DATE].dt.to_period("M").astype(str)
        ym_counts = dated.groupby("_ym").size().reset_index(name="count")
        ym_counts = ym_counts.sort_values("_ym")
        temporal = [{"month": row["_ym"], "count": int(row["count"])} for _, row in ym_counts.iterrows()]

        results.append({
            "group_name": str(lead_name),
            "sample_count": sample_count,
            "sample_types": sample_types,
            "pipeline": {
                "collected": collected,
                "dna_extracted": dna_extracted,
                "sequenced": sequenced,
            },
            "temporal": temporal,
            "sampler_type_dist": build_sampler_type_dist(group),
            "replicate_tags": parse_replicate_tags(group[COL_SAMPLE_REPLICATE]),
            "tag_groups": build_tag_groups(group, df_col_map),
            "tag_charts": build_tag_charts(group, df_col_map, df),
        })

    # Sort by sample_count descending, cap at 20
    results.sort(key=lambda x: x["sample_count"], reverse=True)
    return results[:20]


def main() -> None:
    print("=== BROADN preprocess_data.py ===")
    print(f"XLSX: {XLSX_PATH}")
    print(f"Output: {OUTPUT_PATH}")

    # ── Load data ───────────────────────────────────────────────────────────────
    print("\n[1] Loading xlsx...")
    df = load_xlsx(XLSX_PATH)
    print(f"  Total rows: {len(df)}, columns: {len(df.columns)}")

    # ── Load sites lookup ───────────────────────────────────────────────────────
    print("\n[2] Loading sites.json...")
    sites_lookup = load_sites(SITES_JSON_PATH)
    print(f"  Loaded {len(sites_lookup)} site entries from sites.json")

    # ── Filter field samples ────────────────────────────────────────────────────
    field_samples = df[df[COL_SAMPLE_CATEGORY] == FIELD_SAMPLE_CATEGORY].copy()
    derivatives = df[df[COL_SAMPLE_CATEGORY] != FIELD_SAMPLE_CATEGORY].copy()
    print(f"\n[3] Sample category breakdown:")
    print(f"  Field Samples: {len(field_samples)}")
    print(f"  Derivatives (excluded from aggregations): {len(derivatives)}")

    field_ids = set(field_samples[COL_BROADN_ID].tolist())

    # ── Sequencing columns confirmed ────────────────────────────────────────────
    print(f"\n[4] Sequencing column detection:")
    print(f"  Columns used: {SEQ_COLS}")
    print(f"  Detection method: non-empty, non-null STRING on derivative rows")
    print(f"  (Sequencing run IDs like 'SR40', 'PTSR26' are stored on Sample Product rows)")
    print(f"  Boolean/numeric coercion: NOT used")

    # ── Print fill rates ────────────────────────────────────────────────────────
    print_fill_rates(df, field_samples)

    # ── Data quality warnings ───────────────────────────────────────────────────
    print_data_quality_warnings(df, field_samples)

    # ── Pipeline counts ─────────────────────────────────────────────────────────
    print("\n[5] Computing pipeline counts...")
    collected, dna_extracted, sequenced = compute_pipeline_counts(df, field_ids)
    print(f"  pipeline.collected:     {collected}")
    print(f"  pipeline.dna_extracted: {dna_extracted}")
    print(f"  pipeline.sequenced:     {sequenced}")
    assert collected >= dna_extracted >= sequenced, (
        f"Logical order violated: {collected} >= {dna_extracted} >= {sequenced}"
    )
    print(f"  Logical order check PASS: {collected} >= {dna_extracted} >= {sequenced}")

    # ── Originating Location / 2-char composite code verification ──────────────
    print("\n[6] Originating Location / site code verification:")
    print("  No 'Originating Location' column exists in xlsx.")
    print("  2-char composite code derived from BROADN ID chars [1:3]")
    print("  (B + Collection Site letter + Specific Site letter + ...)")
    field_samples_copy = field_samples.copy()
    field_samples_copy["_code"] = field_samples_copy[COL_BROADN_ID].str[1:3]
    unique_codes = field_samples_copy["_code"].value_counts()
    print(f"  Unique 2-char codes in field samples: {len(unique_codes)}")
    non_standard = [c for c in unique_codes.index if c not in sites_lookup]
    if non_standard:
        print(f"  DEVIATION: codes not in sites.json: {non_standard}")
        print("  These correspond to 'Unknown' specific site entries (X as 2nd char)")
        print("  e.g. IX=IMPROVE-Unknown, PX=PGF-Unknown, AX=ARDEC-Unknown, BX=BigSpring-Unknown, XX=Unknown-Unknown")
    else:
        print("  All codes match sites.json entries.")

    # ── Build outputs ───────────────────────────────────────────────────────────
    print("\n[7] Building data.json sections...")

    # KPIs
    unique_sites = field_samples_copy["_code"].nunique()
    # Earliest year from field samples with valid date
    dated_samples = field_samples.dropna(subset=[COL_COLLECTED_DATE])
    active_since = str(int(dated_samples[COL_COLLECTED_DATE].dt.year.min())) if len(dated_samples) > 0 else "unknown"

    kpis = {
        "field_samples": len(field_samples),
        "unique_sites": unique_sites,
        "active_since": active_since,
        "sequenced": sequenced,
    }

    # Temporal
    temporal = build_temporal(field_samples)
    print(f"  temporal: {len(temporal)} year-month entries")

    # Sample types
    sample_types = build_sample_types(field_samples)
    print(f"  sample_types: {len(sample_types)} types")

    # Sites array (lat/lon from sites.json)
    sites_array = build_sites_array(field_samples, sites_lookup)
    print(f"  sites: {len(sites_array)} entries")

    # By site
    by_site = build_by_site(field_samples, sites_lookup)
    print(f"  by_site: {len(by_site)} entries")

    # Recent samples
    recent_samples = build_recent_samples(field_samples, n=100)
    print(f"  recent_samples: {len(recent_samples)} entries (capped at 100)")

    # Slice views
    print("\n[7b] Building slice_views sections...")

    # Detect which new typed tag columns exist in the xlsx.
    # Absent columns are mapped to None so slice builders can skip them safely.
    # COL_SAMPLE_REPLICATE_R aliases "Sample Replicate" which already exists in the
    # pre-split xlsx, so it is always included in the map.  However, new_cols_present
    # signals only whether the *exclusively new* columns (AM/PM, Quadrant, Position,
    # FC) have been added — not the replicate column that exists in both schemas.
    NEW_TAG_COLS = [COL_SAMPLE_AMPM, COL_SAMPLE_REPLICATE_R, COL_SAMPLE_QUADRANT,
                    COL_SAMPLE_POSITION, COL_SAMPLE_FC]
    # new_cols_present checks only the 4 exclusively-new columns (not Sample Replicate
    # which exists in both old and new xlsx schemas under the same name).
    EXCLUSIVELY_NEW_COLS = [COL_SAMPLE_AMPM, COL_SAMPLE_QUADRANT,
                             COL_SAMPLE_POSITION, COL_SAMPLE_FC]
    df_col_map = {col: df[col] if col in df.columns else None for col in NEW_TAG_COLS}
    new_cols_present = any(df_col_map.get(col) is not None for col in EXCLUSIVELY_NEW_COLS)
    # When the xlsx has not yet been split, suppress COL_SAMPLE_REPLICATE_R so that
    # build_tag_groups returns {} for the Replicate column (pre-split Sample Replicate
    # holds mixed tokens that belong to the old parse_replicate_tags() flow).
    if not new_cols_present:
        df_col_map[COL_SAMPLE_REPLICATE_R] = None

    slice_project = build_slice_project(df, field_samples, df_col_map)
    print(f"  slice_views.project: {len(slice_project)} entries")

    slice_location = build_slice_location(df, field_samples, df_col_map)
    print(f"  slice_views.location: {len(slice_location)} entries")

    slice_lab_group = build_slice_lab_group(df, field_samples, df_col_map)
    print(f"  slice_views.lab_group: {len(slice_lab_group)} entries")

    slice_views = {
        "project": slice_project,
        "location": slice_location,
        "lab_group": slice_lab_group,
    }

    # Meta
    meta = {
        "generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "total_rows": len(df),
        "field_samples": len(field_samples),
        "derivatives": len(derivatives),
    }

    # ── Assemble output ─────────────────────────────────────────────────────────
    output = {
        "meta": meta,
        "kpis": kpis,
        "temporal": temporal,
        "sample_types": sample_types,
        "pipeline": {
            "collected": collected,
            "dna_extracted": dna_extracted,
            "sequenced": sequenced,
        },
        "sites": sites_array,
        "by_site": by_site,
        "recent_samples": recent_samples,
        "slice_views": slice_views,
    }

    # ── Write output ────────────────────────────────────────────────────────────
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"\n[8] Wrote {OUTPUT_PATH}")
    print(f"  File size: {OUTPUT_PATH.stat().st_size:,} bytes")

    # ── Validation summary ──────────────────────────────────────────────────────
    print("\n=== VALIDATION SUMMARY ===")
    top_level_keys = list(output.keys())
    required_keys = {
        "meta", "kpis", "temporal", "sample_types", "pipeline",
        "sites", "by_site", "recent_samples", "slice_views",
    }
    missing_keys = required_keys - set(top_level_keys)
    print(f"  Top-level keys present: {top_level_keys}")
    if missing_keys:
        print(f"  MISSING keys: {missing_keys}")
    else:
        print(f"  All 9 required keys present: PASS")
    print(f"  meta.generated: {meta['generated']}")
    print(f"  kpis.field_samples: {kpis['field_samples']}")
    print(f"  kpis.sequenced: {kpis['sequenced']}")
    print(f"  pipeline.collected >= dna_extracted >= sequenced: "
          f"{output['pipeline']['collected']} >= {output['pipeline']['dna_extracted']} >= {output['pipeline']['sequenced']} = "
          f"{output['pipeline']['collected'] >= output['pipeline']['dna_extracted'] >= output['pipeline']['sequenced']}")
    print(f"  temporal entries: {len(temporal)}")
    print(f"  sites array entries: {len(sites_array)}")

    # ── Slice views validation ───────────────────────────────────────────────────
    print("\n=== SLICE_VIEWS VALIDATION ===")
    print(f"slice_views.project entries: {len(slice_project)}")
    print(f"slice_views.location entries: {len(slice_location)}")
    print(f"slice_views.lab_group entries: {len(slice_lab_group)}")

    ks_pass = "PASS" if kpis['field_samples'] == 4571 else "FAIL"
    print(f"kpis.field_samples: {kpis['field_samples']} — {ks_pass}")

    seq_pass = "PASS" if output['pipeline']['sequenced'] == 2098 else "FAIL"
    print(f"pipeline.sequenced: {output['pipeline']['sequenced']} — {seq_pass}")

    all_keys_pass = "PASS" if not missing_keys else "FAIL"
    print(f"All 9 required keys present: {all_keys_pass}")

    # New tag columns detection status
    print(f"new_cols_present: {new_cols_present}")

    # Spot-check tag_groups for project[0]
    if slice_project:
        tg0 = slice_project[0].get('tag_groups', 'MISSING')
        tg0_summary = {k: len(v) for k, v in tg0.items()} if isinstance(tg0, dict) else tg0
        print(f"slice_views.project[0].tag_groups: {tg0_summary}")
    else:
        print("slice_views.project[0].tag_groups: SKIP (no project entries)")

    # Spot-check: sampler_type_dist and replicate_tags present in first entry of each slice
    for label, entries in [
        ("slice_views.project[0]", slice_project),
        ("slice_views.location[0]", slice_location),
        ("slice_views.lab_group[0]", slice_lab_group),
    ]:
        if entries:
            has_sampler = "sampler_type_dist" in entries[0]
            has_replicate = "replicate_tags" in entries[0]
            has_tag_groups = "tag_groups" in entries[0]
            sampler_pass = "PASS" if has_sampler else "FAIL"
            replicate_pass = "PASS" if has_replicate else "FAIL"
            tag_pass = "PASS" if has_tag_groups else "FAIL"
            print(f"  {label}: sampler_type_dist={sampler_pass}, replicate_tags={replicate_pass}, tag_groups={tag_pass}")
        else:
            print(f"  {label}: SKIP (no entries)")

    print("\nDone.")


if __name__ == "__main__":
    main()
