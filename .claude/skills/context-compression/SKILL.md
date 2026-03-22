---
name: context-compression
description: "Compress project context when conversations get long or context feels stale. Use when the human mentions 'context is bloated', 'you seem to be forgetting things', 'compress the history', or when you notice degraded performance in a long session."
---

# Context Compression

## When To Use
When a session has gone long and context quality is degrading, or when explicitly requested.

## Procedure
1. Spawn the archivist agent to generate a context snapshot.
2. The snapshot must capture:
   - All active task IDs and their current status (blocked, in-progress, done)
   - Key decisions made this session and their rationale
   - Files currently under active modification
   - Unresolved questions or blockers
   - Any error loops encountered and how they were resolved
3. The archivist writes this to `docs/snapshots/[ISO-date]-snapshot.md`.
4. Granular interaction history moves to `docs/history/`.
5. On the next turn, reference the snapshot instead of scrolling back through history.

## Format
The snapshot should be under 200 lines and scannable — use headers, bullet points, and task IDs. This is an operational document, not a narrative.

## Step 6: Push to GitHub Branch

After writing the SESSION-CHECKPOINT, push all sprint work to a named branch on GitHub.

**Branch convention:** `sprint/{project-slug}-{YYYY-MM-DD}`
Example: `sprint/broadn-p1-2026-03-22`

**Procedure:**
```bash
cd {project_root}

# Create and switch to sprint branch
git checkout -b sprint/{project-slug}-{YYYY-MM-DD}

# Stage all sprint artifacts (agent logs, outputs, post-mortem, agent improvements, app changes)
git add -A

# Commit with sprint summary
git commit -m "sprint({project-slug}): close out {sprint_id}

- {N} features delivered
- {N} post-delivery bugs fixed
- {N} agent improvements applied
- Session checkpoint written to docs/SESSION-CHECKPOINT.md

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

# Push to remote
git push -u origin sprint/{project-slug}-{YYYY-MM-DD}
```

**After push:** Return to main for the next sprint.
```bash
git checkout main
```

Note: If `git add -A` would pick up sensitive files (credentials, `.env`), stage specific directories instead: `git add index.html scripts/ data/ docs/ .claude/agents/ .claude/skills/`.
