# Agent Improvement Session: agent-improvement-2026-03-17-1
**Date:** 2026-03-17
**Post-mortems reviewed:** docs/post-mortems/broadn-p2-slice-panel.md
**Gaps addressed:** 4
**Files changed:** 3
**Research tasks spawned:** 0

---

## Gaps Addressed

### 1. PM does not estimate new-line count for FE tasks
**Source:** `docs/post-mortems/broadn-p2-slice-panel.md` — Section 6
**Root cause:** PM wrote FE task packets with no line-count estimate; broadn-p2-004 packed 10+ independent deliverables into one task, exceeding the 50-line ceiling. The Critic caught it; without a thorough Critic pass it would have shipped to an agent and failed audit.
**File changed:** `.claude/agents/pm.md`
**Change:** Added `<estimated_new_lines>` mandatory field to FE task_packet format with >100-line split requirement
**Version:** 1.0.0 → 1.1.0

---

### 2. PM did not carry forward Color Rule A lesson from sprint 1 into sprint 2 brief
**Source:** `docs/post-mortems/broadn-p2-slice-panel.md` — Section 6
**Root cause:** No mechanism existed to propagate prior-sprint SA failures into the next orchestrator brief. The Critic had to re-derive the lesson from the audit log; without it, the p1 fail would have recurred.
**File changed:** `.claude/agents/orchestrator.md`
**Change:** Added `<prior_sprint_gaps>` field to orchestrator_brief template, populated from prior post-mortem Section 6
**Version:** 1.0.1 → 1.1.0

---

### 3. Dataset EDA / column inspection tasks routed to backend-engineer instead of statistician
**Source:** `docs/post-mortems/broadn-p2-slice-panel.md` — Section 6 (updated post-discussion)
**Root cause:** PM conflated "inspect the dataset" (EDA domain → statistician) with "build the pipeline from it" (construction domain → BE). The statistician exists precisely for column inventory, fill rates, and value distribution work against local datasets.
**Files changed:** `.claude/agents/pm.md`, `.claude/agents/orchestrator.md`
**Changes:**
- pm.md: Added explicit EDA → statistician / pipeline → BE routing rule to domain identification step
- orchestrator.md: Added dataset EDA routing row to routing table directing inspection tasks to statistician
**Version:** pm.md 1.0.0 → 1.1.0; orchestrator.md 1.0.1 → 1.1.0

---

### 4. Inline temporal builder repeated 3× in preprocess_data.py — DRY violation not caught pre-submission
**Source:** `docs/post-mortems/broadn-p2-slice-panel.md` — Section 6
**Root cause:** BE task packet cited the DRY rule in standards.md but did not explicitly mandate helper extraction for the temporal builder pattern. The auditor flagged it as a non-blocking style note; the rule needs to be enforced pre-submission.
**File changed:** `.claude/agents/backend.md`
**Change:** Added DRY helper extraction pre-flight check requiring extraction of any repeated pattern before issuing completion_packet
**Version:** 1.1.0 → 1.1.1

---

## Gaps Not Addressed

None — all 4 post-mortem Section 6 gaps were addressed in this session.

---

## Research Conducted

None required — all fixes were direct mechanical changes derivable from the post-mortem.

---

## Next Review Trigger

Improvements are due again after: broadn-p3 (next sprint).
Unresolved gaps to watch: None from this session. Monitor whether `<estimated_new_lines>` actually prevents FE overscoping — if PM still underestimates on p3, the Critic prompt may need a corresponding check.
