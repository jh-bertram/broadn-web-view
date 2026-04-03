# Post-Mortem: Studio Clarity UI Refresh
**Date:** 2026-04-02
**Project:** `/home/jhber/projects/broadn-web-view/index.html`
**Duration:** ~3 hours (UI Designer → FE → Audit → Remediation → Re-audit → Archive)
**Final State:** All six Style C changes shipped, audited (SA/QA/SX PASS), committed, and pushed to `sprint/broadn-p1-2026-03-22`.

---

## 1. Original Request

**Human (2026-04-02):** Design and implement Style C "Studio Clarity" for the BROADN Aerobiome Dashboard — Inter font, collapsible sidebar, KPI SVG icons, active filter chip, nav scroll shadow, and table styling refinements. Preceded by a planning session that established `DESIGN.md` v1.0.0 as the token source of truth.

**Brief file:** No formal PM task spec — main session acted as PM. Scope was decomposed directly in conversation.

**Scope at intake:**
- `DESIGN.md` did not exist — created as prerequisite (init mode, v1.0.0)
- `index.html` had: Helvetica/Arial font, emoji KPI icons, always-visible sidebar, full-area orange filter tint, no nav scroll shadow, unstyled table rows
- Nothing else in the repo needed touching (no backend, no data schema changes)

**Skill invoked:** None — main session routed UI Designer → FE → Auditor directly.

---

## 2. Agent Activity Log

### Studio Clarity — (`studio-clarity`)

| Seq | Timestamp | Event | Agent | Notes |
|-----|-----------|-------|-------|-------|
| 2 | 2026-04-02T14:00Z | COMPLETE | UI#1 | Design spec written; flagged KPI Card 3 as "Active Since" not temp; `inert` accessibility requirement explicit |
| 3 | 2026-04-02T15:00Z | COMPLETE | FE#1 | All 6 changes implemented; noted two minor deviations (DNA icon paths, cursor:pointer vs default) |
| 4 | 2026-04-02T~15:30Z | AUDIT_FAIL | AUDITOR#1 | SA PASS; QA FAIL — one blocker; SX skipped per protocol |
| — | 2026-04-02T~15:45Z | REMEDIATE | MAIN | Direct Edit on line 206 + JS toggle overflow logic added |
| 5 | 2026-04-02T~16:00Z | AUDIT_PASS | AUDITOR#reaudit | QA + SX PASS |
| 7 | 2026-04-02T18:00Z | COMPLETE | AR#1 | Archive entry + SESSION-CHECKPOINT updated |

**Feedback loops:** 1 — `overflow: hidden` static inline style broke sidebar scroll; fixed with dynamic JS overflow management + removal of static declaration.

**Root cause of failure:** FE added `overflow: hidden` to the `<aside>` inline style attribute to clip content during the collapse animation. Inline styles have higher specificity than Tailwind utility classes, so this silently overrode `overflow-y-auto` in the expanded state. The sidebar appeared correct at full width but lost scrollability. The correct approach — noted in the auditor's remediation guidance — was to set overflow dynamically in the JS toggle only during the collapse phase, then clear it after the 200ms transition on expand.

This is a well-known Tailwind CDN footgun: `style="..."` always wins over `class="..."`, so any inline style added for animation purposes must be treated as temporary state, not a permanent attribute.

**Deviation from original scope:** None. All 6 changes delivered as specified.

---

## 3. Post-Delivery Runtime Bugs

None identified. Push was clean; re-audit confirmed correctness after remediation.

---

## 4. QA Gap Analysis

**Current QA protocol:** Auditor performs static code review — reads the modified file, checks class names, attribute values, and JS logic against the spec and DESIGN.md. No live browser execution.

**What this caught:**
- Inline style specificity conflict overriding Tailwind class (the blocker)
- All six changes' accessibility attributes (aria-expanded, aria-controls, aria-live, inert)
- Three raw hex values in nth-child CSS traced to DESIGN.md tokens (permitted exception documented)
- `cursor: pointer` vs spec's `cursor: default` — auditor made the correct call (pointer is right given existing JS click handlers)
- DNA icon SVG path structural equivalence confirmed

**What this missed:**
- Nothing missed — the one real defect was caught. However: the auditor explicitly noted it could not run Playwright because there is no dev server (`no package.json in this repo`). For a vanilla HTML file, `python3 -m http.server` would have enabled live visual inspection. The auditor did not attempt this alternative.

**Recommendations:**
1. **Add a vanilla-server fallback to auditor protocol:** when `package.json` is absent but an `index.html` is present, attempt `python3 -m http.server <port> &` and run Playwright against `http://localhost:<port>`. This enables scroll behavior, animation, and JS-driven state to be verified visually — things static analysis cannot catch.
2. **FE pre-flight check for inline + Tailwind conflicts:** before submitting, grep for any `style="..."` attributes on elements that also carry a Tailwind class covering the same CSS property. Flag these for review. A `style="overflow:..."` on an element with `overflow-y-auto` is the canonical failure pattern.

---

## 5. Agent Performance Summary

| Agent | Tasks | First-pass rate | Notes |
|-------|-------|----------------|-------|
| UI Designer | 1 spec | 100% | Proactively flagged the `inert` accessibility requirement and the KPI Card 3 label ambiguity before FE started |
| Frontend Engineer | 1 implementation | 0% (1 QA fail) | Correct on 5 of 6 changes; missed the inline/Tailwind specificity conflict on the sidebar |
| Code Auditor | 2 audits | — | Caught the blocker on first pass; provided exact remediation instructions including the dynamic JS approach |

**Most impactful single agent action:** The UI Designer's pre-emptive call-out of `inert` as a required accessibility attribute for the collapsed sidebar. Without this, the sidebar's hidden content would have remained in the keyboard tab order — the kind of bug that passes visual QA and only surfaces in accessibility testing.

**Recurring failure pattern:** None — this is the first inline/Tailwind conflict seen across all broadn sprints. Worth watching in future vanilla HTML work.

---

## 6. Protocol Gaps Identified

| Gap | Impact | Suggested fix |
|-----|--------|---------------|
| Auditor cannot run Playwright on vanilla HTML repos (no `npm run dev`) | Scroll behavior, JS-driven animation states, and dynamic CSS cannot be verified live | Add a fallback to auditor spec: if `index.html` exists and no package.json, spin up `python3 -m http.server` and run Playwright against localhost |
| FE has no pre-flight check for inline style / Tailwind class property overlap | Inline `style="overflow:hidden"` silently overrode `overflow-y-auto`; required an audit cycle to catch | Add to FE spec: before submitting, grep for `style=".*overflow` on elements with `overflow-*` Tailwind classes; any match is a blocking review |
| No PM task spec created (main-session-as-PM) | Sprint has no `.claude/tasks/{id}.md`, so task packet is unrecoverable from event log | Acceptable for simple single-domain UI tasks — document this as an intentional routing pattern; consider a lightweight task stub the main session writes before spawning agents |

---

## 7. Final Deliverable State

**App/Service:** `/home/jhber/projects/broadn-web-view/index.html`
**Build:** N/A — vanilla HTML, no build step
**Runtime:** No known issues; all changes confirmed by static audit + re-audit after remediation

**Features delivered:**
- Inter font (`"Inter", system-ui, -apple-system, Helvetica, Arial, sans-serif`) via Google Fonts CDN
- Sidebar collapse toggle: 44px button, `aria-expanded`/`aria-controls`/`inert`, 200ms CSS width transition, dynamic overflow management (clip on collapse, restore on expand after 200ms)
- KPI SVG icons: inline lucide paths for bar-chart-2 (samples), map-pin (sites), calendar (active since), dna (DNA yield); DESIGN.md halo palette applied correctly per metric type
- Active filter chip (`#slice-active-chip`, `aria-live="polite"`) replacing full-area `.filter-active-envelope` tint; chip wired to all three `renderView()` branches
- Nav scroll shadow: passive IIFE scroll listener, runs once on load for scroll-position restoration
- Table: alternating rows via nth-child CSS in inline style block; `rounded-lg border-stone-200` wrapper; `bg-stone-100 text-stone-600 text-xs font-semibold uppercase tracking-wide` thead

**Key contracts:**
- `DESIGN.md` v1.0.0 is the authoritative token source — all future UI sprints must read it before producing design specs or implementation
- KPI palette is fixed: green=samples, blue=geography, amber=environment/time, purple=biology — do not reassign
- `nth-child` table row colors must remain in the inline CSS block (not Tailwind classes) — Tailwind CDN cannot process dynamic pseudo-selectors
- The sidebar collapse toggle is desktop-only; the mobile overlay pattern (`#slice-sidebar-overlay`) is a separate system and was not touched
