# broadn-p15-covariate-window-longitude — Archivist Log

## Task Summary

Logged completion of sprint broadn-p15-covariate-window-longitude to `docs/project_log.md`. Two PI-confirmed corrections to `scripts/enrich_covariates.py` shipped:

1. **Window-aggregate model** replaces point-in-time covariate extraction. Samples are time-integrated over [Collected Time, +Collection Duration]. Tier precedence: no_date → window_exact → window_assumed_24h → date_only. Aggregation rules preserved (precip SUM, wind_direction circular mean, others mean, temp min/max).

2. **Longitude sign-fix** negates 402 positive-longitude entries into US bounds; recovers 13 dated samples. `skipped_bad_coord` now 77 (null coordinates, unfixable).

## Corrections to Record

Prior p14 entry estimated "~90 recovered samples." P15 independently verified **13 dated samples** with recoverable positive-longitude errors. The ~90 estimate incorrectly combined 77 null-coords (unfixable) + 13 positive-lon-dated (now fixed). Record updated in archive entry.

## Coverage & Reproducibility

- 4569 samples total
- 402 coordinate_corrected; 77 skipped_bad_coord
- 1202 API calls, zero failures
- Offline reproducibility: cache-only rerun, byte-identical output (verified via sha256)
- Audit consolidation: SA=PASS, QA=PASS, SX=SECURE

## Archive Entry Location

Entry appended to `docs/project_log.md` at line 1530 (closing tag of prior entry at 1528).

**Evidence paths:**
- Archive entry: `docs/project_log.md` lines 1530–1576
- BE packet: `.claude/tasks/outputs/broadn-p15-BE-1783450458.md`
- AUD packet: `.claude/tasks/outputs/broadn-p15-AUD-1783451186.md`
- Feature commit: `4559f0f` — `fix(covariates): window-aggregate model + longitude sign-fix (Phase 1.5)`

## Pending Verification

**Commit-trailer verification:** Feature commit 4559f0f supplied in ORC brief. Archivist cannot run `git log` to verify task trailer. ORC to confirm `git log -1 --format=%B 4559f0f | grep -F "task: broadn-p15-covariate-window-longitude"` before finalizing durability claim.

---

**Written:** 2026-07-07T19:07:44Z | **Output:** `.claude/tasks/outputs/broadn-p15-AR-final.md`
