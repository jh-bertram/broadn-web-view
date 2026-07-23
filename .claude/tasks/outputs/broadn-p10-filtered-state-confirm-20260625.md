---
type: render-evidence
task: broadn-p10-design-language
date: 2026-06-25
method: live Playwright browser_evaluate against http://localhost:8771/index.html (Chart.js instance introspection + getComputedStyle)
---

# P10 Filtered-State Confirmation — findings #1 & #7

Two findings were **CANNOT-TELL** from the rest-state AUD captures. They are now
**CONFIRMED** from the live render via direct Chart.js-instance + computed-style
introspection (more dispositive than screenshot wedge-hue comparison).

## Finding #1 — Categorical Color Anarchy → **CONFIRMED**

The five sample-type categories (Air, Plant, Soil, Liquid, Unknown) carry **three
distinct color encodings** simultaneously, selected by view:

| Category | Global donut (`CHART_COLORS.sampleTypes`) | Slice donut/sampler (`sliceSampleTypes` / `samplerType`) | Concurrent-timeline legend (app.js:2870) |
|---|---|---|---|
| Air     | `#166534` green-800  | `#166534` green-800 | **`#0ea5e9` sky-500** |
| Plant   | `#047857` emerald-700 | **`#0f766e` teal-700** | — |
| Soil    | `#d97706` amber-600  | **`#b45309` amber-700** | — |
| Liquid  | `#2563eb` blue-600   | **`#1d4ed8` blue-700** | **`#22d3ee` cyan-400** |
| Unknown | `#a8a29e` stone-400  | **`#78716c` stone-500** | — |

- **4 of 5** categories render a *different* hex between the global donut and the slice
  donut (verified live: `donutChart` dataset bg vs. `CHART_COLORS.sliceSampleTypes`).
- The concurrent-timeline legend (`renderProjectGroupView`, app.js:2790/2870) maps Air→sky
  and Liquid→cyan — a **third** hue family for the same categories (a green/teal Air becomes
  blue; a blue Liquid becomes cyan). This path is dormant in the current dataset
  (`appData.slice_views.project_group` empty) but is live code and ships the divergence.
- **Implication for the sprint:** a single Okabe-Ito sample-type palette keyed by
  category-name must replace all three arrays (`sampleTypes`, `sliceSampleTypes`,
  `samplerType`, and the inline sky/cyan legend map).

## Finding #7 — Four Competing Orange Token Values → **CONFIRMED**

Live computed text colors present on the rest-state page, **three distinct oranges
simultaneously**, plus a fourth on the chart canvas:

- `rgb(194,65,12)` = **`#c2410c`** — Tailwind `text-orange-700` (slice "All BROADN" button)
- `rgb(179,58,0)` = **`#b33a00`** — CSS `--color-orange-700` (always-on section h3 titles)
- `rgb(180,83,9)` = **`#b45309`** — amber-700 (slice Soil wedge / sampler series)
- `#ea6c00` = **`CHART_COLORS.orangeAccent`** — bar-highlight accent on chart canvas (not a
  text color, so absent from the computed-text sweep but confirmed in the constant)

`--color-filter-accent` resolves to empty (DESIGN.md's `#c2410c` token is **not wired** into
the live CSS), so the intended single filter-accent token does not exist at runtime — the UI
falls back to four ad-hoc oranges. The sprint must collapse these to one filter-accent token.

## Net effect on the eval
Both findings move from CANNOT-TELL → **CONFIRMED**. Combined with the rest-state-confirmed
findings (#5 inverted orange signal, pale Sequenced bar, charts not in Inter, rectangular hero
chips), the implementation sprint scope in the task spec stands unchanged and is fully evidenced.
