# Post-Mortem: broadn-p7-sample-table (Data Explorer Table Upgrade)
**Date:** 2026-04-02
**Project:** `broadn-web-view` (`/home/jhber/projects/broadn-web-view/`)
**Duration:** 2026-04-02T00:00Z (sprint open) → 2026-04-03T01:00Z (sprint close) + post-delivery bug fix commit `1d6a544`
**Final State:** 3 commits shipped and browser-verified. The Data Explorer table now shows all 4,571 field samples, filtered by `filterState` (slice + tags) and paginated at 100 rows per page. Two post-delivery bugs fixed by human browser testing.

---

## 1. Original Request

**Human (2026-04-02):** Upgrade the Data Explorer table in `index.html` to show all 4,571 field samples filtered by dashboard state (active slice + tag filters), paginated at 100 rows per page.

**Scope at intake:**
- Needed (BE): `build_all_samples()` in `scripts/preprocess_data.py`; `all_samples` key in `data/data.json` (4,571 records, 12 fields each)
- Needed (FE): `renderTable(samples, page)` rewrite + pagination controls + `refreshTableIfReady()` helper wired to all three `renderView()` exit points + call site updates (init block, 3 dropdown handlers)
- Out of scope: thead column changes, filter dropdown HTML, chart rendering functions, `applyFilter()` body

---

## 2. Agent Activity Log

### Wave 0 — PM Decomposition + Critic Review

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 1 | 2026-04-02T00:00Z | SPRINT_OPEN | ORC | Sprint dispatched |
| 2 | 2026-04-02T00:01Z | SPAWN | PM#1 | Initial decomposition |
| 3 | 2026-04-02T00:10Z | COMPLETE | PM#0 | `.../broadn-p7-sample-table-PM-1775191176.md` |
| 4 | 2026-04-02T00:05Z | SPAWN | CR#1 | Plan critique |
| 5 | 2026-04-02T00:10Z | CRITIQUE_BLOCK | CR#1 | 2 blockers (see below) |
| 6 | 2026-04-02T00:12Z | SPAWN | PM#1 (rev1) | Revision |
| — | 2026-04-03T00:00Z | COMPLETE | PM#1 | `.../broadn-p7-sample-table-PM-rev1-1775239552.md` |
| 7 | 2026-04-03T00:10Z | SPAWN | CR#2 | Second critique |
| 8 | 2026-04-03T00:12Z | CRITIQUE_PASS | CR#2 | 1 warning (cosmetic col_val contradiction); no blockers |

**Feedback loops:** 1 — one CRITIQUE_BLOCK requiring one PM revision.

**CR#1 BLOCKER 1 — `df_col_map` NameError at insertion point:**
The initial PM plan specified inserting the `build_all_samples()` call after line 916 (immediately after `recent_samples = build_recent_samples(...)`). However, `df_col_map` is not assigned until line 943 and is not finalized until line 949 (`if not new_cols_present: df_col_map[...] = None`). Inserting at line 916 would raise a `NameError` at runtime. The Critic read the file and identified the correct insertion point: after line 949, before line 951 (`slice_project = build_slice_project(...)`). Root cause: PM did not trace the assignment order for the function's dependencies before specifying the insertion point.

**CR#1 BLOCKER 2 — `renderView()` has three exit points, plan only hooked one:**
The initial PM plan hooked `renderTable` at the closing brace of `renderView()` (line 2726). `renderView()` has two earlier unconditional `return` statements: line 2635 (`cat === null` branch, the most common user state) and line 2666 (`cat` set but `group === null`). The plan comment stated "applyFilter() → renderView() — adding to renderView end is sufficient," but the early-return branches meant tag-badge toggles (which call `applyFilter()` and exit `renderView()` at line 2635) would never trigger a table re-render. The Critic caught this and required a three-site hook using a `refreshTableIfReady()` helper. Root cause: PM asserted a call-chain relationship ("applyFilter() → renderView() covers it") without verifying that `renderView()` actually reaches the end of its body in the relevant code paths.

**CR#2 WARNING — cosmetic contradiction in risk flag #7:**
Rev1 defined `col_val` at function scope (outside the loop) but risk flag #7 stated "the agent must verify the function definition is inside the loop." These contradict each other. Both produce correct behavior; the contradiction risked wasting BE agent time. Critic flagged as cosmetic warning; Critic passed the plan.

### Wave 1 — BE: broadn-p7-t1-all-samples

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 9 | 2026-04-03T00:20Z | SPAWN | BE#1 | Task packet dispatched |
| 10 | 2026-04-03T00:25Z | COMPLETE | BE#1 | Commit `cc661b8`; verification gate passed |
| 11 | 2026-04-03T00:25Z | SPAWN | AUD#1 | Audit |
| 12 | 2026-04-03T00:30Z | AUDIT_PASS | AUD#1 | SA/QA/SX — first-pass PASS |
| 13 | 2026-04-03T00:30Z | SPAWN | AR#1 | Archive |
| 14 | 2026-04-02T19:00Z | COMPLETE | AR#1 | Logged in `docs/project_log.md` |

**Feedback loops:** 0.

**50-line gate:** BE#1 produced 51 net new lines in `preprocess_data.py`. ORC accepted with documented exception: JSON validity check + spot-check of 4,571 count constitutes a functional verification gate for a data-generation-only task. Documented in commit message per protocol established in p6.

### Wave 2 — FE: broadn-p7-t2-table-filter

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 14 | 2026-04-03T00:30Z | SPAWN | FE#1 | Task packet dispatched (parallel with AR#1) |
| 15 | 2026-04-03T00:40Z | COMPLETE | FE#1 | 99 net new lines; not committed pending audit |
| 16 | 2026-04-03T00:40Z | SPAWN | AUD#2 | Audit |
| 17 | 2026-04-03T00:45Z | AUDIT_PASS | AUD#2 | SA/QA/SX — first-pass PASS; commit `fcf3ff4` |
| 18 | 2026-04-03T01:00Z | SPRINT_CLOSE | ORC | `DONE` — browser verification pending |
| 19 | 2026-04-02T22:50Z | COMPLETE | AR#4 | Logged; `docs/SESSION-CHECKPOINT.md` updated |

**Feedback loops:** 0 audit failures.

**50-line gate:** FE#1 reported 99 net new lines (132 added, 33 deleted). Gate exception documented in commit message per task spec instruction.

---

## 3. Post-Delivery Bugs

Both bugs were discovered by human browser testing after sprint close. Fixed in commit `1d6a544`.

### Bug 1 — Slice filter always returned all rows (case mismatch)

**Symptom:** Clicking a slice group (e.g., a project name) had no effect on the table; all 4,571 rows remained visible regardless of which project or location was selected.

**Root cause:** `renderTable()` compared `filterState.slice.category` against lowercase string literals:

```js
if (sliceCat === 'project' && sliceGroup) { ... }
else if (sliceCat === 'location' && sliceGroup) { ... }
else if (sliceCat === 'lab_group' && sliceGroup) { ... }
```

The actual values of the `SLICE_CATEGORIES` constant in the codebase are `'Project'`, `'Location / Hub'`, and `'Lab Group'` (title case, with spaces). The comparison always fell through all three branches and `passSlice` remained `true` for every row.

**Why it was not caught before delivery:** The PM plan specified the lowercase literals `'project'`, `'location'`, `'lab_group'` and the task packet described the `filterState.slice.category` values as those same lowercase strings. Both the Critic (on rev1) and the Auditor accepted the plan and the implementation at face value. Neither agent grepped for or read the `SLICE_CATEGORIES` constant definition in `index.html` to verify that the specified literals matched the values the constant actually holds.

**Fix:** Replace the three lowercase literals in `renderTable()` with the exact `SLICE_CATEGORIES` constant values (or compare against the constant directly).

### Bug 2 — Tag badge toggles did not re-render the table

**Symptom:** Toggling a tag badge (AM/PM, Q1, etc.) updated the charts and the active tag banner correctly, but the Data Explorer table was not updated — it continued to show the pre-toggle row set.

**Root cause:** `applyFilter()` has an explicit comment at line ~1092: "does NOT call renderView()." After `applyFilter()` updates `filterState.tags`, it does not call `renderView()` — it handles its own UI update path. The plan's reasoning was "applyFilter() → renderView() — renderView covers it," which is factually wrong. `refreshTableIfReady()` is wired to all three `renderView()` exit points, but since tag-badge toggles never reach `renderView()`, `refreshTableIfReady()` is never called on a tag toggle.

**Fix:** Add a call to `refreshTableIfReady()` at the end of `applyFilter()` (after the existing filter-state update and chart re-render logic).

---

## 4. QA Gap Analysis

**Current QA protocol:** Manual code trace covering labeled scenarios. No automated browser tests (static HTML, no build system, no test runner).

**What the auditor's QA trace verified correctly:**
- Scenario 1: default state (no slice, no tags) → all rows visible, pagination present
- Scenario 2: project slice active → `s.project === sliceGroup` code path traced
- Scenario 3: tag filter active (AND logic) → `filterState.tags.every()` traced, quadrant comma-split verified
- Scenario 4: page navigation → offset math verified
- Scenario 5: filter narrows to fewer than 100 results → pagination hidden
- Scenario 6: `refreshTableIfReady()` confirmed at all three `renderView()` exit points (lines 2728, 2759, 2820)

**Where the QA trace fell short:**

**Gap A — Semantic correctness of string literals (Bug 1 root cause):**
The trace in Scenario 2 verified that the project filter code path was syntactically present and structurally correct (the `if/else if` ladder, the `s.project === sliceGroup` comparison). It did not verify that `sliceCat === 'project'` could ever be `true`. To do so, the auditor would have needed to look up what values `filterState.slice.category` can actually hold — i.e., read the `SLICE_CATEGORIES` constant definition in the codebase. The trace verified the wiring; it did not verify the semantic correctness of the string literals in the conditions.

**Gap B — Full call-chain from user action (Bug 2 root cause):**
Scenario 6 verified that `refreshTableIfReady()` is present at all three `renderView()` exit points. This is structurally correct. However, the trace did not follow the complete call chain for the relevant user action: "user clicks a tag badge → which function is called → does that function call `renderView()`?" If the auditor had traced from the tag badge `onClick` handler through `applyFilter()`, they would have encountered the comment "does NOT call renderView()" at line ~1092. The trace started from the new code (`refreshTableIfReady()`) and verified its wiring, but did not verify that any user action actually reaches it via the tag-toggle path.

**Summary:** The QA trace verified *wiring* (is the hook present?) but not *reachability* (can the hook be reached from the relevant user action?). And it verified *syntax* of the filter comparisons (is the if/else ladder correct?) but not *semantic correctness* (do these string literals match the values the variable can actually hold?).

---

## 5. Agent Performance Summary

| Agent | Tasks | First-pass audit rate | Notes |
|-------|-------|----------------------|-------|
| PM#0 (rev0) | 1 decomposition | N/A | BLOCK from 2 real structural issues |
| PM#1 (rev1) | 1 decomposition | N/A | Clean PASS on second round; CR#2 warning only cosmetic |
| CR#1 | 1 critique | N/A | Caught both BLOCKERs correctly; read codebase to find df_col_map assignment order and renderView exit structure |
| CR#2 | 1 critique | N/A | PASS; flagged cosmetic contradiction in risk flag |
| BE#1 | 1 | 100% | Clean delivery; correctly self-reported 50-line gate exception before committing |
| FE#1 | 1 | 100% | All 9 change sites applied correctly; gate exception documented |
| AUD#1 | 1 | — | SA/QA/SX PASS on t1; no post-delivery bugs in BE work |
| AUD#2 | 1 | — | SA/QA/SX PASS on t2; missed both post-delivery bugs (see Section 4) |

**Most impactful single agent action:** CR#1's identification of the `renderView()` three-exit-point issue. The original plan would have shipped with tag-badge toggles silently not updating the table — a visible, reproducible bug that would have been caught only by browser testing. The Critic directly read `renderView()` in `index.html` and identified the two early-return branches. This was not a pattern from prior post-mortems; it was a fresh codebase read that produced a genuine BLOCKER.

**Recurring failure pattern — PM assumes call chains without reading callers:** This sprint's PM BLOCKER 2 (applyFilter → renderView assumed) and the post-delivery Bug 2 root cause share the same underlying failure: assuming a call chain relationship without reading the function body to verify it. The PM stated "adding to renderView end is sufficient" without reading `applyFilter()` to check whether it actually calls `renderView()`. There is an explicit comment in `applyFilter()` at line ~1092 stating "does NOT call renderView()" — the PM plan's assumption directly contradicts this comment.

---

## 6. Protocol Gaps Identified

| # | Gap | Impact | Suggested fix |
|---|-----|--------|---------------|
| 1 | **Critic does not verify constant values when a plan introduces string literal comparisons** | Bug 1 shipped: `SLICE_CATEGORIES` values are title case but plan specified lowercase literals. Neither PM nor Critic read the constant definition. | Add to Critic checklist: "For any new `===` comparison against a string literal where the left-hand side is a named constant or state variable, grep or read the constant definition and confirm the literal matches the actual value. Example: if the plan uses `sliceCat === 'project'`, find where `sliceCat` is assigned and verify `'project'` is a possible value." |
| 2 | **Auditor QA trace follows code forward from new code, not backward from user action** | Bug 2 shipped: tag badge toggle never reaches `refreshTableIfReady()` because `applyFilter()` does not call `renderView()`. The trace verified the hook was present but not that it was reachable from tag toggles. | Add to auditor QA protocol: "For any event-driven wiring (onClick, onChange, state-change callback), trace the full call chain from the user action to the new code, not only from the new code forward. For this sprint: 'user clicks tag badge → applyFilter() → [does this call renderView()?]' must be traced, not just 'refreshTableIfReady() is called at renderView() exits'." |
| 3 | **PM must not assert call-chain relationships without reading the caller** | Bug 2 root cause: "applyFilter() → renderView() — adding to renderView end is sufficient" was stated without reading `applyFilter()`. The function has an explicit comment contradicting this assumption. | Add to PM pre-flight checklist: "Before stating that function A triggers function B (e.g., 'applyFilter() calls renderView()'), read function A's body or grep for the callee name inside it to verify. Do not infer call chains from function names or prior assumptions. If the call chain cannot be confirmed by reading the source, flag it as an assumption in `<risk_flags>`." |

---

## 7. Final Deliverable State

**App/Service:** `index.html` (static single-page dashboard) + `scripts/preprocess_data.py` + `data/data.json`
**Build:** N/A (no build system)
**Runtime:** Browser-verified by human after commit `1d6a544`. All features functional with no regressions.

**Commits:**
- `cc661b8` — `build_all_samples()` in `preprocess_data.py`; `all_samples` key in `data.json` (4,571 records, 12 fields each)
- `fcf3ff4` — `renderTable(samples, page)` rewrite + pagination + `refreshTableIfReady()` at 3 `renderView()` exits
- `1d6a544` — Post-delivery bug fix: case mismatch in slice filter comparisons; `refreshTableIfReady()` call added to end of `applyFilter()`

**Features delivered:**
- All 4,571 field samples browsable in Data Explorer table
- Table filters by active slice (project / location / lab group) and active tag set (AND logic, quadrant comma-split)
- Pagination at 100 rows per page with Prev/Next controls (keyboard-navigable, `type="button"`, `aria-label`)
- Table re-renders on slice change, tag toggle, dropdown filter change, and page navigation
- Local dropdown filters (category, site, year) applied on top of dashboard filter state
- Row count display: "Showing N–M of T samples" / "Showing N of N samples" / "No samples match the selected filters"

**Key contracts established:**
- `data.all_samples` — array of 4,571 objects with keys: `id`, `date`, `site`, `type`, `category`, `project`, `lab_group`, `am_pm`, `replicate`, `quadrant`, `position`, `field_control`; nullable fields: `date`, `site`, `type`, `project`, `lab_group`, `am_pm`, `replicate`, `quadrant`, `position`, `field_control`
- `filterState.slice.category` values: `SLICE_CATEGORIES.PROJECT` (`'Project'`), `SLICE_CATEGORIES.LOCATION` (`'Location / Hub'`), `SLICE_CATEGORIES.LAB_GROUP` (`'Lab Group'`), or `null`
- `refreshTableIfReady()` is the canonical call for any code path that needs to re-render the table when `appData` may not yet be loaded
- `applyFilter()` does NOT call `renderView()` — it manages its own UI update path; any table re-render after a tag toggle must go through `applyFilter()` directly

---

## Archivist Note

The Archivist (AR) should log this post-mortem as a sprint-level knowledge entry for `broadn-p7-sample-table`. The three protocol gaps in Section 6 are actionable updates to the Critic checklist (Gap 1), the Auditor QA protocol (Gap 2), and the PM pre-flight checklist (Gap 3). These should be applied via the `agent-improvement` skill before the next sprint that involves string-literal comparisons against named constants or event-driven wiring verification.
