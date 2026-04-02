# Agent Improvement Session: agent-improvement-2026-03-28-2
**Date:** 2026-03-28
**Post-mortems reviewed:** [broadn-p5-p6.md](../post-mortems/broadn-p5-p6.md)
**Gaps addressed:** 6
**Files changed:** 3 (pm.md, critic.md, backend.md)
**Research tasks spawned:** 0

---

## Gaps Addressed

### 1. PM must embed static content verbatim in task packets
**Source:** `docs/post-mortems/broadn-p5-p6.md` — Section 6
**Root cause:** PM's initial t2 packet described the PROJECT_DESCRIPTIONS table as "provided" without embedding it; FE agent had no retrievable source for the 12 entries.
**File changed:** `.claude/agents/pm.md`
**Change:** Added static content embedding rule to Context guarding section: lookup tables, enumeration values, copy strings must be embedded verbatim in the packet or written to a dedicated context file; ORC must reference the task packet file path, not inline the content in the dispatch prompt.
**Version:** 1.1.2 → 1.1.6 (all pm.md changes combined)

---

### 2. prior_approved_tasks required for sequential single-file sprints
**Source:** `docs/post-mortems/broadn-p5-p6.md` — Section 6
**Root cause:** PM produced t2 task packet without a prior_approved_tasks routing note for AUD#2, despite this being a documented p4 post-mortem §6 gap — the Critic had to re-surface it a second time.
**File changed:** `.claude/agents/pm.md`
**Change:** Added required prior_approved_tasks note to `<routing_notes>` block comment: mandatory for any FE task that is not the first to touch a given file in a sprint; lists prior-sprint and prior-wave additions.
**Version:** 1.1.2 → 1.1.6

---

### 3. Stale chart-type comments propagate wrong ctx.parsed accessor
**Source:** `docs/post-mortems/broadn-p5-p6.md` — Section 6
**Root cause:** PM read a stale "doughnut" comment at index.html line 1021 instead of the actual `type: 'bar'` in the constructor at line 1253; the mutation blocks used `ctx.parsed` (object) instead of `ctx.parsed.y` (scalar), which would have rendered `[object Object]` in every tooltip. Three Critic rounds required to surface.
**File changed:** `.claude/agents/critic.md`
**Change:** Added ctx.parsed accessor check to AUDIT_RISK (§4): for any tooltip label callback, verify chart `type:` at the constructor in source; for bar/line use `.y`, for doughnut use bare `ctx.parsed`.
**Version:** 1.0.1 → 1.0.2

---

### 4. Option B closure injection invalid when helper owns new Chart()
**Source:** `docs/post-mortems/broadn-p5-p6.md` — Section 6
**Root cause:** Human chose Option B (closure at call site) for S4 tooltip injection; PM accepted it without checking whether the call site has access to the Chart constructor — it does not, because `renderSamplerTypeChart()` encapsulates `new Chart()`. A full Critic round was required to name Option C (post-construction mutation).
**File changed:** `.claude/agents/pm.md`
**Change:** Added chart tooltip injection rule enumerating valid options (A = signature change, C = post-construction mutation via chartInstances) and explicitly invalidating Option B when a helper owns the constructor.
**Version:** 1.1.2 → 1.1.6

---

### 5. 50-line gate has no named exception for data-generation tasks
**Source:** `docs/post-mortems/broadn-p5-p6.md` — Section 6
**Root cause:** BE#1 correctly stopped at 71 lines and reported the gate violation; ORC accepted with an ad hoc exception. No documented path existed for data-generation-only tasks (Python preprocessors, seed scripts) where JSON validity + key spot-check is the natural verification equivalent.
**File changed:** `.claude/agents/backend.md`
**Change:** Added named exception to Micro-Commit Discipline: data-generation-only tasks may use script execution + output validation as the verification gate, with required commit message documentation; 50-line gate still applies to all application code files.
**Version:** 1.1.2 → 1.1.3

---

### 6. FE dispatch prompt inflation from inlined static content
**Source:** `docs/post-mortems/broadn-p5-p6.md` — Section 6
**Root cause:** ORC included the full PROJECT_DESCRIPTIONS table inline in the FE#2 dispatch prompt, pushing it over the usage policy limit and requiring a re-dispatch with partial work recovery.
**File changed:** `.claude/agents/pm.md`
**Change:** Static content embedding rule (Gap 1 fix) addresses this jointly: PM embeds data in the task packet file; ORC references that file path rather than inlining content in the prompt.
**Version:** 1.1.2 → 1.1.6 (same edit as Gap 1)

---

## Gaps Not Addressed

None. All 6 identified protocol gaps have been addressed with concrete mechanical edits.

---

## Research Conducted

None spawned. All fixes were direct mechanical changes derivable from the post-mortem without external sources.

---

## Next Review Trigger

Improvements are due again after: 3 sprints from now (p7 at the earliest — run after p9 closes).
Unresolved gaps to watch: prior_approved_tasks has now appeared in 3 consecutive post-mortems (p4, p5, p6). The p5 Critic caught it again despite the p4 improvement. The new pm.md routing_notes mandate is the third attempt at enforcement — watch whether it holds in p7.
