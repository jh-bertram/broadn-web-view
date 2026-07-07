# FE Output — broadn-p13-explorer-csv-sort

## completion_packet

**task_id:** broadn-p13-explorer-csv-sort
**agent:** frontend-engineer
**branch:** sprint/broadn-p13-explorer-csv-sort

### files_modified
- `/home/jhber/projects/broadn-web-view/index.html` (+20/-7)
- `/home/jhber/projects/broadn-web-view/assets/app.js` (+161/-3)

(Note: `docs/SESSION-CHECKPOINT.md` shows as modified in `git status` but was **not** touched by this task — it was already modified before this session started, per the pre-task `git status` snapshot.)

### Description of the diff

**index.html** (toolbar + thead, ~lines 869-936):
- Replaced the bare `#table-row-count` span with a flex wrapper containing a new `#explorer-csv-btn` (`<button type="button">`, filled deep-teal `bg-[var(--color-teal-deep)]` + `text-white`, download-glyph SVG, `aria-label="Download the currently filtered samples as a CSV file"`, `focus-visible` ring, `disabled:` styling) plus the existing row-count span.
- Added a visually-hidden `<span id="explorer-status" class="sr-only" aria-live="polite">` — `announce()` targets `#design-status`, which is designer-mode-only and not guaranteed to exist for normal visitors.
- Wrapped the 6 sortable header labels (Sample ID, Date, Site, Type, Category, Stage) in `<button type="button" data-sort-key="...">` inside their `<th scope="col" aria-sort="...">`, each with an empty `<span class="sort-indicator" aria-hidden="true">` for the ▲/▼ glyph. The `Date` `<th>` starts with `aria-sort="descending"` to match the JS default (see caveat below); the rest start `aria-sort="none"`. The `Request` `<th>` is untouched — no button, no `data-sort-key`, not sortable.

**assets/app.js:**
- New module-level constants/state (near `STAGE_LABELS`, ~line 1505): `PIPELINE_STAGE_RANK = { collected:0, extracted:1, sequenced:2 }` and `var explorerSort = { key: 'date', dir: 'desc' }`.
- **`computeExplorerFiltered(samples)`** — extracted Step A (dashboard slice/tag filter) + Step B (local dropdown filter) verbatim from the old `renderTable`, then applies `sortExplorerRows`. This is now the single source of truth for "what the Explorer shows"; `renderTable` and the CSV export both call it, so table order and export order can never drift apart.
- **`isExplorerValueEmpty(key, row)`** — null/undefined/'' always empty; for `pipeline_stage`, any value not in `PIPELINE_STAGE_RANK` is also empty.
- **`compareExplorerNonEmpty(key, a, b)`** — `pipeline_stage` compares by rank number; `date` compares by plain string `<`/`>` (lexicographic on the ISO string, per spec — deliberately NOT `localeCompare`, to avoid locale-dependent numeric collation); all other keys (id/site/type/category) use `localeCompare(..., { sensitivity: 'base' })` (case-insensitive).
- **`sortExplorerRows(rows)`** — in-place sort; empty/missing values are resolved to "always last" *before* the direction multiplier is applied, so asc/desc never disturbs that placement.
- **`updateExplorerSortIndicators()`** — walks `#explorer-table thead [data-sort-key]`, sets `aria-sort` on the ancestor `<th>` and the ▲/▼ text on `.sort-indicator`; called on every `renderTable()` pass.
- **`renderTable(samples, page)`** — now calls `computeExplorerFiltered`, then paginates (Step C unchanged), then calls `updateExplorerSortIndicators()` and toggles `#explorer-csv-btn`'s `disabled`/`aria-disabled` based on `total === 0`.
- **`announceExplorer(msg)`** — writes to the new `#explorer-status` live region (parallel to `announce()`, which targets designer-mode-only `#design-status`).
- **`csvCell(value)`** — null/undefined → `''`; formula-injection guard (leading `=`, `+`, `-`, `@`, tab, or CR gets a leading `'`); wraps in `"`, doubles embedded `"`.
- **`EXPLORER_CSV_HEADER`** / **`EXPLORER_CSV_FIELDS`** — single source of truth for CSV column order/labels (`Sample ID/id, Date/date, Site/site, Type/type, Category/category, Pipeline Stage/pipeline_stage`); Request is excluded from both arrays.
- **`buildExplorerCsv(rows)`** — builds the CSV text (header + rows, `\r\n` row separator, `,` cell separator, UTF-8 BOM `﻿` prepended).
- **`downloadExplorerCsv()`** — calls `computeExplorerFiltered(appData.all_samples)` fresh (so it always reflects the exact current filter+sort state, not a stale cached array), no-ops if 0 rows, reuses the exact Blob → `URL.createObjectURL` → temporary `<a download>` → `URL.revokeObjectURL` pattern from `downloadExport()`, filename `broadn-samples-YYYY-MM-DD.csv`, announces via `announceExplorer`.
- **`initDashboard`** (one-time wiring, ~line 4796): added a click listener on `#explorer-csv-btn` calling `downloadExplorerCsv()`, and click listeners on the 6 `[data-sort-key]` buttons (bound once, since the thead is static HTML and never re-rendered) that toggle `explorerSort.dir` if the same column is clicked again, otherwise set the new key with `dir='asc'`, then reset `tableCurrentPage = 1` and re-render.

### Exact new helper/function names added
`PIPELINE_STAGE_RANK`, `explorerSort`, `computeExplorerFiltered`, `isExplorerValueEmpty`, `compareExplorerNonEmpty`, `sortExplorerRows`, `updateExplorerSortIndicators`, `announceExplorer`, `csvCell`, `EXPLORER_CSV_HEADER`, `EXPLORER_CSV_FIELDS`, `buildExplorerCsv`, `downloadExplorerCsv`.

### Verification

- **`node --check assets/app.js`** → exit 0 (pass), re-verified after the final comment edit.
- **HTML balanced-tag parse** (Python `HTMLParser`) on `index.html` → 0 unclosed/mismatched tags.
- **Local static-serve sanity check**: `python3 -m http.server` + curl → `index.html` 200, `assets/app.js` 200, `data/data.json` 200.
- **Constant/DRY audit:** grepped both files for raw hex — 0 new hex introduced (new button/ring styling references `bg-[var(--color-teal-deep)]` / `focus-visible:ring-[var(--color-accent)]`, the existing CSS custom properties, not hardcoded hex). Pre-existing hex hits (`CHART_COLORS`, `SAMPLE_TYPE_COLORS`) are untouched and permitted per Rule A (Chart.js dataset config). Flagged (not fixed, out of scope): the 4 pre-existing filter-dropdown `change` handlers (lines ~4779-4796) have an identical inline body repeated 4x — pre-existing DRY debt, not introduced by this task, left alone per "minimal and localized" constraint.
- **JSON.parse check:** no new `JSON.parse` calls added by this task (CSV export never parses external JSON).
- **Click-handler keyboard-equivalent audit:** `grep -nE "<(span|div|li|a)[^>]*onClick="` on `index.html` → 0 matches. All new interactive elements are native `<button type="button">` (CSV button + 6 sort-header buttons) — native keyboard operation, no manual `tabIndex`/`role`/`onKeyDown` patch needed.
- **Style-conflict check:** `grep 'style="...overflow|display|position|flex|padding|margin|color|background|border...'` on both files → hits exist but are all pre-existing, far outside the edited region (hero banner, KPI icon halos, badge swatches, etc.) — 0 new inline-style/Tailwind conflicts introduced.
- **Data-contract pre-flight:** grepped `data/data.json`'s first `all_samples` entry for the 6 CSV field names before writing `EXPLORER_CSV_FIELDS` — confirmed `id, date, site, type, category, pipeline_stage` all present verbatim (same fields `buildRequestHref` already uses elsewhere in the file).
- **Manual interaction-matrix reasoning** (no browser-automation tool was available in this session — only Read/Write/Edit/Bash; no Playwright MCP or headless-browser tool was exposed to this agent):
  - Sort × filters × pagination compose correctly: `computeExplorerFiltered` always filters (Step A + B) then sorts (`sortExplorerRows`) before `renderTable`'s Step C slices it into a page — sort is always applied to the *full* filtered set, never per-page.
  - Prev/Next (`renderTable(appData.all_samples, tableCurrentPage ± 1)`, unchanged call sites) re-run `computeExplorerFiltered` each time, so the current `explorerSort` (a persistent module-level object, untouched by pagination) is preserved across page changes.
  - Every filter-change handler and `refreshTableIfReady()` (dash-slice/tag changes) already reset `tableCurrentPage = 1` before calling `renderTable`; none of them touch `explorerSort`, so "changing any filter preserves sort and resets to page 1" holds without new code in those call sites.
  - Sort-header clicks reset `tableCurrentPage = 1` and re-render — new sort, page 1, per spec.
  - `downloadExplorerCsv()` calls `computeExplorerFiltered(appData.all_samples)` fresh at click-time (not a cached/stale array), so it always reflects the exact filter + sort state visible at the moment of the click, across all pages.
  - Traced the default-sort math by hand: with `explorerSort = {key:'date', dir:'desc'}`, `mult = -1`; for two non-empty dates, `compareExplorerNonEmpty` returns `-1` when `a.date < b.date`; `mult * -1 = +1` → earlier dates sort after later dates → correct descending (newest-first) order.

### Caveat — flagging a false premise in the task brief (not a deviation, a disclosure)

The brief states the `explorerSort` default `{key:'date', dir:'desc'}` should make "the initial render match the current baked date-descending order — on-load appearance must not change." I inspected `data/data.json` directly and confirmed **`all_samples` is ordered by sample ID, not by date** (e.g. `BAD0001A, BAD0002A, BAD0003A, ...`), and is not sorted by date at all (mixed dates, including 656 samples with `date: null`, in file order). There was no pre-existing date-descending order to preserve — `renderTable` never sorted before this change.

I implemented the literal, explicit Feature-2 requirement anyway (default `key:'date', dir:'desc'`) because it's the one unambiguous, testable acceptance criterion in the brief, and "newest samples first" is a sensible default regardless. But this means **the Explorer's on-load row order WILL visibly change** (from raw ID order to true date-descending order) — this is a one-time visual delta from today's build, not a bug in my implementation. I did not silently "fix" the brief's incorrect premise or invent a different default; I'm surfacing it here per the FE/UI-Designer boundary ("if the spec is wrong or incomplete, flag it in your output packet rather than improvising"). If ORC/PM want zero visual change on load instead, the fix is a one-line default change (e.g. `explorerSort = { key: null, dir: 'asc' }` treated as "no sort" until a header is clicked) — happy to make that change if requested.

### Tier 2 Playwright smoke-test — flagged, not completed (infra conflict)

This task adds new interactive flows (CSV download is an async user-initiated action; the 6 sort headers are new click-to-sort controls) to an existing surface, which the Smoke Test Requirement's Tier 2 rule would normally apply to. However:
- `broadn-web-view` has **zero npm/package.json infrastructure anywhere in the repo** (confirmed via `find . -iname package.json` — no results) — it is a dependency-free static site by design (per this repo's own `CLAUDE.md`: "no package.json, and no build system... There are no build, test, or lint commands for this repository itself").
- My task brief's own hard constraints explicitly state: "No build step, no bundler, no framework, no new libraries" and "Pure front-end, no backend, no data-model change, no new dependencies."

Installing `@playwright/test` would require introducing an entirely new npm toolchain (`package.json`, `node_modules`, `playwright.config.ts`) into a repository that has never had one — a much larger, unrequested architectural change that directly contradicts my task's explicit "no new dependencies" instruction. Rather than unilaterally deciding which constraint wins, I'm flagging the conflict here for ORC/PM to resolve (e.g., accept Tier-1-only + manual verification for this static-site special case, or explicitly authorize introducing npm/Playwright infra as a separate follow-up task).

`e2e_spec`: **CONFLICT — see "Tier 2 Playwright smoke-test" section above.** No spec file created this session; Tier 1 (auditor's automatic Playwright smoke check for app-loads/no-JS-exceptions) still applies and should catch a broken build.

## ui_packet

```xml
<ui_packet>
  <components_created>
    None (no new component files — this is a plain-HTML/vanilla-JS static site, not a component framework). Modified: /home/jhber/projects/broadn-web-view/index.html (toolbar + thead), /home/jhber/projects/broadn-web-view/assets/app.js (renderTable extraction + new sort/CSV helpers + one-time event wiring in initDashboard).
  </components_created>
  <state_hydration_map>
    No BE/tRPC involved (static-site constitution, data/data.json fetched once at load into `appData`). New client-only state: module-level `var explorerSort = { key, dir }` (mirrors the existing `tableCurrentPage` global pattern) drives `computeExplorerFiltered` → `sortExplorerRows`, consumed by both `renderTable` (paginated view) and `downloadExplorerCsv` (full-set export) — single source of truth, no duplication.
  </state_hydration_map>
  <a11y_verification>
    CSV button: native `<button type="button">`, `aria-label`, `focus-visible` ring, `disabled`+`aria-disabled` when 0 filtered rows (native `:disabled` handles keyboard/AT semantics). Sort headers: native `<button type="button" data-sort-key>` inside `<th scope="col">` (Enter/Space native, no custom onKeyDown needed), `aria-sort` on the `<th>` kept in sync every render via `updateExplorerSortIndicators()`, visual ▲/▼ indicator paired with the ARIA state. New `<span id="explorer-status" class="sr-only" aria-live="polite">` announces CSV download results for visitors outside designer mode (`announce()`'s `#design-status` target is designer-mode-only). Click-handler keyboard-equivalent grep (`<span|div|li|a ... onClick=`) on index.html: 0 matches — no manual tabIndex/role/onKeyDown patch needed. Contrast: white text on `bg-[var(--color-teal-deep)]` (#0c5454) ≈ 9.1:1 (DESIGN.md-verified figure for this pair, contrast ratio is symmetric under fg/bg swap) — passes WCAG AAA, well above the 4.5:1 AA floor. Bright teal (`--color-accent`) used only for focus rings/borders, never as small text on white, respecting the Teal Text Restriction.
  </a11y_verification>
  <design_tokens_used>
    --color-teal-deep (#0c5454, via Tailwind arbitrary-value bg-[var(--color-teal-deep)]) for the CSV button fill; --color-accent (#0c9cb4, via focus-visible:ring-[var(--color-accent)]) for focus rings only (non-text, per Teal Text Restriction). No raw hex introduced anywhere in the diff — grep-confirmed.
  </design_tokens_used>
  <style_conflict_check>NONE — grepped both touched files for inline style= overlapping a Tailwind utility on the same element; all hits are pre-existing and outside the edited region (hero banner, KPI halos, badge swatches, unrelated to this task).</style_conflict_check>
  <integration_status>
    SUCCESS for both features (CSV export + sortable columns), with two disclosures requiring ORC/PM attention (not implementation gaps): (1) the task brief's "on-load appearance must not change" premise does not hold for this dataset — data/data.json's all_samples is ID-ordered, not date-ordered, so applying the spec'd date-desc default sort will visibly reorder the table on first load (see Caveat section above for the one-line alternative if zero-visual-change is actually required); (2) Tier 2 Playwright smoke-test spec was not created — this repo has zero npm/package.json infrastructure by design and my task's own hard constraints forbid new dependencies/build steps, so I flagged the conflict rather than unilaterally introducing an npm/Playwright toolchain (see "Tier 2 Playwright smoke-test" section above for options). Also flagged, out of scope, not fixed: 4 pre-existing near-identical filter-dropdown change-handler bodies in initDashboard (lines ~4779-4796) predate this task and were left untouched per the "minimal and localized" constraint.
  </integration_status>
</ui_packet>
```
