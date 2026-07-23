# After-Action: broadn-p12 Altitude Single-Rail Navigation

**Date:** 2026-06-26
**Project:** `/home/jhber/projects/broadn-web-view`
**Duration:** ~2h (first SPAWN PM 2026-06-25T23:15Z → last fix re-audit 2026-06-26T01:15Z; durations approximate per clock-skew caveat)
**Final State:** Single left-rail navigation SHIPPED and PUSHED to `main` (3 commits: `23277f1` feature, `a3b0c65` ceremony, `561259b` layout fix; all Audit: PASS). REQVAL COVERED 13/13. Two bugs found+fixed during verification (B6 mobile-drawer in-pipeline; rail-centering at human Step 4.5). Human browser-verified and pushed (`330b1f9..561259b`). Live on GitHub Pages.

---

## 1. Original Request

**Human (2026-06-25):** "scope the altitude design decision" → after choosing the single-rail model and confirming D1-a, "commit scope, then dispatch the build."

**Brief file:** `.claude/tasks/outputs/broadn-p12-altitude-single-rail-PM-1782429278.md` (+ amendment `-amend-PM-1782429581.md`)
**Contract:** `docs/ALTITUDE-DESIGN-SCOPING.md` (committed 8e9a436)

**Scope at intake:** The dashboard had two competing nav models (top section-nav + left slice-rail); slicing left 4 of 5 top-nav anchors pointing at hidden sections, and the Data Explorer leaked into every state. Goal: unify to one left rail (STORY + EXPLORE groups), brand-only top bar, D1-a continuous story scroll.

**Skill invoked:** dispatch-task (full pipeline).

---

## 2. Agent Activity Log

### Plan → Implement → Audit — (broadn-p12-altitude-single-rail / -FE-001)

| Seq (by file) | Event | Agent | Notes |
|-----|-------|-------|-------|
| 51/06-25 | SPAWN | PM#1 | decomposition |
| 52 | COMPLETE | PM#1 | 1 FE packet, no UI-spec packet (justified); item-7 deferred |
| 59/60 (renum) | SPAWN/COMPLETE | CR#1 | CRITIQUE_PASS + 3 WARNINGs (no blocker) |
| 61/62 | SPAWN/COMPLETE | PM#1 | warning-resolution amendment (M7/M8/M9/B8/B9 + 2 caught hazards) |
| 63/64 | SPAWN/COMPLETE | FE#1 | ui_packet; M1–M9 reported; did NOT run B-walk (declared TIER_1_ONLY) |
| 65/1(06-26) | SPAWN/AUDIT_FAIL | AUD#1 | SA PASS, SX SECURE, QA FAIL on B6 (mobile drawer 0×0) |
| 2/4(06-26) | SPAWN/COMPLETE | FE#1 (rem) | applied B6 wrapper fix to app.js:4197/4218; no packet written |
| 5/6(06-26) | SPAWN/AUDIT_PASS | AUD#1 (reaudit) | B6 fixed live (288×844), desktop unregressed, 0 console errors |
| 9 | SPAWN/COMPLETE | AR#1 | archive entry to project_log.md |
| — | COMMIT | ORC#0 | durability 23277f1 + ceremony a3b0c65 |
| 12/14(06-26) | SPAWN/COMPLETE | FE#1 (FE-002) | w-full layout fix (index.html:84); no packet written (ORC backfilled) |
| 15/16-17(06-26) | SPAWN/AUDIT_PASS | AUD#1 (FE-002 reaudit) | rail pinned left x=32 live, body 960px, no overflow, drawer + Explorer-gating intact, 0 errors |
| — | COMMIT/PUSH | ORC#0/Human | 561259b layout fix; human pushed 330b1f9..561259b |

**Feedback loops:** 2 audit-fail → remediate → reaudit cycles — (1) B6 mobile-drawer (in-pipeline); (2) rail-centering / layout-collapse (FE-002, found at human verification Step 4.5).
**Root cause of failure(s):**
- B6 — pre-existing CSS bug: `openMobileDrawer()` toggled `#slice-sidebar` but `hidden lg:flex` (display:none on mobile) lives on the parent `#slice-sidebar-wrapper`, never un-hidden → fixed child of a display:none ancestor renders 0×0. Reproduces at rollback 8e9a436. Elevated to blocker because this sprint removed the top nav (the only prior mobile nav).
- Rail-centering (Bug 1, §3) — empty `#dashboard-body` collapsed `#dashboard-layout` (no `w-full`) so `mx-auto` centered the lone sidebar; a side effect of gating the Explorer. Fixed by `w-full`.
**Deviation from brief:** none in scope. Item-7 (hash routing) deferred as planned.

---

## 3. Post-Delivery: Runtime Bugs (if any)

**Bug 1 — rail centers in empty viewport on category-no-group state.**
**Reporter:** Human (browser verification, Step 4.5, before push).
**Symptom:** Clicking a slice category (Project/Location-Hub/Lab Group) without yet picking a group made the entire sidebar jump to the horizontal center of the page with blank space on both sides.
**Root cause:** In renderView's `cat!==null && group===null` branch all three #dashboard-body panes are hidden; #dashboard-body is `flex-grow min-w-0` and #dashboard-layout had `max-w-7xl mx-auto` with NO explicit width → the empty body collapsed to 0 width and mx-auto centered the lone ~256px sidebar.
**Fix applied:** `index.html:84` — added `w-full` to #dashboard-layout (commit 561259b, re-audited live PASS).
**Why agents did not catch this:** a DIRECT consequence of gating the Explorer (R-005). Pre-sprint, #explorer always rendered inside #dashboard-body, incidentally holding it open in this intermediate state; gating it removed that prop. The QA B-walk (B3) went category→group directly and never paused on the "category selected, no group yet" layout — the exact state that broke. The audit verified every *navigation outcome* but not the *intermediate selection state's layout*.

(B6 mobile-drawer was caught in-pipeline by the QA gate and remediated before close — see §2.)

---

## 4. QA Gap Analysis

**Current QA protocol:** code-auditor serves the static site via `python3 -m http.server` + drives Playwright with cache-bust; walks the B1–B9 checklist.

**What this caught:** B6 mobile-drawer 0×0 — found ONLY because the auditor ran the walk live at a 390px viewport. The FE marked B6 ✓ from a code trace without running it.

**What this missed (then caught on re-audit):** nothing additional; the reaudit confirmed the fix + desktop non-regression.

**Recommendations:**
- The FE-self-verify gap (claiming a browser SC passed from a code trace) is the key signal — see §6. The live auditor walk is doing real work and must remain mandatory for vanilla-HTML FE sprints; the cache-bust + mobile-viewport steps were both load-bearing here.

---

## 5. Agent Performance Summary

| Agent | Tasks | First-pass rate | Notes |
|-------|-------|----------------|-------|
| PM#1 | 1 + amendment | 100% | tight decomposition; amendment caught 2 real hazards (desktop focus-steal on close-on-select; hardcoded getCategoryButtons array) the Critic hadn't named |
| CR#1 | 1 | 100% | confirmed no-split; all cited facts verified; 3 actionable warnings |
| FE#1 | 1 + 2 rem | ~33% (2 remediation cycles) | solid core implementation; both failures were missed live-tests, not logic errors (B6 pre-existing CSS; rail-centering a layout side-effect of Explorer-gating). Both remediations applied the CORRECT fix but neither wrote its packet (ORC backfilled both). |
| AUD#1 | 3 | 100% | most impactful agent this sprint — live walks caught the B6 mobile defect AND verified both fixes; the layout-collapse bug slipped only because the FIRST audit walk didn't pause on the intermediate selection state (now a §6 checklist fix) |

**Most impactful single agent action:** AUD#1's live mobile-viewport B6 walk (would have shipped mobile with zero navigation otherwise).
**Recurring failure patterns:** (1) FE marking browser-SCs ✓ from code traces without running them — twice (B6, then the layout state); the live auditor walk is the real gate. (2) FE remediations not writing their packets — twice (ORC backfilled both). (3) event-log seq hygiene (see §6) — ORC hardcoded seqs while the SubagentStop hook auto-logged COMPLETEs at the same numbers.

---

## 6. Protocol Gaps Identified

> Code-not-prompt check applied per row.

| Gap | Impact | Suggested fix |
|-----|--------|---------------|
| ORC hardcoded event-log seqs from memory instead of reading max(seq) at append time; the SubagentStop hook auto-logged CR and PM-amend COMPLETEs at the same seqs → two collisions (54, 55), required a full renumber. | Event-graph integrity; ~2 manual fix cycles. Recurrence of the documented "never hardcode SPAWN seq" rule. | ORC must route ALL manual event appends through the `log-event` skill (flock + seq continuation) rather than bash heredocs. Code-not-prompt: log-event already exists; the gap is ORC bypassing it. Consider a tiny `next-seq.sh` helper that emits `max(seq)+1` across the UTC-dated file. Route to HR. |
| A `python3 json.dumps` rewrite of the event log wrote `"seq": N` (with a space); a later ORC bash check grepped `'"seq":[0-9]+'` (no space) and silently computed next-seq = 1, producing a seq-1 collision. | One mis-numbered append; caught + fixed same-turn. | The `next-seq.sh`/log-event helper above also removes the ad-hoc grep. If a script rewrites the log, keep `json.dumps(separators=(",",":"))` to preserve the no-space format the greps assume. Route to HR. |
| FE remediation (background resume) applied the code fix but returned without writing its `-rem` packet or running the live B6 re-test it was asked to run. | ORC had to code-verify the fix manually + backfill a COMPLETE; the receipt artifact for the remediation is absent. | Remediation dispatches should treat "packet written at the expected path" as the completion signal; a background-resumed agent that returns without the packet should be re-prompted once for the packet before re-audit. Consider an ORC receipt-check on remediation returns mirroring the wave-0 receipt check. Prompt/skill edit — route to HR. |
| SubagentStop hook logged the auditor's AUDIT_FAIL / AUDIT_PASS verdict events but NOT the lifecycle COMPLETE for AUD#1 (both audit + reaudit). | 2 unmatched SPAWNs; ORC backfilled at Step 3.7. Recurring hook-miss class for the auditor path. | Confirm the auditor's own verdict-emit doesn't suppress the SubagentStop COMPLETE auto-log; if it does, the hook should emit both. Investigate hook keying for agents that emit their own terminal verdict event. Route to HR. |
| The mobile-drawer 0×0 bug pre-existed (rollback 8e9a436) but was never caught because no prior sprint ran a live mobile-viewport walk. | Mobile drawer was silently broken for an unknown period. | Add a standing mobile-viewport (≤sm) step to the auditor's QA walk for any sprint touching nav/layout, not just this one. Prompt edit — route to HR. |
| QA B-walk tested navigation OUTCOMES (category→group→view) but never the INTERMEDIATE selection state (category selected, no group yet) — exactly the state whose layout broke (Bug 1, §3). Found only at human verification. | One post-audit remediation cycle (FE-002) + a late catch that nearly shipped. | When a sprint changes which elements occupy a shared container (here: gating #explorer out of #dashboard-body), the auditor's QA walk must exercise EVERY intermediate state of the container, not just terminal states — especially any state where the container can become empty. Add "test empty/transitional container states" to the auditor nav/layout checklist. Prompt edit — route to HR. |
| Gating a previously-always-present element (#explorer) had a non-obvious layout side effect (it was incidentally holding the flex body open). No pre-flight asked "what does removing this element's footprint do to the layout in states where nothing else is present?" | Bug 1. | PM/Critic checklist: when a packet hides/gates an element that was previously unconditional, flag the container's other states for explicit layout review. Prompt edit — route to HR. |

---

## 7. Final Deliverable State

**App/Service:** `/home/jhber/projects/broadn-web-view` static dashboard (GitHub Pages).
**Build:** N/A (no build system). **Runtime:** auditor-confirmed working on live render (desktop + 390px mobile), 0 console errors. Human browser-verified at Step 4.5 (caught the rail-centering bug) and PUSHED — live on Pages. **Commits:** `23277f1` (feature), `a3b0c65` (ceremony), `561259b` (layout fix), pushed as `330b1f9..561259b`.

**Features delivered:**
- Single left-rail nav: STORY group (Overview/Geography/Pipeline/Data Management, scroll-to within one continuous narrative pane per D1-a) + EXPLORE group (All BROADN Samples/Project/Location-Hub/Lab Group/Explorer, swap to single-view tool mode).
- Top nav reduced to brand-only (5 section links removed).
- Explicit pane mode (story/tool/explorer) as a single source of truth in `renderView()`; cat===null default path intact.
- Data Explorer gated behind its own rail item (was always-on).
- Scroll-spy repointed to highlight the active STORY rail item; disabled in tool mode.
- Roving-keyboard array extended to 9 items + guarded close-on-select for every rail item.
- Pre-existing mobile-drawer 0×0 bug fixed.

**Key contracts:** FE-only; `index.html` (markup) + `assets/app.js` (state machine). No data/chart/?design changes. Hash-routing (deep links) deferred.

---

## 7b. Progression Ledger Entry (AA-§7)

**sprint_id:** `broadn-p12-altitude-single-rail`

**xp_gained:**
- surface: CLAUDE.md | delta: n/a
- surface: Skills | delta: dispatch-task full pipeline exercised end-to-end on a single-FE-packet sprint incl. warning-resolution branch
- surface: Agents | delta: auditor live mobile-viewport walk caught a pre-existing 0×0 regression

**levels_advanced:**
- Dashboard navigation consolidated from dual-model to single-rail (resolves the complexity-review altitude finding §3)

**new_capabilities:**
- None this sprint (no new deterministic tooling added).

```jsonl
{"sprint_id":"broadn-p12-altitude-single-rail","xp_gained":[{"surface":"Skills","delta":"dispatch-task full pipeline incl. warning-resolution branch on a single-FE-packet sprint"},{"surface":"Agents","delta":"auditor live mobile-viewport walk caught pre-existing 0x0 drawer regression"}],"levels_advanced":["dashboard nav unified dual-model -> single left-rail"],"new_capabilities":[]}
```

---

## 8. Skill-Use Analysis

### 8a. Skill Invocation Log

| Skill | Invocations | Outcome | Owner | Last reviewed | Notes |
|-------|-------------|---------|-------|---------------|-------|
| convention-detect | 1 | VALUABLE | ORC | 2026-06-26 | caught stale "self-contained index.html" block; rewrote to reflect assets/ split |
| pm-preflight | 1 | VALUABLE | ORC | 2026-06-26 | script absent (base-plan fallback); extracted relevant §6 gaps into PM brief |
| dispatch-task | 1 | VALUABLE | ORC | 2026-06-26 | drove full pipeline |
| assign-agents | 1 | VALUABLE | ORC | 2026-06-26 | manifest + capability preflight |
| requirements-validate | 1 | VALUABLE | ORC | 2026-06-26 | Mode A inline; 13/13 COVERED |
| commit-packet | 1 | VALUABLE | ORC | 2026-06-26 | base-plan substrate path; scoped durability commit; asset-closure check passed |
| after-action | 1 | VALUABLE | ORC | 2026-06-26 | this document |

### 8b. Obsolescence Candidates
None.

### 8c. Content-Quality Candidates
None — all invoked skills shaped the outcome as written.

### 8d. New Skill Candidates

| Pattern observed | Frequency | Effort | Suggested skill name |
|-----------------|-----------|--------|---------------------|
| ORC computing next event-log seq + appending safely (collisions happened twice) | ~6 manual appends | LOW | (extend existing `log-event` / add `next-seq.sh`) |

### 8e. Skill Drift Candidates
None observed.

---

## 9. Rule / Ref / CLAUDE.md Delta Proposals

| Target file | Proposed change | Priority | Rationale |
|-------------|----------------|----------|-----------|
| (none) | None this sprint. | — | The seq-hygiene and remediation-packet gaps are agent/skill/hook fixes (§6), not rule changes. |

---

## 10. Eval Gap Proposals

None this sprint.

---

## 11. Connectivity Findings

**Analyzer run this sprint:** No — manual observations only. No broken refs or orphan nodes observed in the dispatch chain.
