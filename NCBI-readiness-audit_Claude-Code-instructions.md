# Auditing the BROADN database for NCBI submission-readiness

*Instructions to hand to **Claude Code**, pointed at the central BROADN Excel database.*
*Goal: for every sample, estimate whether it is **ready to submit** to NCBI/SRA, **needs more metadata** (and which fields), or is **not yet sequenced**.*

---

## What you'll get out of it

1. A **summary** — counts by project × readiness status, % ready, and the most-common missing fields.
2. A **gap report** (one row per sample) — status + exactly which required fields are missing or badly formatted.
3. *(optional)* A **submission-ready export** — the ready samples pre-formatted into BioSample + SRA columns.

These are **estimates** based on column mapping — Claude Code will show its assumptions so you can correct them.

---

## Before you start

- Have the Excel database path handy (e.g., the central `.xlsx` on OneDrive/SharePoint — sync it local first so Claude Code can read it).
- Claude Code needs Python with `pandas` and `openpyxl` (it can install them).
- **Read-only rule:** the master file is never modified. Claude Code works on a **copy** and writes *new* output files. Say this explicitly in the session.

---

## Step 1 — Inventory first, don't assume

Have Claude Code open the workbook and **print the structure before doing anything else**: every sheet name, its row count, and its column headers. Your DB has multiple sheets (e.g., bag/box inventory, sample list, sequencing tracker) — you need to point it at the right one(s) and confirm which columns carry the sample metadata and the sequencing status.

## Step 2 — Confirm the column mapping

Claude Code proposes a mapping from your columns to the NCBI required fields, prints it as a table, and **pauses for your OK**. Use this target list (from the requirements reference):

| NCBI field | Likely BROADN column (confirm) | Required for "ready"? |
|---|---|---|
| `sample_name` | Sample ID | yes |
| `collection_date` | Collection date (+ time / AM-PM) | yes |
| `geo_loc_name` | Site / location | yes |
| `lat_lon` | Latitude, Longitude | yes |
| `env_broad_scale` | *(may not exist yet)* | yes (ENVO) |
| `env_local_scale` | *(may not exist yet)* | yes (ENVO) |
| `env_medium` | Substrate / sample type | yes (ENVO) |
| `target_gene` | Sequencing type (16S/ITS/18S) | yes if sequenced |
| `target_subfragment` | Region (V4, ITS1…) | recommended |
| `pcr_primers` | Primers used | recommended |
| `instrument_model` | Sequencer / platform | yes if sequenced |
| `library_layout` | Paired/single (or read count) | yes if sequenced |
| **sequencing status** | "Sequenced?" / pipeline stage | drives scope |
| **raw files** | FASTQ path / filename | yes to actually submit |
| project / PI | Project, collection, PI | context |

Anything with no matching column = a **gap for the whole dataset** (flag it once, loudly — e.g., "no `env_broad_scale` column exists anywhere").

## Step 3 — Classify each sample

Apply these rules (adjust thresholds with Claude Code as needed):

- **Not yet sequenced** — no sequencing run / no `target_gene` / pipeline stage < Sequenced. *(Out of submission scope for now; count separately.)*
- **Ready to submit** — sequenced **and** all *required* fields present and well-formed **and** a raw FASTQ file is located.
- **Needs metadata** — sequenced but ≥1 required field missing or malformed → **list the offending fields**.
- **Ready pending files** — metadata complete but no FASTQ located → separate bucket (a data-management gap, not a researcher gap).

## Step 4 — Validate format, not just presence

A field can be present but unusable. Also check:

- `collection_date` parses to ISO 8601 (`YYYY-MM-DD`).
- `lat_lon` has two numbers in range (lat −90..90, lon −180..180).
- `geo_loc_name` starts with a country.
- `env_*` values look like ENVO terms (`label [ENVO:…]`) — if they're free text, flag as "needs ENVO mapping" (don't invent terms).
- `target_gene` ∈ {16S rRNA, ITS, 18S rRNA} (normalize variants like "16s", "ITS2").

## Step 5 — Output

- Print the **summary** to the console.
- Save **`ncbi_readiness_gap_report.xlsx`** (or `.csv`): columns = `sample_name, project, status, missing_fields, format_issues, has_fastq`.
- Save **`ncbi_readiness_summary.csv`**: project × status counts.
- *(optional)* Save **`submission_ready_biosample_SRA.xlsx`** for the ready subset, columns pre-named per NCBI.

---

## Copy-paste prompt for Claude Code

> Paste this into Claude Code in the folder containing the database (edit the path/sheet if you already know them).

```
You are auditing our lab's central Excel database to estimate NCBI/SRA submission
readiness for amplicon (16S/ITS/18S) sequencing samples. Work in Python
(pandas + openpyxl). READ-ONLY: never modify the source workbook — operate on a
copy and write new output files only.

FILE: ./<PATH-TO-DATABASE>.xlsx   # if unsure, list .xlsx files and ask me

STEP 1 — INVENTORY: Open the workbook and print every sheet name, its row count,
and its column headers. Identify which sheet(s) hold (a) sample metadata and
(b) sequencing status. Stop and show me this before continuing.

STEP 2 — MAP COLUMNS: Propose a mapping from the workbook columns to these NCBI
fields, and print it as a table for my confirmation. Flag any field that has NO
matching column as a dataset-wide gap.
  Required (BioSample): sample_name, collection_date, geo_loc_name, lat_lon,
    env_broad_scale, env_local_scale, env_medium
  Required if sequenced (SRA): target_gene, instrument_model, library_layout,
    library_strategy=AMPLICON, library_source, library_selection=PCR
  Recommended: target_subfragment, pcr_primers
  Also find: sequencing-status/pipeline-stage column, and any FASTQ file path/name.
Wait for my OK before Step 3.

STEP 3 — CLASSIFY each sample into exactly one status:
  - "not_sequenced"         : no sequencing run / no target_gene / stage < Sequenced
  - "ready"                 : sequenced AND all required fields present & valid AND a FASTQ file is located
  - "needs_metadata"        : sequenced but >=1 required field missing/invalid  (record which)
  - "ready_pending_files"   : metadata complete but no FASTQ located

STEP 4 — VALIDATE format (count as invalid if it fails):
  collection_date -> ISO YYYY-MM-DD ; lat_lon -> two numbers in range ;
  geo_loc_name -> starts with a country ; env_* -> looks like an ENVO term
  (flag free text as "needs ENVO mapping", do NOT invent terms) ;
  target_gene -> one of {16S rRNA, ITS, 18S rRNA} (normalize spelling).

STEP 5 — OUTPUT:
  1) Print a summary: total samples; counts by status; a project x status table;
     % of sequenced samples that are "ready"; and the 5 most-common missing fields.
  2) Write ncbi_readiness_gap_report.xlsx with one row per sample:
     sample_name, project, status, missing_fields, format_issues, has_fastq.
  3) Write ncbi_readiness_summary.csv (project x status counts).
  4) If asked, write submission_ready_biosample_SRA.xlsx for the "ready" subset,
     columns named per NCBI (sample_name, organism, collection_date, geo_loc_name,
     lat_lon, env_broad_scale, env_local_scale, env_medium, target_gene,
     target_subfragment, pcr_primers, library_strategy, library_source,
     library_selection, library_layout, platform, instrument_model, filename).

Show your mapping assumptions and any columns you had to guess. These are estimates —
be explicit about uncertainty. Do not fabricate values; leave unknowns blank and
report them as gaps.
```

---

## Gotchas to expect

- **Messy headers / merged cells / multiple header rows** — tell Claude Code to detect the real header row, not assume row 1.
- **One sample, many runs** (re-sequencing) — dedupe on `sample_name` for BioSample counts; count runs separately.
- **"Sequenced" ambiguity** — your pipeline tracker may use stage labels (Collected / Extracted / Sequenced / Deposited). Point Claude Code at that column so scope is right.
- **ENVO terms almost certainly don't exist yet** in the DB — expect the audit to say "N samples need ENVO environment fields." That's a real, expected finding, and a good candidate for a one-time bulk fill (one ENVO triplet per site type).
- **Formatting vs. missing** — a lat/long that exists but is in DMS still counts as "needs work." The format checks catch that.

*Companion file: `NCBI-amplicon-SRA-metadata-requirements.md` (full field definitions and formats).*
