# Archive Entry: broadn-p20-acknowledgements

**Archivist:** AR#1  
**Task ID:** broadn-p20-acknowledgements  
**Timestamp:** 2026-07-24T23:47:30Z  
**Status:** COMPLETE

## Summary

Sprint **broadn-p20-acknowledgements** completed and logged to the project's temporal knowledge graph (`docs/project_log.md`, lines 1679-1709). The Acknowledgements & Citation footer section was successfully shipped to the BROADN web-view dashboard (index.html, +24 lines) with full auditor approval (SA/QA/SX PASS).

## Key Decisions Recorded

1. **Six acknowledgement blocks (A1-A6), all verbatim from external sources:**
   - **A1:** NSF Biology Integration Institutes Program Award # 2120117 + CSU One Health Institute
   - **A2:** SGRC facilities (Amy Bibbey, Troy Bauder, Colorado Agricultural Experiment Station)
   - **A3:** NEON (NSF/Battelle, NEON Assignable Assets program) + link to citing page
   - **A4:** USDA-ARS Central Plains Experimental Range (CPER) site access
   - **A5:** IMPROVE (EPA primary funder, NPS contracting, UC-Davis/RTI/DRI analysis) — included because dashboard surfaces IMPROVE data
   - **A6:** Niwot Ridge forest tower on Arapaho & Roosevelt National Forests (USFS) land, accessed via CU Boulder Mountain Research Station

2. **Correction to human's initial assumption:** RA research verified the Niwot forest tower is on **USFS/Roosevelt NF land (via CU MRS)**, NOT on Rocky Mountain National Park / NPS land. Evidence path: NEON NIWO field-site, AmeriFlux LTER, Niwot Ridge LTER, Wikipedia — all four sources concur. A6 block carries the corrected USFS/CU-MRS attribution.

3. **IMPROVE acknowledgement conditional decision:** RA dossier (Q2 finding) confirmed IMPROVE has an official data-acknowledgement statement and should be included if the dashboard uses IMPROVE data. Dashboard does surface IMPROVE Fungi project (app.js reference), so inclusion was warranted.

## Rationale

- **Why these 6 blocks?** All sourced and verified against primary authors (Cornell et al. 2026 mBio), official networks (NEON, IMPROVE, USDA-ARS), and land-management records (USFS/NEON NIWO).
- **Why the RMNP correction?** Human's premise was contradicted by 4 independent sources; RA brought them forward with full evidence. A6 block now reflects ground truth.
- **Why native `<details>`/`<summary>`?** No JavaScript required; native HTML provides keyboard navigation (Enter/Space toggles), semantic meaning, and accessibility out-of-the-box. Footer link uses Tailwind tokens (--color-accent #0c9cb4) for ~5.35:1 WCAG AA contrast on the dark footer.
- **Why all gates passed?** RA research → PM decomposition → Critic PASS → UI design_spec → FE implementation → full Auditor review (SA standards / QA functionality / SX security) = AUDIT_PASS.

## Non-Delivered / Follow-Up

- **Indigenous land acknowledgement:** Not sourced this sprint (flagged as requiring separate tribal consultation + authoritative sources). Marked as future work.
- **Two-Towers-specific AmeriFlux/DOE credits:** Already covered by Cornell et al. Acknowledgements; not separately added per scope definition.

## Human-Confirmation Items (Non-blocking)

1. Truncated request sentence ("we need a link to the ___") was interpreted as the NEON citing page — surface for confirmation.
2. RMNP→USFS correction and A6 wording — surface for verification.
3. Indigenous land acknowledgement — defer to follow-up research phase.

## Implementation Verified

- **FE packet audit:** index.html +24 lines (961-984), 6 verbatim blocks, NEON link with rel="noopener noreferrer", semantic HTML, heading levels, focus-visible styling, A11y contrast (5.35:1 AA).
- **Commits:** 06fea47 (feat: add Acknowledgements & Citation footer section) + a4973e6 (chore: archive sprint artifacts) on sprint/broadn-p20-acknowledgements (ready for human PR to main).
- **Event log:** seq 1-13 (RA→PM→Critic→UI→FE→Auditor→Archivist pipeline, AUDIT_PASS at seq 12).

## Archive Entry

Full archive entry written to `docs/project_log.md` (lines 1679-1709) with complete rationale, dependencies, and retention keys for future session recovery.

---

**Output files:**
- `docs/project_log.md` (archive_entry appended)
- `docs/agent-logs/AR/broadn-p20-acknowledgements.md` (checkpoint, all 3 stages)

**No further action required** — sprint logged, all gates passed, commits ready for human push.
