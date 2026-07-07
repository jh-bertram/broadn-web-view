# Audit Verdict — broadn-p13-explorer-csv-sort

- task_id: broadn-p13-explorer-csv-sort
- auditor: AUD (read-only, three-gate)
- branch: sprint/broadn-p13-explorer-csv-sort (diff vs main)
- files: index.html (+27/-10), assets/app.js (+165)
- envelope: legacy three-block. broadn-web-view is a standalone static-site repo with NO
  audit-pipeline skill and NO v2.0 substrate-check machinery (commit-packet / requirements-validate
  are absent); the v2.0 typed wrapper has no downstream consumer here and the brief requests legacy.
- verification method: static code review + BROWSER-DRIVEN interaction test. The read-only MCP
  Playwright set cannot click/keyboard, so interaction-class criteria were driven headless via
  playwright-core (chromium 1228 headless shell) against python3 -m http.server 8137 — a full,
  non-observation-only exercise of sort/toggle/filter/pagination/keyboard/CSV.

## SA — Standards & Accessibility

<audit_review>
  <target_file>assets/app.js, index.html</target_file>
  <status>PASS</status>
  <violations>
    <!-- none -->
  </violations>
  <notes>
    DRY: Step-A (dashboard slice/tag) + Step-B (dropdown) filter logic now lives in exactly ONE
      place — computeExplorerFiltered(). renderTable() calls it then paginates; downloadExplorerCsv()
      calls the same helper. No duplicated filter block remains in renderTable (verified in diff:
      the old inline Step-A/B moved into the new function; renderTable now starts at Step-C).
    A11y: sortable headers are real <button>s (native keyboard); Sample ID cell is <th scope="row">
      (row-header, confirmed live). aria-sort maintained per state by updateExplorerSortIndicators()
      on every render pass (verified live cycling none/ascending/descending). scope="col" preserved
      on all headers. Visible focus: focus-visible:ring-2 ring-[var(--color-accent)] — live computed
      boxShadow shows the 3px #0c9cb4 ring on the CSV button and 2px outline on sort buttons. Each
      sort button + the CSV button carry descriptive aria-labels; ▲/▼ indicator is aria-hidden.
      CSV button has a real disabled state (disabled + aria-disabled + disabled: utility classes).
    Brand/contrast: CSV button renders deep teal — live getComputedStyle backgroundColor =
      rgb(12,84,84) = #0c5454, color rgb(255,255,255). Token --color-teal-deep resolves in-browser
      (NOT transparent). ~9.1:1 on white per styles.css annotation — WCAG AA pass. --color-accent
      (#0c9cb4) resolves for the focus ring. No bright-teal small text introduced (Teal Text
      Restriction respected — bright teal used only for the non-text focus ring).
    Idiom: new code is ES5 var/function throughout; no arrow funcs / const / let introduced; new
      constants are SCREAMING_SNAKE (PIPELINE_STAGE_RANK, EXPLORER_CSV_HEADER, EXPLORER_CSV_FIELDS);
      mutable state explorerSort is camelCase. Matches file style.
  </notes>
</audit_review>

## QA — Functional (BROWSER-VERIFIED, headless chromium)

<test_report>
  <task_id>broadn-p13-explorer-csv-sort</task_id>
  <status>PASS</status>
  <test_coverage>e2e (browser-driven interaction) — 5/5 criteria passed</test_coverage>
  <playwright>
    <tier>1+2 (headless chromium via playwright-core; MCP set is read-only so interactions were
      driven from a Bash-run driver — satisfies the interaction-class verification requirement)</tier>
    <tests_run>5</tests_run>
    <passed>5</passed>
    <failed>0</failed>
    <playwright_output>console errors across all runs: [] (zero). Server: python3 http.server 8137.</playwright_output>
  </playwright>
  <results>
    SC1 zero on-load regression: on first Explorer render all 6 aria-sort = "none", all sort
      indicators empty, rows in natural data.json order (first rows date 2022-03-23, NOT date-sorted).
      CSV button visible + deep teal (#0c5454). PASS.
    SC2 sorting: Date asc -> top 2021-01-01 (earliest); toggle -> desc top 2025-07-14 (latest);
      aria/▲▼ update, exactly one active column at a time. Sample ID asc -> BAD0001A..BAD0007A.
      Stage asc -> page1 all "Collected" (rank 0 first); desc -> page1 all "Sequenced" (rank 2 first)
      — process order collected->extracted->sequenced, code uses PIPELINE_STAGE_RANK not alpha. PASS.
    SC3 sort x filter x pagination compose: applying site=ARDEC keeps Date-ascending active and
      resets to page 1 (27 of 27). Full-set date-asc pagination: page1 top 2021-01-01, page2
      2021-02-09, page3 2021-03-17 (monotonic across page boundaries => full set sorted, not just
      visible page); Prev returns to page2 with sort intact; aria stays "ascending" throughout. PASS.
    SC4 CSV button state: site=ARDEC + year=2021 (guaranteed-empty combo) -> 0 rows, "No samples
      match", button.disabled=true AND aria-disabled="true". Clearing filters -> enabled,
      aria-disabled="false". PASS.
    SC5 keyboard: Tab/focus a sort header + Enter -> sorts (site asc, top ARDEC, aria ascending);
      Space -> toggles to descending. CSV button focus ring visible (computed boxShadow = white
      inset + #0c9cb4 3px ring). PASS.
    CSV fires: clicking the button triggered a real download with no console error; captured file =
      BOM + header "Sample ID","Date","Site","Type","Category","Pipeline Stage" then 4569 data rows
      (4570 lines total), first data row BAD0001A,2022-03-23,ARDEC,Air,Field Sample,sequenced.
  </results>
  <defects>
    <!-- none -->
  </defects>
</test_report>

## SX — Security

<security_audit>
  <status>SECURE</status>
  <threat_level>LOW</threat_level>
  <findings>
    <!-- no vulnerabilities -->
  </findings>
  <notes>
    CSV formula injection: csvCell() prefixes a leading single-quote when a value starts with
      = + - @ tab or CR (regex /^[=+\-@\t\r]/ — hyphen escaped as \- so it is a literal, not a
      range), then quote-wraps and doubles embedded ". Unit-tested in isolation: "=SUM(A1)" ->
      "'=SUM(A1)", "+1"/"-1"/"@cmd"/tab/CR all prefixed; embedded quote he"llo -> "he""llo";
      null/undefined -> ""; non-leading "a=b" correctly left un-prefixed. EVERY exported cell passes
      through csvCell (header via EXPLORER_CSV_HEADER.map(csvCell); data via
      EXPLORER_CSV_FIELDS.map(f => csvCell(row[f]))). Exactly 6 fields exported
      (id/date/site/type/category/pipeline_stage); Request/mailto column excluded (confirmed in the
      captured download header + rows).
    XSS: CSV assembled as text into a Blob (type text/csv;charset=utf-8), never innerHTML. Table row
      render still uses escapeHtml (unchanged). No eval, no new innerHTML of untrusted data, no
      secrets, no network calls added. BOM + charset are cosmetic-safe.
  </notes>
</security_audit>

## Overall: PASS (SA PASS / QA PASS / SX SECURE) — no required fixes.
