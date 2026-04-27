# Post-Mortem: Pages Build Fix + Feedback Widget Deploy (Main-Session Maintenance)
**Date:** 2026-04-27
**Project:** `/home/jhber/projects/broadn-web-view/`
**Duration:** ~45 min, single main-session thread
**Final State:** Three commits landed and pushed to `sprint/broadn-p1-2026-03-22` (`cb5832d` wiring, `c00f173` docs, `9ab7e12` Pages fix). PR #5 was merged to `main` mid-session, surfacing a 24-day-old Pages build defect; the fix commit awaits merge to `main`. Feedback widget will go live on the next merge.

> **Note on scope.** This is not a standard sprint post-mortem. No PM brief, no agent dispatch, no audit cycles, no event-log entries — `grep -l 2026-04-27 docs/events/agent-events-*.jsonl` returned empty, confirming Mode B per the selection gate.

---

## 1. Original Request

**Human (2026-04-27):** "how is our feedback feature?"

Follow-ups, in order:
- "walk me through the steps to get it deployed!"
- "ok i think i've got it! can we review and commit and push?"
- "do both + push!"
- "ok are we all up to date on github? i'm not sure about if all the changes are visible looking at the github now"
- "ok great. let's do a post-mortem. are we documenting clearly that 'git push' is in the domain of human only right now for safety?"

**Brief file:** none — open-ended status check that expanded into a deploy walkthrough, then into incident response when GitHub Pages CI surfaced a failure on the merge to main.

**Scope at intake vs. scope at close:** Intake was a one-shot "how's it going" status check. Scope expanded three times: (a) deploy walkthrough for the Apps Script setup, (b) commit + push of the deployment wiring, (c) incident response for a failing Pages build. Each expansion was human-prompted and bounded.

**Skill invoked:** `post-mortem` (this run). No other skills triggered. `commit-packet` was not invoked — main session committed directly. `audit-pipeline` was not invoked — the wiring change was a 2-line value substitution from human-acquired credentials, arguably not in audit scope.

---

## 2. Activity Log

| Turn | Action | Result | Commit |
|------|--------|--------|--------|
| 1 | Status check on p8 feedback widget | Confirmed widget shipped in `c336c7d` but `BROADN_FEEDBACK_URL=""` — graceful "not configured" state | — |
| 2 | Walked human through 7-step Apps Script setup from `apps-script/SETUP.md` | Human deployed Web App, obtained `/exec` URL + Sheet ID | — |
| 3 | Reviewed working tree (3 modified, 2 untracked) and proposed 2-commit split + `Zone.Identifier` gitignore | Approved | — |
| 4 | Committed deployment wiring (Sheet ID + endpoint URL) | `Code.gs` line 34, `feedback-config.js` line 4 | `cb5832d` |
| 5 | Committed post-mortem doc + `.gitignore` update | p8 post-mortem tracked, Windows zone-tag artifacts excluded | `c00f173` |
| 6 | Attempted `git push` | Denied by `.claude/settings.json` deny rule | — |
| 7 | Asked human to push manually via `! git push` | Pushed; PR #5 was merged to `main` (`1f0c3e9`) shortly after | — |
| 8 | Human reports GitHub showing 1 failing CI check on the merge | Investigated via `gh run list` and `gh run view --log-failed` | — |
| 9 | Diagnosed root cause: tracked git symlink `.claude/skills` → absolute local-only path, dangling on the runner | Confirmed via `git ls-tree -r HEAD \| grep "^120000"` | — |
| 10 | Untracked symlink, added to `.gitignore`, committed | Local symlink intact; index entry removed | `9ab7e12` |
| 11 | Attempted combined `git push` (with commit) | Denied again | — |
| 12 | Split commit and push; human pushed manually | Sprint branch updated; `origin/main` still red awaiting merge of `9ab7e12` | — |
| 13 | Human invoked `/post-mortem` | This document | — |

**Feedback loops:** 0 — no remediation cycles, no rework. Two `git push` denials by `settings.json` (expected behavior).

**Permission / tooling friction:** Two `git push` attempts denied by `.claude/settings.json:24`. Both denials worked as designed — pushes are human-only — but each cost a turn (deny → explain → ask human to push). No preflight detected the intent and routed it to a `! git push` invitation. This is also the gap the human directly raised in §5.

---

## 3. Historical Root Causes

### Condition A: Tracked git symlink at `.claude/skills` pointing to absolute local-only path

- **What was broken:** `.claude/skills` was committed as a git symlink (mode `120000`) with target `/home/jhber/projects/gander/.claude/skills` — an absolute path on the developer's laptop. On any non-laptop checkout (CI runners, fresh clones, collaborators) the symlink dangles.
- **When it broke:** 2026-04-23, commit `b1ab566 chore(skills): symlink to user-level skills, inherit from gander`. Intent was correct (local skill resolution via the user-level inheritance chain); implementation should have created the symlink locally and gitignored the path, not committed it.
- **Why it broke:** the `.claude/` inheritance-cleanup session focused on de-duplication. The committer didn't consider non-local consumers of the working tree (Pages CI, hypothetical collaborators).
- **Why it stayed broken:** Pages builds only on pushes to `main`. Between 2026-04-03 (last successful build) and 2026-04-27 (today's failure) there were **zero pushes to `main`** — a 24-day gap during which the defect was invisible. No pre-commit guard, no `.gitattributes`, no sprint-branch CI would have caught it.
- **Blast radius during the broken window:** silent. Live dashboard at jh-bertram.github.io/broadn-web-view/ remained on the Apr 3 build the entire time. Visitors saw the pre-Studio-Clarity, pre-p7, pre-p8 state. Notably, `docs/post-mortems/broadn-p8-feedback-widget.md` describes the widget as "shipped to GitHub Pages preview" — that claim is technically incorrect for the Apr 23 → Apr 27 window.

### Condition B: Push-deny policy enforced but not documented

- **What was broken:** `.claude/settings.json:24` denies `Bash(git push*)` (alongside `rm*`, `git reset --hard*`, `git clean*`). The intent — push is a human-only action for safety — is invisible in any prose document.
- **When it broke:** never broken per se; the gap has existed since the deny rule was added. Today's session is the first record of the human surfacing it.
- **Why it stayed undocumented:** `settings.json` is the enforcement layer; `CLAUDE.md` and `standards.md` are the documentation layer. The separation is normally healthy, but for safety policies the rationale should appear in both — enforcement without documentation is invisible to anyone reading prose to understand the team's git workflow.
- **Blast radius:** small but recurring. Every time a Claude session attempts to push, it gets denied, explains the failure to the human, and the human pushes manually — costing one turn per push. Today this happened twice.

---

## 4. Post-Delivery Runtime Impact (reconstructed)

- **Plausible — unverified:** any external researcher who visited jh-bertram.github.io/broadn-web-view/ between 2026-04-03 and the next successful Pages build saw the pre-Studio-Clarity dashboard, missing four sprints of UI improvements and the entire feedback widget. No analytics in place to quantify; no inbound feedback to confirm zero user impact.
- **Plausible — unverified:** the p8 feedback-widget QA gate validated against `file://` and possibly a sprint-branch Pages preview, but did not validate against production `main` Pages. If the symlink had been committed earlier (which it wasn't — `b1ab566` postdates the Apr 3 build), the QA "shipped to Pages preview" claim across other sprints would be similarly suspect. Worth re-checking the post-mortem claims of p7 and Studio Clarity against the actual `main` Pages history.

---

## 5. Protocol Gaps Identified

| # | Gap | Impact | Suggested fix |
|---|-----|--------|---------------|
| 1 | Tracked git symlinks with absolute paths to `/home/jhber/...` are silently checked into the repo. No pre-commit guard catches this. | Pages build broken for 4 days; the p8 post-mortem's "shipped to Pages preview" claim was silently incorrect for the entire window. | Implement as a **pre-commit hook** (route to HR / system-health-monitor): `.claude/hooks/precommit-no-absolute-symlinks.sh` running `git diff --cached --name-only --diff-filter=A \| while read f; do test -L "$f" && readlink "$f" \| grep -q "^/" && { echo "absolute symlink: $f"; exit 1; }; done`. Block commit with a message pointing to `~/.claude/refs/inheritance-model.md`. |
| 2 | Pages CI status is not part of any audit gate or post-merge check. A red Pages build sits silently red until a human eyeballs the GitHub UI. | Build was red since today's merge; only surfaced because the human happened to look at the merge-status panel. | Implement as a **post-merge step in `audit-pipeline`** or a **scheduled hook** (route to HR): after any merge to `main` for a Pages-deployed project, run `gh run list --workflow=pages-build-deployment --limit 1 --json conclusion --jq '.[0].conclusion'` and warn if not `success`. |
| 3 | **Push-deny policy is enforced in `.claude/settings.json` but not documented in `CLAUDE.md` or `standards.md`.** Anyone reading the prose has no idea that pushes are human-only by design. | Recurring per-session friction; the deny-then-explain pattern costs a turn each time. New agents or contributors rediscover the rule by hitting it. | **Prose addition** (route to HR): add a `## Git workflow` paragraph to `~/.claude/rules/standards.md` and a one-line cross-reference in project-level `CLAUDE.md`: *"Claude commits; human pushes. Enforced via `.claude/settings.json` deny rule on `Bash(git push*)`. Rationale: push is a destructive-by-default operation visible to others; require explicit human action."* |
| 4 | The p8 sprint declared "shipped to GitHub Pages preview" without verifying that the Pages build actually succeeded for the relevant commit. The QA verification was local-only. | Audit pass on `c336c7d` masked the fact that production Pages had been on the Apr 3 build the whole time; the audit reported a state that was never true. | **Update `audit-pipeline` SKILL.md** QA step (route to HR): when target project ships to GitHub Pages, the QA step must confirm a green Pages run for the audited commit, not just that the commit pushed cleanly. |
| 5 | When the human asked "are we all up to date on github?" I answered with branch-tip information but did not proactively check `gh run list`. The human discovered the failing build by eyeballing the GitHub UI. | One extra round-trip; could have been preempted. | **Update orchestrator behavior** for questions matching "is X live / deployed / up to date / on GitHub" — proactively run `gh run list --limit 1` against relevant workflows, not just `git log` against the remote. |

---

## 6. Agent Performance Summary

Not applicable — no agents were spawned. The most impactful single main-session action was running `git ls-tree -r HEAD | grep "^120000"` to enumerate tracked symlinks. That single command pinpointed the dangling-symlink root cause in one query, after a longer log-spelunking detour into `gh run view --log-failed` produced no smoking-gun error string (the failure was implicit — exit 1 after artifact upload).

---

## 7. Final Deliverable State

| Subresource / Artifact | Before | After | Canonical source |
|------------------------|--------|-------|------------------|
| `apps-script/Code.gs:34` | `SHEET_ID = 'PASTE_SHEET_ID_HERE'` | `SHEET_ID = '1JSho6yZ30hV4tMXEk4DDc1XWGE53minLcahXO8JrtUw'` | `apps-script/SETUP.md` Step 1 |
| `assets/feedback-config.js:4` | `window.BROADN_FEEDBACK_URL = ""` | `window.BROADN_FEEDBACK_URL = "https://script.google.com/macros/s/AKfyc.../exec"` | `apps-script/SETUP.md` Step 6 |
| `docs/post-mortems/broadn-p8-feedback-widget.md` | untracked | tracked, 226 lines | this session |
| `docs/project_log.md` | last entry: 2026-04-23 p8 archive_entry | + 2026-04-27 broadn-p8-postmortem entry | this session |
| `.gitignore` | no `*:Zone.Identifier`; no `.claude/skills` | both added | this session |
| `.claude/skills` (git index) | tracked symlink mode `120000` → absolute local path | untracked; local symlink unchanged | gitignored |
| `origin/sprint/broadn-p1-2026-03-22` | `01f89c1` | `9ab7e12` | pushed |
| `origin/main` | `1f0c3e9` (Pages: failure) | unchanged | awaiting merge of `9ab7e12` |

**Commits:**
- `cb5832d` — feat(feedback): wire Apps Script deployment URL and Sheet ID
- `c00f173` — docs(post-mortem): add broadn-p8 post-mortem and gitignore Zone.Identifier
- `9ab7e12` — fix(pages): untrack .claude/skills symlink to fix GitHub Pages build

**Non-committed changes:** local `.claude/skills` symlink remains on disk for local skill resolution — intended state.

**Working tree at close:** clean, sprint branch up to date with `origin`. Production Pages will go green on the next merge of `9ab7e12` to `main`.

---

## 8. Skill-Use Analysis

### 8a. Skill Invocation Log

| Skill | Invocations | Outcome | Owner | Last reviewed | Notes |
|-------|-------------|---------|-------|---------------|-------|
| `post-mortem` | 1 | VALUABLE | ORC | NEVER | This document. Selection gate correctly routed to Mode B given absent event log. |
| `audit-pipeline` | 0 | NOT_TRIGGERED | n/a | NEVER | The wiring commit was a 2-line credential substitution, arguably out of scope. But the missing CI-status check (gap #4) is a content gap in this skill's procedure. |
| `commit-packet` | 0 | NOT_TRIGGERED | n/a | NEVER | Correctly skipped — no audit ran, so the precondition (`audit PASS`) was never met. Main session committed directly. |
| `dispatch-task` | 0 | NOT_TRIGGERED | n/a | NEVER | Correctly skipped — no agent work warranted. |

### 8b. Obsolescence Candidates

None — single-session sample, insufficient data for the "2+ consecutive sprints" criterion.

### 8c. Content-Quality Candidates

| Skill | Deviation observed | Suspected cause | Recommended action |
|-------|--------------------|----------------|--------------------|
| `audit-pipeline` | Procedure lists local-test verification but does not include a CI-status check. Today's failure is a textbook case — agent says "audited and passing" but production CI is red. | Procedure under-specified for projects with CI-based deployment | UPDATE_PROCEDURE — add a "if target project has CI, confirm the latest CI run for the audited commit succeeded" line to QA step. |

### 8d. New Skill Candidates

| Pattern observed | Frequency in sprint | Effort to encode as skill | Suggested skill name |
|-----------------|---------------------|--------------------------|---------------------|
| "Push attempt → deny → explain → wait for human → resume" recurs every time Claude wants to push. | 2× in 1 session; ongoing across all sessions | LOW | `request-push` — preemptively detect push intent, format a clear `! git push` invitation, skip the deny round-trip. ~30 lines, mostly prose. |

### 8e. Skill Drift Candidates

| Skill | Drift observed | Suggested fix |
|-------|---------------|---------------|
| `audit-pipeline` | (overlaps with 8c — same finding) | (see 8c) |

### Hand-off to hone

> Post-mortem Section 8 complete. 4 skills logged (1 VALUABLE, 3 NOT_TRIGGERED). 0 obsolescence candidates, 1 content-quality candidate (`audit-pipeline` missing CI-status check), 1 new skill candidate (`request-push`), 1 drift candidate (overlaps with 8c). Run the `hone` skill to act on these findings.

---

## 9. Skill Shortcomings Surfaced This Session

- **`post-mortem` skill, Mode B template:** §6 ("Agent Performance Summary — Not applicable") is wasted real estate when no agents ran. Consider replacing the placeholder with a single-paragraph "Most impactful main-session action" prompt to focus the writer's attention. The current template forces a "not applicable" note that adds noise without insight.
- **`audit-pipeline` skill:** as detailed in §5 #4 and §8c — missing a CI-status verification step for projects with CI-based deployment. This is the highest-leverage fix in this post-mortem; it would have caught a defect that hid for 4 days.
