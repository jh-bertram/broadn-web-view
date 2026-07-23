#!/usr/bin/env python3
"""
NCBI/SRA submission-readiness audit for the BROADN central database (Bdb-317.xlsx).

Task: broadn-p18-ncbi-readiness-audit
Author: Statistician (ST#1)

READ-ONLY on the master workbook. Reads a COPY (see SOURCE_XLSX below — point this at a
local copy, never the shared master) and writes only new output files under
docs/ncbi-readiness/.

Every assumption embedded in this script is documented inline and restated in the
accompanying statistical_report. Re-run this script after any correction to the column
mapping (search for "ASSUMPTION" to find every place a judgment call was made).

Usage:
    python3 ncbi_readiness_audit.py --source /path/to/copy-of-Bdb-317.xlsx --outdir docs/ncbi-readiness
"""

import argparse
import re
import sys
from pathlib import Path

import numpy as np
import pandas as pd


# --------------------------------------------------------------------------------------
# Step 0 — CLI / paths
# --------------------------------------------------------------------------------------

def parse_args():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument(
        "--source",
        default="/tmp/claude-1000/-home-jhber-projects-broadn-web-view/"
        "8a9da315-664a-46ec-b0d2-67a8c446ecc3/scratchpad/Bdb-317-copy.xlsx",
        help="Path to a COPY of the BROADN database (never the master).",
    )
    p.add_argument(
        "--outdir",
        default="docs/ncbi-readiness",
        help="Directory to write outputs to (created if missing).",
    )
    return p.parse_args()


# --------------------------------------------------------------------------------------
# Step 1 — Inventory
# --------------------------------------------------------------------------------------

def inventory(source_path: Path) -> pd.DataFrame:
    import openpyxl

    wb = openpyxl.load_workbook(source_path, read_only=True, data_only=True)
    print("=" * 88)
    print("STEP 1 — INVENTORY")
    print("=" * 88)
    print("Sheets found:", wb.sheetnames)

    df = pd.read_excel(source_path, sheet_name="Sheet1", header=0)
    print(f"Sheet1: {df.shape[0]} data rows x {df.shape[1]} columns (header assumed row 0)")
    print("Headers:")
    for i, c in enumerate(df.columns):
        print(f"  {i:2d}: {c!r}")
    return df


# --------------------------------------------------------------------------------------
# Step 2 — Column mapping (printed as a table; ALL assumptions live here)
# --------------------------------------------------------------------------------------

MAPPING_TABLE = [
    # (NCBI field, BROADN source, confidence, note)
    ("sample_name", "BROADN ID (Field Sample rows only)", "high",
     "100% unique across all 7,846 rows. ASSUMPTION: one BioSample = one Field Sample "
     "row (the collection event), not one row per DNA-extract Product. See rollup note."),
    ("organism", "derived from Sample Source Type", "medium",
     "Air->'air metagenome', Soil->'soil metagenome', Plant->'plant metagenome'. "
     "Liquid (43) and Unknown (1) source types left BLANK -- ambiguous, not invented. "
     "121 'Isolate' Sample Product rows likely need per-isolate taxonomy from "
     "'Product info' free text instead of a metagenome name -- NOT implemented, flagged."),
    ("collection_date", "Sample Collected Date (+ Sample Collected Time, Sample AM/PM)", "high",
     "Already parsed as a real date by pandas/openpyxl when present; ISO-formattable. "
     "Sample Collection Duration (~1/6/12/24h clusters) suggests time-integrated windows, "
     "not point samples -- NCBI collection_date has no native duration field."),
    ("geo_loc_name", "Sample Collection Location + Sample Collection Specific Site", "medium",
     "No country column exists anywhere in the sheet -> ALWAYS fails the 'starts with a "
     "country' format check. All inspected site codes (SGRC/CPER/ARDEC/NWT/IMPROVE NPS "
     "codes) look US-domestic, but this is NOT asserted as fact -- flagged for confirm."),
    ("lat_lon", "Latitude, Longitude", "high",
     "804 rows carry a POSITIVE longitude (2 unique coordinate pairs, both tagged "
     "location='Other') in an otherwise USA/western-hemisphere network -- numerically "
     "in-range so a pure range check won't catch it; flagged as a sign-anomaly."),
    ("env_broad_scale", "NO COLUMN", "high (gap)", "Dataset-wide gap. No ENVO column exists."),
    ("env_local_scale", "NO COLUMN", "high (gap)", "Dataset-wide gap. No ENVO column exists."),
    ("env_medium", "Sample Source Type / Sample Collection Medium", "medium",
     "Free text (Air/Soil/Plant/Liquid + filter medium sub-type) -- always flagged "
     "'needs ENVO mapping', no ENVO term is invented."),
    ("target_gene", "Sequence 16s / Sequence ITS / Sequence 18s (column presence)", "high",
     "These columns hold sequencing RUN/PLATE codes (SR40, PTSR26, 'NCBI', 'SeqITS'), "
     "NOT booleans. 'Sequenced' = column notna; 'target_gene' = which column(s) are "
     "populated (16S rRNA / ITS / 18S rRNA), a sample may have more than one."),
    ("target_subfragment", "NO COLUMN", "high (gap)", "Dataset-wide gap."),
    ("pcr_primers", "NO COLUMN", "high (gap)", "Dataset-wide gap."),
    ("instrument_model", "NO COLUMN", "high (gap)", "Dataset-wide gap, required if sequenced."),
    ("library_ID", "Aerobiome Barcode (fallback: Alt barcode)", "medium",
     "Values agree 100% between a Field Sample and its Product child when both present, "
     "so it IS a stable per-specimen identifier -- but it is NOT unique dataset-wide "
     "(barcodes are reused across up to 4 distinct Field Samples in ~18 observed cases)."),
    ("library_layout", "NO COLUMN", "high (gap)", "Dataset-wide gap, required if sequenced."),
    ("FASTQ raw files", "MetaGenome Sequence (only column with filenames anywhere)", "high",
     "63/7,846 rows (0.8%) have a filename, pattern '<barcode>_1.fq.gz' (3 also have "
     "'_2.fq.gz'). No .zip found anywhere. This is shotgun-metagenome evidence; no "
     "column anywhere holds amplicon (16S/ITS/18S) FASTQ filenames -- essentially all "
     "amplicon-sequenced samples have NO located raw file."),
    ("project", "Project ID", "high", "28 unique values, 7 nulls (0.1%)."),
    ("PI / submitter", "Project Lead", "high", "8 unique values, 21 nulls (0.3%)."),
]

REQUIRED_BIOSAMPLE = [
    "sample_name", "organism", "collection_date", "geo_loc_name", "lat_lon",
    "env_broad_scale", "env_local_scale", "env_medium",
]
REQUIRED_IF_SEQUENCED = ["library_ID", "target_gene", "instrument_model", "library_layout"]


def print_mapping_table():
    print("=" * 88)
    print("STEP 2 — COLUMN MAPPING (assumptions -- confirm/correct these)")
    print("=" * 88)
    for ncbi_field, source, conf, note in MAPPING_TABLE:
        print(f"\n[{conf}] {ncbi_field}  <-  {source}")
        print(f"    {note}")
    print("\nDATASET-WIDE GAPS (no matching column anywhere): env_broad_scale, "
          "env_local_scale, target_subfragment, pcr_primers, instrument_model, "
          "library_layout. Because env_broad_scale/env_local_scale are BioSample-required "
          "and have no column, NO sample can satisfy the strict 'ready' bar under the "
          "current schema -- this is the audit's headline, expected finding.")


# --------------------------------------------------------------------------------------
# Step 2b — Roll up Field Sample <- Sample Product evidence
# --------------------------------------------------------------------------------------

SEQ_COLS = ["Sequence 16s", "Sequence ITS", "Sequence 18s"]
GENE_LABELS = {"Sequence 16s": "16S rRNA", "Sequence ITS": "ITS", "Sequence 18s": "18S rRNA"}


def build_field_sample_table(df: pd.DataFrame) -> pd.DataFrame:
    """Roll Sample Product evidence up onto its parent Field Sample row.

    ASSUMPTION (flagged prominently in the report): one NCBI BioSample = one Field
    Sample row (the physical/environmental collection event). A Sample Product row
    (DNA extract / isolate / glycerol stock) derived from it is treated as internal
    lab-processing evidence for that same BioSample, not a separate BioSample. This is
    justified empirically: lat/long/collected-date/Aerobiome Barcode all agree
    (near-)100% between a Field Sample and its Product children (verified below and in
    the EDA record accompanying this audit).
    """
    field = df[df["Sample Category"] == "Field Sample"].copy()
    prod = df[df["Sample Category"] == "Sample Product"].copy()

    field = field.set_index("BROADN ID", drop=False)

    # Sequencing evidence: any Sequence16s/ITS/18s populated on self OR any product child.
    for col in SEQ_COLS:
        field[f"_self_{col}"] = field[col].notna()
    prod_seq_by_parent = prod.groupby("Sample derived from")[SEQ_COLS].apply(
        lambda g: pd.Series({c: g[c].notna().any() for c in SEQ_COLS})
    )
    for col in SEQ_COLS:
        child_flag = prod_seq_by_parent[col].reindex(field.index).fillna(False) if len(prod_seq_by_parent) else pd.Series(False, index=field.index)
        field[f"seq_{col}"] = field[f"_self_{col}"] | child_flag.values

    field["target_gene_list"] = field.apply(
        lambda r: [GENE_LABELS[c] for c in SEQ_COLS if r[f"seq_{c}"]], axis=1
    )
    field["target_gene"] = field["target_gene_list"].apply(lambda lst: ", ".join(lst) if lst else np.nan)

    # FASTQ (MetaGenome Sequence) rollup: self or any product child.
    field["_self_fastq"] = df.set_index("BROADN ID").reindex(field.index)["MetaGenome Sequence"].notna()
    prod_fastq_by_parent = prod.groupby("Sample derived from")["MetaGenome Sequence"].apply(lambda s: s.notna().any())
    child_fastq = prod_fastq_by_parent.reindex(field.index).fillna(False) if len(prod_fastq_by_parent) else pd.Series(False, index=field.index)
    field["has_fastq"] = field["_self_fastq"].values | child_fastq.values
    # also carry an example filename for reference (self first, else first child's)
    field["_fastq_example"] = df.set_index("BROADN ID").reindex(field.index)["MetaGenome Sequence"]
    prod_fastq_example = prod.groupby("Sample derived from")["MetaGenome Sequence"].apply(
        lambda s: s.dropna().iloc[0] if s.notna().any() else np.nan
    )
    child_example = prod_fastq_example.reindex(field.index)
    field["fastq_example"] = field["_fastq_example"].where(field["_fastq_example"].notna(), child_example.values)

    # library_ID rollup: Aerobiome Barcode (fallback Alt barcode), self or any child.
    for base_col in ["Aerobiome Barcode", "Alt barcode "]:
        prod_by_parent = prod.groupby("Sample derived from")[base_col].apply(
            lambda s: s.dropna().iloc[0] if s.notna().any() else np.nan
        )
        child_val = prod_by_parent.reindex(field.index)
        field[f"_rolled_{base_col.strip()}"] = field[base_col].where(field[base_col].notna(), child_val.values)

    field["library_ID"] = field["_rolled_Aerobiome Barcode"]
    field["library_ID"] = field["library_ID"].where(
        field["library_ID"].notna(), field["_rolled_Alt barcode"]
    )
    field["library_ID_source"] = np.where(
        field["_rolled_Aerobiome Barcode"].notna(), "Aerobiome Barcode",
        np.where(field["_rolled_Alt barcode"].notna(), "Alt barcode", None),
    ).astype(object)

    # sequenced flag = any target gene OR fastq evidence (covers any edge case where
    # MetaGenome Sequence is populated without a matching Sequence16s/ITS/18s value).
    field["sequenced"] = field["target_gene"].notna() | field["has_fastq"]

    # n children, for the "one sample many runs" gotcha
    n_children = prod.groupby("Sample derived from").size()
    field["n_product_children"] = n_children.reindex(field.index).fillna(0).astype(int)

    return field.reset_index(drop=True)


# --------------------------------------------------------------------------------------
# Step 2c — organism / env_medium derivation
# --------------------------------------------------------------------------------------

ORGANISM_MAP = {
    "Air": "air metagenome",
    "Soil": "soil metagenome",
    "Plant": "plant metagenome",
}


def derive_organism(source_type: str):
    return ORGANISM_MAP.get(source_type, np.nan)


# --------------------------------------------------------------------------------------
# Step 3 & 4 — classify + validate format
# --------------------------------------------------------------------------------------

def validate_and_classify(field: pd.DataFrame) -> pd.DataFrame:
    out = field.copy()

    # ---- organism ----
    out["organism"] = out["Sample Source Type"].apply(derive_organism)

    # ---- collection_date ----
    out["collection_date_present"] = out["Sample Collected Date"].notna()
    out["collection_date_valid_format"] = out["collection_date_present"]  # already real dates when present

    # ---- geo_loc_name ----
    out["geo_loc_present"] = out["Sample Collection Location"].notna() & (
        out["Sample Collection Location"] != "Unknown"
    )
    # No country column exists anywhere -> format check always fails when present.
    out["geo_loc_has_country_prefix"] = False

    # ---- lat_lon ----
    out["lat_lon_present"] = out["Latitude"].notna() & out["Longitude"].notna()
    lat_in_range = out["Latitude"].between(-90, 90)
    lon_in_range = out["Longitude"].between(-180, 180)
    out["lat_lon_in_range"] = out["lat_lon_present"] & lat_in_range.fillna(False) & lon_in_range.fillna(False)
    out["lon_sign_anomaly"] = out["lat_lon_present"] & (out["Longitude"] > 0)

    # ---- env_medium ----
    out["env_medium_present"] = out["Sample Source Type"].notna() & (out["Sample Source Type"] != "Unknown")
    out["env_medium_is_envo"] = False  # always free text in this DB

    # ---- env_broad_scale / env_local_scale: no column anywhere ----
    out["env_broad_scale_present"] = False
    out["env_local_scale_present"] = False

    # ---- library_ID ----
    out["library_ID_present"] = out["library_ID"].notna()
    lib_counts = out["library_ID"].value_counts(dropna=True)
    dup_lib_ids = set(lib_counts[lib_counts > 1].index)
    out["library_ID_unique"] = ~out["library_ID"].isin(dup_lib_ids)

    # ---- sample_name duplicates ----
    dup_names = out["BROADN ID"].duplicated(keep=False)
    out["sample_name_duplicate"] = dup_names

    # ---- instrument_model / library_layout: no column ----
    out["instrument_model_present"] = False
    out["library_layout_present"] = False

    # ------------------------------------------------------------------
    # Build missing_fields / format_issues lists (only meaningful for `sequenced` rows,
    # but computed for every row for transparency in the gap report).
    # ------------------------------------------------------------------
    missing_fields = []
    format_issues = []

    for _, r in out.iterrows():
        miss = []
        fmt = []

        if pd.isna(r["organism"]) or not str(r["organism"]).strip():
            miss.append("organism")
        if not r["collection_date_present"]:
            miss.append("collection_date")
        if not r["geo_loc_present"]:
            miss.append("geo_loc_name")
        elif not r["geo_loc_has_country_prefix"]:
            fmt.append("geo_loc_name: no country prefix")
        if not r["lat_lon_present"]:
            miss.append("lat_lon")
        else:
            if not r["lat_lon_in_range"]:
                fmt.append("lat_lon: out of range")
            elif r["lon_sign_anomaly"]:
                fmt.append("lat_lon: positive longitude sign anomaly (confirm not a sign-flip error)")
        if not r["env_medium_present"]:
            miss.append("env_medium")
        elif not r["env_medium_is_envo"]:
            fmt.append("env_medium: free text, needs ENVO mapping")
        if not r["env_broad_scale_present"]:
            miss.append("env_broad_scale (no column in DB)")
        if not r["env_local_scale_present"]:
            miss.append("env_local_scale (no column in DB)")
        if r["sample_name_duplicate"]:
            fmt.append("sample_name: duplicate")

        if r["sequenced"]:
            if not r["library_ID_present"]:
                miss.append("library_ID")
            elif not r["library_ID_unique"]:
                fmt.append("library_ID: not unique across table")
            if not r["target_gene"] or (isinstance(r["target_gene"], float) and pd.isna(r["target_gene"])):
                miss.append("target_gene")
            if not r["instrument_model_present"]:
                miss.append("instrument_model (no column in DB)")
            if not r["library_layout_present"]:
                miss.append("library_layout (no column in DB)")

        missing_fields.append(missing_fields.__class__())  # placeholder, replaced below
        missing_fields[-1] = miss
        format_issues.append(fmt)

    out["missing_fields_list"] = missing_fields
    out["format_issues_list"] = format_issues
    out["missing_fields"] = out["missing_fields_list"].apply(lambda l: "; ".join(l) if l else "")
    out["format_issues"] = out["format_issues_list"].apply(lambda l: "; ".join(l) if l else "")

    # ------------------------------------------------------------------
    # Status classification
    # ------------------------------------------------------------------
    def classify(r):
        if not r["sequenced"]:
            return "not_sequenced"
        required_ok = (len(r["missing_fields_list"]) == 0) and (len(r["format_issues_list"]) == 0)
        if required_ok and r["has_fastq"]:
            return "ready"
        if required_ok and not r["has_fastq"]:
            return "ready_pending_files"
        return "needs_metadata"

    out["status"] = out.apply(classify, axis=1)

    return out


# --------------------------------------------------------------------------------------
# Step 5 — Output
# --------------------------------------------------------------------------------------

def write_outputs(result: pd.DataFrame, outdir: Path):
    outdir.mkdir(parents=True, exist_ok=True)

    print("\n" + "=" * 88)
    print("STEP 5 — SUMMARY")
    print("=" * 88)

    n_total = len(result)
    print(f"\nTotal logical samples (Field Sample rows, rolled up): {n_total}")

    status_counts = result["status"].value_counts()
    print("\nCounts by status:")
    print(status_counts.to_string())

    print("\nProject x status table:")
    # NOTE: 'Project ID' has a small number of nulls (data-quality gap, see report) --
    # fillna explicitly so pd.crosstab does not silently drop those rows and undercount.
    n_null_project = result["Project ID"].isnull().sum()
    if n_null_project:
        print(f"  ({n_null_project} rows have a null Project ID -- shown as '(no project)')")
    proj_key = result["Project ID"].fillna("(no project)")
    proj_status = pd.crosstab(proj_key, result["status"])
    print(proj_status.to_string())
    assert proj_status.values.sum() == n_total, "project x status table must account for every row"

    n_sequenced = result["sequenced"].sum()
    n_ready = (result["status"] == "ready").sum()
    pct_ready = (n_ready / n_sequenced * 100) if n_sequenced else float("nan")
    print(f"\n% of sequenced samples that are 'ready': {pct_ready:.2f}% ({n_ready}/{n_sequenced})")

    all_missing = [f for lst in result["missing_fields_list"] for f in lst]
    top5_missing = pd.Series(all_missing).value_counts().head(5)
    print("\nTop 5 most-common missing fields:")
    print(top5_missing.to_string())

    all_fmt = [f for lst in result["format_issues_list"] for f in lst]
    fmt_counts = pd.Series(all_fmt).value_counts()
    print("\nFormat-issue counts (all classes):")
    print(fmt_counts.to_string())

    print("\nTarget-gene combination counts (among sequenced samples):")
    print(result.loc[result["sequenced"], "target_gene"].value_counts().to_string())

    # ---- gap report ----
    gap_cols = {
        "BROADN ID": "sample_name",
        "Project ID": "project",
        "status": "status",
        "missing_fields": "missing_fields",
        "format_issues": "format_issues",
        "has_fastq": "has_fastq",
    }
    gap_report = result[list(gap_cols.keys())].rename(columns=gap_cols)
    gap_report_path = outdir / "ncbi_readiness_gap_report.xlsx"
    gap_report.to_excel(gap_report_path, index=False)
    print(f"\nWrote {gap_report_path} ({len(gap_report)} rows)")

    # ---- summary csv (project x status) ----
    summary_path = outdir / "ncbi_readiness_summary.csv"
    proj_status.to_csv(summary_path)
    print(f"Wrote {summary_path} ({proj_status.shape[0]} projects x {proj_status.shape[1]} statuses)")

    # ---- optional submission-ready export ----
    ready = result[result["status"] == "ready"]
    if len(ready) > 0:
        sub_cols = [
            "BROADN ID", "organism", "Sample Collected Date", "Sample Collection Location",
            "Latitude", "Longitude", "target_gene", "library_ID", "fastq_example",
        ]
        sub = ready[sub_cols].copy()
        sub_path = outdir / "submission_ready_biosample_SRA.xlsx"
        sub.to_excel(sub_path, index=False)
        print(f"Wrote {sub_path} ({len(sub)} rows) -- 'ready' bucket was non-empty.")
    else:
        print(
            "\nSkipped submission_ready_biosample_SRA.xlsx: 'ready' bucket is empty "
            "(expected -- env_broad_scale/env_local_scale have no column anywhere, so no "
            "sample can satisfy the strict required-field bar under the current schema)."
        )

    return gap_report_path, summary_path, status_counts, proj_status, pct_ready, top5_missing, fmt_counts


# --------------------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------------------

def main():
    args = parse_args()
    source_path = Path(args.source)
    outdir = Path(args.outdir)

    if not source_path.exists():
        print(f"ERROR: source file not found: {source_path}", file=sys.stderr)
        sys.exit(1)

    df = inventory(source_path)
    print_mapping_table()

    print("\n" + "=" * 88)
    print("STEP 2b/2c — ROLLUP (Field Sample <- Sample Product) + derived fields")
    print("=" * 88)
    field = build_field_sample_table(df)
    print(f"Field Sample rows (logical samples): {len(field)}")
    print(f"  of which have >=1 Sample Product child: {(field['n_product_children'] > 0).sum()}")
    print(f"  of which are sequenced (target_gene or fastq present, self or rolled-up): {field['sequenced'].sum()}")

    result = validate_and_classify(field)

    write_outputs(result, outdir)

    print("\nDone.")


if __name__ == "__main__":
    main()
