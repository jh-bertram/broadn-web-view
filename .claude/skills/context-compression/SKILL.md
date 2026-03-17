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
