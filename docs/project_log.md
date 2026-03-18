# BROADN Web-View Project Log

## Archive Entries

<archive_entry>
  <timestamp>2026-03-17T00:45:00Z</timestamp>
  <task_id>broadn-p1-web-view</task_id>
  <event_type>TASK_COMPLETE</event_type>
  <rationale>Sprint 1 complete: delivered data preprocessing pipeline and static web dashboard for BROADN Aerobiome research team. Two independent tasks executed in parallel, both passed all audit gates (SA/QA/SX). Backend task established data aggregation from xlsx source with site metadata. Frontend task built 7-visualization dashboard on static HTML+CDN stack, intentionally avoiding build system complexity for research team maintainability. One remediation cycle on FE task (CSS color rule compliance) resolved and re-audited successfully.</rationale>
  <dependencies>
    - No prior sprint dependencies; foundational work for BROADN Web-View project
    - Blocks: FE enhancements, data schema refinements, any downstream analytics
  </dependencies>
  <retention_keys>
    - Site code source: BROADN ID chars [1:3], not Originating Location column
    - Sequencing: filename-string based (4 columns: 16s, ITS, 18s, MetaGenome), not boolean
    - Pipeline counts: collected=4571, dna_extracted=3243, sequenced=1475 (logical order holds)
    - Unknown sites: 97 samples → 5 codes (IX, AX, PX, BX, XX)
    - GRSM coordinates anomaly: ~37.461/-111.593 in xlsx (Utah/Arizona, not TN/NC); flagged, data preserved as-is
    - FE tech: static HTML+CDN (Tailwind, Chart.js, Leaflet), no build system, Vanilla JS only
    - CSS color rules: :root custom properties for all HTML CSS rules, Chart.js CHART_COLORS hex permitted (Rule A)
    - Recent samples cap: 100 most recent field samples in table
    - Map threshold: skip null lat/lon sites
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-17T04:15:00Z</timestamp>
  <task_id>broadn-p2-001</task_id>
  <event_type>TASK_COMPLETE</event_type>
  <rationale>Data discovery task (Sprint 2 preparation): built and executed column inventory inspection script to answer five critical data structure questions blocking location/time stratification features. Executed against baseline dataset (8079 rows × 51 columns, 4571 field samples). All five inventory items queried and reported with quantitative backing. Key finding: Collection Height column does not exist in dataset—feature must be omitted from Sprint 2. Collection Time column exists with 19.1% fill rate (threshold 10%), qualifies for inclusion. Lab Group (Project Lead) at 99.8% fill—safe to use. Location grouping confirmed to use string column, not BROADN ID extraction. All findings passed three-gate audit (SA/QA/SX). MEDIUM advisory on hardcoded path non-blocking for one-shot inspection script.</rationale>
  <dependencies>
    - Depends on: broadn-p1-web-view (established dataset structure and baseline 4571 field sample count)
    - Unblocks: broadn-p2-002, broadn-p2-003 (all stratified location/project/time features in Sprint 2 wave)
  </dependencies>
  <retention_keys>
    - Lab Group column: 'Project Lead' — 99.8% fill (4563/4571), 8 unique PI surnames (Fierer 1679, Kreidenweis 1263, Trivedi 1102, Farmer 304, Borlee 121, Stewart 76, Magzamen 13, Hancock 5)
    - Collection Height: NOT FOUND — no column in xlsx matches height/alt/elevation/level/tier keywords; omit height_distribution from location entries
    - Collection Time: 'Sample Collected Time' — 19.1% fill (872/4571), 247 unique HH:MM 24-hour times (00:00–22:54); Secondary: 'Sample Replicate' contains AM/PM labels as replicate ID (A/B for morning/evening sampler), not standalone time column
    - Project ID: 29 unique projects (field samples); top 3: IMPROVE Fungi (1056), Fragmented Landscape (623), Fall Plant Circle (384)
    - Location/Site pairs: 29 unique (Location, Specific Site) combinations; top 3: SGRC/Environment (1313), SGRC/East (744), Other/Carolinas (623); Location grouping uses string column 'Sample Collection Location' directly
    - Script location: docs/analysis/inspect_bdb_extended.py (read-only execution, no modifications to xlsx or preprocessing)
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-17T23:40:00Z</timestamp>
  <task_id>broadn-p2-002</task_id>
  <event_type>TASK_COMPLETE</event_type>
  <rationale>Sprint 2 aggregation task: extended preprocess_data.py with three new builder functions to emit slice_views top-level key containing stratified data summaries. Added slice_views.project (20 entries capped, keyed by Project ID), slice_views.location (10 entries keyed by Sample Collection Location string), and slice_views.lab_group (8 entries keyed by Project Lead). Each entry contains sample_count, sample_types array, pipeline counts, and temporal histograms; location entries additionally include site metadata and time_distribution (conditionally, where time data exists). All audit gates passed (SA/QA/SX); one non-blocking STYLE advisory on DRY opportunity (temporal-building pattern could call existing build_temporal() instead of inlining 3 times). Data output grew from 25.6 KB to 67.2 KB; all 8 existing top-level keys preserved unchanged. Height distribution intentionally omitted per broadn-p2-001 finding that Collection Height column does not exist in source data.</rationale>
  <dependencies>
    - Depends on: broadn-p2-001 (column inventory confirmed Lab Group='Project Lead' [99.8% fill], Location='Sample Collection Location' string, Time='Sample Collected Time' [19.1% fill], and absence of height column)
    - Unblocks: broadn-p2-003 (FE components to render slice_views panels), any downstream analytics keyed to project/location/lab-group dimensions
  </dependencies>
  <retention_keys>
    - Builder pattern: filter field_samples → group by column → apply sample_count, sample_types, pipeline, temporal → sort by count descending → emit to slice_views[key]
    - Lab Group source: 'Project Lead' (8 unique PIs: Fierer 1679, Kreidenweis 1263, Trivedi 1102, Farmer 304, Borlee 121, Stewart 76, Magzamen 13, Hancock 5)
    - Location source: 'Sample Collection Location' string (10 unique clusters; top 3: SGRC/Environment 1313, SGRC/East 744, Other/Carolinas 623)
    - Time field: 'Sample Collected Time', 19.1% fill (872/4571 non-null), 247 unique HH:MM times (00:00–22:54); included in time_distribution only when present per location
    - Height field: absent (no column matching keywords height/alt/elevation/level/tier); height_distribution unconditionally omitted
    - Project capping: 20 entries max (of 29 total), ordered by sample_count descending; proportional to Sprint 1's 100-recent-samples FE constraint
    - Zod schema inline in task packet (not yet as .ts file); defines entry shape for FE consumption in next task
    - Files changed: scripts/preprocess_data.py (3 new builders + aggregation call), data/data.json (regenerated, 8 existing keys untouched)
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-17T12:30:00Z</timestamp>
  <task_id>broadn-p2-003</task_id>
  <event_type>TASK_COMPLETE</event_type>
  <rationale>UI Design task: created complete design specification for Slice Panel feature — sidebar filter + three stratified slice-view containers (Project, Location, Lab Group). Design spec is implementation-ready; no code written. Desktop layout: sticky left sidebar w-64 with category buttons → group lists → clear filter. Mobile: fixed slide-in drawer (w-72) with overlay, triggered by "Filter by..." button in dashboard body. State machine: three states (default, category selected, group selected) with keyboard navigation rules (Arrow keys within categories/lists, Enter to activate, Escape to collapse/clear). Three identical slice views (one per category) render charts conditionally based on active selection: Project view has doughnut (sample types), horizontal bar (pipeline), and line (temporal) charts; Location view adds polar area (time-of-day) chart if time_distribution data exists; Lab Group view matches Project structure. Six new CHART_COLORS keys defined for slice charts (sliceSampleTypes, slicePipeline, sliceTemporalLine, sliceTemporalArea, sliceLocationBar, sliceTimeOfDay). All hex values kept in CHART_COLORS only — zero hardcoded hex in Tailwind classes (Color Rule B honored). Empty array degradation documented: if slice_views.lab_group is empty, Lab Group button still renders but shows inline "data not available" message. Accessibility verified: all interactive elements keyboard-navigable, canvas elements have aria-label and role="img", buttons have aria-expanded/aria-controls, group lists have role="listbox"/role="option" semantics. All audit gates passed (SA/QA/SX).</rationale>
  <dependencies>
    - Depends on: broadn-p2-002 (slice_views data shape consumed by design spec), broadn-p1-web-view (existing dashboard structure, navbar, chart cards, CHART_COLORS token system)
    - Unblocks: broadn-p2-004 (FE implementation of sidebar + slice view components), any subsequent chart refinements based on design feedback
  </dependencies>
  <retention_keys>
    - Desktop sidebar: sticky top-16, w-64, flex-shrink-0, max-h-[calc(100vh-4rem)], overflow-y-auto; desktop classes on #slice-sidebar: hidden lg:flex lg:flex-col w-64 flex-shrink-0 sticky top-16 self-start max-h-[calc(100vh-4rem)] overflow-y-auto
    - Mobile drawer: fixed left-0 top-0 h-full w-72 z-40, with -translate-x-full when closed and translate-x-0 when open, transition-transform duration-300
    - Trigger button (#slice-drawer-trigger): block lg:hidden, positioned as first child in #dashboard-body, aria-expanded reflects state
    - Overlay (#slice-sidebar-overlay): fixed inset-0 bg-black/40 z-30, shown only when drawer open, click to close
    - Layout structure: main > div#dashboard-layout (flex flex-col lg:flex-row) > aside#slice-sidebar + div#dashboard-body (flex-grow min-w-0)
    - State object (sliceState): activeCategory (null or PROJECT|LOCATION|LAB_GROUP), activeGroup (null or string ID/name)
    - Category buttons: three buttons (Project, Location/Hub, Lab Group) with aria-expanded false/true, aria-controls pointing to group list id
    - Group lists: ul#project-group-list, #location-group-list, #labgroup-group-list, hidden by default, shown when category active
    - Group items: li role="option", aria-selected reflects active state, tabindex="0", sample_count badge rendered as right-aligned span
    - Clear filter button (#slice-clear-btn): shown when filter active, hidden otherwise, mt-4 w-full
    - Active filter label (#slice-active-label): displays "Showing: {activeGroupLabel}", shown when filter active, hidden otherwise
    - Keyboard nav: ArrowDown/Up within categories (wrap), ArrowDown/Up within list items (no wrap, Up from first item goes back to button), Enter/Space to select, Escape to collapse/clear/reset
    - Slice view container (#slice-view-container): hidden by default, bg-stone-50 border border-stone-200 rounded-2xl p-6, shown when group selected, scroll-mt-20
    - Chart card template: bg-white border border-stone-200 rounded-xl shadow-sm p-6, with h3 (title), p (subtitle), div.chart-wrap > canvas
    - Chart grid: grid grid-cols-1 lg:grid-cols-2 gap-8; temporal/time-of-day charts: lg:col-span-2 (full width)
    - Project slice charts: sliceProjectTypesChart (doughnut, sliceSampleTypes colors), sliceProjectPipelineChart (bar, indexAxis y, slicePipeline colors), sliceProjectTemporalChart (line, sliceTemporalLine/Area colors, lg:col-span-2)
    - Location slice charts: sliceLocationSubsitesChart (bar, sliceLocationBar color), sliceLocationTypesChart (doughnut, sliceSampleTypes), sliceLocationTemporalChart (line, lg:col-span-2), sliceLocationTimeDistChart (polar, conditional, sliceTimeOfDay colors)
    - Lab Group slice charts: sliceLabGroupTypesChart (doughnut), sliceLabGroupPipelineChart (bar), sliceLabGroupTemporalChart (line, lg:col-span-2)
    - Chart color tokens: sliceSampleTypes ['#166534','#0f766e','#b45309','#1d4ed8','#78716c'], slicePipeline ['#166534','#0f766e','#6d28d9'], sliceTemporalLine '#0f766e', sliceTemporalArea 'rgba(15,118,110,0.1)', sliceLocationBar '#0369a1', sliceTimeOfDay ['#166534','#0f766e','#b45309','#6d28d9']
    - Empty/no-data fallbacks: Project/Location: py-12 text-center text-stone-500 text-sm "No data available for the selected [type].", Lab Group (empty array): "Lab Group data is not available."
    - Contrast compliance: text-stone-700 on white (buttons), text-green-800 on bg-green-50 (active button), text-green-800 on bg-green-100 (active item) all meet WCAG AA; section header text-stone-400 treated as large text
    - Chart instance lifecycle: register in chartInstances[canvasId], call destroyChart(canvasId) before rendering new slice chart
    - Design spec file: .claude/agents/tasks/outputs/broadn-p2-003-UI-1742172600.md (11 sections, 616 lines)
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-17T01:45:00Z</timestamp>
  <task_id>broadn-p2-004a</task_id>
  <event_type>TASK_COMPLETE</event_type>
  <rationale>Slice Panel implementation task — Phase 1a (sidebar structure + state wiring, no chart renderers). FE#2 implemented the complete sidebar layout, state machine, and event handling per broadn-p2-003 design spec. Index.html grew from 880 to 1581 lines (701 new lines). Sidebar structure includes desktop sticky panel (w-64, hidden on mobile) and mobile slide-in drawer (w-72, -translate-x-full closed) with overlay. Three category buttons (Project, Location/Hub, Lab Group) dispatch on click to sliceState {activeCategory, activeGroup}. Three group lists rendered from data.slice_views at init, showing item counts and maintaining keyboard focus order. Clear-filter button tied to single listener in initDashboard(). Full keyboard navigation: Arrow keys navigate categories and list items with wrapping within categories, Enter/Space activates selection, Escape collapses category or resets filter. Data shape guard (8 required keys) preserved and fires before renderView(). Graceful degradation when slice_views key missing: shape guard passes, populateSidebarGroupLists() shows "Data not loaded yet" message, 7 existing charts render normally. All interactive elements have full aria-label, aria-expanded, aria-controls, role, and tabindex attributes per WCAG standards. No new colors, no dynamic Tailwind class construction, no CSS changes. Chart canvases are DOM placeholders only — no Chart.js instances created (deferred to task 004b). All audit gates passed: SA (DRY constants, no new colors, aria attributes, listener pattern clean), QA (full state cycle manual test, missing-data degradation, initDashboard called once), SX (no eval, innerHTML safe, no secrets).</rationale>
  <dependencies>
    - Depends on: broadn-p2-003 (design specification consumed), broadn-p2-002 (slice_views data structure), broadn-p1-web-view (existing chart rendering functions, layout structure)
    - Unblocks: broadn-p2-004b (chart renderer implementation), any downstream features using slice filter state
  </dependencies>
  <retention_keys>
    - SLICE_CATEGORIES constant (single source of truth): PROJECT='Project', LOCATION='Location / Hub', LAB_GROUP='Lab Group' (lines 570–578)
    - sliceState object: {activeCategory: null|'Project'|'Location / Hub'|'Lab Group', activeGroup: null|string} — plain JS, no Zustand or framework
    - renderView() dispatch logic: three branches (both null → default view) + (cat set, group null → show lists) + (both set → show slice view). No initDashboard() calls; listeners never re-attached
    - populateSidebarGroupLists() builds ul#project-group-list, #location-group-list, #labgroup-group-list from data.slice_views objects; graceful fallback when key missing
    - Event handlers: handleCategoryClick(), handleGroupItemClick(), clearSliceFilter() update sliceState then call renderView(); openMobileDrawer(), closeMobileDrawer() toggle drawer visibility; keyboard handlers attached to category buttons and group items
    - Data validation: shape guard checks 8 required keys (kpis, temporal, sample_types, pipeline, sites, by_site, recent_samples); slice_views optional for backward compat
    - Sidebar HTML: aside#slice-sidebar (desktop sticky, mobile fixed), category nav#slice-categories (3 buttons), three ul[role=listbox] for groups, button#slice-clear-btn, div#slice-view-container (placeholder), button#slice-drawer-trigger (mobile), div#slice-sidebar-overlay
    - Mobile drawer behavior: -translate-x-full closed, translate-x-0 open, overlay z-30 at inset-0 bg-black/40, drawer z-40 w-72, Escape key closes drawer, overlay click closes drawer
    - A11Y attributes: all category buttons have aria-expanded/aria-controls; all group items role="option" tabindex="0" aria-selected; group lists role="listbox"; drawer trigger aria-label/aria-expanded/aria-controls; sidebar aria-label; overlay aria-hidden
    - Files changed: index.html (1581 lines total, +701 new). Completion packet: .claude/agents/tasks/outputs/broadn-p2-004a-FE-1742172900.md. Audit report: .claude/agents/tasks/outputs/broadn-p2-004a-AUD-1742173000.md
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-17T06:50:00Z</timestamp>
  <task_id>broadn-p2-004b</task_id>
  <event_type>TASK_COMPLETE</event_type>
  <rationale>Slice Panel implementation task — Phase 1b (three slice view chart renderers: Project, Location, Lab Group). FE#3 completed the rendering layer for all three stratified views, implementing exactly the design spec from broadn-p2-003. Index.html grew from 1581 to 2099 lines (518 new lines). Key architectural pattern: destroyAllSliceCharts() invoked at the top of renderView() on every execution to prevent Chart.js memory leaks when switching between views. Three renderer functions (renderProjectView, renderLocationView, renderLabGroupView) dispatch routed by SLICE_CATEGORIES constants, never by string literals. DRY extraction of tooltip callbacks (tooltipLabelPct, tooltipLabelSamples) consolidated 9 inline duplicates into 2 named functions. Temporal chart options refactored into buildTemporalChartOptions() to eliminate pattern repetition. Lab Group edge case handled: when lab_group array is empty, handleCategoryClick sets sentinel activeGroup='__empty__', renderLabGroupView detects this and shows "Lab Group data is not available" message without attempting entry lookup or Chart instantiation. Location conditional logic: time_distribution field is optional; renderLocationView checks presence and length, conditionally rendering the polar area (time-of-day) chart and hiding the card if absent. All 10 slice canvas elements retain aria-label and role="img" from 004a. All audit gates passed: SA (zero color violations, no dynamic Tailwind, SLICE_CATEGORIES single source of truth, all DRY extractions complete, memory cleanup pattern applied), QA (all 6 manual test scenarios pass, no JS errors on state transitions), SX (no eval/new Function, innerHTML uses escapeHtml(), textContent used for all user-facing strings, no secrets).</rationale>
  <dependencies>
    - Depends on: broadn-p2-004a (sidebar structure and state machine), broadn-p2-003 (design specification), broadn-p2-002 (slice_views data shape), broadn-p1-web-view (existing chart infrastructure, CHART_COLORS token system, renderView dispatch pattern)
    - Unblocks: any follow-on analytics or cross-filtering that builds on slice views
  </dependencies>
  <retention_keys>
    - destroyAllSliceCharts() pattern: invoked at top of renderView() before any branch; calls destroyChart(key) for all 10 slice instances (sliceProjectTypesChart, sliceProjectPipelineChart, sliceProjectTemporalChart, sliceLocationSubsitesChart, sliceLocationTypesChart, sliceLocationTemporalChart, sliceLocationTimeDistChart, sliceLabGroupTypesChart, sliceLabGroupPipelineChart, sliceLabGroupTemporalChart)
    - renderProjectView(groupId): looks up entry in appData.slice_views.project[groupId]; renders 3 charts (doughnut sample_types, horizontal bar pipeline, line temporal); no guards needed (entry must exist after group selection)
    - renderLocationView(groupId): looks up entry in appData.slice_views.location[groupId]; renders 3 core charts + conditionally renders time_distribution polar area if entry.time_distribution exists and has length > 0; individual destroyChart calls for optional chart
    - renderLabGroupView(groupId): guards for groupId === '__empty__' (empty array case); if guard true, shows no-data message; if false, renders 3 charts (doughnut, horizontal bar pipeline, line temporal) same as Project
    - Tooltip callbacks: tooltipLabelPct(ctx) → returns context.parsed.y + ' (' + pct + '%)'; tooltipLabelSamples(ctx) → returns context.parsed.y + ' samples'
    - buildTemporalChartOptions() returns shared object {scales, plugins} for all temporal line charts (X-axis: time string labels, Y-axis: count)
    - showSliceNoData(gridEl, message): hides chart grid, shows p.textContent=message; hideSliceNoData(gridEl): shows grid, hides message
    - CHART_COLORS 6 new keys: sliceSampleTypes ['#166534','#0f766e','#b45309','#1d4ed8','#78716c'], slicePipeline ['#166534','#0f766e','#6d28d9'], sliceTemporalLine '#0f766e', sliceTemporalArea 'rgba(15,118,110,0.1)', sliceLocationBar '#0369a1', sliceTimeOfDay ['#166534','#0f766e','#b45309','#6d28d9']
    - renderView() dispatch: if activeCategory===PROJECT, call renderProjectView(activeGroup); if activeCategory===LOCATION, call renderLocationView(activeGroup); if activeCategory===LAB_GROUP, call renderLabGroupView(activeGroup); each branch first checks presence of slice_views[categoryKey] and handles gracefully
    - renderView() one-way data flow preserved: never calls initDashboard(), never re-attaches listeners, preserves 7 original chart instances from dashboard-body
    - Lab Group empty-array UX: when slice_views.lab_group.length===0, handleCategoryClick sets activeGroup='__empty__' (sentinel); renderLabGroupView detects this and shows message without JS errors
    - Location missing time_distribution UX: renderLocationView checks entry.time_distribution && entry.time_distribution.length > 0; if false, calls destroyChart('sliceLocationTimeDistChart') and hides timeDistCard; if true, renders polar chart
    - Files changed: index.html (2099 lines total, +518 new). Completion packet: .claude/agents/tasks/outputs/broadn-p2-004b-FE-1742173200.md. Audit report: .claude/agents/tasks/outputs/broadn-p2-004b-AUD-1742173300.md
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-17T06:55:00Z</timestamp>
  <task_id>broadn-p2-slice-panel</task_id>
  <event_type>SPRINT_STATE</event_type>
  <rationale>Sprint broadn-p2-slice-panel COMPLETE. All 5 tasks executed sequentially and passed audit gates. Sprint delivery: full Slice Panel feature — sidebar UI, state machine wiring, and three stratified chart renderers (Project, Location, Lab Group). Total lines added to project: 518 (004b) + 701 (004a) + 3 Python aggregation functions (002) + preprocessing logic = ~1250 new lines of implementation code. Data footprint: data.json grew from 25.6 KB to 67.2 KB (41.6 KB new) due to 20 project / 10 location / 8 lab_group entries with sample_types, pipeline, temporal histograms, and optional time_distribution (location only). Requirements coverage: 17/17 COVERED, verified by audit chain (SA/QA/SX x2 tasks + final requirements validation). Architectural decisions all recorded: Lab Group = 'Project Lead' column (99.8% fill), Collection Height column does not exist (height_distribution omitted), Collection Time = 'Sample Collected Time' (19.1% fill, binned into 4-hour periods), Location grouping by string column 'Sample Collection Location'. One remediation cycle (004a keyword 'required' in Zod schema comment, non-blocking STYLE advisory, resolved in 004b). No scope creep, no blocking issues across sprint.</rationale>
  <dependencies>
    - Depends on: broadn-p1-web-view (foundational dashboard and data structure), broadn-p2-001 (data inventory confirming field selection), broadn-p2-002 (aggregation builder functions and slice_views key), broadn-p2-003 (design specification for UI/UX layout and interaction patterns)
    - Unblocks: any downstream analytics leveraging project/location/lab-group dimensions, cross-filter features, export/reporting that builds on slice_views aggregations
  </dependencies>
  <retention_keys>
    - Sprint composition: 001 (data discovery) + 002 (data aggregation) + 003 (design spec) + 004a (sidebar + state) + 004b (chart renderers)
    - Critical data fields: Lab Group='Project Lead' (Fierer 1679, Kreidenweis 1263, Trivedi 1102, Farmer 304, Borlee 121, Stewart 76, Magzamen 13, Hancock 5), Location='Sample Collection Location' (SGRC Environment 1313, SGRC East 744, Other/Carolinas 623, CSU..., Gilland..., etc.), Time='Sample Collected Time' binned into 4 periods (00:00-05:59, 06:00-11:59, 12:00-17:59, 18:00-23:59) when present
    - UI state machine: sliceState {activeCategory, activeGroup} → renderView() dispatches to project/location/lab-group renderer → each renderer reads appData.slice_views[key][groupId] and renders 3-4 Chart.js instances; clear-filter resets to {null, null} → default 7-chart view
    - Memory management: destroyAllSliceCharts() invoked at top of renderView() on every execution; individual destroyChart(key) before each new Chart() instantiation; 10 total slice instances managed (3 Project + 3 Location core + 1 Location conditional + 3 Lab Group)
    - Color governance: CHART_COLORS token system extended with 6 new keys; zero hex literals outside CHART_COLORS; Tailwind class names static, never concatenated
    - Accessibility: all 10 slice canvases have aria-label and role="img"; all interactive elements keyboard-navigable (Tab, Arrow keys, Enter, Escape); aria-expanded/aria-controls on category buttons; aria-selected on group items; full WCAG AA compliance verified
    - DRY enforcement: tooltipLabelPct and tooltipLabelSamples extracted from 9 inline duplicates; buildTemporalChartOptions() shared across 3 temporal renderers; SLICE_CATEGORIES constant ensures no string literal routing
    - Edge case handling: Lab Group empty array (renders "data not available" message, sentinel '__empty__' prevents null entry lookup), Location missing time_distribution (polar area card hidden, no JS errors), missing slice_views key (data validation guard passes, populateSidebarGroupLists shows fallback message)
    - Data validation: shape guard checks 8 required keys (kpis, temporal, sample_types, pipeline, sites, by_site, recent_samples, field_samples), slice_views optional for backward compat
    - Artifacts: data.json (67,176 bytes, 9 top-level keys), scripts/preprocess_data.py (3 new builder functions), index.html (2099 lines, includes 004a sidebar + 004b renderers), design spec (broadn-p2-003-UI-*.md, 616 lines, 11 sections)
    - Audit chain: 004a SA/QA/SX PASS (sidebar + state), 004b SA/QA/SX PASS (renderers), 002 SA/QA/SX PASS (aggregation), 003 SA/QA/SX PASS (design), 001 SA/QA/SX PASS (discovery), requirements validation 17/17 COVERED
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-17T07:10:00Z</timestamp>
  <task_id>broadn-p2-slice-panel-postmortem</task_id>
  <event_type>POST_MORTEM</event_type>
  <rationale>Post-mortem completed for broadn-p2-slice-panel sprint covering 5 phases (broadn-p2-001 through broadn-p2-004b). Key findings: 100% first-pass audit rate on all 5 implementation tasks (5/5 PASS). 1 CRITIQUE_BLOCK on PM v1 (004 overscoped with 701+518 new lines combined, renderView guard unprotected) — both caught pre-implementation and corrected via v2+v3 revisions. Backend-engineer agent type produced false-positive usage policy error on xlsx inspection task (workaround: dispatched as general-purpose agent). 4 protocol gaps identified: (1) PM must estimate new-line count for FE tasks; if >100 lines, split or justify explicitly; (2) Orchestrator brief should carry prior-sprint gaps via prior_sprint_gaps field (Color Rule A lesson from sprint 1); (3) Data inspection tasks (local files + scripts only) should use general-purpose agent not backend-engineer; (4) BE task success criteria must mandate extracting any helper pattern used more than once. Implementation produced 100% first-pass rate due to Critic blocking the plan pre-implementation. Most impactful agent action: Critic's OVERSCOPED finding on 004 prevented dual failure modes (50-line commit limit + Color Rule A violations). Recurring pattern across sprints: PM underestimates FE task scope on first decomposition (occurred sprint 1 and sprint 2) — protocol gap 1 is the highest-value fix.</rationale>
  <dependencies>
    - Depends on: broadn-p2-001 (data discovery), broadn-p2-002 (data aggregation), broadn-p2-003 (design spec), broadn-p2-004a (sidebar + state), broadn-p2-004b (chart renderers), sprint post-mortem document at docs/post-mortems/broadn-p2-slice-panel.md
    - Blocks: None; this entry closes the sprint
  </dependencies>
  <retention_keys>
    - docs/post-mortems/broadn-p2-slice-panel.md — full 7-section post-mortem document (231 lines)
    - Protocol gap 1: FE task line-count estimation. Solution: add estimated_new_lines field to FE task packets; if >100, require split or justification. Auditor verifies agent log records verification gate pass when actual >50.
    - Protocol gap 2: Prior-sprint gap transmission. Solution: Orchestrator brief includes prior_sprint_gaps field from previous sprint's post-mortem. Specifically for sprint 2: "Color Rule A: FE agents must extend CHART_COLORS before using new hex values — sprint 1 required a remediation cycle for this."
    - Protocol gap 3: Data inspection task routing. Solution: Document in orchestrator routing table — for tasks reading local files + running scripts (no API routes, no HTML render), prefer general-purpose agent over backend-engineer. Latter appears sensitive to file-processing terminology.
    - Protocol gap 4: BE data-prep DRY enforcement. Solution: Add to BE task success criteria: "Any helper pattern used more than once must be extracted to a named function before commit." Gap was non-blocking temporal builder inlined 3x in preprocess_data.py (002 task).
    - Implementation first-pass rate: 5/5 (100%) — result of Critic blocking and revising plan pre-implementation
    - Critic's most impactful action: OVERSCOPED finding on broadn-p2-004. Original monolith would produce 2+ remediation cycles (50-line commit + Color Rule A). Split to 004a+004b removed both failure modes.
    - Recurring pattern (highest-value fix target): PM underestimates FE task scope on first decomposition (sprint 1: sites-geocoding missing; sprint 2: 004 overscoped). Tied to protocol gap 1.
    - QA protocol note: Static HTML + manual test acceptance. Recommendation: lightweight test harness (Jasmine CDN) for regression coverage without violating no-build constraint. This is project architecture, not pipeline change.
    - Agent performance: PM 0% first-pass (blocked, revised); CR 100% (correctness); BE 100% after type correction; UI 100%; FE 100%; AUD 100%; ARC 1 entry logged
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-17T07:15:00Z</timestamp>
  <task_id>agent-improvement-2026-03-17-1</task_id>
  <event_type>AGENT_IMPROVEMENT</event_type>
  <rationale>Agent improvement session executed on 4 protocol gaps identified in broadn-p2-slice-panel post-mortem (Section 6). All gaps addressed via mechanical changes to 3 agent spec files. (1) PM agent spec: added mandatory &lt;estimated_new_lines&gt; field to FE task_packet format; enforces split or documented justification for estimates >100. Prevents FE overscoping without visibility — broadn-p2-004 would have caught this upfront. (2) Orchestrator agent spec: added &lt;prior_sprint_gaps&gt; field to orchestrator_brief template; populated from prior sprint post-mortem Section 6 before PM decomposition. Prevents Color Rule A (and similar lessons) from being reinvented between sprints. (3) PM and Orchestrator specs: formalized EDA/column-inspection task routing to statistician (not backend-engineer) — backend-engineer false-positive on broadn-p2-001 was a domain mis-assignment. Statistician produces statistical_report that backend-engineer consumes. (4) Backend agent spec: added DRY helper extraction pre-flight check — any pattern used >1 time must extract to named function before completion_packet. Catches temporal-builder-inlining errors before audit. No blocking changes to project code; all fixes are protocol-level. No remaining unresolved gaps from the post-mortem.</rationale>
  <dependencies>
    - Depends on: broadn-p2-slice-panel-postmortem (Section 6 gaps identified), docs/post-mortems/broadn-p2-slice-panel.md, docs/agent-improvements/agent-improvement-2026-03-17-1.md
    - Unblocks: broadn-p3 planning (PM will estimate FE line counts, orchestrator will carry prior-sprint lessons, statistician will handle EDA tasks)
  </dependencies>
  <retention_keys>
    - Files changed: .claude/agents/pm.md (v1.0.0→1.1.0), .claude/agents/orchestrator.md (v1.0.1→1.1.0), .claude/agents/backend.md (v1.1.0→1.1.1)
    - Improvement session document: docs/agent-improvements/agent-improvement-2026-03-17-1.md (66 lines)
    - Archive entry: .claude/agents/tasks/outputs/agent-improvement-2026-03-17-1-AR.md
    - pm.md change: &lt;estimated_new_lines&gt; field added to FE task_packet; if >100, must split or justify. Auditor checks agent log for verification gate when actual >50.
    - orchestrator.md change: &lt;prior_sprint_gaps&gt; field added; populated from prior post-mortem. Example: "Color Rule A: FE agents must extend CHART_COLORS before using new hex values."
    - pm.md routing: EDA/column-inspection (dataset profiling, fill rates, value distribution) → statistician; pipeline construction (schema, JSON, preprocessing) → backend-engineer
    - orchestrator.md routing table: added row for "Dataset EDA / column inspection" → statistician
    - backend.md change: pre-flight check mandate "Any pattern used >1 time must extract to named function before completion_packet"
    - Impact: Prevents recurring FE overscoping, Color Rule A reinvention, EDA mis-routing; reduces reliance on Critic/Auditor catch-ups
  </retention_keys>
</archive_entry>
