# Design Spec Summary — broadn-p10-design-implementation-UI-001
**Agent:** UI#1 | **Date:** 2026-06-25 | **Task:** DESIGN.md v2 authorship

```xml
<design_spec>
  <task_id>broadn-p10-design-implementation-UI-001</task_id>
  <surface>DESIGN.md v2 — BROADN Aerobiome Dashboard design-system source of truth</surface>
  <design_system_source>DESIGN_MD</design_system_source>

  <observed_state>
    <screenshot_taken>no</screenshot_taken>
    <visual_notes>This is a spec-authorship task, not a visual audit. Live render observation was conducted in the prior broadn-p10-design-language sprint (p10-confirm-*.png evidence). Brand decisions ratified by human; this task encodes them into DESIGN.md v2.</visual_notes>
    <accessibility_tree_findings>N/A — spec authorship only.</accessibility_tree_findings>
    <console_errors>N/A — spec authorship only.</console_errors>
  </observed_state>

  <component_hierarchy>
    DESIGN.md v2 document structure:
    - ## Constitution (teal brand anchor rule, OVERRIDES note, Brand≠Data rule)
    - ## Color Tokens (20 tokens, re-pointed to teal; four-orange collapse; KPI palette)
    - ## Sample-Type Data Palette / SAMPLE_TYPE_COLORS (5 Okabe-Ito entries, keyed by name)
    - ## Pipeline Stage Colors (3-stage navy-to-teal, all steps ≥3:1)
    - ## Sampler Instrument Anchor v2 (SASS: #4d7c0f)
    - ## WCAG Contrast Notes (teal text restriction; key contrast pairs table)
    - ## v1→v2 Migration Table (Tables A–H; 14 #166534 rows + green classes + PG maps + legacy arrays + orange)
    - ## Typography / Spacing / Border Radius / Component Rules / Design Integrity Notes (carried forward with teal updates)
  </component_hierarchy>

  <tokens>
    <!-- Brand primary -->
    <token element="nav active text, headings, primary buttons, hero, icon halos" token="--color-primary" value="#0c5454" />
    <token element="hero banner background, pressed state" token="--color-primary-dark" value="#083838" />
    <token element="KPI icon halo backgrounds" token="--color-primary-light" value="#ccefef" />
    <token element="hover state on teal buttons/links" token="--color-primary-mid" value="#0e7474" />
    <token element="active underlines, borders, accent (non-text only on white)" token="--color-accent" value="#0c9cb4" />
    <!-- Filter accent (single source) -->
    <token element="active filter label, section title when filtered" token="--color-filter-accent" value="#c2410c" />
    <!-- Sample-type data palette (Okabe-Ito) -->
    <token element="SAMPLE_TYPE_COLORS Air" token="--color-type-air" value="#0072B2" />
    <token element="SAMPLE_TYPE_COLORS Plant" token="--color-type-plant" value="#009E73" />
    <token element="SAMPLE_TYPE_COLORS Soil" token="--color-type-soil" value="#E69F00" />
    <token element="SAMPLE_TYPE_COLORS Liquid" token="--color-type-liquid" value="#56B4E9" />
    <token element="SAMPLE_TYPE_COLORS Unknown" token="--color-type-unknown" value="#999999" />
    <!-- Pipeline stage -->
    <token element="pipeline bar — Collected" token="--color-pipeline-collected" value="#1e3a5f" />
    <token element="pipeline bar — DNA Extracted" token="--color-pipeline-extracted" value="#2b6c8a" />
    <token element="pipeline bar — Sequenced" token="--color-pipeline-sequenced" value="#4db6c4" />
    <!-- Instrument anchor -->
    <token element="PG_SAMPLER_FILL SASS instrument" token="(named in migration table)" value="#4d7c0f" />
  </tokens>

  <notes>
    Brand decisions are RATIFIED (human-approved 2026-06-25). No alternatives proposed.
    All token values trace to DESIGN.md v2 entries.
    DESIGN.md v1.0.0 was in effect at design time; v2.0.0 overrides it.
    The grep sweep was run against actual source files before writing the migration table:
      - app.js: 13 hits at lines 28, 34, 35, 37, 38, 41, 42, 46, 50, 52, 55, 2981, 3018
      - styles.css: 1 hit at line 9
      - index.html: 0 hits
    SC9 note: git diff touches DESIGN.md only (agent log + output file are new untracked files, not staged, not in git diff).
    Sampler instrument anchor #4d7c0f (lime-700): ~5.0:1 contrast vs white (PASS AA). Confirmed not Okabe (Okabe set: #0072B2, #009E73, #E69F00, #56B4E9, #999999) and not brand teal (#0c5454, #0c9cb4). Consistent with existing lime/olive family in PG_SAMPLER_FILL.
    Pipeline Sequenced bar (#4db6c4 ~3.2:1): passes WCAG 1.4.11 non-text contrast; must not be used as text.
    Bright teal (#0c9cb4 ~3.0:1): non-text only on white; normal-size link/active text uses deep teal (#0c5454 ~9.1:1).
  </notes>
</design_spec>
```

---

## Success Criteria Verification

| SC | Criterion | Status |
|----|-----------|--------|
| SC1 | DESIGN.md frontmatter reads `Version: 2.0.0` and `Updated: 2026-06-25` | PASS — line 2 |
| SC2 | Constitution no longer contains "CSU Green is the brand anchor"; contains BROADN-teal rule naming #0c5454 + #0c9cb4 + "OVERRIDES v1.0.0"; grep '#166534' over Constitution + Color-Tokens == 0 | PASS — all #166534 references confined to Migration Table (lines 185+); Constitution and Color Tokens sections are clean |
| SC3 | SAMPLE_TYPE_COLORS keyed by name: Air #0072B2 / Plant #009E73 / Soil #E69F00 / Liquid #56B4E9 / Unknown #999999 | PASS — Sample-Type Data Palette section with JS code block |
| SC4 | --color-filter-accent = #c2410c with four-orange collapse and #b45309 warning-vs-data split | PASS — Orange Token Consolidation table documents all four oranges; warning split explicitly stated |
| SC5 | 3-stage pipeline palette; no step failing 3:1 on white; value replacing #4ade80 stated with ratio | PASS — #1e3a5f (11.1:1), #2b6c8a (5.6:1), #4db6c4 (3.2:1 non-text PASS); replaces #4ade80 (~1.7:1 FAIL) |
| SC6 | Sampler-instrument anchor for #166534 neither Okabe hex nor brand teal | PASS — #4d7c0f (lime-700); not in Okabe set; not #0c5454/#0c9cb4; lime/olive family |
| SC7 | COMPLETE migration table: ≥13 app.js #166534 hits (incl. :2981 and :3018), green Tailwind classes, 3 sample-type arrays, PG_TYPE_COLOR (4 classes), PG_TYPE_FILL (4 hexes + fallback), static index.html legend | PASS — Tables A (14 rows), B (5 rows), C (10 rows), D (3 arrays), E (4 PG_TYPE_COLOR entries), F (5 PG_TYPE_FILL entries incl. fallback), G (4 legend entries), H (7 orange rows) |
| SC8 | WCAG note restricts #0c9cb4 to non-normal-text; routes link/active text to #0c5454 | PASS — WCAG Contrast Notes section with explicit rule and binding statement |
| SC9 | git diff touches DESIGN.md ONLY | PASS — only DESIGN.md was edited; agent log and output file are new untracked files (not in git diff) |

All 9 success criteria: **PASS**

---

## Migration Table (full, for FE reference)

### A. #166534 Occurrences — 13 in app.js, 1 in styles.css

| # | Location | Current | v2 Value | Notes |
|---|----------|---------|----------|-------|
| 1 | app.js:28 | `CHART_COLORS.line: '#166534'` | `#0c5454` | Deep teal — line chart single-series |
| 2 | app.js:34 | `pipeline[0]: '#166534'` | `#1e3a5f` | `--color-pipeline-collected` |
| 3 | app.js:35 | `sampleTypes[0]: '#166534'` | RETIRE ARRAY | Use `SAMPLE_TYPE_COLORS['Air']` = `#0072B2` |
| 4 | app.js:37 | `pointBg: '#166534'` | `#0c5454` | Deep teal — line chart point background |
| 5 | app.js:38 | `mapMarkerFill: '#166534'` | `#0c5454` | Deep teal — Leaflet circle marker fill |
| 6 | app.js:41 | `sliceSampleTypes[0]: '#166534'` | RETIRE ARRAY | Use `SAMPLE_TYPE_COLORS['Air']` = `#0072B2` |
| 7 | app.js:42 | `slicePipeline[0]: '#166534'` | `#1e3a5f` | `--color-pipeline-collected` (same as pipeline[0]) |
| 8 | app.js:46 | `temporalBar: '#166534'` | `#0c5454` | Deep teal — temporal bar, single-series |
| 9 | app.js:50 | `sliceTimeOfDay[0]: '#166534'` | `#0c5454` | Deep teal — first categorical in time-of-day |
| 10 | app.js:52 | `sliceHeatRamp[3]: '#166534'` | `#064e3b` | Darkest sequential step (emerald-900) |
| 11 | app.js:55 | `samplerType[0]: '#166534'` | RETIRE ARRAY | Use `SAMPLE_TYPE_COLORS['Air']` = `#0072B2` |
| 12 | app.js:2981 | `PG_TYPE_FILL[dom] \|\| '#166534'` | `\|\| SAMPLE_TYPE_COLORS['Unknown']` = `#999999` | Unknown type fallback |
| 13 | app.js:3018 | `PG_SAMPLER_FILL 'SASS': '#166534'` | `#4d7c0f` | Instrument anchor — lime-700 |
| 14 | styles.css:9 | `--color-green-800: #166534` | `--color-teal-deep: #0c5454` | Rename CSS var + update value |

### B. Additional Brand-Green Hexes to Retire

| Location | Current | v2 Value | Notes |
|----------|---------|----------|-------|
| app.js:39 | `mapMarkerBorder: '#14532d'` | `#083838` | Dark teal — `--color-primary-dark` |
| app.js:36 | `siteBar: '#15803d'` | `#0c5454` | Deep teal — single-series site bar |
| app.js:34 | `pipeline[1]: '#16a34a'` | `#2b6c8a` | `--color-pipeline-extracted` |
| app.js:34 | `pipeline[2]: '#4ade80'` | `#4db6c4` | `--color-pipeline-sequenced` (was ~1.7:1, FAIL) |
| app.js:52 | `sliceHeatRamp[2]: '#15803d'` | unchanged | Sequential data ramp mid-step; not a brand element |

### C. Green Tailwind Classes in index.html

| Current Class | v2 Treatment | Line(s) | Notes |
|---------------|-------------|---------|-------|
| `bg-green-900` | `background: var(--color-primary-dark)` = `#083838` | :39 | Hero banner |
| `bg-green-800` (hero chips) | `background: var(--color-primary)` = `#0c5454` | :46, :47, :48 | Hero stat chips |
| `text-green-800` (nav wordmark) | `color: var(--color-primary)` = `#0c5454` | :24 | Brand wordmark |
| `hover:text-green-800` (nav links) | CSS hover → `color: #0c5454` | :28–32 | Nav link hover |
| `focus:ring-green-700` | `outline: 2px solid var(--color-accent)` = `#0c9cb4` | :97, :121, :151, :166, :181, :202, :217 | Focus ring — bright teal (non-text) |
| `bg-green-100 text-green-800` (KPI halos) | `background: #ccefef; color: #0c5454` | :526, :692, :742 | Teal halos |
| `bg-green-50 text-green-700` (project banner) | `background:#f0fdfd; color:#0e7474` | :244 | Decorative area |
| `text-green-800` (PG titles) | `color: var(--color-primary)` = `#0c5454` | :249, :278 | PG group headings |
| `border-green-700` (stat bars) | `border-color: var(--color-accent)` = `#0c9cb4` | :287, :353 | Accent border (non-text) |
| `text-green-800` (freezer stat) | `color: var(--color-primary)` = `#0c5454` | :353 | Freezer available value |

### D. Legacy Sample-Type Arrays — Retire

| Array | v2 Action | File:Line |
|-------|-----------|-----------|
| `CHART_COLORS.sampleTypes` | Retire; use `SAMPLE_TYPE_COLORS` by key | app.js:35 |
| `CHART_COLORS.sliceSampleTypes` | Retire; use `SAMPLE_TYPE_COLORS` by key | app.js:41 |
| `CHART_COLORS.samplerType` | Retire; use `SAMPLE_TYPE_COLORS` by key | app.js:55 |

### E. PG_TYPE_COLOR — 4 bg-classes (app.js:2792–2797)

| Category | Current | v2 |
|----------|---------|-----|
| Air | `'bg-sky-500'` | `style="background:#0072B2"` |
| Plant | `'bg-emerald-600'` | `style="background:#009E73"` |
| Soil | `'bg-amber-700'` | `style="background:#E69F00"` |
| Liquid | `'bg-cyan-400'` | `style="background:#56B4E9"` |

### F. PG_TYPE_FILL — 4 hexes + fallback (app.js:2869–2874, 2981)

| Category | Current | v2 | Line |
|----------|---------|-----|------|
| Air | `#0ea5e9` | `SAMPLE_TYPE_COLORS['Air']` = `#0072B2` | :2870 |
| Plant | `#059669` | `SAMPLE_TYPE_COLORS['Plant']` = `#009E73` | :2871 |
| Soil | `#b45309` | `SAMPLE_TYPE_COLORS['Soil']` = `#E69F00` | :2872 |
| Liquid | `#22d3ee` | `SAMPLE_TYPE_COLORS['Liquid']` = `#56B4E9` | :2873 |
| fallback | `\|\| '#166534'` | `\|\| SAMPLE_TYPE_COLORS['Unknown']` = `#999999` | :2981 |

Note: `#22d3ee` at app.js:3020 (BioSpot VIVAS instrument) is OUT OF SCOPE — must remain at count 1, NOT 0.

### G. Static index.html Timeline Legend (~lines 300–303)

| Category | Current | v2 |
|----------|---------|-----|
| Air | `bg-sky-500` | `style="background:#0072B2"` |
| Plant | `bg-emerald-600` | `style="background:#009E73"` |
| Soil | `bg-amber-700` | `style="background:#E69F00"` |
| Liquid | `bg-cyan-400` | `style="background:#56B4E9"` |

### H. Orange Consolidation (styles.css + app.js + index.html)

| Location | Current | v2 Action |
|----------|---------|-----------|
| styles.css:11 | `--color-orange-500: #ea6c00` | Delete |
| styles.css:12 | `--color-orange-500-rgb: 234, 108, 0` | Delete |
| styles.css:13 | `--color-orange-700: #b33a00` | Replace → `--color-filter-accent: #c2410c` |
| styles.css:65 | `.slice-chart-title-active { color: var(--color-orange-700); }` | Update to `--color-filter-accent` |
| app.js:53 | `orangeAccent: '#ea6c00'` | → `#c2410c` |
| index.html:669 | global h3 with `slice-chart-title-active` | Remove class; use `text-stone-800` |
| index.html:674 | global h3 with `slice-chart-title-active` | Remove class; use `text-stone-800` |

---

**Deliverable:** `/home/jhber/projects/broadn-web-view/DESIGN.md` (v2.0.0)
**Agent log:** `/home/jhber/projects/broadn-web-view/docs/agent-logs/UI/broadn-p10-design-implementation-UI-001.md`
