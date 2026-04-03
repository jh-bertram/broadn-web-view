# Agent Improvement Session: agent-improvement-2026-04-02-2
**Date:** 2026-04-02
**Post-mortems reviewed:** [broadn-studio-clarity.md](../post-mortems/broadn-studio-clarity.md)
**Gaps addressed:** 3
**Files changed:** 3
**Research tasks spawned:** 0

---

## Gaps Addressed

### Auditor cannot run Playwright on vanilla HTML repos
**Source:** `docs/post-mortems/broadn-studio-clarity.md` — Section 6
**Root cause:** Auditor treats absence of `package.json` as a hard blocker for Playwright, skipping all live browser verification on vanilla HTML projects.
**File changed:** `.claude/agents/auditor.md`
**Change:** Added `python3 -m http.server` fallback for Playwright smoke checks on vanilla HTML repos without `package.json`
**Version:** 1.0.7 → 1.1.0

---

### FE has no pre-flight check for inline style / Tailwind class property overlap
**Source:** `docs/post-mortems/broadn-studio-clarity.md` — Section 6
**Root cause:** Inline `style="..."` attributes always override Tailwind utility classes regardless of specificity; no existing FE pre-flight step detects this conflict before submission.
**File changed:** `.claude/agents/frontend.md`
**Change:** Added inline style / Tailwind conflict grep check requiring dynamic-only application of any inline style overlapping a Tailwind utility class
**Version:** 1.2.0 → 1.2.1

---

### No task stub when ORC acts as PM for simple direct-routing sprints
**Source:** `docs/post-mortems/broadn-studio-clarity.md` — Section 6
**Root cause:** When ORC routes a simple task directly without PM decomposition, no `.claude/tasks/{task_id}.md` stub is written; the sprint is unrecoverable from the event log alone.
**File changed:** `.claude/agents/orchestrator.md`
**Change:** Added task stub mandate for direct-routing sprints: ORC acting as PM must write `.claude/tasks/{task_id}.md` before spawning agents
**Version:** 1.1.3 → 1.1.4

---

## Gaps Not Addressed

None — all three Section 6 gaps from the post-mortem were mechanically addressable and have been acted on.

---

## Research Conducted

None required. All three gaps had unambiguous, direct fixes derivable from the post-mortem.

---

## Next Review Trigger

Improvements are due again after: 3 sprints from now (watch for vanilla HTML sprints to verify the python3 server fallback is used in practice).
Unresolved gaps to watch: None from this post-mortem.
