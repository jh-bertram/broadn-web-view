# Task: broadn-p18-ncbi-readiness-audit

**Human request:** Read `NCBI-readiness-audit_Claude-Code-instructions.md` and analyze `Bdb-317.xlsx` to estimate, per sample, NCBI/SRA submission-readiness.

**Agents spawned:** ST#1 (statistician, data-terminal executor) → AUD#1 (auditor, verification gate) → Archivist

**Routing:** direct (ORC acting as PM — single-domain data-terminal analysis; PM decomposition skipped per data-terminal rule). Executor is the statistician per the routing-table entry "Dataset EDA / column inspection task → statistician."

## Ground facts (verified-on-disk 2026-07-23)
- Workbook: `Bdb-317.xlsx`, single sheet `Sheet1`, header on **row 0** (1-indexed row 1), **7,846 data rows**, **72 columns**.
- Read-only rule (from instructions): master workbook never modified; ST operates on a copy and writes new output files only.
- Deliverables → `docs/ncbi-readiness/`: `ncbi_readiness_gap_report.xlsx`, `ncbi_readiness_summary.csv`, optional `submission_ready_biosample_SRA.xlsx`.
- Human confirmation gate at instructions Step 2 (column mapping OK) is deferred: human is not watching in real time, so ST proceeds end-to-end but surfaces every mapping assumption explicitly and reversibly. ORC re-runs on human correction.

## Success criteria
1. Inventory printed (sheets, row count, headers) — instructions Step 1.
2. Column mapping table (BROADN column → NCBI field), dataset-wide gaps flagged loudly — Step 2.
3. Every sample classified into exactly one of {not_sequenced, ready, needs_metadata, ready_pending_files} — Step 3.
4. Format validation applied (date ISO, lat_lon ranges, geo_loc country prefix, env_* ENVO shape, target_gene normalization, library_ID uniqueness, sample_name duplicates) — Step 4.
5. Outputs written: console summary + gap report xlsx + summary csv — Step 5. No fabricated values.

## Status
- [x] ST executor — statistical_report + 3 deliverables in docs/ncbi-readiness/ (2026-07-23)
- [x] Audit (SA/QA/SX) — AUD#1 FAIL (1 defect: organism-missing predicate) → ST#1-rev1 fix + ORC re-run → ORC re-verify PASS (seq 13)
- [x] Archive — AR#1 logged to docs/project_log.md + AR output (seq 16). Sprint CLOSED.

## Outcome (headline)
- 4,494 logical samples (7,846 raw rows rolled up Field-Sample←Product); 2,926 sequenced (65%); **0 submission-ready**.
- Root cause of 0-ready: `env_broad_scale`, `env_local_scale`, `instrument_model`, `library_layout` have **no column anywhere** — dataset-wide schema gap, identical across all samples.
- Deliverables (UNCOMMITTED — pending human mapping-confirmation + re-run): docs/ncbi-readiness/{ncbi_readiness_gap_report.xlsx, ncbi_readiness_summary.csv, ncbi_readiness_audit.py}.
- Open decisions for human: (1) confirm Field-Sample-as-BioSample rollup; (2) treat instrument_model/library_layout as uniform submission-constants vs per-sample gaps; (3) site→country lookup for geo_loc_name; (4) PRJNA1263026 deposit status on 624 rows; (5) 402 sign-flipped longitudes.
