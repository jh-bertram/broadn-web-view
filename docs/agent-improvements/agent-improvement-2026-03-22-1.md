# Agent Improvement Session: agent-improvement-2026-03-22-1
**Date:** 2026-03-22
**Post-mortems reviewed:** `docs/post-mortems/broadn-p1-dashboard-enhancements.md`
**Gaps addressed:** 6
**Files changed:** 4
**Research tasks spawned:** 0

---

## Gaps Addressed

### 1. FE agents consolidate Critic-mandated task splits
**Source:** `docs/post-mortems/broadn-p1-dashboard-enhancements.md` — Section 6
**Root cause:** FE agents treated task consolidation as an implementation judgement call; no rule prohibited delivering two task_ids in one packet.
**File changed:** `.claude/agents/frontend.md`
**Change:** Added Task Boundary Compliance section prohibiting agent-initiated task consolidation without ORC approval
**Version:** 1.1.2 → 1.2.0

---

### 2. Tooltip callbacks don't verify data field names before writing
**Source:** `docs/post-mortems/broadn-p1-dashboard-enhancements.md` — Section 3 (Bug 2) and Section 6
**Root cause:** No pre-flight step required agents to confirm field names against the actual data file; wrong field name (`.name` instead of `.project_id`) was only discoverable at browser runtime.
**File changed:** `.claude/agents/frontend.md`
**Change:** Added Data-Contract Pre-Flight section requiring grep verification of data field names before writing any callback that accesses named appData fields
**Version:** 1.1.2 → 1.2.0

---

### 3. Chart.js caretX/caretY not documented as canvas-relative
**Source:** `docs/post-mortems/broadn-p1-dashboard-enhancements.md` — Section 3 (Bug 1) and Section 6
**Root cause:** No guidance in FE spec stated that caretX/caretY are canvas-relative; tooltip appeared 200-300px off in layouts where canvas is not at document origin.
**File changed:** `.claude/agents/frontend.md`
**Change:** Added Chart.js Tooltip Positioning Rule requiring getBoundingClientRect() offset for external tooltip callbacks using caretX/caretY
**Version:** 1.1.2 → 1.2.0

---

### 4. PM visual descriptions not type-qualified
**Source:** `docs/post-mortems/broadn-p1-dashboard-enhancements.md` — Section 3 (Bug 3) and Section 6
**Root cause:** PM specified a CSS class name (`border-l-4 border-orange-500`) without stating the visual type (border accent vs. background fill); human intended full background fill but received border.
**File changed:** `.claude/agents/pm.md`
**Change:** Added visual type qualifier rule requiring PM to describe visual state changes as fill/border/text type, not CSS class names alone
**Version:** 1.1.0 → 1.1.1

---

### 5. Manual test traces required by PM but not enforced by auditor
**Source:** `docs/post-mortems/broadn-p1-dashboard-enhancements.md` — Section 4 and Section 6
**Root cause:** Auditor receipt checklist had no step for verifying MANUAL TEST TRACE items; requirements-validate caught them as MISSING after audit PASS — creating a two-round correction cycle.
**File changed:** `.claude/agents/auditor.md`
**Change:** Added Manual Test Trace Enforcement gate: AUDIT_FAIL if packet omits interaction scenarios required by MANUAL TEST TRACE success criteria
**Version:** 1.0.3 → 1.0.4

---

### 6. Auditor subagent blocked by usage policy silently transferred audit to ORC
**Source:** `docs/post-mortems/broadn-p1-dashboard-enhancements.md` — Section 5 and Section 6
**Root cause:** No procedure existed for handling auditor subagent policy blocks; ORC performed a self-audit, violating the independent-gate principle.
**File changed:** `.claude/agents/orchestrator.md`
**Change:** Added auditor subagent usage-policy block escalation procedure: log AUDIT_BLOCKED, retry once, then surface to human — no self-audit under any circumstance
**Version:** 1.1.0 → 1.1.1

---

## Gaps Not Addressed

| Gap | Reason not addressed |
|-----|---------------------|
| None | All 6 post-mortem protocol gaps addressed in this session |

---

## Research Conducted

None. All 6 changes were direct mechanical derivations from post-mortem failure evidence — no external API or best-practice research required.

---

## Next Review Trigger

Improvements due again after: 3 sprints from now (next sprint is broadn-p2 tooltip-data + replicate-badge functionality).
Unresolved gaps to watch: The manual test trace gap (R-013, R-014) was partially addressed — the auditor now enforces the trace requirement, but the gap-fill agent for this sprint still did not produce the traces. Next sprint should include explicit manual interaction traces in the 005a and 005b task packets to formally close this debt.
