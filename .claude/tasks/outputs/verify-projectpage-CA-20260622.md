# Verification — Rich Project Page Banner (Fragmented Landscape)

- **Date:** 2026-06-22
- **Target:** http://localhost:8753/index.html (static HTML + Tailwind + Chart.js + Leaflet)
- **Method:** Playwright (cached Chromium 1208 driven via playwright-core 1.58.2; MCP playwright tools unavailable). Desktop viewport 1280x900, headless.
- **Scope:** Focused verification of the upgraded `#project-banner`, not a full audit. No files modified.

## Verdict: PASS (all 5 steps)

| Step | Result |
|---|---|
| 1. Page loads, `#main-content` visible, console errors | PASS |
| 2. Open Fragmented Landscape | PASS |
| 3. Rich banner shows all elements | PASS |
| 4. Graceful fallback on other project | PASS |
| 5. Project charts still render | PASS |

---

## Step 1 — Load + console
- `#main-content` visible: **true**. PASS.
- Console errors: one benign `404 (File not found)` — the browser's automatic `/favicon.ico` request (`curl /favicon.ico` → 404; page declares no favicon link). Not an application error.
- `pageerror` (uncaught JS / unhandled rejection): **none**. PASS.

## Step 2 — Open Fragmented Landscape
- Clicked `#slice-btn-project` to expand `#project-group-list` (20 project items enumerated).
- "Fragmented Landscape" present (623 samples), clicked via `data-group-id`. PASS.

## Step 3 — Rich banner (`#project-banner`)  — all elements PASS
- **Name + location chip:** "Fragmented Landscape" + `.project-banner-location` visible reading **"South Carolina"**. PASS.
- **Summary:** multi-sentence, mentions vegetation + airborne microbes ("...vegetation type has little effect on which microbes are airborne — but leaves release more bacteria and fungi than soil..."). PASS.
- **People line:** `.project-banner-people` visible. Lead rendered as an `<a>`:
  - href=`https://broadn.colostate.edu/noah-fierer-bio/` (broadn.colostate.edu), target=`_blank`, rel=`noopener noreferrer`, text="Noah Fierer (CU Boulder)". PASS.
  - Followed by "· with Claire Winfrey, Julian Resasco, Jane Stewart". PASS.
- **Link chips:** `.project-banner-links` visible, two `<a>` chips, each target=`_blank` rel=`noopener noreferrer`:
  1. "Sequence data — NCBI PRJNA1263026 ↗" → `https://www.ncbi.nlm.nih.gov/bioproject/?term=PRJNA1263026`
  2. "Project page — BROADN ↗" → `https://broadn.colostate.edu/projects/`
  PASS.
- Screenshot: `verify-projectpage-CA-20260622-banner-frag.png`

## Step 4 — Graceful fallback (BACS)
- Switched to **BACS**. Banner shows name "BACS"; people line hidden, link chips hidden, location chip hidden. PASS.
- Note (advisory, not a failure): BACS has no entry in `PROJECT_CONTENT` *or* `PROJECT_DESCRIPTIONS`, so the description falls to the generic "Description not yet available — contact the project team." This is the intended deepest fallback tier; people/links correctly suppressed. If a short blurb is desired for BACS, add it to `PROJECT_DESCRIPTIONS`.
- Screenshot: `verify-projectpage-CA-20260622-banner-fallback.png`

## Step 5 — Charts still render (on Fragmented Landscape project view)
- Four project-view canvases visible and sized below the banner:
  - `sliceProjectTypesChart` (392x400), `sliceProjectPipelineChart` (392x400), `sliceProjectTemporalChart` (864x400), `sliceProjectSamplerChart` (392x400).
- Banner change did not break the project chart row. PASS.

## Evidence artifacts
- `.claude/tasks/outputs/verify-projectpage-CA-20260622-banner-frag.png`
- `.claude/tasks/outputs/verify-projectpage-CA-20260622-banner-fallback.png`
