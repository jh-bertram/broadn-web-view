# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repository Is

`broadn-web-view` is a **Claude Code agent orchestration framework** — a configuration-only repository that defines a 13-agent AI team for delivering software features. It contains no application source code, no `package.json`, and no build system. The agents build *other* projects; this repo is the control plane.

## No Build Commands

There are no build, test, or lint commands for this repository itself. When agents execute `npm run dev`, `npm test`, etc., they do so inside the *target project* being built — not here.

## Agent Team Architecture

The orchestration follows a strict pipeline:

```
Human → Orchestrator → PM → Critic → [BE / FE / DS / UI] → Auditor → Archivist
```

**Routing rules:**
- Simple single-domain task → main session acts as PM → spawn implementing agent → `audit-pipeline` → Archivist
- Complex multi-domain task → invoke `dispatch-task` skill → PM decomposes → agents execute in waves → audit → Archivist

**Key boundaries enforced by design:**
- BE defines Zod schemas; FE consumes them (never the reverse)
- DS (DB Specialist) is the only agent that writes Prisma migrations — BE requests via `<data_request>`
- Auditor has veto power; a FAIL result must be remediated before a task closes
- Archivist only logs tasks that have passed all audit gates

## Agent Responsibilities (`.claude/agents/`)

| Agent | Role |
|---|---|
| `orchestrator` | Human-facing entry point; routes work, never writes code |
| `pm` | Decomposes goals into atomic task packets with dependencies |
| `critic` | Reviews PM's plan before any agent is spawned; blocks on BLOCK result |
| `backend` | TypeScript API routes, Zod schemas, server-side logic |
| `frontend` | React + Tailwind + Shadcn/ui components, client state |
| `database` | Prisma migrations, schema design, query optimization |
| `ui-designer` | Design specs for FE to implement; spawned before FE, not after |
| `auditor` | Three-gate verification: SA (standards) → QA (tests) → SX (security) |
| `archivist` | Logs completed tasks with rationale; maintains knowledge graph |
| `researcher` | External docs, API verification, dataset acquisition |
| `statistician` | Data analysis and statistical insights; never writes app code |
| `dispatcher` | Task routing utility for parallel workstreams |
| `hr` | Team capacity and workload balancing (optional) |

## Skills (`.claude/skills/`)

Skills are invoked via the `Skill` tool. Key ones:

- **`dispatch-task`** — Full delivery cycle: PM → Critic → agents → audit → archive
- **`audit-pipeline`** — SA → QA → SX gates on any completed implementation
- **`ralph-loop`** — Self-correcting remediation when audit fails
- **`assign-agents`** — Formal agent dispatch after Critic passes; builds expectation manifest
- **`convention-detect`** — Scans target project for build/lint commands before PM decomposes
- **`requirements-validate`** — Maps every success criterion to delivered artifacts before sprint close
- **`post-mortem`** — Structured root-cause analysis after sprint completion
- **`agent-improvement`** — Updates agent specs based on post-mortem findings

## Output and Event Paths (created at runtime)

- **Task specs:** `.claude/tasks/{task_id}.md`
- **Agent outputs:** `.claude/tasks/outputs/{task_id}-{AGENT_CODE}-{ts}.md`
- **Event log:** `docs/events/agent-events-{YYYY-MM-DD}.jsonl`
- **Agent checkpoints:** `docs/agent-logs/{AGENT_CODE}/{task_id}.md`
- **Post-mortems:** `docs/post-mortems/`

## Code Standards for Target Projects

When agents build target projects, they follow `.claude/rules/standards.md`:
- TypeScript strict mode; Zod schema at every API boundary; infer types via `z.infer<typeof ...>`
- Naming: `kebab-case.ts` files, `PascalCase.tsx` components, `camelCase` functions, `SCREAMING_SNAKE_CASE` constants, `snake_case` DB tables
- Commits: Conventional Commits `<type>(<scope>): <description>` with rationale in body; ≤50 new lines without a prior verification gate pass
- A11Y: keyboard nav, `alt` text, WCAG AA contrast, semantic HTML
- `npm audit` before any merge to main

## Hooks (`.claude/hooks/`)

Three lifecycle hooks are active:
- `pre-spawn-output-check.sh` — Runs before agent spawns
- `post-write-open-report.sh` — Runs after Write tool use
- `agent-stop-checkpoint.sh` — Runs when an agent stops (Stage 3 checkpoint)
