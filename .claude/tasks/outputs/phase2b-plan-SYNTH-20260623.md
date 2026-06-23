# BROADN Phase 2b — Authoritative Synthesis Plan

**Task:** phase2b-plan-SYNTH-20260623
**Author:** SYNTH (plan synthesis)
**Date:** 2026-06-23
**Inputs:** Plan A (new-widget-renderers), Plan B (location-labgroup-migration), adversarial CRITIQUE, plus first-hand verification against `assets/app.js`, `scripts/build_layouts.py`, `data/layout-schema.json`, `data/data.json`, `data/project-layouts.json`.

> **Ground-truth note.** Every load-bearing claim below was re-verified against source, not taken from the plans. Where a plan's prose was wrong but its code intent right, the code intent is adopted and the prose corrected (flagged inline). Baseline today: `python3 scripts/build_layouts.py` prints **schema validation: PASS** and **matrix cross-check 83/100** (the 17 divergences are pre-existing semantic calls, NOT regressions). The `?verifyLayouts` oracle currently covers `project` only.

---

## 0. The decisive corrections that shape this plan

Four findings change scope versus the raw plans. They are the spine of everything below.

1. **`replicate_compare` is ALREADY live and currently renders a blank gap.** `data/project-layouts.json` emits a `grouped_bar` for Optimization Tests bound to `tag_charts.Replicate` (verified: tiles `A`/`B`, each `{...,pipeline:{collected,dna_extracted,sequenced}}` — identical shape to Quadrant). Plan A's `grouped_bar` branches only on `type_pipeline_crossTab`/`sampler_type_dist`/`else return`, so Optimization Tests falls into `else return` → silent blank on a live project. **Decision: `grouped_bar` MUST handle `tag_charts.*` now** (cheap — reuse the per-substrate stacked layout, rows = tile keys). This pulls `replicate_compare` from Plan A's "deferred" list into scope-now. Without it, finishing the other renderers leaves a visible regression.

2. **`compute_facts` hard-KeyErrors on location/lab_group; the JS port silently diverges.** `compute_facts` line 45 is `p["project_id"]` — location (10/10) and lab_group (8/8) entries have NO `project_id` (verified). Python raises `KeyError`; the JS mirror (`computeFactsRuntime` line 1907 `p.project_id`) yields `undefined` instead of throwing. If only Python is fixed, the two ports diverge silently and the oracle would (falsely) pass on project while the kinds disagree. **This is the single highest-risk parity item** and gates Plan B Wave 1.

3. **`stat_strip` leaks pipeline-absence as a false "0% Sequenced" on every location.** `stat_strip` line 2020 computes `collected ? round(100*seq/collected) : 0`; location has `collected=0` → renders a literal **"0% — Sequenced"** tile. Not a crash, but factually wrong (locations don't track a pipeline). This is the same hazard class Plan B carefully structurally-omits for `pipeline_bar`/`completion_badge`, leaking through a different door. **Decision: suppress the Sequenced tile when `!facts.collected`** (one-line renderer guard; also correct for any future pipeline-less project). Un-flagged in both plans.

4. **The boolean-show_if trap is real.** `ShowIf.value` is schema-typed `"type":"number"` (verified line 109). A `field_eq {value:true}` time-of-day gate would FAIL schema validation. **Decision: gate time_of_day with a numeric fact `time_distribution_periods` (int length) + `field_gt value:0`** — schema-clean, no new predicate, no JS/Python predicate divergence. (Plan B reached the same conclusion; locked here.)

---

## 1. Scope decision — NOW vs DEFERRED (with rationale)

### SCOPE NOW

**Workstream 1 — New buildable widget renderers (pure `assets/app.js`, zero parity surface).**

| Widget | Binding (verified) | Decision |
|---|---|---|
| `bar` tag_groups.* | `tag_groups.Position` / `.Replicate` (token→count dicts) | Implement. Extend existing `bar` renderer with a `tag_groups.` branch; **linear** y-axis (counts can be tiny, e.g. `{RH:2}` — log is wrong). |
| `grouped_bar` (`type_pipeline_crossTab`) | substrate→{collected,dna_extracted,sequenced} | Implement. Horizontal stacked bar, rows = `Object.keys()` (NOT a fixed Plant/Soil/Air — Fall Plant Circle has only Plant+Soil; Plan A's prose was wrong). |
| `grouped_bar` (`tag_charts.*`) | tile→{...,pipeline:{...}} (Replicate A/B) | **Implement now** (correction #1). Same stacked layout, rows = tile keys, datasets from `tile.pipeline`. Closes the live `replicate_compare` blank gap. |
| `heat_strip` (`tag_charts.Quadrant`) | Q1..Q12 → {pipeline:{...}} | Implement as **pure-DOM CSS grid** (no Chart.js heat type). Sort keys by `parseInt(key.slice(1))` (raw order is `Q1,Q2,Q11,Q12,Q3…`). Green ramp = % sequenced. `size:'lg'`. Do NOT push to `dynamicSliceChartIds` (no canvas). |
| `link_chip` (publications) | `PROJECT_CONTENT[id].links` | Implement in-grid + **banner de-dup** (see §5). Extract `makeLinkChip(lk)` shared helper (DRY). 5 affected projects. |

**Workstream 2 — Location + Lab-Group migration onto `renderSlice` (two sequenced waves).**
- **Wave 1 — Lab-Group** (project-clone; HAS pipeline; lowest risk). Proves the `getLayoutFor`/render-wrap/oracle-extension machinery.
- **Wave 2 — Location** (no pipeline; key≠label; 2 net-new renderers `sub_sites` + `time_of_day`; optional time-of-day; stat_strip 0% fix). On the proven scaffold.

### DEFERRED (with rationale)

| Deferred item | Why |
|---|---|
| **`sampler_pipeline` real rendering** (Spring SASS/Polycarbonate Top/Bottom, Spring Sass/VIVAS) | **DATA-BLOCKED.** `sampler_type_dist` carries only per-sampler totals; there is NO per-sampler pipeline crosstab in `data.json` (verified: SASS has no `sampler_pipeline` key). Building "do samplers advance equally?" needs a NEW crosstab from `scripts/preprocess_data.py`. `grouped_bar` keeps a **guarded silent no-op** for `source==='sampler_type_dist'` with an in-code comment naming the preprocess work + the 2 layouts. |
| **tag-filter live re-render of slice charts** (`applyFilter → updateSliceCharts`) | PRE-EXISTING gap (already true for the project path Phase 2 shipped). `updateSliceCharts` targets static canvas ids that `renderSlice` replaces with `slice_<kind>_<id>`. Cross-cutting; out of scope. |
| **Deleting dead static cards** in `#slice-location-grid` / `#slice-labgroup-grid` (incl. `#slice-location-timeofday-card`) | They are the flag-off fallback DOM. Deleting now breaks `USE_RENDER_SLICE=false` rollback. Keep until the flag is permanently retired. |
| **Deleting `renderLocationView`/`renderLabGroupView`** | Hard constraint: keep as flag-off / missing-layout fallback. |
| **`control_callout` (`stat`, 2022 Fall CPER Control)** | Out of both named sets; stays `renderUnimplemented`. |

---

## 2. Ordered edit map

> **Increment order (strict):** **WS1-step1 → WS1-step2 → WS2 Wave 1 (lab_group) → WS2 Wave 2 (location).** WS1 is pure app.js with zero parity surface and is instantly flag-independent (the override widgets already exist in the JSON, currently rendering blank — fixing them is strictly additive). WS2 touches the parity ports and must be gated wave-by-wave. Never combine the two waves in one commit.

### WS1-step1 — bar tag_groups.* + link_chip + banner de-dup (app.js only)

| # | Location | Change |
|---|---|---|
| 1.1 | `assets/app.js` ~371-387 (banner links block) | Extract per-link `<a>` construction (lines 374-386) into `function makeLinkChip(lk)` returning the `<a>` node (inline-flex rounded border chip + `↗`, `target=_blank rel="noopener noreferrer"`). Call it from the banner `forEach`. **DRY** — reused by `link_chip`. |
| 1.2 | `assets/app.js` ~371-391 (banner links) | Before rendering links, compute `suppressLinks = USE_RENDER_SLICE && projectLayouts && projectLayouts.projects[group] && projectLayouts.projects[group].widgets.some(function(w){return w.type==='link_chip';})`. If `suppressLinks`: `linksEl.innerHTML=''; linksEl.classList.add('hidden')` and skip. Else render via `makeLinkChip`. (See §5.) |
| 1.3 | `assets/app.js` line 2151-2177 (`bar` renderer) | After the `if (src !== 'sampler_type_dist')` guard, replace the bare `return` with a `tag_groups.` branch: `if (src && src.indexOf('tag_groups.')===0) { var group=src.slice('tag_groups.'.length); var dict=ctx.entry.tag_groups && ctx.entry.tag_groups[group]; if(!dict||!Object.keys(dict).length) return; ...build vertical bar... }` then `return` for any other source. Labels=`Object.keys(dict)` (optional `sort_desc` per `data_binding.transform`), data=counts, `backgroundColor: CHART_COLORS.samplerType`, **`scales.y` linear `beginAtZero:true`** (NOT log), `scales.x.grid` hidden, tooltip `ctx.parsed.y+' samples'`. Mount via `makeSliceCard`+`makeCanvas`, `id=sliceChartId(ctx,ctx.widget)`, `destroyChart(id)` first, `dynamicSliceChartIds.push(id)`. |
| 1.4 | `assets/app.js` line 2200 (`link_chip: renderUnimplemented`) | Replace with `link_chip: function(ctx){ var content=PROJECT_CONTENT[ctx.entry[ctx.keyField]]; var links=content&&content.links; if(!links||!links.length) return; var card=makeSliceCard(ctx.widget); var row=document.createElement('div'); row.className='flex flex-wrap gap-2'; links.forEach(function(lk){ row.appendChild(makeLinkChip(lk)); }); card.appendChild(row); ctx.mount.appendChild(card); }`. **No canvas, no dynamicSliceChartIds.** `no_fabricate` honored: empty/missing links → render nothing (no empty card). NOTE on key: `ctx.keyField` is `project_id` for project layouts, so `PROJECT_CONTENT[ctx.entry.project_id]` resolves correctly. (Plan A's literal source string `PROJECT_CONTENT.publications` is symbolic; the real field is `.links` — verified, banner already iterates `content.links`.) |

### WS1-step2 — grouped_bar (3 source modes) + heat_strip (app.js only)

| # | Location | Change |
|---|---|---|
| 2.1 | `assets/app.js` line 2198 (`grouped_bar: renderUnimplemented`) | Replace with `grouped_bar: function(ctx){...}`. Read `src = ctx.widget.data_binding && ctx.widget.data_binding.source`. **Three branches:** (a) `src==='type_pipeline_crossTab'` → `tab=ctx.entry.type_pipeline_crossTab`, rows=`Object.keys(tab)`, each row's three stage values from `tab[row].{collected,dna_extracted,sequenced}`. (b) `src && src.indexOf('tag_charts.')===0` → `name=src.split('.').pop(); chart=ctx.entry.tag_charts && ctx.entry.tag_charts[name]`, rows=`Object.keys(chart)`, stage values from `chart[row].pipeline.{...}` (guard missing `.pipeline`). (c) `src==='sampler_type_dist'` → **DATA-BLOCKED no-op `return`** + comment: `// DATA-BLOCKED: no per-sampler pipeline crosstab in data.json; needs scripts/preprocess_data.py to emit sampler×stage. Affects Spring SASS/Polycarbonate Top/Bottom + Spring Sass/VIVAS.` else `return`. Then if rows empty → `return`. Build **horizontal STACKED** bar: `indexAxis:'y'`, `scales.x.stacked=true`, `scales.y.stacked=true`, 3 datasets `Collected`/`DNA Extracted`/`Sequenced` with `CHART_COLORS.pipeline[0..2]`. Per-row tooltip = the 3 stage counts + derived `% sequenced` (`collected? round(100*sequenced/collected):0`). Mount/destroy/`dynamicSliceChartIds.push` exactly like `pipeline_bar` (line 2098 pattern). |
| 2.2 | `assets/app.js` line 2199 (`heat_strip: renderUnimplemented`) | Replace with `heat_strip: function(ctx){...}`. `src=...source`; `name = src && src.indexOf('.')>=0 ? src.split('.').pop() : 'Quadrant'`; `chart=ctx.entry.tag_charts && ctx.entry.tag_charts[name]`; if absent `return`. `keys=Object.keys(chart).sort(function(a,b){return parseInt(a.slice(1),10)-parseInt(b.slice(1),10);})` (**numeric sort** — raw order is `Q1,Q2,Q11,Q12,Q3…`). `card=makeSliceCard(ctx.widget)` (widget `size:'lg'` already, so card spans 2 cols). Build `div.grid.grid-cols-4.gap-2` (or `grid-cols-6` for 12 tiles); per key compute `pl=chart[k].pipeline||{}; coll=pl.collected||0; seq=pl.sequenced||0; pct=coll?Math.round(100*seq/coll):0;` tile = `Qn` + `pct%`, `background=CHART_COLORS.sliceHeatRamp[bucket]` (bucket from pct: 0→0, ≤33→1, ≤66→2, else 3), `title`+`aria-label` = `'Q'+n+': '+pct+'% sequenced ('+seq+' of '+coll+')'`. `ctx.mount.appendChild(card)`. **No canvas, no dynamicSliceChartIds** (pure DOM, cleared by `gridEl.innerHTML=''`). |
| 2.3 | `assets/app.js` `CHART_COLORS` (~line 34) | Add `sliceHeatRamp: ['#f0fdf4', '#bbf7d0', '#16a34a', '#166534'],` (pale→deep green, consistent with existing `CHART_COLORS.pipeline`). Index 0 = pale tint for 0%. Keeps Rule-A color-token discipline (hex only in config). |

### WS2 Wave 1 — Lab-Group migration (parity ports change here)

| # | Location | Change |
|---|---|---|
| 3.1 | `scripts/build_layouts.py` `compute_facts` line 45 | `"project_id": p.get("project_id") or p.get("group_name") or p.get("site_code"),` — identity-field fallback (renames nothing; key still called `project_id` internally). **Mirror byte-for-byte** in 3.2. |
| 3.2 | `assets/app.js` `computeFactsRuntime` line 1907 | `project_id: p.project_id || p.group_name || p.site_code,` — exact mirror of 3.1. (Pipeline reads already `.get`/`||0`-guarded in both ports, so lab_group's present pipeline and location's absent pipeline are both safe.) |
| 3.3 | `scripts/build_layouts.py` after `build_project_layout` (~line 227) | Add `labgroup_widgets()` = project baseline **minus `link_chip`** (no PROJECT_CONTENT keying by group_name) — in practice baseline_widgets() already has no link_chip, so this is just `baseline_widgets()`; add `build_labgroup_layout(facts)` returning `layout("lab_group","group_name","group_name", baseline_widgets())`. No OVERRIDES/EVAL_CAMPAIGNS/PUBLICATION_PROJECTS apply. |
| 3.4 | `scripts/build_layouts.py` `main()` out dict (~line 271) | **Additively** add `"lab_groups": {f["project_id"]: build_labgroup_layout(f) for f in lg_facts}` and `"lab_group_default": layout("lab_group","group_name","group_name", baseline_widgets())`, where `lg_facts=[compute_facts(p) for p in data["slice_views"]["lab_group"]]`. **Keep existing `"default"`/`"projects"` byte-identical.** |
| 3.5 | `assets/app.js` `getLayoutFor` line 1949-1952 | Add (keep project branch + null fallback): `if (sliceKind==='lab_group') return (projectLayouts && projectLayouts.lab_groups && (projectLayouts.lab_groups[entry.group_name] || projectLayouts.lab_group_default)) || null;` Remove the `sliceKind !== 'project'` early `return null` so the new branch is reachable; gate the project branch explicitly instead. |
| 3.6 | `assets/app.js` `renderLabGroupView` top (~line 3168, after `hideSliceNoData(grid)`) | Insert the wrap (mirror renderProjectView 2864-2868): `var descriptor=getLayoutFor('lab_group',entry); if(USE_RENDER_SLICE && descriptor){ renderSlice(descriptor, entry, grid); return; }` Legacy body stays as fallback. `renderView` LAB_GROUP branch (3412) UNCHANGED. |
| 3.7 | `scripts/build_layouts.py` `visibility` branch (~line 277) | Extend the emitted grid to also include lab_group (keyed by group_name): same `eval_show_if` filter over `build_labgroup_layout(f).widgets`. Keep the project grid emission byte-identical. |
| 3.8 | `assets/app.js` `verifyLayoutsOracle` line 2225-2234 | After the project loop, add a lab_group loop over `appData.slice_views.lab_group` looking up `projectLayouts.lab_groups[e.group_name] || projectLayouts.lab_group_default`. **Make the lookup kind-aware** (do NOT fall back to `projectLayouts.default` for non-project kinds — that mis-attributes the project default). Merge into the same logged grid object, namespaced so project keys stay unchanged for diffing. |

### WS2 Wave 2 — Location migration (on the proven scaffold)

| # | Location | Change |
|---|---|---|
| 4.1 | `scripts/build_layouts.py` `compute_facts` (~line 56) | Add fact `"time_distribution_periods": len(p.get("time_distribution") or []),`. **Mirror** in 4.2. (Numeric, schema-clean per correction #4.) |
| 4.2 | `assets/app.js` `computeFactsRuntime` (~line 1920) | Add `time_distribution_periods: (p.time_distribution || []).length,` — exact mirror of 4.1. |
| 4.3 | `scripts/build_layouts.py` (~line 227) | Add `location_widgets()` = baseline **with `pipeline` (pipeline_bar) AND `pipeline_complete` (completion_badge) structurally OMITTED** (correction #3 / hazard), **prepend** a `sub_sites` widget (`type:"sub_sites"`, `data_binding.source:"sub_sites"`, `show_if:{predicate:"always"}`), and append a `time_of_day` widget (`type:"time_of_day"`, `data_binding.source:"time_distribution"`, `show_if:{predicate:"field_gt","field":"time_distribution_periods","value":0}`). Keep `doughnut(sample_types)`, `temporal_bar`, `bar(sampler_type_dist)`, `badge_row(tags)` from baseline. Add `build_location_layout(facts)` returning `layout("location","site_code","site_name", location_widgets())`. **Assert at build time** no location layout contains widget ids `pipeline` or `pipeline_complete` (print a one-line check). |
| 4.4 | `scripts/build_layouts.py` `main()` out dict | Additively add `"locations": {f["project_id"]: build_location_layout(f) for f in loc_facts}` + `"location_default": layout("location","site_code","site_name", location_widgets())`. |
| 4.5 | `assets/app.js` `getLayoutFor` | Add `if (sliceKind==='location') return (projectLayouts && projectLayouts.locations && (projectLayouts.locations[entry.site_code] || projectLayouts.location_default)) || null;` |
| 4.6 | `assets/app.js` `renderLocationView` top (~line 2995, after `hideSliceNoData(grid)`) | Insert wrap: `var descriptor=getLayoutFor('location',entry); if(USE_RENDER_SLICE && descriptor){ renderSlice(descriptor, entry, grid); return; }` Legacy body (incl. `timeDistCard` show/hide) stays BELOW, only reached on the fallback path. `renderView` LOCATION branch (3403) UNCHANGED. |
| 4.7 | `assets/app.js` WIDGET_RENDERERS (add keys, ~line 2196) | `sub_sites: function(ctx){...}` — port renderLocationView 3000-3037 verbatim: `indexAxis:'y'`, `CHART_COLORS.sliceLocationBar`, `borderRadius:3`, `tooltipLabelSamples`, x-tick k-formatting, y-tick font size 10. Labels/data from `ctx.entry.sub_sites` (`sub_name`/`count`). `makeSliceCard`+`makeCanvas`, `id=sliceChartId(ctx,ctx.widget)`, `destroyChart(id)`, `dynamicSliceChartIds.push(id)`. |
| 4.8 | `assets/app.js` WIDGET_RENDERERS (add keys) | `time_of_day: function(ctx){ if(!ctx.entry.time_distribution || !ctx.entry.time_distribution.length) return; ... }` — port renderLocationView 3096-3134 verbatim: `CHART_COLORS.sliceTimeOfDay`, `time_period` labels, `' '+label+': '+count+' samples'` tooltip, x-title 'Time Period', y-title 'Samples'. Defensive empty guard kept (show_if already gates, belt-and-suspenders). `makeSliceCard`+`makeCanvas`+id/destroy/push. Builds its own card (the static `#slice-location-timeofday-card` is wiped by `gridEl.innerHTML=''` on the slice path — irrelevant here; only matters on fallback). |
| 4.9 | `assets/app.js` `stat_strip` line 2020-2021 | **Correction #3 fix:** `if (ctx.facts.collected) { var pct = Math.round(100*ctx.facts.sequenced/ctx.facts.collected); strip.appendChild(tile(pct+'%','Sequenced')); }` — omit the Sequenced tile entirely when no pipeline (location). Benefits any future pipeline-less project too. **Parity-safe: stat_strip is a renderer, not a fact/predicate — no oracle impact.** |
| 4.10 | `assets/app.js` `bar` renderer line 2163 | NO change — `lbl = entry[ctx.labelField]` already resolves `site_name` for location (`slice_label_field='site_name'`). Just **confirm in test** the sampler tooltip reads `site_name` (hazard 1), matching legacy line 3142. |
| 4.11 | `scripts/build_layouts.py` `visibility` branch | Extend grid to include location (keyed by site_code). Now emits all three kinds. |
| 4.12 | `assets/app.js` `verifyLayoutsOracle` | Add a location loop (`locations[e.site_code] || location_default`), kind-aware. Oracle now covers project + lab_group + location. |

### Schema edits (`data/layout-schema.json`) — folded into WS2

| # | Location | Change |
|---|---|---|
| S.1 | type enum (lines 59-63) | Add `"sub_sites"` and `"time_of_day"` to `WidgetDescriptor.type.enum`. (The four WS1 types — `grouped_bar`, `heat_strip`, `link_chip`, `bar` — are ALREADY present; verified. `slice_kind` enum already includes `location`/`lab_group`; no change.) |
| S.2 | root `properties` (lines 12-19) | Under `additionalProperties:false`, add `"locations"`, `"lab_groups"`, `"location_default"`, `"lab_group_default"` to `properties` (each: `locations`/`lab_groups` = object with `additionalProperties:{$ref:"#/$defs/LayoutDescriptor"}`; the two `*_default` = `{$ref:"#/$defs/LayoutDescriptor"}`). **Leave `required` as `["version","default","projects"]`** (new keys optional → older consumers unaffected, app.js already treats them as optional). |
| S.3 | NONE for show_if | `field_gt` + numeric `value` already valid (line 109 `value:"type":"number"`). **Do NOT** widen `value` to boolean and **do NOT** add a predicate (correction #4). |

---

## 3. Parity-preservation plan (how the oracle stays green)

**Invariant:** `compute_facts`/`eval_show_if` (Python) and `computeFactsRuntime`/`evalShowIf` (JS) stay 1:1.

**What has ZERO parity surface (WS1):** The four WS1 renderers run *after* the `show_if` gate has already decided a widget is shown. They touch no fact, no predicate, no show_if. They consume slice-entry fields (`type_pipeline_crossTab`, `tag_charts.*`, `tag_groups.*`) and `PROJECT_CONTENT` at render time. `project-layouts.json` is **NOT regenerated** in WS1 (the override widgets already exist). The `stat_strip` Sequenced-tile guard (WS2 4.9) is likewise a renderer-only change. **Conclusion: WS1 cannot drift parity by construction.** The oracle is still run as a regression check to *prove* the visible-widget grid is byte-identical to pre-change.

**What touches parity (WS2) and the lock-step rules:**
1. **Edit both ports in the same commit, byte-equivalent in logic.** The two changes are: (a) identity-field fallback `project_id||group_name||site_code` (3.1/3.2); (b) numeric fact `time_distribution_periods` (4.1/4.2). Both are mechanical; diff the two diffs.
2. **Add NO new predicate.** Reuse `field_gt` + numeric fact for time_of_day — eliminates the JS-vs-Python predicate divergence risk and the `value:number` schema constraint.
3. **Keep the existing `default`/`projects` emission byte-identical** so the already-green project parity is untouched. New kinds are *additive* top-level keys.
4. **Extend BOTH oracle ends to cover all three kinds:** `build_layouts.py visibility` grid AND `verifyLayoutsOracle()`. A migrated kind that isn't in both ships unverified. Make the JS lookup **kind-aware** (no project-default fallback for location/lab_group).
5. **The dangerous fact never gates a widget.** `stages_all_equal` computes `TRUE` for location (`0===0===0 && n>0`) identically in both ports — consistent, not a divergence. We defend by **structurally omitting** `pipeline_bar`+`completion_badge` from `location_widgets()` (not relying on the predicate), so the fact's TRUE value is inert for location.

**Green-gate procedure (run at every WS2 wave boundary):**
```
python3 scripts/build_layouts.py            # expect: schema validation: PASS; matrix 83/100 unchanged
python3 scripts/build_layouts.py visibility  # capture grid (all kinds present at the wave's stage)
# load index.html?verifyLayouts in a browser; read console VERIFY_LAYOUTS_RUNTIME_GRID
# diff JS grid vs python grid -> MUST be identical for every kind present
```
Gate the wave on an exact match. The project sub-grid must remain byte-identical to the pre-Phase-2b capture across all waves.

---

## 4. Hazard handling — Location

| Hazard | Handling (verified) |
|---|---|
| **No `pipeline` key** (10/10 location entries) | `location_widgets()` **structurally OMITS** `pipeline_bar` AND `completion_badge` (not show_if-suppressed). Build-time assert: no location layout contains ids `pipeline`/`pipeline_complete`. Rationale: `stages_all_equal=TRUE` on missing pipeline would fire `completion_badge`, which then throws on `entry.pipeline.collected` (no `pipeline`). |
| **`stat_strip` false 0% Sequenced** | Suppress the Sequenced tile when `!facts.collected` (4.9). Location has `sample_count`/`sample_types`/`sampler_type_dist` (verified), so the rest of `stat_strip` renders correctly. |
| **key ≠ label** (`site_code` `SGRC` vs `site_name` `SGRC (Sagebrush Grassland Research Center)`) | `slice_key_field='site_code'`, `slice_label_field='site_name'`. `getLayoutFor('location')` looks up by `entry.site_code`. `bar` renderer reads `ctx.labelField` (=`site_name`) for the "in <site_name>" sampler tooltip — verified line 2163 already does this; matches legacy line 3142. |
| **Optional time-of-day** | `time_of_day` widget gated by `field_gt time_distribution_periods 0`. IMPROVE (td_len=0) and Unknown (td_len=0) self-suppress; the other 8 sites (td_len=4) show it. Renderer also keeps a defensive empty-array guard. |
| **Static `#slice-location-timeofday-card` wiped** | It's a sibling INSIDE `#slice-location-grid` (verified), so `renderSlice`'s `gridEl.innerHTML=''` clears it on the slice path — the `time_of_day` renderer rebuilds its own card. The legacy show/hide only runs on the flag-off path (wrap is an early-return at the TOP of renderLocationView, so legacy DOM is touched only on the legacy path). Never delete the static card this sprint. |

**Lab-Group** carries none of these: it HAS `pipeline`, and key==label==`group_name` (verified). It is a structural project-clone, hence Wave 1.

---

## 5. De-dup decision — link_chip vs banner

**Decision: `link_chip` owns publications IN-GRID; the banner YIELDS.**

- When `USE_RENDER_SLICE` is true AND the active project's layout contains a `link_chip` widget, `updateProjectBanner` hides the links row (`linksEl.classList.add('hidden')`, after clearing it). The `link_chip` renderer draws the same chips in-grid via the shared `makeLinkChip(lk)` helper.
- For all other projects, and for the entire flag-off/legacy path, the banner keeps its links row exactly as today.
- **Single source of chip markup:** `makeLinkChip(lk)` extracted from the banner (DRY — satisfies standards.md "extract before second use"); both banner and `link_chip` call it.
- **Affected projects (verified — 5, not 3):** Fragmented Landscape, BACS, **Ice-Nucleating Particles**, **2024 Summer**, Two Towers. All five must be in the de-dup test matrix.
- **`no_fabricate`:** `link_chip` renders nothing (no empty card) when `PROJECT_CONTENT[id]` is absent or `links` empty. Caveat (correction, low-sev): all 12 PROJECT_CONTENT entries carry at least a generic `PROJECTS_PAGE` link, so the empty-guard never fires for the 5 today and every card shows at minimum a "Project page" chip. If the intent was "only when a *real* accession/DOI exists beyond the generic page," that is a DIFFERENT filter — confirm intent before coding. Current spec = show all `links`.

---

## 6. Risk register

| # | Risk | Sev | WS | Mitigation |
|---|---|---|---|---|
| R1 | `compute_facts` `p["project_id"]` KeyErrors on location/lab_group; JS port silently yields `undefined` → parity divergence | **High** | 2 | Fix both ports same commit (3.1/3.2); oracle diff all kinds; gate Wave 1 on match |
| R2 | Optimization Tests `grouped_bar` (`tag_charts.Replicate`) silently no-ops → blank gap on a LIVE project | **High** | 1 | `grouped_bar` handles `tag_charts.*` now (2.1, branch b) |
| R3 | `stat_strip` false "0% Sequenced" on every location | **Med** | 2 | Suppress Sequenced tile when `!facts.collected` (4.9) |
| R4 | `completion_badge`/`pipeline_bar` left in `location_widgets` → throws on `entry.pipeline.collected` | **Med** | 2 | Structural omission + build-time assert no location layout has ids `pipeline`/`pipeline_complete` (4.3) |
| R5 | Boolean show_if for time_of_day fails schema (`value:number`) | **Med** | 2 | Numeric `time_distribution_periods` + `field_gt 0` (4.1/4.2/S.3) |
| R6 | New top-level JSON keys break root `additionalProperties:false` → schema FAIL | **Med** | 2 | Add `locations`/`lab_groups`/`*_default` to schema `properties` same change (S.2) |
| R7 | Oracle covers `project` only; new kinds ship unverified; `default` fallback mis-attributes kind | **Med** | 2 | Extend `visibility` + `verifyLayoutsOracle`; kind-aware lookup (3.7/3.8/4.11/4.12) |
| R8 | link_chip de-dup verified on 3 of 5 projects (INP + 2024 Summer missed) | **Low** | 1 | Test all 5 (§5, §7) |
| R9 | `renderSlice` wipes static `#slice-location-timeofday-card`; flag-off rollback must still work | **Low** | 2 | Early-return wrap at TOP of renderLocationView; never delete static cards this sprint (4.6) |
| R10 | link_chip `no_fabricate` guard dead (all entries have PROJECTS_PAGE); "real DOI only" intent unmet | **Low** | 1 | Clarify intent before coding (§5); current behavior = show all links |
| R11 | heat_strip Quadrant lexical-vs-numeric sort (`Q1,Q10,Q11,Q12,Q2…`) | **Low** | 1 | `parseInt(key.slice(1),10)` sort (2.2) |
| R12 | Heat tiles pure DOM → must NOT push to `dynamicSliceChartIds` (else `destroyChart` on a non-canvas id) | **Low** | 1 | No push in heat_strip; verify in review (2.2) |
| R13 | grouped_bar rows assumed Plant/Soil/Air → wrong (Fall Plant Circle = Plant,Soil only) | **Low** | 1 | Rows from `Object.keys()`, never assumed (2.1) |
| R14 | `bar` tag_groups uses log axis → breaks on tiny counts (`{RH:2}`) | **Low** | 1 | Linear `beginAtZero` axis (1.3) |
| R15 | DRY: chip markup duplicated banner vs link_chip | **Low** | 1 | `makeLinkChip(lk)` shared helper (1.1/1.4) |

---

## 7. Per-slice browser test plan

> **Gate every step on zero console errors/warnings** (per-widget `try/catch` in `renderSlice` swallows throws into `console.warn` — a warn = a bug).

**T0 — Parity oracle (run after EACH increment; mandatory at every WS2 wave boundary).**
- `python3 scripts/build_layouts.py` → `schema validation: PASS`, matrix `83/100` unchanged.
- `python3 scripts/build_layouts.py visibility` → capture grid; project sub-grid byte-identical to pre-Phase-2b; lab_group/location grids appear at their wave's stage.
- `index.html?verifyLayouts` → console `VERIFY_LAYOUTS_RUNTIME_GRID` diffs identically vs python for every kind present.

**T1 — WS1 project hero widgets (now visible).**
- `grouped_bar / type_pipeline_crossTab`: Fall Plant Circle, Fall Plants & Soil, Spring Plants & Soil, ARDEC Pilot Study → horizontal stacked bar, one row per substrate (Fall Plant Circle = **Plant, Soil** only — confirm no phantom "Air"), 3 stages, tooltip shows counts + % sequenced.
- `grouped_bar / tag_charts.Replicate` (**R2**): Optimization Tests → rows A, B render (NOT blank). This is the regression-closer.
- `heat_strip`: Fall Plant Circle + Spring Plant Circle → Q1..Q12 tiles in **numeric order**, green ramp = % sequenced, every tile has `aria-label` with collected/sequenced counts; card spans 2 cols; no canvas created (check `dynamicSliceChartIds` does not gain a heat id).
- `bar / tag_groups.*`: Flux (Position Bottom/Top = 142/142; Replicate L/R = 2/2 — **linear axis renders the 2s**), Two Towers (height_bar), 2022 Fall CPER (position_bar) → correct counts, linear axis, `N samples` tooltip.
- `link_chip` + de-dup (**R8 — all 5**): Fragmented Landscape, BACS, Ice-Nucleating Particles, 2024 Summer, Two Towers → chips render once in-grid AND the banner links row is **hidden** for each.
- De-dup negative: a non-link_chip project (e.g. Flux, ARDEC) still shows banner links normally.
- Data-block: Spring SASS/Polycarbonate Top/Bottom + Spring Sass/VIVAS → `sampler_pipeline` grouped_bar produces **no card, no console error**.

**T2 — WS2 Wave 1 (Lab Group), 8 groups.**
- Select Lab Group category, click each of 8 groups → doughnut(types), pipeline bar (lab_group HAS pipeline), temporal, sampler (tooltip "in <group_name>"), tags render; no warnings.
- Flag-off: `USE_RENDER_SLICE=false` → legacy `renderLabGroupView` renders identically (fallback intact). Restore flag.

**T3 — WS2 Wave 2 (Location), 10 sites.**
- Select Location category, click each of 10 sites → `sub_sites` horizontal bar, doughnut(types), temporal, sampler, tags.
- **No pipeline card** appears on any site (R4); **no "0% Sequenced" tile** in At-a-glance (R3) — confirm the Sequenced tile is absent, not showing 0%.
- **Hazard 1:** on SGRC (code `SGRC`, name `SGRC (Sagebrush Grassland Research Center)`) the sampler tooltip reads the **site_name** (R-hazard-1 / 4.10).
- **Optional time-of-day:** time_of_day chart PRESENT for SGRC/CPER/ARDEC/etc (td_len=4) and ABSENT for **IMPROVE** and **Unknown** (td_len=0).
- Flag-off: `USE_RENDER_SLICE=false` → legacy `renderLocationView` + static time-of-day card show/hide still work (R9). Restore flag.

**T4 — Regression (must be untouched).**
- Global dashboard renders unchanged.
- Click a project + the CPER project_group → `renderProjectGroupView` unchanged (hard constraint: global + CPER stay untouched).
- Cycle ALL 20 projects + 10 locations + 8 lab groups once → zero console warnings (per-widget try/catch sentinel).

**T5 — `npm audit`:** N/A (no `package.json` in this repo).

---

## 8. Files touched (absolute)

- `/home/jhber/projects/broadn-web-view/assets/app.js` — CHART_COLORS (~34); banner `makeLinkChip` + de-dup (311-397); `bar` (2151-2177); `grouped_bar`/`heat_strip`/`link_chip` (2198-2200); add `sub_sites`/`time_of_day` keys + `stat_strip` 0% guard (2013-2021, 2196); `computeFactsRuntime` (1907, 1920); `getLayoutFor` (1949-1952); `renderLocationView` wrap (2995); `renderLabGroupView` wrap (3168); `verifyLayoutsOracle` (2225-2234). `renderView` (3403-3420) UNCHANGED.
- `/home/jhber/projects/broadn-web-view/scripts/build_layouts.py` — `compute_facts` (45, +time_distribution_periods); `location_widgets`/`labgroup_widgets`/`build_location_layout`/`build_labgroup_layout` (~227); `main()` out dict (~271); `visibility` branch (~277). `eval_show_if` UNCHANGED.
- `/home/jhber/projects/broadn-web-view/data/layout-schema.json` — type enum +`sub_sites`/`time_of_day` (59-63); root properties +`locations`/`lab_groups`/`location_default`/`lab_group_default` (12-19).
- `/home/jhber/projects/broadn-web-view/data/project-layouts.json` — REGENERATED by build_layouts.py in WS2 only (gains `locations`/`lab_groups`/`*_default`; `default`/`projects` byte-identical). NOT regenerated in WS1.
