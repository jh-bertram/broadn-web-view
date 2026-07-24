<plan_critique>
  <plan_id>broadn-p20-acknowledgements</plan_id>
  <status>PASS</status>

  <challenges>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>broadn-p20-acknowledgements-02</task_ref>
      <description>
Verbatim-trap coverage is uneven. Of the five named fidelity traps, only TWO are guarded
by a mechanical SC1 grep — "Award # 2120117" (inside the A1 anchor) and "collected/used"
(inside the A3 anchor). The other THREE rest SOLELY on the auditor's manual SC4 read:
A1 "University's" apostrophe, A5 "US Environmental Protection Agency" (no periods), and
A6 "U.S. Forest Service" (with periods). The A5/A6 anchors deliberately stop short of the
period-differing tokens ("The Air Quality Research Center..." / "...National Forests"), so
a FE slip that writes "U.S. EPA" in A5 or "US Forest Service" in A6 passes every grep and
fails only if the auditor's eyes catch it. This is exactly the A5-vs-A6 inversion the
packet warns is the highest-value trap. The apostrophe trap genuinely can't be a single
grep -F literal (it may legitimately encode as `&#39;`/`&rsquo;`), but the two period traps
are entity-free and mechanically greppable — leaving them to a single manual read is
weaker than this plan's otherwise-mechanical verification posture.
      </description>
      <required_revision>
Non-blocking strengthening: add two entity-free presence SCs to SC1 —
`grep -Fc "US Environmental Protection Agency" index.html` == 1 (A5, no periods) and
`grep -Fc "U.S. Forest Service" index.html` == 1 (A6, with periods). These convert the two
highest-risk period traps from eyes-only to mechanical. Leave the A1 apostrophe trap on
SC4 (entity-encoding makes it grep-ambiguous), but keep SC4's explicit "verify A1/A5/A6
traps" instruction. PASS does not depend on this; adopt or the auditor must run SC4 with
these three tokens front-of-mind.
      </required_revision>
    </challenge>

    <challenge>
      <type>SCOPE_DRIFT</type>
      <severity>WARNING</severity>
      <task_ref>SPRINT</task_ref>
      <description>
The RA dossier explicitly flags (point Q2-improve-relevance-caveat) that IMPROVE is NOT a
data source in the Two Towers study and that "mirroring IMPROVE acknowledgement language is
only appropriate if the BROADN dashboard separately ingests IMPROVE aerosol/visibility
data," recommending "PM should confirm with the human whether IMPROVE data is used anywhere
on the site before including this statement." The plan ships A5 (IMPROVE) but does NOT carry
this caveat into risk_flags — it surfaces the A6/RMNP override and the truncated-request
assumption, but not the IMPROVE-relevance question. Shipping A5 is defensible because the
human explicitly requested IMPROVE-network language, but an acknowledgement of a network
whose data the site may not use is a factual-appropriateness risk the human should get to
rule on, on the same footing as the A6 override.
      </description>
      <required_revision>
Add a risk_flags entry directing ORC to confirm with the human (at the same reconciliation
point as the A6/RMNP override) that IMPROVE aerosol/visibility data is actually
displayed/used on the dashboard — else A5 acknowledges a data source that isn't present.
Default remains: include A5 (honors the explicit human request). Surface, do not block.
      </required_revision>
    </challenge>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>WARNING</severity>
      <task_ref>broadn-p20-acknowledgements-02</task_ref>
      <description>
FE's context_files include the RA brief
(.claude/tasks/outputs/broadn-p20-acknowledgements-RA-1784934255.md), which contains a
DIFFERENT NEON acknowledgement paragraph than the packet's A3. The RA brief's point
Q1-verbatim-acknowledgements quotes the Cornell-paper NEON wording ("...NEON is a program
sponsored by the U.S. National Science Foundation and operated under cooperative agreement
by Battelle..."), whereas the packet's A3 is the human/task-spec "Assignable Assets"
wording ("...operated under cooperative agreement by Battelle. This material is based in
part upon work supported by... through the NEON Program. Data collected/used..."). These
are near-duplicate but non-identical. A verbatim task where FE reads a context file holding
a competing phrasing of the same block is a paraphrase-slip vector.
      </description>
      <required_revision>
Non-blocking: FE must reproduce the packet's inline A3 block verbatim — the packet text is
authoritative and OVERRIDES the RA brief's NEON recommendation text. The packet already
inlines all six blocks with a char-for-char mandate, so this is a reinforcement, not a gap.
Optionally add one line to the FE packet: "Where the RA brief and this packet phrase the
same block differently, THIS PACKET is canonical." SC1 anchors 3 & 4 already pin the
packet's A3 wording, so a slip toward the RA variant would fail SC1 — the mechanical guard
holds; this is a friction-reduction note.
      </required_revision>
    </challenge>

  </challenges>

  <audit_risk_forecast>
Two things are most likely to reach the auditor as issues even on faithful execution:

1. A verbatim period-trap slip in A5/A6 ("US" vs "U.S.") landing in a zone no SC1 grep
   covers — caught only if SC4 is executed with the A5/A6 inversion explicitly in mind.
   Adopting the two proposed entity-free greps closes this. (Highest-value target.)

2. Footer-link contrast bookkeeping. The plan's A11Y premise is CORRECT — I computed
   bright teal #0c9cb4 on stone-900 #1c1917 at ~5.36:1 (PASS AA), and deep teal #0c5454 at
   ~2.0:1 (correctly banned). But SC5 requires the color USED to match the ratio UI RECORDS.
   The audit landmine is a UI spec that names #0c9cb4 without stating the ~5.4:1 figure, or
   an FE that applies a slightly different token than the spec recorded. Auditor must check
   the rendered link color against the design_spec's numeric ratio, not just "teal-ish."

Not forecast as risks (verified clean): no false-generator SCs — SC7 uses
`git diff --name-only` (file list, header-safe); all eight SC1 anchors are entity-free
(no `& < > " '`), so HTML-entity encoding cannot silently break them; the DRY guard on the
existing NSF disclaimer (SC3 == 1) is correct; UI→FE sequencing and the ORC-driven
interactive NEON-link check are correctly assigned; no new static asset is introduced
(static-asset closure N/A). The SC-precheck report absence is NOT a process violation —
I confirmed via Glob that broadn-web-view has no `.claude/skills/` tree at all (the skill
lives in gander), so no `sc-precheck-report.json` is producible here; the PM disclosed the
tooling gap and ran the manual Step-7.5 equivalent, which I re-verified. The three declared
`<recurring_pattern>` elements match p17 §6 (config-global load-order, false-generator
git-diff grep, unread-fact provenance) and this plan structurally avoids all three (no JS,
no config globals, no line-sign diff SCs, all codebase facts verified-on-disk — footer
confirmed at index.html:946-961).
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
Read this turn: docs/after-actions/broadn-p17-sample-checkout-cart.md (most recent; §5
recurring-failure patterns + §6 protocol gaps — config-global load-order, false-generator
`git diff | grep '^-'`, unread-fact provenance). Also present and consulted for context:
broadn-teal-rebrand.md, broadn-p12-altitude-single-rail.md (after-actions dir). Verified the
plan's three declared recurring patterns trace to real p17 §6 rows and are all avoided.
Confirmed on disk: index.html footer (946-961), DESIGN.md WCAG tables, absence of
.claude/skills (SC-precheck tooling). No agent-changelog.md deltas contradict this plan.
  </post_mortem_patterns_checked>
</plan_critique>
