<task_decomposition task_id="broadn-p11-feedback-widget-teal" agent_count="1">

  <task_packets>

    <task_packet>
      <task_id>broadn-p11-001</task_id>
      <assigned_to>frontend</assigned_to>
      <priority>NORMAL</priority>
      <description>
Mechanical CSU-green → BROADN-teal color-token swap on the two feedback-widget files,
consuming DESIGN.md v2.0.0 values verbatim. NO behavior, markup, layout, or icon-position
changes — color tokens only.

=== CRITICAL CORRECTION TO THE BRIEF'S TOKEN MAP (read before editing) ===
The orchestrator brief and the queued spec both reference target tokens
`--color-primary`, `--color-primary-mid`, `--color-primary-dark`, `--color-primary-light`.
These DO NOT EXIST as CSS custom properties in the shipped code. P10 created ONLY:
  assets/styles.css :root  →  `--color-teal-deep: #0c5454`  and  `--color-accent: #0c9cb4`
(P10 used DESIGN.md migration-table row 14's rename, not the Constitution's `--color-primary*`
names.) Likewise `--color-green-800/700/900/100` DO NOT EXIST — so the widget's six current
`var(--color-green-800)` references resolve to UNDEFINED today (the FAB and Submit backgrounds
currently render transparent — the widget is partly broken post-P10). styles.css is OUT OF SCOPE
to modify (it is a P10 file). Therefore use this wiring:

  Role          v1 green (remove)   v2 teal (apply)   How to wire
  ----          -----------------   ---------------   -----------
  deep/primary  #166534 / green-800  #0c5454          var(--color-teal-deep)   (var EXISTS — use it)
  mid           #15803d / green-700  #0e7474          hardcode hex #0e7474     (no shipped var)
  dark          #14532d / green-900  #083838          hardcode hex #083838     (no shipped var)
  light         #dcfce7 / green-100  #ccefef          hardcode hex #ccefef     (no shipped var)

Switching the six `var(--color-green-800)` refs to `var(--color-teal-deep)` both rebrands AND
fixes the current undefined-var breakage. This is in-scope and correct.

=== EXACT EDITS — assets/feedback-widget.css ===
Replace each `var(--color-green-800)` with `var(--color-teal-deep)` (deep teal) at these lines:
  47, 53, 61, 67, 85, 377.
Replace each hardcoded green hex with its teal value:
  #15803d → #0e7474  at lines 55, 96, 100, 241, 284, 285, 324, 358, 359, 383, 387
  #14532d → #083838  at lines 105, 392
  #dcfce7 → #ccefef  at line 66
COMMENTS ALSO CARRY OLD GREEN HEX — these MUST be updated or the grep==0 SC is unsatisfiable
(updating them is in-scope; they document the retired brand):
  - Header comment block (lines 1-8): replace the documented values
    "green-700 #15803d, green-900 #14532d, ... green-100 #dcfce7" with the teal equivalents
    (deep teal #0c5454 via var(--color-teal-deep), mid #0e7474, dark #083838, light #ccefef).
  - Line 47 inline comment "/* green-800 #166534 — --color-primary */" → retrace to
    "/* deep teal #0c5454 — var(--color-teal-deep) */" (or equivalent; just remove #166534).
  - Any other inline trace comment that still contains #15803d / #14532d / #dcfce7 / #166534
    must be updated to the teal value. (Run the verification grep below and fix every hit,
    code AND comment, until it returns 0.)
Where you apply a hardcoded teal hex (mid/dark/light), keep a short trace comment, e.g.
  `background-color: #083838;  /* dark teal — DESIGN.md v2 --color-primary-dark */`

=== EXACT EDIT — assets/feedback-widget.js ===
Line 30, SVG_CHECK string: the inline `style="color:#15803d;display:block;margin:0 auto;"`
→ change `#15803d` to `#0e7474` (mid teal). This is the only green in the JS file. Do NOT
alter anything else in SVG_CHECK (size, viewBox, paths, display/margin) or any other SVG.

=== DRY / brand single-source rationale ===
Deep teal uses the existing var (single-source). Mid/dark/light are hardcoded ONLY because no
shipped CSS var exists and styles.css is off-limits this sprint; the trace comments document
the DESIGN.md v2 source. Do NOT introduce new `--color-*` custom-property definitions in
feedback-widget.css (that creates a second brand source of truth and is scope creep) — a
future sprint can centralize mid/dark/light vars in styles.css.

=== VERIFY (static serve + Playwright) ===
Serve statically: `python3 -m http.server 8771` → http://localhost:8771/index.html
Screenshot-verify these three render TEAL (no green): (a) the floating "Feedback" FAB
(bottom-right, fixed) shows solid deep-teal `#0c5454` background with white text; (b) a
per-card trigger speech-bubble icon shows deep-teal on hover/open; (c) open the popover and
confirm the textarea focus ring and Submit button render teal. Save screenshots under
.claude/tasks/outputs/.
      </description>
      <success_criteria>
SC1 (no green hex anywhere in CSS, code + comments):
  grep -Ec '#166534|#15803d|#14532d|#dcfce7' assets/feedback-widget.css  ==  0
SC2 (no dangling green var in CSS):
  grep -c 'var(--color-green' assets/feedback-widget.css  ==  0
SC3 (deep-teal wired via the existing var — at least the 6 migrated refs):
  grep -c 'var(--color-teal-deep)' assets/feedback-widget.css  >=  6
SC4 (mid teal present):  grep -c '#0e7474' assets/feedback-widget.css  >=  11
SC5 (dark teal present): grep -c '#083838' assets/feedback-widget.css  >=  2
SC6 (light teal present):grep -c '#ccefef' assets/feedback-widget.css  >=  1
SC7 (no green in JS):    grep -c '#15803d' assets/feedback-widget.js   ==  0
SC8 (JS success-check now mid teal): grep -c '#0e7474' assets/feedback-widget.js  ==  1
SC9 (no behavior/markup drift): `git diff` touches ONLY color values and their trace comments
  in the two in-scope files; zero changes to selectors, properties other than color/
  background-color/border-color/outline/box-shadow color, JS logic, SVG geometry, or any
  other file. No new `--color-*` custom-property *definitions* added.
SC10 (WCAG holds): FAB white-on-#0c5454 ≈9:1 (AA/AAA); trigger icons deep-teal on stone/white
  ≥3:1 non-text; success-check #0e7474 on white ≥3:1 non-text. Confirmed against DESIGN.md v2
  WCAG table (deep teal ~9.1:1).
SC11 (visual): Playwright screenshots confirm FAB + a trigger icon + popover focus state render
  teal (no residual green) on the live static render.
      </success_criteria>
      <context_files>
assets/feedback-widget.css   (24 green token occurrences — the migration target; line numbers above)
assets/feedback-widget.js    (1 green occurrence: line 30 SVG_CHECK inline style)
DESIGN.md                    (v2.0.0 — § Color Tokens lines 26-29 define teal values; SOURCE OF TRUTH, do not re-derive)
assets/styles.css            (READ-ONLY reference — :root lines 4-14 show that ONLY --color-teal-deep / --color-accent exist; DO NOT EDIT)
      </context_files>
      <dependencies>NONE</dependencies>
      <out_of_scope>
- DO NOT touch the three P10 files: index.html, assets/app.js, assets/styles.css. styles.css is
  read-only reference here; do not add vars to it or anywhere else.
- DO NOT change the widget's behavior, JS logic, event wiring, markup structure, DOM order,
  class names, layout, spacing, or icon positions (-4px outset / 8px inset placements stay).
- DO NOT alter any SVG geometry, size, viewBox, or path data (only the SVG_CHECK inline COLOR).
- DO NOT touch non-brand colors: stone tokens (--color-stone-*, #57534e, #1c1917, #a8a29e),
  red error #b91c1c, white #ffffff, the lock icon's #a8a29e — leave all unchanged.
- DO NOT re-open or re-derive any color decision. Consume DESIGN.md v2 values verbatim.
- DO NOT introduce new --color-* custom-property definitions (second brand source = scope creep).
- DO NOT modify any other file in the repo.
      </out_of_scope>
      <estimated_new_lines>0 (in-place value/comment edits; net new lines ~0, well under 100)</estimated_new_lines>
      <output_expected>
        <tag>ui_packet</tag>
        <must_contain>
          <item>Confirmation of all 11 SCs with the grep outputs pasted (each ==/>= target shown)</item>
          <item>git diff summary proving only color values + trace comments changed in the 2 files</item>
          <item>Paths to the 3 Playwright screenshots (FAB, trigger icon, popover focus) under .claude/tasks/outputs/</item>
          <item>Explicit note that var(--color-green-800) refs were repointed to var(--color-teal-deep)</item>
        </must_contain>
        <must_not_contain>
          <item>Any residual #166534/#15803d/#14532d/#dcfce7 in either file (code or comment)</item>
          <item>Any new --color-* custom-property definition</item>
          <item>Edits to index.html, app.js, styles.css, or any file outside the two in scope</item>
          <item>References to var(--color-primary*) — those vars do not exist in the shipped CSS</item>
        </must_not_contain>
        <success_signal>All 11 SCs pass; git diff confined to color values + trace comments in the two widget files; FAB/trigger/popover render teal in screenshots.</success_signal>
      </output_expected>
    </task_packet>

  </task_packets>

  <dependency_order>
    broadn-p11-001  (single task — no dependencies)
    → audit-pipeline (SA + QA + SX, ORC-driven; SA must verify SC9 no-drift + DRY single-source)
    → archivist
  </dependency_order>

  <routing_notes>
    UI-DESIGNER: SKIPPABLE — confirmed. No new design decision exists. All four teal target
    values are already ratified in DESIGN.md v2.0.0 (§ Color Tokens, lines 26-29). The only
    implementation choice (var vs. hardcoded hex per role) is a DRY/wiring decision, not a color
    decision, and the PM has made it explicitly in the packet (deep→var(--color-teal-deep);
    mid/dark/light→hardcoded teal hex because no shipped var exists and styles.css is out of
    scope). Spawning UI-designer would add a round with zero new information.

    SINGLE TASK — fully mechanical; this satisfies the brief's "keep it to ONE implementing task"
    constraint. No BE/DS/ST/RA needed (no schema, no API, no data, no external docs).

    CRITIC GATE: light. Most-relevant critic checks for this plan:
      (1) confirm SC1 (grep==0) is satisfiable — it IS, because the packet explicitly folds the
          3 documentation-comment hex occurrences (lines 6-7 header, line 47 inline) into scope;
          without that fold the SC would be unsatisfiable (exactly the P10 "unsatisfiable grep SC"
          pattern the brief warned about).
      (2) confirm the target-token correction (var(--color-teal-deep), NOT var(--color-primary*))
          is carried into the SCs — SC2 forbids dangling green vars, no SC asserts a --color-primary
          var, so an agent cannot create a dangling reference.

    PRIOR-APPROVED / FILE-HISTORY NOTE: both in-scope files (feedback-widget.css/.js) were
    UNTOUCHED by P10 — this is the FIRST sprint to modify them post-rebrand. No prior-wave additions
    to whitelist. The auditor should expect that the `var(--color-green-800)` → `var(--color-teal-deep)`
    repoint is a CORRECTION of a P10-introduced undefined-var breakage (FAB/Submit bg currently render
    transparent), not a behavior change — flagging this so SA does not read the repoint as scope drift.

    DESIGN.md status: present at repo root, v2.0.0 (shipped P10, commit 0cba237). It is the design-token
    source of truth for this sprint. No DESIGN.md generation needed.

    SHIPS CODE: commit on a sprint/* branch; surface sha and prompt human to push (P10 commits
    0cba237/c14d67b sit unpushed on main — this sprint stacks on top). Do not auto-push.

    proposed_rename: none. No human-provided word renamed.
  </routing_notes>

  <risk_flags>
    - BRIEF-vs-SHIPPED TOKEN MISMATCH (resolved in plan, flag for ORC awareness): the brief's
      token map names `--color-primary*` targets that do NOT exist as CSS vars in the shipped
      styles.css (only `--color-teal-deep` and `--color-accent` exist). The plan corrects this:
      deep→var(--color-teal-deep), mid/dark/light→hardcoded teal hex. If ORC/human intended P10
      to have created `--color-primary*` vars, that is a P10 gap to address in a SEPARATE sprint —
      do NOT expand p11 to create them (scope creep). Surfaced per locked-vs-shipped reconciliation.
    - PRE-EXISTING BREAKAGE: the widget's 6 `var(--color-green-800)` refs currently resolve to
      undefined post-P10 (FAB/Submit backgrounds render transparent). The fix repoints them to a
      valid var; the "before" render will NOT show solid green for those surfaces. AUD's teal
      verification is on the AFTER state only — no issue, but noted so a before/after diff isn't
      misread.
    - OVERSCOPE / SCOPE_DRIFT (P10 recurring pattern): this is 2 files, color-only. The packet's
      out_of_scope + SC9 (diff-shape) + must_not_contain mechanically fence behavior/markup/layout
      and forbid new var definitions. Critic should verify SC9 is enforced in audit.
    - UNSATISFIABLE-GREP-SC (P10 recurring pattern): explicitly avoided — every grep==0 SC was
      sanity-checked against the live file; the 3 comment-hex occurrences are folded into scope so
      SC1 is satisfiable. No green token has a "legitimate keep" in these files (the retired brand
      is removed entirely, including trace comments).
  </risk_flags>

</task_decomposition>

---

## Recurring-pattern preflight (Step 0.5)
Sources read: docs/post-mortems/broadn-p8-feedback-widget.md (§ recurring: "None within this
sprint"), broadn-p5-p6.md (no OVERSCOPE/grep-SC rows), plus the brief's pre-extracted P10
prior_sprint_gaps. (No docs/after-actions/ dir exists in this repo; post-mortems are the
equivalent §6 source.)

<recurring_pattern source="broadn-p10 prior_sprint_gaps (brief)">OVERSCOPE — resist adding
layout/behavior beyond the token swap.</recurring_pattern>
  → Avoided: 2-file color-only scope; out_of_scope + SC9 diff-shape + must_not_contain fence it.

<recurring_pattern source="broadn-p10 prior_sprint_gaps (brief)">SCOPE_DRIFT — state EXPLICITLY
OUT OF SCOPE per packet.</recurring_pattern>
  → Avoided: explicit <out_of_scope> block enumerates the 3 P10 files, behavior, markup, SVG
    geometry, non-brand colors, and new var definitions.

<recurring_pattern source="broadn-p10 prior_sprint_gaps (brief)">DRY — prefer var(--color-*)
over hardcoded hex for single-source brand.</recurring_pattern>
  → Honored where a var exists (deep→var(--color-teal-deep)); risk ACCEPTED for mid/dark/light
    (hardcoded hex) with explicit rationale: no shipped var exists and styles.css is out of scope.
    Documented via trace comments; future sprint can centralize.

<recurring_pattern source="broadn-p10 prior_sprint_gaps (brief)">Unsatisfiable grep==0 SC (a
token that legitimately must remain).</recurring_pattern>
  → Avoided: every grep==0 SC sanity-checked against the live file; comment-hex occurrences folded
    into scope so SC1 is satisfiable; no green token has a legitimate keep in these files.

## Verbatim deliverable audit (Step 7)
<verbatim_deliverable_audit>
  <phrase>"Rebrand the feedback widget"</phrase> <addressed task="broadn-p11-001"/>
  <phrase>"from CSU green to BROADN teal"</phrase> <addressed task="broadn-p11-001"/>
  <phrase>"P10 teal rebrand is complete on every rendered surface"</phrase> <addressed task="broadn-p11-001"/>
  <phrase>"SHIPS CODE"</phrase> <addressed task="broadn-p11-001"/> (commit on sprint branch; human pushes)
  <phrase>"near-mechanical color-token swap"</phrase> <addressed task="broadn-p11-001"/>
  <phrase>"ALREADY-SHIPPED spec (DESIGN.md v2.0.0)"</phrase> <addressed task="broadn-p11-001"/> (DESIGN.md is source of truth; values consumed verbatim)
  <phrase>"do NOT re-open any color decision"</phrase> <addressed task="broadn-p11-001"/> (out_of_scope: no re-derivation)
  <phrase>"execute the existing migration map"</phrase> <addressed task="broadn-p11-001"/>
  <phrase>"assets/feedback-widget.css (24 occurrences)"</phrase> <addressed task="broadn-p11-001"/>
  <phrase>"assets/feedback-widget.js (1 occurrence, js:30)"</phrase> <addressed task="broadn-p11-001"/>
  <phrase>"4-row green→teal token migration table"</phrase> <addressed task="broadn-p11-001"/>
  <phrase>"icon-placement map"</phrase> <out_of_scope reason="placement is unchanged; map is scoping context only — no position edits per constraints"/>
  <phrase>"WCAG AA must hold"</phrase> <addressed task="broadn-p11-001"/> (SC10)
  <phrase>"confirm whether legacy --color-green-* vars still resolve"</phrase> <addressed task="broadn-p11-001"/> (RESOLVED: they do NOT — repointed to var(--color-teal-deep))
  <phrase>"verify via static serve + Playwright"</phrase> <addressed task="broadn-p11-001"/> (SC11)
  <phrase>"keep it to ONE implementing task"</phrase> <addressed task="broadn-p11-001"/> (single task)
  <phrase>"UI-designer is likely skippable — make the call in routing_notes"</phrase> <addressed task="broadn-p11-001"/> (routing_notes: SKIPPABLE, with reason)
  <phrase>"do not touch the three P10 files or any other file"</phrase> <addressed task="broadn-p11-001"/> (out_of_scope + SC9)
</verbatim_deliverable_audit>

## SC locked-value self-lint (Step 7.5) — manual
No locked frontmatter/copy-string values in scope. The only "locked values" are the four teal
hexes from DESIGN.md v2; SCs assert their PRESENCE (satisfiable) and the OLD green hexes' ABSENCE
(satisfiable once comments are updated — folded into scope). The full sc-locked-value-consistency
skill targets frontmatter-description/copy-string defect classes that do not apply to a CSS hex
swap; the manual per-SC cross-check above covers the relevant forms. SC1's grep==0 was the one
satisfiability risk and is resolved by scoping comment-hex updates in.

## Expectation manifest
<expectation_manifest>
  <sprint_id>broadn-p11-feedback-widget-teal</sprint_id>
  <generated>2026-06-25</generated>
  <assignments>
    <assignment>
      <task_id>broadn-p11-001</task_id>
      <agent>FE#1</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/broadn-p11-001-FE-*.md</expected_file>
      <blocks>NONE (terminal implementing task; audit follows)</blocks>
      <receipt_check>
        <item>SC1 grep==0 (CSS green hex, code + comment) confirmed with pasted output</item>
        <item>SC2 grep==0 (no var(--color-green) left) confirmed</item>
        <item>SC7 grep==0 (JS #15803d) and SC8 (#0e7474 ==1) confirmed</item>
        <item>git diff confined to color values + trace comments in the 2 files only (SC9)</item>
        <item>No new --color-* var definitions; no var(--color-primary*) references</item>
        <item>3 Playwright screenshot paths present (FAB, trigger icon, popover focus)</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>
