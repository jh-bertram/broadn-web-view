# Agent Team Hierarchy Update (2026-04-02)

## The agent team is now globally available — no setup needed in this project.

### What changed

The Gander agent team (agents, skills, rules) is now symlinked into `~/.claude/`, making it available to every project on this machine automatically:

```
~/.claude/agents  →  ~/projects/gander/.claude/agents
~/.claude/skills  →  ~/projects/gander/.claude/skills
~/.claude/rules   →  ~/projects/gander/.claude/rules
```

You no longer need to copy or symlink agent files into this project's `.claude/` directory. Claude Code reads the global `~/.claude/` for every session.

### Project-level overrides

If this project needs a project-specific agent, place it in `.claude/agents/` here. Local files take precedence over the global team.

### Source of truth

Edit the team at `~/projects/gander/`. Changes propagate here immediately.

Delete this file once you've noted the change.
