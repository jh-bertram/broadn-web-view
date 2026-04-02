# Task Registry — broadn-p1

## Rollback Point
commit: 20d1cbfcb274abcbedbab42807e1848a105f2679
recorded: 2026-03-17T00:00:00Z
task_id: broadn-p1-web-view

To recover: git reset --hard 20d1cbfcb274abcbedbab42807e1848a105f2679

## Expectation Manifest

| task_id | agent | expected_tag | blocks |
|---|---|---|---|
| broadn-p1-data-prep | BE#1 | completion_packet | broadn-p1-fe-scaffold |
| broadn-p1-fe-scaffold | FE#1 | ui_packet | broadn-p1-fe-audit |

---

# Task Registry — broadn-p1-dashboard-enhancements

## Rollback Point
commit: cfb589b87dc57b98bc4a52a6a16caf4d267928f7
recorded: 2026-03-18T00:00:00Z
task_id: broadn-p1-dashboard-enhancements

To recover: git reset --hard cfb589b87dc57b98bc4a52a6a16caf4d267928f7

## Warning Resolutions (Critic Rev4 — 3 warnings, all folded into receipt checks)
- W1/001: BE agent must confirm actual xlsx column names for sampler type + replicate via df.columns inspection before writing constants — added to receipt check
- W2/005b-infra: Hover-only tooltip A11Y gap is accepted risk; agent must log justification in packet — added to receipt check
- W3/002: 300ms transition property must be grep-verifiable in CSS — added to receipt check

## Expectation Manifest

| task_id | agent | expected_tag | wave | blocks |
|---|---|---|---|---|
| broadn-p1-001 | BE#1 | completion_packet | 1a | 003a |
| broadn-p1-002 | FE#1 | ui_packet | 1b | 003a |
| broadn-p1-003a | FE#2 | ui_packet | 2 | 003b |
| broadn-p1-003b | FE#3 | ui_packet | 3 | 004 |
| broadn-p1-004 | FE#4 | ui_packet | 4 | 005a-map |
| broadn-p1-005a-map | FE#5 | ui_packet | 5 | 005a-chart |
| broadn-p1-005a-chart | FE#6 | ui_packet | 6 | 005b-infra |
| broadn-p1-005b-infra | FE#7 | ui_packet | 7 | 005b-callbacks |
| broadn-p1-005b-callbacks | FE#8 | ui_packet | 8 | NONE |

```xml
<expectation_manifest>
  <sprint_id>broadn-p1-dashboard-enhancements</sprint_id>
  <generated>2026-03-18T00:00:00Z</generated>

  <assignment>
    <task_id>broadn-p1-001</task_id>
    <agent>BE#1</agent>
    <expected_tag>completion_packet</expected_tag>
    <wave>1a (parallel with 002)</wave>
    <blocks>broadn-p1-003a</blocks>
    <receipt_check>
      <item>COL_SAMPLER_TYPE and COL_SAMPLE_REPLICATE constants defined in file</item>
      <item>Agent inspected df.columns and logged confirmed actual xlsx column names verbatim (CRITIC WARNING W1 — must appear in packet)</item>
      <item>sampler_type_dist key present inside slice_views.project[0], .location[0], .lab_group[0]</item>
      <item>replicate_tags key present inside slice_views.project[0], .location[0], .lab_group[0]</item>
      <item>replicate_tags entries are individual tokens (not raw CSV strings)</item>
      <item>SLICE_VIEWS VALIDATION block extended with spot-check print lines for both new keys</item>
      <item>Validation still prints "All 9 required keys present: PASS" (not 11)</item>
      <item>kpis.field_samples == 4571 confirmed</item>
      <item>pipeline.sequenced == 1475 confirmed</item>
      <item>python3 scripts/preprocess_data.py exit code 0</item>
      <item>[] fallback used if column absent or below fill threshold — confirmed</item>
    </receipt_check>
  </assignment>

  <assignment>
    <task_id>broadn-p1-002</task_id>
    <agent>FE#1</agent>
    <expected_tag>ui_packet</expected_tag>
    <wave>1b (parallel with 001)</wave>
    <blocks>broadn-p1-003a</blocks>
    <receipt_check>
      <item>--color-orange-500 and --color-orange-700 declared in :root with raw hex values</item>
      <item>CSS rule bodies outside :root use var(--color-orange-500) or var(--color-orange-700) — no raw hex in rule body declarations</item>
      <item>orangeAccent and orangeAccentDim added to CHART_COLORS object initialization block (not inside a function)</item>
      <item>.slice-chart-title-active CSS rule present using var(--color-orange-700)</item>
      <item>updateGroupItemSelection() applies orange-50/orange-700 classes to active item</item>
      <item>renderView() adds border-l-4 border-orange-500 to sliceContainer when group active</item>
      <item>300ms transition property present on sidebar and/or slice container selectors — grep-verifiable (CRITIC WARNING W3)</item>
      <item>Existing green category button states unchanged</item>
      <item>No JS errors on load</item>
      <item>Net new lines ≤ 50</item>
    </receipt_check>
  </assignment>

  <assignment>
    <task_id>broadn-p1-003a</task_id>
    <agent>FE#2</agent>
    <expected_tag>ui_packet</expected_tag>
    <wave>2</wave>
    <blocks>broadn-p1-003b</blocks>
    <receipt_check>
      <item>sliceProjectReplicateBadges div present in project slice panel grid</item>
      <item>sliceLocationReplicateBadges div present in location slice panel grid</item>
      <item>sliceLabGroupReplicateBadges div present in lab group slice panel grid</item>
      <item>globalReplicateBadges div present inside first .grid of section#pipeline after existing chart cards</item>
      <item>All new h3 elements carry class slice-chart-title-active</item>
      <item>SLICE_CHART_KEYS (or destroy-tracking equivalent) extended with badge container IDs</item>
      <item>renderReplicateBadges() defined with escapeHtml() on all badge strings</item>
      <item>renderReplicateBadges() has empty-data fallback</item>
      <item>Wired into renderProjectView(), renderLocationView(), renderLabGroupView(), initDashboard()</item>
      <item>No canvas elements added in this task</item>
      <item>No JS errors on load</item>
      <item>Net new lines ≤ 50</item>
    </receipt_check>
  </assignment>

  <assignment>
    <task_id>broadn-p1-003b</task_id>
    <agent>FE#3</agent>
    <expected_tag>ui_packet</expected_tag>
    <wave>3</wave>
    <blocks>broadn-p1-004</blocks>
    <receipt_check>
      <item>sliceProjectSamplerChart canvas present in project slice panel grid</item>
      <item>sliceLocationSamplerChart canvas present in location slice panel grid</item>
      <item>sliceLabGroupSamplerChart canvas present in lab group slice panel grid</item>
      <item>globalSamplerChart canvas present in section#pipeline (after globalReplicateBadges card)</item>
      <item>CHART_COLORS.samplerType defined in object initialization block — NOT inside a function body</item>
      <item>No hex literals in renderSamplerTypeChart() dataset.backgroundColor or dataset.borderColor</item>
      <item>destroyChart() guard present before each render call in renderSamplerTypeChart()</item>
      <item>destroyChart('globalSamplerChart') guard present in initDashboard() before global render</item>
      <item>Empty-data fallback renders p element rather than calling new Chart()</item>
      <item>All new h3 elements carry slice-chart-title-active class</item>
      <item>Wired into renderProjectView(), renderLocationView(), renderLabGroupView(), initDashboard()</item>
      <item>No JS errors on load</item>
      <item>Net new lines ≤ 50</item>
    </receipt_check>
  </assignment>

  <assignment>
    <task_id>broadn-p1-004</task_id>
    <agent>FE#4</agent>
    <expected_tag>ui_packet</expected_tag>
    <wave>4</wave>
    <blocks>broadn-p1-005a-map</blocks>
    <receipt_check>
      <item>formatMonth('2020-03') returns "Mar '20" — apostrophe present before 2-digit year</item>
      <item>buildTemporalChartOptions() x-scale has autoSkip: false</item>
      <item>buildTemporalChartOptions() x-scale has no maxTicksLimit line</item>
      <item>buildTemporalChartOptions() x-scale has title.display: true and title.text: 'Collection Date (Month/Year)'</item>
      <item>renderTemporalChart() inline x-scale config updated independently (separate config object from buildTemporalChartOptions)</item>
      <item>renderTemporalChart() inline x-scale also has autoSkip:false, no maxTicksLimit, title.display+text</item>
      <item>Y-axis config unchanged on all temporal charts</item>
      <item>No maxTicksLimit anywhere in temporal chart configurations</item>
      <item>Non-temporal charts untouched</item>
      <item>No JS errors on load</item>
      <item>Net new lines ≤ 50</item>
    </receipt_check>
  </assignment>

  <assignment>
    <task_id>broadn-p1-005a-map</task_id>
    <agent>FE#5</agent>
    <expected_tag>ui_packet</expected_tag>
    <wave>5</wave>
    <blocks>broadn-p1-005a-chart</blocks>
    <receipt_check>
      <item>activeHighlightSite = null declared at module level</item>
      <item>mapMarkersBySite = {} declared at module level</item>
      <item>renderMap() resets mapMarkersBySite = {} at start</item>
      <item>renderMap() stores mapMarkersBySite[site.code] = marker for each marker</item>
      <item>renderMap() binds marker.on('click', function(){highlightSite(site.code);}) per marker</item>
      <item>highlightSite() NOT implemented in this task (forward reference is intentional)</item>
      <item>No changes to renderBySiteChart()</item>
      <item>No JS errors on load</item>
      <item>Net new lines ≤ 50</item>
    </receipt_check>
  </assignment>

  <assignment>
    <task_id>broadn-p1-005a-chart</task_id>
    <agent>FE#6</agent>
    <expected_tag>ui_packet</expected_tag>
    <wave>6</wave>
    <blocks>broadn-p1-005b-infra</blocks>
    <receipt_check>
      <item>chartInstances.bySiteCodes array stored after chart creation in renderBySiteChart()</item>
      <item>options.onClick used in renderBySiteChart() Chart.js config — NOT canvas.addEventListener</item>
      <item>highlightSite(code) function defined at module level</item>
      <item>clearSiteHighlight() function defined at module level</item>
      <item>highlightSite() uses CHART_COLORS.orangeAccent and CHART_COLORS.orangeAccentDim — no inline hex literals</item>
      <item>clearSiteHighlight() uses CHART_COLORS.siteBar, CHART_COLORS.mapMarkerFill, CHART_COLORS.mapMarkerBorder — no inline hex</item>
      <item>Toggle behavior: clicking same code twice calls clearSiteHighlight()</item>
      <item>No changes to renderMap() in this task</item>
      <item>No JS errors on load or click</item>
      <item>Net new lines ≤ 50</item>
      <item>MANUAL TEST TRACE: packet documents all 4 scenarios — (1) click bar→marker+bar orange; (2) click same→clears; (3) click different→previous clears, new highlights; (4) no console errors</item>
    </receipt_check>
  </assignment>

  <assignment>
    <task_id>broadn-p1-005b-infra</task_id>
    <agent>FE#7</agent>
    <expected_tag>ui_packet</expected_tag>
    <wave>7</wave>
    <blocks>broadn-p1-005b-callbacks</blocks>
    <receipt_check>
      <item>div#custom-tooltip present in HTML body before closing body tag</item>
      <item>#custom-tooltip CSS uses position: fixed (NOT position: absolute)</item>
      <item>#custom-tooltip CSS has z-index: 9999</item>
      <item>#custom-tooltip CSS has display: none by default</item>
      <item>showCustomTooltip(x, y, htmlContent) defined at module level</item>
      <item>hideCustomTooltip() defined at module level</item>
      <item>A11Y accepted-risk logged in packet: "hover-only tooltip; Chart.js canvas elements are not keyboard-focusable without a custom plugin outside this sprint's scope" (CRITIC WARNING W2)</item>
      <item>No changes to renderDonutChart() or renderPipelineChart()</item>
      <item>No JS errors on load</item>
      <item>Net new lines ≤ 50</item>
    </receipt_check>
  </assignment>

  <assignment>
    <task_id>broadn-p1-005b-callbacks</task_id>
    <agent>FE#8</agent>
    <expected_tag>ui_packet</expected_tag>
    <wave>8</wave>
    <blocks>NONE</blocks>
    <receipt_check>
      <item>renderDonutChart() has enabled: false in tooltip plugin config</item>
      <item>renderDonutChart() has external: callback function</item>
      <item>renderDonutChart() external callback has null guard: appData &amp;&amp; appData.slice_views &amp;&amp; appData.slice_views.project</item>
      <item>renderPipelineChart() has enabled: false in tooltip plugin config</item>
      <item>renderPipelineChart() has external: callback with appData &amp;&amp; appData.pipeline null guard</item>
      <item>escapeHtml() called on ALL user-derived strings in both callbacks (project names, labels, counts as strings)</item>
      <item>escapeHtml() NOT redefined — single definition exists; no duplicate grep</item>
      <item>appData referenced by exact name (not data, not dashData) in both callbacks</item>
      <item>Both callbacks use showCustomTooltip() and hideCustomTooltip() from 005b-infra</item>
      <item>No changes to renderMap(), renderBySiteChart(), or any function other than renderDonutChart() and renderPipelineChart()</item>
      <item>No JS errors on load or hover</item>
      <item>Net new lines ≤ 50</item>
      <item>MANUAL TEST TRACE: packet documents all 4 hover scenarios — (1) hover donut segment→tooltip with top-5; (2) mouseout→tooltip hidden; (3) hover pipeline bar→tooltip; (4) no console errors</item>
    </receipt_check>
  </assignment>

</expectation_manifest>
```

---

# Task Registry — broadn-p2-slice-panel

## Rollback Point
commit: 20d1cbfcb274abcbedbab42807e1848a105f2679
recorded: 2026-03-17T03:45:00Z
task_id: broadn-p2-slice-panel

To recover: git reset --hard 20d1cbfcb274abcbedbab42807e1848a105f2679

## Expectation Manifest

| task_id | agent | expected_tag | blocks |
|---|---|---|---|
| broadn-p2-001 | BE#2 | completion_packet (column_inventory) | broadn-p2-002 |
| broadn-p2-002 | BE#3 | completion_packet (slice_views Zod contract) | broadn-p2-003 |
| broadn-p2-003 | UI#2 | design_spec | broadn-p2-004a |
| broadn-p2-004a | FE#2 | ui_packet (sidebar + state) | broadn-p2-004b |
| broadn-p2-004b | FE#3 | ui_packet (chart renderers) | audit |

```xml
<expectation_manifest>
  <sprint_id>broadn-p2-slice-panel</sprint_id>
  <generated>2026-03-17T03:50:00Z</generated>
  <assignments>

    <assignment>
      <task_id>broadn-p2-001</task_id>
      <agent>BE#2</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/broadn-p2-001-BE-*.md</expected_file>
      <wave>0</wave>
      <blocks>broadn-p2-002</blocks>
      <receipt_check>
        <item>column_inventory section present in packet</item>
        <item>Lab Group/PI field: exact column name OR explicit "NOT FOUND" statement</item>
        <item>Collection Height field: exact column name OR explicit "NOT FOUND" statement</item>
        <item>Collection Time field: exact column name OR explicit "NOT FOUND" statement</item>
        <item>Fill rates reported on FIELD SAMPLES ONLY (not total rows) for each found column</item>
        <item>Project ID full distribution: all unique values with field-sample counts (not truncated)</item>
        <item>Location + Specific Site value pairs: all unique combinations with field-sample counts</item>
        <item>Script run output present showing xlsx shape/row count (evidence of actual execution)</item>
        <item>No assumptions about column names without script evidence</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>broadn-p2-002</task_id>
      <agent>BE#3</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/broadn-p2-002-BE-*.md</expected_file>
      <wave>1</wave>
      <blocks>broadn-p2-003</blocks>
      <receipt_check>
        <item>Updated scripts/preprocess_data.py included (full file or diff)</item>
        <item>Zod contract extension present: schemas for slice_views.project, .location, .lab_group entries</item>
        <item>Script run output confirming all 9 keys present and existing 8 keys unchanged</item>
        <item>kpis.field_samples = 4571 confirmed in script output</item>
        <item>pipeline.sequenced = 1475 confirmed in script output</item>
        <item>Explicit statement of which Lab Group column was used (or NOT FOUND)</item>
        <item>Explicit statement on height_distribution and time_distribution inclusion + fill rates</item>
        <item>data.json file size reported</item>
        <item>No changes to existing pipeline values</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>broadn-p2-003</task_id>
      <agent>UI#2</agent>
      <expected_tag>design_spec</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/broadn-p2-003-UI-*.md</expected_file>
      <wave>2</wave>
      <blocks>broadn-p2-004a</blocks>
      <receipt_check>
        <item>Sidebar layout spec present (desktop fixed-width + mobile drawer)</item>
        <item>State model documented: default / category selected / group selected</item>
        <item>Project view: 3 charts specified (type, title, data keys, aria-label for each)</item>
        <item>Location view: 3 core + 2 optional charts specified; fallback for absent optional data documented</item>
        <item>Lab Group view: 3 charts specified; empty-array graceful degradation UI documented</item>
        <item>Keyboard interaction pattern documented (arrow keys, Enter, Escape)</item>
        <item>Color palette table with exact hex values for each new dataset</item>
        <item>No raw hex values in HTML/Tailwind section (Color Rule B observed)</item>
        <item>All chart canvas aria-label strings specified</item>
        <item>No ambiguity about data key names (must match Zod contract from 002)</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>broadn-p2-004a</task_id>
      <agent>FE#2</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/broadn-p2-004a-FE-*.md</expected_file>
      <wave>3</wave>
      <blocks>broadn-p2-004b</blocks>
      <receipt_check>
        <item>Updated index.html confirmed written to disk</item>
        <item>Manual test log: default view → category click → group list → group click → clear filter cycle documented</item>
        <item>Manual test log: slice_views key absent from data.json — no JS errors, default 7 charts render</item>
        <item>Data shape validation guard in initDashboard() confirmed intact and fires before renderView()</item>
        <item>initDashboard() called once from DOMContentLoaded only — confirmed</item>
        <item>renderView() does not call back into initDashboard() — confirmed</item>
        <item>Clear-filter event listener wired once in initDashboard(), not re-attached on renderView() — confirmed</item>
        <item>SLICE_CATEGORIES constant defined; no inline category string duplicates — confirmed</item>
        <item>All sidebar interactive elements have aria attributes — confirmed</item>
        <item>No dynamic Tailwind class construction — confirmed</item>
        <item>No hex/rgb values added — confirmed</item>
        <item>index.html is the only file modified — confirmed</item>
        <item>Verification gate pass (SA + QA) recorded in agent log before commit</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>broadn-p2-004b</task_id>
      <agent>FE#3</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/broadn-p2-004b-FE-*.md</expected_file>
      <wave>4</wave>
      <blocks>NONE</blocks>
      <receipt_check>
        <item>Updated index.html confirmed written to disk</item>
        <item>Manual test log: all 4 scenarios (a) category→group list, (b) group→chart view, (c) clear-filter→default, (d) keyboard tab+Enter</item>
        <item>Manual test log: empty-array lab_group produces no JS errors</item>
        <item>Manual test log: Location optional charts (height, time) hide gracefully when data absent</item>
        <item>All new hex/rgb values in CHART_COLORS — no hex literals outside that block confirmed</item>
        <item>All new chart canvases have aria-label and role="img" — confirmed</item>
        <item>Chart.js instances destroyed on view switch (chartRegistry or equivalent) — confirmed</item>
        <item>renderView() does not call initDashboard() — confirmed</item>
        <item>SLICE_CATEGORIES constant used for routing comparisons — confirmed</item>
        <item>No dynamic Tailwind class construction — confirmed</item>
        <item>index.html is the only file modified — confirmed</item>
        <item>Verification gate pass (SA + QA) recorded in agent log before commit</item>
      </receipt_check>
    </assignment>

  </assignments>
</expectation_manifest>
```

---

# Task Registry — broadn-p2-dashboard-v2

## Rollback Point
commit: a2650643e67b828e0de2e0f75efa431359f56169
recorded: 2026-03-23T12:10:00Z
task_id: broadn-p2-dashboard-v2

To recover: git -C /home/jhber/projects/broadn-web-view reset --hard a265064

## Plan Revision
- Rev 0 (2026-03-22): Initial decomposition (5 tasks, t2-charts undivided)
- Rev 1 (2026-03-23): CRITIQUE_BLOCK addressed — 6 tasks, t2 split into t2a/t2b, all BLOCKERs and WARNINGs resolved

## Human Review Gates
- After broadn-p2-t4-tags-be discovery report: human must review tag groupings before Wave 3 (broadn-p2-t5-tags-fe) is dispatched.

## Expectation Manifest (Rev 1 — 6 tasks)

| task_id | agent | wave | status | depends_on |
|---|---|---|---|---|
| broadn-p2-t2a-gap-markers | FE#1 | 1a | PENDING | — |
| broadn-p2-t2b-charts-map | FE#2 | 1b | PENDING | t2a (file-conflict seq) |
| broadn-p2-t1-design | FE#3 | 1c | PENDING | t2b (file-conflict seq) |
| broadn-p2-t3-filter | FE#4 | 1d | PENDING | t1-design (file-conflict seq) |
| broadn-p2-t4-tags-be | BE#1 | 2 | PENDING | — |
| broadn-p2-t5-tags-fe | FE#5 | 3 | PENDING | t4-tags-be, t3-filter |

```xml
<expectation_manifest>
  <sprint_id>broadn-p2-dashboard-v2</sprint_id>
  <generated>2026-03-23T00:00:00Z</generated>
  <revision>1</revision>
  <assignments>

    <assignment>
      <task_id>broadn-p2-t2a-gap-markers</task_id>
      <agent>FE#1</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/broadn-p2-t2a-gap-markers-FE-*.md</expected_file>
      <wave>1a</wave>
      <blocks>broadn-p2-t2b-charts-map</blocks>
      <receipt_check>
        <item>insertGapMarkers() function definition present in index.html</item>
        <item>Called from renderTemporalChart() — confirmed in packet</item>
        <item>Called from renderProjectView() temporal chart render — confirmed in packet</item>
        <item>Called from renderLocationView() temporal chart render — confirmed in packet</item>
        <item>Called from renderLabGroupView() temporal chart render — confirmed in packet</item>
        <item>Year-boundary test documented: 2020-12 → 2021-01 = consecutive (no gap), 2020-11 → 2021-01 = gap</item>
        <item>No new CDN script tags in index.html</item>
        <item>No changes to non-temporal charts</item>
        <item>estimated_new_lines value stated in packet and ≤ 50</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>broadn-p2-t2b-charts-map</task_id>
      <agent>FE#2</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/broadn-p2-t2b-charts-map-FE-*.md</expected_file>
      <wave>1b</wave>
      <blocks>broadn-p2-t1-design</blocks>
      <receipt_check>
        <item>MAP_CENTER_DEFAULT constant declared in CONSTANTS section</item>
        <item>MAP_ZOOM_DEFAULT constant declared in CONSTANTS section</item>
        <item>renderMap() references MAP_CENTER_DEFAULT and MAP_ZOOM_DEFAULT — no raw coordinate or zoom literals in renderMap() or clearSiteHighlight()</item>
        <item>siteLatLonByCode declared at module level, populated in renderMap()</item>
        <item>highlightSite() contains leafletMap.flyTo() call</item>
        <item>clearSiteHighlight() contains leafletMap.setView(MAP_CENTER_DEFAULT, MAP_ZOOM_DEFAULT)</item>
        <item>renderSamplerTypeChart() uses type: 'bar' (not 'doughnut')</item>
        <item>renderSamplerTypeChart() y-axis scale has type: 'logarithmic'</item>
        <item>Zero-count guard present in renderSamplerTypeChart() — data.json check result reported in packet</item>
        <item>Local tooltip callback in renderSamplerTypeChart uses ctx.parsed.y (not ctx.parsed.x)</item>
        <item>Shared tooltipLabelSamples function unchanged</item>
        <item>No new CDN script tags</item>
        <item>estimated_new_lines value stated in packet and ≤ 50</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>broadn-p2-t1-design</task_id>
      <agent>FE#3</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/broadn-p2-t1-design-FE-*.md</expected_file>
      <wave>1c</wave>
      <blocks>broadn-p2-t3-filter</blocks>
      <receipt_check>
        <item>grep -n "rounded-" index.html returns zero results (excluding rounded-none)</item>
        <item>grep -n "shadow-" index.html returns zero results</item>
        <item>grep -n "border-radius" index.html returns exactly 2 lines: scrollbar-thumb (line 26) and skeleton (line 61)</item>
        <item>borderRadius: 3 in bySite chart dataset config removed or set to 0 — confirmed in packet</item>
        <item>#map border-radius removed or set to 0 — confirmed in packet</item>
        <item>#custom-tooltip border-radius removed or set to 0 — confirmed in packet</item>
        <item>::-webkit-scrollbar-thumb border-radius explicitly preserved — confirmed in packet</item>
        <item>.skeleton border-radius explicitly preserved — confirmed in packet</item>
        <item>font-family: Helvetica (or equivalent stack) present in CSS</item>
        <item>--color-orange-500 value darker than #f97316</item>
        <item>--color-orange-700 value darker than #c2410c</item>
        <item>Locator comment present immediately above --color-orange-500 declaration</item>
        <item>Skeleton loader gradient animation CSS unchanged</item>
        <item>No JS logic modified</item>
        <item>estimated_new_lines value stated in packet and ≤ 50</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>broadn-p2-t3-filter</task_id>
      <agent>FE#4</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/broadn-p2-t3-filter-FE-*.md</expected_file>
      <wave>1d</wave>
      <blocks>broadn-p2-t5-tags-fe</blocks>
      <receipt_check>
        <item>filterState object declared with .slice.category, .slice.group, and .tags fields</item>
        <item>grep for "sliceState" in index.html returns zero results</item>
        <item>isFilterActive() function present and returns boolean</item>
        <item>applyFilter(filterState) stub present with documented comment</item>
        <item>.filter-active-envelope CSS class present in style block using var(--color-orange-500) or derived custom property — NOT bg-orange-50 Tailwind utility</item>
        <item>Visual type: full background fill (not border-only) — confirmed by class definition in packet</item>
        <item>Envelope class toggled on correct wrapper element — element ID or selector stated in packet</item>
        <item>No hardcoded #f97316 or rgba(249,115,22,...) outside :root or CHART_COLORS block</item>
        <item>All existing slice panel behavior unchanged (regression confirmed in manual test trace)</item>
        <item>Manual test trace present with all 5 required items:
          (1) activate filter → envelope visible;
          (2) clear filter → envelope disappears;
          (3) isFilterActive() false when both null/empty;
          (4) isFilterActive() true when slice set;
          (5) applyFilter() callable without error</item>
        <item>estimated_new_lines value stated in packet and ≤ 50</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>broadn-p2-t4-tags-be</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/broadn-p2-t4-tags-be-BE-*.md</expected_file>
      <wave>2</wave>
      <blocks>broadn-p2-t5-tags-fe</blocks>
      <receipt_check>
        <item>Discovery report written to .claude/agents/tasks/outputs/broadn-p2-t4-tags-be-discovery-*.md</item>
        <item>Discovery report contains all unique raw tag values with counts</item>
        <item>Discovery report contains list of comma-separated multi-value entries</item>
        <item>Discovery report contains proposed grouping for each value</item>
        <item>Discovery report flags any ambiguous values (especially B)</item>
        <item>Human review confirmed (Orchestrator gate) before implementation proceeds</item>
        <item>parse_replicate_tags() function present in preprocess_data.py</item>
        <item>build_slice_project() emits replicate_tags as dict (not list) — line 465 call site updated</item>
        <item>build_slice_location() emits replicate_tags as dict (not list) — line 526 call site updated</item>
        <item>build_slice_lab_group() emits replicate_tags as dict (not list) — line 582 call site updated</item>
        <item>python3 scripts/preprocess_data.py exits 0</item>
        <item>data/data.json: replicate_tags in at least one slice entry is a JSON object (not array)</item>
        <item>All 6 grouping keys present: time_of_day, replicate, position, clock_quadrant, field_controls, other</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>broadn-p2-t5-tags-fe</task_id>
      <agent>FE#5</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/broadn-p2-t5-tags-fe-FE-*.md</expected_file>
      <wave>3</wave>
      <blocks>NONE</blocks>
      <receipt_check>
        <item>renderTagGroups() function present in index.html</item>
        <item>grep -n "renderReplicateBadges" index.html returns zero results — confirmed in packet</item>
        <item>TAG_BADGE_CLASSES constant defined with full static string literals for active and inactive states</item>
        <item>No dynamic Tailwind class construction in renderTagGroups or click handlers</item>
        <item>Global aggregation block rewritten to iterate dict shape — dict-walk logic confirmed in packet</item>
        <item>renderTagGroups called at all 4 former renderReplicateBadges call sites (lines 1505, 1672, 1799, 2304)</item>
        <item>Tag badge click handler adds tag to filterState.tags</item>
        <item>Clicking same badge removes from filterState.tags (toggle)</item>
        <item>applyFilter(filterState) called on each toggle</item>
        <item>Clear filter resets filterState.tags to []</item>
        <item>Active badge: full background fill (not border-only) — TAG_BADGE_CLASSES.active value stated in packet</item>
        <item>WCAG AA contrast on active badge — confirmed in packet</item>
        <item>All badges keyboard-navigable: Enter and Space toggle — confirmed in manual test trace</item>
        <item>No new CDN dependencies</item>
        <item>No hardcoded #f97316 or rgba(249,115,22,...) outside :root or CHART_COLORS</item>
        <item>Manual test trace present with all 6 required items:
          (1) click badge → active state + envelope;
          (2) click same → removed + envelope clears;
          (3) keyboard Enter/Space toggles;
          (4) clear filter resets tags;
          (5) active badge has full bg fill confirmed by class name;
          (6) accepted-risk note for Playwright Tier 2</item>
        <item>estimated_new_lines value stated in packet; justification for exceeding 50-line ceiling documented</item>
      </receipt_check>
    </assignment>

  </assignments>
</expectation_manifest>
```

---

# Task Registry — broadn-p3-tag-filter

## Rollback Point
commit: a2650643e67b828e0de2e0f75efa431359f56169
recorded: 2026-03-23T00:00:00Z
task_id: broadn-p3-tag-filter

To recover: git -C /home/jhber/projects/broadn-web-view reset --hard a2650643e67b828e0de2e0f75efa431359f56169

## Expectation Manifest

| task_id | agent | wave | depends_on |
|---|---|---|---|
| broadn-p3-t1-pipeline | BE#1 | 1 | — |
| broadn-p3-t2-filter-fe | FE#1 | 2 | t1-pipeline |

---

# Task Registry — broadn-p4-2026-03-26

## Rollback Point
commit: 2ceab09
recorded: 2026-03-26T00:05:00Z
task_id: broadn-p4-2026-03-26

To recover: git -C /home/jhber/projects/broadn-web-view reset --hard 2ceab09

## Sprint Summary
FE-only sprint. 4 features, single file (index.html), all tasks strictly sequential due to file-conflict deps.

Wave ordering:
  Wave 1: broadn-p4-t1-sidebar-toggle
  Wave 2: broadn-p4-t2-border-cleanup (deps: t1)
  Wave 3: broadn-p4-t3-bar-charts (deps: t2)
  Wave 4: broadn-p4-t4-bysite-show-all (deps: t3)

## Expectation Manifest

| task_id | agent | wave | expected_tag | blocks |
|---|---|---|---|---|
| broadn-p4-t1-sidebar-toggle | FE#1 | 1 | ui_packet | t2-border-cleanup |
| broadn-p4-t2-border-cleanup | FE#2 | 2 | ui_packet | t3-bar-charts |
| broadn-p4-t3-bar-charts | FE#3 | 3 | ui_packet | t4-bysite-show-all |
| broadn-p4-t4-bysite-show-all | FE#4 | 4 | ui_packet | NONE |

```xml
<expectation_manifest>
  <sprint_id>broadn-p4-2026-03-26</sprint_id>
  <generated>2026-03-26T00:05:00Z</generated>
  <assignments>

    <assignment>
      <task_id>broadn-p4-t1-sidebar-toggle</task_id>
      <agent>FE#1</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/broadn-p4-t1-sidebar-toggle-FE-*.md</expected_file>
      <wave>1</wave>
      <blocks>broadn-p4-t2-border-cleanup</blocks>
      <receipt_check>
        <item>slice-btn-all button present as FIRST list item in #slice-category-list</item>
        <item>On page load: slice-btn-all has active visual state (full bg fill, not border-only) — class names stated in packet</item>
        <item>updateCategoryButtonStates() updated to include slice-btn-all</item>
        <item>#global-charts-area hide/show logic present — tied to filterState.slice.category !== null</item>
        <item>Clicking any slice category button hides #global-charts-area — confirmed in manual test trace</item>
        <item>Clicking slice-btn-all shows #global-charts-area and resets slice state — confirmed</item>
        <item>clearSliceFilter() produces same result as clicking slice-btn-all — confirmed</item>
        <item>Exactly one button active at all times — no zero-active, no two-active state possible</item>
        <item>Visual type qualifier confirmed: full background fill (NOT border-l accent)</item>
        <item>Manual test trace covers all 5 required items (page load, click Project, click All, select group, Clear filter)</item>
        <item>No chart type changes in this task</item>
        <item>No border class changes in this task</item>
        <item>index.html is the only file modified</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>broadn-p4-t2-border-cleanup</task_id>
      <agent>FE#2</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/broadn-p4-t2-border-cleanup-FE-*.md</expected_file>
      <wave>2</wave>
      <blocks>broadn-p4-t3-bar-charts</blocks>
      <receipt_check>
        <item>grep for "border border-stone-200" on chart card wrappers in #global-charts-area returns zero results</item>
        <item>grep for "border border-stone-200" on chart card wrappers in #slice-view-container returns zero results</item>
        <item>HTML comment format matches spec: "<!-- CHART CARD BORDER — removed; add ..." at each removal site</item>
        <item>CSS comment section present in style block explaining chart card border and background tuning</item>
        <item>Sidebar structural border (aside border-r) untouched — confirmed</item>
        <item>No chart type changes in this task</item>
        <item>index.html is the only file modified</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>broadn-p4-t3-bar-charts</task_id>
      <agent>FE#3</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/broadn-p4-t3-bar-charts-FE-*.md</expected_file>
      <wave>3</wave>
      <blocks>broadn-p4-t4-bysite-show-all</blocks>
      <receipt_check>
        <item>grep for "type: 'line'" on temporal chart constructors returns zero results</item>
        <item>grep for "type: 'polarArea'" returns zero results anywhere in index.html</item>
        <item>All 4 temporal chart constructors have type: 'bar' — confirmed in packet</item>
        <item>Time-of-day chart has type: 'bar' — confirmed in packet</item>
        <item>Time-of-day tooltip callback uses ctx.parsed.y (not ctx.parsed.r) — confirmed in packet</item>
        <item>Line-specific dataset props (tension, fill, pointBackgroundColor, pointRadius, pointHoverRadius) removed from all converted charts</item>
        <item>All 5 converted chart datasets have backgroundColor property</item>
        <item>All 5 affected canvas aria-labels updated to say "Bar chart"</item>
        <item>autoSkip: false and month format ("Mar '20") unchanged — confirmed</item>
        <item>At least one CSS comment marks temporal bar color tuning location</item>
        <item>donut, pipeline, by-site, map, sampler charts untouched — confirmed</item>
        <item>index.html is the only file modified</item>
      </receipt_check>
    </assignment>

    <assignment>
      <task_id>broadn-p4-t4-bysite-show-all</task_id>
      <agent>FE#4</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/broadn-p4-t4-bysite-show-all-FE-*.md</expected_file>
      <wave>4</wave>
      <blocks>NONE</blocks>
      <receipt_check>
        <item>bySiteChart canvas is NOT inside a div.chart-wrap wrapper — confirmed in packet</item>
        <item>renderBySiteChart() contains MIN_BAR_HEIGHT constant with comment</item>
        <item>renderBySiteChart() applies dynamic style.height to bySiteChartWrap element</item>
        <item>y.ticks.autoSkip: false present in renderBySiteChart() options</item>
        <item>Scroll container with max-height and overflow-y: auto wraps chart — confirmed in packet</item>
        <item>HTML comment at scroll container max-height value for human tuning</item>
        <item>HTML comment at MIN_BAR_HEIGHT constant for human tuning</item>
        <item>New wrapper div has position: relative in style — confirmed (required for Chart.js)</item>
        <item>No other charts affected — confirmed</item>
        <item>Geography section layout unchanged except bySiteChart wrapper replacement</item>
        <item>index.html is the only file modified</item>
      </receipt_check>
    </assignment>

  </assignments>
</expectation_manifest>
```

## Rollback Point
commit: af1c5406e2018f5e7399218fbf0556403974a856
recorded: 2026-03-27T23:55:00Z
task_id: broadn-p5-2026-03-27

To recover: git -C /home/jhber/projects/broadn-web-view reset --hard af1c5406e2018f5e7399218fbf0556403974a856

## Rollback Point — p6
commit: ce6fbead4013bc3e3e03a7b05df243138a462cd4
recorded: 2026-03-28T05:20:00Z
task_id: broadn-p6-2026-03-28

To recover: git -C /home/jhber/projects/broadn-web-view reset --hard ce6fbead4013bc3e3e03a7b05df243138a462cd4
