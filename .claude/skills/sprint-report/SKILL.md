---
name: sprint-report
description: "Produce a sprint intelligence report from JSONL event logs — session breakdown, agent roster, token usage, and file attribution per agent. Use after any sprint completes, before or after running post-mortem. Triggers on 'sprint report', 'who did what', 'show session breakdown', 'token usage', 'sprint stats', or any request for sprint-level observability."
---

# Sprint Report

## When To Use
After any sprint completes (or at any point mid-sprint for a progress snapshot). Produces a
structured Markdown report covering sessions, agents, token usage, and file attribution.

Run this **before** `post-mortem` to give it richer attribution data.

## Invocation

```
/sprint-report {sprint-slug}
```

Example: `/sprint-report gander-studio-p1`

If no slug is provided, infer from the most recent `SESSION-CHECKPOINT-*.md` file.

---

## Procedure

### Step 1 — Locate event logs

Glob `docs/events/agent-events-*.jsonl`. Read **all** files.

Filter events to sprint scope: include any event where:
- `task_id` starts with `{slug}`, OR
- `ev` is `RESUME` (session boundary markers span all task IDs)

Sort all events by `ts` (ISO-8601). When `seq` values collide (duplicate seqs exist in real
logs), use `ts` as the tiebreaker — do NOT crash or deduplicate.

---

### Step 2 — Detect session boundaries

**Definitive:** RESUME events split sessions. A RESUME event at timestamp T means everything
before T is Session N, everything from T onward is Session N+1.

**Heuristic fallback** (when no RESUME event): a gap >30 minutes between consecutive events
(sorted by `ts`) signals a new session.

Assign each event a `session_id` (integer, 1-based). Record per session:
- `start_ts` — first event timestamp
- `end_ts` — last event timestamp
- `seq_range` — [min_seq..max_seq]

---

### Step 3 — Per-session summary table

For each session, produce:

| Session | Start | End | Seq Range | Agents Spawned | Tasks Completed | Audit PASS | Audit FAIL |
|---------|-------|-----|-----------|----------------|-----------------|------------|------------|

Count:
- **Agents Spawned** = count of SPAWN events in session (unique agent_ids)
- **Tasks Completed** = count of COMPLETE events in session
- **Audit PASS** = count of AUDIT_PASS events
- **Audit FAIL** = count of AUDIT_FAIL + CRITIQUE_BLOCK events

---

### Step 4 — Agent roster table

Collect all unique `agent_id` values across all sprint events.

For each agent:

| Agent ID | Role | Tasks | Outcomes | Tokens |
|----------|------|-------|----------|--------|

- **Role** — derive from agent_id prefix: BE=Backend, FE=Frontend, UI=UI Designer, AUD=Auditor, AR=Archivist, RA=Researcher, PM=Project Manager, CR=Critic, ORC=Orchestrator, DS=DB Specialist
- **Tasks** — task_ids from SPAWN events for this agent_id
- **Outcomes** — PASS/FAIL/BLOCKED counts from AUDIT_PASS/AUDIT_FAIL/CRITIQUE_BLOCK events linked to this agent
- **Tokens** — value of `tokens` field from COMPLETE event if present; else `—`

---

### Step 5 — Token accounting

Search all COMPLETE events for a `"tokens": N` field.

If none found:

> **TOKEN_GAP:** Historical sprint data contains no token counts. COMPLETE events do not
> include a `tokens` field. Future sessions will track usage via the `tokens` field added to
> COMPLETE events (the spawning session fills this in from the `<usage>` block returned by
> the subagent). All token columns show `—` for this sprint.

If some tokens are present, sum them and include a total. Flag any missing entries with `—`.

---

### Step 6 — File attribution

For each COMPLETE event in the sprint:
1. Read each path in `output_files`
2. Scan the file for a `## Files Created / Modified` section
3. Extract lines matching `**Created**: {path}` or `**Modified**: {path}` patterns
4. Build attribution table:

| File Path | Created By | Modified By | Session |
|-----------|------------|-------------|---------|

- **Created By** / **Modified By** = `agent_id` from the COMPLETE event that produced the output file
- **Session** = session_id computed in Step 2
- If output file is missing or has no `## Files Created / Modified` section → mark `UNKNOWN`

> **Note:** If `apps/gander-studio/` (or similar app directory) is not yet committed to git,
> git history will not show file creation dates. This table is the authoritative source for
> "who created what" in that case.

---

### Step 7 — Write report

Write to `docs/sprint-reports/{slug}-report.md`.

Create `docs/sprint-reports/` if it does not exist.

#### Report structure

```markdown
# Sprint Report: {slug}

**Generated:** {ISO-8601}
**Sprint dates:** {first_event_ts} → {last_event_ts}
**Sessions:** {N}
**Total events:** {N}
**Total agents:** {N unique agent_ids}
**Tasks completed:** {N}
**Audit pass rate:** {N}/{N} ({pct}%)

---

## Session Breakdown
{per-session summary table}

---

## Agent Roster
{agent roster table}

---

## Token Accounting
{token table or TOKEN_GAP notice}

---

## File Attribution
{file attribution table}

---

## Open Items
{any items from SESSION-CHECKPOINT that remain unresolved}
```

---

### Step 8 — Emit XML block

```xml
<sprint_report>
  <sprint_id>{slug}</sprint_id>
  <sessions>{N}</sessions>
  <total_agents>{N}</total_agents>
  <tasks_completed>{N}</tasks_completed>
  <audit_pass_rate>{pct}%</audit_pass_rate>
  <token_total>{N or TOKEN_GAP}</token_total>
  <report_path>docs/sprint-reports/{slug}-report.md</report_path>
</sprint_report>
```

---

## Edge Cases

| Situation | Handling |
|-----------|----------|
| Duplicate `seq` values | Sort by `ts`; do not crash or deduplicate |
| Sprint spans multiple calendar days | Slug-based filter covers all days; do not use date range |
| RESUME event missing | Use 30-min gap heuristic for session boundaries |
| No `tokens` in COMPLETE events | Emit TOKEN_GAP notice; show `—` for all agents |
| Output file missing from disk | Mark attribution `UNKNOWN`; continue |
| Output file has no `## Files Created / Modified` section | Mark attribution `UNKNOWN`; continue |
| Agent appears in multiple sessions | List in roster once with all tasks aggregated |

---

## Notes

- This skill runs entirely in the main session — no subagent spawn needed.
- Token data is **only visible to the spawning session** (from the `<usage>` block returned
  when a subagent completes). Subagents cannot self-report tokens. The orchestrator is
  responsible for adding `"tokens": N` to the COMPLETE event after receiving each subagent.
- Sprint reports are append-safe: running this twice on the same slug overwrites the report
  file — it does not duplicate sections.
