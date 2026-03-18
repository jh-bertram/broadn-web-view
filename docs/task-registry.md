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

