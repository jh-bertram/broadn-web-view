---
name: project-archive
description: Archives all project-specific files to remove them from the active context window, giving the agent team a clean slate for a new project or new phase. Moves source code, task outputs, event logs, and sprint artifacts into a timestamped archive directory and excludes them via .claudeignore. Team files (agent specs, skills, rules, changelog, agent-versions) are never touched — they carry the institutional knowledge forward. Requires post-mortem and agent-improvement to have run first. Triggers on "archive the project", "clean slate", "start fresh", "new project".
---

# Project Archive
<!-- version: 1.0.1 -->

This skill removes project-specific context from the active workspace. The team's institutional knowledge — improved agent specs, skills, versioning history — stays intact. Everything else moves out of sight.

## Why This Order Matters

The archive is irreversible in the sense that the context window won't see those files again. If lessons from the project haven't been baked into the team first, they're gone. This is why the prerequisites are hard gates, not suggestions.

---

## Prerequisites (hard gates — do not proceed if either fails)

### Gate 1: Post-mortem exists for the most recent sprint

```bash
ls -t docs/post-mortems/
```

If the most recent sprint has no post-mortem, stop. Run the `post-mortem` skill first. A sprint without a post-mortem means unanalysed failures — archiving now discards the evidence.

### Gate 2: Agent-improvement has been run on that post-mortem

```bash
cat docs/agent-changelog.md | grep -A3 "Post-mortems acted on"
```

Check that the most recent post-mortem filename appears in the changelog. If not, stop. Run the `agent-improvement` skill first. Archiving before improvement means lessons were extracted but never applied to the team.

### Gate 3: Check agent files for hardcoded project paths

Before archiving, verify the team's agent specs are free of project-specific hardcoded paths:

```bash
grep -rn "apps/" .claude/agents/*.md
```

If any result references a specific project directory (e.g., `apps/elevation-map`, `apps/gander-studio`), replace those references with a generic placeholder (`{APP_CLIENT_DIR}`) or remove them before proceeding. These paths are stale artifacts from the completed project — leaving them in causes the next project's Critic to raise a BLOCKER on the first review pass.

If both gates and Gate 3 pass, tell the human:
> "Prerequisites confirmed. Post-mortem and agent-improvement are current. Ready to archive. This will move all project files out of the active context window. The team specs are up to date. Confirm to proceed."

**Wait for explicit human confirmation before touching any files.**

---

## Step 1: Establish Archive ID

```
archive/{YYYY-MM-DD}-{project-slug}/
```

The project slug is the name of the primary app directory (e.g., `elevation-map` from `apps/elevation-map/`). If archiving multiple apps, use the sprint name or a descriptive slug.

Create the root archive directory:
```bash
mkdir -p archive/{YYYY-MM-DD}-{project-slug}
```

---

## Step 2: Move Project-Specific Paths

Move each of the following if it exists. Use `mv`, not `cp` — the goal is removal from the active workspace.

```bash
ARCHIVE=archive/{YYYY-MM-DD}-{project-slug}

# Source code
[ -d apps ] && mv apps $ARCHIVE/apps

# Agent task outputs, PM briefs, audit results
[ -d .claude/agents/tasks ] && mv .claude/agents/tasks $ARCHIVE/tasks

# Event logs (JSONL agent activity records)
[ -d docs/events ] && mv docs/events $ARCHIVE/events

# Context snapshots
[ -d docs/snapshots ] && mv docs/snapshots $ARCHIVE/snapshots

# Compressed history
[ -d docs/history ] && mv docs/history $ARCHIVE/history

# Post-mortems (lessons already applied to team via agent-improvement)
[ -d docs/post-mortems ] && mv docs/post-mortems $ARCHIVE/post-mortems

# Sprint task registry / expectation manifests
[ -f docs/task-registry.md ] && mv docs/task-registry.md $ARCHIVE/task-registry.md

# Project log (running archive entry history)
[ -f docs/project_log.md ] && mv docs/project_log.md $ARCHIVE/project_log.md
```

After the move, recreate the empty directories so the structure still exists for the next project:
```bash
mkdir -p docs/events docs/snapshots docs/history docs/post-mortems
```

Also recreate the empty `.claude/agents/tasks/outputs` and `.claude/agents/tasks/audit-results` directories:
```bash
mkdir -p .claude/agents/tasks/outputs .claude/agents/tasks/audit-results
```

And a fresh `docs/project_log.md`:
```bash
echo "# Project Log" > docs/project_log.md
echo "" >> docs/project_log.md
echo "Started: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> docs/project_log.md
```

---

## Step 3: Update .claudeignore

Add the archive directory so agents never auto-read archived content:

```bash
echo "" >> .claudeignore
echo "# Archived projects — excluded from agent context" >> .claudeignore
echo "archive/" >> .claudeignore
```

If `.claudeignore` does not exist, create it:
```bash
cat > .claudeignore << 'EOF'
# Archived projects — excluded from agent context
archive/
EOF
```

Verify the entry:
```bash
cat .claudeignore
```

---

## Step 4: Verify the Clean State

Confirm the active workspace contains only team files:

```bash
# Should show only team-persistent paths
ls -la
ls .claude/agents/
ls .claude/skills/
ls docs/
```

Expected active state after archive:
```
.claude/
  agents/         ← team agent specs (untouched)
  skills/         ← team skills (untouched)
  rules/          ← standards (untouched)
docs/
  agent-changelog.md     ← version history (untouched)
  agent-improvements/    ← improvement reports (untouched, if exists)
  agent-versions/        ← archived agent specs (untouched, if exists)
  events/                ← empty, ready for next project
  history/               ← empty
  post-mortems/          ← empty
  project_log.md         ← fresh
  snapshots/             ← empty
.claudeignore             ← excludes archive/
```

If anything that should have been archived is still in the active workspace, move it now.

---

## Step 5: Report to Human

```
Archive complete.

Archived to: archive/{YYYY-MM-DD}-{project-slug}/
  - apps/            (source code)
  - tasks/           (agent task outputs and audit results)
  - events/          (agent event logs)
  - post-mortems/    (post-mortems — lessons applied to team before archive)
  - project_log.md   (sprint history)
  + other sprint artifacts

Active workspace is clean. .claudeignore excludes archive/.

Team files untouched:
  - .claude/agents/*.md    (agent specs — updated by last agent-improvement run)
  - .claude/skills/        (skills)
  - docs/agent-changelog.md

The team is ready for a new project. Start with a fresh human request — the PM will plan from the current agent specs with no prior project context in scope.
```

---

## What Is Never Archived

| Path | Why it stays |
|---|---|
| `.claude/agents/*.md` | The team — institutional knowledge lives here |
| `.claude/skills/` | The team's operational protocols |
| `.claude/rules/` | Standards the team enforces |
| `docs/agent-changelog.md` | Version history of the team itself |
| `docs/agent-versions/` | Rollback snapshots of agent specs |
| `docs/agent-improvements/` | Improvement session reports |

These files are never project-specific. They belong to the team, not the work.
