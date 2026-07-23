# Audit Verdict — broadn-p12-FE-002-layout-collapse-reaudit

Auditor: AUD#1 (parent ORC#0). Independent re-audit of FE#1's one-line layout-stability fix.
Task: broadn-p12-altitude-single-rail sprint — regression found at human verification.
Verdict mode: legacy three-block (config-only repo; no audit-pipeline v2.0 schema file present;
spawning prompt explicitly requested audit_review + test_report).

## Scope
Single-target re-audit of the desktop "category selected, no group picked" layout-collapse
regression and its fix at `index.html:84` (`w-full` added to `#dashboard-layout`).

## SA — Standards Check

<audit_review>
  <target_file>index.html</target_file>
  <status>PASS</status>
  <violations>
    <!-- none -->
  </violations>
  <notes>
    git diff confirms the change is EXACTLY one line: `#dashboard-layout` class list gains
    `w-full` (now `flex flex-col lg:flex-row gap-0 w-full max-w-7xl mx-auto px-4 sm:px-6
    lg:px-8 py-12`). +1 added line, -1 removed line. No JS change: assets/app.js, styles.css
    are unmodified in the working tree (git status clean for both). No new show/hide logic;
    renderView()'s `cat !== null && group === null` branch (app.js:3985) is untouched.
    `w-full max-w-7xl mx-auto` is the canonical full-width-up-to-max centered-container
    pattern — a pure layout-class addition, not a logic change. No standards violations
    (no Zod/API boundary, no a11y regression, no hardcoded token introduced).
  </notes>
</audit_review>

## QA — Functional Verification (LIVE)

Verified live against `python3 -m http.server 8099` at the project root, driven by a real
playwright-core (1.61.1) + chromium-1228 script at a true desktop viewport of 1280x900
(the MCP browser was pinned at 937px, below Tailwind's lg:1024 breakpoint — insufficient
for a desktop-only bug, so a scripted base-path Playwright run was used instead). Cache-bust
via `?nocache=<timestamp>` on every navigate. #slice-sidebar-wrapper.boundingBox.x measured
at each state (left content edge ≈ 32px; viewport-center would be ≈ 512px).

<test_report>
  <task_id>broadn-p12-FE-002-layout-collapse-reaudit</task_id>
  <status>PASS</status>
  <test_coverage>e2e (scripted browser walk) — 8 checks, 8 passed, 0 failed</test_coverage>
  <playwright>
    <tier>1 (live smoke) + scripted interactive desktop walk</tier>
    <tests_run>8</tests_run>
    <passed>8</passed>
    <failed>0</failed>
    <playwright_output>
      (1) Project, no group   → rail.x=32 (LEFT), body width=960 (NOT collapsed), project-group-list visible, aria-expanded=true.
      (2a) Location/Hub, no group → rail.x=32 (LEFT), location-group-list visible.
      (2b) Lab Group, no group   → rail.x=32 (LEFT), labgroup-group-list visible.
      (3) Project → IMPROVE Fungi (1,056) → slice-view-container visible, rail.x=32, renders normally.
      (4) All BROADN Samples → global-charts-area visible, slice-view hidden, rail.x=32 (story restored).
      (5) Explorer → #explorer visible, global-charts + slice-view BOTH hidden (gated correctly, no leak), rail.x=32.
      (6) Horizontal overflow @1280: documentElement scrollWidth==clientWidth==1280 in both story and category-no-group states. No scrollbar introduced by w-full.
      (7) Mobile 390px: #slice-drawer-trigger opens drawer → #slice-sidebar becomes fixed full-height (x=0,w=288,h=844), category buttons visible, overlay shown. B6 drawer intact.
      (8) Console errors across the entire walk: 0.
    </playwright_output>
  </playwright>
  <defects>
    <!-- none -->
  </defects>
  <evidence_screenshots>
    .claude/tasks/outputs/broadn-p12-fe002-project-nogroup.png  (rail pinned LEFT — the previously-broken state, now stable; visually confirmed)
    .claude/tasks/outputs/broadn-p12-fe002-location-nogroup.png
    .claude/tasks/outputs/broadn-p12-fe002-labgroup-nogroup.png
    .claude/tasks/outputs/broadn-p12-fe002-group-picked.png
    .claude/tasks/outputs/broadn-p12-fe002-explorer.png
    .claude/tasks/outputs/broadn-p12-fe002-mobile390-drawer.png
  </evidence_screenshots>
</test_report>

## SX — Security Scan

<security_audit>
  <status>SECURE</status>
  <threat_level>LOW</threat_level>
  <findings>
    <!-- none — change is a single Tailwind layout class (w-full) on a layout container.
         No data flow, no user input, no auth surface, no dependency change. -->
  </findings>
</security_audit>

## Overall: PASS

Root cause (empty #dashboard-body collapsing the shrink-to-content #dashboard-layout, letting
mx-auto center the lone 16rem rail) is resolved. With w-full the layout fills the viewport up
to max-w-7xl, so the empty body holds 960px and the rail stays pinned left (x=32) in all three
category-no-group states. All regression spot-checks (3-7) pass; mobile B6 drawer intact; zero
console errors. No new violations or vulnerabilities introduced.
