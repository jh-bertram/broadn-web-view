# BROADN Aerobiome Dashboard — Design Language Evaluation
## Task: broadn-p10-design-language | Agent: UI#1 | Date: 2026-06-25

---

> **Visual inspection note:** The Playwright browser tool was unavailable in this environment. This evaluation is conducted from a full code audit of `index.html` (908 lines), `assets/app.js` (4518 lines), `assets/styles.css` (124 lines), and `DESIGN.md` v1.0.0. Every claim is grounded in a specific line reference. No live screenshots were captured; this gap is flagged so the human can supplement with a manual screenshot comparison.

---

## Part 1 — Visual Audit of the Rendered Site

### 1A. Navigation Bar

The sticky nav renders as `bg-white h-16` with a left-side brand mark and right-side section links. The brand mark is `&#10044; BROADN` — the `&#10044;` character is a four-pointed asterism (✤). This is not an emoji but is a Unicode symbol rendered by the system font stack, not a designed icon. It will look different across Windows, macOS, and Linux and has no accessible label (the `<span>` containing it has no `aria-hidden`).

Nav link active state: `border-b-2 border-green-800 text-green-800 font-weight-600` — this is a well-considered pattern. No problem here.

### 1B. Hero Banner

- Background: `bg-green-900 text-white py-14` — appropriate brand expression.
- Mission paragraph: `text-green-200 text-lg` — good secondary text treatment.
- Quick-stat chips: `bg-green-800 px-4 py-2 text-sm font-semibold` — **no `rounded` class**. DESIGN.md specifies `rounded` explicitly for these chips. They will render as sharp rectangles against a green background, inconsistent with every other interactive element on the page (`rounded-xl` cards, `rounded-full` pills, `rounded-md` buttons).

### 1C. KPI Stat Cards

Cards: `bg-white p-6 flex items-center gap-4`. 

**No shadow, no border.** DESIGN.md prescribes `bg-white rounded-xl shadow-sm border border-stone-200 p-6`. In practice:
- No `rounded-xl` — cards have square corners
- No `shadow-sm` — no elevation signal
- No `border border-stone-200` — no edge definition

`bg-white` (#ffffff) on `bg-stone-50` page background (#fafaf9) has a luminance contrast of approximately 1.05:1 — effectively invisible as a separating surface. The cards will appear to float on an undifferentiated background. There is no visual reason to believe they are interactive or are semantic containers rather than raw layout zones.

The SVG icons inside green/blue/amber/purple halos are present and correct — this is the one KPI element that follows the spec.

KPI metric values: `text-2xl font-bold text-stone-900` — correct per DESIGN.md.

### 1D. Temporal Bar Chart

```
renderTemporalChart → type: 'bar', backgroundColor: CHART_COLORS.temporalBar (#166534)
```

- Single-color green bars: clean and intentional.
- Grid: Y-axis shows `CHART_COLORS.gridLine (#e7e5e4)`, X-axis grid is disabled — appropriate.
- Axis titles: `font: { size: 11 }` — these will render in the browser's system sans-serif, NOT Inter, because `Chart.defaults.font.family` is not set anywhere in `app.js`.
- Tick labels: `font: { size: 10 }`, `maxRotation: 45`, `autoSkip: false` — at 10px rotated 45°, every month label is shown, which on a 5-year dataset will produce significant visual density on smaller screens.
- Legend: hidden (`display: false`) — correct; the single dataset needs no legend.
- The `insertGapMarkers()` pattern for missing months is a thoughtful design touch for scientific data.

### 1E. Sample Type Donut Chart

```
renderDonutChart → type: 'doughnut', cutout: '65%'
backgroundColor: CHART_COLORS.sampleTypes: ['#166534', '#047857', '#d97706', '#2563eb', '#a8a29e']
```

- Air → #166534 (CSU green), Plant → #047857 (emerald-700), Soil → #d97706 (amber-600), Liquid → #2563eb (blue-600), Unknown → #a8a29e (stone-400)
- `cutout: 65%` — a thin ring, which can make small segments hard to identify
- Legend: `position: 'right', usePointStyle: true` — appropriate for a donut
- **Critical inconsistency:** this palette does not match `CHART_COLORS.sliceSampleTypes` or the concurrent-timeline legend in the project group view (see §1J). The same categorical data has three different color encodings across the app.

### 1F. Pipeline Horizontal Bar Chart

```
renderPipelineChart → type: 'bar', indexAxis: 'y'
backgroundColor: CHART_COLORS.pipeline: ['#166534', '#16a34a', '#4ade80']
```

- Collected → #166534 (dark green), DNA Extracted → #16a34a (green-600), Sequenced → #4ade80 (green-400)
- **The "Sequenced" bar at #4ade80 (green-400) on white has a contrast ratio of approximately 1.7:1** — it is effectively invisible. The data story being told (what fraction made it to sequencing?) is encoded in the most illegible bar.
- `borderRadius: 4` on bars — a nice softening touch.
- The pipeline note below the chart (text-xs, italic) is a thoughtful scientific annotation.

### 1G. Samples-by-Site Horizontal Bar Chart

```
renderBySiteChart → type: 'bar', indexAxis: 'y'
backgroundColor: CHART_COLORS.siteBar: '#15803d' (green-700)
borderRadius: 0
```

- Single-color (green-700) bars, no radius. Why is this green-700 while the temporal chart uses green-800? They are nearly indistinguishable but the inconsistency is design noise.
- Dynamic height: `Math.max(300, sorted.length * 28)` — sensible.
- Y-axis truncation to 24 chars with ellipsis — a pragmatic solution.
- Map → chart cross-link: bar click highlights the map marker and flashes `#ea6c00` (orange) on the bars. This orange-as-highlight is the only other saturated color in the chart area and reads clearly as a different state.

### 1H. Leaflet Map

```
L.tileLayer('https://{s}.tile.openstreetmap.org/...')
circleMarker: fillColor #166534, color #14532d, fillOpacity 0.55
radius: Math.max(6, Math.min(22, Math.sqrt(site.count) * 2))
```

- OpenStreetMap's default tile is the primary visual problem with the map. It includes roads, park fills, water bodies (often green and blue), and dense label text. The CSU-green circle markers at 55% opacity will partially blend into vegetated/park areas on the map.
- The border color `#14532d` (green-900) is so close to the fill `#166534` (green-800) at the scale these are rendered that it provides negligible visual separation.
- Proportional radius encoding is scientifically appropriate.
- `role="application"` on the map div is correct for Leaflet.

### 1I. Data Table (Explorer)

```
rounded-lg border border-stone-200 overflow-hidden (wrapper)
thead: bg-stone-100 text-stone-600 text-xs font-semibold uppercase tracking-wide
tbody: alternating white / stone-50 via CSS, hover: stone-200
filter controls: bg-stone-50, select: border-stone-300
```

This is the best-behaved section — it matches DESIGN.md precisely. The alternating row, header, and hover treatment are all specified and applied. One gap: the `<select>` elements have no `rounded-md` class. They render with browser-native styling which on most OS/browsers means square corners.

### 1J. Concurrent Timeline Legend (Project Group View)

In `index.html` lines 300–303:
```html
<span>Air: bg-sky-500</span>
<span>Plant: bg-emerald-600</span>
<span>Soil: bg-amber-700</span>
<span>Liquid: bg-cyan-400</span>
```

This is a **third** color assignment for the Air/Plant/Soil/Liquid categories. Tallying all three:

| Category | Global Donut | Slice Donut | Timeline Legend |
|---|---|---|---|
| Air | #166534 (green-800) | #166534 (green-800) | sky-500 (#0ea5e9) |
| Plant | #047857 (emerald-700) | #0f766e (teal-700) | emerald-600 (#059669) |
| Soil | #d97706 (amber-600) | #b45309 (amber-700) | amber-700 (#b45309) |
| Liquid | #2563eb (blue-600) | #1d4ed8 (blue-700) | cyan-400 (#22d3ee) |
| Unknown | #a8a29e (stone-400) | #78716c (stone-500) | — |

Three different encoding schemes for the same data. This directly contradicts the scientific instrument quality goal.

### 1K. Slice Sidebar

```
slice-btn-all: bg-orange-50 text-orange-700 hover:bg-orange-100 focus:ring-orange-500
```

The "All BROADN Samples" button — the default state — appears orange. Orange signals "active filter" throughout the UI (filter chip, section title color), but here it's used for the unfiltered state. When a user selects a project filter, that button becomes neutral stone — the filter signal moves from the selected group to the section titles. This inverts the expected affordance.

### 1L. Orange Signal Semantics

The `slice-chart-title-active` CSS class sets `color: var(--color-orange-700)` (#b33a00). It is applied in the global, always-visible view to:
- `<h3>` "Sampler Replicate Tags (All)" — Pipeline section, line 669
- `<h3>` "Sampler Type Distribution (All)" — Pipeline section, line 674

These h3s are orange regardless of whether any filter is active. A researcher seeing orange headings on a dashboard that uses orange as its filter signal will wonder: "what filter is active?" The answer is: none. This is a false signal.

### 1M. Empty States

The only implemented empty state for a chart component is:
```
'<p class="text-sm text-stone-400 py-8 text-center">No sampler data available</p>'
```

This is plain text. DESIGN.md specifies the empty state must include: SVG icon + heading (`text-lg font-semibold`) + body text (`text-sm text-stone-500`) + optional CTA. The current implementation is missing three of four required elements.

### 1N. Typography and Font Application

Inter is correctly loaded via Google Fonts CDN (`line 10`). The `body` in `styles.css` has `font-family: "Inter", system-ui...`. However, `Chart.js` does not inherit CSS `font-family` from the document — it has its own defaults. Nowhere in `app.js` is `Chart.defaults.font.family` configured. Every chart label, tick, legend, and axis title renders in the browser's system font (typically Arial on Windows, Helvetica Neue on macOS). The mismatch between Inter body text and system-font chart labels is visible on any screen and undermines typographic consistency.

---

## Part 2 — Coherence Check Against DESIGN.md v1.0.0

| DESIGN.md Specification | Actual Implementation | Status |
|---|---|---|
| `KPI card: rounded-xl shadow-sm border border-stone-200 p-6` | `bg-white p-6` (no radius, no shadow, no border) | DRIFT |
| `Chart card: bg-white rounded-xl shadow-sm p-6` | `bg-white p-6` (no radius, no shadow) | DRIFT |
| `Hero stat chips: rounded` | No `rounded` class | DRIFT |
| `Inter font loaded via CDN` | Loaded correctly | OK |
| `Chart.js charts use Inter` | Not configured — system font renders | DRIFT |
| `No emoji icons in production` | `&#10044;` in nav (Unicode symbol, not SVG) | AMBIGUOUS |
| `No card border by default` | Map card has `border border-stone-200`; others don't | INCONSISTENCY |
| `filter-active-envelope replaced by chip` | Chip implemented (`slice-active-chip`) | OK |
| `slice-chart-title-active = filtered section signal` | Applied unconditionally to always-visible h3s | DRIFT |
| `CHART_COLORS.pipeline` consistent with slice | Global pipeline ≠ slice pipeline palette | DRIFT |
| `CHART_COLORS.sampleTypes` consistent | Global ≠ slice ≠ timeline legend | DRIFT |
| `Empty state: icon + heading + body + CTA` | Plain text only | DRIFT |
| `orange-700: #c2410c` (DESIGN.md) | styles.css `--color-orange-700: #b33a00`; CHART_COLORS uses `#ea6c00` | TOKEN CONFLICT |
| `Sidebar collapse toggle 44×44px` | Collapse button: `w-11 h-11` (44px) | OK |
| `Table: rounded-lg border border-stone-200 overflow-hidden` | Applied correctly | OK |
| `Table header: text-xs font-semibold uppercase tracking-wide` | Applied correctly | OK |

**Orange token conflict summary:**
- DESIGN.md `--color-filter-accent`: `#c2410c` (orange-700 Tailwind)
- `styles.css --color-orange-700`: `#b33a00` (custom, darker)
- `CHART_COLORS.orangeAccent`: `#ea6c00` (custom, lighter)
- Tailwind CDN `text-orange-700`: resolves to `#c2410c`

Four distinct orange values are in use simultaneously. The sidebar `text-orange-700` and the `CHART_COLORS.orangeAccent` bar highlight are visually different hues of orange.

---

## Part 3 — Critical Verdict: Top-Impact Problems

Ranked by impact on scientific credibility and user comprehension.

### #1 — Categorical Color Anarchy (HIGHEST IMPACT)

The same data categories (Air, Plant, Soil, Liquid) are assigned different colors in at least three chart contexts: the global donut chart, the slice donut chart, and the project group timeline legend. A researcher who sees Air samples displayed as green-800 in the Overview section, then sky-blue in the project timeline, then teal in the slice view, has no stable mental model. This is not a minor inconsistency — it actively misleads. In a scientific instrument, color is a semantic encoding that must be invariant for a given data dimension.

**Why it happens:** `CHART_COLORS.sampleTypes`, `CHART_COLORS.sliceSampleTypes`, and the inline `bg-sky-500 / bg-emerald-600 / bg-cyan-400` classes in the timeline legend are three independent, disconnected color assignments. There is no single source of truth for sample type color.

### #2 — Pipeline Color Ramp Renders Sequenced Data as Invisible

`CHART_COLORS.pipeline[2]` = `#4ade80` (green-400) on `bg-white` achieves approximately 1.7:1 contrast. The "Sequenced" bar — the key metric showing what fraction of samples produced usable data — is nearly invisible. This is the most important data point in the pipeline chart and it cannot be read.

### #3 — Chart.js Never Inherits Inter

Every chart in the dashboard — temporal bar, donut, pipeline, by-site, sampler type, slice variants — renders tick labels, axis titles, and legends in the browser's system font. On Windows this is Arial; on Linux it varies. This creates a visible typographic disconnect: the page reads in Inter, the charts read in a different face. In a dashboard where the charts are the product, this gap undermines the designed typographic system at the most visible surface.

### #4 — Card Surface Depth Is Absent

KPI cards and chart cards have `bg-white` on `bg-stone-50` (contrast ~1.05:1). Without `shadow-sm` or `border border-stone-200`, there is no visual boundary between the card and the page. Sections blend together. The one exception — the map card with `border border-stone-200` — looks structured while everything else floats. This inconsistency reads as an implementation error rather than a design choice.

### #5 — Orange Signal Is Inverted and Diluted

Orange has a designated role in this system: "active filter." But it appears in three states where no filter is active:
1. The "All BROADN Samples" sidebar button (always orange in the unfiltered default state)
2. The "Sampler Replicate Tags" h3 (always orange, global view)
3. The "Sampler Type Distribution" h3 (always orange, global view)

When orange is always present, it cannot signal "filter active." By the time a user selects a filter and orange appears in the active chip, it blends into existing orange rather than providing a clear signal.

### #6 — KPI Card Corners and Hero Chip Shape Inconsistency

KPI cards: no `rounded-xl` (sharp corners). Hero stat chips: no `rounded` (sharp rectangles). These exist in a design where filter chips are `rounded-full`, table wrapper is `rounded-lg`, and buttons are `rounded-md`. The shape vocabulary is established and rich — then the two most prominent elements (the KPI cards and the hero stats) are the only rectangular exceptions. This reads as oversight, not intention.

### #7 — Four Competing Orange Token Values

`#c2410c`, `#b33a00`, `#ea6c00`, and Tailwind's CDN `orange-700` (#c2410c) coexist in the same session. The styles.css token `--color-orange-700: #b33a00` diverges from the Tailwind `text-orange-700` class which resolves to `#c2410c`. Any element that uses the CSS custom property will be a different shade than one using the Tailwind class. In the sidebar filter, these elements sit adjacent.

### #8 — Leaflet Map Competes With Its Own Data

OpenStreetMap's default tile style renders roads, parks, buildings, and text labels in full detail. The green circle markers at 55% fill opacity partially merge with green park/forest fills on the base map. A minimal base tile (CartoDB Positron, which strips color from road infrastructure) would make the proportional markers stand out as the visual subject rather than as decoration on top of a road atlas.

---

## Part 4 — Proposed Design Language Direction

### 4A. Governing Principle: Precision Over Decoration

The BROADN dashboard is a scientific instrument first. The design language should communicate that: thin lines, deliberate neutrals, one accent color used with discipline, and chart aesthetics that prioritize legibility over brand expression inside the chart canvas.

The CSU-Green anchor (#166534) remains. The direction is not to remove color — it is to make every color choice load-bearing.

### 4B. Proposed Color Token Changes (v2)

#### Sample Type Categorical Palette (single source of truth)

Name this `SAMPLE_TYPE_COLORS` and encode by key, not by array index:

```javascript
const SAMPLE_TYPE_COLORS = {
  'Air':     '#0072B2',  // blue — new token: --color-type-air
  'Plant':   '#009E73',  // teal-green — new token: --color-type-plant
  'Soil':    '#E69F00',  // amber — new token: --color-type-soil
  'Liquid':  '#56B4E9',  // sky blue — new token: --color-type-liquid
  'Unknown': '#999999',  // neutral — new token: --color-type-unknown
};
```

These five come from the Okabe-Ito palette, the de-facto standard for colorblind-safe categorical scientific data. They are perceptually distinct for deuteranopia (red-green), the most common form of color blindness (affects ~8% of male readers). The current green-heavy palette performs poorly for this group. Flag for external validation by the RA: confirm Okabe-Ito is appropriate for the primary audience (academic biological sciences).

This palette replaces `CHART_COLORS.sampleTypes`, `CHART_COLORS.sliceSampleTypes`, the timeline legend inline Tailwind classes, and `CHART_COLORS.samplerType`.

#### Pipeline Stage Palette

Replace the green ramp with a three-hue set that:
- Is distinct from the sample-type palette
- Has no light step that disappears on white

```javascript
pipeline: ['#1e3a5f', '#2b6c8a', '#4db6c4']
// Collected: navy, DNA Extracted: teal-navy, Sequenced: light teal
```

Contrast check: #1e3a5f vs. white ≈ 11.1:1 (AAA). #2b6c8a vs. white ≈ 5.6:1 (AA). #4db6c4 vs. white ≈ 3.2:1 (fails AA for text but acceptable for a wide bar on a chart — check in context). Flag: the RA dossier should confirm whether a sequential or diverging pipeline palette is more conventional in biology/genomics dashboards.

New tokens:
```
--color-pipeline-collected: #1e3a5f
--color-pipeline-extracted: #2b6c8a
--color-pipeline-sequenced: #4db6c4
```

#### Orange Rationalization

Consolidate to a single orange value. The recommendation is to align with the Tailwind CDN resolution:

```
--color-filter-accent: #c2410c  (orange-700 — Tailwind CDN)
```

Delete `--color-orange-500` and `--color-orange-700` from `styles.css`. Update `CHART_COLORS.orangeAccent` to `#c2410c`. One orange, everywhere.

#### Site/Temporal Bar Color

Both `CHART_COLORS.siteBar` and `CHART_COLORS.temporalBar` should be the same value. Use the brand anchor:

```
--color-single-series-bar: #166534  (green-800, existing)
```

Delete `CHART_COLORS.siteBar` (currently green-700, #15803d — gratuitously different from temporalBar green-800). Unify to `temporalBar` referenced everywhere.

#### Heat Strip Ramp

The current `sliceHeatRamp: ['#f0fdf4', '#bbf7d0', '#15803d', '#166534']` has two nearly identical dark greens (steps 2 and 3). Replace with a 4-step ramp that has perceptible separation across all four buckets:

```
sliceHeatRamp: ['#f0fdf4', '#6ee7b7', '#15803d', '#064e3b']
// ghost → mint → green-700 → emerald-900
```

New tokens:
```
--color-heat-0: #f0fdf4   (empty / 0%)
--color-heat-1: #6ee7b7   (low: 1–33%)
--color-heat-2: #15803d   (mid: 34–66%)
--color-heat-3: #064e3b   (high: 67–100%)
```

### 4C. Chart.js Global Configuration

Add this block immediately after `Chart.js` loads and before any chart is instantiated (place at the top of the `<script>` block or in `app.js` before all render functions):

```javascript
// Design-system typography applied globally to all Chart.js instances.
// Reference: DESIGN.md v2 — Typography, Chart Aesthetic.
Chart.defaults.font.family = '"Inter", system-ui, -apple-system, Helvetica, Arial, sans-serif';
Chart.defaults.font.size = 12;
Chart.defaults.color = '#57534e'; // stone-600 — DESIGN.md --color-text-secondary
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(28,25,23,0.92)'; // --color-tooltip-bg
Chart.defaults.plugins.tooltip.titleColor = '#ffffff';
Chart.defaults.plugins.tooltip.bodyColor = '#ffffff';
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.titleFont = { size: 12 };
Chart.defaults.plugins.tooltip.bodyFont = { size: 12 };
Chart.defaults.scale.grid.color = '#e7e5e4'; // --color-border / stone-200
Chart.defaults.scale.grid.display = true;
```

This replaces per-chart tooltip and grid configurations with a single global source of truth. Existing per-chart overrides remain valid but are no longer required for the base aesthetic.

### 4D. Typography Refinements

**Temporal chart tick density:** Consider `autoSkip: true` with `maxTicksLimit: 18` on the X axis for the temporal chart. This reduces the 45° label rotation problem for 5-year monthly datasets without hiding significant gaps. The `insertGapMarkers()` pattern already communicates breaks, so skipped tick labels are tolerable.

**Axis title display:** The axis titles `'Samples'` and `'Collection Date (Month/Year)'` at `font.size: 11` are useful for scientific readers but noisy for a dashboard audience. Consider reducing the axis title to just the unit (e.g. `'samples'` lowercase, no X axis title at all). The chart title already says "Sampling Activity Over Time."

**Number formatting:** The `toLocaleString()` pattern in tooltips is correct. In chart tick callbacks, `val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val` is also correct. Ensure the locale separator format is consistent (e.g. 1,234 vs 1.234 depending on OS locale).

### 4E. Card and Surface Treatment

Restore card depth using shadow-only (no border on chart cards, border on interactive cards like the explorer table and the map):

```
KPI card:    bg-white rounded-xl shadow-sm p-6        (shadow-sm replaces border as separator)
Chart card:  bg-white rounded-xl shadow-sm p-6        (same as KPI for visual unity)
Map card:    bg-white rounded-xl border border-stone-200 p-4   (keep border — map content is interactive)
Data table:  bg-white rounded-lg border border-stone-200 overflow-hidden (keep — existing, correct)
Site panels: bg-white rounded-xl shadow-sm p-6        (Data Management site cards)
```

Rationale: `shadow-sm` on `bg-stone-50` reads as subtle lift rather than hard edge, which is better for a data-dense layout. Border on the map and table distinguishes them as interactive zones.

New token for DESIGN.md v2:
```
--shadow-card: shadow-sm   (Tailwind shadow-sm = 0 1px 2px rgba(0,0,0,0.05))
```

### 4F. Orange Signal Fix

Three changes to restore orange's meaning as "filter active":

1. **Sidebar default button:** Change "All BROADN Samples" from orange to green-active when selected:
   ```
   Active: bg-green-50 text-green-800 border-l-2 border-green-800 font-semibold
   Inactive: text-stone-700 hover:bg-stone-100
   ```
   This reads: "you are in the green/CSU mode" by default, and orange only appears when a sub-filter is engaged.

2. **Always-on orange h3s:** Remove `slice-chart-title-active` from `<h3>` "Sampler Replicate Tags (All)" and `<h3>` "Sampler Type Distribution (All)" in the global view. These headings are not slice-active. Use `text-stone-800` (the standard chart title color).

3. **Active filter signal:** The `slice-active-chip` (`rounded-full bg-orange-100 text-orange-700 border border-orange-300`) is correct — keep it. The `tag-filter-banner` orange is correct — keep it. These are the only legitimate uses of orange as a filter signal.

### 4G. Map Refinement

Switch the base tile to CartoDB Positron:

```javascript
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19
})
```

CartoDB Positron is free, does not require an API key for moderate traffic, and renders a clean gray-on-white base map that does not compete with data markers. The green CSU-green markers will read clearly against the pale gray infrastructure.

Also: increase `fillOpacity` to 0.75 and change the marker border to `color: '#ffffff'` (white) at `weight: 1.5`. This creates a clean white halo around each marker, improving legibility on both light and satellite imagery.

### 4H. Sampler Chart Log Scale Disclosure

The sampler type chart uses a logarithmic Y axis but does not disclose this. A 10x range in samples is shown as a linear visual distance equal to a 10% range. Add to the subtitle:

```html
<p class="text-sm text-stone-500 mb-4">
  Counts by sampler instrument (log scale — varies across several orders of magnitude).
</p>
```

Or add the chart title annotation: "Sampler Type Distribution (log scale)".

### 4I. Hero Chip Fix

```html
<!-- Add rounded class -->
<div class="bg-green-800 px-4 py-2 text-sm font-semibold rounded" id="hero-samples">—</div>
```

### 4J. Nav Logo Glyph

Replace `&#10044; BROADN` with:
- Option A: A simple inline SVG (a circle with an ascending arc — representing bioaerosol lift from a surface). This would be unique, printable, and correct.
- Option B: Remove the decorative glyph entirely. `BROADN` in `text-2xl font-bold text-green-800 tracking-tight` already reads as the wordmark.

The `&#10044;` is not a production-safe icon. It renders differently across platforms and has no accessible name.

### 4K. Empty States

Implement the DESIGN.md empty state pattern for all chart containers:

```html
<!-- Standard empty state -->
<div class="flex flex-col items-center py-10 px-4 text-center">
  <svg aria-hidden="true" class="w-10 h-10 text-stone-300 mb-3" ...><!-- relevant SVG path --></svg>
  <p class="text-base font-semibold text-stone-700">No data available</p>
  <p class="text-sm text-stone-500 mt-1">No [sampler / temporal / site] data is recorded for this selection.</p>
</div>
```

---

## Part 5 — Token Change Summary for DESIGN.md v2

### New Tokens Required

```
--color-type-air:             #0072B2   (Okabe-Ito blue)
--color-type-plant:           #009E73   (Okabe-Ito teal-green)
--color-type-soil:            #E69F00   (Okabe-Ito amber)
--color-type-liquid:          #56B4E9   (Okabe-Ito sky)
--color-type-unknown:         #999999   (neutral)
--color-pipeline-collected:   #1e3a5f   (navy)
--color-pipeline-extracted:   #2b6c8a   (steel blue)
--color-pipeline-sequenced:   #4db6c4   (light teal)
--color-heat-0:               #f0fdf4   (empty cell)
--color-heat-1:               #6ee7b7   (low)
--color-heat-2:               #15803d   (mid)
--color-heat-3:               #064e3b   (high)
--shadow-card:                shadow-sm  (Tailwind utility, documented as standard card elevation)
```

### Tokens to Delete / Consolidate

```
CHART_COLORS.siteBar          → merge into CHART_COLORS.temporalBar (#166534)
CHART_COLORS.sliceSampleTypes → delete; use SAMPLE_TYPE_COLORS by key
CHART_COLORS.samplerType      → delete; use SAMPLE_TYPE_COLORS by key
CHART_COLORS.slicePipeline    → replace with --color-pipeline-* set
styles.css --color-orange-500 → delete; consolidate to --color-filter-accent
styles.css --color-orange-700 → set to #c2410c (align with Tailwind CDN)
CHART_COLORS.orangeAccent     → update to #c2410c
```

---

## Part 6 — Places to Reconcile With the RA Evidence Dossier

The following decisions would benefit from validation against the external best-practices research being produced concurrently:

1. **Okabe-Ito palette adoption** — Is this palette conventional for biological sciences dashboards? Some aerobiome papers use Nature/Science color styles which differ. RA should confirm whether Okabe-Ito is recognized by the BROADN scientific audience or whether a domain-specific palette is more credible.

2. **Pipeline color convention** — In genomics dashboards, is there a conventional color-stage mapping for Collected → Extracted → Sequenced? RA should check NCBI SRA, EBI MetaGenomics, and iMicrobe interfaces.

3. **CartoDB Positron vs. ESRI Light Gray** — Both are minimal scientific base maps. RA should check whether ESRI Light Gray (available free via ArcGIS for Developers up to moderate tile requests) is more legible for a US-geography-focused environmental science audience.

4. **Log scale disclosure conventions** — What is the standard way to communicate a log-transformed axis in ecological/microbiome data visualization? Some journals require explicit axis labels; RA can check recent PNAS, Nature Microbiology, and ISME Journal figures.

5. **Chart.js as the long-term platform** — The RA dossier may surface evidence that Observable Plot or Vega-Lite better supports scientific chart conventions (proper logarithmic gridlines, axis breaks, error bars). This would be a larger architectural recommendation but worth flagging if the evidence is strong.

---

## Part 7 — WCAG Contrast Reference

Key pairs used or proposed in this spec:

| Element | Foreground | Background | Estimated Ratio | WCAG Level |
|---|---|---|---|---|
| Body text (stone-900) | #1c1917 | #fafaf9 | ~19.5:1 | AAA |
| Chart secondary text (stone-600) | #57534e | #ffffff | ~7.4:1 | AAA |
| Chart tick labels (stone-500 as default) | #78716c | #ffffff | ~4.6:1 | AA |
| Muted text (stone-400) | #a8a29e | #ffffff | ~2.8:1 | FAIL — never use for data labels |
| CSU Green (green-800) | #166534 | #ffffff | ~6.9:1 | AA |
| Orange filter accent (orange-700) | #c2410c | #ffffff | ~4.5:1 | AA (borderline — verify at 12px) |
| Proposed pipeline-collected (navy) | #1e3a5f | #ffffff | ~11.1:1 | AAA |
| Proposed pipeline-extracted | #2b6c8a | #ffffff | ~5.6:1 | AA |
| Proposed pipeline-sequenced | #4db6c4 | #ffffff | ~3.2:1 | FAIL for text — chart bar only |
| Proposed type-air (Okabe blue) | #0072B2 | #ffffff | ~5.9:1 | AA |
| Proposed type-plant (Okabe teal) | #009E73 | #ffffff | ~5.1:1 | AA |
| Proposed type-soil (Okabe amber) | #E69F00 | #ffffff | ~2.5:1 | FAIL for text — chart use only |
| Proposed type-liquid (Okabe sky) | #56B4E9 | #ffffff | ~2.3:1 | FAIL for text — chart use only |
| Proposed type-unknown (neutral) | #999999 | #ffffff | ~2.9:1 | FAIL for text — chart use only |

**Note on chart color WCAG:** WCAG 1.4.3 (contrast 4.5:1) applies to text. For chart fills (bars, donut segments), the relevant criteria are different — WCAG 1.4.11 (Non-Text Contrast, 3:1 minimum against adjacent colors). The pipeline-sequenced and type-soil/liquid/unknown chips fail text AA but pass non-text AA against white (all exceed 3:1). They must never be used for text labels — only as fill colors on white backgrounds.

---

## Appendix — Screenshot Capture Gap

Live screenshots were not captured. The following manual screenshots are recommended before finalizing the v2 direction:

1. Full-page scroll at 1440px viewport width
2. Overview section with all KPI cards and temporal chart
3. Pipeline section showing the "Sequenced" bar legibility issue
4. Slice sidebar in default (unfiltered) state showing orange button
5. Pipeline section showing orange h3 headings in global view
6. Project group concurrent timeline showing color legend
7. Map view at Colorado zoom level
8. Data Explorer table with filters applied
9. A project slice view showing the slice donut vs. global donut side-by-side

These screenshots, once captured, should be compared against the observations in §1A–1N above to confirm or correct the code-derived analysis.

---

*Prepared by UI#1 | Task: broadn-p10-design-language | DESIGN.md v1.0.0 in effect at design time*
