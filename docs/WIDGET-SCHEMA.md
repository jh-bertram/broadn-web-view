---
type: project-doc
---

# BROADN Slice Widget / Layout Schema (Phase 1)

**Written:** 2026-06-23 · **Branch:** main · **Status:** design artifact — no `index.html`/`app.js` changes.
**Formalizes:** [`COMPLEXITY-PER-PROJECT-MATRIX.md`](./COMPLEXITY-PER-PROJECT-MATRIX.md) §4 (the schema requirements) into concrete, validated data.

This is the keystone the rest of the complexity-review depends on. It defines the **declarative
widget/layout descriptor** that a single `renderSlice(descriptor)` (Phase 2) will interpret, so
per-project tailoring and a future *designer mode* work without forking renderer code.

## Artifacts

| File | Role |
|---|---|
| `data/layout-schema.json` | Machine contract (JSON Schema Draft 2020-12). The source of truth for validity. |
| `scripts/build_layouts.py` | Generator. Reads `data/data.json`, applies the matrix §3 rules + curated overrides, validates against the schema, cross-checks vs matrix §2, writes the layouts. Parallels `preprocess_data.py`. |
| `data/project-layouts.json` | Output: 20 per-project seed `LayoutDescriptor`s + 1 safe `default`. Runtime input for Phase 2. |
| `docs/WIDGET-SCHEMA.md` | This file — the human-readable contract + rationale. |

Regenerate any time the data changes: `python3 scripts/build_layouts.py`.

## The model

A `LayoutDescriptor` is an **ordered list of `WidgetDescriptor`s** plus a `BannerDescriptor` and
slice-binding fields. Order encodes priority (top = hero). The renderer walks `widgets[]`, and for
each evaluates `show_if` against the slice's metadata — if false, the widget is skipped. This is the
core mechanism: **one widget list + metadata-driven suppression** rather than 20 hand-built grids.

```
LayoutDescriptor {
  slice_kind:        "project" | "location" | "lab_group" | "project_group"
  slice_key_field:   string   // lookup key  (e.g. "site_code")    — matrix §4.2g hazard 1
  slice_label_field: string   // display label (e.g. "site_name")  — kept separate from key
  banner:            BannerDescriptor
  widgets:           WidgetDescriptor[]   // ORDERED, not a fixed grid (hazard 2)
}
```

### Widget types (open enum — matrix §4.2a)
`doughnut`, `pipeline_bar`, `temporal_bar`, `bar` (generic categorical: sampler/position/height/quadrant),
`grouped_bar` (pipeline-by-type, sampler×pipeline, A/B compare), `heat_strip` (quadrant matrix),
`badge_row`, `stat` / `stat_strip` (big-number tiles), `completion_badge`, `link_chip`
(publication/data accession — reference-only), `caption`.

### `show_if` predicate vocabulary (matrix §4.2b)
A predicate over the slice's metadata, composable with `all` / `any` / `not`:

| Predicate | Fields | Fires the rule |
|---|---|---|
| `always` | — | unconditional |
| `distinct_gte` | `field` (`sample_types`\|`sampler`), `value` | doughnut needs ≥3 substrates; sampler needs ≥2 |
| `all_equal` | — (pipeline stages) | flat pipeline → completion badge |
| `field_eq` / `field_gt` | `field`, `value` | pipeline empty-state (`sequenced == 0`) |
| `coverage_gte` | `field`, `value` | suppress misleading partial-coverage sampler |
| `tag_group_nonempty` | `name` | render a tag-derived chart only if populated |
| `months_gte` | `value` | temporal needs ≥2 months |
| `top_share_lt` | `value` | suppress single-month-dominated temporal |
| `contiguous_months` | — | gap-aware temporal selection |

The evaluator in `build_layouts.py` (`eval_show_if`) is the **reference implementation** of this
contract — Phase 2's runtime evaluator in `app.js` must match it exactly.

### Other `WidgetDescriptor` fields
- `size`: `sm` / `md` / `lg` (matrix §4.2c) — `lg` for the promoted hero, `sm` for demoted stats.
- `data_binding`: `{ source, transform, denominator }` — binds one `bar` type to sampler/position/
  height/quadrant by field path (matrix §4.2e). `denominator` drives honest partial-coverage rendering.
- `annotations`: `{ empty_state, caption, callouts, unspecified_remainder }` — explicit empty states
  so a zero stage reads as *status, not a bug* (matrix §4.2f).
- `binds_entry` (default true): the spec receives the live slice `entry`, so cross-tab tooltips don't
  go stale (matrix §4.2h, hazard 3).

### `BannerDescriptor` — structure only; prose stays in `PROJECT_CONTENT`
`{ enabled, content_source: "PROJECT_CONTENT", suppress_if_null: true, no_fabricate: true, absorbed_stats[] }`.
Layouts describe *which* banner elements appear and how they behave; the actual lead/co-I/publication
content stays in the existing `PROJECT_CONTENT` store (no duplication, no fabrication). `suppress_if_null`
drops any chip whose source is null; `no_fabricate` means a publication chip renders only from a real
accession/DOI. `absorbed_stats` carries facts cut from degenerate charts so nothing is lost.

## The default descriptor + the override layer

- **`default`** is the safe, purely rule-driven layout: the seven baseline widgets, each gated by its
  `show_if`. Applied to *any* project (including new ones the data owner adds later), it self-suppresses
  to exactly the charts that carry information. This is the answer to "what happens to a project nobody
  hand-tuned" — it just works.
- **Per-project seeds** start from the baseline and layer **curated overrides** (`OVERRIDES` /
  `EVAL_CAMPAIGNS` / `PUBLICATION_PROJECTS` in the generator) for the project-specific *hero* widgets
  that pure metadata can't derive: eval-campaign sampler promotion, quadrant heat-strips, height/position
  bars, pipeline-by-type, sampler×pipeline crosstabs, control-identity callouts, publication chips.
  This cleanly separates **mechanical degeneracy** (handled by `show_if`) from **editorial judgment**
  (handled by curation) — and the curation is exactly what designer mode will let you edit by hand.

## Validation & matrix cross-check

`build_layouts.py` enforces two gates on every run:
1. **Schema validation** — all 21 layouts validate against `data/layout-schema.json`. (Currently: PASS.)
2. **Matrix cross-check** — the rule-derived show/hide grid is compared against the matrix §2
   hand-verdicts. **Currently 83/100 cells agree.** The 17 divergences are expected and fall into two
   honest buckets, both worth keeping visible:
   - **Reshape-routing (not real disagreement):** the matrix marks a degenerate chart `T`/`C` meaning
     "reshape to a stat," and the engine routes it to a *different* widget (`stat_strip` /
     `completion_badge`) — same intent, but the binary present/absent check on the original widget id
     can't see it. (e.g. Fragmented Landscape & 2022 Fall CPER Extra pipeline; the `sample_types == 2`
     "tailor-to-stat" projects.)
   - **Threshold calls (real, deliberate):** the **honest-denominator sampler** cases (Fall Plant Circle,
     INP, Optimization Tests, ARDEC) — the matrix wanted the sampler shown *with an explicit unspecified
     remainder*; the conservative default *hides* it below 0.95 coverage. These are the one place the
     default is intentionally stricter than the human call; if we want them shown, add a per-project
     override with `unspecified_remainder: true` (the schema already supports it).

This is a feature, not a gap: the cross-check makes every place the declarative rule departs from human
judgment explicit and reviewable, instead of silently baking one or the other in.

## What Phase 2 consumes

`renderSlice(descriptor)` loads `data/project-layouts.json`, looks up the slice's descriptor (falling
back to `default`), and for each widget: evaluates `show_if` (matching `eval_show_if`), and if true,
renders `type` bound to `data_binding.source` at `size`, honoring `annotations`/`binds_entry`. The three
FINDINGS §4 renderer hazards are now first-class schema fields (label≠key → `slice_label_field`;
ordered+optional → `widgets[]`; tooltips-close-over-entry → `binds_entry`). Designer mode (Phase 3) then
edits `LayoutDescriptor` JSON and re-exports — no `index.html` edits, no build step.

## Phase 3 — designer mode + the override layer

`index.html?design` activates an in-page, button-driven widget editor (reorder / resize / hide / add)
over the currently-open slice (project, location, or lab_group). It is gated by an **exact** `?design`
token (`URLSearchParams.has('design')`) — a normal visitor (no param) gets a byte-identical published
page with no toolbar, no listeners, and no localStorage writes.

**Override layer (`data/layout-overrides.json`).** Hand edits are NOT written back into the generated
`project-layouts.json` (the generator would clobber them). Instead they live in a separate
`data/layout-overrides.json` that is merged — **whole-descriptor per `(kind, key)`** — on top of the
generated layouts by BOTH:
- the runtime resolver `getLayoutFor` (an override wins entirely over the generated descriptor), and
- `scripts/build_layouts.py` (`load_overrides()` validates + merges before the hazard guard + schema
  validation, so an override is held to the same checks; overridden keys are excluded from the parity
  grid since they are unconditional).

Keys: `project` → `project_id`, `lab_group` → `group_name`, `location` → `site_code` (location entries
have no `project_id`). Validated by `data/layout-overrides-schema.json` (wrapper) which `$ref`s the
canonical `LayoutDescriptor` — no descriptor-schema duplication.

**`show_if` freeze rule.** In the editor you see every generated widget for the slice, each still
governed by its real data rule — widgets the data currently hides appear dimmed with a "hidden for this
slice's data" badge so nothing is invisible while you arrange. On **Save as final**, the visible set is
frozen on a clone: kept widgets become `show_if: always`, hidden widgets are dropped. So a saved
(overridden) slice never self-suppresses — what you arranged is exactly what publishes. The working copy
keeps the original conditional `show_if`, so **Revert** restores the true generated layout.

**Publish path.** "Save as final" downloads `layout-overrides.json`; drop it into `data/` and commit —
that alone publishes for all visitors (the runtime merges it at load). **Do NOT re-run the generator for
routine layout edits** (regen is for data changes; it is idempotent w.r.t. a committed overrides file but
balloons `project-layouts.json` into PR noise). Edits autosave to a per-slice localStorage draft while
you work.
