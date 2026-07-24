<task_decomposition task_id="broadn-p20-acknowledgements" agent_count="2">

  <task_packets>

    <task_packet>
      <task_id>broadn-p20-acknowledgements-01</task_id>
      <assigned_to>UI Designer</assigned_to>
      <priority>HIGH</priority>
      <description>
Produce a `design_spec` for an "Acknowledgements &amp; Citation" area on the public
`broadn-web-view` static dashboard. This is a text/content addition anchored to the
EXISTING footer (`<footer id="site-footer">` at `index.html:946-961`,
`verified-on-disk 2026-07-24`). Decide, and record in the spec:

  1. PLACEMENT — where the acknowledgements sit relative to the existing footer.
     Options: an expanded footer, or a dedicated "Acknowledgements &amp; Citation"
     panel/section immediately above or within the footer. Keep the existing single
     NSF-disclaimer paragraph (`index.html:951-956`) intact and un-duplicated (DRY —
     do NOT restate "do not necessarily reflect the views of NSF").

  2. DISPLAY MODE — collapsible vs. always-open. Six blocks (A1–A6 below) is a long
     run of text on a dark surface; a collapsible or clearly-sectioned pattern is
     encouraged for readability. If collapsible, PREFER native `<details>`/`<summary>`
     (no JavaScript) with a descriptive `<summary>` — this deliberately avoids adding
     any JS and the config-global load-order defect class that has bitten this site
     before (broadn-p17 §6). If you choose a JS toggle instead, justify it; the default
     recommendation is native `<details>`.

  3. ORDERING — the exact display order of A1–A6 (A1 is the general always-shown block;
     A3 carries the external NEON link).

  4. FOOTER-LINK COLOR (A11Y decision — this is the load-bearing design call) — the
     footer background is `bg-stone-900` (`#1c1917`); current footer text is
     `text-stone-400` (`#a8a29e`, ~7:1 on that bg — passes). The NEON link (and any
     link) placed there MUST meet WCAG AA normal-text contrast (>=4.5:1) against
     `#1c1917`. Deep teal `#0c5454` is TOO DARK on this dark bg — do NOT use it here.
     Per DESIGN.md § WCAG Contrast Notes, bright teal `--color-accent` `#0c9cb4` is
     permitted on dark backgrounds "where its contrast inverts favorably" — you may use
     it, but you MUST compute and record the actual ratio against `#1c1917` and confirm
     it is >=4.5:1 (a light stone such as `--color-border-strong` `#d6d3d1` is an
     alternative). Links must ALSO be distinguishable WITHOUT color (e.g. underline) to
     satisfy WCAG 1.4.1.

  5. SEMANTIC STRUCTURE — name the elements FE should use (e.g. `<section>` /
     `<footer>` region, heading level for "Acknowledgements &amp; Citation", `<p>` per
     block, `<a>` for the NEON link, `<details>`/`<summary>` if collapsible). External
     link opens sensibly and gets `rel="noopener noreferrer"` (note this for FE).

  6. TYPOGRAPHY &amp; SPACING — sizes/weights/rhythm sourced from DESIGN.md § Typography
     and § Spacing Scale (e.g. `text-sm`/`text-xs`, `space-y-*`), traced to named tokens.

The six acknowledgement blocks (VERBATIM — for placement/ordering reference; FE
reproduces them character-for-character):

  A1 (BROADN + One Health Institute — general, always shown):
  "We gratefully acknowledge support from the NSF Biology Integration Institutes Program under Award # 2120117. We thank the Colorado State University's One Health Institute for contributions to and support of BROADN research."

  A2 (SGRC):
  "Special thanks to Amy Bibbey and Troy Bauder and other staff at the Colorado Agricultural Experiment Station for help in supporting and scheduling facilities at the Semi-arid Grasslands Research Center (SGRC)."

  A3 (NEON + external link):
  "The National Ecological Observatory Network is a program sponsored by the National Science Foundation and operated under cooperative agreement by Battelle. This material is based in part upon work supported by the National Science Foundation through the NEON Program. Data collected/used in this research were obtained through the NEON Assignable Assets program."
  Link URL: https://www.neonscience.org/data/guidelines-policies/citing
  Link text: "NEON data citation & acknowledgement guidelines"

  A4 (USDA / CPER):
  "We would like to acknowledge support for this project from the United States Department of Agriculture agency of Agricultural Research Services by providing site access at the Central Plains Experimental Range (CPER)."

  A5 (IMPROVE):
  "IMPROVE is a collaborative association of state, tribal, and federal agencies, and international partners. US Environmental Protection Agency is the primary funding source, with contracting and research support from the National Park Service. The Air Quality Research Center at the University of California, Davis is the central analytical laboratory, with ion analysis provided by Research Triangle Institute, and carbon analysis provided by Desert Research Institute."

  A6 (Niwot forest tower site access — RA-corrected; see routing_notes/risk_flags):
  "The Niwot Ridge forest tower is located on land in the Arapaho and Roosevelt National Forests (U.S. Forest Service), accessed through the University of Colorado Boulder Mountain Research Station."
      </description>
      <success_criteria>
The written `design_spec` contains ALL of:
  (1) A placement decision relative to `index.html:946-961`, explicitly preserving the
      existing NSF-disclaimer paragraph un-duplicated.
  (2) A display-mode decision (collapsible vs. always-open) with one-line rationale; if
      collapsible, native `<details>`/`<summary>`, keyboard-operable, descriptive summary.
  (3) An explicit ordering of A1–A6.
  (4) A footer-link color given as a DESIGN.md-named token OR a documented hex, WITH the
      computed contrast ratio against `#1c1917` stated numerically and >=4.5:1, PLUS a
      non-color link affordance (underline).
  (5) A semantic-HTML structure map (element + heading level per block + link element).
  (6) `<design_system_source>DESIGN_MD</design_system_source>` set, with every color and
      typography token traced to a named DESIGN.md entry.
      </success_criteria>
      <context_files>
/home/jhber/projects/broadn-web-view/DESIGN.md  (design tokens, WCAG contrast tables — token source of truth)
/home/jhber/projects/broadn-web-view/index.html  (footer at 946-961; do not read the whole file — the footer region is excerpted in this packet)
/home/jhber/projects/broadn-web-view/.claude/tasks/outputs/broadn-p20-acknowledgements-RA-1784934255.md  (RA evidence brief — provenance for A5 IMPROVE + A6 forest-tower wording; Glob-confirmed present 2026-07-24)
      </context_files>
      <dependencies>none</dependencies>
      <out_of_scope>
- Do NOT restructure the footer wholesale or redesign unrelated dashboard sections.
- Do NOT add new fonts, images, or any new static asset.
- Do NOT introduce JavaScript (prefer native `<details>` if collapsible).
- Do NOT invent color/type tokens outside DESIGN.md without an explicit AA justification.
- Do NOT touch data pipelines, charts, `data.json`, or `covariates.json`.
- Do NOT author the final HTML — that is FE's job (broadn-p20-acknowledgements-02).
      </out_of_scope>
      <output_expected>
        <tag>design_spec</tag>
        <must_contain>
          <item>Placement decision anchored to index.html:946-961, NSF disclaimer preserved</item>
          <item>Display-mode decision (collapsible vs always-open) with rationale</item>
          <item>Explicit A1–A6 ordering</item>
          <item>Footer-link color WITH numeric contrast ratio >=4.5:1 vs #1c1917 AND underline affordance</item>
          <item>Semantic-HTML structure map + heading level</item>
          <item>design_system_source = DESIGN_MD with named-token traceability</item>
        </must_contain>
        <must_not_contain>
          <item>Deep teal #0c5454 proposed as the footer-link color (fails on dark bg)</item>
          <item>Any raw/invented hex not in DESIGN.md lacking an AA justification</item>
          <item>Any new asset reference (image/font/file)</item>
          <item>A JS-toggle proposal without justification</item>
        </must_not_contain>
        <success_signal>design_spec file exists with all six must_contain items and a stated, >=4.5:1-verified footer-link contrast ratio.</success_signal>
      </output_expected>
    </task_packet>

    <task_packet>
      <task_id>broadn-p20-acknowledgements-02</task_id>
      <assigned_to>Frontend</assigned_to>
      <priority>HIGH</priority>
      <description>
Implement the "Acknowledgements &amp; Citation" area in `index.html` (and
`assets/styles.css` ONLY if the design_spec needs CSS that cannot be expressed as a
Tailwind utility) per the T1 (broadn-p20-acknowledgements-01) `design_spec`. This is a
static-content addition — no JavaScript, no data changes.

Add these SIX blocks. This is a VERBATIM_DELIVERABLE — reproduce each block
character-for-character (only standard HTML entity/quote handling is permitted, e.g.
`&amp;` for `&`, `&#39;`/`&rsquo;` for the apostrophe in A1). Do NOT paraphrase, re-order
words, expand abbreviations, or "normalize" punctuation:

  A1: "We gratefully acknowledge support from the NSF Biology Integration Institutes Program under Award # 2120117. We thank the Colorado State University's One Health Institute for contributions to and support of BROADN research."

  A2: "Special thanks to Amy Bibbey and Troy Bauder and other staff at the Colorado Agricultural Experiment Station for help in supporting and scheduling facilities at the Semi-arid Grasslands Research Center (SGRC)."

  A3: "The National Ecological Observatory Network is a program sponsored by the National Science Foundation and operated under cooperative agreement by Battelle. This material is based in part upon work supported by the National Science Foundation through the NEON Program. Data collected/used in this research were obtained through the NEON Assignable Assets program."
      + an external link, text "NEON data citation & acknowledgement guidelines",
        href "https://www.neonscience.org/data/guidelines-policies/citing",
        with rel="noopener noreferrer" (and target="_blank" if the design_spec opens it
        in a new tab). This link ALSO satisfies the human's truncated "link to the ___".

  A4: "We would like to acknowledge support for this project from the United States Department of Agriculture agency of Agricultural Research Services by providing site access at the Central Plains Experimental Range (CPER)."

  A5: "IMPROVE is a collaborative association of state, tribal, and federal agencies, and international partners. US Environmental Protection Agency is the primary funding source, with contracting and research support from the National Park Service. The Air Quality Research Center at the University of California, Davis is the central analytical laboratory, with ion analysis provided by Research Triangle Institute, and carbon analysis provided by Desert Research Institute."

  A6: "The Niwot Ridge forest tower is located on land in the Arapaho and Roosevelt National Forests (U.S. Forest Service), accessed through the University of Colorado Boulder Mountain Research Station."

FIDELITY TRAPS (do NOT auto-correct these — they are intentional and verbatim):
  - A1: "Award # 2120117" has spaces around the `#`. Keep them.
  - A1: "Colorado State University's" — the apostrophe is part of the text (literal `'`
        or `&#39;`/`&rsquo;` are all acceptable; do not drop it).
  - A5: "US Environmental Protection Agency" has NO periods.
  - A6: "U.S. Forest Service" HAS periods. A5-vs-A6 differ deliberately — preserve both.
  - A3: "Data collected/used" keeps the slash.

Do NOT split any of the SC ANCHOR PHRASES (listed in success_criteria) with inline HTML
tags (`<strong>`, `<span>`, etc.) — the verbatim greps must match a contiguous run of
text. You may wrap whole blocks in elements freely; just keep the listed anchor phrases
un-interrupted.

Follow the T1 design_spec for placement, collapsible-vs-open, ordering, semantic
structure, typography, and the AA-passing footer-link color. Keep the existing footer
NSF-disclaimer paragraph exactly as-is and do NOT duplicate it.
      </description>
      <success_criteria>
Run from repo root `/home/jhber/projects/broadn-web-view`:

SC1 — VERBATIM presence (one distinctive, entity-free anchor per block; each must return
     exactly 1). These anchors are chosen to contain no `&`, `<`, `>`, `"`, or `'`, so
     they match the rendered HTML directly:
  grep -Fc "NSF Biology Integration Institutes Program under Award # 2120117" index.html            # A1 == 1
  grep -Fc "Amy Bibbey and Troy Bauder and other staff at the Colorado Agricultural Experiment Station" index.html   # A2 == 1
  grep -Fc "operated under cooperative agreement by Battelle. This material is based in part" index.html   # A3 == 1
  grep -Fc "Data collected/used in this research were obtained through the NEON Assignable Assets program" index.html # A3 == 1
  grep -Fc "United States Department of Agriculture agency of Agricultural Research Services by providing site access at the Central Plains Experimental Range (CPER)" index.html  # A4 == 1
  grep -Fc "The Air Quality Research Center at the University of California, Davis is the central analytical laboratory" index.html  # A5 == 1
  grep -Fc "carbon analysis provided by Desert Research Institute" index.html                        # A5 == 1
  grep -Fc "The Niwot Ridge forest tower is located on land in the Arapaho and Roosevelt National Forests" index.html # A6 == 1

SC2 — NEON external link present and correct:
  grep -Fc "https://www.neonscience.org/data/guidelines-policies/citing" index.html   # == 1
  and the anchor carries rel="noopener noreferrer":  grep -F 'rel="noopener noreferrer"' index.html  # >= 1 on the NEON link

SC3 — DRY / no duplication of the existing NSF disclaimer:
  grep -Fc "do not necessarily reflect the views of NSF" index.html   # == 1 (unchanged; must NOT become 2)

SC4 — AUDITOR full-block fidelity (auditor-executed): the auditor reads each of the six
     rendered blocks in index.html and confirms the COMPLETE text of A1–A6 matches the
     verbatim source in this packet character-for-character, allowing only HTML-entity /
     quote equivalences (`&amp;`, `&#39;`/`&rsquo;`, `&mdash;` etc.). Any word change,
     dropped/added punctuation, or expanded abbreviation is a FAIL. Verify the A1/A5/A6
     fidelity traps above explicitly.

SC5 — A11Y contrast: the footer-link color rendered on the `#1c1917` (stone-900) footer
     background meets WCAG AA normal-text (>=4.5:1); the value used matches the ratio the
     T1 design_spec recorded. The link is also distinguishable without color (underline).
     Auditor confirms against the design_spec's recorded ratio.

SC6 — Keyboard/semantics: acknowledgement links are real `<a href>` (keyboard-focusable
     with a visible focus indicator); if a collapsible `<details>` is used it is
     keyboard-operable with a descriptive `<summary>`. Semantic HTML per design_spec.

SC7 — No out-of-scope drift (mechanical):
  git diff --name-only HEAD   # touches ONLY index.html (and optionally assets/styles.css) — no app.js, no data.json, no covariates.json
      </success_criteria>
      <context_files>
/home/jhber/projects/broadn-web-view/index.html  (footer region 946-961 is the insertion target — excerpted in this packet; read only the region you edit)
/home/jhber/projects/broadn-web-view/assets/styles.css  (only if the design_spec requires non-utility CSS)
/home/jhber/projects/broadn-web-view/DESIGN.md  (token source of truth for link color / typography)
[T1 design_spec output] .claude/tasks/outputs/broadn-p20-acknowledgements-01-UI-*.md  (placement, ordering, link color + ratio, structure — READ THIS FIRST)
      </context_files>
      <dependencies>broadn-p20-acknowledgements-01</dependencies>
      <estimated_new_lines>60-85 (6 blocks + section wrapper + heading + one link; optional small CSS. Under the 100-line split threshold — kept whole.)</estimated_new_lines>
      <out_of_scope>
- Do NOT modify `assets/app.js` — this is static content; no JS is required.
- Do NOT touch `data.json`, `covariates.json`, or any data-pipeline / chart code.
- Do NOT restructure or restyle unrelated footer/dashboard content.
- Do NOT modify or duplicate the existing NSF-disclaimer paragraph.
- Do NOT add any new image/font/static asset.
- Do NOT paraphrase, re-order, or "normalize" the A1–A6 text (verbatim only).
- Do NOT use deep teal `#0c5454` for the footer link (fails AA on stone-900).
      </out_of_scope>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>All six SC1 verbatim anchors present (count==1 each)</item>
          <item>NEON URL + rel="noopener noreferrer" (SC2)</item>
          <item>Recorded footer-link color + confirmed >=4.5:1 ratio on #1c1917 (SC5)</item>
          <item>Confirmation that only index.html (+ optionally styles.css) changed (SC7)</item>
        </must_contain>
        <must_not_contain>
          <item>Any paraphrased/re-worded acknowledgement text</item>
          <item>Deep teal #0c5454 as the footer link color</item>
          <item>Edits to app.js, data.json, covariates.json, or unrelated sections</item>
          <item>A second copy of the NSF-disclaimer sentence</item>
          <item>Any new asset reference</item>
        </must_not_contain>
        <success_signal>All SC1–SC3 greps return their expected counts; auditor confirms SC4 verbatim full-match + SC5 contrast + SC6 keyboard/semantics; SC7 shows no out-of-scope file touched.</success_signal>
      </output_expected>
    </task_packet>

  </task_packets>

  <dependency_order>
    broadn-p20-acknowledgements-01 (UI Designer, design_spec)
      -> broadn-p20-acknowledgements-02 (FE, implement in index.html)
      -> AUDIT GATE (audit-pipeline: SA + QA + SX) [not a PM-authored packet; ORC invokes]
      -> INTERACTIVE LINK CHECK (ORC-driven: NEON link resolves/opens — read-only auditor
         cannot drive clicks; per the broadn interactive-UI-audit boundary)
      -> Archivist
  </dependency_order>

  <routing_notes>
    <recurring_pattern source="broadn-p17-sample-checkout-cart.md">
      §6 row 1 — "PM asserted an unread fact about the codebase (config location)."
      AVOIDED: every codebase fact this plan asserts is verified-on-disk this session —
      footer at index.html:946-961 (Read, confirmed `<footer id="site-footer">` bg-stone-900
      text-stone-400, single NSF paragraph); DESIGN.md tokens/WCAG tables (Read); RA brief,
      styles.css, app.js existence (Glob-confirmed). No recalled-but-unverified facts.
    </recurring_pattern>
    <recurring_pattern source="broadn-p17-sample-checkout-cart.md">
      §6 rows 2 &amp; 4 — "False-generator `git diff | grep -c '^-'` SCs (can never be 0
      because `--- a/` header matches `^-`); recurs across multiple sprints."
      AVOIDED: this plan authors NO git-diff-based counting SCs. All verbatim/DRY checks use
      content-presence `grep -Fc ... == 1` on distinctive entity-free anchors (SC1–SC3), and
      the only diff SC (SC7) uses `git diff --name-only` (file list, not line-sign counting),
      which is header-safe by construction.
    </recurring_pattern>
    <recurring_pattern source="broadn-p17-sample-checkout-cart.md">
      §6 row 3 — "Script load-order / IIFE-cached config-global reads broke production
      (invisible to static analysis)."
      AVOIDED: this sprint adds NO JavaScript and NO config globals. If T1 chooses a
      collapsible pattern, the plan mandates native `<details>`/`<summary>` (no JS), so the
      load-order defect class cannot recur.
    </recurring_pattern>

    <consultation_request>None. All domain facts were resolvable from the brief + on-disk
      reads (RA already ran and its brief is on disk). No RA/UI/DS planning consultation needed.</consultation_request>

    DESIGN.md PRESENCE: present at /home/jhber/projects/broadn-web-view/DESIGN.md (v2.0.0).
      Included in context_files for BOTH the UI Designer and FE packets. UI Designer MUST set
      `<design_system_source>DESIGN_MD</design_system_source>` and trace every color/typography
      token to a named DESIGN.md entry. The one token DESIGN.md does NOT provide is a
      "link-on-dark-footer" color — this is an explicit A11Y design call assigned to UI
      (footer bg stone-900 #1c1917; must be >=4.5:1; deep teal #0c5454 is too dark; bright
      teal #0c9cb4 is DESIGN.md-permitted on dark bg but UI must compute+record the ratio).

    SC-PRECHECK TOOLING GAP: the `sc-locked-value-consistency` skill referenced by the PM
      spec (Step 7.5 mechanical backstop) is NOT present in broadn-web-view — `.claude/skills/
      sc-locked-value*/**` and `.claude/skills/*/SKILL.md` both Glob-empty this session. No
      `sc-precheck-report.json` can be produced here. In lieu, I ran the MANUAL Step 7.5/7.8/
      7.9 self-lint: every locked-value SC (SC1–SC3) is a `grep -Fc` content-presence check on
      a distinctive, entity-free anchor and is satisfiable-on-faithful-execution (anchors
      contain no `& < > " '`, so no HTML-entity encoding can break the match); SC7 uses
      `git diff --name-only` (no line-sign counting). No unsatisfiable or false-generator SC
      is present. Flagging so ORC/Critic note the tooling absence rather than expecting the JSON.

    VERBATIM anchor robustness: FE is instructed (in-packet) not to split the eight SC1
      anchor phrases with inline tags. The auditor-executed SC4 covers FULL-block fidelity
      (including the apostrophe/period/spacing traps the greps deliberately avoid).

    INTERACTIVE LINK VERIFICATION: the NEON external link's live behavior (resolves, opens
      per design) needs ORC's interactive walk — the read-only auditor cannot drive clicks
      (per MEMORY feedback_interactive_ui_audit_and_resume_noop). SC2 mechanically proves the
      href + rel are correct; the click test is ORC-driven post-audit.

    RELEVANT CRITIC FOCUS: VERBATIM fidelity (SC1/SC4), SC satisfiability (all content-grep),
      and A11Y contrast on the dark footer (SC5) are the highest-value review targets.

    proposed_rename: none. No human-provided word was renamed.
  </routing_notes>

  <risk_flags>
    - VERBATIM_DELIVERABLE (dominant risk): A1–A6 must be char-for-char. Mitigated by SC1
      (mechanical anchors), SC4 (auditor full-block match), and explicit fidelity-trap notes
      (Award # spacing, University's apostrophe, "US" vs "U.S." in A5/A6, "collected/used"
      slash). Critic should confirm SC4 names the auditor as executor for the full match.

    - VERBATIM-VS-HUMAN-PREMISE conflict (surface to human before/at close): the human wrote
      "the Niwot tower is on National Park Service land (RMNP) which might need to be
      acknowledged too." The RA evidence brief (Glob-confirmed on disk) DISPROVES this: the
      forest tower is on U.S. Forest Service land (Arapaho &amp; Roosevelt NF), accessed via
      CU Boulder Mountain Research Station; Cornell et al. 2026 (Two Towers) does NOT
      acknowledge RMNP/NPS. Per ORC's locked decision this plan ships A6 (the factually-correct
      USFS/CU-MRS wording) and OMITS an RMNP acknowledgement. This overrides a human-explicit
      phrase — ORC should reconcile with the human: confirm the factual correction + A6 wording
      is acceptable, OR whether A6 should be held behind explicit human confirmation before FE
      ships it. (Default per brief: include A6.)

    - TRUNCATED-REQUEST ASSUMPTION (surface to human): the human's first sentence was cut off
      ("On the web view, we need a link to the ___"). Interpreted as the NEON
      acknowledgement/citing page (the human supplied that exact URL later); satisfied by the
      A3 link. Flag for confirmation that no OTHER link was intended.

    - OUT-OF-SCOPE (recorded, not dropped): an Indigenous land acknowledgement was NOT sourced
      by RA and is deliberately NOT fabricated this sprint — follow-up only. AmeriFlux/DOE
      credits are Two-Towers-paper-specific, not general-dashboard, and are excluded (the
      generic NEON A3 block covers NEON).

    - A11Y on dark footer: the footer bg is dark (stone-900 #1c1917). Deep teal #0c5454 FAILS
      as text there. UI must pick a >=4.5:1 link color and record the ratio (SC5). If UI picks
      bright teal #0c9cb4, the exact ratio on #1c1917 must be computed and confirmed >=4.5:1.

    - SCOPE / no over-build: this is a text addition. Risk = FE restructuring the footer or
      adding JS. Mitigated by out_of_scope (no app.js, no assets, no data, native `<details>`).
  </risk_flags>

  <verbatim_deliverable_audit>
    <!-- Every noun/verb phrase derived from the human request (as conveyed in the
         orchestrator_brief) mapped to addressed / deferred / out_of_scope. -->
    <phrase text="link to the ___ (truncated first sentence)">
      <deferred reason="interpreted as the NEON citing-page link and satisfied via A3; flagged in risk_flags for human confirmation that no other link was meant"/>
    </phrase>
    <phrase text="preferred citation / acknowledgement language on the web view">
      <addressed task="broadn-p20-acknowledgements-01"/>
      <addressed task="broadn-p20-acknowledgements-02"/>
    </phrase>
    <phrase text="BROADN + One Health Institute + NSF Award # 2120117 (A1)">
      <addressed task="broadn-p20-acknowledgements-02"/>
    </phrase>
    <phrase text="SGRC / Amy Bibbey / Troy Bauder / Colorado Agricultural Experiment Station (A2)">
      <addressed task="broadn-p20-acknowledgements-02"/>
    </phrase>
    <phrase text="NEON acknowledgement block (A3)">
      <addressed task="broadn-p20-acknowledgements-02"/>
    </phrase>
    <phrase text="link to the NEON acknowledgement page">
      <addressed task="broadn-p20-acknowledgements-02"/>
    </phrase>
    <phrase text="USDA / Agricultural Research Services / CPER (A4)">
      <addressed task="broadn-p20-acknowledgements-02"/>
    </phrase>
    <phrase text="IMPROVE acknowledgement (A5)">
      <addressed task="broadn-p20-acknowledgements-02"/>
    </phrase>
    <phrase text="Niwot tower is on National Park Service land (RMNP) which might need to be acknowledged too">
      <out_of_scope reason="RA evidence disproves the premise (tower is on USFS land, not NPS/RMNP); an RMNP acknowledgement would be factually wrong. Replaced by A6 (USFS/CU-MRS site access). Conflict surfaced in risk_flags for human reconciliation."/>
    </phrase>
    <phrase text="see if Carolyn had that in the Two Towers publication">
      <addressed task="broadn-p20-acknowledgements-01"/>
      <!-- Investigated by RA: Cornell et al. 2026 (mBio) thanks CU Mountain Research Station + AmeriFlux NWT1, NOT RMNP/NPS. This finding informs A6. -->
    </phrase>
    <phrase text="AmeriFlux / DOE tower credits (implied by Two Towers reference)">
      <out_of_scope reason="ORC decision: Two-Towers-paper-specific, not general-dashboard; the generic NEON A3 block covers NEON. Not added."/>
    </phrase>
    <phrase text="Indigenous land acknowledgement (raised as a possibility)">
      <out_of_scope reason="Not sourced by RA; not fabricated. Recorded as a follow-up only."/>
    </phrase>
  </verbatim_deliverable_audit>

</task_decomposition>


<expectation_manifest>
  <sprint_id>broadn-p20-acknowledgements</sprint_id>
  <generated>2026-07-24</generated>
  <assignments>
    <assignment>
      <task_id>broadn-p20-acknowledgements-01</task_id>
      <agent>UI#1</agent>
      <expected_tag>design_spec</expected_tag>
      <expected_file>.claude/tasks/outputs/broadn-p20-acknowledgements-01-UI-*.md</expected_file>
      <blocks>broadn-p20-acknowledgements-02</blocks>
      <receipt_check>
        <item>design_system_source == DESIGN_MD (not INFERRED)</item>
        <item>Footer-link color present WITH a numeric contrast ratio >=4.5:1 vs #1c1917</item>
        <item>Explicit A1–A6 ordering present</item>
        <item>Placement decision preserves (does not duplicate) the NSF disclaimer</item>
        <item>Display-mode decision present; if collapsible, native details/summary (no JS)</item>
        <item>No new-asset reference introduced</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>broadn-p20-acknowledgements-02</task_id>
      <agent>FE#1</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/broadn-p20-acknowledgements-02-FE-*.md</expected_file>
      <blocks>NONE (last implementation task before audit)</blocks>
      <receipt_check>
        <item>All eight SC1 verbatim anchors report count==1</item>
        <item>SC2: NEON URL count==1 and rel="noopener noreferrer" present on the link</item>
        <item>SC3: "do not necessarily reflect the views of NSF" count==1 (NSF disclaimer not duplicated)</item>
        <item>SC7: only index.html (+ optionally assets/styles.css) changed — no app.js/data.json/covariates.json</item>
        <item>Fidelity traps (Award # spacing, University's apostrophe, US vs U.S., collected/used slash) confirmed preserved</item>
        <item>Footer-link color used matches the design_spec's >=4.5:1 recorded value</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>
