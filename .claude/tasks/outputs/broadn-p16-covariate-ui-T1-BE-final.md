# broadn-p16-covariate-ui-T1 — BE data_packet

## Frozen baked-covariate schema — THE CONTRACT (verbatim, as implemented)

Two additive keys. No other `data.json` shape changes — the ROOT-level `temporal[]` (the
global monthly array at data.json top level) gains NO `weather` key; only
`slice_views.*.temporal[]` does.

### (a) Per-sample — each `all_samples[]` entry gains ONE new key `covariates`

For a sample with usable covariates (`provenance.fetch_status == "success"`):
```json
"covariates": {
  "temp": 12.4,           // °C, mean over WINDOW (covariates.temp), round 1 decimal
  "humidity": 63,         // %, round 0 decimals
  "wind_speed": 3.2,      // m/s, round 1 decimal
  "precipitation": 0.4,   // mm, round 1 decimal
  "fidelity": "date_only" // provenance.time_fidelity ∈ {window_exact|window_assumed_24h|date_only}
}
```
For the 733 samples with NO covariates (`fetch_status ∈ {no_date (656), skipped_bad_coord (77)}`):
```json
"covariates": null
```
- Values come from `covariates.samples[ID].covariates` — the WINDOW aggregate, never
  `covariates_daily`, never point-in-time.
- Explicit `null` (not omitted, never `NaN`/`undefined`).
- Any per-field value that is missing/empty at source is coerced to `null` (never `NaN`/`Infinity`).
- Headline set only = `{temp, humidity, wind_speed, precipitation}` + `fidelity`. Key insertion
  order fixed as shown; `covariates` appended as the LAST key on each `all_samples[]` entry.

### (b) Per-slice-per-month — each `slice_views.*.temporal[]` bucket gains ONE new key `weather`

For a bucket with ≥1 covariate-bearing sample in that slice-month:
```json
"weather": {
  "temp": 11.8,           // mean of contributors' covariates.temp, round 1
  "humidity": 60,         // mean, round 0
  "wind_speed": 3.1,      // mean, round 1
  "precipitation": 0.5,   // mean, round 1
  "n": 9,                 // count of covariate-bearing samples behind the mean (honesty)
  "fidelity": "date_only" // COARSEST fidelity present among contributors (deterministic)
}
```
For a slice-month with no covariate-bearing sample:
```json
"weather": null
```
- Coarsest fidelity ordering (least precise wins): `window_exact` < `window_assumed_24h` <
  `date_only`. Deterministic, conservative, no "mixed" string.
- Any per-field mean that is empty (0 contributors after filtering) is `null`, never `NaN`/`Infinity`.
- `weather` appended as the LAST key on each `slice_views.*.temporal[]` bucket.
- Only `slice_views.*.temporal[]` carries `weather`. The root-level `temporal[]` does NOT.

---

## Implementation summary

- **Files changed:** `scripts/preprocess_data.py` (extended, +146/-16 net lines), `data/data.json`
  (regenerated working-tree output). No other file touched by this task. (Note: `docs/SESSION-CHECKPOINT.md`
  shows as modified in `git status` but was NOT edited by this task — pre-existing working-tree
  state from before this turn started; excluded from `files_changed`.)
- Added `COVARIATES_JSON_PATH` constant + `load_covariates(path)` loader (mirrors `load_sites`).
- Added 5 DRY bake helpers ahead of `build_temporal`: `_clean_float` (NaN/Infinity/missing→`None`
  guard), `_extract_raw_covariates` (single shared unrounded lookup gated on
  `fetch_status=='success'`, used by BOTH the per-sample and per-slice-month bakes — avoids
  duplicated parsing logic AND avoids double-rounding drift between the two bakes),
  `bake_sample_covariates` (§a), `_coarsest_fidelity`, `build_weather_bucket` (§b).
- Parametrized `build_temporal(field_samples, covariates_index=None)`: adds `weather` per bucket
  only when `covariates_index` is passed. The GLOBAL call `temporal = build_temporal(field_samples)`
  (now at :1662) is **unchanged** — no second argument, so `weather` is never added to the
  root-level `temporal[]`.
- `build_all_samples(...)` gained a required `covariates_index` param and now bakes
  `"covariates": bake_sample_covariates(broadn_id, covariates_index)` as the last key on every entry.
- The 4 slice builders (`build_slice_project`, `build_slice_project_group`, `build_slice_location`,
  `build_slice_lab_group`) each gained a `covariates_index` param, threaded to their internal
  `build_temporal(group, covariates_index)` calls (all 4 call sites updated via one `replace_all`
  edit since the old/new snippets were identical across sites).
- `main()`: added a `[2b] Loading covariates.json...` step (loads once, indexed by BROADN ID —
  `covariates.json`'s `samples` map is already keyed that way) and threaded `covariates_index`
  into `build_all_samples` + the 4 slice-builder calls. The `json.dump(output, f, indent=2,
  ensure_ascii=False)` call (now at :1776) is **byte-verbatim unchanged** — no `sort_keys`, no
  reordering of the assembly dict.

## Verification (all commands run in `/home/jhber/projects/broadn-web-view`)

**1. Idempotency / determinism.** Ran `python3 scripts/preprocess_data.py` twice in succession and
diffed the two outputs directly:
```
$ diff data-run1.json data.json
3c3
<     "generated": "2026-07-07T21:59:39Z",
---
>     "generated": "2026-07-07T22:01:17Z",
```
The **only** line that differs between two consecutive reruns is the pre-existing
`meta.generated` build timestamp (`datetime.now(timezone.utc)`, stamped on every run — this
predates p16 and is unrelated to the covariate bake; the original pre-sprint `data.json` already
carried a different `meta.generated` value than any regeneration would produce). Every
baked `covariates`/`weather` value, all existing fields, and all key ordering are byte-identical
across the two runs. Hashes (full-file, including the timestamp line, for the record):
- Pre-sprint baseline: `9228a1dbc11521735c6615ca966f9cc48494f9be83d7771c6b3bc17d6be37473`
- Post-regen run 1: `2c8d4076b4098f18ecbe532cc8207c3025d4c9dff9a16a40d61efd53e6792787`
- Post-regen run 2: `21e8d0755bfbf8063050a55217983055e068391f105f34f6159293560cb14ddd`
(run1 ≠ run2 is expected and driven solely by the timestamp line, per the `diff` above — this is
the documented pre-existing behavior of `meta.generated`, not a determinism regression introduced
by this task. `git diff data/data.json` was also run and inspected in full — see item 3 below.)

**2. No NaN/Infinity tokens.**
```
$ grep -nE '\bNaN\b|\bInfinity\b' data/data.json | wc -l
0
$ python3 -c "import json; json.load(open('data/data.json')); print('OK')"
OK
```

**3. Additive-only, no reorder.**
```
$ git diff --stat data/data.json
 data/data.json | 38401 +++++++++++++++++++++++++++++++++++++------
 1 file changed, 33801 insertions(+), 4762 deletions(-)
```
The deletion count looks large at first glance but is fully accounted for: every all_samples
entry that gains a new trailing `covariates` key requires its *previous* last line
(`"pipeline_stage": "..."`) to grow a trailing comma — git's line-based diff renders that as a
paired delete+insert of the same content, not a semantic change. Verified exhaustively with a
`Counter`-based (multiset, not naive `comm`) script: every removed line's content, modulo a
trailing comma, is matched by an equal-or-greater count among added lines, with the single
exception of the `meta.generated` timestamp line. Zero unmatched/unaccounted deletions. A raw
`git diff` spot-check (first ~80 lines) confirms the pattern visually: `"pipeline_stage": "sequenced"`
→ `"pipeline_stage": "sequenced",` followed by the new `"covariates": {...}` block — no key
reordering anywhere.

**4. Counts.**
```
$ python3 -c "... covariates null/non-null counts on all_samples ..."
total 4569 null 733 non-null 3836
```
Exact match to `covariates.json`'s `fetch_status` split (success=3836, no_date=656 +
skipped_bad_coord=77=733). Cross-checked against `covariates.json` directly: 0 mismatches across
all 4569 samples (every sample's null/non-null gate matches its `fetch_status` exactly).
```
root temporal[] has weather key: False  (41 entries checked)
slice_views.project / .location / .lab_group temporal buckets: 100% carry a 'weather' key
  (either an object or null); slice_views.project_group is empty (0 groups — pre-existing,
  unrelated to this task; COL_PROJECT_GROUP has no non-null rows in this xlsx).
```

**5. Size guard.**
```
Pre-sprint: 2,178,899 bytes
Post-bake:  2,875,755 bytes
Growth:       696,856 bytes ≈ 0.68 MB   (guard: ≤ 1.2 MB — PASS)
```

**6. Manual correctness spot-checks (beyond the required gate, for confidence):**
- Single-fidelity bucket: `slice_views.lab_group` "Fierer" / 2021-01 → 85 matching `all_samples`
  rows, all 85 covariate-bearing, manual mean/`n`/fidelity recompute from `all_samples[].covariates`
  matches the baked `weather` bucket exactly: `{temp:1.1, humidity:74, wind_speed:2.9,
  precipitation:5.0, n:85, fidelity:"date_only"}`.
- Mixed-fidelity bucket: `slice_views.project` "Flux" / 2024-05 has contributors with BOTH
  `window_exact` and `date_only` fidelities present; baked `weather.fidelity` correctly resolves
  to the coarsest (`date_only`), confirming the ordering `window_exact < window_assumed_24h <
  date_only` (least precise wins) is applied correctly.
- humidity serializes as a bare JSON int (e.g. `31`, not `31.0`) — `round(x)` with no `ndigits`
  argument returns a Python `int`, matching the CONTRACT's `63` (not `63.0`) example.

## Zod contract

N/A — this task is a Python build-time data pipeline (`scripts/preprocess_data.py` →
`data/data.json`), not a TypeScript/Zod API boundary. The "frozen schema" section above is the
CONTRACT artifact FE/UI consume for this task, in lieu of a Zod schema (per PM plan's explicit
CONTRACT framing — no backend/API is introduced by this sprint, per `<out_of_scope>`).

## Test traceback

```
$ python3 -m py_compile scripts/preprocess_data.py
(exit 0, no output)

$ python3 scripts/preprocess_data.py
=== BROADN preprocess_data.py ===
...
[7b] Building slice_views sections...
  all_samples: 4569 entries
  slice_views.project: 20 entries
  slice_views.location: 10 entries
  slice_views.lab_group: 8 entries
  slice_views.project_group: 0 entries

[8] Wrote /home/jhber/projects/broadn-web-view/data/data.json
  File size: 2,875,755 bytes

=== VALIDATION SUMMARY ===
  All 13 required keys present: PASS
  pipeline.collected >= dna_extracted >= sequenced: 4569 >= 3250 >= 2960 = True
=== SLICE_VIEWS VALIDATION ===
  kpis.field_samples: 4569 (live: 4569) — PASS
  pipeline.sequenced: 2960 (live: 2960) — PASS
  All 13 required keys present: PASS
=== DATA_MANAGEMENT ANCHOR VERIFICATION ===
  All data_management anchor checks: PASS
  slice_views.project[0]: sampler_type_dist=PASS, replicate_tags=PASS, tag_groups=PASS
  slice_views.location[0]: sampler_type_dist=PASS, replicate_tags=PASS, tag_groups=PASS
  slice_views.lab_group[0]: sampler_type_dist=PASS, replicate_tags=PASS, tag_groups=PASS
Done.
```
(the script's own internal validation summary — pre-existing anchor/consistency checks — all
PASS unaffected by the covariate bake; confirms no regression to any existing `data.json` section.)

All 6 verification items above (idempotency, NaN/Infinity guard, additive-diff audit, counts,
size guard, correctness spot-checks) PASS.

## Critical logic notes for auditor / PM

1. **Two ambiguities in the CONTRACT, resolved and documented:**
   - **4 edge-case samples** (`BSN0133L`, `BSN0344A`, `BSN0346A`, `BSN1006A`) have
     `provenance.fetch_status == "success"` in `covariates.json` but ALL FOUR headline covariate
     fields are `None` at source (Open-Meteo returned nulls for that grid-cell/window, upstream of
     this task). The CONTRACT's null-vs-non-null gate is phrased purely in terms of
     `fetch_status ∈ {no_date, skipped_bad_coord}` → `null`; it does not separately address
     "success but empty". I implemented the gate literally on `fetch_status` (object with internal
     `null` fields, NOT a bare `covariates: null`) — this is the interpretation that reconciles
     the CONTRACT's own stated exact counts (733 null / ~3836 non-null: 4569 − 733 = 3836 =
     exactly the `success` count). Confirmed via cross-check: 0 mismatches across all 4569 samples
     when validating null/non-null strictly against `fetch_status`.
   - **"mean of contributors' covariates.temp"** in CONTRACT §b was read as "mean of the raw
     per-sample window covariate values" (computed once, pre-rounding, via the shared
     `_extract_raw_covariates` helper) rather than "mean of the already-rounded per-sample baked
     values" — this avoids double-rounding drift between §a and §b. In practice the difference is
     sub-0.05 at 1-decimal precision and the manual spot-check above showed the two approaches
     agreeing exactly on the sampled buckets, so this choice is low-risk either way.
2. **DRY note:** `_extract_raw_covariates` is the single lookup+gate+clean-float path shared by
   both `bake_sample_covariates` (§a) and `build_weather_bucket` (§b) — no duplicated
   fetch_status/NaN-guard logic between the two bakes.
3. **50-line commit gate:** `scripts/preprocess_data.py` diff is 146 net new lines, exceeding the
   default 50-line application-code cap — but this task modifies ONLY a data-generation script
   (`scripts/preprocess_data.py`, a Python preprocessor) plus its regenerated output
   (`data/data.json`); no TypeScript route, no `index.html`, no `app.js` was touched. **50-line
   gate: data-generation script only; JSON validity + spot-check = verification gate**, per the
   documented exception. The verification performed (idempotency, NaN/Infinity token grep,
   `json.load` parse, additive-diff Counter audit, exact-count cross-check, and two independent
   manual spot-checks against raw `covariates.json`) exceeds the exception's minimum bar.
4. **`slice_views.project_group` is empty (0 entries)** both before and after this change — this
   xlsx has no non-null `Project Group` rows in the current dataset; pre-existing, unrelated to
   this task, so the `weather` key on that (empty) slice type could not be exercised, but the code
   path is identical to the other 3 slice builders and will populate correctly once
   `project_group` data exists.
5. **git status caveat:** `docs/SESSION-CHECKPOINT.md` shows modified in `git status --short` but
   was not touched by this task — it was already modified in the working tree before this turn
   began. Excluded from `files_changed` below.
6. Per task instructions, `data/data.json` and `scripts/preprocess_data.py` are left as
   **working-tree changes, NOT committed** — the orchestrator commits after audit PASS.
