<task_decomposition task_id="broadn-p14-covariate-enrichment" agent_count="2">
<!-- REV2: folds Critic CRITIQUE_BLOCK prescriptions — 1 blocker (date_only tier fully specified) + 5 warnings (W1 timezone=auto, W2 per-sample offset_km, W3 tier precedence, W4 elevation-aware pressure, W5 DRY-rationale comment) + GATE-RUN auditor-executes-rebuild. No redesign; prescribed encodings only. -->

<task_packets>

<task_packet>
  <task_id>broadn-p14-001</task_id>
  <assigned_to>backend</assigned_to>
  <priority>HIGH</priority>
  <description>
Create a NEW standalone build-time Python script `scripts/enrich_covariates.py` that attaches concurrent MIxS-Air weather covariates to each Field Sample, then RUN it against the real dataset to produce committed, reproducible artifacts. The site stays 100% static — this is a side-file only.

READ-AND-MIRROR (do not edit preprocess_data.py):
- Read `Bdb-317.xlsx` Sheet1 directly via `pd.read_excel(path, engine="openpyxl")`, mirroring `load_xlsx()` (preprocess_data.py L98) and its warnings-suppression.
- Column literals verified on-disk in preprocess_data.py L57–90: `COL_BROADN_ID="BROADN ID"`, `COL_COLLECTED_DATE="Sample Collected Date"`, `COL_COLLECTED_TIME="Sample Collected Time"`, `COL_SAMPLE_AMPM="Sample AM/PM"`; coordinate columns are literally `"Latitude"`/`"Longitude"`. Field Sample filter mirrors `FIELD_SAMPLE_CATEGORY="Field Sample"`. Enrich the ~4,569 Field Sample rows only — NOT the 3,506 Product/derivative rows.
- Reuse the parsing shape of `_time_to_hour()` (L719: datetime.time object OR "HH:MM" string) when building per-sample timestamps.
- W5 (SA DRY): add ONE explicit rationale comment near the reader documenting the intentional duplication of load_xlsx/column-literals — "standalone reader chosen to decouple build-time enrichment from preprocess_data.py; NOT a DRY violation." SA must not ding the duplication.

VARIABLE SET (module-level constant, DEFAULT = core Goal-2 set; a CONFIGURABLE knob, not a hardcoded fact — exact set + MIxS unit choices are a PI open question):
  temperature_2m      -> temp             (keep °C)
  relative_humidity_2m-> humidity         (keep %)
  wind_speed_10m      -> wind_speed       (km/h -> m/s, ÷3.6)
  wind_direction_10m  -> wind_direction   (keep °)
  surface_pressure    -> barometric_press (hPa -> kPa, ÷10)
  precipitation       -> precipitation    (keep mm)

OPEN-METEO (contract live-verified by ORC 2026-07-06 — no researcher needed):
  GET https://archive-api.open-meteo.com/v1/archive?latitude=..&longitude=..&start_date=..&end_date=..&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m,surface_pressure&timezone=auto
  W1 — use `timezone=auto` (resolves per-coordinate; correct for the nationwide IMPROVE network too), NOT a hardcoded America/Denver. Store the response's resolved `timezone` and `utc_offset_seconds` in each record's provenance. Response also returns resolved grid-cell lat/lon + `elevation` (store elevation — ST needs it for W4). No API key.

UNIT-CONVERSION ORDERING (Critic blocker item 3 — load-bearing): apply the km/h÷3.6 (wind_speed) and hPa÷10 (barometric_press) conversions EXACTLY ONCE, to the RAW HOURLY ARRAY, BEFORE both (a) hourly point-extraction and (b) daily aggregation. This guarantees exact-tier scalar values and date_only-tier daily values live on the SAME scale. Do not convert again downstream.

FOUR TIME BUCKETS — evaluated in a FIXED, MUTUALLY-EXCLUSIVE PRECEDENCE (Critic W3). Order:
  1. "no_date"      — FIRST: any row with no Sample Collected Date (even if a time IS present) -> covariates null, covariates_daily null, not enriched. time_imputed=true (flagged).
  2. "exact"        — has Sample Collected Time: build exact local datetime, match nearest hourly index -> scalar `covariates`. time_imputed=false.
  3. "ampm_imputed" — has Sample AM/PM, no exact time: impute AM->09:00 / PM->15:00 local (module constants), match hourly -> scalar `covariates`. time_imputed=true.
  4. "date_only"    — date present, no time and no AM/PM: scalar hourly `covariates` = null; populate `covariates_daily` (below). time_imputed=true.
Never present an imputed value as a real hourly measurement.

DUAL OUTPUT SCHEMA (Critic blocker items 1+2): each sample carries BOTH:
  - scalar `covariates` {temp,humidity,wind_speed,wind_direction,barometric_press,precipitation} | null  (hourly point; populated for exact/ampm_imputed)
  - `covariates_daily` object — a DEFINED field (not ad-hoc), populated for date_only rows (MAY optionally also be emitted for exact/ampm rows as extra context; your call, but the field must exist). Daily aggregation over that day's converted hourly array, PER-VARIABLE-CORRECT:
      precipitation   -> daily SUM (hourly accumulation)
      wind_direction  -> CIRCULAR MEAN: atan2(mean(sin θ), mean(cos θ)) normalized to 0–360 — NOT arithmetic mean
      temperature     -> daily mean, PLUS daily min and daily max
      humidity        -> daily mean
      wind_speed      -> daily mean
      barometric_press-> daily mean

BAD-COORD HANDLING (landmine 6): rows with `Longitude > 0`, or null/blank Latitude/Longitude -> coord_status="skipped_bad_coord", covariates + covariates_daily null, ZERO API calls. (Positive-longitude "Doane" rows are sign-flipped vs Nebraska ~-96.9 W; raw +96.9 lands the grid-cell in central Asia. Skip+flag ONLY — no sign-correction in Phase 1.)

DEDUP + COMMITTED CACHE (landmine 3 + Critic W2): dedup key = (round(lat, N), round(lon, N), collection_date), N a documented constant collapsing ~8k rows to a few hundred unique calls. QUERY Open-Meteo with the ROUNDED dedup coords (deterministic cache key). One raw JSON response cached per unique key -> `data/cache/{deterministic-filename}.json`, committed. On re-run a cache hit uses the file, NO network. `offset_km` is computed PER-SAMPLE: each sample's TRUE lat/lon -> the response's resolved grid-cell (haversine), NOT once per dedup cell. `.gitignore` does not ignore `data/` (verified) so cache files WILL track.

PROVENANCE PER RECORD (landmine 5, expanded): covariate_source, resolved_grid_lat, resolved_grid_lon, elevation, offset_km (per-sample), matched_local_time, matched_utc_time, timezone (resolved), utc_offset_seconds, time_imputed, time_fidelity, coord_status, fetch_status. On fetch failure: covariates + covariates_daily null + fetch_status="failed" + error string — NEVER abort the build.

TIMEZONE PRE-BULK VALIDATION (landmine 1, now timezone=auto): BEFORE the bulk run, spot-check >=2 exact-time samples (one daytime, one nighttime local hour) and assert (a) matched_local_time's hour equals the sample's local hour under the RESOLVED utc_offset_seconds and (b) daytime temp is diurnally plausible vs nighttime. Print the check.

OUTPUT `data/covariates.json` keyed by BROADN ID:
  meta: { generated_by, source_api:"open-meteo-archive", variable_set, units{...}, timezone_mode:"auto", grid_note:"modeled reanalysis ~11–25 km grid-cell estimate; sample metadata, not measured results", coverage_summary{ total, no_date, exact, ampm_imputed, date_only, skipped_bad_coord, fetch_failed, unique_api_calls } }
  samples: { "<BROADN ID>": { covariates{...}|null, covariates_daily{...}|null, time_fidelity, time_imputed, matched_local_time, matched_utc_time, timezone, utc_offset_seconds, coord_status, resolved_grid_lat, resolved_grid_lon, elevation, offset_km, fetch_status, covariate_source } }

DETERMINISTIC SERIALIZATION (for the offline-rebuild-identical SC): sort keys, fix float precision (documented decimal count) so a cache-only rebuild is byte-identical.

RUN IT: execute against the real dataset (network available) to produce real committed `data/covariates.json` + populated `data/cache/`. Execution-dependent deliverable — a code trace is NOT sufficient. Idempotent + offline-from-cache.
  </description>
  <success_criteria>
1. `scripts/enrich_covariates.py` exists, reads Bdb-317.xlsx via openpyxl mirroring load_xlsx, filters to Field Sample rows; a ONE-LINE rationale comment documents the intentional load_xlsx/column-literal duplication (standalone reader decouples build-time enrichment from preprocess_data.py — W5); `git diff` shows ZERO changes to scripts/preprocess_data.py and data/data.json.
2. The FOUR buckets are evaluated in a fixed, MUTUALLY-EXCLUSIVE precedence — no_date FIRST (a timed-but-undated row is no_date, never mis-bucketed as exact), then exact, then ampm_imputed, then date_only — each with explicit time_fidelity + time_imputed flags; no imputed value emitted without time_imputed=true (W3).
3. Unit conversions (wind_speed km/h÷3.6 -> m/s; barometric_press hPa÷10 -> kPa) applied EXACTLY ONCE, on the RAW HOURLY array, BEFORE both hourly point-extraction AND daily aggregation, so exact-tier and date_only-tier values share one scale; temp °C, humidity %, wind_direction °, precipitation mm unchanged; meta.units matches (Critic blocker 3).
4. Each sample carries BOTH a scalar `covariates` object (hourly point; populated for exact/ampm_imputed) AND a DEFINED `covariates_daily` object; for date_only the scalar `covariates` is null and `covariates_daily` is populated (Critic blocker 1).
5. `covariates_daily` aggregation is per-variable-correct: precipitation -> daily SUM; wind_direction -> CIRCULAR mean (atan2 of mean-sin/mean-cos, normalized 0–360, NOT arithmetic); temperature/humidity/wind_speed/barometric_press -> daily mean; temperature additionally emits daily min + max (Critic blocker 2).
6. Every request sends `timezone=auto`; each record stores the resolved `timezone` + `utc_offset_seconds` (and `elevation`) in provenance; matched_local_time / matched_utc_time are consistent with that offset; the pre-bulk day/night spot-check runs and PASSES against the resolved local time (W1 + landmine 1).
7. Dedup key = (round(lat,N), round(lon,N), date); Open-Meteo is queried with the ROUNDED dedup coords; one raw response cached per unique key under data/cache/; a second identical run makes ZERO new network calls (idempotent). `offset_km` is computed PER-SAMPLE (true lat/lon -> resolved grid-cell), not once per cell (W2 + landmine 3).
8. Rows with Longitude>0 or null/blank coords -> coord_status="skipped_bad_coord", covariates + covariates_daily null, ZERO API calls (landmine 6).
9. Every enriched record carries the full provenance set (covariate_source, resolved_grid_lat/lon, elevation, offset_km per-sample, matched_local_time, matched_utc_time, timezone, utc_offset_seconds, time_imputed, time_fidelity, coord_status, fetch_status) (landmine 5).
10. A single fetch failure yields null covariates + covariates_daily + fetch_status="failed" for that record; the build still completes (never abort on one failure) (landmine 5).
11. Script was RUN on the real dataset: data/covariates.json exists keyed by BROADN ID with REAL non-placeholder values (scalar + daily where applicable) and a populated coverage_summary (per-tier/status counts + unique_api_calls); data/cache/ populated.
12. Deterministic serialization (sorted keys, fixed float precision) -> an offline / network-unavailable cache-only rebuild reproduces a BYTE-IDENTICAL data/covariates.json.
13. No secret / API key committed; polite throttle + backoff present; no change to index.html / assets/app.js / styles.css (static site untouched).
  </success_criteria>
  <context_files>
- .claude/tasks/broadn-p14-covariate-enrichment.md  (orchestrator brief + VERIFIED ground facts; Open-Meteo contract/units live-probed 2026-07-06)
- scripts/preprocess_data.py  (READ-ONLY reference: load_xlsx L98; column constants L57–90; Longitude>0 / lat-long fill code L433–476; _time_to_hour L719; build_all_samples L649 — mirror conventions, DO NOT edit)
- Bdb-317.xlsx  (source data, read-only)
  </context_files>
  <dependencies>NONE (first task in sprint)</dependencies>
  <out_of_scope>
- NO front-end work: do not touch index.html, assets/app.js, styles.css, or any UI. Surfacing covariates is Phase 2.
- Do NOT modify scripts/preprocess_data.py or data/data.json — the covariate side-file is separate and additive.
- Do NOT sign-correct positive-longitude coords — skip+flag only.
- No new third-party dependencies beyond pandas / openpyxl / requests / urllib.
- Do not surface covariates in the reference-only results surface (metadata-not-results, landmine 7).
  </out_of_scope>
  <output_expected>
    <tag>completion_packet</tag>
    <must_contain>
      <item>Path to scripts/enrich_covariates.py; confirmation it is NEW with no diff to preprocess_data.py/data.json; the DRY-rationale comment line</item>
      <item>coverage_summary excerpt (per-tier + status counts + unique_api_calls) from produced data/covariates.json</item>
      <item>A sample record showing scalar `covariates` AND `covariates_daily` (with SUM precip / circular-mean wind_direction / temp min+max) plus provenance incl. resolved timezone + utc_offset_seconds + per-sample offset_km + elevation</item>
      <item>data/cache file count; cache populated + tracked</item>
      <item>Pre-bulk timezone day/night spot-check result (matched hours + temps under resolved offset)</item>
      <item>Offline/cache-only rebuild = byte-identical confirmation</item>
    </must_contain>
    <must_not_contain>
      <item>Any front-end edit or any diff to preprocess_data.py / data.json</item>
      <item>Hardcoded secret or API key; hardcoded America/Denver timezone (must be timezone=auto)</item>
      <item>An imputed covariate value not flagged time_imputed=true; a timed-but-undated row bucketed as exact</item>
      <item>An arithmetic (non-circular) wind_direction daily mean; a double-applied unit conversion</item>
      <item>An API call issued for a skipped_bad_coord row</item>
    </must_not_contain>
    <success_signal>enrich_covariates.py runs to completion producing real data/covariates.json (scalar + covariates_daily, full provenance) + populated tracked data/cache/; second run = zero network; cache-only rebuild byte-identical; no static-site files changed.</success_signal>
  </output_expected>
</task_packet>

<task_packet>
  <task_id>broadn-p14-002</task_id>
  <assigned_to>statistician</assigned_to>
  <priority>NORMAL</priority>
  <description>
Statistically validate the enriched output from broadn-p14-001. Produce a decision-grade statistical_report ONLY (no app code, no repo edits — write solely to the Output Path). Issue explicit verdicts on timezone correctness and join correctness.

1. COVERAGE TIERS: confirm meta.coverage_summary counts reconcile — per-tier/status counts (no_date, exact, ampm_imputed, date_only, skipped_bad_coord, fetch_failed) sum to the total Field Sample count. Report per-tier fill vs the brief's expected ranges (exact ~20% time-filled, AM/PM ~35%, date ~84% so date_only is the remainder, no_date ~16%). Flag anomalies (e.g. an unexpectedly high fetch_failed count = systemic fetch/coord problem).

2. TIMEZONE / DIURNAL SANITY — SEGMENTED BY SITE (Critic W1): because enrichment now uses timezone=auto (per-coordinate resolution), do NOT pool the diurnal check. For each site (or resolved-timezone group), confirm across its "exact"-tier records that daytime LOCAL hours are warmer than nighttime local hours. A residual UTC-vs-local shift would push a site's temperature minimum toward local midday — call that out per site. Emit a per-site + overall PASS/FAIL timezone verdict.

3. JOIN-CORRECTNESS CROSS-CHECK: cross-check enriched `temp` against the field-measured temperature in Bdb-317.xlsx (~81% fill per the brief). NOTE: the exact field-temperature COLUMN NAME is NOT defined in preprocess_data.py (confirmed: no TEMP/temperature constant exists) — identify the actual column empirically from the xlsx header, report its name + observed fill, then use it. Report correlation + residual distribution of enriched temp vs field temp; strong positive correlation is independent evidence the lat/long + time join is correct. If the column cannot be located, say so explicitly — do NOT fabricate a signal. Emit a PASS/FAIL join verdict.

4. VALUE PLAUSIBILITY — ELEVATION-AWARE PRESSURE (Critic W4): confirm each covariate sits in physical bounds — temp plausible for CO/high-plains, humidity 0–100%, wind_speed >=0 (m/s), wind_direction 0–360°, precipitation >=0 (mm). For barometric_press, the plausibility band MUST be elevation-aware using the Open-Meteo-returned `elevation` in each record — e.g. NWT (Niwot Ridge, ~3500 m) at ~65 kPa is CORRECT physics, not an outlier; only flag pressures inconsistent with the record's elevation (and flag any value ~1000, which would mean un-converted hPa leaked through). List genuine outliers.

5. Also spot-check `covariates_daily` for date_only rows: values present + plausible; daily precipitation SUM >= any single hourly value; wind_direction daily value in 0–360. Report distributions/anomalies.
  </description>
  <success_criteria>
1. A statistical_report is written to the Output Path; ZERO repo files modified (read-only validation).
2. Coverage-tier reconciliation: summed tier/status counts == total Field Samples; per-tier fill reported vs the brief's expected ranges; anomalies flagged.
3. Diurnal timezone check performed SEGMENTED BY SITE (not pooled) with per-site + overall PASS/FAIL verdict (day-vs-night differential in the correct direction; no residual shift) (W1).
4. Field-temperature cross-check: the field-temp column is located in the xlsx (name + fill reported), and enriched-temp-vs-field-temp correlation/residuals reported with a PASS/FAIL join verdict — OR an explicit "column not found" statement (no fabricated signal).
5. Per-covariate plausibility checked, with barometric_press validated ELEVATION-AWARE using the record's returned `elevation` (NWT ~65 kPa treated as correct); un-converted-hPa smell (~1000) flagged; genuine outliers listed (W4).
6. `covariates_daily` for date_only rows spot-checked (present + plausible; precip SUM >= any hourly; wind_direction 0–360).
7. Report is decision-grade: literal "timezone correct: yes/no" and "join correct: yes/no" statements backed by the evidence.
  </success_criteria>
  <context_files>
- .claude/tasks/broadn-p14-covariate-enrichment.md  (brief + expected fill ranges)
- data/covariates.json  (produced by broadn-p14-001 — depends on it existing)
- scripts/enrich_covariates.py  (to understand provenance/tier/daily fields being validated)
- Bdb-317.xlsx  (source of the field-measured temperature cross-check, read-only)
  </context_files>
  <dependencies>broadn-p14-001</dependencies>
  <out_of_scope>
- No application code, no repo file edits, no re-running the Open-Meteo fetch.
- Do not modify data/covariates.json, the xlsx, or the script.
- No UI / front-end work.
  </out_of_scope>
  <output_expected>
    <tag>data_packet</tag>
    <must_contain>
      <item>Coverage-tier reconciliation table (counts sum to total Field Samples)</item>
      <item>Per-site + overall diurnal timezone PASS/FAIL verdict with evidence</item>
      <item>Field-temperature column name + fill, enriched-vs-field temp correlation + join PASS/FAIL verdict (or explicit "column not found")</item>
      <item>Elevation-aware per-covariate plausibility + outlier list; covariates_daily spot-check</item>
    </must_contain>
    <must_not_contain>
      <item>Any repo file edit or code change</item>
      <item>A fabricated field-temp correlation when the source column was not located</item>
      <item>Pressure flagged as an outlier purely for being low at a high-elevation site</item>
    </must_not_contain>
    <success_signal>statistical_report at the Output Path with explicit "timezone correct: yes/no" (per-site) and "join correct: yes/no" verdicts, coverage reconciliation, elevation-aware plausibility, and daily-aggregate spot-check — no repo files touched.</success_signal>
  </output_expected>
</task_packet>

</task_packets>

<dependency_order>
broadn-p14-001 (BE: build + RUN enrich_covariates.py; produce data/covariates.json + committed cache)
  -> broadn-p14-002 (ST: validate the produced output; depends on real artifacts existing)
  -> Auditor SA + QA + SX on both packets
  -> GATE-RUN (CLOSE-BLOCKING, auditor/ORC-EXECUTED — NOT self-reported): the auditor MUST actually EXECUTE a zero-network (cache-only) rebuild and DIFF the result to confirm data/covariates.json is byte-identical (p12 trace-not-run pattern — do not accept the packet's word). Also verify on-disk that (a) data/covariates.json holds REAL per-sample values (scalar + covariates_daily) with a populated coverage_summary, (b) an idempotent re-run issues zero network calls, (c) EVERY data/cache/* file + data/covariates.json + scripts/enrich_covariates.py are git-tracked (no untracked artifact)
  -> commit (audit-gated; >50 new lines requires the passed gate) -> Archivist
</dependency_order>

<verbatim_deliverable_audit>
  <phrase text="Start on Phase 1"><addressed task="broadn-p14-001"/></phrase>
  <phrase text="build-time Python step / script"><addressed task="broadn-p14-001"/></phrase>
  <phrase text="attaches concurrent MIxS-Air weather covariates to each field sample"><addressed task="broadn-p14-001"/></phrase>
  <phrase text="keeping the site 100% static / NO front-end"><out_of_scope reason="Phase 2; enforced as out_of_scope + must_not_contain on both packets and by GATE-RUN static-site check"/></phrase>
  <phrase text="committed, reproducible covariate side-file data/covariates.json"><addressed task="broadn-p14-001"/></phrase>
  <phrase text="committed response cache (data/cache/)"><addressed task="broadn-p14-001"/></phrase>
  <phrase text="timezone load-bearing; validate before bulk run"><addressed task="broadn-p14-001" note="Critic W1: switched from hardcoded America/Denver to timezone=auto (per-coordinate; safe for nationwide IMPROVE); resolved timezone+utc_offset_seconds stored in provenance; ST diurnal check segmented by site"/></phrase>
  <phrase text="three time-fidelity tiers each with explicit flags"><addressed task="broadn-p14-001" note="now 4 mutually-exclusive ordered buckets (no_date first) per Critic W3; date_only fully specified with covariates_daily"/></phrase>
  <phrase text="dedup by (grid-cell, day) -> few hundred calls"><addressed task="broadn-p14-001"/></phrase>
  <phrase text="unit conversions to MIxS-Air (km/h->m/s, hPa->kPa)"><addressed task="broadn-p14-001" note="Critic blocker 3: applied once on raw hourly before extraction + aggregation"/></phrase>
  <phrase text="provenance per record; null+flag on fetch failure, never abort"><addressed task="broadn-p14-001"/></phrase>
  <phrase text="positive-longitude / bad-coord rows skip/flag"><addressed task="broadn-p14-001"/></phrase>
  <phrase text="metadata-not-results / grid-cell estimate labeling"><addressed task="broadn-p14-001"/></phrase>
  <phrase text="idempotent + offline-from-cache rebuild"><addressed task="broadn-p14-001" note="GATE-RUN auditor executes the cache-only rebuild + diff"/></phrase>
  <phrase text="RUN it to produce real committed artifacts"><addressed task="broadn-p14-001"/></phrase>
  <phrase text="coverage / fill summary"><addressed task="broadn-p14-001"/></phrase>
  <phrase text="ST validate output: coverage tiers, timezone sanity, cross-check enriched temp vs field TEMP"><addressed task="broadn-p14-002"/></phrase>
  <phrase text="report distributions / anomalies"><addressed task="broadn-p14-002"/></phrase>
  <phrase text="Audit SA+QA+SX PASS; no secrets; polite API use"><addressed task="broadn-p14-001"/></phrase>
  <phrase text="covariate variable set + MIxS units (PI open question)"><addressed task="broadn-p14-001" note="default core Goal-2 set as configurable knob; raised in risk_flags"/></phrase>
  <phrase text="surfacing covariates in the UI"><out_of_scope reason="explicitly Phase 2 per brief"/></phrase>
</verbatim_deliverable_audit>

<routing_notes>
Relevant critics: SA (kebab-case script name, no secrets, deterministic serialization, W5 DRY-rationale comment for the intentional standalone-reader duplication), QA (real run happened, idempotency, auditor-EXECUTED cache-only rebuild diff), SX (no key; validate/encode lat/lon/date into request URLs).

DESIGN.md: N/A — no UI surface touched this sprint. No UI Designer / FE packet. Researcher NOT dispatched — Open-Meteo contract+units live-verified; variable set / AM-PM impute hours are configurable knobs. DS: N/A — no database.

append_serialization: none — packets write disjoint targets (BE: scripts/enrich_covariates.py + data/covariates.json + data/cache/; ST: its Output Path only). Changelog/registry updates are ORC/archivist-owned.

REV2 Critic-prescription encoding map (all six items):
  - BLOCKER date_only -> packet 001 description "DUAL OUTPUT SCHEMA" + SC4 (covariates_daily defined field) + SC5 (per-variable aggregation: SUM precip / circular-mean wind_dir / mean others / temp min+max) + SC3 (conversion once before extraction+aggregation).
  - W1 timezone=auto -> packet 001 desc "OPEN-METEO"/SC6 + provenance timezone/utc_offset_seconds; packet 002 diurnal check segmented BY SITE (SC3).
  - W2 per-sample offset_km + query rounded coords -> packet 001 desc "DEDUP" + SC7.
  - W3 tier precedence (no_date first, mutually exclusive) -> packet 001 desc "FOUR TIME BUCKETS" + SC2.
  - W4 elevation-aware pressure -> packet 001 stores `elevation` in provenance (SC9); packet 002 SC5 uses it (NWT ~65 kPa correct).
  - W5 DRY-rationale comment -> packet 001 SC1 + must_contain.
  - GATE-RUN: auditor MUST EXECUTE the zero-network cache-only rebuild and diff (not accept self-report) — encoded in dependency_order GATE-RUN node.

GATE-RUN (execution-dependent deliverable, pm-spec Step 7.7): close-blocking; auditor executes the rebuild. Do NOT close on "script authored."

commit note: enrich_covariates.py + covariates.json + cache is well over 50 new lines — commit only AFTER audit PASS. Stage EVERY data/cache/* file (broadn-teal-rebrand §6 untracked-artifact gap). covariates.json is not referenced by any HTML/CSS in Phase 1, so the asset-404 class does not apply; reproducibility still requires the whole cache be tracked.

Recurring-pattern preflight (pm-spec Step 0.5):
  <recurring_pattern source="broadn-p12-altitude-single-rail.md">Runtime SCs marked ✓ from code traces without running.</recurring_pattern> -> AVOIDED: SC11/SC12 require a real run; GATE-RUN has the AUDITOR execute the cache-only rebuild + diff.
  <recurring_pattern source="broadn-p12-altitude-single-rail.md">Remediation packets not written to disk.</recurring_pattern> -> AVOIDED: explicit Output Path per packet; receipt-check requires the file.
  <recurring_pattern source="broadn-teal-rebrand.md">Scope-boundary blindness to cross-file contracts (untracked asset; removed shared token).</recurring_pattern> -> AVOIDED: side-file strictly additive; out_of_scope forbids editing preprocess_data.py/data.json; GATE-RUN checks every cache file tracked.
  <recurring_pattern source="broadn-teal-rebrand.md">Critic BLOCK: unsatisfiable global-grep SC over an out-of-scope surface.</recurring_pattern> -> AVOIDED: SCs behavioral/inspection-based; manual locked-value satisfiability lint done.
  <recurring_pattern source="broadn-p8-feedback-widget.md">g3 tabular-sink formula-injection / public-endpoint revocation.</recurring_pattern> -> N/A (JSON output not a spreadsheet sink; Open-Meteo read-only GET, no key/committed write-endpoint); SX still checks param encoding.
  <recurring_pattern source="broadn-p8-feedback-widget.md">g1 destructive multi-section overwrite — Read first.</recurring_pattern> -> N/A between packets; noted for ORC changelog/registry appends.
  <recurring_pattern source="broadn-p7-sample-table.md">g1/g3 no asserting constant VALUES / call-chains without reading source.</recurring_pattern> -> HONORED: column literals read on-disk; field-TEMP column probed (no constant) -> ST discovers empirically.

pm-preflight tool note: sc-locked-value-consistency precheck NOT run (PM subagent has no Bash; base-plan fallback, consistent with broadn-p12 after-action). Manual locked-value SC satisfiability lint done — no SC greps a locked line self-contradictingly; SCs behavioral.
</routing_notes>

<risk_flags>
- PI OPEN QUESTION (variable set / MIxS units): defaulted to the core Goal-2 set as a CONFIGURABLE module constant. A future change is a config edit + re-run, not a rewrite. ORC/PI should confirm the default.
- SIGN-FLIPPED LONGITUDE (landmine 6, unverified hypothesis): positive-longitude "Doane" rows are almost certainly a sign error (Nebraska ~-96.9 W). Phase 1 SKIPS+FLAGS them (does NOT sign-correct); legitimate Doane samples get null covariates. Candidate for a Phase-1.5 sign-correction IF the PI confirms intended coords; out of scope now.
- FIELD-TEMP COLUMN UNVERIFIED (ST cross-check dependency): the exact xlsx column is NOT defined in preprocess_data.py (grep returned nothing). broadn-p14-002 locates it empirically and reports name+fill, or states explicitly it cannot be found (no fabricated signal). A missing cross-check is NOT a join FAIL — it weakens the independent evidence to the diurnal check alone.
- OFFLINE-REBUILD DETERMINISM: SC12 depends on deterministic JSON serialization (sorted keys, fixed float precision). The auditor now EXECUTES the rebuild + diff (GATE-RUN), and must confirm the DETERMINISM mechanism, not just a single run.
- POLITE API USE / NETWORK VARIANCE: a few hundred live calls; throttle+backoff required. Rate-limits mid-run must be absorbed by the null+flag+never-abort path (SC10); ST's coverage check surfaces any elevated fetch_failed count.
- TIMEZONE=AUTO CORRECTNESS (new, W1): per-coordinate resolution replaces a single hardcoded zone. Correct for the nationwide IMPROVE network, but shifts the burden onto storing/using the resolved offset consistently. ST's per-site diurnal check is the independent guard; a single pooled check would have masked a per-site error.
- >50-LINE COMMIT: the new script exceeds the 50-line no-gate ceiling; commit MUST follow audit PASS. Flagged so sequencing is explicit.
</risk_flags>

</task_decomposition>
