# Audit Verdict — broadn-p17-t3-fe (Sample Checkout Cart, Frontend)

Independent read-only audit of the T3 cart/checkout packet. SA + SX run by the auditor
(code read + grep); QA adjudicated on ORC write-capable interactive evidence (read-only
Playwright cannot drive clicks/submit) plus auditor re-run of the static/grep success criteria.

## Commands run (actual output)

```
$ node --check assets/app.js                                          -> exit 0
$ grep -c 'buildRequestHref' assets/app.js                            -> 0
$ grep -c 'REQUEST_EMAIL_TO' assets/app.js                            -> 0
$ grep -c 'REQUEST_EMAIL_CC' assets/app.js                            -> 0
$ grep -c 'mailto:' assets/app.js                                     -> 0
$ grep -c 'IS_REQUEST_CONFIGURED' assets/app.js                       -> 0
$ grep -c 'function getRequestUrl' assets/app.js                      -> 1
$ grep -c 'function isRequestConfigured' assets/app.js                -> 1
$ grep -c 'offsetParent' assets/app.js                                -> 2
$ git diff HEAD -- assets/app.js | grep '^+' | grep -c localStorage   -> 1  (comment only, verified)
$ git diff HEAD -- assets/app.js assets/cart.css index.html \
    | grep '^+' | grep -Ec 'green-700|green-800|green-50'             -> 0
$ grep -c 'assets/cart.css' index.html                                -> 1
$ git diff --stat -- feedback-config.js feedback-widget.js .css       -> only feedback-config.js +1 (T2, not T3)
$ grep -c '\beval(' assets/app.js                                     -> 0
$ secrets scan on added lines (api_key|secret|password|token|bearer)  -> 0 matches
$ data.error render scan                                              -> 0 matches (server error text never rendered)
$ git diff HEAD -- index.html | grep '^+'  -> +  <link rel="stylesheet" href="assets/cart.css" />
```

## SA notes
- Mailto path fully removed (buildRequestHref / REQUEST_EMAIL_TO / REQUEST_EMAIL_CC / mailto: all 0).
- Load-order remediation present & correct: `getRequestUrl()` (app.js:1555) reads
  `window.BROADN_REQUEST_URL` LAZILY at call time (not cached at IIFE-init); `isRequestConfigured()`
  (1558) derives from it. The eagerly-cached `IS_REQUEST_CONFIGURED` const is gone (grep 0).
- No cart localStorage: the single diff+ localStorage match is the explanatory comment
  ("In-session state ONLY (no localStorage)"); cart state is `var cart = []` (app.js:1563), in-memory.
- cart.css token convention matches the shipped/audited feedback-widget.css split (var(--color-*) for
  :root-defined tokens; DESIGN.md hex + inline token-name comment for :root-absent tokens). Established
  codebase pattern — NOT flagged (per brief and precedent).
- index.html: exactly one cart.css <link> added; feedback-config.js/-widget.js/-widget.css not modified
  by T3 (the lone feedback-config.js +1 is BE's T2 work, expected).
- No new CSU green in T3's diff (0). Pre-existing STAGE_BADGE_CLASSES.sequenced left untouched.

## QA notes (adjudicated on ORC interactive evidence + auditor static re-run)
- All 8 ORC-verified interactive scenarios GREEN on the remediated build (localhost:8177): add-to-cart
  membership survives sort/paginate re-render; 44x44 aria-live badge; role=dialog review panel + request
  dialog with focus INTO dialog on open and offsetParent visibility filter (grep 2); empty-submit blocked
  (0 fetches); valid submit = exactly ONE text/plain POST of the T2 contract payload -> success -> cart
  cleared; error response -> fixed client string, server text not leaked, cart preserved; no fetch ever
  reached the live /exec endpoint (all intercepted).
- Submit handler (app.js:2023-2065) corroborates the evidence in code: non-empty-cart guard (2027),
  4-field + email-regex validation (2028/1968), exact T2 payload (2030-2039), text/plain fetch to
  getRequestUrl() (2043-2046), {ok:true}||{status:'ok'} -> clearCartState()+success (2050-2055),
  else/catch -> fixed-string showCartSubmitError() (2057/2062).
- e2e_spec = TIER_1_ONLY is acceptable here: no framework/package.json in this vanilla-HTML repo; the
  interaction-class criteria were closed by ORC's write-capable walk, which is the sanctioned hand-back
  for the read-only Playwright boundary. No untested new interactive flow remains unadjudicated.

## SX notes
- Server-error-text NOT leaked: showCartSubmitError() (app.js:1942-1949) renders a FIXED string; the
  fetch `.then(data)` uses only data.ok/data.status and never renders data.error. ORC's mocked
  `{ok:false, error:'SERVER SECRET LEAK ATTEMPT <script>'}` produced only the fixed message. CONFIRMED.
- XSS: cart review-panel item rows escape every dynamic field via escapeHtml (app.js:1772-1776); row
  cart-button data-* attrs escaped (1631,1638-1640); success message interpolates only a numeric count;
  requester form field VALUES are never echoed to innerHTML (grep 0) — only sent to the server. Field
  labels are hardcoded literals. No raw unescaped innerHTML of untrusted data.
- No secrets added; no eval; no innerHTML with untrusted concatenation.

<audit_verdict schema_version="2.0">
  <task_id>broadn-p17-t3-fe</task_id>
  <auditor_spawn>
    <agent_id>AUD#1</agent_id>
    <parent>ORC#0</parent>
    <independent_from>FE (broadn-p17-t3-fe implementer)</independent_from>
  </auditor_spawn>
  <provenance_marker>audit-pipeline@2.0.0</provenance_marker>
  <sa status="PASS">
    <audit_review>
      <target_file>assets/app.js, assets/cart.css, index.html</target_file>
      <status>PASS</status>
      <violations/>
    </audit_review>
  </sa>
  <qa status="PASS">
    <test_report>
      <task_id>broadn-p17-t3-fe</task_id>
      <status>PASS</status>
      <test_coverage>e2e (interactive walk, ORC write-capable) 8 scenarios passed, 0 failed; auditor static/grep re-run corroborates</test_coverage>
      <playwright>
        <tier>1</tier>
        <tests_run>8</tests_run>
        <passed>8</passed>
        <failed>0</failed>
      </playwright>
      <defects/>
    </test_report>
  </qa>
  <sx status="SECURE">
    <security_audit>
      <status>SECURE</status>
      <threat_level>LOW</threat_level>
      <findings/>
    </security_audit>
  </sx>
  <overall_status>PASS</overall_status>
</audit_verdict>
