# Task: broadn-p15-covariate-window-longitude

**Human request (PI, 2026-07-07):** Phase 1.5 corrections to the covariate enrichment: (1) sign-correct the mistaken positive longitudes to within the US and re-enrich; (2) covariates must aggregate over each sample's true collection WINDOW (samples are 12/24h time-integrated), not a point-in-time hour.

**Routing:** ORC-as-PM (I hold full context + prior Critic rulings) → BE (modify+rerun `scripts/enrich_covariates.py`) → ST (validate) → Auditor (SA/QA/SX + execute reproducibility rebuild) → commit → Archivist. Modification of the audited p14 deliverable.

**Branch:** `sprint/broadn-p14-covariate-enrichment` (STACK on p14 — not yet pushed; the covariate PR should ship the corrected windowed version, superseding the point-in-time one).

## Verified recon (2026-07-07, field samples n=4569)
- `Sample Collection Duration` = decimal HOURS float, 17% fill (763). Clusters ~1.0, ~24 (23.99–24.07), 6, 4, some 50.6 (multi-day); 30 rows = 0.0 (treat as unknown).
- `Sample Collected Time` = datetime.time, 19% fill (863); 00:00 appears.
- Combos: date+time+dur **731**; date+time,no-dur **132**; date,no-time,+dur **32**; date only **3018**; no date **656**.
- Positive longitudes: **402** field samples; negating → all within US (-125..-66); lat 33.6–40.6 OK. Null coords: 80 (unfixable).

## Scope
Modify `scripts/enrich_covariates.py` + regenerate `data/covariates.json` + `data/cache/`. Static site untouched; no change to preprocess_data.py / data.json / front-end. Phase 2 (UI) remains out of scope.

## The two corrections
1. **Longitude sign-fix:** negate positive longitudes; assert result within US bounds; record `coord_corrected=true` + corrected coord in provenance; enrich (if dated). Null coords stay null. Recovers ~90 previously-skipped dated samples.
2. **Window aggregation (replaces point-in-time scalar):** `covariates` = aggregate over `[window_start, window_end]` where the window is as precise as each sample allows (window_exact / window_assumed_24h / date_only). Multi-day windows fetch multiple days. Keep the p14 aggregation rules (precip SUM, wind_direction circular mean, others mean, temp min/max), unit conversion once, timezone=auto, determinism, resilience.

## Success criteria — see the BE dispatch brief (self-contained). Audit SA+QA+SX PASS + auditor-executed byte-identical offline rebuild before commit.
