# Dispatcher — Evals

## Eval 1: Routing a Successful Completion Packet

**Prompt:**
> BE just returned a completion_packet for task PROJ-002. DS task PROJ-001 is DONE. FE task PROJ-003 is AWAITING assignment (depends on PROJ-002). What's the dispatch?

**Expected output:**
- `<dispatch>` XML block with routing instructions

**Quality assertions:**
- [ ] Routes PROJ-002 completion_packet to the Auditor
- [ ] PROJ-002 state transitions to `AWAITING_AUDIT`
- [ ] PROJ-003 remains in `CREATED` state — not prematurely started
- [ ] `<registry_snapshot>` reflects all three task states accurately
- [ ] Instruction to auditor is specific — not "review this"
- [ ] PROJ-001 correctly shown as DONE

---

## Eval 2: Routing After Audit Failure

**Prompt:**
> Auditor returned FAIL for PROJ-002 (missing Zod schema on line 34 of projects.ts). This is the first failure. Route accordingly.

**Expected output:**
- `<dispatch>` routing PROJ-002 back to BE with remediation

**Quality assertions:**
- [ ] Routes back to the BE agent — not the auditor again
- [ ] `<instruction>` includes the specific violation (missing Zod schema, line 34) — not generic "fix audit failure"
- [ ] State transitions from `AWAITING_AUDIT` to `REMEDIATING`
- [ ] `<attempt_number>` is 1
- [ ] PROJ-003 still blocked on PROJ-002 — not unblocked prematurely
- [ ] Does not include attempt count of 3 — that's only for escalation

---

## Eval 3: Escalation After 3 Failures

**Prompt:**
> PROJ-002 has failed audit 3 consecutive times. The issue is the same each time: the Zod schema is missing on the auth middleware.

**Expected output:**
- Escalation to human — not another remediation loop

**Quality assertions:**
- [ ] Routes to human (escalation), not back to BE for a 4th attempt
- [ ] Escalation summary includes: task ID, failure count (3), the specific recurring issue
- [ ] States what was tried in each of the 3 attempts
- [ ] Suggests what the human might need to clarify or unblock
- [ ] PROJ-003 marked BLOCKED with dependency on PROJ-002 resolution
- [ ] Does NOT attempt to fix the issue itself
