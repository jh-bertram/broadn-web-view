# Task: broadn-p16-covariate-ui

**Human request (PI, 2026-07-07):** "let's get sprint 2" → Phase 2 of the covariate roadmap: **surface the window covariates in the UI.** Two surfaces: (2a) a weather overlay on the slice-view temporal charts, and (2b) optional per-row weather columns in the Data Explorer. Covariate data already exists (`data/covariates.json`, shipped p14/p15); Phase 2 is the read/display half — no new enrichment, no backend.

**Routing:** full dispatch pipeline — PM decompose → Critic gate → **UI-designer → FE** (user-facing UI; design precedes implementation) + **BE** (build-time data merge) → Auditor (SA/QA/SX, headless-browser QA) → durability commit → requirements-validate → Archivist. Multi-domain (build-pipeline Python + data shape + visual design + FE rendering).

**Branch:** `sprint/broadn-p16-covariate-ui` — branched off **clean main** (commit `0234adc`), which now contains BOTH #13 (Explorer sort/CSV) and #14 (covariates.json). Verified present on branch: `data/covariates.json` (5.0M), `computeExplorerFiltered` in app.js.

---

## Verified recon (this session, 2026-07-07 — `verified-on-disk` unless tagged otherwise)

### Covariate data — `data/covariates.json` (verified-on-disk)
- Top-level: `{ meta, samples }`. `samples` = dict keyed by **BROADN ID** (n=4569).
- Per sample: `covariates` (WINDOW aggregate over the sample's collection window — THE value to surface), `covariates_daily` (full-calendar-day reference), `provenance`.
- `covariates` fields: `temp`, `temp_min`, `temp_max`, `humidity`, `wind_speed`, `wind_direction`, `barometric_press`, `precipitation`.
- `meta.units`: temp °C, humidity %, wind_speed **m/s**, wind_direction °, barometric_press **kPa**, precipitation mm. (Units already MIxS-converted — surface as-is.)
- `provenance.time_fidelity` ∈ {`window_exact` 731, `window_assumed_24h` 132, `date_only` 3050, `no_date` 656}; `provenance.fetch_status` ∈ {`success` 3836, `no_date` 656, `skipped_bad_coord` 77}. `provenance.coord_corrected` (402 true). `provenance.grid_lat/grid_lon/offset_km/elevation/timezone`.
- **Join key is exact:** `covariates.samples[ID]` ↔ `all_samples[].id`. Trivial 1:1 join.

### Display data — `data/data.json` (verified-on-disk)
- Single client fetch: `assets/app.js:4715` `fetch('data/data.json')` (only hard dependency; plus project-layouts + layout-overrides).
- `all_samples` = list[4569]; each `{ id, date, site, type, category, project, project_group, lab_group, am_pm, replicate, quadrant, position, field_control, pipeline_stage }`. **No lat/long, no covariates** currently.
- `slice_views` = `{ project:[20], location:[29], lab_group, project_group }`. Each entry is an AGGREGATE: `{ <id fields>, sample_count, sample_types[], pipeline{}, temporal:[{month,count,types[]}] }`. **No per-sample data inside a slice** → a weather overlay needs per-slice-per-month weather AGGREGATED at build time.
- data.json is **2.18MB** today; covariates.json is 5.0MB (mostly provenance the UI won't show).

### Rendering integration points (verified-on-disk)
- **Slice temporal chart:** `updateSliceCharts(category, chartData)` at `app.js:552`; temporal chart built at `app.js:624-640` reading `chartData.temporal` (array → `insertGapMarkers` → bar dataset). `chartData` is produced by a builder returning `{temporal, sample_types, pipeline, sampler_type_dist}` (return at `app.js:541`). An overlay = a second (line) dataset over the bars, driven by a per-month weather value that must ride along in `chartData.temporal[]`.
- **Explorer:** `computeExplorerFiltered(samples)` at `app.js:1549` is the single source of truth (dashboard filter → tag filter → sort); `renderTable` paginates it; CSV export reads the same. New weather columns must flow through this one function + `renderTable` + the CSV builder + the sort map so table/CSV/sort stay consistent (the p13 DRY contract).
- Explorer table headers live in `index.html` (Phase-0 sortable `<button data-sort-key>` in `<th aria-sort>`; 6 sortable cols + a Request col).

### Static-site constitution (recalled from p7/p13 — PM may spot-verify)
- No build step / bundler / framework / new JS deps for the SITE. Vanilla ES5-style JS (`var`/`function`), Tailwind **CDN**, Chart.js, Leaflet.
- There IS a Python build for the DATA: `scripts/preprocess_data.py` (pandas/openpyxl) → `data/data.json`. Determinism required (`json.dump(sort_keys=True, indent=2)`, fixed rounding, no run-counters) — must be preserved by any merge step so rebuilds stay byte-stable.
- BROADN brand: deep teal `--color-teal-deep` (#0c5454), accent `#0c9cb4`, warm stone. DESIGN.md has a Teal Text Restriction — UI-designer must honor it.

---

## The central architectural decision (PM proposes, Critic vets) — data plumbing

Covariate values must reach the client. The recommended path (matches the roadmap's "bake into slice_views + per-row columns" framing and keeps the single-fetch static architecture):

**Build-time bake into `data/data.json`** (recommended):
- (a) Add a compact `covariates` sub-object to each `all_samples[]` entry (the headline display fields + a `time_fidelity` flag). Powers Explorer columns.
- (b) Add a per-month weather aggregate to each `slice_views.*.temporal[]` bucket (mean of that slice's samples' window-covariates in that month). Powers the overlay.
- Done by a build step that joins `covariates.json` → `data.json`. PM/BE decide: **extend `preprocess_data.py`** vs a **new post-merge script**. Either way: deterministic, offline, and the produced `data.json` is committed.
- Controls payload: ship only the fields the UI shows (not full provenance). PM to weigh which/how many variables per sample to bake (size vs. utility; data.json grows ~+0.5–0.9MB if all 6 vars/sample — consider trimming to the headline set).

Alternative (**runtime second fetch** of covariates.json, client-side join) is viable but ships +5MB and pushes aggregation to the client — inferior for a static 8k-row site. PM should state why if choosing it.

---

## Landmines (from the assessment + PI corrections — see memory `project_broadn_dataset_facts`)
1. **Metadata-not-results (HARD constraint):** covariates are modeled reanalysis **grid-cell estimates** (~11–25 km, Open-Meteo), NOT measurements. UI must label them as such and keep them visually distinct from the sample pipeline/results data. Do not present a grid estimate as a site measurement.
2. **Surface the WINDOW aggregate** (`covariates`), which represents weather integrated over the 12/24h sampling window — the scientifically correct value. `covariates_daily` is a secondary reference at most. Do not revert to a point-in-time framing.
3. **Fidelity varies:** 3050 samples are `date_only` (window = full calendar day, lower precision); only 731 are `window_exact`. UI must not overstate precision — surface the `time_fidelity` flag (or a coarse indicator) rather than implying every value is exact.
4. **Coverage gaps:** 656 `no_date` + 77 `skipped_bad_coord` = 733 samples have **no covariates**. Explorer rows and slice months with missing data must render gracefully (blank/"—"/"n/a"), never `undefined`/`NaN`/broken charts.
5. **DRY/consistency (p13 contract):** Explorer weather columns must be added through `computeExplorerFiltered` + `renderTable` + CSV + sort together, so filtered view, CSV export, and sort order stay identical. Do not add a parallel filter path.
6. **Zero on-load regression:** the Explorer ships with a NEUTRAL default sort (no reorder on load). New columns must not change default order or first-paint layout in a way that reads as a regression. New chart datasets must degrade cleanly where weather is absent.
7. **Determinism:** if the build merge changes `data.json`, the regenerated file must remain byte-stable across offline rebuilds (sorted keys, fixed rounding). Auditor should be able to rebuild data.json from covariates.json + source and get a byte-identical result.

---

## Scope
IN: build-time covariate merge into data.json (or equivalent client-available path); slice-view temporal weather overlay; Explorer per-row weather columns (incl. CSV + sort); labeling/legend for grid-cell-estimate + fidelity; graceful missing-data handling.
OUT: any new enrichment / Open-Meteo calls (data is fixed from p14/p15); the sample-checkout write flow (still the existing `mailto:` — Phase 5, needs backend); changes to `enrich_covariates.py`; map/lat-long display.

## Success criteria (PM to atomize into packets + per-packet SCs)
- Covariate values reach the client via a committed, deterministic path; no new runtime backend.
- Slice temporal charts show a weather overlay for the selected variable, correctly aggregated per month over the slice, labeled as a grid-cell estimate, degrading where data is absent.
- Explorer gains weather column(s) that flow through the shared filter/sort/CSV path; missing values render gracefully; zero on-load regression.
- A11Y (keyboard, aria, WCAG AA contrast, semantic HTML) + brand/Teal-restriction honored.
- Audit SA+QA+SX PASS with **headless-browser QA** (charts render, no console errors, missing-data + keyboard paths verified). If data.json is regenerated, auditor confirms deterministic offline rebuild.

**PM: confirm/adjust the decomposition and agent sequence. UI-designer before FE. Establish the exact baked-covariate schema (BE) as the contract FE + UI build against.**
