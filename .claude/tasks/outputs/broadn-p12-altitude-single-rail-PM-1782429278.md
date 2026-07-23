<task_decomposition task_id="broadn-p12-altitude-single-rail" agent_count="1">

<task_packets>

<task_packet>
  <task_id>broadn-p12-FE-001</task_id>
  <assigned_to>frontend</assigned_to>
  <priority>NORMAL</priority>
  <description>
Implement the altitude single-rail redesign per docs/ALTITUDE-DESIGN-SCOPING.md, items 1–6 of the §5 work breakdown. The scoping doc is the contract — follow §4 (target IA), §5 (work breakdown), §6 (risks/out-of-scope), and §7 (verification checklist) VERBATIM. Do not re-decide any design point; D1-a is confirmed (STORY items scroll within one continuous narrative pane; EXPLORE items swap the content pane to single-view tool mode). This is FE-only across exactly two files: index.html (markup) + assets/app.js (state machine + handlers).

The six in-scope changes (each cite by file:line — already verified firsthand in the scoping doc; do not re-derive from defaults):

1. RAIL MARKUP (index.html, rail #slice-sidebar ~133–210): Add a STORY group header with 4 items — Overview, Geography, Pipeline, Data Management — ABOVE the existing EXPLORE group. STORY items are `data-section` links (reuse the existing list/aria patterns already in the rail). Add an "Explorer" item to the EXPLORE group (today Explorer has no rail item and always shows).

2. TOP-NAV REMOVAL (index.html, nav 21–37; the 5 section anchor links live at index.html:30–34): Remove the 5 `data-section` anchor links from the top nav. KEEP the logo, brand, and tagline. The result is a brand-only top bar.

3. PANE-MODE IN renderView() (assets/app.js, renderView at 3855+): Introduce an explicit pane mode — `story` (narrative scroll) vs `tool` (slice view OR explorer) — as a SINGLE source of truth inside the existing renderView() state machine. renderView() ALREADY hides #global-charts-area at assets/app.js:3917 when a slice is active — extend that authority, do NOT add a second show/hide function. Gate #global-charts-area (index.html:520–807), #slice-view-container, and #explorer (index.html:810–872) so EXACTLY ONE pane is visible per state. #explorer currently sits OUTSIDE #global-charts-area and leaks into every state — it must now hide in story and slice modes and show ONLY when its rail item is active. Keep the existing `cat===null` default path intact (per §6 risk row 1).

4. RAIL CLICK HANDLERS (assets/app.js): STORY items drive story mode + scroll-to the target section (D1-a; reuse the slice-view scrollIntoView pattern at assets/app.js:4013). The "Explorer" item drives explorer mode. Existing slice-category handlers (Project/Location/Lab Group) are UNCHANGED — wire the new handlers alongside them. Trace every call site of renderView() and the new mode switch before editing (state-machine call-graph discipline) and confirm each path sets the mode explicitly.

5. SCROLL-SPY REUSE (assets/app.js:1803–1811): Repoint the existing IntersectionObserver to set the active/aria-current state on the active rail STORY item instead of the now-removed top-nav links. The observer must be active ONLY in story mode (disable it in tool mode; set aria-current explicitly on tool-mode items per §6 risk row 3). Do NOT build a new observer — reuse the existing one.

6. MOBILE/COLLAPSE PARITY (assets/app.js:4333–4343 drawer; 4493–4499 desktop collapse): Confirm the mobile drawer now carries BOTH the STORY and EXPLORE groups and that selecting ANY item closes the drawer and returns focus. Reuse the existing close/overlay handlers — do NOT rebuild the drawer or the collapse logic.

Default landing stays "All BROADN Samples" → narrative pane (hero + 4 story sections as a scroll), so first-paint is unchanged (§4).
  </description>
  <success_criteria>
ALL of the following must hold. Mechanical checks are g-rep/inspection; the browser-verification block is run by the auditor.

MECHANICAL (greppable / static):
- M1 (orphaned-consumer sweep): `grep -rn 'data-section' index.html assets/app.js` — enumerate every `data-section` reference. Each value must map to (a) an existing rail STORY item AND (b) an existing target section id in index.html. ZERO references may point to a removed top-nav link or a non-existent section. List the enumeration in the completion packet.
- M2 (top-nav removed, brand kept): the 5 section anchor links formerly at index.html:30–34 are gone; logo + brand + tagline remain present in the nav (21–37). Show the before/after nav block in the packet.
- M3 (single state authority / DRY): no second show/hide function is introduced; the pane mode is a single switch inside renderView(). Confirm no parallel nav system was built (drawer/collapse/scroll-spy are reused, not duplicated). Quote the mode-switch block.
- M4 (Explorer gated): #explorer no longer renders unconditionally; grep/inspect shows its visibility is controlled by the renderView pane mode and it is hidden unless explorer mode is active.
- M5 (inline-style vs Tailwind conflict sweep): on the three gated panes (#global-charts-area, #slice-view-container, #explorer) run `grep -n 'style=' index.html` for those elements — confirm NO inline `style="display:…/overflow:…/visibility:…"` overrides the Tailwind class used for pane gating (the p10 inline-overrode-Tailwind regression). Report the result for each of the three elements.
- M6 (FE does NOT commit): the FE agent must NOT run `git commit`. Leave the working tree dirty. The durability commit is commit-packet's job AFTER audit PASS.

BROWSER-VERIFICATION (auditor: serve via `python3 -m http.server`, drive with Playwright, HARD-RELOAD / cache-bust on first render to defeat stale cache — p10/p11 regression masking). Walk the §7 checklist verbatim:
- B1: Land on default → "All BROADN Samples" selected, story scroll intact (hero + all 4 narrative sections present as one continuous scroll).
- B2: Each STORY rail item (Overview, Geography, Pipeline, Data Management) scrolls to its section AND highlights as active (aria-current) via the repointed scroll-spy.
- B3: Each slice category (Project, Location, Lab Group) renders a slice view; chart tooltips work.
- B4: The Explorer rail item shows the Explorer table with filters AND a working Request button; Explorer is NOT visible in any other state.
- B5: Returning to "All BROADN Samples" resets to story mode (scroll narrative restored).
- B6: The mobile drawer drives ALL of the above; selecting any item closes the drawer and focus returns (no focus trap).
- B7: ZERO console errors across the full walk (verified after cache-bust).
  </success_criteria>
  <context_files>
docs/ALTITUDE-DESIGN-SCOPING.md — THE CONTRACT. Follow §4 (IA), §5 (items 1–6), §6 (risks + out-of-scope), §7 (checklist) verbatim. D1-a confirmed.
DESIGN.md (project root, v2.0.0) — BROADN teal visual-token source of truth. No NEW tokens are introduced this sprint; any color/typography on new rail markup MUST trace to an existing DESIGN.md token (BROADN teal). design_system_source = DESIGN_MD.
index.html — nav 21–37 (top-nav, 5 links at 30–34 to remove); rail #slice-sidebar ~133–210 (add STORY group + Explorer item); #global-charts-area 520–807 (story pane wrapping Overview/Geography/Pipeline/Data Management); #explorer 810–872 (currently leaks, must gate).
assets/app.js — renderView() at 3855 (single state machine; already hides #global-charts-area at 3917); scroll-spy IntersectionObserver 1803–1811 (repoint to rail STORY items); slice-view scrollIntoView 4013 (reuse for STORY scroll-to); mobile drawer 4333–4343 (reuse); desktop collapse 4493–4499 (reuse).
  </context_files>
  <dependencies>NONE (single packet; first and only task to touch index.html + assets/app.js this sprint).</dependencies>
  <out_of_scope>
EXPLICITLY OUT OF SCOPE — do NOT touch any of:
- §5 item 7 (hash routing / #overview #explorer deep links) — DEFERRED this sprint (optional nice-to-have per §5; see risk_flags).
- The `?design` designer mode + layout-overrides layer (§2, §6).
- data/*.json, the preprocess pipeline, scripts/ — no data regeneration.
- The slice-widget / layout-override system (§6).
- Chart internals (Chart.js config, palettes, SAMPLE_TYPE_COLORS).
- The CPER bespoke page (already data-unreachable, §6).
- Any BE, DS, or designer-mode work — FE-only.
- No build step / framework introduction; keep the no-framework, plain `<script src>` model (DESIGN.md constitution).
- No NEW visual tokens (colors/typography/spacing) — reuse DESIGN.md v2.0.0 only.
- Do NOT rebuild the mobile drawer, desktop collapse, or the IntersectionObserver scroll-spy — REUSE the existing machinery (DRY).
- Do NOT run `git commit` (see M6).
  </out_of_scope>
  <estimated_new_lines>
~110 net new (rail STORY group + Explorer item ≈ +30 markup; top-nav removal ≈ −5; renderView pane-mode switch ≈ +35; STORY/Explorer click handlers ≈ +30; scroll-spy repoint ≈ +12 in-place; drawer/collapse parity ≈ +5).

JUSTIFICATION for keeping whole despite >100 lines: this is a single load-bearing state-machine refactor (renderView is THE show/hide authority, §6 risk row 1). The markup (rail items / removed top-nav), the pane-mode switch, the click handlers, and the scroll-spy repoint are mutually dependent — there is NO working, independently-auditable intermediate state. A markup-only split would leave the nav broken (top-nav removed, rail items inert, scroll-spy pointing at removed elements) and could not pass the gate functionally. Per the state-machine call-graph rule, one owner must edit renderView and all its call sites in a single coherent change. Splitting raises regression risk more than it reduces packet size.
  </estimated_new_lines>
  <output_expected>
    <tag>ui_packet</tag>
    <must_contain>
      <item>M1 data-section enumeration table (every reference → rail item + target section)</item>
      <item>The renderView pane-mode switch block (proving single source of truth, story vs tool)</item>
      <item>Before/after of the top-nav block showing the 5 links removed and brand/logo/tagline kept</item>
      <item>M5 inline-style sweep result for each of #global-charts-area, #slice-view-container, #explorer</item>
      <item>Statement of design_system_source = DESIGN_MD and confirmation no new tokens added</item>
      <item>Explicit statement that the agent did NOT run git commit (working tree left dirty)</item>
    </must_contain>
    <must_not_contain>
      <item>Any new color/typography/spacing token or raw hex not traceable to DESIGN.md v2.0.0</item>
      <item>A second/parallel show-hide function, drawer, collapse, or scroll-spy implementation</item>
      <item>Changes to data/*.json, scripts/, chart internals, the ?design mode, or the CPER page</item>
      <item>Any git commit / push by the FE agent</item>
      <item>Hash-routing implementation (item 7, deferred)</item>
    </must_not_contain>
    <success_signal>Static serve (`python3 -m http.server`) + Playwright walk of B1–B7 passes with zero console errors after cache-bust; M1–M6 mechanical checks all reported.</success_signal>
  </output_expected>
</task_packet>

</task_packets>

<dependency_order>
broadn-p12-FE-001 (single task; no intra-sprint dependencies)
→ audit gate (audit-pipeline: SA standards + QA functional via python3 -m http.server + Playwright with cache-bust + SX) MUST PASS
→ REQVAL (map §7 checklist + M1–M6 to delivered artifacts)
→ commit-packet (the ONE durability commit, §7; FE never self-commits)
→ Archivist
</dependency_order>

<routing_notes>
UI-SPEC DECISION (PM call, justified): NO separate UI design-spec packet is created. The scoping doc IS the spec — §4 fixes the target IA, §5 the work breakdown, §7 the verification checklist; DESIGN.md v2.0.0 fixes the visual tokens. No new visual surface is being designed: the work reorganizes existing nav into a single rail using existing list/aria patterns and existing BROADN-teal tokens. A UI Designer packet would add a pipeline hop and latency with zero new design decisions to make. The scoping doc's own §7 sequencing names "UI spec" generically; here that role is already discharged by the committed scoping doc + DESIGN.md.

DESIGN.md CHECK (UI surface): DESIGN.md present at project root (v2.0.0, BROADN teal). Included in FE context_files. FE must set design_system_source = DESIGN_MD and trace any markup tokens to named entries; no new tokens expected this sprint.

PREFLIGHT ACKNOWLEDGMENTS (each item from the brief's checklist):
- AUDIT_RISK: addressed — SC block B1–B7 is a concrete, named browser-verification checklist; the auditor serves via `python3 -m http.server` + Playwright and MUST hard-reload / cache-bust on first render (p10/p11 stale-cache masking). No "visual only" criteria.
- ASSUMPTION: addressed — every codebase fact is cited by file:line from the scoping doc / brief (renderView 3855/3917, scroll-spy 1803–1811, scrollIntoView 4013, drawer 4333–4343, collapse 4493–4499, #explorer 810–872, top-nav 30–34). The packet instructs the FE to trace call sites, not infer from defaults.
- DRY: addressed — M3 + out_of_scope require reuse of renderView, drawer, collapse, and scroll-spy; a second show/hide function or parallel nav is a must_not_contain violation.
- VERBATIM_DELIVERABLE: addressed — the packet points to docs/ALTITUDE-DESIGN-SCOPING.md §4/§5/§6/§7 to follow VERBATIM rather than paraphrasing its rules; §7 checklist is reproduced as the SC walk.

RECURRING-PATTERN PREFLIGHT (§0.5 — most recent post-mortems, §6 protocol-gap tables):
<recurring_pattern source="broadn-teal-rebrand.md">Auditor first live-render served from STALE CACHE masked the p10 transparent-FAB regression; recurred in p11.</recurring_pattern> — AVOIDED: SC B7 + the audit routing note both mandate cache-bust/hard-reload before the Playwright walk.
<recurring_pattern source="broadn-teal-rebrand.md">FE agent self-committed before the audit gate, breaking audit-before-commit.</recurring_pattern> — AVOIDED: M6 + out_of_scope forbid FE git commit; commit-packet owns the single durability commit after audit PASS.
<recurring_pattern source="broadn-teal-rebrand.md">No repo-wide consumer sweep when a sprint removes/renames a shared token/reference broke an out-of-scope consumer.</recurring_pattern> — AVOIDED: M1 requires a repo grep enumerating every `data-section` reference after the top-nav links are removed (orphaned-reference sweep).
<recurring_pattern source="broadn-studio-clarity.md">Auditor cannot run Playwright on vanilla HTML repos (no npm run dev).</recurring_pattern> — AVOIDED: audit routing note specifies the `python3 -m http.server` fallback.
<recurring_pattern source="broadn-studio-clarity.md">No FE pre-flight for inline-style vs Tailwind property overlap (inline overflow silently overrode a Tailwind class).</recurring_pattern> — AVOIDED: M5 requires an inline-style sweep on the three gated panes since this sprint toggles their visibility.
<recurring_pattern source="broadn-studio-clarity.md">Simple single-domain UI sprint shipped with no recoverable PM task stub.</recurring_pattern> — AVOIDED: this decomposition + the .claude/tasks/{id}.md stub provide the recoverable packet.
<recurring_pattern source="broadn-p8-feedback-widget.md">Heredoc/Write overwrite of a multi-section shared doc (task-registry) clobbered prior history.</recurring_pattern> — ACCEPTED-as-handled downstream: no FE shared-doc writes in this packet; commit-packet/ORC must Read-before-Write any multi-section doc (docs/task-registry.md, project_log) — flagged for the durability step, not an FE concern.

APPEND-SERIALIZATION: not applicable — single FE packet writes no shared ledger; docs appends (task-registry, project_log, changelog) are owned by commit-packet/Archivist post-audit and are serial by construction.

SC-LOCKED-VALUE SELF-LINT (§7.5/§7.8): no success criterion greps a locked verbatim copy-string with a forbidden-character constraint, and no SC uses an exact `grep -c` count on a bare struct/field key. M1 and M5 are enumerate-and-verify (list references / report per-element), not off-by-one-prone count assertions. No sc-precheck defect classes apply; report not attached because no locked-value SC exists in this plan.

MOST-RELEVANT CRITICS for this plan: standards (DRY / single-state-authority / no-framework) and the FE-boundary critic (scope drift into ?design, charts, data). The browser-verification load is on the auditor's QA gate.

PRE-CONDITIONS for the Orchestrator to verify before dispatch: (a) D1 is confirmed D1-a (it is — stated in the brief); (b) capture rollback HEAD = 8e9a436 before dispatch (§7); (c) the scoping doc is at the committed version (8e9a436).
</routing_notes>

<verbatim_deliverable_audit>
  <phrase text="altitude redesign per docs/ALTITUDE-DESIGN-SCOPING.md"><addressed task="broadn-p12-FE-001"/></phrase>
  <phrase text="unify to a SINGLE LEFT-RAIL navigation"><addressed task="broadn-p12-FE-001"/></phrase>
  <phrase text="left rail becomes the ONLY navigation"><addressed task="broadn-p12-FE-001"/></phrase>
  <phrase text="two groups: STORY (Overview, Geography, Pipeline, Data Management)"><addressed task="broadn-p12-FE-001"/></phrase>
  <phrase text="EXPLORE (All BROADN Samples, Project, Location, Lab Group, Explorer)"><addressed task="broadn-p12-FE-001"/></phrase>
  <phrase text="top nav drops to brand-only (remove the 5 section anchor links; keep logo/brand/tagline)"><addressed task="broadn-p12-FE-001"/></phrase>
  <phrase text="D1-a: STORY rail items SCROLL within one continuous narrative pane"><addressed task="broadn-p12-FE-001"/></phrase>
  <phrase text="reuse the existing IntersectionObserver scroll-spy to highlight the active STORY rail item"><addressed task="broadn-p12-FE-001"/></phrase>
  <phrase text="EXPLORE items SWAP the content pane to single-view tool mode (slice view OR Explorer table)"><addressed task="broadn-p12-FE-001"/></phrase>
  <phrase text="Explorer is gated behind its own rail item (today it always shows)"><addressed task="broadn-p12-FE-001"/></phrase>
  <phrase text="Default landing stays All BROADN Samples → narrative scroll; first-paint unchanged"><addressed task="broadn-p12-FE-001"/></phrase>
  <phrase text="FE-ONLY"><addressed task="broadn-p12-FE-001"/></phrase>
  <phrase text="One file pair: index.html (rail/nav markup) + assets/app.js (renderView state machine + handlers)"><addressed task="broadn-p12-FE-001"/></phrase>
  <phrase text="NO BE/data/designer-mode/chart-internals changes"><addressed task="broadn-p12-FE-001"/></phrase>
  <phrase text="reuse drawer (4333-4343), collapse (4493-4499), scroll-spy (1803-1811) — do NOT rebuild"><addressed task="broadn-p12-FE-001"/></phrase>
  <phrase text="§5 item 7 hash routing (deep links)"><deferred reason="§5 marks it optional/nice-to-have; brief lists only items implied by §4–§6 IA. Deferred and surfaced in risk_flags for ORC/human ratification."/></phrase>
  <phrase text="decompose into atomic task packets, not re-decide the design"><addressed task="broadn-p12-FE-001"/></phrase>
</verbatim_deliverable_audit>

<risk_flags>
  - RENDERVIEW REGRESSION (High, from §6 row 1): renderView() is the load-bearing state machine; a pane-mode bug breaks all navigation. Mitigation baked into M3 (single switch) + B1–B7 (browser-verify every rail item + back-to-default) + keep the cat===null default path intact. Critic should probe that the mode switch has a single source of truth and the default path is untouched.
  - EXPLORER OVER-GATING (Med, §6 row 2): Explorer was always-on; gating could hide it unexpectedly. Mitigation: M4 + B4 verify it shows ONLY in explorer mode and that table/filters/Request button still work.
  - SCROLL-SPY NO-HIGHLIGHT IN TOOL MODE (Low, §6 row 3): repointing the observer could leave no rail item highlighted in tool mode. Mitigation: SC item 5 requires disabling the observer outside story mode + explicit aria-current on tool-mode items.
  - MOBILE DRAWER SOLE NAV (Med, §6 row 4): drawer is now the only nav; must not trap focus or fail to close. Mitigation: B6 verifies close + focus-return by reusing existing handlers.
  - HASH ROUTING DEFERRED: §5 item 7 (#overview/#explorer deep links) is NOT implemented this sprint. It is human-explicit only in the scoping doc's "optional" framing, not in the brief's key facts. Surfaced here for ORC to confirm the deferral with the human before close; not a blocker.
  - ESTIMATED_NEW_LINES >100 (~110): kept as one packet — justification in the packet's estimated_new_lines block (single inseparable state-machine refactor with no auditable intermediate state). Critic should confirm the no-split rationale rather than force a split that would create a broken intermediate.
  - LOSS OF TOP-NAV IDIOM (Low, §6 row 5): returning users lose a familiar nav. Accepted per the decision; "All BROADN Samples" remains home and brand stays clickable-to-top — confirm brand-to-top still works in B-walk.
</risk_flags>

</task_decomposition>

<expectation_manifest>
  <sprint_id>broadn-p12-altitude-single-rail</sprint_id>
  <generated>2026-06-25T00:00:00Z</generated>
  <assignments>
    <assignment>
      <task_id>broadn-p12-FE-001</task_id>
      <agent>FE#1</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/broadn-p12-FE-001-FE-*.md</expected_file>
      <blocks>NONE (terminal implementation task; audit/REQVAL/commit/archive follow)</blocks>
      <receipt_check>
        <item>M1 data-section enumeration present; zero orphaned references reported</item>
        <item>renderView pane-mode switch quoted; confirmed single source of truth (no second show/hide fn)</item>
        <item>top-nav before/after shows 5 links removed, brand/logo/tagline kept</item>
        <item>M5 inline-style sweep result reported for all three gated panes</item>
        <item>design_system_source = DESIGN_MD; no new tokens / no untraceable hex</item>
        <item>explicit statement FE did NOT git commit (working tree dirty)</item>
        <item>hash routing (item 7) NOT implemented; ?design / charts / data untouched</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>
