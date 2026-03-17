# Skill: agent-log

**Purpose:** Durable, agent-specific task journal. Three-stage protocol that survives context resets and enables clean resumption after interruption.

---

## Log File Location

Every agent writes to its own subdirectory:
```
docs/agent-logs/{AGENT_CODE}/{task_id}.md
```

The file `docs/agent-logs/{AGENT_CODE}/latest.md` is always overwritten with a copy of the most recent task log. This is the resume entry point — a new instance reads only this file.

Examples:
```
docs/agent-logs/BE/gander-studio-p1-export-be.md   ← full log
docs/agent-logs/BE/latest.md                        ← copy of most recent
docs/agent-logs/FE/gander-studio-p1-edit-fe.md
docs/agent-logs/FE/latest.md
```

---

## Three-Stage Protocol

Every agent MUST write three entries to its log file during a task. Each entry is appended (never overwrites prior stages). Write each stage as soon as its trigger condition is met — do not wait until the end.

---

### Stage 1 — RECEIVED (write immediately on starting any task)

```markdown
## [STAGE 1] RECEIVED
- **From:** {spawning agent ID, e.g. ORC#1}
- **At:** {ISO-8601 timestamp}
- **Task ID:** {task_id}
- **Message received:**
  > {First 800 characters of the task prompt verbatim, then "…[truncated]" if longer}
```

Write Stage 1 BEFORE reading any files or taking any action.

---

### Stage 2 — PLAN (write after planning, before first file write or code change)

Only required if the task involves implementation decisions (code, schema design, architectural choice). Skip for pure read/research tasks.

```markdown
## [STAGE 2] PLAN
- **At:** {ISO-8601 timestamp}
- **Approach:**
  1. {step 1}
  2. {step 2}
  …
- **Files to create/modify:**
  - `{path}` — {one-line reason}
  …
- **Dependencies / assumptions:**
  - {anything the plan depends on}
```

Write Stage 2 AFTER completing your analysis and BEFORE writing the first line of code or making the first file change.

---

### Stage 3 — COMPLETE or INTERRUPTED (write before context ends)

**On success:**
```markdown
## [STAGE 3] COMPLETE
- **At:** {ISO-8601 timestamp}
- **Deliverables:**
  | File | Lines added/changed | Notes |
  |------|---------------------|-------|
  | `{path}` | +{N} / ~{M} | {brief note} |
- **Lint / tests:** {result}
- **Open items:** {any follow-up for next agent}
```

**On interruption (approaching context limit or any unexpected stop):**
```markdown
## [STAGE 3] INTERRUPTED
- **At:** {ISO-8601 timestamp}
- **Completed steps:**
  - [x] {step 1 done}
  - [x] {step 2 done}
- **Remaining steps:**
  - [ ] {step 3 not done}
  - [ ] {step 4 not done}
- **Last file written:** `{path}`
- **Resume instruction:** Start at step {N}. Read `{last file written}` for context. Do not redo completed steps.
```

---

## Incremental Checkpointing (mandatory for long tasks)

After writing EACH file during implementation, append a checkpoint line to the log:

```markdown
### Checkpoint — {HH:MM:SS}
- Wrote `{path}` ({N} lines). Next: {brief description of next step}.
```

This ensures that if the session ends between Stage 2 and Stage 3, the interrupted state is still recoverable.

---

## Resuming an Interrupted Task

When re-dispatched after an interruption, the spawning agent MUST include:

```
## Resume Instructions
Read your most recent log entry before starting:
  docs/agent-logs/{AGENT_CODE}/latest.md

If Stage 3 shows INTERRUPTED:
  - Skip all completed steps listed there
  - Start from the first unchecked item
  - Do not re-read files you already processed unless needed for context
```

---

## Writing the Log (how-to)

Use the Write tool for Stage 1 (new file). Use the Edit tool to append Stage 2, checkpoints, and Stage 3.

After writing any stage, copy the file to `latest.md`:
```bash
cp docs/agent-logs/{AGENT_CODE}/{task_id}.md docs/agent-logs/{AGENT_CODE}/latest.md
```

Or use Write to overwrite `latest.md` with the same content.

---

## Why this exists

Ephemeral agent context means work disappears on session end. This log gives every agent:
1. **Accountability** — what it was asked and when
2. **Auditability** — what it planned before acting
3. **Recoverability** — enough state to resume without re-reading hundreds of lines of prior context

The log is agent-specific (not a shared team log) — each agent reads only its own `latest.md`. The team-level view lives in `docs/events/agent-events-*.jsonl` (SPAWN/COMPLETE events) and `docs/task-registry.md`.
