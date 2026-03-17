---
name: audit-pipeline
description: Run the full verification pipeline on completed work — standards check, functional tests, and security scan. Use after any feature implementation by BE, FE, or DS before considering the task done. Also use when the human asks for a review or audit. Triggers on phrases like "audit this", "review the changes", "run the checks", or automatically after any completion_packet, ui_packet, or data_packet is produced.
---

# Audit Pipeline

## When To Use

After any subagent completes an implementation task. No task is done until this pipeline runs and passes.

## Procedure

1. Spawn the auditor agent with:
   - The changed file paths (not the entire codebase — scope it)
   - The task's success criteria from the original `<task_packet>`
   - The agent's output packet (`completion_packet`, `ui_packet`, or `data_packet`)

2. The auditor runs three checks in sequence: **Standards → QA → Security**. Each check stops at the first FAIL. For FE tasks, QA includes a live Playwright browser smoke check (Tier 1 always; Tier 2 if a spec file exists) — the auditor manages dev server lifecycle automatically. The PM does not need to orchestrate this separately.

3. **If all PASS:** Mark the task complete. Spawn the archivist to log the completion with rationale.

4. **If any FAIL:** Return the full auditor report to the implementing agent with a single, specific remediation request. The implementing agent must address the flagged issue — not work around it.

5. After remediation, re-run the full audit. This is non-negotiable — a partial re-check can miss cascading issues introduced during the fix.

6. **If the same issue causes 3 consecutive audit failures:** Escalate to the human with a summary of what was attempted and what failed each time.

## Failure Handling

When returning an audit failure to an implementing agent, format the remediation request clearly:

```xml
<remediation_request>
  <task_id>[ID]</task_id>
  <attempt_number>[1 | 2 | 3]</attempt_number>
  <failing_check>[SA | QA | SX]</failing_check>
  <specific_issue>[exact violation from the audit report — not a paraphrase]</specific_issue>
  <required_fix>[what the agent must change — be precise about file and line if known]</required_fix>
</remediation_request>
```

Passing vague feedback ("fix the security issue") produces vague fixes. Quote the auditor's finding directly.

## Templates

Load the audit report template when spawning the auditor:
- `.claude/skills/audit-pipeline/templates/audit-report-template.md`

## Timing

Run the audit pipeline *before* logging to the archivist. The archivist records verified, complete work — not work-in-progress. The sequence is always: implement → audit → archive.
