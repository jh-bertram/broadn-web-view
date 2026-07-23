# Per-Project Banner Rollout Verification — BROADN Dashboard

- **Target:** http://localhost:8753/index.html (static HTML + Tailwind + Chart.js + Leaflet)
- **Method:** Playwright via cached Chromium (chromium-1208) driven by playwright-core (MCP unavailable)
- **Viewport:** 1280x900 desktop
- **Date:** 2026-06-22
- **Scope:** Focused verification of `#project-banner` content for 4 projects. No files modified.

## Interaction flow
Expanded the left "slice" sidebar Project category (`#slice-btn-project`), then selected each
project's `<li role="option">` in `#project-group-list`. Banner read directly from live DOM
(`.project-banner-name`, `-location`, `-desc`, `-people`, `-links`).

## Verdicts

### 1. IMPROVE Fungi — PASS
- Location chip: "U.S. national parks (IMPROVE network)" ✓
- Summary mentions IMPROVE / national parks / fungal: ✓ ("...seven IMPROVE air-quality monitoring sites in U.S. national parks to map fungal aerobiome patterns...")
- People line: "Lead: Noah Fierer (CU Boulder) · with Sarah Gering, Marina Nieto-Caballero, Scott Copeland, Sonia Kreidenweis" ✓
  - Lead is linked `<a>` → https://broadn.colostate.edu/noah-fierer-bio/ ✓ (note: brief said broadn.colostate.edu — confirmed)
- Link chips: "Project page — BROADN" → https://broadn.colostate.edu/projects/ ✓ (at least one chip present)
- Screenshot: docs/agent-logs/AUD/banner-shots/IMPROVE_Fungi.png

### 2. Two Towers — PASS
- Location chip: "Grassland & forest, Colorado" ✓
- People line: "Lead: Jane Stewart (CSU)" linked → https://broadn.colostate.edu/jane-e-stewart-bio/ ✓
- Link chip: "Cornell et al. 2026, mBio" → href https://doi.org/10.1128/mbio.03057-25 ✓
  - target="_blank" ✓, rel="noopener noreferrer" (includes noopener) ✓
- Screenshot: docs/agent-logs/AUD/banner-shots/Two_Towers.png

### 3. BACS — PASS
- Summary is a real description (NOT the generic fallback): ✓
  "The BioAerosols and Convective Storms (BACS) field campaigns examine variability in cold-pool characteristics and how aerosols — including bioaerosols — respond to convective storm activity."
- People line: "Lead: Sonia Kreidenweis (CSU)" → https://broadn.colostate.edu/sonia-kreidenweis-bio/ ✓
- Link chip: "Ascher et al. 2026, BAMS" → https://doi.org/10.1175/BAMS-D-25-0105.1 ✓ (target=_blank, rel=noopener noreferrer)
- Note: location chip reads "CPER / convective storms, Colorado" (no location expectation was specified for BACS).
- Screenshot: docs/agent-logs/AUD/banner-shots/BACS.png

### 4. 2022 Fall CPER (operational entry) — PASS
- Summary present: "Field sampling campaign at the Central Plains Experimental Range — the fall 2022 grassland aerobiome collection." ✓
- People line: "Lead: Sonia Kreidenweis (CSU)" → https://broadn.colostate.edu/sonia-kreidenweis-bio/ ✓
- NO publication link chips — links row hidden (`.project-banner-links` has `hidden` class, 0 anchors) ✓
- Location chip: "Central Plains Experimental Range (CPER), Colorado" ✓
- Screenshot: docs/agent-logs/AUD/banner-shots/2022_Fall_CPER.png

## Console errors
- Zero JavaScript runtime errors (no `Uncaught`, no unhandled rejection, no pageerror) across all four interactions.
- One transient resource 404 was observed in the first run but did NOT reproduce in two follow-up runs (clean load and interaction-driven load both produced an empty failed-response list). Not a JS error; not banner-related. Treated as a non-issue (likely favicon/transient).

## Chart rendering (confirms charts render beneath banner)
With a project selected, all three project slice canvases are present and laid out with non-zero dimensions:
- sliceProjectTypesChart: 392x400 rendered ✓
- sliceProjectPipelineChart: 392x400 rendered ✓
- sliceProjectTemporalChart: 864x400 rendered ✓

## Summary
All four projects: PASS. Charts render. No blocking console errors.
