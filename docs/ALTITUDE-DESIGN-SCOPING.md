---
type: project-doc
---

# BROADN Web-View — Altitude Design Scoping

**Written:** 2026-06-25 · **Branch:** main · **Author:** Claude (ORC)
**Status:** Direction chosen by Jonathan; one sub-decision (D1) open; not yet implemented.
**Supersedes:** the "altitude" sections (§3, §8 step 5) of `docs/COMPLEXITY-REVIEW-FINDINGS.md`,
whose line references and "fully stacked" framing predate the `renderSlice` refactor.

---

## 1. Decision

**Chosen model: unify navigation to a single left rail.** The left rail becomes the
*only* way to move around the dashboard. The top nav's section links are removed (brand
stays). The content pane shows one thing at a time, selected from the rail.

Rejected alternatives (recorded for posterity):
- **Finish-the-collapse** (one column, hide Explorer + reset nav on slice) — lowest effort,
  but leaves the two-nav-models conflict in place. Rejected as a half-measure.
- **Story / Explore two-surface tabs** — clean, but keeps two nav idioms (top tabs + rail).
  Rejected in favor of a single idiom.

Rationale for the single-rail choice: the genuine UX cost identified in the complexity
review was **two competing navigation models** (top section-nav vs. left slice-rail), made
worse because slicing leaves four top-nav anchors pointing at hidden sections. Option 3
removes the conflict at the root rather than patching its symptoms, and it improves mobile
(everything routes through the existing drawer instead of a cramped inline top nav).

---

## 2. Current state (ground truth, firsthand 2026-06-25)

The dashboard already does a **partial** de-stack — the findings doc's "two dashboards
fully stacked" is no longer accurate:

- `global-charts-area` (`index.html:520–807`) wraps the four narrative sections —
  **Overview, Geography, Pipeline, Data Management**. `renderView()` **hides this whole
  block when a slice is active** (`assets/app.js:3917`).
- **Three things leak through and constitute the remaining problem:**
  1. **Data Explorer** (`index.html:810–872`) sits *outside* `global-charts-area`, so it
     renders in every state — it stacks below an active slice.
  2. **Hero banner** is always shown, above everything.
  3. **Dual nav, now partly broken:** top nav = 5 anchor links driven by an
     IntersectionObserver scroll-spy (`app.js:1803–1811`); left rail = "Slice by:
     All / Project / Location / Lab Group". When a slice is active, 4 of the 5 top-nav
     anchors target hidden sections (dead links).

Relevant existing machinery we will reuse (not rebuild):
- `renderView()` state machine (`app.js:3855`) — already the single show/hide authority,
  keyed on `filterState.slice.category` / `.group`.
- Mobile drawer (`app.js:4333–4343`) + desktop rail collapse (`app.js:4493–4499`).
- Slice view `scrollIntoView` on activate (`app.js:4013`).
- The `?design` designer-mode + layout-overrides layer — **unaffected** by this work.

---

## 3. OPEN SUB-DECISION — D1: how do the STORY rail items behave?

This is the one thing still needing Jonathan's input; everything else is mechanical.

The chosen mockup shows "selected content renders here (story section OR slice view OR
explorer)" — readable as a strict single-pane swap. But the four story sections today form
a **continuous narrative scroll** that is deliberately the layperson on-ramp (findings §9:
"don't cut the public-story charts — they are the layperson on-ramp"). Splitting it into
four separate clicks would weaken that first-visit experience.

| Option | STORY rail behavior | EXPLORE rail behavior | Trade-off |
|---|---|---|---|
| **D1-a (recommended)** | STORY items **scroll-to** within one continuous narrative pane (preserves the on-ramp; reuses the existing scroll-spy to highlight the active rail item) | EXPLORE items **swap** the pane to single-view tool mode (slice view or Explorer table), hiding the story | Best of both: layperson keeps the scroll story; power user gets a focused tool. Slightly more state (two pane modes). |
| **D1-b (strict single-pane)** | Each STORY item **swaps** the pane to show only that one section | Same swap behavior | Purest "rail is the only nav," but breaks the narrative flow into 4 disconnected panes. |

**Recommendation: D1-a.** It honors the single-rail decision (the rail is still the only
nav) while keeping the narrative intact. The rest of this plan assumes D1-a; if Jonathan
prefers D1-b, only the STORY-click handler and the scroll-spy reuse change.

---

## 4. Target information architecture

```
Left rail (single nav; desktop sticky + collapsible, mobile drawer)
├─ STORY            (group header)
│  ├─ Overview       → scroll-to / show narrative pane
│  ├─ Geography      → "
│  ├─ Pipeline       → "
│  └─ Data Management→ "
└─ EXPLORE          (group header)
   ├─ All BROADN Samples  → narrative pane (the default landing state)
   ├─ Project ▸           → slice tool (group picker → slice view)
   ├─ Location ▸          → "
   ├─ Lab Group ▸         → "
   └─ Explorer            → Explorer table pane (single-view tool mode)

Top bar: BROADN brand + tagline only. No section links.
```

Default landing = "All BROADN Samples" selected → narrative pane (hero + the 4 story
sections as a scroll). This matches today's default, so first-paint behavior is unchanged.

---

## 5. Work breakdown

Single domain (FE — markup + CSS + the `renderView` state machine), one file pair
(`index.html` + `assets/app.js`). No BE/DS/data changes.

| # | Change | Files | Notes |
|---|---|---|---|
| 1 | **Rail markup:** add STORY group (4 items) above the existing EXPLORE group; add an "Explorer" item to EXPLORE | `index.html` (rail `#slice-sidebar`, ~133–210) | Reuse existing list/`aria` patterns; STORY items are `data-section` links |
| 2 | **Remove top-nav section links** (keep brand/logo/tagline) | `index.html` (`nav` 21–37) | Leaves a clean brand bar |
| 3 | **Pane-mode in `renderView()`:** introduce an explicit mode — `story` (narrative scroll) vs `tool` (slice view OR explorer). Gate `global-charts-area`, `#slice-view-container`, and `#explorer` so exactly one pane shows | `assets/app.js` (`renderView` 3855+) | Explorer now hides in story/slice modes and shows only when its rail item is active |
| 4 | **Rail click handlers:** STORY items drive story mode + scroll-to (D1-a); "Explorer" item drives explorer mode; existing slice categories unchanged | `assets/app.js` | Wire alongside existing category handlers |
| 5 | **Scroll-spy reuse:** repoint the IntersectionObserver to highlight the active **rail** STORY item instead of the removed top-nav links | `assets/app.js:1803–1811` | Only active in story mode |
| 6 | **Mobile/collapse parity:** confirm the drawer now carries both groups; selecting any item closes the drawer | `assets/app.js:4333+` | Mostly free — drawer already exists |
| 7 | **Hash routing (minor, optional):** keep `#overview`/`#explorer` deep links driving rail selection | both | Nice-to-have for shareable links; can defer |

---

## 6. Risks & mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| `renderView()` is the load-bearing state machine; a regression breaks all navigation | High | Add the pane-mode as an explicit switch with a single source of truth; keep the existing `cat===null` default path intact; browser-verify every rail item + back-to-default |
| Explorer was always-on; gating it could hide it unexpectedly | Med | Explicit "Explorer" rail item + verify it shows only in explorer mode and the table/filters/Request button still work |
| Scroll-spy repoint could leave no rail item highlighted in tool mode | Low | Disable the observer outside story mode; set `aria-current` explicitly on tool-mode items |
| Mobile drawer now the sole nav — must not trap focus or fail to close | Med | Reuse existing close/overlay handlers; verify focus return |
| Losing the top nav removes a familiar idiom for returning users | Low | "All BROADN Samples" remains the obvious home; brand stays clickable-to-top |

Out of scope (do **not** touch): the `?design` designer mode, `data.json`/`preprocess`,
the slice-widget/layout system, chart internals, the CPER bespoke page (already
data-unreachable). No build step / framework (constitution).

---

## 7. Sequencing & gates

One sprint, FE-only, through the standard pipeline (PM → Critic → UI spec → FE → audit →
REQVAL → Archivist), **one commit**, browser-verified via the established Playwright flow
(`.claude/tasks/outputs/verify-rollout-CA-20260622.md`).

Suggested rollback point: capture HEAD before dispatch. Verification checklist must cover:
land on default (story scroll intact) → each STORY item scrolls + highlights → each slice
category → a slice view renders + tooltips → Explorer item shows table + Request button →
back to All resets to story → mobile drawer drives all of it → zero console errors.

**Gate before build:** confirm **D1** (§3). Recommended = D1-a.
