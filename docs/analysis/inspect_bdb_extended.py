#!/usr/bin/env python3
"""
inspect_bdb_extended.py — Extended column inventory for PM planning.

Covers five items:
  1. Lab Group / PI / Project Lead column
  2. Collection Height column
  3. Collection Time (AM/PM) column
  4. Project ID full distribution
  5. (Sample Collection Location, Sample Collection Specific Site) pairs
"""

import pandas as pd
import warnings
warnings.filterwarnings('ignore')

XLSX_PATH = '/home/jhber/projects/broadn-web-view/Bdb-317.xlsx'
FIELD_SAMPLE_CATEGORY = "Field Sample"
COL_SAMPLE_CATEGORY = "Sample Category"

print("=== LOADING XLSX ===")
df = pd.read_excel(XLSX_PATH, engine='openpyxl')
print(f"Shape: {df.shape[0]} rows x {df.shape[1]} columns")
print()

# ── Apply field sample filter (same as preprocess_data.py) ──────────────────
field_samples = df[df[COL_SAMPLE_CATEGORY] == FIELD_SAMPLE_CATEGORY].copy()
print(f"Field samples (Sample Category == 'Field Sample'): {len(field_samples)}")
print(f"Total rows: {len(df)}")
print()

all_cols = list(df.columns)
print(f"=== ALL COLUMN NAMES ({len(all_cols)} total) ===")
for col in all_cols:
    print(f"  {repr(col)}")
print()


# ── Helper ───────────────────────────────────────────────────────────────────
def fill_rate_field(col: str) -> str:
    """Fill rate on field samples only."""
    non_null = field_samples[col].notna().sum()
    total = len(field_samples)
    pct = 100 * non_null / total if total > 0 else 0.0
    return f"{non_null}/{total} ({pct:.1f}%)"


# ════════════════════════════════════════════════════════════════════════════
# ITEM 1: Lab Group / PI / Project Lead column
# ════════════════════════════════════════════════════════════════════════════
print("=" * 70)
print("ITEM 1: LAB GROUP / PI / PROJECT LEAD COLUMN")
print("=" * 70)

LAB_KEYWORDS = ['lab', 'group', 'pi', 'lead', 'investigator', 'created by', 'project lead']
lab_cols_found = [c for c in all_cols if any(kw in c.lower() for kw in LAB_KEYWORDS)]

if not lab_cols_found:
    print("LAB_GROUP_COLUMN: NOT FOUND")
    print("  No column names matched keywords:", LAB_KEYWORDS)
else:
    print(f"Matched columns ({len(lab_cols_found)} found):")
    for col in lab_cols_found:
        n_unique = field_samples[col].nunique(dropna=True)
        dtype = df[col].dtype
        fr = fill_rate_field(col)
        print(f"\n  Column: {repr(col)}")
        print(f"  dtype: {dtype}")
        print(f"  Fill rate (field samples only): {fr}")
        print(f"  Unique value count (field samples): {n_unique}")
        print(f"  Top-15 value counts (field samples):")
        vc = field_samples[col].value_counts(dropna=False).head(15)
        for val, cnt in vc.items():
            print(f"    {repr(val)}: {cnt}")
print()


# ════════════════════════════════════════════════════════════════════════════
# ITEM 2: Collection Height column
# ════════════════════════════════════════════════════════════════════════════
print("=" * 70)
print("ITEM 2: COLLECTION HEIGHT COLUMN")
print("=" * 70)

HEIGHT_KEYWORDS = ['height', 'alt', 'altitude', 'elevation', 'level', 'tier']
height_cols_found = [c for c in all_cols if any(kw in c.lower() for kw in HEIGHT_KEYWORDS)]

if not height_cols_found:
    print("COLLECTION_HEIGHT_COLUMN: NOT FOUND")
    print("  No column names matched keywords:", HEIGHT_KEYWORDS)
else:
    print(f"Matched columns ({len(height_cols_found)} found):")
    for col in height_cols_found:
        fr = fill_rate_field(col)
        dtype = df[col].dtype
        first_10 = field_samples[col].dropna().head(10).tolist()
        print(f"\n  Column: {repr(col)}")
        print(f"  dtype: {dtype}")
        print(f"  Fill rate (field samples only): {fr}")
        print(f"  First 10 non-null sample values (field samples): {first_10}")
print()


# ════════════════════════════════════════════════════════════════════════════
# ITEM 3: Collection Time (AM/PM) column
# ════════════════════════════════════════════════════════════════════════════
print("=" * 70)
print("ITEM 3: COLLECTION TIME (AM/PM) COLUMN")
print("=" * 70)

TIME_KEYWORDS = ['time', 'am', 'pm', 'hour', 'period', 'tod']
time_cols_found = [c for c in all_cols if any(kw in c.lower() for kw in TIME_KEYWORDS)]

if not time_cols_found:
    print("COLLECTION_TIME_COLUMN: NOT FOUND")
    print("  No column names matched keywords:", TIME_KEYWORDS)
else:
    print(f"Matched columns ({len(time_cols_found)} found):")
    for col in time_cols_found:
        fr = fill_rate_field(col)
        all_unique = field_samples[col].dropna().unique().tolist()
        print(f"\n  Column: {repr(col)}")
        print(f"  Fill rate (field samples only): {fr}")
        print(f"  All unique values (field samples, {len(all_unique)} values): {all_unique}")
print()


# ════════════════════════════════════════════════════════════════════════════
# ITEM 4: Project ID full distribution
# ════════════════════════════════════════════════════════════════════════════
print("=" * 70)
print("ITEM 4: PROJECT ID FULL DISTRIBUTION")
print("=" * 70)

proj_cols = [c for c in all_cols if 'project' in c.lower() and 'id' in c.lower()]
if not proj_cols:
    # Broader: any column with 'project'
    proj_cols = [c for c in all_cols if 'project' in c.lower()]

print(f"Project ID column(s) found: {proj_cols}")

for col in proj_cols:
    print(f"\n  Column: {repr(col)}")
    print(f"  dtype (all rows): {df[col].dtype}")
    total_unique = df[col].nunique(dropna=True)
    field_unique = field_samples[col].nunique(dropna=True)
    print(f"  Unique values total rows: {total_unique}")
    print(f"  Unique values field samples: {field_unique}")

    # ALL unique values — total rows
    print(f"\n  === ALL UNIQUE VALUES (total rows count) ===")
    vc_total = df[col].value_counts(dropna=False)
    print(f"  (Showing all {len(vc_total)} entries — NO TRUNCATION)")
    for val, cnt in vc_total.items():
        print(f"    {repr(val)}: total={cnt}")

    # Build field sample counts for same values
    vc_field = field_samples[col].value_counts(dropna=False)
    vc_field_dict = dict(vc_field)

    print(f"\n  === ALL UNIQUE VALUES (total + field-sample counts) ===")
    all_vals = set(vc_total.index) | set(vc_field_dict.keys())
    for val in sorted(str(v) for v in all_vals):
        # Find original value
        total_cnt = 0
        field_cnt = 0
        for orig_val in vc_total.index:
            if str(orig_val) == val:
                total_cnt = vc_total[orig_val]
                break
        for orig_val in vc_field_dict:
            if str(orig_val) == val:
                field_cnt = vc_field_dict[orig_val]
                break
        print(f"    {repr(val)}: total_rows={total_cnt}, field_samples={field_cnt}")
print()


# ════════════════════════════════════════════════════════════════════════════
# ITEM 5: (Sample Collection Location, Sample Collection Specific Site) pairs
# ════════════════════════════════════════════════════════════════════════════
print("=" * 70)
print("ITEM 5: (SAMPLE COLLECTION LOCATION, SAMPLE COLLECTION SPECIFIC SITE) PAIRS")
print("=" * 70)

COL_LOCATION = "Sample Collection Location"
COL_SPECIFIC = "Sample Collection Specific Site"

# Verify columns exist
loc_found = COL_LOCATION in all_cols
spec_found = COL_SPECIFIC in all_cols
print(f"  '{COL_LOCATION}' column exists: {loc_found}")
print(f"  '{COL_SPECIFIC}' column exists: {spec_found}")

if loc_found and spec_found:
    pairs = field_samples.groupby(
        [COL_LOCATION, COL_SPECIFIC], dropna=False
    ).size().reset_index(name='field_sample_count')
    pairs = pairs.sort_values('field_sample_count', ascending=False)

    print(f"\n  Total unique pairs (field samples): {len(pairs)}")
    print(f"\n  {'Sample Collection Location':<45} | {'Sample Collection Specific Site':<40} | Count")
    print(f"  {'-'*45}-+-{'-'*40}-+-------")
    for _, row in pairs.iterrows():
        loc_val = repr(row[COL_LOCATION])
        spec_val = repr(row[COL_SPECIFIC])
        cnt = row['field_sample_count']
        print(f"  {loc_val:<45} | {spec_val:<40} | {cnt}")
elif not loc_found:
    print(f"  ERROR: Column '{COL_LOCATION}' not found in xlsx.")
elif not spec_found:
    print(f"  ERROR: Column '{COL_SPECIFIC}' not found in xlsx.")

print()
print("=== DONE ===")
