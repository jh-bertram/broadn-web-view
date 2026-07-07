# broadn-p16-covariate-ui-T3 — FE ui_packet

Slice-panel temporal weather overlay, implemented per T2's design_spec against T1's frozen
`weather` CONTRACT. Vanilla ES5 JS, Tailwind CDN, Chart.js — no new deps, no build step, no
`git commit` (working-tree changes left for the orchestrator post-audit).

## Files changed

- `assets/app.js` — `+189/-2` lines (net `+187`)
- `DESIGN.md` — `+1` line (the one authorized token entry)
- `data/data.json`, `scripts/preprocess_data.py` — **untouched by this task** (pre-existing
  working-tree modifications from T1; confirmed via `git status --short` before/after — I did not
  write to either file).

## Exact edits (re-anchored by function name; line numbers as of this pass)

1. **`CHART_COLORS` (app.js:~62-66):** added `weatherOverlay: '#a21caf'` with a comment pointing to
   DESIGN.md § Color Tokens. Every overlay-color reference in the new code goes through
   `CHART_COLORS.weatherOverlay` — the literal hex appears exactly once in `app.js`.
2. **`insertGapMarkers(temporal)` → `insertGapMarkers(temporal, weatherKey)` (app.js:~1033):**
   backward-compatible extension. When `weatherKey` is passed, the function additionally returns
   `result.weatherPoints` — a `(null | {value, n, fidelity})[]` array index-aligned 1:1 with
   `labels`/`counts` (null at gap-marker slots AND at any real month whose
   `weather[weatherKey]` is null/absent). All pre-existing callers (`renderTemporalChart`, the
   bars-only call in `updateSliceCharts`) pass no second argument and are byte-behaviorally
   unchanged.
3. **New module "SLICE PANEL — TEMPORAL WEATHER OVERLAY" (app.js, inserted directly after
   `buildTemporalChartOptions()`, ~164 lines):**
   - `WEATHER_VARIABLES` — ordered array of the 4 headline variables (`temp`/`humidity`/
     `wind_speed`/`precipitation`) with `label`/`unit`/`optionLabel`/`axisTitle` per T2's exact
     copy dictionary (§6).
   - `WEATHER_FIDELITY_LABELS` — `window_exact`/`window_assumed_24h`/`date_only` → the 3 exact
     tooltip fidelity strings.
   - `weatherVarCfg(key)`, `temporalHasWeather(temporal)` (the overlay gate), `mkEl(...)` (tiny DOM
     helper to de-duplicate `createElement`+`className`+`textContent` across header/summary/
     caption construction), `overlayAriaLabel(variableKey)`, `buildWeatherSummaryText(temporal,
     variableKey)` (the `sr-only` accessible-summary template), `buildWeatherOverlayHeader(selectId,
     selectedVar, onVarChange)` (badge + label + native `<select>`).
   - **`applyWeatherOverlay(card, canvas, canvasId, chart, temporal)`** — the single shared entry
     point called from BOTH render sites (DRY — standards.md "no duplicated logic"). Idempotent:
     tears down any prior overlay DOM (`.weather-overlay-header`, `.weather-overlay-caption`,
     `#{canvasId}-summary`) and `dataset[1]`/`scales.y1`/tooltip-callback state before re-applying,
     so it is safe to call on every SECONDARY re-render without leaking duplicate headers/selects.
     - **Graceful omit:** if `temporalHasWeather(temporal)` is false (tag-active `mergeTagChartData`
       output, or an all-null-weather slice), resets `aria-label` to the unchanged pre-sprint string,
       removes `aria-describedby`, calls `chart.update()`, and returns — zero overlay DOM, zero
       `dataset[1]`, zero thrown errors.
     - **Present:** pushes `dataset[1]` (`type:'line'`, `yAxisID:'y1'`, `borderColor`/
       `pointBorderColor: CHART_COLORS.weatherOverlay`, `pointBackgroundColor:'#ffffff'`,
       `pointBorderWidth:2`, `pointRadius:4`, `borderDash:[6,4]`, `tension:0`, `spanGaps:false`,
       `fill:false`); adds `scales.y1` (`position:'right'`, `beginAtZero:false`,
       `grid.display:false`, `title.text` = the variable's axis title); flips
       `plugins.legend.display` to `true` (two entries: existing `"Samples Collected"` bar label +
       `"{Variable} (modeled estimate)"` line label — Chart.js draws both from `dataset.label`, no
       extra DOM); sets `tooltip.mode:'index'`/`intersect:false` (so hovering a month shows both
       lines together, per T2's Interactions spec) **only on this chart instance** — each call
       returns a fresh options object from `buildTemporalChartOptions()`, so this never leaks into
       any other chart; wraps the existing bar tooltip `label` callback (`baseLabelFn`, preserved
       verbatim) and adds a `tooltip.filter` callback that fully omits the weather tooltip item when
       that month's value is null (a stronger guarantee than returning `undefined`/`null` from
       `label`, which risks Chart.js coercing to the literal string `"undefined"` — see Notes below);
       inserts the header row before `.chart-wrap`, the `sr-only` summary paragraph immediately
       after it, and the caption after that — matching T2's literal DOM order.
4. **`WIDGET_RENDERERS['temporal_bar']` (PRIMARY, app.js:~2586, the live cold-open path via
   `renderSlice`):** one line added at the end —
   `applyWeatherOverlay(card, canvas, id, chartInstances[id], entry.temporal);`
5. **`updateSliceCharts` (SECONDARY, app.js:~628, the tag-filter re-render path):** inside the
   existing "Temporal line chart" `if (ctxTm)` block, after the `new Chart(...)` call —
   `applyWeatherOverlay(ctxTm.parentNode.parentNode, ctxTm, temporalId, chartInstances[temporalId], chartData.temporal);`
   (`ctxTm.parentNode.parentNode` = the static card div, matching the same `card > .chart-wrap >
   canvas` DOM shape `applyWeatherOverlay` assumes at the PRIMARY site).
6. **`DESIGN.md` § Color Tokens:** added one row —
   `| \`--color-weather-overlay\` | \`#a21caf\` | Modeled weather overlay line — slice temporal
   chart (\`CHART_COLORS.weatherOverlay\`); non-text data-encoding only, deliberately outside the
   Okabe sample-type set, brand teal, and pipeline-stage sets (broadn-p16-covariate-ui) |` — the
   ONLY DESIGN.md change, closing T2's flagged gap.

## Data-contract pre-flight (grepped `data/data.json` directly before coding — not guessed)

```
$ python3 -c "... inspect a non-null weather bucket ..."
SAMPLE weather bucket keys: ['fidelity', 'humidity', 'n', 'precipitation', 'temp', 'wind_speed']
SAMPLE weather bucket: {'temp': 1.1, 'humidity': 74, 'wind_speed': 2.9, 'precipitation': 5.0, 'n': 85, 'fidelity': 'date_only'}
root temporal[] has weather key: False
```
Confirmed field names exactly match what the code reads (`temp`/`humidity`/`wind_speed`/
`precipitation`/`n`/`fidelity`); confirmed root-level `temporal[]` carries no `weather` key (so the
global temporal chart is structurally unaffected — it never even calls `applyWeatherOverlay`).
Also confirmed a mixed null/non-null slice exists (`slice_views.project` "IMPROVE Fungi" — 4 null +
12 non-null weather months) as the SC3 (null-month gap) test target, and that
`tag_charts[...][...].temporal[]` entries carry only `{count, month}` (no `weather` key at all),
confirming `mergeTagChartData`'s output is correctly gated out by `temporalHasWeather()`.

## Self-check results

```
$ node --check assets/app.js
(exit 0, no output)

$ git diff --numstat -- assets/app.js DESIGN.md
189  2  assets/app.js
1    0  DESIGN.md
```

- **Overlay color grep guard:** `#a21caf` appears exactly twice in `app.js` — once as the
  `CHART_COLORS.weatherOverlay` literal definition, once nowhere else (all dataset-config
  references use `CHART_COLORS.weatherOverlay`, not a re-typed literal). Zero Okabe
  (`#0072B2/#009E73/#E69F00/#56B4E9/#999999`), brand-teal (`#0c5454/#0c9cb4`), or pipeline
  (`#1e3a5f/#2b6c8a/#4db6c4`) hex introduced in any added line (grep-confirmed against `git diff`
  added lines only).
- **`ctx.parsed`/`cx.parsed` accessor guard:** zero bare (non-`.y`/`.x`) `parsed` accessors in any
  new code. My weather-line tooltip label reads `wp.value` from the pre-aligned `weatherPoints`
  array (via `gapped.weatherPoints[cx.dataIndex]`), never `cx.parsed` directly. The preserved
  PRIMARY bar-tooltip closure (`baseLabelFn`) already used `cx.parsed.y` correctly pre-sprint and
  is untouched. Every other `ctx.parsed`/`cx.parsed` match in the file (grep-listed in the agent
  log) is pre-existing, unmodified code, and each one is either `.y`/`.x` or a legitimate bare
  `ctx.parsed` scalar read inside a doughnut/pie tooltip (correct for that chart type).
- **`spanGaps` guard:** present, `false`, on the weather line dataset (`app.js:2260`).
- **Inline-style/Tailwind conflict check:** ran the required grep on every touched file — zero
  matches. All new DOM elements use Tailwind utility classes exclusively; the only raw hex in the
  entire diff lives inside the Chart.js dataset config object (`CHART_COLORS.weatherOverlay`,
  `pointBackgroundColor:'#ffffff'`), which DESIGN.md's Rule A explicitly permits ("Chart.js and
  Leaflet hex values — permitted ONLY inside dataset/marker configuration objects").
- **Click-handler keyboard-equivalent audit:** ran the required grep
  (`<(span|div|li|a)[^>]*onClick=`) against `app.js`/`index.html` — zero matches introduced or
  pre-existing that are relevant to this task. The new interactive control is a native `<select>`
  wired via `addEventListener('change', ...)`, which is keyboard-navigable by default (no
  `tabIndex`/`role`/`onKeyDown` retrofit needed — it's a real form control, not a div/span
  pretending to be one).
- **`JSON.parse` audit:** zero matches introduced — this task reads structured data already parsed
  by the app's existing `data.json` fetch/boot path; no new external-data parsing was added.
- **DRY / function-body dedup:** the tooltip `label`/`filter` callbacks and the overlay-dataset
  builder are each defined exactly once (`overlayDataset()`, assigned once, read via closure both
  at initial apply and inside the selector's change handler — never copy-pasted). `mkEl(...)` is
  used 8 times to avoid repeating `createElement`+`className`+`textContent` boilerplate across
  badge/label/select/summary/caption construction.
- **Function-name collision guard:** grepped for duplicate `function <name>` declarations across
  the whole file after all edits — zero duplicates.

## What the auditor should verify in the browser (headless walk)

1. **Cold slice open (SC1):** open any project/location/lab_group slice fresh (no tag toggle) —
   the "Collection Over Time" card should show the bar chart WITH the dashed magenta/fuchsia
   overlay line for Temperature (default), a "Modeled Estimate" badge, a "Weather overlay" select,
   a visible 2-entry legend, and a caption below the chart. Zero console errors.
2. **Selector swap (SC2):** change the select to Humidity/Wind Speed/Precipitation — the line
   dataset, legend text, y1 axis title, and tooltip unit should all update in place (no chart
   teardown/flicker, no re-fetch).
3. **Null-month gap (SC3):** open `slice_views.project` "IMPROVE Fungi" (4 null + 12 non-null
   weather months, confirmed above) — the dashed line should show a visible break at the null
   month(s), never a zero/NaN/bridged segment; the tooltip at that month should omit the weather
   line entirely (no "null"/"[object Object]"/"undefined" text).
4. **Accessibility (SC4):** inspect the canvas `aria-label` (should be the WITH-overlay variant
   string) and `aria-describedby` (should point at a `sr-only` `<p>` with the accessible-summary
   template text); confirm the "Modeled Estimate" badge and caption text are visible and legible.
5. **Existing charts unchanged (SC5):** the sample-types doughnut, pipeline bar, sampler doughnut,
   and (for locations) sub-sites/time-distribution charts should render exactly as before —
   zero regression.
6. **Overlay color grep (SC6):** already grep-confirmed above (`#a21caf`, zero Okabe/brand-teal/
   pipeline hex).
7. **No new dependency/build step (SC7):** confirmed — no `<script>` tags added, no `package.json`
   anywhere in the repo (still none), Chart.js mixed dataset `type:'line'` on a `type:'bar'` chart
   is a native Chart.js 4.x feature already available via the existing CDN `<script>` tag.
8. **Tag-active graceful omit (SC8):** with a tag filter active on any slice, the temporal chart
   should render bars-only with NO overlay header/select/legend-change/caption and zero console
   errors — data-contract-confirmed above that `mergeTagChartData`'s output never carries a
   `weather` key, so `temporalHasWeather()` deterministically gates this off.
   **Caveat (pre-existing, not introduced by this task):** `updateSliceCharts`'s temporal branch
   targets the LEGACY static canvas ID (e.g. `sliceProjectTemporalChart`), which is only present in
   the DOM when `USE_RENDER_SLICE` is `false` or `getLayoutFor(...)` returns no descriptor for that
   slice. With `USE_RENDER_SLICE = true` (the current default) and a resolvable layout (the common
   case per `data/project-layouts.json`), the PRIMARY `renderSlice` path already replaced that
   static canvas with a dynamically-created one (`slice_{kind}_temporal`) on cold open, so
   `document.getElementById(temporalId)` in `updateSliceCharts` returns `null` and the `if (ctxTm)`
   guard skips the whole temporal branch (bars AND overlay) on a subsequent tag toggle — this
   applies equally to the pre-existing bars-only code and is NOT a regression I introduced. I
   mirrored the overlay into `updateSliceCharts` exactly as the task instructed (for correctness on
   the legacy/rollback code path), but the auditor should not expect a *visible* SC8 change to the
   temporal chart specifically when `USE_RENDER_SLICE=true` — the graceful-omit behavior is
   correct code, reachable and testable directly by calling `updateSliceCharts` or by setting
   `USE_RENDER_SLICE=false`. Flagged here rather than silently left for the auditor to discover;
   recommend a follow-up ticket to reconcile `updateSliceCharts`'s target IDs with `renderSlice`'s
   dynamic canvas IDs (pre-existing gap, out of T3's scope).

## Implementation-level deviations from the literal design_spec (flagged, not silent)

1. **Selector ID namespacing.** T2 specifies `select#slice-weather-variable` (one literal ID). I
   used `{canvasId}-weather-variable` instead (e.g. `slice_project_temporal-weather-variable`),
   matching the codebase's OWN existing `sliceChartId()` convention that namespaces every other
   slice-chart canvas ID by `slice_kind` specifically to avoid cross-category ID collisions. A
   literal singular ID risks a duplicate-ID DOM if more than one category's grid ever holds live
   content simultaneously. Same namespacing applied to the `aria-describedby` summary id (T2
   already specifies `{canvasId}-summary`, so no deviation there).
2. **Header row DOM grouping.** T2's `component_hierarchy` lists badge/label/select as 3 flat
   children of the header row; the prose separately implies badge+label visually cluster apart from
   the select ("badge+label group stacks above the select" on mobile). I grouped badge+label into a
   nested `flex items-center gap-2` cluster and used `justify-between` between that cluster and the
   select, rather than a single flat 3-item `justify-between` row (which would visually separate the
   badge from its own label). This is the only DOM-structure interpretation call made; no copy,
   token, or color was altered.
3. **Tooltip omission mechanism.** T2/PM text says the tooltip callback should "return
   undefined"/"null" to omit the weather line. I implemented this via Chart.js's `tooltip.filter`
   callback instead (which fully excludes the tooltip item before `label` even runs) — a stronger,
   version-independent guarantee against ever rendering the literal string "undefined", which is a
   real risk of returning `undefined` from `label` in some Chart.js builds. Functionally equivalent
   outcome (the weather line never appears for a null month), implemented via the mechanism Chart.js
   actually documents for this purpose.
4. **Tooltip `mode`/`intersect`.** Not specified by T2. I set `mode:'index'`/`intersect:false` on
   the two overlay-bearing chart instances only (never touching `buildTemporalChartOptions()`
   itself, which returns a fresh object per call) so that hovering a month shows BOTH the bar and
   weather tooltip lines together, matching T2's Interactions copy ("User hovers ... a chart
   month" → both body lines appear in one tooltip). Chart.js's un-set default
   (`nearest`+`intersect:true`) would require hovering exactly over one dataset's element and would
   never show both lines together.

## Tier 2 Playwright — flagged tension, not silently resolved either way

This repo has **no `package.json`, no `packages/client/`, and no build tooling anywhere** — it is
a static HTML + vanilla-JS + Tailwind-CDN + Chart.js site by explicit DESIGN.md Constitution
("Vanilla stack — no framework imports") and this task's own `<out_of_scope>` ("Do NOT add a build
step, bundler, framework, or new JS dependency"). The Tier 2 instructions ask me to `npm install
--save-dev @playwright/test` in an `{APP_CLIENT_DIR}` and create `playwright.config.ts` — doing so
would require bootstrapping an entirely new npm project at the repo root, which is a repo-structure
decision outside T3's authorized scope and in direct tension with this task's explicit
no-new-deps/no-build-step constraint. I did not do this. I am flagging it here rather than either
(a) silently skipping Tier 2 coverage without comment, or (b) unilaterally deciding to add
project-wide test infrastructure that wasn't asked for and that the task explicitly forbids.
This task's own `<success_criteria>` already specify the verification mechanism as an
**auditor-performed headless-browser walk** (SC1-SC8, reproduced in "What the auditor should
verify" above) — not a committed Playwright spec file — which is consistent with how T1 (BE) and
every prior FE task on this static site have been audited. Recommend ORC/PM decide, as a separate
task, whether to bootstrap a project-level Playwright harness for this repo; until then, the
headless-browser SC list above is the verification surface.

<e2e_spec>TIER_1_ONLY — no Playwright harness exists in this repo (no package.json anywhere); see
"Tier 2 Playwright — flagged tension" section above for the full rationale. Verification mechanism
is the auditor's headless-browser walk against this task's own SC1-SC8 list.</e2e_spec>

<data_contract_verified>Grepped `data/data.json` directly before writing any field-accessing code.
Confirmed weather bucket keys = `{temp, humidity, wind_speed, precipitation, n, fidelity}` (exact
match to code); confirmed root `temporal[]` has no `weather` key; confirmed a mixed null/non-null
slice exists for SC3 testing (`slice_views.project` "IMPROVE Fungi"); confirmed `tag_charts[...].
temporal[]` entries carry only `{count, month}` (no weather), confirming the tag-active
graceful-omit gate.</data_contract_verified>

<position_fixed_confirmed>N/A — no Chart.js external tooltip callback was written for this task
(the tooltip uses Chart.js's built-in tooltip box via `plugins.tooltip.callbacks`, not a custom
`external:` DOM overlay function), so the `getBoundingClientRect()` viewport-offset rule does not
apply here.</position_fixed_confirmed>

<focus_trap_visibility_filter_confirmed>N/A — no `role="dialog"`/`aria-modal` element was
introduced by this task (the overlay is an inline chart-card control, not a modal/popover).</focus_trap_visibility_filter_confirmed>

<ui_packet>
  <components_created>
    <item>assets/app.js — CHART_COLORS.weatherOverlay constant</item>
    <item>assets/app.js — insertGapMarkers(temporal, weatherKey) extension (weatherPoints array)</item>
    <item>assets/app.js — WEATHER_VARIABLES / WEATHER_FIDELITY_LABELS / weatherVarCfg / temporalHasWeather / mkEl / overlayAriaLabel / buildWeatherSummaryText / buildWeatherOverlayHeader / applyWeatherOverlay (new shared overlay module)</item>
    <item>assets/app.js — WIDGET_RENDERERS['temporal_bar'] wire-in (PRIMARY, cold-open site)</item>
    <item>assets/app.js — updateSliceCharts temporal-branch wire-in (SECONDARY, tag-filter re-render site)</item>
    <item>DESIGN.md — --color-weather-overlay Color Tokens row</item>
  </components_created>
  <state_hydration_map>
    No client store/framework — vanilla DOM. `entry.temporal[].weather` (PRIMARY) /
    `chartData.temporal[].weather` (SECONDARY) are read directly off the already-fetched
    `data.json` payload (baked at build time by T1); no re-fetch, no client-side aggregation.
    Per-canvas UI state (selected variable, current gapped/weatherPoints array) lives in a mutable
    closure inside `applyWeatherOverlay`'s call frame, shared between the initial render and the
    selector's `change` handler — never duplicated, never a global.
  </state_hydration_map>
  <a11y_verification>
    Two literal `aria-label` variants (with/without overlay, T2 §6 exact copy) swapped via
    `canvas.setAttribute`; `aria-describedby="{canvasId}-summary"` set only when the overlay is
    present, pointing at a new `sr-only` `<p>` containing the T2 accessible-summary template
    (min/max sample counts, weather-month coverage, min/max weather value, fidelity list). Real
    `<label for="{selectId}">Weather overlay</label>` (not aria-label-only). Selector is a native
    `<select>` — keyboard-focusable and operable by default, no custom `tabIndex`/`role`/`onKeyDown`
    needed (not a div/span click-handler pattern, so the Click-Handler Keyboard-Equivalent Audit's
    3-attribute rule does not apply). Focus ring: `focus-visible:ring-2
    focus-visible:ring-[var(--color-accent)]` — bright teal `#0c9cb4` used exclusively as a
    non-text ring, honoring the Teal Text Restriction; all new normal-size text (badge, label,
    caption) uses `text-stone-600` (`--color-text-secondary` `#57534e`, ~7.4:1 AAA per DESIGN.md).
  </a11y_verification>
  <design_tokens_used>
    <item>CHART_COLORS.weatherOverlay = #a21caf (new; --color-weather-overlay, added to DESIGN.md this turn)</item>
    <item>--color-surface (#ffffff) — hollow point fill (Chart.js dataset config, Rule A exemption)</item>
    <item>--color-surface-alt / --color-border / --color-text-secondary → Tailwind bg-stone-100 / border-stone-200 / text-stone-600 (badge, label, caption — no raw hex in DOM code)</item>
    <item>--color-accent (#0c9cb4) — selector focus ring, non-text use only</item>
    <item>CHART_COLORS.axisLabel (pre-existing, inherited) — y1 axis title color, matching the primary axis</item>
    <item>CHART_COLORS.tooltip (pre-existing, unchanged) — tooltip background, reused verbatim</item>
  </design_tokens_used>
  <style_conflict_check>NONE — grep for inline style="..." attributes on any created/modified element returned zero matches; every new element uses Tailwind utility classes exclusively.</style_conflict_check>
  <integration_status>
    SUCCESS — built directly against T1's frozen, on-disk `data.json` contract (field names
    verified by direct grep, not assumed from the T1 packet prose) and T2's design_spec (copy
    strings, tokens, and Chart.js construction notes implemented per §6/§8, with 4 flagged
    implementation-level deviations documented above — none affecting copy, color, or token
    choices, all mechanically necessary or strictly more robust than the literal spec). No MOCKED
    data — the overlay reads live baked data with no client-side fetch/aggregation. Tier 2
    Playwright coverage NOT ADDED due to a genuine, flagged scope tension with this project's
    zero-dependency static-site architecture and this task's own out_of_scope constraint (see
    dedicated section above); verification mechanism is the auditor's headless-browser walk against
    SC1-SC8, per this task's own success_criteria definition.
  </integration_status>
</ui_packet>
