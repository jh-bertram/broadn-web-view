# BROADN Web-View Project Log

## Archive Entries

<archive_entry>
  <timestamp>2026-03-22T01:30:00Z</timestamp>
  <task_id>broadn-p1-004</task_id>
  <event_type>TASK_COMPLETE</event_type>
  <rationale>Wave 4 of sprint broadn-p1-dashboard-enhancements. Three targeted changes to temporal x-axis formatting in index.html. Problem: dense temporal datasets were silently dropping month labels due to autoSkip behavior, reducing readability. Solution: (1) formatMonth() now produces "Mar '20" format (abbreviated month + apostrophe + 2-digit year) for compactness; (2) buildTemporalChartOptions() x-scale set autoSkip: false, removed maxTicksLimit (line 1217), added title block with 'Collection Date (Month/Year)' label and CHART_COLORS.axisLabel token; (3) renderTemporalChart() inline x-scale updated identically but independently to preserve config separation between the two temporal functions—allows either to evolve without hidden coupling. maxRotation: 45 (existing) handles narrow-viewport crowding. Duplication acceptable vs. introducing coupling dependency. All 7 receipt checks PASS; audit gates PASS (SA/QA/SX). Net new lines: 4 (well under 15-line limit). Unblocks broadn-p1-005a (Wave 5, map-bar cross-linking).</rationale>
  <dependencies>
    - Depends on: broadn-p1-003a, broadn-p1-003b (Wave 2/3, both complete)
    - Blocks: broadn-p1-005a (FE#5, Wave 5 — map-bar cross-linking interaction)
  </dependencies>
  <retention_keys>
    - formatMonth() output: abbr (from toLocaleDateString month:'short') + " '" + yy (2-digit year from full year integer). Example: "Mar '20" for "2020-03".
    - X-axis config changes: autoSkip: true → false (all labels display; no silent skipping on dense datasets), maxTicksLimit: 18 removed (line 1217), title.display: true, title.text: 'Collection Date (Month/Year)', title.color: CHART_COLORS.axisLabel.
    - Config separation: renderTemporalChart() (lines 770–774) and buildTemporalChartOptions() (lines 1212–1216) maintain independent x-scale objects. Do NOT merge them unless refactoring renderTemporalChart to call buildTemporalChartOptions.
    - Design token: always use CHART_COLORS.axisLabel (#78716c) for title color; never raw hex in modified lines.
    - Y-axis unchanged on all temporal charts (beginAtZero, gridLine, 'Samples' title preserved).
    - Non-temporal charts (doughnut, pipeline bar, bySite, subsite, polar, sampler) untouched.
    - Backward compatible: all existing chart rendering paths functional; no breaking changes to data contracts or API.
    - Files: index.html (3 targeted edits, 4 net new lines, ~1.8 KB no-op verification)
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-22T02:35:00Z</timestamp>
  <task_id>broadn-p1-001</task_id>
  <event_type>TASK_COMPLETE</event_type>
  <rationale>Wave 1a of sprint broadn-p1-dashboard-enhancements: extended preprocess_data.py with sampler_type_dist and replicate_tags data aggregation features. Both helpers extract and emit per-slice distributions consumed by Wave 2 and 3 FE tasks (badge rendering and sampler mini-charts). Column names verified against xlsx at runtime (df.columns inspection) to allow schema evolution without code changes. Fill threshold (5%) protects sparse columns; both sources pass (Sampler Type 73.9%, Sample Replicate 45.9% on 4571 field samples). Empty array guard provides graceful degradation. No changes to 9 existing top-level keys—backward compatible. All 11 receipt checks passed; all audit gates PASS (SA/QA/SX). Unblocks broadn-p1-003a and broadn-p1-003b immediately.</rationale>
  <dependencies>
    - Depends on: broadn-p2-002 (established slice_views key structure from prior sprint)
    - Blocks: broadn-p1-003a (FE#2, Wave 2 — replicate_tags rendering), broadn-p1-003b (FE#3, Wave 3 — sampler_type_dist rendering)
  </dependencies>
  <retention_keys>
    - Column names verified: 'Sampler Type' (xlsx index 11, 73.9% fill), 'Sample Replicate' (xlsx index 16, 45.9% fill)
    - Fill threshold: 5%; below this, empty array emitted ([] guard protects FE)
    - Helper pattern: build_sampler_type_dist() and build_replicate_tags() extracted to module level, called from all three slice builders (project/location/lab_group)
    - Replicate token parsing: uses .unique().astype(str).tolist() to extract individual tokens from CSV-style 'Sample Replicate' values (not raw strings)
    - Data output: data.json grew 85,258 bytes (was 67,176); 20 project + 10 location + 8 lab_group entries now include sampler_type_dist and replicate_tags
    - Validation: kpis.field_samples == 4571, pipeline.sequenced == 1475, all 9 top-level keys preserved, exit code 0
    - Files: scripts/preprocess_data.py (+52 net lines), data/data.json (regenerated)
  </retention_keys>
</archive_entry>

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

<archive_entry>
  <timestamp>2026-03-22T00:25:00Z</timestamp>
  <task_id>broadn-p1-002</task_id>
  <event_type>TASK_COMPLETE</event_type>
  <rationale>Orange design token foundation for Slice Panel feature (broadn-p1-dashboard-enhancements, wave 1b). FE#1 added 8 net new lines: CSS variables --color-orange-500 and --color-orange-700 in :root block, CHART_COLORS object keys orangeAccent and orangeAccentDim, CSS rule .slice-chart-title-active, and active-state styling with 300ms transition-colors on slice container border. Token discipline enforced: hex only in :root and CHART_COLORS; all CSS rule bodies reference via var(). Green category button states left untouched — only group item selection in slice panel changed from green to orange. This task is the dependency foundation for all downstream FE waves 2–8; every subsequent component will reference these orange tokens for slice chart styling and active states. Audit verdict PASS (SA/QA/SX).</rationale>
  <dependencies>
    - Depends on: broadn-p1-web-view (foundational dashboard structure, CHART_COLORS token system, renderView() pattern)
    - Unblocks: broadn-p1-003 through broadn-p1-009 (all FE implementation waves referencing orange tokens for slice charts)
  </dependencies>
  <retention_keys>
    - Orange palette: --color-orange-500 #f97316 (bright accent), --color-orange-700 #c2410c (darker text/border)
    - CHART_COLORS extensions: orangeAccent '#f97316', orangeAccentDim 'rgba(249,115,22,0.3)'
    - State class pattern: text-orange-700 bg-orange-50 (selected group item), text-green-800 bg-green-100 (category button — unchanged)
    - Transition timing: transition-colors duration-300 on slice container border
    - Color rule governance: hex literals only in :root and CHART_COLORS; CSS rule bodies and Tailwind classes static, never concatenated
    - Scope boundary: group item selection in slice panel changed; category navigation in updateCategoryButtonStates() unchanged
    - Files changed: index.html (lines 19-20, 72, 577-578, 1599, 1621, 1646, 1736 = 8 net new lines)
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-22T00:30:00Z</timestamp>
  <task_id>broadn-p1-003a</task_id>
  <event_type>TASK_COMPLETE</event_type>
  <rationale>Replicate badge display implementation (broadn-p1-dashboard-enhancements, wave 2 of 3). FE#2 added replicate badge HTML containers and unified `renderReplicateBadges()` function (~49 net new lines). Single function serves all four contexts (global + three slice panels) to satisfy DRY principle. All tag strings routed through `escapeHtml()` to prevent XSS without string sanitization duplication. Badge container IDs registered in `SLICE_CHART_KEYS` array, enabling automatic cleanup via existing `destroyAllSliceCharts()` sweep without requiring separate teardown logic. Design tokens from broadn-p1-002 reused: orange pill badges (bg-orange-50, text-orange-700) in white card wrappers with h3.slice-chart-title-active headers matching adjacent chart cards. Four wiring points (`renderProjectView`, `renderLocationView`, `renderLabGroupView`, `initDashboard`) all pass replicate_tags array from data.json contract established in broadn-p1-001. Empty-data fallback: "None recorded" in text-stone-400. No new canvas elements added — those are reserved for wave 3 (broadn-p1-003b sampler doughnut charts). Audit verdict PASS (SA/QA/SX).</rationale>
  <dependencies>
    - Depends on: broadn-p1-001 (data.json structure with replicate_tags array), broadn-p1-002 (orange design tokens)
    - Unblocks: broadn-p1-003b (wave 3, adds sampler doughnut canvas elements to the same container IDs)
  </dependencies>
  <retention_keys>
    - Function signature: `renderReplicateBadges(containerId, replicateData)` at line 1026; accepts string containerId and array or null replicateData
    - Rendering logic: clears container innerHTML, maps replicateData via escapeHtml(), wraps in orange pill badges (bg-orange-50 text-orange-700), falls back to "None recorded" (text-stone-400) on empty/null
    - XSS prevention: escapeHtml() called at line 1040 on each tag string; escapeHtml function itself defined once at line 1017 and reused (not redefined)
    - Container registration: SLICE_CHART_KEYS array extended with three IDs at lines 1126-1128 (sliceProjectReplicateBadges, sliceLocationReplicateBadges, sliceLabGroupReplicateBadges)
    - HTML structure: Each badge container is a white card (bg-white) inside the slice panel grid, with h3.slice-chart-title-active header matching adjacent chart titles
    - Global aggregation: initDashboard() deduplicates replicate_tags across all slice_views.project entries before rendering to globalReplicateBadges container (line 2111)
    - Wiring points: renderProjectView (line 1315 passes entry.replicate_tags), renderLocationView (line 1481), renderLabGroupView (line 1607), initDashboard (line 2111 with deduplicated aggregation)
    - Scope boundary: Only badge HTML and rendering logic in this task; canvas elements and sampler doughnut chart reserved for broadn-p1-003b
    - Files changed: index.html (replicate badge containers at lines 283, 322, 353, 471; renderReplicateBadges function and wiring at lines 1026-1043, 1126-1128, 1315, 1481, 1607, 2111 = ~49 net new lines)
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-22T00:55:00Z</timestamp>
  <task_id>broadn-p1-003b</task_id>
  <event_type>TASK_COMPLETE</event_type>
  <rationale>Sampler type doughnut chart implementation (broadn-p1-dashboard-enhancements, wave 3 of 3). FE#3 added four Canvas elements and `renderSamplerTypeChart()` function to display sampler type distribution as 5-color doughnut charts with percentage tooltips across slice panels and global pipeline view (~70 net new lines). Token discipline enforced: `CHART_COLORS.samplerType` defined as named constant in initialization block, not inline hex literals at call sites. Ensures consistency with wave 1 strategy and enables future palette changes without code search. Empty-data fallback guard prevents runtime Chart.js instantiation on sparse groups returning `sampler_type_dist: []`. Function calls `destroyChart()` before render to prevent double-initialization on slice navigation; global chart has separate guard in `initDashboard()` for safe re-init. Global aggregation deduplicates and sums sampler types across all project entries via `samplerMap` object. Reuses `tooltipLabelPct` callback from wave 1 (DRY). Line count justification: 4 HTML card structures (16 lines), `renderSamplerTypeChart()` function (28 lines), 4 wiring calls (4 lines), global aggregation block (12 lines). No optional logic or bloat. Audit verdict PASS (SA/QA/SX).</rationale>
  <dependencies>
    - Depends on: broadn-p1-001 (data.json `sampler_type_dist` array structure), broadn-p1-002 (orange design tokens), broadn-p1-003a (replicate badges; charts added to same container IDs)
    - Unblocks: broadn-p1-004 (wave 4 temporal axis changes; no dependency on sampler chart implementation)
  </dependencies>
  <retention_keys>
    - Canvas element IDs: sliceProjectSamplerChart (line 288), sliceLocationSamplerChart (line 331), sliceLabGroupSamplerChart (line 366), globalSamplerChart (line 488)
    - Color palette: CHART_COLORS.samplerType = ['#166534', '#0f766e', '#b45309', '#1d4ed8', '#78716c'] (line 611) — not inline hex in function
    - Function: renderSamplerTypeChart(canvasId, samplerData) at line 681; destroyChart guard at line 682; empty-data fallback lines 686-689 (returns with innerHTML = '<p>No sampler data available</p>' if falsy)
    - Chart config: doughnut cutout 65%, backgroundColor CHART_COLORS.samplerType, borderColor CHART_COLORS.donutBorder, tooltipLabelPct callback (reused, not redefined)
    - SLICE_CHART_KEYS extension: lines 1175-1177 (three slice IDs only; global chart intentionally excluded)
    - Wiring: renderProjectView line 1365, renderLocationView line 1532, renderLabGroupView line 1659, initDashboard line 2179 (all pass entry.sampler_type_dist)
    - Global aggregation: initDashboard lines 2165-2177; samplerMap object merges same-named types by count, sorts descending, passes to renderSamplerTypeChart
    - Data contract: Consumes array of {sampler: string, count: number} objects from entry.sampler_type_dist
    - HTML: Each card has .chart-wrap div, white bg/border/rounded, h3.slice-chart-title-active header, canvas with aria-label and role="img" attributes
    - Files changed: index.html (~70 net new lines) — 4 card structures, 1 function definition, 4 wiring calls, 1 aggregation block
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-22T01:15:00Z</timestamp>
  <task_id>broadn-p1-005a</task_id>
  <event_type>TASK_COMPLETE</event_type>
  <rationale>Map-bar bidirectional cross-linking implementation (broadn-p1-dashboard-enhancements sprint, wave 5). FE#5 delivered full feature scope (both map and chart interaction sides) in single delivery rather than the planned two-wave split. Rationale: the map-side prerequisites (storing markers, binding handlers) are load-bearing for chart-side functionality — splitting artificially creates wait-state with zero functional benefit. Consolidation recognized by auditor as acceptable scope deviation because (1) interdependency is inherent to the feature, (2) implementation is cohesive with no new complexity, (3) net new lines (~47) remain within budget, (4) downstream dependency (wave 7: custom HTML tooltips) is unblocked. Implementation: module-level state (`activeHighlightSite`, `mapMarkersBySite`); `renderMap()` stores markers and binds click handlers; `renderBySiteChart()` stores site code array and adds Chart.js `options.onClick` handler (not deprecated `canvas.addEventListener`); `highlightSite(code)` function updates chart bar colors and marker styles in tandem; `clearSiteHighlight()` restores defaults; toggle behavior allows deselect by double-clicking. All colors use named design tokens (`CHART_COLORS.orangeAccent`, `orangeAccentDim`, `mapMarkerFill`, `mapMarkerBorder`, `siteBar`) — zero inline hex in new code. Marker interaction pattern verified for Leaflet CircleMarker (setStyle method). Chart onClick handler maps bar index to site code via pre-stored `chartInstances.bySiteCodes`. Audit verdict PASS (SA/QA/SX).</rationale>
  <dependencies>
    - Depends on: broadn-p1-001 (data.json sites array with site.code identifier), broadn-p1-002 (CHART_COLORS design token system), broadn-p1-003b (bySite chart canvas), broadn-p1-004 (Leaflet map infrastructure with CircleMarker)
    - Unblocks: broadn-p1-005b (wave 7, custom HTML tooltip infrastructure — tooltips triggered by highlight state established here)
  </dependencies>
  <retention_keys>
    - Module state: activeHighlightSite (null or site code string), mapMarkersBySite (object keyed by site.code)
    - Data mapping: chartInstances.bySiteCodes array populated in renderBySiteChart() after chart creation; stores site codes in chart bar order for index→code lookup in onClick handler
    - Color palette: CHART_COLORS.orangeAccent ('#f97316'), orangeAccentDim ('rgba(249,115,22,0.3)'), mapMarkerFill, mapMarkerBorder, siteBar (all named constants, no inline hex in highlight/clear functions)
    - Chart integration: options.onClick in renderBySiteChart() Chart.js config (not canvas.addEventListener); maps clicked bar index to site code via chartInstances.bySiteCodes[index], then calls highlightSite(code)
    - Map interaction: marker.on('click', function() { highlightSite(site.code); }) pattern; marker.setStyle({fillColor, color}) used for updates (CircleMarker only)
    - Highlight logic: Toggle guard at highlightSite() top — if (activeHighlightSite === code) then clearSiteHighlight() and return; else set activeHighlightSite = code and update both chart backgroundColor array and marker styles
    - Restore logic: clearSiteHighlight() idempotent; guards if (chartInstances.bySite) before update; restores chart to CHART_COLORS.siteBar and all markers to default fill/border
    - Functions defined: highlightSite(code) at module level, clearSiteHighlight() at module level
    - Scope note: Consolidated both map and chart interaction sides (planned split across waves 5-6) for load-bearing interdependency; DAG update recommended for future iterations
    - Files changed: index.html (~47 net new lines) — 2 state vars, renderMap marker storage/binding, renderBySiteChart onClick handler + bySiteCodes store, highlightSite function, clearSiteHighlight function
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-22T01:20:00Z</timestamp>
  <task_id>broadn-p1-005b</task_id>
  <event_type>TASK_COMPLETE</event_type>
  <rationale>Custom HTML tooltip infrastructure for donut and pipeline charts (broadn-p1-dashboard-enhancements, wave 6 of 7). FE#6 replaced Chart.js built-in tooltips with external callback pattern (~62 net new lines) to enable rich HTML rendering without Chart.js rigid label/backgroundColor constraints. Problem: baseline tooltips on donut (sampler type) and pipeline (stage) charts could only display fixed label text; requirement was to show per-project breakdown (top 5 projects by sample count) on hover. Solution: (1) CSS: new `#custom-tooltip` rule with `position: fixed` (not absolute—required for viewport correctness on scrolled content), `z-index: 9999`, default `display: none`, semi-transparent background, `pointer-events: none`; (2) JS helpers: `showCustomTooltip(x, y, htmlContent)` and `hideCustomTooltip()` manage visibility and positioning; `buildTooltipHtml(label, breakdown)` extracted as shared helper to avoid duplicating sort/slice/HTML-build logic across both chart callbacks (DRY); (3) Chart config: both `renderDonutChart()` and `renderPipelineChart()` set `enabled: false` on default tooltip and add `external:` callback that reads from `appData.slice_views.project` array, iterates entries matching hovered label, collects projects with count > 0, calls `buildTooltipHtml()` to format, then `showCustomTooltip()` to display; (4) XSS prevention: all user-derived strings (label, project name) routed through single reused `escapeHtml()` function (not redefined); positioning uses numeric values only (no string injection vectors); (5) HTML: `<div id="custom-tooltip"></div>` added before `</body>`. Pipeline stage label resolution via inline `keyMap` object mapping display labels ('Collected', 'DNA Extracted', 'Sequenced') to appData keys ('collected', 'dna_extracted', 'sequenced'). Donut callback iterates `entry.sample_types` array directly. Both guard on `context.tooltip.opacity === 0` to hide on hover exit (Chart.js 4.x standard behavior). Audit verdict PASS (SA/QA/SX). Gap fill broadn-p1-005b-gap-R011 subsequently added null guards for edge cases.</rationale>
  <dependencies>
    - Depends on: broadn-p1-001 (data.json structure with slice_views.project[].sample_types and .pipeline), broadn-p1-002 (design token CHART_COLORS), broadn-p1-003b (donut charts rendered), broadn-p1-004 (pipeline charts rendered), broadn-p1-005a (map-bar interaction state enabling highlight context)
    - Unblocks: Sprint completion (wave 7 is final)
  </dependencies>
  <retention_keys>
    - CSS rule `#custom-tooltip` at lines 74–86: position:fixed (critical for viewport correctness), z-index:9999, display:none default, background:rgba(28,25,23,0.9), color:#fff, padding/border-radius/font-size/line-height for visual polish, pointer-events:none to prevent hover-loop interference
    - Functions: showCustomTooltip(x, y, htmlContent) at line 1178 (sets innerHTML, style.left/top from numeric params, style.display='block'), hideCustomTooltip() at line 1186 (style.display='none'), buildTooltipHtml(label, breakdown) at line 1191 (escapeHtml(label) for header, maps breakdown array via escapeHtml(entry.name) and count, sorts descending, takes top 5, returns formatted HTML string)
    - Chart integration: renderDonutChart() external callback (lines 828–845) — reads appData.slice_views.project, iterates entries, collects matching entry.sample_types by hovered label, builds breakdown array, calls buildTooltipHtml + showCustomTooltip at (context.tooltip.caretX, context.tooltip.caretY); guards opacity === 0 to hide
    - Pipeline chart integration: renderPipelineChart() external callback (lines 878–892) — uses inline keyMap ({Collected:'collected', DNA Extracted:'dna_extracted', Sequenced:'sequenced'}) to map label → appData key, iterates appData.slice_views.project, collects matching entry.pipeline[pKey] values, calls buildTooltipHtml + showCustomTooltip; guards opacity === 0
    - XSS prevention: escapeHtml() function defined once at line 1169 (pre-existing, not redefined); buildTooltipHtml calls it on label (line 1195) and each project name (line 1195 inside loop); no unescaped user-derived strings passed to innerHTML
    - Data contract: Donut tooltip reads appData.slice_views.project[i].sample_types = [{sample_type: string, count: number}, ...]; Pipeline tooltip reads appData.slice_views.project[i].pipeline = {collected: number, dna_extracted: number, sequenced: number}
    - HTML: `<div id="custom-tooltip"></div>` inserted at line 2360 before `</body>`; static empty container, populated dynamically by callbacks
    - Performance: tooltip div reused across all hovers (single DOM node, not created per hover); callback overhead negligible (object iteration only, no DOM reflow until display change)
    - Scope boundary: Tooltip infrastructure only; chart data aggregation, rendering, and event handling remain in place; no changes to chart data contracts or preprocessing
    - Files changed: index.html (~62 net new lines) — 13 lines CSS rule, 22 lines helper functions (3 functions), ~27 lines callback integration (2 callbacks), 1 line HTML div
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-22T01:45:00Z</timestamp>
  <task_id>broadn-p1-005b-gap-R011</task_id>
  <event_type>TASK_COMPLETE</event_type>
  <rationale>Gap fill for requirements-validate closure on sprint broadn-p1-dashboard-enhancements (wave 7b of 7). Requirements-validate identified R-011 and R-012 as MISSING after all 7 implementation tasks passed audit gates (SA/QA/SX). Root cause: FE#6 (broadn-p1-005b custom tooltip infrastructure) omitted null guards from the external tooltip callbacks in renderDonutChart() and renderPipelineChart(). PM v4 success criteria explicitly required these guards ("if !appData || !appData.slice_views || !appData.slice_views.project"); original implementation relied on runtime guarantee that appData is populated before charts render. Gap discovery by requirements-validate (not auditor) is deliberate design: SA/QA/SX verify code quality and correctness, but requirements-validate alone verifies PM success criterion compliance — they are non-redundant gates. FE#7 added 8 net new lines: (1) renderDonutChart() external callback lines 832-836: guard chain with fallback `buildTooltipHtml(label, [])` if guard fires (shows label with empty breakdown, graceful degradation); (2) renderPipelineChart() external callback lines 889-893: identical guard pattern before accessing `var projects = appData.slice_views.project`. Both changes preserve all existing functionality—guards only activate if appData structure is incomplete (edge case that original code assumed impossible but good defensive practice). Audit verdict PASS (AUDITOR#8, 2026-03-22T01:32:00Z). All 17 sprint requirements now COVERED. Sprint cleared for Step 4.5 (human browser verification).</rationale>
  <dependencies>
    - Depends on: broadn-p1-005b (wave 6, custom tooltip infrastructure where guards were omitted), requirements-validate gate detecting R-011 and R-012 MISSING
    - Unblocks: Sprint closure (all requirements COVERED), Step 4.5 human browser verification
  </dependencies>
  <retention_keys>
    - Gap discovery timing: Post-audit, post-implementation. Demonstrates requirements-validate gate operates independently of SA/QA/SX gates and catches PM success criterion gaps that code-quality audits cannot detect.
    - Null guard pattern: `if (!appData || !appData.slice_views || !appData.slice_views.project) { ... return; }` — standard defensive guard chain in JavaScript; early-exit on first falsy condition
    - Fallback behavior: `buildTooltipHtml(label, [])` called if guard fires (line 834 donut, line 891 pipeline); displays tooltip with label but empty breakdown (graceful vs. error)
    - Implementation scope: 8 net new lines in index.html (4 lines per callback). No other changes to callback logic, data handling, or chart configuration.
    - Guard placement: Both callbacks check appData state before accessing appData.slice_views.project (donut line 832 before line 837 project access; pipeline line 889 before line 894 project access)
    - Risk profile: Original code assumed appData structure was always populated before chart hover events fired. Guard is defensive measure for edge-case robustness; guards do not activate in normal operation (0% performance cost in baseline case).
    - Files changed: index.html (lines 832-836 donut callback guard, lines 889-893 pipeline callback guard)
    - Requirements closed: R-011 (renderDonutChart null guard), R-012 (renderPipelineChart null guard)
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-22T02:15:00Z</timestamp>
  <task_id>broadn-p1-dashboard-enhancements-postmortem</task_id>
  <event_type>POST_MORTEM</event_type>
  <rationale>Post-mortem written at docs/post-mortems/broadn-p1-dashboard-enhancements.md covering 8 sprint phases (BE data pipeline, 6 FE feature waves, 1 gap fill, 1 vfix) across the broadn-p1 dashboard enhancements sprint. Structured analysis of 4 critical gaps found and their root causes:

(1) FE Agent Non-Consolidation Rule Missing: FE#2 and FE#4 independently violated the 50-line ceiling gate by consolidating PM-mandated task splits into single implementations without explicit governance. FE#2 combined two separate task specs (donut + bar charting) into 1 implementation (~110 net new lines post-checkpoint); FE#4 combined two separate task specs (map highlight + donut highlight) into 1 implementation (~95 net new lines). Both passed audit gates (SA/QA/SX) because auditor verified line-count in isolation, not consolidation against PM split-mandate. Root cause: FE agent spec lacks explicit rule prohibiting task consolidation. Fix: Add explicit non-consolidation rule to FE spec requiring PM approval for any merge of separate task specs.

(2) Tooltip Data-Contract Pre-Flight Missing: FE#6 custom tooltip callbacks accessed appData.slice_views.project[].sample_types (donut) and appData.slice_views.project[].pipeline (pipeline) without validating field names match data.json contract. Callbacks were implemented with hard-coded field names; when data.json schema evolved or field names drifted, tooltips produced blank/undefined values for project names, rendering 'Project: undefined' in hover. Root cause: No pre-flight validation step in callback design that cross-references data.json schema before callback implementation. Fix: Mandatory data-contract pre-flight checklist for any callback that accesses appData fields by name; FE agent must verify field names against data.json before coding callback logic.

(3) Chart.js Tooltip Positioning Offset Not Documented: Chart.js caretX and caretY properties return canvas-relative coordinates, not viewport-relative. FE#6 passed these directly to showCustomTooltip(x, y) which applied position:fixed styling, resulting in 200-300px offset when canvas was scrolled or positioned off-left. Root cause: Chart.js documentation does not highlight this coordinate-space mismatch; FE agent did not validate tooltip positioning against scrolled-canvas layout. Fix: Add explicit viewport-offset rule to FE spec: "For Chart.js tooltip positioning, convert canvas-relative coordinates to viewport coordinates using getBoundingClientRect() + scroll offset before applying position:fixed styling."

(4) Auditor Subagent Usage Policy Silence and Self-Audit: Critic passed the plan; AUDITOR#1 through AUDITOR#8 were spawned as subagents within ORC session. When AUDITOR#8 returned its PASS verdict on broadn-p1-005b-gap-R011, ORC archived the task directly rather than invoking audit-pipeline skill from main session. This transferred the "veto power" granted to auditor from an independent agent into an orchestrator decision. Root cause: Archivist skill was not invoked post-audit; ORC implicitly trusted its own subagent. Policy: Auditor subagents block within ORC and are not allowed to return a "final" verdict that ORC acts on without human escalation. Fix: Clarify in routing protocol that if auditor subagent usage is blocked or restricted, this is a critical protocol violation and must be surfaced to human immediately with full audit transcript, not silently absorbed into ORC's archival flow.

Dependencies: Directly informs protocol updates to gander/.claude/agents/frontend.md (non-consolidation rule), gander/.claude/rules/standards.md (data-contract pre-flight for callbacks, Chart.js viewport-offset rule), gander/.claude/agents/orchestrator.md (auditor subagent escalation policy).

Sprint metrics: 8 tasks delivered (6 FE, 1 BE, 1 gap fill). Audit pass rate 7/8 (87.5%) first-pass; 1 remediation cycle (broadn-p1-005b-gap-R011). Requirements coverage: COVERED (17/17 success criteria met post-gap-fill). Time-to-vfix: 1 remediation task (gap fill). All phase gates passed (SA/QA/SX/RV). No escalations to human during delivery cycle; post-mortem escalates 4 protocol-level findings.</rationale>
  <dependencies>
    - Depends on: broadn-p1-005b (wave 6, source of tooltip issues), broadn-p1-005b-gap-R011 (gap fill that exposed auditor subagent policy gap), full sprint completion
    - Informs updates: gander/.claude/agents/frontend.md, gander/.claude/rules/standards.md, gander/.claude/agents/orchestrator.md, gander/.claude/skills/audit-pipeline.md
  </dependencies>
  <retention_keys>
    - Post-mortem document: docs/post-mortems/broadn-p1-dashboard-enhancements.md (full detailed findings, code diffs, remediation pseudocode)
    - Finding 1 — FE consolidation: FE#2 combined 2 task specs → ~110 LOC; FE#4 combined 2 task specs → ~95 LOC. Fix: Add "no consolidation without PM approval" rule to FE spec (agents/frontend.md)
    - Finding 2 — Data-contract pre-flight: Callbacks hard-code field names without validating against data.json schema. Fix: Checklist in standards.md for "field-name-dependent callbacks must pre-verify schema"
    - Finding 3 — Chart.js viewport offset: caretX/caretY are canvas-relative, not viewport-relative. position:fixed + canvas-relative coords = 200-300px offset. Fix: Chart.js rule in FE spec: "Convert canvas coords via getBoundingClientRect() before position:fixed"
    - Finding 4 — Auditor subagent policy: AUDITOR#8 subagent PASS verdict archived by ORC without human escalation. Violates veto-power transfer principle. Fix: Escalation rule in orchestrator.md: "If auditor subagent is blocked or policy-restricted, surface to human immediately"
    - Sprint summary: 8 tasks, 6 FE + 1 BE + 1 gap fill. 7/8 first-pass audit. 17/17 requirements COVERED post-gap-fill. 1 remediation cycle.
    - Key files affected: docs/post-mortems/broadn-p1-dashboard-enhancements.md (primary), gander/.claude/agents/frontend.md (update pending), gander/.claude/rules/standards.md (update pending), gander/.claude/agents/orchestrator.md (update pending)
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-22T00:00:00Z</timestamp>
  <task_id>agent-improvement-2026-03-22-1</task_id>
  <event_type>AGENT_IMPROVEMENT</event_type>
  <rationale>
    Acted on 6 protocol gaps identified in broadn-p1-dashboard-enhancements post-mortem. Modified 4 agent specification and standards files to close gaps:

    (1) **frontend.md v1.2.0** — Added task boundary compliance rule prohibiting agent-initiated consolidation of separate PM-mandated task specs without explicit ORC approval. Root cause from post-mortem: FE#2 and FE#4 independently violated the 50-line ceiling gate by consolidating multiple task specs into single implementations. Fix: Explicit non-consolidation rule requiring PM approval for any merge of separate task boundary definitions.

    (2) **pm.md v1.1.1** — Added visual type qualifier rule requiring explicit fill/border/text description in CSS state change criteria. Enables auditor to verify visual state changes against specification rather than subjective assessment. Prevents ambiguous state-change descriptions that fail QA gate.

    (3) **auditor.md v1.0.4** — Added MANUAL TEST TRACE enforcement gate: audit-pipeline FAIL if required interaction scenarios absent from agent completion packet. Closes gap where tooltip interaction testing was omitted from packet, causing miss in QA verification.

    (4) **orchestrator.md v1.1.1** — Added auditor subagent policy-block escalation procedure clarifying that auditor subagent verdicts cannot be archived by ORC without human escalation. Prevents self-audit pattern where ORC archives its own subagent PASS result, violating veto-power principle. If auditor subagent is blocked or policy-restricted by execution environment, this must surface to human immediately with full audit transcript.

    (5) **standards.md additions** — Added data-contract pre-flight requirement: callbacks accessing appData fields by name must pre-verify field names against data.json schema before implementation. Prevents undefined-value rendering from schema drift. Added Chart.js viewport-offset rule: caretX/caretY coordinates are canvas-relative, not viewport-relative; must convert via getBoundingClientRect() + scroll offset before applying position:fixed styling.

    (6) All 6 gaps from post-mortem root-cause analysis addressed; no gaps remain unresolved. Remediation is specification-level, not task-level — affects downstream agent behavior prospectively for all future tasks.
  </rationale>
  <dependencies>
    - Source: broadn-p1-dashboard-enhancements post-mortem (docs/post-mortems/broadn-p1-dashboard-enhancements.md) identified 6 protocol/specification gaps
    - Findings 1-4: Core protocol violations in agent task boundary compliance, auditor independence, and orchestrator policy
    - Findings 5: Specification gaps in data-contract validation and chart positioning logic
    - All 4 agent specs and 1 standards file updated as direct remediation
    - No external dependencies; improvements are self-contained
  </dependencies>
  <retention_keys>
    - Primary: docs/agent-improvements/agent-improvement-2026-03-22-1.md (full detailed improvement spec with before/after diffs)
    - Secondary: docs/agent-changelog.md (update entry with version bumps and change summary)
    - Modified files: .claude/agents/frontend.md (v1.2.0), .claude/agents/pm.md (v1.1.1), .claude/agents/auditor.md (v1.0.4), .claude/agents/orchestrator.md (v1.1.1), .claude/rules/standards.md (Chart.js + data-contract sections)
    - Key changes:
      * FE spec: "Non-consolidation rule: FE agent must not merge separate PM-mandated task specs without explicit ORC approval via <dag_update_request>. Violation results in AUDIT_FAIL at SA gate."
      * PM spec: "CSS state-change criteria must include explicit visual type qualifiers (fill: X, border: Y, text: Z). Ambiguous descriptions fail QA gate."
      * Auditor spec: "MANUAL_TEST_TRACE enforcement: Packet missing documented interaction scenarios for features with user-facing state changes results in AUDIT_FAIL at QA gate."
      * Orchestrator spec: "Auditor subagent verdicts must not be archived by ORC. If subagent usage is blocked or policy-restricted, escalate to human immediately with full audit transcript. No self-audit pattern."
      * Standards: "Data-contract pre-flight: Callbacks using appData[field] must verify field names against data.json schema before implementation. Chart.js rule: Convert canvas-relative coordinates to viewport coordinates via getBoundingClientRect() + scroll offset before position:fixed."
    - Metrics: 4 protocol-level improvements, 2 specification-level improvements, 0 gaps unresolved, 6/6 post-mortem findings closed.
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-23T00:20:00Z</timestamp>
  <task_id>broadn-p2-t2a-gap-markers</task_id>
  <event_type>TASK_COMPLETE</event_type>
  <rationale>Gap marker insertion for temporal charts in broadn-p2-dashboard-v2 sprint (wave 1a). FE#1 delivered pure transformation helper `insertGapMarkers(temporal)` that detects non-consecutive months in temporal data arrays and inserts null gap markers to render line breaks instead of continuous line segments across gaps. Rationale: Data may have sparse temporal coverage (e.g., samples collected in Jan, Mar, Jun, with no Feb/Apr/May data); connecting Jan→Mar directly obscures the gap visually. Solution: function iterates temporal array, detects month→month discontinuities (where consecutive array items have diff > 1 month or year boundary transition), inserts {label: '···', count: null} objects at gap positions. Chart.js treats null data values as breaks in line rendering. Implementation is stateless pure transformation — reads raw array, returns {labels, counts} object with null slots inserted. Zero side effects. No new Chart.js dependencies. Label uses U+00B7 (middle dot) as visual ellipsis indicator in x-axis ticks, chosen for compactness and chart-native rendering (non-UTF8 code point issues ruled out via browser console test). Year-boundary handling special-cased: Dec→Jan transition treated as expected 1-month gap, no marker inserted (timeline is contiguous). 4 wiring sites updated: renderTemporalChart() (line ~760), renderProjectView() (line ~1440), renderLocationView() (line ~1600), renderLabGroupView() (line ~1770) — each now calls insertGapMarkers(entry.temporal) before passing to Chart.js. Audit verdict PASS (SA: pure function no side effects, no DRY violation; QA: tested Dec→Jan boundary, Feb→May gap, single-month isolated entry; SX: no injection vectors, no external data fetch).</rationale>
  <dependencies>
    - Depends on: broadn-p2-dashboard-v2 sprint data schema (temporal array structure with month/year fields)
    - Unblocks: broadn-p2-t2b-charts-map (wave 1b, relies on temporal charts rendering cleanly)
  </dependencies>
  <retention_keys>
    - Function signature: insertGapMarkers(temporal) at line 744; takes array of {month: number, year: number, count: number} objects; returns {labels: [], counts: []} with null-marker objects inserted
    - Gap detection logic: iterates temporal array with index i; for each pair temporal[i] and temporal[i+1], calculates month distance as (temporal[i+1].year - temporal[i].year) * 12 + (temporal[i+1].month - temporal[i].month); if distance > 1, inserts {label: '···', count: null} at position i+1
    - Year boundary special case: Dec (month 12)→Jan (month 1) transition from year N to year N+1 evaluates to distance = 1 (correct: 12 months apart); no gap marker inserted (expected behavior)
    - Label format: '···' (three U+00B7 middle-dot characters, not '...' ASCII period chars); renders in Chart.js x-axis without font-rendering issues
    - Call sites (4 total): renderTemporalChart() reads entry.temporal, calls insertGapMarkers, destructures {labels, counts}, passes to new Chart.js instance; renderProjectView() wiring at line ~1440; renderLocationView() at line ~1600; renderLabGroupView() at line ~1770
    - Data contract: Consumes temporal array with {month: 1-12, year: 4-digit, count: number} structure; produces {labels: string[], counts: (number|null)[]} matching Chart.js line/bar dataset format
    - Performance: O(n) single pass through temporal array; no aggregation or sorting (assumes input is pre-sorted by time)
    - Chart integration: null count values in Chart.js dataset create line breaks (native Chart.js behavior, no custom plugin needed)
    - Files changed: index.html (insertGapMarkers function definition ~15 net new lines, 4 wiring calls ~4 lines = ~19 net new lines total)
    - Scope note: Temporal chart rendering only; does not affect sampler type, pipeline stage, or site-bar charts
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-23T01:15:00Z</timestamp>
  <task_id>broadn-p2-t2b-charts-map</task_id>
  <event_type>TASK_COMPLETE</event_type>
  <rationale>Chart and map interactivity for broadn-p2-dashboard-v2 sprint (wave 1b). FE#2 delivered DRY extraction of map constants, bi-directional chart-map linking, and sampler-type chart conversion to logarithmic scale. Rationale for each change: (1) MAP_CENTER_DEFAULT and MAP_ZOOM_DEFAULT extracted to CONSTANTS section at module top — coordinates appeared as raw literals [39.5, -98.35] in renderMap() and flyTo() calls; extraction eliminates duplication and enables single-point maintenance if map bounds change. (2) siteLatLonByCode object declared at module level and populated during renderMap() pass — enables highlightSite() callback (invoked on bar chart click) to look up site coordinates without re-scanning the site data structure. (3) highlightSite() now calls leafletMap.flyTo([lat, lon], 12) after lookup — provides visual feedback by centering map on selected site at zoom level 12. (4) clearSiteHighlight() resets map via leafletMap.setView(MAP_CENTER_DEFAULT, MAP_ZOOM_DEFAULT) — restores overview context when selection clears. (5) renderSamplerTypeChart() changed chart.js type from 'doughnut' to 'bar' with logarithmic y-axis (type: 'logarithmic') — enables detection of sampler types with very low counts that would be invisible in pie/doughnut (log scale compresses large count ranges into visible bar heights). Zero guard added for log scale safety: min value for dataset clamped to 1 (log(1) = 0, log(0) = undefined). (6) Tooltip customization verified: local bar chart uses ctx.parsed.y (vertical axis, correct for bars), shared tooltip function tooltipLabelSamples unchanged (still uses ctx.parsed.x, correct for horizontal bars in other charts). All wiring verified via console inspection and manual interaction test. Audit verdict PASS (SA: DRY extract + log-scale guard pattern sound, no code duplication; QA: bar rendering verified with low-count samplers, log scale edge case tested, map flyTo interaction confirmed; SX: no injection vectors, log scale safe-guarded, no new external data fetch).</rationale>
  <dependencies>
    - Depends on: broadn-p2-t2a-gap-markers (wave 1a, temporal charts must render cleanly for context)
    - Depends on: broadn-p2-dashboard-v2 sprint data schema (site lat/lon and sampler type cardinality)
    - Unblocks: broadn-p2-t1-design (wave 2, design polish applied after interactivity verified)
  </dependencies>
  <retention_keys>
    - CONSTANTS section additions: MAP_CENTER_DEFAULT = [39.5, -98.35], MAP_ZOOM_DEFAULT = 4
    - Module-level: var siteLatLonByCode = {} declared at top, populated in renderMap() loop as site.code → {lat, lon}
    - highlightSite(siteCode) function: looks up lat/lon in siteLatLonByCode[siteCode], calls leafletMap.flyTo([lat, lon], 12)
    - clearSiteHighlight() function: calls leafletMap.setView(MAP_CENTER_DEFAULT, MAP_ZOOM_DEFAULT)
    - renderSamplerTypeChart() change: options.scales.y = {type: 'logarithmic'} added; dataset values clamped to min: 1 for safety
    - Tooltip function state: bar chart's local tooltip uses ctx.parsed.y (vertical), tooltipLabelSamples callback unchanged (ctx.parsed.x for horizontal)
    - Files changed: index.html (~45 net new lines for constants, lookups, flyTo/setView calls, log scale config)
    - Integration points: renderMap() populates siteLatLonByCode; renderSamplerTypeChart() configures log axis and datasets; highlightSite() and clearSiteHighlight() wired to chart.js onClick and context-clear handlers
    - Edge cases verified: Log scale with count=0 (clamped to 1), count=1 (log(1)=0 displayed correctly), count>1000 (compressed visible in bar height)
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-23T01:45:00Z</timestamp>
  <task_id>broadn-p2-t1-design</task_id>
  <event_type>TASK_COMPLETE</event_type>
  <rationale>Design polish for broadn-p2-dashboard-v2 sprint (wave 2). FE#3 delivered color darkening, CSS cleanup, and font-family standardization per design spec. Rationale for each change: (1) Site-wide orange color darkened: --color-orange-500 changed from #f97316 to #ea6c00 and --color-orange-700 from #c2410c to #b33a00 — provides higher contrast and visual weight alignment with dashboard aesthetic. Change applied in :root CSS block (body styles). (2) CHART_COLORS.orangeAccent and orangeAccentDim synced to match new orange values #ea6c00 and #b33a00 respectively — ensures chart elements respect brand color update (caught in audit, required remediation). (3) Locator comment added above --color-orange-500 CSS variable for discoverability ("/* Primary orange accent, darkened to #ea6c00 in P2 redesign */"). (4) All rounded-* and shadow-* Tailwind classes removed from static HTML markup (inline class strings in divs/buttons/etc.) — reduces CSS footprint and simplifies layout engine. Special note: JS-generated class strings left untouched per scope boundary (task scope explicitly excludes dynamic class generation; if rounded/shadow appear in JS string concatenation, they remain). (5) Structural CSS rules cleaned: #map border-radius removed, #custom-tooltip border-radius removed; scrollbar and skeleton loader border-radius rules explicitly preserved as required per spec. (6) Chart.js config cleanup: borderRadius: 3 in bySite chart dataset config removed and set to 0 — provides crisp bar edges consistent with minimalist design. (7) Font-family baseline added to body: "font-family: Helvetica, Arial, system-ui, sans-serif" — ensures consistent typography across all browsers. First audit cycle caught that CHART_COLORS.orangeAccent still held old #f97316 value — immediate remediation pushed new orange values into color constants block. Second audit cycle verified all colors synced and CSS cleanup complete. Audit verdict PASS (SA after remediation: color constant synchronization required, CSS cleanup verified no duplicates; QA: visual regression testing on site-orange affected elements, rounded-edge removal verified no layout shift, font-family baseline confirmed consistent rendering; SX: no injection vectors, no hardcoded brand colors, no external font CDN introduced).</rationale>
  <dependencies>
    - Depends on: broadn-p2-t2b-charts-map (wave 1b, interactivity must be verified before design polish applied)
    - Design source: broadn-p2-design-spec (UI Designer deliverable, colors and typography defined)
  </dependencies>
  <retention_keys>
    - Color changes in :root CSS: --color-orange-500: #ea6c00 (was #f97316), --color-orange-700: #b33a00 (was #c2410c)
    - CHART_COLORS object updates: orangeAccent: '#ea6c00', orangeAccentDim: '#b33a00'
    - Locator comment added above --color-orange-500 in CSS for future maintenance reference
    - Tailwind cleanup: Removed rounded-md, rounded-lg, rounded-none, shadow-sm, shadow-md, shadow-lg from inline class strings in HTML markup (divs, buttons, sections)
    - Structural CSS changes: #map CSS rule border-radius removed; #custom-tooltip CSS rule border-radius removed; scrollbar and skeleton-loader rules retained (not modified)
    - Chart.js bySite dataset: borderRadius: 3 changed to borderRadius: 0
    - Font baseline: body { font-family: Helvetica, Arial, system-ui, sans-serif } added to CSS block
    - Files changed: index.html (~60 net modified lines: CSS var updates, class string cleanup, Chart.js config, font-family addition)
    - Audit remediation: First cycle identified CHART_COLORS.orangeAccent mismatch (still #f97316); remediation pushed new #ea6c00 value; second cycle verified sync complete
    - Edge cases verified: Orange color used in site selector highlights, chart legend, sampler-type bars — all rendered with new #ea6c00 shade; font-family fallback chain confirmed in dev console
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-23T20:46:57Z</timestamp>
  <task_id>broadn-p2-t3-filter</task_id>
  <event_type>TASK_COMPLETE</event_type>
  <rationale>Filter state model formalization for broadn-p2-dashboard-v2 sprint (wave 1a). FE#1 delivered complete slice+tag filter architecture refactoring and visual envelope styling. Problem: prior sprint used loose `sliceState` singleton containing only slice choices (category, group); new requirement adds tag-based filtering (multiple tags can be active simultaneously). Solution: (1) Formalized filterState data structure: filterState = { slice: { category: null|string, group: null|string }, tags: [] } — category and group coexist in slice subobject, tags array holds active tag identifiers. (2) Replaced all 13 read/write sites of sliceState with filterState, updating call sites across 6 functions (renderView, onSliceChange, isFilterActive, applyFilter, tag click handlers, panel updates). (3) Created isFilterActive() predicate returning true when any filter is active (slice.category OR slice.group OR tags.length > 0), used to toggle visual envelope. (4) Stubbed applyFilter(fs) function with documented comment explaining that T5 (tag-click-to-filter task) will implement the filtering logic; stub preserves contract signature for T5 dispatch. (5) Visual envelope architecture: created new `<div id="global-charts-area">` wrapper containing 3 global chart sections (overview, geography, pipeline); NOT wrapping explorer panel or slice selector (intentional containment to global-only charts). (6) CSS styling for filter-active state: `.filter-active-envelope { background-color: rgba(var(--color-orange-500-rgb), 0.07) }` — 7% opacity tint using orange-500 design token converted to RGB triplet for rgba() compatibility. (7) Added CSS custom property: --color-orange-500-rgb: 234, 108, 0 to :root, matching design token #ea6c00. (8) Envelope toggled dynamically in renderView() — checks isFilterActive(), conditionally adds class to #global-charts-area element. Audit verdict PASS (SA: filterState is single source of truth, DRY check on color token management; QA: filter state transitions tested (empty→active→inactive→multi-tag), envelope visual state verified; SX: no injection vectors in filter application paths, tag array bounds safe).</rationale>
  <dependencies>
    - Depends on: broadn-p2-dashboard-v2 sprint architecture (requires slice panel already rendered in wave 1)
    - Blocks: broadn-p2-t5-tags-fe (wave 1b, tag-click handler will call applyFilter() to activate tag filtering logic; applyFilter stub must not change signature before T5 dispatch)
  </dependencies>
  <retention_keys>
    - Data structure: filterState = { slice: { category: null or string, group: null or string }, tags: [] }; replaces scattered sliceState singleton
    - Dual-mode operation: slice filters (category/group) and tag filters (array) coexist independently; all three can be active simultaneously
    - isFilterActive() logic: returns (filterState.slice.category !== null || filterState.slice.group !== null || filterState.tags.length > 0)
    - applyFilter(fs) contract: receives filterState object, stub comment documents T5 will implement filter application (data masking, chart updates); do NOT change signature
    - Global-charts-area scope: wraps 3 sections only (overview temporal, geography map, pipeline stage bar); does NOT wrap explorer, slice panel, or sampler cards
    - CSS envelope styling: background-color: rgba(var(--color-orange-500-rgb), 0.07) — 7% opacity orange tint, non-disruptive background fill
    - Color token RGB conversion: #ea6c00 → RGB(234, 108, 0) stored as --color-orange-500-rgb custom property; used in rgba() for dynamic opacity
    - Envelope toggle: renderView() calls isFilterActive() then conditionally adds .filter-active-envelope class to #global-charts-area element
    - Migration scope: 13 sliceState sites updated across 6 functions; no breaking changes to data contracts or API
    - Backward compatibility: existing chart rendering paths functional; absence of applyFilter implementation does not break current UI (filter is visual-only stub for T5)
    - Files changed: index.html (filterState declaration, isFilterActive/applyFilter definitions, 13 read/write site updates, 1 div wrapper, 1 CSS rule, 1 custom property = ~45 net new lines total)
    - Scope note: Filter envelope styling and state model only; data masking logic deferred to broadn-p2-t5-tags-fe
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-23T21:15:33Z</timestamp>
  <task_id>broadn-p2-t4-tags-be</task_id>
  <event_type>TASK_COMPLETE</event_type>
  <rationale>Replicate tag parsing — BE data pipeline update for broadn-p2-dashboard-v2 sprint (wave 1b). BE#1 delivered refactored tag-grouping logic in `scripts/preprocess_data.py`. Problem: prior implementation used simple list-based tag storage with no semantic categorization; new requirement enables FE to render tags grouped by category (time_of_day, replicate, position, clock_quadrant, field_controls, other) rather than flat badge list. Solution: (1) Replaced `build_replicate_tags()` function with new `parse_replicate_tags(raw_tags_series: pd.Series) -> dict` in scripts/preprocess_data.py (lines 402–451). (2) New function returns dict with 6 always-present keys: time_of_day, replicate, position, clock_quadrant, field_controls, other. Each key maps to a list of matching tag tokens. Empty categories retain empty list (not None), providing predictable FE data contract. (3) Applied human-confirmed grouping rules: EC → field_controls (environmental control tag, not "other"); 7a/7p → time_of_day (shorthand for 7am/7pm); A1/A2/A3 → replicate (replicate identifiers); L/R → position (left/right); numeric prefixes 1-16 → clock_quadrant (clock position references); all else → other. (4) Regex pattern `^[RA]\d+$` captures both R-style and A-style replicate tokens (e.g., R1, A1, R999, A999) — confirmed equivalent by human review session (both encode replicate position, no semantic difference). (5) Updated 3 call sites: build_slice_project(), build_slice_location(), build_slice_lab_group() to unpack returned dict instead of consuming raw list; call signature compatible, no API breakage. (6) Script execution verified: exit code 0, regenerated data/data.json consistent with prior runs (field_samples=4571, sequenced=1475), no KPI regression. First audit cycle verified SA gate (regex correctness, rule application, dict contract); second cycle confirmed QA gate (data regeneration matches prior totals, script runtime stable); third cycle confirmed SX gate (no injection vectors in tag grouping, pandas series operations safe). Audit verdict PASS (all 3 gates).</rationale>
  <dependencies>
    - Depends on: broadn-p2-t3-filter (wave 1a, FE must have filterState.tags data structure ready to receive categorized tags from BE)
    - Blocks: broadn-p2-t5-tags-fe (wave 1b, FE filtering logic will iterate over categorized tags to apply filters; dict structure must be stable before FE implementation)
  </dependencies>
  <retention_keys>
    - Function signature: parse_replicate_tags(raw_tags_series: pd.Series) -> dict
    - Return contract: always 6 keys present in returned dict: {time_of_day: list, replicate: list, position: list, clock_quadrant: list, field_controls: list, other: list}
    - Grouping rules: EC→field_controls, 7a/7p→time_of_day, A1/A2/A3/RA\d+→replicate, L/R→position, 1-16→clock_quadrant, else→other
    - Replicate regex: ^[RA]\d+$ matches both R-style (e.g., R1) and A-style (e.g., A1) tokens; human confirmed equivalence, no filtering between types
    - Call site updates: build_slice_project(), build_slice_location(), build_slice_lab_group() all unpack returned dict instead of consuming raw list
    - Data contract: empty categories return empty list (e.g., {time_of_day: [], replicate: [...], ...}), never None — provides type-safe iteration for FE
    - Script verification: exit 0, data/data.json regenerated, KPI totals stable (field_samples=4571, sequenced=1475, no regression)
    - Files changed: scripts/preprocess_data.py (parse_replicate_tags definition ~50 lines, 3 call site updates ~5 lines total = ~55 net new lines)
    - Audit history: SA gate verified regex and rule application correctness; QA gate verified data regeneration totals; SX gate verified no injection vectors; all 3 gates PASS
    - Scope note: Tag grouping logic only; filtering application logic deferred to broadn-p2-t5-tags-fe (FE will implement chart masking and data filtering)
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-23T22:45:00Z</timestamp>
  <task_id>broadn-p2-t5-tags-fe</task_id>
  <event_type>TASK_COMPLETE</event_type>
  <rationale>Tag badge UI — FE implementation for broadn-p2-dashboard-v2 sprint (wave 3, final FE task). FE#5 delivered tag grouping UI that renders replicate tags grouped by category (time_of_day, replicate, position, clock_quadrant, field_controls, other) as clickable badge sets across all 4 slice containers (project, location, lab_group, global). Problem: Prior sprint (broadn-p1-dashboard-enhancements) rendered flat replicate badge arrays using `renderReplicateBadges()` function; new requirement splits tags into semantic groups with category headers and applies filter selection state. Solution: (1) Replaced flat `renderReplicateBadges(containerId, dataArray)` with new `renderTagGroups(containerId, dataDict)` function (lines 1045–1125) that accepts dict structure from BE (6 keys: time_of_day, replicate, position, clock_quadrant, field_controls, other). (2) New function iterates TAG_GROUP_ORDER constant (fixed array defining group render sequence) to ensure stable UI layout regardless of dict key iteration order. (3) For each non-empty group, renders h4 header with group label, then renders badges in a flex-wrap row for that group. Each badge is HTML `<button>` element with static class strings (no dynamic Tailwind construction). (4) TAG_BADGE_CLASSES constant defined (lines 1026–1043) with two static class strings: `.active` = "inline-flex items-center px-2.5 py-1 rounded text-sm font-medium bg-orange-700 text-white" (full background fill, WCAG AA contrast verified 4.8:1 on white); `.inactive` = "inline-flex items-center px-2.5 py-1 rounded text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50" (outlined style, reusing prior design). (5) Badge click handler toggles: if tag in filterState.tags, remove it; else add it. Each toggle calls applyFilter(filterState) to trigger filtering logic. (6) Enter/Space keyboard handlers added to all badges (line 1115–1124) matching toggle behavior, with aria-pressed attribute tracking active state. (7) All 4 call sites updated: renderProjectView (line 1505), renderLocationView (line 1672), renderLabGroupView (line 1799), initDashboard global aggregation (line 2304). Global aggregation rewritten (lines 2289–2303) to iterate dict keys and deduplicate tags across all projects — builds single combined dict with same 6 keys, collecting all unique tag tokens per category. (8) clearSliceFilter() updated to reset filterState.tags = [] and re-render all 4 badge containers to reflect deselection. Remediation cycle 1: Audit flagged WCAG AA contrast on orange-600 (3.55:1 insufficient); changed to orange-700 (4.8:1 pass). Audit also flagged double-escape in textContent context (escapeHtml() called on token, then token wrapped in textContent=; textContent auto-escapes, causing &amp; in display). Fix: removed escapeHtml() call, used raw token in textContent (auto-escape is safe for text nodes). Audit verdict PASS after remediation (SA: no DRY violation, static class strings verified, no dynamic Tailwind; QA: WCAG contrast confirmed, keyboard navigation verified for all 4 containers, toggle behavior tested; SX: no injection vectors, textContent auto-escape verified, no new CDN dependencies).</rationale>
  <dependencies>
    - Depends on: broadn-p2-t4-tags-be (wave 2, BE must emit dict-shaped replicate_tags before FE can render groups)
    - Depends on: broadn-p2-t3-filter (wave 1d, FE must have filterState.tags array and applyFilter stub ready before badge click handlers populate it)
    - Unblocks: Sprint completion (broadn-p2-dashboard-v2 final task in FE pipeline)
  </dependencies>
  <retention_keys>
    - Function signature: renderTagGroups(containerId, dataDict) at line 1045; takes dict with 6 keys, renders grouped badges with category headers
    - TAG_BADGE_CLASSES constant at lines 1026–1043: .active = "inline-flex items-center px-2.5 py-1 rounded text-sm font-medium bg-orange-700 text-white" (full bg, WCAG AA 4.8:1 contrast post-remediation), .inactive = "inline-flex items-center px-2.5 py-1 rounded text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50" (outlined, reuse)
    - TAG_GROUP_ORDER constant at module level: array of group keys in fixed render sequence (time_of_day, replicate, position, clock_quadrant, field_controls, other) — ensures stable layout
    - Iteration logic: renderTagGroups iterates TAG_GROUP_ORDER (not dict.keys()); skips empty groups; renders header + badges for non-empty groups
    - Badge HTML: `<button class="{class}" role="button" tabindex="0" aria-pressed="false">{tokenText}</button>` — aria-pressed tracks active state dynamically
    - Click handler: toggles tag in filterState.tags (add if absent, remove if present), then calls applyFilter(filterState)
    - Keyboard handler: Enter and Space keys invoke toggle behavior; preventDefault() called to avoid page scroll on Space
    - Text safety: badge.textContent = token (no escapeHtml call) — textContent auto-escapes HTML entities, double-escape fix per remediation 1
    - Global aggregation: initDashboard lines 2289–2303 rewritten to iterate globalTagsDict keys, deduplicate tags, build combined dict with same 6 keys
    - globalTagsDict declared at module level so clearSliceFilter() can reference it for re-render
    - clearSliceFilter() updated: resets filterState.tags = []; re-renders all 4 badge containers using globalTagsDict and slice-specific tag dicts
    - Call sites (4 total): renderProjectView line 1505 (entry.replicate_tags), renderLocationView line 1672 (entry.replicate_tags), renderLabGroupView line 1799 (entry.replicate_tags), initDashboard global line 2304 (aggregated globalTagsDict)
    - Data contract: Consumes replicate_tags dict with 6 keys (each key maps to list of token strings); tolerates missing keys (renders as empty) per defensive design
    - Remediation 1 — WCAG contrast: orange-600 → orange-700; SX gate flagged auto-escape double-escape, fixed by removing escapeHtml() call on textContent assignment
    - Files changed: index.html (+75 net lines) — TAG_BADGE_CLASSES constant (18 lines), renderTagGroups function (81 lines), global aggregation rewrite (15 lines), 4 call site updates (4 lines), clearSliceFilter update (2 lines); remediation removed 6 lines escapeHtml logic, net = +75
    - Scope note: Badge rendering and toggle state only; chart data filtering logic implemented in applyFilter stub (deferred to future sprint)
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-23T23:30:00Z</timestamp>
  <task_id>broadn-p3-t1-pipeline</task_id>
  <event_type>TASK_COMPLETE</event_type>
  <rationale>Tag filter data pipeline — new column support for broadn-p3-tag-filter sprint. BE#1 delivered forward-compatible preprocessing pipeline in `scripts/preprocess_data.py` to support 4 new Excel columns (Sample AM/PM, Sample Replicate, Sample Quadrant, Sample Position, Sample Field Control) that will be added to source xlsx by human operator tomorrow. Problem: Pipeline currently consumes only 6 columns from xlsx (Sample ID, Replicate, Quadrant, Position, Field Control, Tags); human is adding 4 new columns to xlsx to enable finer-grained sample categorization. Prior approach would require reactive script update after xlsx change, creating deployment lag. Solution: (1) Added 4 new column name constants at module top: COL_SAMPLE_AMPM, COL_SAMPLE_QUADRANT, COL_SAMPLE_POSITION, COL_SAMPLE_FC (lines 16–19). These are optional — script continues to function if columns absent from xlsx. (2) Defined `parse_tag_column(series)` helper (lines 140–148) to extract tokens from tag columns using space-split and lowercase normalization; available for future tokenization of new columns if needed. (3) Defined `build_tag_sample_counts(group, df_col_map) -> dict` function (lines 150–176) that counts per-token appearances across the 4 new columns when present. Function iterates col_map (dict of column names → Series or None), tokenizes each column, aggregates token counts, returns dict mapping token → count. (4) Updated `build_dashboard_data()` to construct col_map dict (lines 255–259) mapping each new column name to its pandas Series (or None if column absent from df). (5) All 3 slice builder calls (build_slice_project, build_slice_location, build_slice_lab_group) now receive col_map as second argument; each builder computes `tag_sample_counts = build_tag_sample_counts(group, col_map)` and adds it to returned dict (lines 339–340, 375–376, 410–411). (6) When xlsx lacks new columns, new_cols_present resolves False, col_map maps all entries to None, build_tag_sample_counts returns {} for every group, FE receives graceful empty dict (no crash, no stale data). Detection gates on 4 exclusively-new columns (not Sample Replicate which exists in both old and new schema) to avoid false-positive presence detection. (7) Old `parse_replicate_tags()` logic untouched — replicate_tags dict still emitted with 6 keys (time_of_day, replicate, position, clock_quadrant, field_controls, other); no API contract change. (8) Script execution verified: exit code 0, data/data.json regenerated with `tag_sample_counts: {}` in all slice entries (field_samples=4571, sequenced=1475, no KPI regression). Audit verdict PASS (SA: new constants follow naming convention, build_tag_sample_counts avoids dict/list duplication with parse_tag_column helper, graceful None handling; QA: data regeneration matches prior totals, script runtime stable; SX: pandas Series operations safe, no external API calls, no injection vectors in token counting).</rationale>
  <dependencies>
    - Depends on: broadn-p2-t5-tags-fe (wave 3, FE currently renders replicate_tags dict; new tag_sample_counts will be consumed by FE in future sprint for enhanced filtering)
    - Unblocks: FE enhancement sprint (once xlsx is updated with 4 new columns, script auto-populates tag_sample_counts without pipeline re-run)
  </dependencies>
  <retention_keys>
    - New column constants (module level): COL_SAMPLE_AMPM = "Sample AM/PM", COL_SAMPLE_QUADRANT = "Sample Quadrant", COL_SAMPLE_POSITION = "Sample Position", COL_SAMPLE_FC = "Sample Field Control"
    - parse_tag_column(series) helper at lines 140–148: space-split, lowercase normalize, return list of tokens; used by build_tag_sample_counts
    - build_tag_sample_counts(group, df_col_map) -> dict at lines 150–176: iterates col_map (dict of col_name → Series or None), tokenizes non-None Series, aggregates per-token counts, returns {token: count} or {} if all columns absent
    - build_dashboard_data() lines 255–259: constructs col_map = {COL_SAMPLE_AMPM: df[...] or None, COL_SAMPLE_QUADRANT: df[...] or None, COL_SAMPLE_POSITION: df[...] or None, COL_SAMPLE_FC: df[...] or None}; graceful .get() with default None
    - new_cols_present detection: gates on 4 exclusively-new columns (COL_SAMPLE_AMPM, COL_SAMPLE_QUADRANT, COL_SAMPLE_POSITION, COL_SAMPLE_FC); does NOT gate on "Sample Replicate" which exists in both old and new xlsx schema
    - Slice builder updates (3 call sites): build_slice_project (lines 339–340), build_slice_location (lines 375–376), build_slice_lab_group (lines 410–411) all call `tag_sample_counts = build_tag_sample_counts(group, col_map)` and add to dict
    - Data contract: tag_sample_counts key always present in returned dict; value is {token: count} dict or {} if new columns absent — FE receives predictable structure, no None fallback needed
    - Backward compatibility: replicate_tags dict (6 keys: time_of_day, replicate, position, clock_quadrant, field_controls, other) untouched; old FE filtering continues to function
    - Script verification: exit 0, data/data.json regenerated, KPI totals stable (field_samples=4571, sequenced=1475, no regression)
    - Files changed: scripts/preprocess_data.py (4 new constants ~4 lines, parse_tag_column ~9 lines, build_tag_sample_counts ~27 lines, col_map construction ~5 lines, 3 slice builder call sites ~3 lines = ~48 net new lines); data/data.json regenerated (tag_sample_counts: {} in all slices)
    - Scope note: Pipeline infrastructure only; FE visualization of tag_sample_counts deferred to future sprint (currently stub in FE, no rendering logic)
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-23T23:45:00Z</timestamp>
  <task_id>broadn-p3-t2-filter-fe</task_id>
  <event_type>TASK_COMPLETE</event_type>
  <rationale>Tag filter FE implementation — applyFilter function wired end-to-end for sample-level filtering using tag_sample_counts data structure. Problem: applyFilter was a stub that toggled badge visuals but did not filter the group list or update display counts. User-initiated badge clicks triggered toggle but had no downstream effect on visible data. Solution: (1) Implemented getFilteredCount(entry, activeTags) helper to compute effective sample count per entry when tags are filtered. Uses union approximation: sums individual token counts from entry.tag_sample_counts dict for all active tags, since exact deduplication would require raw sample data unavailable in static dashboard. When tag_sample_counts is {} (current state, xlsx not yet updated), function returns entry's base field_samples count as safe no-op fallback. (2) Fully implemented applyFilter(fs) to replace stub: (a) Reads current badge state from activeTagDict (global map of container_id → set of selected token strings). (b) Filters entry list in fs using getFilteredCount; discards entries with filtered count = 0. (c) Re-renders group list with filtered entries and updated sample counts. (d) Displays "No samples match" message when all entries filtered to 0. (e) Updates slice header count ("X samples total") to reflect filtered group total. (f) Renders amber notice in slice header when selected group itself has 0 filtered matches. (g) Does NOT call renderView() to avoid re-rendering charts; only updates group list DOM. (3) Data contract: Expects entry.tag_sample_counts dict (possibly empty {}); gracefully handles empty dict by returning base field_samples count. Preserves badge visual state across filter cycles. (4) Audit verdict PASS (SA: pure helper + mutation-isolated function, no state corruption; QA: tested with empty tag_sample_counts (current xlsx state) — all entries remain visible with base counts, badge toggling has no visible effect until xlsx updated; SX: DOM updates use textContent and append, no injection vectors).</rationale>
  <dependencies>
    - Depends on: broadn-p3-t1-pipeline (BE delivered tag_sample_counts structure in data.json; FE now consumes it)
    - Unblocks: Human xlsx update and script re-run (FE filtering will activate automatically without code changes)
  </dependencies>
  <retention_keys>
    - getFilteredCount(entry, activeTags) helper: returns union-approximated sample count (sum of per-token counts from tag_sample_counts), or base field_samples if tag_sample_counts is empty
    - applyFilter(fs) fully implemented: (a) reads activeTagDict state, (b) filters entry.field_samples via getFilteredCount, (c) re-renders group list DOM with filtered entries, (d) updates slice header count and renders "No samples match" message if all filtered to 0, (e) amber notice in header when selected group has 0 matches, (f) does NOT call renderView()
    - Data contract: entry.tag_sample_counts is dict mapping token → count (or {} if columns absent); entry.field_samples is base count (used as fallback when tag_sample_counts empty)
    - Union approximation: individual token counts may overlap (one sample could have multiple active tags); exact deduplication requires raw sample-level data not available in static dashboard; approximation acceptable for user-facing count hints
    - Current xlsx state: tag_sample_counts is {} in all entries (xlsx not yet updated by human); getFilteredCount gracefully returns base field_samples, applyFilter is effectively no-op until xlsx updated
    - Badge state preserved: activeTagDict global tracks selected tokens per container; filter cycle reads activeTagDict, applies filtering, maintains badge visual state
    - Chart rendering avoided: applyFilter mutates group list DOM only, does NOT call renderView(), avoiding unnecessary chart re-render overhead on every badge toggle
    - Files changed: index.html (+157 net lines)
    - Scope note: Sample-level filtering only (via tag_sample_counts); chart data filtering deferred (charts still display full dataset regardless of badge selection)
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-26T00:00:00Z</timestamp>
  <task_id>broadn-p3-tag-filter-postmortem</task_id>
  <event_type>POST_MORTEM</event_type>
  <rationale>Post-mortem documenting broadn-p3-tag-filter sprint completion (2026-03-23 → 2026-03-26). Three delivery phases: (1) BE pipeline infrastructure (tag_sample_counts emitter), (2) FE applyFilter wiring (sample-level filtering), (3) badge display + chart filtering (tag_groups grouped by source column, Option C slice charts re-render per active tags). Phases 1 and 2 completed with formal Critic review, agent dispatch, and full audit/archive cycle. Phase 3 (the largest feature surface: 3 new FE helpers, BE cross-tab generation, chart filtering logic) was implemented directly in main session by Orchestrator during iterative human feedback without dispatch-task invocation, Critic review, formal audit, or Archivist logging. This protocol bypass created three observable issues: (1a) Data contract drift: Phase 1 emitted `tag_sample_counts` (flat dict); Phase 3 superseded it with `tag_groups` (per-column dict) and added `tag_charts` (cross-tab). The key rename happened in main session without formal revision notice. Phase 2 code (applyFilter, getFilteredCount) was built against the old contract and would silently receive undefined if it attempted to read tag_sample_counts post-Phase-3. This was mitigated because Phase 3 also updated call sites in the same session, but if any consumer had been asynchronous or cached, invisible regression would have occurred. (1b) Validation baseline staleness: xlsx update increased sequenced sample count from 1475 to 2098; hardcoded validation constant was stale. Caught manually during Phase 3, not by agent-run script. (1c) Phase 3 shipped without audit or log trail. Root cause: Orchestrator entered implementation mode during iterative human conversation describing column values and selecting options (a natural interaction pattern); the conversational cadence suppressed the explicit "dispatch or direct?" protocol gate. Five protocol gaps identified for future sprints: (G1) Orchestrator must ask "dispatch or direct?" before implementing when human feedback is iterative/detaily rather than scope-only. (G2) Auditor spec needs cross-task data contract key validation: grep prior task keys in all downstream consumers. (G3) Validation constants in preprocess_data.py must be comment-flagged with verification date. (G4) Main-session direct implementation must write SPAWN/COMPLETE events to event log (treat as ORC#0 task). (G5) SESSION-CHECKPOINT must be updated at sprint close by Archivist, not left stale. Agents within formal pipeline: BE#1 (Phase 1) and FE#1 (Phase 2) both achieved 100% first-pass rate with zero remediation cycles. BE#1 self-corrected when brief referenced non-existent function; FE#1 delivered 157 net lines with correct textContent safety pattern. Both delivered to full audit spec. Chart filtering and tag badge display all confirmed working in live browser by human after Phase 3.</rationale>
  <dependencies>
    - Depends on: broadn-p3-t1-pipeline (Phase 1, formal delivery) and broadn-p3-t2-filter-fe (Phase 2, formal delivery)
    - Discovered gap blocking future sprints: Orchestrator protocol must be updated to enforce "dispatch or direct?" gate before main-session implementation of multi-domain features
  </dependencies>
  <retention_keys>
    - Post-mortem location: docs/post-mortems/broadn-p3-tag-filter.md
    - Phase 3 data contract change: entry.tag_sample_counts (Phase 1 output) does NOT exist in final data.json; superseded by entry.tag_groups = { colLabel: { token: count } } and entry.tag_charts = { colLabel: { token: { temporal, sample_types, pipeline, sampler_type_dist } } }
    - Any code reading entry.tag_sample_counts will silently receive undefined — no error thrown
    - Validation constant update: kpis.sequenced confirmed as 2098 (not 1475) after xlsx column expansion
    - Protocol gap G1: Add "dispatch or direct?" gate to orchestrator spec when human provides iterative detail during active session
    - Protocol gap G2: Auditor BE spec must grep prior task's data contract keys in all downstream consumers before PASS
    - Protocol gap G3: Validation constants in preprocess_data.py must have "# VERIFIED: YYYY-MM-DD" comment; auditor should flag constants older than most recent xlsx commit
    - Protocol gap G4: Orchestrator must write SPAWN/COMPLETE events for main-session direct work (agent_id: "ORC#0-direct")
    - Protocol gap G5: Archivist must update SESSION-CHECKPOINT as part of sprint-close procedure
    - 14 of 20 projects in final data.json have populated tag_groups; tag_charts cross-tab present for all 20
    - Location sub-sites chart and time-of-day polar chart are NOT filtered by active tags (no cross-tab dimensions for those)
    - Live browser verification: badge display (grouped by column), sidebar filtering, and Option C chart filtering all functional as of human confirmation 2026-03-26
    - FE helpers added in Phase 3: getSliceEntry(fs, entryId), mergeTagChartData(base, override), updateSliceCharts(fs, charts) — all internal utilities for chart filtering
    - Files modified: scripts/preprocess_data.py (updated hardcoded constant and added build_tag_groups + build_tag_charts functions), index.html (rewritten renderTagGroups, extended applyFilter section d for chart updates, added 3 FE helpers)
  </retention_keys>
</archive_entry>

<archive_entry>
  <timestamp>2026-03-26T00:30:00Z</timestamp>
  <task_id>agent-improvement-2026-03-26-1</task_id>
  <event_type>AGENT_IMPROVEMENT</event_type>
  <rationale>Acted on 5 protocol gaps from post-mortem docs/post-mortems/broadn-p3-tag-filter.md. Gaps identified during broadn-p3 delivery where Phase 3 (largest feature surface: badge display + chart filtering) bypassed formal dispatch-task, Critic, audit, and Archivist gates due to Orchestrator entering implementation mode during iterative human feedback. Changes implement 4 of 5 gaps; 1 remains deferred. (1) ORCHESTRATOR.md v1.1.2: Added explicit "dispatch or direct?" gate to Step 1 (PM Decomposition). When human provides iterative detail feedback (column values, option selection) during active session, Orchestrator now must ask before implementing inline. Rationale: iterative conversation pattern creates implicit mode-switch from "decompose and dispatch" to "implement directly"; gate surfaces this decision rather than suppressing it. Revised routing table clarifies that detailed feedback during sketch/option-eval does NOT inherently trigger dispatch — gate depends on scope scope complexity, not conversation tone. Implementation: new paragraph in routing rules explicitly blocking main-session direct implementation of multi-domain features without Critic review. (2) AUDITOR.md v1.0.5: Added BE-specific data contract validation gate. Before passing BE tasks that rename or restructure data.json keys, Auditor now greps the FE codebase for all references to prior key names (e.g., grep for "tag_sample_counts" before passing any BE task that replaces it with "tag_groups"). Rationale: current per-task audit cannot detect cross-task data contract drift; this gate bridges task boundary. Implementation: new line in BE audit checklist under SA (code standards): "Data contract validation: if task modifies data.json schema (renames keys, restructures objects), grep FE codebase for prior key names; confirm all usages are updated in same wave or already superseded. Report findings in audit pass note." (3) BACKEND.md v1.1.2: Hardcoded validation constants now require comment-flag. Every constant in preprocess_data.py that validates against source data (e.g., `assert sequenced == 1475`) must carry a `# VERIFIED: YYYY-MM-DD` comment indicating when it was last confirmed. Rationale: validation constants grow stale silently when source xlsx updates (happened in Phase 3: sequenced went 1475 → 2098). Comment flag surfaces staleness risk. Implementation: new rule in Backend agent spec under "Validation & Constants": "Any hardcoded KPI assertion (field_samples, sequenced, etc.) must have inline comment `# VERIFIED: YYYY-MM-DD — update after source xlsx schema changes`. Auditor checks constant ages against most recent xlsx commit; constants >90 days old in static data require explicit review." (4) ARCHIVIST.md v1.0.1: Archivist now updates SESSION-CHECKPOINT.md as part of sprint-close procedure. Prior state: SESSION-CHECKPOINT was updated manually by human or left stale, creating confusion when sprint resumed. New procedure: when Archivist logs final sprint completion entry to project_log.md, it also appends a summary to SESSION-CHECKPOINT.md recording (a) sprint task IDs and their final status (COMPLETE/BLOCKED/DEFERRED), (b) unresolved decisions still on the table, (c) key file paths modified, (d) any recurring gaps or patterns. Rationale: keeps operational instrument (SESSION-CHECKPOINT) in sync with archive (project_log.md) without manual sync burden. Implementation: new paragraph in Archivist spec under "Output & Event Logging": "After logging final sprint entry to project_log.md, append SESSION-CHECKPOINT update with: (1) sprint identifier and close timestamp, (2) task summary table (task_id | status | output), (3) open decisions block, (4) key paths block, (5) deferred work summary (if any). Format as Markdown with ISO dates; keep total under 50 lines per sprint for scannability." (5) ORCHESTRATOR.md event-logging gap (deferred): Post-mortem identified gap G4 — Orchestrator must write SPAWN/COMPLETE events for main-session direct work (treat as ORC#0 task with agent_id "ORC#0-direct"). This requires event log architecture change (currently assumes all tasks are agent-spawned; main-session work leaves no event trail). Deferred pending decision on whether direct-work events belong in same agent-events-{YYYY-MM-DD}.jsonl or separate observability stream. Current state: protocol gap logged in post-mortem, fix not implemented yet; flagged for next orchestrator revision cycle. All 4 implemented changes committed to agent specs at .claude/agents/ with version bumps. No changes to task registry, no code delivery, no downstream impact on currently-executing tasks. Agent specs remain backward-compatible (new rules are additive checklist items, not modifications to core agent responsibilities).</rationale>
  <dependencies>
    - Depends on: docs/post-mortems/broadn-p3-tag-filter.md (post-mortem identifying protocol gaps)
    - Unblocks: Future sprints where Orchestrator, Auditor, Backend, or Archivist agents are involved; improved protocol will prevent recurrence of Phase 3 issues
  </dependencies>
  <retention_keys>
    - Agent spec files modified with version updates:
      - .claude/agents/orchestrator.md: v1.1.1 → v1.1.2 (added "dispatch or direct?" gate in Step 1 routing)
      - .claude/agents/auditor.md: v1.0.4 → v1.0.5 (added BE data contract validation check in SA phase)
      - .claude/agents/backend.md: v1.1.1 → v1.1.2 (added "# VERIFIED: YYYY-MM-DD" comment requirement for validation constants)
      - .claude/agents/archivist.md: v1.0.0 → v1.0.1 (added SESSION-CHECKPOINT update procedure at sprint close)
    - Improvement summary recorded: docs/agent-improvements/agent-improvement-2026-03-26-1.md
    - Protocol gap G1 (Orchestrator dispatch gate): ADDRESSED in orchestrator.md v1.1.2, Step 1 routing section
    - Protocol gap G2 (cross-task data contract validation): ADDRESSED in auditor.md v1.0.5, BE audit checklist
    - Protocol gap G3 (validation constant comment-flags): ADDRESSED in backend.md v1.1.2, Validation & Constants section
    - Protocol gap G4 (event logging for direct work): DEFERRED pending observability architecture decision; gap documented in post-mortem
    - Protocol gap G5 (SESSION-CHECKPOINT sync): ADDRESSED in archivist.md v1.0.1, sprint-close procedure
    - No code changes; agent specs only
    - All agent improvements are additive checklist items (backward compatible); existing agent behavior unaffected
    - Key decision: deferring G4 until next sprint clarifies whether direct-work events should share or separate event log stream
  </retention_keys>
</archive_entry>
