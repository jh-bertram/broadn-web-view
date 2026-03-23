# SESSION-CHECKPOINT
**Written:** 2026-03-22
**Project:** broadn-web-view (`/home/jhber/projects/broadn-web-view/`)
**Session closed after:** post-mortem + agent-improvement complete; all sprint artifacts logged

---

## Current State

The broadn-p1-dashboard-enhancements sprint is **fully closed and verified**. All 7 feature areas shipped, 3 post-delivery bugs fixed (vfix-001), 6 agent improvements applied.

**The app is at a clean baseline.** Open `index.html` directly in a browser — no dev server needed.

---

## What Shipped (broadn-p1)

All changes are in `/home/jhber/projects/broadn-web-view/index.html` and `scripts/preprocess_data.py`:

| Feature | Status | Key location |
|---------|--------|-------------|
| Orange accent tokens (CSS + JS) | DONE | `:root` lines 19-20; `CHART_COLORS.orangeAccent` |
| Active slice panel: full `bg-orange-50` background | DONE | `updateGroupItemSelection()` line ~1883 |
| Replicate tag badges (display only) | DONE | `renderReplicateBadges()` line ~1026 |
| Sampler-type doughnut charts | DONE | `renderSamplerTypeChart()` line ~681 |
| Temporal axis: "Mar '20" + autoSkip disabled | DONE | `formatMonth()` line 652; both temporal configs |
| Map ↔ bySite bar cross-link (bidirectional toggle) | DONE | `highlightSite()` / `clearSiteHighlight()` line ~996 |
| Custom HTML tooltips on donut + pipeline charts | DONE | `#custom-tooltip` div; external callbacks in `renderDonutChart()` / `renderPipelineChart()` |

---

## Data Contract (Critical for Next Sprint)

`data/data.json` slice_views.project entries:
```json
{
  "project_id": "IMPROVE Fungi",   // display name — NOT "name"
  "sample_count": 123,
  "sample_types": [...],
  "pipeline": { "collected": N, "dna_extracted": N, "sequenced": N },
  "temporal": [...],
  "sampler_type_dist": [{"sampler": "...", "count": N}, ...],
  "replicate_tags": ["tag1", "tag2", ...]
}
```

**No `.name` field.** The correct display identifier is `.project_id`.

---

## Next Sprint Scope (not yet decomposed)

Two items deferred from broadn-p1:

### 1. Tooltip complementary data (BE + FE)
Currently: donut and pipeline tooltips both show "which projects have this type" (same breakdown).
Human wants: donut hover → show pipeline stage breakdown for that sample type; pipeline hover → show sample type breakdown for that stage.
**Blocker:** `preprocess_data.py` has no cross-tabulation data. `data.json` has no per-type pipeline breakdown or per-stage type breakdown.
**Required:** BE task to extend `preprocess_data.py` with cross-tab helpers + data contract update + FE task to rewire both tooltip callbacks.

### 2. Replicate badge functionality adjustments
Human noted badges appear but wants to adjust functionality. Scope not yet defined — ask user what changes they want before decomposing.

---

## Files to Read First in New Session

To get up to speed instantly, read these in order:

1. **This file** — current state and next sprint scope
2. **`docs/project_log.md`** — authoritative event timeline (last 20 lines = most recent completions)
3. **`docs/post-mortems/broadn-p1-dashboard-enhancements.md`** — what went wrong last sprint and why (Section 7 = final state; Section 6 = protocol gaps now fixed)
4. **`docs/agent-changelog.md`** — last entry = `agent-improvement-2026-03-22-1` (all 6 gaps addressed)
5. **`index.html`** (lines 1-100 for tokens/CSS, then Ctrl+F for the function you're touching)

**Skip:** individual audit logs, archivist entries, FE/BE output packets — all captured in project_log.md.

---

## Active Protocol Version

| Agent | Version | Key change in last session |
|-------|---------|---------------------------|
| frontend.md | 1.2.0 | Task boundary compliance; data-contract pre-flight; getBoundingClientRect tooltip rule |
| pm.md | 1.1.1 | Visual type qualifier for CSS state descriptions |
| auditor.md | 1.0.4 | MANUAL TEST TRACE enforcement gate |
| orchestrator.md | 1.1.1 | Auditor subagent policy-block escalation |

---

## Rollback Point

Commit at sprint start: `cfb589b87dc57b98bc4a52a6a16caf4d267928f7`
Current state: all broadn-p1 changes committed on top of that.
To see what changed: `git diff cfb589b HEAD -- index.html`
