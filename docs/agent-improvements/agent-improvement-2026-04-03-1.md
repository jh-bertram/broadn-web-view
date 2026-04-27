# Agent Improvement Session: agent-improvement-2026-04-03-1
**Date:** 2026-04-03
**Post-mortems reviewed:** [broadn-p7-sample-table.md](../post-mortems/broadn-p7-sample-table.md)
**Gaps addressed:** 3
**Files changed:** 3
**Research tasks spawned:** 0

---

## Gaps Addressed

### Gap 1 — Critic does not verify constant values when a plan introduces string literal comparisons
**Source:** `docs/post-mortems/broadn-p7-sample-table.md` — Section 6, Gap #1
**Root cause:** PM specified lowercase string literals for `filterState.slice.category` comparisons without reading `SLICE_CATEGORIES`; Critic accepted the plan without grepping the constant definition.
**File changed:** `.claude/agents/critic.md`
**Change:** Added string-literal constant verification check: grep the constant definition before accepting any `===` comparison in a plan.
**Version:** 1.0.2 → 1.0.3

---

### Gap 2 — Auditor QA trace follows code forward from new code, not backward from user action
**Source:** `docs/post-mortems/broadn-p7-sample-table.md` — Section 6, Gap #2
**Root cause:** AUD#2 verified `refreshTableIfReady()` was wired at all `renderView()` exits (forward trace) but did not trace the tag badge click → `applyFilter()` path, which explicitly does not call `renderView()`.
**File changed:** `.claude/agents/auditor.md`
**Change:** Added event-driven wiring reachability check: trace full call chain from user action to new code, not only forward from new code.
**Version:** 1.1.0 → 1.1.1

---

### Gap 3 — PM must not assert call-chain relationships without reading the caller
**Source:** `docs/post-mortems/broadn-p7-sample-table.md` — Section 6, Gap #3
**Root cause:** PM stated "applyFilter() → renderView() — adding to renderView end is sufficient" without reading `applyFilter()`; `applyFilter()` has an explicit comment at line ~1092 stating it does NOT call `renderView()`.
**File changed:** `.claude/agents/pm.md`
**Change:** Added call-chain verification mandate: read function body before asserting A calls B; flag unverified chains in risk_flags.
**Version:** 1.1.6 → 1.1.7

---

## Gaps Not Addressed

None. All three gaps in Section 6 were acted on.

---

## Research Conducted

None. All three fixes were mechanical changes derivable directly from the post-mortem root-cause analysis. No external documentation or best-practice research was required.

---

## Next Review Trigger

Improvements are due again after the next sprint that ships FE work.
Unresolved gaps: None from this session. Watch for: PM call-chain assumptions under complex event-driven architectures (tag toggles, keyboard handlers, async callbacks) — these are high-recurrence failure zones based on p7 §5.
