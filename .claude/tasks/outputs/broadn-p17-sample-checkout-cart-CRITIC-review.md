<plan_critique>
  <plan_id>broadn-p17-sample-checkout-cart</plan_id>
  <status>BLOCK</status>

  <challenges>

    <challenge>
      <type>ASSUMPTION</type>
      <severity>BLOCKER</severity>
      <task_ref>broadn-p17-t3-fe</task_ref>
      <description>
The plan asserts three times (Pre-flight decision §2; T3 description "Wiring"; T3 context_files;
routing_notes "Endpoint decision") that `window.BROADN_FEEDBACK_URL` is "set inline in index.html"
and instructs FE to mirror "the existing window.BROADN_FEEDBACK_URL block" there. This is FALSE.
Verified against the codebase: `index.html:979` loads `<script src="assets/feedback-config.js">`,
and `assets/feedback-config.js:4` is where `window.BROADN_FEEDBACK_URL` is actually set — with a
REAL, already-deployed `/exec` URL (per session-2026-04-27-pages-build-fix §7). A repo-wide grep for
`BROADN_FEEDBACK_URL` returns feedback-config.js (setter), feedback-widget.js (reader), SETUP.md
(doc) — never an inline index.html block. Consequences: (1) FE's context pointer
"index.html (BROADN_FEEDBACK_URL global block to mirror...)" directs the implementer to a block that
does not exist; FE will either waste a cycle or improvise. (2) The established, auditor-known config
pattern (p8 §4 SA gate checks asset-load order / pattern consistency) is a dedicated config file
loaded by a script tag — implementing an inline block instead DIVERGES from that pattern. (3) The
"same /exec URL as feedback" coherence claim (decision §2) is untethered: the live URL sits in
feedback-config.js, so the plan must state explicitly where BROADN_REQUEST_URL is read from and
whether it is seeded with that URL or ships unconfigured.
      </description>
      <required_revision>
Correct the factual claim everywhere it appears: the existing feedback URL is set in
`assets/feedback-config.js:4` (script-tag loaded at index.html:979), NOT inline in index.html.
Then specify the ACTUAL wiring mechanism for `window.BROADN_REQUEST_URL`, choosing one and updating
the T3 description + context_files + success_criteria to match:
  (a) add the request global to the existing `assets/feedback-config.js` (true mirror of the site's
      config-file pattern), OR
  (b) create a new `assets/request-config.js` + a script tag in index.html (parallel file), OR
  (c) an explicit inline index.html config script (acceptable, but state it as a deliberate
      divergence from the feedback-config.js pattern, not as "mirroring" it).
Also state the seed decision: given decision §2 ("normally the same /exec URL"), either default
BROADN_REQUEST_URL to the URL already in feedback-config.js (feature live on deploy) or explicitly
document that requests ship unconfigured pending the human wiring step (consistent with p8) — do not
leave it implied. NOTE: options (a) and (b) push T3 to 4 distinct files (app.js, cart.css,
config-file, index.html) which trips the mandatory 4-file split rule; option (c) keeps T3 at 3 files
(app.js, cart.css, index.html). Pick the mechanism with the file-count consequence in mind.
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>broadn-p17-t1-ui / broadn-p17-t3-fe</task_ref>
      <description>
DESIGN.md (v2) has NO dedicated modal-scrim / backdrop / overlay token. The token table contains
`--color-tooltip-bg = rgba(28,25,23,0.92)` (a dark overlay used for chart tooltips) and
`--color-weather-overlay` (a chart line color), plus prose "slide-in overlay with backdrop" for the
sidebar — but nothing named for a `role=dialog` scrim. Both T1 (must trace every color to a named
DESIGN.md token, no raw hex) and T3 (all new colors map to a DESIGN.md token) require the dialog
overlay to have a token. Without a decision the designer will either invent a raw rgba (fails the
no-raw-hex SC) or edit DESIGN.md unilaterally (forbidden this sprint).
      </description>
      <required_revision>
Already partially anticipated in routing_notes ("surface a flag if the designer finds a genuinely
missing token e.g. a dedicated modal-scrim"). Make it concrete in the T1 packet: instruct the
designer to reuse `--color-tooltip-bg` for the dialog scrim if acceptable, and ONLY if it is not, to
surface a "missing modal-scrim token" flag to ORC rather than editing DESIGN.md. This removes the
ambiguity that otherwise reaches the SA gate as a raw-hex finding.
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>broadn-p17-t3-fe</task_ref>
      <description>
`STAGE_BADGE_CLASSES.sequenced = 'bg-green-100 text-green-800'` at app.js:1523 is a pre-existing,
explicitly out-of-scope data-semantic badge that retains `text-green-800`. The T3 "no CSU green" SC
is correctly scoped ("...in the new cart code / request path"), but an auditor running an unscoped
`grep -E 'green-800' assets/app.js` will hit line 1523 and could raise a false "CSU green remains"
FAIL after the mailto cell (the other green consumer) is removed.
      </description>
      <required_revision>
Add an explicit auditor note to the dependency_order QA guidance: the "no CSU green" grep for T3
MUST be scoped to the new cart/request code and the (removed) request cell — NOT a global app.js
grep — because STAGE_BADGE_CLASSES.sequenced (line 1523) is a pre-existing pipeline-data badge that
is out of scope and legitimately retains green-100/green-800.
      </required_revision>
    </challenge>

    <challenge>
      <type>SCOPE_DRIFT</type>
      <severity>WARNING</severity>
      <task_ref>SPRINT</task_ref>
      <description>
The Goal phrase "persistent cart badge/count" is scoped by the PM to in-session persistence
(survives Explorer re-render/pagination) with cross-reload localStorage deferred. This is a
reasonable reading, but "persistent" is human-facing wording that a human could read as
reload-durable. The PM surfaced this in risk_flags (good — not silently dropped), but it is an
interpretation of intent, not a confirmed decision.
      </description>
      <required_revision>
No plan change required; ORC should confirm with the human that in-session persistence (no
cross-reload localStorage) satisfies "persistent" before close, so it is not discovered as a gap at
delivery. Keep the risk_flag.
      </required_revision>
    </challenge>

  </challenges>

  <audit_risk_forecast>
Top items most likely to surface at the audit gate even on faithful execution:
1. **Config pattern consistency (SA gate).** However the BLOCKER is resolved, the SA gate (p8 §4
   checks asset-load order + pattern consistency) will scrutinize whether BROADN_REQUEST_URL follows
   the established feedback-config.js convention. Resolve the mechanism explicitly so this is not an
   audit-time debate.
2. **Reference-only Zod (SX/SA gate).** The T2 "SampleRequestInputSchema" is a documentation
   artifact (no bundler on this static site). The plan flags this, but the auditor should be told in
   the packet not to read a missing runtime-Zod import as a standards defect — the runtime validator
   is the hand-written vanilla JS in T3, mirroring the p8 feedback widget.
3. **Dialog scrim token (SA gate).** No dedicated DESIGN.md modal-scrim token (see WARNING 2);
   expect a raw-hex flag unless the reuse-vs-flag decision is pinned in T1.
p8-g1/g2/g3 are all closed by the current SCs (surgical-edit + byte-stable git diff; offsetParent
filter grep-verified + partial-state Tab matrix; sanitizeForSheet reuse count==1 + SETUP.md
revocation section) — no residual gap there.
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
- docs/post-mortems/broadn-p8-feedback-widget.md — §6 g1 (heredoc/destructive overwrite → surgical
  Edits + byte-stable git-diff SC on Code.gs/SETUP.md: CLOSED), g2 (focus-trap offsetParent filter →
  T3 SC grep-verified + partial-state Tab/Shift+Tab: CLOSED), g3 (formula-injection sanitizer +
  endpoint-revocation doc → T2 SCs: CLOSED). §7 contracts (payload/column/response shape, client
  ignores server error text) correctly mirrored.
- Recurrence declarations checked: PM enumerated 6 <recurring_pattern> elements (p8-g1/g2/g3,
  teal-rebrand consumer-sweep + stale-cache, p12 shared-container-state). MISSING_RECURRENCE_
  DECLARATION does not apply.
- SC-locked-value precheck: no report attached. Accepted — this is a code sprint with zero
  locked-verbatim-frontmatter / copy-string SCs (SCs grep code identifiers for removal + structural
  presence, all satisfiable on faithful execution); the sc-locked-value-consistency skill is a
  gander-meta frontmatter tool not present/applicable in broadn-web-view, and the PM justified
  NOT APPLICABLE inline (routing_notes Step 7.5). Manual fallback scan of every grep/diff SC found
  no self-defeating locked-value contradiction. MISSING_SC_PRECHECK_REPORT not raised.
- Codebase assertions verified true: Code.gs sanitizeForSheet single def / buildResponse /
  feedback validation after JSON.parse / early-branch placement coherent; app.js mailto path
  (buildRequestHref, REQUEST_EMAIL_TO/CC, cell at 1769) + row shape confirmed; feedback-widget.js
  fetch pattern at 475-482 confirmed. One assertion FALSE → the config-location BLOCKER above.
  </post_mortem_patterns_checked>
</plan_critique>

---

# REV 1 RE-GATE (2026-07-10)

<plan_critique>
  <plan_id>broadn-p17-sample-checkout-cart (REV 1)</plan_id>
  <status>BLOCK</status>

  <blocker_disposition>
**Original BLOCKER (config-location factual error): CLEARED — verified on disk, not from the PM
summary.**
- The false "config set inline in index.html" claim is gone everywhere. Pre-flight §2 (lines 32–43),
  routing_notes REV-1 note (466–470) and "Config mechanism (D1)" (489), and T3 (319–322, 362–363,
  404–405) all now correctly state the config lives in `assets/feedback-config.js:4`, loaded by
  `index.html:979`. No remaining assertion of an inline index.html FEEDBACK_URL block. Confirmed
  against disk: feedback-config.js:4 holds the live `/exec` URL; index.html:979 is the script tag.
- `window.BROADN_REQUEST_URL` is reassigned to **T2/BE** (lines 196–201, 279, must_contain 295) and
  seeded with the same live URL; T3 explicitly does NOT edit feedback-config.js (out_of_scope 420,
  context_files 404 READ-ONLY, must_not_contain 441). No dangling dependency: T3 depends on T2
  (408), and feedback-config.js is a T2 Wave-0 deliverable audited before Wave-1 T3 runs.
- `doPost` discriminator (`payload.kind === 'sample_request'`, lines 211–215, 264–266) is coherent:
  the live feedback client sends no `kind` field (verified feedback-widget.js payload has no `kind`),
  so feedback falls through to the byte-stable default branch. The `kind` field is in the T2 contract
  (225) and sent by T3 (352, 384). Contract/consumer consistent.
- T3 file list is app.js / cart.css / index.html = 3 files (319, 414–415, 489) — under the 4-file
  split rule. index.html is touched by T3 only; BE does not edit it (200–201, 514). No shared-file
  collision.

**Four folded decisions all landed:**
- D2 (in-session cart): stated (332–335), SC `grep -c 'localStorage' == 0` (375), must_not_contain
  (439), out_of_scope (423). Present.
- D3 (scrim): T1 pins `--color-tooltip-bg` (133–137), SC (148), must_contain (173). Present.
- D4 (CSU-green scoped grep): scoped to ADDED diff lines with a token filter (391–393) — the
  `+++ b/` diff header is filtered out by the `green-*` token grep, and app.js:1523 is untouched so
  it never appears on a `^+` line. Correct; my prior WARNING is resolved.
- Zod reference-only: T2 auditor note (243–246), SC (270–272), must_contain (297). Present.
  </blocker_disposition>

  <challenges>
    <challenge>
      <type>AUDIT_RISK</type>
      <severity>BLOCKER</severity>
      <task_ref>broadn-p17-t2-be</task_ref>
      <description>
NEW defect introduced in REV 1. The feedback-config.js insert-only success criterion (line 257) is
mechanically unsatisfiable on faithful execution:
  `git diff HEAD -- assets/feedback-config.js | grep -c '^-'` == 0
`git diff` always emits a `--- a/assets/feedback-config.js` file header line, which begins with `-`
and therefore MATCHES `^-`. For a correct insert-only edit (adding the BROADN_REQUEST_URL line),
`grep -c '^-'` returns **1** (the header), never 0. The SC as written FAILS on exactly the change it
is meant to verify — a false-FAIL generator of the same class as the awk-range / diff-recipe defects
this team blocks on. An auditor running the literal recipe bounces a correct BE edit, or must
silently override — defeating the purpose of a mechanical SC.
(Note: the structurally similar Code.gs SC at line 260 and the D4 green SC at 393 are NOT affected —
both pipe through a second token grep that filters out the `---`/`+++` header line. Only this bare
`grep -c '^-'` is broken.)
      </description>
      <required_revision>
Rewrite the feedback-config.js insert-only SC so the diff header cannot false-trigger. Any of:
  - `git diff HEAD -- assets/feedback-config.js | grep -c '^-[^-]'` == 0  (a removed CONTENT line
    starts `-` + non-dash; the `---` header has a second dash and is excluded), OR
  - `git diff HEAD -- assets/feedback-config.js | grep '^-' | grep -vc '^---'` == 0, OR
  - assert the existing line is present post-edit AND exactly one line was added:
    `grep -c 'BROADN_FEEDBACK_URL' assets/feedback-config.js` == 1 (unchanged) plus
    `grep -c 'BROADN_REQUEST_URL' assets/feedback-config.js` == 1 (added).
Update the SC text at line 257 and the mirrored expectation-manifest receipt_check (566).
      </required_revision>
    </challenge>

    <challenge>
      <type>AUDIT_RISK</type>
      <severity>WARNING</severity>
      <task_ref>broadn-p17-t3-fe</task_ref>
      <description>
Consequence of D1's live-seed decision. Because BROADN_REQUEST_URL now ships seeded with the REAL
`/exec` URL, `IS_CONFIGURED` is TRUE at audit time and the checkout Submit is enabled against the
human's live Google endpoint. In p8 the feedback URL was empty at audit time, so an accidental
submit was a no-op; here an un-intercepted Submit click during audit(t3-fe) QA would POST a real
sample_request and append junk rows to the human's live Requests sheet. The dependency_order QA note
(457–461) does mandate a route-intercepted mock, which mitigates — but the footgun is new and the
"intercept BEFORE any submit click" ordering is not stated as mandatory.
      </description>
      <required_revision>
Strengthen the audit(t3-fe) QA note: route interception MUST be installed before any Submit
activation, and the QA run must never exercise Submit against the live-seeded URL without an active
route mock. (Optionally: have QA temporarily null the global in the test harness.) This is a note to
the QA/auditor, not a code change — no re-decomposition needed.
      </required_revision>
    </challenge>
  </challenges>

  <audit_risk_forecast>
- The D4 green-scoped grep (`git diff HEAD -- assets/app.js assets/cart.css index.html | grep '^+'
  ...`) will not see a NEW untracked `cart.css` (git diff HEAD omits untracked files until staged).
  Not a blocker: the SA gate inspects cart.css directly for tokens/no-green, and must_not_contain
  covers it — but the auditor should token-review cart.css directly rather than rely solely on that
  diff grep.
- Reference-only Zod and the dialog-scrim token decision remain the two SA-gate items to watch; both
  are now pinned in the packets (T2 auditor note; T1 `--color-tooltip-bg`), so they should pass.
- p8-g1/g2/g3 remain closed; REV 1 additionally hardened g1 with the feedback-config.js insert-only
  constraint (once the SC recipe is fixed per the blocker above).
  </audit_risk_forecast>

  <post_mortem_patterns_checked>
- broadn-p8-feedback-widget.md §6 g1/g2/g3 re-checked against REV 1: all closed; g1 extended to
  feedback-config.js (surgical/insert-only) and Code.gs default-branch byte-stability.
- Verified on disk (not from PM summary): feedback-config.js:4 live URL + index.html:979 loader;
  feedback-widget.js payload carries no `kind` field (so the discriminator's fall-through is safe);
  Code.gs default feedback branch untouched by the early `kind` branch.
- Re-gate scope honored: locked human decisions (Apps Script bridge; multi-sample cart) NOT
  re-opened. Only execution defects assessed.
  </post_mortem_patterns_checked>
</plan_critique>
