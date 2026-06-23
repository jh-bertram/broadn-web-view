# BROADN Web-View — Status & Complexity-Review Agenda

**Written:** 2026-06-22 · **Branch:** main · **Author:** Claude (with Jonathan)

Two parts: (1) where the dashboard stands after this session's feedback work, and
(2) the standing intention to evaluate and critique the web-view's complexity —
the through-line goal of *streamline + ease of use* that we deliberately deferred
while shipping correctness fixes and project pages.

---

## Part 1 — Where we are

### Shipped / in flight (Claire's feedback, triaged into buckets)

| Bucket | What | Status |
|---|---|---|
| **A** — corrections | Partner affiliations in hero; readable site **names** on map + Samples-by-Site (was cryptic 2-letter codes); map marker "Name (CODE)"; pipeline caption (failed vs in-progress); **Data Explorer project-group filter bug** (CPER selected → 0 rows → fixed) | ✅ committed `908bce3`, **pushed/live** |
| Data fixes | Great Smoky IMPROVE coord (`IM`) moved Utah → TN (`35.6334,-83.9417`); `OC` relabeled "Carolinas" → "South Carolina". Source of truth is **`data/sites.json`**, regenerated via `scripts/preprocess_data.py` — NOT the spreadsheet (xlsx coords are only a fallback) | ✅ live |
| **B** — rich project pages | `PROJECT_CONTENT` store → upgraded `#project-banner`: summary, location chip, linked lead scientist, co-investigators, publication/data chips. All 20 projects populated; operational sub-campaigns get lead+summary only (no fabricated co-Is/links) | ✅ committed `1536819`, **awaiting `git push origin main`** |
| **C** — new plots | Biomass/qPCR and sampling-height charts Claire requested | ⛔ **blocked on data entry** — `qPCR` column empty across all 28 projects, no height/elevation column |

### Reconnaissance captured
- **`.claude/tasks/outputs/recon-broadn-web-RA-20260622.md`** — full dossier: BROADN site map (broadn.colostate.edu), 21 project descriptions, 38-person team roster w/ bio URLs, publications, and the spreadsheet↔website↔publication mapping. Reusable for any further project-page or people work.

### Known open items (not blocked, just not done)
- **Photos** — the one real content gap; project banners have an icon tile ready to receive real images once the team supplies them.
- **Pipeline failed-vs-in-progress split** — currently a caption; a true split needs the sheet's `DNA FLAG` (and similar status fields) wired into the chart.
- **Reply to Claire** — confirm SN is fine (her instinct there was off); explain buckets C are data-blocked, not effort-blocked.

---

## Part 2 — Complexity-review agenda (the standing intention)

The web-view has grown into a **single 4,577-line / 220 KB `index.html`** with **20
Chart.js charts**, a Leaflet map, and a 2 MB `data.json`. The core concern, stated
at the outset: *the complexity has ballooned; streamline and ease of use matter.*
This section is the agenda for evaluating that — to be run as its own pass, not
folded into feature work.

### The central architectural tension
The page is effectively **two dashboards stacked in one file**:
1. **A scrolling public story** — Overview → Geography → Sample Breakdown → Data
   Management → Data Explorer. Appropriate for a layperson / first-time visitor.
2. **A power-user "slice" subsystem** — a left sidebar filtering by Project /
   Location / Lab Group, each selection rendering its *own* parallel dashboard
   (4 `render*View` functions).

These are **two competing navigation models** in one viewport. A layperson lands on
the long scroll and may never engage the sidebar tool; a power user wants the slice
tool but wades through the narrative first.

### The specific complexity drivers to critique
1. **Slice-view duplication.** Project / Location / Lab-Group views each repeat
   roughly the same five chart types (sample types, pipeline, temporal, replicates,
   sampler). ~3× near-identical code and chart inventory. **Candidate: collapse into
   one parameterized renderer.**
2. **Chart-count inflation.** 20 charts. Audit which earn their place vs. which are
   redundant doughnuts repeated per slice. **Candidate: cut / consolidate.**
3. **Single-file architecture.** 220 KB HTML mixing markup + ~3,600 lines of inline
   JS + inline styles. A maintainability liability. **Candidate: extract JS/CSS to
   separate files** — allowed by the DESIGN.md constitution; does not touch the
   no-framework rule.
4. **Under-used slicing dimensions.** Does Location and/or Lab-Group slicing earn
   its cost, or could one be demoted/removed? **Needs a value-vs-cost judgement** (no
   usage analytics today — may need a heuristic or instrumentation).
5. **Altitude mismatch.** Is one page trying to be both a public-facing exhibit and a
   research data tool? **Candidate: separate the two altitudes** (e.g., a clean
   landing story + a distinct "explore" view) rather than overloading one scroll.
6. **Reinvestment, not addition.** Where streamlining frees surface area, spend it on
   the richer project pages (bucket B) instead of generic repeated charts.

### How to evaluate (proposed method)
- **Critical-eye walkthrough** of every section and slice view: for each, ask "does
  this earn its complexity? who is it for? what breaks if it's removed?"
- **Metrics to track before/after:** file size, line count, chart count, duplicated
  code (the `render*View` family), and click-depth to reach key data.
- **Decision lens:** every surface must justify itself against *streamline + ease of
  use*. Default to removal/consolidation; require a reason to keep.
- **Possible execution:** a focused multi-perspective review (e.g., dispatch a critic
  / auditor pass over the slice subsystem and chart inventory) before any refactor,
  so cuts are deliberate and reversible.

### Sequencing note
This review was **deliberately deferred** in favor of quick wins (bucket A) and
project pages (bucket B), which were higher-value and lower-risk. The streamlining
pass is the natural next major thread once the feedback buckets settle — and it
should precede any further feature additions, so we streamline *before* we grow.
