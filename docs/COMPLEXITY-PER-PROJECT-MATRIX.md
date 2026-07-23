---
type: project-doc
---

# BROADN Web-View — Per-Project Chart-Relevance Matrix

**Written:** 2026-06-23 · **Branch:** main · **Author:** Claude (ORC, synthesis pass)
**Method:** Synthesis of 20 per-project chart-relevance recommendations (one per project in
`data.json` → `slice_views.project`), each grounded firsthand in that project's populated
sample-metadata slice. **Analysis only — no `index.html` or other code changed.**

**Companion document:** [`COMPLEXITY-REVIEW-FINDINGS.md`](./COMPLEXITY-REVIEW-FINDINGS.md).
That document establishes the *mechanical* case (extract inline JS/CSS; collapse the three
near-duplicate slice renderers into one `renderSlice(descriptor)`; cut the three per-slice
sampler charts). **This document supplies the evidence for what that single descriptor must
express**: it proves, project by project, that a fixed uniform 4-chart template is wrong far
more often than it is right, and it derives the concrete schema fields a declarative renderer
(and a future designer mode) needs. Read FINDINGS §4–§5 and §8 first; this is the data behind
FINDINGS §4 hazard 2 ("the descriptor's chart list must be ordered + optional, not a fixed
4-up grid").

The current slice subsystem renders the same fixed inventory for every project: a
**sample-types doughnut**, a **pipeline bar**, a **temporal bar**, a **sampler chart**, and a
**tag/replicate badge** row, under a banner. This matrix asks, for each of the 20 projects,
which of those five actually carry information given that project's real metadata.

---

## 1. Executive summary

**The uniform 4-chart template is degenerate more often than not.** Across 20 projects and
the 5 recurring widgets (100 widget instances), the verdicts land at roughly **31 keep / 33
tailor / 36 cut** — only **~31% of template widget instances earn an unmodified keep.** Two of
every three template charts are either wrong as-rendered (tailor) or pure noise (cut) for the
project they appear on. The single biggest driver is the *single-value field*: a doughnut or
bar built on a field with exactly one distinct value is a 100% slice that conveys nothing, and
the dataset is full of single-substrate, single-sampler campaigns.

**Near-universally dead widgets (cut/demote on a clear majority of projects):**

- **Sampler chart — the weakest widget in the system.** Cut or tailored on **~17 of 20**
  projects. It is degenerate (1 sampler) on the many single-sampler air campaigns, and on
  several projects it is *actively misleading*: the sampler is recorded for only a subset of
  samples (e.g. Fragmented Landscape — UPAS covers 194 of 623; ARDEC — 11 of 26; Spring Plants
  & Soil — SASS tagged on only 13 of 93), so a naive chart implies a project-wide proportion
  that is false. It is a clean *keep* on only the handful of true sampler-evaluation campaigns
  (Spring SASS/Polycarbonate, Spring Sass/VIVAS, BACS, 2024 Summer), where it is the headline.
  This is the strongest cross-project confirmation of FINDINGS §2's "CUT the three per-slice
  sampler charts."
- **sample-types doughnut — cut/tailored on ~13 of 20.** Degenerate (single substrate, almost
  always Air) on the air-monitoring projects; a low-information 2-slice chart on the even
  binary designs (Fall Plant Circle 50/50, Fall Plants & Soil 2:1). It is a genuine *keep* only
  where there are ≥3 real substrate values (Fragmented Landscape, Spring Plants & Soil, ARDEC
  borderline) — i.e. the cross-substrate field studies.
- **tag/replicate badges — cut on ~8 of 20**, because `tag_groups` is empty or every
  `replicate_tags` bucket is empty. But where populated it is frequently the *single
  highest-signal* widget (see below), so the verdict is bimodal, not uniformly low.

**Near-universally useful widgets:**

- **Banner — keep/tailor on 20 of 20 (never cut).** It is the page's identity and, under the
  sample-metadata-only constraint, the *only* place results live (as publication/data link
  chips). Its dominant failure mode is the opposite of a chart's: the slice record's
  enrichment fields (`lead`, `co_investigators`, `sites`, `publications`) are **null for most
  projects** and must hydrate from the project registry / recon dossier, while empty chips must
  be *suppressed*, never rendered blank, and publications must **never be fabricated**.
- **Pipeline bar — keep/tailor on 20 of 20 (never cut outright).** The richest *status* signal
  available from sample metadata. But it splits sharply by shape and demands tailoring: it is a
  real funnel with attrition on some projects (IMPROVE Fungi 1056→862; BACS 274→220; INP
  151→51), a flat "all 100%" bar on the fully-processed ones (Fragmented Landscape, 2022 Fall
  CPER, Two Towers, 2022 Fall CPER Extra → demote to a completion stat), and a "collected-only,
  0 sequenced" empty-state on the in-flight ones (Flux, Spring Chemistry, 2024 Summer,
  Optimization Tests → must render an explicit empty state, not a broken-looking chart).

**The decisive structural finding.** No two projects want the same layout. The richest signal
is wildly project-specific and *buried* in the current template: vertical-height stratification
(Flux Top/Bottom 142/142; Two Towers Top/Middle/Bottom; 2022 Fall CPER Position A/B/C), a
12-quadrant processing gradient (Fall Plant Circle: Q3/Q5/Q7 fully sequenced vs Q2/Q11/Q12 at
zero), a sampler×pipeline crosstab on the eval campaigns, and field-control identity on the
control sets — all of these live inside the one widget (tags) the template treats as a passive
badge row. **A fixed template cannot express this; a per-project declarative descriptor can.**
That is the bridge from this matrix to the schema in §4.

---

## 2. Relevance matrix

Rows = the 20 projects (descending by sample count). Columns = the five current template
widgets. Cells: **K** = keep (render as-is), **T** = tailor (render but reshape: re-bind,
re-size, annotate, or split), **C** = cut (do not render; fold its fact into a stat/banner).
Banner is K/T on every project and is omitted from the grid (it is never cut). Final column =
the highest-value NEW widget(s) that project's metadata supports (deduped catalog in §5).

| # | Project | n | sample\_types | pipeline | temporal | sampler | tags | Recommended NEW widget(s) |
|---|---|--:|:--:|:--:|:--:|:--:|:--:|---|
| 1 | IMPROVE Fungi | 1056 | **C** | **K** | **T** | **C** | **C** | kpi/stat-strip; gap-aware temporal; temporal-phase caption |
| 2 | Fragmented Landscape | 623 | **K** | **C** | **T** | **C** | **C** | data-accession chip; substrate stat-trio; completion badge |
| 3 | Fall Plant Circle | 384 | **T** | **K** | **C** | **T** | **T** | **quadrant pipeline matrix**; paired-design stat strip |
| 4 | Spring Plant Circle | 360 | **K** | **T** | **T** | **C** | **T** | quadrant sampling-circle grid; pipeline-by-type; AM/PM stat |
| 5 | Fall Plants & Soil | 306 | **T** | **T** | **C** | **C** | **K** | design-matrix stat; pipeline funnel w/ type-split attrition |
| 6 | Flux | 304 | **C** | **T** | **K** | **C** | **T** | **height paired-bar (Top/Bottom)**; QA-control strip; window chip |
| 7 | Spring SASS/Polycarbonate | 304 | **C** | **K** | **T** | **T** | **C** | **sampler×pipeline crosstab**; stat-strip |
| 8 | BACS | 274 | **C** | **K** | **T** | **K** | **T** | sequencing-success stat; publication spotlight |
| 9 | Spring Sass/VIVAS | 159 | **T** | **K** | **T** | **K** | **T** | **sampler×pipeline crosstab**; 2-campaign temporal; QA strip; big-stat strip |
| 10 | Ice-Nucleating Particles | 151 | **C** | **K** | **K** | **T** | **C** | headline-stat strip; season-grouped temporal; publication chip; honest-denominator sampler |
| 11 | Spring Chemistry | 120 | **C** | **T** | **K** | **C** | **C** | key-stats strip; collection-stage badge |
| 12 | Spring Plants & Soil | 93 | **K** | **T** | **T** | **C** | **T** | pipeline-by-type (Soil bottleneck); collection-event stat; QC stat |
| 13 | 2022 Fall CPER | 87 | **C** | **T** | **T** | **C** | **T** | **Position breakdown bar**; AM/PM split; completion stat; Position×AM/PM crosstab |
| 14 | 2024 Summer | 68 | **T** | **T** | **T** | **K** | **C** | headline-stat strip; publication chip |
| 15 | Two Towers | 68 | **C** | **T** | **K** | **C** | **T** | **height bar (Top/Mid/Bottom)**; diel split stat |
| 16 | Optimization Tests | 43 | **C** | **T** | **T** | **T** | **T** | **replicate-pipeline compare (A/B)**; extraction-yield stat |
| 17 | Spring SKC | 40 | **C** | **K** | **K** | **C** | **C** | big-number stat; completion callout; sibling-project link row |
| 18 | 2022 Fall CPER Control | 30 | **C** | **K** | **T** | **C** | **T** | **field-control identity callout**; stat strip |
| 19 | ARDEC Pilot Study | 26 | **K** | **K** | **C** | **T** | **T** | **pipeline-by-type**; collection-date stat; completion stat |
| 20 | 2022 Fall CPER Extra | 15 | **C** | **C** | **C** | **C** | **T** | completion stat-strip; AM/PM mini-bar |

**Column tallies (K / T / C):**

| Widget | Keep | Tailor | Cut | Read |
|---|--:|--:|--:|---|
| sample\_types doughnut | 5 | 4 | 11 | Dead on most; alive only on ≥3-substrate field studies |
| pipeline bar | 8 | 10 | 2 | Never useless, but **tailored more than kept** — shape varies (funnel / flat / empty) |
| temporal bar | 6 | 9 | 5 | Mid — strong with ≥3 months & real variation; trivial at ≤2 months |
| sampler chart | 3 | 5 | 12 | **Weakest widget** — cut on 12, keep only on the 3–4 eval campaigns |
| tags / badges | 1 | 11 | 8 | **Bimodal** — empty→cut on 8, but the richest project-specific signal when populated |

(Totals per column = 20. Banner = 20/20 keep-or-tailor, never cut. Aggregate across the 5
charted widgets: **23 keep / 39 tailor / 38 cut** — only ~23% of charted template instances
are an unmodified keep; counting the always-kept banner lifts the all-widgets keep rate to the
~31% cited in §1.)

---

## 3. Widget-by-widget verdict, with the predictive rule

For each current widget, the cross-project pattern and the *rule that predicts the verdict from
metadata alone* — i.e. the condition a declarative renderer would evaluate.

### sample-types doughnut — **cut 11 / tailor 4 / keep 5**
- **Rule:** `cut` when `sample_types_distinct == 1` (a single 100% slice — zero information).
  This fires on **11 of 20** projects, all single-substrate (almost always Air-only:
  IMPROVE Fungi, Flux, BACS, Two Towers, Spring SKC, the four CPER fall slices, Spring
  Chemistry, Optimization Tests).
- **`tailor`** when `distinct == 2` *and* the split is near-even or one class is tiny: a
  2-slice doughnut is low-density chartjunk → demote to a split-stat / thin stacked bar (Fall
  Plant Circle 50/50, Fall Plants & Soil 2:1, INP 98/2, 2024 Summer 85/15).
- **`keep`** only when `distinct >= 3` with real spread (Fragmented Landscape 50/31/19; Spring
  Plants & Soil 51/31/18; Spring Plant Circle 75/25 is a borderline keep). These are the
  cross-substrate paired field studies — the doughnut earns its place on exactly the projects
  whose science *is* the substrate mix.

### pipeline bar — **cut 2 / tailor 10 / keep 8** (never useless, almost always reshaped)
- **`keep` (funnel)** when the three stages differ with genuine attrition
  (`collected > dna_extracted` or `dna_extracted > sequenced`): IMPROVE Fungi 1056/862/862,
  BACS 274/220/220, INP 151/51/51, Spring SKC 40/40/38, ARDEC 26/19/18. This is the single
  highest-signal status chart on those pages.
- **`tailor` (flat → completion stat)** when all three stages are equal and complete
  (`collected == dna_extracted == sequenced`): a three-equal-bar chart shows nothing → collapse
  to one "Fully sequenced N/N (100%)" badge. Fires on Fragmented Landscape (623/623/623), 2022
  Fall CPER (87/87/87), Two Towers (68/68/68), 2022 Fall CPER Extra (15/15/15 → here it's a
  full `cut` to a stat).
- **`tailor` (empty-state)** when `sequenced == 0` (and often `dna_extracted == 0`): the chart
  must render an *explicit* "collected only — not yet processed" state, or two zero-height bars
  read as a bug. Fires on Flux (304/236/0), Spring Chemistry (120/0/0), 2024 Summer (68/0/0),
  Optimization Tests (43/34/0).
- **`tailor` (split-by-type)** is the high-value variant where a crosstab exists: the flat
  aggregate hides *which substrate is lagging.* Spring Plants & Soil (Soil 47→16 vs Air 17→16),
  Fall Plants & Soil (all 18 unextracted are Plant), Spring Plant Circle, ARDEC. Buildable from
  `type_pipeline_crossTab`, no results data.

### temporal bar — **cut 5 / tailor 9 / keep 6**
- **`keep`** when `temporal_months >= 3` *and* the per-month counts vary: Flux (7 mo, 6–70),
  Two Towers (4 mo, 8/23/23/14 + Aug gap), INP (5 mo across two seasons), Spring Chemistry (2
  mo but a clean 40→80 ramp — borderline keep), Spring SKC (2 mo 12/28).
- **`tailor` (gap-aware / season-grouped)** is the critical refinement when the months are
  **not contiguous** — a categorical evenly-spaced bar *lies* about cadence. IMPROVE Fungi (12
  contiguous 2021 months + a 17-month gap + 4 sparse 2023–24 points), Spring Sass/VIVAS (two
  spring campaigns a year apart), INP. These need a true date axis or explicit year/season
  grouping.
- **`cut`** when `temporal_months == 1` (a single bar — degenerate: ARDEC, 2022 Fall CPER
  Extra) or when ≥85% of samples fall in one month so the others are slivers (Spring Plants &
  Soil 88% in 2022-06; Fall Plants & Soil 82% in Oct) → replace with a date-range stat.
- **`tailor` (shrink)** when `months == 2` and even: a 2-bar chart doesn't merit full width →
  compact mini-bar or date-range caption (Fragmented Landscape, Fall Plant Circle, etc.).

### sampler chart — **cut 12 / tailor 5 / keep 3** (the widget to cut by default)
- **`cut` (degenerate)** when `samplers_distinct <= 1`: single 100% slice. IMPROVE Fungi (SASS
  only), Flux, Two Towers, Spring SKC, 2022 Fall CPER, 2022 Fall CPER Control/Extra, Spring
  Chemistry (`samplers_distinct == 0`, empty array — cannot even render).
- **`cut` (misleading-partial)** — a distinct *and dangerous* failure: ≥2 sampler values but
  the sampler is recorded for only a fraction of samples, so the chart implies a false
  project-wide proportion. Fragmented Landscape (UPAS = 194 of 623), Spring Plants & Soil (SASS
  = 13 of 93). **Rule:** if `sum(sampler_counts) < sample_count * threshold`, cut or force an
  explicit "unspecified" remainder; never let the chart imply a 100% partition.
- **`tailor` (honest-denominator)** when partial but worth showing: surface the unattributed
  count explicitly (INP — 86 of 151 have a sampler, 65 unspecified; ARDEC — 11 of 26;
  Optimization Tests — 16 of 43; BACS — 216 of 274).
- **`keep` (promote to lead)** only on true sampler-**evaluation** campaigns where comparing
  samplers *is* the science and the split is balanced: Spring SASS/Polycarbonate (157/145),
  Spring Sass/VIVAS (79/78), BACS (Impactor/SASS), 2024 Summer (8 substrate "samplers",
  well-spread). On these the verdict *inverts* — the sampler chart becomes priority 1, above
  sample-types.

### tags / replicate badges — **cut 8 / tailor 11 / keep 1** (bimodal: empty or star)
- **`cut`** when `has_tag_groups == false` OR every `replicate_tags` bucket is empty: nothing to
  render, and an empty badge row is pure noise. IMPROVE Fungi, Fragmented Landscape, Spring
  Chemistry, 2024 Summer, Spring SKC, Spring SASS/Polycarbonate (group *names* present but all
  value lists empty), INP (only `other:1`).
- **`tailor` (promote a dimension to its own chart)** is where the *highest-signal
  project-specific* widgets hide. The template's flat badge row buries: **vertical-height
  stratification** (Flux Position Top/Bottom 142/142; Two Towers Replicate Top/Mid/Bottom
  24/12/32; 2022 Fall CPER Position A/B/C 33/49/5), a **12-quadrant processing gradient** (Fall
  Plant Circle — see §5), **balanced AM/PM diel design**, and **field-control identity** (2022
  Fall CPER Control — Field Control = 28 of 30, the project's entire reason for existing).
  These must be promotable from "badge" to "small chart."
- **`tailor` (tier, don't flatten)** — even when several groups are populated they are unequal:
  promote the meaningful one, demote single-digit QC bookkeeping (Spring Plants & Soil, Spring
  Sass/VIVAS, Fall Plants & Soil). **Rule:** never render N tag groups as N equal badges; rank
  by cardinality × balance, promote the top, collapse the rest.

### banner — **keep/tailor 20 / cut 0** (always present; the enrichment is the hazard)
- **Always kept**, but **`tailor` dominates** because the slice record's enrichment fields are
  null on most projects. **Rule:** hydrate `lead` / `co_investigators` / `sites` /
  `publications` from the project registry + recon dossier, **suppress** (never blank-render)
  any chip whose source is null, and **never fabricate a publication** — many projects
  legitimately have none (IMPROVE Fungi, Flux, Fall/Spring Plant Circle, Spring Chemistry,
  Spring SKC, Optimization Tests, ARDEC). Where a real accession/DOI exists it is the highest-
  value element on the page and should be a prominent chip: Fragmented Landscape (NCBI
  PRJNA1263026), BACS (Ascher 2026 BAMS), INP (Mignani 2025 JGR), Two Towers (Cornell 2026
  mBio).

---

## 4. Widget-schema requirements (THE KEY OUTPUT)

This is the deliverable the rest of the document exists to support. The §2/§3 variety proves a
fixed 4-up grid cannot be right. A **declarative widget/layout descriptor** — one per project,
interpreted by the single `renderSlice(descriptor)` from FINDINGS §4 — is what lets per-project
layouts and a future *designer mode* work without forking code. Below are the concrete
capabilities the schema must express, each tied to the evidence that forces it.

### 4.1 The descriptor shape

A per-slice layout is an **ordered list of widget descriptors** plus slice-level binding:

```
LayoutDescriptor = {
  slice_kind: "project" | "location" | "lab_group" | "project_group",
  slice_key_field: string,        // e.g. "project_id" | "site_code" | "group_name"
  slice_label_field: string,      // e.g. "project_id" | "site_name" — see field 4.2(g)
  banner: BannerDescriptor,
  widgets: WidgetDescriptor[]      // ORDERED; not a fixed grid — FINDINGS §4 hazard 2
}
```

### 4.2 Required `WidgetDescriptor` fields

Every requirement below is forced by a specific behaviour seen across the 20 projects.

**(a) `type` — an extensible widget-type enum, NOT just the four template charts.**
The matrix uses these types today; the enum must be open for designer mode:
`doughnut`, `pipeline_bar`, `temporal_bar`, `bar` (generic categorical, e.g. sampler / position
/ height / quadrant), `grouped_bar` (pipeline-by-type, sampler×pipeline, A/B replicate
compare), `heat_strip` / `small_multiples` (quadrant matrix), `badge_row`, `stat` /
`stat_strip` (big-number tiles — the single most-requested NEW type), `completion_badge`,
`link_chip` (publication / data accession / sibling-project), `caption`.
*Forced by:* every "fold into a stat" verdict (≈30 instances) needs a non-chart `stat` type;
quadrant/height/crosstab needs `grouped_bar`/`heat_strip`; publications need `link_chip`.

**(b) `show_if` — a declarative render-condition evaluated against the slice's metadata.**
The system's most repeated rule. Concretely it must support predicates over the metadata fields
already in each `slice_views.project` entry:

| Predicate | Drives | Example |
|---|---|---|
| `distinct(field) >= N` | render doughnut only with ≥2 (ideally ≥3) categories | doughnut cut on 11 single-value projects |
| `field == 0` / `> 0` | pipeline empty-state vs funnel | Flux/Chemistry sequenced==0 |
| `all_equal(stages)` | flat pipeline → completion badge | Two Towers 68/68/68 |
| `tag_group_nonempty(name)` | render a tag-derived chart only if populated | tags cut on 8 empty projects |
| `coverage(field) >= ratio` | suppress/annotate partial-coverage sampler | Fragmented Landscape UPAS 194/623 |
| `months >= N` / `contiguous(months)` | temporal keep vs gap-aware vs cut | IMPROVE Fungi gap; ARDEC 1 month |

`show_if` is the field that turns "20 hand-tuned layouts" into "one default layout +
metadata-driven suppression," and it is what makes the *default* descriptor safe to apply to a
new project the data owner adds later.

**(c) `size` — per-widget size hint** (`sm` / `md` / `lg`). The recommendations assign size on
nearly every widget: `lg` for the promoted lead (sampler on eval campaigns, quadrant matrix,
height bar), `sm` for demoted-to-stat and 2-bar charts, `md` default. A fixed grid can't do
this; the renderer must read a size and lay out a flow/grid accordingly.

**(d) `order` / position — explicit ordering, because the lead widget differs per project.**
On most projects pipeline or a tag-derived chart is the hero; on eval campaigns the sampler
chart is promoted to priority 1 *above* sample-types — a full inversion of the template order.
The `recommended_layout` array in every recommendation is literally an ordered list; the schema
must honor it. (Represented by array order in `widgets[]`, optionally an explicit `priority`.)

**(e) `data_binding` — bind a widget to a named metadata field / derived expression, not a
hard-coded chart.** This is what lets one `bar` type serve sampler, position, height, AM/PM, and
quadrant by changing only the bound field. Minimum expressiveness:
- a source field path (`sampler_type_dist`, `tag_groups['Position']`, `tag_charts.Quadrant.*`);
- a derived/crosstab binding (`type_pipeline_crossTab` for pipeline-by-type;
  `sampler × pipeline` for the eval crosstab; per-`tag_group` pipeline for A/B compare);
- aggregation/transform hints (sort-desc, group-by-year, "out of N with explicit denominator").

**(f) `annotations` / `empty_state` — a widget must carry display-time annotations and an
explicit empty rendering.** Pipeline needs delta/percent callouts ("194 collected not yet
extracted"; "fully sequenced 100%") and a literal empty-state string ("sequencing not yet
begun") so a zero stage reads as *status, not a bug.* Temporal needs phase/season captions and
honest gap rendering. Sampler needs an "unspecified (N)" remainder.

**(g) `slice_label_field` vs `slice_key_field` — separate the lookup key from the display
label.** FINDINGS §4 hazard 1 is exactly this: Location looks up by `site_code` but labels the
sampler tooltip with `site_name`; a single-field collapse regresses the tooltip. The schema
must carry both fields independently so the parameterized renderer is correct for Location.

**(h) `binds_entry: true` — chart specs receive the live slice `entry`, not pre-baked data.**
FINDINGS §4 hazard 3: the cross-tab tooltip callbacks read `entry.type_pipeline_crossTab` at
render time. The descriptor/spec must hand the renderer the entry (or a late-bound accessor) so
tooltips don't go stale. This is a renderer-contract requirement the schema must not violate.

**(i) Optional / conditional unique widgets (sub-sites, time-of-day).** Location already has two
widgets no other slice has (`sliceLocationSubsitesChart`, `sliceLocationTimeDistChart`, the
latter shown only when data is present). The `widgets[]` list being ordered + optional + gated
by `show_if` is precisely what lets Location add these without a bespoke renderer — generalizing
FINDINGS §4 hazard 2.

### 4.3 `BannerDescriptor` requirements

The banner needs its own sub-schema because its failure mode is null-enrichment, not chart
degeneracy:
- **chip list with per-chip `source` and `suppress_if_null: true`** — never render an empty
  chip; `lead`/`co_is`/`sites`/`publications` hydrate from the registry, and a null source
  drops the chip entirely.
- **`no_fabricate` on publication/data chips** — a chip renders only from a real accession/DOI;
  absence renders nothing (or an explicit "related:" soft chip), never a placeholder.
- **`absorbed_stats[]`** — a stat row that carries the facts cut from degenerate charts (e.g.
  "100% Air · SASS · N sequenced"), so cutting a chart loses no information.

### 4.4 What this buys designer mode

With (a)–(i) in place, "designer mode" is just **editing a `LayoutDescriptor` JSON** — reorder
`widgets[]`, change a `size`, flip a `show_if`, re-bind a `bar` to a different field, add a
`link_chip` — with the same `renderSlice()` interpreting it. No descriptor edit touches
`index.html`. The 20 layouts in this matrix become 20 seed descriptors plus one safe default;
new projects inherit the default and self-suppress via `show_if`.

---

## 5. New widget ideas worth building (consolidated, metadata-only, deduped)

Every idea below is buildable **today from sample metadata already in `data.json`** (no results
data). Counts are how many of the 20 projects each would materially help.

| New widget | What it is | Helps (n projects) | Metadata basis |
|---|---|--:|---|
| **`stat` / big-stat strip** | Row of big-number tiles replacing degenerate doughnuts/100% bars (total · single-substrate label · sampler · % sequenced · month span) | **~16** (every single-value-heavy project) | `sample_count`, single-value `sample_types`/`sampler`, `pipeline` |
| **`completion_badge`** | One "Fully sequenced N/N (100%)" or "X% sequenced" stat replacing a flat/near-flat pipeline bar | **~9** | `pipeline` all-equal or near-equal |
| **pipeline-by-type `grouped_bar`** | Funnel split by substrate, exposing which type is lagging | **~5** (Spring/Fall Plants & Soil, Spring Plant Circle, ARDEC, Fall Plant Circle) | `type_pipeline_crossTab` |
| **`link_chip` (publication / data accession)** | Prominent chip to the gated science — the only legitimate path to results | **~5** (Fragmented Landscape, BACS, INP, Two Towers, 2024 Summer) | recon DOIs / NCBI PRJNA1263026 |
| **height / position `bar`** | Promote vertical-stratification tag group to its own small bar — the defining design of these projects | **~3** (Flux Top/Bottom, Two Towers Top/Mid/Bottom, 2022 Fall CPER A/B/C) | `tag_groups['Position'\|'Replicate']` |
| **gap-aware / season-grouped temporal** | True date axis (or year/season grouping) so non-contiguous campaigns don't misrepresent cadence | **~3** (IMPROVE Fungi, Spring Sass/VIVAS, INP) | `temporal[*].month` non-contiguous |
| **sampler×pipeline `grouped_bar` (crosstab)** | The literal scientific question on sampler-eval campaigns: do the samplers advance through the funnel equally? | **~3** (Spring SASS/Polycarbonate, Spring Sass/VIVAS; BACS-adjacent) | `sampler_type_dist` × `pipeline`/`tag_charts` |
| **quadrant pipeline matrix / sampling-circle grid** | Per-quadrant processing heat-strip / small-multiples — exposes a stark processing gradient (Q3/Q5/Q7 = 100% vs Q2/Q11/Q12 = 0%) | **2** (Fall Plant Circle, Spring Plant Circle) | `tag_charts.Quadrant.{Q*}.pipeline` |
| **A/B replicate-pipeline compare** | Paired small bars: did the two replicate arms track each other? (reproducibility — the point of a methods campaign) | **2** (Optimization Tests, generalizes to any balanced replicate set) | per-`tag_group` pipeline (A/B) |
| **AM/PM diel split stat / mini-bar** | Surface the deliberate diurnal design as a compact paired stat | **~6** (Two Towers, 2022 Fall CPER, Spring/Fall Plant Circle, Fall Plants & Soil, 2022 Fall CPER Extra) | `tag_groups['AM/PM']` |
| **field-control identity callout** | Names what a control slice *is* (e.g. Field Control = 28/30) — distinguishes it from sibling campaigns | **~2** (2022 Fall CPER Control; QA strips on Spring Sass/VIVAS, Spring Plants & Soil) | `tag_groups['Field Control']` |
| **QA / control-provenance strip** | Blank/precision-test/field-control counts — a data-quality signal | **~3** (Flux, Spring Sass/VIVAS, Spring Plants & Soil) | `tag_groups['Field Control']` |
| **sibling-project link row** | Navigational cross-link to the rest of a campaign family (e.g. the Goal-1 sampler-eval siblings) | **~4** (the sampler-eval / CPER family slices) | recon family grouping |

**Top three by reach** — and the ones to build first because they retire the most dead charts:
the **`stat`/big-stat strip** (replaces degenerate doughnuts on ~16 projects), the
**`completion_badge`** (~9), and **pipeline-by-type** (~5). The first two are pure
template-degeneracy cures; the third turns the single most-kept chart (pipeline) into a
genuinely diagnostic one. Note these map cleanly onto schema types in §4.2(a) — building the
schema *is* building these widgets.

**Consistency with FINDINGS:** this list is the §9 "reinvestment, not addition" directive made
concrete — freed surface area goes to richer, project-specific, metadata-only widgets, not new
generic charts, and **nothing here renders results data** (constraint honored; results stay
reference-only via `link_chip`).

---

## 6. Sequencing note

This refines FINDINGS §8's plan and confirms the ordering for the chart-relevance track.

1. **Extract inline JS/CSS first** (FINDINGS §8 step 1 / §5). 79% of `index.html` is one inline
   script. Pull it to `assets/app.js` + `assets/styles.css` — pure mechanical, very-low-risk,
   precedent exists (`assets/feedback-*.js`). **Do this before anything schema-related**: it
   makes every subsequent change diff-reviewable.

2. **Build the widget + layout descriptor schema from THIS matrix.** §4 is the spec. The schema
   must express, at minimum: open `type` enum incl. `stat`/`grouped_bar`/`heat_strip`/
   `link_chip`/`completion_badge`; declarative `show_if`; per-widget `size`; explicit `order`;
   `data_binding` to a metadata field / crosstab; `annotations` + `empty_state`; separate
   `slice_label_field` vs `slice_key_field`; `binds_entry`; optional/conditional widgets; and a
   `BannerDescriptor` with `suppress_if_null` chips, `no_fabricate` on publications, and
   `absorbed_stats`. Validate the schema against all 20 §2 rows — each must be expressible.

3. **Refactor the renderers to be declarative + seed per-project layouts.** Collapse the three
   near-duplicate slice renderers into one `renderSlice(descriptor)` (FINDINGS §4 — respect its
   three hazards, all now first-class schema fields: label≠key → 4.2(g); ordered+optional charts
   → 4.2(i); tooltips close over `entry` → 4.2(h)). Cut the three per-slice sampler charts here
   (FINDINGS §8 step 3) — this matrix's sampler tally (cut/tailor on 17/20) is the cross-project
   justification. Seed the 20 layouts from §2 plus **one safe default descriptor** that
   self-suppresses via `show_if`, so the slice for any *new* project the data owner adds renders
   sensibly with no code change.

4. **Designer mode last.** Once renderer + schema + seed layouts exist, designer mode is editing
   `LayoutDescriptor` JSON (reorder/resize/re-bind/flip `show_if`) — no `index.html` edits. Per
   FINDINGS §9 and the no-build/no-framework constitution, keep it data-driven; do not add a
   bundler.

**Results/publications stay reference-only throughout.** Every recommendation is
sample-metadata-only; scientific results are surfaced *only* as `link_chip` to the real
publication/accession, never charted. This is a hard constraint, not a phase.

### Data-layer readiness for the future Data Explorer "sample checkout" track — flagged

The checkout track needs two things in the data layer. I checked `data/data.json` directly:

- **Stable sample IDs — PRESENT and adequate.** `all_samples` holds **4569 records**, each with
  a unique non-null `id` (`BAD0001A`, `BAD0002A`, …): **4569 / 4569 present, 4569 distinct.**
  These are stable, human-readable, and suitable as checkout keys today. No work needed.
- **Per-sample status / pipeline-stage field — MISSING.** This is the gap. Per-sample records
  carry only `id`, `date`, `site`, `type`, `category`, `project`, `project_group`, `lab_group`,
  and the tag fields (`am_pm`, `replicate`, `quadrant`, `position`, `field_control`). There is
  **no per-sample status, availability, or pipeline-stage field**: `category` is constant
  (`"Field Sample"` on all 4569 rows), and the collected/dna_extracted/sequenced pipeline exists
  **only as aggregates** (top-level `pipeline` and `slice_views[*].pipeline` /
  `type_pipeline_crossTab`) — you cannot tell from a sample's record whether *that* sample was
  sequenced, nor whether it is available/reserved/checked-out.

  **Flag for the data owner:** a "sample checkout" Data Explorer is **blocked on a data-model
  addition**, not a build task — `preprocess_data.py` (or the upstream source) must emit a
  per-sample status/availability field (e.g. `pipeline_stage` ∈ collected|extracted|sequenced,
  plus a `checkout_status` ∈ available|reserved|unavailable). The stable `id` is the join key
  that makes this cheap to add. Until that field exists, checkout can only operate at the
  aggregate level the current data supports. (Parallels the FINDINGS recon note that several of
  Claire's proposed plots are blocked on *data entry*, not build work.)

---

## Appendix — provenance

- **Companion / mechanical case:** [`docs/COMPLEXITY-REVIEW-FINDINGS.md`](./COMPLEXITY-REVIEW-FINDINGS.md)
- **Agenda:** `docs/COMPLEXITY-REVIEW.md`
- **Per-project recommendations synthesized here:** 20 JSON recs, one per `slice_views.project`
  entry, each grounded in `data/data.json`.
- **Recon dossier (people / publications / campaign families for banners + link chips):**
  `.claude/tasks/outputs/recon-broadn-web-RA-20260622.md`
- **Slice-duplication evidence (renderer hazards → schema fields 4.2 g/h/i):**
  `.claude/tasks/outputs/complexity-slice-critic-CR-20260623.md`
- **Data-layer claims in §6 verified firsthand against** `data/data.json` (`all_samples`:
  4569 records, 4569 unique ids, no per-sample status field; `pipeline` aggregate-only).
