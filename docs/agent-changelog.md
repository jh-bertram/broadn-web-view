# Agent Changelog

## agent-improvement-2026-03-17-1
**Date:** 2026-03-17
**Post-mortems acted on:** broadn-p2-slice-panel.md

| File | Previous version | New version | Change |
|------|-----------------|-------------|--------|
| `.claude/agents/pm.md` | 1.0.0 | 1.1.0 | Added EDA/inspection → statistician routing rule to domain identification step |
| `.claude/agents/pm.md` | 1.0.0 | 1.1.0 | Added `<estimated_new_lines>` mandatory field to FE task_packet format with >100-line split requirement |
| `.claude/agents/orchestrator.md` | 1.0.1 | 1.1.0 | Added `<prior_sprint_gaps>` field to orchestrator_brief template, populated from prior post-mortem Section 6 |
| `.claude/agents/orchestrator.md` | 1.0.1 | 1.1.0 | Added dataset EDA routing row to routing table directing inspection tasks to statistician |
| `.claude/agents/backend.md` | 1.1.0 | 1.1.1 | Added DRY helper extraction pre-flight check requiring extraction of any repeated pattern before issuing completion_packet |
