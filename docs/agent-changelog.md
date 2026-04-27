# Agent Changelog

## agent-improvement-2026-03-17-1
**Date:** 2026-03-17
**Post-mortems acted on:** broadn-p2-slice-panel.md

| File | Previous version | New version | Change |
|------|-----------------|-------------|--------|
| `.claude/agents/pm.md` | 1.0.0 | 1.1.0 | Added EDA/inspection → statistician routing rule to domain identification step |
| `.claude/agents/pm.md` | 1.0.0 | 1.1.0 | Added `<estimated_new_lines>` mandatory field to FE task_packet format with >100-line split requirement |
| `.claude/agents/orchestrator.md` | 1.0.1 | 1.1.0 | Added `<prior_sprint_gaps>` field to orchestrator_brief template, populated from prior post-mortem Section 6 |
| `.claude/agents/orchestrator.md` | 1.0.1 | 1.1.0 | Added dataset EDA routing row to routing table directing inspection tasks to statistician |
| `.claude/agents/backend.md` | 1.1.0 | 1.1.1 | Added DRY helper extraction pre-flight check requiring extraction of any repeated pattern before issuing completion_packet |

## agent-improvement-2026-03-22-1
**Date:** 2026-03-22
**Post-mortems acted on:** broadn-p1-dashboard-enhancements.md

| File | Previous version | New version | Change |
|------|-----------------|-------------|--------|
| `.claude/agents/frontend.md` | 1.1.2 | 1.2.0 | Added Task Boundary Compliance section prohibiting agent-initiated task consolidation without ORC approval |
| `.claude/agents/frontend.md` | 1.1.2 | 1.2.0 | Added Data-Contract Pre-Flight section requiring grep verification of data field names before writing tooltip callbacks |
| `.claude/agents/frontend.md` | 1.1.2 | 1.2.0 | Added Chart.js Tooltip Positioning Rule requiring getBoundingClientRect() offset for external tooltip callbacks |
| `.claude/agents/pm.md` | 1.1.0 | 1.1.1 | Added visual type qualifier rule requiring PM to describe CSS state changes as fill/border/text, not CSS class names alone |
| `.claude/agents/auditor.md` | 1.0.3 | 1.0.4 | Added Manual Test Trace Enforcement gate: AUDIT_FAIL if packet omits MANUAL TEST TRACE scenarios required by success criteria |
| `.claude/agents/orchestrator.md` | 1.1.0 | 1.1.1 | Added auditor subagent usage-policy block escalation procedure prohibiting ORC self-audit |

## agent-improvement-2026-03-26-1
**Date:** 2026-03-26
**Post-mortems acted on:** broadn-p3-tag-filter.md

| File | Previous version | New version | Change |
|------|-----------------|-------------|--------|
| `.claude/agents/orchestrator.md` | 1.1.1 | 1.1.2 | Added "dispatch or direct?" gate requiring explicit human confirmation before ORC implements directly during iterative Q&A |
| `.claude/agents/orchestrator.md` | 1.1.1 | 1.1.2 | Added ORC#0-direct observability rule requiring SPAWN/COMPLETE events for all direct main-session work |
| `.claude/agents/auditor.md` | 1.0.4 | 1.0.5 | Added data contract key-rename gate: grep FE consumers for old key names before PASS on BE tasks that rename data.json keys |
| `.claude/agents/backend.md` | 1.1.1 | 1.1.2 | Added hardcoded validation constant discipline requiring `# VERIFIED: YYYY-MM-DD` comment on every KPI assertion |
| `.claude/agents/archivist.md` | 1.0.0 | 1.0.1 | Added sprint-close checkpoint update mandate: AR must update SESSION-CHECKPOINT.md when invoked with event_type SPRINT_STATE |

## agent-improvement-2026-03-27-1
**Date:** 2026-03-27
**Post-mortems acted on:** broadn-p4.md

| File | Previous version | New version | Change |
|------|-----------------|-------------|--------|
| `.claude/agents/auditor.md` | 1.0.5 | 1.0.6 | Added sequential single-file sprint scope rule: auditor must restrict must_not_contain checks to the current task's named artifacts when prior tasks have already modified the same file |
| `.claude/agents/orchestrator.md` | 1.1.2 | 1.1.3 | Added foreground-only dispatch rule for archivist: background archivists may be denied Write; ORC must write directly if denied |
| `.claude/agents/pm.md` | 1.1.1 | 1.1.2 | Added state machine call-graph rule requiring PM to enumerate every function that reads/writes a modified indexed structure before writing the task packet |

## agent-improvement-2026-03-28-2
**Date:** 2026-03-28
**Post-mortems acted on:** broadn-p5-p6.md

| File | Previous version | New version | Change |
|------|-----------------|-------------|--------|
| `.claude/agents/pm.md` | 1.1.2 | 1.1.6 | Added static-content embedding rule requiring verbatim inline or dedicated context file — no reference-by-description |
| `.claude/agents/pm.md` | 1.1.2 | 1.1.6 | Added prior_approved_tasks as required routing_notes field for any non-first FE task in a sequential single-file sprint |
| `.claude/agents/pm.md` | 1.1.2 | 1.1.6 | Added chart tooltip injection rule naming Option C (post-construction mutation) and invalidating Option B when helper owns new Chart() |
| `.claude/agents/pm.md` | 1.1.2 | 1.1.6 | Added ctx.parsed accessor rule: PM must include chart type from constructor (not comment) when specifying tooltip callbacks |
| `.claude/agents/critic.md` | 1.0.1 | 1.0.2 | Added ctx.parsed accessor audit check: verify chart type: field at constructor before accepting any tooltip label callback |
| `.claude/agents/backend.md` | 1.1.2 | 1.1.3 | Added named 50-line gate exception for data-generation-only tasks with required commit message documentation |

## agent-improvement-2026-04-02-1
**Date:** 2026-04-02
**Post-mortems acted on:** broadn-p5-p6.md (Section 4 Recommendation 2, not captured in Section 6 gaps)

| File | Previous version | New version | Change |
|------|-----------------|-------------|--------|
| `.claude/agents/auditor.md` | 1.0.6 | 1.0.7 | Added stale chart-type comment SA gate: grep `ctx.parsed` usage against actual constructor `type:` field before PASS on FE tooltip tasks |

## agent-improvement-2026-04-02-2
**Date:** 2026-04-02
**Post-mortems acted on:** broadn-studio-clarity.md

| File | Previous version | New version | Change |
|------|-----------------|-------------|--------|
| `.claude/agents/auditor.md` | 1.0.7 | 1.1.0 | Added `python3 -m http.server` fallback for Playwright smoke checks on vanilla HTML repos without `package.json` |
| `.claude/agents/frontend.md` | 1.2.0 | 1.2.1 | Added inline style / Tailwind conflict grep check requiring dynamic-only application of any inline style overlapping a Tailwind utility class |
| `.claude/agents/orchestrator.md` | 1.1.3 | 1.1.4 | Added task stub mandate for direct-routing sprints: ORC acting as PM must write `.claude/tasks/{task_id}.md` before spawning agents |

## agent-improvement-2026-04-03-1
**Date:** 2026-04-03
**Post-mortems acted on:** broadn-p7-sample-table.md

| File | Previous version | New version | Change |
|------|-----------------|-------------|--------|
| `.claude/agents/critic.md` | 1.0.2 | 1.0.3 | Added string-literal constant verification check: grep the constant definition before accepting any `===` comparison in a plan |
| `.claude/agents/auditor.md` | 1.1.0 | 1.1.1 | Added event-driven wiring reachability check: trace full call chain from user action to new code, not only forward from new code |
| `.claude/agents/pm.md` | 1.1.6 | 1.1.7 | Added call-chain verification mandate: read function body before asserting A calls B; flag unverified chains in risk_flags |

## agent-improvement-2026-04-27-1
**Date:** 2026-04-27
**Post-mortems acted on:** session-2026-04-27-pages-build-fix.md (broadn-p8-feedback-widget.md gaps already addressed in prior canonical edits — verified verbatim post-mortem citations present at orchestrator.md ¶410-415, commit-packet Step 4, auditor.md line 91, frontend.md Focus-Trap Pre-Flight, pm.md line 169)

| File | Previous version | New version | Change |
|------|-----------------|-------------|--------|
| `.claude/agents/orchestrator.md` | 1.7.3 | 1.7.4 | Added Answering Deployment-Status Questions section requiring `gh run list` on "is X live/deployed/up to date" questions before answering |
| `.claude/skills/audit-pipeline/SKILL.md` | 1.2.2 | 1.3.0 | Added Step 2.7 CI-status check requiring green CI run for the audited commit before audit-pipeline advances to PASS |
| `.claude/rules/standards.md` | 1.0.0 | 1.0.1 | Added Git Workflow section documenting Claude-commits/human-pushes policy with rationale tied to settings.json deny rule |
| `projects/broadn-web-view/CLAUDE.md` | n/a | n/a | Added Git Workflow section cross-referencing standards.md and registered new precommit hook in Hooks section |
| `projects/broadn-web-view/.claude/hooks/precommit-no-absolute-symlinks.sh` | n/a | NEW | Pre-commit guard rejecting tracked symlinks with absolute targets; registered as PreToolUse Bash matcher in settings.json |
| `projects/broadn-web-view/.claude/settings.json` | n/a | n/a | Registered precommit-no-absolute-symlinks.sh as a PreToolUse Bash hook |

## hone-2026-04-27-3
**Date:** 2026-04-27
**Post-mortems acted on:** session-2026-04-27-pages-build-fix.md (§8c/§8e/§9 reviewed); broadn-p8-feedback-widget.md (§8c re-verified)

| File | Previous version | New version | Change |
|------|-----------------|-------------|--------|
| (no skill edits) | — | — | No-op session — §8c audit-pipeline absorbed by same-day agent-improvement-2026-04-27-1 (Step 2.7 CI-status gate); §8c commit-packet already absorbed by agent-improvement-2026-04-27-2; §9 post-mortem Mode B complaint verified spurious; §8d request-push escalated to human (skill-creator candidate) |
