# Task: broadn-p1-annual-report-metrics

**Human request:** Produce a simple, clear set of data-management metrics from `Bdb-317.xlsx` that a colleague can import directly into the BROADN annual report (answers to Tracey's data-management email, `new-feature-request.md`).

**Agents spawned:** ST (statistician)

**Routing:** direct (data-terminal sprint — ST is the executor, no PM decomposition; ORC acting as PM)

## Source
- `Bdb-317.xlsx` (Sheet1, 8,075 rows = 4,569 field samples + 3,506 derivative products). Products link to parent field sample via `Sample derived from` = parent BROADN ID.

## Confirmed column mappings (from human)
| Metric | Column logic |
|---|---|
| Archived & cataloged | any of `Sample Storage Bag/Freezer/Room/Building` non-blank (field samples) |
| Amplicon | `Sequence 16s` OR `Sequence ITS` non-blank, rolled product→parent |
| Metagenomics | `MetaGenome Sequence` non-blank only, rolled product→parent |
| CPER/SGRC duration | min/max `Sample Collected Date` per `Sample Collection Location` |
| CPER tower samples | `Sample Collection Location`=CPER, split by specific site (Tower Top/Bottom vs Environment) |
| Uploaded — broad (per spec) | accession-like in seq cols OR `External Resources` non-blank OR `Publication Status`=Published |
| Uploaded — strict (data repo) | accession-like (ncbi/sra/ena/prjna/samn) in `Sequence 16s/ITS/MetaGenome` only |

## ORC anchor numbers (cross-check; ST must reproduce independently)
- Field samples: 4,569 (total rows 8,075)
- Archived (any storage non-blank): 3,530 (77%)
- Amplicon (16S∪ITS → parent): 2,960 (65%) — matches data.json `sequenced` KPI
- Metagenomics: 63 (1.4%); 0 of 63 uploaded
- Uploaded broad: 780 (17%)
- CPER: Jun 2022 → Sep 2023; SGRC: May 2022 → Feb 2025
- CPER field samples 649 = Tower Top(A) 162 + Tower Bottom(B) 160 + Environment 327

## Success criteria
1. Each of the 7 email questions answered with a single clear number/range + the column logic used.
2. Uploaded reported BOTH ways (broad + strict-data-repository).
3. Output is import-ready: a compact table the colleague can paste into the annual report, plus 1-line caveats where a number is soft.
4. All ORC anchor numbers independently reproduced (flag any discrepancy).
