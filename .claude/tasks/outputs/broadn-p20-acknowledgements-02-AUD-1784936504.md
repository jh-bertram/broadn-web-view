# Audit Verdict — broadn-p20-acknowledgements-02 (FE ui_packet)

**Auditor:** AUD#1  **Parent:** ORC#0  **Independent from:** FE#1 (implementer), UI#1 (design_spec author)
**Result:** SA PASS · QA PASS · SX SECURE → **AUDIT_PASS**

## Envelope determination (recorded)
Task first-SPAWN is 2026-07-24 (post the 2026-05-28 v2.0 cutover date). However, `broadn-web-view`
is a configuration-only repo that does NOT carry the gander v2.0 audit-pipeline infrastructure:
`.claude/skills/` does not exist here (no `audit-pipeline/SKILL.md §Output Schema (v2.0)` to read,
no `audit-pipeline@2.0.0` provenance-marker skill deployed, no `commit-packet`/`requirements-validate`
substrate-check consumers downstream). The v2.0 typed-wrapper predicate is therefore inapplicable in
this repo; emitting a v2.0 block would fabricate a provenance anchor for a skill version not deployed.
Envelope selected: **legacy three-block** (SA / QA / SX), as the ORC brief and this repo's pipeline
consume. Flagged transparently rather than silently.

---

<audit_review>
  <target_file>index.html (new block lines 961-984, inside &lt;footer id="site-footer"&gt;)</target_file>
  <status>PASS</status>
  <verdict_line>SA: PASS</verdict_line>
  <checks>
    - Semantic HTML: heading order continues page pattern (footer &lt;h2&gt; → two group &lt;h3&gt;);
      native &lt;details&gt;/&lt;summary&gt; disclosure; external ref is a real &lt;a href&gt;. PASS.
    - DRY: pre-existing NSF disclaimer ("do not necessarily reflect the views of NSF") appears
      exactly once — grep -Fc == 1. Not duplicated by the new A1 block. PASS.
    - A11Y contrast (DESIGN.md / WCAG AA): footer link color is --color-accent #0c9cb4 on footer
      bg #1c1917. Auditor-computed WCAG relative-luminance ratio = 5.355:1 ≥ 4.5:1 → AA PASS
      (matches design_spec's recorded ~5.35:1). Deep teal #0c5454 is NOT used in the new block
      (grep -Fc "0c5454" over 961-984 == 0). PASS.
    - Distinguishable-without-color (WCAG 1.4.1): link carries permanent `underline underline-offset-2`
      (thickens on hover) in addition to color. PASS.
    - Focus visibility: summary and link both carry `focus-visible:outline focus-visible:outline-2
      focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]`. PASS.
    - Design tokens: no inline style= in new block (0); no raw/invented hex; all values map to named
      DESIGN.md tokens / existing CSS custom props. PASS.
  </checks>
  <violations>none</violations>
</audit_review>

<test_report>
  <task_id>broadn-p20-acknowledgements-02</task_id>
  <status>PASS</status>
  <verdict_line>QA: PASS</verdict_line>
  <playwright>
    <tier>SKIPPED — static site, file:// Playwright blocked, no dev server (no package.json).
    Per ORC brief, adjudicated via Read/Grep/Bash. NEON URL HTTP 200 already confirmed by ORC;
    live click/link-resolution is the ORC-driven interactive step per the plan's dependency order.</tier>
  </playwright>
  <sc_results>
    - SC1 (8 verbatim anchors): each grep -Fc == 1. PASS.
    - SC1b period-inversion trap: "US Environmental Protection Agency" (no periods) == 1 AND
      "U.S. Forest Service" (with periods) == 1; "U.S. Environmental" == 0, "US Forest Service" == 0.
      Neither normalized to the other. PASS.
    - SC2 NEON link: URL == 1; rel="noopener noreferrer" present on the &lt;a&gt;. PASS.
    - SC3 DRY: NSF disclaimer count == 1. PASS.
    - SC4 (auditor full-block fidelity): all six blocks A1–A6 read against packet verbatim,
      character-for-character (HTML-entity equivalence only):
        A1 — "Award # 2120117" (spaces around #) preserved; "University&#39;s" apostrophe preserved. MATCH.
        A2 — MATCH. A3 — "Data collected/used" slash preserved; link text "NEON data citation &amp;
        acknowledgement guidelines" = "…&…". MATCH. A4 — MATCH. A5 — "US" no periods. MATCH.
        A6 — "U.S. Forest Service" periods. MATCH.
      All six verbatim. PASS.
    - Tag balance (new block): div 6/6, p 6/6, h2 1/1, h3 2/2, details 1/1, summary 1/1, a 1/1 —
      well-formed. (FE packet self-reported p 7/7; actual markup is 6 paragraphs = 6/6, balanced.
      Harmless over-count in the self-report, not a defect.) PASS.
    - SC6 keyboard/semantics: native &lt;details&gt;/&lt;summary&gt; is keyboard-operable
      (Enter/Space) by default; summary label "View funding, site access & facility acknowledgements"
      is descriptive and not a verbatim repeat of the h2. PASS.
  </sc_results>
  <defects>none</defects>
</test_report>

<security_audit>
  <status>SECURE</status>
  <verdict_line>SX: SECURE</verdict_line>
  <threat_level>LOW</threat_level>
  <findings>
    - External link carries rel="noopener noreferrer" (reverse-tabnabbing defense). No target="_blank"
      (0 in file). SECURE.
    - Inert static content: no inline JS, no event handlers, no javascript: URIs in the new block.
      The single onclick in index.html is a PRE-EXISTING button at line 320 (clearAllTags()),
      unrelated to and outside this task's block (961-984). SECURE.
    - No secrets, no new assets, no new network calls beyond the one external &lt;a href&gt; reference. SECURE.
    - Scope: git diff --name-only HEAD = index.html (this task) + two pre-existing session-start
      files (SESSION-CHECKPOINT-2026-07-23.md, docs/SESSION-CHECKPOINT.md) NOT part of this packet.
      No app.js, data.json, or covariates.json touched. SECURE.
  </findings>
</security_audit>

---
**Overall: AUDIT_PASS.** No required fixes. The read-only auditor cannot drive the NEON link click;
the live link-resolution check remains ORC-owned per the plan's dependency order (ORC has confirmed
HTTP 200).
