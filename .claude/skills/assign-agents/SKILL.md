---
name: assign-agents
description: Formally dispatch implementing agents after the Critic has passed the PM's plan. Use at dispatch-task Step 2 — after CRITIQUE_PASS, before any implementing agent is spawned. Produces explicit per-agent assignments with expected return packet shapes, logs all SPAWN events, and builds the expectation manifest the PM uses to validate return packets. Ensures no agent starts without a complete, unambiguous brief and that the PM knows exactly what it is waiting for from each one. Triggers automatically within dispatch-task after Step 1.5 passes.
---

# Assign Agents
<!-- version: 1.0.1 -->

This skill is the handoff layer between a validated plan and execution. By the time this skill runs, the Critic has passed the plan — the question is no longer *what to build* but *who gets exactly what brief, with what return expectations, in what order*.

A brief that is vague about expected output produces a packet the PM cannot validate. A brief that omits scope boundaries produces an agent that drifts. A dispatch without a logged expectation manifest produces a PM that cannot tell whether a return packet is complete.

---

## Prerequisites

Before running this skill:
- PM has produced a `<sprint_state>` and all `<task_packet>` blocks
- Critic has returned `CRITIQUE_PASS` (or `CRITIQUE_PASS` with WARNING-only findings)
- Any WARNING-level findings from the Critic have been surfaced to the human

If these conditions are not met, do not proceed. Return to the appropriate prior step.

---

## Step 1: Build the Assignment Registry

For every task packet in the plan, produce a fully-specified assignment entry. Work through each packet and complete every field below — do not leave any field as a placeholder.

For each task:

```
TASK ID:       {task_id}
AGENT:         {agent name and instance number — e.g. FE#1, BE#1}
PRIORITY:      {BLOCKER | HIGH | NORMAL}
DEPENDS ON:    {task_ids that must COMPLETE before this one can START — NONE if independent}
BLOCKS:        {task_ids that cannot start until this one returns — NONE if nothing depends on it}

BRIEF SUMMARY: {one sentence — what this agent is being asked to produce, not how}

CONTEXT TO PROVIDE:
  - {file path}: {why this file — what the agent needs from it}
  - {file path}: {why this file}
  [list only files the agent genuinely needs; omit everything else]

EXPLICITLY OUT OF SCOPE:
  - {thing the agent must not do — domain boundary violation risk}
  - {thing handled by another task in this plan}

EXPECTED OUTPUT:
  Tag:            {completion_packet | ui_packet | data_packet | research_dossier | design_spec}
  Must contain:   {specific field or artifact — be exact}
                  {e.g. "Zod schema named GeocoderResultSchema exported from src/contracts/geocoder.ts"}
  Must not contain: {boundary violation to watch for}
                    {e.g. "inline rgba values — palette tokens only"}
  Success signal: {the observable condition that confirms the packet is done}
                  {e.g. "npm run build passes, Playwright Tier 2 spec exists at tests/e2e/{task_id}.spec.ts"}
```

Complete the registry before spawning anything. A half-specified assignment is worse than a delayed one.

---

## Step 2: Determine Spawn Order

Draw the dependency graph from the `DEPENDS ON` / `BLOCKS` fields:

```
Independent tasks (no DEPENDS ON) → can spawn in parallel
Sequential tasks (A DEPENDS ON B) → spawn B first; spawn A only after B's packet is received and receipt-checked
```

Group tasks into waves:
- **Wave 0:** All tasks with no dependencies — spawn simultaneously
- **Wave 1:** All tasks that depend only on Wave 0 completions — spawn when Wave 0 packets return
- **Wave N:** etc.

Write the wave plan out explicitly before spawning Wave 0. If the wave plan looks wrong (e.g., everything in Wave 0 when you know FE needs BE's schema), stop and correct the dependency declarations.

---

## Step 3: Log SPAWN Events and Dispatch Wave 0

**Spawn stagger:** When a wave contains **3 or more parallel agents**, introduce a 20-second gap between consecutive spawns. The first agent spawns immediately; each subsequent agent in the same wave spawns after a 20-second delay. This prevents simultaneous API requests from hitting Claude's rate limits and causing silent respawn cycles. Single-agent and two-agent waves do not need staggering.

For every task in Wave 0, before spawning:

1. Append the SPAWN event to `docs/events/agent-events-{YYYY-MM-DD}.jsonl`:
```json
{"seq":{N},"ts":"{ISO-8601}","ev":"SPAWN","task_id":"{task_id}","agent_id":"{AGENT_CODE}#{n}","parent_id":"PM#0","edge_label":"task_packet","expected_output":".claude/agents/tasks/outputs/{task_id}-{AGENT_CODE}-{unix_ts}.md"}
```

2. Spawn the agent with the full task brief constructed from the assignment registry entry. The prompt must include:

```
## Task
{BRIEF SUMMARY}

## Context Files
{list from CONTEXT TO PROVIDE — provide actual file paths, not descriptions}

## Out of Scope
{list from EXPLICITLY OUT OF SCOPE}

## Expected Output
Return a {tag} XML block.

Must contain:
- {each must_contain item}

Must not contain:
- {each must_not_contain item}

Success signal: {success_signal}

## Output Path
Write your primary output to:
  .claude/agents/tasks/outputs/{task_id}-{AGENT_CODE}-{unix_ts}.md
Create the directory if it does not exist. Record this path in output_files of your COMPLETE event.
```

3. Do not include context files from other tasks. Each agent gets only what its own brief specifies.

---

## Step 4: Produce the Expectation Manifest

After all Wave 0 agents are spawned, write the expectation manifest to `docs/task-registry.md`. This is what the PM uses to validate every return packet before routing it anywhere.

```xml
<expectation_manifest>
  <sprint_id>{sprint slug}</sprint_id>
  <generated>{ISO-8601}</generated>
  <assignments>

    <assignment>
      <task_id>{task_id}</task_id>
      <agent>{AGENT_CODE}#{n}</agent>
      <expected_tag>{output tag}</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/{task_id}-{AGENT_CODE}-*.md</expected_file>
      <wave>{0 | 1 | N}</wave>
      <blocks>{comma-separated task_ids blocked by this | NONE}</blocks>
      <receipt_check>
        <item>{specific thing to verify on receipt}</item>
        <item>{e.g. "build: passing noted in packet"}</item>
        <item>{e.g. "e2e_spec field is a file path, not TIER_1_ONLY"}</item>
        <item>{e.g. "ZodSchema export confirmed in components_created"}</item>
      </receipt_check>
    </assignment>

  </assignments>
</expectation_manifest>
```

---

## Step 5: Receipt Checking (On Each Return)

When any agent returns a packet, before routing it to the auditor:

1. Find its entry in the expectation manifest
2. Check every `<receipt_check>` item against the returned packet
3. If all items pass → route to auditor via `audit-pipeline` skill
4. If any item fails → return immediately to the agent with a gap request:

```xml
<gap_request>
  <task_id>{task_id}</task_id>
  <missing>{exact receipt_check item that failed}</missing>
  <required>{what the agent must add or correct before the packet is accepted}</required>
</gap_request>
```

A gap request is not an audit failure — it is a pre-audit sanity check. The auditor should only see packets that have already passed receipt checking.

---

## Step 5.5: Wave Boundary Check

Before spawning the next wave, run two checks on the wave that just completed receipt checking.

### Conflict Detection

Collect the set of files touched by every agent in the completed wave. Use the `output_files` from their COMPLETE events plus any file paths listed in their `<components_created>` or `<files_modified>` packet fields.

If two or more agents modified the **same file**:

1. Read both versions and compare the changed ranges.
2. If the changes are in non-overlapping line ranges — merge them (apply both diffs) and verify the result compiles/parses. Log the merge in the event file as a `MERGE` event:
   ```json
   {"seq":{N},"ts":"{ISO-8601}","ev":"MERGE","task_id":"{task_id}","file":"{path}","agents":["{AGENT_CODE}#{n}","{AGENT_CODE}#{n}"],"resolution":"auto"}
   ```
3. If the changes overlap or conflict semantically — do **not** auto-merge. Surface both diffs to the orchestrator immediately with a `<conflict_report>`:
   ```xml
   <conflict_report>
     <file>{path}</file>
     <agent_a>{AGENT_CODE}#{n}</agent_a>
     <agent_b>{AGENT_CODE}#{n}</agent_b>
     <description>{what each change does and why they conflict}</description>
     <recommendation>{which change to prefer, or how to reconcile — your best judgment}</recommendation>
   </conflict_report>
   ```
   Block Wave N+1 until the human or orchestrator resolves the conflict.

### Wave Progress Report

After conflict detection (and any resolution), emit a compact status table. Print it directly — this is human-facing output from the orchestrator, not an artifact:

```
Wave {N} complete — {completed}/{total} waves done
────────────────────────────────────────────────────
  Task          Agent    Status   Notes
  ──────────    ──────   ──────   ──────────────────
  {task_id}     {CODE}   PASS     receipt checked
  {task_id}     {CODE}   PASS     receipt checked
  {task_id}     {CODE}   GAP      gap_request sent
────────────────────────────────────────────────────
  Next wave: {list of task_ids about to spawn}
```

Status values: `PASS` (receipt checked, routed to audit), `GAP` (gap_request sent, not yet accepted), `CONFLICT` (file conflict pending resolution).

---

## Step 6: Spawn Subsequent Waves

When all tasks in Wave N complete receipt checking and are handed to the auditor:

1. Do not wait for the audits to finish before spawning Wave N+1 if Wave N+1's dependencies are on the *receipt-checked packet*, not on the *audit result*. Audit and Wave N+1 can run in parallel if the packet content is what Wave N+1 needs.
2. Do wait for audit PASS if Wave N+1 needs the *verified, production-safe* output (e.g., FE should not wire to a BE endpoint that has not yet passed the security scan).
3. Use judgment: FE building against a Zod schema from BE can start once the schema is receipt-checked. FE going live on a BE API route should wait for audit PASS.

Log each Wave N+1 SPAWN event before dispatching.

---

## Per-Agent Expected Return Reference

Use this to fill `expected_tag` and seed the `must_contain` list for each agent type:

| Agent | Expected tag | Typical must_contain items |
|---|---|---|
| BE | `completion_packet` | Zod schema name + export path; API route path; no hardcoded secrets |
| FE | `ui_packet` | `state_hydration_map`; `a11y_verification`; `e2e_spec` (TIER_2 if new surface); `design_tokens_used` (no raw hex) |
| DS | `data_packet` | Migration filename; rollback command; affected table names |
| RA | `research_dossier` | At least one sourced claim per decision point; `staleness_risk` field |
| UI | `design_spec` | All interaction states specified; Shadcn component names; no raw hex in tokens |
| AUDIT | `audit_review` + `test_report` + `security_audit` | Status field on each (PASS/FAIL/SECURE/VULNERABLE) |

---

## What This Skill Produces

By the end of this skill, the following exist on disk:
- `docs/events/agent-events-{date}.jsonl` — SPAWN events for all Wave 0 agents (and subsequent waves as they are dispatched)
- `docs/task-registry.md` — the expectation manifest
- All Wave 0 agents are running with complete, unambiguous briefs

The PM's job after this skill is: wait for packets → receipt check → audit → archive → spawn next wave.
