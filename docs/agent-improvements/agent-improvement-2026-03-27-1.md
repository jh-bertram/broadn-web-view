# Agent Improvement Session: agent-improvement-2026-03-27-1
**Date:** 2026-03-27
**Post-mortems reviewed:** `docs/post-mortems/broadn-p4.md`
**Gaps addressed:** 3
**Files changed:** 3
**Research tasks spawned:** 0

---

## Gaps Addressed

### 1. Auditor false positive in sequential single-file sprints
**Source:** `docs/post-mortems/broadn-p4.md` — Section 6
**Root cause:** When multiple tasks sequentially modify the same file, the auditor's git diff shows all prior task changes alongside the current task's changes. Without knowing which changes were pre-approved, the auditor flags prior-task work as `must_not_contain` violations.
**File changed:** `.claude/agents/auditor.md`
**Change:** Added sequential single-file sprint scope rule: auditor must restrict must_not_contain checks to current task's named artifacts when a `<prior_approved_tasks>` list is present in the brief, or when the diff is unexpectedly large.
**Version:** 1.0.5 → 1.0.6

---

### 2. Background archivist agents denied Write tool
**Source:** `docs/post-mortems/broadn-p4.md` — Section 6
**Root cause:** Background sub-agents may be denied the Write tool depending on the user's permission mode. ARC#1 and ARC#2 were denied, leaving completions unlogged until ORC intervened manually.
**File changed:** `.claude/agents/orchestrator.md`
**Change:** Added foreground-only dispatch rule for archivist: background archivists may be denied Write; ORC must write archive entry directly in main session if denied.
**Version:** 1.1.2 → 1.1.3

---

### 3. PM state machine modification lacks call-graph pre-flight
**Source:** `docs/post-mortems/broadn-p4.md` — Section 6
**Root cause:** PM rev0 described a sidebar state machine change at feature level without tracing all call sites that index into the button array. Two sites (`getCategoryButtons()` re-index, `renderView()` two-branch hide) were missing and required a full Critic BLOCK and plan revision to surface.
**File changed:** `.claude/agents/pm.md`
**Change:** Added state machine call-graph rule requiring PM to enumerate every function that reads/writes a modified indexed structure and list all call sites as numbered scope items in the task description.
**Version:** 1.1.1 → 1.1.2

---

## Gaps Not Addressed

None. All three gaps had clear mechanical fixes.

---

## Research Conducted

None required. All fixes were directly derivable from post-mortem observations.

---

## Next Review Trigger

Improvements are due again after: broadn-p5 (next sprint).
Unresolved gaps to watch: None from this session. Watch for archivist Write-denial pattern recurring — if it does, the root fix is a permission setting change rather than an ORC procedure patch.
