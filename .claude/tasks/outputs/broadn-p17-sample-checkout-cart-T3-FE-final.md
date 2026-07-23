# broadn-p17-t3-fe — Sample Checkout Cart (Frontend)

Implements the multi-sample cart + checkout on the BROADN Data Explorer per the T1 design
spec and T2 payload contract. Vanilla ES5-style JS added to `assets/app.js`, a new additive
`assets/cart.css`, and a single `<link>` in `index.html`. The old per-row `mailto:` request
path is fully removed.

## Files Modified

| File | Change |
|---|---|
| `assets/app.js` | Removed `REQUEST_EMAIL_TO`, `REQUEST_EMAIL_CC`, `buildRequestHref()`, and the mailto `<td>` cell. Added the full cart feature: in-session cart state, per-row add-to-cart control (`cartButtonHtml()`, wired into `renderTable()`), persistent cart badge in the sticky nav, checkout review panel (slide-over), request-form dialog with focus trap + validation + submit, and `initCartUI()` init call. |
| `assets/cart.css` (NEW) | `.cart-*` prefixed additive stylesheet — row control, badge, panel, dialog, buttons, fields, responsive breakpoints. |
| `index.html` | One line added: `<link rel="stylesheet" href="assets/cart.css">`. No script tag added (BE's T2 task already added `window.BROADN_REQUEST_URL` to the already-loaded `assets/feedback-config.js`). |

Not touched: `assets/feedback-config.js`, `assets/feedback-widget.js`, `assets/feedback-widget.css`,
`apps-script/Code.gs`, `apps-script/SETUP.md`.

## Implementation Notes

- **Cart state:** module-level `var cart = []` inside the same script-scope as the rest of
  `app.js` (this file has no single wrapping IIFE — it's a plain top-level `<script src>`
  extracted from the old inline block, matching its existing convention of top-level `var`/
  `function` declarations plus small self-invoking IIFEs for scoped features, e.g. the
  existing sidebar-collapse-toggle block). In-memory only, no `localStorage`. Cart items are
  the minimal T2 shape: `{sample_id, sample_type, sample_site, sample_date, sample_project,
  sample_stage}`.
- **Per-row control:** `cartButtonHtml(row)` is called fresh on every `renderTable()` pass
  (which rebuilds `tbody.innerHTML` on every filter/sort/paginate), so it always reflects
  current cart membership. A single delegated `click` listener on the persistent `#explorer-
  tbody` element (wired once in `initCartUI()`) handles add/remove for every row, current and
  future — no per-button listener rewiring needed. After any cart mutation (including a
  removal from the review panel, which may target a sample not on the current Explorer page),
  `refreshRowCartButtons()` re-derives every currently-rendered button's state directly from
  `cart` — a safe no-op if the sample isn't on the current page.
- **Cart badge:** injected via JS into the sticky nav's existing `.flex.h-16.items-center`
  container (`ml-auto` pushes it right) — the T1 spec flagged that the Explorer toolbar isn't
  a valid location since it's hidden whenever Dashboard/Slice panes are active, and nothing in
  the persistent sticky nav currently exists to append to except via JS injection.
  `aria-live="polite"` region (`#cart-live-region`) announces every add/remove.
- **Review panel + request dialog:** both `role="dialog" aria-modal="true"`. Each has its own
  keydown/outside-click document listener, attached only while that modal is open. The dialog
  takes priority while both are open (panel's own handler yields via `cartDialogIsOpen()`
  check + the panel additionally receives `inert` while the dialog is open, so it can't be
  tabbed/clicked into behind the scrim). Focus returns to the triggering control on close in
  both cases (`cartTriggerEl` / `dialogTriggerEl`).
- **Focus trap (p8-g2 fix):** `getFocusableWithin(container)` filters the focusable-elements
  query by `el.offsetParent !== null`, so `display:none` descendants (e.g. a collapsed field
  group) never break the first/last Tab-wrap identity. Shared by both the panel and dialog via
  `trapTabWithin()` — DRY, single implementation.
- **Validation:** all 4 requester fields required non-empty; email checked against
  `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. Cart-non-empty is ALSO checked client-side before submit
  (T2's server does not reject an empty `samples[]` — GAS always returns `{ok:true}`).
- **Submit:** POSTs the exact T2 contract (`kind:'sample_request'`, `samples[]` from the cart,
  requester fields, `page_url`, `user_agent`) via
  `fetch(REQUEST_URL, {method:'POST', body:JSON.stringify(payload), headers:{'Content-Type':
  'text/plain;charset=utf-8'}}).then(r=>r.json())`, mirroring `feedback-widget.js`'s proven
  pattern exactly. On `{ok:true}`/`{status:'ok'}`: clears the cart, shows the success state
  (form removed from DOM), and the review panel falls back to its empty state on Close. On
  `{ok:false}`/network error: shows a **fixed client string** ("Something went wrong
  submitting your request. Try again.") — the server-supplied `error` text is never rendered
  (defense-in-depth, per the p8 post-mortem).
- **`IS_REQUEST_CONFIGURED` gate:** reads `window.BROADN_REQUEST_URL` (BE's T2 global). When
  unset, add-to-cart / the cart / the review panel all still work; only the dialog's Submit
  button is disabled (`disabled` + `aria-disabled="true"`) with an inline notice below it. No
  mailto fallback anywhere.
- **Header label:** the static `Request` column header in `index.html` (line ~930) is left
  untouched in the HTML source (out of scope per the "index.html: link only" constraint);
  `initCartUI()` retitles it to `Cart` via `textContent` at runtime instead, so no `index.html`
  edit was needed beyond the `<link>`.

## State Hydration Map

No BE data hydrates this feature beyond the existing `appData.all_samples` rows already
flowing into `renderTable()` (unchanged — `row.id/type/site/date/project/pipeline_stage` are
read directly off each row via `data-cart-*` attributes on the row button, avoiding a second
lookup pass). The only new external read is `window.BROADN_REQUEST_URL`, a plain string global
set by BE's T2 task in `assets/feedback-config.js` (read-only, not modified by this task).

## A11Y Verification

- Every interactive cart control is a real `<button>` (never a `<span>`/`<div>` with
  `onClick`) — confirmed by `grep -nE "<(span|div|li|a)[^>]*onClick=" assets/app.js index.html`
  returning zero matches.
- `role="dialog" aria-modal="true"` + `aria-labelledby` on both the review panel and the
  request dialog; heading structure uses independent `h2` landmarks per T1 spec (no new `h1`).
- Add-to-cart button: `aria-pressed` (true/false) + dynamic `aria-label` naming the sample ID
  and action, per T1.
- Cart badge: dynamic `aria-label` stating the count in words ("Cart, empty" / "Cart, 1
  sample" / "Cart, {N} samples"); separate `aria-live="polite"` region announces each
  add/remove action distinctly from the badge's own label.
- Field errors: `aria-required="true"`, `aria-describedby` pointing at the error `<p>`,
  `role="alert"` set once on first appearance (not re-added on every re-render, so screen
  readers announce it once, not repeatedly).
- Submit's submitting/disabled states use `aria-disabled` (paired with `aria-busy` while
  submitting) rather than relying on the native `disabled` attribute alone.
- Focus-trap visibility filter (`el.offsetParent !== null`) confirmed present via
  `grep -c 'offsetParent' assets/app.js` → 2.
- Every interactive control (row button, badge, close/remove icon buttons, Cancel/Submit/
  Request/Close buttons) is ≥44×44px (`min-height:44px` + adequate padding, or fixed
  44px×44px for icon-only buttons) in `cart.css`.
- Focus returns to the triggering control on close, for both the panel and the dialog.

## Design Tokens Used

All new colors trace to DESIGN.md v2 Color Tokens. Two conventions were used, matching the
established codebase split:
- **Existing CSS custom properties** (already declared in `assets/styles.css` `:root`):
  `var(--color-teal-deep)` (= DESIGN.md `--color-primary`, `#0c5454`), `var(--color-accent)`
  (`#0c9cb4`, focus rings), `var(--color-stone-50/200/300)` (surface-alt/border/border-strong).
- **Raw hex + inline token-name comment** for tokens not yet materialized as CSS custom
  properties (`--color-primary-light #ccefef`, `--color-primary-mid #0e7474`,
  `--color-primary-dark #083838`, `--color-text-secondary #57534e`, `--color-error #b91c1c`,
  `--color-success #15803d`, `--color-tooltip-bg rgba(28,25,23,0.92)`) — this exactly mirrors
  `assets/feedback-widget.css`'s own documented header convention ("DESIGN.md v2 hex values
  used for tokens not in :root"), which was already audited and shipped in p8. `#ffffff` (white
  text-on-fill) and `#1c1917` (stone-900 heading text) are used as the T1 spec's own flagged
  "structural, not a dedicated token" literals, per its `<notes>` section.
- **Zero** `green-700`/`green-800`/`green-50` in any added line (verified by grep); the
  pre-existing `STAGE_BADGE_CLASSES.sequenced` pipeline-stage green badge was left untouched.

## Style Conflict Check

`NONE` — the inline `style="display:none;"` occurrences I added (`cart-panel-footer`,
`cart-field-error`, `cart-submit-error`, `cart-badge-chip`) carry no co-located Tailwind
display/flex utility class on the same element; each is dynamically toggled in JS to match the
element's own CSS-class default, mirroring the pre-existing `paginationEl.style.display`
pattern already used elsewhere in `app.js`. No permanent inline style overrides a Tailwind
class anywhere in this diff.

## Focus Trap Visibility Filter

`<focus_trap_visibility_filter_confirmed>` — `getFocusableWithin()` filters every focusable-
elements query result by `el.offsetParent !== null` before it feeds `trapTabWithin()`'s
first/last Tab-cycling identity check. Shared by both the review panel and the request dialog
(one implementation, not duplicated). `grep -c 'offsetParent' assets/app.js` → 2 (the filter
callback + its doc comment reference).

## QA / Live-Endpoint Safety Note

`window.BROADN_REQUEST_URL` is seeded with the real live Apps Script `/exec` endpoint (BE's
T2 task), so `IS_REQUEST_CONFIGURED` will read `true` in the deployed app. No submit was
exercised against the network during this implementation session (code was verified via
`node --check` + static grep review only, no browser/Playwright run performed). Per the task
brief, the QA/auditor's interactive walk MUST install a route-intercept/mock for
`BROADN_REQUEST_URL` BEFORE clicking Submit — never let a test submission reach the live
Google Sheet.

## Verification Grep Output (actual, this run)

```
$ grep -c 'buildRequestHref' assets/app.js
0
$ grep -c 'REQUEST_EMAIL_TO' assets/app.js
0
$ grep -c 'REQUEST_EMAIL_CC' assets/app.js
0
$ grep -c 'mailto:' assets/app.js
0
$ grep -c 'localStorage' assets/app.js
4
  (1 = my own comment mentioning "no localStorage"; 3 = pre-existing, unrelated
  draft-save-form localStorage usage at ~line 3520-3525; zero from new cart code)
$ grep -c 'offsetParent' assets/app.js
2
$ git diff HEAD -- assets/app.js assets/cart.css index.html | grep '^+' | grep -Ec 'green-700|green-800|green-50'
0
$ git diff --stat -- assets/feedback-config.js assets/feedback-widget.js assets/feedback-widget.css
 assets/feedback-config.js | 1 +
 1 file changed, 1 insertion(+)
  (this 1-line change is BE's own pre-existing T2 work — window.BROADN_REQUEST_URL alias —
  already present in the working tree before this session; confirmed zero Edit/Write calls
  against this file in this session. feedback-widget.js/.css: absent from diff, untouched.)
$ node --check assets/app.js
(exit 0)
```

## Deliverables Summary

- `assets/app.js` — mailto path fully removed; cart feature added (~660 net new lines).
- `assets/cart.css` — new file, 367 lines.
- `index.html` — 1 line added (`<link>` only).
- `docs/agent-logs/FE/broadn-p17-t3-fe.md` and `docs/agent-logs/FE/latest.md` — Stage 1/2/3
  checkpoint log.

<ui_packet>
  <components_created>
    assets/app.js (cart feature block: state + row control + badge + review panel + request
    dialog + focus traps + submit — no separate component files, vanilla DOM construction
    matching the file's existing style); assets/cart.css (new stylesheet)
  </components_created>
  <state_hydration_map>
    Cart state is entirely client-local (in-memory array, no BE hydration). Row data for
    cart items is read directly off appData.all_samples rows (already hydrated by the
    existing fetch('data/data.json') pipeline in initDashboard) via data-cart-* attributes
    on each row's add-to-cart button — no additional fetch. The one new external read is the
    plain string global window.BROADN_REQUEST_URL, set by BE's T2 task in
    assets/feedback-config.js (read-only).
  </state_hydration_map>
  <a11y_verification>
    role=dialog aria-modal=true + aria-labelledby on both modals; aria-pressed + dynamic
    aria-label on the add-to-cart toggle; aria-live=polite announcer distinct from the badge's
    own aria-label; aria-required/aria-describedby/one-time role=alert on field errors;
    aria-disabled + aria-busy on Submit; focus-trap offsetParent!==null filter (p8-g2 fix,
    grep-verified, 2 occurrences); focus returns to trigger on close for both modals; zero
    onClick-on-non-button elements (grep-verified); all interactive controls >=44x44px.
  </a11y_verification>
  <design_tokens_used>
    var(--color-teal-deep), var(--color-accent), var(--color-stone-50/200/300) (existing CSS
    custom properties, reused); raw hex + inline --color-* token-name comment for
    --color-primary-light/-mid/-dark, --color-text-secondary, --color-error, --color-success,
    --color-tooltip-bg (matches feedback-widget.css's own documented, already-audited
    convention for tokens not yet materialized as CSS custom properties). Zero green-700/
    green-800/green-50 in any added line (grep-verified).
  </design_tokens_used>
  <style_conflict_check>NONE — 0 inline-style/Tailwind-class collisions in new/modified code</style_conflict_check>
  <focus_trap_visibility_filter_confirmed>yes — getFocusableWithin() filters by el.offsetParent !== null before feeding trapTabWithin() on both the review panel and request dialog</focus_trap_visibility_filter_confirmed>
  <e2e_spec>TIER_1_ONLY — no Playwright spec authored this session (no @playwright/test / playwright.config.ts present in this repo's structure; this app has no client package directory or package.json — see integration_status). Tier 2 coverage is deferred to the auditor's interactive walk per the task brief's explicit QA/route-intercept instructions.</e2e_spec>
  <integration_status>
    SUCCESS for the FE surface itself (cart state, row control, badge, panel, dialog, submit
    wiring against the T2 contract — all implemented and grep/syntax-verified on disk).
    MOCKED/DEFERRED for live network verification: submit was never exercised against a real
    or intercepted network call in this session (no browser/Playwright available in this
    environment run); the auditor's interactive QA walk is required to install a
    route-intercept for window.BROADN_REQUEST_URL before exercising Submit, per the task
    brief's live-endpoint safety mandate. No npm/build/framework dependency exists in this
    repo (confirmed: no package.json), so no Playwright spec was added — Tier 1 smoke
    coverage (existing auditor tooling) is the applicable gate for this vanilla-HTML app.
  </integration_status>
</ui_packet>
