# Task: broadn-p20-acknowledgements

**Human request:** Add BROADN's preferred citation/acknowledgement language to the web view
(index.html footer/section), plus a link to the NEON acknowledgement page; research and
incorporate IMPROVE-network and Niwot/RMNP (NPS) land acknowledgement language.

**Routing:** Full pipeline (RA → PM → Critic → UI → FE → Auditor → Archivist). App work
(static GitHub Pages site), not meta-agent work.

**Working directory:** /home/jhber/projects/broadn-web-view

## Grounding facts (verified-on-disk 2026-07-24)
- Web view is a static site: `index.html` (Tailwind CDN + vanilla JS) + `assets/{app.js,styles.css,...}`.
- Footer lives at `index.html:946-961` (`<footer id="site-footer">`, bg stone-900, text stone-400).
  Currently holds a single NSF disclaimer paragraph — natural home for acknowledgements, OR a
  new dedicated "Acknowledgements & Citation" section/panel.
- Brand tokens (DESIGN.md): deep teal `#0c5454` (headings/links on white, ~9.1:1 AA+AAA),
  dark teal `#083838` (hero/footer accent). Bright teal `#0c9cb4` FAILS normal-text AA — non-text only.
- "Two Towers" publication already identified: **Cornell et al. 2026, mBio**,
  `https://doi.org/10.1128/mbio.03057-25` (linked at `app.js:204`).
- NEON acknowledgement page: `https://www.neonscience.org/data/guidelines-policies/citing`.

## The four VERBATIM acknowledgement blocks (reproduce word-for-word)
1. **BROADN + OHI:** "We gratefully acknowledge support from the NSF Biology Integration
   Institutes Program under Award # 2120117. We thank the Colorado State University's One
   Health Institute for contributions to and support of BROADN research."
2. **SGRC:** "Special thanks to Amy Bibbey and Troy Bauder and other staff at the Colorado
   Agricultural Experiment Station for help in supporting and scheduling facilities at the
   Semi-arid Grasslands Research Center (SGRC)."
3. **NEON site:** "The National Ecological Observatory Network is a program sponsored by the
   National Science Foundation and operated under cooperative agreement by Battelle. This
   material is based in part upon work supported by the National Science Foundation through
   the NEON Program. Data collected/used in this research were obtained through the NEON
   Assignable Assets program." (+ link to NEON citing page.)
4. **USDA/CPER:** "We would like to acknowledge support for this project from the United
   States Department of Agriculture agency of Agricultural Research Services by providing site
   access at the Central Plains Experimental Range (CPER)."

## Open research items (RA wave)
- Cornell et al. 2026 mBio acknowledgements: does it acknowledge RMNP / NPS for the Niwot/forest
  tower? Capture verbatim land-acknowledgement text.
- IMPROVE network's standard/preferred acknowledgement language.
- Verify Niwot Ridge NEON (NWT) tower land ownership (RMNP/NPS vs. USFS Roosevelt NF vs. CU MRS)
  and the correct land acknowledgement.

## Open human decision (surface, do not block)
- First request sentence was truncated: "we need a link to the ___". Assumed intent = the NEON
  acknowledgement/citing page (explicitly provided later in the request). Flag for confirmation.

## Agents spawned
- RA (researcher) — evidence brief
- PM, Critic, UI, FE, Auditor, Archivist (pipeline)
