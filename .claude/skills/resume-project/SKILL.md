---
name: resume-project
description: "Resume an in-progress sprint at the start of a new session. Reads the most recent SESSION-CHECKPOINT and restores Orchestrator context without re-reading every task output. Triggers on 'continue the project', 'pick up where we left off', 'resume', or when the human opens a new session on an active sprint."
---

# Resume Project

## When To Use
At the start of any session where a sprint is already in flight. The human says something like
"continue the project", "pick up where we left off", "get our subagents back", or just opens
the session and mentions the project name.

## Procedure

### Step 1 — Find the most recent checkpoint

```
Glob: .claude/agents/tasks/outputs/SESSION-CHECKPOINT-*.md
```

Sort by filename (ISO-date suffix). Read the **most recent** file.

If no checkpoint exists, fall back to:
1. Read `docs/task-registry.md` for sprint state
2. Read the last 20 lines of the most recent `docs/events/agent-events-YYYY-MM-DD.jsonl`
3. Synthesize state from those two sources

### Step 2 — Parse checkpoint state

Extract:
- **Last event seq** (for event log continuation)
- **Completed + audited tasks** — no action needed
- **Completed but not yet audited tasks** — queue for audit
- **In-progress tasks** — check if output file was actually written; if yes, treat as complete; if no, re-dispatch
- **Remaining work list** — verbatim from checkpoint

### Step 3 — Verify in-progress tasks

For each task listed as IN PROGRESS:
- Glob/Read the expected output file path from the checkpoint
- If the file exists and contains a `<ui_packet>` or `<completion_packet>` — mark COMPLETE, queue for audit
- If the file is absent or partial — re-dispatch the implementing agent with the original brief

### Step 4 — Report to human

Emit a concise status block:

```
## Sprint Resume — [sprint name]

**Last seq:** N
**Audited & done:** [list]
**Needs audit:** [list]
**Re-dispatching:** [list] (if any)

**Next action:** [one sentence — e.g., "Dispatching Wave 6 audit now."]
```

### Step 5 — Continue execution

Proceed directly to the next action identified in Step 4 without waiting for human confirmation
unless re-dispatching agents that were mid-implementation (those warrant a brief confirmation).

## Event Log

Append a RESUME event before taking any action:

```json
{"seq":{N+1},"ts":"{ISO-8601}","ev":"RESUME","task_id":"session-resume","agent_id":"ORC#1","parent_id":"HU","edge_label":"session_start","note":"Resumed from SESSION-CHECKPOINT-{date}.md"}
```

## Checkpoint Update

After resuming, do NOT write a new checkpoint immediately — wait until meaningful progress has
been made (at least one audit cycle completes). Then update or replace the checkpoint file.

## Notes

- Session checkpoints live at: `.claude/agents/tasks/outputs/SESSION-CHECKPOINT-YYYY-MM-DD.md`
- The checkpoint is written by the Orchestrator (or main session) at session end
- If multiple checkpoints exist for the same date, read the last one (they are append-updated)
- This skill does not spawn any agents on its own — it only restores context and queues work
