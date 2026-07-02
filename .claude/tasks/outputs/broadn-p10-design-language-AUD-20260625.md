# AUD Visual Confirmation — broadn-p10-design-language
## Confirming UI#1's 8 ranked design-language findings against rendered pixels
Agent: AUD | Date: 2026-06-25 | Method: Read-rendered PNG slices (Playwright MCP unavailable; static captures used)

Slices reviewed: p10-confirm-slice-00 … -12 (in order), plus -kpi, -map, -hero-nav, -fullpage.
Scope: visual verification only (not a standards/security gate). All views are the **default "All BROADN Samples" (unfiltered) state** — no Project/Location/Lab-Group filter was applied in any capture. This matters for findings whose evidence lives in a *filtered* sub-view (see #1).

---

## Per-finding verdicts

### #1 — Categorical color anarchy → **CANNOT-TELL-FROM-PIXELS (visible contexts are consistent)**
- Evidence: `slice-03` (global donut legend), `slice-05/06/07/08` (Explorer Type badges).
- The two categorical contexts that ARE rendered agree: global donut legend = Air→green, Plant→emerald, Soil→amber/orange, Liquid→blue, Unknown→gray; Explorer Type badges = Air→green pill, Soil→amber pill, Liquid→blue pill, Unknown→gray. These match each other and `CHART_COLORS.sampleTypes`.
- The divergent encodings the report cites (slice donut `sliceSampleTypes`; project-timeline legend `bg-sky-500/emerald-600/cyan-400`) live behind a **Project/Lab-Group filter selection that none of the captures exercise**. They are not on screen, so the cross-context "anarchy" cannot be confirmed or refuted from these pixels. The code-level claim is plausible but needs a filtered-view screenshot (slice donut vs. global donut side-by-side; concurrent-timeline legend) to confirm visually. Recommend capturing the filtered view before closing this as confirmed.

### #2 — "Sequenced" pipeline bar invisible → **PARTIALLY CONFIRMED**
- Evidence: `slice-03` (Processing Pipeline horizontal bars).
- The Sequenced bar IS the palest, lowest-contrast bar (light green-400 on white) — a real legibility weakness vs. Collected (dark green) and DNA Extracted (mid green). But it is **not invisible**: it renders as a clearly discernible light-green bar with readable length. "Unreadable / ~1.7:1, effectively invisible" overstates the rendered reality — call it "noticeably weakest contrast," not "gone." Remediation (darker third step) is still warranted.

### #3 — Charts don't use Inter → **PARTIALLY CONFIRMED (leaning confirmed)**
- Evidence: `kpi.png`, `slice-01` temporal chart axis/tick labels; compare to Inter HTML headings in same frames.
- Chart tick labels, axis titles ("Samples", "Collection Date (Month/Year)") and donut legend text render in a lighter, narrower system sans that visibly differs from the Inter body/heading text — consistent with `Chart.defaults.font.family` being unset. Exact letterform ID (Arial vs. Helvetica) is not resolvable at screenshot resolution, hence PARTIAL, but the typographic disconnect the report predicts is visible.

### #4 — Card depth absent → **REFUTED (as rendered)**
- Evidence: `kpi.png`, `slice-00` (KPI row), `slice-01`/`slice-03` (chart & map cards), `slice-04` (Data-Mgmt KPI cards).
- The rendered KPI cards and chart cards DO have **rounded corners and a visible hairline border / subtle elevation**, and read as distinct white containers on the stone-50 page. The report's premise (`bg-white p-6` only — no radius/shadow/border, cards "float on undifferentiated background") does not match the pixels. The map card is **not** the inconsistent exception the report describes — its border treatment is shared by the other cards. NOTE the discrepancy: either the code was updated after UI#1's code-only audit, or Tailwind/CSS supplies the depth the audit missed. Either way, pixels show depth present. (The white-vs-stone-50 *fill* contrast being low ~1.05:1 is technically true, but the border+radius provide the separation, so the user-facing problem does not manifest.)

### #5 — Orange signal inverted → **CONFIRMED**
- Evidence: `slice-00` (sidebar "All BROADN Samples" = orange text on peach background in the default unfiltered state — present in every slice); `slice-03` (h3 "Sampler Replicate Tags (All)" and "Sampler Type Distribution (All)" both render orange in the always-visible global view).
- All three permanently-orange surfaces the report names are confirmed in pixels. Orange is present with no filter active, diluting it as a filter-active signal.

### #6 — Rectangular KPI cards / hero chips → **PARTIALLY CONFIRMED**
- Hero chips ("4,569 field samples", "29 collection sites", "Active since 2021"): **CONFIRMED rectangular** — sharp 90° corners on green (`hero-nav.png`, `slice-00`), inconsistent with the rounded vocabulary elsewhere.
- KPI cards: **REFUTED** — they render with rounded corners (see #4). The report's "two most prominent elements are the only rectangular exceptions" holds only for the hero chips, not the KPI cards.

### #7 — Four competing orange hexes → **CANNOT-TELL-FROM-PIXELS**
- Multiple orange usages are present and visible (sidebar button text, two h3 titles, amber/orange bars in the sampler-type chart, donut Soil wedge). But distinguishing the specific 1–2% hue deltas between `#c2410c`/`#b33a00`/`#ea6c00`/Tailwind-`orange-700` at screenshot resolution and across non-adjacent regions is not reliable. The token-conflict is a code/DRY concern best left to code review; pixels neither confirm nor refute distinct adjacent hues.

### #8 — Leaflet map competes with data → **PARTIALLY CONFIRMED (leaning refuted)**
- Evidence: `map.png`, `slice-01`, `slice-02`.
- The base tiles render **pale** — tan/beige land, light-blue water, faint road/label clutter. The green proportional markers read clearly against the pale terrain; the specific predicted failure ("green OSM park/forest fills merge with green markers") is **not observed** at the US/Colorado zoom shown. There is mild visual noise from roads, city labels, and blue water near coastal/Great-Lakes markers, so a minimal base tile (Positron) would still be an improvement — but the markers are legible as the visual subject today. Not the strong problem the code audit implies.

---

## Missed by the code audit (visible only in the render)

1. **Card depth is actually present** (see #4) — the single largest correction. A code-only audit reading `bg-white p-6` concluded cards have no containers; the rendered cards clearly have radius + border. This is the kind of drift a pixel pass exists to catch.
2. **Explorer "Type" badge is a 4th categorical-color context** the report's anarchy tally omitted — and it is **consistent** with the global donut (Air green / Soil amber / Liquid blue / Unknown gray). This is evidence *for* partial consistency in the visible app, not against.
3. **Page length / table pagination weight** — page 1 of the Explorer renders ~100 rows (slices 05–12 are almost entirely table), driving the ~10,620px page height and a very long scroll before the footer/pagination ("Page 1 of 46", `slice-12`). Consider a smaller default page size; this is a layout/scannability issue the code audit did not raise.
4. **Temporal x-axis label density** — month labels are dense, tiny, and 45°-rotated (`kpi.png`, `slice-01`), crowding the axis. The report mentions this in §1D but it did not make the top-8; visually it is one of the more noticeable legibility issues.
5. **"Active Since 2021" KPI** presents a bare year as a metric value alongside true counts (Field Samples / Unique Sites / Sequenced) — visually it reads as a count card but carries a non-count value (minor semantic inconsistency).
6. **Floating green "Feedback" pill** (bottom-right) overlaps chart/table content in most slices — a fixed widget occlusion worth noting, though likely intentional.

## Console / runtime
- The Playwright MCP browser is not connected in this environment, so I **could not inspect the browser console** for errors/warnings. From the static captures: all charts are populated with real data, no broken/empty chart canvases, no error overlays, no obvious render glitches or layout breakage across all 13 slices. `p10-confirm-fullpage.png` was noted as captured cleanly. A live console check is still recommended before sign-off (cannot be substituted by screenshots).

---

## Summary scoreboard
| # | Claim | Pixel verdict |
|---|---|---|
| 1 | Categorical color anarchy | CANNOT-TELL (filtered views not captured; visible contexts consistent) |
| 2 | Sequenced bar invisible | PARTIALLY CONFIRMED (weakest contrast, not invisible) |
| 3 | Charts not in Inter | PARTIALLY CONFIRMED (leaning confirmed) |
| 4 | Card depth absent | REFUTED (cards have radius+border in render) |
| 5 | Orange signal inverted | CONFIRMED |
| 6 | Rectangular KPI cards / hero chips | PARTIALLY CONFIRMED (hero chips yes; KPI cards no) |
| 7 | Four competing orange hexes | CANNOT-TELL (resolution-limited) |
| 8 | Map competes with data | PARTIALLY CONFIRMED (leaning refuted; pale tiles, markers legible) |

Net: 1 CONFIRMED, 3 PARTIAL, 1 REFUTED, 1 PARTIAL/refuted, 2 CANNOT-TELL. The two strongest, fully-pixel-backed findings are **#5 (orange-as-default)** and the hero-chip half of **#6**. The most important *correction* is **#4 — card depth is present in the render**, which the code-only audit got wrong.
