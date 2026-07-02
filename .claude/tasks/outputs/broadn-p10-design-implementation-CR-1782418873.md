<plan_critique>
  <plan_id>broadn-p10-design-implementation</plan_id>
  <status>BLOCK</status>

  <challenges>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>BLOCKER</severity>
      <task_ref>broadn-p10-design-implementation-UI-002</task_ref>
      <description>
UI-002 SC1 demands `grep -c '#166534' assets/app.js` returns 0 across the whole file, but two
in-file occurrences of #166534 sit OUTSIDE the migration scope the PM itself drew, making the SC
self-defeating (the same locked-value-vs-out-of-scope contradiction the PM correctly carved out for
#22d3ee but missed here):
  - app.js:3018 `'SASS': '#166534'` is a member of PG_SAMPLER_FILL — the SAME sampler-INSTRUMENT
    color map the PM declared OUT OF SCOPE via its BioSpot-VIVAS #22d3ee example (out_of_scope block:
    "Do NOT recolor the SAMPLER-INSTRUMENT map at app.js:3020"). The map's #22d3ee was carved out of
    SC3 (asserted ==1), but its #166534 sibling at 3018 was not carved out of SC1.
  - app.js:2981 `var hex = PG_TYPE_FILL[dom] || '#166534';` is a fallback default in the
    concurrent-timeline renderer, not enumerated in any migration instruction.
Full enumeration (14 occurrences): 28,34,35,37,38,41,42,46,50,52,55 (CHART_COLORS — in scope),
2981 (fallback), 3018 (out-of-scope instrument map). FE cannot satisfy SC1 (#166534==0) while
honoring the out_of_scope directive to leave PG_SAMPLER_FILL untouched. As written the task is
internally contradictory and will either force FE to violate its own out_of_scope or guarantee a
false SC1 FAIL. The PM's locked-value self-lint (routing_notes) asserted SC1 is "satisfiable on
faithful execution" — it scanned the first occurrence class (CHART_COLORS) but not the adjacent
out-of-scope instances, exactly the "scan ALL such SCs, the defect recurs on adjacent lines" failure.
      </description>
      <required_revision>
Pick ONE and make SC1, the migration table (UI-001 item 7), and UI-002 out_of_scope mutually
consistent:
  (a) PREFERRED — bring the brand-green members into scope. The human directive is "retire CSU green
      #166534 from the UI" entirely; that argues PG_SAMPLER_FILL 'SASS' #166534 (3018) and the 2981
      fallback should get explicit v2 replacement values in the UI-001 migration table, and the
      UI-002 out_of_scope must be narrowed to "keep the NON-green members of PG_SAMPLER_FILL; migrate
      its #166534 member." Then SC1 (#166534==0) is satisfiable.
  (b) carve the out-of-scope occurrences out of SC1 the way #22d3ee was carved out of SC3 — assert
      the expected residual count (e.g. `grep -c '#166534' assets/app.js` == N for the intentionally
      retained instrument-map/fallback lines) rather than ==0, and state which line(s) are retained.
Also enumerate the 2981 fallback explicitly so FE does not improvise its disposition.
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>broadn-p10-design-implementation-UI-002</task_ref>
      <description>
The single-palette migration (human item #3, the whole point of finding #1) is under-enumerated and
under-verified for the timeline legend. PG_TYPE_COLOR (2792-2797) and PG_TYPE_FILL (2869-2874) each
hold FOUR sample-type entries, but UI-002 description C and SC3 name only Air+Liquid (bg map) and
Air+Soil+Liquid (hex map). Missed:
  - app.js:2794 PG_TYPE_COLOR Plant 'bg-emerald-600'
  - app.js:2795 PG_TYPE_COLOR Soil 'bg-amber-700'
  - app.js:2871 PG_TYPE_FILL Plant '#059669'
These are divergent sample-type encodings (Plant must become Okabe #009E73, Soil #E69F00) — the exact
anarchy this sprint exists to kill. SC3's greps (`bg-sky-500|bg-cyan-400`==0, `#0ea5e9`==0) do not
catch them, so a partial migration passes SC3 green. Compounding factor: the filtered-state-confirm
doc states `appData.slice_views.project_group` is EMPTY — the project-group/timeline path is DORMANT
and will not render, so AUD-001's QA item (2) "same Okabe color in ... the concurrent-timeline legend"
CANNOT be screenshot-verified. Grep is therefore the ONLY guard, and it is incomplete. The
description's catch-all "so they too resolve through SAMPLE_TYPE_COLORS" states intent but is not
mechanically enforced.
      </description>
      <required_revision>
1. UI-002 description C: enumerate ALL FOUR entries of both PG_TYPE_COLOR and PG_TYPE_FILL (add Plant
   bg-emerald-600/#059669 and Soil bg-amber-700) as migration targets.
2. UI-002 SC3: add `grep -c 'bg-emerald-600\|bg-amber-700' assets/app.js`==0 and `grep -c '#059669'
   assets/app.js`==0 (after confirming these classes/hex are used nowhere else legitimately — current
   reads show they appear only in these two maps).
3. AUD-001: note explicitly that the timeline-legend single-palette proof is a CODE-READ/SA check
   (PG_TYPE_COLOR/PG_TYPE_FILL resolve through SAMPLE_TYPE_COLORS), NOT a screenshot, because
   project_group data is empty and the path does not render.
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>broadn-p10-design-implementation-UI-002</task_ref>
      <description>
The R1 bright-teal contrast resolution is binding on the SPEC (UI-001 SC7 requires the WCAG note to
exist) and is checked post-hoc by AUD-001, but it is NOT binding on the IMPLEMENTATION. UI-002 pins
only `.nav-link.active -> #0c5454` (sub-deliverable A); it carries no instruction or SC that
normal-size link/active TEXT must route through deep teal #0c5454 rather than bright teal #0c9cb4.
The human request literally assigns bright teal to "active/accent/links" — links are normally
normal-size text, and #0c9cb4 on white is ~3:1 (fails normal-text AA 4.5:1). If FE reads the human
phrasing and applies #0c9cb4 to link text, it ships a contrast regression that only AUD catches,
costing a remediation loop. The resolution should be encoded where FE acts, not only where AUD audits.
      </description>
      <required_revision>
Add to UI-002 a binding constraint (description + a success criterion): "Normal-size link/active TEXT
on white uses deep teal #0c5454; bright teal #0c9cb4 is permitted only for borders, underlines,
accent fills, large text (>=18.66px bold / >=24px), and on dark backgrounds — never for normal-size
text on white." This mirrors the UI-001 WCAG note and makes FE responsible for it pre-audit.
      </required_revision>
    </challenge>

  </challenges>

  <audit_risk_forecast>
1. Highest: the #166534 SC1 contradiction (BLOCKER above) — if not reconciled, AUD-001 SA gate will
   record a false FAIL on the retained instrument-map green, or FE will overreach into the
   out-of-scope sampler map. Reconcile the SC before dispatch.
2. The timeline-legend Plant/Soil residual (WARNING 1) is the most likely silent ship-through: dormant
   project_group data removes the visual safety net, so an incomplete grep lets finding-#1 divergence
   survive for 2 of 5 categories.
3. Naming debt (not a blocker): the PM's deliberate value-swap keeps the CSS token NAMED
   `--color-green-800` while holding deep teal #0c5454 (styles.css:9). Auditor SA may flag the
   misleading name; the PM accepted this tradeoff to minimize churn — worth a one-line note in the
   migration table so AUD does not treat it as a defect.
4. Commit size: UI-002 spans 3 files / 7 deliverables, est. 40-70 net new lines — likely over the
   50-new-line gate in a single commit. Mostly replacement (re-pointing values), but FE should stage
   commits or the standards 50-line gate is technically breached pre-audit.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
docs/after-actions/ is EMPTY (confirmed via Glob) — read post-mortems instead, per protocol.
Read: docs/post-mortems/broadn-studio-clarity.md (§4/§6: python http.server + Playwright fallback for
vanilla-HTML QA — AUD-001's approach is consistent; R5 handled). Reviewed docs/agent-changelog.md
recurring patterns: DRY helper extraction (backend 1.1.1), PM "visual type qualifier" rule (describe
CSS state as fill/border/text not class — UI-002 mostly complies via hex pins), sequential single-file
scope rule (auditor 1.0.6 — relevant to the single-FE-task decision, which is justified), critic
1.0.3 string-literal grep-before-=== (the lens used to catch the #166534 SC contradiction). PM
correctly declared <recurring_pattern> elements (OVERSCOPE/SCOPE_DRIFT/DRY) so the
MISSING_RECURRENCE_DECLARATION block does not apply. Live-source verification confirmed: logo fixture
assets/broadn-logo.webp PRESENT; Inter CDN <link> already loaded (index.html:10) so item #5 will
actually render; styles.css token line refs (9, 11-13, 22-27, 65) accurate; both PM scope-drift pins
(global vs slice-panel h3s; #22d3ee instrument map) accurate. UI-002 touches 3 files — under the
4-file mandatory-split BLOCKER threshold; single-task decision accepted on coupled-token-system
grounds. No SC-precheck report exists because the sc-locked-value-consistency skill is absent from
this config-only repo (PM noted; manual locked-value scan performed here as the documented fallback).
  </post_mortem_patterns_checked>
</plan_critique>
