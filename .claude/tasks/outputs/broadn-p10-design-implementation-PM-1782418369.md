<task_decomposition task_id="broadn-p10-design-implementation" agent_count="3">

<!--
  PM preflight notes (grounded in reads, not assumption):
  - DESIGN.md exists at repo root (v1.0.0). UI task must edit it to v2 and set
    design_system_source = DESIGN_MD. Per memory project_broadn_teal_rebrand, the teal
    anchor already OVERRIDES v1's green Constitution at runtime; this sprint lands v2.
  - Fixture verified on disk: assets/broadn-logo.webp PRESENT (item #2 input confirmed).
  - sc-locked-value-consistency skill is NOT present in this config-only repo, so the
    mandated SC-precheck script could not be run. Manual locked-value self-lint performed
    (see routing_notes "locked-value self-lint").
  - Exact current state confirmed by grep (line refs embedded in packets below):
      assets/app.js:34  pipeline ['#166534','#16a34a','#4ade80']  (item #6 target = [2] #4ade80)
      assets/app.js:35  sampleTypes  | :41 sliceSampleTypes | :55 samplerType  (item #3 arrays)
      assets/app.js:2793/2796 inline bg-class map (Air bg-sky-500 / Liquid bg-cyan-400)  (item #3 legend)
      assets/app.js:2870/2872/2873 inline hex map (Air #0ea5e9 / Soil #b45309 / Liquid #22d3ee)  (item #3 legend)
      assets/app.js:53 orangeAccent #ea6c00 | :3997 btnAll bg-orange-50 text-orange-700 (item #4)
      assets/styles.css:11-13 --color-orange-500 #ea6c00 / --color-orange-700 #b33a00  (item #4)
      assets/styles.css:65 .slice-chart-title-active { color: var(--color-orange-700) }  (item #4)
      index.html:24  &#10044; BROADN nav brand mark (item #2)  | :46 hero-samples chip no rounded (item #7)
      index.html:669/674 GLOBAL-view h3s "Sampler Replicate Tags (All)" / "Sampler Type Distribution (All)"
                  carry slice-chart-title-active unconditionally (item #4 inverted-signal fix target)
      index.html:410/415/459/464/499/504 slice-PANEL h3s also carry slice-chart-title-active —
                  these render ONLY when a slice IS active, so they are LEGITIMATE → OUT OF SCOPE, do not touch.
      assets/app.js:3020 'BioSpot VIVAS' #22d3ee is a SAMPLER-INSTRUMENT color map (different categorical
                  dimension), NOT a sample-type encoding → OUT OF SCOPE of item #3.
-->

  <task_packets>

    <task_packet>
      <task_id>broadn-p10-design-implementation-UI-001</task_id>
      <assigned_to>ui-designer</assigned_to>
      <priority>BLOCKER</priority>
      <description>
Author DESIGN.md v2 — the design-system source of truth FE consumes in UI-002. This is item #1
of the human request PLUS the authoritative token decisions that disambiguate items #3, #4, and #6
so FE has zero latitude. All brand decisions are RATIFIED (deep teal #0c5454, bright teal #0c9cb4,
Okabe-Ito data palette, single filter-accent) — do NOT re-open or propose alternatives. Your job is
to encode them into DESIGN.md v2 and produce a precise migration table.

Deliverables in DESIGN.md (edit the file in place):
1. CONSTITUTION: replace the rule "CSU Green is the brand anchor: #166534" with "BROADN teal is the
   brand anchor: deep teal #0c5454 (nav active, headings, primary buttons, hero, icon halos);
   bright teal #0c9cb4 (active/accent/links/underlines)." Retire CSU green #166534 from the UI.
   Add an explicit note: "This OVERRIDES v1.0.0's 'CSU Green is the brand anchor' rule."
2. FRONTMATTER: bump `Version: 1.0.0` → `2.0.0` (MAJOR — a Constitution rule is overridden) and
   update the `Updated:` date to 2026-06-25.
3. COLOR TOKENS table: re-point the brand tokens to teal. At minimum define/replace:
   --color-primary (deep teal #0c5454), --color-primary-dark (hero/pressed — a darker teal you
   specify), --color-primary-light (a light teal tint for KPI icon-halo backgrounds, replacing
   green-100), --color-accent / link / active (bright teal #0c9cb4). Keep the SAME token NAMES
   where they exist so FE re-points values, not names.
4. SAMPLE-TYPE DATA PALETTE (single source of truth, keyed by category NAME, NOT array index):
   document the canonical Okabe-Ito map exactly as below and name it SAMPLE_TYPE_COLORS:
     Air     #0072B2   (Okabe-Ito blue)
     Plant   #009E73   (Okabe-Ito teal-green)
     Soil    #E69F00   (Okabe-Ito amber)
     Liquid  #56B4E9   (Okabe-Ito sky)
     Unknown #999999   (neutral)
   State explicitly: brand teal (#0c5454/#0c9cb4) is NOT a member of this data palette (brand != data).
5. SINGLE FILTER-ACCENT TOKEN: set --color-filter-accent = #c2410c (orange-700, Tailwind-CDN
   resolution) as the ONE orange. Document that the four current oranges collapse to it where they
   act as a FILTER SIGNAL, and explicitly classify the non-filter oranges so FE does not over-replace:
     - #ea6c00 (CHART_COLORS.orangeAccent, bar-highlight) -> #c2410c
     - #b33a00 (--color-orange-700, the always-on h3 title color) -> remove from the GLOBAL h3s
       (item #4 signal fix); token deleted/consolidated to --color-filter-accent
     - #c2410c (Tailwind text-orange-700) -> already the canonical value; keep
     - #b45309 (amber-700): state its disposition — where it is the Soil DATA color it is replaced by
       Okabe #E69F00 (item #3); where it is --color-warning it STAYS as the warning semantic (NOT an
       orange-filter signal). Make this split unambiguous.
6. PIPELINE STAGE COLORS (item #6 decision): specify the replacement for the pale Sequenced bar
   (#4ade80 green-400, ~1.7:1 on white — fails). Provide a 3-stage pipeline palette where EVERY step
   meets >= 3:1 non-text contrast on white. Since CSU green is retiring, also assign the other two
   pipeline steps (#166534, #16a34a) their v2 values. You may use the RA/UI-dossier navy ramp
   (#1e3a5f / #2b6c8a / #4db6c4) or a teal-consistent ramp — your call, but document the exact hexes
   and their contrast ratios.
7. MIGRATION TABLE (the FE checklist — REQUIRED): a table that enumerates EVERY current
   green-brand and orange hex/Tailwind-class occurrence in scope and its v2 replacement. Source the
   occurrences from the line refs in the PM packet header and your own read of the three files. Cover
   at minimum: #166534 (all sites incl. CHART_COLORS.line/temporalBar/siteBar/pointBg/mapMarkerFill,
   sliceHeatRamp, nav-active, KPI halo green-800), #14532d green-900 (hero / map marker border),
   #15803d green-700, Tailwind classes bg-green-900/bg-green-800/text-green-800/border-green-800/
   green-100 halos, and the four oranges. For each: current value -> v2 value -> which file(s)/line(s).
8. WCAG NOTE (A11Y, mandatory): bright teal #0c9cb4 on white is ~3:1 — it PASSES non-text and
   large-text AA but FAILS normal-text AA (needs 4.5:1). State the rule explicitly: bright teal may be
   used for underlines/borders/active-accent/large text and on dark backgrounds, but normal-size link
   or active TEXT on white must use deep teal #0c5454 (~9:1, AA). FE and AUD enforce this.

Set the design_system_source to DESIGN_MD and trace every token to a named DESIGN.md entry.
      </description>
      <success_criteria>
1. DESIGN.md frontmatter reads `Version: 2.0.0` and `Updated: 2026-06-25`
   (grep -E '^&gt; Version: 2\.0\.0' DESIGN.md returns a match).
2. The Constitution no longer contains "CSU Green is the brand anchor"; it contains a "BROADN teal"
   brand-anchor rule naming both #0c5454 and #0c9cb4, plus the literal string "OVERRIDES" referencing
   v1.0.0 (grep -c '#166534' on the Constitution + Color-Tokens sections returns 0).
3. DESIGN.md documents SAMPLE_TYPE_COLORS keyed by name with EXACTLY these five pairs:
   Air #0072B2, Plant #009E73, Soil #E69F00, Liquid #56B4E9, Unknown #999999 (all five hexes present).
4. DESIGN.md sets --color-filter-accent to #c2410c and documents the four-orange -> one-token
   collapse plus the #b45309 warning-vs-data split.
5. DESIGN.md specifies a 3-stage pipeline palette with no step pale enough to fail 3:1 on white,
   and the value replacing #4ade80 is stated with its contrast ratio.
6. A MIGRATION TABLE section exists enumerating every in-scope green/orange occurrence -> v2
   replacement with file/line references (the FE checklist).
7. A WCAG note states bright teal #0c9cb4 is normal-text-AA-failing and restricts its text use.
8. The DESIGN.md edit is a v2 SPEC only — no edits to index.html, assets/app.js, or assets/styles.css
   in this task (git diff touches DESIGN.md exclusively).
      </success_criteria>
      <context_files>
DESIGN.md (the file to edit; v1.0.0 currently)
.claude/tasks/outputs/broadn-p10-design-language-UI-20260625.md (ratified token/palette guidance — Parts 4 & 5)
.claude/tasks/outputs/broadn-p10-design-language-RA-20260625.md (external best-practice validation for Okabe-Ito / pipeline convention)
.claude/tasks/outputs/broadn-p10-filtered-state-confirm-20260625.md (exact current divergent hexes for the three sample-type encodings and the four oranges)
.claude/tasks/broadn-p10-design-language.md (ratified Decisions section)
assets/app.js (read CHART_COLORS lines 27-56 and the inline maps near 2790/2870 to build the migration table)
assets/styles.css (read the :root token block lines 4-14 for the orange tokens)
index.html (read nav line 24, hero line 46, h3s 669/674 for migration-table line refs)
      </context_files>
      <dependencies>NONE</dependencies>
      <out_of_scope>
- Do NOT edit index.html, assets/app.js, or assets/styles.css — those are UI-002 (FE). This task only
  authors the DESIGN.md v2 spec + migration table.
- Do NOT re-open the brand decision or propose color alternatives — deep teal #0c5454, bright teal
  #0c9cb4, Okabe-Ito data palette, and #c2410c filter-accent are RATIFIED.
- Do NOT add new design-system scope the human did not request: card depth/shadow, CartoDB map base
  tile, empty-state pattern, log-scale axis disclosure, temporal tick density, sampler-instrument
  color map. Those are explicitly deferred (see risk_flags) — keep v2 to the 7 ratified items.
- Do NOT rename existing token keys; re-point their VALUES so FE performs a value swap.
      </out_of_scope>
      <output_expected>
        <tag>design_spec</tag>
        <must_contain>
          <item>DESIGN.md frontmatter Version: 2.0.0</item>
          <item>BROADN-teal Constitution rule with #0c5454 + #0c9cb4 and the "OVERRIDES v1.0.0" note</item>
          <item>SAMPLE_TYPE_COLORS five-pair Okabe-Ito map keyed by category name</item>
          <item>--color-filter-accent = #c2410c with the four-orange collapse documented</item>
          <item>pipeline 3-stage palette replacing #4ade80 with contrast ratios</item>
          <item>MIGRATION TABLE mapping every in-scope green/orange occurrence to its v2 value with line refs</item>
          <item>WCAG note restricting bright-teal #0c9cb4 normal-text use</item>
        </must_contain>
        <must_not_contain>
          <item>any edit to index.html / assets/app.js / assets/styles.css</item>
          <item>#166534 (or "CSU Green is the brand anchor") surviving in the Constitution/Color-Tokens sections</item>
          <item>brand teal (#0c5454/#0c9cb4) listed as a member of the sample-type DATA palette</item>
          <item>newly-introduced scope: card shadows, map tiles, empty states, log-scale labels</item>
        </must_not_contain>
        <success_signal>DESIGN.md git diff shows Version 2.0.0, teal Constitution, SAMPLE_TYPE_COLORS, single filter-accent, pipeline palette, migration table, and WCAG note — and touches no other file.</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>broadn-p10-design-implementation-UI-002</task_id>
      <assigned_to>frontend</assigned_to>
      <priority>HIGH</priority>
      <description>
Implement the teal rebrand + the six design-language fixes across the three static dashboard files
(index.html, assets/app.js, assets/styles.css), executing the DESIGN.md v2 MIGRATION TABLE produced
in UI-001 as your authoritative checklist. This is a no-build static dashboard — verify by serving
statically (python3 -m http.server 8771 already running -> http://localhost:8771/index.html). No
package.json / test / lint. Vanilla JS, Tailwind CDN, Chart.js, Leaflet.

Implement these seven sub-deliverables (A-G). Each maps to a numbered human-request item.

A. TEAL REBRAND (human item #1 code-side; execute the v2 migration table).
   Replace every in-scope CSU-green occurrence with its v2 teal value per the migration table:
   - styles.css: --color-green-800 (#166534) and the .nav-link.active color -> deep teal #0c5454.
   - index.html: nav brand wordmark, hero bg-green-900, hero chips bg-green-800, nav-active
     border-green-800/text-green-800, KPI green-100/green-800 icon halos -> teal equivalents per v2.
   - app.js CHART_COLORS single-series BRAND values (line/lineArea/temporalBar/siteBar/pointBg/
     mapMarkerFill/mapMarkerBorder and the sliceHeatRamp green steps) -> their v2 teal values.
   Brand teal must NOT enter the sample-type data palette (that is sub-deliverable C).

B. LOGO (human item #2).
   Wire assets/broadn-logo.webp into (1) the nav brand mark (index.html:24, replacing the
   `&#10044;` / &amp;#10044; asterism) and (2) the hero. Use a real `<img>` with src="assets/broadn-logo.webp",
   a descriptive alt (e.g. alt="BROADN logo"), and an aria-label on the brand link/container. Remove
   the &#10044; glyph. Keep the "BROADN" wordmark text.

C. SINGLE OKABE-ITO SAMPLE-TYPE PALETTE (human item #3).
   Introduce ONE object SAMPLE_TYPE_COLORS keyed by category NAME with exactly:
     Air #0072B2, Plant #009E73, Soil #E69F00, Liquid #56B4E9, Unknown #999999.
   Replace ALL THREE divergent arrays — CHART_COLORS.sampleTypes (app.js:35),
   CHART_COLORS.sliceSampleTypes (app.js:41), CHART_COLORS.samplerType (app.js:55) — so every
   sample-type chart reads its color from SAMPLE_TYPE_COLORS by category name (NOT by array index).
   ALSO replace the inline concurrent-timeline legend maps: the bg-class map at app.js:2793/2796
   (Air 'bg-sky-500', Liquid 'bg-cyan-400') and the hex map at app.js:2870/2872/2873
   (Air '#0ea5e9', Soil '#b45309', Liquid '#22d3ee') so they too resolve through SAMPLE_TYPE_COLORS.
   DRY is the crux: after this change there must be exactly ONE place that assigns colors to the five
   sample-type category names.

D. ORANGE CONSOLIDATION + INVERTED-SIGNAL FIX (human item #4).
   D1 (one token): wire --color-filter-accent = #c2410c in styles.css and route the filter-signal
   oranges through it. Update CHART_COLORS.orangeAccent (app.js:53) #ea6c00 -> #c2410c. Consolidate
   the styles.css orange tokens (--color-orange-500 #ea6c00, --color-orange-700 #b33a00 at lines
   11-13) to the single --color-filter-accent per v2 (do not leave parallel unused orange tokens).
   Leave --color-warning #b45309 as the warning semantic per v2 (it is NOT a filter signal).
   D2 (fix inverted signal): the GLOBAL-view h3s at index.html:669 ("Sampler Replicate Tags (All)")
   and :674 ("Sampler Type Distribution (All)") must NOT read as filter-active — change them from
   .slice-chart-title-active to the neutral chart-title color (text-stone-800). The "All BROADN
   Samples" DEFAULT sidebar button (app.js:3997, bg-orange-50 text-orange-700) must NOT be orange in
   its default/unfiltered state — make it the teal-active/neutral treatment per v2 (orange appears
   only when a sub-filter is engaged).

E. CHART.JS INTER DEFAULT (human item #5).
   Set Chart.defaults.font.family to the Inter stack
   ('"Inter", system-ui, -apple-system, Helvetica, Arial, sans-serif') once, near the top of app.js
   BEFORE any chart is instantiated, so every Chart.js label/tick/legend/axis renders in Inter.

F. PIPELINE-BAR CONTRAST (human item #6).
   Replace the pale Sequenced bar — CHART_COLORS.pipeline[2] #4ade80 (app.js:34) — with the v2
   pipeline value (>= 3:1 non-text contrast on white), and set the other two pipeline steps to their
   v2 values per the migration table.

G. HERO-CHIP RADIUS (human item #7).
   Add `rounded` to the rectangular hero stat chips (the `#hero-samples` chip at index.html:46 and
   its sibling hero chips) so they match the design system's rounded vocabulary.
      </description>
      <success_criteria>
Mechanical (run from repo root):
1. (A teal) `grep -c '#166534' index.html assets/app.js assets/styles.css` returns 0 across all three
   files. Deep teal present: `grep -rc '#0c5454' index.html assets/app.js assets/styles.css` >= 1.
   No brand-green Tailwind classes remain: `grep -E 'green-(700|800|900)' index.html` returns 0.
2. (B logo) `grep -c 'broadn-logo.webp' index.html` >= 2 (nav + hero); each `<img>` has an `alt`
   attribute; the brand container has an `aria-label`; `grep -c '&#10044;' index.html` returns 0.
3. (C palette DRY) A single `SAMPLE_TYPE_COLORS` object exists keyed by category name containing
   exactly #0072B2/#009E73/#E69F00/#56B4E9/#999999. The identifiers `sliceSampleTypes` and
   `samplerType` no longer exist as separate divergent arrays
   (`grep -c 'sliceSampleTypes\|samplerType' assets/app.js` resolves to references of the unified
   source, not standalone hex arrays). Timeline legend: `grep -c 'bg-sky-500\|bg-cyan-400' assets/app.js`
   returns 0 and `grep -c '#0ea5e9' assets/app.js` returns 0. (Note: `#22d3ee` may remain exactly ONCE
   at app.js:3020 — the BioSpot VIVAS sampler-INSTRUMENT map, which is OUT OF SCOPE; `grep -c '#22d3ee'`
   should equal 1, not 0.)
4. (D1 orange) `grep -c '#ea6c00' index.html assets/app.js assets/styles.css` returns 0;
   `--color-filter-accent: #c2410c` is present and wired in styles.css; no orphan --color-orange-500/
   --color-orange-700 tokens remain unused.
5. (D2 signal) index.html lines 669 and 674 no longer carry `slice-chart-title-active`
   (they use a neutral stone title color); the slice-PANEL h3s at 410/415/459/464/499/504 are
   UNCHANGED. The "All BROADN Samples" default button (app.js:3997) no longer uses bg-orange-50/
   text-orange-700 in its default state.
6. (E Inter) `grep -c 'Chart.defaults.font.family' assets/app.js` >= 1 and the assigned value contains
   "Inter"; the assignment precedes the first `new Chart(`.
7. (F pipeline) CHART_COLORS.pipeline no longer contains `#4ade80`
   (`grep -c '#4ade80' assets/app.js` returns 0); the replacement step's hex matches the v2 spec.
8. (G hero) the hero stat chips include a `rounded` class
   (`grep -c 'rounded' ` on the hero-chip lines returns a match; #hero-samples chip is rounded).
Visual (live render at http://localhost:8771/index.html, for AUD-001 to confirm):
9. Nav/headings/hero render deep teal; active/links render teal accent; no green brand surface remains.
10. The same sample-type category is the SAME Okabe-Ito color in the global donut, slice donut, and
    timeline legend. Sequenced pipeline bar is legible. Charts render in Inter. Hero chips are rounded.
      </success_criteria>
      <context_files>
DESIGN.md (v2 — produced by UI-001; the migration table is your authoritative checklist)
.claude/tasks/outputs/broadn-p10-design-language-UI-20260625.md (Part 4C global Chart.defaults block; Part 7 WCAG table)
index.html (nav:24, hero:46, global h3s:669/674; slice-panel h3s 410-504 OUT OF SCOPE)
assets/app.js (CHART_COLORS 27-56; inline legend maps 2790-2873; btnAll 3997; orangeAccent uses 1381/1390)
assets/styles.css (:root orange tokens 11-13; .slice-chart-title-active 65; .nav-link.active 22-27)
assets/broadn-logo.webp (the logo asset to wire — confirmed present on disk)
      </context_files>
      <dependencies>broadn-p10-design-implementation-UI-001</dependencies>
      <estimated_new_lines>
~40-70 net new lines. This is REPLACEMENT-heavy (re-pointing hex values, swapping Tailwind classes,
re-keying three arrays into one map), not net-new feature code. Kept as ONE task deliberately: the
three files are a single coupled token system and the DRY requirement (one sample-type palette, one
filter-accent token) is actively HARMED by splitting — concurrent edits to the shared app.js/index.html
would race (shared-file hazard) and a CSS-token change must be coordinated with its app.js consumer in
the same pass. A by-concern split would also risk the single-source-of-truth goal. Justification to keep
whole accepted per the >100-line split rule (this is well under 100 net new lines regardless).
      </estimated_new_lines>
      <out_of_scope>
- Do NOT touch the slice-PANEL h3s at index.html 410/415/459/464/499/504 — they render only when a
  slice IS active and are a LEGITIMATE orange filter signal. Only the GLOBAL-view h3s at 669/674 change.
- Do NOT recolor the SAMPLER-INSTRUMENT map at app.js:3020 (e.g. 'BioSpot VIVAS' #22d3ee). It is a
  different categorical dimension (instrument names), not a sample-type encoding. Item #3 is sample-type only.
- Do NOT leave --color-warning (#b45309) changed; it is the warning semantic, not an orange-filter signal.
- Do NOT add scope beyond the 7 ratified items: NO card depth/shadow restoration, NO CartoDB/ESRI map
  base-tile swap, NO empty-state redesign, NO log-scale axis disclosure, NO temporal tick-density change,
  NO map marker opacity/halo change. These are deferred (risk_flags) — adding them is SCOPE_DRIFT.
- Do NOT re-litigate colors; consume DESIGN.md v2 values verbatim.
- Do NOT introduce a framework or build step; vanilla static dashboard stays vanilla.
- Do NOT run `git push` (human-owned); commit only.
      </out_of_scope>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>SAMPLE_TYPE_COLORS single object keyed by category name with the five Okabe-Ito hexes</item>
          <item>Chart.defaults.font.family set to the Inter stack before first new Chart()</item>
          <item>--color-filter-accent #c2410c wired; orangeAccent -> #c2410c</item>
          <item>broadn-logo.webp wired into nav + hero with alt + aria-label; &#10044; removed</item>
          <item>global h3s 669/674 neutralized; "All BROADN Samples" default button de-oranged</item>
          <item>pipeline Sequenced step no longer #4ade80; hero chips rounded</item>
          <item>confirmation that the change was viewed on the live render (serve + screenshot)</item>
        </must_contain>
        <must_not_contain>
          <item>any surviving #166534 brand green or green-700/800/900 Tailwind brand class</item>
          <item>parallel/duplicate sample-type color arrays (sliceSampleTypes/samplerType as separate hex arrays)</item>
          <item>parallel orange tokens (#ea6c00, #b33a00) acting as filter signals</item>
          <item>edits to slice-panel h3s 410-504, the BioSpot VIVAS instrument map, --color-warning, or any deferred out-of-scope surface</item>
        </must_not_contain>
        <success_signal>Live render at :8771 shows teal brand, one Okabe-Ito sample-type palette across all three views, legible Sequenced bar, Inter charts, rounded hero chips, logo in nav+hero; the eight mechanical greps above pass.</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>broadn-p10-design-implementation-AUD-001</task_id>
      <assigned_to>auditor</assigned_to>
      <priority>HIGH</priority>
      <description>
Three-gate audit (SA standards -> QA functionality -> SX security) of the v2 design implementation,
with a screenshot-verification pass against the LIVE render (Playwright is fixed this session per the
task spec; http://localhost:8771/index.html is served). This is a static dashboard, so QA is
visual/behavioral, not unit tests.

Verify, against DESIGN.md v2 and the live render:
- SA: DESIGN.md v2 frontmatter is 2.0.0 with the teal Constitution + override note; FE code matches
  the v2 migration table; DRY honored (ONE SAMPLE_TYPE_COLORS map, ONE --color-filter-accent token);
  no parallel sample-type arrays or orphan orange tokens remain; naming/standards conventions kept.
- QA (screenshot): on the live render confirm (1) deep teal nav/headings/hero, bright-teal accents,
  no CSU-green brand surface; (2) the SAME sample-type category renders the SAME Okabe-Ito color in
  the global donut, slice donut, AND the concurrent-timeline legend (the item #3 single-palette proof
  — capture a filtered slice view to compare); (3) the Sequenced pipeline bar is legible on white;
  (4) chart tick/legend/axis text renders in Inter, not system sans; (5) hero chips are rounded;
  (6) the logo image renders in nav + hero; (7) the global-view h3s and the default "All BROADN
  Samples" button are NOT orange when no filter is set, and orange returns only when a sub-filter is
  engaged (inverted-signal fix).
- A11Y/SX: logo `<img>` has alt + aria-label; bright teal #0c9cb4 is not used for normal-size text on
  white (deep teal used for link/active text per the v2 WCAG note); sample-type palette remains
  colorblind-safe (Okabe-Ito); no hardcoded secrets / no injection surface introduced (static files).
Capture screenshots to .claude/tasks/outputs/ as evidence. Return PASS only if all gates pass;
on any FAIL, return a single specific remediation per gap to route back to FE (UI-002).
      </description>
      <success_criteria>
SA + QA + SX all PASS. Screenshot evidence saved showing: teal brand, single Okabe-Ito sample-type
palette consistent across global donut / slice donut / timeline legend, legible Sequenced bar, Inter
chart text, rounded hero chips, rendered logo, and correct (non-inverted) orange filter signal.
Any FAIL is reported with one specific, actionable remediation request per gap.
      </success_criteria>
      <context_files>
DESIGN.md (v2 — the spec to audit against)
.claude/tasks/outputs/broadn-p10-design-language-UI-20260625.md (Part 7 WCAG contrast reference table)
.claude/tasks/outputs/broadn-p10-filtered-state-confirm-20260625.md (the BEFORE state for the two confirmed findings — verify they are resolved)
index.html, assets/app.js, assets/styles.css (the implemented files)
http://localhost:8771/index.html (live render for screenshot verification)
      </context_files>
      <dependencies>broadn-p10-design-implementation-UI-002</dependencies>
      <out_of_scope>
- Do NOT audit deferred items (card depth, map base tile, empty states, log-scale disclosure) — they
  are not in this sprint's scope; flagging them as defects would be a false FAIL.
- Do NOT treat the single remaining #22d3ee at app.js:3020 (BioSpot VIVAS instrument map) as a sample-
  type-palette violation — it is out of scope.
- Do NOT modify code; the auditor verifies and reports, it does not implement.
      </out_of_scope>
      <output_expected>
        <tag>completion_packet</tag>
        <must_contain>
          <item>SA/QA/SX gate verdicts (each PASS or FAIL)</item>
          <item>screenshot evidence paths in .claude/tasks/outputs/ for the teal brand + single-palette + signal-fix proofs</item>
          <item>explicit confirmation that findings #1 (color anarchy) and #7 (four oranges) are resolved</item>
        </must_contain>
        <must_not_contain>
          <item>FAILs raised against deferred out-of-scope surfaces</item>
        </must_not_contain>
        <success_signal>All three gates PASS with screenshot evidence; or a FAIL with a single specific remediation per gap routed back to UI-002.</success_signal>
      </output_expected>
    </task_packet>

  </task_packets>

  <dependency_order>
    broadn-p10-design-implementation-UI-001 (ui-designer: DESIGN.md v2 + migration table)
      -> broadn-p10-design-implementation-UI-002 (frontend: implement all code vs v2)
      -> broadn-p10-design-implementation-AUD-001 (auditor: SA/QA/SX + screenshot verify)
    Strictly sequential. UI-001 is a BLOCKER: FE has no authoritative migration table / pipeline-color /
    orange-disposition decision until v2 lands. No parallelism (single coupled file set).
  </dependency_order>

  <verbatim_deliverable_audit>
    <phrase text="Implement the BROADN teal rebrand">
      <addressed task="broadn-p10-design-implementation-UI-002"/> <!-- sub-deliverable A -->
    </phrase>
    <phrase text="design-language fixes settled in the P10 evaluation">
      <addressed task="broadn-p10-design-implementation-UI-002"/>
    </phrase>
    <phrase text="SHIPS CODE through the full pipeline">
      <addressed task="broadn-p10-design-implementation-AUD-001"/> <!-- audit gate = pipeline -->
    </phrase>
    <phrase text="DESIGN.md v2 update the Constitution + Color Tokens">
      <addressed task="broadn-p10-design-implementation-UI-001"/>
    </phrase>
    <phrase text="brand anchor = BROADN teal (deep #0c5454 nav/headings/primary)">
      <addressed task="broadn-p10-design-implementation-UI-001"/>
    </phrase>
    <phrase text="bright #0c9cb4 active/accent/links">
      <addressed task="broadn-p10-design-implementation-UI-001"/>
    </phrase>
    <phrase text="Retire CSU green #166534 from the UI">
      <addressed task="broadn-p10-design-implementation-UI-002"/> <!-- A, with v2 mapping from UI-001 -->
    </phrase>
    <phrase text="Bump the frontmatter version">
      <addressed task="broadn-p10-design-implementation-UI-001"/>
    </phrase>
    <phrase text="record that this OVERRIDES v1.0.0's CSU Green rule">
      <addressed task="broadn-p10-design-implementation-UI-001"/>
    </phrase>
    <phrase text="Logo — wire assets/broadn-logo.webp into nav brand mark + hero">
      <addressed task="broadn-p10-design-implementation-UI-002"/> <!-- B -->
    </phrase>
    <phrase text="replace the &#10044; Unicode asterism">
      <addressed task="broadn-p10-design-implementation-UI-002"/> <!-- B -->
    </phrase>
    <phrase text="add accessible alt/aria-label">
      <addressed task="broadn-p10-design-implementation-UI-002"/> <!-- B -->
    </phrase>
    <phrase text="Single Okabe-Ito sample-type palette keyed by category-NAME">
      <addressed task="broadn-p10-design-implementation-UI-002"/> <!-- C, canonical map from UI-001 -->
    </phrase>
    <phrase text="replace ALL THREE divergent encodings: sampleTypes, sliceSampleTypes, samplerType">
      <addressed task="broadn-p10-design-implementation-UI-002"/> <!-- C -->
    </phrase>
    <phrase text="inline sky/cyan concurrent-timeline legend map (2790 bg-class + 2870 hex)">
      <addressed task="broadn-p10-design-implementation-UI-002"/> <!-- C -->
    </phrase>
    <phrase text="Brand teal stays OFF the data palette so brand != data">
      <addressed task="broadn-p10-design-implementation-UI-001"/> <!-- stated in v2; enforced in UI-002 C/A -->
    </phrase>
    <phrase text="Orange consolidation — collapse the four oranges to ONE wired filter-accent token">
      <addressed task="broadn-p10-design-implementation-UI-002"/> <!-- D1, token value from UI-001 -->
    </phrase>
    <phrase text="FIX the inverted orange signal: always-on orange on All BROADN Samples default button">
      <addressed task="broadn-p10-design-implementation-UI-002"/> <!-- D2 -->
    </phrase>
    <phrase text="global-view h3 section titles must NOT read as filter active">
      <addressed task="broadn-p10-design-implementation-UI-002"/> <!-- D2 -->
    </phrase>
    <phrase text="Global Chart.js defaults -> Inter font (Chart.defaults.font.family)">
      <addressed task="broadn-p10-design-implementation-UI-002"/> <!-- E -->
    </phrase>
    <phrase text="Pipeline-bar contrast — pale Sequenced bar (#4ade80) darken/replace">
      <addressed task="broadn-p10-design-implementation-UI-002"/> <!-- F, palette from UI-001 -->
    </phrase>
    <phrase text="Hero-chip radius — rectangular hero chips -> rounded">
      <addressed task="broadn-p10-design-implementation-UI-002"/> <!-- G -->
    </phrase>
    <phrase text="single-source-of-truth / DRY (one palette, one token)">
      <addressed task="broadn-p10-design-implementation-UI-002"/> <!-- C + D1 SCs; verified AUD-001 -->
    </phrase>
    <phrase text="charts must stay colorblind-safe (Okabe-Ito)">
      <addressed task="broadn-p10-design-implementation-AUD-001"/> <!-- A11Y gate -->
    </phrase>
    <phrase text="teal must meet WCAG AA contrast for text uses">
      <addressed task="broadn-p10-design-implementation-UI-001"/> <!-- WCAG note; verified AUD-001 -->
    </phrase>
    <phrase text="auditor will screenshot-verify against the live render">
      <addressed task="broadn-p10-design-implementation-AUD-001"/>
    </phrase>
  </verbatim_deliverable_audit>

  <routing_notes>
    <!-- Recurring-pattern preflight (step 0.5). docs/after-actions/ is empty for this project (per
         orchestrator brief); the brief's prior_sprint_gaps + the PM-spec broadn-p4/p5 references supply
         the watch-items. Enumerated below with how this decomposition handles each. -->
    <recurring_pattern source="orchestrator_brief.prior_sprint_gaps">OVERSCOPE (keep packets atomic)
      -> Avoided: the UI dossier proposed ~13 changes; this plan decomposes ONLY the human's 7 ratified
      items. The 6 extra dossier proposals (card depth, map tile, empty states, log-scale disclosure,
      temporal tick density, marker opacity) are explicitly listed out_of_scope in UI-001/UI-002 and
      deferred in risk_flags. FE is one task because the three files are a single coupled token system;
      splitting would create the worse OVERSCOPE failure (shared-file write races) — justified inline.</recurring_pattern>
    <recurring_pattern source="orchestrator_brief.prior_sprint_gaps">SCOPE_DRIFT (state each packet's EXPLICITLY OUT OF SCOPE)
      -> Avoided: every packet carries an out_of_scope block. The two highest drift risks are pinned with
      exact line refs: (a) slice-PANEL h3s 410-504 stay (legitimate signal), only GLOBAL h3s 669/674 change;
      (b) the BioSpot VIVAS instrument map at app.js:3020 (#22d3ee) is NOT a sample-type encoding and stays.</recurring_pattern>
    <recurring_pattern source="orchestrator_brief.constraints">DRY (single palette / single token — no parallel definitions)
      -> Addressed as a first-class SC, not prose: UI-002 SC3 requires exactly ONE SAMPLE_TYPE_COLORS map
      keyed by name (sliceSampleTypes/samplerType arrays removed) and SC4 requires ONE --color-filter-accent
      with no orphan orange tokens. AUD-001 SA gate re-verifies DRY against the live code.</recurring_pattern>
    <recurring_pattern source="pm-spec broadn-p4/p5 post-mortem">sequential single-file additions flagged as out-of-scope by auditor
      -> N/A to flag-suppression here (this sprint is the FIRST to touch these files in this sprint), but the
      sequential single-file-set ownership pattern is the reason FE is one task, not parallel sub-tasks.</recurring_pattern>

    <!-- DRY constraint acknowledgement (explicit, per ORC request): the single-source-of-truth principle is
         the crux of items #3 and #4. ONE SAMPLE_TYPE_COLORS object keyed by category NAME replaces the three
         divergent arrays AND the inline sky/cyan timeline legend map; ONE --color-filter-accent token (#c2410c)
         replaces the four ad-hoc oranges where they act as a filter signal. This is encoded as mechanical SCs
         (UI-002 SC3 + SC4), not left to prose, and re-checked by the auditor's SA gate. -->

    <!-- DESIGN.md status: DESIGN.md is PRESENT at repo root (v1.0.0). UI-001 must set
         design_system_source = DESIGN_MD and trace all tokens to named entries; UI-002 (FE) consumes the v2
         migration table. Memory project_broadn_teal_rebrand already overrides v1's green Constitution at
         runtime; this sprint lands the matching v2 spec, closing that override gap. -->

    <!-- Wave order: UI-001 (DESIGN.md v2) is a hard BLOCKER before UI-002 (FE) — the human constraint
         "keep DESIGN.md v2 as a distinct task that lands BEFORE the FE implementation task (FE consumes it)"
         is honored. AUD-001 closes the sprint with screenshot verification. -->

    <!-- Locked-value self-lint (steps 7.5/7.8): the sc-locked-value-consistency skill is NOT present in this
         config-only repo, so the mandated SC-precheck SCRIPT could not be run; manual self-lint performed.
         Findings: (a) UI-002 SC1 greps the LOCKED value #166534 for ABSENCE (count 0) and #0c5454 for PRESENCE
         — satisfiable on faithful execution (retiring green is the human directive). (b) UI-002 SC3 deliberately
         does NOT grep #22d3ee for zero (it remains once at the out-of-scope instrument map line 3020); SC asserts
         count == 1, avoiding a guaranteed false-FAIL. (c) Field-token grep SCs (step 7.8) anchor on VALUES, not
         bare keys: SC1/SC4/SC7 grep specific hex literals (#166534, #ea6c00, #4ade80) and SC6 greps the full
         'Chart.defaults.font.family' string, none of which collide with a type/interface declaration in this
         vanilla-JS (no TS interfaces) codebase. No unsatisfiable locked-line SC found. -->

    <!-- Fixture verification (step 2.5): assets/broadn-logo.webp confirmed PRESENT on disk via Glob
         (item #2 input). The .webp format is appropriate for an <img> src; no format mismatch. -->

    <!-- Most-relevant critics/gates: Critic should probe (1) the green-retirement absolute SC for any
         legitimately-retained green the human did not intend to remove; (2) the bright-teal WCAG text-contrast
         risk (see risk_flags); (3) confirm FE is correctly kept whole rather than split (shared-file rationale).
         No human confirmation needed before dispatch — all decisions are ratified. No git push (human-owned). -->
  </routing_notes>

  <risk_flags>
    <!-- R1 (A11Y, highest): bright teal #0c9cb4 on white is ~3:1 — PASSES non-text/large-text AA but FAILS
         normal-text AA (4.5:1). The human assigned bright teal to "links" which are typically normal-size text.
         UI-001 must specify that link/active TEXT on white uses deep teal #0c5454 (~9:1) while bright teal is
         reserved for underlines/borders/accents/large text/dark backgrounds. AUD-001 must verify no normal-size
         teal text fails AA. If unhandled this ships a contrast regression. -->
    <flag>bright-teal #0c9cb4 fails normal-text WCAG AA (~3:1) — UI-001 must restrict its text use; AUD-001 verifies. Constraint "teal must meet WCAG AA for text uses" depends on this.</flag>
    <!-- R2 (scope-boundary): "Retire CSU green #166534 from the UI" forces changes to occurrences the 7-item
         list does not individually enumerate (sliceHeatRamp green steps, KPI green-100 halos, green-900 hero,
         green-700 success). UI-001's migration table must assign every one a v2 value; absent that, FE will
         either miss occurrences (SC1 #166534==0 fails) or improvise (drift). Bounded the retirement hard-SC to
         #166534 specifically; green-700/--color-success disposition is delegated to v2. -->
    <flag>green-retirement is broader than the 7 enumerated items (heat ramp, KPI halos, hero green-900, success green-700) — UI-001 migration table must enumerate all; hard SC is on #166534==0.</flag>
    <!-- R3 (visual collision): Okabe "Plant" #009E73 (teal-green) sits close to the new brand deep teal #0c5454
         and bright teal #0c9cb4 in hue. UI-001 should confirm KPI teal halos / brand teal do not read as the
         data "Plant" color where they appear adjacent. AUD-001 screenshot pass should sanity-check. -->
    <flag>Okabe Plant #009E73 is hue-adjacent to brand teal — verify no brand/data confusion in adjacency (UI-001 + AUD-001 screenshot).</flag>
    <!-- R4 (deferred dossier proposals — explicitly OUT of this sprint, recorded so they are not silently lost):
         card depth/shadow, CartoDB/ESRI map base tile, empty-state pattern, log-scale axis disclosure, temporal
         tick density, map marker opacity/halo, siteBar/temporalBar unification beyond teal. None are in the
         human's 7 ratified items; deferred to a possible follow-on. Adding any is SCOPE_DRIFT. -->
    <flag>Deferred (NOT this sprint): card shadows, map base-tile swap, empty states, log-scale disclosure, temporal tick density, marker halo. Recorded so they are not silently dropped; out-of-scope for all three packets.</flag>
    <!-- R5 (no automated tests): static no-build dashboard — QA is screenshot/behavioral only. AUD-001 relies on
         the live Playwright render (reported fixed this session). If Playwright is unavailable at audit time, fall
         back to the python http.server + standalone chromium screenshot script per the task-spec resume note. -->
    <flag>No test runner — QA is screenshot-based; AUD-001 depends on live render at :8771 (Playwright reported fixed; http.server fallback documented in task spec).</flag>
  </risk_flags>

</task_decomposition>

<expectation_manifest>
  <sprint_id>broadn-p10-design-implementation</sprint_id>
  <generated>2026-06-25T00:00:00Z</generated>
  <assignments>
    <assignment>
      <task_id>broadn-p10-design-implementation-UI-001</task_id>
      <agent>UI#1</agent>
      <expected_tag>design_spec</expected_tag>
      <expected_file>.claude/tasks/outputs/broadn-p10-design-implementation-UI-001-UI-*.md</expected_file>
      <blocks>broadn-p10-design-implementation-UI-002</blocks>
      <receipt_check>
        <item>DESIGN.md frontmatter shows Version: 2.0.0 and Updated: 2026-06-25</item>
        <item>teal Constitution rule present with #0c5454 + #0c9cb4 and the "OVERRIDES v1.0.0" note</item>
        <item>SAMPLE_TYPE_COLORS five-pair Okabe-Ito map keyed by name present</item>
        <item>--color-filter-accent = #c2410c documented with four-orange collapse + #b45309 warning/data split</item>
        <item>pipeline 3-stage palette replacing #4ade80 with contrast ratios</item>
        <item>MIGRATION TABLE enumerating in-scope green/orange occurrences -> v2 values with line refs</item>
        <item>WCAG note restricting bright-teal #0c9cb4 normal-text use</item>
        <item>git diff touches DESIGN.md ONLY (no index.html/app.js/styles.css edits)</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>broadn-p10-design-implementation-UI-002</task_id>
      <agent>FE#1</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/broadn-p10-design-implementation-UI-002-FE-*.md</expected_file>
      <blocks>broadn-p10-design-implementation-AUD-001</blocks>
      <receipt_check>
        <item>grep #166534 across the three files == 0; #0c5454 present; no green-700/800/900 Tailwind in index.html</item>
        <item>broadn-logo.webp wired in nav + hero with alt + aria-label; &#10044; removed</item>
        <item>ONE SAMPLE_TYPE_COLORS map keyed by name (5 Okabe hexes); sliceSampleTypes/samplerType arrays gone; sky/cyan legend gone; #22d3ee remains == 1 (instrument map, expected)</item>
        <item>--color-filter-accent #c2410c wired; #ea6c00 == 0; no orphan orange tokens</item>
        <item>global h3s 669/674 neutralized; slice-panel h3s 410-504 unchanged; default "All" button de-oranged</item>
        <item>Chart.defaults.font.family Inter set before first new Chart(); pipeline #4ade80 == 0; hero chips rounded</item>
        <item>packet states the change was viewed on the live render (serve + screenshot)</item>
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
        <item>screenshot evidence paths for teal brand + single-palette consistency + signal-fix</item>
        <item>explicit confirmation findings #1 and #7 are resolved</item>
        <item>no FAILs raised against deferred out-of-scope surfaces; #22d3ee instrument map not flagged</item>
        <item>bright-teal text-contrast (R1) explicitly checked</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>
