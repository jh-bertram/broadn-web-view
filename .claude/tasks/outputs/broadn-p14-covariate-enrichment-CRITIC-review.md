<plan_critique>
  <plan_id>broadn-p14-covariate-enrichment</plan_id>
  <status>BLOCK</status>

  <challenges>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>BLOCKER</severity>
      <task_ref>broadn-p14-001</task_ref>
      <description>
The date_only tier is declared "decided" but is under-specified in three ways that WILL force the BE to improvise, and the natural improvisation is wrong:
(a) NO SCHEMA HOME. SC2 promises "date_only carries a daily aggregate (min/mean/max)", but the output `samples` schema (packet L46) only defines scalar `covariates{temp,humidity,wind_speed,wind_direction,barometric_press,precipitation}` (null for date_only) + provenance. There is no field to hold the aggregate. The deliverable promised by SC2 has nowhere to live — the BE will invent an ad-hoc field and ST (broadn-p14-002) will validate against an undefined contract.
(b) UNIFORM min/mean/max IS WRONG FOR TWO VARIABLES. Open-Meteo hourly `precipitation` is a PRECEDING-HOUR ACCUMULATION (mm), not an instantaneous rate — a daily "mean/max of hourly precip" is close to meaningless; the correct daily value is the SUM. `wind_direction_10m` is a CIRCULAR quantity (0-360°): an arithmetic mean of 350° and 10° yields 180°, the exact opposite of the true ~0°. Uniform min/mean/max silently corrupts both.
(c) UNIT-CONVERSION CHOKE POINT UNSTATED. The km/h÷3.6 and hPa÷10 conversions must be applied exactly once. If the point value is converted but the daily aggregate is computed from the raw (unconverted) hourly array — or vice versa — exact-tier and date_only-tier values are on different scales. This is the "applied exactly once" hazard the ORC brief flagged and the packet does not pin.
This is the single "ambiguity = risk" defect the ORC stress-test named for the date_only tier (likely the LARGEST tier: 84% dated − ~20% exact − part of 35% AM/PM).
      </description>
      <required_revision>
PM must, in broadn-p14-001: (1) add a `daily_aggregate` object to the `samples` schema (e.g. `daily_aggregate: { temp:{min,mean,max}, humidity:{...}, wind_speed:{...}, barometric_press:{...}, precipitation:{sum}, wind_direction:{circular_mean|omit} } | null`); (2) specify PER-VARIABLE aggregation: temp/humidity/wind_speed/barometric_press → min/mean/max; precipitation → daily SUM; wind_direction → vector/circular mean OR explicitly omit (do NOT arithmetic-mean it); (3) add a meta note that the point `precipitation` value is a preceding-hour accumulation; (4) state that both unit conversions are applied ONCE at a single choke point on the raw hourly array BEFORE both point-extraction and aggregation.
      </required_revision>
    </challenge>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>WARNING</severity>
      <task_ref>broadn-p14-001</task_ref>
      <description>
`timezone=America/Denver` is hardcoded for EVERY valid-coord sample (packet L27, L45, SC3). This assumes every Field Sample with a valid coordinate is in the Mountain zone. That is unverified. The site roster in preprocess_data.py (L700-708) includes `IMPROVE` — a NATIONWIDE monitoring network whose sites can sit in Central/Pacific/Eastern zones. Any valid-coord sample outside the Mountain zone gets its exact/ampm hourly index matched against a Denver-local hourly array → a systematic multi-hour offset on that sample's covariates, invisible to the BE's own spot-check (which only samples known-good rows). The Nebraska/Doane rows happen to be skipped as bad-coord, but they are also Central-time — evidence the dataset is not tz-homogeneous. The sign-flip skip does not cover valid non-Mountain coords.
      </description>
      <required_revision>
Add to broadn-p14-001: a coord-region sanity flag — assert each valid lat/lon falls within a documented Mountain-region bounding box; any coord outside it is flagged (e.g. `tz_region="out_of_mountain_box"`) so its covariates are not silently mis-timed. Add to broadn-p14-002 (ST): segment the diurnal timezone check BY SITE (or by region flag), not pooled, so a non-Mountain cluster cannot be averaged into a passing global signal.
      </required_revision>
    </challenge>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>WARNING</severity>
      <task_ref>broadn-p14-001</task_ref>
      <description>
The dedup key is `(round(lat,N), round(lon,N), collection_date)` "one API call per unique key" (L38), but the packet never states WHICH coordinate is SENT in that one call, nor how offset_km is computed for the non-representative members. If the BE sends a representative RAW coord, then resolved_grid_lat/lon and offset_km stored for every other sample sharing that key are computed against a grid resolved from a DIFFERENT raw coordinate — so offset_km (SC7 provenance) is wrong (by up to the rounding-cell size) for all but the representative row. This is not a determinism break (pandas row order is stable, so SC10 byte-identity still holds), but it is a provenance-correctness gap.
      </description>
      <required_revision>
Specify in broadn-p14-001: the API query is issued with the ROUNDED coordinates themselves (making the dedup key identical to the query, and the resolved grid cell shared-and-correct for all members); compute offset_km PER-SAMPLE as haversine(sample's own raw lat/lon → resolved grid cell). Also document the rounding constant N and confirm it targets the "few hundred calls" figure given calls = unique(rounded coord) × unique(date).
      </required_revision>
    </challenge>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>WARNING</severity>
      <task_ref>broadn-p14-001</task_ref>
      <description>
The four time-fidelity buckets are exhaustive only if evaluation ORDER is specified, and it is not. Bucket 1 "exact" is defined as "Sample Collected Time present → build the exact local datetime" (L31), but a datetime cannot be built without a date. A row with a time value but NO Sample Collected Date would fall into "exact" by the literal wording and then fail to construct a timestamp. no_date (bucket 4) must be evaluated FIRST.
      </description>
      <required_revision>
State the tier decision order explicitly in broadn-p14-001: check date-absence first (→ no_date), THEN time-present (→ exact), THEN AM/PM-present (→ ampm_imputed), ELSE date_only. Guarantees mutual exclusivity and that a timed-but-undated row is correctly no_date.
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>broadn-p14-002</task_ref>
      <description>
ST plausibility item 4 checks `barometric_press` "in a plausible kPa band" and treats "~1000" as an un-converted-hPa leak (correct). But it does not account for ELEVATION. High Colorado sites (NWT / Niwot Ridge ~3500 m) have a genuine surface_pressure of ~65-68 kPa (~650-680 hPa) — this is CORRECT physics, not an outlier. A sea-level-anchored plausibility band (~85-105 kPa) would false-flag every high-elevation sample as an outlier, and could be mistaken for a conversion bug. Open-Meteo returns the resolved grid-cell `elevation` — the plausibility band should be elevation-aware. This is the surface_pressure gap the PM did not surface.
      </description>
      <required_revision>
Instruct broadn-p14-002 to make the barometric_press plausibility band elevation-aware (expect ~65 kPa at ~3500 m up to ~85 kPa near the plains), using the resolved-cell elevation in the enriched output; do not flag elevation-depressed pressures as outliers. Keep the "value ~1000 ⇒ hPa leaked un-converted" check as a separate, distinct test.
      </required_revision>
    </challenge>

    <challenge>
      <type>MISSING_RESEARCH</type>
      <severity>WARNING</severity>
      <task_ref>SPRINT</severity>
      <description>
No sc-locked-value-consistency precheck report is attached to this decomposition. The routing_notes (L211) document the base-plan fallback (PM subagent has no Bash; the precheck script is a gander-repo skill not present in broadn-web-view) and a manual locked-value lint was performed instead — consistent with the broadn-p12 after-action ("pm-preflight: script absent"). I independently spot-checked every SC on both packets: they are behavioral/computed assertions (git-diff==0, unique_api_calls count, byte-identical rebuild, coverage counts) with NO verbatim locked-line deliverable (no frontmatter, no fixed copy string, no schema field pinned verbatim). No SC greps a locked line in a self-contradicting way. I am therefore NOT escalating the absent report to a hard BLOCKER — the locked-value-consistency defect class does not apply to this sprint's SC shapes. Flagging for ORC visibility per the gate mandate.
      </description>
      <required_revision>
No plan change required. ORC: if the mechanical precheck gate is to be enforced regardless of applicability, note that the script does not exist in this repo's base-plan and the documented manual fallback stands.
      </required_revision>
    </challenge>

  </challenges>

  <audit_risk_forecast>
1. SA (DRY): `enrich_covariates.py` re-implements `load_xlsx()` and re-declares the column constants (COL_BROADN_ID, COL_COLLECTED_DATE/TIME, COL_SAMPLE_AMPM, "Latitude"/"Longitude") that already live in preprocess_data.py L57-92. Under standards.md "extract shared logic before the second use" this is a literal second use. It is nonetheless the SAFER choice — importing from the 77 KB preprocess_data.py risks executing its module-level code on import and couples the side-file to the main pipeline. Recommend the BE add a one-line rationale comment ("standalone reader — intentional duplication to avoid importing the main pipeline module") so SA reads it as deliberate, not accidental, duplication. This is the most likely SA ding.
2. QA / GATE-RUN: the recurring broadn-p12 pattern is "runtime SCs marked ✓ from a code trace without running." SC9/SC10 and GATE-RUN correctly demand a real run + a real byte-identical cache-only rebuild + a real zero-network re-run. The auditor must EXECUTE these, not accept the completion packet's assertion. This is well-defended in the plan; the risk is only if GATE-RUN is skipped.
Non-blocking hygiene the BE should honor: do NOT echo the raw response's `generationtime_ms` into covariates.json (it varies per fetch); round provenance floats (offset_km, resolved_grid_lat/lon) to a documented precision; numeric-validate lat/lon (reject NaN/non-numeric) before URL insertion per the SX param-encoding guard; and define nearest-vs-floor hourly-index matching explicitly.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
Read in full: docs/after-actions/broadn-p12-altitude-single-rail.md (§5 recurring: FE marking runtime SCs ✓ from code traces — the plan defends this via GATE-RUN; remediation packets not written — both packets carry Output Paths) and docs/after-actions/broadn-teal-rebrand.md (§5/§6 recurring: scope-boundary blindness to cross-file contracts + untracked-referenced-asset — the plan defends this via strict additive side-file scope, SC1 zero-diff to preprocess_data.py/data.json, and GATE-RUN's every-cache-file-tracked check). Also cross-checked routing_notes' recurring_pattern declarations against broadn-p7 (assume-constant-value) — HONORED: the field-TEMP column has NO constant in preprocess_data.py (grep confirmed only `temporal` binning exists), and ST is correctly told to discover it empirically. PM's three corrections (field-TEMP empirical discovery, positive-longitude skip-now, determinism requirement) are all sound; the gaps the PM MISSED are precipitation-as-accumulation/sum, circular wind_direction, and elevation-aware pressure plausibility — addressed in the BLOCKER and the ST WARNING above.
  </post_mortem_patterns_checked>
</plan_critique>
