---
name: post-mortem
description: Synthesize a structured post-mortem document for a completed sprint. Use after any sprint delivered via dispatch-task, especially when there were audit failures, remediation cycles, or runtime bugs discovered post-delivery. Gathers all agent-produced artifacts (event log, task specs, agent outputs, audit results, archivist entries) and produces a post-mortem in docs/post-mortems/. The main session performs the synthesis — no new agent is spawned for the analysis itself. Triggers on "write a post-mortem", "retrospective on the last sprint", or "what went wrong in sprint X".
---

# Post-Mortem Skill

## When To Use

After a sprint closes (all tasks DONE, archivist logged completions). Also useful after a runtime bug surfaces post-delivery — use the bug discovery as the trigger to retroactively synthesize.

Do not use mid-sprint. A post-mortem is a retrospective on a closed body of work, not a status update.

## Step 1: Identify the Sprint

Establish the sprint boundary:
- **task_id prefix** — e.g. `poster-p3`, `poster-p0-remediate`
- **date range** — from first SPAWN event to last COMPLETE/ARCHIVE event
- **output document path** — `docs/post-mortems/{sprint-slug}.md`

If covering multiple sprint phases in one post-mortem (e.g. all phases of a project), use the project slug as the filename.

## Step 2: Gather All Artifacts

Read these sources in order. Do not skip any — each covers a different layer of what happened.

### 2a. Event Log (agent activity timeline)

```bash
# Find relevant event log files (may span multiple days)
ls docs/events/agent-events-*.jsonl

# Extract all events for the sprint's task_id prefix
grep -h "{task_id_prefix}" docs/events/agent-events-*.jsonl
```

The event log is the authoritative record of what happened and when. Read it to reconstruct:
- Which agents were spawned (SPAWN events), in what order
- Which completed successfully on first attempt (COMPLETE events immediately after SPAWN)
- Which failed (AUDIT_FAIL events) and how many remediation cycles occurred
- Wall-clock duration of each agent's work (ts delta between SPAWN and COMPLETE)

### 2b. PM Task Spec(s)

Path pattern: `.claude/agents/tasks/{task_id}.md` or `.claude/agents/tasks/{sprint-slug}-pm-brief.md`

Read to establish: original scope, success criteria, agent routing plan. Compare against what actually shipped.

### 2c. Agent Output Files

Path pattern: `.claude/agents/tasks/outputs/{task_id}-{AGENT_CODE}*.md`

Read outputs for each agent that worked the sprint. Note:
- What the agent claimed to deliver (its `<ui_packet>`, `<completion_packet>`, etc.)
- Any flags it raised in `<integration_status>`, `<a11y_verification>`, or `<notes>`
- Whether it noted any pre-existing violations in files it touched

### 2d. Audit Result Files

Path pattern: `.claude/agents/tasks/audit-results/{task_id}*-audit*.md`

Read every audit file — including failed ones. A failed audit contains the most diagnostic information. Note:
- Which check failed (SA | QA | SX)
- The specific violation cited
- Whether the same violation recurred in the next audit attempt (indicates incomplete remediation)

### 2e. Remediation Output Files

Path pattern: `.claude/agents/tasks/outputs/{task_id}-*-remediate*.md`

These are produced by implementing agents after an audit fail. Read to understand what was fixed and what may have been missed.

### 2f. Archivist Entries

Path pattern: `.claude/agents/tasks/outputs/{task_id}-AR*.md`

Read to capture the rationale recorded at task close — what alternatives were considered, what decisions were locked in.

### 2g. Project Log

`docs/project_log.md` — scan for archive_entries tagged with the sprint's task_ids. May contain context that didn't make it into individual output files.

## Step 3: Synthesize

With all artifacts gathered, produce the post-mortem by working through each section below. Do not copy-paste from artifacts — synthesize. The goal is insight, not transcription.

### Synthesis Protocol

**Agent Activity Log:** Reconstruct the timeline from the event log. For each sprint phase, produce a table of SPAWN/COMPLETE/AUDIT_FAIL events with timestamps, agents, and brief notes. Count feedback loops (number of audit-fail → remediate cycles per phase).

**Root cause analysis:** For each audit failure, read the audit result and the remediation output together. Ask: was the failure a misunderstanding of a rule, a scan-completeness problem (agent fixed the obvious instances but missed others), or a missing pre-flight check that RA could have run? Label it.

**First-pass rate per agent:** Count tasks attempted vs. tasks passing audit on first submission. A rate below 75% warrants a protocol gap entry.

**Protocol gaps:** Map each failure to a process or tooling gap. Each gap entry must have a suggested fix — not just "agents should do better" but a specific, actionable change (a new checklist item, a new grep step, a new pre-flight research task, a new gate in the skill).

**Post-delivery bugs:** Anything discovered after agents closed counts here, regardless of severity. These are the most important section — they represent gaps the entire pipeline missed.

## Step 4: Write the Post-Mortem

Write to `docs/post-mortems/{sprint-slug}.md` using this template:

```markdown
# Post-Mortem: {Sprint Name}
**Date:** {YYYY-MM-DD}
**Project:** `{app path}`
**Duration:** {wall-clock from first SPAWN to last COMPLETE}
**Final State:** {one sentence — what shipped and what was its state at close}

---

## 1. Original Request

**Human ({date}):** {verbatim or close paraphrase of the original request}

**Brief file:** `{path to PM task spec}`

**Scope at intake:**
{bullet list of what existed vs. what needed to be built}

**Skill invoked:** {dispatch-task | other}

---

## 2. Agent Activity Log

{One subsection per sprint phase. Each subsection has:}

### {Phase Name} — ({task_id})

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
{rows from event log}

**Feedback loops:** {N} — {brief description of what failed and what fixed it}

**Root cause of failure(s):** {if any — specific, not generic}

**Deviation from PM brief:** {any scope changes — expansions or cuts — and whether they were correct calls}

---

## 3. Post-Delivery: Runtime Bugs (if any)

{One subsection per bug discovered after agents closed}

**Reporter:** {Human | automated monitor}
**Error:** `{error message or symptom}`
**Detected:** {when and how}

**Root cause:** {technical explanation}

**Fix applied:** {what changed, which file}

**Why agents did not catch this:** {specific gap in the pipeline — not "QA missed it" but the exact mechanism}

---

## 4. QA Gap Analysis

**Current QA protocol:** {brief description of what the auditor does}

**What this caught:**
{bullet list — be specific about which violations were detected and by which check}

**What this missed:**
{bullet list — each item paired with the reason it wasn't caught}

**Recommendations:**
{bullet list — actionable changes to the pipeline or agent specs}

---

## 5. Agent Performance Summary

| Agent | Tasks | First-pass rate | Notes |
|-------|-------|----------------|-------|
{one row per agent that worked the sprint}

**Most impactful single agent action:** {specific — which agent, which finding, why it mattered}

**Recurring failure pattern:** {if any — describe the pattern, not just the instances}

---

## 6. Protocol Gaps Identified

| Gap | Impact | Suggested fix |
|-----|--------|---------------|
{one row per gap — gaps must have specific suggested fixes, not platitudes}

---

## 7. Final Deliverable State

**App/Service:** `{path}`
**Build:** {status — errors, warnings}
**Runtime:** {confirmed working | known issues}

**Features delivered:**
{bullet list}

**Key contracts:** (external APIs, data shapes, URL formats the next engineer needs to know)
{bullet list}
```

## Step 5: Hand Off to Archivist

After writing the post-mortem file, spawn the Archivist to log it:

```
Task: Log post-mortem completion
event_type: POST_MORTEM
task_id: {sprint-slug}-postmortem
rationale: Post-mortem written at docs/post-mortems/{sprint-slug}.md covering {N} sprint phases. Key findings: {2-3 sentence summary of the most important protocol gaps identified}.
retention_keys: docs/post-mortems/{sprint-slug}.md, protocol gaps identified (list them)
```

The archivist appends an `<archive_entry>` to `docs/project_log.md` with `event_type: POST_MORTEM`. This makes the post-mortem discoverable via the project log, not just via file browse.

## Step 6: Suggest Agent Improvement

After the archivist logs the post-mortem, if Section 6 (Protocol Gaps) contains any rows, report to the human:

> "Post-mortem written. {N} protocol gaps identified. Run the `agent-improvement` skill to act on them — it will archive the current agent versions, apply targeted edits, and log each change."

If Section 6 is empty (clean sprint), no suggestion needed.

---

## What Makes a Good Post-Mortem

**Specific over generic.** "FE missed a constant usage" is weak. "FE imported `CONTROL_BG` and used it at line 47 but wrote `rgba(15,15,15,0.72)` inline at lines 89, 103, 141, 188, 211, 234, 267 — seven instances in the same file" is what the next engineer needs.

**Counterfactual reasoning.** For every failure, ask: what would have had to be true for this not to happen? That answer is the suggested fix. "If RA had flagged that Nominatim returns strings not numbers, FE would have typed the Zod schema correctly on the first attempt" → suggested fix: make RA pre-flight mandatory before any external API integration.

**Honest about causality.** If two audits failed for the same root cause, that means the remediation was incomplete — the agent fixed the obvious instances but didn't grep exhaustively. Name that pattern; don't attribute it to bad luck.

**Post-delivery bugs get their own section.** Anything found after agents declared DONE is a pipeline failure, not a human catch. Treat it as such and trace it to a specific gap.
