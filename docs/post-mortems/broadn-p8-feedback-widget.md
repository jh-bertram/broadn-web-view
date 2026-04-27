# Post-Mortem: broadn-p8 Feedback Widget
**Date:** 2026-04-27
**Project:** `/home/jhber/projects/broadn-web-view/`
**Duration:** ~3h45m wall-clock (RA preflight 2026-04-23T00:00Z → ARC 2026-04-23T03:45Z; some intermediate timestamps from main-session ORC and SubagentStop hook do not align — see §2 note)
**Final State:** In-page feedback widget shipped to GitHub Pages preview: 17 landmark icons + floating button → modal → Google Apps Script → Google Sheet. 5 new files (1,512 lines), index.html +21/-17. All gates PASS after one FE remediation cycle. Commits: `c336c7d` (feat) + `eae7d49` (fix: task-registry restore after Gap 1 incident) + `4a28fce` (docs: archive_entry log).

---

## 1. Original Request

**Human (2026-04-22):** "I'd like to add a feedback widget to the BROADN GitHub Pages preview. Every element, or almost every element, should have a tiny feedback icon near it that researchers can click to leave comments. Submissions should land somewhere I can review them later — free, no third-party SaaS, my data."

**Brief file:** `.claude/agents/tasks/outputs/broadn-p8-feedback-widget-PM-1761177900.md` (initial decomposition, 11-hook scope) + `.claude/agents/tasks/outputs/broadn-p8-feedback-widget-PM-1761183600.md` (post-Critic amendment, 17-hook scope after human-confirmed Option B).

**Scope at intake:**
- Existing: vanilla HTML dashboard at `index.html`, no build system, no backend.
- To build: floating feedback icon system, modal/popover composer, durable backend, deployment doc.
- Constraints: free, user-owned data, no SaaS lock-in, no breaking changes to dashboard JS/CSS.

**Skill invoked:** `scry` (RA preflight) → `dispatch-task` (PM/Critic/agents/audit/ARC) → `commit-packet` (post-PASS) → `tidy-up` (separate later session) → `post-mortem` (this run).

---

## 2. Agent Activity Log

> **Note on timestamps.** The 2026-04-23 event log contains two timestamp series interleaved: ORC#0-authored events using sprint-relative wall-clock (`00:00Z`–`03:45Z`) and SubagentStop hook events using true UTC (`21:30Z`–`22:34Z`). Causal order is reconstructable from `seq` column; clock comparison across rows is not meaningful. Two duplicate seq rows (seq 25, seq 1 reset) confirm the task-registry clobber that commit `eae7d49` partially restored — see Gap 1 below.

### Phase 1: Preflight (RA + PM + Critic)

| Seq | Timestamp | Event | Agent | Notes |
|----|-----------|-------|-------|-------|
| 1  | 00:00Z | SPAWN | RA#1 | scry preflight: GAS CORS pattern, Formspree limits, Issues API constraint |
| 2  | 00:00Z | COMPLETE | RA#1 | evidence_brief returned: text/plain bypass for OPTIONS preflight verified across 2024–2025 sources |
| 3  | 00:05Z | SPAWN | PM#1 | initial decomposition |
| 6  | 00:30Z | COMPLETE | PM#1 | task_decomposition: 11-landmark scope, 3 task packets (t1-ui, t2-be, t3-fe) |
| 7  | 00:35Z | SPAWN | CR#1 | plan critique |
| 8  | 00:55Z | CRITIQUE_PASS | CR#1 | PASS with 4 WARNINGs: scope drift (11 vs "every element"), z-index unspecified, 50-line gate exposure, sidebar icon scroll-away |
| 9  | 01:00Z | SPAWN | PM#2 | warning_resolution_request after human confirmed Option B (17 hooks) |
| 10 | 01:00Z | COMPLETE | PM#2 | plan_amendment: scope expanded from 11 → 17, popover z-[70], split-or-document commit strategy, sidebar icon anchored to `#slice-sidebar-wrapper` |

**Feedback loops at this phase:** 1 PM amendment (driven by Critic warnings + human scope confirmation). All 4 warnings actionable; none required re-decomposition.

**Critic value:** all 4 warnings would have been delivery defects had they shipped. Most consequential: sidebar host pivot from `aside#slice-sidebar` (scrollable) to `#slice-sidebar-wrapper` (parent, stationary) — would have produced an icon that scrolls off-screen mid-list-browse.

### Phase 2: Wave 1 — UI Spec + Backend (parallel)

| Seq | Timestamp | Event | Agent | Notes |
|----|-----------|-------|-------|-------|
| 11 | 01:15Z | SPAWN | UI#1 | t1-ui: design spec for icon + popover |
| 12 | 01:15Z | SPAWN | BE#1 | t2-be: GAS Code.gs + SETUP.md |
| 13 | 02:11Z | COMPLETE | BE#1 | t2-be completion_packet: Code.gs (175 lines) + SETUP.md (232 lines) |
| 14 | 21:30Z (UTC) | COMPLETE | UI#1 | t1-ui design_spec returned |
| 15 | 01:45Z | SPAWN | AUD#1 | audit t1-ui |
| 16 | 01:45Z | SPAWN | AUD#2 | audit t2-be |
| 17 | 21:31Z (UTC) | AUDIT_PASS | AUDITOR#1 | t2-be PASS with 3 ADVISORY items (formula-injection, var→const, security section in SETUP.md) |
| 18 | 21:31Z (UTC) | AUDIT_PASS | AUDITOR#1 | t1-ui PASS |

**Feedback loops:** 0. Both Wave 1 tasks first-pass PASS.

**Notable:** t2-be advisories were correctly classified as non-blocking polish, not failures — auditor flagged them for a follow-up remediation pass rather than gating Wave 2.

### Phase 3: Wave 2 — FE + BE Remediation (parallel)

| Seq | Timestamp | Event | Agent | Notes |
|----|-----------|-------|-------|-------|
| 21 | 02:05Z | SPAWN | BE#2 | t2-be-remediation: apply 3 advisory items |
| 22 | 02:05Z | SPAWN | FE#1 | t3-fe: feedback-config.js + feedback-widget.css + feedback-widget.js + index.html wiring |
| 23 | 00:04Z | COMPLETE | BE#1 | t2-be-remediation completion_packet: sanitizeForSheet helper, const SHEET_ID/SHEET_NAME/HEADERS, "Security considerations" section |
| 25a | 00:55Z | COMPLETE | FE#1 | t3-fe ui_packet: 1,392 lines new code (CSS + JS + 4-line config) |
| 25b | 02:30Z | SPAWN | AUD#3 | audit t3-fe |
| 26 | 02:30Z | SPAWN | AUD#4 | audit t2-be-remediation |
| 27 | 21:54Z (UTC) | **AUDIT_FAIL** | AUDITOR#1 | t3-fe FAIL: focus trap escapes popover when submit disabled + identity panel collapsed (a11y BLOCKER) |
| 28 | 00:00Z | AUDIT_PASS | AUDITOR#1 | t2-be-remediation PASS |
| 29 | 03:00Z | AUDIT_FAIL | AUD#3 | t3-fe FAIL (duplicate of seq 27 in clobbered log) |

**Feedback loops:** 1. t3-fe failed first-pass on a single QA defect detected by Playwright Tier 3 (Tab/Shift+Tab matrix).

**Root cause of failure:** `getFocusableElements()` (feedback-widget.js:370–376) queried `input:not([disabled])` without a visibility filter. When the identity panel was `display:none`, hidden `#fb-name` and `#fb-email` were still in the focusable array. Trap check `document.activeElement === last` (last = hidden `fb-email`) never matched the active element (last *visible* = `#fb-identity-toggle`), so the browser fell through to native Tab and skipped the hidden inputs entirely — exiting the popover. The defect is a textbook "querySelectorAll matches `display:none` descendants" gotcha that does not reproduce when the disclosure panel is open (Tier 3 partial-state coverage caught it; binary-state coverage would have missed it).

**Deviation from PM brief:** none in Wave 2. The Critic's WARNING #3 (50-line gate exposure) was honored: FE shipped 1,392 lines as the audit-gate-pass exception path, with the auditor explicitly accepting via the gate-with-exception clause.

### Phase 4: Remediation + Close

| Seq | Timestamp | Event | Agent | Notes |
|----|-----------|-------|-------|-------|
| 31 | 03:05Z | SPAWN | FE#2 | t3-fe-remediation |
| 32 | 00:07Z | COMPLETE | FE#1 (logged as remediation owner) | 1-line `.filter(el => el.offsetParent !== null)` + delete invalid `rows: 4;` CSS |
| 33 | 03:10Z | SPAWN | AUD#5 | audit t3-fe-remediation |
| 34 | 22:34Z (UTC) | AUDIT_PASS | AUDITOR#2 | t3-fe-remediation PASS — focus-trap fixed, no regressions in collapsed/expanded panel matrix |
| 35 | 03:40Z | SPAWN | ARC#1 | archive |
| 36 | 03:45Z | COMPLETE | ARC#1 | archive_entry to `docs/project_log.md` |

**Feedback loops:** 0. Single 4-line patch resolved the focus trap; auditor re-ran the failing Playwright assertions (Tab order wrap, Shift+Tab from close-btn) and both passed.

---

## 3. Post-Delivery: Runtime Bugs

None reported. The widget shipped to commit `c336c7d` and the human's browser-verification step (per §7 acceptance) confirmed all 17 landmarks render icons, popover opens/closes correctly, GAS POST succeeds, focus trap holds in both panel-collapsed and panel-expanded states.

One adjacent post-delivery incident (the "task-registry clobber" repaired by commit `eae7d49`) was a workflow defect during the durability commit, not a runtime bug — see Gap 1.

---

## 4. QA Gap Analysis

**Current QA protocol:** AUDITOR#1 ran 4-tier Playwright matrix on a `python3 -m http.server` instance — 22 assertions covering structure, not-configured state, configured state with route-intercepted endpoint, and dashboard non-regression. SA gate: line-by-line file inspection vs DESIGN.md tokens, class-prefix discipline, asset-load order. SX gate: 10 explicit checks (textContent vs innerHTML, payload schema, eval/Function bans, server-error message ignored, no hardcoded secrets).

**What this caught:**
- Focus-trap failure under partial state (submit disabled + identity panel collapsed) — Playwright Tier 3, lines 140 + 145 of audit report, both Tab and Shift+Tab assertions FAIL on the same root cause.
- Invalid CSS property `rows: 4;` at css:268 (HTML attribute mistakenly written as CSS) — flagged as observation, not gate-failure (browser silently ignores invalid declarations).
- 3 BE advisory improvements (formula injection sanitizer, top-level const, security considerations doc section) — not failures, but routed to a remediation pass that shipped them.

**What this missed:**
- Nothing post-remediation. The focus-trap regression matrix (collapsed panel × disabled submit, collapsed panel × enabled submit, expanded panel × disabled submit, expanded panel × enabled submit) was added implicitly by the Playwright run — it caught the one cell that fails.

**Recommendations:**
- The auditor's a11y focus-trap checklist (auditor.md §QA gate, focus-management subsection) does not currently name the `offsetParent !== null` requirement. Adding it as an explicit pre-flight check item would convert this from an audit-time discovery to a FE-time pre-flight check.

---

## 5. Agent Performance Summary

| Agent | Tasks | First-pass rate | Notes |
|-------|-------|----------------|-------|
| RA#1 (scry preflight) | 1 | 100% | Evidence brief on GAS CORS / Formspree / Issues API was decisive; PM choice of GAS over alternatives rested entirely on RA's per-claim citations |
| PM#1 + PM#2 | 2 (decompose + amendment) | n/a (no audit gate) | Critic-induced amendment was 1 round (4 warnings, all addressed in single pass) |
| CR#1 | 1 | 100% (PASS-with-warnings) | All 4 warnings proved load-bearing — sidebar host pivot prevented a UX defect, z-index spec prevented stacking failure |
| UI#1 | 1 | 100% | Design spec accepted on first audit pass |
| BE#1 → BE#2 (remediation owner) | 1 + 1 | 100% (initial PASS, remediation was advisory polish, not fail-fix) | Remediation pass shipped 3 non-blocking improvements that should arguably have been in scope from the start |
| FE#1 → FE#2 (remediation owner) | 1 + 1 | 0% on initial; 100% on remediation | Single defect, scoped fix, no scope creep |
| AUDITOR#1 + AUDITOR#2 | 5 audits | 5/5 verdicts correct | Tier 3 partial-state matrix caught the focus-trap bug via observable behavior, not code inspection |
| ARC#1 | 1 | 100% | archive_entry written; commit was missed in initial commit-packet flow (see Gap 1) |

**Implementing-task first-pass rate:** 2 of 3 first-pass PASS = 67%. The single fail was a discoverable-only-via-runtime a11y bug; static analysis would not have caught it.

**Most impactful single agent action:** RA#1's scry brief. Without verified citations on the GAS `text/plain` CORS bypass, PM would likely have chosen Formspree (50/mo cap = unfit for researcher use) or GitHub Issues API (requires public PAT = ruled out by data-sovereignty constraint). RA's evidence brief turned a 4-option ambiguity into a single defensible choice on first pass.

**Recurring failure pattern:** None within this sprint. The Gap 1 task-registry clobber is workflow-level, not pattern-recurrence within p8.

---

## 6. Protocol Gaps Identified

| # | Gap | Impact | Suggested fix |
|---|-----|--------|---------------|
| p8-g1 | ORC's "destructive operations" rule names `rm -f`, `git reset --hard`, etc., but does not name **truncating heredocs** (`cat > file <<EOF` overwriting an existing file). The task-registry clobber (`eae7d49`) was caused by a heredoc-rewrite of `docs/task-registry.md` that overwrote prior sprint history. | Silent loss of authored content during a normal-looking durability commit. Caught only because human noticed missing prior entries during /resume-project; restored by hand from git history. | Add to `orchestrator.md` Step 0 / commit-packet skill: "Before any `Write` or heredoc that targets a file >50 lines, Read the file first. If the new content is intended to *replace* a section, use `Edit` with the explicit old/new strings. Heredoc-overwrite of multi-section documents is a destructive op and requires the same human-confirmation gate as `rm -f`." |
| p8-g2 | Auditor's focus-trap a11y checklist (auditor.md §QA gate) lists "trap holds at first/last" but does not name the `offsetParent !== null` filter requirement. FE first-pass implementation matched the existing checklist verbatim and still produced a focus-trap escape under `display:none` descendant inputs. | One audit-fail cycle (1 remediation, ~10 min wall-clock). Easily preventable. | Add to `auditor.md` §QA focus-trap subsection AND `frontend.md` pre-flight: "When implementing role=dialog with aria-modal=true, the focusable-elements query MUST filter `offsetParent !== null` (or equivalent visibility predicate). querySelectorAll matches `display:none` descendants; including them in the trap array breaks the first/last identity check on every state where the dialog has a collapsible region." Cross-propagation candidate: gander-studio-alpha and gander both have role=dialog patterns. |
| p8-g3 | BE submitted 3 advisory items in its first-pass output (formula-injection sanitizer, var→const top-level constants, "Security considerations" section in SETUP.md). All 3 were correct and shipped via a remediation pass — but they should have been in the original PM packet's success_criteria, not discovered post-implementation. PM's t2-be packet did not include "input sanitization for spreadsheet formula injection" despite this being canonical Sheets/Excel hardening that an RA scry pass would have found. | One extra remediation cycle (BE#2 + AUD#4) that should have been part of t2-be from the start. ~25 min wall-clock. | Add to `pm.md` decomposition checklist: "When a task ships data to a tabular output (Sheets, Excel, CSV), success_criteria MUST include a formula-injection sanitization line item (`=`, `+`, `-`, `@` prefix → quote-prefix mitigation). When a task creates a public-endpoint URL committed to a repo, success_criteria MUST include a deployment-revocation procedure section in the SETUP doc." |

---

## 7. Final Deliverable State

**App/Service:** `index.html` (BROADN dashboard, GitHub Pages preview)
**Build:** no build system; static asset load
**Runtime:** confirmed working — human browser-verified all 17 landmarks render icons, popover opens/closes, GAS POST returns 200, focus trap holds in all 4 panel-collapsed × submit-state cells.

**Features delivered:**
- Floating feedback button anchored bottom-right (`#fb-floating-btn`, z-[60])
- 17 inline feedback icons on landmark elements (11 landmark regions + 6 chart cards). Each icon has `aria-label="Leave feedback for {label}"`
- Modal popover (`#fb-popover`, z-[70]) with: textarea, identity disclosure (collapsed by default; name + email when expanded), submit, success/error states, Esc/click-outside dismiss, focus trap with `offsetParent !== null` filter
- 4-line `feedback-config.js` placeholder for the deployed Apps Script URL
- `apps-script/Code.gs` (175 lines): `doPost` with text/plain CORS bypass, server-generated UTC timestamp, `sanitizeForSheet` helper, top-level `const SHEET_ID/SHEET_NAME/HEADERS`
- `apps-script/SETUP.md` (232 lines): step-by-step deployment, security considerations section (deployment URL is semi-public, revocation procedure, privacy disclosure recommendation)
- DESIGN.md compliance: every hex in widget CSS maps to a token

**Key contracts the next engineer needs to know:**
- **Payload schema** (POST body, JSON-stringified, Content-Type `text/plain;charset=utf-8`):
  `{ page_url, element_id, element_label, feedback_text, name?, email?, user_agent, viewport }`
  Server adds `timestamp` (server-generated, never client-supplied).
- **Sheet column order:** `[timestamp, page_url, element_id, element_label, feedback_text, name, email, user_agent, viewport]` — DO NOT reorder; Code.gs uses positional `appendRow`.
- **Response shape:** `{ ok: boolean, error?: string }` on success path, `{ status: string }` on doGet ping. The widget INTENTIONALLY ignores server-provided `error` text and renders a fixed string (defense-in-depth against malicious GAS-response injection).
- **Disable procedure:** remove the two script tags from index.html (lines 3353–3354) and the CSS link (line 11). Strictly additive; no dashboard JS/CSS depends on widget code.
- **Scope marker:** every feedback-anchored element in `index.html` carries `data-feedback="{label}"`. To add a new feedback target, add `data-feedback="..."` to its element; the widget auto-injects an icon on DOMContentLoaded.

---

## 8. Skill-Use Analysis

### 8a. Skill Invocation Log

| Skill | Invocations | Outcome | Owner | Last reviewed | Notes |
|-------|-------------|---------|-------|---------------|-------|
| scry | 1 | VALUABLE | ORC#0 | 2026-04-23 | RA preflight produced citation-grounded GAS CORS evidence that drove PM's backend choice; without it PM would have selected Formspree |
| dispatch-task | 1 | VALUABLE | ORC#0 | 2026-04-23 | full pipeline ran cleanly; one PM amendment cycle absorbed 4 Critic warnings without a re-decomposition |
| convention-detect | 1 | VALUABLE | ORC#0 | 2026-04-23 | PM's plan rested on conventions confirmed at Step 0.5 (vanilla HTML, no build, DESIGN.md as token source) |
| assign-agents | 1 | VALUABLE | ORC#0 | 2026-04-23 | per-agent expectation manifest let auditor cleanly map remediation channel for advisory items |
| audit-pipeline | 5 | VALUABLE | AUDITOR#1+#2 | 2026-04-23 | caught the focus-trap defect via Playwright Tier 3 partial-state matrix |
| commit-packet | 2 | PARTIAL_VALUE | ORC#0 | 2026-04-23 | committed working files cleanly but did not protect `docs/task-registry.md` from heredoc-overwrite — see Gap 1; the durability commit step needs a destructive-write guard |
| requirements-validate | 1 | VALUABLE | ORC#0 | 2026-04-23 | confirmed all 17 landmark + payload + endpoint requirements traced to delivered artifacts before ARC dispatch |
| post-mortem | 1 (this run) | n/a | ORC#0 | 2026-04-27 | this document |
| jidoka | 0 | NOT_TRIGGERED | ORC#0 | n/a | sprint had only 3 task packets touching distinct file domains; below jidoka threshold (4+ packets, 15+ context files). Correct skip. |

### 8b. Obsolescence Candidates

None. All invoked skills produced VALUABLE or PARTIAL_VALUE outcomes; one prior-non-trigger (jidoka) was a correct threshold-based skip, not a drift signal.

### 8c. Content-Quality Candidates

| Skill | Deviation observed | Suspected cause | Recommended action |
|-------|--------------------|----------------|--------------------|
| commit-packet | The skill enumerates "stage only paths the packet enumerates in its files_modified or files_created blocks" but does not warn on heredoc-overwrite of files outside that scope. The task-registry clobber happened during a Write call adjacent to the durability commit, not within it — but the skill could surface a "modified-paths-not-in-packet" warning at commit-time. | OVER_SPECIFIED on staging discipline, UNDER_SPECIFIED on adjacent-file destructive-write defense | CLARIFY: add a step "Before commit, run `git status --porcelain` and confirm all M/A entries are in the packet's file list. If not, halt — there's an unscoped modification adjacent to this packet." |

### 8d. New Skill Candidates

None this sprint.

### 8e. Skill Drift Candidates

None.

### Hand-off to hone

> Post-mortem Section 8 complete. 9 skills logged. 0 obsolescence, 1 content-quality (commit-packet adjacent-file warning), 0 new skill, 0 drift. Run the `hone` skill to act on Section 8c.

---

## Summary for Agent-Improvement

3 protocol gaps in §6, all with concrete mechanical fixes and clear owner agents:
- **p8-g1** → `orchestrator.md` + `commit-packet` SKILL.md (heredoc as destructive op)
- **p8-g2** → `auditor.md` + `frontend.md` (offsetParent filter on focusable queries; cross-propagation candidate to gander/gander-studio-alpha)
- **p8-g3** → `pm.md` (formula-injection + revocation-procedure success-criteria mandates for tabular-output / public-endpoint tasks)

Run `agent-improvement` to act on these.
