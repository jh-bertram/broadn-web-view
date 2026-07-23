# Archive Entry: broadn-p12-altitude-single-rail

**Task ID:** broadn-p12-altitude-single-rail  
**Timestamp:** 2026-06-26T00:35:00Z  
**Event Type:** TASK_COMPLETE  
**Archivist:** AR#1

---

## Archive Entry (XML)

```xml
<archive_entry>
  <timestamp>2026-06-26T00:35:00Z</timestamp>
  <task_id>broadn-p12-altitude-single-rail</task_id>
  <event_type>TASK_COMPLETE</event_type>
  <rationale>Sprint p12 delivered the "altitude" navigation redesign: unification of BROADN dashboard navigation to a single left-rail model. The dashboard previously had two competing navigation idioms (top-nav section links + left-slice-rail) which created UX friction — especially acute on mobile, where both competed for screen real estate and the top nav became unreachable when a slice was active. The single-rail model eliminates this conflict at the root by removing the top nav entirely (keeping only brand/logo) and making the left rail the sole navigation axis. Design decision rationale: the human chose Option 3 (single-rail) over two alternatives rejected in the planning phase: (a) "Finish-the-collapse" (lowest-effort half-measure, leaves dual-nav conflict in place), (b) "Story/Explore tabs" (cleaner than status quo but perpetuates two nav idioms). The single-rail choice removes the conflict entirely and improves mobile by routing everything through the existing drawer instead of cramped inline top nav. Critical sub-decision D1 (resolved during planning): STORY items (Overview, Geography, Pipeline, Data Management) were implemented to **scroll within one continuous narrative pane** rather than each showing as a separate pane. This preserves the layperson on-ramp (the four story sections form a deliberate continuous flow per the complexity review findings) while still honoring the "single rail is the only nav" constraint. EXPLORE items swap the pane to tool mode (slice view or Explorer table), cleanly separating power-user focused tools from the narrative experience. All 13 requirements covered: rail markup (STORY + EXPLORE groups), top nav reduction, pane-mode logic, STORY scroll behavior with scroll-spy repoint, EXPLORE tool modes, Explorer gating, default landing preservation, renderView() single-source-of-truth pane mode, existing nav machinery reuse (drawer, collapse, scroll-spy), mobile drawer focus management, keyboard navigability extended to 9 rail items, FE-only scope, design-token compliance, and hash-routing deferral explicitly tracked. Pipeline: PM (1 FE packet, docs/ALTITUDE-DESIGN-SCOPING.md served as spec) → Critic PASS (3 warnings → PM amendment, SC-level) → assign-agents → FE → audit (SA PASS / SX SECURE, QA FAIL on B6 mobile drawer 0×0 bug) → FE remediation (4-line fix: openMobileDrawer removes wrapper hidden class, closeMobileDrawer restores it) → reaudit PASS (B6 fixed live, desktop B1 unregressed) → REQVAL COVERED (13/13). Commit: 23277f1 (feat(dashboard): unify navigation to a single left-rail (altitude redesign)). Files: index.html + assets/app.js, +285 / -47. Note on B6: a pre-existing CSS bug in the mobile drawer (reproduces at rollback 8e9a436, unrelated to this sprint's work) was elevated to a blocker during audit because removing the top nav left mobile with no other primary navigation path; the bug was fixed in remediation and the fix verified live in reaudit. Note on hash-routing (R-013): deep-link support via hash fragments (#overview, #explorer, etc.) was deferred pending human ratification; this is an open follow-up, not a coverage gap.</rationale>
  <dependencies>
    - Design doc: docs/ALTITUDE-DESIGN-SCOPING.md (Decisions §1–§3, IA §4, Work breakdown §5, Risks §6, Gate §7)
    - Prior sprint (related complexity-review arc): broadn-p11-feedback-widget-teal (2026-06-25T22:22:49Z)
    - PM packet: .claude/agents/tasks/outputs/broadn-p12-altitude-single-rail-PM-*.md
    - Critic approval: .claude/agents/tasks/outputs/broadn-p12-altitude-single-rail-CR-*.md
    - FE output: .claude/agents/tasks/outputs/broadn-p12-FE-001-FE-*.md
    - FE remediation: .claude/agents/tasks/outputs/broadn-p12-FE-001-rem-FE-*.md
    - Initial audit (QA FAIL B6): .claude/agents/tasks/outputs/broadn-p12-FE-001-AUD-1782429581.md
    - Re-audit (PASS): .claude/agents/tasks/outputs/broadn-p12-FE-001-reaudit-AUD-1782429581.md
    - REQVAL coverage: .claude/agents/tasks/outputs/broadn-p12-altitude-single-rail-REQVAL-1782430800.md (13/13 COVERED)
  </dependencies>
  <retention_keys>
    - Commit: 23277f1 (feat(dashboard): unify navigation to a single left-rail (altitude redesign)); verified via git log --format=%B HEAD contains task: broadn-p12-altitude-single-rail trailer
    - Files modified: index.html (rail markup: STORY + EXPLORE groups, 4 story items, 5 explore items + new Explorer item; top nav reduced to brand-only), assets/app.js (renderView pane-mode switch: story/tool/explorer; rail click handlers for STORY scroll-to + EXPLORE tool-mode swap; scroll-spy repoint to rail STORY items; roving keyboard array extended to 9 items; mobile drawer close guard on all handlers; B6 remediation: wrapper hidden-class toggle in openMobileDrawer/closeMobileDrawer)
    - Diff: +285 / -47
    - Default landing: "All BROADN Samples" selected → narrative scroll (hero + 4 story sections); first-paint behavior unchanged
    - Rail structure: STORY group (Overview, Geography, Pipeline, Data Management) → scroll-to within narrative pane with scroll-spy aria-current highlight; EXPLORE group (All BROADN Samples, Project, Location/Hub, Lab Group, Explorer) → swap to tool-mode pane (narrative, slice view, or explorer table)
    - renderView() pane modes: (1) story — hero + narrative charts visible, slice/explorer hidden; (2) tool — hero hidden, either slice-view OR explorer-table visible (single tool pane); (3) explorer (part of tool mode) — explorer table visible with filters and 100 Request buttons, story/slice hidden
    - Explorer visibility: now gated behind its own rail item; was always-on below active slice in prior implementation; now hidden in story/slice modes
    - Scroll-spy: repointed IntersectionObserver from removed top-nav links to rail STORY items; highlights active section with aria-current=page; disabled outside story mode
    - Mobile/collapse parity: drawer carries both STORY + EXPLORE groups; selecting any item closes drawer and returns focus to trigger (handled by guarded closeMobileDrawer call in all 9 handlers)
    - Keyboard navigability: roving keyboard array getCategoryButtons() extended from 5 (prior slice categories) to 9 items (STORY 0-3, EXPLORE 4-8); Enter activates; Tab/arrow navigation wraps
    - B6 bug (pre-existing, elevated to blocker): #slice-sidebar-wrapper starts hidden via CSS (hidden lg:flex) for mobile; on mobile, only JS can toggle it, but openMobileDrawer was not doing so. Mobile drawer trigger was visible but tapping it left sidebar at display:none, resulting in 0×0 drawer. Reproduces at rollback 8e9a436, unrelated to p12 scope. Fixed by: openMobileDrawer adds `if (wrapper) wrapper.classList.remove('hidden');` (app.js:4197), closeMobileDrawer adds `if (wrapper) wrapper.classList.add('hidden');` (app.js:4218). Desktop unaffected because lg:flex rule always wins over the hidden class at ≥lg breakpoint.
    - Audit result: SA PASS (no new tokens, DRY wiring intact), SX SECURE (no new input surface), QA FAIL on B6 (initial audit), then PASS after remediation (reaudit confirmed: B6 drawer opens 288×844 on mobile 390px, both groups visible, all items tappable, focus returned; B1 desktop regression check PASS)
    - REQVAL status: COVERED (13/13 requirements verified live by auditor via Playwright + static SA checks)
    - Deferred follow-up (not a gap): §5 item 7 (hash-routing deep links) — allows shareable #overview/#explorer links driving rail selection. Explicitly deferred pending human ratification; not dropped silently.
    - Agent performance: PM first-pass (critical decision points clear), Critic first-pass (3 SC-level warnings → amendment), FE first-pass (except for pre-existing B6 bug detection in audit), Auditor first-pass (B6 elevation appropriate; bug fix trivial), reaudit first-pass
    - Memory anchor: complexity-review flagged "dual nav conflict" as driving UX cost; p12 resolves at the root rather than patching symptoms
  </retention_keys>
</archive_entry>
```

---

## Summary of Logged Work

**What shipped:** Single left-rail navigation model for the BROADN web-view dashboard, resolving the dual-navigation UX conflict identified in the complexity review.

**Key architectural decisions:**
1. Single-rail chosen over "finish-the-collapse" and "Story/Explore tabs" alternatives — eliminates conflict at the root.
2. D1-a (continuous story scroll) selected over D1-b (strict single-pane) — preserves layperson narrative on-ramp while honoring single-rail constraint.

**Files changed:**
- `index.html` — rail markup with STORY and EXPLORE groups; top nav reduced to brand-only
- `assets/app.js` — renderView pane-mode logic (story/tool/explorer); rail click handlers; scroll-spy repoint; roving keyboard extended to 9 items; mobile drawer B6 fix

**Pipeline summary:**
- PM (1 FE packet, docs/ALTITUDE-DESIGN-SCOPING.md as spec)
- Critic: PASS (3 SC-level warnings → amendment)
- FE implementation
- Audit: QA FAIL on pre-existing B6 mobile drawer bug (0×0 bug)
- Remediation: 4-line fix to openMobileDrawer/closeMobileDrawer
- Reaudit: PASS (all gates)
- REQVAL: COVERED (13/13)

**Notable findings:**
- B6 bug was pre-existing (reproduces at rollback 8e9a436) but elevated to blocker because removing the top nav left mobile with no primary navigation.
- Hash-routing deep links deferred pending human ratification — open follow-up, not a coverage gap.

**Commit:** 23277f1 (feat(dashboard): unify navigation to a single left-rail (altitude redesign))

---

## Archivist Checkpoint

This entry has been appended to `/home/jhber/projects/broadn-web-view/docs/project_log.md` in append-only order (newest entry at file tail). All design decisions, rationale for choice of model, and technical retention keys have been recorded for session recovery.
