# Task Registry — broadn-p7-sample-table

## Sprint Goal
Upgrade Data Explorer table to show all 4,571 field samples filtered by dashboard state (filterState slice + tags), paginated at 100 rows per page.

## Sprint State
**Status:** PLANNING
**Created:** 2026-04-02T00:00:00Z

## Expectation Manifest

| task_id | agent | expected_tag | wave | depends_on | blocks |
|---|---|---|---|---|---|
| broadn-p7-t1-all-samples | BE#1 | completion_packet | 1 | — | broadn-p7-t2-table-filter |
| broadn-p7-t2-table-filter | FE#1 | completion_packet | 2 | t1 | NONE |

```xml
<expectation_manifest>
  <sprint_id>broadn-p7-sample-table</sprint_id>
  <generated>2026-04-02T00:00:00Z</generated>
  <assignments>
    <assignment>
      <task_id>broadn-p7-t1-all-samples</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/broadn-p7-t1-all-samples-BE-*.md</expected_file>
      <blocks>broadn-p7-t2-table-filter</blocks>
      <receipt_check>
        <item>Verification gate output shows count ~4571</item>
        <item>12 keys listed: id, date, site, type, category, project, lab_group, am_pm, replicate, quadrant, position, field_control</item>
        <item>Confirms recent_samples still present with 100 entries</item>
        <item>data/data.json path confirmed written</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>broadn-p7-t2-table-filter</task_id>
      <agent>FE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/agents/tasks/outputs/broadn-p7-t2-table-filter-FE-*.md</expected_file>
      <blocks>NONE</blocks>
      <receipt_check>
        <item>PAGE_SIZE and tableCurrentPage vars present in index.html</item>
        <item>#table-pagination div present in HTML section (not JS-created)</item>
        <item>renderTable signature is renderTable(samples, page)</item>
        <item>renderView() end has appData.all_samples renderTable re-render call</item>
        <item>All three dropdown handlers reset tableCurrentPage=1 and use appData.all_samples</item>
        <item>aria-label on #explorer-table is "Field samples" (not "Recent field samples")</item>
        <item>No hex color values introduced outside existing constants</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>
```
