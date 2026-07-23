<plan_critique>
  <plan_id>broadn-p12-altitude-single-rail</plan_id>
  <status>PASS</status>

  <challenges>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>broadn-p12-FE-001</task_ref>
      <description>The §4 target IA requires an "EXPLORE" group header, but the existing rail header reads "Slice by" (index.html:136) and the existing items are "All BROADN Samples / Project / Location / Hub / Lab Group" (note "Location / Hub" at index.html:175, not "Location"). Packet item 1 says "add a STORY group header ABOVE the existing EXPLORE group" — but there is no existing EXPLORE group; the packet never instructs renaming "Slice by" → "EXPLORE" nor reconciling the "Location / Hub" label with §4's "Location". No success criterion verifies the two group-header labels exist: M1/M2/M3/M4/M5 check data-section/nav/panes only, and B1–B7 walk items but assert nothing about group-header text. The contract is "follow §4 verbatim," so the rename is in-scope but both under-specified and unverifiable as written.</description>
      <required_revision>Add to item 1 an explicit instruction: rename the existing "Slice by" header (index.html:136) to "EXPLORE" and place the new "STORY" header + 4 items above it, confirming All BROADN Samples / Project / Location / Lab Group / Explorer all sit under EXPLORE. Add an SC asserting both literal group-header strings "STORY" and "EXPLORE" render in the rail. State whether "Location / Hub" stays verbatim or is normalized to "Location" per §4.</required_revision>
    </challenge>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>WARNING</severity>
      <task_ref>broadn-p12-FE-001</task_ref>
      <description>Item 6 says "confirm the drawer now carries both groups and that selecting ANY item closes the drawer and returns focus. Reuse the existing close/overlay handlers — do NOT rebuild," and estimated_new_lines budgets only ~5 lines as "mostly free — drawer already exists." This misstates current behavior: closeMobileDrawer() (app.js:4108) is invoked ONLY by the close button (4338) and the overlay (4343). The existing slice-category selection handlers (e.g. slice-btn-all at 4349) call renderView() but do NOT call closeMobileDrawer(). So today selecting an item does NOT close the drawer. Closing-on-select is NEW wiring that must be added to every selection handler (new STORY items, new Explorer item, AND the existing slice-category buttons), not a "confirm." SC B6 will catch a failure at audit, but the "confirm/mostly-free" framing risks the FE shipping without the wiring and burning a remediation cycle.</description>
      <required_revision>Reword item 6 from "confirm … closes the drawer" to "wire closeMobileDrawer() into every rail selection handler — STORY items, the Explorer item, AND the existing slice-category buttons (slice-btn-all/project/location/labgroup) — because today only the close button and overlay invoke it; selection does not close the drawer." Keep "reuse closeMobileDrawer/closeMobileDrawer's existing focus-return (4119), do not rebuild." Adjust the line estimate accordingly.</required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>broadn-p12-FE-001</task_ref>
      <description>The rail becomes the SOLE navigation, yet no success criterion verifies desktop keyboard operability of the new STORY/Explorer rail items. standards.md (A11Y) mandates that all interactive elements be keyboard-navigable. The existing rail has a roving keyboard handler built around the slice-category buttons (app.js:4140–4189, indexing buttons[]); newly added STORY items / Explorer item may or may not be picked up by that handler depending on markup and selector. B6 covers mobile-drawer keyboard/focus but nothing covers desktop Tab/arrow reachability + Enter activation of the new sole-nav items, and B2 only asserts highlight, not keyboard activation.</description>
      <required_revision>Add an SC (mechanical or browser) asserting the new STORY items and the Explorer item are keyboard-reachable and activatable (Tab to focus, Enter/Space activates, and—if added as buttons—they are included in the existing rail roving-arrow handler at app.js:4140–4189). If STORY items are anchor links (data-section <a>), confirm aria-current is set on the keyboard-active item, consistent with B2.</required_revision>
    </challenge>

  </challenges>

  <no_split_determination>
    CONFIRMED — keep as ONE FE packet; do NOT split. The mandatory 4-file split rule does not
    trigger (2 files: index.html + assets/app.js). The ~110-line estimate exceeds the >100-line
    heuristic, but the PM's no-split rationale is sound and verified against the code: renderView()
    (app.js:3855) is the single show/hide authority; a markup-only intermediate would remove the
    top-nav while the scroll-spy still queries `.nav-link[data-section]` (app.js:1803) — highlighting
    breaks — and would leave new rail items inert (no handlers). There is no functionally auditable
    seam between the markup and the state-machine change; splitting would manufacture a broken
    intermediate that cannot pass the gate. The 50-line commit limit is satisfied procedurally:
    commit-packet commits AFTER audit PASS (the verification gate), and FE does not self-commit (M6).
  </no_split_determination>

  <codebase_fact_verification>
    All cited file:line facts were checked against live code and are ACCURATE:
    - renderView() at app.js:3855; already hides #global-charts-area at app.js:3917 (cat!==null branch)
      and toggles it at 3905 (cat===null). #slice-view-container already toggled (3885/3922). Correct.
    - #explorer (index.html:810) sits OUTSIDE #global-charts-area (which closes at index.html:807),
      both inside #dashboard-body — so it does leak into every state today. renderView() does NOT
      currently gate #explorer at all. Correct.
    - Scroll-spy IntersectionObserver at app.js:1801–1819; navLinks = `.nav-link[data-section]`
      (line 1803) targets the top-nav links; it toggles `.active` class only and does NOT set
      aria-current today (so item 5's aria-current handling is genuinely new, as specified). Correct.
    - Slice scrollIntoView at app.js:4013. Drawer trigger/close/overlay at 4333/4338/4343;
      closeMobileDrawer at 4108 returns focus to trigger (4119). Desktop collapse IIFE at 4490–4509.
    - Top-nav: 5 data-section anchor links at index.html:30–34 (Overview/Geography/Pipeline/
      Data Management/Explorer); brand/logo/tagline at 24–28. M2's "5 links at 30–34" is correct.
    PM did its homework; the ASSUMPTION dimension is otherwise clean.
  </codebase_fact_verification>

  <audit_risk_forecast>
    1. Explorer-mode state representation is the highest live-render risk. Today the only state axis is
       filterState.slice.category (null = story default, non-null = slice). Explorer is a THIRD pane
       with no current representation. If the FE overloads the cat===null path for Explorer it will
       collide with the "All BROADN Samples" default (risk row 1 / B1 / B5). The PM correctly leaves
       the exact representation to the FE; the auditor must verify on the live walk that B1 (default
       story) and B5 (return-to-All resets story) are unaffected by the new explorer mode — i.e. the
       explorer pane is a distinct mode that does not alter the cat===null default branch.
    2. Hash-routing deferral (item 7) is legitimate (human request is silent on deep links; §5 marks
       it optional). One side-effect: after top-nav removal a bookmarked `#explorer` URL will native-
       scroll to a now-hidden #explorer in the default story mode (no-op/confusing). Not a blocker and
       correctly surfaced for human ratification, but worth a one-line note at REQVAL.
    3. Stale-cache masking (p10/p11) is the most likely audit-time false-pass — B7's mandated
       cache-bust/hard-reload must actually be performed, not assumed.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
    Read: docs/after-actions/broadn-teal-rebrand.md (§4–§6: stale-cache masking, FE self-commit,
    repo-wide consumer sweep on shared-reference removal) and docs/post-mortems/broadn-studio-clarity.md
    (§6: python3 -m http.server Playwright fallback; inline-style vs Tailwind property overlap; missing
    task stub). The PM's RECURRING-PATTERN PREFLIGHT enumerates and mitigates all of these (M1 orphan
    sweep, M5 inline-style sweep, M6 no-self-commit, B7 cache-bust, audit-server note). agent-changelog.md
    reviewed — the state-machine call-graph rule (2026-03-27) and inline/Tailwind grep (2026-04-02) are
    both honored by the packet. No prior-fixed issue is re-flagged.
  </post_mortem_patterns_checked>
</plan_critique>
