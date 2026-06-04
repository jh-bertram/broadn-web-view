# Sprint Brief — broadn-p9-data-management-stats

**Author:** Zoey (orchestrator), 2026-06-04
**Status:** READY TO BUILD — hand to a fresh `/zoey` session
**task_id:** `broadn-p9-data-management-stats`

---

## 0. How to use this document

This is a complete, self-contained sprint brief. A fresh Zoey session should:

1. Read this whole file.
2. Run the normal pipeline (`dispatch-task`, or orchestrator.md inline): convention-detect → PM decomposition (use the decomposition in §7 as the starting point) → Critic → assign-agents → audit → requirements-validate → archive → human browser verification.
3. The numbers are already computed and verified (§4). The data-layer task must **re-derive them in code** (not hardcode), then assert they match the anchors in §4.

Everything an implementing agent needs — exact file locations, the data contract, column logic, and success criteria — is below. The verified analysis lives at:
`.claude/agents/tasks/outputs/broadn-p1-annual-report-metrics-ST-1780599263.md` (statistician output)
`.claude/tasks/broadn-p1-annual-report-metrics.md` (column-mapping contract).

---

## 1. Goal

Surface BROADN's data-management statistics on the public dashboard (`index.html`). These are the numbers a colleague needed for the annual report (`new-feature-request.md`): how many samples are archived, how many have amplicon vs. metagenomics data, how long sampling ran at each tower, and what fraction of data is deposited in public repositories. Today those facts exist in the source spreadsheet but are **dropped by the web view's `data.json`** — so the dashboard can't show them. This sprint computes them in the pipeline and renders them on the page.

---

## 2. ⚠️ STACK REALITY — read before decomposing

**This repo is NOT a React/TypeScript/Zod/Shadcn app.** The Gander default standards (`.claude/rules/standards.md`: kebab-case `.ts`, `PascalCase.tsx`, Zod at every boundary) **do not apply to the application code here.** Follow the *existing conventions of this repository*:

- **Frontend:** a single static `index.html` (~4,112 lines). Tailwind utility classes (CDN), **vanilla JS** (no framework, no build step), Chart.js for charts, Leaflet for the map. Data is fetched at runtime from `data/data.json`.
- **Data pipeline:** `scripts/preprocess_data.py` (~1,446 lines, **Python / pandas / openpyxl**). Reads `Bdb-317.xlsx` → writes `data/data.json`. This is the only place data is computed.
- **No dev server, no `package.json`, no test runner.** "Run it" = regenerate `data.json` with Python, then open `index.html` in a browser (or `python3 -m http.server`).
- **Design source of truth:** `DESIGN.md` (v1.0.0) at repo root. UI Designer and Frontend Engineer must follow it for all color/spacing/typography decisions.

Convention-detect (Step 0.5) should confirm all of this — but it is stated here so no agent tries to introduce React, Zod, or a `.tsx` component. The implementing agents are still **frontend-engineer** (for `index.html`) and **backend-engineer** (for the Python pipeline) — they just work in this repo's actual stack.

---

## 3. Project identity (context)

**BROADN** = Biology Integration Institute Regional OneHealth Aerobiome Discovery Network, One Health Institute, Colorado State University. Static single-page dashboard deployed via **GitHub Pages**. All aggregates are over **field samples** (4,569); the 3,506 derivative "product" rows carry the lab/sequence data and are rolled up to their parent field sample, never counted directly.

---

## 4. The verified numbers (anchors — data layer must reproduce these)

All independently reproduced twice (ORC recon + statistician). `n = 4,569` field samples.

| Metric | Value | Notes |
|---|---|---|
| Archived & cataloged | **3,530** (77%) | any of 4 storage columns non-blank |
| Amplicon (16S/ITS) | **2,960** (65%) | equals existing `kpis.sequenced` — sanity anchor |
| Metagenomics | **63** (1.4%) | of which **0** are publicly deposited |
| Uploaded — strict (data repos) | **623** (14%) | accession tokens in sequence columns only |
| Uploaded — broad (incl. publications) | **780** (17%) | adds DOI/Published links |
| CPER duration | **Jun 2022 → Sep 2023** (~15 mo) | 197/649 CPER rows lack a date |
| SGRC duration | **May 2022 → Feb 2025** (~33 mo) | 27/2,057 lack a date |
| CPER tower breakdown | **649 total** — Top(A) 162, Bottom(B) 160, Environment 327 | NEON tower site |
| NWT (Niwot Ridge, 2nd NEON tower) | **48** — Top 16, Middle 12, Bottom 20 | Jun–Oct 2023 |
| Hosting | GitHub Pages (free, temporary) | stated fact, not derived |

---

## 5. Exact column logic (for reproducible computation in `preprocess_data.py`)

Source: `Bdb-317.xlsx`, Sheet1. `Sample Category` ∈ {`Field Sample` (4,569), `Sample Product` (3,506)}. Products link to parent via `Sample derived from` = parent BROADN ID. The pipeline already has `SEQ_COLS` and `compute_pipeline_counts()` rolling products to `_specimen_id` — reuse that machinery.

- **Archived:** field sample where any of `Sample Storage Bag`, `Sample Storage Freezer`, `Sample Storage Room`, `Sample Storage Building` is a non-empty string.
- **Amplicon:** distinct parent field samples where any product (or the row itself) has `Sequence 16s` OR `Sequence ITS` non-blank.
- **Metagenomics:** distinct parent field samples with `MetaGenome Sequence` non-blank.
- **Uploaded — strict:** distinct parents where `Sequence 16s` / `Sequence ITS` / `MetaGenome Sequence` contains an accession-like token (case-insensitive match on `ncbi|sra|ena|prjna|samn|bioproject`). Excludes DOI-only `External Resources`.
- **Uploaded — broad:** strict ∪ (`External Resources` non-blank) ∪ (`Publication Status` == "Published").
- **Duration (per location):** min/max `Sample Collected Date` for `Sample Collection Location` == {CPER, SGRC}, over dated field-sample rows. Report start/end `YYYY-MM` + month span.
- **Tower breakdown:** `Sample Collection Location` == CPER, grouped by `Sample Collection Specific Site` → {Top (A), Bottom (B), Environment}. Same for NWT. (Verified against `Bdb-317.xlsx` during broadn-p9 T1: the exact site strings are `Top (A)` / `Bottom (B)` — no "Tower " prefix.)

A helper that returns the accession-token test should live next to the existing `is_sequenced()` helper for DRY.

---

## 6. Data contract — new `data_management` block in `data/data.json`

Add ONE new top-level key. Do not rename or remove existing keys (the page and the 12-key self-test depend on them). Computed in `preprocess_data.py`, emitted into the output dict assembled around `preprocess_data.py:1343` (alongside `meta`, `kpis`, `pipeline`, …).

```json
"data_management": {
  "n_field_samples": 4569,
  "archived":     { "count": 3530, "pct": 77.0 },
  "amplicon":     { "count": 2960, "pct": 64.8 },
  "metagenomics": { "count": 63, "pct": 1.4, "deposited": 0 },
  "uploaded": {
    "strict": { "count": 623, "pct": 13.6, "label": "Deposited in public data repositories" },
    "broad":  { "count": 780, "pct": 17.1, "label": "Linked to a publication or public record" }
  },
  "duration": {
    "CPER": { "start": "2022-06", "end": "2023-09", "months": 15 },
    "SGRC": { "start": "2022-05", "end": "2025-02", "months": 33 }
  },
  "neon_towers": {
    "CPER": { "total": 649, "tower_top": 162, "tower_bottom": 160, "environment": 327 },
    "NWT":  { "total": 48,  "top": 16, "middle": 12, "bottom": 20, "start": "2023-06", "end": "2023-10" }
  },
  "hosting": "GitHub Pages (free hosting, permanent host TBD)"
}
```

(Percentages above are illustrative of shape — the data layer recomputes them; values must round to the §4 anchors.)

---

## 7. Proposed task decomposition (PM starting point)

Three tasks, two waves. The PM may refine, but keep the BE-defines-data → FE-consumes ordering and the design-before-FE rule.

### Wave 1 (parallel)

**T1 — Data layer (backend-engineer, Python).** Extend `scripts/preprocess_data.py` to compute the metrics in §5 and emit the `data_management` block (§6) into `data/data.json`. Regenerate `data.json`. Reuse existing product-rollup machinery (`SEQ_COLS`, `_specimen_id`, `compute_pipeline_counts`). Add the accession-token helper near `is_sequenced()`.
- **SC1:** `data/data.json` contains a `data_management` block matching §6 shape.
- **SC2:** Every value rounds to the §4 anchor (assert in code or a verification print; e.g. archived 3530, amplicon 2960, metagenomics 63, uploaded.strict 623, uploaded.broad 780, CPER 649=162+160+327, NWT 48).
- **SC3:** All pre-existing `data.json` keys and values are unchanged (no regression to `kpis`, `pipeline`, `all_samples`, etc.). Diff the file; only an addition.
- **SC4:** Update the stale self-test prints at `preprocess_data.py:1405-1409` — they currently compare against the retired dataset (`field_samples == 4571`, `sequenced == 2098`) and print FAIL on the current data. Either update to current expected values or convert to dynamic checks. (Housekeeping discovered during recon; in scope because this task already edits the verification region.)
- **Out of scope:** any change to `index.html`; any change to existing aggregations.

**T2 — Design spec (ui-designer).** Produce a `design_spec` for presenting the §4 stats, following `DESIGN.md` v1.0.0. Decide: do these become (a) additional KPI cards in the existing Overview grid, (b) a dedicated "Data Management" section, or (c) a hybrid. Recommended direction in §8 — UI Designer owns the final call.
- **SC:** spec covers card/section layout, exact DESIGN.md tokens, the strict-vs-broad upload treatment, the NEON-tower breakdown presentation, responsive behavior, and a11y (semantic headings, the existing KPI cards use icon + `text-sm` label + `text-2xl font-bold` value).
- **Out of scope:** writing HTML/JS.

### Wave 2

**T3 — Frontend (frontend-engineer, vanilla `index.html`).** Implement T2's spec, consuming the `data_management` block from T1.
- Add markup in the Overview or a new section (existing KPI grid: `index.html:608-670`; section pattern e.g. `<section id="pipeline">` at `:720`).
- Add a `renderDataManagement(dm)` function modeled on `renderKPIs()` at `index.html:1486`, and call it from the same data-load flow where `renderKPIs` is invoked. Match existing vanilla patterns — `getElementById().textContent`, `.toLocaleString()`, no framework.
- If a chart is used, use Chart.js (already loaded) and the `CHART_COLORS` palette (`index.html:~872`).
- Add a nav link if a new section is created (nav pattern at `index.html:124`).
- **SC1:** all §4 stats render correctly from `data_management` (no hardcoded numbers in the HTML/JS — read from the JSON).
- **SC2:** "% uploaded" leads with the **strict 14%** figure labeled "deposited in public repositories"; broad 17% is secondary (tooltip/subtext), never presented as the headline repository number.
- **SC3:** loading/empty states don't break if `data_management` is absent (defensive, like the rest of the renderers).
- **SC4:** matches DESIGN.md; keyboard-navigable; WCAG AA contrast; no console errors.
- **Out of scope:** changing the pipeline; restyling existing cards.

---

## 8. UI guidance (recommended, UI Designer decides)

Recommended: a dedicated **"Data Management"** section (its own `<section id="data-management">` + nav link), because seven new facts overload the 4-card Overview grid and these read as a distinct story (archive → sequencing → deposition). Suggested contents:

- **A row of stat cards** (reuse the exact KPI card pattern at `index.html:611`): Archived 3,530 (77%), Amplicon 2,960 (65%), Metagenomics 63, Deposited in repositories 14%.
- **A small "data deposition" framing** that makes the gap honest: 14% deposited; **0 of 63 metagenomes deposited yet** — this is the "plan for the rest" story, good to show rather than hide.
- **A tower/duration mini-panel:** CPER Jun 2022–Sep 2023 with the Top/Bottom/Environment split; NWT as the second NEON tower (Jun–Oct 2023). Could reuse the existing "Tower Position & Sites" card style (`index.html:448`).

Copy guidance (bake into the spec, not invented at FE time):
- Use **exact month ranges**, not season labels — 30% of CPER rows lack dates, so "fall 2022/2023" would be imprecise.
- Label uploads carefully: 14% = "deposited in public data repositories"; 17% = "linked to a publication or public record." Never conflate.

---

## 9. Verification & audit

- **Per-task audit:** run `audit-pipeline` (SA standards-for-this-stack, QA, SX) on T1 and T3 as each returns.
- **T1 functional check:** re-run `python3 scripts/preprocess_data.py`, confirm it completes, then `git diff --stat data/data.json` shows only an addition and the `data_management` values match §4. The auditor (or ORC) can independently recompute one or two anchors from the xlsx.
- **requirements-validate** before archive: every email question in `new-feature-request.md` maps to a rendered stat.
- **Human browser verification (Step 4.5):** static page — open `index.html` directly (or `python3 -m http.server 8000` then visit `localhost:8000`). Confirm: section renders, all stats present and correct, strict-14% leads the upload figure, no console errors, responsive + keyboard-navigable.
- **Durability commit** after each audit PASS, scoped to the task's files (`scripts/preprocess_data.py` + `data/data.json` for T1; `index.html` for T3). On a `sprint/*` branch → after commit, ask the human whether to open a PR to `main` (Pages deploys from there).

---

## 10. Out of scope (defer)

- Re-architecting the page to a framework. No.
- Editing `Bdb-317.xlsx` or the upstream data-entry process.
- Per-sample deposition tracking UI / filterable deposition view — possible future sprint, not this one.
- Backfilling missing collection dates (a data-entry task, not a dashboard task).

---

## 11. File map (quick reference)

| Path | Role |
|---|---|
| `index.html` | the dashboard (vanilla). KPI cards `:608-670`; `renderKPIs()` `:1486`; pipeline section `:720`; nav `:124`; `CHART_COLORS` `:872` |
| `scripts/preprocess_data.py` | Python ETL. `SEQ_COLS`/`is_sequenced()` `:84-121`; `compute_pipeline_counts()` `:129`; kpis dict `:1253`; output assembly + `json.dump` `:1343-1371`; stale self-test prints `:1405-1409` |
| `data/data.json` | generated payload the page fetches (regenerate; never hand-edit) |
| `data/sites.json` | site code → lat/lon lookup |
| `DESIGN.md` | design tokens, v1.0.0 — SSOT for UI |
| `Bdb-317.xlsx` | source spreadsheet (Sheet1) |
| `.claude/agents/tasks/outputs/broadn-p1-annual-report-metrics-ST-1780599263.md` | full verified analysis + data-quality flags |
| `.claude/tasks/broadn-p1-annual-report-metrics.md` | confirmed column-mapping contract |
