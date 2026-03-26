# Agent Improvement Session: agent-improvement-2026-03-26-1
**Date:** 2026-03-26
**Post-mortems reviewed:** [docs/post-mortems/broadn-p3-tag-filter.md](../post-mortems/broadn-p3-tag-filter.md)
**Gaps addressed:** 5
**Files changed:** 4
**Research tasks spawned:** 0

---

## Gaps Addressed

### G1 — Orchestrator entered implementation mode during iterative human Q&A
**Source:** `docs/post-mortems/broadn-p3-tag-filter.md` — Section 6
**Root cause:** When the human provided iterative details (column values, option selections, confirming results), the conversational cadence suppressed the dispatch-task trigger; ORC proceeded to implement directly without asking.
**File changed:** `.claude/agents/orchestrator.md`
**Change:** Added "dispatch or direct?" gate requiring explicit human confirmation before ORC implements directly during iterative Q&A
**Version:** 1.1.1 → 1.1.2

---

### G2 — No cross-task data contract gate
**Source:** `docs/post-mortems/broadn-p3-tag-filter.md` — Section 6
**Root cause:** The per-task auditor only checks the current deliverable; no gate exists to verify that a renamed BE key is updated in all FE consumers.
**File changed:** `.claude/agents/auditor.md`
**Change:** Added data contract key-rename gate: grep FE consumers for old key names before PASS on BE tasks that rename data.json keys
**Version:** 1.0.4 → 1.0.5

---

### G3 — Hardcoded KPI validation constants go stale when source data changes
**Source:** `docs/post-mortems/broadn-p3-tag-filter.md` — Section 6
**Root cause:** Validation constant `1475` had no date marker; after the xlsx update increased sequenced count to 2098, the constant silently failed with no signal about when it was last verified.
**File changed:** `.claude/agents/backend.md`
**Change:** Added hardcoded validation constant discipline requiring `# VERIFIED: YYYY-MM-DD` comment on every KPI assertion; auditor flags constants without this marker as SA violations
**Version:** 1.1.1 → 1.1.2

---

### G4 — No event log written for direct main-session work
**Source:** `docs/post-mortems/broadn-p3-tag-filter.md` — Section 6
**Root cause:** When ORC implements directly (not via subagent), no SPAWN/COMPLETE events are written, making the work unobservable via the event log.
**File changed:** `.claude/agents/orchestrator.md`
**Change:** Added ORC#0-direct observability rule requiring SPAWN/COMPLETE events for all direct main-session work
**Version:** 1.1.1 → 1.1.2 (same file as G1)

---

### G5 — SESSION-CHECKPOINT was stale at session start
**Source:** `docs/post-mortems/broadn-p3-tag-filter.md` — Section 6
**Root cause:** Archivist was not updating SESSION-CHECKPOINT.md at sprint close; the human had to notice it was stale and correct it manually.
**File changed:** `.claude/agents/archivist.md`
**Change:** Added sprint-close checkpoint update mandate: AR must update SESSION-CHECKPOINT.md when invoked with event_type SPRINT_STATE
**Version:** 1.0.0 → 1.0.1

---

## Gaps Not Addressed

| Gap | Reason not addressed |
|-----|---------------------|
| None | All 5 protocol gaps from Section 6 were addressed |

---

## Research Conducted

None — all fixes were direct mechanical changes derivable from the post-mortem without external reference needed.

---

## Next Review Trigger

Improvements are due again after: next sprint (p4 or equivalent feature sprint).
Unresolved gaps to watch: Union merge approximation for multi-tag selection is documented as accepted behavior — if users report incorrect chart counts for multi-tag selections, this may warrant a BE fix (exact intersection cross-tab rather than sum approximation).
