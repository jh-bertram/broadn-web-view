---
type: project-doc
---

# BROADN Web-View — Complexity-Review Findings

**Written:** 2026-06-23 · **Branch:** main · **Author:** Claude (ORC)
**Method:** Critical-eye evaluation pass per the agenda in `docs/COMPLEXITY-REVIEW.md`.
Firsthand read of the slice subsystem + an independent adversarial critic pass
(`.claude/tasks/outputs/complexity-slice-critic-CR-20260623.md`). **Analysis only — no
`index.html` changes were made this session.**

---

## ⚠ STATUS UPDATE — 2026-06-25 (the headline refactors have shipped)

> This document's "before" metrics (§1) and refactor plan (§8) were written on
> 2026-06-23. **Steps 1 and 2 have since landed**, in sprints that post-date this
> analysis (the Phase 2b / Phase 3 work — commits `b6c42d7`, `07cf8cc`, `f653d2c`).
> The body below is **retained verbatim as the historical "before" record**; read it
> through this banner.

**Refactor-plan status (§8):**

| # | Step | Status (2026-06-25) | Evidence |
|---|---|---|---|
| **1** | Extract inline JS → `assets/app.js`, CSS → `assets/styles.css` | ✅ **DONE** | `index.html` **4,577 → 915 lines**; `assets/app.js` (4,555 lines) linked at `index.html:895`, `assets/styles.css` (124 lines) at `index.html:16`. Only **one** inline `<script>` remains — a 13-line nav-shadow IIFE (`index.html:898–911`). |
| **2** | Collapse 3 slice renderers → one `renderSlice(descriptor)` | ✅ **DONE** (and exceeded) | `renderSlice(descriptor, entry, gridEl)` at `app.js:2464`; `renderProjectView`/`renderLocationView`/`renderLabGroupView` all delegate to it. Went further than planned: a descriptor/widget-palette system driven by `data/project-layouts.json` + a gated `designer-mode` for editing layouts. |
| **3** | Cut the 3 per-slice sampler charts | ⚠ **OBVIATED, not cut** | Charts are now **widget-driven** via the layout palette (`paletteWidget('bar', 'sampler_type_dist', …)`). The sampler chart is an optional, per-layout config item, not hardcoded triplication. Dropping it is now a config change (edit the layout), not a refactor. |
| **4** | Fold `PG_*` color maps into `CHART_COLORS`; fix stale "Polar Area" comment | ⬜ **Open** (XS, low value) | Not separately verified post-refactor. |
| **5** | De-stack altitudes (design decision) | ⬜ **Still open** | The genuine remaining question — exhibit vs. research tool (§3). A design call for Jonathan; the descriptor/layout system may now make options easier. |
| **6** | Trim `data.json` cross-tab redundancy | ⬜ **Open, worse** | `data/data.json` is now **~2,127 KB** (was 1,957 KB). Still a `preprocess_data.py` concern. |

**Current ground-truth metrics (the new "after"):**

| Metric | 2026-06-23 (before) | 2026-06-25 (now) |
|---|---|---|
| `index.html` | 4,577 lines / 218 KB | **915 lines** |
| Inline JS | ~3,600 lines (79% of file) | **13 lines** (one nav IIFE) |
| Inline CSS | ~95 lines | **0** (in `assets/styles.css`) |
| `render*View` copies | 3 near-duplicate | **1** (`renderSlice`) + thin per-view wrappers |
| `new Chart(` calls | 20 | **28** (dashboard grew: project pages, designer widgets) |
| `data/data.json` | 1,957 KB | **2,127 KB** |

**What's actually left from this review:** the small `PG_*`/comment tidy (§8 step 4),
the `data.json` trim (§7/§8 step 6), and — the only substantive one — the **altitude
design decision** (§3/§8 step 5).

---

## 0. Bottom line

The complexity is real but **concentrated and tractable**. Two changes recover the
overwhelming majority of the streamline value at low-to-moderate risk:

1. **Extract the ~3,600 lines of inline JS (79% of the file) and ~95 lines of inline CSS
   to `assets/`** — shrinks `index.html` from 4,577 → ~980 lines with *zero* behavior
   change. Pure mechanical win. Precedent already exists (`assets/feedback-*.js`).
2. **Collapse the three near-duplicate slice renderers into one parameterized
   `renderSlice(descriptor)`** — removes ~180–220 lines of copy-paste and makes the
   chart inventory editable in one place instead of three.

A third, smaller win: **cut the three per-slice sampler charts** (near-zero info gain).

The deeper *product* question — should one page be both a public exhibit and a research
tool? — is a design decision, not a code cleanup. Recommendation in §3 and §8: **keep one
page, but stop stacking the two altitudes in one scroll column.**

---

## 1. Current metrics (ground truth, the "before")

| Metric | Value | Source |
|---|---|---|
| `index.html` total | **4,577 lines / 218 KB** | `wc` |
| Inline JS (main `<script>` 970–4557) | **~3,587 lines (~79% of file)** | line bounds |
| Inline JS (second `<script>` 4560–4573) | ~13 lines | line bounds |
| Inline CSS (`<style>` 15–109) | **~95 lines** | line bounds |
| Actual HTML markup | **~880 lines** | remainder |
| Chart.js charts (`new Chart(` / `<canvas>`) | **20 / 20** | grep |
| `render*View` functions | **5** | grep |
| `data/data.json` | **1,957 KB (~1.9 MB)** | `wc` |
| Already-external assets | `assets/feedback-config.js`, `assets/feedback-widget.js` | grep |

**Read this table as the leverage map:** 79% of the file is one inline script, and 15 of
the 20 charts live in the slice subsystem where 3 of the 4 chart types are triplicated.

---

## 2. The 20-chart inventory — keep / consolidate / cut

Charts grouped by where they live. Verdict bias per the agenda: *default to removal,
require a reason to keep.*

### Global / public story (5) — **KEEP all**
| Chart | Verdict | Reason |
|---|---|---|
| `temporalChart` | KEEP | Sole program-wide time axis; layperson entry point |
| `bySiteChart` | KEEP | Only site-comparison view; cross-links to map |
| `donutChart` | KEEP | Program-wide sample-type composition |
| `pipelineChart` | KEEP | Program-wide processing funnel; carries the caption |
| `globalSamplerChart` | KEEP | Only program-wide sampler-mix view |

### Project-group / CPER bespoke page (2) — **KEEP**
| Chart | Verdict | Reason |
|---|---|---|
| `pgDailyStackChart` | KEEP | Unique daily-stack view; no equivalent elsewhere |
| `pgSamplerMonthChart` | KEEP | Unique sampler×month view; bespoke to CPER |

### Slice Project / Location / Lab-Group (13) — mostly **CONSOLIDATE**, three **CUT**
| Chart | Verdict | Reason |
|---|---|---|
| `sliceProjectTypesChart` / `sliceLocationTypesChart` / `sliceLabGroupTypesChart` | **CONSOLIDATE** | Byte-identical doughnut block ×3 (see §4) |
| `sliceProjectPipelineChart` / `sliceLabGroupPipelineChart` | **CONSOLIDATE** | Byte-identical pipeline block ×2 |
| `sliceProjectTemporalChart` / `sliceLocationTemporalChart` / `sliceLabGroupTemporalChart` | **CONSOLIDATE** | Byte-identical temporal block ×3 |
| `sliceProjectSamplerChart` / `sliceLocationSamplerChart` / `sliceLabGroupSamplerChart` | **CUT** | A single project/location/lab-group usually uses 1–2 samplers — this log-bar restates the doughnut + tag badges for near-zero marginal info |
| `sliceLocationSubsitesChart` | KEEP | Unique to Location; no equivalent |
| `sliceLocationTimeDistChart` | KEEP | Unique to Location (time-of-day); shown only when data present |

**Net chart effect of the recommendations:** 20 → **17 charts** (cut 3 samplers), and the
remaining 8 consolidated slice charts collapse from **three code copies to one renderer**
(the chart *count* stays but the *code* that builds them is unified — see §4).

**Key observation:** the slice subsystem invents **no new chart type** beyond the global
page except Location's sub-sites and time-of-day. Every other slice chart is a global
chart re-scoped to a filter. *That* is the core inflation.

---

## 3. The central architectural tension (altitude) — confirmed in the layout

The agenda hypothesized "two dashboards stacked in one file." The DOM confirms it is
literally **two dashboards stacked in one scroll column**:

- `<main>` → `#dashboard-layout` is `flex lg:flex-row`: a **persistent left rail**
  (`#slice-sidebar-wrapper`, 16rem sticky — "Slice by: All BROADN Samples / Project /
  Location / Lab Group") + a flex-grow `#dashboard-body`.
- `#dashboard-body` holds, in source order: `#slice-view-container` (**`hidden` by
  default**, line 324) followed by the five public story sections — `#overview` (610),
  `#geography` (694), `#pipeline`/Sample-Breakdown (728), `#data-management` (775),
  `#explorer` (897).
- **Default state:** "All BROADN Samples" active → slice container hidden → visitor reads
  the public scroll story.
- **On selecting a slice:** `#slice-view-container` *appears at the top of the same
  column*; the public story sections **remain below it**. The slice result does not
  replace the narrative — it stacks on top of it.

So a power-user filter result and a layperson narrative occupy one viewport and one
scroll. The persistent left rail is also a second navigation model competing with the top
nav (`#overview … #explorer`). This is the genuine UX cost, distinct from code
duplication.

**Recommendation (design, gated separately):** keep a single page and the no-framework
constitution, but **stop stacking altitudes**. Options, in increasing effort:
- (a) When a slice is active, **collapse/hide the public story sections** (they're already
  below) so the slice view is the focused surface, with a clear "← All BROADN Samples"
  return. Lowest effort, removes the stacking.
- (b) Make the slice tool a distinct **"Explore" surface** reachable from the nav, leaving
  the landing as a clean public story. Higher effort.
- This decision is **not** prerequisite to §4–§6 cleanups and should be made by Jonathan.

---

## 4. Slice-view duplication — firsthand + critic, in agreement

Three collapsible renderers (excluding the bespoke CPER `renderProjectGroupView` @2877 and
the `renderView` dispatcher @3876, both of which stay):

| Renderer | Lines | Span |
|---|---|---|
| `renderProjectView` | ~119 | 3447–3565 |
| `renderLocationView` | ~169 | 3571–3739 |
| `renderLabGroupView` | ~121 | 3745–3865 |

**Measured duplication: ~178 lines of near-pure copy-paste (~43% of the 409-line
region).** Verified by direct read:
- **Doughnut block** (3466–3498 / 3635–3667 / 3766–3798): identical, *including* the
  cross-tab tooltip callback.
- **Pipeline block** (3500–3541 / 3800–3841): identical between Project & Lab-Group
  (Location omits pipeline).
- **Temporal block** (3543–3559 / 3669–3685 / 3843–3859): identical, including the IIFE
  that grafts the cross-tab tooltip onto `buildTemporalChartOptions()`.
- **Sampler** (3561–3564 / 3735–3738 / 3861–3864): all three call shared
  `renderSamplerTypeChart()` then post-mutate the tooltip label — differ only by the label
  field (`project_id` / `site_name` / `group_name`).

**Verdict: collapse to one `renderSlice(descriptor)` is warranted. Net saving ≈ 180–220
lines. Risk: LOW–MODERATE.** Three load-bearing hazards an implementer must respect (these
are why a naive collapse breaks things):

1. **Location's key vs label mismatch:** it looks up by `site_code` (3582) but labels the
   sampler tooltip with `site_name` (3738). A single-field collapse regresses that tooltip.
2. **Location is structurally different:** it omits the pipeline chart and adds two unique
   charts (sub-sites 3593–3633; time-of-day 3687–3733, with its own
   `slice-location-timeofday-card` show/hide). The descriptor's chart list must be
   **ordered + optional**, not a fixed 4-up grid.
3. **Tooltips close over `entry`:** the cross-tab callbacks (3493/3524/3558 etc.) read
   `entry.type_pipeline_crossTab` at render time. The chart specs must receive `entry`,
   not pre-baked data, or tooltips go stale.

**Minor (note, not blocking):** `sliceLocationTimeDistChart` carries a stale "Polar Area"
comment but is built `type:'bar'` (3693) — no runtime bug. `PG_SAMPLER_FILL` /
`PG_TYPE_FILL` / `PG_TYPE_COLOR` are local color maps that should fold into `CHART_COLORS`.

---

## 5. Single-file architecture — the biggest mechanical win

`index.html` is **79% inline JavaScript**. The script at 970–4557 (~3,587 lines) plus the
small 4560–4573 block can move to `assets/app.js`; the `<style>` block (15–109, ~95 lines)
to `assets/styles.css`.

- **Effect:** `index.html` → **~980 lines** of actual markup. JS becomes diff-friendly,
  searchable, and editable without scrolling past 900 lines of HTML.
- **Risk: very low.** No logic changes; load order preserved (CDN libs in `<head>`, app
  script before the feedback widget scripts at 4574–4575).
- **Precedent:** `assets/feedback-config.js` and `assets/feedback-widget.js` are already
  external — the pattern and directory exist.
- **Constitution:** DESIGN.md permits file extraction; this does **not** touch the
  no-build / no-framework rule (still plain `<script src>`).

**Do this first** — it is the lowest-risk change and makes every subsequent refactor (§4)
far easier to review.

---

## 6. Under-used slicing dimensions — value-vs-cost

No usage analytics exist, so this is a reasoned judgement, not data:

- **Project** slicing — clearly earns its cost; it's the dimension the rich project pages
  (bucket B) hang off, and the one a researcher most likely wants.
- **Location / Hub** — earns it: it owns the only two *unique* slice charts (sub-sites,
  time-of-day). Keep.
- **Lab Group** — **weakest.** It introduces **no unique chart** (types + pipeline +
  temporal + sampler — every one a duplicate of Project's). It exists purely to re-scope
  the same four charts by a third key. **Candidate for demotion** once §4 lands: if the
  parameterized renderer makes it nearly free, keeping it is harmless; if it ever costs
  maintenance, it is the first dimension to drop. Recommend: **keep after consolidation,
  re-evaluate if it blocks anything.**

---

## 7. Secondary: `data.json` size (1.9 MB)

Not in scope to fix this pass, but flagged: the p6 cross-tab augmentation wrote
`type_pipeline_crossTab` / `pipeline_type_crossTab` / `temporal[*].types` into **every** of
the 1,000+ slice entries. That is a meaningful share of the 1.9 MB. If load weight ever
matters, this is the lever — but it's a `preprocess_data.py` concern, separate from the
`index.html` streamline, and should not block §4–§6.

---

## 8. Sequenced, reversible refactor plan

Ordered by value-to-risk. Each step is independently shippable, audited, and reversible
(every step is one commit; rollback = revert). **None of this was executed this session.**

| # | Step | Effort | Risk | Saving | Gate |
|---|---|---|---|---|---|
| **1** | Extract inline JS → `assets/app.js`, CSS → `assets/styles.css` | S | Very low | 4,577 → ~980 lines in `index.html` | Browser-verify: all 20 charts + map + explorer render identically; zero console errors |
| **2** | Collapse 3 slice renderers → one `renderSlice(descriptor)` (respect §4 hazards) | M | Low–Mod | −180–220 JS lines | Browser-verify each of Project/Location/LabGroup incl. tooltips, sub-sites, time-of-day, sampler labels |
| **3** | Cut the 3 per-slice sampler charts | S | Low | −3 charts + their build code | Confirm tag badges still convey sampler info; verify no dangling canvas refs |
| **4** | Fold `PG_*` color maps into `CHART_COLORS`; fix stale "Polar Area" comment | XS | Very low | tidy | SA check only |
| **5** | *(Design decision, gated on Jonathan)* De-stack altitudes — hide public story when a slice is active, or split an "Explore" surface (§3) | M–L | Mod | UX clarity, not LOC | Design review before build |
| **6** | *(Optional, separate)* Trim `data.json` cross-tab redundancy in `preprocess_data.py` (§7) | M | Mod | file weight | Regenerate + diff data, browser-verify |

**Before/after target:** `index.html` **4,577 → ~760 lines** (after steps 1–3), charts
**20 → 17**, slice-renderer code **3 copies → 1**, inline JS **79% → 0%**.

**Method for execution (when approved):** run each step through the standard pipeline
(PM → Critic → FE → audit-pipeline → Archivist), one commit per step, browser-verified via
the same Playwright flow used in the 2026-06-22 verification. Steps 1–4 are pure
streamlining and can proceed on approval; step 5 needs a design call first.

---

## 9. What NOT to do

- **Don't** introduce a build step, bundler, or framework — DESIGN.md forbids it and the
  extraction in §5 doesn't need it.
- **Don't** cut the global (public-story) charts — they are the layperson on-ramp.
- **Don't** fold the bespoke CPER `renderProjectGroupView` into the parameterized renderer
  — it is genuinely different and would fight the abstraction.
- **Reinvestment, not addition** (agenda §6): surface area freed by §4–§5 should go to the
  richer project pages (photos, real abstracts), **not** new generic charts.

---

## Appendix — evidence

- Independent critic findings: `.claude/tasks/outputs/complexity-slice-critic-CR-20260623.md`
- Agenda this pass executes: `docs/COMPLEXITY-REVIEW.md`
- Recon dossier (project/people content for reinvestment): `.claude/tasks/outputs/recon-broadn-web-RA-20260622.md`
- Last verification flow (reusable for refactor gates): `.claude/tasks/outputs/verify-rollout-CA-20260622.md`
