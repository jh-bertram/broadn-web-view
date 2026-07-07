# broadn-p16-covariate-ui — PM Task Decomposition — REV1

**PM#0 → ORC#0** | generated 2026-07-07 | REV1 2026-07-07 (post-Critic BLOCK) | branch `sprint/broadn-p16-covariate-ui`

Phase 2 of the covariate roadmap: surface the already-shipped WINDOW covariates in the UI.
Two surfaces (slice temporal weather overlay + Explorer weather columns) + the build-time
merge that feeds them. No new enrichment, no backend.

### REV1 changelog (Critic BLOCK, all four findings verified real on disk)
- **T3 BLOCKER fix:** re-anchored the PRIMARY overlay site from `updateSliceCharts` (:552, tag
  re-render only) to `WIDGET_RENDERERS['temporal_bar']` (app.js:2404, the LIVE declarative on-open
  path via `renderSlice`). `updateSliceCharts` demoted to SECONDARY. Added an initial-cold-open SC.
- **T3 WARNING 1 fix:** overlay must degrade to no-overlay (no error/broken chart) when temporal
  buckets carry no `weather` (tag-active mode via `mergeTagChartData` reconstructs temporal without
  weather). Added to T3 description + SC.
- **T1 WARNING 2 fix:** `build_temporal` is shared with the top-level global `temporal` (:1532).
  Parametrize with optional `covariates_index=None`; bake `weather` only at the slice call sites;
  leave :1532 unchanged. Added SC that the root-level `temporal[]` gains no `weather`.
- **T1 WARNING 3 fix:** `json.dump(...)` `allow_nan` defaults True → a stray `NaN`/`Infinity` token
  breaks the browser's `JSON.parse` of the whole file. T1 must coerce empty/missing means to
  explicit `null` before serialization. Strengthened SC2 to assert `NaN`/`Infinity` appear nowhere.
- Unchanged (Critic-confirmed sound): determinism correction (no `sort_keys`, :1646 verbatim);
  the extend-`preprocess_data.py` architecture; the frozen CONTRACT; the DAG T1→T2→T3→T4;
  prior_approved_tasks + `ctx.parsed.y` mitigations.

---

## Central architectural decision (resolved) — data plumbing

**Decision: build-time bake into `data/data.json` by EXTENDING `scripts/preprocess_data.py`.
NOT a runtime second fetch, and NOT a new post-merge JSON→JSON script.**

Rationale (verified this session against the actual script):
- The Explorer per-sample covariates (surface 2b) *could* be done by a JSON-only merge
  (join `covariates.samples[ID]` ↔ `all_samples[].id`). But the slice-view per-month weather
  aggregate (surface 2a) requires the mean of *a given slice's samples' window covariates in a
  given month* — i.e. the per-sample → slice → month grouping. **That grouping exists only
  inside `preprocess_data.py`** (it groups `field_samples` by project/location/lab_group and
  builds each temporal bucket via `build_temporal(group)` at `preprocess_data.py:489`, whose
  `group` DataFrame carries the per-sample `COL_BROADN_ID` rows at :496-500; called from the slice
  builders at :1003/:1319/:1382/:1436). `data.json`'s `slice_views` entries are already aggregated
  and carry **no per-sample membership** — so a post-merge script reading only `data.json` +
  `covariates.json` **structurally cannot** compute surface 2a.
- Therefore a single deterministic producer (`preprocess_data.py`, extended to take
  `covariates.json` as a third input alongside the xlsx and `sites.json`) is the correct and
  only clean home for both bakes. It also matches the existing `sites.json` join pattern and
  eliminates the "which script ran last / did preprocess clobber the covariates" hazard a
  two-script pipeline would create.
- **`build_temporal` is SHARED (REV1):** it is also called for the top-level global `temporal` at
  `preprocess_data.py:1532`. Extending it unconditionally would leak `weather` into the root-level
  `temporal[]`, violating the CONTRACT's "no other shape changes." T1 MUST parametrize it (optional
  `covariates_index=None`) so `weather` bakes ONLY at the slice call sites; the :1532 call is left
  unchanged. See T1 step 3 + SC7.
- **Auditability:** `Bdb-317.xlsx` is present on-branch (glob-confirmed) and the current
  `data.json` was produced by this script, so the auditor can rerun
  `python scripts/preprocess_data.py` and `git diff --exit-code data/data.json` for a
  byte-stable determinism check. (Risk: requires pandas/openpyxl in the audit env — flagged.)
- Runtime second-fetch rejected: ships +5MB (covariates.json is 5.0M, mostly provenance) and
  pushes per-slice aggregation to the client — inferior for a static 8k-row site.

**Determinism correction (re-verified `recalled` fact, Critic-confirmed):** the brief's recalled
`json.dump(sort_keys=True, indent=2)` is WRONG. The on-disk call at `preprocess_data.py:1646`
is `json.dump(output, f, indent=2, ensure_ascii=False)` — **no `sort_keys`**. Determinism is
insertion-order-based. T1 MUST preserve this call verbatim; adding `sort_keys=True` would reorder
the entire existing `data.json`. Note `allow_nan` defaults True on this call → NaN/Infinity would
serialize as bare tokens; T1 must coerce them to `null` (WARNING 3).

---

## Baked-covariate schema — THE CONTRACT (pinned here; T1 freezes it in its output; T2/T3/T4 build against it)

Two additive keys. No other `data.json` shape changes — in particular the ROOT-level `temporal[]`
(the global monthly array at data.json top level) gains NO `weather` key; only
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
- Values come from `covariates.samples[ID].covariates` — the **WINDOW aggregate**, never
  `covariates_daily`, never point-in-time.
- Explicit `null` (not omitted, never `NaN`/`undefined`) so the DRY Explorer path renders "—".
- Any per-field value that is missing/empty at source is coerced to `null` (never `NaN`/`Infinity`).
- **Headline set only** = `{temp, humidity, wind_speed, precipitation}` + `fidelity`. temp_min/
  temp_max/wind_direction/barometric_press are NOT baked per-sample (payload control; low browse
  value). Non-null covariates expected on ~3836 samples; null on 733; total 4569.

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
  `date_only`. Report the single coarsest string present — deterministic, conservative, no "mixed".
- Any per-field mean that is empty (0 contributors after filtering) is `null`, never `NaN`/`Infinity`.
- Missing → `weather: null` so the overlay renders a gap, never a broken chart.
- **Only `slice_views.*.temporal[]` carries `weather`.** The root-level `temporal[]` does NOT.

Key insertion order is fixed exactly as shown. Rounding as specified. No lat/long, no
provenance, no `covariates_daily` baked into `data.json`.

---

## Task packets

<task_decomposition task_id="broadn-p16-covariate-ui" agent_count="4">
  <task_packets>

  <task_packet>
    <task_id>broadn-p16-covariate-ui-T1</task_id>
    <assigned_to>backend</assigned_to>
    <priority>BLOCKER</priority>
    <description>
Extend `scripts/preprocess_data.py` to bake the shipped window covariates into `data/data.json`
at build time, and freeze the baked-covariate SCHEMA as the contract downstream tasks build against.

1. Add `data/covariates.json` as a third input (alongside `Bdb-317.xlsx` and `data/sites.json`).
   Load it once; index `covariates.samples` by BROADN ID (the join key; exact 1:1 to
   `all_samples[].id`). Call this index `covariates_index`.
2. Per-sample bake (surface 2b feed): in `build_all_samples(...)` (defined at
   `preprocess_data.py:649`), add a `covariates` key to each emitted `all_samples[]` entry per the
   CONTRACT — headline set `{temp, humidity, wind_speed, precipitation}` sourced from
   `covariates.samples[id].covariates` (the WINDOW aggregate) + `fidelity` from
   `provenance.time_fidelity`, with fixed rounding; `covariates: null` for the 733 samples whose
   `provenance.fetch_status ∈ {no_date, skipped_bad_coord}`.
3. Per-slice-per-month bake (surface 2a feed): **parametrize** `build_temporal(group)`
   (`preprocess_data.py:489`) by adding an optional `covariates_index=None` parameter. When (and
   ONLY when) `covariates_index` is provided, each temporal bucket gains a `weather` key = mean of
   that group's covariate-bearing samples for that month, per the CONTRACT (includes `n` and
   coarsest `fidelity`); `weather: null` where no covariate-bearing sample exists in that
   slice-month. Pass `covariates_index` ONLY at the four SLICE call sites (:1003/:1319/:1382/:1436).
   **Leave the top-level global `temporal` call at `preprocess_data.py:1532` unchanged** (no
   `covariates_index` → `weather` omitted → root-level `temporal[]` shape is byte-unchanged). The
   grouping/month membership already lives in `build_temporal`'s `group` DataFrame (per-sample
   `COL_BROADN_ID` rows at :496-500) — join each row's BROADN ID to `covariates_index`.
4. **NaN safety (mandatory):** the dump at :1646 uses `json.dump(..., ensure_ascii=False)` whose
   `allow_nan` defaults True — a stray `NaN`/`Infinity` (empty mean, `float('nan')`, division by
   zero contributors) would serialize as the bare token `NaN`/`Infinity` and break the browser's
   `JSON.parse` of the ENTIRE `data.json`. Coerce every missing/empty-mean per-field value to
   explicit `null` BEFORE serialization. Never emit `NaN`/`Infinity`.
5. Regenerate `data/data.json` and commit it. Preserve the existing dump call at line 1646 exactly
   (`json.dump(output, f, indent=2, ensure_ascii=False)` — do NOT add `sort_keys`). Preserve all
   existing key insertion order; insert the two new keys in the fixed contract order and rounding.
6. Embed the frozen schema (both (a) and (b), verbatim) as the FIRST section of your output packet
   — this is the contract T2/T3/T4 reference; they must not invent field names.
    </description>
    <success_criteria>
(SC1) `python scripts/preprocess_data.py` then `git diff --exit-code data/data.json` exits 0 —
byte-stable, idempotent, offline rebuild (the auditor's determinism gate). (SC2) Every
`all_samples[]` entry has a `covariates` key; a structural check (jq/python) confirms non-null on
~3836 entries and exactly `null` on the 733 no-covariate samples; **the substrings `NaN` and
`Infinity` appear NOWHERE in `data.json`, and every empty/missing per-field mean is `null`** (a
grep for the tokens `NaN`/`Infinity` in `data/data.json` returns zero matches, and `python -c
"import json; json.load(open('data/data.json'))"` parses cleanly). (SC3) Every
`slice_views.*.temporal[]` bucket has a `weather` key (object with
`temp/humidity/wind_speed/precipitation/n/fidelity`, or `null`). (SC4) Field names,
units-as-shipped, rounding, and `null`-for-missing exactly match the pinned CONTRACT. (SC5)
`data.json` final size grows by ≤ 1.2 MB vs. its pre-sprint size (payload guard). (SC6) No
`covariates_daily`, no `grid_lat`/`grid_lon`/`offset_km`/`elevation`/`coord_corrected`, no full
provenance baked into `data.json`. (SC7) **The ROOT-level (top-level) `temporal[]` array gains NO
`weather` key** — only `slice_views.*.temporal[]` buckets do; the :1532 global call path is
byte-unchanged for that array.
    </success_criteria>
    <context_files>
scripts/preprocess_data.py (extend; key anchors :489 build_temporal + :496-500 group rows, :649
  build_all_samples, :1003/:1319/:1382/:1436 SLICE call sites, :1532 GLOBAL temporal call
  (leave unchanged), :1646 dump call — re-anchor by function/call-site name, line numbers may drift);
  data/covariates.json (input — shape verified in brief §Verified recon); data/data.json
  (regenerated output); Bdb-317.xlsx + data/sites.json (existing inputs, unchanged); the pinned
  CONTRACT above.
    </context_files>
    <dependencies>NONE</dependencies>
    <out_of_scope>
Do NOT call Open-Meteo or modify `scripts/enrich_covariates.py` — covariate data is fixed from
p14/p15. Do NOT bake lat/long, elevation, offset, coord_corrected, provenance, or
`covariates_daily`. Do NOT add `sort_keys=True` or otherwise reorder existing keys. Do NOT add
`weather` to the root-level `temporal[]` (the :1532 global call must stay unchanged). Do NOT emit
`NaN`/`Infinity`. Do NOT touch any FE file (`assets/app.js`, `index.html`, `assets/styles.css`) —
this is data-only. Do NOT surface a point-in-time value; the window aggregate `covariates` is the
only source.
    </out_of_scope>
    <output_expected>
      <tag>data_packet</tag>
      <must_contain>
        <item>The frozen baked-covariate schema (both per-sample and per-slice-per-month), verbatim, as the contract section</item>
        <item>Confirmation of the deterministic rebuild command + result (git diff exit 0)</item>
        <item>Reported counts: non-null vs null covariates in all_samples; data.json size before/after</item>
        <item>Confirmation the root-level temporal[] has no weather key and no NaN/Infinity token in the file</item>
      </must_contain>
      <must_not_contain>
        <item>Any FE edit; any Open-Meteo/enrichment call; sort_keys=True; weather on root temporal[]; NaN/Infinity token; lat/long or provenance in data.json</item>
      </must_not_contain>
      <success_signal>preprocess_data.py rerun produces byte-identical data.json (git diff --exit-code == 0); no NaN/Infinity token; root temporal[] unchanged; schema frozen in packet</success_signal>
    </output_expected>
  </task_packet>

  <task_packet>
    <task_id>broadn-p16-covariate-ui-T2</task_id>
    <assigned_to>ui-designer</assigned_to>
    <priority>HIGH</priority>
    <description>
Produce a design_spec for both p16 covariate surfaces, building against T1's frozen schema
contract. Cover three deliverables:

(A) **Slice temporal weather overlay** — a second Chart.js dataset (line) drawn over the existing
   monthly bar chart in the slice panel, driven by `slice_views.*.temporal[].weather`. Specify: the
   variable-selection UX for the headline set `{temp, humidity, wind_speed, precipitation}` (a
   compact selector, OR a defensible default-to-temperature with no selector if you judge the
   selector not worth the complexity — state which and why); the overlay's visual treatment as a
   MODELED GRID-CELL ESTIMATE that is visually DISTINCT from the sample pipeline/results data
   (e.g. dashed line + a color chosen OUTSIDE the Okabe sample-type set {#0072B2,#009E73,#E69F00,
   #56B4E9,#999999}, OUTSIDE brand teal {#0c5454,#0c9cb4}, and OUTSIDE the pipeline set
   {#1e3a5f,#2b6c8a,#4db6c4}); how a null-`weather` month renders (gap, not zero); the
   `time_fidelity` indicator and the "~11–25 km modeled estimate, not a site measurement" label/
   legend copy; tooltip copy + secondary-axis handling; the accessible-summary/aria-label per the
   DESIGN.md "Accessible charts" constitution rule.
(B) **Explorer weather columns** — header labels, cell rendering, the missing-value glyph ("—"),
   and the sortable-column affordance consistent with the existing Phase-0 sortable headers.
   Specify which of the 4 headline vars become columns (recommend a defensible subset if 4 is too
   wide for the table) and the grid-cell-estimate labeling on the header/column group.
(C) **Grid-cell-estimate + fidelity labeling** — the exact user-facing copy and placement for both
   surfaces establishing these are modeled estimates with varying precision.

Set `<design_system_source>DESIGN_MD</design_system_source>` and trace EVERY token to a named
DESIGN.md entry. Honor the Teal Text Restriction (bright teal #0c9cb4 is non-text only; normal-size
label/link text uses deep teal #0c5454). Respect Brand≠Data (no brand teal in data encoding).
    </description>
    <success_criteria>
(SC1) design_spec covers all three deliverables (A/B/C) with concrete token references traceable to
named DESIGN.md entries. (SC2) The overlay color is explicitly chosen from OUTSIDE the Okabe,
brand-teal, and pipeline hex sets, with the chosen hex stated and its WCAG role noted. (SC3)
grid-cell-estimate labeling + `time_fidelity` indicator + null-month rendering are all specified.
(SC4) `<design_system_source>DESIGN_MD</design_system_source>` is set and the Teal Text Restriction
is explicitly honored (no bright-teal normal text prescribed). (SC5) Accessible-chart requirement
(aria-label + data summary) is specified for the overlay.
    </success_criteria>
    <context_files>
DESIGN.md (authoritative — Constitution, Color Tokens, Teal Text Restriction §WCAG, Sample-Type
  Data Palette, Pipeline Stage Colors, Chart tooltip/Data table component rules); T1's frozen schema
  contract (field names/units for both surfaces); the CONTRACT above; brief landmines 1–4
  (metadata-not-results, window aggregate, fidelity, missing-data).
    </context_files>
    <dependencies>broadn-p16-covariate-ui-T1</dependencies>
    <out_of_scope>
Do NOT write implementation code (design_spec only). Do NOT design a map/lat-long surface or the
mailto checkout flow. Do NOT introduce a color that collides with Okabe sample-type, brand teal, or
pipeline hexes. Do NOT prescribe bright teal (#0c9cb4) for any normal-size text.
    </out_of_scope>
    <output_expected>
      <tag>design_spec</tag>
      <must_contain>
        <item>design_system_source: DESIGN_MD</item>
        <item>Overlay treatment (line style + non-colliding color hex) + variable-selection UX decision</item>
        <item>Explorer column spec (labels, "—" missing glyph, sort affordance)</item>
        <item>Grid-cell-estimate + fidelity labeling copy for both surfaces</item>
        <item>Accessible-chart (aria-label + summary) spec for the overlay</item>
      </must_contain>
      <must_not_contain>
        <item>Any raw hex that equals an Okabe/brand-teal/pipeline value used for the overlay; bright teal as normal text; implementation code</item>
      </must_not_contain>
      <success_signal>design_spec present covering A/B/C with DESIGN_MD-traced tokens and a non-colliding overlay color</success_signal>
    </output_expected>
  </task_packet>

  <task_packet>
    <task_id>broadn-p16-covariate-ui-T3</task_id>
    <assigned_to>frontend</assigned_to>
    <priority>HIGH</priority>
    <description>
Implement the slice-view temporal weather overlay per T2's design_spec, reading
`slice_views.*.temporal[].weather` (baked by T1). This is the primary sprint surface (2a).

**Render-site anchors (REV1 — critical):**
- **PRIMARY overlay site = the `temporal_bar` widget renderer**, `WIDGET_RENDERERS['temporal_bar']`
  at `assets/app.js:2404`. This is the LIVE on-open path: `USE_RENDER_SLICE = true` (:114) makes
  `renderProjectView`/`renderLocationView`/`renderLabGroupView` (:3585/:3721/:3902) short-circuit to
  `renderSlice(descriptor, entry, grid)` (:2627), which dispatches to `WIDGET_RENDERERS[widget.type]`
  (:2646). `temporal_bar` is present in `data/project-layouts.json` for every slice, so this renders
  when a slice is opened cold. The inline constructors at :3671/:3806/:3988 are DEAD fallback — do
  not treat them as the primary site.
- **SECONDARY overlay site = `updateSliceCharts(category, chartData)`** (:552), the tag-filter
  re-render path (reached from `applyFilter` at :799). Apply the overlay here too so it survives a
  tag-driven re-render — BUT see graceful-degrade below.
- Re-anchor by function/renderer name — line numbers may drift.

**Overlay behavior:**
- Add a SECOND Chart.js dataset (line) over the existing bar dataset, driven by the per-month
  `weather` value for the selected variable. The value already rides in the temporal buckets
  (`data.json` after T1) — do not re-fetch or re-aggregate client-side.
- **Graceful no-overlay when weather is absent (REV1 WARNING 1):** in tag-active mode the temporal
  buckets are reconstructed client-side by `mergeTagChartData` (:498, called at :799) which carries
  NO `weather` key. Whenever the temporal buckets lack a `weather` field (tag mode, or any slice
  with all-null weather), render the chart with NO overlay dataset — no thrown error, no broken
  chart, no NaN. Full weather-in-tag-mode is OUT OF SCOPE; graceful absence is the requirement.
- Implement the variable selector (or default-to-temp) exactly as T2 specifies.
- Null-`weather` months (within a slice that otherwise has weather) render as a GAP (null data
  point / `spanGaps:false`), never a broken chart, never zero, never NaN.
- Apply T2's grid-cell-estimate visual treatment + label/legend + `time_fidelity` indicator +
  aria-label/accessible summary. Tooltip per DESIGN.md Chart tooltip rules. **Chart.js accessor
  rule:** for `type:'bar'`/`type:'line'` the tooltip value is `ctx.parsed.y` (NOT `ctx.parsed` —
  that returns `{x,y}` and prints `[object Object]`; verify the constructor's `type:`, not a
  comment — recurring p5-p6 §6 finding).
- Vanilla ES5-style JS (`var`/`function`), Tailwind CDN, Chart.js. No new deps, no build step.
    </description>
    <success_criteria>
Auditor verifies via HEADLESS BROWSER: (SC1) **opening a slice COLD (initial on-open render via the
`temporal_bar` widget renderer, NOT after any tag toggle) shows the temporal chart WITH the weather
overlay for the default variable, ZERO console errors** — the headless walk must open a slice fresh
and assert the overlay is present. (SC2) if a selector is present, switching variables re-renders
the overlay correctly; if default-only, temp renders. (SC3) a slice whose temporal series contains a
null-`weather` month renders cleanly (visible gap, no thrown error, no NaN/`[object Object]` in
tooltip). (SC4) the overlay carries an aria-label + accessible data summary and a visible
grid-cell-estimate label + fidelity indicator. (SC5) existing slice charts (bars, donuts, pipeline)
render unchanged — zero on-load regression. (SC6) grep guard: the overlay color is NOT any Okabe
hex, brand-teal hex, or pipeline hex (matches the T2 chosen non-colliding value). (SC7) no new JS
dependency / no build step introduced. (SC8) **with a tag filter ACTIVE (temporal reconstructed by
`mergeTagChartData` without `weather`), the chart renders with NO overlay and ZERO console errors /
no broken chart** — graceful degradation verified in the headless walk.
    </success_criteria>
    <context_files>
assets/app.js (PRIMARY edit: `WIDGET_RENDERERS['temporal_bar']` at :2404, dispatched by
  `renderSlice` :2627 via `renderProjectView`/`renderLocationView`/`renderLabGroupView`
  :3585/:3721/:3902; SECONDARY edit: `updateSliceCharts` :552 tag re-render path;
  `mergeTagChartData` :498/:799 is the no-weather source to degrade against — re-anchor by name);
  data/project-layouts.json (confirms `temporal_bar` widget is the live path per slice — read-only);
  index.html (variable selector control near the slice temporal chart, if T2 specifies one); T2
  design_spec; T1 frozen schema contract; DESIGN.md (Chart tooltip, Accessible charts, Teal Text
  Restriction).
    </context_files>
    <dependencies>broadn-p16-covariate-ui-T1, broadn-p16-covariate-ui-T2</dependencies>
    <out_of_scope>
Do NOT touch the Explorer path (`computeExplorerFiltered`, `renderTable`, CSV export, sort map) —
that is T4. Do NOT attempt to reconstruct/aggregate weather in tag-active mode (the
`mergeTagChartData` path) — graceful NO-overlay is the requirement, full tag-mode weather is out of
scope. Do NOT edit the dead inline temporal constructors at :3671/:3806/:3988 as the primary site.
Do NOT re-fetch or client-side-aggregate covariates for the cold-open path (the weather value is
already in `data.json`). Do NOT add a build step, bundler, framework, or new JS dependency. Do NOT
use bright teal (#0c9cb4) for normal text or any Okabe/brand/pipeline hex for the overlay. Do NOT
display lat/long or add a map. Do NOT modify `data.json` or `preprocess_data.py`.
    </out_of_scope>
    <estimated_new_lines>70-100 (overlay dataset in the temporal_bar widget renderer + secondary updateSliceCharts hook + graceful no-weather guard + selector + labeling + null-gap handling). At/under the 100-line FE guideline; kept separate from T4 to stay atomic and bound the diff.</estimated_new_lines>
    <output_expected>
      <tag>ui_packet</tag>
      <must_contain>
        <item>Overlay wired into WIDGET_RENDERERS['temporal_bar'] (primary) + updateSliceCharts (secondary), driven by temporal[].weather</item>
        <item>Graceful no-overlay guard when temporal buckets lack weather (tag-active mode); null-month gap handling</item>
        <item>grid-cell-estimate label + fidelity indicator + aria-label/accessible summary</item>
        <item>Headless-browser evidence: overlay present on COLD slice open, no console errors; tag-active mode degrades to no-overlay cleanly</item>
      </must_contain>
      <must_not_contain>
        <item>Any Explorer-path edit; weather reconstruction in tag mode; edits to the dead inline constructors as primary; client-side covariate fetch for cold open; new JS dep or build step; bright-teal normal text; ctx.parsed (non-.y) accessor on the bar/line tooltip</item>
      </must_not_contain>
      <success_signal>Headless: cold slice open shows weather overlay (no console errors); null-month renders as gap; tag-active mode shows no-overlay without error; existing charts unchanged</success_signal>
    </output_expected>
  </task_packet>

  <task_packet>
    <task_id>broadn-p16-covariate-ui-T4</task_id>
    <assigned_to>frontend</assigned_to>
    <priority>NORMAL</priority>
    <description>
Implement the Explorer per-row weather column(s) per T2's design_spec, reading
`all_samples[].covariates` (baked by T1). This is the human's explicitly "optional" second surface
(2b); it is delivered this sprint.

- Add the column(s) THROUGH the single DRY path (the p13 contract): the new fields must flow through
  `computeExplorerFiltered(samples)` (brief-verified `assets/app.js:1549`) → `renderTable` (pagination)
  → the CSV export builder → the sort-key map, so the filtered view, CSV, and sort order stay
  identical. Re-anchor by function name. Do NOT add a parallel filter/sort path.
- Add the matching sortable `<th>` header(s) in `index.html` (consistent with the existing Phase-0
  `<button data-sort-key>` in `<th aria-sort>` pattern) per T2.
- Missing covariates (`covariates: null` — 733 samples) render as the T2 missing glyph ("—") in
  both the table AND the CSV — never `undefined`/`null`/`NaN`.
- Apply T2's grid-cell-estimate labeling on the column header/group.
- **Zero on-load regression:** the Explorer ships with a NEUTRAL default sort (no reorder on load).
  New columns MUST NOT change the default first-paint order or column layout in a way that reads as
  a regression. Sorting on a new weather column is available but not the default.
- Vanilla ES5-style JS, Tailwind CDN. No new deps, no build step.
    </description>
    <success_criteria>
Auditor verifies via HEADLESS BROWSER: (SC1) the Explorer renders the new weather column(s) with
values matching `data.json` for spot-checked rows. (SC2) rows with `covariates: null` show the "—"
glyph in the table (no `undefined`/`NaN`). (SC3) CSV export includes the new column(s) with values
matching the table, and "—"/empty for missing — table and CSV identical (DRY). (SC4) sorting on a
weather column reorders the table correctly AND the exported CSV reflects the same order (single
sort source). (SC5) on-load default sort/order and column layout are unchanged vs. pre-sprint (no
regression). (SC6) grep/structural guard: no second/parallel Explorer filter or sort function was
introduced — the new fields flow through `computeExplorerFiltered` only. (SC7) no new JS dep / build
step.
    </success_criteria>
    <context_files>
assets/app.js (edit `computeExplorerFiltered` + `renderTable` + CSV builder + sort map — re-anchor
  by function name); index.html (Explorer table `<th>` headers region); T2 design_spec; T1 frozen
  schema contract; DESIGN.md (Data table component rule).
    </context_files>
    <dependencies>broadn-p16-covariate-ui-T1, broadn-p16-covariate-ui-T2, broadn-p16-covariate-ui-T3</dependencies>
    <out_of_scope>
Do NOT touch the slice overlay code (`WIDGET_RENDERERS['temporal_bar']`, `renderSlice`,
`updateSliceCharts`) — that is T3. Do NOT add a parallel Explorer filter/sort/CSV path — reuse
`computeExplorerFiltered` as the single source of truth. Do NOT change the neutral default sort or
first-paint column layout. Do NOT add a build step, bundler, framework, or new JS dependency. Do NOT
display lat/long or add a map. Do NOT modify `data.json` or `preprocess_data.py`.
    </out_of_scope>
    <estimated_new_lines>50-70 (2-4 columns × table/CSV/sort/header + missing-glyph). Under the 100-line FE guideline; serialized after T3 on the shared files app.js/index.html.</estimated_new_lines>
    <output_expected>
      <tag>ui_packet</tag>
      <must_contain>
        <item>New weather column(s) flowing through computeExplorerFiltered + renderTable + CSV + sort map</item>
        <item>"—" missing glyph in table and CSV for null covariates</item>
        <item>Headless-browser evidence: columns render, CSV matches table, sort works, default order unchanged</item>
      </must_contain>
      <must_not_contain>
        <item>A parallel Explorer filter/sort path; changed default sort; new JS dep or build step; undefined/NaN in cells</item>
      </must_not_contain>
      <success_signal>Headless browser: Explorer weather columns render, CSV matches table, sort consistent, missing shows "—", zero on-load regression</success_signal>
    </output_expected>
  </task_packet>

  </task_packets>

  <dependency_order>
    T1 (BE, BLOCKER) → T2 (UI-designer) → T3 (FE overlay) → T4 (FE Explorer)
    - T2 hard-depends on T1 (builds against the frozen schema contract).
    - T3 hard-depends on T1 (data) + T2 (design).
    - T4 hard-depends on T1 + T2, and is SERIALIZED after T3 because both edit the shared files
      `assets/app.js` and `index.html` (different functions/regions, but same files — parallel
      edits risk merge conflict + the auditor false-FAIL documented in broadn-p4/p5-p6 §6).
    - Critical path: T1 → T2 → T3 → T4. No two tasks can run truly in parallel given the schema
      dependency and the single-file FE constraint.
  </dependency_order>

  <routing_notes>
    - **REV1 render-path correction (T3):** the live on-open slice temporal chart is built by
      `WIDGET_RENDERERS['temporal_bar']` (app.js:2404) via the declarative `renderSlice` path
      (`USE_RENDER_SLICE=true`), NOT by `updateSliceCharts` (:552, which is only the tag re-render).
      T3 now targets :2404 as PRIMARY and :552 as SECONDARY, with a mandatory graceful-degrade when
      weather is absent (tag-active `mergeTagChartData` path carries no `weather`).

    - **DESIGN.md present** at `/home/jhber/projects/broadn-web-view/DESIGN.md` (v2.0.0). T2
      (UI-designer) MUST set `<design_system_source>DESIGN_MD</design_system_source>` and trace all
      tokens to named entries; the Teal Text Restriction (§WCAG) is binding on T3+T4 and verified by
      the auditor. Included in context_files for T2/T3/T4.

    - **prior_approved_tasks (single-file sequential FE — REQUIRED for T4 audit):** T4 is NOT the
      first task to touch `assets/app.js` / `index.html` in this sprint — T3 edits both first. When
      dispatching the T4 audit, ORC MUST populate the audit brief's `<prior_approved_tasks>` block:
      "T3's additions to `assets/app.js` (the `WIDGET_RENDERERS['temporal_bar']` + `updateSliceCharts`
      weather-overlay dataset + selector) and to `index.html` (the overlay variable selector, if
      present) are already in the files and were pre-audited under T3. Audit only the T4-specific
      Explorer delta." Applies the recurring p4/p5-p6 §6 finding (see recurring_pattern block).

    - **Determinism correction (Critic-confirmed):** the brief's recalled `json.dump(sort_keys=True,...)`
      is WRONG. On disk (`preprocess_data.py:1646`) it is `json.dump(output, f, indent=2,
      ensure_ascii=False)` — no `sort_keys`, and `allow_nan` defaults True. T1 preserves this verbatim
      AND coerces NaN/Infinity → null (WARNING 3). The auditor determinism gate is
      `python scripts/preprocess_data.py && git diff --exit-code data/data.json` (exit 0).

    - **build_temporal is shared (WARNING 2):** T1 parametrizes it (`covariates_index=None`) so
      `weather` bakes only at slice call sites; the :1532 global temporal call stays unchanged. SC7
      guards that the root-level `temporal[]` gains no `weather`.

    - **Overlap opportunity (soft):** T2 needs only T1's frozen SCHEMA section (authored first in
      T1's output), not the full regenerated bytes. ORC MAY dispatch T2 as soon as T1 publishes the
      schema contract — but T2 remains a hard dependent of T1 to prevent schema drift.

    - **Relevant critics/auditor gates:** SA (DESIGN.md token tracing + Teal restriction + DRY
      single-source Explorer path), QA (headless-browser cold-open + tag-active walks for T3, table/
      CSV/sort for T4, deterministic offline data.json rebuild + no-NaN token for T1), SX (no new
      deps, no runtime backend, static-site constitution intact).

    - **`sc-precheck-report`:** the PM runtime here has no Bash tool, so the automated
      `.claude/skills/sc-locked-value-consistency` script could not be executed. A manual
      locked-value self-lint was performed (written to
      `.claude/tasks/outputs/broadn-p16-covariate-ui-PM-sc-precheck.json`, `method:"manual-pm-scan"`,
      no unsatisfiable locked-value SC found). Critic accepted the manual scan for REV0; ORC/harness
      may still run the mechanical script before dispatch.

    - **Human "optional" qualifier surfaced:** the PI called the Explorer weather columns (2b)
      "optional." The plan DELIVERS both surfaces (2b = T4, priority NORMAL). If scope must be cut
      under time pressure, T4 is the human-designated droppable surface — but it is NOT dropped here.
  </routing_notes>

  <risk_flags>
    - **Audit-env dependency:** the T1 determinism gate reruns `python scripts/preprocess_data.py`,
      which requires `pandas`/`openpyxl` and `Bdb-317.xlsx` (present on-branch, glob-confirmed). If
      the audit environment lacks pandas/openpyxl, the byte-stable rebuild check cannot run — ORC
      should confirm the audit env has them, or the auditor falls back to a structural (jq/python)
      schema+null+no-NaN check on the committed `data.json`.
    - **NaN-token file corruption (WARNING 3, mitigated):** an unguarded empty mean would serialize
      as the bare token `NaN` (allow_nan defaults True) and break `JSON.parse` of the ENTIRE
      data.json at runtime. Mitigated by T1 step 4 + SC2 (coerce to null; grep asserts zero
      `NaN`/`Infinity` tokens). Auditor must run the token grep, not just a Python json.load (Python
      accepts `NaN` by default; the browser does not).
    - **Payload growth:** headline-set-only bake keeps growth within the ≤1.2MB guard (SC5). If
      growth exceeds the guard, trim to fewer per-sample fields before shipping.
    - **Single-file FE contention:** T3 and T4 both edit `assets/app.js` + `index.html`. Mitigated
      by serialization (T4 after T3) + the prior_approved_tasks note. Parallel dispatch would risk a
      merge conflict and/or auditor false-FAIL (the exact p4/p5-p6 pattern).
    - **Render-path drift (WARNING 1/BLOCKER, mitigated):** the live overlay site is the declarative
      `temporal_bar` widget renderer, not `updateSliceCharts`. If T3 only patched `updateSliceCharts`
      the overlay would be invisible on cold slice open. Mitigated by the re-anchored T3 + the
      cold-open SC1. Auditor must open a slice FRESH (no tag toggle) to verify.
    - **Metadata-not-results (HARD):** covariates are ~11–25km modeled grid-cell estimates, NOT site
      measurements. Weak/absent estimate labeling is a scientific-integrity FAIL. Encoded in T2
      SC2/SC3 + T3 SC4 + T4 grid-label requirement.
    - **Recalled facts to re-verify at implementation:** app.js line anchors are brief/Critic-verified
      this session but may drift — all packets instruct re-anchoring by function/renderer name.
  </risk_flags>
</task_decomposition>

---

## Recurring-pattern preflight (Step 0.5)

Sources scanned: `docs/after-actions/*` (broadn-teal-rebrand, broadn-p12-altitude-single-rail — no
Section 6 rows matching the marker set) and `docs/post-mortems/*` (broadn-p4, broadn-p5-p6 §6 carry
the relevant single-file pattern). `~/projects/gander-studio-alpha/docs/after-actions/` does not
exist (no rows).

<recurring_pattern source="broadn-p4.md">Sequential single-file sprint: auditor diffs against full
git HEAD and false-FAILs prior-task changes as out-of-scope unless the audit brief names
prior-approved tasks. Fix = `<prior_approved_tasks>` block in the audit brief.</recurring_pattern>
→ **Avoided:** T3 and T4 both touch `app.js`/`index.html`; they are SERIALIZED (T4 after T3) and the
routing_notes mandate ORC populate `<prior_approved_tasks>` for the T4 audit naming T3's additions.

<recurring_pattern source="broadn-p5-p6.md">Same prior_approved_tasks omission recurred in p5; and
PM initial decompositions repeatedly ship without (a) static content the FE cannot derive and (b)
prior_approved_tasks notes — both had to be re-surfaced by the Critic.</recurring_pattern>
→ **Avoided:** (a) the full baked-covariate schema (field names/units/rounding/null-rules) is
embedded verbatim in this plan as THE CONTRACT so FE/UI invent nothing; (b) prior_approved_tasks is
declared proactively above.

<recurring_pattern source="broadn-p5-p6.md">Stale chart-type comments → wrong `ctx.parsed` accessor
on bar/line tooltips prints `[object Object]`.</recurring_pattern>
→ **Avoided:** T3 description encodes the Chart.js accessor rule (verify `type:` at the constructor;
use `ctx.parsed.y` for bar/line) and T3 must_not_contain forbids the bare `ctx.parsed` accessor.

---

## Verbatim deliverable audit (Step 7)

<verbatim_deliverable_audit>
  <phrase text="surface the window covariates in the UI"><addressed task="broadn-p16-covariate-ui-T1, T3, T4"/></phrase>
  <phrase text="weather overlay on the slice-view temporal charts (2a)"><addressed task="broadn-p16-covariate-ui-T3"/></phrase>
  <phrase text="per-row weather columns in the Data Explorer (2b)"><addressed task="broadn-p16-covariate-ui-T4"/></phrase>
  <phrase text="optional (per-row weather columns qualifier)"><addressed task="broadn-p16-covariate-ui-T4"/> (human's "optional" qualifier surfaced in routing_notes; delivered, not dropped)</phrase>
  <phrase text="window covariates / WINDOW aggregate (not point-in-time, not covariates_daily)"><addressed task="broadn-p16-covariate-ui-T1"/></phrase>
  <phrase text="no new enrichment"><out_of_scope reason="explicitly OUT; enforced in T1 out_of_scope (no Open-Meteo, no enrich_covariates.py edit)"/></phrase>
  <phrase text="no backend"><out_of_scope reason="build-time bake only; no runtime backend; enforced across T1/T3/T4 out_of_scope"/></phrase>
  <phrase text="build-time bake of covariate summaries into data.json"><addressed task="broadn-p16-covariate-ui-T1"/></phrase>
  <phrase text="define exact baked-covariate schema (contract)"><addressed task="broadn-p16-covariate-ui-T1"/> (pinned in this plan; frozen in T1 output)</phrase>
  <phrase text="time_fidelity flag exposure (3050 date_only)"><addressed task="broadn-p16-covariate-ui-T1 (baked), T2 (design), T3/T4 (render)"/></phrase>
  <phrase text="grid-cell-estimate / fidelity labeling, visually distinct from pipeline data"><addressed task="broadn-p16-covariate-ui-T2 (design), T3/T4 (render)"/></phrase>
  <phrase text="graceful missing-data rendering (733 samples with no covariates)"><addressed task="broadn-p16-covariate-ui-T1 (null contract), T3/T4 (— / gap render)"/></phrase>
  <phrase text="DRY Explorer path (one filter source of truth)"><addressed task="broadn-p16-covariate-ui-T4"/></phrase>
  <phrase text="zero on-load regression + neutral default sort preserved"><addressed task="broadn-p16-covariate-ui-T4 (Explorer), T3 (existing charts unchanged)"/></phrase>
  <phrase text="determinism of regenerated data.json (byte-stable offline rebuild)"><addressed task="broadn-p16-covariate-ui-T1"/></phrase>
  <phrase text="static-site constitution (no build step/new deps, vanilla ES5, Tailwind CDN + Chart.js)"><addressed task="broadn-p16-covariate-ui-T3/T4 out_of_scope + SC7"/></phrase>
  <phrase text="honor BROADN brand + DESIGN.md Teal Text Restriction"><addressed task="broadn-p16-covariate-ui-T2 (design_system_source DESIGN_MD), T3/T4 (verified by auditor)"/></phrase>
  <phrase text="Chart.js overlay dataset on the temporal chart"><addressed task="broadn-p16-covariate-ui-T3 (WIDGET_RENDERERS['temporal_bar'] :2404 primary, updateSliceCharts :552 secondary)"/></phrase>
  <phrase text="Explorer columns flowing through computeExplorerFiltered/renderTable/CSV/sort"><addressed task="broadn-p16-covariate-ui-T4"/></phrase>
  <phrase text="UI-designer MUST precede FE"><addressed task="dependency_order: T2 → T3 → T4"/></phrase>
  <phrase text="new Open-Meteo calls"><out_of_scope reason="explicitly OUT per brief scope"/></phrase>
  <phrase text="mailto checkout flow"><out_of_scope reason="Phase 5, needs backend; explicitly OUT"/></phrase>
  <phrase text="map / lat-long display"><out_of_scope reason="explicitly OUT; T1 does not bake lat/long; T3/T4 forbid map"/></phrase>
</verbatim_deliverable_audit>

---

## Expectation manifest

<expectation_manifest>
  <sprint_id>broadn-p16-covariate-ui</sprint_id>
  <generated>2026-07-07 (REV1)</generated>
  <assignments>
    <assignment>
      <task_id>broadn-p16-covariate-ui-T1</task_id>
      <agent>BE#1</agent>
      <expected_tag>data_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/broadn-p16-covariate-ui-T1-BE-*.md</expected_file>
      <blocks>T2, T3, T4</blocks>
      <receipt_check>
        <item>Frozen schema contract (both per-sample + per-slice) present verbatim in the packet</item>
        <item>Determinism confirmed: preprocess rerun → git diff --exit-code data.json == 0</item>
        <item>covariates:null count == 733; non-null ~3836; grep for NaN/Infinity tokens in data.json == 0</item>
        <item>Root-level temporal[] has NO weather key (build_temporal parametrized; :1532 call unchanged)</item>
        <item>data.json size growth ≤ 1.2MB; no lat/long/provenance/covariates_daily baked</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>broadn-p16-covariate-ui-T2</task_id>
      <agent>UI#1</agent>
      <expected_tag>design_spec</expected_tag>
      <expected_file>.claude/tasks/outputs/broadn-p16-covariate-ui-T2-UI-*.md</expected_file>
      <blocks>T3, T4</blocks>
      <receipt_check>
        <item>design_system_source: DESIGN_MD present</item>
        <item>Overlay color explicitly outside Okabe/brand-teal/pipeline hex sets (hex stated)</item>
        <item>All three deliverables (overlay / Explorer columns / grid-estimate+fidelity labeling) covered</item>
        <item>Teal Text Restriction honored (no bright-teal normal text prescribed)</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>broadn-p16-covariate-ui-T3</task_id>
      <agent>FE#1</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/broadn-p16-covariate-ui-T3-FE-*.md</expected_file>
      <blocks>T4 (shared-file serialization)</blocks>
      <receipt_check>
        <item>Overlay wired into WIDGET_RENDERERS['temporal_bar'] (:2404 primary) + updateSliceCharts (:552 secondary)</item>
        <item>Headless-browser evidence: overlay present on COLD slice open (no tag toggle), zero console errors</item>
        <item>Tag-active mode (mergeTagChartData, no weather) degrades to no-overlay without error/broken chart</item>
        <item>Null-weather month renders as a gap (no NaN/[object Object]); aria-label + accessible summary + grid-estimate label present</item>
        <item>Overlay color matches T2's non-colliding hex; no bright-teal normal text; existing charts unchanged</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>broadn-p16-covariate-ui-T4</task_id>
      <agent>FE#2</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/broadn-p16-covariate-ui-T4-FE-*.md</expected_file>
      <blocks>NONE</blocks>
      <receipt_check>
        <item>New fields flow through computeExplorerFiltered + renderTable + CSV + sort (single source)</item>
        <item>Missing covariates render "—" in both table and CSV (no undefined/NaN)</item>
        <item>Headless-browser: CSV matches table, sort consistent, default sort/layout unchanged</item>
        <item>No parallel Explorer filter/sort path introduced; no new dep/build step</item>
        <item>Audit dispatched WITH prior_approved_tasks naming T3's app.js/index.html additions</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>
