# broadn-p16-covariate-ui-T2 — Design Spec

<design_spec>
  <task_id>broadn-p16-covariate-ui-T2</task_id>
  <surface>Slice-panel temporal weather overlay (A) + Data Explorer weather columns (B) + grid-cell-estimate/fidelity labeling (C) — broadn-p16 Phase 2, BROADN Aerobiome Dashboard</surface>
  <design_system_source>DESIGN_MD</design_system_source>

  <!-- No <observed_state> block: no live render was reachable this session (file:// blocked by
       sandbox; no dev server running; no Bash tool available to start one). The spec below is
       grounded directly in source reads of assets/app.js (WIDGET_RENDERERS['temporal_bar'] :2404,
       buildTemporalChartOptions :2094, makeSliceCard/makeCanvas :2231/:2251, insertGapMarkers :1033,
       CHART_COLORS :40, computeExplorerFiltered/renderTable/sortExplorerRows :1549/:1662/:1632) and
       index.html (Explorer <thead> sortable-header markup :919-931), not a screenshot. Flagged in
       <notes>. -->

  <!-- ============================================================ -->
  <!-- DELIVERABLE A — SLICE TEMPORAL WEATHER OVERLAY                -->
  <!-- ============================================================ -->

  <component_hierarchy>
Surface A — Slice panel "Collection Over Time" card, produced by WIDGET_RENDERERS['temporal_bar']
(PRIMARY site, app.js:2404, called via renderSlice on cold slice-open) and mirrored by
updateSliceCharts (SECONDARY site, app.js:552, tag-filter re-render). This app is vanilla
HTML/Tailwind/Chart.js — no React/Shadcn (DESIGN.md Constitution) — so the tree below is the DOM/
Chart.js construction tree FE builds via the existing makeSliceCard/makeCanvas helpers, not Shadcn
components.

  div.bg-white.p-6 (card — makeSliceCard, UNCHANGED)
  ├─ h3 "Collection Over Time" (UNCHANGED — text-lg font-bold text-stone-800 mb-1)
  ├─ p "Monthly sample collection volume for this project." (UNCHANGED subtitle — SLICE_WIDGET_SUBTITLE.temporal, text-sm text-stone-500 mb-4; left untouched so it never reads as claiming an overlay that isn't present for this slice)
  ├─ [NEW] div.weather-overlay-header — flex row, RENDERED ONLY IF ≥1 bucket in ctx.entry.temporal
  │        carries a non-null `weather` object (i.e. the graceful-degrade condition: tag-active mode
  │        via mergeTagChartData, or an all-null-weather slice, both OMIT this entire row)
  │   ├─ [NEW] span "Modeled Estimate" — neutral pill badge (see States/Tokens)
  │   ├─ [NEW] label (for="slice-weather-variable") "Weather overlay"
  │   └─ [NEW] select#slice-weather-variable — 4 <option>s (Temperature/Humidity/Wind Speed/
  │            Precipitation), see Interactions for the exact option copy
  ├─ div.chart-wrap (UNCHANGED container)
  │   └─ canvas#slice_{slice_kind}_{widget.id} (EXISTING element — makeCanvas)
  │        · dataset[0] = existing bar dataset "Samples Collected" (UNCHANGED)
  │        · dataset[1] = [NEW] line dataset, the weather overlay, present only under the same
  │          condition as the header row above
  │        · aria-label = one of two literal strings depending on overlay presence (see
  │          accessibility_spec)
  │        · aria-describedby = "{canvasId}-summary" ONLY when overlay present
  ├─ [NEW] p#{canvasId}-summary.sr-only — accessible data summary, present only when overlay present
  │        (see accessibility_spec for the exact template)
  └─ [NEW] p.weather-overlay-caption — text-xs, present only under the same condition as the header
           row (grid-cell-estimate + fidelity disclosure — see States/Tokens/Notes for copy)
  </component_hierarchy>

  <layout>
    <grid>No CSS-grid change. Card remains the existing single-column flow inside the widget grid
    (`lg:col-span-2` when `widget.size === 'lg'`, unchanged). The two new rows (header, caption) are
    additional flow children inside the same `div.bg-white.p-6` card — no new grid columns.</grid>
    <spacing>Header row: `flex flex-wrap items-center justify-between gap-2 mb-3` (space-2 gap between
    badge/label/select clusters, space-3 margin-bottom before the canvas — both named DESIGN.md
    spacing-scale steps). Badge-to-label gap and label-to-select gap: `gap-2` (space-2). Caption:
    `mt-2` (space-2) below `.chart-wrap`. All values map to DESIGN.md § Spacing Scale
    (`space-2`=8px, `space-3`=12px) — no magic pixel values.</spacing>
    <responsive>
      <breakpoint name="base (mobile, &lt;640px)">Header row wraps via `flex-wrap`: badge+label group
      stacks above the select on its own line when combined width exceeds viewport. No explicit
      media query needed — Tailwind `flex-wrap` handles it fluidly, consistent with how the rest of
      the Explorer filter bar (`flex flex-wrap gap-4 items-end`) already degrades on narrow
      viewports.</breakpoint>
      <breakpoint name="md (≥768px)">Header row renders as a single line (badge+label left, select
      right, `justify-between`). `.chart-wrap` height steps from 350px→400px per the EXISTING
      `.chart-wrap` media rule (styles.css:35) — unaffected by this spec, cited for completeness.</breakpoint>
    </responsive>
  </layout>

  <states>
    <state name="default — weather present for the selected variable">
      Bar dataset renders as today (solid `--color-teal-... ` no — reuses `CHART_COLORS.sliceTemporalBar`
      `#0f766e`, UNCHANGED). Weather dataset renders as a DASHED line in the new overlay color, hollow
      points (white fill, colored 2px border), on a secondary right-side axis (`y1`). Legend becomes
      visible (was `display:false`) once the overlay dataset exists, with two entries: "Samples
      Collected" (existing bar label, unchanged) and "{Variable} (modeled estimate)" for the line —
      the legend text itself repeats the estimate framing, reinforcing deliverable C at zero extra
      DOM cost (Chart.js draws it from `dataset.label`).
    </state>
    <state name="gap — a real month bucket exists but weather is null for that month">
      That single data point in the overlay array is `null`; with `spanGaps:false` Chart.js renders a
      visible discontinuity in the dashed line at that x-position (the line breaks and resumes) —
      never a zero value, never an interpolated/bridged segment across the gap, never a thrown error.
      The bar for that same month renders normally (bars are independent of the weather dataset).
      Tooltip at that x-position omits the weather line entirely (see Interactions) rather than
      showing "null" or a blank line.
    </state>
    <state name="all-selected-variable-null (edge case)">
      If the user selects a variable that happens to be null for every month in this slice (fields are
      independently nullable per the CONTRACT), the line renders as zero visible segments (every point
      is a gap). The axis, legend entry, badge, and caption remain visible — no special-case hiding —
      because the disclosure copy already covers "fidelity varies by month" generically and the empty
      line is not an error state, just an honest "no modeled data for this combination this month."
    </state>
    <state name="absent — no overlay (graceful degrade)">
      Applies when (a) the slice's temporal buckets carry no `weather` key at all (tag-active mode,
      `mergeTagChartData`), or (b) every bucket's `weather` is null. The ENTIRE weather-overlay-header
      row, the caption, the second dataset, the legend, and the accessible summary paragraph are all
      omitted. The chart is byte-for-byte the same single-dataset bars-only chart that ships today —
      zero visual diff, zero console errors. This is the REQUIRED behavior, not a fallback to design
      around; it is the same chart that exists pre-sprint.
    </state>
    <state name="loading">N/A — no new async fetch. `weather` rides inside the already-fetched
    `data.json` payload (baked at build time by T1); the overlay appears synchronously in the same
    paint as the bars, on the same single app-level initial-load skeleton that already exists. This
    spec introduces no new loading skeleton.</state>
    <state name="error">N/A by design — T1's CONTRACT guarantees no `NaN`/`Infinity` and explicit
    `null` for every missing value, so there is no malformed-data path for this feature to defend
    against at the UI layer. No new error UI is specified.</state>

    <state name="Weather-overlay selector — default">Native `<select>`, "Temperature (°C)" selected
    by default. Styling matches the EXISTING Explorer filter `<select>` convention exactly (bg-white
    border-stone-300 text-stone-900 text-sm rounded-md, `p-2.5`) — reused for visual consistency, not
    reinvented.</state>
    <state name="Weather-overlay selector — hover">`hover:bg-stone-50` (`--color-surface-alt`),
    matching the app's general interactive-surface hover convention.</state>
    <state name="Weather-overlay selector — focus">`focus-visible:ring-2
    focus-visible:ring-[var(--color-accent)]` — the EXISTING bright-teal focus-ring convention used on
    every other control in the app (nav, buttons, sort headers, CSV button). Non-text ring use — fully
    compliant with the Teal Text Restriction.</state>
    <state name="Weather-overlay selector — active">Native OS-rendered dropdown-open state; no custom
    treatment (matches existing `<select>` elements in the Explorer filter bar, which likewise take no
    custom active styling).</state>
    <state name="Weather-overlay selector — disabled / absent">Not rendered disabled — OMITTED entirely
    together with the rest of the header row when there is nothing to select between (the "absent"
    chart state above). A disabled-but-visible select would imply a feature exists but is
    unavailable; omission is the more honest state for "this slice simply has no weather data."</state>
  </states>

  <tokens>
    <token element="Weather overlay line + hollow point border (Chart.js dataset[1].borderColor / pointBorderColor)" token="--color-weather-overlay (PROPOSED — see Notes, not yet in DESIGN.md v2.0.0)" value="#a21caf" />
    <token element="Weather overlay hollow point fill (pointBackgroundColor)" token="--color-surface" value="#ffffff" />
    <token element="Bar dataset (unchanged)" token="CHART_COLORS.sliceTemporalBar (pre-existing app constant, not a DESIGN.md-named Color Token — inherited)" value="#0f766e" />
    <token element="Modeled Estimate badge background" token="--color-surface-alt" value="#f5f5f4" />
    <token element="Modeled Estimate badge border" token="--color-border" value="#e7e5e4" />
    <token element="Modeled Estimate badge text + 'Weather overlay' select label text" token="--color-text-secondary" value="#57534e" />
    <token element="Selector border" token="--color-border-strong" value="#d6d3d1" />
    <token element="Selector text" token="--color-text" value="#1c1917" />
    <token element="Selector background" token="--color-surface" value="#ffffff" />
    <token element="Selector focus ring" token="--color-accent (non-text ring use)" value="#0c9cb4" />
    <token element="Caption text below chart" token="--color-text-secondary" value="#57534e" />
    <token element="y1 (secondary) axis title text" token="CHART_COLORS.axisLabel (pre-existing app constant, not DESIGN.md-named — inherited from the primary y-axis title for visual match)" value="#78716c" />
    <token element="Tooltip background / text (unchanged, reused)" token="--color-tooltip-bg / --color-tooltip-text" value="rgba(28,25,23,0.92) / #ffffff" />
    <token element="Card title / subtitle (unchanged)" token="n/a — untouched by this spec" value="—" />
  </tokens>

  <interactions>
    <interaction trigger="Slice opened cold (temporal_bar renders, weather present for ≥1 month)" response="Overlay header row, dashed weather line on secondary axis, legend, caption, and accessible summary all render in the same paint as the bars. Default selected variable: Temperature." />
    <interaction trigger="User changes the selector value" response="The weather dataset's `data` array, its Chart.js `label`, the y1 axis `title.text`, and the tooltip's unit string all swap to the newly selected variable. The bar dataset, x-axis, and y (primary) axis are untouched. Achieved via updating the existing Chart.js instance's dataset/options object + `chart.update()` — no full chart teardown/rebuild, no re-fetch." />
    <interaction trigger="User hovers/keyboard-focuses a chart month" response="Tooltip title = the month label (unchanged). Body line 1 = existing sample-count/type breakdown (unchanged). Body line 2 (only if that month's weather value for the selected variable is non-null) = 'Modeled {Variable}: {value}{unit} — n={n}, {fidelity label}' per the copy table in Notes. If the weather value is null at that month, the tooltip callback returns `null`/`undefined` for that line so it is OMITTED from the tooltip box entirely — never a blank line, never the literal word 'null'." />
    <interaction trigger="Tag filter applied (temporal reconstructed via mergeTagChartData, no `weather` key present)" response="Chart re-renders bars-only, exactly as pre-sprint. No overlay, no header row, no caption, no legend change, zero console errors." />
  </interactions>

  <accessibility_spec>
    <contrast_pairs>
      <pair element="Weather overlay line/points (non-text)" foreground="#a21caf" background="#ffffff" ratio="~6.3:1" wcag_level="PASS (exceeds the 3:1 non-text minimum; also clears 4.5:1 text-level though it is never used as text)" />
      <pair element="Modeled Estimate badge text + selector label + caption text" foreground="--color-text-secondary #57534e" background="--color-surface-alt #f5f5f4 / --color-surface #ffffff" ratio="~7:1 (DESIGN.md lists #57534e/#ffffff at ~7.4:1 AAA; stone-100 bg is negligibly lighter, ratio holds)" wcag_level="AAA" />
      <pair element="Selector text" foreground="--color-text #1c1917" background="--color-surface #ffffff" ratio="~19.5:1 (DESIGN.md Key Contrast Pairs)" wcag_level="AAA" />
      <pair element="Selector focus ring (non-text)" foreground="--color-accent #0c9cb4" background="--color-surface #ffffff" ratio="~3.0:1 (DESIGN.md: FAIL text, PASS non-text)" wcag_level="PASS non-text only — used exclusively as a focus ring, never as text, per Teal Text Restriction" />
    </contrast_pairs>
    <heading_structure>No new heading levels. Existing `<h3>Collection Over Time</h3>` is unchanged; the new badge/label/caption are non-heading text (span/label/p) subordinate to the existing h3.</heading_structure>
    <keyboard_flow>Tab order: subtitle text (not focusable) → [NEW] `select#slice-weather-variable`
    (when present) → next widget in the slice grid. The canvas itself is never in the tab sequence
    (`role="img"`, non-interactive, matches every other chart in the app).</keyboard_flow>
    <aria_requirements>
      Canvas `aria-label` — two literal variants, chosen by whether the overlay renders:
      · WITH overlay: "Monthly sample collection counts shown as bars, overlaid with a modeled
        grid-cell {Variable} estimate line (dashed). The overlay is a modeled estimate, not a site
        measurement."
      · WITHOUT overlay (unchanged from today): "Bar chart showing sample count over time for
        selected project."
      Canvas `aria-describedby="{canvasId}-summary"` — set ONLY in the WITH-overlay case, pointing at
      the new `sr-only` summary paragraph (template in Notes).
      Selector: `<label for="slice-weather-variable">Weather overlay</label>` — a real, visible
      `<label>`, not an `aria-label`-only control, per the app's existing Explorer-filter-label
      pattern.
      Sort/legend interactions: no new ARIA beyond the above — Chart.js's built-in legend is not a
      DOM element needing separate ARIA wiring.
    </aria_requirements>
  </accessibility_spec>

  <!-- ============================================================ -->
  <!-- DELIVERABLE B — EXPLORER WEATHER COLUMNS                      -->
  <!-- ============================================================ -->

  <component_hierarchy>
Surface B — Data Explorer table (`#explorer-table`), extending `computeExplorerFiltered` →
`renderTable` → CSV builder → sort map (single DRY path, per T4's contract — this spec does not
introduce a parallel path).

  div.bg-white.rounded-lg.border.border-stone-200.overflow-hidden (EXISTING wrapper)
  ├─ div.p-4... (EXISTING filter controls — UNCHANGED)
  ├─ div.overflow-x-auto (EXISTING)
  │   └─ table#explorer-table (EXISTING)
  │       ├─ thead (EXISTING single row; 2 NEW <th> INSERTED between "Stage" and "Request")
  │       │   ├─ th[Sample ID] / th[Date] / th[Site] / th[Type] / th[Category] / th[Stage] — UNCHANGED, unmoved
  │       │   ├─ [NEW] th "Temp (Modeled)" — button data-sort-key="covariates_temp"
  │       │   ├─ [NEW] th "Humidity (Modeled)" — button data-sort-key="covariates_humidity"
  │       │   └─ th[Request] — UNCHANGED, stays last (action column trails data columns)
  │       └─ tbody#explorer-tbody (EXISTING; 2 NEW <td> per row, same insertion point as the headers)
  ├─ [NEW] div.weather-fidelity-caption — footer strip directly below `</table>`, above pagination
  └─ div#table-pagination (EXISTING — UNCHANGED)
  </component_hierarchy>

  <layout>
    <grid>Standard HTML table, no CSS grid. Column ORDER (left→right): Sample ID, Date, Site, Type,
    Category, Stage, **Temp (Modeled)**, **Humidity (Modeled)**, Request. New columns are appended
    immediately after the last existing DATA column (Stage) and before the existing ACTION column
    (Request) — this keeps the 6 pre-existing columns at their current positions untouched (minimal
    diff, zero layout regression risk) while keeping "Request" last, matching the existing
    data-then-action reading order.</grid>
    <spacing>New `<th>`/`<td>` reuse the EXISTING cell padding exactly (`px-6 py-3` header / `px-6
    py-4` body) — no new spacing values introduced.</spacing>
    <responsive>No new breakpoint behavior. The table already sits inside `div.overflow-x-auto`
    (existing horizontal-scroll wrapper); two additional narrow numeric columns are absorbed by that
    existing mechanism on small viewports — no new mobile-specific treatment is specified.</responsive>
  </layout>

  <states>
    <state name="default — covariates non-null, field non-null">Cell text = formatted value + unit +
    optional fidelity marker (see Notes copy table), e.g. "12.4°C", "63%*", "8.1°C†". Color:
    `--color-text-secondary` (matches the existing plain-`<td>` convention used by Date/Site columns).</state>
    <state name="missing — covariates is null (733 samples) OR the specific field is null">Cell renders
    the glyph "—" (em dash) and NOTHING else — no "0", no "N/A", no "undefined", no "NaN". Rendered in
    `--color-text-secondary` (#57534e, ~7.4:1 AAA) rather than the muted `--color-text-muted`
    (#a8a29e) token: DESIGN.md explicitly reserves `--color-text-muted` for "Placeholders... NEVER use
    for data labels," and the em dash here IS the cell's actual rendered value (informing the user
    "no modeled estimate exists"), not a decorative placeholder — so it must clear the same AA bar as
    any other cell value.</state>
    <state name="header hover (existing sortable-header convention, reused verbatim)">`hover:text-stone-900`, unchanged from the 6 existing sortable headers — no new hover styling invented.</state>
    <state name="header focus (existing, reused verbatim)">`focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded` — identical to the 6 existing sort buttons.</state>
    <state name="sorted — ascending / descending (existing convention, reused verbatim)">`aria-sort` +
    the ▲/▼ `.sort-indicator` span update generically via the EXISTING `updateExplorerSortIndicators()`
    (queries `[data-sort-key]` generically — no special-casing needed for the two new keys). Missing
    values (the "—" cells) always sort last regardless of direction, via the EXISTING
    `isExplorerValueEmpty()` empty-check — this already generalizes to any key once the new fields are
    exposed as flat, nullable `row` properties (see Notes implementation guidance).</state>
    <state name="row hover (existing, unaffected)">`hover:bg-stone-50` row-level treatment continues
    to apply across the full row including the two new cells — no per-cell hover is introduced.</state>
    <state name="empty result set (existing 'No samples match the selected filters' row)">Unchanged —
    the existing `colspan` empty-row markup needs its `colspan` value incremented from 7 to 9 to span
    the two new columns; no other change.</state>
  </states>

  <tokens>
    <token element="New header text (reuses existing Data Table Component Rule verbatim)" token="Component Rules → Data table" value="bg-stone-100 text-stone-600 text-xs font-semibold uppercase tracking-wide" />
    <token element="New cell text (default, non-missing)" token="--color-text-secondary" value="#57534e" />
    <token element="Missing glyph '—'" token="--color-text-secondary" value="#57534e" />
    <token element="Fidelity marker chars (*, †)" token="inherits the cell's own --color-text-secondary — no separate token" value="#57534e" />
    <token element="Footer caption bar background" token="--color-surface-alt" value="#f5f5f4" />
    <token element="Footer caption bar top border" token="--color-border" value="#e7e5e4" />
    <token element="Footer caption text" token="--color-text-secondary" value="#57534e" />
    <token element="New sort-button focus ring (reused verbatim)" token="--color-accent (non-text)" value="#0c9cb4" />
  </tokens>

  <interactions>
    <interaction trigger="User clicks 'Temp (Modeled)' or 'Humidity (Modeled)' header" response="Table sorts ascending on first click, descending on second (matching the existing 3-state cycle used by every other sortable column); rows with a missing value for that field always sort last regardless of direction. CSV export order updates identically because both read from the same `sortExplorerRows` output — single source of truth, no parallel sort path." />
    <interaction trigger="User exports CSV" response="CSV gains two columns, 'Temperature (°C)' and 'Humidity (%)', positioned in the same relative order as the table. Every CSV cell's TEXT is produced by the SAME formatter function used to build the table cell's text content (including the unit suffix and fidelity marker, and including the literal '—' for missing) — one shared function, not two independently-maintained format paths, so table/CSV parity is structural rather than incidentally matching." />
  </interactions>

  <accessibility_spec>
    <contrast_pairs>
      <pair element="New header text (reused Data Table rule)" foreground="--color-text-secondary #57534e" background="stone-100 #f5f5f4" ratio="~7:1" wcag_level="AAA" />
      <pair element="New cell values + missing glyph" foreground="--color-text-secondary #57534e" background="--color-surface #ffffff / --color-surface-alt #f5f5f4 (alternating rows)" ratio="~7:1 / ~6.8:1" wcag_level="AAA" />
      <pair element="Footer caption text" foreground="--color-text-secondary #57534e" background="--color-surface-alt #f5f5f4" ratio="~6.8:1" wcag_level="AAA" />
    </contrast_pairs>
    <heading_structure>No new headings — `<h2>Data Explorer</h2>` is unchanged; new `<th>`s are table
    header cells, not document headings.</heading_structure>
    <keyboard_flow>Tab order: existing "Stage" sort button → [NEW] "Temp (Modeled)" sort button →
    [NEW] "Humidity (Modeled)" sort button → existing "Request" link — a straightforward linear
    insertion matching the new columns' visual position, no tab-order surprises.</keyboard_flow>
    <aria_requirements>
      New `<th scope="col" aria-sort="none">` wrapping a `<button data-sort-key="covariates_temp">`
      with `aria-label="Sort by Temperature — modeled grid-cell estimate, not a site measurement"`
      (and the Humidity equivalent) — extends the EXISTING `aria-label="Sort by X"` convention with the
      estimate disclosure folded into the label itself, so screen-reader users get the "this is
      modeled, not measured" context at the exact point they'd query column meaning, not only via the
      visible footer caption.
    </aria_requirements>
  </accessibility_spec>

  <!-- ============================================================ -->
  <!-- DELIVERABLE C — GRID-CELL-ESTIMATE + FIDELITY LABELING (COPY) -->
  <!-- ============================================================ -->

  <notes>
**1. design_system_source / dashboard-patterns applicability.** DESIGN.md v2.0.0 declares no `App
Type:` field → defaults to `standard` per `~/.claude/refs/design-system.md` §Canonical Format. The
dashboard-only Material/Motion/Data-Viz-Pattern sections and the `<pattern_citation>` requirement do
NOT apply here, despite the product being colloquially called a "dashboard." No pattern citation is
included; none is required.

**2. Live-page inspection gap.** No dev server was reachable this session (file:// blocked by the
sandbox; no Bash tool to start `python -m http.server`). This spec is grounded in direct reads of
`assets/app.js` and `index.html` at the exact anchors T3/T4 will edit, not a rendered screenshot.
Recommend FE/Auditor take a screenshot during T3/T4 implementation for the first real visual gate on
this feature.

**3. Overlay color — NEW token, flagged gap (do not skip this).** `#a21caf` (Tailwind fuchsia-700,
~6.3:1 on white) is chosen because it sits outside all three excluded sets — Okabe
{#0072B2,#009E73,#E69F00,#56B4E9,#999999}, brand teal {#0c5454,#0c9cb4}, pipeline
{#1e3a5f,#2b6c8a,#4db6c4} — AND outside two *unlisted-but-already-semantically-claimed* hues I
additionally avoided on purpose: (a) violet `#6d28d9`, already used for the "Sequenced" pipeline stage
in `slicePipeline` and for `sliceTimeOfDay[3]` — reusing it for weather would create a false
"this is a pipeline-stage" association in the same slice panel; (b) the orange family (`#c2410c`
`--color-filter-accent`), which DESIGN.md reserves exclusively as the "a filter is active" signal —
using orange for "this is modeled data" would create a direct semantic collision, wrongly implying a
filter is engaged. Fuchsia has no existing role anywhere in this app's palette. **DESIGN.md v2.0.0
does not contain this token.** Per the Design System Contract, I am not silently inventing it: I am
stating the exact hex (required by this task's SC2) and flagging the gap here. Recommend the
Orchestrator add `--color-weather-overlay: #a21caf` to DESIGN.md (via `generate-design` or an HR-
reviewed manual addition) before or immediately after T3 ships, and recommend FE add it to `app.js`'s
`CHART_COLORS` object as `CHART_COLORS.weatherOverlay` (matching the existing constant-table
convention) rather than inlining the hex at the call site.

**4. Variable-selection UX decision — compact selector, not default-only.** Chose a compact native
`<select>` (4 options) over a fixed default-to-temperature. Reasoning: (a) T3's own line-budget
estimate ("70–100 ... + selector ...") already anticipates a selector as the likely shape, so this
isn't adding unbudgeted scope; (b) the selector's change handler only swaps an already-instantiated
Chart.js dataset's `data`/`label`/axis-title (no new render path, no interaction with the dual
primary/secondary render-site complexity that already dominates T3's budget) — cheap relative to its
payoff; (c) all four headline variables (temp/humidity/wind_speed/precipitation) have a defensible
aerobiology story (temperature and humidity drive microbial viability, wind drives bioaerosol
dispersal, precipitation drives wash-out) — defaulting to temp-only would silently hide 3/4 of the
shipped covariate surface on the flagship chart even though T1 baked all four. A fixed default would
have been the safer/cheaper call under tighter budget; given the explicit line-budget signal, the
selector is the better value trade.

**5. Explorer column subset — Temp + Humidity only, not all 4.** Recommend shipping 2 of the 4
headline variables as Explorer columns, not 4. Reasoning: (a) T4's line budget (50–70, tighter than
T3's) makes 4 columns × {header + cell format + numeric-comparator + CSV column} materially riskier
to land cleanly; (b) visual hierarchy — the table's primary job is sample identity/provenance
(ID/Date/Site/Type/Category/Stage); piling on 4 more numeric columns dilutes that hierarchy (the
"Bold hierarchy" aesthetic principle) more than 2 does; (c) temperature and humidity are the two most
broadly interpretable covariates to a general scientific reader without unit-familiarity friction.
Wind speed and precipitation remain fully present in the underlying `all_samples[].covariates` object
(T1 bakes all four regardless of what T4 displays) — a future increment can add them as columns with
zero data-plumbing change. This is a scope decision, not a data gap.

**6. Copy dictionary (exact strings — FE must not paraphrase).**

| Context | Exact copy |
|---|---|
| Chart badge | `Modeled Estimate` |
| Chart selector label | `Weather overlay` |
| Chart selector options | `Temperature (°C)` / `Humidity (%)` / `Wind Speed (m/s)` / `Precipitation (mm)` |
| Chart legend — line dataset | `{Variable} (modeled estimate)` e.g. `Temperature (modeled estimate)` |
| Chart legend — bar dataset | `Samples Collected` (unchanged, existing) |
| Chart y1 axis title | `Temp (°C)` / `Humidity (%)` / `Wind Speed (m/s)` / `Precipitation (mm)` |
| Chart tooltip line (weather, non-null) | `Modeled {Variable}: {value}{unit} — n={n}, {fidelity label}` |
| Chart caption (below chart, overlay present) | `Modeled grid-cell estimate (~11–25 km resolution), not a site measurement. Fidelity varies by month — hover a point for detail.` |
| Chart aria-label (overlay present) | `Monthly sample collection counts shown as bars, overlaid with a modeled grid-cell {Variable} estimate line (dashed). The overlay is a modeled estimate, not a site measurement.` |
| Chart aria-label (no overlay, unchanged) | `Bar chart showing sample count over time for selected project.` |
| Chart accessible summary template | `Monthly sample collection counts range from {minCount} to {maxCount} across {monthCount} months. A modeled {Variable} overlay is available for {weatherMonthCount} of {monthCount} months, ranging from {minWeather} to {maxWeather}{unit}. Fidelity: {fidelityList}. This is a modeled grid-cell estimate (~11–25 km resolution), not a site measurement.` |
| Fidelity label — `window_exact` | `exact window match` |
| Fidelity label — `window_assumed_24h` | `±24h window estimate` |
| Fidelity label — `date_only` | `date-only estimate` |
| Explorer header — Temp | `Temp (Modeled)` (renders uppercase via existing `uppercase` thead class) |
| Explorer header — Humidity | `Humidity (Modeled)` |
| Explorer header aria-label — Temp | `Sort by Temperature — modeled grid-cell estimate, not a site measurement` |
| Explorer header aria-label — Humidity | `Sort by Humidity — modeled grid-cell estimate, not a site measurement` |
| Explorer cell format — Temp | `{value.toFixed(1)}°C{marker}` e.g. `12.4°C`, `12.4°C*`, `12.4°C†` |
| Explorer cell format — Humidity | `{value.toFixed(0)}%{marker}` |
| Explorer missing-value cell | `—` (em dash, U+2014 — exactly the glyph named in the task, nothing else) |
| Explorer cell fidelity marker | none for `window_exact`; `*` for `window_assumed_24h`; `†` for `date_only` |
| Explorer footer caption | `Temp / Humidity are modeled grid-cell estimates (~11–25 km resolution), not site measurements. * = ±24h window estimate  † = date-only estimate (coarsest fidelity)` |
| CSV header — Temp | `Temperature (°C)` |
| CSV header — Humidity | `Humidity (%)` |

**7. Per-point fidelity shape-encoding — recommended, NOT required for SC pass.** Beyond the tooltip
text (required), consider encoding each overlay point's `fidelity` via Chart.js's native
`pointStyle`/`pointRadius` per-point arrays (no custom plugin needed): `circle` for `window_exact`,
`rectRot` (diamond) for `window_assumed_24h`, `triangle` for `date_only` — a common
precision-cartography convention (circle=exact, triangle=approximate), colorblind-safe because it
encodes via shape, not hue, layered on top of the single overlay color. This is a value-add, not a
gate: T3's audit SC (SC4) only requires "a visible ... fidelity indicator," which the tooltip text +
footer/caption copy already satisfies on its own. If the line budget is tight, ship tooltip+caption
only and treat shape-encoding as a fast-follow.

**8. Chart.js construction notes (non-code, but load-bearing for the auditor's grep guards).**
`spanGaps:false` on the weather dataset (never default `true`). `tension:0` (straight segments, no
curve smoothing — smoothing would visually imply false precision between two real monthly means).
`yAxisID:'y1'`; `y1.position:'right'`; `y1.grid.display:false` (avoid a second gridline layer
competing with the primary axis's `CHART_COLORS.gridLine`); `y1.beginAtZero:false` (temperature can be
negative or narrow-banded; forcing a zero baseline would flatten the line to visual noise, unlike the
primary count axis which correctly keeps `beginAtZero:true`). The weather dataset should be appended
as `datasets[1]` (after the bar) so it draws on top by Chart.js's default array-order stacking — no
explicit `order` override needed. `borderDash`/`pointRadius`/`tension`/`beginAtZero` are Chart.js
dataset/scale construction parameters, not Tailwind spacing-scale values, and are outside DESIGN.md's
token surface — consistent with how the rest of `CHART_COLORS`/existing chart `options` objects in
this codebase already carry raw Chart.js config untouched by the spacing scale.

**9. Explorer sort-key implementation guidance (non-code).** Recommend FE flatten the new fields at
row-construction time — `row.covariates_temp` / `row.covariates_humidity`, both `null` when absent —
rather than reaching into a nested `row.covariates.temp` inside the shared comparator functions. This
lets the EXISTING `isExplorerValueEmpty()`/`sortExplorerRows()` empty-sorts-last logic work with zero
special-casing (both already operate on flat `row[key]`). One correctness note the auditor will check:
`compareExplorerNonEmpty()`'s default branch does a STRING `localeCompare`, which sorts numerically
wrong (e.g. "10" before "9"); the new `covariates_temp`/`covariates_humidity` keys need a numeric
branch (`a[key] - b[key]`) added alongside the existing `pipeline_stage`/`date` special cases.

**10. Accessible-summary scope note.** Today, EVERY chart canvas in the app has only an `aria-label`,
no accessible data-summary paragraph — a pre-existing, app-wide gap that predates this sprint. This
spec adds the summary ONLY to the temporal_bar canvas, and only in the overlay-present branch (adding
it unconditionally to the bars-only case, or backfilling every other chart in the app, is out of
scope for T2/T3). Recommend a follow-up sprint to backfill accessible summaries across the remaining
chart renderers — recorded here so it isn't silently dropped, matching this app's own "Deferred items"
convention in DESIGN.md § Design Integrity Notes.

**11. Touch-target note (pre-existing, not introduced here).** The new selector and the two new
sort buttons reuse the EXISTING Explorer filter-`<select>` and sort-`<button>` markup/sizing exactly
(DRY). If those existing patterns fall short of the Constitution's 44×44px minimum on some browsers'
native control rendering, that is a pre-existing condition already shipped for the app's other 4
filter selects and 6 sort buttons — out of scope for T2 to remediate, flagged for HR/PM awareness
only, not a new regression this spec introduces.

**12. Brand≠Data / Teal Text Restriction compliance check.** No brand teal hex (`#0c5454`/`#0c9cb4`)
is used for the overlay line or any new data-encoding element (satisfies Brand≠Data). Bright teal
(`#0c9cb4`) appears ONLY as a non-text focus-ring accent on the new selector/sort buttons — reused
from the existing app-wide focus convention, never as normal-size text (satisfies the Teal Text
Restriction). All new normal-size text uses `--color-text-secondary` (#57534e, deep enough to clear
AA/AAA on its own, independent of the teal restriction).
  </notes>
</design_spec>
