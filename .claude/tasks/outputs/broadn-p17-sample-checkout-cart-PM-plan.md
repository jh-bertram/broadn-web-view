# PM Decomposition — broadn-p17-sample-checkout-cart (REV 2, post-Critic)

Author: PM#0 · Date: 2026-07-10 · Working dir: /home/jhber/projects/broadn-web-view

Reads consumed: after-actions p12 §6, teal-rebrand §6, post-mortem p8 (full), `apps-script/Code.gs`
(full), `assets/app.js` 1520–1800, plus (REV 1) `assets/feedback-config.js` (full) + `index.html`
config-load grep. Within budget.

**REV 2 changelog (Critic 2nd-round — one trivial blocker + one WARNING; no structural change):**
- **BLOCKER fixed** — the T2 `feedback-config.js` insert-only SC used a bare `grep -c '^-'`, which
  can never be 0 because `git diff` always emits a `--- a/…` header line matching `^-`. Changed to
  `grep -c '^-[^-]'` (counts real deletion lines only). Swept the plan for any other bare `grep -c
  '^-'`; the Code.gs SC and the D4 green SC already pipe through a second token grep that drops the
  header — left unchanged as the Critic confirmed.
- **WARNING addressed** — added an explicit "route-intercept BEFORE any Submit click; never reach the
  live endpoint" note to the T3 packet and the audit(t3-fe) criteria, because D1 seeds
  `BROADN_REQUEST_URL` with the REAL live `/exec` URL (a live Submit during QA would append junk rows
  to the human's real Sheet).

**REV 1 changelog (Critic 1st-round CRITIQUE_BLOCK + 4 ORC decisions):**
- **BLOCKER fixed** — corrected the false "config set inline in `index.html`" claim. Verified on disk:
  `assets/feedback-config.js:4` holds a live deployed `/exec` URL; `index.html:979` loads it.
- **D1** — `window.BROADN_REQUEST_URL` added to the existing `feedback-config.js`, seeded with the
  same live URL; **BE (T2) owns that one-line edit**; `doPost` routes by a `kind` discriminator.
- **D2** — cart is **in-session only** (no localStorage); stated in T3.
- **D3** — dialog scrim reuses `--color-tooltip-bg`; stated in T1.
- **D4** — the no-CSU-green SC is scoped to git-diff new/changed lines (excludes the legitimate
  pre-existing `STAGE_BADGE_CLASSES.sequenced` green at `app.js:1523`).

---

## Pre-flight decisions stated up front (so they are decisions, not accidents)

1. **mailto path — REMOVE it.** `buildRequestHref()`, `REQUEST_EMAIL_TO`, `REQUEST_EMAIL_CC` (app.js
   ~1536, ~1565–1589) and the per-row `Request ✉` `<a href=mailto…>` cell (~1769) are deleted and
   replaced by an add-to-cart control. Rationale: the Explorer table is 100% JS-rendered
   (`renderTable()` builds `innerHTML`) — there is **no** no-JS render of rows, so a "no-JS mailto
   fallback" is moot: with JS off there are no rows to request. Keeping mailto would also strand the
   retired-CSU-green button classes (`border-green-700 text-green-800 hover:bg-green-50`) on that
   cell. Single clean path. (Alternative — keep mailto as the unconfigured-endpoint fallback — is
   flagged in `<risk_flags>` for ORC/human override.)

2. **Endpoint global — new `window.BROADN_REQUEST_URL` in the existing `assets/feedback-config.js`.**
   CORRECTED FACT (Critic BLOCKER; PM-verified on disk 2026-07-10): the site's config is NOT inline
   in `index.html`. `assets/feedback-config.js:4` sets `window.BROADN_FEEDBACK_URL =
   "https://script.google.com/macros/s/AKfycbxdA09.../exec"` — a **real, already-deployed** `/exec`
   URL — and `index.html:979` loads it via `<script src="assets/feedback-config.js">`. The new
   `window.BROADN_REQUEST_URL` is added to that SAME `feedback-config.js` file (true mirror of the
   site's config-file pattern), **seeded with the SAME live `/exec` URL** — so the client half ships
   **live-on-deploy**, no human wiring step for the URL. This one-line config edit is owned by
   **T2 (BE)** (BE owns the endpoint + deployment story; also keeps T3's file count down). FE (T3)
   only *reads* `window.BROADN_REQUEST_URL` with an `IS_CONFIGURED` gate; when unset, add-to-cart
   still works but the final **Submit** is disabled with an explanatory message (no mailto
   resurrection). NOTE (QA safety): because the seed is the REAL live endpoint, `IS_CONFIGURED` is
   true at audit time — the QA walk MUST route-intercept before any Submit (see T3 + audit criteria).

3. **doPost routes by an explicit `kind` discriminator.** Because ONE shared `/exec` deployment
   serves both handlers, `doPost(e)` branches on a `kind` field: `payload.kind === 'sample_request'`
   → `handleSampleRequest` → `Requests` tab; otherwise the existing feedback branch → `Feedback` tab,
   byte-stable. Today's feedback payload has no `kind` field, so the default branch naturally and
   safely covers it (no feedback-client change needed).

4. **Batch model — one Sheet row per requested sample**, all rows in a batch sharing a
   server-generated `request_id` + the requester fields. Row-per-sample makes each sample
   individually filterable/fulfillable in the sheet (the "trackable" requirement). One POST → N rows.

5. **Zod is reference-only here.** The site has no bundler/npm — vanilla ES5 IIFE. Gander's "Zod at
   every boundary" standard is satisfied as a **documentation/reference schema** in the BE contract;
   the runtime client validator is hand-written vanilla JS (as the p8 feedback widget did). The T2
   packet instructs the auditor NOT to read a missing runtime-Zod import as a standards defect.

6. **Cart is in-session only (D2).** No localStorage; reloading/closing the page empties the cart.
   Cross-visit persistence is explicitly deferred. (Stated in the T3 packet.)

---

## Verbatim Deliverable Audit

Every noun/verb phrase from the `<orchestrator_brief>` Goal + locked decisions, mapped to a packet.

```xml
<verbatim_deliverable_audit>
  <phrase text="sample-checkout feature"><addressed task="broadn-p17-t3-fe"/></phrase>
  <phrase text="multi-sample cart"><addressed task="broadn-p17-t3-fe"/></phrase>
  <phrase text="collect samples across the Explorer table"><addressed task="broadn-p17-t3-fe"/></phrase>
  <phrase text="add-to-cart control per Explorer row"><addressed task="broadn-p17-t3-fe"/></phrase>
  <phrase text="persistent cart badge/count"><addressed task="broadn-p17-t3-fe"/></phrase>
  <phrase text="review the batch / review/checkout step"><addressed task="broadn-p17-t3-fe"/></phrase>
  <phrase text="one request form (requester name, email, affiliation, intended use)"><addressed task="broadn-p17-t3-fe"/></phrase>
  <phrase text="submit the whole batch in one POST"><addressed task="broadn-p17-t3-fe"/></phrase>
  <phrase text="written to a Google Sheet via the existing Apps Script bridge"><addressed task="broadn-p17-t2-be"/></phrase>
  <phrase text="extend apps-script/Code.gs (feedback collector)"><addressed task="broadn-p17-t2-be"/></phrase>
  <phrase text="append rows to a Requests sheet tab"><addressed task="broadn-p17-t2-be"/></phrase>
  <phrase text="same CORS-safe fetch pattern (text/plain;charset=utf-8)"><addressed task="broadn-p17-t3-fe"/></phrase>
  <phrase text="no hosted server, no npm backend, no new infra / 100% static"><addressed task="broadn-p17-t2-be"/></phrase>
  <phrase text="captured, trackable batch request"><addressed task="broadn-p17-t2-be"/></phrase>
  <phrase text="replaces per-row mailto link"><addressed task="broadn-p17-t3-fe"/></phrase>
  <phrase text="UI Designer for the cart affordance before FE"><addressed task="broadn-p17-t1-ui"/></phrase>
  <phrase text="contract-first payload shape before FE wires submit"><addressed task="broadn-p17-t2-be"/></phrase>
  <phrase text="formula-injection sanitization on user fields written to Sheet"><addressed task="broadn-p17-t2-be"/></phrase>
  <phrase text="deployment-revocation procedure in SETUP.md"><addressed task="broadn-p17-t2-be"/></phrase>
  <phrase text="dialog focus trap with offsetParent !== null filter"><addressed task="broadn-p17-t3-fe"/></phrase>
  <phrase text="no destructive overwrites of Code.gs / DESIGN.md"><addressed task="broadn-p17-t2-be"/></phrase>
  <phrase text="aria-live for cart count + submit status; 44x44 targets; keyboard-operable; focus return"><addressed task="broadn-p17-t3-fe"/></phrase>
  <phrase text="IS_CONFIGURED graceful degradation when endpoint unset"><addressed task="broadn-p17-t3-fe"/></phrase>
  <phrase text="request-status tracking"><out_of_scope reason="explicitly deferred by SCOPE DISCIPLINE preflight"/></phrase>
  <phrase text="auth"><out_of_scope reason="explicitly deferred by SCOPE DISCIPLINE preflight"/></phrase>
  <phrase text="admin dashboards"><out_of_scope reason="explicitly deferred by SCOPE DISCIPLINE preflight"/></phrase>
  <phrase text="email notifications"><out_of_scope reason="explicitly deferred by SCOPE DISCIPLINE preflight"/></phrase>
  <phrase text="localStorage cross-reload cart persistence"><deferred reason="D2: cart is in-session only; cross-visit persistence explicitly deferred"/></phrase>
</verbatim_deliverable_audit>
```

No unilateral renames of human-provided words. No locked-vs-verbatim conflicts (all locked
decisions align with the human request).

---

<task_decomposition task_id="broadn-p17-sample-checkout-cart" agent_count="3">

<task_packets>

<task_packet>
  <task_id>broadn-p17-t1-ui</task_id>
  <assigned_to>ui-designer</assigned_to>
  <priority>HIGH</priority>
  <description>
Produce a design spec for the sample-checkout cart on the BROADN Data Explorer. Cover, as distinct
spec sections:
  (1) **Add-to-cart row control** — replaces the current per-row "Request ✉" cell in the Explorer
      table. Default state ("Add to cart") and in-cart state ("Remove" or "In cart ✓"). Must be a
      ≥44×44px keyboard-operable control.
  (2) **Persistent cart badge/count** — always-visible affordance showing the number of samples in
      the cart, with distinct visual treatment for the 0-item (empty), 1-item, and many-item states,
      and a way to open the checkout review from it.
  (3) **Checkout review panel** — lists the samples currently in the cart with a per-item remove
      control; specify the empty-cart appearance and the many-item (scrolling) appearance.
  (4) **Request-form dialog** — `role=dialog aria-modal=true` overlay containing the four form
      fields (requester name, requester email, affiliation, intended use) + a Submit control.
  (5) **All interaction states** — empty cart, one item, many items, submitting, success, error, and
      endpoint-unconfigured (Submit disabled + message).
  (6) **Focus behaviour** — focus moves into the dialog on open and returns to the triggering control
      on close.

**Dialog scrim (D3):** DESIGN.md has NO dedicated modal-scrim token. Default: specify the
checkout-dialog scrim/overlay as **`--color-tooltip-bg` (`rgba(28,25,23,0.92)`)** — reuse, no new
token. (You MAY instead propose a surgical `--color-scrim` addition to DESIGN.md WITH written
rationale if you make the case, but reuse of `--color-tooltip-bg` is the default and needs no
DESIGN.md edit.)

Decide and state explicitly whether the dialog/review styling **reuses the existing
`assets/feedback-widget.css` dialog pattern** or **specifies new cart styling** (recommend new,
additive styling so feedback-widget.css stays byte-stable — but justify the choice).
  </description>
  <success_criteria>
- Spec covers all 6 sections above with every state enumerated.
- Every color / spacing / typography / radius value traces to a **named DESIGN.md v2 token** (e.g.
  `--color-primary #0c5454`, `--color-accent #0c9cb4`, `--color-surface`, `--color-error`,
  `--color-success`). `<design_system_source>DESIGN_MD</design_system_source>`.
- The dialog scrim value is specified as `--color-tooltip-bg` (or, if a `--color-scrim` token is
  proposed instead, the DESIGN.md addition is surgical and carries a rationale).
- Min touch target 44×44px is called out for every interactive control.
- The reuse-vs-new dialog-styling decision is stated with rationale.
- No raw hex values; no CSU green (retired); no backend/API/payload detail (that is T2's domain).
  </success_criteria>
  <context_files>
DESIGN.md (v2 token source of truth — token list also excerpted in the brief; `--color-tooltip-bg = rgba(28,25,23,0.92)` is the scrim reuse target)
assets/feedback-widget.css (reference dialog pattern to reuse-or-diverge-from — READ-ONLY, do not edit)
assets/app.js:1710-1772 (renderTable — the row/cell the add-to-cart control replaces; READ-ONLY)
  </context_files>
  <dependencies>NONE (Wave 0)</dependencies>
  <out_of_scope>
Do NOT specify payload shape, Sheet columns, fetch/CORS details, or Apps Script behaviour (T2).
Do NOT write CSS/JS implementation — spec only. Do NOT edit feedback-widget.css. Do NOT introduce
CSU green or any non-DESIGN.md color. Do NOT add DESIGN.md tokens beyond (optionally) a single
justified `--color-scrim` — the default is to reuse `--color-tooltip-bg` with no edit.
  </out_of_scope>
  <output_expected>
    <tag>design_spec</tag>
    <must_contain>
      <item>Add-to-cart control spec with default + in-cart states and 44×44 target</item>
      <item>Cart badge/count spec with 0/1/many visual states</item>
      <item>Checkout review panel spec (empty + populated + many)</item>
      <item>Request-form dialog spec (role=dialog, 4 fields, submit) with submitting/success/error/unconfigured states</item>
      <item>Dialog scrim specified as --color-tooltip-bg (or a justified --color-scrim proposal)</item>
      <item>design_system_source = DESIGN_MD with every token named</item>
      <item>Explicit reuse-vs-new dialog-styling decision</item>
    </must_contain>
    <must_not_contain>
      <item>raw hex values (must be DESIGN.md tokens)</item>
      <item>CSU green</item>
      <item>payload/fetch/Apps Script detail</item>
    </must_not_contain>
    <success_signal>design_spec file written at the output path with all 6 sections, named tokens, and the scrim decision; no raw hex.</success_signal>
  </output_expected>
</task_packet>

<task_packet>
  <task_id>broadn-p17-t2-be</task_id>
  <assigned_to>backend</assigned_to>
  <priority>BLOCKER</priority>
  <description>
Extend the existing Google Apps Script bridge to accept a **sample-request batch** and append one
row per sample to a new **"Requests"** Sheet tab; wire the client config global; and define the
client↔server payload contract that FE (T3) builds against. Contract-first: payload shape + column
order must be finalized before FE wires the submit.

**Config wiring (D1) — `assets/feedback-config.js` (one-line surgical add):**
- Add `window.BROADN_REQUEST_URL = "<same live /exec URL already at line 4>";` to
  `assets/feedback-config.js`, seeded with the SAME URL as the existing `window.BROADN_FEEDBACK_URL`
  (one shared deployment serves both handlers). `index.html:979` already loads this file, so no
  `index.html` edit is needed for the global. Do NOT modify or reformat the existing
  `BROADN_FEEDBACK_URL` line.

**Code.gs — SURGICAL EDITS ONLY (never a full-file rewrite):**
- Add top-level consts: `REQUEST_SHEET_NAME = 'Requests'` and a `REQUEST_HEADERS` array (see column
  order below). Do NOT touch the existing `SHEET_NAME='Feedback'`, `HEADERS`, or `SHEET_ID` const.
- Add a `handleSampleRequest(payload)` function that: opens `SHEET_ID`, gets the `Requests` tab
  (create-header-row-on-first-write like the feedback path; if the tab is missing, return
  `{ok:false, error:'Requests sheet not found'}`), generates a server-side `timestamp` (ISO) and a
  `request_id` (`Utilities.getUuid()`), then iterates `payload.samples` and calls `appendRow(...)`
  **once per sample** in the exact fixed column order.
- Modify `doPost(e)` with a **single early branch by discriminator (D1)** placed immediately AFTER
  `JSON.parse`, BEFORE the existing feedback `feedback_text` validation:
  `if (payload.kind === 'sample_request') { return handleSampleRequest(payload); }`. The existing
  feedback code path below it stays byte-identical (today's feedback payload has no `kind` field →
  falls through to feedback → `Feedback` tab, unchanged).
- **Reuse the existing `sanitizeForSheet` helper** (do NOT duplicate it) on every user- AND
  data-derived string field written to a Requests cell. `timestamp` and `request_id` are
  server-generated and exempt.
- All responses go through the existing `buildResponse` (`{ok:true}` / `{ok:false, error}`).

**Payload contract (deliver as a documented section — the canonical contract FE builds against):**
Client sends JSON-stringified body, `Content-Type: text/plain;charset=utf-8`:
```
{
  kind: 'sample_request',    // REQUIRED discriminator — routes doPost to the Requests handler
  samples: [ { sample_id, sample_type, sample_site, sample_date, sample_project, sample_stage }, ... ],  // required, non-empty
  requester_name:  string,   // required non-empty
  requester_email: string,   // required
  affiliation:     string,   // required non-empty
  intended_use:    string,   // required non-empty
  page_url:        string,
  user_agent:      string
}
```
Server generates `timestamp` + `request_id`; emits ONE row per sample.
Requests column order (FIXED once set — never reorder):
```
[ Timestamp, Request ID, Requester Name, Requester Email, Affiliation, Intended Use,
  Sample ID, Sample Type, Sample Site, Sample Date, Sample Project, Sample Stage,
  Page URL, User Agent ]
```
Express the payload additionally as a **reference Zod schema** (`SampleRequestInputSchema`) in the
contract doc for standards traceability. **Auditor note (put this in the packet):** this Zod schema
is a REFERENCE/documentation artifact only — the site has no bundler, so there is intentionally NO
runtime Zod import; the runtime validator is hand-written vanilla JS in T3. Do NOT treat a missing
runtime-Zod import as a standards defect.

**SETUP.md — SURGICAL EDITS ONLY:** add a "Requests sheet" section (how to create the `Requests`
tab + its column order), a note that the client config global lives in `feedback-config.js`, and a
**deployment-revocation procedure** section (how to revoke/re-deploy the `/exec` URL; note the single
deployment serves BOTH handlers, so revoking it disables both; and that the human must paste the
updated Code.gs into the Apps Script project and re-deploy for the Requests handler to go live).
  </description>
  <success_criteria>
- `assets/feedback-config.js`: `window.BROADN_REQUEST_URL` added, value identical to the existing
  `window.BROADN_FEEDBACK_URL`; the existing `BROADN_FEEDBACK_URL` line is byte-unchanged. Insert-only
  check (header-safe — a bare `grep -c '^-'` would false-count the `--- a/…` diff header, so anchor
  on real deletion lines): `git diff HEAD -- assets/feedback-config.js | grep -c '^-[^-]'` == 0.
- `git diff apps-script/Code.gs`: the existing Feedback (default) branch is unchanged — `HEADERS`
  array, `SHEET_NAME = 'Feedback'`, and the feedback `appendRow([...])` column order are
  byte-identical to HEAD. Verify: `git diff HEAD -- apps-script/Code.gs | grep -E '^-' | grep -E "SHEET_NAME = 'Feedback'|'Timestamp',|'Feedback',"` returns nothing.
- New `REQUEST_SHEET_NAME='Requests'` const and `REQUEST_HEADERS` (14 columns, exact order above) present.
- `handleSampleRequest` appends exactly one row per `payload.samples[i]` in the fixed column order;
  auto-creates the header row on first write.
- `doPost` routes to `handleSampleRequest` when `payload.kind === 'sample_request'` and does so
  BEFORE the feedback-text validation; the feedback default branch is otherwise untouched and remains
  the fall-through for payloads with no `kind`.
- **Formula-injection sanitization:** every user- and data-derived string field written to a Requests
  cell passes through the reused `sanitizeForSheet`; `timestamp`/`request_id` exempt. (Confirm the
  helper is reused, not re-declared: `grep -c 'function sanitizeForSheet' apps-script/Code.gs` == 1.)
- Contract doc delivered: exact client payload shape (incl. the `kind` discriminator) + exact
  14-column Requests order + reference `SampleRequestInputSchema` Zod snippet + the auditor
  reference-only note, plus the response shape `{ok:boolean, error?}`.
- SETUP.md contains a "Requests" tab setup section, a config-global note, AND a deployment-revocation
  procedure section; edits are surgical (no full-file rewrite — existing feedback setup preserved).
- No hardcoded secrets beyond the pre-existing `SHEET_ID` placeholder pattern.
  </success_criteria>
  <context_files>
apps-script/Code.gs (extend — full file already read by PM; doPost/HEADERS/sanitizeForSheet/buildResponse)
assets/feedback-config.js (add BROADN_REQUEST_URL seeded with the existing live /exec URL — insert-only)
apps-script/SETUP.md (extend — brief-verified present, ~10KB; READ before editing, surgical Edits only)
docs/post-mortems/broadn-p8-feedback-widget.md §7 (existing payload/column/response contracts to mirror)
  </context_files>
  <dependencies>NONE (Wave 0 — but FE T3 depends on this)</dependencies>
  <out_of_scope>
Do NOT change the Feedback HEADERS, column order, or SHEET_NAME. Do NOT rewrite Code.gs or SETUP.md
wholesale (surgical Edits only — p8-g1). Do NOT modify the existing `BROADN_FEEDBACK_URL` line. Do
NOT add npm/build tooling or a hosted server. Do NOT implement client-side UI (T3). Do NOT add
request-status/fulfillment logic, auth, or notifications.
  </out_of_scope>
  <output_expected>
    <tag>completion_packet</tag>
    <must_contain>
      <item>handleSampleRequest with one-row-per-sample append in the fixed 14-column order</item>
      <item>doPost early-branch routing on payload.kind === 'sample_request'</item>
      <item>BROADN_REQUEST_URL added to feedback-config.js (insert-only, same live URL)</item>
      <item>sanitizeForSheet reused (not duplicated) on all user/data string cells</item>
      <item>documented payload contract (incl. kind) + column order + reference SampleRequestInputSchema + auditor reference-only note</item>
      <item>SETUP.md Requests-tab section + config-global note + deployment-revocation procedure</item>
    </must_contain>
    <must_not_contain>
      <item>any change to Feedback HEADERS / column order / SHEET_NAME</item>
      <item>any change to the existing BROADN_FEEDBACK_URL line</item>
      <item>full-file rewrite of Code.gs or SETUP.md</item>
      <item>hardcoded secrets; npm/backend/server dependencies</item>
    </must_not_contain>
    <success_signal>Code.gs + SETUP.md edited surgically, feedback default branch byte-stable per git diff, feedback-config.js insert-only diff (grep -c '^-[^-]' == 0) adds BROADN_REQUEST_URL, contract doc emitted with kind discriminator + 14-column order + reference Zod schema.</success_signal>
  </output_expected>
</task_packet>

<task_packet>
  <task_id>broadn-p17-t3-fe</task_id>
  <assigned_to>frontend</assigned_to>
  <priority>HIGH</priority>
  <description>
Implement the multi-sample cart + checkout on the BROADN Data Explorer per the T1 design spec and
the T2 payload contract. Vanilla ES5 IIFE style — NO framework, NO build system, NO npm deps, NO Zod
runtime import.

**Files T3 touches (3 — under the 4-file split threshold):** `assets/app.js` (cart logic + control),
a new `assets/cart.css`, and `index.html` (add the `<link>` for cart.css only). T3 does **NOT** edit
`assets/feedback-config.js` (BE owns the `BROADN_REQUEST_URL` global — D1), nor
`feedback-widget.js`/`feedback-widget.css`/`Code.gs`/`SETUP.md`.

**Remove the mailto path (grep-verify consumers first):** delete `buildRequestHref()`,
`REQUEST_EMAIL_TO`, `REQUEST_EMAIL_CC` (app.js ~1536, ~1565–1589) and the per-row `Request ✉`
`<a href=mailto…>` cell (~1769). Before deleting, `grep -n` each identifier across the repo to
confirm no other consumer; the only consumer is expected to be the request cell at ~1769. (Note: the
`sequenced: 'bg-green-100 text-green-800'` entry in `STAGE_BADGE_CLASSES` at app.js:1523 is a
DATA-semantic pipeline color and is OUT OF SCOPE — do not touch it; only the request-cell greens are
removed.)

**Cart (in-session only — D2):**
- Module-level cart state (a Set/array of sample IDs, or of minimal per-sample payload objects) inside
  the app.js IIFE. **In-memory only — NO localStorage.** Reloading/closing the page empties the cart;
  cross-visit persistence is explicitly deferred.
- Per-row add-to-cart control (replacing the removed cell). Because `renderTable()` rebuilds
  `innerHTML` on every filter/sort/paginate, the control MUST reflect current cart membership on
  every render (a row already in the cart renders the in-cart/Remove state).
- Persistent cart badge/count affordance reflecting `cart.length`, with `aria-live="polite"`; 0/1/many
  states per the design spec; opens the checkout review.
- Checkout review panel lists the FULL cart independent of the current Explorer filter, with a
  per-item remove control; removing the last item returns cleanly to the empty state.

**Checkout dialog + submit:**
- `role=dialog aria-modal=true` overlay; scrim per the T1 spec (`--color-tooltip-bg`). Focus trap
  whose focusable-elements query FILTERS `offsetParent !== null` (visibility predicate) so
  hidden/collapsed descendants never break the first/last trap identity. Esc + click-outside dismiss.
  Focus returns to the triggering control on close.
- Four fields (requester name / email / affiliation / intended use). Vanilla client-side validation
  per the T2 contract: all four required non-empty; email matches a basic pattern. Invalid → inline
  message, no submit.
- Submit builds the T2 payload (`kind:'sample_request'`, `samples[]` from cart, requester fields,
  `page_url`, `user_agent`) and POSTs it, mirroring the feedback widget exactly:
  `fetch(BROADN_REQUEST_URL, {method:'POST', body:JSON.stringify(payload),
  headers:{'Content-Type':'text/plain;charset=utf-8'}}).then(r=>r.json())`. On `{ok:true}` (or
  `{status:'ok'}`): success state + clear the cart. On `{ok:false}` or network error: error state
  showing a FIXED client string (IGNORE any server-supplied `error` text — defense-in-depth per p8).
  Submit status region is `aria-live`.
- Endpoint read from `window.BROADN_REQUEST_URL`; `IS_CONFIGURED` gate. When unset: add-to-cart still
  functions but the final Submit is disabled with an explanatory message (do NOT fall back to mailto).

**Wiring:** `index.html` — add only a `<link>` for the new `assets/cart.css`. Do NOT add a script tag
for the endpoint global (BE adds `BROADN_REQUEST_URL` to the already-loaded `feedback-config.js`). Do
NOT edit `assets/feedback-widget.css` or `assets/feedback-widget.js`.

**A11Y:** every interactive control (add-to-cart, remove, badge, dialog controls) is keyboard-operable
and ≥44×44px. All new colors trace to DESIGN.md tokens; no CSU green.

**QA / verification note (LIVE-ENDPOINT SAFETY — mandatory):** `BROADN_REQUEST_URL` is seeded (by
D1) with the REAL live `/exec` endpoint, so `IS_CONFIGURED` is true during audit. The QA interactive
walk MUST install a network route-intercept / mock for `BROADN_REQUEST_URL` BEFORE any Submit click
is exercised — never let a test submit reach the live endpoint (it would append junk rows to the
human's real Google Sheet). Exercise both the `{ok:true}` and error responses via the mock.
  </description>
  <success_criteria>
- `grep -c 'buildRequestHref' assets/app.js` == 0; `grep -c 'REQUEST_EMAIL_TO' assets/app.js` == 0;
  `grep -c 'REQUEST_EMAIL_CC' assets/app.js` == 0; `grep -rc 'mailto:' assets/app.js` == 0. No
  repo-wide dangling reference to the three removed identifiers.
- Add-to-cart control renders per row and correctly shows in-cart vs not-in-cart state after
  filter / sort / pagination re-renders of `renderTable()`.
- Cart is in-memory only: `grep -c 'localStorage' assets/app.js` == 0 in the new cart code. Cart
  persists across Explorer re-renders and pagination within the session; badge/count reflects
  `cart.length` with `aria-live="polite"` and shows the 0/1/many states.
- Checkout review lists the full cart regardless of active Explorer filter; per-item remove works;
  removing the last item yields the empty state without error.
- Dialog is `role=dialog aria-modal=true`; focus-trap query includes `.filter(el => el.offsetParent
  !== null)` (or equivalent visibility predicate) — verifiable by grep for `offsetParent`; Tab and
  Shift+Tab wrap within the dialog in BOTH a fully-populated and a validation-error (some controls
  disabled) state; focus returns to the trigger on close.
- Submit POSTs the T2-contract payload (with `kind:'sample_request'`) via the text/plain fetch
  pattern; success clears cart + shows success; `{ok:false}`/network shows a fixed client error string
  (server error text ignored).
- **Live-endpoint safety:** the QA walk installs a route-intercept/mock for `BROADN_REQUEST_URL`
  BEFORE any Submit is triggered; no test submit reaches the live `/exec` endpoint.
- Unset `BROADN_REQUEST_URL` → cart usable, Submit disabled with a message; no mailto path exists.
- All interactive controls keyboard-operable and ≥44×44px; submit-status region is `aria-live`.
- `index.html` links `assets/cart.css`; T3 did NOT modify `assets/feedback-config.js`,
  `feedback-widget.css`, or `feedback-widget.js` (`git diff --stat` shows none of the three modified).
- **No-CSU-green SC (D4 — scoped to this task's changes only):** for T3's changed files, ADDED lines
  contain no `green-700|green-800|green-50`:
  `git diff HEAD -- assets/app.js assets/cart.css index.html | grep '^+' | grep -Ec 'green-700|green-800|green-50'` == 0. This deliberately EXCLUDES the pre-existing legitimate
  `STAGE_BADGE_CLASSES.sequenced` green at app.js:1523, which is untouched. Every new color maps to a
  DESIGN.md token; no raw hex outside token usage.
- No npm/build dependency added; no Zod runtime import.
  </success_criteria>
  <context_files>
DESIGN.md (v2 token source of truth; `--color-tooltip-bg` = dialog scrim per T1)
[T1 design_spec output — inject at execution time]
[T2 completion_packet — payload contract incl. `kind` + 14-column order + response shape — inject at execution time]
assets/app.js:1520-1800 (mailto path to remove + renderTable/computeExplorerFiltered plumbing)
assets/feedback-widget.js:475-478 (the fetch submit pattern to mirror — READ-ONLY, do not edit)
assets/feedback-config.js (READ-ONLY reference: BROADN_REQUEST_URL is added here by BE; T3 only reads window.BROADN_REQUEST_URL)
index.html (add the cart.css <link> only; feedback-config.js is already loaded at line 979 — surgical edit)
docs/post-mortems/broadn-p8-feedback-widget.md §6 p8-g2 + §7 (offsetParent focus-trap fix; response-shape defense-in-depth)
  </context_files>
  <dependencies>broadn-p17-t1-ui, broadn-p17-t2-be</dependencies>
  <estimated_new_lines>
~350–500 net new (cart JS inside app.js IIFE + new assets/cart.css + one index.html `<link>`), minus
~30 removed (mailto path). **Kept whole (justification):** single coherent cart feature whose state
threads through both the per-row control and the dialog on shared files (app.js + one new CSS +
index.html). Splitting would force serialization on app.js with zero parallelism gain (same agent,
same file) and fragment the focus-trap/cart-state logic across two audits. File count is 3
(app.js / cart.css / index.html) — under the 4-file split rule. Precedent: p8 shipped its feedback
widget as one FE task (1,392 lines) under the audit-gate-with-exception clause. The commit will exceed
the 50-line Git gate → it commits only AFTER audit PASS (gate satisfied).
  </estimated_new_lines>
  <out_of_scope>
Do NOT edit feedback-config.js / feedback-widget.js / feedback-widget.css / Code.gs / SETUP.md. Do NOT
resurrect any mailto path. Do NOT touch the `sequenced` pipeline-stage green badge at app.js:1523
(data color, not brand). Do NOT add request-status tracking, auth, admin views, email notifications,
or localStorage persistence. Do NOT add npm/build/framework/Zod-runtime dependencies. Do NOT introduce
CSU green or raw hex. Do NOT let a QA test submit reach the live `/exec` endpoint (route-intercept first).
  </out_of_scope>
  <output_expected>
    <tag>ui_packet</tag>
    <must_contain>
      <item>per-row add-to-cart control reflecting cart membership across re-renders</item>
      <item>in-session (no-localStorage) cart badge/count with aria-live and 0/1/many states</item>
      <item>checkout review panel (full cart, per-item remove, empty-state on last removal)</item>
      <item>role=dialog focus trap with offsetParent visibility filter + focus return to trigger</item>
      <item>submit via text/plain fetch building the T2 payload (kind:'sample_request'); success clears cart; fixed error string</item>
      <item>BROADN_REQUEST_URL read (from feedback-config.js) + IS_CONFIGURED gate (Submit disabled when unset)</item>
      <item>QA route-intercept-before-submit safety note (never hit the live endpoint)</item>
      <item>removal of buildRequestHref/REQUEST_EMAIL_TO/REQUEST_EMAIL_CC/mailto cell</item>
    </must_contain>
    <must_not_contain>
      <item>mailto: anywhere in the request path</item>
      <item>localStorage / cross-reload cart persistence</item>
      <item>NEW CSU green (green-700/green-800/green-50) in T3's diff; raw hex</item>
      <item>edits to feedback-config.js / feedback-widget.js/.css or Code.gs/SETUP.md</item>
      <item>a QA submit that reaches the live /exec endpoint</item>
      <item>npm/build/framework/Zod-runtime dependency</item>
    </must_not_contain>
    <success_signal>Live render (cache-busted) shows add-to-cart on rows, working badge/count, checkout dialog with a holding focus trap, and a route-intercepted mock POST returning {ok:true} that clears the cart + shows success (no live-endpoint hit); grep confirms mailto path removed + no localStorage; feedback-config.js/feedback-widget files unchanged.</success_signal>
  </output_expected>
</task_packet>

</task_packets>

<dependency_order>
Wave 0 (parallel):  broadn-p17-t1-ui  ||  broadn-p17-t2-be
      → audit(t1-ui) [SA]  ||  audit(t2-be) [SA/QA/SX incl. formula-injection + revocation-doc + feedback-byte-stable checks]
Wave 1:             broadn-p17-t3-fe   (DEPENDS ON t1-ui design_spec + t2-be contract)
      → audit(t3-fe) [SA/QA/SX]
Wave 2 (close):     requirements-validate → commit-packet (audit-PASS gate satisfies the 50-line Git rule) → archivist

QA note for audit(t3-fe):
  - **LIVE-ENDPOINT SAFETY (mandatory):** `BROADN_REQUEST_URL` is seeded with the REAL live `/exec`
    URL, so `IS_CONFIGURED` is true. The interactive walk MUST install a network route-intercept/mock
    for `BROADN_REQUEST_URL` BEFORE any Submit click — never let a QA submit reach the live endpoint
    (it would write junk rows to the human's real Sheet). Prove the submit flow against the mock
    (returning {ok:true} AND an error case).
  - Re-deploying the Apps Script project with the new Code.gs is a human step (see routing_notes
    execution-dependency) — the mock stands in for it at audit time.
  - Exercise cart empty/one/many + remove-to-empty transitions; Tab/Shift+Tab focus-trap in populated
    AND validation-error dialog states; **cache-busted** first load.
</dependency_order>

<routing_notes>

**REV 2 — Critic 2nd-round resolution:** (a) BLOCKER — the T2 `feedback-config.js` insert-only SC used
a bare `grep -c '^-'`, which can never be 0 (the `--- a/…` diff header matches `^-`); changed to
`grep -c '^-[^-]'` (real deletion lines only). Swept the plan: the Code.gs SC and the D4 green SC
already pipe through a second token grep that drops the header, so they were left unchanged. (b)
WARNING — added a mandatory route-intercept-before-Submit note to T3 + audit(t3-fe), since D1 seeds
`BROADN_REQUEST_URL` with the real live endpoint.

**REV 1 — Critic BLOCKER resolution:** The plan previously stated 3× that `window.BROADN_FEEDBACK_URL`
is set inline in `index.html`. That was a PM pre-flight failure (asserted an unread fact). Verified on
disk: `assets/feedback-config.js:4` sets a live deployed `/exec` URL; `index.html:979` loads it. All
occurrences corrected; the new `BROADN_REQUEST_URL` is added to `feedback-config.js` by BE (D1),
seeded with the same live URL, and `doPost` routes by a `kind` discriminator (D1).

**Recurring-pattern preflight (Step 0.5) — enumerated from the most recent broadn after-actions + the directly-relevant p8 post-mortem:**
<recurring_pattern source="broadn-p8-feedback-widget.md §6 p8-g3">Tabular-output tasks omitted formula-injection sanitization + endpoint-revocation doc from the original packet (cost a remediation cycle). AVOIDED: t2-be success_criteria bake in BOTH sanitizeForSheet-on-all-cells and the SETUP.md revocation-procedure section from the start.</recurring_pattern>
<recurring_pattern source="broadn-p8-feedback-widget.md §6 p8-g2">role=dialog focus trap escaped because the focusable query matched display:none descendants (recurring a11y class; cross-project). AVOIDED: t3-fe success_criteria explicitly require the offsetParent!==null filter, grep-verified, and QA tests Tab/Shift+Tab in the validation-error (some-controls-disabled) partial state.</recurring_pattern>
<recurring_pattern source="broadn-p8-feedback-widget.md §6 p8-g1">Heredoc/full-file overwrite of a multi-section file silently clobbered content. AVOIDED: t2-be constrains Code.gs + SETUP.md + feedback-config.js to surgical/insert-only Edits with byte-stable-feedback-path git-diff SCs (header-safe recipes); must_not_contain forbids full-file rewrite and edits to the existing BROADN_FEEDBACK_URL line.</recurring_pattern>
<recurring_pattern source="broadn-teal-rebrand.md §6 (levels_advanced: scope-boundary blindness named recurring)">No repo-wide consumer sweep when removing a shared identifier/token silently broke an out-of-scope consumer. AVOIDED: t3-fe must grep-verify (repo-wide) that buildRequestHref/REQUEST_EMAIL_TO/REQUEST_EMAIL_CC have no remaining consumers before deletion, and that no dangling reference remains after.</recurring_pattern>
<recurring_pattern source="broadn-teal-rebrand.md §6">Auditor's first live-render served from stale browser cache masked a regression (recurred p10→p11). AVOIDED: dependency_order QA note requires a cache-busted first load for audit(t3-fe).</recurring_pattern>
<recurring_pattern source="broadn-p12-altitude-single-rail.md §6">Sprints that change which elements occupy a shared container / gate a previously-unconditional element failed to exercise every intermediate + empty container state. AVOIDED: the cart control re-renders inside renderTable's rebuilt innerHTML (state must survive re-render), and QA exercises cart empty/one/many + remove-to-empty + dialog empty/populated states — all enumerated as SCs.</recurring_pattern>

**pm-preflight acknowledgements (all five items from the brief):**
- **[p8-g3 TABULAR-OUTPUT SANITIZATION]** — baked into t2-be SC: every user/data-derived string cell → reused `sanitizeForSheet` (`=`,`+`,`-`,`@` leading-char mitigation); helper reused not duplicated.
- **[p8-g3 ENDPOINT REVOCATION DOC]** — t2-be SC requires SETUP.md to gain a Requests-tab setup section, a config-global note, AND a deployment-revocation procedure (noting one deployment serves both handlers + the re-deploy step).
- **[p8-g2 DIALOG FOCUS TRAP]** — t3-fe SC requires the `offsetParent !== null` visibility filter on the focusable query, grep-verified, with Tab/Shift+Tab tested in the partial (validation-error) state.
- **[p8-g1 NO DESTRUCTIVE OVERWRITES]** — t2-be limited to surgical/insert-only Edits on Code.gs + SETUP.md + feedback-config.js with byte-stable-feedback-path git-diff SCs (header-safe recipes); DESIGN.md is READ-ONLY (T1 may add at most one justified `--color-scrim` token, default is reuse). must_not_contain forbids full-file rewrites.
- **[SCOPE DISCIPLINE]** — request-status tracking, auth, admin dashboards, email notifications explicitly out_of_scope in every packet and marked out-of-scope in the verbatim audit.

**DESIGN.md status:** PRESENT at `/home/jhber/projects/broadn-web-view/DESIGN.md` (v2). Included in T1 + T3 context_files. UI Designer sets `<design_system_source>DESIGN_MD</design_system_source>` and traces all tokens to named entries. **Scrim (D3):** default is to REUSE `--color-tooltip-bg` (`rgba(28,25,23,0.92)`) as the dialog scrim — no DESIGN.md edit. UI may instead add a single surgical `--color-scrim` token WITH rationale.

**Config mechanism (D1):** the config lives in `assets/feedback-config.js` (loaded by `index.html:979`), NOT inline in index.html. `BROADN_REQUEST_URL` is added there by BE (T2), seeded with the same live `/exec` URL; FE (T3) only reads it under an `IS_CONFIGURED` gate. This keeps T3 at 3 files (app.js/cart.css/index.html), under the 4-file split rule.

**Live-endpoint QA safety (D1 consequence):** because the seed is the REAL live endpoint, `IS_CONFIGURED` is true at audit time; a live Submit during QA would write junk rows to the human's real Sheet. The T3 packet and audit(t3-fe) criteria mandate a route-intercept/mock installed BEFORE any Submit is exercised.

**Cart persistence (D2):** in-session only, no localStorage; cross-visit persistence deferred. Stated in the T3 packet + verbatim audit + risk_flags.

**Contract-first / UI-before-FE ordering:** t2-be (payload contract) and t1-ui (design spec) are Wave 0; t3-fe depends on both. Inject the T1 design_spec and T2 completion_packet into the FE context at dispatch time.

**mailto decision:** REMOVED (Pre-flight §1). Stated, not accidental.

**Execution-dependency (Step 7.7) — honest gate placement:** the client submit flow IS execution-gated
— audit(t3-fe) QA proves it via a route-intercepted mock endpoint (mirroring p8). The client config
ships live-seeded (D1: same live `/exec` URL), so no URL-wiring step remains. The one remaining
human-owned step is pasting the updated `Code.gs` into the Apps Script project and **re-deploying** the
web app so the new `handleSampleRequest` handler goes live — the pipeline has no access to the human's
Google account, so this cannot be pipeline-executed. It is NOT deferred to a silent prose note: it is
documented in SETUP.md (T2 SC) and ORC should surface the re-deploy step to the human at close. No
`GATE-RUN` node is invented for a step the pipeline cannot run.

**SC-locked-value precheck (Step 7.5) — declared NOT APPLICABLE:** no locked-value/verbatim-frontmatter/
copy-string SCs. Greps target code identifiers being removed (`buildRequestHref`, `REQUEST_EMAIL_TO/CC`,
`mailto:`, `localStorage`) and structural presence (`offsetParent`, `sanitizeForSheet` count==1,
`kind` routing) — all satisfiable-on-faithful-execution. All insert-only/no-deletion greps are
header-safe (`^-[^-]` or a second token grep), so none false-fail on the `git diff` `--- a/…` header.
The no-CSU-green grep (D4) is scoped to ADDED diff lines. No `sc-precheck-report.json` attached, by
design (meta-agent/frontmatter tool, out of domain here).

**Append serialization:** none required — t2-be edits Code.gs + SETUP.md + feedback-config.js; t3-fe
edits app.js + index.html + new cart.css. `index.html` is touched by T3 only (BE does not edit it,
since feedback-config.js is already loaded there). No shared file between the two tasks; no changelog
appends inside the plan (that is commit-packet's job).

**FE self-commit (teal-rebrand §6):** reminder for ORC — FE never runs `git commit`; the durability
commit is commit-packet's job after audit PASS.

</routing_notes>

<risk_flags>
- **No-bundler Zod:** the T2 `SampleRequestInputSchema` is a reference/documentation artifact only; the runtime client validator (T3) is vanilla JS. The T2 packet instructs the auditor not to read a missing runtime-Zod import as a standards defect.
- **Live-endpoint during QA:** `BROADN_REQUEST_URL` is seeded with the real `/exec` URL, so a QA Submit without a route-intercept would write junk rows to the human's real Sheet. Mitigated by the mandatory intercept-before-submit note in T3 + audit criteria.
- **mailto removal alternative:** the plan removes mailto entirely. If the human wants request submission to still work when `BROADN_REQUEST_URL` is unset, the alternative is to keep the mailto path as the unconfigured fallback. Note: because the URL is now live-seeded (D1), "unset" is an edge state, so removal is low-risk. ORC/human may override.
- **In-session cart (D2):** cart is in-memory; a reload/tab-close empties it. If the human expects reload-durability, that is a deferred follow-up (localStorage read/write + stale-cart eviction). Surfaced, not silently dropped.
- **Shared deployment blast radius:** feedback + requests share ONE Apps Script `/exec` deployment and the same `SHEET_ID`. Revoking/re-deploying disables BOTH; the new Requests handler only goes live after the human re-deploys the updated Code.gs. Documented in T2 SETUP.md; ORC to surface at close.
- **`renderTable` re-render churn:** the add-to-cart control lives in a cell rebuilt via `innerHTML` on every filter/sort/paginate — cart-membership reflection on re-render is the most likely FE defect surface (p12 shared-container-state class). Called out as an explicit T3 SC + QA step.
- **Sample field provenance for the sheet:** `sample_stage` should be sent as the human-readable `STAGE_LABELS[row.pipeline_stage]` (falling back to raw). Sample fields originate from `data.json` (not user-typed) but are still routed through `sanitizeForSheet` in T2 for defense-in-depth (a data value with a leading `-`/`=` would otherwise become a live formula).
</risk_flags>

</task_decomposition>

---

## Expectation Manifest

```xml
<expectation_manifest>
  <sprint_id>broadn-p17-sample-checkout-cart</sprint_id>
  <generated>2026-07-10 (REV 2)</generated>
  <assignments>
    <assignment>
      <task_id>broadn-p17-t1-ui</task_id>
      <agent>UI#1</agent>
      <expected_tag>design_spec</expected_tag>
      <expected_file>.claude/tasks/outputs/broadn-p17-t1-ui-UI-*.md</expected_file>
      <blocks>broadn-p17-t3-fe</blocks>
      <receipt_check>
        <item>design_system_source = DESIGN_MD present; every token named</item>
        <item>all 6 spec sections present incl. empty/one/many/submitting/success/error/unconfigured states</item>
        <item>dialog scrim specified as --color-tooltip-bg (or a justified --color-scrim proposal)</item>
        <item>no raw hex; no CSU green</item>
        <item>explicit reuse-vs-new dialog-styling decision stated</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>broadn-p17-t2-be</task_id>
      <agent>BE#1</agent>
      <expected_tag>completion_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/broadn-p17-t2-be-BE-*.md</expected_file>
      <blocks>broadn-p17-t3-fe</blocks>
      <receipt_check>
        <item>documented payload contract (incl. kind) + 14-column Requests order + reference SampleRequestInputSchema + auditor reference-only note</item>
        <item>doPost early-branch on payload.kind==='sample_request'; feedback default branch byte-stable (git diff)</item>
        <item>BROADN_REQUEST_URL added to feedback-config.js (insert-only via grep -c '^-[^-]' == 0; same live URL; existing FEEDBACK_URL line unchanged)</item>
        <item>sanitizeForSheet reused (count==1) on all user/data cells</item>
        <item>SETUP.md has Requests-tab section + config-global note + deployment-revocation procedure</item>
        <item>no change to Feedback HEADERS/column order/SHEET_NAME; no full-file rewrite</item>
      </receipt_check>
    </assignment>
    <assignment>
      <task_id>broadn-p17-t3-fe</task_id>
      <agent>FE#1</agent>
      <expected_tag>ui_packet</expected_tag>
      <expected_file>.claude/tasks/outputs/broadn-p17-t3-fe-FE-*.md</expected_file>
      <blocks>NONE</blocks>
      <receipt_check>
        <item>grep: buildRequestHref/REQUEST_EMAIL_TO/REQUEST_EMAIL_CC/mailto == 0 in app.js</item>
        <item>grep: localStorage == 0 in the new cart code (in-session only, D2)</item>
        <item>offsetParent visibility filter present in focus-trap query</item>
        <item>submit uses text/plain fetch building the T2 payload (kind:'sample_request'); success clears cart</item>
        <item>reads BROADN_REQUEST_URL + IS_CONFIGURED gate; unset → Submit disabled (no mailto)</item>
        <item>QA route-intercept installed before any Submit — no live /exec hit</item>
        <item>feedback-config.js / feedback-widget.js / feedback-widget.css unchanged (git diff --stat)</item>
        <item>no-CSU-green grep scoped to ADDED diff lines (D4) — excludes app.js:1523; tokens trace to DESIGN.md</item>
        <item>no npm/build/Zod-runtime dep</item>
      </receipt_check>
    </assignment>
  </assignments>
</expectation_manifest>
```
