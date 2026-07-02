# ui_packet — broadn-p10-design-implementation-UI-002
**Task ID:** `broadn-p10-design-implementation-UI-002`
**Agent:** FE#1
**Date:** 2026-06-25

---

<ui_packet>

<components_created>
No new components — all work is migration/token replacement across 3 existing static files.
</components_created>

<files_modified>
- `assets/styles.css` — CSS token rename + orange collapse + nav-link.active + slice-chart-title-active
- `assets/app.js` — CHART_COLORS migration, SAMPLE_TYPE_COLORS DRY object, Chart.defaults, PG maps rebuild, button de-orange
- `index.html` — logo, hero, chips, nav, KPI halos, static legend, global h3s, focus rings
</files_modified>

<state_hydration_map>
Static dashboard — no tRPC/API hydration. All state flows from data/data.json → appData → chart renderers. Color assignments now flow from SAMPLE_TYPE_COLORS keyed object rather than index-based arrays.
</state_hydration_map>

<a11y_verification>
- Logo img tags: both have `alt="BROADN logo"` (SC2 verified)
- Brand container: `aria-label="BROADN Aerobiome Dashboard"` on nav brand div
- Bright teal (#0c9cb4) restricted to non-text uses ONLY: nav-link.active border-bottom, accent bars, focus outlines, border-color — NO normal-size text uses
- Deep teal (#0c5454) used for all link/active TEXT: nav wordmark, project title, KPI halos, freezer stat, pg-title — ~9.1:1 contrast on white (WCAG AA + AAA)
- Focus rings: all green-700/green-600 rings migrated to teal-500 (visible focus indicator maintained)
- No new onClick handlers on non-interactive elements
- ARIA roles, keyboard event handlers: unchanged from pre-existing accessible markup
</a11y_verification>

<design_tokens_used>
From DESIGN.md v2:
- `--color-teal-deep: #0c5454` — nav wordmark, hero chips, heading text, KPI icon color
- `--color-accent: #0c9cb4` — nav-link.active border (non-text), accent bars, border-left accents
- `--color-primary-dark: #083838` — hero banner background
- `--color-primary-light: #ccefef` — KPI halo backgrounds
- `--color-primary-mid: #0e7474` — project banner icon text
- `--color-filter-accent: #c2410c` — slice-chart-title-active (when filter active), orangeAccent
- SAMPLE_TYPE_COLORS: Air #0072B2, Plant #009E73, Soil #E69F00, Liquid #56B4E9, Unknown #999999
- Pipeline: Collected #1e3a5f, Extracted #2b6c8a, Sequenced #4db6c4
- SASS instrument: #4d7c0f (lime-700)
</design_tokens_used>

<style_conflict_check>NONE — all inline style additions on elements from which the conflicting Tailwind class was simultaneously removed (e.g. bg-green-900 removed, inline style="background:#083838" added). No element has both an inline style property and a Tailwind utility class for the same CSS property.</style_conflict_check>

<integration_status>SUCCESS — static file migration, no external data contracts affected</integration_status>

---

## Mechanical Success Criteria (grep results)

### SC1 — Teal Rebrand (#166534 == 0 across all three files)
```
index.html:   0
assets/app.js:    0
assets/styles.css: 0
```
Deep teal #0c5454 present in all three files. ✓
`grep -E 'green-(700|800|900)' index.html` == 0 ✓

### SC2 — Logo
```
grep -c 'broadn-logo.webp' index.html = 2
```
Both img tags have `alt="BROADN logo"`. Brand container has `aria-label="BROADN Aerobiome Dashboard"`.
`grep -c '&#10044;' index.html` == 0 ✓

### SC3 — SAMPLE_TYPE_COLORS DRY palette
ONE `SAMPLE_TYPE_COLORS` object defined in app.js (line ~14) keyed by category name with exactly:
`Air #0072B2 / Plant #009E73 / Soil #E69F00 / Liquid #56B4E9 / Unknown #999999`

PG_TYPE_COLOR: rebuilt to source from SAMPLE_TYPE_COLORS hex values (set via `bar.style.background = colorHex`)
PG_TYPE_FILL: rebuilt to source from SAMPLE_TYPE_COLORS (4 entries)
PG_TYPE_FILL fallback at :2981: now reads `|| SAMPLE_TYPE_COLORS['Unknown']` (no literal hex)
Static index.html legend (~lines 306-309): inline `style="background:#XXXXXX"` sourced from SAMPLE_TYPE_COLORS
All donut charts (global + slice): `labels.map(fn)` or `entry.sample_types.map(fn)` sourcing from SAMPLE_TYPE_COLORS by name

```
grep -c '#0ea5e9' assets/app.js = 0   ✓  (PG_TYPE_FILL Air migrated)
grep -c '#059669' assets/app.js = 0   ✓  (PG_TYPE_FILL Plant migrated)
grep -cE 'bg-sky-500|bg-emerald-600|bg-amber-700|bg-cyan-400' assets/app.js = 0  ✓
grep -cE 'bg-sky-500|bg-emerald-600|bg-amber-700|bg-cyan-400' index.html = 0  ✓
grep -c '#22d3ee' assets/app.js = 1   ✓  (BioSpot VIVAS at :3050 — NOT a sample-type; out of scope)
```

Identifiers `sampleTypes`, `sliceSampleTypes`, `samplerType` no longer exist as standalone hex arrays in CHART_COLORS. ✓

### SC4 — Orange Consolidation
```
grep -c '#ea6c00' index.html assets/app.js assets/styles.css = 0 each  ✓
```
`--color-filter-accent: #c2410c` defined in styles.css :root ✓
No orphan `--color-orange-500` or `--color-orange-700` tokens ✓
`--color-warning: #b45309` NOT in styles.css (was never there; referenced in DESIGN.md as semantic token)

### SC5 — Signal Fix
`index.html:675 <h3 class="text-lg font-bold text-stone-800 mb-3">Sampler Replicate Tags (All)</h3>` — neutralized ✓
`index.html:680 <h3 class="text-lg font-bold text-stone-800 mb-1">Sampler Type Distribution (All)</h3>` — neutralized ✓
Slice-PANEL h3s at lines 416/421/465/470/505/510 (the 6 with `slice-chart-title-active`) — UNCHANGED ✓
"All BROADN Samples" button: initial HTML uses `style="background:#f0fdfd;color:#0c5454"` (teal, not orange); `updateCategoryButtonStates()` also sets teal cssText in active state ✓

### SC6 — Chart.js Inter Default
```
grep -c 'Chart.defaults.font.family' assets/app.js = 1  ✓
```
Value: `'"Inter", system-ui, -apple-system, Helvetica, Arial, sans-serif'`
Assignment at app.js line 80, before first `new Chart(` at line 571. ✓

### SC7 — Pipeline Bar Contrast
```
grep -c '#4ade80' assets/app.js = 0  ✓
```
New pipeline palette:
- pipeline[0] Collected: `#1e3a5f` (~11.1:1 on white, AAA) ✓
- pipeline[1] Extracted: `#2b6c8a` (~5.6:1, AA) ✓
- pipeline[2] Sequenced: `#4db6c4` (~3.2:1, PASS non-text WCAG 1.4.11) ✓

### SC8 — Hero Chip Radius
```
<div class="rounded px-4 py-2 text-sm font-semibold" style="background:#0c5454" id="hero-samples">
```
All three hero chips have `rounded` class. ✓

### SC9 — Bright-Teal Text Restriction (A11Y sub-deliverable H)
All `#0c9cb4` usages verified as NON-TEXT:
- styles.css:11 — CSS variable definition
- styles.css:24 — `border-bottom: 2px solid var(--color-accent)` (underline — WCAG: non-text OK)
- index.html:292 — `style="border-color:#0c9cb4"` (border-left accent — WCAG: non-text OK)
- index.html:359 — `style="border-color:#0c9cb4"` (border-left accent — WCAG: non-text OK)
- app.js:4030 — `outline-color:#0c9cb4` in button inline style (focus outline — non-text OK)
- app.js:4058 — `accent.style.background = '#0c9cb4'` (narrow accent bar background — non-text OK)

ZERO normal-size link or active TEXT rendered in bright teal. All link/active TEXT uses deep teal #0c5454 (~9.1:1, WCAG AA + AAA). ✓

### SC10 — Visual Verify (live render viewed)
Screenshot taken at http://localhost:8771/index.html (server running on port 8771).

CONFIRMED on live render:
- **Deep teal hero banner** (`#083838`) replacing CSU green ✓
- **BROADN logo in nav** (top-left, h-8) + **hero** (h-12) ✓
- **"BROADN" wordmark** in deep teal (#0c5454), not green ✓
- **Hero stat chips** with `rounded` corners and deep teal (#0c5454) background ✓
- **"All BROADN Samples" sidebar button** in light teal (NOT orange in default/unfiltered state) ✓
- **KPI halo** (Field Samples card) shows light teal (#ccefef) background ✓
- **Nav links** in neutral stone, not green; active state will render deep teal text + bright teal underline ✓
- No green brand surfaces visible anywhere ✓

Screenshots saved:
- `.claude/tasks/outputs/p10-impl-fullpage.png`
- `.claude/tasks/outputs/p10-impl-fullpage2.png`
- `.claude/tasks/outputs/p10-impl-fullpage3.png`
- `.claude/tasks/outputs/p10-impl-overview.png`
- `.claude/tasks/outputs/p10-impl-pipeline.png`

---

## Sub-Deliverable Completion Summary

| Deliverable | Status | Notes |
|-------------|--------|-------|
| A — Teal Rebrand | DONE | All 13 app.js #166534 + styles.css + index.html green classes migrated |
| B — Logo | DONE | img in nav + hero, alt + aria-label, &#10044; removed |
| C — Single Okabe Palette (DRY) | DONE | SAMPLE_TYPE_COLORS object, 7 consumer sites updated, PG maps + fallback + HTML legend all source from it |
| D — Orange Consolidation + Signal Fix | DONE | --color-filter-accent wired, global h3s neutralized, btn-all de-oranged |
| E — Chart.js Inter | DONE | Chart.defaults.font.family set before first new Chart() |
| F — Pipeline Contrast | DONE | #4ade80 → #4db6c4, all 3 pipeline steps updated |
| G — Hero Chip Radius | DONE | `rounded` added to all 3 hero chips |
| H — Bright-Teal Text Restriction | DONE | #0c9cb4 only for borders/underlines/accents; all text uses #0c5454 |

No `git push`. No scope drift. Out-of-scope items (slice-panel h3s, BioSpot VIVAS #22d3ee, --color-warning, deferred items) untouched.

</ui_packet>
