# Task: broadn-p11-feedback-widget-teal (QUEUED — next sprint)

> **Queued 2026-06-25** as the follow-on to `broadn-p10-design-implementation`. Completes the BROADN
> teal rebrand on the one rendered surface P10 left out: the feedback widget (P10 was scoped to
> `index.html` / `assets/app.js` / `assets/styles.css` only). SHIPS CODE → full pipeline.

**Human request:** Rebrand the feedback widget from CSU green to BROADN teal so the rebrand is complete on every rendered surface.

**Routing:** full pipeline (PM → Critic → UI/FE → audit → archivist). Single-domain (FE/CSS) — likely one implementing task; UI designer only needed if a token decision is non-mechanical (it isn't — DESIGN.md v2 already defines every target value).

**Files in scope (exactly two — both untouched by P10):**
- `assets/feedback-widget.css` (11.9 KB — 24 CSU-green token occurrences)
- `assets/feedback-widget.js` (23.8 KB — 1 occurrence: inline `style="color:#15803d"` on the success-check SVG at line 30)

**Out of scope:** the three P10 files (already teal); the widget's behavior/markup structure; any layout/position change. Color-token migration ONLY.

## Where the feedback affordances are placed (for scoping)
1. **Per-component trigger icons** — a speech-bubble SVG (`SVG_BUBBLE`, feedback-widget.js:24) injected onto each card/chart/section. CSS placement:
   - bordered cards: `position:absolute; top:-4px; right:-4px` (corner-overlapping, `.fb-trigger`)
   - chart cards (no border): inset `top:8px; right:8px` (`.chart-card` variant, css:38-42)
   - Rest color `var(--color-green-800)` (css:47); green-700 focus outline; green-100 hover bg.
2. **Floating launcher (FAB)** — fixed pill at `bottom:24px; right:24px; z-index:60` (css:74-77); `bg green-800` (css:85), green-700 hover (css:96), green-900 active (css:105). This is the standalone "Leave feedback" pill the P10 auditor flagged.
3. **Popover form** — green focus rings/borders on inputs (css:284-392); the green success-check SVG (`SVG_CHECK`, js:30, inline `#15803d`).

## Token migration map (consume DESIGN.md v2 — values already defined)
| v1 (CSU green) | v2 (BROADN teal) | v2 token | widget roles |
|---|---|---|---|
| `#166534` green-800 | `#0c5454` deep teal | `--color-primary` | trigger icon color, FAB bg |
| `#15803d` green-700 | `#0e7474` mid teal | `--color-primary-mid` | hover bg, focus outlines, input focus border/ring, success-check SVG |
| `#14532d` green-900 | `#083838` darker teal | `--color-primary-dark` | FAB active/pressed |
| `#dcfce7` green-100 | `#ccefef` light teal | `--color-primary-light` | trigger hover bg |

Note: prefer wiring to the DESIGN.md v2 CSS custom properties (`--color-primary*`) where the widget already
uses `var(--color-green-800)` etc., rather than hardcoding hexes, so future brand shifts are single-source.
The widget currently references `--color-green-*` vars (legacy names) — confirm whether those vars still
resolve post-P10 or need re-pointing/aliasing to the `--color-primary*` set.

## Success criteria (mechanical)
- `grep -Ec '#166534|#15803d|#14532d|#dcfce7' assets/feedback-widget.css` == 0
- `grep -c '#15803d' assets/feedback-widget.js` == 0 (success-check SVG → mid teal or `currentColor`)
- No `--color-green-800/700/900` literal green left rendering; teal present.
- WCAG: the FAB is a filled button with white text on teal — deep teal `#0c5454` bg gives white-on-teal ~9:1 (AA). Trigger icons as small UI glyphs use ≥3:1 non-text (deep teal on stone passes). Verify per DESIGN.md v2 WCAG note.
- AUD screenshot-verifies the FAB + a trigger icon + the popover focus state render teal on the live render (`python3 -m http.server 8771`).

## Pre-flight notes
- DESIGN.md v2 is the source of truth (shipped in P10, commit `0cba237`).
- No new design decisions required — this is a mechanical token swap against an existing spec, so the Critic gate should be light and UI-designer may be skippable (PM's call).
- Not pushed: P10 commits `0cba237`/`c14d67b` sit on `main` unpushed; this sprint stacks on top.
