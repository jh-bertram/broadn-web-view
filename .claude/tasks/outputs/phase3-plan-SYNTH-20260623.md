# Phase 3 — In-Page Designer Mode: Authoritative Synthesized Plan

**Task ID:** phase3-plan-SYNTH-20260623
**Author:** synthesis of editor-ui + persistence-coexistence plans, reconciled against the adversarial critique and re-verified against live source (`assets/app.js`, `scripts/build_layouts.py`, `data/layout-schema.json`, `data/data.json`, `data/project-layouts.json`).
**Status:** plan-only. No code written. Every decision below is grounded in a verified line reference.

---

## 0. Verification ledger (facts the plan is built on — all confirmed against source)

| Fact | Source | Status |
|---|---|---|
| Activation gate uses loose `indexOf` | `app.js:4148` `window.location.search.indexOf('verifyLayouts')` | CONFIRMED — `?design` via `indexOf` would be a substring leak (C1 valid) |
| Oracle reads `projectLayouts` directly, NOT `getLayoutFor` | `app.js:2397` `var byId = projectLayouts[layoutsKey]` | CONFIRMED (C3 valid) |
| `getLayoutFor` project branch falls back to `.default` | `app.js:1961` `projectLayouts.projects[id] || projectLayouts.default` | CONFIRMED — diverges from oracle's per-kind defaultKey handling |
| Banner link-ownership reads `projectLayouts.projects[group]` directly | `app.js:392-393` | CONFIRMED (H5 valid) — override-blind |
| `renderSlice` early-returns on `evalShowIf` | `app.js:2381` `if (!evalShowIf(...)) return;` | CONFIRMED |
| `renderSlice` resets `dynamicSliceChartIds=[]` at entry | `app.js:2377` | CONFIRMED |
| `emit()` does `f = fb[key]`, KeyError if key absent | `build_layouts.py:326` | CONFIRMED (C2 valid) |
| `emit()`/`out` location keys are normalized **site_code** (via identity coalesce) | `build_layouts.py:46` `project_id = p.get("project_id") or p.get("group_name") or p.get("site_code")`; `:308`, `:324` | CONFIRMED — location entries in data.json have **no** `project_id` (all None); `getLayoutFor` location lookup is by `site_code` (`:1967`). Override `location` map MUST key by `site_code`. |
| Location hazard-guard asserts no pipeline widgets | `build_layouts.py:312-316` | CONFIRMED |
| Schema `size` enum is exactly `["sm","md","lg"]` | `layout-schema.json:79` | CONFIRMED — cycle sm→md→lg is closed-safe |
| `WidgetDescriptor` requires only `id`+`type`; `additionalProperties:false` | `layout-schema.json:64-67` | CONFIRMED |
| Top-level requires `version,default,projects`; `additionalProperties:false` | `layout-schema.json:7-8` | CONFIRMED |
| `ShowIf` `always` predicate is valid | `layout-schema.json:112` | CONFIRMED — frozen-to-always overrides validate for free |
| Layouts fetched best-effort in `Promise.all` | `app.js:4134-4145` | CONFIRMED — overrides fetch follows the same pattern |
| Per-widget try/catch already wraps renderers | `app.js:2380-2387` | CONFIRMED — bad binding degrades to skipped card |
| Doc home for override layer exists | `docs/WIDGET-SCHEMA.md:82` "## The default descriptor + the override layer" | CONFIRMED |

**New finding (not in either plan or the critique):** location entries in `data/data.json` carry no `project_id` — they are keyed solely by `site_code`. The generator only works because `compute_facts` coalesces the identity field (`:46`). This **confirms** the override `location` map must key by `site_code`, and that the C2 KeyError guard must key by the same coalesced identity, not a raw `project_id`. This is now baked into the merge spec below.

---

## 1. Scope + decisions (with rationale)

### 1.1 Coexistence mechanism — **DECISION: Option A** (separate `data/layout-overrides.json`, merged in BOTH runtime and generator)

Adopted as recommended by both plans. Rejection rationale carried forward:

- **B (designer exports full `project-layouts.json`; generator seed-only)** — rejected. Severs the generated baseline from data. The repo treats `build_layouts.py` as authoritative and re-runs it (it overwrites the 7038-line file every run). Under B, any `data.json` change silently staleness-rots every hand-edited slice, and the matrix cross-check / divergence report (`build_layouts.py:349-371`) validates a file it no longer produced. The `?verifyLayouts` oracle becomes ambiguous (is the file machine-truth or human intent?).
- **C (embed a `_designer` block inside `project-layouts.json`)** — rejected. Wiped by the generator's whole-file `json.dump` (`:373`); also collides with the schema's top-level `additionalProperties:false` (`:8`).
- **A** — keeps two cleanly, separately-validatable artifacts: generated baseline (machine truth) + overrides (human intent), composed deterministically. This externalizes the concept the in-script `OVERRIDES` dict (`build_layouts.py:181-202`) already encodes.

**Merge granularity: per-slice WHOLE-DESCRIPTOR replacement** (not per-widget patch). When an override exists for `(kind, key)`, it supplies the complete ordered `widgets[]` + `banner` and wins entirely; absence → generated descriptor unchanged. Rationale: the designer verbs (reorder / resize / hide / add) are all naturally "here is the final array"; per-widget deep-merge would force diff math and reorder is not a per-widget concept. Whole-descriptor is trivially correct and auditable.

### 1.2 show_if-in-design model + author mental model — **DECISION: editor preserves show_if for display; export freezes kept widgets to `always`**

This reconciles the two plans' disagreement (editor-ui said "show_if preserved, never stripped"; persistence said "freeze to always on capture"). Both are right at different stages. **The single canonical rule (verbatim, shown in the toolbar help line):**

> **"In the editor you see every generated widget for this slice, each still governed by its real data rule — widgets the data currently hides appear dimmed with a 'hidden for this slice's data' badge so nothing is invisible while you arrange. The moment you Save as final, your visible set is frozen: kept widgets become unconditional (`show_if: always`), hidden widgets are dropped. A saved (overridden) slice never self-suppresses — what you arranged is exactly what publishes."**

Consequences that are now **hard constraints**, resolving critique M6:

1. The **working copy keeps each widget's original `show_if` verbatim**. The freeze to `always` happens **only** in `buildExportPayload()` / `captureOverride()`, operating on a **deep clone** of the working copy — never mutating the live working state. This is mandatory so that **Revert-to-generated restores the original conditional show_if** (an in-place freeze would corrupt revert).
2. In design mode, `renderSlice` renders **all** widgets ignoring `show_if`; the per-widget `evalShowIf` boolean is computed anyway and passed to the decorator so it can dim + badge the data-suppressed ones.
3. The **published page (no `?design`) is byte-for-byte unchanged**: non-overridden slices keep conditional `show_if` and self-suppress exactly as today; overridden slices have all-`always` widgets, so the *unchanged* `renderSlice` renders them verbatim. `renderSlice` needs **no design branch on the published path**.
4. "Hide" is **array removal into an editor-only `_removed` pool**, never a never-true predicate (which would pollute the parity oracle). Add and hide are symmetric: hide pops to `_removed`; the palette re-surfaces `_removed` widgets as "Re-add: {title}".

### 1.3 Scope = all three slice kinds

project, location, lab_group — all flow through `renderSlice`. The designer edits whichever slice is currently open (`editorState.activeSlice`). `project_group` (CPER `renderProjectGroupView`) and the global dashboard are **out of scope and untouched** — no override path, no toolbar.

### 1.4 Interaction = button controls only (no DnD)

Per-card inline controls: move-up, move-down, cycle-size (sm→md→lg→sm), hide, plus a toolbar "Add widget" palette. All real `<button>` elements, keyboard-navigable, ARIA-labelled, with an `aria-live` status region. Confirmed by the critique and locked by the human.

### 1.5 Save = export JSON to commit; autosave to localStorage draft; revert control

Static GitHub Pages has no server write path. While editing, changes autosave to a per-slice localStorage **draft** (survives reload). "Save as final" downloads `layout-overrides.json` (Blob + anchor) for the human to drop into `data/` and commit (the only PUBLISH path). "Revert to generated" clears the draft and restores the generated baseline.

---

## 2. Ordered edit map

Increments are ordered so each is independently browser-verifiable and the critique's three CRITICAL fixes land **before** any designer UI is wired. **Increments 0–2 are pure refactors/guards with zero behavior change for visitors and must be verified green before Increment 3 begins.**

### Increment 0 — Single override-aware resolution path (fixes C3 + H5; prerequisite for everything)

This is the architectural keystone: **one** function resolves a layout, and oracle + banner + render all call it. Done first, before overrides even exist, so it is a behavior-preserving refactor verifiable on its own.

| # | Location | Change |
|---|---|---|
| 0.1 | `app.js:~88` (module state, beside `projectLayouts`) | Add `let layoutOverrides = null;` |
| 0.2 | `app.js:1958` `getLayoutFor` | Prepend override lookup. Add `keyFor(kind, entry)` → `{project:entry.project_id, lab_group:entry.group_name, location:entry.site_code}[kind]` and `overrideFor(kind, entry)` → `layoutOverrides && layoutOverrides.overrides && layoutOverrides.overrides[kind] && layoutOverrides.overrides[kind][keyFor(kind,entry)]`. Body becomes `return overrideFor(kind, entry) || <existing generated branch>;`. **Whole-descriptor win.** When `layoutOverrides` is null (the only state for visitors with no committed overrides file), behavior is byte-identical to today. |
| 0.3 | `app.js:2393` `verifyLayoutsOracle` | **Refactor to resolve via `getLayoutFor`.** Replace `var byId = projectLayouts[layoutsKey]` + `byId[entry[idField]] \|\| projectLayouts[defaultKey]` with `var desc = getLayoutFor(sliceKind, entry);`. Pass `sliceKind` into `addKind`. This collapses oracle and runtime onto one path (fixes C3). **Note the pre-existing subtlety:** the old oracle used per-kind `defaultKey` and a comment claiming "no project-default fallback," but `getLayoutFor` project branch *does* fall back to `.default` (`:1961`). Routing the oracle through `getLayoutFor` makes the oracle match the **actual runtime** — this is the correct direction. (Step 5.4 verifies parity is still green after this change, since defaults are unaffected by overrides and the generated grid is what's compared.) |
| 0.4 | `app.js:392-393` banner link-ownership | Replace the direct `projectLayouts.projects[group]` read with the resolver: `var resolved = getLayoutFor('project', {project_id: group}); var linksOwnedByWidget = USE_RENDER_SLICE && resolved && resolved.widgets.some(function(w){ return w.type === 'link_chip'; });` So an override that adds/removes a `link_chip` is honored by the banner (fixes H5 — no double-render, no dropped links). |
| 0.5 | `app.js` (audit grep) | Grep `projectLayouts.\(projects\|locations\|lab_groups\)\[` — confirm the only remaining direct reads are inside `getLayoutFor` itself (the canonical resolver). Verified at plan time: matches are `:392-393` (fixed in 0.4), `:1961/1964/1967` (the resolver). After 0.2–0.4, no override-blind spot remains. |

**Increment 0 verification:** load `index.html` (no params) and `index.html?verifyLayouts` with **no** overrides file present. Render tree, banner links, and oracle grid must be identical to pre-change (overrides null ⇒ resolver returns generated). This proves the refactor is behavior-preserving before any new feature exists.

### Increment 1 — Overrides fetch + data file scaffolding (still no UI, still no behavior change without a committed file)

| # | Location | Change |
|---|---|---|
| 1.1 | `app.js:4134-4145` `Promise.all` | Add a third best-effort fetch mirroring `layoutsP`: `var overridesP = fetch('data/layout-overrides.json').then(r => r.ok ? r.json() : null).catch(() => null);` Add to `Promise.all`; in the handler `layoutOverrides = results[2] || null;`. **Never blocks** — same pattern as project-layouts.json. |
| 1.2 | `data/layout-overrides-schema.json` (NEW) | Wrapper schema. `$ref`s `layout-schema.json#/$defs/LayoutDescriptor` for each override value (DRY — descriptor contract single-sourced). `required:["version","overrides"]`; `overrides` is an object with optional `project`/`lab_group`/`location`, each `additionalProperties:{$ref:.../LayoutDescriptor}`; `additionalProperties:false` at every level. See §4.3 for exact shape. |
| 1.3 | `data/layout-overrides.json` | **Not created at plan time.** First materialized by a designer "Save as final" export, then committed by the human. Until then, absent ⇒ fetch null ⇒ zero impact. (A `.gitignore` note is NOT added — the file is meant to be committed to publish.) |

**Increment 1 verification:** with no overrides file, app loads exactly as before. Hand-author a minimal `data/layout-overrides.json` (one project, reordered, all `show_if:always`, one extra widget) and confirm that project slice reflects it while a non-overridden slice is unchanged. Delete the file; confirm clean fallback.

### Increment 2 — Generator merge + oracle skip-set + KeyError guard (fixes C2; keeps regen idempotent)

| # | Location | Change |
|---|---|---|
| 2.1 | `build_layouts.py:~19` (paths) | Add `OVERRIDES_PATH = os.path.join(ROOT, "data", "layout-overrides.json")` and `OVERRIDES_SCHEMA = os.path.join(ROOT, "data", "layout-overrides-schema.json")`. |
| 2.2 | `build_layouts.py` new `load_overrides()` | Read `OVERRIDES_PATH` if present (`os.path.exists`); validate it against `OVERRIDES_SCHEMA` via `Draft202012Validator` **before** merge (same `SCHEMA VALIDATION FAILED` + `sys.exit(1)` pattern as `:340-344`); return the parsed `overrides` dict (or `{}` if absent). Map kind→`out` key: `{"project":"projects","lab_group":"lab_groups","location":"locations"}`. |
| 2.3 | `build_layouts.py:310` (after `out` assembled, **before** hazard guard `:312`) | Call `ov = load_overrides()`. For each `(kind, mapkey)` and each `(key, desc)` in `ov.get(kind,{})`: `out[mapkey][key] = desc`. **If `key` not already in `out[mapkey]`** (override for a slice not in current data) → `print("WARN override key absent from generated output: %s/%s (included anyway)" % (kind,key))` and still set it (intent never dropped). |
| 2.4 | `build_layouts.py:312-316` hazard guard | **Unchanged but now also guards overrides** — because the merge happens before it. An override that smuggled a pipeline widget into a location now trips the existing assert. This is desirable: the palette filter (§1 / editor) prevents authoring such an override, and the generator's assert is the backstop. (No code change; the ordering in 2.3 makes it cover overrides for free.) |
| 2.5 | `build_layouts.py:323-327` `emit()` (C2 fix) | Two changes. (a) **KeyError guard:** the override may inject a key with no facts entry → `f = fb.get(key)`; `if f is None: continue` (skip from the grid — it has no conditional logic to verify; see (b)). (b) **Skip overridden keys from the parity grid:** thread an `override_keys` set into `emit` and `if key in override_keys: continue`. Build `override_keys` once as the union of all `ov[kind]` keys (normalized to the same identity space — for location that is `site_code`, which matches `out["locations"]` keys per `:46/:308`). An override is all-`always`, so it is parity-trivial; excluding it keeps the grid meaningful on the conditional baseline. Apply the skip to **all three** `emit()` calls (`:329-331`). |
| 2.6 | `build_layouts.py:335-347` schema validation | **Unchanged.** It validates the merged `out` against `layout-schema.json`. Override descriptors are ordinary `LayoutDescriptor`s with `show_if:always` (valid per `layout-schema.json:112`), so they validate for free. The **new** second validation (override wrapper vs `layout-overrides-schema.json`) lives in `load_overrides()` (2.2), running before merge. |

**Increment 2 verification:** the regen-survival test (§5.3). Critically: an override for a not-yet-in-data slice must **not** crash `build_layouts.py visibility` (the C2 KeyError) — 2.5(a) guarantees it.

### Increment 3 — Designer UI (editor module, gated, behind exact-token `?design`)

| # | Location | Change |
|---|---|---|
| 3.1 | `app.js:~90` (flags block) | Add `var DESIGN_MODE = (typeof window !== 'undefined') && new URLSearchParams(window.location.search).has('design');` **(C1 fix — exact token, never `indexOf`).** Add `var editorState = { activeSlice: null, working: {}, removed: {} };` (`working`/`removed` keyed by the slice tuple string). |
| 3.2 | `app.js:4148` (existing oracle gate) | **Optional hardening (recommended):** tighten the existing gate to `new URLSearchParams(window.location.search).has('verifyLayouts')`. Lower urgency (dev-only, no storage/render mutation) but removes the same latent looseness. After `initDashboard(...)`, add `if (DESIGN_MODE) { wireDesignMode(); }` mirroring the oracle gate. |
| 3.3 | `app.js:2374` `renderSlice` | Three **additive, DESIGN_MODE-gated** changes (all behind `if (DESIGN_MODE && editorState.activeSlice && isSameSlice(...))`, call it `editing`): (a) before the loop, if `editing`, substitute `descriptor = getWorkingCopyOrSeed(descriptor, entry)`; (b) compute `var ok = evalShowIf(widget.show_if \|\| null, facts);` then `if (!editing && !ok) return;` (so design renders all; published unchanged — when `editing` is false the line is exactly the current `:2381`); (c) capture `var before = gridEl.children.length;` before `fn(ctx)`, and after it, if `editing`, call `decorateCardsForDesign(gridEl, before, widget, idx, descriptor.widgets.length, ok)`. The `before`/after delta handles multi-card widgets (H4). |
| 3.4 | `app.js:3039/~3175/~3355` `renderProjectView`/`renderLocationView`/`renderLabGroupView` | One line each, guarded `if (DESIGN_MODE)`: set `editorState.activeSlice = {kind, key, entry, gridEl}` just before the `renderSlice` call, so the editor knows the live slice. No visitor-path change. |
| 3.5 | `app.js` new editor block (near `verifyLayoutsOracle`, the dev-only neighborhood ~`:2410`) | The whole editor module, **all functions referenced only behind `DESIGN_MODE`**: `wireDesignMode()`, `buildToolbar()`, `decorateCardsForDesign()` (H4: decorate **only the first** card in `[before, after)`; mark the rest `aria-hidden="true"` continuation cards), control handlers `moveWidget(dir)` / `cycleSize()` / `removeWidget()` / `addWidget(type)` / `retitleWidget()` (optional), `getWorkingCopyOrSeed()`, `reRenderActiveSlice()` (**must call `destroyAllSliceCharts()` before re-invoking `renderSlice`** — Chart.js leak mitigation, mirroring `:3496`), draft persistence `draftKey()`/`loadDraft()`/`saveDraft()`/`discardDraft()`/`revertToGenerated()`, `captureOverride()` + `buildExportPayload()` + `downloadExport()`, `deepClone()`, `PALETTE_CATALOG`, and a keydown handler for roving-tabindex toolbar nav. |
| 3.6 | `index.html` (optional) | No required markup. Toolbar is JS-injected into `#slice-view-container`. Optionally add `<div id="design-toolbar-mount" hidden></div>` un-hidden only in design mode. Either way visitors are unaffected. |
| 3.7 | `app.js:1979` `makeSliceCard` | No change to published rendering. Note for the decorator: `size` only distinguishes `lg` (`lg:col-span-2`); `sm`/`md` render identically today. `cycleSize` still cycles all three in the descriptor (data honest); the decorator shows a design-only size badge so the author sees the value. Visual sm/md distinction is a **separate, parity-checked, out-of-scope** decision. |

### Increment 4 — Docs

| # | Location | Change |
|---|---|---|
| 4.1 | `docs/WIDGET-SCHEMA.md:82` "## The default descriptor + the override layer" | Document the externalized override layer: the file, the two-place merge (runtime `getLayoutFor` + generator), the `show_if:always`-on-capture freeze rule, the parity-scoping (overridden keys excluded), and **the publish path (M7): commit ONLY `layout-overrides.json` and do NOT re-run the generator for routine layout edits** (regen is for data changes; regen is idempotent but balloons the 7038-line file into PR noise). Docs only; not load-bearing for runtime. |

---

## 3. Visitor-safety guarantee

A visitor (no `?design`) gets a **byte-for-byte identical published page** to today, with the sole addition that a *committed* `layout-overrides.json` changes layouts for everyone **by design** (that is the publish path) — and it contains only `LayoutDescriptor` data, no scripts, no UI.

Four hard gates, each verified:

1. **Activation predicate (C1):** `DESIGN_MODE = new URLSearchParams(location.search).has('design')` — **exact token**. `?redesign`, `?designer_notes`, a bookmarked URL containing "design" in any other key, all yield `false`. This is the single most important correction; the loose `indexOf` is never used for the design gate.
2. **Bootstrap gate:** `wireDesignMode()` is called only inside `if (DESIGN_MODE)` (3.2). With no param it never runs — no toolbar DOM, no keydown listener, no per-card decorators, no `editorState` mutation beyond the inert initial object.
3. **Render gate:** the `renderSlice` design branch (3.3) is a single `if (DESIGN_MODE && editing)` block; when false, `renderSlice` executes the **exact current code path** (`evalShowIf` honored at `:2381`-equivalent, no overlays, no working-copy substitution — `getWorkingCopyOrSeed` is never reached because `editing` is false).
4. **Storage gate:** every `localStorage` read/write lives inside a DESIGN_MODE-gated function. A visitor's storage is never touched; a stale draft in a returning author's browser is **never** read on a normal load and **never** feeds `getLayoutFor` (published rendering uses committed files only).

**No accidental-publish vector:** static host, no server write. The only way a draft becomes public is the human running "Save as final" → committing the downloaded file. The decorator (`decorateCardsForDesign`) is the sole emitter of `design-*` CSS classes and is never called without DESIGN_MODE — so **zero** `design-*` nodes appear on the published page (asserted in §5.2). Net always-present cost for visitors: one boolean + a handful of unreferenced function definitions (same footprint as the existing `verifyLayoutsOracle`).

---

## 4. Coexistence / merge spec (definitive)

### 4.1 Identity / key contract

`keyFor(kind, entry)`: `project → entry.project_id`, `lab_group → entry.group_name`, `location → entry.site_code`. This matches **both** `getLayoutFor` (`:1961/1964/1967`) **and** the generated `out` map keys, because `compute_facts` coalesces identity to `project_id | group_name | site_code` (`:46`) and the location map is built under that coalesced key (`:308`, verified equal to `site_code`). **There is exactly one key space per kind; runtime and generator agree.**

### 4.2 Runtime merge (`getLayoutFor`)

`return overrideFor(kind, entry) || <generated lookup>`. Whole-descriptor win. Downstream (`renderSlice`, the now-refactored oracle, the now-refactored banner check) is untouched because all three resolve through `getLayoutFor` (Increment 0). An override's widgets are all `show_if:always`, so `evalShowIf` passes them through unchanged on the published path.

### 4.3 `data/layout-overrides.json` shape (validated by `data/layout-overrides-schema.json`)

```json
{
  "version": "1.0.0",
  "generated_by": "designer-mode (manual export)",
  "overrides": {
    "project":   { "<project_id>": <LayoutDescriptor> },
    "lab_group": { "<group_name>": <LayoutDescriptor> },
    "location":  { "<site_code>":  <LayoutDescriptor> }
  }
}
```

Each `<LayoutDescriptor>` validates against the **existing** `layout-schema.json#/$defs/LayoutDescriptor` — **no change to the descriptor schema**. Every kept widget carries `show_if:{"predicate":"always"}` (already valid). The wrapper schema (`layout-overrides-schema.json`) is the only new schema; it `$ref`s the descriptor (single-source, DRY).

### 4.4 Generator merge (`build_layouts.py`)

After `out` is assembled (`:310`), `load_overrides()` validates the wrapper, then **replaces** `out[mapkey][key]` per override. Warn-but-include if the key is absent from generated output (intent never dropped). The merged `out` flows into the **unchanged** hazard guard (`:312`, now covering overrides), schema validation (`:336`), and `json.dump` (`:373`).

### 4.5 Dual publish paths are idempotent (the crux, resolved)

Two valid publish states, both yielding identical merged layouts:

- **Commit only `layout-overrides.json`** (recommended, M7): runtime `getLayoutFor` merges at load. `project-layouts.json` stays as last generated. Sufficient on a no-build static host.
- **Run the generator after dropping in overrides:** `build_layouts.py` bakes overrides into `project-layouts.json`. If the overrides file is also still committed, runtime merge re-applies it on top of the already-baked descriptor → **override == already-baked descriptor → no-op**. Idempotent. Proven by the regen-survival test (§5.3).

The two merges use the **same whole-descriptor-per-`(kind,key)`** replacement — no per-widget logic exists in either, so JS and Python cannot drift.

### 4.6 Parity oracle under overrides

Scoped to **generated (non-overridden)** slices in **both** the runtime oracle (Increment 0.3 routes through `getLayoutFor`, and overridden keys are all-`always` so their grid entry is the full widget list either way) and the Python `emit()` (2.5(b) `override_keys` skip). The oracle's purpose — verify the **generator's conditional `show_if` rules** match between Python and JS — applies only to generated slices; overrides have no conditional logic to verify. The skip is applied symmetrically so the two grids stay diffable.

### 4.7 show_if freeze — exact mechanism (M6)

`captureOverride(workingDescriptor)`:
1. `var clone = deepClone(workingDescriptor);` — **operate on the clone, never the live working copy.**
2. For each widget in `clone.widgets` that the author KEPT visible: set `widget.show_if = {"predicate":"always"}`.
3. Widgets the author HID are already absent from `clone.widgets` (they live in `editorState.removed`).
4. Whitelist-serialize each widget to schema fields only: `id, type, title?, size?, binds_entry?, show_if, data_binding?, annotations?` — strips all editor-internal keys.
5. Result is the override `LayoutDescriptor`. The **working copy retains original `show_if`** so `revertToGenerated()` restores the true generated descriptor via `getLayoutFor` against `layoutOverrides`-minus-this-key (or the generated map directly).

---

## 5. Risk register

| ID | Risk | Severity | Owner | Mitigation | Verified-by |
|---|---|---|---|---|---|
| C1 | `indexOf('design')` activates designer for any visitor URL containing "design" → toolbar, storage writes, show_if bypass leak | **Critical** | editor | Exact-token `URLSearchParams(location.search).has('design')` (3.1). Optionally tighten `verifyLayouts` likewise (3.2). | §5.2 visitor-safety + a `?redesign` negative case |
| C2 | Override for a not-yet-in-data slice crashes `build_layouts.py visibility` (`fb[key]` KeyError `:326`) | **Critical** | persistence | `fb.get(key)` + `continue`; thread `override_keys` skip-set into all 3 `emit()` calls (2.5) | §5.3 regen + a deliberate phantom-key override |
| C3 | Oracle (`:2397`) and banner (`:392`) read `projectLayouts` directly, bypassing override merge → parity & banner divergence | **Critical** | both | One override-aware resolution path: oracle + banner + render all call `getLayoutFor` (Increment 0) | §5.4 parity + §5.5 banner roundtrip |
| H4 | Multi-card `tag_groups` `bar` widget (`:2174` loop) gets N control clusters + ambiguous reorder focus restore | **High** | editor | Decorate **only the first** card in `[before, after)`; mark continuation cards `aria-hidden`; controls operate on the widget (array entry), not sub-cards (3.3/3.5) | §5.6 multi-card edit |
| H5 | Override add/remove of `link_chip` double-renders or drops banner links (`:392`) | **High** | persistence | Route the `:392` check through `getLayoutFor` (0.4) | §5.5 banner roundtrip |
| M6 | show_if "preserved vs frozen-to-always" seam confuses author; an in-place freeze breaks revert | **Medium** | both | Freeze in `captureOverride`/`buildExportPayload` on a **clone only**; working copy keeps real show_if; one-sentence toolbar rule (§1.2/§4.7) | §5.7 revert-after-edit |
| M7 | Regenerating the 7038-line `project-layouts.json` buries one-slice override edits in PR noise | **Medium** | persistence/docs | Doc: commit **overrides-only** for layout edits; regen only for data changes (4.1 doc) | doc review |
| Sch | Duplicate widget `id` from "Add" silently false-passes the id-keyed oracle grid | **Medium** | editor | `addWidget` assigns `type + '_' + nextSeq`, collision-checked against **both** current `widgets[]` ids **and** the `_removed` pool | §5.8 add-dedup |
| Chart | Chart.js instance leak on per-edit re-render | **Low** | editor | `reRenderActiveSlice()` calls `destroyAllSliceCharts()` before `renderSlice` (mirrors `:3496`); `renderSlice` resets `dynamicSliceChartIds=[]` (`:2377`) | §5.9 chart-leak |
| Loc | Location override authored against `project_id` instead of `site_code` would silently never resolve | **Medium** | both | Key contract fixed to `site_code` for location in §4.1 (matches `:46/:308/:1967`); export builds the override under `keyFor` so it is always correct by construction | §5.10 location roundtrip |
| Clone | `structuredClone` unavailable in an older authoring browser | **Low** | editor | `deepClone()` = `structuredClone` if present else `JSON.parse(JSON.stringify())`; descriptors are pure JSON so lossless | covered by all edit tests |
| Stale | Stale localStorage draft confuses returning author or leaks to publish | **Low** | both | Drafts read **only** in design mode, never feed `getLayoutFor` on normal load; `draftKey()` namespaced `broadn:layout-draft:v1:{kind}:{key}`; revert clears it | §5.2 (no-leak) + §5.7 (revert) |

---

## 6. Add-widget palette catalog (per kind)

`PALETTE_CATALOG` (SCREAMING_SNAKE_CASE) maps `slice_kind → [WidgetDescriptor template]`. Every template is a complete, schema-valid descriptor with `show_if:{"predicate":"always"}` (overrides are unconditional), `size:"md"` unless noted, and a `data_binding.source` matching what its renderer reads. The UI offers `PALETTE_CATALOG[kind]` minus types whose `id` is already present (dedupe by id; `caption`/`bar`/`stat_strip` are repeatable and filtered by type-allows-multiple, not presence), plus any `_removed` widgets as "Re-add: {title}".

**project** (and **lab_group** — same set; lab_group is a project-clone WITH pipeline): `doughnut`(sample_types), `pipeline_bar`(pipeline), `completion_badge`(pipeline), `temporal_bar`(temporal, transform group_by_year), `bar`(sampler_type_dist, transform sort_desc, denominator sample_count), `grouped_bar`(type_pipeline_crossTab, transform crosstab), `heat_strip`(tag_charts.Quadrant, size lg), `badge_row`(tag_groups), `stat_strip`(sample_count), `caption`. **project additionally:** `link_chip`(PROJECT_CONTENT.publications, size sm). **lab_group EXCLUDES `link_chip`** (generator's labgroup baseline has none — `build_layouts.py:232-235`). **Both EXCLUDE `sub_sites`, `time_of_day`** (location-only).

**location:** `doughnut`(sample_types), `temporal_bar`(temporal), `bar`(sampler_type_dist), `badge_row`(tag_groups), `stat_strip`(sample_count), `caption`, `sub_sites`(sub_sites), `time_of_day`(time_distribution). **HARD-EXCLUDED for location:** `pipeline_bar`, `completion_badge`, `grouped_bar` (pipeline-derived; location has no pipeline — mirrors the structural omission at `build_layouts.py:241-245` and the assert at `:312-316`), and `link_chip`. The palette filter enforces this exact exclusion so the designer cannot author an override the generator's own assert would reject.

---

## 7. Schema changes

- **`data/layout-schema.json` (LayoutDescriptor/WidgetDescriptor/ShowIf $defs): NONE.** Overrides are ordinary `LayoutDescriptor`s; the only practical effect of the freeze is `show_if:{"predicate":"always"}`, already valid (`:112`). The existing merged-`out` validation (`build_layouts.py:336-345`) validates override descriptors for free.
- **`data/layout-overrides-schema.json`: NEW** (wrapper only). `required:["version","overrides"]`; `overrides` object with optional `project`/`lab_group`/`location`, each `additionalProperties:{$ref:"layout-schema.json#/$defs/LayoutDescriptor"}`; `additionalProperties:false` everywhere. `$ref` keeps the descriptor single-sourced (DRY — no copied descriptor schema).
- **Editor-internal state** (`_removed` pool, draft metadata, working-copy bookkeeping) lives only in localStorage / runtime objects and is whitelist-stripped by `buildExportPayload` (§4.7 step 4) before export. Nothing editor-only ever reaches a committed file or either validator.

---

## 8. Browser test plan (no build step; every item browser- or CLI-verifiable)

Ordered to match the increments; the four mandated tests are flagged.

**T0 — Increment-0 behavior preservation (refactor safety).** With **no** overrides file: load `index.html` and `index.html?verifyLayouts`. Confirm render tree, banner links, and `VERIFY_LAYOUTS_RUNTIME_GRID` are identical to a pre-change capture (resolver returns generated). Proves Increment 0 is behavior-preserving.

**5.1 — Activation.** `index.html?design` → toolbar with Save-as-final / Discard / Revert / Exit + status pill; every widget card shows move-up/down, cycle-size, hide controls.

**5.2 — Visitor-safety [MANDATED: no `?design`].** (a) `index.html` (no params): a slice renders identically to pre-change; `document.querySelectorAll('[class*="design-"]').length === 0`; no `#design-toolbar`; no extra keydown listener. (b) **C1 negative:** `index.html?redesign` and `index.html?notes=design` → `DESIGN_MODE === false`, no toolbar, no `design-*` nodes, localStorage untouched. (c) Seed a stale draft in localStorage, load with no params → published page ignores it entirely.

**5.3 — Regen-survival [MANDATED].** Hand-create `data/layout-overrides.json` with one project override (reordered, extra widget, all `show_if:always`). (a) `python3 scripts/build_layouts.py` → `schema validation: PASS`; the overridden key in regenerated `project-layouts.json` **byte-equals** the override descriptor; all other keys byte-identical to a pre-override regen (`diff`). (b) Re-run again → idempotent (no diff). (c) **C2 phantom-key:** add an override for a fake `project_id` not in data.json → `build_layouts.py visibility` prints the WARN and **does not crash** (KeyError guard), and the phantom key is excluded from the grid.

**5.4 — Parity oracle [MANDATED].** `index.html?verifyLayouts` → capture `VERIFY_LAYOUTS_RUNTIME_GRID`; `python3 scripts/build_layouts.py visibility` → capture grid; `diff`. Generated (non-overridden) keys match exactly; overridden keys excluded from **both** grids (skip applied symmetrically). Confirms C3 fix: oracle and runtime now share `getLayoutFor`.

**5.5 — Export-roundtrip [MANDATED] + banner (H5).** In `?design` on a project slice: reorder, cycle a size, add a widget, hide one, **add a `link_chip`** → Save-as-final downloads `layout-overrides.json` (Blob + anchor; filename includes kind+key+date). Validate the payload: `python3 -c "import json,jsonschema; jsonschema.Draft202012Validator(json.load(open('data/layout-overrides-schema.json'))).validate(json.load(open(DOWNLOADED)))"` → passes. Drop it into `data/`, reload **without** `?design`: the authored order/size/added widget render; the banner does **not** double-render links (H5 — banner yields to the in-grid `link_chip` via the resolver). Remove the `link_chip` in a second edit → links render in the banner, not twice and not nowhere.

**5.6 — Multi-card widget (H4).** Open a slice with a `tag_groups` `bar` widget (multiple populated groups → N sub-cards). Confirm only the **first** sub-card carries controls; continuation cards are `aria-hidden`. Move the widget up/down → all sub-cards move as a unit; focus restores to the first sub-card's control. Cycle size → one size value on the descriptor; hide → all sub-cards removed together.

**5.7 — Revert + show_if freeze (M6).** Edit a slice that has a data-suppressed widget (renders dimmed + "hidden for this slice's data" badge in design mode). Promote it (keep visible), Save-as-final → exported widget has `show_if:always`. Then Revert-to-generated → working copy restores the **original conditional** `show_if` (dimmed badge returns), draft cleared, override entry removed. Confirms the freeze happened on a clone, not the live copy.

**5.8 — Add-dedup (Sch).** Add two widgets of the same repeatable type → distinct ids (`type_1`, `type_2`); confirm no id collision against current widgets or the `_removed` pool. Then `?verifyLayouts` → the slice's grid lists distinct ids (no silent id merge).

**5.9 — Chart-leak (Chart).** Edit a slice 10+ times → no console errors; Chart.js instance count does not grow unbounded (`destroyAllSliceCharts()` runs before each re-render).

**5.10 — All-three-kinds + location key (Loc).** Repeat 5.3/5.5 for a **location** override (assert the palette/merge rejects pipeline widgets — the generator's location assert `:312-316` still passes) keyed by `site_code`, and a **lab_group** override keyed by `group_name`. Confirm both resolve and render.

**5.11 — Schema-negative.** Feed a malformed override (bad widget `type` enum) → `build_layouts.py` exits `SCHEMA VALIDATION FAILED` against `layout-overrides-schema.json` **before** writing `project-layouts.json`.

**5.12 — Legacy fallback + out-of-scope untouched.** Set `USE_RENDER_SLICE=false` → overrides ignored, legacy renderers run, no errors. Confirm global dashboard + CPER `renderProjectGroupView` are unaffected (no override path for `project_group`).

**5.13 — A11Y.** Tab through all controls keyboard-only (toolbar `role=toolbar` + roving tabindex; every control a real `<button>` with `aria-label` like "Move {title} up" / "Cycle size, currently md" / "Hide {title}" / "Add widget"; suppressed badge `aria-describedby` on the card; `aria-live=polite` status announces "Moved up" / "Size now lg" / "Widget hidden" / "Draft saved"). Run an axe/Lighthouse pass for WCAG-AA contrast on toolbar + badges.

---

## 9. Increment order (summary)

0. **Override-aware single resolution path** (getLayoutFor + oracle refactor + banner refactor) — fixes C3/H5, behavior-preserving, verify T0.
1. **Overrides fetch + wrapper schema** — best-effort, verify with a hand-authored file.
2. **Generator merge + oracle skip-set + KeyError guard** — fixes C2, verify regen-survival (5.3) + phantom-key.
3. **Designer UI** (exact-token `?design`, working-copy editor, decorator, palette, draft/export/revert) — fixes C1/H4/M6/Sch, verify 5.1–5.10/5.13.
4. **Docs** (WIDGET-SCHEMA.md override layer + M7 publish-path guidance).

**Gate discipline:** Increments 0–2 (the three CRITICAL fixes) must verify green before Increment 3 wires any UI. C1 lands as the first line of Increment 3. H4/H5/M6/Sch are closed within their increments before audit.
