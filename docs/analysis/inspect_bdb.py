#!/usr/bin/env python3
"""BROADN Bdb-317.xlsx column inventory for PM planning consultation."""

import pandas as pd
import warnings
import json
warnings.filterwarnings('ignore')

XLSX_PATH = '/home/jhber/projects/broadn-web-view/Bdb-317.xlsx'

print("=== LOADING XLSX ===")
df = pd.read_excel(XLSX_PATH, engine='openpyxl')
print(f"Shape: {df.shape[0]} rows x {df.shape[1]} columns")
print()

print("=== COLUMN NAMES + DTYPES ===")
for col in df.columns:
    print(f"  {repr(col)}: {df[col].dtype}")
print()

print("=== FILL RATES (non-null %) ===")
fill = (df.notnull().mean() * 100).round(1)
for col, pct in fill.items():
    flag = " [LOW_COVERAGE]" if pct < 50 else ""
    print(f"  {repr(col)}: {pct}%{flag}")
print()

print("=== CATEGORICAL CARDINALITY (object + low-card columns) ===")
for col in df.columns:
    if df[col].dtype == 'object' or df[col].nunique() < 30:
        n_unique = df[col].nunique(dropna=True)
        if n_unique <= 200:
            print(f"\n  [{col}] — {n_unique} unique values")
            vc = df[col].value_counts(dropna=False).head(15)
            for val, cnt in vc.items():
                print(f"    {repr(val)}: {cnt}")
print()

print("=== LATITUDE / LONGITUDE ===")
lat_cols = [c for c in df.columns if 'lat' in c.lower()]
lon_cols = [c for c in df.columns if 'lon' in c.lower() or 'lng' in c.lower()]
print(f"  Lat columns found: {lat_cols}")
print(f"  Lon columns found: {lon_cols}")
for col in lat_cols + lon_cols:
    numeric = pd.to_numeric(df[col], errors='coerce')
    filled = numeric.notnull().sum()
    print(f"  {col}: {filled} non-null values, range [{numeric.min():.4f}, {numeric.max():.4f}]")
    print(f"  Unique coordinate pairs: {df[lat_cols + lon_cols].dropna().shape[0]}")
print()

print("=== DATE COLUMNS ===")
date_cols = [c for c in df.columns if 'date' in c.lower() or 'created' in c.lower() or 'collected' in c.lower()]
print(f"  Date columns found: {date_cols}")
for col in date_cols:
    try:
        parsed = pd.to_datetime(df[col], errors='coerce')
        filled = parsed.notnull().sum()
        print(f"  {col}: {filled} non-null")
        print(f"    Range: {parsed.min()} to {parsed.max()}")
        print(f"    By year:\n{parsed.dt.year.value_counts().sort_index().to_dict()}")
        print(f"    By month (all years):\n{parsed.dt.month.value_counts().sort_index().to_dict()}")
    except Exception as e:
        print(f"  {col}: error parsing — {e}")
print()

print("=== SEQUENCING COLUMNS ===")
seq_cols = [c for c in df.columns if any(kw in c.lower() for kw in ['seq', 'sequence', 'dna', 'rna', 'sequenced', '16s', 'its', 'wgs', 'metagenom', 'amplicon'])]
print(f"  Sequencing columns: {seq_cols}")
for col in seq_cols:
    n_unique = df[col].nunique(dropna=True)
    filled = df[col].notnull().sum()
    print(f"  {col}: {filled} non-null, {n_unique} unique values")
    vc = df[col].value_counts(dropna=False).head(10)
    for val, cnt in vc.items():
        print(f"    {repr(val)}: {cnt}")
print()

print("=== SAMPLE CATEGORY BREAKDOWN ===")
cat_cols = [c for c in df.columns if 'category' in c.lower() or 'sample_cat' in c.lower() or 'sample cat' in c.lower()]
print(f"  Sample category columns: {cat_cols}")
for col in cat_cols:
    print(f"\n  {col}:")
    print(df[col].value_counts(dropna=False).to_dict())
print()

print("=== PROJECT ID ===")
proj_cols = [c for c in df.columns if 'project' in c.lower()]
print(f"  Project columns: {proj_cols}")
for col in proj_cols:
    n_unique = df[col].nunique(dropna=True)
    print(f"  {col}: {n_unique} unique values")
    print(f"    {df[col].value_counts(dropna=False).head(20).to_dict()}")
print()

print("=== LAB COLUMN ===")
lab_cols = [c for c in df.columns if 'lab' in c.lower()]
print(f"  Lab columns: {lab_cols}")
for col in lab_cols:
    n_unique = df[col].nunique(dropna=True)
    print(f"  {col}: {n_unique} unique values")
    print(f"    {df[col].value_counts(dropna=False).head(20).to_dict()}")
print()

print("=== SAMPLE TYPE ===")
stype_cols = [c for c in df.columns if 'sample type' in c.lower() or 'sampletype' in c.lower() or 'type' in c.lower()]
print(f"  Sample type columns: {stype_cols}")
for col in stype_cols:
    n_unique = df[col].nunique(dropna=True)
    if n_unique < 50:
        print(f"  {col}: {n_unique} unique values")
        print(f"    {df[col].value_counts(dropna=False).head(20).to_dict()}")
print()

print("DONE")
