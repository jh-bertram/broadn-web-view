<task_decomposition task_id="broadn-p10-design-implementation" agent_count="3" revision="2" supersedes="broadn-p10-design-implementation-PM-1782418369.md">

<!--
  REVISION 2 — addresses CRITIQUE_BLOCK (.claude/tasks/outputs/broadn-p10-design-implementation-CR-1782418873.md).
  Changes from rev1, all verified against live code (not assumption):
   BLOCKER fix: #166534 appears 13x in app.js. rev1 missed the two residuals that made SC1 unsatisfiable:
     - app.js:3018  PG_SAMPLER_FILL 'SASS': '#166534'  (sampler-INSTRUMENT map — distinct dimension)
     - app.js:2981  PG_TYPE_FILL[dom] || '#166534'      (sample-type fill fallback)
     Both are now IN SCOPE. UI-001 specifies a v2 instrument-anchor value (NOT Okabe sample-type, NOT brand
     teal); the 2981 fallback migrates to SAMPLE_TYPE_COLORS['Unknown']. SC1 grep '#166534'==0 is now satisfiable.
   WARNING 1 fix: timeline-legend maps under-enumerated. BOTH maps hold FOUR sample-type entries:
     PG_TYPE_COLOR (2792-97): Air bg-sky-500 / Plant bg-emerald-600 / Soil bg-amber-700 / Liquid bg-cyan-400
     PG_TYPE_FILL  (2869-74): Air #0ea5e9 / Plant #059669 / Soil #b45309 / Liquid #22d3ee
     PLUS a static index.html legend (~300-303) with the same 4 bg-classes (4 occurrences confirmed).
     rev1 named only Air+Liquid / Air+Soil+Liquid. All four in both maps + the static HTML legend now enumerated.
     project_group data is DORMANT (empty) -> legend cannot be screenshot-verified -> grep is the only guard.
   WARNING 2 fix: bright-teal text restriction now binds on FE (new sub-deliverable H + SC9), not only on AUD.
  Verified per-token counts (for satisfiable grep SCs):
     app.js #166534 ==13 (all enumerated)  | #0ea5e9 ==1 (2870)  | #059669 ==1 (2871)  | #22d3ee ==2 (2873,3020)
     app.js bg-sky-500/bg-emerald-600/bg-amber-700/bg-cyan-400 ==1 each (PG_TYPE_COLOR only)
     index.html legacy bg-classes ==4 (static legend)
-->

  <task_packets>

    <task_packet>
      <task_id>broadn-p10-design-implementation-UI-001</task_id>
      <assigned_to>ui-designer</assigned_to>
      <priority>BLOCKER</priority>
      <description>
Author DESIGN.md v2 — the design-system source of truth FE consumes in UI-002. This is item #1 of the
human request PLUS the authoritative token decisions that disambiguate items #3, #4, #6 so FE has zero
latitude. All brand decisions are RATIFIED (deep teal #0c5454, bright teal #0c9cb4, Okabe-Ito data
palette, single filter-accent #c2410c) — do NOT re-open or propose alternatives. Encode them into
DESIGN.md v2 and produce a COMPLETE migration table.

Deliverables in DESIGN.md (edit the file in place):
1. CONSTITUTION: replace "CSU Green is the brand anchor: #166534" with "BROADN teal is the brand
   anchor: deep teal #0c5454 (nav active, headings, primary buttons, hero, icon halos); bright teal
   #0c9cb4 (active/accent/links/underlines)." Retire CSU green #166534 from the UI ENTIRELY. Add the
   literal note: "This OVERRIDES v1.0.0's 'CSU Green is the brand anchor' rule."
2. FRONTMATTER: bump `Version: 1.0.0` -> `2.0.0` (MAJOR — a Constitution rule is overridden); set
   `Updated:` to 2026-06-25.
3. COLOR TOKENS table: re-point brand tokens to teal — --color-primary (deep teal #0c5454),
   --color-primary-dark (a darker teal you specify, for hero/pressed), --color-primary-light (a light
   teal tint for KPI icon-halo backgrounds, replacing green-100), --color-accent/link/active (bright
   teal #0c9cb4). Keep the same token NAMES; re-point VALUES only.
4. SAMPLE-TYPE DATA PALETTE (single source of truth, keyed by category NAME, NOT array index). Name it
   SAMPLE_TYPE_COLORS with EXACTLY:
     Air #0072B2, Plant #009E73, Soil #E69F00, Liquid #56B4E9, Unknown #999999.
   State explicitly: brand teal (#0c5454/#0c9cb4) is NOT a member of this data palette (brand != data).
5. SINGLE FILTER-ACCENT TOKEN: --color-filter-accent = #c2410c (orange-700, Tailwind-CDN resolution).
   Document the four-orange collapse where they act as a FILTER SIGNAL and classify the non-filter
   oranges so FE does not over-replace:
     - #ea6c00 (CHART_COLORS.orangeAccent, bar-highlight) -> #c2410c
     - #b33a00 (--color-orange-700, the always-on h3 title color) -> removed from the GLOBAL h3s
       (item #4 signal fix); token consolidated to --color-filter-accent
     - #c2410c (Tailwind text-orange-700) -> already canonical; keep
     - #b45309 (amber-700): where it is the Soil DATA color it is replaced by Okabe #E69F00 (item #3);
       where it is --color-warning it STAYS as the warning semantic (NOT an orange-filter signal).
6. PIPELINE STAGE COLORS (item #6 decision): specify the replacement for the pale Sequenced bar
   (#4ade80 green-400, ~1.7:1 on white — fails). Provide a 3-stage palette where every step meets
   >= 3:1 non-text contrast on white; assign the other two steps (#166534, #16a34a) their v2 values
   (CSU green is retiring). Document exact hexes + contrast ratios.
6b. SAMPLER-INSTRUMENT ANCHOR (NEW — resolves the CR BLOCKER). The PG_SAMPLER_FILL map (app.js:3017+)
   anchors its first instrument 'SASS' at #166534. Because "retire #166534 ENTIRELY" applies, specify a
   v2 replacement for that instrument anchor. CONSTRAINT: the sampler-instrument map is a DISTINCT
   categorical dimension — its replacement must NOT reuse any Okabe-Ito sample-type hex AND must NOT be
   brand teal (#0c5454/#0c9cb4) — give it its own non-#166534 value consistent with the instrument
   map's existing lime/olive family (the map already uses #84cc16/#a3e635/#65a30d). Document the one
   replacement hex. Only the #166534 anchor changes; the other instrument colors stay.
7. MIGRATION TABLE (the FE checklist — REQUIRED and COMPLETE). Derive it from an ACTUAL sweep, not
   memory: run `grep -n '#166534' DESIGN.md index.html assets/app.js assets/styles.css` and assign a v2
   replacement to EVERY hit (there are 13 in app.js alone — incl. CHART_COLORS.line/pipeline[0]/
   sampleTypes[0]/pointBg/mapMarkerFill/sliceSampleTypes[0]/slicePipeline[0]/temporalBar/
   sliceTimeOfDay[0]/sliceHeatRamp[3]/samplerType[0], the PG_TYPE_FILL fallback at :2981, and
   PG_SAMPLER_FILL 'SASS' at :3018). Also enumerate: the green Tailwind classes (bg-green-900/
   bg-green-800/text-green-800/border-green-800/green-100 halos), #14532d green-900, #15803d green-700,
   and the legacy SAMPLE-TYPE encodings to retire — the three CHART_COLORS arrays, PG_TYPE_COLOR's four
   bg-classes, PG_TYPE_FILL's four hexes, and the static index.html timeline legend (~lines 300-303).
   For each row: current value -> v2 value -> file(s)/line(s). The PG_TYPE_FILL fallback `|| '#166534'`
   maps to `SAMPLE_TYPE_COLORS['Unknown']`.
8. WCAG NOTE (A11Y, mandatory): bright teal #0c9cb4 on white is ~3:1 — PASSES non-text/large-text AA
   but FAILS normal-text AA (4.5:1). State the rule: bright teal is for underlines/borders/active-accent/
   large text/dark backgrounds only; normal-size link/active TEXT on white MUST use deep teal #0c5454
   (~9:1, AA). FE binds this (UI-002 sub-deliverable H) and AUD verifies.

Set design_system_source = DESIGN_MD; trace every token to a named DESIGN.md entry.
      </description>
      <success_criteria>
1. DESIGN.md frontmatter reads `Version: 2.0.0` and `Updated: 2026-06-25`.
2. Constitution no longer contains "CSU Green is the brand anchor"; contains a BROADN-teal rule naming
   #0c5454 + #0c9cb4 and the literal "OVERRIDES" referencing v1.0.0; grep '#166534' over the
   Constitution + Color-Tokens sections == 0.
3. SAMPLE_TYPE_COLORS documented keyed by name with exactly Air #0072B2 / Plant #009E73 / Soil #E69F00 /
   Liquid #56B4E9 / Unknown #999999.
4. --color-filter-accent = #c2410c documented with the four-orange collapse and the #b45309
   warning-vs-data split.
5. A 3-stage pipeline palette with no step failing 3:1 on white; the value replacing #4ade80 stated
   with its ratio.
6. A sampler-instrument anchor replacement for #166534 is specified that is neither an Okabe-Ito
   sample-type hex nor brand teal.
7. A COMPLETE MIGRATION TABLE maps EVERY #166534 occurrence (>=13 in app.js incl. :2981 fallback and
   :3018 SASS), the green Tailwind classes, the three sample-type arrays, PG_TYPE_COLOR (4 classes),
   PG_TYPE_FILL (4 hexes + fallback), and the static index.html legend -> v2 values with line refs.
8. A WCAG note restricts bright-teal #0c9cb4 to non-normal-text use and routes normal-size link/active
   text to deep teal #0c5454.
9. git diff touches DESIGN.md ONLY.
      </success_criteria>
      <context_files>
DESIGN.md (the file to edit; v1.0.0)
.claude/tasks/outputs/broadn-p10-design-language-UI-20260625.md (ratified token/palette guidance — Parts 4, 5, 7)
.claude/tasks/outputs/broadn-p10-design-language-RA-20260625.md (external validation for Okabe-Ito / pipeline convention)
.claude/tasks/outputs/broadn-p10-filtered-state-confirm-20260625.md (exact current divergent hexes)
.claude/tasks/broadn-p10-design-language.md (ratified Decisions)
assets/app.js (CHART_COLORS 27-56; PG_TYPE_COLOR 2792-2797; PG_TYPE_FILL 2869-2874 + fallback 2981; PG_SAMPLER_FILL 3017+; run the #166534 sweep here)
assets/styles.css (:root tokens 4-14)
index.html (nav 24, hero 46, h3s 669/674, static timeline legend ~300-303)
      </context_files>
      <dependencies>NONE</dependencies>
      <out_of_scope>
- Do NOT edit index.html / assets/app.js / assets/styles.css — that is UI-002 (FE). v2 spec + table only.
- Do NOT re-open the ratified colors or propose alternatives.
- Do NOT add new design scope the human did not request (card depth/shadow, CartoDB/ESRI map tile,
  empty-state pattern, log-scale axis disclosure, temporal tick density, marker opacity) — deferred.
- Do NOT recolor the sampler-instrument map BEYOND its single #166534 anchor (the other instrument
  colors stay; only the structural CSU-green anchor migrates).
- Do NOT rename existing token keys; re-point VALUES.
      </out_of_scope>
      <output_expected>
        <tag>design_spec</tag>
        <must_contain>
          <item>Version: 2.0.0 frontmatter</item>
          <item>BROADN-teal Constitution rule with #0c5454 + #0c9cb4 + "OVERRIDES v1.0.0" note</item>
          <item>SAMPLE_TYPE_COLORS five-pair Okabe-Ito map keyed by name</item>
          <item>--color-filter-accent #c2410c with four-orange collapse + #b45309 split</item>
          <item>pipeline 3-stage palette replacing #4ade80 with ratios</item>
          <item>sampler-instrument anchor replacement for #166534 (non-Okabe, non-brand-teal)</item>
          <item>COMPLETE migration table covering all 13 #166534 sites + PG maps + static HTML legend</item>
          <item>WCAG note restricting bright-teal #0c9cb4 normal-text use</item>
        </must_contain>
        <must_not_contain>
          <item>edits to index.html / app.js / styles.css</item>
          <item>#166534 or "CSU Green is the brand anchor" surviving in Constitution/Color-Tokens</item>
          <item>brand teal listed as a sample-type data-palette member</item>
          <item>the sampler-instrument anchor reusing an Okabe sample-type hex or brand teal</item>
        </must_not_contain>
        <success_signal>DESIGN.md diff shows v2 teal Constitution, SAMPLE_TYPE_COLORS, single filter-accent, pipeline palette, instrument anchor, a complete migration table, WCAG note — touching no other file.</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>broadn-p10-design-implementation-UI-002</task_id>
      <assigned_to>frontend</assigned_to>
      <priority>HIGH</priority>
      <description>
Implement the teal rebrand + the design-language fixes across the three static files (index.html,
assets/app.js, assets/styles.css), executing the DESIGN.md v2 MIGRATION TABLE (UI-001) as your
authoritative checklist. No-build static dashboard — verify by serving statically (python3 -m
http.server 8771 -> http://localhost:8771/index.html). Vanilla JS, Tailwind CDN, Chart.js, Leaflet.

Sub-deliverables A-H (each maps to a human-request item):

A. TEAL REBRAND (item #1, code-side). Replace EVERY in-scope #166534 occurrence with its v2 value per
   the migration table. There are 13 in app.js — derive your worklist from `grep -n '#166534'
   index.html assets/app.js assets/styles.css` and migrate every hit, including the easy-to-miss
   CHART_COLORS.slicePipeline[0] (:42) and sliceTimeOfDay[0] (:50). Also re-point the brand greens in
   styles.css (--color-green-800, .nav-link.active) and index.html (nav wordmark area, hero bg-green-900,
   hero chips bg-green-800, nav-active border/text-green-800, KPI green-100/green-800 halos) to teal per
   the table. Brand teal must NOT enter the sample-type data palette (sub-deliverable C).

B. LOGO (item #2). Wire assets/broadn-logo.webp into (1) the nav brand mark (index.html:24, replacing
   the `&#10044;` asterism) and (2) the hero, using a real `<img src="assets/broadn-logo.webp">` with a
   descriptive `alt` (e.g. "BROADN logo") and an `aria-label` on the brand link/container. Remove the
   `&#10044;` glyph; keep the "BROADN" wordmark text.

C. SINGLE OKABE-ITO SAMPLE-TYPE PALETTE (item #3) — DRY is the crux. Introduce ONE object
   SAMPLE_TYPE_COLORS keyed by category NAME: Air #0072B2, Plant #009E73, Soil #E69F00, Liquid #56B4E9,
   Unknown #999999. Then route ALL sample-type color encodings through it:
   C1. Replace the three divergent arrays — CHART_COLORS.sampleTypes (:35), sliceSampleTypes (:41),
       samplerType (:55) — so charts read color by category name, not array index.
   C2. Rebuild PG_TYPE_COLOR (app.js:2792-2797) — ALL FOUR entries (Air bg-sky-500, Plant
       bg-emerald-600, Soil bg-amber-700, Liquid bg-cyan-400). Source colors from SAMPLE_TYPE_COLORS;
       since the Okabe values are hex (not Tailwind classes), convert the timeline-strip consumers to
       inline-style hex from SAMPLE_TYPE_COLORS (matching the PG_TYPE_FILL hex pattern) so no legacy
       bg-sky/emerald/amber/cyan class remains.
   C3. Rebuild PG_TYPE_FILL (app.js:2869-2874) — ALL FOUR entries (Air #0ea5e9, Plant #059669, Soil
       #b45309, Liquid #22d3ee) to source from SAMPLE_TYPE_COLORS. Change the fallback at app.js:2981
       `PG_TYPE_FILL[dom] || '#166534'` to `|| SAMPLE_TYPE_COLORS['Unknown']`.
   C4. Migrate the STATIC index.html timeline legend (~lines 300-303) — the four swatches currently
       using bg-sky-500 / bg-emerald-600 / bg-amber-700 / bg-cyan-400 — to the Okabe hexes via inline
       style (e.g. style="background:#0072B2"), mirroring SAMPLE_TYPE_COLORS.
   After C, exactly ONE place assigns colors to the five sample-type category names; the PG legend and
   index.html legend both derive from it.

D. ORANGE CONSOLIDATION + INVERTED-SIGNAL FIX (item #4).
   D1: wire --color-filter-accent = #c2410c in styles.css; route filter-signal oranges through it.
   CHART_COLORS.orangeAccent (:53) #ea6c00 -> #c2410c. Consolidate the styles.css orange tokens
   (--color-orange-500 #ea6c00, --color-orange-700 #b33a00, lines 11-13) to the single
   --color-filter-accent (no orphan unused orange tokens). Leave --color-warning #b45309 as the warning
   semantic (NOT a filter signal).
   D2: the GLOBAL-view h3s at index.html:669 ("Sampler Replicate Tags (All)") and :674 ("Sampler Type
   Distribution (All)") must NOT read as filter-active — change them from .slice-chart-title-active to
   the neutral chart-title color (text-stone-800). The "All BROADN Samples" DEFAULT sidebar button
   (app.js:3997, bg-orange-50 text-orange-700) must NOT be orange in its default/unfiltered state —
   give it the teal-active/neutral treatment per v2; orange appears only when a sub-filter is engaged.

E. CHART.JS INTER DEFAULT (item #5). Set Chart.defaults.font.family to the Inter stack
   ('"Inter", system-ui, -apple-system, Helvetica, Arial, sans-serif') once near the top of app.js,
   BEFORE any chart is instantiated.

F. PIPELINE-BAR CONTRAST (item #6). Replace CHART_COLORS.pipeline[2] #4ade80 (:34) with the v2 value
   (>= 3:1 non-text on white); set the other two pipeline steps to their v2 values per the table.

G. HERO-CHIP RADIUS (item #7). Add `rounded` to the rectangular hero stat chips (#hero-samples at
   index.html:46 and its sibling hero chips).

H. BRIGHT-TEAL TEXT RESTRICTION (A11Y, item #1 / WCAG constraint — binds on FE, not just AUD).
   Normal-size link/active TEXT on white must use deep teal #0c5454 (~9:1, AA). Bright teal #0c9cb4
   (~3:1, fails normal-text AA) may be used ONLY for underlines, borders, active-accent, large text, or
   on dark backgrounds. Apply per the v2 WCAG note — e.g. the nav active state uses deep-teal text with
   a bright-teal underline/border; links render deep-teal text.
      </description>
      <success_criteria>
Mechanical (run from repo root):
1. (A teal) `grep -c '#166534' index.html assets/app.js assets/styles.css` == 0 across ALL three files
   (this now includes the formerly-residual :2981 fallback and :3018 SASS anchor). Deep teal present:
   `grep -rc '#0c5454' index.html assets/app.js assets/styles.css` >= 1. No brand-green Tailwind in
   markup: `grep -E 'green-(700|800|900)' index.html` == 0.
2. (B logo) `grep -c 'broadn-logo.webp' index.html` >= 2; each `<img>` has `alt`; the brand container
   has `aria-label`; `grep -c '&#10044;' index.html` == 0.
3. (C palette DRY) ONE SAMPLE_TYPE_COLORS object keyed by name with exactly
   #0072B2/#009E73/#E69F00/#56B4E9/#999999. Legacy sample-type encodings retired:
   - `grep -c '#0ea5e9' assets/app.js` == 0  (PG_TYPE_FILL Air migrated)
   - `grep -c '#059669' assets/app.js` == 0  (PG_TYPE_FILL Plant migrated)
   - `grep -c 'bg-sky-500\|bg-emerald-600\|bg-amber-700\|bg-cyan-400' assets/app.js` == 0  (PG_TYPE_COLOR migrated)
   - `grep -c 'bg-sky-500\|bg-emerald-600\|bg-amber-700\|bg-cyan-400' index.html` == 0  (static legend migrated)
   - `grep -c '#22d3ee' assets/app.js` == 1  (was 2; the 1 remaining is PG_SAMPLER_FILL BioSpot VIVAS at
     :3020 — the sampler-INSTRUMENT map, OUT OF SCOPE; must remain exactly 1, NOT 0)
   - the PG_TYPE_FILL fallback at :2981 now reads `|| SAMPLE_TYPE_COLORS['Unknown']` (no literal #166534)
   - identifiers sliceSampleTypes / samplerType no longer exist as standalone divergent hex arrays.
4. (D1 orange) `grep -c '#ea6c00' index.html assets/app.js assets/styles.css` == 0;
   `--color-filter-accent: #c2410c` present and wired in styles.css; no orphan --color-orange-500/700
   tokens remain; --color-warning #b45309 unchanged.
5. (D2 signal) index.html 669/674 no longer carry `slice-chart-title-active` (neutral stone title);
   the slice-PANEL h3s at 410/415/459/464/499/504 are UNCHANGED; the default "All BROADN Samples" button
   (app.js:3997) no longer uses bg-orange-50/text-orange-700 in its default state.
6. (E Inter) `grep -c 'Chart.defaults.font.family' assets/app.js` >= 1, value contains "Inter", and the
   assignment precedes the first `new Chart(`.
7. (F pipeline) `grep -c '#4ade80' assets/app.js` == 0; the replacement matches the v2 spec.
8. (G hero) the hero stat chips include `rounded`; the #hero-samples chip is rounded.
9. (H bright-teal text) `grep -c '#0c9cb4' index.html assets/app.js assets/styles.css` matches only
   non-normal-text uses (underline/border/accent); no normal-size link or active TEXT renders in
   #0c9cb4 — nav-active and link text use deep teal #0c5454. (AUD-001 confirms on the live render.)
Visual (live render, for AUD-001):
10. Deep-teal nav/headings/hero, teal accents, no green brand surface; the SAME sample-type category is
    the SAME Okabe-Ito color in the global donut and slice donut; legible Sequenced bar; Inter chart
    text; rounded hero chips; logo in nav + hero. (The PG/timeline legend is DORMANT data — verify via
    grep, item 3, not screenshot.)
      </success_criteria>
      <context_files>
DESIGN.md (v2 — UI-001 output; migration table is your checklist)
.claude/tasks/outputs/broadn-p10-design-language-UI-20260625.md (Part 4C Chart.defaults block; Part 7 WCAG table)
index.html (nav 24, hero 46, static timeline legend ~300-303, global h3s 669/674; slice-panel h3s 410-504 OUT OF SCOPE)
assets/app.js (CHART_COLORS 27-56; PG_TYPE_COLOR 2792-2797; PG_TYPE_FILL 2869-2874 + fallback 2981; PG_SAMPLER_FILL 3017+; btnAll 3997; orangeAccent uses 1381/1390)
assets/styles.css (:root orange tokens 11-13; .slice-chart-title-active 65; .nav-link.active 22-27)
assets/broadn-logo.webp (the logo asset — confirmed present)
      </context_files>
      <dependencies>broadn-p10-design-implementation-UI-001</dependencies>
      <estimated_new_lines>
~50-80 net new lines. Replacement-heavy (re-pointing 13 #166534 hits, rebuilding two PG maps + a static
legend to source from SAMPLE_TYPE_COLORS, swapping classes). Kept as ONE task: the three files are a
single coupled token system; the DRY goal (one sample-type palette, one filter-accent token) is HARMED
by splitting — concurrent edits to shared app.js/index.html would race, and the CSS-token change must be
coordinated with its app.js consumer in one pass. Under 100 net new lines; justification to keep whole
accepted per the split rule.
      </estimated_new_lines>
      <out_of_scope>
- Do NOT touch the slice-PANEL h3s at index.html 410/415/459/464/499/504 — they render only when a slice
  IS active (legitimate orange signal). Only the GLOBAL h3s 669/674 change.
- Do NOT recolor the PG_SAMPLER_FILL sampler-INSTRUMENT map BEYOND its single #166534 'SASS' anchor
  (UI-001 specifies that one replacement). The other instrument colors stay — incl. 'BioSpot VIVAS'
  #22d3ee at :3020, which is a DIFFERENT categorical dimension from sample-type and must REMAIN
  (#22d3ee app.js count == 1 after your work, not 0).
- Do NOT change --color-warning (#b45309); it is the warning semantic, not an orange-filter signal.
- Do NOT add scope beyond the 7 ratified items: NO card depth/shadow, NO CartoDB/ESRI map base tile, NO
  empty-state redesign, NO log-scale disclosure, NO temporal tick-density change, NO map marker opacity/
  halo change. Adding any is SCOPE_DRIFT.
- Do NOT re-litigate colors; consume DESIGN.md v2 verbatim. No framework/build step. No `git push`.
      </out_of_scope>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>SAMPLE_TYPE_COLORS single object (5 Okabe hexes) with PG_TYPE_COLOR, PG_TYPE_FILL, the :2981 fallback, and the static index.html legend all sourcing from it</item>
          <item>Chart.defaults.font.family set to the Inter stack before first new Chart()</item>
          <item>--color-filter-accent #c2410c wired; orangeAccent -> #c2410c</item>
          <item>broadn-logo.webp in nav + hero with alt + aria-label; &#10044; removed</item>
          <item>global h3s 669/674 neutralized; "All BROADN Samples" default button de-oranged</item>
          <item>pipeline Sequenced step no longer #4ade80; hero chips rounded; SASS instrument anchor migrated off #166534</item>
          <item>bright-teal text restriction applied (deep teal for link/active text)</item>
          <item>confirmation the change was viewed on the live render</item>
        </must_contain>
        <must_not_contain>
          <item>any surviving #166534 in any of the three files (incl. :2981 fallback and :3018 SASS)</item>
          <item>parallel/duplicate sample-type color arrays or legacy PG legend hex/classes (#0ea5e9, #059669, bg-sky-500, etc.)</item>
          <item>parallel orange tokens (#ea6c00, #b33a00) acting as filter signals</item>
          <item>edits to slice-panel h3s 410-504, the BioSpot VIVAS #22d3ee instrument color, --color-warning, or any deferred out-of-scope surface</item>
          <item>normal-size link/active text rendered in bright teal #0c9cb4</item>
        </must_not_contain>
        <success_signal>Live render shows teal brand + one Okabe sample-type palette + legible Sequenced bar + Inter charts + rounded chips + logo; the nine mechanical greps pass (incl. #166534==0 across all files, #22d3ee==1).</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>broadn-p10-design-implementation-AUD-001</task_id>
      <assigned_to>auditor</assigned_to>
      <priority>HIGH</priority>
      <description>
Three-gate audit (SA standards -> QA functionality -> SX security) of the v2 implementation, with a
screenshot pass against the LIVE render (Playwright fixed this session; http://localhost:8771/index.html
served). Static dashboard — QA is visual/behavioral, not unit tests.

Verify against DESIGN.md v2 and the live render:
- SA: DESIGN.md v2 frontmatter 2.0.0 with the teal Constitution + override note; FE code matches the v2
  migration table; DRY honored (ONE SAMPLE_TYPE_COLORS map — incl. PG_TYPE_COLOR, PG_TYPE_FILL, the
  :2981 fallback, and the static index.html legend all sourcing from it; ONE --color-filter-accent);
  no parallel sample-type arrays / legacy PG legend hex/classes / orphan orange tokens; `#166534`
  absent from all three files; `#22d3ee` remains exactly 1 (BioSpot instrument, expected).
- QA (screenshot): confirm (1) deep-teal nav/headings/hero, teal accents, no CSU-green brand surface;
  (2) the SAME sample-type category renders the SAME Okabe-Ito color in the global donut AND slice donut
  (capture a filtered slice to compare); (3) legible Sequenced pipeline bar; (4) chart text in Inter,
  not system sans; (5) rounded hero chips; (6) logo renders in nav + hero; (7) global-view h3s and the
  default "All BROADN Samples" button are NOT orange when no filter is set, orange returns only on a
  sub-filter.
  NOTE: the project_group / concurrent-timeline legend is DORMANT (empty data) and CANNOT be
  screenshot-verified — verify those migrations via grep (the FE SC3 greps), not the rendered page.
- A11Y/SX: logo `<img>` has alt + aria-label; bright teal #0c9cb4 is NOT used for normal-size text on
  white (deep teal #0c5454 used for link/active text per the v2 WCAG note — verify this BINDING, it is
  the load-bearing A11Y check); sample-type palette colorblind-safe (Okabe-Ito); no hardcoded secrets /
  no injection surface (static files).
Save screenshots to .claude/tasks/outputs/. PASS only if all gates pass; on any FAIL return a single
specific remediation per gap to route back to UI-002.
      </description>
      <success_criteria>
SA + QA + SX all PASS. Screenshot evidence saved showing teal brand, single Okabe sample-type palette
consistent across global donut / slice donut, legible Sequenced bar, Inter chart text, rounded hero
chips, rendered logo, and correct (non-inverted) orange filter signal. The dormant PG/timeline legend
migration is confirmed via grep, not screenshot. Bright-teal text restriction (R1) explicitly verified
on FE code. Any FAIL reported with one specific remediation per gap.
      </success_criteria>
      <context_files>
DESIGN.md (v2 — spec to audit against)
.claude/tasks/outputs/broadn-p10-design-language-UI-20260625.md (Part 7 WCAG table)
.claude/tasks/outputs/broadn-p10-filtered-state-confirm-20260625.md (BEFORE state for findings #1/#7 — verify resolved)
index.html, assets/app.js, assets/styles.css (implemented files)
http://localhost:8771/index.html (live render)
      </context_files>
      <dependencies>broadn-p10-design-implementation-UI-002</dependencies>
      <out_of_scope>
- Do NOT audit deferred items (card depth, map base tile, empty states, log-scale disclosure) — false FAILs.
- Do NOT treat the single remaining #22d3ee at app.js:3020 (BioSpot VIVAS instrument) as a sample-type
  violation — out of scope, expected count 1.
- Do NOT FAIL on the dormant PG/timeline legend not appearing in screenshots — it has no data; grep is its guard.
- Do NOT modify code; verify and report only.
      </out_of_scope>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>SA/QA/SX verdicts (each PASS/FAIL)</item>
          <item>screenshot evidence paths for teal brand + single-palette + signal-fix</item>
          <item>grep-based confirmation of the dormant PG/timeline + #166534==0 + #22d3ee==1</item>
          <item>explicit confirmation findings #1 and #7 are resolved + bright-teal text binding verified</item>
        </must_contain>
        <must_not_contain>
          <item>FAILs against deferred out-of-scope surfaces or the BioSpot instrument color</item>
        </must_not_contain>
        <success_signal>All three gates PASS with evidence; or a FAIL with a single specific remediation per gap routed to UI-002.</success_signal>
      </output_expected>
    </task_packet>

  </task_packets>

  <dependency_order>
    broadn-p10-design-implementation-UI-001 (ui-designer: DESIGN.md v2 + COMPLETE migration table + instrument anchor)
      -> broadn-p10-design-implementation-UI-002 (frontend: implement all code vs v2)
      -> broadn-p10-design-implementation-AUD-001 (auditor: SA/QA/SX + screenshot verify + grep guard for dormant legend)
    Strictly sequential. UI-001 is a BLOCKER. No parallelism (single coupled file set).
  </dependency_order>

  <verbatim_deliverable_audit>
    <phrase text="Implement the BROADN teal rebrand"><addressed task="broadn-p10-design-implementation-UI-002"/></phrase>
    <phrase text="design-language fixes settled in the P10 evaluation"><addressed task="broadn-p10-design-implementation-UI-002"/></phrase>
    <phrase text="SHIPS CODE through the full pipeline"><addressed task="broadn-p10-design-implementation-AUD-001"/></phrase>
    <phrase text="DESIGN.md v2 update the Constitution + Color Tokens"><addressed task="broadn-p10-design-implementation-UI-001"/></phrase>
    <phrase text="brand anchor = BROADN teal (deep #0c5454 nav/headings/primary)"><addressed task="broadn-p10-design-implementation-UI-001"/></phrase>
    <phrase text="bright #0c9cb4 active/accent/links"><addressed task="broadn-p10-design-implementation-UI-001"/></phrase>
    <phrase text="Retire CSU green #166534 from the UI"><addressed task="broadn-p10-design-implementation-UI-002"/></phrase>
    <phrase text="Bump the frontmatter version"><addressed task="broadn-p10-design-implementation-UI-001"/></phrase>
    <phrase text="record that this OVERRIDES v1.0.0's CSU Green rule"><addressed task="broadn-p10-design-implementation-UI-001"/></phrase>
    <phrase text="Logo — wire assets/broadn-logo.webp into nav brand mark + hero"><addressed task="broadn-p10-design-implementation-UI-002"/></phrase>
    <phrase text="replace the &#10044; Unicode asterism"><addressed task="broadn-p10-design-implementation-UI-002"/></phrase>
    <phrase text="add accessible alt/aria-label"><addressed task="broadn-p10-design-implementation-UI-002"/></phrase>
    <phrase text="Single Okabe-Ito sample-type palette keyed by category-NAME"><addressed task="broadn-p10-design-implementation-UI-002"/></phrase>
    <phrase text="replace ALL THREE divergent encodings: sampleTypes, sliceSampleTypes, samplerType"><addressed task="broadn-p10-design-implementation-UI-002"/></phrase>
    <phrase text="inline sky/cyan concurrent-timeline legend map (2790 bg-class + 2870 hex)"><addressed task="broadn-p10-design-implementation-UI-002"/></phrase>
    <phrase text="Brand teal stays OFF the data palette so brand != data"><addressed task="broadn-p10-design-implementation-UI-001"/></phrase>
    <phrase text="Orange consolidation — collapse the four oranges to ONE wired filter-accent token"><addressed task="broadn-p10-design-implementation-UI-002"/></phrase>
    <phrase text="FIX the inverted orange signal: always-on orange on All BROADN Samples default button"><addressed task="broadn-p10-design-implementation-UI-002"/></phrase>
    <phrase text="global-view h3 section titles must NOT read as filter active"><addressed task="broadn-p10-design-implementation-UI-002"/></phrase>
    <phrase text="Global Chart.js defaults -> Inter font (Chart.defaults.font.family)"><addressed task="broadn-p10-design-implementation-UI-002"/></phrase>
    <phrase text="Pipeline-bar contrast — pale Sequenced bar (#4ade80) darken/replace"><addressed task="broadn-p10-design-implementation-UI-002"/></phrase>
    <phrase text="Hero-chip radius — rectangular hero chips -> rounded"><addressed task="broadn-p10-design-implementation-UI-002"/></phrase>
    <phrase text="single-source-of-truth / DRY (one palette, one token)"><addressed task="broadn-p10-design-implementation-UI-002"/></phrase>
    <phrase text="charts must stay colorblind-safe (Okabe-Ito)"><addressed task="broadn-p10-design-implementation-AUD-001"/></phrase>
    <phrase text="teal must meet WCAG AA contrast for text uses"><addressed task="broadn-p10-design-implementation-UI-002"/></phrase> <!-- now bound on FE (sub-deliverable H) + verified AUD -->
    <phrase text="auditor will screenshot-verify against the live render"><addressed task="broadn-p10-design-implementation-AUD-001"/></phrase>
  </verbatim_deliverable_audit>

  <routing_notes>
    <!-- REVISION 2 resolves CRITIQUE_BLOCK (CR-1782418873). All three items addressed against verified code:
         BLOCKER (SC1 unsatisfiable): the two residual #166534 sites — PG_SAMPLER_FILL 'SASS' (:3018) and the
           PG_TYPE_FILL fallback (:2981) — are now IN SCOPE. UI-001 deliverable 6b specifies a v2 instrument
           anchor (non-Okabe, non-brand-teal); the fallback migrates to SAMPLE_TYPE_COLORS['Unknown']. SC1
           grep '#166534'==0 across all three files is now satisfiable (all 13 app.js hits enumerated).
         WARNING 1 (legend under-enumeration): UI-002 C2/C3/C4 now enumerate ALL FOUR entries in BOTH
           PG_TYPE_COLOR and PG_TYPE_FILL, the :2981 fallback, AND the static index.html legend (~300-303),
           sourcing every one from SAMPLE_TYPE_COLORS. SC3 greps the absence of every legacy hex/class
           (#0ea5e9==0, #059669==0, bg-sky/emerald/amber/cyan==0 in both files) and the #22d3ee==1 invariant.
         WARNING 2 (bright-teal): new UI-002 sub-deliverable H + SC9 BIND the deep-teal-text rule on FE;
           AUD-001 verifies the binding on code, not only on render. -->

    <!-- Recurring-pattern preflight (step 0.5). docs/after-actions/ empty for this project. Watch-items from
         the brief, with handling: OVERSCOPE -> only the 7 ratified items; 6 extra dossier proposals deferred.
         SCOPE_DRIFT -> every packet has an out_of_scope block; the two high-risk drift traps (slice-panel h3s
         410-504; BioSpot #22d3ee instrument color) are pinned with line refs. DRY -> first-class SCs (UI-002
         SC3 + SC4), re-checked by the auditor SA gate. -->

    <!-- DRY acknowledgement (explicit): ONE SAMPLE_TYPE_COLORS object keyed by category NAME now feeds the
         three arrays, BOTH PG legend maps, the :2981 fallback, AND the static index.html legend — a true single
         source. ONE --color-filter-accent (#c2410c) replaces the four ad-hoc oranges where they signal a filter. -->

    <!-- DESIGN.md PRESENT at repo root (v1.0.0). UI-001 sets design_system_source = DESIGN_MD; FE consumes the
         v2 migration table. Memory project_broadn_teal_rebrand already overrides v1 at runtime; this sprint lands v2. -->

    <!-- Locked-value self-lint (steps 7.5/7.8): sc-locked-value-consistency skill absent in this config-only
         repo; manual lint performed against verified counts. Every grep SC is satisfiable: #166534==0 (all 13
         enumerated + 2 residuals brought in scope); #22d3ee==1 (NOT 0 — the BioSpot instrument is out of scope,
         asserting 0 would be the unsatisfiable trap); #0ea5e9/#059669==0 (confirmed each appears once, in
         PG_TYPE_FILL); bg-class==0 in both files (confirmed unique to the two legends). SC6 greps the full
         'Chart.defaults.font.family' string (no interface-decl collision in vanilla JS). No unsatisfiable
         locked-line SC remains. -->

    <!-- Fixture: assets/broadn-logo.webp confirmed present (item #2). -->

    <!-- Critics/gates to probe: (1) confirm UI-001 migration table is derived from an actual grep sweep and
         covers all 13 #166534 hits + the instrument anchor; (2) bright-teal WCAG text binding (R1); (3) FE kept
         whole rather than split (shared-file rationale). No human confirmation needed pre-dispatch (ratified
         decisions). No git push (human-owned). -->
  </routing_notes>

  <risk_flags>
    <flag>bright-teal #0c9cb4 fails normal-text WCAG AA (~3:1). Now BOUND on FE (UI-002 sub-deliverable H + SC9): link/active text uses deep teal #0c5454; bright teal restricted to underline/border/large-text/non-text. AUD-001 verifies the binding. (R1, highest.)</flag>
    <flag>green-retirement is broader than the 7 enumerated items (heat ramp, KPI halos, hero green-900, slicePipeline[0], sliceTimeOfDay[0], the SASS instrument anchor). UI-001 migration table derived from a literal `grep -n '#166534'` sweep must enumerate all; hard SC is #166534==0 across all three files. (R2.)</flag>
    <flag>Okabe Plant #009E73 is hue-adjacent to brand teal — UI-001 should confirm no brand/data confusion where teal halos sit near the Plant data color; AUD-001 screenshot sanity-check. (R3.)</flag>
    <flag>Deferred (NOT this sprint): card shadows, map base-tile swap, empty states, log-scale disclosure, temporal tick density, marker halo. Recorded so they are not silently dropped; out-of-scope for all three packets. (R4.)</flag>
    <flag>The project_group / concurrent-timeline legend is DORMANT (empty data) — it cannot be screenshot-verified. Its migration is guarded ONLY by grep (UI-002 SC3); AUD-001 must confirm via grep, not render. (R5 — new in rev2; directly from CR WARNING 1.)</flag>
    <flag>No test runner — QA is screenshot-based; AUD-001 depends on live render at :8771 (Playwright reported fixed; http.server fallback documented in task spec). (R6.)</flag>
  </risk_flags>

</task_decomposition>

<expectation_manifest>
  <sprint_id>broadn-p10-design-implementation</sprint_id>
  <generated>2026-06-25T00:00:00Z</generated>
  <revision>2</revision>
  <assignments>
    <assignment>
      <task_id>broadn-p10-design-implementation-UI-001</task_id>
      <agent>UI#1</agent>
      <expected_tag>design_spec</expected_tag>
      <expected_file>.claude/tasks/outputs/broadn-p10-design-implementation-UI-001-UI-*.md</expected_file>
      <blocks>broadn-p10-design-implementation-UI-002</blocks>
      <receipt_check>
        <item>DESIGN.md frontmatter Version: 2.0.0 / Updated: 2026-06-25</item>
        <item>teal Constitution rule + "OVERRIDES v1.0.0" note; #166534 absent from Constitution/Color-Tokens</item>
        <item>SAMPLE_TYPE_COLORS five-pair Okabe map keyed by name</item>
        <item>--color-filter-accent #c2410c with four-orange collapse + #b45309 split</item>
        <item>pipeline 3-stage palette replacing #4ade80 with ratios</item>
        <item>sampler-instrument anchor replacement for #166534 (non-Okabe, non-brand-teal)</item>
        <item>COMPLETE migration table covering all 13 #166534 sites (incl. :2981, :3018), PG maps, static HTML legend</item>
        <item>WCAG note restricting bright-teal #0c9cb4 normal-text use</item>
        <item>git diff touches DESIGN.md ONLY</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>broadn-p10-design-implementation-UI-002</task_id>
      <agent>FE#1</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/broadn-p10-design-implementation-UI-002-FE-*.md</expected_file>
      <blocks>broadn-p10-design-implementation-AUD-001</blocks>
      <receipt_check>
        <item>grep '#166534' == 0 across all three files (incl. :2981 fallback + :3018 SASS); #0c5454 present; no green-700/800/900 Tailwind in index.html</item>
        <item>broadn-logo.webp in nav + hero with alt + aria-label; &#10044; removed</item>
        <item>ONE SAMPLE_TYPE_COLORS; PG_TYPE_COLOR + PG_TYPE_FILL + :2981 fallback + static HTML legend all source from it; #0ea5e9==0, #059669==0, bg-classes==0 in both files; #22d3ee==1 (BioSpot, expected)</item>
        <item>--color-filter-accent #c2410c wired; #ea6c00==0; no orphan orange tokens; --color-warning unchanged</item>
        <item>global h3s 669/674 neutralized; slice-panel h3s 410-504 unchanged; default "All" button de-oranged</item>
        <item>Chart.defaults.font.family Inter before first new Chart(); #4ade80==0; hero chips rounded</item>
        <item>bright-teal text restriction applied (deep teal for link/active text; #0c9cb4 not on normal-size text)</item>
        <item>packet states the change was viewed on the live render</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>broadn-p10-design-implementation-AUD-001</task_id>
      <agent>AUD#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/broadn-p10-design-implementation-AUD-001-AUD-*.md</expected_file>
      <blocks>NONE</blocks>
      <receipt_check>
        <item>SA + QA + SX verdicts each present (PASS/FAIL)</item>
        <item>screenshot evidence for teal brand + single-palette + signal-fix; grep evidence for dormant PG legend + #166534==0 + #22d3ee==1</item>
        <item>findings #1 and #7 confirmed resolved</item>
        <item>bright-teal text binding (R1) verified on FE code; no FAILs against deferred surfaces or BioSpot instrument color</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>
