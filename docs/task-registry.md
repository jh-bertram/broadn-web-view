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

