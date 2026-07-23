# Phase 2 renderSlice — Authoritative Implementation Plan (SYNTH)

**Task:** complexity-review Phase 2 — collapse the three near-duplicate slice renderers into one descriptor-driven `renderSlice(descriptor, entry)` that reads `data/project-layouts.json`, applies a runtime `show_if` evaluator that is a 1:1 port of `eval_show_if`, and renders widgets by type — without regressing the live page.

**Synthesized from:** Plan 1 (minimal-safe-diff), Plan 2 (schema-fidelity engine), Plan 3 (regression-avoidance), and the adversarial critique.

**Disposition:** Adopt the critique's HYBRID — **Plan 2's scope cut line** executed with **Plan 3's engineering discipline**. Plan 1 is rejected on a verified-false premise (see §1). Plan 3's scope is rejected (builds its riskiest charts where its own A/B net cannot reach).

All ground-truth claims below were re-verified against `assets/app.js`, `data/project-layouts.json`, `data/layout-schema.json`, `scripts/build_layouts.py`, and `data/data.json` (not taken on the plans' word).

---

## 0. Verified ground truth (the facts the scope decision rests on)

| Fact | Status | Source |
|---|---|---|
| `default` layout widget order = `[overview_stats(stat_strip), sample_types(doughnut), pipeline(pipeline_bar), pipeline_complete(completion_badge), temporal(temporal_bar), sampler(bar), tags(badge_row)]` | **CONFIRMED** | `project-layouts.json` L15–171 |
| `stat_strip` + `completion_badge` apply to **all 20 projects** (in `default`, inherited by every per-project layout via `baseline_widgets()`) | **CONFIRMED** | `build_layouts.py` L97–139, every project block in `project-layouts.json` |
| The current renderer (`renderProjectView`) builds NEITHER `stat_strip` NOR `completion_badge` | **CONFIRMED** | `app.js` L2478–2596 (only doughnut, pipeline_bar, temporal_bar, sampler bar, tag badges) |
| 4 projects are `all_equal` (completion_badge path, pipeline_bar suppressed): **Fragmented Landscape, 2022 Fall CPER, Two Towers, 2022 Fall CPER Extra** | **CONFIRMED** | computed over `data.json` |
| Only 3 projects pass the default sampler rule (≥2 samplers AND ≥0.95 coverage): **Spring SASS/Polycarbonate, Spring Sass/VIVAS, 2024 Summer** | **CONFIRMED** | computed over `data.json` |
| All 20 temporal arrays are already sorted → the unsorted-sort parity bug is **masked but latent** | **CONFIRMED** | computed over `data.json` |
| No tag_group value is a non-dict or empty-but-truthy → Python `if v` vs JS `Object.keys(v).length` is **masked but latent** | **CONFIRMED** | computed over `data.json` |
| 20/20 projects have `type_pipeline_crossTab`; 15/20 have `tag_charts` (5 lack it — heat_strip/grouped_bar must empty-guard) | **CONFIRMED** | computed over `data.json` |
| `slice_views.location` entries have **no `pipeline` key** and key (`site_code`) ≠ label (`site_name`) | **CONFIRMED** | `app.js` L2612/L2769; `build_layouts.py` only emits `project` layouts |
| No `location` or `lab_group` seed layouts exist in `project-layouts.json` (only `project` entries + a `project`-kind `default`) | **CONFIRMED** | `project-layouts.json` `projects` keys are all project_ids |
| Project grid has 5 static cards with stable wrapper ids `chart-card-slice-project-{types,pipeline,temporal,replicates,sampler}`; temporal card carries `lg:col-span-2` | **CONFIRMED** | `index.html` L382–418 |
| `renderTagGroups` already uses `Object.keys(v).length > 0` truthiness internally | **CONFIRMED** | `app.js` L1642 |

---

## 1. Final scope decision (definitive)

### LAND NOW (Phase 2)

`renderSlice(descriptor, entry, gridEl)` for **`slice_kind === "project"` only**, behind a `USE_RENDER_SLICE` feature flag, with renderers for exactly the widget types the **`default`** layout emits — because the default applies to all 20 projects:

1. **`stat_strip`** (overview_stats) — NET-NEW HTML/number tile. **Load-bearing for parity.**
2. **`doughnut`** (sample_types) — verbatim port of current chart.
3. **`pipeline_bar`** (pipeline) — verbatim port.
4. **`completion_badge`** (pipeline_complete) — NET-NEW HTML tile. **Load-bearing for parity.**
5. **`temporal_bar`** (temporal) — verbatim port.
6. **`bar`** (sampler) — reuse `renderSamplerTypeChart` + re-applied label closure.
7. **`badge_row`** (tags) — reuse `renderTagGroups`.

Plus the runtime `evalShowIf` + `computeFactsRuntime` (1:1 ports), `getLayoutFor`, the OPTIONAL layouts fetch, and a parity-oracle harness (dev-only, behind `?verifyLayouts`).

### DEFER to Phase 2b (registered as silent no-op stubs now)

- **`grouped_bar`** (pipeline_by_type from `type_pipeline_crossTab`; sampler_pipeline from `sampler_type_dist`) — net-new Chart.js, appears only in 6 overrides.
- **`heat_strip`** (quadrant_matrix from `tag_charts.Quadrant`) — net-new, appears in 2 overrides; 5 projects lack `tag_charts` entirely.
- **`link_chip`** (publications) — net-new; overlaps PROJECT_CONTENT banner pubs, needs a de-dup decision.
- **`stat`** (control_identity, 2022 Fall CPER Control only) — net-new single tile.
- **`bar`-as-tagbar** (height_bar / position_bar bound to `tag_groups.<dim>`) — distinct from the sampler bar (linear, not log; different source). The `bar` *type* IS implemented for the sampler binding; the tagbar *binding* (source `tag_groups.X`) is deferred and falls to the no-op fallback.
- **Location and LabGroup migration** — kept on legacy renderers (see §6).

### Rationale for the cut line

**Why Plan 1 is rejected (verified-false premise + concrete regression).** Plan 1's core claim — "the default and every per-project layout share the same 5 baseline widgets the current renderer draws" — is **false**: the default has 7 widgets, two of which (`stat_strip`, `completion_badge`) the current renderer does not draw and which Plan 1 explicitly defers. The consequence is a **live-page regression**: for the 4 verified all_equal projects (Fragmented Landscape, 2022 Fall CPER, Two Towers, 2022 Fall CPER Extra), `pipeline` is suppressed (`not all_equal` = false) and Plan 1 no-ops `pipeline_complete` → those projects show a **blank gap** where the pipeline card is today. Plan 1 drew the cut line through the two load-bearing tiles. That is the inverse of safe.

**Why these two tiles must land now.** `stat_strip` + `completion_badge` are pure HTML/number tiles — zero Chart.js risk — and they are emitted by the `always` and `all_equal` branches of every layout. They are the parity floor: without them the descriptor-driven view silently drops the headline tile and blanks fully-processed projects. They cost little and are the entire reason Plan 2's cut line is correct.

**Why Plan 3's scope is rejected (its own safety net can't reach it).** Plan 3 builds `grouped_bar`, `heat_strip`, `link_chip`, `stat`, and tagbar NOW — the highest-effort, highest-regression Chart.js surface, and the one its signature control (flag-off vs flag-on byte comparison) **cannot verify**, because those widgets do not exist flag-off. Building the riskiest surface with the weakest verification contradicts Plan 3's own "regression-avoidance above all" thesis. Defer them; A/B-verify only what has a legacy baseline.

**Net effect on the live page in Phase 2 (intended, not regressions):**
- Every project gains an "At a glance" `stat_strip` tile (new, but additive and informational).
- The 4 all_equal projects show a `completion_badge` instead of a flat 3-equal-bar pipeline (replacement, never blank).
- Doughnut suppressed when `<3` sample types; temporal suppressed when single-month or top-share ≥ 0.85; sampler suppressed unless ≥2 samplers AND ≥95% coverage (so 17/20 projects lose the always-on sampler card — **intended suppression, see §5 and Risk 6**); tags suppressed when no tag group populated.
- Override-only hero charts (grouped_bar/heat_strip/link_chip/stat/tagbar) remain ABSENT — they are not on today's page either, so no regression; they are pure 2b enhancement.

---

## 2. Ordered, concrete edit map for `app.js` (function-by-function)

All edits are confined to `assets/app.js` plus one optional, reversible `index.html` change. The legacy `renderProjectView` body stays intact as the flag-off path and the 2b parity reference.

### Edit A — module-scope state (near L82–83)
Add adjacent to `let appData = null; let chartInstances = {};`:
```js
let projectLayouts = null;          // parsed data/project-layouts.json (default + projects); null => legacy fallback
let dynamicSliceChartIds = [];      // chart ids renderSlice created this pass (torn down on the next renderView)
const USE_RENDER_SLICE = true;      // Phase 2 feature flag — flip to false for instant rollback to legacy renderProjectView
```
`USE_RENDER_SLICE` is a `const` so it ships ON, but a one-character edit (`true`→`false`) reverts the entire migration. Keep it a named symbol (not inlined) so reviewers can A/B.

### Edit B — DOMContentLoaded fetch (L3565–3587): make layouts an OPTIONAL parallel fetch
Replace the single `fetch('data/data.json')` chain with `Promise.all` where **`data.json` stays the only hard dependency** and `project-layouts.json` is best-effort:
```js
document.addEventListener('DOMContentLoaded', function() {
  var dataP = fetch('data/data.json').then(function(resp) {
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    return resp.text();
  });
  var layoutsP = fetch('data/project-layouts.json')
    .then(function(resp) { return resp.ok ? resp.json() : null; })
    .catch(function() { return null; });          // layouts NEVER block the dashboard
  Promise.all([dataP, layoutsP]).then(function(results) {
    var parsed;
    try { parsed = JSON.parse(results[0]); }
    catch (e) { showError(); return; }
    projectLayouts = results[1] || null;           // null => getLayoutFor returns null => legacy path
    initDashboard(parsed);
  }).catch(function() { showError(); });
});
```
Note: `data.json` parse/HTTP failure still calls `showError()` exactly as today. A layouts failure leaves `projectLayouts = null`; the page renders via the legacy renderer with no error. `initDashboard` is **not** changed to validate layouts.

### Edit C — engine helpers, inserted as a new block after `buildTemporalChartOptions` (after L1869), before `showSliceNoData`
Three pure, DOM-free functions + two small DOM factories:

- **`computeFactsRuntime(entry)`** — 1:1 mirror of `compute_facts` (see §3 for the exact transcription).
- **`evalShowIf(cond, facts)`** — 1:1 mirror of `eval_show_if` (see §3).
- **`getLayoutFor(sliceKind, entry)`**:
  ```js
  function getLayoutFor(sliceKind, entry) {
    if (!projectLayouts || sliceKind !== 'project' || !entry) return null;   // null for non-project (Risk: Plan 2 footgun)
    return projectLayouts.projects[entry.project_id] || projectLayouts.default || null;
  }
  ```
  Returning `null` for non-project kinds (NOT `projectLayouts.default`, which is `slice_kind: "project"` and references `pipeline` that location entries lack) is deliberate — it is what keeps a future 2b branch-flip from computing pipeline facts on `{}`. This is Plan 3's correction of Plan 2's Bug 2.
- **`makeSliceCard(widget)`** — builds a `bg-white p-6` card `<div>`, optional `lg:col-span-2` when `widget.size === 'lg'`, an `<h3>` from `widget.title`, and returns `{ card, body }`. (Mirrors the static card markup at `index.html` L385–417 so the rebuilt cards match the existing visual.)
- **`makeCanvas(id)`** — wraps a `<canvas id>` in a `div.chart-wrap` and returns the canvas element.

### Edit D — `WIDGET_RENDERERS` dispatch table, immediately after the engine helpers
An object keyed by schema widget type → `function(ctx)` where `ctx = { descriptor, entry, facts, widget, mount, keyField, labelField }`. Each renderer that mounts a chart uses a **deterministic chart id** `'slice_' + descriptor.slice_kind + '_' + widget.id` (project-scoped, collision-free), calls `destroyChart(id)` FIRST, then `chartInstances[id] = new Chart(...)`, then `dynamicSliceChartIds.push(id)`. Implemented entries (Phase 2):

- `stat_strip` — see §7.
- `completion_badge` — see §7.
- `doughnut` — verbatim port of the `sliceProjectTypesChart` config (`app.js` L2500–2529), including the `entry.type_pipeline_crossTab[ctx.label]` tooltip closure (hazard 3, §4).
- `pipeline_bar` — verbatim port of `sliceProjectPipelineChart` (L2534–2572), including the `entry.pipeline_type_crossTab[pKey]` tooltip closure. Honors `annotations.empty_state` when `sequenced === 0` (today's chart already draws a zero bar; the empty_state text is surfaced as a caption beneath, additive).
- `temporal_bar` — verbatim port of `sliceProjectTemporalChart` (L2575–2590), reusing `insertGapMarkers(entry.temporal)` and `buildTemporalChartOptions()` and the per-month `entry.temporal` types tooltip closure.
- `bar` (sampler binding) — see §5.
- `badge_row` — calls existing `renderTagGroups(canvasOrContainerId, entry.tag_groups)` against a container the card creates (a plain `<div>`, not a canvas), preserving badge click→`filterState.tags` behavior verbatim.
- `caption` — small `text-stone-500` paragraph from `annotations.caption`/`title` (trivial; harmless to include even though no default widget is standalone-caption).
- `renderUnimplemented` (registered for `grouped_bar`, `heat_strip`, `link_chip`, `stat`) — returns without mounting anything. A `bar` widget whose `data_binding.source` starts with `tag_groups.` (the tagbar binding) also routes to no-op in Phase 2 via a guard inside the `bar` renderer.

### Edit E — `renderSlice(descriptor, entry, gridEl)`, after the dispatch table
```
function renderSlice(descriptor, entry, gridEl):
  hideSliceNoData(gridEl)
  gridEl.innerHTML = ''                      // rebuild cards each pass; stale tiles cannot persist
  dynamicSliceChartIds = []                   // reset; repopulated below (prev pass already torn down by renderView)
  var facts = computeFactsRuntime(entry)
  for each widget in descriptor.widgets (ARRAY ORDER):       // hazard 2
    try:
      if (!evalShowIf(widget.show_if || null, facts)) continue   // absent show_if => true (schema "Absent = always")
      var fn = WIDGET_RENDERERS[widget.type] || renderUnimplemented
      fn({ descriptor, entry, facts, widget, mount: gridEl,
           keyField: descriptor.slice_key_field, labelField: descriptor.slice_label_field })
    catch (e):
      // per-widget isolation: one bad widget never blanks the slice (Plan 3)
      if (window.console) console.warn('renderSlice widget failed', widget.id, e)
  // no charts created at all (e.g. every widget suppressed) is valid; gridEl simply holds whatever mounted
```
`renderSlice` itself does NOT call `destroyChart` for teardown of the *previous* pass — `renderView` already cleared everything at its top (Edit G + Edit H). Within a pass, each chart renderer destroy-firsts its own deterministic id before `new Chart`, which is safe because `gridEl.innerHTML = ''` detached the prior canvases AND `destroyAllSliceCharts` already destroyed their Chart objects on the prior `renderView` entry. (This closes Plan 2's Bug 1 — see Risk 3.)

### Edit F — `renderProjectView(groupId)` (L2478): wrap, do not gut
Insert at the top, after the entry lookup + `hideSliceNoData(grid)` (i.e. after L2495), BEFORE the first `destroyChart('sliceProjectTypesChart')`:
```js
var descriptor = getLayoutFor('project', entry);
if (USE_RENDER_SLICE && descriptor) {
  renderSlice(descriptor, entry, grid);
  return;
}
// ----- legacy path below (unchanged) -----
```
Everything from L2497 (`// Chart 1: Sample Types`) to L2595 stays byte-for-byte. It is the flag-off path, the layouts-missing fallback, and the verbatim source the chart renderers are copied from.

### Edit G — `renderView` dispatch (L3021–3029): UNCHANGED control flow
`renderView` still calls `renderProjectView(group)` at L3029. The collapse happens *inside* `renderProjectView`. The `pgEntry` precedence branch (L3011–3020 → `renderProjectGroupView`), the LOCATION branch (→ `renderLocationView`), and the LAB_GROUP branch (→ `renderLabGroupView`) are all untouched. No edit to `renderView` body except via Edit H's effect on the teardown helper it calls at L2933.

### Edit H — `SLICE_CHART_KEYS` (L1812) + `destroyAllSliceCharts` (L1833): tear down dynamic ids too
`destroyAllSliceCharts` is called at the TOP of `renderView` (L2933) on every state change. It must also destroy the deterministic `slice_project_*` ids that the *previous* `renderSlice` pass created. Change the function (not the static array) to also iterate `dynamicSliceChartIds`:
```js
function destroyAllSliceCharts() {
  SLICE_CHART_KEYS.forEach(function(key) { destroyChart(key); });
  dynamicSliceChartIds.forEach(function(key) { destroyChart(key); });
}
```
The static `SLICE_CHART_KEYS` array is left as-is (it still covers the legacy-path canvases used when the flag is off or layouts are missing, plus `pgDailyStackChart`/`pgSamplerMonthChart` which renderSlice never touches). This preserves the existing lifecycle call site with no signature change.

### Edit I — `index.html` project grid (L382–418): OPTIONAL, reversible
When `USE_RENDER_SLICE` is on, `renderSlice` owns `#slice-project-grid` and sets `innerHTML = ''` then appends cards. The 5 static cards (L385–417) become inert (cleared on first project render). **Keep them in the HTML** — they are the flag-off / layouts-missing DOM, and the canvases the legacy path needs (`sliceProjectTypesChart` etc.). No structural HTML change is required; the grid container, its id, and its `grid grid-cols-1 lg:grid-cols-2 gap-8` classes are retained so dynamic cards reflow identically. Do NOT empty the static cards in HTML (that would break the legacy fallback). This is the safest choice: zero HTML diff, the engine just takes over the grid at runtime when active.

---

## 3. Runtime `show_if` evaluator design + explicit parity checklist

Both functions are **structural transcriptions** of `build_layouts.py`, with predicate names and the field→fact-key map lifted as verbatim copy-paste constants (these strings are the single source of drift).

### `evalShowIf(cond, facts)` — mirror of `eval_show_if` (build_layouts.py L61–93)
```js
function evalShowIf(cond, f) {
  if (cond == null) return true;                                   // L63
  if (cond.all) return cond.all.every(function(c){ return evalShowIf(c, f); });   // L65–66
  if (cond.any) return cond.any.some(function(c){ return evalShowIf(c, f); });    // L67–68
  if (cond.not) return !evalShowIf(cond.not, f);                   // L69–70
  var p = cond.predicate;                                          // L71
  if (p === 'always') return true;                                 // L72–73
  if (p === 'distinct_gte') {                                      // L74–76
    var key = { sample_types: 'sample_types_distinct', sampler: 'samplers_distinct' }[cond.field];
    return f[key] >= cond.value;
  }
  if (p === 'field_eq') return f[cond.field] === cond.value;       // L77–78
  if (p === 'field_gt') return f[cond.field] >  cond.value;        // L79–80
  if (p === 'all_equal') return f.stages_all_equal;                // L81–82
  if (p === 'coverage_gte') return f.sampler_coverage_ratio >= cond.value;  // L83–84
  if (p === 'tag_group_nonempty') return f.populated_tag_groups.indexOf(cond.name) !== -1;  // L85–86
  if (p === 'months_gte') return f.months >= cond.value;           // L87–88
  if (p === 'contiguous_months') return f.contiguous;              // L89–90
  if (p === 'top_share_lt') return f.top_month_share < cond.value; // L91–92
  throw new Error('unknown predicate ' + p);                       // L93 (wrapped by renderSlice try/catch)
}
```

### `computeFactsRuntime(entry)` — mirror of `compute_facts` (build_layouts.py L32–57)
```js
function monthIdx(m){ var a=m.split('-'); return (+a[0])*12 + (+a[1]); }   // L27–29

function computeFactsRuntime(p){
  var n  = p.sample_count || 0;                                    // L33
  var st = p.sample_types || [];                                   // L34
  var sd = p.sampler_type_dist || [];                              // L35
  var pl = p.pipeline || {};                                       // L36  (location lacks pipeline => {} => zeros)
  var tmp = p.temporal || [];                                      // L37
  var tg = p.tag_groups || {};                                     // L38
  var months = tmp.map(function(t){return t.month;}).sort();       // L39  *** MUST .sort() — see Parity item 5 ***
  var seqIdx = months.map(monthIdx);                               // L40
  var contiguous = true;                                           // L41
  for (var i=0;i<seqIdx.length-1;i++){ if (seqIdx[i+1]-seqIdx[i] !== 1){ contiguous=false; break; } }
  var coll = pl.collected||0, ext = pl.dna_extracted||0, seq = pl.sequenced||0;  // L42
  var cov = sd.reduce(function(s,x){return s + x.count;}, 0);      // L43
  var topCount = tmp.reduce(function(mx,t){return t.count>mx?t.count:mx;}, 0);    // (max, default 0) L52
  return {
    project_id: p.project_id,                                      // L45
    sample_count: n,                                               // L46
    sample_types_distinct: st.length,                              // L47
    samplers_distinct: sd.length,                                  // L48
    sampler_coverage_ratio: n ? (cov / n) : 0.0,                   // L49
    months: months.length,                                         // L50
    contiguous: contiguous,                                        // L51
    top_month_share: n ? (topCount / n) : 0.0,                     // L52
    collected: coll, dna_extracted: ext, sequenced: seq,           // L53
    stages_all_equal: (coll === ext && ext === seq) && n > 0,      // L54
    populated_tag_groups: Object.keys(tg).filter(function(k){ return !!tg[k] && Object.keys(tg[k]).length > 0; }),  // L55 — see Parity item 6
    has_type_pipeline_crosstab: !!p.type_pipeline_crossTab         // L56
  };
}
```

### Parity checklist (runtime ≡ build) — item-by-item against build_layouts.py
1. **Dispatch order** — `null → all → any → not → predicate switch`: matches L63–71 exactly. ✔
2. **`distinct_gte` field→key map** `{sample_types:'sample_types_distinct', sampler:'samplers_distinct'}`: copied verbatim from L75. ✔
3. **`field_eq`/`field_gt`** index `f[cond.field]` with `===`/`>`: matches L77–80. (Note: no current layout uses these predicates; included for completeness so the engine is a full enum dispatch.) ✔
4. **`all_equal`** reads `f.stages_all_equal`, computed as `(coll===ext===seq) && n>0` — the `&& n>0` guard is present (L54). ✔
5. **`months` / `contiguous`** — `temporal[].month` is **sorted before** computing `seqIdx` (L39 `sorted(...)`). The JS port MUST call `.sort()`. **Latent bug if omitted** — verified all 20 arrays are currently pre-sorted, so a missing sort is masked today but would diverge the day unsorted data arrives. This is the single most important parity item; it is the bug Plan 1 missed (it wrote "distinct month count" with no sort). ✔ (with the `.sort()` call mandatory)
6. **`populated_tag_groups`** — Python is `[k for k,v in tg.items() if v]` (bare truthiness; empty dict/list is falsy). The JS port uses `!!tg[k] && Object.keys(tg[k]).length > 0`. Verified: every current tag_group value is a non-empty dict, so the two agree today (masked). The `Object.keys().length > 0` form is also exactly what the existing `renderTagGroups` uses (`app.js` L1642), so it is consistent with shipped behavior. The latent edge (a truthy non-dict value, e.g. a number) would diverge; not present in data, accepted as a known masked case to be revisited if the data shape changes. ✔ (masked-consistent)
7. **`coverage_gte`** — `sampler_coverage_ratio = sum(sampler counts)/sample_count`, guarded `n ? : 0` (L49). ✔
8. **`top_share_lt`** — `top_month_share = max(temporal count)/sample_count`, `default=0`, guarded `n ? : 0` (L52). ✔
9. **`tag_group_nonempty`** — `cond.name in f.populated_tag_groups` → `indexOf !== -1` (L86). ✔
10. **Unknown predicate** — Python raises `ValueError`; JS throws and `renderSlice` catches per-widget (degrades to hiding that one widget, never crashes the page). ✔

### Parity oracle (mandatory gate, dev-only, NOT shipped behavior)
Add a function gated behind a `?verifyLayouts` URL param that, for every entry in `appData.slice_views.project` plus the `default`, runs `computeFactsRuntime` + `evalShowIf` over each `widget.show_if` and asserts the per-widget visible set is **identical** to `build_layouts.py`'s evaluation over the same `data.json`. The build's authoritative reference is reproduced two ways:
- **Primary:** run `python3 scripts/build_layouts.py` once during dev and diff the runtime visible-grid (logged to console) against the Python `rule_grid`/`eval_show_if` output. A tiny throwaway Node/Python harness (not committed) computes the expected per-(project,widget) boolean table; the browser harness asserts equality and logs `0 mismatches` or the offending `(project, widget, runtime, expected)` rows.
- This harness **must report 0 mismatches before `USE_RENDER_SLICE` is relied upon** for the live page. It is verification scaffolding (behind a query param, no effect on normal load), not shipped logic.

---

## 4. How each of the 3 renderer hazards is preserved

**Hazard 1 — label ≠ key.** `renderSlice` reads `descriptor.slice_key_field` and `descriptor.slice_label_field` and threads both into `ctx` (`keyField`, `labelField`). The entry is already resolved by `renderView` using the correct key. Any renderer needing a human label (the sampler tooltip "… in `<label>`") uses `entry[ctx.labelField]`. For Phase 2's only migrated kind (`project`), `slice_key_field === slice_label_field === 'project_id'`, so the sampler suffix resolves to `entry.project_id` — **identical to today's `app.js` L2595 (`_gl = entry.project_id`)**. The machinery is written generically so 2b Location (`key=site_code`, `label=site_name`, the actual hazard) is correct by construction with no renderer change — but the hazard is only *exercised* on the zero-risk project case (key===label) in Phase 2.

**Hazard 2 — ordered + optional.** `renderSlice` iterates `descriptor.widgets` in **array order**; each widget is independently gated by `evalShowIf`. A suppressed widget appends **nothing** (no empty card, no placeholder), so CSS-grid auto-flow reflows with no gap. This is the ordered-optional model, not a fixed grid. Card width derives from `widget.size` (`lg → lg:col-span-2`, matching today's full-width temporal card; `sm`/`md → default span`). The eval-campaign ordering (sampler promoted to position 2, `size: lg`) and the override hero charts are honored purely by reading order/size from the descriptor — though the override hero charts themselves are 2b no-ops in Phase 2. Location's unique optional charts (sub_sites, time-of-day) live entirely in the untouched legacy renderer this phase.

**Hazard 3 — tooltips close over `entry`.** Every Chart.js renderer builds its `options`/tooltip callbacks **inside the renderer function**, closing over `ctx.entry` per-call (never a shared module constant). The three crosstab closures are **copied verbatim** from `renderProjectView`:
- doughnut label: `entry.type_pipeline_crossTab[ctx.label]` (from L2524),
- pipeline_bar label: `entry.pipeline_type_crossTab[pKey]` (from L2555),
- temporal_bar label: per-month `entry.temporal` types (from L2589).

`binds_entry` defaults `true` in the schema; `renderSlice` always passes the live `entry`, so the flag is satisfied by construction. Verification: visual-diff the moved blocks against L2497–2595 to confirm identical callback bodies (Risk 4).

---

## 5. How sampler charts are cut / promoted

The three per-slice sampler charts (`sliceProjectSamplerChart` L2593–2595, `sliceLocationSamplerChart` L2767–2769, `sliceLabGroupSamplerChart`) are handled as follows in Phase 2: **only the PROJECT one is touched.** The `WIDGET_RENDERERS.bar` renderer, when `widget.data_binding.source === 'sampler_type_dist'`:
1. creates a card + canvas (deterministic id `slice_project_sampler`),
2. calls the **existing** `renderSamplerTypeChart(id, entry.sampler_type_dist)` (DRY — reuses the proven log-scale + zero-count guard + no-data fallback at `app.js` L817–873, no second implementation),
3. re-applies the per-slice tooltip label closure verbatim from L2594–2595, using `entry[ctx.labelField]`:
   `_sc.options.plugins.tooltip.callbacks.label = function(ctx){ return ctx.parsed.y.toLocaleString() + ' samples' + (lbl ? ' in ' + lbl : ''); }; _sc.update('none');`

**Visibility is data-driven by `show_if`:**
- **Default rule** (`distinct_gte sampler≥2` AND `coverage_gte 0.95`): verified to show on only **3 projects** (Spring SASS/Polycarbonate, Spring Sass/VIVAS, 2024 Summer). The other 17 projects — which today always render a sampler card — will have it **suppressed**. This is an intentional behavior change and the core deliverable of the complexity review (see Risk 6); it is suppression-only (never fabrication), gated by `USE_RENDER_SLICE`, fully reversible.
- **Eval-campaign promotion** (Spring SASS/Polycarbonate, Spring Sass/VIVAS, BACS, 2024 Summer): the seed layouts already relax `show_if` to `distinct_gte sampler≥2` only, set `size: lg`, retitle to "Sampler Comparison (campaign focus)", and reorder the sampler to position 2. `renderSlice` honors all three (relaxed show_if, lg width, front order) because it reads them straight from the descriptor — no special-casing. (Note: BACS does not pass the *default* 0.95-coverage rule but DOES pass its relaxed override rule, so BACS shows its sampler. Verified.)

`annotations.unspecified_remainder` (sampler partial coverage) is surfaced as a caption line under the chart when `coverage < 1` — additive, optional.

The separate `sampler_pipeline` **grouped_bar** override (Spring SASS/Polycarbonate, Spring Sass/VIVAS) is a NET-NEW grouped_bar → **deferred to 2b** (no-op stub). The `bar`-as-tagbar variant (height_bar/position_bar bound to `tag_groups.X`) is **also deferred** via the source-prefix guard inside the `bar` renderer. Location/LabGroup sampler charts are untouched (legacy renderers).

---

## 6. Location / LabGroup decision

**KEEP Location and LabGroup on their existing renderers in Phase 2 (`renderLocationView` L2602, `renderLabGroupView` L2776 — byte-unchanged). Migrate in Phase 2b.** All three plans and the critique agree; the justification, verified:

1. **No seeds exist.** `project-layouts.json` contains ONLY `slice_kind: "project"` layouts plus a `project`-kind `default`. There are NO `location`/`lab_group` LayoutDescriptors. `renderSlice` has nothing valid to drive those views, and `getLayoutFor` correctly returns `null` for them → `renderView` keeps calling the legacy renderers. Generating those seeds is a `build_layouts.py` change (new slice_kind fact derivation + two new widget types) — Phase-1-shaped work, out of scope for a no-regression collapse.
2. **Location is where the hazards bite.** It is the **only** slice where `key (site_code) ≠ label (site_name)` (verified at L2769) AND where `pipeline` is **absent** (verified — location entries have no pipeline key, so `all_equal`/`pipeline_bar`/`completion_badge` would compute on `{}`). Proving the engine on `project` first (key===label, pipeline present, lowest risk) before touching Location is the regression-safe order.
3. **Location has two unique widgets with no schema type yet** — sub_sites horizontal bar (L2624–2664) and the conditional time-of-day card with its own show/hide (L2718–2764). Reproducing those faithfully is exactly the net-new surface this phase defers.
4. **Clean seam.** `renderView` already branches per category; leaving the LOCATION/LAB_GROUP branches calling their legacy renderers is an isolated, zero-risk fallback. Their charts, tooltips, and the `timeDistCard` toggle are provably preserved because the code is not touched at all.

The `renderSlice` plumbing (slice_key_field/slice_label_field, ordered+show_if iteration, generic ctx) is built now so 2b is a data-authoring + two-widget-renderer task, not a re-architecture.

---

## 7. New widget renderers built NOW (Phase 2)

Only two NET-NEW renderers ship — both pure HTML/number tiles, zero Chart.js risk:

**`stat_strip` (overview_stats).** A `bg-white p-6` card titled from `widget.title` ("At a glance") rendering a flex row of stat tiles. Phase 2 minimum: the headline `entry.sample_count` as a large number with label "Samples", plus `annotations.caption` beneath. Reads `descriptor.banner.absorbed_stats` (currently `[]` for all 20, verified) into additional tiles when present, so the cut-chart facts have a home as the design intends. No chart id (HTML only); `gridEl.innerHTML=''` prevents stale tiles. Semantic HTML + sufficient contrast (stone-800 on white) per A11Y rules.

**`completion_badge` (pipeline_complete).** A `bg-white p-6` `size: sm` card shown when `stages_all_equal` is true (verified: 4 projects). Renders a green-check "Fully processed — N samples through all stages" badge using `entry.pipeline.collected` (= dna_extracted = sequenced). **Replaces** the degenerate three-equal-bar pipeline; because `pipeline` (`not all_equal`) and `pipeline_complete` (`all_equal`) are mutually exclusive by construction, exactly one of the two renders — never zero (the Plan 1 regression), never both. WCAG-AA contrast on the green badge text. No chart id.

**`caption`** is also wired (trivial text card) for robustness, though no default widget is a standalone caption.

**Registered NET-NEW stubs (no-op now, built in 2b):** `grouped_bar`, `heat_strip`, `link_chip`, `stat`, and the `bar`-as-tagbar binding. `renderUnimplemented(ctx)` returns without mounting, so seed layouts referencing them (the override projects) degrade silently — correct, since the corresponding cards do not exist on today's page either.

---

## 8. Risk register

| # | Risk | Likelihood / Impact | Mitigation |
|---|---|---|---|
| 1 | **Parity drift in `computeFactsRuntime`/`evalShowIf`** vs `build_layouts.py` → wrong widget shown/hidden. Highest-value risk. | Med / High | Transcribe both functions line-for-line (§3) with predicate names + field-key map as copy-paste constants. **Mandatory `?verifyLayouts` oracle** must report 0 mismatches across all 20 projects + default vs the Python output before relying on the flag. Specifically assert the `.sort()` (item 5) and `populated_tag_groups` truthiness (item 6). |
| 2 | **`completion_badge` not implemented → blank gap** on the 4 all_equal projects (the Plan 1 regression). | Was certain in Plan 1 / High | `completion_badge` is implemented in Phase 2 (§7). Verification gate: for each of Fragmented Landscape, 2022 Fall CPER, Two Towers, 2022 Fall CPER Extra, confirm exactly one of `{pipeline_bar, completion_badge}` renders — never zero, never both. |
| 3 | **Chart.js "canvas already in use" / zombie charts** when card DOM is rebuilt via `innerHTML=''`. (Plan 2's deferred-teardown bug.) | Med / Med | Destroy-FIRST discipline: `destroyAllSliceCharts` (called at `renderView` top, L2933) tears down both `SLICE_CHART_KEYS` and `dynamicSliceChartIds` (Edit H); within a pass each chart renderer `destroyChart(id)` before `new Chart`. Deterministic ids `slice_project_<widget.id>`. Test: switch project→project→global→location→back rapidly, watch console for the error. |
| 4 | **Tooltip closures diverge** from legacy when chart configs are moved into renderers (hazard 3 regression). | Med / Med | Copy the three callback bodies VERBATIM from L2524/L2555/L2589; do not paraphrase. Visual-diff flag-on vs flag-off tooltips on a crosstab project (Fall Plants & Soil). |
| 5 | **Sampler suppression read as a bug** — 17/20 projects lose the always-on sampler card. | Certain (intended) / Med | This is the deliverable, not a regression. Document it; verify per-project against the matrix; reversible via `USE_RENDER_SLICE=false`. Only flip the flag on after stakeholder sign-off that suppression is wanted. |
| 6 | **Layouts fetch fails on GitHub Pages** (path/case/MIME) → project view breaks if layouts were mandatory. | Low / High | Layouts fetch is OPTIONAL (Edit B, `.catch → null`). `data.json` is the only hard dep. `projectLayouts=null → getLayoutFor returns null → legacy renderProjectView`. Confirm file is committed and served at `data/project-layouts.json`; test rename-and-reload fallback. |
| 7 | **Grid reflow / `lg:col-span-2` artifact** when the temporal card is suppressed (single-month/top-share≥0.85 projects). | Low / Low | Dynamic cards are appended/omitted (omitted = removed from grid flow entirely, no `display:none` phantom). `makeSliceCard` maps `lg → lg:col-span-2`. Screenshot-verify a single-month project leaves no phantom column. |
| 8 | **Untouched-surface regression** — `renderProjectGroupView` (CPER), global dashboard, `pgEntry` branch, `pgDailyStackChart`/`pgSamplerMonthChart`. | Low / High | `renderSlice` only touches `#slice-project-grid` and `slice_project_*` ids. `renderView` control flow unchanged (Edit G). `pgEntry` branch and global charts untouched. Verify CPER group page, global view, and pg charts unaffected flag-on. |
| 9 | **Scope creep** into building net-new widgets because override layouts reference them. | Med / Med | `renderUnimplemented` silent no-op for `grouped_bar`/`heat_strip`/`link_chip`/`stat`/tagbar. Those layout entries are read but produce no DOM — correct, the cards don't exist today. Hold the §1 cut line. |
| 10 | **2b footgun: `getLayoutFor` returns project `default` for non-project kinds** → pipeline facts on `{}`. | Low now / Med in 2b | `getLayoutFor` returns `null` (not `default`) when `sliceKind !== 'project'` (Edit C). Plan 3's correction of Plan 2's Bug 2. |

---

## 9. Per-slice browser test plan

Serve locally: `python3 -m http.server` from repo root; open `index.html`. A/B by toggling `USE_RENDER_SLICE` (or `git stash` the diff) for byte-comparison against the live page.

### Gate 0 — Parity oracle (run FIRST, blocking)
Load `index.html?verifyLayouts`. Console must report **0 mismatches** across all 20 project layouts + `default` (runtime `evalShowIf` reproduces the Phase-1 build's keep/cut). Any mismatch blocks turning the flag on.

### PROJECT slice (the only migrated kind) — show_if suppression per widget
- **overview_stats (stat_strip, always):** every project shows an "At a glance" tile with `sample_count` matching the subtitle count. Pick a low-complexity project (e.g. Spring SKC) and confirm the tile is present and correct.
- **sample_types (doughnut, distinct_gte ≥3):** a ≥3-substrate project (a Plants & Soil) → doughnut SHOWS with its crosstab tooltip (hover a wedge → Collected/Extracted/Sequenced lines); a <3 project → doughnut HIDDEN, count visible in stat_strip.
- **pipeline / pipeline_complete (mutually exclusive):** an all_equal project (Fragmented Landscape, 2022 Fall CPER, Two Towers, 2022 Fall CPER Extra) → `pipeline_bar` HIDDEN and `completion_badge` SHOWS (exactly one, never blank — Risk 2 gate); a non-all_equal project → `pipeline_bar` SHOWS with its per-type tooltip, and confirm the `sequenced==0` empty-state caption path still reads sensibly.
- **temporal (temporal_bar, months_gte ≥2 AND top_share_lt 0.85):** a multi-month project → temporal SHOWS with gap markers intact, full-width (`lg:col-span-2`) with no grid gap; a single-month or single-month-dominated (>85%) project → temporal HIDDEN, no phantom column (Risk 7).
- **sampler (bar, default ≥2 AND ≥0.95):** verified-visible projects are exactly Spring SASS/Polycarbonate, Spring Sass/VIVAS, 2024 Summer (default rule) plus BACS (relaxed override) → sampler SHOWS with tooltip suffix "… in `<project_id>`"; for eval campaigns confirm it is `lg`/full-width and ordered at position 2; a typical project (e.g. IMPROVE Fungi) → sampler HIDDEN.
- **tags (badge_row, any tag_group_nonempty):** a tagged project → badges SHOW and remain clickable (toggling updates `filterState.tags` and re-filters); an untagged project → tags HIDDEN.
- **Hazard 3 spot-check:** on a crosstab project (Fall Plants & Soil), hover doughnut/pipeline/temporal and confirm tooltips read live `entry` values (not blank/stale), identical to flag-off.

### Suppression cross-check (against the matrix / build)
Open ~4 projects spanning the verified cases — one all_equal (completion_badge), one single-month (temporal hidden), one non-eval typical (sampler hidden), one untagged (tags hidden) — and confirm exactly the widgets the oracle predicts are visible.

### Deferred-widget graceful degradation
Open an override project with deferred widgets (Fall Plant Circle → heat_strip + grouped_bar; BACS → link_chip; 2022 Fall CPER Control → stat; Flux → tagbar; a project lacking `tag_charts` like IMPROVE Fungi). Confirm NO broken/empty card and NO console error — the stub renders nothing.

### Regression cases (must be byte-identical to today, flag-on)
- **Location slice:** sub_sites bar, types doughnut, temporal, optional time-of-day card show/hide, sampler tooltip says `site_name` — all via the untouched legacy renderer.
- **LabGroup slice:** all charts via legacy renderer.
- **CPER project_group page** (`renderProjectGroupView`): unchanged; `pgDailyStackChart`/`pgSamplerMonthChart` intact.
- **Global (non-slice) dashboard:** KPIs, temporal, map unaffected.

### Lifecycle & fallback drills
- Switch project→project→global→location→back rapidly: no "canvas already in use" errors; inspect `chartInstances` for leaked `slice_project_*` entries (Risk 3).
- **Rollback drill:** set `USE_RENDER_SLICE = false`, reload → exact legacy project view restored.
- **Layouts-missing drill:** temporarily rename `data/project-layouts.json` (or block its fetch), reload → project view renders via legacy `renderProjectView` with no console error (Risk 6).

---

## Bottom line

Ship **Plan 2's scope** — the two load-bearing HTML tiles (`stat_strip`, `completion_badge`) IN, the five net-new chart types (`grouped_bar`, `heat_strip`, `link_chip`, `stat`, tagbar) STUBBED — executed with **Plan 3's full discipline**: `USE_RENDER_SLICE` flag, OPTIONAL layouts fetch with null→legacy fallback, `getLayoutFor` null-for-non-project, destroy-first inside `renderSlice`, verbatim tooltip copy, per-widget try/catch, and a mandatory `?verifyLayouts` parity oracle against `build_layouts.py`. Reject Plan 1 (false premise; blanks the 4 all_equal projects). Reject Plan 3's scope (builds its riskiest charts where its A/B net cannot reach). Keep Location/LabGroup on legacy renderers; migrate in 2b. Two key files: `assets/app.js` and `data/project-layouts.json`; parity is checked against `scripts/build_layouts.py`.
