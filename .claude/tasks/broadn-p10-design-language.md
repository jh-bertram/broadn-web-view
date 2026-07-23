> ## ⏯️ ON RESUME — START HERE (note left 2026-06-25 for next session)
> **You are Zoey.** Design-language eval + research for the BROADN web-view dashboard is DONE; brand decision is MADE. Nothing has shipped to code yet.
>
> **What's settled:**
> - Brand anchor = **BROADN teal** (deep `#0c5454` nav/headings/primary, bright `#0c9cb4` active/accent). **CSU green retires from UI.** Data series = Okabe-Ito (off-teal). See Decisions §below + memory `project_broadn_teal_rebrand`.
> - Logo moved to `assets/broadn-logo.webp` (untracked).
> - Reports: RA/UI/AUD outputs + `p10-confirm-*.png` render evidence in `.claude/tasks/outputs/`.
> - **Playwright is FIXED** (MCP re-registered + Chromium v1226 installed). It loads at session start, so ui-designer/code-auditor subagents now have a working live browser — no more Bash-screenshot workaround needed.
>
> **Where we paused:** I asked "launch the implementation sprint now, or pause?" — human relaunched instead of answering. So:
>
> **NEXT ACTIONS (in order):**
> 1. (Optional, quick) Filtered-state Playwright capture to settle findings **#1 (categorical-color anarchy)** and **#7 (four oranges)** — these were CANNOT-TELL from rest-state captures. Click a Project/Location slice filter, screenshot the slice donut + timeline legend, compare category→color mapping.
> 2. **Confirm with human: launch the DESIGN.md v2 + implementation sprint?** It SHIPS CODE → full pipeline (PM → Critic → UI/FE → audit → archivist), NOT direct. Touches `index.html`, `assets/app.js`, `assets/styles.css`, `DESIGN.md`. Scope = teal rebrand + Okabe-Ito data palette (by category-name) + global `Chart.defaults` (Inter) + orange consolidation/fix inverted signal + pipeline-bar contrast + hero-chip radius + logo in nav/hero.
> - To re-serve dashboard for any direct capture: `python3 -m http.server 8771` from repo root → http://localhost:8771/index.html. Standalone screenshot script (if MCP somehow still down): `scratchpad/shoot2.js` pattern (uses chromium-1228 path).
>
> ---
>
# Task: broadn-p10-design-language

**Human request:** Critically evaluate the web-view's overall design language and research a clean, professional scientific aesthetic adoptable across the site, widgets, and charts/graphs.

**Agents spawned:** researcher (RA), ui-designer (UI)
**Routing:** direct (ORC acting as PM — exploratory research + design-critique; no code ships this phase)

**Phase scope:** Evaluation + research only. Produces a design-language critique and a research-backed aesthetic direction with concrete token/chart guidance. Implementation (DESIGN.md v2 + dashboard refactor) is a separate follow-on sprint, gated on human approval of the direction.

**Live render:** http://localhost:8771/ (python http.server, started by ORC for visual critique)

**Outputs:**
- RA → `.claude/tasks/outputs/broadn-p10-design-language-RA-20260625.md` (research_dossier)
- UI → `.claude/tasks/outputs/broadn-p10-design-language-UI-20260625.md` (design critique + direction)
- AUD → `.claude/tasks/outputs/broadn-p10-design-language-AUD-20260625.md` (screenshot confirmation pass)
- Render evidence → `.claude/tasks/outputs/p10-confirm-*.png` (13 slices + fullpage/kpi/map/hero)

## Decisions (2026-06-25, human-ratified)

1. **Brand anchor = BROADN teal, not CSU green.** The official logo (`assets/broadn-logo.webp`)
   is teal: deep `#0c5454` (wordmark/horizon) + bright `#0c9cb4` (cloud). Human chose
   "Teal — match the logo": deep teal → nav/headings/primary; bright teal → active/accent/links;
   **CSU green `#166534` removed from the UI**; chart data series use Okabe-Ito (kept OFF brand teal
   so brand ≠ data). This OVERRIDES the DESIGN.md v1.0.0 Constitution rule "CSU Green is the brand
   anchor" — DESIGN.md v2 must update the Constitution + Color Tokens accordingly.

2. **Visual confirmation corrected the code-only critique.** AUD screenshot pass: finding #4
   (card depth absent) REFUTED — cards do render with rounded corners + hairline borders.
   Survivable problems: #5 orange-signal inverted (CONFIRMED), #2 pale "Sequenced" bar / #3 charts
   not in Inter / #6 hero chips rectangular (PARTIAL). #1 categorical-color anarchy + #7 four oranges
   = were CANNOT-TELL from rest-state captures.

3. **Filtered-state capture (2026-06-25, this session) → #1 and #7 now CONFIRMED.** Live
   Playwright `browser_evaluate` (Chart.js instance + getComputedStyle introspection) settled both:
   - **#1:** three distinct sample-type encodings coexist — `sampleTypes` (global donut),
     `sliceSampleTypes`/`samplerType` (slice views, 4 of 5 categories differ), and the
     sky/cyan concurrent-timeline legend (app.js:2870). One Okabe-Ito palette keyed by
     category-name must replace all three.
   - **#7:** three distinct orange *text* colors render simultaneously (`#c2410c` Tailwind,
     `#b33a00` `--color-orange-700`, `#b45309` amber-700) + `#ea6c00` `orangeAccent` on canvas;
     `--color-filter-accent` is unwired (empty at runtime). Collapse to one filter-accent token.
   - Evidence: `.claude/tasks/outputs/broadn-p10-filtered-state-confirm-20260625.md`.

## Infra fix (this session)
Playwright MCP was unregistered + browser build drift (wanted v1226, had 1208/1228). Fixed:
re-registered `playwright` MCP server (user scope, ~/.claude.json) + installed Chromium v1226;
launch verified end-to-end. Available to ui-designer/code-auditor subagents next session.

## Next step (pending human go)
DESIGN.md v2 + dashboard implementation sprint (full pipeline) — teal rebrand, Okabe-Ito data
palette by category-name, global Chart.js defaults (Inter), orange consolidation + fix inverted
signal, pipeline bar contrast, hero-chip radius.
