# After-Action: BROADN Teal Rebrand (p10 + p11 + cleanup)
**Date:** 2026-06-25
**Project:** `/home/jhber/projects/broadn-web-view`
**Duration:** ~2.5h wall-clock (p10 PM SPAWN seq 11 → p11 AR COMPLETE seq 39; ts-deltas approximate per clock-skew caveat — `seq` is authoritative ordering)
**Final State:** BROADN teal rebrand shipped and pushed live on every rendered surface (dashboard, charts, feedback widget, logo); DESIGN.md at v2.0.0; two P10 escapes found and fixed; console clean (0 errors).

---

## 1. Original Request

**Human (2026-06-25):** "pick up where we left off, with some capturing of filtered states then running the full sprint" — followed by "queue the feedback-widget rebrand as the next sprint", a production bug report ("the logos are just placeholder images and cannot load broadn-logo.webp when i check the github pages"), and "fix that loose thread" (the console 404s).

**Brief files:** `.claude/tasks/broadn-p10-design-language.md` (eval + ratified decisions), `.claude/tasks/broadn-p11-feedback-widget-teal.md` (queued spec).

**Scope at intake:**
- The P10 design-language EVALUATION was already complete (prior session): RA dossier + UI critique + AUD screenshot pass. Brand decision (CSU green → BROADN teal) was human-ratified but **nothing had shipped to code**.
- Two findings (#1 categorical-color anarchy, #7 four oranges) were CANNOT-TELL from rest-state captures — needed a filtered-state capture.
- The dashboard had grown into `index.html` + `assets/app.js` (211 KB) + `assets/styles.css` + a separate `feedback-widget.{css,js}`.

**Skill invoked:** `dispatch-task` (full pipeline, twice: p10 then p11). Filtered-state capture + the two production fixes were ORC-direct.

---

## 2. Agent Activity Log

### Phase 0 — Filtered-state capture (ORC-direct, pre-sprint)
Live Playwright `browser_evaluate` (Chart.js instance + `getComputedStyle` introspection) settled findings #1 and #7 from CANNOT-TELL → CONFIRMED (three divergent sample-type encodings; three distinct orange text colors + a 4th on canvas). Evidence: `broadn-p10-filtered-state-confirm-20260625.md`. **Method note:** programmatic introspection proved more dispositive than donut-wedge screenshots.

### Phase 1 — p10 design implementation (`broadn-p10-design-implementation`)

| Seq | Event | Agent | Notes |
|-----|-------|-------|-------|
| 11 | SPAWN→COMPLETE | PM#0 | 3-task decomposition (UI-001 DESIGN.md v2 → UI-002 FE → AUD-001) |
| 12 | SPAWN→COMPLETE | CR#1 | **CRITIQUE_BLOCK** — unsatisfiable `#166534==0` SC (sampler-instrument map held #166534) + 2 warnings |
| 13 | SPAWN→COMPLETE | PM#0 (amend) | revised plan: residual #166534 sites brought in scope; legend under-enumeration fixed; bright-teal binding added |
| 14 | SPAWN→COMPLETE | CR#2 (reaudit) | **CRITIQUE_PASS** — all 3 items verified against live source |
| 15 | SPAWN→COMPLETE | UI#1 | DESIGN.md v2.0.0 (teal Constitution, Okabe-Ito palette, filter-accent, pipeline palette, instrument anchor #4d7c0f, migration table) |
| 16 | SPAWN→COMPLETE | FE#1 | implemented across the 3 code files |
| 17 | SPAWN→AUDIT_PASS | AUD#1 | SA/QA/SX PASS; findings #1/#7 resolved; R1 bright-teal binding holds |
| 21,22 | COMMIT | ORC#0 | `0cba237` (DESIGN.md), `c14d67b` (dashboard) |
| 23 | SPAWN→COMPLETE | AR#1 | archived |

**Feedback loops:** 1 (Critic BLOCK → PM amend → Critic PASS). **Root cause of the BLOCK:** PM scoped a global `grep '#166534'==0` SC while declaring the sampler-instrument map out of scope — but that map held `#166534`. Caught cleanly by the Critic; this is the gate working as designed.

### Phase 2 — p11 feedback-widget rebrand (`broadn-p11-feedback-widget-teal` / `broadn-p11-001`)

| Seq | Event | Agent | Notes |
|-----|-------|-------|-------|
| 27 | SPAWN→COMPLETE | PM#0 | 1-task plan; **discovered P10 removed `--color-green-*` vars → widget FAB rendering transparent** |
| 29 | SPAWN→COMPLETE | CR#1 | CRITIQUE_PASS (SC1 satisfiability + no-nonexistent-var verified) |
| 31 | SPAWN→COMPLETE | FE#1 | token swap; **self-committed `0ef1cc8` before the audit gate (process deviation)** |
| 33 | SPAWN→AUDIT_PASS | AUD#1 | SA/QA/SX PASS on committed state; confirmed transparent-FAB regression fixed |
| 35,36 | COMMIT | ORC#0 | `bbe04ab` (logo fix), `fd46e53` (p11, amended from 0ef1cc8 to add trailers) |
| 37 | SPAWN→COMPLETE | AR#1 | archived |

**Feedback loops:** 0 audit failures. **Deviation:** FE committed before audit (see §3/§6).

### Phase 3 — Console 404 cleanup (ORC-direct, "p12")
Added favicon `<link>` → BROADN logo; committed empty-but-schema-valid `data/layout-overrides.json`. Playwright-verified 0 console errors. Commit `6b580ef`.

---

## 3. Post-Delivery: Runtime Bugs (if any)

### Bug 1 — Logo 404 on GitHub Pages (broken placeholder images)
**Reporter:** Human. **Detected:** visual check of the live Pages site after p10 push.
**Error:** `assets/broadn-logo.webp` → 404 on Pages; `<img>` tags rendered as broken placeholders.
**Root cause:** the asset was **untracked**. P10's UI-002 durability commit (`c14d67b`) staged only `index.html`/`app.js`/`styles.css` — the logo binary the FE wired `<img src>` against was never `git add`ed, so it never reached the remote. It rendered locally (file on disk) where AUD's screenshot pass saw it, masking the gap.
**Fix applied:** committed `assets/broadn-logo.webp` (`bbe04ab`); audited all local asset refs in `index.html` — all 7 now tracked.
**Why agents did not catch this:** commit-packet's Step 4a import-closure guard checks **JS `import` statements** for untracked siblings, but not **HTML `<img src>` / `<link href>`** or **CSS `url()`** asset references. The QA screenshot ran against the local server where the file exists, so the missing-on-remote state was invisible. → §6 Gap 1.

### Bug 2 — Feedback widget FAB rendering transparent (P10 regression)
**Reporter:** PM#0 during p11 decomposition (pre-implementation). **Detected:** reading the live code while planning.
**Error:** `#fb-floating-btn { background-color: var(--color-green-800) }` resolved to **undefined** → transparent FAB.
**Root cause:** P10 rewrote `styles.css :root`, replacing the legacy `--color-green-800/700/900/100` custom properties with `--color-teal-deep`/`--color-accent`. The feedback widget (out of P10's three-file scope) consumed `var(--color-green-800)` in 6 places — those refs broke silently when the vars were removed. The P10 auditor's "green pill" sighting was on the **stale browser cache** it explicitly flagged, not the fresh render.
**Fix applied:** p11 repointed the 6 refs to `var(--color-teal-deep)` — rebranding and repairing in one move.
**Why agents did not catch this:** removing a CSS custom property is a cross-file contract change, but the sprint scope (and therefore the auditor's scope) was the three files being edited. No step greps the *rest of the repo* for consumers of a removed/renamed token. → §6 Gap 2.

---

## 4. QA Gap Analysis

**Current QA protocol:** code-auditor runs SA (greps/standards) → QA (Playwright screenshot of live local render) → SX (A11Y/security). Read-only.

**What this caught:**
- p10: the full teal migration, DRY collapse of 3 sample-type arrays → one palette, findings #1/#7 resolution, the R1 bright-teal WCAG binding — all verified by independent greps + screenshots.
- p11: all 11 SCs + the transparent-FAB regression *confirmed fixed* on the render.

**What this missed:**
- The untracked logo asset — because QA renders against the local filesystem, where the file exists. Local-render QA structurally cannot detect "committed code references an asset that isn't committed."
- The original transparent-FAB regression (introduced by p10, caught only by p11's PM) — because it was outside p10's edit scope and the auditor's first load was cached.

**Recommendations:**
- For static sites destined for Pages/CDN, add a **tracked-asset closure check** to the commit/audit path (grep `<img src>`/`<link href>`/`url(...)` for local paths, assert each is `git ls-files`-tracked).
- Make **hard-reload / cache-bust** a standing auditor protocol for static dashboards (the stale-cache hazard bit *both* p10 and p11 audits).
- When a sprint removes/renames a CSS custom property, run a **repo-wide consumer sweep** for `var(--removed-name)` before close.

---

## 5. Agent Performance Summary

| Agent | Tasks | First-pass rate | Notes |
|-------|-------|----------------|-------|
| PM#0 | 2 (+1 amend) | 50% first-pass / 100% after amend | p10 plan BLOCKed once (unsatisfiable SC); p11 plan clean AND caught the P10 var regression — high-value |
| CR#1/CR#2 | 2 sprints | 100% | BLOCKed p10's bad SC, passed both revised plans; every mechanical claim verified against live source |
| UI#1 | 1 | 100% | DESIGN.md v2 with a grep-derived complete migration table |
| FE#1 | 2 | 100% on output / **process miss** | both implementations passed audit; p11 instance self-committed before the audit gate |
| AUD#1 | 2 | 100% | independent greps + screenshots; correctly flagged the FE pre-commit and its own stale-cache first load |
| AR#1 | 2 | 100% | both sprints archived |

**Most impactful single agent action:** PM#0 (p11) reading the live code at decomposition time and discovering that P10 had silently broken the widget's FAB via the var rename — turning a cosmetic rebrand into a regression fix, before a line was implemented.

**Recurring failure pattern:** **scope-boundary blindness to cross-file contracts.** Both post-delivery bugs share one shape — a P10 change had an effect *outside* the sprint's declared file scope (an untracked referenced asset; a removed CSS var with external consumers), and nothing in the pipeline looks past the edited-file set.

---

## 6. Protocol Gaps Identified

> Code-not-prompt check applied to each row below.

| Gap | Impact | Suggested fix |
|-----|--------|---------------|
| commit-packet's import-closure guard checks JS `import`s only — not HTML `<img src>`/`<link href>` or CSS `url()` asset refs | Untracked logo shipped, 404'd on Pages (Bug 1) | Extend the Step 4a closure check to parse `<img src>`/`<link href>`/`url(...)` local paths in staged HTML/CSS and HALT if any referenced local asset is untracked. Implement as a **deterministic script** in commit-packet — route to HR. |
| No repo-wide consumer sweep when a sprint removes/renames a shared token (CSS custom property, JS const) | P10's `--color-green-*` removal broke the out-of-scope widget (Bug 2) | Add a preflight: when a diff deletes/renames a `--color-*` definition (or exported const), `grep -r 'var(--name)'` the whole repo; any consumer outside the edited set is a blocking finding. Implement as a **script/checklist gate** — route to HR. |
| Auditor's first live-render load is served from stale browser cache | Masked the transparent-FAB regression in p10; recurred in p11 (auditor self-flagged) | Make cache-bust (`?nocache=`/hard-reload) a standing step in code-auditor's QA protocol for static dashboards. Prompt edit — route to HR. |
| frontend agent self-committed (`0ef1cc8`) before the audit gate | Broke the audit-before-commit invariant; ORC had to audit-then-amend to reconcile trailers | frontend.md should state explicitly: FE never runs `git commit`; the durability commit is commit-packet's job *after* audit PASS. Prompt edit — route to HR. |
| `docs/project-conventions.md` was stale (claimed "self-contained index.html"; predated the `assets/` split) | PM could have inherited a wrong file-layout model; ORC corrected inline | convention-detect should re-run (not reuse) when the >24h staleness rule trips AND the design-system/file layout changed; or the PM brief should flag known-stale conventions. → §8e drift. |

---

## 7. Final Deliverable State

**App/Service:** `broadn-web-view` static dashboard (GitHub Pages).
**Build:** N/A (no build system). **Runtime:** confirmed working on live render; console 0 errors (1 benign Tailwind-CDN-in-production warning, pre-existing/by-design).

**Features delivered:**
- DESIGN.md v2.0.0 — BROADN teal Constitution overriding v1's CSU-green anchor.
- Teal rebrand across dashboard + charts; single Okabe-Ito `SAMPLE_TYPE_COLORS` palette (DRY); one `--color-filter-accent`; Inter chart default; pipeline-contrast fix; rounded hero chips; logo wired + tracked.
- Feedback widget fully teal (+ transparent-FAB regression fixed).
- Favicon (branded) + empty overrides baseline → clean console.

**Key contracts:**
- `SAMPLE_TYPE_COLORS` (app.js:30) keyed by category NAME is the single source for sample-type color; `PG_TYPE_COLOR`/`PG_TYPE_FILL`/static legend all derive from it.
- Brand teal (`#0c5454`/`#0c9cb4`) must NEVER enter the data palette (Brand ≠ Data).
- `data/layout-overrides.json` is optional; `{version, overrides:{}}` is the no-op baseline (consumed at app.js:2037).
- Commits live on `main` (pushed): `0cba237`, `c14d67b`, `bbe04ab`, `fd46e53`, `6b580ef`.

---

## 7b. Progression Ledger Entry (AA-§7)

**sprint_id:** `broadn-teal-rebrand`

**xp_gained:**
- surface: Skills | delta: commit-packet asset-closure gap surfaced (HTML/CSS referenced-asset closure)
- surface: Agents | delta: code-auditor cache-bust + frontend no-self-commit gaps surfaced
- surface: CLAUDE.md | delta: reaffirmed Claude-commits/human-pushes worked end-to-end across 5 commits

**levels_advanced:**
- Cross-file contract awareness: identified scope-boundary blindness as a recurring pattern across two bugs

**new_capabilities:**
- None this sprint (gaps identified, fixes routed to HR — not yet implemented).

```jsonl
{"sprint_id":"broadn-teal-rebrand","xp_gained":[{"surface":"Skills","delta":"commit-packet HTML/CSS asset-closure gap surfaced"},{"surface":"Agents","delta":"code-auditor cache-bust + frontend no-self-commit gaps"},{"surface":"CLAUDE.md","delta":"Claude-commits/human-pushes verified across 5 commits"}],"levels_advanced":["Cross-file contract awareness: scope-boundary blindness named as recurring pattern"],"new_capabilities":["None this sprint."]}
```

---

## 8. Skill-Use Analysis

### 8a. Skill Invocation Log

| Skill | Invocations | Outcome | Owner | Last reviewed | Notes |
|-------|-------------|---------|-------|---------------|-------|
| resume-project | 1 | VALUABLE | ORC | NEVER | restored the in-flight P10 state cleanly |
| dispatch-task | 2 | VALUABLE | ORC | NEVER | drove both sprints; constituent gates all fired |
| requirements-validate | 2 | VALUABLE | ORC | NEVER | COVERED on both; Mode A inline appropriate for small sprints |
| commit-packet | 2 | PARTIAL_VALUE | ORC | NEVER | worked, but its asset-closure guard missed the untracked logo (§6 Gap 1) |
| convention-detect | 0 (reused stale) | LOW_VALUE | ORC | NEVER | on-disk conventions were stale; reused not re-run (§8e) |

### 8b. Obsolescence Candidates

None — no skill hit 2+ consecutive non-value sprints.

### 8c. Content-Quality Candidates

| Skill | Deviation observed | Suspected cause | Recommended action |
|-------|--------------------|----------------|--------------------|
| commit-packet | Step 4a closure check covers JS imports but not HTML/CSS asset refs; missed untracked logo | OVER_SPECIFIED (closure defined narrowly to JS) | CLARIFY/extend Step 4a to HTML `<img src>`/`<link href>` + CSS `url()` |

### 8d. New Skill Candidates

| Pattern observed | Frequency | Effort | Suggested skill name |
|-----------------|-----------|--------|---------------------|
| Repo-wide consumer sweep when a shared token/const is removed or renamed | 1 (would have caught Bug 2) | LOW | `token-rename-consumer-sweep` |
| Tracked-asset closure check before commit/push of a static site | 1 (would have caught Bug 1) | LOW | (fold into commit-packet, not a new skill) |

### 8e. Skill Drift Candidates

| Skill | Drift observed | Suggested fix |
|-------|---------------|---------------|
| convention-detect | `docs/project-conventions.md` claimed "self-contained index.html" — predates the `assets/` split; >24h reuse rule served stale data | Re-detect (not reuse) when file layout/design-system changed since last write; stamp the block with the layout it assumes |

### Hand-off to hone
Post-mortem Section 8 complete. 5 skills logged. 0 obsolescence candidates, 1 content-quality candidate (commit-packet), 1 new-skill candidate (token-rename-consumer-sweep), 1 drift candidate (convention-detect). Run the `hone` skill to act on these findings.

---

## 9. Rule / Ref / CLAUDE.md Delta Proposals

| Target file | Proposed change | Priority | Rationale |
|-------------|----------------|----------|-----------|
| `.claude/rules/standards.md` (Git Workflow / commit discipline) | Add: "Before committing a static site, verify every local asset referenced by staged HTML (`<img src>`, `<link href>`) and CSS (`url()`) is git-tracked." | HIGH | A committed-but-untracked-asset shipped a broken-image 404 to production (Bug 1) |

---

## 10. Eval Gap Proposals

| Agent / Skill | Gap description | Suggested eval | Priority |
|---------------|----------------|----------------|----------|
| commit-packet | No eval exercises the asset-closure guard against an HTML `<img src>` pointing at an untracked file | Add a scenario: staged index.html references an untracked `.webp`; assert commit-packet HALTs | MEDIUM |

---

## 11. Connectivity Findings

**Analyzer run this sprint:** No — manual observations only.

Manual: no dead refs or orphan nodes observed in the agent/skill graph during this work. The only "broken link" was at the application layer (untracked logo asset), not the control-plane graph.
