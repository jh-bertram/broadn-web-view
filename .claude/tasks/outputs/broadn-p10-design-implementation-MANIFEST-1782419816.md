<expectation_manifest>
  <sprint_id>broadn-p10-design-implementation</sprint_id>
  <generated>2026-06-25T00:00:00Z</generated>
  <revision>2</revision>
  <assignments>
    <assignment>
      <task_id>broadn-p10-design-implementation-UI-001</task_id>
      <agent>UI#1</agent>
      <expected_tag>design_spec</expected_tag>
      <expected_file>.claude/tasks/outputs/broadn-p10-design-implementation-UI-001-UI-*.md</expected_file>
      <blocks>broadn-p10-design-implementation-UI-002</blocks>
      <receipt_check>
        <item>DESIGN.md frontmatter Version: 2.0.0 / Updated: 2026-06-25</item>
        <item>teal Constitution rule + "OVERRIDES v1.0.0" note; #166534 absent from Constitution/Color-Tokens</item>
        <item>SAMPLE_TYPE_COLORS five-pair Okabe map keyed by name</item>
        <item>--color-filter-accent #c2410c with four-orange collapse + #b45309 split</item>
        <item>pipeline 3-stage palette replacing #4ade80 with ratios</item>
        <item>sampler-instrument anchor replacement for #166534 (non-Okabe, non-brand-teal)</item>
        <item>COMPLETE migration table covering all 13 #166534 sites (incl. :2981, :3018), PG maps, static HTML legend</item>
        <item>WCAG note restricting bright-teal #0c9cb4 normal-text use</item>
        <item>git diff touches DESIGN.md ONLY</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>broadn-p10-design-implementation-UI-002</task_id>
      <agent>FE#1</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/broadn-p10-design-implementation-UI-002-FE-*.md</expected_file>
      <blocks>broadn-p10-design-implementation-AUD-001</blocks>
      <receipt_check>
        <item>grep '#166534' == 0 across all three files (incl. :2981 fallback + :3018 SASS); #0c5454 present; no green-700/800/900 Tailwind in index.html</item>
        <item>broadn-logo.webp in nav + hero with alt + aria-label; &#10044; removed</item>
        <item>ONE SAMPLE_TYPE_COLORS; PG_TYPE_COLOR + PG_TYPE_FILL + :2981 fallback + static HTML legend all source from it; #0ea5e9==0, #059669==0, bg-classes==0 in both files; #22d3ee==1 (BioSpot, expected)</item>
        <item>--color-filter-accent #c2410c wired; #ea6c00==0; no orphan orange tokens; --color-warning unchanged</item>
        <item>global h3s 669/674 neutralized; slice-panel h3s 410-504 unchanged; default "All" button de-oranged</item>
        <item>Chart.defaults.font.family Inter before first new Chart(); #4ade80==0; hero chips rounded</item>
        <item>bright-teal text restriction applied (deep teal for link/active text; #0c9cb4 not on normal-size text)</item>
        <item>packet states the change was viewed on the live render</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>broadn-p10-design-implementation-AUD-001</task_id>
      <agent>AUD#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/broadn-p10-design-implementation-AUD-001-AUD-*.md</expected_file>
      <blocks>NONE</blocks>
      <receipt_check>
        <item>SA + QA + SX verdicts each present (PASS/FAIL)</item>
        <item>screenshot evidence for teal brand + single-palette + signal-fix; grep evidence for dormant PG legend + #166534==0 + #22d3ee==1</item>
        <item>findings #1 and #7 confirmed resolved</item>
        <item>bright-teal text binding (R1) verified on FE code; no FAILs against deferred surfaces or BioSpot instrument color</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>
