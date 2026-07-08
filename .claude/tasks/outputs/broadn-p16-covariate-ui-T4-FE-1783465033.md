# broadn-p16-covariate-ui-T4 — FE Output Packet

## Scope confirmation
task_id `broadn-p16-covariate-ui-T4` matches the dispatch prompt exactly. Only the Explorer path
was touched. T3's prior slice-panel overlay code (`CHART_COLORS.weatherOverlay`, `applyWeatherOverlay`,
`WEATHER_VARIABLES`, `WEATHER_FIDELITY_LABELS`, extended `insertGapMarkers`) and the `DESIGN.md`
token line were left byte-identical — confirmed via `git diff -U0` hunk inspection (T3's hunks sit
at :63, :643, :1041-1078, :2176-2341, :2641; none of my edits touch those ranges).

## Files changed (net new lines, mine only — T3's prior uncommitted hunks excluded)

| File | Lines | Location |
|---|---|---|
| `assets/app.js` | +37 | `EXPLORER_FIDELITY_MARKERS`/`flattenSampleCovariates`/`formatExplorerWeather` :1540-1564; numeric comparator branch in `compareExplorerNonEmpty` :1672-1674; `renderTable` colspan 7→9 + 2 new `<td>` :1752,1767-1768; `buildExplorerCsv` header + shared-formatter cells :1830,1836-1840; `flattenSampleCovariates()` call in `initDashboard` :4991-4993 |
| `index.html` | +3 | 2 new `<th>` between Stage and Request :928-929; footer fidelity-legend `<p>` :936 |

Total ≈ 40 lines (design's own line-budget guidance was 50-70; came in lean because the two columns
share one formatter/one comparator branch/one flatten pass — no per-column duplication).

## Implementation notes (what the auditor should verify in the browser)

**Single DRY path (no parallel Explorer functions introduced):**
- Fields flow through the EXISTING `computeExplorerFiltered` (:1594) → `sortExplorerRows` (:1680) →
  `renderTable` (:1752) → `buildExplorerCsv` (:1833) chain only. Grep confirms exactly one
  `computeExplorerFiltered`, one `sortExplorerRows`, one `buildExplorerCsv` function in the file.
- **Flatten-at-row-construction:** `flattenSampleCovariates(samples)` (new, :1548) runs ONCE per
  data load — called from `initDashboard` right before `buildFilterOptions`/`renderTable` (:4991-4993)
  — writing `covariates_temp` / `covariates_humidity` / `covariates_fidelity` directly onto each
  `appData.all_samples[i]` object (same array reference reused by every `renderTable`/
  `downloadExplorerCsv` call, so this is not re-run per render). `covariates_fidelity` is an
  internal-only flattened field (not a sort key, not a column) used solely to compute the marker
  glyph shared by both new columns. This lets the EXISTING `isExplorerValueEmpty()` (unmodified,
  generic `row[key] === null` check) sort missing values last with zero special-casing, exactly per
  design_spec §9.
- **Numeric comparator branch (design §9, REQUIRED):** added to `compareExplorerNonEmpty` (:1672-1674):
  ```js
  if (key === 'covariates_temp' || key === 'covariates_humidity') {
    return a[key] - b[key];
  }
  ```
  placed before the fallthrough `String(...).localeCompare(...)` branch, so the two new keys never
  hit the string-sort path (which would have sorted "10°C" before "9°C").
- **Missing-value em dash, table + CSV, single shared formatter:** `formatExplorerWeather(value,
  fidelity, decimals, unit)` (:1560-1563) is the ONE function producing both the `<td>` text and the
  CSV cell text — called identically at 4 sites (table×2 at :1767-1768, CSV×2 at :1838-1839, each
  wrapped by `escapeHtml`/`csvCell` respectively per the existing per-surface encoding convention).
  Returns the literal `'—'` (U+2014) for `value === null || value === undefined` — covers both the
  "covariates object is null" case (733 samples) and the "object present, field null" edge case (the
  4 samples T1 flagged: `BSN0133L`, `BSN0344A`, `BSN0346A`, `BSN1006A` — confirmed via a data.json
  read that these have `covariates.temp === null` with a valid `fidelity`, and `flattenSampleCovariates`
  correctly falls through to `null` for both fields while still capturing `covariates_fidelity`).
  Never returns `0`/`NaN`/`undefined`/`"null"`.
- **Cell format (non-missing):** Temp → `value.toFixed(1) + '°C' + marker`; Humidity →
  `value.toFixed(0) + '%' + marker`. Marker: `''` for `window_exact`, `'*'` for `window_assumed_24h`,
  `'†'` for `date_only`, via `EXPLORER_FIDELITY_MARKERS` (:1542) — distinct constant from the slice
  panel's sentence-form `WEATHER_FIDELITY_LABELS` (T3), matching the design spec's explicit "compact
  glyph, not the tooltip sentence" requirement.
- **CSV parity:** `EXPLORER_CSV_HEADER` gained `'Temperature (°C)'` / `'Humidity (%)'` in the same
  relative order as the table (:1830). `buildExplorerCsv` pushes two more `csvCell(formatExplorerWeather(...))`
  calls per row (:1836-1840) — same formatter, same fidelity marker, same em-dash-for-missing. The
  pre-existing formula-injection guard (`csvCell`'s leading `=+-@\t\r` quote-escape) and UTF-8 BOM
  are both untouched.
- **Empty-state colspan:** `7` → `9` (:1752) — the only other change to the empty-row markup.
- **Header markup / a11y:** new `<th scope="col" aria-sort="none">` wrapping
  `<button data-sort-key="covariates_temp|covariates_humidity">` reuses the EXISTING sort-button
  classes (hover/focus-ring/rounded) verbatim — no new CSS. `aria-label` strings are the literal
  copy-dictionary strings ("Sort by Temperature — modeled grid-cell estimate, not a site measurement"
  / the Humidity equivalent), including the em dash. `updateExplorerSortIndicators()` (unmodified,
  generic `[data-sort-key]` query) handles the ▲/▼ indicator and `aria-sort` toggle for the two new
  buttons automatically — confirmed no special-casing was needed or added.
- **Footer caption:** static `<p class="weather-fidelity-caption">` inserted as a sibling of
  `.overflow-x-auto`, above `#table-pagination`, per the design's component hierarchy. Exact copy
  from the dictionary (HTML entities `&ndash;`/`&plusmn;`/`&dagger;`/`&nbsp;` used for the
  em-dash-adjacent glyphs since this is static markup, not JS-templated text).
- **Zero on-load regression:** `explorerSort = { key: null, dir: null }` (pre-existing module state,
  untouched) still gates `sortExplorerRows` to a no-op (`if (!explorerSort.key) { return rows; }`) on
  first paint — the new columns render in `data.json`'s natural `all_samples` order on load, exactly
  like every other column. Sorting a weather column is opt-in via a first click, matching the 6
  existing sortable headers' behavior.

## Self-check results
- `node --check assets/app.js` — exit 0, clean.
- Grep-confirmed: exactly one `computeExplorerFiltered`/`sortExplorerRows`/`buildExplorerCsv`
  function each (no parallel path introduced).
- Grep-confirmed: numeric comparator branch present for both `covariates_temp` and `covariates_humidity`.
- Grep-confirmed: `'—'` (em dash) used in both `formatExplorerWeather` (feeds table AND CSV) — no
  separate/divergent missing-value string anywhere in the new code.
- Grep-confirmed: empty-row `colspan="9"`.
- Data-contract pre-flight (per the Data-Contract Pre-Flight requirement): ran a `python3` read of
  `data/data.json` before writing any field-referencing code — confirmed the exact keys
  `covariates.temp` / `covariates.humidity` / `covariates.fidelity` exist (733 null / 3836 non-null
  of 4569 total samples; the 4-sample all-null-field-but-valid-fidelity edge case independently
  confirmed present and count-matched to T1's BE packet).
- Constant/hex audit: 0 raw-hex introduced in either touched file; all new classes reuse existing
  Tailwind stone-scale utility classes already used elsewhere in `index.html`.
- Inline-style/Tailwind-conflict check: 0 matches (no `style="..."` attributes touched or added).
- Function-body-dedup check: the 4 `formatExplorerWeather(...)` call sites (temp/humidity × table/CSV)
  are each a distinct one-line call into the single shared formatter — this IS the required DRY
  extraction, not a duplication needing further extraction.
- JSON.parse safety check: grepped both touched files; 3 pre-existing `JSON.parse` hits in `app.js`
  (`deepClone` :2909, draft-load :2922, :5111) — none introduced by this task's diff (confirmed via
  `git diff`, zero `JSON.parse` lines fall inside my hunks). Not flagged as new SX risk.
- Click-handler keyboard-equivalent audit (`<span|div|li|a ... onClick=`): 0 matches in either
  touched file — no new interactive non-button/non-anchor elements were introduced (the two new sort
  controls are real `<button>` elements, matching the existing convention).
- HTML balanced-tag sanity check on `index.html`: the modified `<thead>`/table region and the new
  `<p>` caption are well-formed (manually re-read post-edit; a generic Python `HTMLParser`-based
  checker flagged only pre-existing self-closing void-tag false positives — `<meta/>`/`<link/>`/`<img/>`
  — unrelated to and unmodified by this task).

## What the auditor should verify in the browser (headless walk)
1. Explorer table renders 9 columns on load: Sample ID, Date, Site, Type, Category, Stage,
   **Temp (Modeled)**, **Humidity (Modeled)**, Request — in that order, matching `data.json`'s
   natural `all_samples` order (no reorder on load).
2. Spot-check several rows' Temp/Humidity cell values against `data.json`'s
   `all_samples[i].covariates.temp`/`.humidity` (formatted to 1/0 decimals + unit + marker).
3. Rows where `covariates` is `null`, and the 4 rows where `covariates` is present but
   `temp`/`humidity` are `null` (`BSN0133L`, `BSN0344A`, `BSN0346A`, `BSN1006A`), show `—` in BOTH
   the table cell AND the exported CSV cell for that column.
4. Click "Temp (Modeled)" header: ascending sort is numerically correct (not string-sorted — e.g. a
   9-point value does not appear after a 10-point value), missing (`—`) rows sort last regardless of
   direction; click again for descending; repeat for "Humidity (Modeled)".
5. Download CSV: gains `Temperature (°C)` / `Humidity (%)` columns in the same relative position as
   the table; CSV cell text matches table cell text exactly (including markers and `—`); BOM +
   formula-injection guard still present (spot-check a normal row's quoting).
6. Default on-load order/layout unchanged from pre-sprint (no auto-sort applied); zero console errors
   across load, column-sort, and CSV-download interactions.
7. Footer caption strip renders below the table, above pagination controls, with the exact legend
   copy (temp/humidity disclosure + `*`/`†` marker key).

## Tier 2 Playwright smoke test
`e2e_spec: TIER_1_ONLY`. This repository has zero `package.json`/`packages/client`/npm build
infrastructure anywhere (confirmed via `find`) — it is a static HTML + vanilla-ES5-JS + Tailwind-CDN
site (DESIGN.md Constitution), and this task's own hard constraint explicitly forbids "no new
deps/build step." Introducing an npm/Playwright toolchain to satisfy the generic Tier 2 setup
instructions would itself violate the task's scope. This matches the established precedent set by
the sibling `broadn-p16-covariate-ui-T3` task and the earlier `broadn-p13-explorer-csv-sort` task in
this same project (both flagged identically rather than silently skipping or silently violating
scope). The auditor's headless-browser walk (items 1-7 above) is the verification mechanism for this
task, consistent with how T3 and p13 were audited.

---

<ui_packet>
  <components_created>
    No new React components (vanilla ES5 static site, no component framework). Modified surfaces:
    /home/jhber/projects/broadn-web-view/assets/app.js (Explorer functions only — flattenSampleCovariates,
    formatExplorerWeather, EXPLORER_FIDELITY_MARKERS constant, numeric comparator branch, renderTable
    row markup, buildExplorerCsv);
    /home/jhber/projects/broadn-web-view/index.html (2 new sortable &lt;th&gt; + footer caption &lt;p&gt;
    in the #explorer-table region only)
  </components_created>
  <state_hydration_map>
    Static build-time data.json (baked by T1's scripts/preprocess_data.py) fetched once into module-level
    `appData`. `flattenSampleCovariates(data.all_samples)` runs once in `initDashboard`, mutating each
    sample object in place to add flat `covariates_temp`/`covariates_humidity`/`covariates_fidelity`
    properties sourced from the nested `covariates` object (or null passthrough). No new fetch, no new
    async state, no new client-side store — reuses the existing `appData`/`explorerSort`/`tableCurrentPage`
    module-level state exactly as the 6 pre-existing Explorer columns do.
  </state_hydration_map>
  <a11y_verification>
    2 new `&lt;th scope="col" aria-sort="none"&gt;` wrapping `&lt;button data-sort-key&gt;` reuse the
    EXISTING sort-button markup/focus-ring/hover convention verbatim (no new CSS, no new ARIA pattern).
    aria-label strings are the literal copy-dictionary disclosure strings ("Sort by Temperature —
    modeled grid-cell estimate, not a site measurement" / Humidity equivalent). `updateExplorerSortIndicators()`
    (unmodified, generic `[data-sort-key]` query) drives `aria-sort`/▲▼ indicator state for the new
    buttons with zero special-casing. New `&lt;td&gt;` cells are plain text (`--color-text-secondary`
    equivalent `text-stone-600`, ~7:1 AAA per DESIGN.md), no new interactive elements inside cells.
    Click-handler keyboard-equivalent audit: 0 matches for onClick on non-button/non-anchor elements
    in either touched file — the only new interactive elements are real `&lt;button&gt;`s, already
    keyboard-navigable by native semantics. Footer caption is static non-interactive `&lt;p&gt;` text.
  </a11y_verification>
  <design_tokens_used>
    Reused existing Tailwind stone-scale utility classes only (no raw hex): `bg-stone-100` /
    `border-stone-200` / `text-stone-600` (== DESIGN.md `--color-surface-alt` / `--color-border` /
    `--color-text-secondary` per the project's established Tailwind-class-to-token mapping, matching
    every other use of these three tokens in `index.html`); `px-6 py-3`/`px-6 py-4` cell padding
    (unchanged from the 6 existing columns); `focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]`
    on the 2 new sort buttons (identical to the 6 existing ones). Zero new tokens introduced or
    invented — no gap to flag for this deliverable (T3 already closed the one new-token gap,
    `--color-weather-overlay`, for Deliverable A).
  </design_tokens_used>
  <style_conflict_check>NONE</style_conflict_check>
  <integration_status>
    SUCCESS. Data contract field names (`covariates.temp`/`.humidity`/`.fidelity`) verified directly
    against `data/data.json` before implementation (per Data-Contract Pre-Flight) — 733 null / 3836
    non-null of 4569 samples, 4-sample all-null-field edge case confirmed and correctly handled.
    e2e_spec: TIER_1_ONLY (no npm/Playwright infra in this static-site repo; task's own constraints
    forbid new deps/build step; matches sibling T3/p13 precedent in this same project).
  </integration_status>
</ui_packet>
