# Post-Mortem: Slice Panel (broadn-p2)
**Date:** 2026-03-17
**Project:** `/home/jhber/projects/broadn-web-view`
**Duration:** ~5h wall-clock (planning: 02:00–03:30Z; implementation: 03:50–07:00Z)
**Final State:** Slice Panel fully delivered — persistent sidebar with three category filters, three view-specific chart sets, and extended preprocessing pipeline. All 17 requirements covered. Browser-confirmed by human.

---

## 1. Original Request

**Human (2026-03-17):** Build a Slice Panel feature for the BROADN dashboard — a persistent left sidebar with Project, Location/Hub, and Lab Group filters. Category and group selection switches the main view to 3–4 slice-specific charts; a clear filter button restores the default 7-chart view. Data requires extending preprocess_data.py to emit a `slice_views` key from Bdb-317.xlsx.

**Brief files:**
- v1: `.claude/agents/tasks/outputs/broadn-p2-slice-panel-PM-plan.md`
- v2 (post-BLOCK): `.claude/agents/tasks/outputs/broadn-p2-slice-panel-PM-plan-v2.md`
- v3 (post-WARNING): `.claude/agents/tasks/outputs/broadn-p2-slice-panel-PM-plan-v3-FE-tasks.md`

**Scope at intake:**
- **Existing:** index.html (880 lines), preprocess_data.py (8 top-level keys), data.json (25,673 bytes), Bdb-317.xlsx
- **To build:** Column inventory (5 unknowns), slice_views data extension, UI design spec, sidebar HTML + state wiring, 9 chart renderers across 3 slice views

---

## 2. Agent Activity Log

### Planning — PM + Critic (broadn-p2-slice-panel)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 10 | 02:00Z | SPAWN | PM#0 | Orchestrator brief dispatched |
| 11 | 02:30Z | COMPLETE | PM#0 | v1 plan delivered — 4 tasks, 004 monolithic |
| 12 | 03:00Z | CRITIQUE_BLOCK | CR#1 | 2 BLOCKERs, 2 WARNINGs |
| — | ~03:15Z | REVISION | PM#0 | v2 produced: 004 split to 004a+004b, guard criterion added |
| — | ~03:25Z | REVISION | PM#0 | v3 produced: WARNING resolution (50-line acknowledgment, SLICE_CATEGORIES DRY criterion) |
| 13 | 03:30Z | CRITIQUE_PASS | CR#1 | v2+v3 combined plan approved |

**Feedback loops:** 1 — CRITIQUE_BLOCK requiring full plan revision.

**Root cause of BLOCK:** PM v1 underestimated task scope for broadn-p2-004. The 10 independent deliverables (HTML structure, mobile drawer, 3 category handlers, 9 chart renderers, renderView state machine, clear-filter, degradation guards, aria) were binned into one task without estimating new line count. The Critic identified this using the "9 success criteria joined by semicolons" signal and the 50-line ceiling rule, and correctly required the 004a/004b split.

**Root cause of second BLOCKER (renderView/initDashboard):** The v1 plan described a "refactor of initDashboard into named functions called by renderView()" as a parenthetical in the description, with no corresponding success criterion and no guard in out_of_scope. The Critic identified that this implicit refactor put the data shape validation guard (lines 808–821) at risk of silent removal — a bug that would produce JS errors rather than graceful degradation on missing data. Adding the guard to success_criteria and out_of_scope was the correct fix.

---

### Phase 1 — BE Column Inspection (broadn-p2-001)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 14 | 03:50Z | SPAWN | BE#2 | First dispatch attempt: backend-engineer → usage policy error |
| — | ~03:52Z | RETRY | general-purpose | Re-dispatched as general-purpose agent |
| 15 | 04:05Z | COMPLETE | BE#2 | Column inventory delivered, all 5 items confirmed |
| 16 | 04:16Z | AUDIT_PASS | AUD#1 | First pass — clean |
| 17 | 04:20Z | ARCHIVE | ARC#1 | Logged |

**Feedback loops:** 0 (after agent type correction).

**Notable finding:** The `backend-engineer` agent type returned a usage policy error on the first dispatch. The task — running a Python xlsx inspection script — contains nothing policy-relevant. This appears to be a false positive triggered by some combination of the xlsx filename, the word "inspect," or a coincidence of prompt terms. The general-purpose agent completed the identical task without issue.

---

### Phase 2 — BE Data-Prep Extension (broadn-p2-002)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 18 | 04:20Z | SPAWN | BE#3 | Dispatched with column inventory from 001 |
| 19 | 04:35Z | COMPLETE | BE#3 | preprocess_data.py extended; data.json 67,176 bytes |
| 20 | 04:50Z | AUDIT_PASS | AUD#2 | First pass — one non-blocking STYLE note (temporal builder inlined 3×) |
| — | ~04:52Z | ARCHIVE | ARC#1 | Logged (background) |

**Feedback loops:** 0.

**Style note (non-blocking):** The auditor identified that the temporal-building pattern was inlined in three separate builder functions when the existing `build_temporal()` could have been reused. Not a FAIL, but a DRY smell. The functions were consistent enough in behavior that inlining was defensible — but a future agent editing this code faces three places to update instead of one.

---

### Phase 3 — UI Design Spec (broadn-p2-003)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 21 | 04:52Z | SPAWN | UI#2 | Dispatched with Zod contract from 002 |
| 22 | 05:10Z | COMPLETE | UI#2 | Full design spec delivered |
| 23 | 05:20Z | AUDIT_PASS | AUD#3 | First pass — completeness check clean |
| — | ~05:22Z | ARCHIVE | ARC#1 | Logged (background) |

**Feedback loops:** 0.

**Notable:** Routing note 7 (pass Zod contract from 002, not raw data.json, to UI Designer) was critical — it ensured chart data key names in the spec matched the actual JSON structure exactly. Both FE tasks implemented data bindings against the Zod contract field names without a single mismatch.

---

### Phase 4 — FE Sidebar + State (broadn-p2-004a)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 24 | 05:22Z | SPAWN | FE#2 | Foreground, lint-critical |
| 25 | 05:40Z | COMPLETE | FE#2 | index.html 1581 lines; 14 new JS functions |
| 26 | 05:55Z | AUDIT_PASS | AUD#4 | First pass — clean on all SA checks |
| — | ~05:57Z | ARCHIVE | ARC#1 | Logged (background) |

**Feedback loops:** 0.

**Notable:** This was the highest-risk task after the plan revision. The explicit SLICE_CATEGORIES DRY requirement (added via WARNING resolution in v3) worked exactly as intended — the auditor's grep found category strings appearing exactly once, in the constant definition. The clear-filter single-listener requirement (also from the v3 revision) was implemented correctly: listener wired once in initDashboard(), not re-attached on each renderView() call.

---

### Phase 5 — FE Chart Renderers (broadn-p2-004b)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 27 | 05:57Z | SPAWN | FE#3 | Foreground; received 004a index.html as context |
| 28 | 06:20Z | COMPLETE | FE#3 | index.html 2099 lines; 9 new functions |
| 29 | 06:35Z | AUDIT_PASS | AUD#5 | First pass — Color Rule A clean |
| 30 | 06:48Z | REQUIREMENTS_COVERED | ORC#0 | 17/17 |
| 31–32 | 06:50–06:55Z | ARCHIVE | ARC#1 | 004b + sprint archived |

**Feedback loops:** 0.

**Notable:** The Critic's prediction ("HIGH probability of SA fail: FE will use hex values inline in new chart configs") did not materialize. The explicit CHART_COLORS extension requirement in the task brief, combined with the auditor's grep instruction, fully closed the repeat failure mode from sprint 1. The agent added all 6 new color keys to CHART_COLORS before referencing any of them.

---

## 3. Post-Delivery Runtime Bugs

None reported. Human confirmed all views functional in browser.

---

## 4. QA Gap Analysis

**Current QA protocol:** Auditor runs SA (standards/DRY/A11Y), QA (functional tests via Playwright T1/T2 or accepted-risk manual log), SX (security scan). For static HTML projects with no build system, Playwright Tier 2 is explicitly acknowledged as accepted risk and manual test logs substitute.

**What this caught:**
- SA gate for 004a: SLICE_CATEGORIES single-definition check (via grep) — verified no inline string duplicates
- SA gate for 004a: clear-filter listener placement — confirmed single attachment in initDashboard()
- SA gate for 004b: Color Rule A — grep for hex outside CHART_COLORS block confirmed clean
- SA gate for 004b: DRY — tooltip callbacks extracted, temporal options extracted (FE agent proactively deduplicated)
- QA gate for 004a: triple clear-filter trace (no listener accumulation)
- QA gate for 004b: Location optional chart absent → card hidden, no error

**What this missed:**
- Nothing material. The sprint was clean post-delivery. The most significant gap in principle is the absence of automated browser regression tests — if a future change breaks the state machine, there is no CI catch. This is inherent to the no-build-step constraint, not a pipeline failure.

**Recommendations:**
1. For future static HTML projects, consider whether a lightweight test harness (e.g., a single standalone HTML test file using Jasmine CDN) could provide regression coverage without violating the no-build constraint. This is a project architecture question, not a pipeline change.
2. The SA grep for hex literals should distinguish between `&#NNNNNN;` HTML entity codes and actual hex color values. The current pattern `#[0-9a-fA-F]{3,6}` matches both. The auditor correctly excluded entities as false positives, but this relies on auditor judgment. A more precise pattern `(?<![&])\#[0-9a-fA-F]{6}\b` would reduce noise.

---

## 5. Agent Performance Summary

| Agent | Tasks | First-pass rate | Notes |
|-------|-------|-----------------|-------|
| PM#0 | 1 (plan) | 0% — CRITIQUE_BLOCK | v1 plan blocked; v2+v3 passed |
| CR#1 | 2 critiques | N/A | Correctly identified both BLOCKERs and both WARNINGs; audit risk forecast accurate |
| BE#2 | 1 (001) | 100% | backend-engineer type false positive; general-purpose retried cleanly |
| BE#3 | 1 (002) | 100% | Non-blocking DRY style note only |
| UI#2 | 1 (003) | 100% | Zod contract alignment with 002 was exact |
| FE#2 | 1 (004a) | 100% | SLICE_CATEGORIES and listener patterns implemented correctly on first pass |
| FE#3 | 1 (004b) | 100% | Color Rule A clean; DRY extractions proactive |
| AUD#1-5 | 5 | N/A | All audits first-pass; 1 non-blocking style advisory on 002 |

**Implementation first-pass rate: 5/5 (100%)** — a direct result of the Critic blocking and revising the plan before any agent started.

**Most impactful single agent action:** Critic blocking broadn-p2-004 with the OVERSCOPED finding. The original 004 monolith would have produced at minimum 2 remediation cycles: one for exceeding the 50-line commit limit, and at least one SA fail for Color Rule A violations (given the sprint-1 precedent). The split into 004a and 004b removed both failure modes before implementation began.

**Recurring failure pattern:** None in implementation. The only recurring pattern across sprints is the PM underestimating FE task scope on first decomposition — this happened in sprint 1 (sites-geocoding task missing) and sprint 2 (004 overscoped). This is the highest-value pattern to address.

---

## 6. Protocol Gaps Identified

| Gap | Impact | Suggested fix |
|-----|--------|---------------|
| PM does not estimate new-line count for FE tasks | Produces overscoped tasks that require Critic intervention to split. In sprint 2, the Critic caught this. In a sprint without a thorough Critic pass, the overscoped task ships to an agent and fails audit. | Add a mandatory `<estimated_new_lines>N</estimated_new_lines>` field to every FE `<task_packet>`. If N > 100, PM must propose a split or add a documented justification. Auditor checks that the agent log records a verification gate pass when actual new lines > 50. |
| PM v1 did not carry forward Color Rule A lesson from sprint 1 | The Critic had to re-derive the lesson from the sprint-1 audit log. Without the Critic, the p1 fail would have repeated in p2 004b. | Orchestrator brief should include a `<prior_sprint_gaps>` field populated from the previous sprint's post-mortem (or from the archivist knowledge graph). The specific item: "Color Rule A: FE agents must extend CHART_COLORS before using new hex values — sprint 1 required a remediation cycle for this." This primes the PM to write the explicit CHART_COLORS extension requirement into 004b upfront. |
| Dataset EDA / column inspection tasks were routed to `backend-engineer` instead of `statistician` | broadn-p2-001 (column inventory, fill rates, value distributions against Bdb-317.xlsx) is textbook EDA, not BE domain. BE returned a usage policy false positive; task completed only after re-dispatch. Root cause was wrong agent selection upstream — the PM did not distinguish between "inspect the dataset" and "build the pipeline from it". | Update orchestrator routing table and PM agent spec: data inspection tasks (column inventory, fill rates, value distributions, EDA against a local dataset) → `statistician`. Pipeline construction tasks (define output schema, emit JSON, write preprocessing script) → `backend-engineer`. The statistician produces a `statistical_report` that the BE consumes as a data contract. This is a domain split, not a workaround. |
| Inline temporal builder repeated 3× in preprocess_data.py | Future edits require updating 3 locations instead of 1 (for `build_slice_project`, `build_slice_location`, `build_slice_lab_group`). Non-blocking now, but accumulates over time. | Add to BE task success criteria for data-prep extensions: "Any helper pattern used more than once must be extracted to a named function before commit." The pattern is already in standards.md as a DRY rule; the gap is that the BE task packet did not cite it explicitly for the temporal builder. |

---

## 7. Final Deliverable State

**App:** `/home/jhber/projects/broadn-web-view/index.html`
**Build:** No build step — static HTML, opens directly in browser
**Runtime:** Confirmed working by human in browser

**Features delivered:**
- Persistent left sidebar: `w-64` sticky on desktop; `w-72` slide-in drawer on mobile with overlay
- Three filter categories: Project (20 entries), Location / Hub (10 sites), Lab Group (8 PIs)
- Project view: sample types doughnut + pipeline horizontal bar + temporal line
- Location view: sub-location bar + sample types doughnut + temporal line + optional time-of-day polar area (shown for 8/10 sites, hidden for 2 with no time data)
- Lab Group view: same 3-chart layout as Project view; empty-array guard present and tested
- Clear filter button restores default 7-chart view; Chart.js instances destroyed on every view switch
- Full keyboard navigation: ArrowUp/Down, Enter, Space, Escape; aria-expanded, role="listbox/option", aria-selected throughout

**Key contracts (next engineer must know):**
- `data.json` `slice_views.project[i].project_id` — exact string from `'Project ID'` xlsx column; match by equality in `renderProjectView(groupId)`
- `data.json` `slice_views.location[i].site_code` — exact `'Sample Collection Location'` string (not a BROADN ID char); match by equality in `renderLocationView(groupId)`
- `data.json` `slice_views.lab_group[i].group_name` — exact `'Project Lead'` surname string
- `time_distribution` is optional on location entries — 2 of 10 locations (IMPROVE, Unknown) have no time data; polar area card is hidden, not erroring, for these entries
- `height_distribution` does not exist — no height/altitude column found in xlsx; do not add it without re-running broadn-p2-001 equivalent against updated data
- `SLICE_CATEGORIES` constant is the single source of truth for category strings — never hardcode 'Project', 'Location / Hub', 'Lab Group' elsewhere in the JS
- `destroyAllSliceCharts()` must be called before any slice chart render to prevent Chart.js memory leaks on repeated view switches
- New hex values live in `CHART_COLORS` at index.html lines ~553–571; add new keys there before using any new hex in chart configs (Color Rule A)
