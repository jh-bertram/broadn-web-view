# Post-Mortem: broadn-p4 — Sidebar Toggle, Border Cleanup, Bar Charts, By-Site Scroll
**Date:** 2026-03-27
**Project:** `/home/jhber/projects/broadn-web-view/index.html`
**Duration:** 2026-03-26T22:28 (PM spawn) → 2026-03-27T21:20 (final archive) — ~23 hours including overnight session pause
**Final State:** All 4 features shipped and browser-verified. Commit `b3af1e3`. 22/22 requirements COVERED.

---

## 1. Original Request

**Human (2026-03-26):** Implement 4 dashboard features: (1) "All BROADN Samples" sidebar toggle as default-active view switcher; (2) remove gray borders from all chart cards; (3) convert temporal and time-of-day charts from line/polarArea to bar type; (4) make the Samples by Site chart show all locations with dynamic height and scroll.

**Brief file:** `.claude/agents/tasks/outputs/broadn-p4-2026-03-26-PM-1743004800.md` (rev0, superseded) → `.claude/agents/tasks/outputs/broadn-p4-2026-03-26-PM-rev1.md` (authoritative)

**Scope at intake:**
- Existing: 3-category slice sidebar with no default-active state; chart cards with gray borders; 4 temporal charts as line type; 1 time-of-day chart as polarArea; by-site chart in fixed-height `.chart-wrap` container
- To build: 4th sidebar button wired into existing state machine; border removal with restore comments; chart type conversions with solid color tokens; dynamic height + scroll wrapper for by-site chart
- No BE changes, no data.json changes — FE-only sprint on a single HTML file

**Skill invoked:** `dispatch-task` (planning phase); sequential FE dispatch in execution phase

---

## 2. Agent Activity Log

### Planning Phase (2026-03-26)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 4 | 22:28 | SPAWN | PM#1 | Orchestrator brief issued |
| 5 | 22:39 | SPAWN | CR#1 | First critic review |
| 6 | 22:50 | CRITIQUE_BLOCK | CR#1 | 2 BLOCKERs + 5 WARNINGs |
| 6 | 22:45 | REVISION_REQUEST | PM#1 | Rev1 brief requested |
| 7 | 22:50 | SPAWN | CR#2 | Second critic review (rev1) |
| 8 | 22:57 | CRITIQUE_PASS | CR#2 | All BLOCKERs resolved; WARNINGs folded into success criteria |
| 9 | 22:59 | PAUSE | ORC#0 | Session paused before dispatch |

**Feedback loops:** 1 (plan revision required)

**Root cause of block:** PM rev0 described the renderView() sidebar state machine at a too-high level. It captured the cat===null→show behavior but missed two sub-problems: (a) the getCategoryButtons() array re-index that breaks keyboard nav when a 4th button is inserted at position 0, and (b) the requirement to hide #global-charts-area in *both* cat!==null branches, not just the both-set branch. Both gaps were latent runtime failures that would not have been visible from a static feature description. The Critic caught both by tracing the exact call graph.

---

### t1 — Sidebar Toggle (2026-03-27)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 2 | 19:12 | SPAWN | FE#1 | Dispatched with full 9-item scope |
| 3 | 19:19 | COMPLETE | FE#1 | ui_packet, 13 success criteria self-verified |
| 4 | 19:19 | SPAWN | AUD#1 | Audit requested |
| 5 | 19:51 | AUDIT_PASS | AUD#1 | All 3 gates PASS |
| 6 | 19:51 | SPAWN | ARC#1 | Archive requested (background) |
| — | — | DENIED | ARC#1 | Write tool denied — archivist could not write output file |

**Feedback loops:** 0

**Archivist failure:** Background archivist agent was denied the Write tool. The ORC wrote the archive entry directly. See Protocol Gaps §6.

---

### t2 — Border Cleanup (2026-03-27)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 7 | 19:51 | SPAWN | FE#2 | Dispatched in parallel with ARC#1 |
| 8 | 20:00 | COMPLETE | FE#2 | ui_packet, 27 removals, all 3 protected elements confirmed |
| 9 | 20:00 | SPAWN | AUD#2 | Audit requested |
| 10 | 20:10 | AUDIT_PASS | AUD#2 | All 3 gates PASS |
| 11 | 20:10 | SPAWN | ARC#2 | Archive requested (background) |
| — | — | DENIED | ARC#2 | Same Write denial as ARC#1 |

**Feedback loops:** 0

---

### t3 — Bar Chart Conversion (2026-03-27)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 12 | 20:10 | SPAWN | FE#3 | Dispatched immediately after t2 audit pass |
| 13 | 20:25 | COMPLETE | FE#3 | ui_packet; 2 new CHART_COLORS tokens; 5 constructors converted |
| 14 | 20:25 | SPAWN | AUD#3 | Audit requested |
| 15 | 20:32 | AUDIT_PASS | AUD#3 | All 3 gates PASS |
| 16 | 20:32 | SPAWN | ARC#3 | Archive requested (background) — succeeded |

**Feedback loops:** 0

**Notable:** This was the most technically complex task (5 chart constructors, 2 chart types, tooltip ref change, 5 aria-labels, new color tokens) and shipped on first attempt. The pre-sprint Critic WARNING on `CHART_COLORS.sliceTemporalArea` — which the PM added to must_not_contain — was correctly handled by FE without any reminder.

---

### t4 — By-Site Show All (2026-03-27)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 17 | 20:32 | SPAWN | FE#4 | Dispatched after t3 audit pass |
| 18 | 20:38 | COMPLETE | FE#4 | ui_packet; scroll container + dynamic height + autoSkip:false |
| 19 | 20:38 | SPAWN | AUD#4 | Audit requested |
| 27 | 20:59 | AUDIT_FAIL | AUD#4 | False positive — flagged t1/t2/t3 as out-of-scope |
| 20 | 20:42 | SPAWN | AUD#4b | Re-audit with explicit prior-task context |
| 28 | 21:12 | AUDIT_PASS | AUD#4b | All 7 t4-specific criteria PASS |
| 21 | 21:02 | COMPLETE | ORC#0 | Sprint closed |

**Feedback loops:** 1 (auditor false positive — no FE remediation needed)

**Root cause of AUDIT_FAIL:** AUD#4's brief asked it to check for `must_not_contain` violations including "changes to any chart other than bySiteChart." When the auditor diffed the current file against git HEAD, it saw 650+ lines of changes (t1+t2+t3+t4 cumulative). The t1/t2/t3 changes match the pattern of "changes to other charts" and triggered a false FAIL. AUD#4 did not know those changes were pre-approved in prior tasks. The fix was a re-audit brief that explicitly listed which prior tasks were already baked in. See Protocol Gaps §6.

---

## 3. Post-Delivery: Runtime Bugs

None. Browser verification confirmed all 4 features functional immediately after commit.

---

## 4. QA Gap Analysis

**Current QA protocol:** Auditor reads changed files, greps for specific patterns, performs static analysis of config validity. For vanilla HTML/JS files with no build system, no Playwright tier is available — QA is static-only.

**What this caught:**
- t1: Correct getCategoryButtons() 4-element array with null guard at [0]
- t1: #global-charts-area hidden in both cat!==null branches (not just one)
- t2: All 3 protected elements (map, Data Explorer, error-state) confirmed untouched
- t3: CHART_COLORS.lineArea and CHART_COLORS.sliceTemporalArea absent from converted datasets
- t3: ctx.parsed.y (not .r) in time-of-day tooltip
- t4: Dynamic height set before new Chart() (correct initialization order)

**What this missed:**
- Nothing functionally — browser verification found no bugs post-delivery.
- The false positive on t4 is a *process* miss, not a code-quality miss. The auditor's diff-scope mechanism didn't account for a sequential single-file sprint where prior approved changes accumulate.

**Recommendations:**
1. For sequential single-file sprints, the auditor brief should explicitly name which prior tasks are already applied ("do not flag changes from t1/t2/t3 — those were pre-audited") rather than relying on the auditor to infer scope from the task name alone.
2. Add a `<prior_approved_tasks>` block to the audit brief template for sprints with sequential single-file modifications.

---

## 5. Agent Performance Summary

| Agent | Tasks | First-pass rate | Notes |
|-------|-------|----------------|-------|
| FE (×4) | 4 | 4/4 (100%) | All tasks on first attempt; t3 was most complex |
| Auditor | 4 | 3/4 (75%) | AUD#4 false positive; not a code issue |
| Archivist | 4 | 2/4 (50%) | ARC#1 and ARC#2 denied Write; ORC intervened |
| Critic | 2 | 1/2 (plan quality) | Caught 2 real BLOCKERs in rev0; clean pass on rev1 |

**Most impactful single agent action:** Critic (CR#1) catching the getCategoryButtons() re-index gap. Without this, the keyboard nav listener would have wired `btnProject` to index 0 (the new slot occupied by `slice-btn-all`), silently breaking ArrowUp/ArrowDown navigation for all category buttons. This is a non-obvious off-by-one that static visual review of the HTML would not surface.

**Recurring failure pattern:** Background archivist agents denied Write tool in this permission context. Both ARC#1 and ARC#2 encountered this. ARC#3 and ARC#4 succeeded — likely because they ran in a different execution context (foreground vs background). The pattern suggests background agents in this environment do not inherit Write permissions from the orchestrator session.

---

## 6. Protocol Gaps Identified

| Gap | Impact | Suggested Fix |
|-----|--------|---------------|
| Auditor brief for sequential single-file sprints does not list prior-approved tasks | Causes false AUDIT_FAIL when auditor greps/diffs against full git HEAD (all prior task changes visible) | Add `<prior_approved_tasks>` field to audit brief template; ORC must populate it for each sequential task: "Tasks t1, t2, t3 changes are already in the file and were pre-audited. Audit only the t4-specific delta." |
| Background archivist agents are denied Write tool in this deployment context | Archive entries not written; ORC must intervene manually for failed archivists | Dispatch archivists as foreground agents (not background) OR run the archivist in the main session context after each audit pass. If the user's permission mode denies Write to background sub-agents, background dispatch is not viable for agents that must write files. |
| PM rev0 described renderView() state machine without tracing the full call graph | 2 BLOCKERs needed Critic to catch: getCategoryButtons() re-index and two-branch hide logic | Add a pre-flight protocol step for tasks that modify a JS state machine: PM must trace every function that calls into the modified state (here: getCategoryButtons, handleCategoryButtonKeydown, renderView, updateCategoryButtonStates, clearSliceFilter) and verify all call sites are updated. A "state machine modification checklist" in the PM spec would formalize this. |

---

## 7. Final Deliverable State

**App/Service:** `/home/jhber/projects/broadn-web-view/index.html`
**Build:** N/A — static single HTML file, no build system
**Runtime:** Browser-verified by human immediately after commit. All 4 features confirmed functional.

**Features delivered:**
- `slice-btn-all` sidebar button: default-active (orange full-fill), returns to global view on click, getCategoryButtons() re-indexed to 4 elements, listIds null guard, global-charts-area show/hide in both renderView() branches
- Chart card border removal: 27 divs de-bordered across global + slice areas; HTML restore comments at every site; map/Data Explorer/error-state preserved; CSS tuning block in `<style>`
- Bar chart conversion: 4 temporal charts (line→bar) + 1 time-of-day (polarArea→bar); `CHART_COLORS.temporalBar` and `CHART_COLORS.sliceTemporalBar` solid tokens; ctx.parsed.y tooltip; descriptive aria-labels on all 5 canvases
- By-site dynamic height: `#bySiteScrollContainer` (600px max-height, overflow-y:auto) + `#bySiteChartWrap` (inline position:relative, no .chart-wrap class); `MIN_BAR_HEIGHT = 28px`; `autoSkip: false`

**Key contracts for next engineer:**
- `getCategoryButtons()` returns 4 elements in fixed order: [slice-btn-all, project, location, labgroup]. Index 0 is always the global toggle. Do not reorder.
- `listIds` in `handleCategoryButtonKeydown()` is `[null, 'project-group-list', 'location-group-list', 'labgroup-group-list']`. Index 0 null is intentional and load-bearing — the null guard below it prevents getElementById(null).
- `CHART_COLORS.temporalBar` (solid green) and `CHART_COLORS.sliceTemporalBar` (solid teal) are the canonical bar fill tokens. Do not use `CHART_COLORS.lineArea` or `CHART_COLORS.sliceTemporalArea` on bar chart datasets — both are semi-transparent and designed for line area fills.
- `.chart-wrap` CSS class is shared by all charts except `#bySiteChart`. Do not add `.chart-wrap` to `#bySiteChartWrap` — it carries a fixed 350/400px height that overrides the dynamic sizing.
