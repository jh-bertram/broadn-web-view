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

## agent-improvement-2026-03-22-1
**Date:** 2026-03-22
**Post-mortems acted on:** broadn-p1-dashboard-enhancements.md

| File | Previous version | New version | Change |
|------|-----------------|-------------|--------|
| `.claude/agents/frontend.md` | 1.1.2 | 1.2.0 | Added Task Boundary Compliance section prohibiting agent-initiated task consolidation without ORC approval |
| `.claude/agents/frontend.md` | 1.1.2 | 1.2.0 | Added Data-Contract Pre-Flight section requiring grep verification of data field names before writing tooltip callbacks |
| `.claude/agents/frontend.md` | 1.1.2 | 1.2.0 | Added Chart.js Tooltip Positioning Rule requiring getBoundingClientRect() offset for external tooltip callbacks |
| `.claude/agents/pm.md` | 1.1.0 | 1.1.1 | Added visual type qualifier rule requiring PM to describe CSS state changes as fill/border/text, not CSS class names alone |
| `.claude/agents/auditor.md` | 1.0.3 | 1.0.4 | Added Manual Test Trace Enforcement gate: AUDIT_FAIL if packet omits MANUAL TEST TRACE scenarios required by success criteria |
| `.claude/agents/orchestrator.md` | 1.1.0 | 1.1.1 | Added auditor subagent usage-policy block escalation procedure prohibiting ORC self-audit |
