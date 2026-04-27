# Agent Improvement Session: agent-improvement-2026-04-27-1
**Date:** 2026-04-27
**Post-mortems reviewed:**
- `docs/post-mortems/session-2026-04-27-pages-build-fix.md` (acted on §5 G1–G5)
- `docs/post-mortems/broadn-p8-feedback-widget.md` (gaps verified already addressed in canonical specs — see "Gaps Not Addressed" below)

**Gaps addressed:** 5
**Files changed:** 6 (3 canonical user-level; 3 project-local)
**Research tasks spawned:** 0 — all gaps had unambiguous mechanical fixes derivable from the post-mortems.

---

## Gaps Addressed

### G1 — Tracked git symlinks with absolute paths slip into commits silently
**Source:** `docs/post-mortems/session-2026-04-27-pages-build-fix.md` — §5 row 1
**Root cause:** `.claude/skills` was committed in `b1ab566` (2026-04-23) as a tracked symlink with target `/home/jhber/projects/gander/.claude/skills`. The path is local-only; on the GitHub Pages runner the link dangled and broke the artifact-upload step. The defect went unnoticed for 24 days because no Pages build ran in that window.
**Files created:** `projects/broadn-web-view/.claude/hooks/precommit-no-absolute-symlinks.sh`
**Files changed:** `projects/broadn-web-view/.claude/settings.json`, `projects/broadn-web-view/CLAUDE.md`
**Change:** Added a `PreToolUse` `Bash` hook that runs `git diff --cached --raw`, identifies any newly-added symlink (mode `120000`) whose blob target begins with `/`, and exits 2 (blocks the tool call) with a remediation message pointing to the post-mortem.
**Version:** project-local — no version bump (new hook script + settings.json registration + CLAUDE.md cross-reference).
**Scope note:** This is a project-local guard. Promoting it to user-level (so all projects benefit) is a candidate for a future improvement session — flagged in Next Review Trigger.

### G2 / G4 — Pages CI status not part of the audit pipeline; "shipped to Pages preview" claim never verified against production CI
**Source:** `docs/post-mortems/session-2026-04-27-pages-build-fix.md` — §5 rows 2 & 4
**Root cause:** `audit-pipeline` SKILL.md procedure listed local-test verification (Playwright Tier 1/2 + bundle size + npm audit) but had no step that confirmed the latest CI run for the audited commit was green. Static-and-Playwright PASS was treated as sufficient even for projects with public-facing CI deployment, so the broadn-p8 post-mortem's "shipped to Pages preview" claim was structurally unverifiable at audit time.
**File changed:** `~/.claude/skills/audit-pipeline/SKILL.md`
**Change:** Added Step 2.7 — CI-status check. After Standards/QA pass, the auditor must run `gh run list --branch {branch} --limit 1 --json conclusion,workflowName,headSha,status` and refuse to advance to PASS unless `conclusion == success`. Step explicitly handles the "no CI workflow" and "not yet pushed" cases with a conditional-PASS branch and a reference to the orchestrator's deployment-status check (G5).
**Version:** 1.2.2 → 1.3.0 (MINOR — new gate added).

### G3 — Push-deny policy enforced but undocumented
**Source:** `docs/post-mortems/session-2026-04-27-pages-build-fix.md` — §5 row 3
**Root cause:** `.claude/settings.json` denies `Bash(git push*)` (alongside `rm*`, `git reset --hard*`, `git clean*`), but the rule's existence and rationale were absent from any prose document. Anyone reading `standards.md` or `CLAUDE.md` would discover the policy only by hitting the deny rail. Each Claude push attempt cost a turn (deny → explain → wait for human → resume); the human raised the gap directly today.
**Files changed:** `~/.claude/rules/standards.md`, `projects/broadn-web-view/CLAUDE.md`
**Change:** Added a `## Git Workflow (Push & Shared-State Mutators)` section to `standards.md` documenting the Claude-commits / human-pushes policy with rationale, and a one-paragraph cross-reference in the project-local `CLAUDE.md` pointing to the standards section.
**Version:** standards.md 1.0.0 → 1.0.1 (PATCH — new section, no frontmatter convention to update).

### G5 — Orchestrator answers deployment-status questions from branch-tip alone
**Source:** `docs/post-mortems/session-2026-04-27-pages-build-fix.md` — §5 row 5
**Root cause:** When the human asked "are we all up to date on github?", the Orchestrator answered using `git log` against the remote, which confirmed the commit landed on `main`. It did not run `gh run list`, so the failing Pages build wasn't surfaced. The human discovered the failure by eyeballing the GitHub merge-status panel — one extra round-trip that should have been preempted.
**File changed:** `~/.claude/agents/orchestrator.md`
**Change:** Added a new top-level section `## Answering Deployment-Status Questions` listing the trigger phrasings ("is X live?", "are we up to date?", etc.) and the required procedure: `git log` on the deploy branch + `gh run list --limit 1` on the relevant workflow. Closes the loop with the audit-pipeline G2 fix — when audit conditionally PASSes pending push, the orchestrator's deployment-status check completes verification on the next status question.
**Version:** 1.7.3 → 1.7.4 (PATCH — new behavior section, no protocol restructuring).

---

## Gaps Not Addressed

| Gap | Reason not addressed |
|-----|---------------------|
| `broadn-p8-feedback-widget` §6 G1 (heredoc-overwrite as destructive op, ORC + commit-packet) | Already addressed in current canonical specs. `orchestrator.md` ¶410-415 contains the verbatim rule with `broadn-p8-feedback-widget` post-mortem citation; `commit-packet/SKILL.md` Step 4 contains the pre-stage scope check with the same citation. The fix shipped between version bumps and the changelog had not recorded those updates. |
| `broadn-p8-feedback-widget` §6 G2 (focus-trap `offsetParent !== null` filter, auditor + frontend) | Already addressed. `auditor.md` line 91 contains the "Focus-trap visibility-filter gate" with verbatim post-mortem citation; `frontend.md` line 202 contains the `## Focus-Trap Pre-Flight` section with the same citation and a code example. |
| `broadn-p8-feedback-widget` §6 G3 (tabular-output formula-injection + public-endpoint revocation in PM success_criteria) | Already addressed. `pm.md` line 169 contains the "Tabular-output and public-endpoint hardening rule" with verbatim post-mortem citation. |
| Hook promotion to user-level | Deferred. The new `precommit-no-absolute-symlinks.sh` hook is currently project-local. Promoting to `~/.claude/hooks/` so all three Gander projects (gander, gander-studio-alpha, broadn-web-view) benefit is a one-line settings.json move once verified working in this project. Flagged for next session. |

---

## Research Conducted

None. All five addressed gaps had unambiguous mechanical fixes derivable from the post-mortems' "Suggested fix" columns — no third-party APIs to verify, no model behavior to research.

---

## Next Review Trigger

Improvements are due again after the next sprint completes a post-mortem (Mode A or B). Periodic-review cadence remains "if no entry in the last 3 sprints, overdue."

**Unresolved gaps to watch:**
- Hook promotion to user-level (`~/.claude/hooks/precommit-no-absolute-symlinks.sh` + matching `~/.claude/settings.json` PreToolUse entry). Promote after the project-local hook has fired at least once on a real commit attempt to confirm the matcher behavior is correct.
- The next post-mortem after this session should verify: (a) the orchestrator's deployment-status check fires on real "is X live" questions; (b) the audit-pipeline CI-status step fires on real Pages projects; (c) the precommit hook actually blocks an absolute symlink commit (test by attempting `ln -s /tmp/anything .claude/test-link && git add .claude/test-link && git commit` and confirming exit 2).

**Skill-catalog handoff:** Section 8 of `session-2026-04-27-pages-build-fix.md` flagged `audit-pipeline` as a content-quality candidate (now addressed by this session) and proposed a new skill `request-push` (push-intent detection to skip deny round-trips). The new-skill candidate has not been acted on; it should route through the `hone` skill rather than this session.
