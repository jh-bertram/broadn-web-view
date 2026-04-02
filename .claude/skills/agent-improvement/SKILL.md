---
name: agent-improvement
description: Iteratively improves the agent team by comparing post-mortems against current agent specs, researching solutions to recurring issues, and rewriting agent files with versioned, archived changes. Use after any post-mortem is written, or periodically after multiple sprints have accumulated. Spawns the Researcher for issues that warrant external knowledge. Archives old agent versions, logs every change with a single-line description, and produces an improvement report. Triggers on "improve the agents", "update the team based on the post-mortem", "agent retrospective", or any request to act on post-mortem findings.
---

# Agent Improvement Skill

## When To Use

- After any `post-mortem` skill run that identified protocol gaps
- Periodically: if `docs/agent-improvements/` has no entry in the last 3 sprints, improvements are overdue
- On explicit human request: "tighten up the agents", "act on the post-mortem", "update the team"

Do not use mid-sprint. Do not use speculatively without a post-mortem or concrete failure evidence.

---

## Step 0: Establish an Improvement Session ID

Convention: `agent-improvement-{YYYY-MM-DD}-{N}` where N increments if multiple sessions run the same day.

All log entries, archive paths, and the improvement report use this ID.

---

## Step 1: Gather the Evidence

### 1a. Post-mortems to act on

Read all post-mortems not yet acted on. Check `docs/agent-changelog.md` for the timestamp of the last improvement session, then read post-mortems dated after that timestamp.

```bash
ls -lt docs/post-mortems/
```

If no `docs/agent-changelog.md` exists yet, read all post-mortems in `docs/post-mortems/`.

For each post-mortem, extract:
- **Section 6 (Protocol Gaps):** the gap table — each row is a candidate improvement
- **Section 5 (Agent Performance):** first-pass rates and recurring failure patterns
- **Section 4 (QA Gap Analysis):** what the pipeline missed and why
- **Section 3 (Post-Delivery Bugs):** any bugs that slipped past all gates

### 1b. Current agent specs

Read every agent file in `.claude/agents/`:

```bash
ls .claude/agents/*.md
```

For each file, note:
- The current `version:` value in frontmatter (if absent, it is `1.0.0` — record it as such)
- The `tools:` list
- The `model:` value
- Any existing checklists, gates, or mandates that are relevant to the gaps found

### 1c. Current skill specs

Read skill files that are implicated by the gaps:
```bash
ls .claude/skills/*/SKILL.md
```

Skills can also be improved — treat them the same as agent files.

---

## Step 2: Map Gaps to Files

For each gap identified in Step 1, identify the exact file(s) it implicates:

| Gap | Implicated file | Change type |
|-----|-----------------|-------------|
| FE doesn't grep for inline literals before submitting | `.claude/agents/frontend.md` | Add checklist step |
| Auditor doesn't catch bundler misconfigs | `.claude/agents/auditor.md` | Add Playwright Tier 1 gate |
| Sprint declared DONE without human browser check | `.claude/skills/dispatch-task/SKILL.md` | Add verification step |
| RA not spawned before external API integrations | `.claude/skills/dispatch-task/SKILL.md` | Add routing rule |

Be specific: "frontend.md needs a new section" is actionable. "agents should be more careful" is not — discard any gap that doesn't map to a concrete file and change type.

---

## Step 3: Decide Where Research Is Needed

Not every gap requires the Researcher. Apply this filter:

**Spawn RA when:**
- The fix requires knowing current best practices from external sources (e.g., "what patterns prevent DRY violations in LLM agent prompts?", "what does Playwright MCP's `browser_console_messages` actually return — errors only or all levels?")
- The fix involves a third-party tool whose behaviour may have changed (API shape, CLI flags, version compatibility)
- Two post-mortems show the same gap and internal fixes have not resolved it — the root cause may require a different approach entirely

**Do not spawn RA when:**
- The fix is a direct mechanical change derivable from the post-mortem (add a grep step, change a threshold, add a checklist item)
- The fix is a wording or structural improvement to an existing protocol
- The gap has an obvious, unambiguous solution

For each RA research task, spawn the Researcher with a focused, specific query. Do not ask for general background — ask for the precise fact or pattern you need to write the fix.

Example prompt to RA:
```
Research whether Playwright MCP's browser_console_messages tool returns pageerror events
(unhandled JS exceptions) or only console.log/warn/error calls. Source: official @playwright/mcp
documentation or source. We need to know if it is sufficient for detecting __publicField runtime
errors or if we also need to listen for pageerror separately.
```

Distribute RA findings to the relevant changes before writing any edits.

---

## Step 4: Draft Changes

For each implicated file, draft the exact change:

- **What line/section is being changed** (reference the current file content)
- **What the new text will be** (write it fully — do not describe it, write it)
- **Why** (one sentence tracing back to the post-mortem gap)
- **Version bump type**: PATCH | MINOR | MAJOR (see versioning rules below)

### Versioning Rules

| Bump | When |
|------|------|
| PATCH (x.x.Z+1) | Checklist addition, wording fix, new example, threshold adjustment |
| MINOR (x.Y.0) | New section or gate, new tool added to `tools:`, significant behaviour change |
| MAJOR (X.0.0) | Domain boundary change, model change, tools list restructure, agent merged or split |

If a file has no `version:` field in its frontmatter, treat its current version as `1.0.0` and add the field as part of the first edit (counts as a PATCH unless the edit itself is MINOR/MAJOR).

---

## Step 5: Archive, Edit, Log

For each changed file, execute in this exact order:

### 5a. Determine new version

Read the current `version:` from frontmatter (or `1.0.0` if absent). Apply the bump. New version string = `{X}.{Y}.{Z}`.

### 5b. Archive the current version

Copy the file to:
```
docs/agent-versions/{agent-or-skill-name}/v{current-version}-{YYYY-MM-DD}.md
```

Create the directory if it does not exist:
```bash
mkdir -p docs/agent-versions/{name}
```

Then copy:
```bash
cp .claude/agents/{name}.md docs/agent-versions/{name}/v{current-version}-{YYYY-MM-DD}.md
```

For skill files:
```bash
mkdir -p docs/agent-versions/skills/{skill-name}
cp .claude/skills/{skill-name}/SKILL.md docs/agent-versions/skills/{skill-name}/v{current-version}-{YYYY-MM-DD}.md
```

### 5c. Apply the edit

Use the Edit tool to make the change. Make one logical change per edit call — do not batch unrelated changes into a single edit. If a file has three distinct improvements, make three Edit calls.

### 5d. Update the version field

If the file already has `version:` in frontmatter, update it to the new version string.
If it does not, add `version: {new-version}` as the last line of the frontmatter block (before the closing `---`).

### 5e. Append to the changelog

Append to `docs/agent-changelog.md` (create if absent):

```
## {session_id}
**Date:** {YYYY-MM-DD}
**Post-mortems acted on:** {comma-separated filenames}

| File | Previous version | New version | Change |
|------|-----------------|-------------|--------|
| `.claude/agents/frontend.md` | 1.0.0 | 1.1.0 | Added constant-usage grep audit before ui_packet emission |
| `.claude/agents/auditor.md` | 1.0.0 | 1.1.0 | Replaced bash heredoc Tier 1 with Playwright MCP tool calls |
| `.claude/skills/dispatch-task/SKILL.md` | 1.0.0 | 1.1.0 | Added Step 4.5 human verification checkpoint for FE sprints |
```

**The change description must be a single concise sentence** — what changed and why in ≤15 words. Do not write "improved X" — write what specifically was added, removed, or replaced.

---

## Step 6: Write the Improvement Report

Write to `docs/agent-improvements/{session_id}.md`:

```markdown
# Agent Improvement Session: {session_id}
**Date:** {YYYY-MM-DD}
**Post-mortems reviewed:** {list with links}
**Gaps addressed:** {N}
**Files changed:** {N}
**Research tasks spawned:** {N}

---

## Gaps Addressed

{For each gap from the post-mortem protocol gaps table:}

### {Gap title}
**Source:** `docs/post-mortems/{filename}.md` — Section 6
**Root cause:** {one sentence}
**File changed:** `{path}`
**Change:** {the single-sentence changelog description}
**Version:** {old} → {new}
{If RA was used:} **Research basis:** {RA finding that informed the fix, with source URL}

---

## Gaps Not Addressed

{List any protocol gaps from the post-mortem that were NOT acted on, with reason:}

| Gap | Reason not addressed |
|-----|---------------------|
| {gap} | Requires human decision / insufficient evidence / already fixed by prior session |

---

## Research Conducted

{If RA was spawned:}

| Query | Finding | Applied to |
|-------|---------|------------|
| {research question} | {one-sentence finding} | {which file change} |

---

## Next Review Trigger

Improvements are due again after: {next sprint slug if known, or "3 sprints from now"}.
Unresolved gaps to watch: {any patterns still present after this session's fixes}.
```

---

## Step 7: Archivist Handoff

Spawn the Archivist to log the improvement session:

```
Task: Log agent improvement session
event_type: AGENT_IMPROVEMENT
task_id: {session_id}
rationale: Acted on {N} protocol gaps from post-mortems [{list}]. Changed {N} files.
  Key changes: {the 2-3 most significant one-liners from the changelog}.
  Unresolved gaps: {any not addressed}.
retention_keys: docs/agent-improvements/{session_id}.md, docs/agent-changelog.md
```

---

## Periodic Review Protocol

Run this check at the start of any improvement session to determine scope:

```bash
# Date of last improvement session
tail -1 docs/agent-changelog.md | grep "Date:"

# Post-mortems written since then
ls -lt docs/post-mortems/

# Recurring patterns: same gap appearing in multiple post-mortems
grep -h "Gap" docs/post-mortems/*.md | sort | uniq -c | sort -rn | head -10
```

A gap that appears in two or more post-mortems without a corresponding changelog entry is **overdue**. Treat it as HIGH priority regardless of original severity rating.

---

## What Good Improvements Look Like

**Specific, not aspirational.** "FE must grep for `rgba(15,15,15` before issuing ui_packet" is an improvement. "FE should be more careful about DRY" is not — it has no mechanical enforcement.

**Traceable.** Every change traces to a specific post-mortem section and gap row. No speculative improvements that aren't grounded in observed failure.

**Minimal.** One gap → one change → one changelog entry. Do not refactor surrounding text, rename sections, or add polish beyond what the gap requires. The goal is signal-dense surgical edits, not rewrites.

**Versioned and archived before edited.** The archive is the rollback mechanism. An improvement that introduces a regression can be reversed by restoring the archived version — but only if the archive step ran before the edit.

---

## Step 8: Cross-Project Propagation

After completing Steps 1–7 for the current project, check whether any sibling projects run the same agent team and need the same improvements applied.

### When to check sibling projects

Always run this step after any improvement session. Do not skip it even when improvements appear project-specific at first — the classification below determines what actually propagates.

### How to identify sibling projects

A sibling project is any project directory (relative to `~/projects/`) that contains a `.claude/agents/` directory with the same roster of agent files. Check:

```bash
ls ~/projects/*/. claude/agents/*.md 2>/dev/null | grep -o 'projects/[^/]*' | sort -u
```

A project with the same set of agent filenames (orchestrator.md, pm.md, critic.md, backend.md, frontend.md, etc.) is a sibling. Projects with a structurally different roster (e.g., a single-agent tool, a research-only team) are not siblings and do not receive propagation.

### How to propagate validated improvements

For each improvement from Steps 1–7:

1. **Classify the improvement** (see below) — project-specific or universal.
2. For universal improvements: read the changelog entry you just wrote. Apply the same edit to the corresponding file in each sibling project using the Edit tool. Match the version bump (PATCH/MINOR/MAJOR) used in the originating project.
3. Append a propagation note to each sibling's `docs/agent-changelog.md`:
   ```
   ## {session_id}-propagated-from-{source_project}
   **Date:** {YYYY-MM-DD}
   **Source:** Propagated from {source_project} improvement session {session_id}
   | File | Previous version | New version | Change |
   |------|-----------------|-------------|--------|
   | {file} | {old} | {new} | {same one-liner from source changelog} |
   ```
4. Do NOT re-archive in the sibling — the source project's archive is the canonical record.

### How to classify improvements

**Propagate to all siblings:**
- Protocol rules (event logging, output-to-file, checkpoint stages, audit gate ordering)
- Routing rules (EDA → statistician, archivist foreground-only, AUDIT_BLOCKED protocol)
- Cross-cutting quality rules (DRY helper extraction, sequential single-file sprint scope)
- New agents or agent structural additions (e.g., archivist sprint-close update, ORC#0-direct events)

**Do NOT propagate — project-specific:**
- Rules that reference domain-specific technology only present in one project (e.g., Chart.js tooltip positioning rules, `ctx.parsed` accessor, `getBoundingClientRect()` offset — these are specific to data dashboard projects using Chart.js, not applicable to a UI studio like gander-studio-alpha)
- Rules that reference specific data file names or field names from one project's data contract (e.g., `data.json`, `project_id`, `tag_groups`)
- Rules that reference a specific framework or library version not confirmed in the sibling (e.g., a Prisma-specific migration rule in a project that uses a different ORM)
- Post-mortem root causes that explicitly name a sprint from the source project and have no equivalent failure pattern in the sibling's history

When in doubt: check the sibling project's post-mortems for the same failure pattern. If the pattern has appeared there independently, propagate. If it has not, flag it in the improvement report under "Gaps Not Propagated" with a note that sibling projects should monitor for this pattern.
