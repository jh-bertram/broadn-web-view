---
name: ralph-loop
description: Self-correcting iteration pattern for tasks with concrete pass/fail conditions. Use whenever a task requires multiple attempts, has a verifiable completion condition, or involves fixing errors from previous attempts. Triggers on phrases like "keep trying until it works", "iterate until tests pass", "fix all the errors", or any task with a clear success condition (build passes, tests green, linter clean, output matches spec).
---

# Ralph Wiggum Loop — Self-Correcting Iteration

## When To Use

Any task where there is a concrete, verifiable completion condition: tests pass, linter clean, build succeeds, output matches expected format, audit returns PASS.

This is especially useful when wrapping the audit-pipeline: the ralph-loop drives the implement → audit → remediate cycle automatically rather than requiring manual re-invocation each round.

## The Loop

1. **Attempt:** Execute the task.
2. **Verify:** Run the completion check (test suite, linter, build command, audit, or manual inspection).
3. **If PASS:** Exit the loop. Log success with the archivist.
4. **If FAIL:** Capture the full error output — don't truncate it.
5. **Diagnose:** Identify the root cause, not just the symptom. Ask: "Why did this fail?" not "What is the error message?"
6. **Remediate:** Apply a targeted fix that addresses the root cause. If the same fix has been tried before, it won't work again — approach differently.
7. **Return to step 1.**

## Iteration Discipline

**Maximum 10 iterations.** If not resolved after 10 attempts, stop and escalate to the human with a summary of each attempt and its outcome.

**Fresh reasoning each iteration.** Re-read the error, re-analyze the cause. A fix that failed once will fail again if retried verbatim.

**Distinguish convergence from cycling:**
- *Converging:* Each iteration gets closer — fewer failures, different error, narrower scope
- *Cycling:* The same error recurs after a "fix" that looked right — the root cause is elsewhere

If you're cycling after 3 iterations on the same error, stop and reconsider the approach entirely before continuing.

## Progress Log

Append each iteration to `.claude/agents/tasks/outputs/{task_id}-progress.md` using this template (load from `.claude/skills/ralph-loop/templates/progress-log.md`). Create the file on the first iteration. The `task_id` is provided in your task prompt — use it exactly.

```
## Iteration [N] — [ISO-8601 timestamp]

**Attempted:** [what was changed or run]
**Verification result:** [PASS | FAIL]
**Error output:** [full error — don't summarize it away]
**Root cause analysis:** [why did this happen — be specific]
**Next approach:** [what will be different in iteration N+1]
**Convergence status:** [CONVERGING | CYCLING | RESOLVED]
```

## Completion Promise

The loop exits **only** when the verification command returns a clean result. Partial fixes (tests reduced from 5 failing to 2 failing) are progress toward a pass, not a pass. Don't declare success until all checks pass.

## Escalation Format

If 10 iterations are exhausted without resolution:

```xml
<escalation>
  <task_id>[ID]</task_id>
  <attempts>[10]</attempts>
  <error_summary>[the error that persisted — the actual text]</error_summary>
  <approaches_tried>[list of distinct approaches attempted]</approaches_tried>
  <hypothesis>[best current theory about why it's failing]</hypothesis>
  <recommended_next_step>[what the human might try that's outside the agent's capability]</recommended_next_step>
</escalation>
```
