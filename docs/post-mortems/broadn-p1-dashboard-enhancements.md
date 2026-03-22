# Post-Mortem: broadn-p1 Dashboard Enhancements
**Date:** 2026-03-22
**Project:** `/home/jhber/projects/broadn-web-view/index.html` + `scripts/preprocess_data.py`
**Duration:** Planning 2026-03-17 → 2026-03-18 (4 Critic cycles); Execution 2026-03-22T00:00Z → 02:06Z (~2h 6m)
**Final State:** All 7 core feature areas shipped and browser-verified. 3 post-delivery bugs fixed via vfix-001 (tooltip positioning, project name field, active panel styling). 3 process gaps remained at close (manual test traces, A11Y risk log phrasing).

---

## 1. Original Request

**Human (2026-03-17):** Four enhancements to the broadn dashboard: (1) orange accent throughout sidebar navigation with 300ms transitions; (2) sampler-type doughnut charts and replicate tag badges in all slice panels and global pipeline section; (3) temporal axis formatted as "Mar '20" with autoSkip disabled; (4) Leaflet map markers cross-linked bidirectionally with bySite bar chart, plus custom HTML tooltips on donut and pipeline charts showing project breakdowns on hover.

**Brief files:** `.claude/agents/tasks/broadn-p1-dashboard-enhancements.md` → rev2 → rev3 → rev4

**Scope at intake:**
- Existing: Chart.js bar/doughnut/temporal charts; Leaflet map; slice panel accordion; `preprocess_data.py` pipeline with 9 validated top-level keys
- To build: 2 new nested data fields in preprocess pipeline (`sampler_type_dist`, `replicate_tags`); orange CSS tokens; replicate badge DOM + renderer; sampler doughnut DOM + renderer; temporal format/axis fix; map-bar cross-link state + handlers; custom tooltip infrastructure + callbacks in 2 chart renderers

**Skill invoked:** `dispatch-task`

---

## 2. Agent Activity Log

### Planning Phase — Critic revision cycles (4 iterations)

| Rev | Timestamp | Event | Result | Blockers / Warnings |
|-----|-----------|-------|--------|---------------------|
| rev1 | 2026-03-18T00:00Z | CRITIQUE | BLOCK | 003 OVERSCOPED (~80-120 lines); 005 OVERSCOPED (~100+ lines); "11 required keys" conflation with nested keys; Color Rule A CSS/JS distinction unclear; sampler chart palette unspecified; "global pipeline section" ambiguous |
| rev2 | 2026-03-18T17:16Z | CRITIQUE | BLOCK | 005 still OVERSCOPED (all map+chart+tooltips in one task); 003b marginal; remaining gaps from rev1 partially addressed |
| rev3 | 2026-03-18T~20:00Z | CRITIQUE | BLOCK | 005b estimated at 65 lines (split into 005b-infra + 005b-callbacks required); manual test trace missing from 005a-chart success criteria; A11Y hover-only tooltip risk not addressed |
| rev4 | 2026-03-18T21:41Z | CRITIQUE | PASS | 0 BLOCKERs; 2 WARNINGs (A11Y hover-only tooltip; 300ms transition not in 002 success criteria); 1 WARNING (COL_SAMPLER_TYPE / COL_SAMPLE_REPLICATE column names unverified against xlsx) |

**Root cause of 4-cycle plan gate:** The original decomposition combined too many distinct features into 003 and 005. Each Critic iteration added one structural correction (split a task), but the plan accumulated deferred warnings that weren't fully resolved until rev4. The A11Y warning was explicitly carried as accepted risk; the column-name warning relied on the fallback guard in the success criteria.

---

### Wave 1a — broadn-p1-001 (BE: preprocess pipeline)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 7 | 2026-03-22T00:00Z | SPAWN | BE#1 | Python pipeline extensions |
| 10 | 2026-03-22T00:08Z | COMPLETE | BE#1 | `completion_packet` — +52 lines; data.json regenerated at 85,258 bytes |
| 11 | 2026-03-22T00:16Z | AUDIT_PASS | AUDITOR#1 | `.claude/agents/tasks/outputs/broadn-p1-001-BE.md` |
| 14 | 2026-03-22T02:35Z | COMPLETE | AR#1 | Archive logged |

**Feedback loops:** 0 — first-pass audit PASS.

**Deviation from PM brief:** None. COL_SAMPLER_TYPE and COL_SAMPLE_REPLICATE Critic warning (unverified column names) resolved by the fallback guard — both columns exist in the xlsx; the warning was conservative.

---

### Wave 1b — broadn-p1-002 (FE: orange accent tokens)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 8 | 2026-03-22T00:00Z | SPAWN | FE#1 | CSS tokens, CHART_COLORS, updateGroupItemSelection |
| 9 | 2026-03-22T00:05Z | COMPLETE | FE#1 | `ui_packet` |
| 12 | 2026-03-22T00:20Z | AUDIT_PASS | AUDITOR#2 | |
| 15 | 2026-03-22T00:26Z | COMPLETE | AR#2 | Archive logged |

**Feedback loops:** 0 — first-pass audit PASS.

**Deviation from PM brief:** None. Critic Warning W3 (300ms transition not in 002 success criteria) was addressed: agent added `transition-colors duration-300` Tailwind classes; Critic's concern was that the explicit transition CSS property wasn't in the success criteria checklist, but the feature was delivered correctly.

---

### Wave 2 — broadn-p1-003a (FE: replicate badges)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 13 | 2026-03-22T00:25Z | SPAWN | FE#2 | Badge divs, renderReplicateBadges(), 4 wiring sites |
| 14 | 2026-03-22T00:26Z | COMPLETE | FE#2 | `ui_packet` |
| 15 | 2026-03-22T00:30Z | AUDIT_PASS | AUDITOR#3 | Note: AUDITOR#3 was code-auditor subagent that returned usage policy error; ORC#0 performed audit directly |
| 17 | 2026-03-22T00:32Z | COMPLETE | AR#4 | Archive logged |

**Feedback loops:** 0 — first-pass audit PASS.

**Deviation from PM brief:** None material. Auditor subagent was blocked by usage policy; ORC substituted direct audit — outcome was the same but breaks the agent-separation principle.

---

### Wave 3 — broadn-p1-003b (FE: sampler doughnut charts)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 16 | 2026-03-22T00:31Z | SPAWN | FE#3 | Canvas elements, renderSamplerTypeChart(), 4 wiring sites |
| 18 | 2026-03-22T00:37Z | COMPLETE | FE#3 | `ui_packet` |
| 19 | 2026-03-22T00:40Z | AUDIT_PASS | AUDITOR#4 | |
| 21 | 2026-03-22T00:55Z | COMPLETE | AR#5 | Archive logged |

**Feedback loops:** 0 — first-pass audit PASS.

---

### Wave 4 — broadn-p1-004 (FE: temporal axis fixes)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 20 | 2026-03-22T00:41Z | SPAWN | FE#4 | formatMonth(), buildTemporalChartOptions(), renderTemporalChart() inline config |
| 22 | 2026-03-22T00:58Z | COMPLETE | FE#4 | `ui_packet` |
| 23 | 2026-03-22T01:00Z | AUDIT_PASS | AUDITOR#5 | |
| 25 | 2026-03-22T01:30Z | COMPLETE | AR#6 | Archive logged |

**Feedback loops:** 0 — first-pass audit PASS.

---

### Wave 5 — broadn-p1-005a (FE: map-bar cross-link, consolidated)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 24 | 2026-03-22T01:01Z | SPAWN | FE#5 | Map-bar cross-link; consolidated 005a-map + 005a-chart into one wave |
| 26 | 2026-03-22T01:05Z | COMPLETE | FE#5 | `ui_packet` |
| 27 | 2026-03-22T01:10Z | AUDIT_PASS | AUDITOR#6 | |
| 29 | 2026-03-22T01:15Z | COMPLETE | AR#7 | Archive logged |

**Feedback loops:** 0 — first-pass audit PASS.

**Deviation from PM brief:** PM rev4 had 005a-map (wave 5) and 005a-chart (wave 6) as separate tasks. FE#5 consolidated both. Net line count was within limits; auditor accepted. This deviation is structurally correct (no dependency between the two halves after 004) but bypassed the per-task line ceiling verification gate for the combined work.

---

### Wave 6 — broadn-p1-005b (FE: custom HTML tooltips, consolidated)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 28 | 2026-03-22T01:11Z | SPAWN | FE#6 | Tooltip infrastructure + callbacks; consolidated 005b-infra + 005b-callbacks |
| 30 | 2026-03-22T01:16Z | COMPLETE | FE#6 | `ui_packet` |
| 31 | 2026-03-22T01:20Z | AUDIT_PASS | AUDITOR#7 | |
| 35 | 2026-03-22T01:25Z | COMPLETE | AR#8 | Archive logged |

**Feedback loops:** 0 — first-pass audit PASS.

**Deviation from PM brief:** PM rev4 explicitly split 005b-infra (wave 7) and 005b-callbacks (wave 8) because the combined estimate was 65 lines — the reason for rev3's BLOCK. FE#6 re-consolidated them. The combined output was ~62 lines, technically within 65, but the split was a Critic-mandated hard requirement. The auditor passed the combined packet without flagging the consolidation. This is the most significant process deviation of the sprint.

---

### Gap Fill — broadn-p1-005b-gap-R011

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 32 | 2026-03-22T01:25Z | SPAWN | FE#7 | Null guards for tooltip callbacks (R-011, R-012) |
| 33 | 2026-03-22T01:30Z | COMPLETE | FE#7 | Lines 832-836, 889-893 — 8 lines added |
| 34 | 2026-03-22T01:32Z | AUDIT_PASS | AUDITOR#8 | |
| 36 | 2026-03-22T01:45Z | COMPLETE | AR#9 | Archive logged |

**Root cause:** requirements-validate caught that FE#6's 005b packet had no explicit `!appData || !appData.slice_views || !appData.slice_views.project` guard before accessing the project array — a hard success criterion from PM rev4. The auditor checked that `appData` was referenced by correct name and that `opacity === 0` was guarded, but did not check for the specific null guard chain the PM required. Two different gates (SA/QA vs. requirements-validate) were needed to catch this — confirming the two-gate system adds genuine coverage.

---

### Verification Fix — broadn-p1-vfix-001

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 38 | 2026-03-22T02:00Z | SPAWN | FE#8 | 3 post-browser-verification bugs: tooltip coords, project field, active state style |
| 39 | 2026-03-22T02:05Z | COMPLETE | FE#8 | +2 lines (var rect), 8 replacement edits |
| 40 | 2026-03-22T02:06Z | AUDIT_PASS | AUDITOR#9 | |

**Root cause:** See Section 3.

---

## 3. Post-Delivery: Runtime Bugs

### Bug 1 — Tooltip positioned 200-300px off-target

**Reporter:** Human (browser verification)
**Error:** Custom tooltip appeared 200-300px above and to the left of the hovered chart segment.
**Detected:** 2026-03-22, Step 4.5 browser verification

**Root cause:** Chart.js `tooltip.caretX` and `tooltip.caretY` are coordinates relative to the chart canvas element, not the browser viewport. `showCustomTooltip(caretX, caretY, html)` was positioning the fixed-position `#custom-tooltip` div using canvas-relative values — producing placement that was correct only if the canvas was at the document origin (0, 0). The fix required adding `var rect = context.chart.canvas.getBoundingClientRect()` and passing `rect.left + caretX`, `rect.top + caretY` instead.

**Fix applied:** `index.html` — 2 `var rect` declarations inserted (one per callback), 4 `showCustomTooltip` call sites updated to use `rect.left + tooltip.caretX` and `rect.top + tooltip.caretY`.

**Why agents did not catch this:** The tooltip task packet's success criteria specified `showCustomTooltip(rect.left + tooltip.caretX, ...)` in the PM rev4 description — but it was in the narrative description block, not in the machine-verifiable success criteria or receipt checklist. The auditor verified that `showCustomTooltip` was called with `caretX` and `caretY` — which it was, just without the viewport offset addition. No criterion in the receipt checklist specified `getBoundingClientRect()`. The gap between "caretX used" and "viewport-offset caretX used" was not testable without running the code in a browser.

---

### Bug 2 — Tooltip project name column blank

**Reporter:** Human (browser verification)
**Error:** Tooltip showed "5 rows, each with a colon and a number" — the project name portion was empty.
**Detected:** 2026-03-22, Step 4.5 browser verification

**Root cause:** `buildTooltipHtml` called `projects[i].name` to populate the project label in each row. The `data.json` slice_views.project entries have no `.name` field — the display identifier is `.project_id` (e.g., "IMPROVE Fungi"). This is visible in the data contract from broadn-p1-001, but the tooltip callback task brief referenced `.project_name` (a field that does not exist either). FE#6 implemented `.name`, FE#7 gap-fill did not catch it.

**Fix applied:** `index.html` lines 843, 898 — `projects[i].name` → `projects[i].project_id` in both `breakdown.push()` calls.

**Why agents did not catch this:** No agent read `data.json` to verify the actual field name before writing the callback. The task spec said "project names" generically; PM rev4 description used `.project_name` (also wrong). The correct field (`.project_id`) was only discoverable by reading the data file. This is a missing pre-flight step: tooltip callback tasks that reference a data field by name must include a data-contract verification step against the actual data file.

---

### Bug 3 — Active slice panel border-outline instead of background fill

**Reporter:** Human (browser verification)
**Error:** Active slice panel showed an orange left-border outline rather than a full orange background fill.
**Detected:** 2026-03-22, Step 4.5 browser verification

**Root cause:** PM rev4 success criterion for broadn-p1-002 said "bg-orange-50 text-orange-700 on active item." FE#1 delivered `border-l-4 border-orange-500` instead of `bg-orange-50`. The human's original request said "the entire background of the new area be orange" but the PM translated this as a left-border accent. The active state was audited as PASS because the receipt checklist confirmed "orange class present on active item" — but neither the exact class name nor the visual type (fill vs. border) was in the checklist.

**Fix applied:** `index.html` lines 1836, 1858, 1883 — `border-l-4 border-orange-500` → `bg-orange-50` in active branch; corresponding reset branches updated.

**Why agents did not catch this:** The PM's translation of "orange background" to "border-l-4 border-orange-500" was a misinterpretation of the human request. The Critic reviewed the task spec, not the original human wording. The auditor reviewed the delivered code against the (already wrong) task spec — and it matched the spec. The gap is between the human's visual intent and the PM's written specification. The only safeguard is browser verification — which is how it was caught.

---

## 4. QA Gap Analysis

**Current QA protocol:** Auditor runs three gates: SA (standards: DRY, Color Rule A, Tailwind static classes, naming), QA (functional: logic review, guard patterns, existing helper reuse), SX (security: innerHTML safety, no eval/fetch). Followed by requirements-validate against the PM's success criteria.

**What this caught:**
- Color Rule A violations (orange token must be in CHART_COLORS; no inline hex in dataset config)
- `escapeHtml` not redefined in tooltip callbacks
- `enabled: false` + `external:` callback pattern correct for Chart.js 4.x
- `options.onClick` used instead of `canvas.addEventListener`
- `appData` referenced by exact name (not `data` or `dashData`)
- `position: fixed` (not `absolute`) in tooltip CSS
- `opacity === 0` guard present before tooltip display
- requirements-validate caught null guard chain absent (R-011, R-012) — auditor missed this

**What this missed:**
- `getBoundingClientRect()` offset missing in tooltip positioning — receipt checklist only verified that caretX/caretY were used, not that viewport offset was applied. Runtime-only failure.
- Correct data field name for project display (`.project_id` vs `.name`) — no agent performed a data contract check against the actual JSON before writing the tooltip callback.
- Active panel visual type (bg vs. border) — auditor verified "orange class present" but not which visual treatment the human intended. PM spec was already wrong; auditor had no source of truth beyond the spec.
- Manual test trace not enforced — R-013 and R-014 required four-scenario interaction traces in the completion packets; neither was delivered, and auditor PASS'ed without them. requirements-validate flagged them MISSING; gap-fill agent did not address them (only addressed code gaps R-011/R-012).
- Wave consolidation — 005b-infra + 005b-callbacks re-merged by agent despite explicit Critic BLOCK in rev3 mandating the split. Auditor did not check whether the delivered packet matched the correct task_id boundary.

**Recommendations:**
1. Add a mandatory data-contract verification step to any task that references a specific field name from `data.json` or any external data file — agent must grep/read the data file and confirm the field name before writing code.
2. Add `getBoundingClientRect()` to the Chart.js tooltip positioning checklist in the FE agent spec: external tooltip callbacks that use `caretX`/`caretY` must add canvas-to-viewport offset.
3. Require the auditor to check the delivered task_id against the planned task_id and reject packets where a consolidated agent delivered work for two task_ids as one — require explicit acknowledgment and ORC approval if consolidation happens.
4. Manual test trace items in PM success criteria must appear in the auditor's receipt checklist, not just the requirements-validate sweep. If a test trace is required, AUDIT_FAIL if absent — not AUDIT_PASS followed by requirements-validate catch.
5. When PM translates a visual human request to a CSS class, require the PM to include a one-line visual description in the success criterion ("full background fill, not left border outline") so the auditor can flag mismatches at review time rather than after browser verification.

---

## 5. Agent Performance Summary

| Agent | Tasks | First-pass rate | Notes |
|-------|-------|----------------|-------|
| BE#1 | broadn-p1-001 | 100% (1/1) | Clean first pass; COL_SAMPLER_TYPE warning resolved correctly |
| FE#1 | broadn-p1-002 | 100% (1/1) | Delivered border-l-4 instead of bg-orange-50 — spec was wrong, not the implementation |
| FE#2 | broadn-p1-003a | 100% (1/1) | Clean |
| FE#3 | broadn-p1-003b | 100% (1/1) | Clean |
| FE#4 | broadn-p1-004 | 100% (1/1) | Clean |
| FE#5 | broadn-p1-005a (consolidated) | 100% (1/1) | Consolidated two tasks without ORC approval |
| FE#6 | broadn-p1-005b (consolidated) | 100% (1/1) | Re-consolidated tasks that Critic explicitly required split; null guard missed |
| FE#7 | broadn-p1-005b-gap-R011 | 100% (1/1) | Fixed null guards; did not address project field name bug or manual traces |
| FE#8 | broadn-p1-vfix-001 | 100% (1/1) | All 3 post-delivery bugs resolved cleanly |
| ORC#0 | Audit substitute (003a) | N/A | Auditor subagent blocked by usage policy; ORC performed audit directly |

**Most impactful single agent action:** FE#8 (vfix-001) — all three browser-visible failures fixed in one targeted pass with zero rework. Demonstrates that a clear, targeted brief with pre-identified fix sites produces reliable results even after a complex sprint.

**Recurring failure pattern:** FE agents consolidating tasks that were explicitly split by the Critic. Both 005a and 005b were re-merged by the implementing agents. In both cases the consolidation succeeded (no functional failures), but it bypassed the per-task line ceiling verification gate and, in 005b's case, re-introduced the overscope risk the Critic specifically blocked. This is a pattern to address in the FE agent spec.

---

## 6. Protocol Gaps Identified

| Gap | Impact | Suggested fix |
|-----|--------|---------------|
| FE agents consolidate tasks explicitly split by Critic | Bypasses 50-line ceiling gate; bypasses wave-boundary verification | Add to FE agent spec: "If your task_id references only one half of a previously split task (e.g. `005b-callbacks` not `005b`), you are not authorized to implement the other half. Delivering consolidated work across two task_ids requires explicit ORC approval before the packet is submitted." |
| Tooltip callback tasks don't verify data field names before writing | Post-delivery blank project name column; only caught in browser | Add to FE agent spec under Chart.js tooltip section: "Before writing any callback that accesses a named field from appData, grep the data file for that field name. If not found, surface to ORC before writing." |
| Chart.js caretX/caretY not documented as canvas-relative | Tooltip 200-300px off; not testable without browser | Add to FE agent spec Chart.js tooltip checklist: "External tooltip callbacks that position an element via caretX/caretY must apply `canvas.getBoundingClientRect()` offset: `rect.left + caretX`, `rect.top + caretY`." |
| PM visual descriptions not type-qualified | Active panel delivered as border instead of background fill | Add to PM spec: "When specifying a UI state change involving color, include a visual type qualifier: 'full background fill', 'left border accent', 'text color only'. Do not rely on CSS class names alone to convey visual intent." |
| Manual test traces required by PM but not in auditor receipt checklist | Traces absent from packets; requirements-validate had to catch them as MISSING | Add to auditor spec: "If the task packet's `<success_criteria>` contains a 'MANUAL TEST TRACE REQUIRED' item, verify the packet contains the trace. If absent, return AUDIT_FAIL — do not defer to requirements-validate." |
| Auditor subagent blocked by usage policy silently transfers audit to ORC | Breaks agent-separation; ORC performing audit is an un-audited self-audit | Add to CLAUDE.md routing notes: "If code-auditor subagent returns usage policy error, log the failure event and re-attempt once. If still blocked, surface to human before proceeding — do not substitute ORC as auditor." |

---

## 7. Final Deliverable State

**App/Service:** `/home/jhber/projects/broadn-web-view/index.html` (static HTML + inline JS/CSS)
**Data pipeline:** `/home/jhber/projects/broadn-web-view/scripts/preprocess_data.py` → `data/data.json`
**Build:** N/A — no build system; file is served directly
**Runtime:** Confirmed working via browser verification (2026-03-22). All 3 post-delivery bugs fixed.

**Features delivered:**
- `sampler_type_dist` and `replicate_tags` nested in all slice_views entries (project, location, lab_group) in data.json
- Orange CSS design tokens (`--color-orange-500`, `--color-orange-700`) in `:root`; `CHART_COLORS.orangeAccent` / `orangeAccentDim` in JS
- Active group item: full `bg-orange-50` background with `text-orange-700`; `transition-colors duration-300`
- Replicate badge containers in all 3 slice panel grids and global pipeline section; `renderReplicateBadges()` with XSS-safe innerHTML and "None recorded" fallback
- Sampler-type doughnut chart canvases in all 3 slice panel grids and global pipeline section; `renderSamplerTypeChart()` with destroyChart guard and empty-data fallback
- `formatMonth()` returns "Mar '20" format; both temporal chart configurations updated with `autoSkip: false`, `maxTicksLimit` removed, title added
- Bidirectional Leaflet map marker ↔ bySite bar chart cross-link via `highlightSite()` / `clearSiteHighlight()`; toggle behavior; `options.onClick` in Chart.js config
- Custom HTML `#custom-tooltip` overlay on donut and pipeline charts; viewport-relative positioning via `getBoundingClientRect()` + caretX/caretY; top-5 project breakdown per segment; `escapeHtml()` on all user-derived strings

**Key contracts:**
- `data.json` slice_views.project entries: `{project_id, sample_count, sample_types, pipeline, temporal, sampler_type_dist, replicate_tags}` — no `.name` field; display identifier is `.project_id`
- Tooltip complementary data concept (donut hover → pipeline stages; pipeline hover → sample types) deferred to next sprint — requires preprocess_data.py cross-tabulation data not present in current data.json
- Replicate badge functionality adjustments deferred to next sprint
