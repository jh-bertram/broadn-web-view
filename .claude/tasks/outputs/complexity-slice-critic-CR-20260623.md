<plan_critique>
  <plan_id>complexity-slice-critic-20260623</plan_id>
  <status>FINDINGS (read-only critique — not a sprint gate; no BLOCK/PASS verdict applies)</status>

  <scope>
    Adversarial complexity critique of the slice subsystem and 20-chart inventory in
    /home/jhber/projects/broadn-web-view/index.html (4,577 lines). Two focus areas only:
    (1) slice-view renderer duplication; (2) per-chart value judgement. No files modified.
    All line numbers verified against the file as read 2026-06-23.
  </scope>

  <!-- ===================================================================== -->
  <!-- FOCUS 1: SLICE-VIEW DUPLICATION                                       -->
  <!-- ===================================================================== -->

  <finding>
    <type>SLICE_DUPLICATION</type>
    <area>renderProjectView / renderLocationView / renderLabGroupView</area>

    <line_map>
      renderProjectGroupView(groupId)  @ 2877–2944  (+ 7 PG-only helpers, 2946–3441) — the CPER bespoke page
      renderProjectView(groupId)       @ 3447–3565  (~119 lines)
      renderLocationView(groupId)      @ 3571–3739  (~169 lines)
      renderLabGroupView(groupId)      @ 3745–3865  (~121 lines)
      renderView()                     @ 3876–4025+ (dispatcher; not duplicated, keep as-is)
      Shared helpers already extracted: renderSamplerTypeChart @1786, insertGapMarkers @1953,
        renderTagGroups @2601, buildTemporalChartOptions @2812, showSliceNoData @2844,
        hideSliceNoData @2858, destroyChart, destroyAllSliceCharts @2802.
    </line_map>

    <quantified_duplication>
      Compare Project (3447–3565), Location (3571–3739), LabGroup (3745–3865) block-by-block.
      These three are the genuine near-triplicate set. ProjectGroup (CPER) is NOT part of it —
      it is a bespoke one-off page (timeline, cadence heatmap, diurnal strip, collection matrix,
      freezer inventory) sharing nothing but a guard clause; exclude it from any collapse.

      Per-block duplication across the three views:

      | Block                          | Project | Location | LabGroup | Verdict |
      |--------------------------------|---------|----------|----------|---------|
      | Guard + entry lookup + no-data | 3450–3464 | 3575–3591 | 3748–3764 | NEAR-IDENTICAL save the key field (project_id / site_code / group_name) and one extra guard in LabGroup (empty-array check, 3749–3750) |
      | Sample-Types doughnut          | 3466–3498 (33 ln) | 3635–3667 (33 ln) | 3766–3798 (33 ln) | **VERBATIM** — identical incl. the type_pipeline_crossTab tooltip callback (3493 = 3662 = 3793, char-for-char) |
      | Pipeline horizontal bar        | 3500–3541 (42 ln) | — (Location omits) | 3800–3841 (42 ln) | **VERBATIM** between Project & LabGroup incl. the pipeline_type_crossTab callback (3524 = 3824) |
      | Temporal bar (gap-marked)      | 3543–3559 (17 ln) | 3669–3685 (17 ln) | 3843–3859 (17 ln) | **VERBATIM** — same insertGapMarkers + same IIFE-wrapped buildTemporalChartOptions + identical inline tooltip (3558 = 3684 = 3858, char-for-char) |
      | Tag groups + sampler + tooltip | 3561–3564 (4 ln) | 3735–3738 (4 ln) | 3861–3864 (4 ln) | **NEAR-VERBATIM** — only the label var differs (project_id / site_name / group_name) |

      Genuinely duplicated lines (the four shared blocks above), counted once per repeat:
        - Doughnut block: 33 ln × 3 = 99 ln, of which ~66 are pure repeats.
        - Pipeline block: 42 ln × 2 = 84 ln, of which ~42 are pure repeats.
        - Temporal block: 17 ln × 3 = 51 ln, of which ~34 are pure repeats.
        - Tag+sampler block: 4 ln × 3 = 12 ln, ~8 repeats.
        - Guard/lookup: ~14 ln × 3 = 42 ln, ~28 repeats.
      Total duplicated surface ≈ 178 lines of pure copy-paste across the three renderers
      (out of ~409 lines for the three functions combined, 3447–3865). That is ~43% pure
      redundancy — and three of the four chart blocks are byte-for-byte identical, which is the
      strongest possible collapse signal.
    </quantified_duplication>

    <real_differences_that_resist_collapse>
      A parameterized renderer must still branch on these — they are real, not cosmetic:
      1. ENTRY KEY: project_id (3456) vs site_code (3582) vs group_name (3756). Trivial — pass a key selector.
      2. SAMPLER TOOLTIP LABEL: project_id (3564) vs site_name (3738) vs group_name (3864).
         Note site_name ≠ site_code — Location deliberately uses the human-readable name in the
         tooltip but the code as the lookup key. A naive collapse that uses one field for both
         WILL regress the Location sampler tooltip. Flag this explicitly to any implementer.
      3. PIPELINE CHART: present in Project & LabGroup, ABSENT in Location (Location substitutes
         the sub-sites bar). So the parameterized renderer needs an optional/ordered chart list,
         not a fixed 4-up grid.
      4. LOCATION-ONLY charts: sub-sites horizontal bar (3593–3633) and the optional time-of-day
         distribution (3687–3733, gated on entry.time_distribution + show/hide of
         slice-location-timeofday-card at 3573/3577/3690/3732). These two have no analogue in the
         other views. The time-of-day card-visibility toggle is stateful DOM the other renderers
         don't touch.
      5. LABGROUP extra guard: empty-array short-circuit (3749–3750) the others lack.
      6. DISTINCT CANVAS IDS + COLOR TOKENS: each chart targets a hard-coded canvas id
         (sliceProjectTypesChart / sliceLocationTypesChart / sliceLabGroupTypesChart, etc.). A
         collapse needs an id-prefix parameter ('sliceProject' | 'sliceLocation' | 'sliceLabGroup').
    </real_differences_that_resist_collapse>

    <verdict>
      COLLAPSE IS WARRANTED and low-risk for the three shared chart blocks. A single
      `renderSlice(config)` driven by a per-category descriptor —
        { keyField, sliceData, idPrefix, samplerLabelField, charts: [...] }
      where `charts` is an ordered list of declarative chart specs (doughnut-types, pipeline-bar,
      temporal-bar, sampler, + Location's two extras) — absorbs all three renderers.
      The doughnut/temporal blocks are already byte-identical, so they lift out with zero behaviour
      change; the pipeline block becomes an opt-in entry in the charts list; Location's sub-sites and
      time-of-day become two additional opt-in entries with their card-visibility side effect kept
      local to that spec.

      Estimated net saving: the three functions total ~409 lines (3447–3865). A parameterized
      renderer + three ~10-line descriptors + the optional-chart machinery lands around ~190–220
      lines. **Net reduction ≈ 190–220 lines** (~45–55% of the triplicate region). Conservative
      floor ≈ 178 lines (the measured pure-duplicate count) even if descriptors run heavy.

      RISK: LOW-MODERATE. The three load-bearing hazards an implementer must not trip:
        (a) Location's site_name-vs-site_code split (diff #2) — preserve both fields distinctly.
        (b) Location omits pipeline and adds two charts — the charts list must be ordered & optional,
            not a fixed grid; the slice-location-timeofday-card hide/show must survive.
        (c) The inline tooltip callbacks reference the closed-over `entry` heavily (cross-tabs at
            3493/3524/3558 etc.). The descriptor's chart specs must receive `entry` so those
            callbacks keep working; do not pre-bake data into the spec.
      Do NOT fold renderProjectGroupView into this — it is a separate bespoke page and any attempt
      to genericize it will balloon the descriptor and defeat the saving.
    </verdict>
  </finding>

  <!-- ===================================================================== -->
  <!-- FOCUS 2: 20-CHART INVENTORY VALUE JUDGEMENT                            -->
  <!-- Default = CUT. A chart must earn its keep.                            -->
  <!-- ===================================================================== -->

  <chart_inventory_verdicts>

    <!-- GLOBAL (5) -->
    <chart id="temporalChart" tier="global" verdict="KEEP">
      The headline time-series for the whole program. Unique, top-of-funnel, layperson-legible. Earns it.
    </chart>
    <chart id="bySiteChart" tier="global" verdict="KEEP">
      Samples-by-site bar (now with readable names, per bucket A). The only global geographic-volume
      view that isn't the map. Earns it.
    </chart>
    <chart id="donutChart" tier="global" verdict="KEEP-WITH-NOTE">
      Global sample-type doughnut. Carries a RICH custom external tooltip (2074–2096) with the
      collected/extracted/sequenced cross-tab — materially more capable than the slice doughnuts'
      inline callback. Keep, but note: it is the canonical type-breakdown; every per-slice doughnut
      below is a scoped re-run of THIS chart. That makes the slice doughnuts the prime cut/justify targets.
    </chart>
    <chart id="pipelineChart" tier="global" verdict="KEEP">
      Global Collected→Extracted→Sequenced funnel — the single most important data-management
      narrative on the page. Earns it.
    </chart>
    <chart id="globalSamplerChart" tier="global" verdict="KEEP">
      Program-wide sampler distribution (log-scale bar via renderSamplerTypeChart @1786). Unique at the
      global tier. Earns it.
    </chart>

    <!-- PROJECT-GROUP / CPER (2 of the bespoke set) -->
    <chart id="pgDailyStackChart" tier="project-group" verdict="KEEP">
      CPER daily stacked-by-type bar (2954–2992). Genuinely unique granularity (daily, type-stacked)
      that exists nowhere else; part of the deliberately-bespoke CPER page. Earns it.
    </chart>
    <chart id="pgSamplerMonthChart" tier="project-group" verdict="KEEP-WITH-NOTE">
      CPER sampler-by-month stacked bar (3107–3147). Unique (monthly × sampler) — keep. NOTE: it
      hard-codes its own PG_SAMPLER_FILL palette (3095–3105) separate from CHART_COLORS — a DRY/standards
      smell (SCREAMING_SNAKE local map duplicating colour intent). Flag for consolidation into
      CHART_COLORS during any refactor, not removal.
    </chart>

    <!-- PROJECT SLICE (4) -->
    <chart id="sliceProjectTypesChart" tier="project" verdict="CONSOLIDATE">
      Doughnut @3470. Byte-identical to the Location & LabGroup type doughnuts and a scoped echo of the
      global donutChart. It earns its place only as "global donut, filtered to this project" — keep the
      DATA view but it MUST come from the parameterized renderer, not a 4th hand-rolled copy. As standalone
      code: redundant.
    </chart>
    <chart id="sliceProjectPipelineChart" tier="project" verdict="CONSOLIDATE">
      Horizontal pipeline bar @3504. Verbatim duplicate of sliceLabGroupPipelineChart and a scoped echo of
      global pipelineChart. Keep the per-project funnel (it is the one slice chart with real analytic value
      at this altitude) but via the shared renderer. Standalone: redundant.
    </chart>
    <chart id="sliceProjectTemporalChart" tier="project" verdict="CONSOLIDATE">
      Gap-marked temporal bar @3548. Verbatim across all three slices. Useful per-slice; collapse the code.
    </chart>
    <chart id="sliceProjectSamplerChart" tier="project" verdict="CUT-CANDIDATE">
      Per-project sampler log-bar @3562. LOW marginal value: most single projects use one or two samplers,
      so this is frequently a 1–2 bar chart restating what the types doughnut + tag badges already say.
      Default to CUT unless a stakeholder confirms per-project sampler mix is a real question. The replicate
      tag badges (renderTagGroups) likely cover the same ground more compactly.
    </chart>

    <!-- LOCATION SLICE (5) -->
    <chart id="sliceLocationSubsitesChart" tier="location" verdict="KEEP">
      Sub-site horizontal bar @3596. The one slice chart with NO global analogue — sub-site decomposition
      is the actual reason to slice by location. Earns it.
    </chart>
    <chart id="sliceLocationTypesChart" tier="location" verdict="CONSOLIDATE">
      Doughnut @3639. Verbatim copy of the project doughnut. Keep data, collapse code.
    </chart>
    <chart id="sliceLocationTemporalChart" tier="location" verdict="CONSOLIDATE">
      Temporal bar @3674. Verbatim. Collapse.
    </chart>
    <chart id="sliceLocationTimeDistChart" tier="location" verdict="KEEP-IF-DATA">
      Time-of-day distribution @3693 (labelled "Polar Area" in a comment but the CONSTRUCTOR is type:'bar'
      — the comment is stale; tooltip correctly uses ctx.parsed.y at 3712, so no bug, but fix the comment).
      Already gated on data presence (3689) and hidden when absent — good hygiene. UNIQUE among slices.
      Keep where data exists; its self-hiding behaviour means it costs nothing when empty.
    </chart>
    <chart id="sliceLocationSamplerChart" tier="location" verdict="CUT-CANDIDATE">
      Per-location sampler log-bar @3736. Same low-marginal-value argument as the project sampler. A given
      site typically deploys a small fixed sampler set. Default CUT; require a reason to keep.
    </chart>

    <!-- LAB-GROUP SLICE (4) -->
    <chart id="sliceLabGroupTypesChart" tier="lab-group" verdict="CONSOLIDATE">
      Doughnut @3770. Verbatim. Collapse.
    </chart>
    <chart id="sliceLabGroupPipelineChart" tier="lab-group" verdict="CONSOLIDATE">
      Pipeline bar @3804. Verbatim copy of the project pipeline. Collapse.
    </chart>
    <chart id="sliceLabGroupTemporalChart" tier="lab-group" verdict="CONSOLIDATE">
      Temporal bar @3848. Verbatim. Collapse.
    </chart>
    <chart id="sliceLabGroupSamplerChart" tier="lab-group" verdict="CUT-CANDIDATE">
      Per-lab-group sampler log-bar @3862. Lowest-value of the three sampler repeats — lab-group is an
      organisational, not methodological, cut, so sampler mix is least meaningful here. Default CUT.
    </chart>

    <inventory_summary>
      Of 20 charts: 9 unconditional KEEP (5 global + 2 CPER + Location sub-sites + Location time-of-day),
      8 CONSOLIDATE (the three doughnut + two pipeline + three temporal slice charts — same data, three
      copies of code → one renderer), 3 CUT-CANDIDATES (the three per-slice sampler log-bars).

      Headline judgement under a streamline mandate:
        - The slice subsystem invents NO new chart TYPES beyond the global page except Location's
          sub-sites and time-of-day. Every other slice chart is the global page re-scoped. That is the
          core inflation.
        - CONSOLIDATE removes ~180–220 lines of code with ZERO loss of user-visible information.
        - CUTTING the 3 sampler slice charts removes 3 chart surfaces (and their renderSamplerTypeChart
          calls + canvases) for near-zero information loss — the strongest pure-removal target.
        - Recommended end-state per slice: types doughnut + temporal + pipeline (Project/LabGroup) or
          sub-sites + types + temporal + time-of-day (Location). Drop the sampler chart from all three.
    </inventory_summary>
  </chart_inventory_verdicts>

  <cross_cutting_observations>
    1. DRY / standards: the three slice renderers are a textbook standards.md "No duplicated logic"
       violation — three byte-identical doughnut blocks, two byte-identical pipeline blocks, three
       byte-identical temporal blocks. This is the single clearest streamlining win in the file.
    2. Two local SCREAMING_SNAKE colour maps (PG_TYPE_FILL @2947, PG_SAMPLER_FILL @3095, PG_TYPE_COLOR
       @2870) live outside CHART_COLORS. Not a cut, but consolidate into the central token set during refactor.
    3. Stale comment: sliceLocationTimeDistChart is commented "Polar Area" but constructed as type:'bar'
       (3693). No runtime bug (tooltip uses ctx.parsed.y), but fix the comment so a future reader doesn't
       apply a doughnut/polar tooltip accessor and silently break it.
    4. The collapse interacts with renderView() (3876+) only through the four entry-point function calls
       at 3989/3998/4007/4016 — those become calls to renderSlice(<descriptor>). renderView's dispatch,
       visibility toggling, and chip logic are NOT duplicated and should be left untouched.
  </cross_cutting_observations>

  <verdict_one_line>
    Collapse the three slice renderers into one parameterized renderer (~190–220 net lines saved, LOW-MOD
    risk), and under a streamline mandate CUT the three per-slice sampler charts outright (3 surfaces, ~0
    info loss). Keep all 5 global, both CPER, and Location's two unique charts. This is a code-consolidation
    finding, not a sprint plan — no execution proposed.
  </verdict_one_line>
</plan_critique>
