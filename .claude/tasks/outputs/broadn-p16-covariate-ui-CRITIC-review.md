<plan_critique>
  <plan_id>broadn-p16-covariate-ui</plan_id>
  <status>BLOCK</status>

  <challenges>
    <challenge>
      <type>ASSUMPTION</type>
      <severity>BLOCKER</severity>
      <task_ref>broadn-p16-covariate-ui-T3</task_ref>
      <description>
The T3 packet points the FE at the WRONG render site. It states "the slice temporal chart is
built inside `updateSliceCharts(...)` (chart constructor at ~:624-640)" and scopes the overlay
edit there. That is FALSE for the default on-open render. `updateSliceCharts` is reached ONLY
from `applyFilter` (assets/app.js:800 and :802) — it is the TAG-FILTER re-render path, not the
initial render. The LIVE default slice temporal chart is drawn by the declarative renderer:
`renderProjectView`/`renderLocationView`/`renderLabGroupView` short-circuit to
`renderSlice(descriptor, entry, grid)` whenever `USE_RENDER_SLICE && descriptor` is truthy
(app.js:3585-3588; `USE_RENDER_SLICE = true` at :114), and `renderSlice` dispatches to
`WIDGET_RENDERERS['temporal_bar']` — the temporal chart constructor at **app.js:2404-2420**.
`temporal_bar` is present throughout `data/project-layouts.json` (:83, :253, :422, :622, :810,
:989, :1167, :1370, :1534...), so the declarative path is live for every slice. The legacy inline
temporal constructors the brief/packet imply are the render site (:3671 project, :3806 location,
:3988 lab_group) are DEAD fallback code behind the `USE_RENDER_SLICE && descriptor` guard.

Consequence: an FE that follows the packet literally edits `updateSliceCharts` only. The overlay
then appears NOT on slice open (which flows through `temporal_bar` at :2404) but only after a user
toggles a tag filter and clears it. T3 SC1 ("a slice panel loads and the temporal chart renders the
weather overlay for the default variable") fails at the live auditor walk. This is exactly the
"scope-boundary blindness to cross-file contracts" recurring pattern in
docs/after-actions/broadn-teal-rebrand.md §5, and the "FE marks browser-SCs ✓ from code traces
without running them" pattern in broadn-p12-altitude-single-rail.md §6.
      </description>
      <required_revision>
Rewrite T3's integration anchor. Name the LIVE render site as PRIMARY: the `temporal_bar` widget
renderer in `WIDGET_RENDERERS` (assets/app.js ~:2404, reads `entry.temporal`) — this is the
default on-open slice temporal chart via `renderSlice`. Keep `updateSliceCharts` (~:624) as the
SECONDARY site (tag-filter re-render). Instruct the FE to re-anchor both by function name and to
confirm the legacy per-category constructors (:3671/:3806/:3988) are inert under
`USE_RENDER_SLICE=true` (either leave them or update for parity, but state which — do not silently
leave a visible-vs-fallback divergence). Because the overlay dataset + null-gap + fidelity +
aria + labeling must now be applied in two live constructors (each with an existing multi-line
tooltip closure), revise the `estimated_new_lines` (60-90 is optimistic) and consider directing
T3 to extract the temporal-chart construction into ONE shared helper before adding the overlay,
to avoid a 2x-duplicated dataset/tooltip (DRY). Add an explicit SC: overlay renders on INITIAL
slice open (not only after a tag toggle).
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>broadn-p16-covariate-ui-T3</task_ref>
      <description>
The tag-filtered overlay path has no weather data. When a tag is active, `updateSliceCharts`
receives `merged` from `mergeTagChartData` (app.js:500-547), which reconstructs `temporal` client-
side as `{month, count}` objects (:533) with NO `weather` key — it aggregates from `tag_charts`,
whose inline temporal builder (preprocess_data.py:926-936) does NOT carry weather and which the
CONTRACT does not extend. So in tag-filtered mode the overlay has nothing to draw. The plan is
silent on this state; T3 SC3 covers null-months but not the tag-active no-weather case.
      </description>
      <required_revision>
Add to T3 an explicit behavior for the tag-active state: the overlay must degrade to "no overlay"
cleanly (guard on `weather` field presence per point; no thrown error, no `[object Object]`, no
NaN) rather than assume weather is always present in `chartData.temporal[]`. Do NOT bake weather
into `tag_charts` (scope creep + client re-aggregation ban) — just specify graceful absence.
      </required_revision>
    </challenge>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>WARNING</severity>
      <task_ref>broadn-p16-covariate-ui-T1</task_ref>
      <description>
`build_temporal` is a SHARED producer. Besides the four slice builders (:1003/:1319/:1382/:1436),
it is also called at preprocess_data.py:1532 to build the top-level global `temporal` array
(emitted at :1625, rendered by the global chart at app.js:1069-1100). T1's instruction to "extend
`build_temporal(group)`" so each bucket gains `weather` will therefore add `weather` to the GLOBAL
temporal too — a shape change the CONTRACT does not list ("No other `data.json` shape changes")
and that T3 does not consume. Also: `build_temporal`'s current signature is `(field_samples)` with
no access to the covariates index; joining requires passing the index into every call site
(including the global :1532 call).
      </description>
      <required_revision>
Have T1 parametrize `build_temporal` (e.g. add `covariates_index=None`; only emit `weather` when it
is supplied) and pass it from the four slice builders but NOT the global :1532 call — so the global
temporal stays byte-identical and the contract's "slice_views only" scope holds. Alternatively,
explicitly amend the CONTRACT + SC5 size guard to acknowledge the global temporal gains `weather`.
Either is acceptable, but the plan must pick one; leaving it implicit risks an unintended global-
temporal diff that the determinism gate (SC1 `git diff --exit-code`) will still pass but the
contract will silently violate.
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>broadn-p16-covariate-ui-T1</task_ref>
      <description>
NaN serialization is an unguarded hard-failure path. Python's `json.dump` defaults to
`allow_nan=True` and emits bare `NaN` tokens; the browser's `JSON.parse` on the single
`fetch('data/data.json')` (app.js:4715) THROWS on `NaN`, which would break the entire app, not just
the covariate cells. A NaN can arise if a `fetch_status=="success"` sample has a null headline
field (humidity/precipitation are not guaranteed non-null on success), or if a per-slice-month mean
is taken over zero non-null contributors for a given field. SC2 forbids NaN tokens so the auditor
catches it, but the plan does not instruct the bake to coerce missing/NaN to `null` per field.
      </description>
      <required_revision>
Add to T1: every baked covariate value and every per-slice `weather` field must be coerced to JSON
`null` (never `NaN`/Infinity) — compute per-field means over only non-null contributors; if a field
has no non-null contributor, emit `null` for that field (or `weather:null` if none of the four have
data). Recommend the BE also pass `allow_nan=False` semantics via explicit None-coercion before
dump (do NOT change the `json.dump` call signature in a way that reorders — keep `indent=2,
ensure_ascii=False`). Also use a null-safe lookup for the per-sample join (`.get(id)` → `null`) so a
missing covariates key never raises `KeyError` mid-build.
      </required_revision>
    </challenge>
  </challenges>

  <audit_risk_forecast>
    1. Live-walk of the slice temporal overlay (the BLOCKER above): the highest-probability audit
    FAIL is the overlay rendering only after a tag toggle and being absent on default slice open —
    the auditor's headless walk must open a slice cold and confirm the overlay, not just toggle a
    filter. 2. Metadata-not-results labeling strength (risk_flags HARD): the auditor should treat
    weak/absent grid-cell-estimate + fidelity labeling as a FAIL on both surfaces, per landmine 1.
    3. Determinism gate depends on pandas/openpyxl in the audit env; if absent, the auditor must
    fall back to a structural jq/python null+schema check on committed data.json (already flagged).
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
    Read: docs/after-actions/broadn-p12-altitude-single-rail.md (§5 recurring: FE marking browser-SCs
    ✓ from code traces without running them; §6: gating/state-change layout side effects) and
    docs/after-actions/broadn-teal-rebrand.md (§5 recurring: scope-boundary blindness to cross-file
    contracts — a change's effect lands outside the declared file/anchor scope). Both directly
    reinforce the T3 wrong-render-site BLOCKER. Also cross-checked the PM's cited
    docs/post-mortems/broadn-p4.md and broadn-p5-p6.md single-file-serialization + stale-chart-type
    `ctx.parsed` accessor patterns — the PM's mitigations (prior_approved_tasks for T4;
    `ctx.parsed.y` rule in T3) are correctly carried forward. SC-precheck: the mechanical
    sc-locked-value-consistency script is not present in this repo; PM's manual scan
    (method:"manual-pm-scan", zero unsatisfiable) is the accepted substitute — not blocked on the
    script's absence.
  </post_mortem_patterns_checked>
</plan_critique>

---

# RE-REVIEW — REV1 (focused re-verification of the four REV0 findings)

<plan_critique>
  <plan_id>broadn-p16-covariate-ui (REV1)</plan_id>
  <status>PASS</status>

  <challenges>
  </challenges>

  <resolution_verification>
    All four REV0 findings are cleanly resolved and no new defect was introduced. Verified against
    live code, not prose.

    1. T3 BLOCKER (render site) — RESOLVED. REV1 re-anchors the PRIMARY overlay site to
    `WIDGET_RENDERERS['temporal_bar']` (assets/app.js:2404), demotes `updateSliceCharts` to SECONDARY,
    and adds SC1 requiring the overlay present on a COLD slice open (no tag toggle). Re-verified on
    disk: `USE_RENDER_SLICE = true` (:114); the short-circuit to `renderSlice` exists in all three
    per-category renderers — project :3585, location :3721, lab_group :3902 (both new REV1 anchors
    confirmed exact); `renderSlice` dispatches to `WIDGET_RENDERERS[widget.type]` (:2646);
    `temporal_bar` is present throughout data/project-layouts.json. SC1 is auditor-checkable via the
    headless walk (open a slice fresh, assert overlay dataset present, zero console errors). The
    secondary `updateSliceCharts` hook is also correct: on tag-clear (:802) it re-renders from
    `activeEntry.temporal` (carries weather), so the overlay must be restorable there.

    2. T3 WARNING 1 (tag-active no-weather) — RESOLVED. T3 description + new SC8 require graceful
    NO-overlay (no error/broken chart) whenever temporal buckets lack a `weather` field. Correct
    against `mergeTagChartData` (:498, called at :799), which reconstructs `temporal` as
    `{month,count}` with no weather key. The three slice states are now coherent: cold-open (widget →
    weather present → overlay), tag-active (merged → no weather → no overlay), tag-clear
    (activeEntry.temporal → weather present → overlay restored).

    3. T1 WARNING 2 (shared build_temporal) — RESOLVED. REV1 parametrizes `build_temporal(group,
    covariates_index=None)`, bakes `weather` ONLY when the index is passed (the four slice call sites
    :1003/:1319/:1382/:1436), and leaves the global call at :1532 unchanged so the root-level
    `temporal[]` is byte-identical. New SC7 asserts the root `temporal[]` gains no `weather`, and the
    CONTRACT (lines 72-74, 121) now states this explicitly. Structurally prevents the leak.

    4. T1 WARNING 3 (NaN) — RESOLVED. T1 step 4 mandates coercing every empty/missing per-field mean
    to explicit `null` before serialization. SC2 is strengthened to require a token grep for
    `NaN`/`Infinity` returning zero matches, explicitly noting Python `json.load` accepts `NaN` so the
    grep (not json.load alone) is the real gate; risk_flags reinforces "auditor must run the token
    grep." Correctly targets the real hazard (browser `JSON.parse` throws on a bare `NaN` token).
  </resolution_verification>

  <advisory severity="non-blocking">
    The SC2 `NaN`/`Infinity` token grep should target the BARE (unquoted) JSON token (a value-position
    `: NaN` / `: Infinity`, or a word-boundary match outside quotes) rather than a raw substring scan,
    to avoid a theoretical false-positive if any string field ever contained the substring. For this
    botanical sample-metadata dataset the risk is negligible — this is guidance for the auditor's grep
    construction, not a plan change. Not a blocker.
  </advisory>

  <audit_risk_forecast>
    Unchanged from REV0 and now well-mitigated: (1) the auditor's headless T3 walk MUST open a slice
    cold (no tag toggle) to verify the overlay — the single highest-value QA step; (2) metadata-not-
    results labeling strength on both surfaces (weak labeling = scientific-integrity FAIL); (3) the T1
    determinism gate depends on pandas/openpyxl in the audit env, with the structural jq/python
    null+schema+no-NaN fallback already specified.
  </audit_risk_forecast>
</plan_critique>
