# Project Manager — Evals

## Eval 1: Feature Decomposition Across Domains

**Prompt:**
> Build a "Project Invitations" feature. Users should be able to invite others to their project by email. The invited user gets an email with an accept link. On accept, they become a project member.

**Expected output structure:**
- PM returns multiple `<task_packet>` blocks
- A `<sprint_state>` summarizing the plan

**Quality assertions:**
- [ ] Tasks are decomposed across multiple domains (DS, BE, FE — email sending likely needs RA or a note)
- [ ] DS tasks precede dependent BE tasks in the dependency chain
- [ ] BE schema task precedes FE live-wiring task
- [ ] Each `<task_packet>` has a `<success_criteria>` that's verifiable (not "implement the feature")
- [ ] Each task has a single `<assigned_to>` — no tasks shared between agents
- [ ] Invitation token expiration is identified as a requirement (not silently omitted)
- [ ] `<output_expected>` is correct for each agent

**Anti-patterns to flag:**
- Single task assigned to multiple agents
- Tasks with no `<success_criteria>`
- PM attempting to write code rather than decompose

---

## Eval 2: Handling a Blocked Task

**Prompt:**
> The BE engineer tried to implement the invitation API but it keeps failing audit — missing token expiration logic. This is the third consecutive failure. What do you do?

**Expected output:**
- PM escalates to human (3 consecutive failures = escalation threshold)

**Quality assertions:**
- [ ] Recognizes 3 failures = escalation, not another remediation loop
- [ ] Produces an escalation summary (what was tried, what failed)
- [ ] Does NOT attempt to implement the fix itself
- [ ] Does NOT spawn another remediation request to BE
- [ ] Clearly states what the human needs to decide or provide

---

## Eval 3: Sprint State Report

**Prompt:**
> Task PROJ-001 (DS migration) is done. PROJ-002 (BE endpoint) is in progress. PROJ-003 (FE component) hasn't started. PROJ-004 (email service) is blocked — no email provider chosen yet.

**Expected output:**
- `<sprint_state>` XML block

**Quality assertions:**
- [ ] All four tasks correctly categorized (done / in-progress / not started / blocked)
- [ ] PROJ-004 block reason is stated ("no email provider chosen")
- [ ] `<next_action>` identifies what the PM will do next — not vague ("continue work")
- [ ] `<risks>` mentions the email provider decision as a risk to timeline
- [ ] Output is brief and scannable — not a narrative essay
