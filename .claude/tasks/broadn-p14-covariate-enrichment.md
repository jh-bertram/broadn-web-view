# Task: broadn-p14-covariate-enrichment

**Human request:** "Start on Phase 1" — build-time weather covariate enrichment (Open-Meteo) from the 2026-07-06 architecture assessment.

**Routing:** dispatch pipeline — PM decompose → Critic → BE (implement + run) → ST (validate output) → Auditor → commit → Archivist. Multi-domain (external-API integration + data pipeline + statistical validation).

**Branch:** `sprint/broadn-p14-covariate-enrichment` (from `main`; independent of the p13 explorer PR — different files).

## Goal
A build-time Python step that attaches concurrent MIxS-Air weather covariates to each field sample, keeping the site 100% static. Produce a committed, reproducible covariate side-file `data/covariates.json` + a committed response cache. NO front-end work (surfacing covariates in the UI is Phase 2, out of scope).

## Verified ground facts (on-disk / live-probed 2026-07-06)
- Source: `Bdb-317.xlsx` Sheet1, 8,075 data rows (4,569 Field Samples + 3,506 Products). Join keys per row: Latitude/Longitude 98% filled; Sample Collected Date 84%; Sample Collected Time **only ~20%**; Sample AM/PM 35%; field-measured TEMP 81%.
- `scripts/preprocess_data.py` (77KB, pandas) reads the xlsx via `pd.read_excel(engine=openpyxl)`, column constants incl. `COL_COLLECTED_DATE/TIME`, `_time_to_hour()` (719), `build_all_samples()` (649). `all_samples` records carry `id` + `pipeline_stage` but NOT lat/long → enrichment must key off the xlsx by BROADN ID.
- Open-Meteo **archive** API is LIVE-REACHABLE from this environment: `https://archive-api.open-meteo.com/v1/archive?latitude=..&longitude=..&start_date=..&end_date=..&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m,surface_pressure&timezone=America/Denver`. Returns hourly arrays + the resolved grid-cell lat/lon + elevation. **Units returned: temp °C, RH %, precip mm, wind_speed km/h, wind_direction °, surface_pressure hPa.** No API key.
- Python libs available: pandas, openpyxl, requests, urllib.
- `.gitignore` does NOT ignore `data/` or `scripts/` → `data/covariates.json` + `data/cache/` WILL be tracked (desired for reproducibility).

## Landmines to decompose around (from the assessment)
1. **Timezone correctness is load-bearing** — pass `timezone=America/Denver`; validate a few known samples day/night before bulk run; an off-by-6 (MDT/UTC) corrupts every diurnal signal.
2. **Time-fidelity tiers:** ~20% have exact time → hourly match; 35% AM/PM → impute ~09:00/~15:00 with `time_imputed=true`; the rest date-only → attach daily aggregate (or null hourly with a flag). Never present an imputed hourly value as real.
3. **Dedup** by (rounded grid-cell, day) so ~8,000 rows collapse to a few hundred API calls; cache + commit responses (`data/cache/…`) so rebuilds are zero-network and deterministic.
4. **Unit conversions to MIxS-Air:** wind km/h→m/s (÷3.6); surface_pressure hPa→kPa (÷10). Map temperature_2m→temp, relative_humidity_2m→humidity, wind_speed_10m→wind_speed, wind_direction_10m→wind_direction, surface_pressure→barometric_press. Store units explicitly.
5. **Provenance per record:** covariate_source, resolved grid-cell lat/lon + offset_km, matched_local_time, matched_utc_time, time_imputed. On fetch failure write null + error flag, never abort the build.
6. **Positive-longitude / bad-coord rows** exist (preprocess flags Longitude>0) — skip/flag, don't query garbage coords.
7. **Metadata-not-results** — covariates are sample metadata; keep out of the reference-only results surface. Reanalysis is modeled gridded (~11–25 km) — label as grid-cell estimates.

## Suggested shape (PM to confirm/adjust)
- T1 (BE): `scripts/enrich_covariates.py` — read xlsx, build per-sample timestamp + tier, dedup, batch Open-Meteo (polite throttle + backoff + committed cache), convert units, write `data/covariates.json` keyed by BROADN ID with covariate + provenance fields, plus a fill/coverage summary. RUN it to produce real committed artifacts (network is available). Idempotent + offline-from-cache.
- T2 (ST, depends on T1): validate the output — coverage tiers, timezone sanity (spot-check diurnal), and cross-check enriched temp against the 81% field-measured TEMP as an independent join-correctness signal; report distributions/anomalies. No app code.

## Success criteria
- `scripts/enrich_covariates.py` runs, is idempotent, rebuilds offline from committed cache, handles all three time-fidelity tiers with explicit flags, converts units to MIxS-Air, writes per-sample provenance, never aborts on a single fetch failure.
- `data/covariates.json` produced for the real dataset, keyed by BROADN ID, with a coverage summary; response cache committed.
- ST validation shows plausible values + timezone correctness (enriched temp tracks field TEMP within reason).
- Audit SA+QA+SX PASS; no secrets; polite API use; static-site + metadata-not-results constraints respected.
