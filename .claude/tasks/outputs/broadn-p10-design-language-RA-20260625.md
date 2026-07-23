<research_dossier>
  <query>Define a clean, professional, credible scientific/data aesthetic the BROADN aerobiome dashboard (static HTML + Tailwind + Chart.js + Leaflet, CSU-Green #166534 anchor) can adopt across widgets, graphs, and charts.</query>

  <summary>
  A credible "scientific instrument" aesthetic converges on a small set of repeatable choices: a restrained neutral base with ONE brand accent, a separate colorblind-safe categorical palette (≤7 colors) for data series, perceptually-uniform sequential ramps (Viridis/Cividis or single-hue ColorBrewer) for magnitude/maps, high data-ink ratio charts (kill chartjunk: drop vertical gridlines, borders, heavy ticks; direct-label where possible), and a tabular-figure sans-serif for numbers. Every authoritative reference (USWDS, IBM Carbon, Datawrapper, FT, Tufte, Okabe-Ito, Viridis) points the same direction — the dashboard's current CSU-Green/stone/Inter foundation is already on-brand; the work is disciplining the chart and data-color layer, not repainting the brand. The single highest-leverage change is to stop using brand green (or arbitrary Chart.js defaults) as data-series colors and adopt the Okabe-Ito categorical set + a Viridis/Greens sequential ramp, both colorblind-safe, capped at 7 categories.
  </summary>

  <findings>

  <!-- ========== 1. REFERENCE DESIGN SYSTEMS & EXEMPLARS ========== -->
  <point>
    <claim>IBM Carbon's data-viz categorical palette is engineered so the SAME ordered sequence works for as few as 2 and as many as 14 categories, is fully 3:1 contrast-accessible against the background, averages >2:1 contrast between neighboring colors, and deliberately balances warm and cool hues "to avoid creating false associations." Borrow: a single ordered categorical sequence applied strictly in order; cap practical use well below 14. Pitfall: Carbon's brand skews cool — do not copy its blues wholesale onto a green-anchored brand.</claim>
    <source>https://carbondesignsystem.com/data-visualization/color-palettes/</source>
    <relevance>Gives BROADN a defensible model: define ONE ordered data-series palette and apply it in sequence everywhere, rather than picking colors per-chart.</relevance>
  </point>
  <point>
    <claim>The U.S. Web Design System (USWDS) encodes accessibility into color via a 0–100 "grade" scale regularized across families, with a "magic number" rule: a grade difference of 40+ yields WCAG AA large-text contrast, 50+ yields AA normal-text / AAA large-text, 70+ yields AAA. This is the gold standard for a government/institutional credible aesthetic.</claim>
    <source>https://designsystem.digital.gov/design-tokens/color/overview/</source>
    <relevance>Lets the UI Designer pick text/background/accent pairs with provable contrast instead of eyeballing — directly supports the WCAG AA requirement in standards.md.</relevance>
  </point>
  <point>
    <claim>The Financial Times "Visual Vocabulary" is the canonical chart-selection reference: it maps data RELATIONSHIPS (deviation, correlation, ranking, distribution, change-over-time, part-to-whole, magnitude, spatial) to appropriate chart types. Borrow: choose the chart from the relationship, not from novelty. The FT/chart-doctor repo also aligns its diverging palette names (PuOr…Spectral) to ColorBrewer.</claim>
    <source>https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md</source>
    <relevance>A reference the UI Designer/FE can use to justify each widget's chart type — credible dashboards match encoding to the question being asked.</relevance>
  </point>
  <point>
    <claim>Datawrapper's house guidance ("clean by default") is the practical exemplar for a restrained dashboard: remove the color key and DIRECT-LABEL categories (default for line/pie/donut on desktop); use fewer colors; emphasize one series with color and gray the rest. Borrow the "gray everything, color the point of interest" technique. Pitfall: relying on a legend when a direct label would be clearer.</claim>
    <source>https://www.datawrapper.de/blog/emphasize-with-color-in-data-visualizations</source>
    <relevance>Concrete, copyable techniques (direct labeling, gray-out-the-rest) that read as "professional analyst output" rather than "consumer dashboard."</relevance>
  </point>
  <point>
    <claim>Our World in Data's grapher redesign emphasizes restraint and legibility over decoration: every dataset is viewable as chart / map / table, tables get "enhanced contrast between rows and more consistent alignment," and controls are scoped to "just the settings relevant to what you're currently looking at." Borrow: the chart/map/table tri-view and progressive disclosure of controls. (Note: OWID does not publish low-level token specs publicly.)</claim>
    <source>https://ourworldindata.org/redesigning-our-interactive-data-visualizations</source>
    <relevance>BROADN already has charts + Leaflet map + tables; OWID validates presenting the same data three ways and keeping controls minimal/contextual.</relevance>
  </point>
  <point>
    <claim>The Urban Institute Data Visualization style guide is a fully public, citable institutional reference (fonts, exact palette hexes, chart-by-chart rules) — useful as a template for what a BROADN DESIGN.md data-viz section should contain.</claim>
    <source>https://urbaninstitute.github.io/graphics-styleguide/</source>
    <relevance>Model for documenting the new design language as enforceable tokens, not prose.</relevance>
  </point>

  <!-- ========== 2. COLOR FOR SCIENTIFIC DATA VIZ ========== -->
  <point>
    <claim>Match palette TYPE to data type: CATEGORICAL (qualitative) for unordered groups, SEQUENTIAL (single-hue, light→dark) for ordered magnitude, DIVERGING (two hues meeting at a neutral midpoint) only when there is a meaningful reference/zero point. Using a diverging or rainbow palette for ordered magnitude is a classic error.</claim>
    <source>https://www.datawrapper.de/academy/what-to-consider-when-choosing-colors-for-data-visualization</source>
    <relevance>BROADN's KPI/category charts → categorical; concentration/abundance & map intensity → sequential; anomaly-vs-baseline (if any) → diverging.</relevance>
  </point>
  <point>
    <claim>The Okabe-Ito (a.k.a. Wong, Nature Methods 2011) 8-color qualitative palette is the de-facto colorblind-safe categorical standard, distinguishable under protanopia/deuteranopia/tritanopia AND in grayscale: #E69F00 (orange), #56B4E9 (sky blue), #009E73 (bluish green), #F0E442 (yellow), #0072B2 (blue), #D55E00 (vermillion), #CC79A7 (reddish purple), #000000 (black). Caveat: #F0E442 yellow fails text/line contrast on white — use it as a large fill only, or substitute a darker gold.</claim>
    <source>https://easystats.github.io/see/reference/scale_color_okabeito.html</source>
    <relevance>This is the single best categorical palette for BROADN's multi-series charts; it is colorblind-safe by construction so it satisfies redundant-encoding goals without extra work.</relevance>
  </point>
  <point>
    <claim>Cap categorical colors at ~7. Datawrapper: "try to avoid using more than seven… The more colors… the harder it becomes to read it quickly"; beyond seven, change chart type, group categories, or direct-label. Carbon's range tops out at 14 but is explicitly an upper bound for engineered sequences, not a target.</claim>
    <source>https://www.datawrapper.de/blog/10-ways-to-use-fewer-colors-in-your-data-visualizations</source>
    <relevance>Sets a hard token rule for BROADN charts: 7 series max before regrouping or switching to small multiples / direct labels.</relevance>
  </point>
  <point>
    <claim>For sequential/continuous data and maps, use a perceptually-uniform colormap (Viridis or its colorblind-optimized sibling Cividis): constant lightness gradient in CAM02-UCS space, robust to common colorblindness, and legible in grayscale. Viridis is matplotlib's default for these reasons; avoid the legacy "jet"/rainbow ramp (perceptually non-uniform, introduces false boundaries).</claim>
    <source>https://cran.r-project.org/web/packages/viridis/vignettes/intro-to-viridis.html</source>
    <relevance>Drives the Leaflet choropleth/intensity ramp and any heat-style encoding; a brand-aligned alternative is ColorBrewer single-hue "Greens" (see below) when the visual should stay on-brand.</relevance>
  </point>
  <point>
    <claim>ColorBrewer (Cynthia Brewer) is the authoritative source for print/screen-safe sequential and diverging schemes with explicit colorblind-safe flags. Brand-aligned sequential "Greens" 5-class: #edf8e9, #bae4b3, #74c476, #31a354, #006d2c. Colorblind-safe diverging options: BrBG (brown↔teal — earthy, apt for an aerobiome theme) or RdBu. The FT visual vocabulary reuses these same named ramps.</claim>
    <source>https://colorbrewer2.org/</source>
    <relevance>Gives an on-brand green sequential ramp for magnitude/maps that harmonizes with CSU Green, plus a vetted diverging option if anomaly views are added.</relevance>
  </point>
  <point>
    <claim>Restrained-base + single-accent is the credibility cue: keep the UI in neutral grays and reserve saturated color for DATA and for one brand accent (semantic emphasis). Carbon explicitly derives its data palette as a SUBSET of the brand palette to "maximize accessibility and harmony within a page" — i.e., the data palette and UI chrome are intentionally separated.</claim>
    <source>https://carbondesignsystem.com/data-visualization/color-palettes/</source>
    <relevance>Confirms BROADN should NOT use CSU Green as a generic data-series color; green is the brand/UI accent, data series use the separate Okabe-Ito set. Reserve green for "the highlighted/primary series" only.</relevance>
  </point>

  <!-- ========== 3. TYPOGRAPHY ========== -->
  <point>
    <claim>Use a sans-serif with LINING + TABULAR figures for all numeric content. Lining = uniform height; tabular = uniform width so digits align in columns and tooltips/axes/tables compare at a glance. Datawrapper: "For data visualizations, use fonts with lining figures… oldstyle numbers are hard to read in a table, tooltip, or as an axis tick." Roboto, Open Sans, Lato (and Inter) expose tabular figures.</claim>
    <source>https://www.datawrapper.de/blog/fonts-for-data-visualization</source>
    <relevance>BROADN's Inter is a correct choice; enable tabular figures via `font-feature-settings: "tnum" 1;` on all numeric UI (KPI cards, tables, axis ticks). NOTE: HTML/CSS only — Chart.js canvas text cannot apply OpenType features (see chart section caveat).</relevance>
  </point>
  <point>
    <claim>Data-dense, credible UIs use a restrained weight range and clear hierarchy: a sans for body/labels, optionally a monospace for IDs/codes/precise values (sample IDs, lat/long, accession numbers). Tabular numerals let readers "quickly compare the number of digits in numbers."</claim>
    <source>https://data.europa.eu/apps/data-visualisation-guide/fonts-for-numbers</source>
    <relevance>Recommends a 2-family system for BROADN: Inter (UI/labels) + a mono (e.g. JetBrains Mono / IBM Plex Mono) for sample IDs and coordinate strings, signaling precision.</relevance>
  </point>

  <!-- ========== 4. CHART & GRAPH DESIGN ========== -->
  <point>
    <claim>Tufte's data-ink principle: maximize the share of ink that encodes data; "erase non-data-ink" and "erase redundant data-ink, within reason." Chartjunk = decorations, background images, unnecessary colors, heavy gridlines, axes, and tick marks. The credible-scientific look is the minimal one. (Nuance worth knowing: 2013–2015 studies found some "chartjunk" aids memorability — so the rule is restraint, not zealotry; never delete information, only decoration.)</claim>
    <source>https://www.nngroup.com/articles/clutter-charts/</source>
    <relevance>The governing principle for every Chart.js default below: strip borders, lighten/limit gridlines, kill drop shadows and gradients on bars/lines.</relevance>
  </point>
  <point>
    <claim>Prefer DIRECT LABELING over legends where layout allows (label the line/segment at its end), which removes the back-and-forth of legend lookup and lets you reuse/limit colors. Datawrapper makes this the default for line/pie/donut.</claim>
    <source>https://www.datawrapper.de/blog/color-keys-for-data-visualizations</source>
    <relevance>For BROADN time-series/line charts, end-of-line labels beat a top legend; reserves the legend pattern for dense bar charts only.</relevance>
  </point>
  <point>
    <claim>Chart.js is fully configurable to the above via global defaults and per-scale options: `Chart.defaults.font` (family/size/color), `options.scales[id].grid.color` and `.drawBorder`, `options.scales[id].ticks.color`, `options.plugins.legend` (position, `labels.usePointStyle`, `boxWidth`), and `options.plugins.tooltip` (backgroundColor, padding, cornerRadius, mode/intersect). Default uncustomized Chart.js looks generic — setting these is what produces the "scientific" look.</claim>
    <source>https://www.chartjs.org/docs/latest/axes/styling.html</source>
    <relevance>Translates directly to a shared `chart-defaults.js` the FE can apply once. Concrete values in the Top Recommendations section.</relevance>
  </point>
  <point>
    <claim>Tooltip design: scope to the hovered index, show all relevant series with their swatches, use a dark high-contrast surface, modest padding and small corner radius. Chart.js exposes all of this under `options.plugins.tooltip` (mode:'index', intersect:false, displayColors:true, backgroundColor, padding, cornerRadius, title/body fonts).</claim>
    <source>https://www.chartjs.org/docs/latest/configuration/tooltip.html</source>
    <relevance>Defines the BROADN tooltip token set; `mode:'index'` is the single most useful upgrade for multi-series temporal charts.</relevance>
  </point>
  <point>
    <claim>Accessible charts require REDUNDANT ENCODING beyond color (line dash patterns, point markers/shapes, direct labels, or texture) plus non-text contrast ≥3:1 for the graphical marks themselves — color alone must never be the sole differentiator. Okabe-Ito's grayscale-distinct luminance helps, but pattern/marker redundancy is still required for line series that overlap.</claim>
    <source>https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html</source>
    <relevance>BROADN line charts should pair each series color with a distinct point style (Chart.js `pointStyle`: circle/triangle/rect…) and/or dash so colorblind users and grayscale prints stay readable.</relevance>
  </point>

  <!-- ========== 5. LAYOUT, SPACING & "CLEAN PROFESSIONAL" CUES ========== -->
  <point>
    <claim>USWDS spacing/grade tokens model the "credible instrument" surface: regular spacing scale, hairline borders, and provable-contrast pairings. The institutional/government look favors flat surfaces and 1px borders over heavy drop shadows; restrained, consistent radii; generous whitespace; and tables with subtle row contrast (echoed by OWID's "enhanced contrast between rows, consistent alignment").</claim>
    <source>https://designsystem.digital.gov/design-tokens/color/theme-tokens/</source>
    <relevance>Translates to: cards bounded by 1px stone borders (not shadows), one small radius (8px), tight consistent spacing scale, right-aligned tabular numbers in tables. This is what separates "scientific instrument" from "marketing site" (gradients, big shadows, large radii, hero imagery, multiple accent colors).</relevance>
  </point>

  <!-- ========== 6. ACCESSIBILITY ========== -->
  <point>
    <claim>WCAG 2.2 AA text contrast (SC 1.4.3): ≥4.5:1 normal text, ≥3:1 large text (≥24px, or ≥18.66px bold). Non-text/graphical contrast (SC 1.4.11): ≥3:1 for UI components, states, and the graphical objects needed to understand a chart, against adjacent colors.</claim>
    <source>https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum</source>
    <relevance>Sets pass/fail thresholds for every text and chart-mark color the UI Designer picks; gridlines may be low-contrast (decoration) but data marks and axis labels must meet these.</relevance>
  </point>
  <point>
    <claim>Respect `prefers-reduced-motion`: reduce/disable animation duration and iteration for users who request it (supports SC 2.3.3 Animation from Interactions; helps 2.3.2). For Chart.js, gate `options.animation` on the media query (set duration 0 when reduced motion is preferred).</claim>
    <source>https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html</source>
    <relevance>Concrete directive: wrap Chart.js animation in a `window.matchMedia('(prefers-reduced-motion: reduce)')` check; keep chart entrance animation minimal regardless.</relevance>
  </point>

  </findings>

  <conflicting_data>
  Tufte's strict "maximize data-ink / chartjunk is harmful" doctrine is partially contradicted by empirical work (Bateman 2010; Borkin 2013; Haroz 2015, summarized in arXiv 2009.02634 "Data Visualization Practitioners' Perspectives on Chartjunk", https://arxiv.org/pdf/2009.02634) finding that some embellishment improves memorability/engagement without harming accuracy. Resolution for BROADN: this is a scientific instrument, not a magazine infographic — favor Tufte's restraint, but the conflict only matters for one-off communicative hero charts, not the routine dashboard widgets. Borrow restraint; do not interpret it as forbidding titles, annotations, or a single emphasis color.
  Maximum categorical colors: Datawrapper says ≤7 for legibility (https://www.datawrapper.de/blog/10-ways-to-use-fewer-colors-in-your-data-visualizations); IBM Carbon engineers up to 14 (https://carbondesignsystem.com/data-visualization/color-palettes/). Difference: Carbon's 14 is a technical upper bound for a contrast-tuned sequence, Datawrapper's 7 is a perceptual/readability recommendation. Adopt 7 as the practical cap.
  </conflicting_data>

  <staleness_risk>
  - Chart.js config keys are version-specific (the v2 → v3/v4 migration moved options under `plugins` and renamed scale config). Confirm BROADN's bundled Chart.js major version before writing `chart-defaults.js`; the option paths cited here are current (v4) docs. Re-verify against the actual CDN-pinned version at implementation time.
  - WCAG 3.0 / APCA contrast model is in development and may eventually supersede the 4.5:1 / 3:1 ratios; WCAG 2.2 AA remains the binding standard as of 2026-06.
  - OWID does not publish stable low-level token specs; treat its aesthetic as directional, not a copyable token source.
  </staleness_risk>

  <!-- ================= TOP RECOMMENDATIONS FOR BROADN ================= -->
  <top_recommendations>
  Prioritized, token-level directives for the UI Designer / FE. (P1 = highest leverage.)

  1. (P1) SEPARATE brand color from data colors. Keep CSU Green `#166534` as the single UI/brand accent (active states, primary buttons, "highlighted series"). Do NOT use it as a generic chart-series color. [Carbon]

  2. (P1) Adopt the Okabe-Ito colorblind-safe CATEGORICAL palette for all multi-series charts, applied strictly in this order, capped at 7 used at once:
     `#E69F00, #56B4E9, #009E73, #0072B2, #D55E00, #CC79A7, #000000`
     (Drop/relegate `#F0E442` yellow to large-fill use only — it fails contrast as a line/text on white.) Beyond 7 categories → group, switch to small multiples, or direct-label. [Okabe-Ito; Datawrapper]

  3. (P1) Use a perceptually-uniform SEQUENTIAL ramp for magnitude + the Leaflet map. On-brand option (preferred for harmony): ColorBrewer Greens `#edf8e9 → #bae4b3 → #74c476 → #31a354 → #006d2c`. Scientific-neutral option: Viridis. Never use a rainbow/jet ramp. [Viridis; ColorBrewer]

  4. (P1) Set global Chart.js defaults once in a shared `chart-defaults.js`:
     - `Chart.defaults.font.family = "Inter, system-ui, sans-serif"`, `size: 12`, `color: "#475569"` (slate-600)
     - Horizontal gridlines only: x-axis `grid.display = false`; y-axis `grid.color = "rgba(15,23,42,0.06)"`, `grid.drawBorder = false`
     - Ticks: `ticks.color = "#64748b"` (slate-500), no axis border
     - Legend: `position:'bottom'`, `labels.usePointStyle:true`, `boxWidth:10`; PREFER direct end-of-line labels over legend on line charts
     - Tooltip: `mode:'index'`, `intersect:false`, `displayColors:true`, `backgroundColor:"#0f172a"`, `padding:10`, `cornerRadius:6`, title weight 600
     - Lines: `borderWidth:2`, `tension:0.2` (or 0 for precise data), `pointRadius:0`, `pointHoverRadius:4`
     - Bars: no shadow/gradient, `borderRadius:2` max
     [Tufte/NNG; Chart.js docs]

  5. (P1) Redundant encoding on line charts: pair each series color with a distinct `pointStyle` (circle/triangle/rect/star) and/or dash pattern so series remain distinguishable in grayscale and for colorblind users. [WCAG 1.4.11]

  6. (P2) Typography: keep Inter; turn on tabular figures for ALL numeric UI (KPI cards, tables, tooltips, axis labels rendered in HTML) via `font-feature-settings: "tnum" 1; font-variant-numeric: tabular-nums;`. Right-align numeric table columns. NOTE: Chart.js canvas text cannot apply OpenType features — for axis numbers either accept Inter's default figures or use a uni-width font; document this limitation. [Datawrapper]

  7. (P2) Add a monospace family for IDs/codes/coordinates (sample IDs, lat/long, accession numbers) — e.g. `JetBrains Mono` or `IBM Plex Mono` — to signal precision. [data.europa.eu fonts-for-numbers]

  8. (P2) Surface treatment = "instrument, not marketing": cards bounded by 1px `#e7e5e4` (stone-200) borders, NOT drop shadows; single radius `8px` (rounded-lg); remove gradients/hero imagery; generous, consistent spacing scale; subtle row contrast in tables. [USWDS]

  9. (P2) "Gray-out-the-rest" emphasis: when one series/point matters, color only it (brand green or one accent) and render the rest in `#cbd5e1` (slate-300). [Datawrapper]

  10. (P3) Contrast gate every pairing to WCAG 2.2 AA: text ≥4.5:1 (≥3:1 large); data marks & axis labels ≥3:1 (gridlines exempt as decoration). Use the USWDS "magic number ≥50" mental model. Verify CSU Green `#166534` on white (passes, ~6.4:1) and never use it for thin/small text on stone background without checking. [WCAG 1.4.3 / 1.4.11; USWDS]

  11. (P3) Respect `prefers-reduced-motion`: set Chart.js `options.animation.duration = 0` when `matchMedia('(prefers-reduced-motion: reduce)')` matches; keep all entrance animation ≤300ms otherwise. [WCAG 2.3.3]

  12. (P3) Document all of the above as enforceable tokens in DESIGN.md (color/spacing/type/chart sections) following the Urban Institute style-guide model, so the aesthetic is checkable, not prose. [Urban Institute]
  </top_recommendations>
</research_dossier>
