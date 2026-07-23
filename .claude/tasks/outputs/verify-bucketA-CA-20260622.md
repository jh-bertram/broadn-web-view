# Bucket A UI Verification — BROADN Dashboard

- **Target:** http://localhost:8753/index.html (static SPA: HTML + Tailwind CDN + Chart.js + Leaflet, fetches `data/data.json`)
- **Date:** 2026-06-22
- **Method:** Headless Chromium via playwright-core (MCP Playwright tools unavailable in this env; drove cached chromium-1208 directly). Screenshots in `/tmp/broadn-verify/`.
- **Scope:** Focused verification pass (NOT a full audit). No files modified.

## Overall: PASS (6 / 6 items verified)

One non-blocking note on item 6 terminology (see below).

---

## Item 1 — Dashboard renders, console clean — PASS
- `#main-content` becomes visible; loading skeleton replaced by content.
- Only console error across all loads: `Failed to load resource: 404` — confirmed to be `/favicon.ico` (404), which is cosmetic. `data/data.json` returns 200. No JS runtime errors, no uncaught exceptions, no unhandled rejections.

## Item 2 — Affiliations (A1) — PASS
Hero paragraph under H1 "Exploring the Atmosphere's Hidden Microbiome" reads:
> "BROADN ... is an NSF-funded initiative led by Colorado State University — with partners at **CSU Pueblo, CU Boulder, and Doane University** — investigating airborne microbial communities across diverse ecosystems. Our OneHealth mission connects atmospheric science, ecology, and public health."

All three named partners present.

## Item 3 — Samples-by-Site readable names (A4) — PASS
`#bySiteChart` y-axis labels are readable site names, not 2-letter codes. Chart.js label set includes:
"SGRC — Environment", "SGRC — East", "Other — South Carolina", "CPER — Environment",
"IMPROVE — EVER (Everglades National Park)", "IMPROVE — GRSM (Great Smoky Mountains National Park)",
"CPER — Tower Top (A)", "IMPROVE — ROMO (Rocky Mountain National Park)", etc.
No cryptic codes like "SN" appear as labels. Screenshot: `item3-bySiteChart.png`.

## Item 4 — Map markers + Great Smoky coordinate (A4 + IM fix) — PASS
- `#map` Leaflet map renders **27 markers** (implemented as `circleMarker` SVG paths in the overlay pane).
- Markers distributed correctly across the US (CO cluster, TX, FL Everglades, ME Acadia, Great Lakes Voyageurs, WA Olympic, HI, etc.).
- **Great Smoky Mountains IMPROVE site (code IM):** marker at **lat 35.6334, lng -83.9417** = Tennessee/North Carolina border (southern Appalachians). NOT Utah/Arizona. Fix confirmed. Visible in `item4-map-usbounds.png` as the marker in the eastern US below Washington/Carolinas.
- **Tooltip format = "Name (CODE)":** e.g. `IMPROVE — GRSM (Great Smoky Mountains National Park) (IM)`, `CPER — Environment (CE)`, `SGRC — Environment (SN)`. Confirmed via Leaflet layer tooltip content.
- Screenshots: `item4-map.png`, `item4-map-zoomed.png`, `item4-map-usbounds.png`.

## Item 5 — Pipeline caption (A5) — PASS
`#chart-card-pipeline` ("Processing Pipeline") has an explanatory caption below the chart:
> "Each stage is a subset of the one before it. A sample not advancing to a later stage does not mean it was set aside — many are still being processed, and some did not yield usable data at a given step (for example, low-biomass samples that passed DNA extraction but did not produce enough material to sequence). These counts reflect progress to date, not final outcomes."

Matches required intent (not abandoned; still processing / low-biomass / no usable data).

## Item 6 — Data Explorer project-group bug fix (A6) — PASS (with terminology note)
- Initial table state: "Showing 1–100 of 4569 samples".
- Clicked the pinned **CPER (count 649)** group item → table now shows **"Showing 1–100 of 649 samples"**, 100 rows rendered, first row `BCA0003A 2022-06-01 CPER Air Field Sample`, all rows SITE=CPER. Item `aria-selected="true"`, active label "Showing: CPER". NOT "No samples match the selected filters". The previously-zero bug is fixed. Screenshot: `item6-cper-table.png`.
- **Sanity — individual projects:** "IMPROVE Fungi" → "Showing 1–100 of 1056 samples" (non-zero); "BACS" → "Showing 1–100 of 274 samples" (non-zero). Both filter correctly.

**Terminology note (non-blocking):** The task brief places the pinned CPER item in the "Project" category. In the actual UI the pinned **CPER (649)** item lives under the **"Location / Hub"** category (`#location-group-list`), where it is the highlighted/selected pinned item. The "Project" category's largest/top item is "IMPROVE Fungi" (1,056), not CPER. The substantive bug-fix target (the CPER group that used to filter to zero) works correctly regardless of category label. Flagging only so the brief's wording can be reconciled with the UI's category placement.

---

## Evidence files (absolute paths)
- /tmp/broadn-verify/item3-bySiteChart.png
- /tmp/broadn-verify/item4-map.png
- /tmp/broadn-verify/item4-map-zoomed.png
- /tmp/broadn-verify/item4-map-usbounds.png
- /tmp/broadn-verify/item6-cper-table.png
- /tmp/broadn-verify/item6-sidebar.png
- /tmp/broadn-verify/{result,map-result,cper-result}.json (raw DOM/console captures)
