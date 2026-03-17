---
name: requirements-validate
description: Requirements traceability gate. Run after all audit gates PASS and before the Archivist logs completion. Maps every success criterion from the original human request back to specific delivered artifacts. Produces a requirements_coverage_report. MISSING findings block sprint close and route back to the implementing agent, not the auditor.
---

# Requirements Validate

This skill answers the question the auditor was never designed to answer: **did we build what was actually asked for?**

The auditor checks code quality (SA), functional correctness (QA), and security posture (SX). It does not check whether every stated requirement from the human's original request is satisfied. A feature can pass all three audit gates and still miss a stated need. This skill closes that gap.

Run this skill at Step 3.5 — after all audit PASSes for a wave, before the Archivist logs anything.

---

## Prerequisites

Before running:
- All tasks in the current wave have passed the `audit-pipeline` skill (SA PASS + QA PASS + SX SECURE)
- The original `orchestrator_brief` is available (read from the task output file at `.claude/agents/tasks/outputs/{task_id}-PM-*.md`, or from the SPAWN event log)
- All `<completion_packet>`, `<ui_packet>`, and `<data_packet>` outputs are available

---

## Step 1: Extract Requirements

Read the original human request from the `orchestrator_brief`. Extract every:

1. **Explicit requirement** — stated directly ("the endpoint must return X", "the button must be keyboard-accessible")
2. **Success criterion** — any "done when" condition stated in the brief or in task packets
3. **Constraint** — any stated restriction ("must use existing Zod schema", "no new dependencies", "must not break existing routes")

Number each extracted item sequentially: R-001, R-002, etc.

Write them to a `<requirement_list>` block:

```xml
<requirement_list>
  <requirement id="R-001" type="explicit|success_criterion|constraint">
    {verbatim or minimally paraphrased text from the brief}
  </requirement>
  ...
</requirement_list>
```

If fewer than 3 requirements can be extracted from the brief, the brief was underspecified. Flag this in the report as a `<note>` — do not block the sprint, but recommend adding success criteria to future briefs.

---

## Step 2: Map Requirements to Evidence

For each requirement, find the specific artifact that satisfies it. Look in:

1. **Delivered files** — read files listed in `output_files` from COMPLETE events
2. **Completion packets** — `<components_created>`, `<api_routes>`, `<schema_exports>`, etc.
3. **Test files** — test names and assertions can serve as evidence for functional requirements
4. **Event log** — COMPLETE events confirm what was produced

For each requirement, record:
- **Status**: `COVERED` | `PARTIAL` | `MISSING`
- **Evidence**: file path + line number, or packet field, that satisfies the requirement. For COVERED, this must be specific. For PARTIAL, note what is present and what is absent. For MISSING, note where you looked.

---

## Step 3: Produce the Report

```xml
<requirements_coverage_report>
  <task_id>{task_id}</task_id>
  <generated>{ISO-8601}</generated>
  <overall_status>{COVERED | PARTIAL | MISSING}</overall_status>

  <coverage>
    <item id="R-001" status="COVERED">
      <requirement>{text}</requirement>
      <evidence>{file:line or packet field that proves this is done}</evidence>
    </item>

    <item id="R-002" status="PARTIAL">
      <requirement>{text}</requirement>
      <evidence>{what exists}</evidence>
      <gap>{what is absent or incomplete}</gap>
    </item>

    <item id="R-003" status="MISSING">
      <requirement>{text}</requirement>
      <evidence>not found</evidence>
      <gap>{description of what was not delivered}</gap>
      <suggested_owner>{BE | FE | DS — which agent should address this}</suggested_owner>
    </item>
  </coverage>

  <summary>
    <covered_count>{N}</covered_count>
    <partial_count>{N}</partial_count>
    <missing_count>{N}</missing_count>
  </summary>

  <notes>
    {any structural observations — e.g. brief underspecification, ambiguous requirements that required interpretation}
  </notes>
</requirements_coverage_report>
```

Write the report to `.claude/agents/tasks/outputs/{task_id}-RV-{unix_ts}.md`.

---

## Step 4: Route the Result

### If overall_status is COVERED

All requirements satisfied. No blocking findings. Return the report to the orchestrator — it proceeds to archive.

### If overall_status is PARTIAL or MISSING

For each MISSING or PARTIAL item:

1. Do **not** re-open the auditor. This is a requirements gap, not a code quality failure.
2. Produce a `<gap_fill_request>` for the suggested owner:

```xml
<gap_fill_request>
  <task_id>{task_id}-gap-{R-NNN}</task_id>
  <priority>BLOCKER</priority>
  <agent>{BE | FE | DS}</agent>
  <requirement_id>{R-NNN}</requirement_id>
  <requirement_text>{verbatim}</requirement_text>
  <gap>{what is missing or incomplete}</gap>
  <already_present>{what was delivered — so the agent doesn't redo it}</already_present>
</gap_fill_request>
```

3. Route each `<gap_fill_request>` back through the full pipeline: implementing agent → receipt check → audit → requirements-validate again (for the gap items only).

4. A sprint cannot close until every requirement reaches COVERED status.

---

## What This Skill Does Not Do

- Does not recheck code quality, test coverage, or security — those are the auditor's domain.
- Does not judge whether the requirements were the right requirements — it only checks whether they were met.
- Does not produce new requirements — it only validates against what was stated. If a requirement is ambiguous, note it and interpret conservatively; do not invent coverage.
- Does not modify source files.
