---
name: dispatch-task
description: Orchestrate a complete feature delivery cycle from task decomposition through implementation, audit, and archiving. Invoked by the Orchestrator after receiving a human request. Drives the full PM → Critic → [BE/FE/DS/UI] → Auditor → Archivist pipeline, handling routing and verification gates automatically. The Orchestrator is the entry point; this skill is the procedure the Orchestrator executes.
---

# Dispatch Task — Full Delivery Cycle

This skill orchestrates one complete delivery cycle for a feature or task. It is invoked by the **Orchestrator** after receiving a request from the human. It wraps the PM → Critic → Execution → Audit → Archive sequence into a single, structured procedure.

## When To Use

Invoke this skill when:
- The human has a feature or fix to deliver and wants the full pipeline to run
- The task spans multiple domains (e.g., needs DS schema + BE endpoint + FE component)
- You (the Orchestrator) want the full team invoked in the correct sequence without manual step-by-step management

Don't use this skill for:
- Exploratory work or design discussions (use individual agents)
- Audit-only requests (use the audit-pipeline skill directly)
- Research tasks (spawn the researcher agent directly)

## Step 0: Establish Task ID

Before anything else, the Orchestrator defines a `task_id` for this delivery cycle. Every file output path, event log entry, SPAWN event, and agent handoff uses this ID. Without it, agent default output paths contain a literal `{task_id}` string and the event graph cannot be reconstructed.

Convention: `{project}-p{N}-{slug}` — e.g. `poster-p1-vector-base`, `poster-p3-palettes`

Write the task_id into:
- Every `<orchestrator_brief>` and `<task_packet>` dispatched to an agent
- Every SPAWN event logged to `docs/events/agent-events-{YYYY-MM-DD}.jsonl`
- The `## Output Path` block included in every agent prompt

## The Cycle

### Step 1: PM Decomposition

The Orchestrator spawns the PM agent with an `<orchestrator_brief>`. The PM will:
- Break the request into atomic `<task_packet>` assignments
- Identify domain dependencies (DS before BE, BE before FE live wiring)
- Assign priority levels
- Return a `<task_decomposition>` block

**Review the task decomposition before proceeding.** If the decomposition is wrong (wrong agents assigned, missing dependencies, misunderstood scope), send a `<revision_request>` back to PM. Don't execute a flawed plan.

### Step 1.5: Critic Review (Plan Gate)

Before spawning any implementing agent, spawn the Critic with the PM's full `<sprint_state>` and all `<task_packet>` blocks.

Log a SPAWN event first:
```json
{"seq":{N},"ts":"{ISO-8601}","ev":"SPAWN","task_id":"{task_id}","agent_id":"CR#1","parent_id":"MAIN","edge_label":"plan_critique","expected_output":".claude/agents/tasks/outputs/{task_id}-CR-{unix_ts}.md"}
```

Include in the Critic's prompt:
- The full `<sprint_state>` from PM
- All `<task_packet>` blocks
- The original human request (verbatim)
- The `## Output Path` block pointing to `.claude/agents/tasks/outputs/{task_id}-CR-{unix_ts}.md`

**If the Critic returns `CRITIQUE_BLOCK`:**
- Do not spawn any implementing agent
- Return the full `<plan_critique>` to the PM as a `<revision_request>`
- PM must address every BLOCKER challenge and produce a revised `<sprint_state>`
- Re-run Step 1.5 on the revised plan
- If the same blocker appears in two consecutive CRITIQUE_BLOCK results → escalate to human with a summary of both critique outputs

**If the Critic returns `CRITIQUE_PASS`:**
- Surface any WARNING-level challenges to the human as a brief note (do not block)
- Proceed to Step 2

The Critic does not slow down clean plans — a PASS costs one agent turn. It stops broken plans before they consume four times that in remediation loops.

### Step 2: Execute via assign-agents skill

Invoke the `assign-agents` skill. It handles:
1. Building the full assignment registry (brief, context, scope boundaries, expected return per agent)
2. Deriving the spawn wave order from declared dependencies
3. Logging all SPAWN events before dispatching
4. Writing the expectation manifest to `docs/task-registry.md`
5. Spawning Wave 0 agents with complete, unambiguous briefs
6. Receipt-checking each return packet against the manifest before handing to the auditor
7. Spawning subsequent waves as earlier waves complete

Do not spawn implementing agents manually — use the skill. It enforces the brief format, the SPAWN event log, and the receipt check that would otherwise be skipped under execution pressure.

### Step 3: Audit Each Completion

After each implementing agent returns its packet, invoke the audit-pipeline skill. Do not wait until all agents finish — audit each domain's output as it arrives.

If an audit fails:
- Return the `<remediation_request>` to the implementing agent immediately
- Use the ralph-loop skill to drive the remediation cycle
- Do not start the next dependent task until the failing task passes audit

### Step 4: Archive Completions

After each task passes audit, spawn the Archivist to log the completion with rationale. Don't batch archive entries — log each one when it closes.

### Step 4.5: Human Verification Checkpoint (FE tasks only)

For any sprint that includes FE work, **before declaring the sprint DONE**, request the human to do a manual browser check. The Playwright smoke test catches JS runtime errors, but it cannot catch visual regressions, map tile rendering failures, or interaction bugs that require a real user.

Post this to the human:

> "All audits passed. Before I close the sprint, please open the app in your browser and confirm: (1) the page loads, (2) the new feature is visible and behaves as expected, (3) the browser console shows no errors. Reply with OK to close the sprint, or describe any issue found."

**Do not mark the sprint DONE until the human confirms.** If a runtime issue is found, open a new remediation task with priority BLOCKER and run it through the full pipeline (implement → audit → archive) before closing the sprint.

This step exists because bundler misconfigurations, tile rendering failures, and interaction bugs only surface in a live browser — not in static analysis or headless Playwright.

### Step 5: Report to Human

When all tasks in the sprint are DONE and human verification has passed, produce a final `<sprint_state>` showing:
- All task IDs completed
- Any tasks that were modified in scope during delivery (and why)
- Any open risks or follow-up tasks identified during implementation
- Key files changed (for the human's awareness)

## Parallel vs. Sequential Execution

```
Example: "Add user profile editing"

Sequential (dependency chain):
  DS: add profile fields migration →
  BE: add PATCH /users/:id endpoint + Zod schema →
  FE: build profile edit form + wire to API

Parallel (independent):
  BE: user endpoint     ┐
  BE: settings endpoint ┘ → both audited independently
```

When tasks are independent, spawn them simultaneously. When there's a dependency (BE needs DS migration first), enforce the sequence.

## Communication Overhead

This skill reduces communication overhead by making the routing explicit and automatic. The human's involvement is:
1. Provide the goal to the Orchestrator
2. Review the Orchestrator's summary of the PM's task plan (optional but recommended)
3. Confirm browser verification for FE tasks (Step 4.5)
4. Receive the Orchestrator's final plain-language delivery report

The human should not need to say "now audit this" or "send it to the archivist" — the Orchestrator handles that via this skill.

## Post-Mortem (Optional, Recommended for Sprints with Failures)

After the sprint is fully closed and the human has confirmed (Step 4.5), invoke the `post-mortem` skill if:
- Any audit produced a FAIL result during the sprint, **or**
- A runtime bug was discovered post-delivery, **or**
- The human explicitly requests a retrospective

The post-mortem skill gathers all artifacts produced during the sprint — event log, agent outputs, audit results, archivist entries — and synthesizes them into a structured retrospective at `docs/post-mortems/{sprint-slug}.md`. The archivist logs it to the project log.

For clean sprints (zero audit failures, no post-delivery bugs), a post-mortem is optional. The archivist's `archive_entry` records are sufficient.

## Escalation

This skill respects all existing escalation rules:
- 3 consecutive audit failures → escalate to human
- 10 ralph-loop iterations without resolution → escalate to human
- PM identifies a dependency or requirement that wasn't in the original request → pause and check with human before continuing
