<requirements_coverage_report>
  <task_id>broadn-p12-altitude-single-rail</task_id>
  <generated>2026-06-26T00:20:00Z</generated>
  <overall_status>COVERED</overall_status>
  <execution_mode>ORC-direct Mode A inline — single FE packet, requirements mechanically derivable from the committed scoping doc §4/§5 + amendment SCs; all runtime criteria verified live by AUD#1 (audit + reaudit), stronger than static evidence.</execution_mode>

  <coverage>
    <item id="R-001" status="COVERED">
      <requirement>Unify navigation to a single left rail with two groups — STORY (Overview, Geography, Pipeline, Data Management) and EXPLORE (All BROADN Samples, Project, Location/Hub, Lab Group, Explorer). (§4 IA; §5 item 1)</requirement>
      <evidence>index.html rail #slice-sidebar — STORY group header (131) + 4 story-btn items; EXPLORE group (renamed from "Slice by") with All/Project/Location-Hub/LabGroup + new Explorer item. FE packet M1/M7; AUD QA B-walk confirmed both groups render (desktop + mobile reaudit).</evidence>
    </item>
    <item id="R-002" status="COVERED">
      <requirement>Top nav drops to brand-only — remove the 5 section anchor links; keep logo/brand/tagline. (§5 item 2)</requirement>
      <evidence>FE packet M2 before/after (5 nav-link anchors removed; logo+brand+tagline kept). SA PASS M1 sweep: zero orphaned data-section refs to removed top-nav links.</evidence>
    </item>
    <item id="R-003" status="COVERED">
      <requirement>D1-a: STORY rail items scroll within one continuous narrative pane; scroll-spy highlights the active STORY item (aria-current). (§5 items 4-5)</requirement>
      <evidence>AUD QA B2 (live): each STORY item scrolls to its section AND sets aria-current=page via the repointed IntersectionObserver. app.js scroll-spy repointed in place to .story-rail-btn (SA PASS — not duplicated).</evidence>
    </item>
    <item id="R-004" status="COVERED">
      <requirement>EXPLORE items swap the content pane to single-view tool mode (slice view OR Explorer table). (§5 items 3-4)</requirement>
      <evidence>AUD QA B3 (slice views render, tooltips work) + B4 (Explorer pane). renderView() pane-mode switch (story/tool/explorer) — FE packet M3.</evidence>
    </item>
    <item id="R-005" status="COVERED">
      <requirement>Explorer gated behind its own rail item (was always-on); not visible in any other state. (§5 items 1,3)</requirement>
      <evidence>FE packet M4 (#explorer starts hidden, shown only in explorer pane mode). AUD QA B4 (Explorer table + filters + 100 Request buttons present only in explorer mode) + B9 (distinct third state, does not collide with cat===null default).</evidence>
    </item>
    <item id="R-006" status="COVERED">
      <requirement>Default landing stays "All BROADN Samples" → narrative scroll; first-paint unchanged. (§4)</requirement>
      <evidence>AUD QA B1 (default land → All active, story scroll intact) + B5 (return-to-All restores story). cat===null default branch byte-functionally intact (SA PASS M3).</evidence>
    </item>
    <item id="R-007" status="COVERED">
      <requirement>Pane mode is a single source of truth inside the existing renderView() state machine — no second show/hide function. (§5 item 3; DRY)</requirement>
      <evidence>SA PASS: single pane-mode switch in renderView() (explorer early-return above intact cat===null branch); FE packet M3 quotes the switch.</evidence>
    </item>
    <item id="R-008" status="COVERED">
      <requirement>Reuse existing drawer, collapse, and scroll-spy — no parallel nav system (DRY). (§6; brief constraint)</requirement>
      <evidence>SA PASS: grep -c 'function closeMobileDrawer' == 1 (reused); scroll-spy repointed in place; drawer/collapse reused. FE packet M3/M8.</evidence>
    </item>
    <item id="R-009" status="COVERED">
      <requirement>Mobile drawer drives all nav; selecting any item closes the drawer and returns focus; no focus trap. (§5 item 6; amendment M8/B6)</requirement>
      <evidence>AUD reaudit QA B6 (live, 390px): drawer opens (288×844) after B6 fix (openMobileDrawer un-hides #slice-sidebar-wrapper / closeMobileDrawer restores it, app.js:4197/4218); both groups render; selecting an item closes drawer + focus returns to trigger. FE packet M8 (all 9 selection handlers → guarded closeMobileDrawer).</evidence>
    </item>
    <item id="R-010" status="COVERED">
      <requirement>Desktop keyboard navigability of the new sole-nav rail items (Tab/arrow reach + Enter activate; aria-current). (amendment M9/B8; standards.md A11Y)</requirement>
      <evidence>AUD QA B8 (live): roving keyboard wraps across all 9 buttons + Enter activates. FE packet M9: getCategoryButtons() extended to 9 items (STORY 0-3, EXPLORE 4-8); listIds extended.</evidence>
    </item>
    <item id="R-011" status="COVERED">
      <requirement>FE-only across exactly two files (index.html + assets/app.js); no BE/data/scripts/chart-internals/?design/CPER changes. (brief constraint; §6 out-of-scope)</requirement>
      <evidence>SA PASS scope check: git status shows only index.html + assets/app.js modified; data/*.json, scripts/, chart internals, ?design mode, CPER page untouched.</evidence>
    </item>
    <item id="R-012" status="COVERED">
      <requirement>No new visual tokens; markup colors/typography trace to DESIGN.md v2.0.0 (BROADN teal). (brief constraint)</requirement>
      <evidence>FE packet design_tokens_used: design_system_source = DESIGN_MD; active rail style #0c5454 on #f0fdfd (WCAG AA ~9.1:1), reused tokens only. SA PASS: hex traces to DESIGN.md.</evidence>
    </item>
    <item id="R-013" status="COVERED">
      <requirement>Constraint: §5 item 7 (hash routing / deep links) is DEFERRED, not silently dropped.</requirement>
      <evidence>Explicitly deferred in PM packet out_of_scope + verbatim_deliverable_audit + risk_flags; FE confirmed not implemented (packet must_not_contain). Surfaced to ORC/human for ratification at close (open follow-up, not a gap).</evidence>
    </item>
  </coverage>

  <summary>
    <covered_count>13</covered_count>
    <partial_count>0</partial_count>
    <missing_count>0</missing_count>
  </summary>

  <requires_human_visual>false</requires_human_visual>

  <notes>
    All runtime criteria (B1-B9) were verified LIVE by AUD#1 via python3 -m http.server + Playwright (cache-busted) across the initial audit (desktop B1-B5,B7-B9) and the reaudit (mobile B6 + desktop regression spot-check) — this is stronger evidence than a static Playwright spec read, so no REQUIRES_HUMAN_VISUAL flags are needed. A Step 4.5 human browser confirmation is still recommended per the FE-sprint policy (visual/subjective sign-off).
    One open follow-up (not a coverage gap): hash-routing deferral (R-013) awaits human ratification at close.
    B6 was a pre-existing mobile-drawer CSS bug (reproduces at rollback 8e9a436) elevated to a blocker because this sprint removed the only prior mobile nav; fixed in remediation and reaudited PASS.
  </notes>
</requirements_coverage_report>
