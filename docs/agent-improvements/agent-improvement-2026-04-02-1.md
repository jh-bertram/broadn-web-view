# Agent Improvement Session: agent-improvement-2026-04-02-1
**Date:** 2026-04-02
**Post-mortems reviewed:** [broadn-p5-p6.md](../post-mortems/broadn-p5-p6.md) (Section 4 only — all Section 6 gaps were addressed in session agent-improvement-2026-03-28-2)
**Gaps addressed:** 1
**Files changed:** 1
**Research tasks spawned:** 0

---

## Session Context

All six Section 6 protocol gaps from every post-mortem through broadn-p5-p6.md have been addressed by prior improvement sessions. No new post-mortems exist since 2026-03-28. This session acted on one **Section 4 recommendation** from broadn-p5-p6.md that was not escalated to Section 6 in the prior session.

---

## Gaps Addressed

### 1. Auditor has no SA gate for stale chart-type comments in tooltip callbacks
**Source:** `docs/post-mortems/broadn-p5-p6.md` — Section 4, Recommendation 2
**Root cause:** broadn-p5-p6 Section 4 recommended adding an auditor-level check for stale chart-type comments, but the prior improvement session (2026-03-28-2) only updated `critic.md` with the ctx.parsed accessor check. The Auditor had no corresponding SA gate — if the Critic missed the bug, it would reach implementation and pass SA silently, because `ctx.parsed` (the wrong accessor for a bar chart) is syntactically valid JS.
**File changed:** `.claude/agents/auditor.md`
**Change:** Added stale chart-type comment SA gate: grep `ctx.parsed` usage against actual constructor `type:` field before PASS on FE tooltip tasks
**Version:** 1.0.6 → 1.0.7
**Classification:** Chart.js-specific — NOT propagated to sibling projects.

---

## Gaps Not Addressed

| Gap | Reason not addressed |
|-----|---------------------|
| Prior improvement sessions (2026-03-17 through 2026-03-28) never ran Step 8 cross-propagation | Sibling projects (gander, gander-studio-alpha) have independent improvement histories and may have addressed equivalent patterns independently; a full cross-propagation audit requires reading all agent versions across 3 projects — deferred to a dedicated cross-propagation review session |

---

## Research Conducted

None. Fix was a direct mechanical change derivable from the post-mortem without external sources.

---

## Cross-Propagation (Step 8)

The single improvement this session (`auditor.md` stale chart-type comment gate) is **Chart.js-specific** — it references `ctx.parsed`, `type: 'bar'`, `type: 'doughnut'`, and Chart.js tooltip callback semantics. These technologies are not confirmed in `gander/` or `gander-studio-alpha/`, so this change does NOT propagate.

**Observation:** Sibling projects `gander/` (last changelog: 2026-03-16) and `gander-studio-alpha/` (last changelog: 2026-03-30) have independent improvement histories. Cross-propagation of universal improvements from broadn-web-view sessions 2026-03-17 through 2026-03-28 was never executed. Universal improvements from those sessions that may benefit siblings include:
- PM EDA→statistician routing rule
- PM prior_approved_tasks routing note mandate
- PM static content embedding rule
- AUD sequential single-file scope rule
- AUD data contract key-rename gate
- AUD manual test trace enforcement
- ORC archivist foreground-only rule
- ORC dispatch-or-direct gate

Recommend a dedicated cross-propagation review to diff broadn-web-view agents against gander/gander-studio-alpha counterparts and selectively apply universal improvements. This is a separate session — do not mix it with a post-mortem improvement session.

---

## Next Review Trigger

The prior session (2026-03-28-2) scheduled next review at "p7 at the earliest — run after p9 closes." That trigger remains valid.

Unresolved gaps to watch:
- `prior_approved_tasks` has appeared in 3 consecutive post-mortems (p4, p5, p6); watch whether the pm.md mandate holds in p7.
- Cross-propagation backlog for universal improvements to gander and gander-studio-alpha.
