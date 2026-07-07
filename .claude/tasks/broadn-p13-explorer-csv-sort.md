# Task: broadn-p13-explorer-csv-sort

**Human request:** "Jump on Phase 0" of the covariate/explorer/checkout architecture assessment — Data Explorer quick wins: client-side CSV download of the filtered rows + sortable columns. Pure front-end, no backend, no data-model change.

**Routing:** direct (ORC acting as PM — simple single-domain FE task, per CLAUDE.md routing rule for single-domain work).

**Agents spawned:** frontend-engineer (implement) → code-auditor (SA/QA/SX gate, browser-verified) → archivist (log completion).

**Branch:** `sprint/broadn-web-view` → `sprint/broadn-p13-explorer-csv-sort` (branched from `main`).

## Scope
Two additive, localized front-end features on the existing Data Explorer (shipped p7):

1. **Download CSV** — a keyboard-accessible, brand-teal button in the explorer toolbar that exports the CURRENT filtered set (all matching rows across all pages, in current sort order) as a CSV, with formula-injection-safe quoting and a UTF-8 BOM. Reuses the Blob→anchor pattern in `downloadExport()` (app.js:2674).
2. **Sortable columns** — the 6 data columns (Sample ID, Date, Site, Type, Category, Stage) become sortable via keyboard-operable header buttons with `aria-sort`; default remains date-descending so on-load appearance is unchanged. Sort applies to the full filtered set before pagination.

## Files in scope
- `index.html` — explorer toolbar (~869–902) + thead (~906–917)
- `assets/app.js` — `renderTable` region (~1537–1672); reuse `escapeHtml` (1681), `downloadExport` (2674), `announce` (2738), `STAGE_LABELS` (1505), `tableCurrentPage` (23)

## Success criteria
- CSV exports the filtered+sorted set (not just the visible page); columns = id, date, site, type, category, pipeline_stage; safe against CSV formula injection; opens cleanly in Excel (BOM).
- Filter logic is DRY: Step-A/Step-B filtering extracted to one shared helper used by both `renderTable` and the CSV export.
- All 6 data columns sortable; Request column not sortable; asc/desc toggle; `aria-sort` maintained; keyboard-operable; default date-desc unchanged on load.
- Sort × filters × slice/tags × pagination compose correctly; changing a filter resets to page 1 and preserves sort.
- Static-site constitution respected: vanilla JS matching the file's existing `var`/`function` idiom, Tailwind CDN utility classes, no build step, no new deps. DESIGN.md brand tokens; WCAG AA on the new control (respect the Teal Text Restriction — filled deep-teal `#0c5454` button with white text is compliant).
- Audit SA + QA (browser-verified) + SX all PASS before durability commit.

## Verification gate
Change likely exceeds 50 new lines → durability commit only after audit PASS (standards § Git).
