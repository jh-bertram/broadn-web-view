# Audit Verdict — broadn-p14-covariate-enrichment

Auditor: AUD#1 (spawned by ORC#0). Read-only on the repo; the GATE-RUN reproducibility
rebuild was EXECUTED by the auditor (not trusted from the packet). No tracked files modified.

Envelope note: task_id first-SPAWN is post-cutover (task packet dated 2026-07-06), so the
deterministic date rule selects the v2.0 typed `<audit_verdict>` wrapper regardless of the
brief's request for the legacy three-block format. The three legacy blocks are emitted as
sub-elements (`<sa>`/`<qa>`/`<sx>`). NOTE: this repository (broadn-web-view) carries no
`.claude/skills/audit-pipeline/SKILL.md` and no v2.0 substrate-check consumers
(commit-packet / requirements-validate v2.0 adapters); every prior audit here uses the
legacy format. The wrapper is emitted for date-rule compliance and forward compatibility;
the legacy sub-blocks preserve compatibility with this repo's existing tooling.

<audit_verdict schema_version="2.0">
  <task_id>broadn-p14-covariate-enrichment</task_id>
  <auditor_spawn>
    <agent_id>AUD#1</agent_id>
    <parent>ORC#0</parent>
    <independent_from>BE#1,ST#1</independent_from>
  </auditor_spawn>
  <provenance_marker>audit-pipeline@2.0.0</provenance_marker>

  <sa>
    <audit_review>
      <target_file>scripts/enrich_covariates.py</target_file>
      <status>PASS</status>
      <verdict>SA PASS</verdict>
      <checks>
        <check name="no_hardcoded_secrets">PASS — Open-Meteo archive needs no key; no api_key/secret/token/password patterns; USER_AGENT carries only a public project URL.</check>
        <check name="naming_conventions">PASS — snake_case functions (load_field_samples, classify_time_fidelity, convert_hourly_units, aggregate_daily_covariates); SCREAMING_SNAKE_CASE module constants (DEDUP_PRECISION, FLOAT_PRECISION, MAX_RETRIES).</check>
        <check name="dry_rationale_comment">PASS — intentional standalone-reader duplication documented in module docstring (L13-16) and at the column-literal block (L62-63) and load_field_samples docstring (L98-100): "standalone reader chosen to decouple build-time enrichment from preprocess_data.py; NOT a DRY violation." Genuinely shared helpers (round_floats, _null_record) are extracted, so the duplication is scoped and justified.</check>
        <check name="deterministic_serialization">PASS — sort_keys=True on both output (L573) and cache (L222); recursive fixed-precision rounding via round_floats (FLOAT_PRECISION=4); nondeterministic fields excluded: generationtime_ms dropped (L274), this-run live_calls/cache_hits printed to stdout only and never persisted (L539-544); coverage_summary.unique_api_calls is a dataset property, not an invocation property. Empirically confirmed byte-identical across an independent rebuild (see QA).</check>
        <check name="critic_blocker_a_unit_conversion_once">PASS — convert_hourly_units runs once per unique key (L521), producing one `converted` dict that feeds BOTH point-extraction (via key_data) and daily aggregation (aggregate_daily_covariates); wind_speed km/h÷3.6, surface_pressure hPa÷10 (L198-203). Returns a NEW dict (L197) and never mutates the cached raw response, so the separate spot-check conversion (L460) cannot cause double-conversion of the emitted values.</check>
        <check name="critic_blocker_b_per_variable_daily_aggregation">PASS — precipitation = SUM (L355); wind_direction = CIRCULAR mean via atan2(mean sin, mean cos) normalized to [0,360) (circular_mean_deg L168-176, L353); temp/humidity/wind_speed/barometric_press = arithmetic mean; temp additionally min/max (L348-350).</check>
        <check name="critic_blocker_c_bucket_precedence_no_date_first">PASS — classify_time_fidelity tests pd.isna(date_val) FIRST -> "no_date" (L137-138), before exact/ampm_imputed/date_only; a timed-but-undated row is correctly bucketed no_date.</check>
      </checks>
      <violations>none</violations>
    </audit_review>
  </sa>

  <qa>
    <test_report>
      <task_id>broadn-p14-covariate-enrichment</task_id>
      <status>PASS</status>
      <verdict>QA PASS</verdict>
      <playwright><tier>SKIPPED — BE/DS build-time data task, no ui_packet</tier></playwright>
      <compile>python3 -m py_compile scripts/enrich_covariates.py -> CLEAN</compile>
      <gate_run description="auditor-executed offline reproducibility rebuild (GATE-RUN node)">
        <method>Ran the script with HTTP(S)_PROXY forced to unreachable 127.0.0.1:9 to guarantee zero live calls; cache-only path.</method>
        <network>0 live calls this run, 1132 cache hits (1130 unique keys + 2 spot-check refetches, both cache hits), 0 fetch failures; wall time 3s.</network>
        <sha256_baseline>
          covariates.json      = 1a3755ec33784c18bf97a87fe53cddd4128148e7cea442949dff788ddc21ad97
          covariates-cache.json = d677ac45ddc330f73d8b3c5bfb16a10fec7ba1d686a6347eeef8583de6799945
        </sha256_baseline>
        <sha256_after_rebuild>
          covariates.json      = 1a3755ec33784c18bf97a87fe53cddd4128148e7cea442949dff788ddc21ad97
          covariates-cache.json = d677ac45ddc330f73d8b3c5bfb16a10fec7ba1d686a6347eeef8583de6799945
        </sha256_after_rebuild>
        <result>BYTE-IDENTICAL on both files (cmp -s confirmed). GATE-RUN PASS.</result>
      </gate_run>
      <coverage_spot_checks>
        <check>coverage_summary.total_field_samples = 4569; by_time_fidelity {no_date 656, exact 863, ampm_imputed 1431, date_only 1619} sums to 4569; by_fetch_status {no_date 656, skipped_bad_coord 90, success 3823, failed 0} sums to 4569.</check>
        <check>date_only+success sample (BAX0011S): scalar covariates = null, covariates_daily = populated. CORRECT.</check>
        <check>exact+success sample (BAD0004A): both scalar and daily populated; matched_local 2022-03-23T13:00 -> matched_utc 2022-03-23T19:00:00Z (-6h MDT). CORRECT.</check>
        <check>no_date sample (BCE0104A): scalar null + daily null. bad_coord sample (BIX0001A): scalar null + daily null, coord_status skipped_bad_coord. CORRECT.</check>
        <check>meta.units: wind_speed = m/s, barometric_press = kPa (conversions reflected). CORRECT.</check>
        <check>Pre-bulk diurnal spot-check (script stdout): afternoon reading nearest day temp_max, pre-dawn nearest temp_min; timezone resolved per-site (America/Denver for CO, America/New_York for eastern sample). Timezone/diurnal signal correct.</check>
      </coverage_spot_checks>
      <scope>
        git status/diff confirm the sprint's only code/data additions are the 3 new untracked files (scripts/enrich_covariates.py, data/covariates.json, data/cache/covariates-cache.json). Tracked files preprocess_data.py, data/data.json, index.html, assets/** are UNCHANGED (empty diff). Other untracked/modified paths (.claude/tasks orchestration artifacts, docs/after-actions, SESSION-CHECKPOINT, .playwright-mcp) are non-sprint bookkeeping, not deliverables.
      </scope>
      <defects>none</defects>
    </test_report>
  </qa>

  <sx>
    <security_audit>
      <status>SECURE</status>
      <verdict>SX PASS</verdict>
      <threat_level>LOW</threat_level>
      <findings>
        <check name="secrets">SECURE — no hardcoded credentials/keys; Open-Meteo archive is keyless; no secret-like tokens in the committed cache (weather arrays + resolved grid coords only).</check>
        <check name="injection">SECURE — query params (lat/lon rounded floats, ISO dates from strftime, fixed hourly-var literal) passed as the `params` dict to SESSION.get (L243); requests URL-encodes them. No f-string/`+`/`%` interpolation of user/data values into the request URL.</check>
        <check name="unsafe_deserialization">SECURE — no eval/exec/os.system/subprocess/__import__/pickle; API response parsed via resp.json().</check>
        <check name="polite_api_use">SECURE — THROTTLE_SECONDS=0.3 per call; exponential backoff (base 1s, x2, MAX_RETRIES=4) on HTTP 429 and 5xx; never aborts the build on a single fetch failure (returns None -> fetch_status recorded).</check>
        <check name="authorized_external_use">External Open-Meteo public-archive use is the requested feature and authorized.</check>
      </findings>
      <vulnerabilities>none</vulnerabilities>
    </security_audit>
  </sx>

  <non_blocking_observations>
    <obs>ST-flagged corrupt source TEMP column: a data-quality issue in Bdb-317.xlsx (source), not a defect in enrich_covariates.py. The script's field-TEMP cross-check is diagnostic only. NON-BLOCKING — concur.</obs>
    <obs>Cosmetic wind_direction = 360: compass direction where 360 deg == 0 deg (North); originates from raw Open-Meteo scalar readings, not a code error (circular_mean_deg already normalizes to [0,360)). NON-BLOCKING — concur.</obs>
  </non_blocking_observations>

  <overall_status>PASS</overall_status>
</audit_verdict>
