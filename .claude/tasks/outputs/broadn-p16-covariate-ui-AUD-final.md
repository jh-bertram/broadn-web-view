# broadn-p16-covariate-ui — Consolidated Auditor Verdict (SA · QA · SX)

**AUD#1 → ORC#0** | task_id `broadn-p16-covariate-ui` | 2026-07-07 | branch `sprint/broadn-p16-covariate-ui`
Independent from: BE#1 (T1), UI#1 (T2), FE#1 (T3), FE#2 (T4).
Envelope: legacy three-block. (First SPAWN 2026-07-07 is post-2026-05-28, but this project deploys
**no** `.claude/skills/audit-pipeline/` v2.0 contract and no downstream substrate-check consumers —
all prior audits (p13/p14/p15) use the legacy three-block format; the v2.0 typed wrapper is a
gander-internal contract not present here.)

## OVERALL VERDICT: **PASS — SA PASS · QA PASS · SX SECURE** (resolved 2026-07-07; see "RE-ADJUDICATION" at end)

> The original verdict below was CONDITIONAL — QA INDETERMINATE because AUD#1's Playwright grant is read-only. That gate was resolved post-fix via the §2.3(b) hand-back path (ORC ran the write-capable interactive walk); AUD#1 concurred with QA PASS / OVERALL PASS. See the RE-ADJUDICATION section appended at the end of this file for the full evidence and provenance.

No code defects were found across all four packets on static + data + load evidence. The sprint is
**not cleared to auto-close on my authority** because the interaction-class runtime scenarios that
this sprint's own success criteria designate as the primary visual gate (SC1-4 overlay behaviors,
SC6 numeric sort, SC7 CSV parity, live Explorer rows) require click/select interaction, and my
granted Playwright MCP toolset is **read-only** (navigate/snapshot/console/wait/screenshot/close —
no click, no select, no evaluate). The app exposes no URL deep-link to drive these states by
navigation (slice-open and the Explorer pane are click-only; hidden panes are excluded from the
read-only a11y snapshot). Remaining action is a **verification action** (a write-capable browser
re-spawn or a ~5-minute human interactive walk of the 6 scenarios below) — **not** a code
remediation. Nothing found requires any packet to change code.

---

<audit_review>
  <target_files>scripts/preprocess_data.py (T1), data/data.json (T1), assets/app.js (T3+T4), index.html (T4), DESIGN.md (T3)</target_files>
  <status>PASS</status>
  <executed_evidence>
    DETERMINISM (T1): snapshotted sha256 of data/data.json, re-ran `python3 scripts/preprocess_data.py`
      (pandas 3.0.1 + openpyxl 3.1.5 + Bdb-317.xlsx + data/covariates.json all present, exit 0), then
      `diff <(grep -v '"generated"' SNAPSHOT) <(grep -v '"generated"' data/data.json)` → EMPTY.
      The ONLY changed line is meta.generated (22:23:37Z → 23:02:30Z), a pre-existing wall-clock
      stamp, not a p16 regression. Covariate content byte-identical run-to-run. PASS.
    DATA CONTRACT (T1): all_samples covariates null=733 / non-null=3836 / total=4569 — EXACT match.
      Root-level temporal[] (41 entries) carries NO weather key (any-has-weather=False). All
      slice_views.{project(70),location(53),lab_group(53)} temporal buckets carry a weather key at
      100%; project_group empty (0 groups, pre-existing). `grep -cnE '\bNaN\b|\bInfinity\b'
      data/data.json` = 0; node `require('./data/data.json')` parses OK (browser JSON.parse-equiv).
      4 edge samples (BSN0133L/0344A/0346A/1006A) confirmed: covariates object present, all four
      headline fields null, valid fidelity ("window_exact") — matches FE's flagged handling. PASS.
    DESIGN TOKENS / BRAND (T3): overlay #a21caf collides with NONE of Okabe
      {0072B2,009E73,E69F00,56B4E9,999999} / brand-teal {0c5454,0c9cb4} / pipeline
      {1e3a5f,2b6c8a,4db6c4} (programmatic compare). Literal hex appears once (CHART_COLORS
      definition, app.js:66); all dataset refs use CHART_COLORS.weatherOverlay (app.js:2292-2293).
      DESIGN.md:43 `--color-weather-overlay | #a21caf | ...` token entry present. Teal Text
      Restriction: all `0c9cb4` occurrences (app.js:4469/4497/4517) are PRE-EXISTING and non-text
      (outline-color / accent border) — `git diff origin/main` added-line grep for `0c9cb4` returns
      NONE. PASS.
    DRY / CONVENTIONS (T3+T4): exactly one each of computeExplorerFiltered / sortExplorerRows /
      buildExplorerCsv / renderTable / compareExplorerNonEmpty / isExplorerValueEmpty — no parallel
      path. Numeric comparator branch present (app.js:1672: `if (key === 'covariates_temp' || key
      === 'covariates_humidity') return a[key] - b[key];`) ahead of the string localeCompare
      fallthrough. spanGaps:false on the weather line (app.js:2294). No bare `ctx.parsed`
      (non-.y/.x) added on the temporal tooltip (git-diff added-line grep = NONE). Vanilla ES5,
      no new deps/build step. formatExplorerWeather is the single shared table+CSV formatter
      (app.js:1560). PASS.
  </executed_evidence>
  <violations>NONE</violations>
</audit_review>

<test_report>
  <task_id>broadn-p16-covariate-ui</task_id>
  <status>INDETERMINATE</status>
  <reason>Interaction-class runtime SCs not executable on the granted read-only Playwright MCP
    toolset; static + data + load layers all PASS. Per audit-pipeline Playwright boundary: do NOT
    PASS an interaction-class SC on read-only observation alone.</reason>
  <playwright>
    <tier>1 (vanilla-HTML fallback: python3 -m http.server 8000)</tier>
    <executed>
      App loaded http://localhost:8000/index.html?nocache=1 → HTTP 200, title renders,
      `body`/overview render. Console across the session: 0 errors, 1 warning (the pre-existing
      `cdn.tailwindcss.com should not be used in production` notice — app-wide, not a p16
      regression). Root "Sampling Activity Over Time" chart renders with its unchanged aria-label
      "Bar chart showing sample count over time" and NO weather overlay — correct (root temporal
      has no weather key). Screenshot: .playwright-mcp/p16-audit-load-overview.png.
    </executed>
    <static_qa_pass>
      SC5 (Explorer columns) STATIC layer verified in index.html:919-936 — thead has 9 columns in
        the exact order Sample ID / Date / Site / Type / Category / Stage / **Temp (Modeled)** /
        **Humidity (Modeled)** / Request; both new `<th>` carry scope="col" aria-sort="none" +
        `<button data-sort-key="covariates_temp|covariates_humidity">` with the literal disclosure
        aria-labels; footer `.weather-fidelity-caption` present with exact legend copy. Empty-row
        colspan raised to 9 (verified in renderTable). Formatter returns '—' (U+2014) for
        null/undefined and never 0/NaN/undefined/"null" (app.js:1560-1563). CSV header gains
        'Temperature (°C)' / 'Humidity (%)' in table order; both new CSV cells route through the
        SAME formatExplorerWeather via csvCell (app.js:1838-1839). flattenSampleCovariates runs once
        at init (app.js:4993) so isExplorerValueEmpty sorts '—' rows last with zero special-casing.
    </static_qa_pass>
    <not_executed_interaction_class>
      The following require click/select interaction the read-only toolset cannot drive (slice-open
      and Explorer pane are click-only; no URL deep-link; hidden `#explorer` pane is display:none and
      excluded from the a11y snapshot — confirmed empty targeted snapshot of #explorer-tbody):
        SC1 overlay on COLD slice-open (dashed weather line datasets[1] + "Modeled Estimate" badge +
            variable select + caption) — the Critic's specific blocker;
        SC2 variable selector swap (line/label/axis update, bars unchanged);
        SC3 null-weather month → visible line gap (no zero/NaN/[object Object]/throw);
        SC4 tag-active → overlay omitted (bars-only, zero console errors);
        SC6 Temp/Humidity header numeric sort (10 after 9) + '—' rows last both directions;
        SC7 CSV export live parity with the rendered table incl. '—' and current sort order;
        plus the live-rendered Explorer rows spot-check (SC5 values vs data.json) and SC8 on-load
        Explorer render/order.
    </not_executed_interaction_class>
    <handback>
      §2.3(b)-equivalent: re-run the 6 interaction scenarios in a write-capable browser session
      (a Playwright spawn WITH click/select, or a human click-through). No spec-file authoring is
      viable here (project forbids an npm/Playwright harness; T3/T4/p13 precedent). This is a
      verification action, not a code fix — no packet is asked to change code.
    </handback>
  </playwright>
  <defects>NONE identified on static/data/load evidence.</defects>
</test_report>

<security_audit>
  <status>SECURE</status>
  <threat_level>LOW</threat_level>
  <executed_evidence>
    Static-site constitution intact: no package.json anywhere, no new `<script>`/dependency, no
      runtime backend, no build step introduced (T3/T4 both confirmed; diff touches only
      app.js/index.html/DESIGN.md/preprocess_data.py/data.json).
    CSV formula-injection guard PRESERVED: csvCell (app.js:1824) still applies `/^[=+\-@\t\r]/` →
      leading-quote escape, and BOTH new weather columns pass through `csvCell(formatExplorerWeather
      (...))` (app.js:1838-1839) — so a formatted negative temp like `-3.2°C` is correctly
      neutralized to text, and the em dash passes through unquoted-as-text. UTF-8 BOM path
      untouched (app.js:1842).
    No hardcoded secrets introduced. The new `<select>` is client-only (dataset swap on an already
      instantiated Chart.js instance) — no new input-to-backend surface, no new external-data
      parse (no JSON.parse added in either diff; T4's 3 JSON.parse hits are pre-existing, outside
      the diff hunks).
  </executed_evidence>
  <findings>NONE</findings>
</security_audit>

---

## Auditor provenance (hygiene note; legacy envelope)
- agent_id: AUD#1 · parent: ORC#0 · independent_from: BE#1, UI#1, FE#1, FE#2
- Verdict path: .claude/tasks/outputs/broadn-p16-covariate-ui-AUD-final.md
- Screenshot evidence: .playwright-mcp/p16-audit-load-overview.png

---

## RE-ADJUDICATION (post-fix, 2026-07-07) — QA PASS · OVERALL PASS

**Verdict: QA PASS · OVERALL PASS (SA PASS · QA PASS · SX SECURE).** AUD#1 concurred:
*"I've independently confirmed the fix by reading `applyWeatherOverlay` myself this session (fresh
`{filter,label}` object literal at 2311-2320; reset block rebuilds into `_cb` at 2276-2279; overlay
via `CHART_COLORS.weatherOverlay`; `spanGaps:false`; no bare `ctx.parsed`), plus my originally-executed
SA PASS and SX SECURE. The interaction-class scenarios were re-run by a write-capable browser (ORC) —
that is exactly the §2.3(b) hand-back resolution my spec prescribes, and I adjudicate on that run
evidence. I concur."* (Persisted here by ORC#0 on the auditor's behalf — AUD#1 rendered the verdict
but stalled on the file/event-log write; this mirrors the audit-pipeline "ORC persists the auditor's
verdict" provision. Independence preserved: the distinct AUD#1 context did the adjudication.)

### What changed since the original CONDITIONAL verdict
A remediation (FE#1-rev2) fixed a runtime crash the read-only audit could not surface: `applyWeatherOverlay`
threw `RangeError: Maximum call stack size exceeded` (Chart.js reactive-proxy infinite recursion) on
any temporal carrying `weather`, swallowed by `renderSlice`'s per-widget try/catch → the overlay
silently never rendered. Root cause (bisected in-browser by ORC): in-place mutation of
`chart.options.plugins.tooltip.callbacks.filter`/`.label`. Fix: assign a fresh callbacks object literal
wholesale; reset/omit block rebuilds instead of `delete`-in-place.

### SA re-guards (executed against current app.js) — all clean
- No in-place `callbacks.filter/.label =` in `applyWeatherOverlay` (fresh object literal). The 4 other
  `callbacks.label =` hits (2685/3914/4097/4231) are pre-existing (verbatim in origin/main), out of scope.
- `CHART_COLORS.weatherOverlay: '#a21caf'` — single def (app.js:66), referenced not re-inlined; no
  collision with Okabe/brand-teal/pipeline hexes.
- No bare `ctx.parsed` (all `ctx.parsed.y`). `node --check assets/app.js` passes. Single DRY explorer
  path (computeExplorerFiltered / sortExplorerRows / buildExplorerCsv).

### QA interactive evidence (ORC write-capable walk; §2.3(b) hand-back)
- SC1 cold-open overlay renders (datasets 1→2; dashed `#a21caf` on `y1`; badge + selector + caption).
  Screenshot: `.playwright-mcp/p16-verify-overlay-coldopen.png`.
- SC2 selector swap (Temp→Humidity→Precip updates label/axis/values). SC3 null-month gaps render as
  gaps, no NaN/`[object Object]`, no throw. SC4 tag-omit unit-verified (resets to 1 dataset, no throw;
  `mergeTagChartData` carries no `weather`).
- SC5 Explorer Temp/Humidity columns; `BAD0001A → 5.5°C† / 31%†` matches data.json. SC6 numeric sort
  (desc 33.4→32.6; asc −26.9→…; `—` last). SC7 CSV parity (both cols, 4569 rows, `—` present, BAD0001A
  CSV row byte-matches table). SC8 zero console errors (only pre-existing Tailwind-CDN warning).

### SX — unchanged: SECURE
The fix is a pure refactor of Chart.js option assignment: no new dependency, no build step, no runtime
backend, no new input-to-backend surface; the p13 CSV formula-injection guard + BOM remain applied to
the two new columns. No new findings.
