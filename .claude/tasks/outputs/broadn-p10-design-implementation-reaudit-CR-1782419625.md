<plan_critique>
  <plan_id>broadn-p10-design-implementation (revision 2)</plan_id>
  <status>PASS</status>

  <resolution_of_prior_blockers>

    <item ref="BLOCKER — #166534 SC1 contradiction">
      CLOSED. Both residuals are now IN SCOPE and given v2 destinations:
        - app.js:3018 PG_SAMPLER_FILL 'SASS' #166534 -> UI-001 deliverable 6b specifies a v2
          instrument-anchor value constrained to be non-Okabe-sample-type AND non-brand-teal
          (consistent with the map's existing lime/olive family). Only the #166534 anchor migrates;
          the other instrument colors (incl. BioSpot VIVAS #22d3ee) stay.
        - app.js:2981 PG_TYPE_FILL[dom] || '#166534' -> migrates to SAMPLE_TYPE_COLORS['Unknown']
          (UI-002 C3, SC3).
      Verified against live code: #166534 appears exactly 13× in app.js (11 in CHART_COLORS:
      28/34/35/37/38/41/42/46/50/52/55, plus :2981 and :3018) — the PM count is correct.
      SC1 (`grep -c '#166534'` == 0 across all three files) is now genuinely satisfiable, and
      UI-001 deliverable 7 mandates a grep-derived migration table so no site is missed. The
      out_of_scope ("do NOT recolor PG_SAMPLER_FILL BEYOND its single #166534 anchor") is now
      consistent with SC1 rather than contradicting it.
    </item>

    <item ref="WARNING 1 — timeline-legend under-enumeration">
      CLOSED. UI-002 C2/C3/C4 enumerate ALL FOUR entries of BOTH maps plus the static legend, and
      SC3 makes each mechanically checkable. All counts verified against live code:
        - PG_TYPE_COLOR (app.js:2793-2796): bg-sky-500/bg-emerald-600/bg-amber-700/bg-cyan-400 — these
          four appear ONLY here in app.js, so SC3 `grep bg-classes assets/app.js`==0 is satisfiable.
        - PG_TYPE_FILL (app.js:2870-2873): #0ea5e9==1, #059669==1 (both only here) -> SC3 `==0` valid;
          Soil #b45309 correctly NOT grepped-to-zero (it is also --color-warning); Liquid #22d3ee==2
          -> #22d3ee==1 after migration (3020 instrument retained), which SC3 asserts correctly.
        - Static index.html legend (lines 300-303): confirmed present, exactly four bg-classes, found
          nowhere else in index.html -> SC3 `grep bg-classes index.html`==0 is satisfiable.
      AUD-001 now explicitly states the project_group/timeline legend is DORMANT (empty data) and must
      be verified via grep, not screenshot (R5 added) — directly addressing the lost-safety-net concern.
    </item>

    <item ref="WARNING 2 — bright-teal text restriction not binding on FE">
      CLOSED (to the extent the constraint type allows). New UI-002 sub-deliverable H binds the rule on
      FE (normal-size link/active TEXT -> deep teal #0c5454; #0c9cb4 only for underline/border/accent/
      large text/dark bg), and SC9 makes it a success criterion verified by AUD-001 on the live render
      (called out as "the load-bearing A11Y check"). Note: text-vs-border context is inherently a
      render/code judgment, not a pure-grep assertion — the binding instruction (H) + AUD live-render
      check is the correct mechanism; a grep count of #0c9cb4 alone cannot distinguish a text use from a
      border use, and the plan correctly does not pretend otherwise.
    </item>

  </resolution_of_prior_blockers>

  <new_issues_scan>
    No new unsatisfiable SC or scope contradiction introduced by rev2. Specifically checked:
      - 6b instrument anchor has no grep SC pinned to a specific value (SC6 only requires non-Okabe,
        non-brand-teal), so it introduces no locked-value trap.
      - SC3's #b45309 is correctly left un-grepped (dual-purpose Soil-data / warning-semantic), avoiding
        an unsatisfiable ==0 assertion.
      - The #22d3ee==1 invariant is correctly preserved (not flipped to ==0).
  </new_issues_scan>

  <audit_risk_forecast>
1. SC9 (bright-teal) is necessarily verified by AUD live-render judgment, not pure grep. AUD-001 must
   actually perform the link/active-text contrast check on the render — if Playwright is unavailable,
   the http.server + chromium fallback (per task spec / studio-clarity post-mortem) must be used. This
   is the single most likely point to be skipped under time pressure.
2. SC1's green-Tailwind regex is `green-(700|800|900)` on index.html ONLY. It does NOT catch green-100
   KPI halos (index.html) or app.js Tailwind green classes (e.g. pg position pills bg-green-50/
   text-green-800/border-green-200 ~app.js:2849, dormant). "Retire green ENTIRELY" depends on the
   UI-001 migration table enumerating these; they are not grep-enforced. Low runtime risk (halo +
   dormant view) but worth a one-line confirmation in the migration table.
3. 6b: UI-001 should pick an instrument-anchor hex not already used by another PG_SAMPLER_FILL member
   (#84cc16/#a3e635/#65a30d/#84cc16 etc.) to avoid two instruments sharing a color; AUD SA should
   sanity-check for a duplicate.
4. Value-swap naming debt persists by design: the CSS token stays named --color-green-800 while holding
   deep teal #0c5454. PM accepted this to minimize churn; note it in the migration table so AUD does not
   read it as a defect.
   None of these are blockers.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
Re-review consulted the live source (assets/app.js, index.html) to verify every mechanical count in
rev2 — all confirmed accurate. Prior-round reads of docs/post-mortems/broadn-studio-clarity.md (http.server
Playwright fallback for vanilla-HTML QA) and docs/agent-changelog.md (locked-value grep discipline,
critic 1.0.3) remain the basis. docs/after-actions/ is empty (Glob). The locked-value-consistency scan
that produced the original BLOCKER was re-run manually against rev2 and now passes.
  </post_mortem_patterns_checked>
</plan_critique>
