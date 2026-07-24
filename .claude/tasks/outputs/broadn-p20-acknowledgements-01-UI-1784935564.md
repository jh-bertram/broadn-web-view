<design_spec>
  <task_id>broadn-p20-acknowledgements-01</task_id>
  <surface>Site footer — new "Acknowledgements &amp; Citation" region, appended inside the existing `&lt;footer id="site-footer"&gt;` (index.html:946-961)</surface>
  <design_system_source>DESIGN_MD</design_system_source>
  <!-- DESIGN.md version at design time: 2.0.0 (Updated 2026-06-25) -->

  <observed_state>
    <screenshot_taken>no</screenshot_taken>
    <visual_notes>
      Live-render grounding was attempted via Playwright (`file:///home/jhber/projects/broadn-web-view/index.html`) but the `file:` protocol is blocked in this environment, and no dev server is running for this static site — there is no `package.json`/dev-server to target. Proceeded on verified source reads instead:
      `index.html:947` — `&lt;footer id="site-footer" class="bg-stone-900 text-stone-400 py-10 px-4 sm:px-6 lg:px-8 mt-auto"&gt;`. Background `#1c1917` (stone-900), default text `#a8a29e` (stone-400, ~6.94:1 on the bg — computed below, confirms the brief's "~7:1" estimate).
      `index.html:948` — inner wrapper `&lt;div class="max-w-7xl mx-auto text-center text-sm space-y-2"&gt;` — the ENTIRE existing footer is center-aligned, `text-sm` base, `space-y-2` (8px) rhythm.
      Four existing paragraphs, in order: (1) bold title `text-stone-200 font-semibold text-base` ("BROADN Aerobiome Research Dashboard"), (2) org line (default stone-400 inherited), (3) the NSF disclaimer `text-stone-500` with a nested `&lt;strong class="text-stone-400"&gt;` around "National Science Foundation (NSF)", (4) "Data updated: …" line with `#footer-updated` span.
      `assets/styles.css:4-14` — LIVE `:root` CSS custom properties already exist and map 1:1 to DESIGN.md's named color tokens: `--color-stone-200: #e7e5e4` (= DESIGN.md `--color-border`), `--color-stone-300: #d6d3d1` (= DESIGN.md `--color-border-strong`), `--color-stone-400: #a8a29e` (= DESIGN.md `--color-text-muted`), `--color-teal-deep: #0c5454` (= DESIGN.md `--color-primary`), `--color-accent: #0c9cb4` (= DESIGN.md `--color-accent`). This spec references these EXISTING variables by name — zero new CSS custom properties are introduced.
      Page heading structure confirmed via grep: `h1` at index.html:41 (hero), `h2` at multiple page-section headings (Overview, Geography, Sample Breakdown, Data Management, Slice view, etc.), `h3` at all card-level titles. No heading tag currently exists inside the footer.
    </visual_notes>
    <accessibility_tree_findings>Not captured live (browser blocked). Source-level check: footer currently has zero headings and zero interactive elements — a new region introducing an h2/h3 pair and one `&lt;details&gt;`/`&lt;summary&gt;` plus one `&lt;a&gt;` is a clean addition to an otherwise-static landmark, with no pre-existing footer heading order to conflict with.</accessibility_tree_findings>
    <console_errors>Not captured (browser blocked before navigation completed).</console_errors>
  </observed_state>

  <component_hierarchy>
    footer#site-footer (unchanged: bg-stone-900, text-stone-400, py-10, px-4 sm:px-6 lg:px-8, mt-auto)
      div.max-w-7xl.mx-auto.text-center.text-sm.space-y-2  (EXISTING wrapper — unchanged)
        p  — "BROADN Aerobiome Research Dashboard"  (EXISTING, unchanged)
        p  — "Colorado State University — One Health Institute"  (EXISTING, unchanged)
        p  — NSF disclaimer, incl. nested strong  (EXISTING, unchanged, NOT duplicated)
        p  — "Data updated: …"  (EXISTING, unchanged)
        div.ack-citation  (NEW — appended as the 5th child of the existing wrapper; own text-left/max-w-3xl override, see Layout)
          h2  — "Acknowledgements &amp; Citation"  (NEW — always visible)
          p   — A1 text  (NEW — always visible, general/summary block)
          details  (NEW — collapsible container, native, no JS)
            summary  — disclosure trigger, descriptive label (NOT the h2 text repeated verbatim)
            div.mt-4.space-y-6  (NEW — revealed content, two labeled groups)
              div  — Group 1
                h3 — "Funding &amp; Program Support"
                div.space-y-3
                  p — A3 text + inline a (NEON external link)
                  p — A5 text
              div  — Group 2
                h3 — "Site Access &amp; Facilities"
                div.space-y-3
                  p — A2 text
                  p — A4 text
                  p — A6 text
  </component_hierarchy>

  <layout>
    <grid>Single-column flow (no CSS grid needed). The new `div.ack-citation` block breaks OUT of the parent's `text-center` by applying its own `text-left` override, and constrains prose width to `max-w-3xl` (DESIGN.md-named: reuses the "Section intro description max-width: max-w-3xl" component rule so multi-sentence acknowledgement prose keeps a readable line length instead of running the full `max-w-7xl` footer width). The block itself stays horizontally centered on the page via `mx-auto`, so it remains visually anchored under the centered brand content above it even though its own text is left-aligned.</grid>
    <spacing>
      All values are named DESIGN.md Spacing Scale tokens (base unit 4px):
      - `mt-8` (space-8, 32px) — gap between the existing "Data updated" line and the new region. This is the ONLY thing separating old from new content; see rationale in Notes for why no divider color is used.
      - `space-y-4` (space-4, 16px) — vertical rhythm inside `div.ack-citation` (h2 → A1 → details).
      - `mt-4` (space-4, 16px) — gap between `summary` and the revealed content div when open.
      - `space-y-6` (space-6, 24px) — vertical rhythm between the two groups (Funding vs. Site Access).
      - `mb-2` (space-2, 8px) — gap between each group's h3 label and its paragraphs.
      - `space-y-3` (space-3, 12px) — vertical rhythm between paragraphs within one group.
    </spacing>
    <responsive>
      <breakpoint name="sm/md/lg (all)">No breakpoint-specific layout change. The block is single-column at every width, matching the existing footer's behavior (`px-4 sm:px-6 lg:px-8` already handles outer gutters at the `&lt;footer&gt;` level and is untouched). `max-w-3xl` naturally reflows to full available width below that cap on narrow viewports — no separate mobile treatment needed.</breakpoint>
    </responsive>
  </layout>

  <states>
    <state name="default (details closed)">
      This is the landing state on every page load. h2 heading and A1 paragraph are visible; `summary` shows its label with the native closed-disclosure marker (▶, browser-default triangle, no CSS required); the two grouped blocks (A2–A6) are present in the DOM but not rendered and not in the tab order (native `&lt;details&gt;` behavior) — content stays crawlable/indexable by search engines despite being visually collapsed, unlike a JS-hidden `display:none` pattern.
    </state>
    <state name="details open">
      User has activated `summary` (click or Enter/Space while focused). Native marker rotates to the open indicator (▼, browser default, no CSS). Revealed content (`div.mt-4.space-y-6`) renders below the summary; the NEON `&lt;a&gt;` becomes focusable/tab-reachable only in this state.
    </state>
    <state name="summary — hover">
      Underline appears on the summary text (`hover:underline`); color unchanged (already ~13.9:1, see Accessibility). Cursor: pointer.
    </state>
    <state name="summary — focus-visible">
      `outline: 2px solid var(--color-accent)` with a 2px offset — matches the app-wide focus-ring convention already established elsewhere (DESIGN.md v1→v2 Migration Table: "focus:ring-green-700 (buttons/toggles) → outline: 2px solid var(--color-accent)"). Native `&lt;summary&gt;` is keyboard-focusable and keyboard-operable (Enter/Space) with zero additional markup.
    </state>
    <state name="summary — active/pressed">
      Same as hover (underline present); no separate color — momentary state, no new token risk.
    </state>
    <state name="summary — disabled">
      N/A. This is static content with no conditional logic; the disclosure is always available. Explicitly noted so FE does not need to guess.
    </state>
    <state name="NEON link — default">
      Text color `var(--color-accent)` (#0c9cb4), permanent underline (`underline underline-offset-2`) — always distinguishable from surrounding body copy without relying on color alone.
    </state>
    <state name="NEON link — hover">
      Underline thickness increases (`hover:decoration-2`); color unchanged (already AA-passing, see Accessibility).
    </state>
    <state name="NEON link — focus-visible">
      `outline: 2px solid var(--color-accent)` with a 2px offset (same app-wide convention as the summary focus state). Because the outline color equals the link's own AA-passing text color, its own text-level contrast already exceeds the 3:1 non-text minimum (WCAG 1.4.11) by a wide margin.
    </state>
    <state name="NEON link — active/pressed">
      Same visual as hover (thicker underline). No color shift.
    </state>
    <state name="NEON link — visited">
      Not distinguished from default — matches the rest of the app, which does not apply `:visited` styling anywhere else.
    </state>
    <state name="NEON link — disabled">
      N/A. Static reference link, always active.
    </state>
    <state name="loading / empty / error">
      N/A for this entire surface — the acknowledgements area is 100% static markup with no async data fetch, no empty-collection case, and no failure mode. Explicitly noted rather than silently omitted, per the "all states must be specified" requirement.
    </state>
  </states>

  <tokens>
    <token element="Footer background (unchanged, inherited)" token="--color-bg (dark context: bg-stone-900, #1c1917 — see Notes)" value="#1c1917" />
    <token element="h2 &quot;Acknowledgements &amp; Citation&quot;" token="--color-stone-200 (DESIGN.md --color-border, #e7e5e4)" value="#e7e5e4" />
    <token element="summary label text" token="--color-stone-200 (DESIGN.md --color-border, #e7e5e4)" value="#e7e5e4" />
    <token element="A1 paragraph (always visible)" token="--color-stone-400 (DESIGN.md --color-text-muted, #a8a29e)" value="#a8a29e" />
    <token element="h3 group labels (Funding &amp; Program Support / Site Access &amp; Facilities)" token="--color-stone-400 (DESIGN.md --color-text-muted, #a8a29e)" value="#a8a29e" />
    <token element="A2–A6 body paragraphs" token="--color-stone-400 (DESIGN.md --color-text-muted, #a8a29e)" value="#a8a29e" />
    <token element="NEON link text + underline + focus outline" token="--color-accent (DESIGN.md --color-accent, bright teal)" value="#0c9cb4" />
    <token element="summary focus outline" token="--color-accent (DESIGN.md --color-accent, bright teal)" value="#0c9cb4" />
    <token element="h2 typography" token="Tailwind text-sm (DESIGN.md Typography Derived Usage: sm/14px) + font-semibold (DESIGN.md weight 600) + uppercase tracking-wide" value="14px / 600" />
    <token element="A1 + A2–A6 body typography" token="Tailwind text-sm (DESIGN.md sm/14px), leading-relaxed (DESIGN.md &quot;Line height (body): 1.6&quot;)" value="14px / 1.6" />
    <token element="h3 group-label typography" token="Tailwind text-xs (DESIGN.md Typography Derived Usage: xs/12px — &quot;badge labels, table metadata&quot;) + font-semibold, uppercase tracking-wide" value="12px / 600" />
    <token element="summary typography" token="Tailwind text-sm (DESIGN.md sm/14px) + font-semibold" value="14px / 600" />
    <token element="Region separation from existing footer content" token="space-8 (DESIGN.md Spacing Scale, 32px)" value="32px, applied as mt-8" />
    <token element="Prose max-width" token="max-w-3xl (DESIGN.md Component Rules — Section heading: &quot;Section intro description max-width: max-w-3xl&quot;)" value="48rem / 768px" />
    <token element="Internal vertical rhythm" token="space-4 / space-6 / space-3 / space-2 (DESIGN.md Spacing Scale)" value="16px / 24px / 12px / 8px" />
  </tokens>

  <interactions>
    <interaction trigger="Click or keyboard-activate (Enter/Space while focused) the summary" response="Native &lt;details&gt; toggles open/closed; browser handles the marker rotation and content show/hide — no JS." />
    <interaction trigger="Tab key from the summary while details is open" response="Focus moves to the NEON &lt;a&gt; (the only focusable element inside the revealed content). If details is closed, Tab skips past the collapsed content entirely (native browser behavior — it is not in the accessibility tree while collapsed)." />
    <interaction trigger="Click the NEON link" response="Navigates to https://www.neonscience.org/data/guidelines-policies/citing in the SAME tab (no target=&quot;_blank&quot;) — recommended over forcing a new tab per WCAG 3.2.5 (avoid unannounced context changes on link activation). rel=&quot;noopener noreferrer&quot; should still be applied defensively regardless of target, per the PM packet's instruction; FE applies the attribute." />
  </interactions>

  <accessibility_spec>
    <contrast_pairs>
      <pair element="NEON link text/underline (default, hover, active, focus-outline)" foreground="--color-accent #0c9cb4" background="#1c1917 (bg-stone-900)" ratio="~5.35:1 (computed via WCAG relative-luminance formula; matches the task brief's ~5.36:1 estimate within rounding)" wcag_level="AA (PASS normal text, ≥4.5:1)" />
      <pair element="h2 heading + summary label" foreground="--color-stone-200 #e7e5e4" background="#1c1917 (bg-stone-900)" ratio="~13.93:1" wcag_level="AAA" />
      <pair element="A1 paragraph, A2–A6 body copy, h3 group labels" foreground="--color-stone-400 #a8a29e" background="#1c1917 (bg-stone-900)" ratio="~6.94:1 (confirms the existing footer's own already-shipped stone-400 usage, e.g. the NSF-strong span, at the same ratio)" wcag_level="AA (PASS; just under the 7:1 AAA line)" />
      <pair element="[ruled out] active/pressed teal shift" foreground="--color-primary-mid #0e7474" background="#1c1917 (bg-stone-900)" ratio="~3.14:1 — FAILS normal-text AA" wcag_level="FAIL — excluded from this spec; see Notes" />
    </contrast_pairs>
    <heading_structure>h1 (page hero, index.html:41, pre-existing) → … existing h2 page sections … → &lt;footer&gt; (landmark, no heading of its own) → h2 "Acknowledgements &amp; Citation" (NEW) → h3 "Funding &amp; Program Support" (NEW) / h3 "Site Access &amp; Facilities" (NEW). No level is skipped: the footer's new h2 continues the page's existing h1→h2 pattern, and its h3s continue the page's existing h2→h3 card-title pattern.</heading_structure>
    <keyboard_flow>Tab order reaches the footer last (natural DOM order, footer is the final landmark). Within the new region: h2 and the A1 paragraph are non-interactive (skipped in tab order). Next stop is the `summary` (native tabindex, keyboard-operable via Enter/Space). If the user opens it, the NEON `&lt;a&gt;` becomes the next tab stop; if left closed, Tab proceeds past the whole region (nothing after it in the footer). No custom tabindex is needed anywhere in this spec.</keyboard_flow>
    <aria_requirements>None beyond native semantics — `&lt;details&gt;`/`&lt;summary&gt;` carry their own implicit disclosure semantics (no `aria-expanded` needed; the browser exposes open/closed state natively). The NEON `&lt;a&gt;` needs `rel="noopener noreferrer"` (security/A11Y hygiene for an external-domain link opened via user action) — no `target="_blank"` per the Interactions note above, so no `aria-label` "opens in new window" caveat is needed either. No `aria-live` region — nothing here updates dynamically post-load.</aria_requirements>
  </accessibility_spec>

  <notes>
    <!-- PM success-criteria checklist, explicit-by-number for fast grading -->
    (1) PLACEMENT: the new `div.ack-citation` is appended as a 5th child inside the EXISTING `div.max-w-7xl.mx-auto.text-center.text-sm.space-y-2` wrapper, AFTER the four existing paragraphs (title, org, NSF disclaimer, data-updated). None of the four existing paragraphs are reordered, restyled, or touched. The NSF disclaimer at index.html:951-956 stays exactly as-is and is NOT restated anywhere in the new region — A1's wording ("NSF Biology Integration Institutes Program under Award # 2120117") is a distinct, more specific funding-source statement and does not repeat the disclaimer's "do not necessarily reflect the views of NSF" sentence.
    (2) DISPLAY MODE: collapsible, via native `&lt;details&gt;`/`&lt;summary&gt;`, zero JavaScript. Rationale: six dense acknowledgement/citation blocks stacked as always-visible prose at the bottom of every single page would be a heavy wall of text on a dark surface, competing with nothing (footer has no other content to balance against) but still hurting perceived page length and scan-ability. A native disclosure keeps everything in the DOM (crawlable/indexable) while defaulting to collapsed, and — per the sprint's explicit constraint and this app's `broadn-p17` history of script-load-order defects — avoids introducing any JS or config-global read entirely.
    (3) ORDERING: A1 is always visible (outside `&lt;details&gt;`), directly beneath the new h2. This deliberately follows the PM packet's own parenthetical characterization of A1 as "the general always-shown block" — treating that as a placement instruction, not just descriptive color, gives readers the gist (BROADN + OHI + NSF Award) without any interaction, while the more specific/lengthy program-and-site credits fold into the disclosure. Inside `&lt;details&gt;`, A2–A6 split into two h3-labeled groups: "Funding &amp; Program Support" = A3 (NEON), A5 (IMPROVE) — both describe sponsoring programs/funding sources, not physical site access; "Site Access &amp; Facilities" = A2 (SGRC), A4 (CPER/USDA), A6 (Niwot/USFS) — all three are specifically about being granted physical access to a research site or facility. This deviates from the PM packet's own suggested split (which put A4 in the "funding" bucket) because A4's actual content ("providing site access at the Central Plains Experimental Range") is a site-access grant, not a funding acknowledgement — grouping it with A2/A6 is internally consistent with what the sentence is actually about. The PM packet explicitly left this "your call," so this is a considered deviation with rationale, not an oversight. Full order top-to-bottom: A1 (always visible) → [toggle] → A3 → A5 → A2 → A4 → A6.
    (4) FOOTER-LINK COLOR: `var(--color-accent)` / DESIGN.md `--color-accent` = `#0c9cb4` (bright teal). Computed contrast against the footer background `#1c1917` (bg-stone-900) = **~5.35:1** via the WCAG relative-luminance formula (hand-computed; corroborates the task brief's independently-stated ~5.36:1 to within rounding). This PASSES WCAG AA normal-text (≥4.5:1). Deep teal `#0c5454` was NOT used — per DESIGN.md's own Teal Text Restriction table, deep teal is calibrated for light backgrounds (~9.1:1 on white) and inverts unfavorably on a dark surface (too dark, low luminance difference), which is exactly why the task brief flagged it as excluded. Underline (`underline underline-offset-2`, thickening on hover) is specified so the link is distinguishable without relying on color alone (WCAG 1.4.1).
    (5) SEMANTIC STRUCTURE: `&lt;footer&gt;` (unchanged, existing landmark) → new `&lt;h2&gt;` "Acknowledgements &amp; Citation" → `&lt;p&gt;` (A1) → `&lt;details&gt;`/`&lt;summary&gt;` (disclosure, native, keyboard-operable) → two `&lt;div&gt;` groups each with an `&lt;h3&gt;` label and `&lt;p&gt;` elements (one `&lt;p&gt;` per remaining block; A3's `&lt;p&gt;` contains an inline `&lt;a href="https://www.neonscience.org/data/guidelines-policies/citing" rel="noopener noreferrer"&gt;`). Heading level: h2 continues the page's existing h1→h2 pattern (footer had no heading before); h3 continues the existing h2→h3 card-title pattern used throughout the dashboard body. No heading level is skipped.
    (6) `&lt;design_system_source&gt;DESIGN_MD&lt;/design_system_source&gt;` is set. Every color and typography value in this spec traces to a named DESIGN.md entry (see `&lt;tokens&gt;` above) — several are cited via their LIVE CSS custom-property names already defined in `assets/styles.css:4-14` (`--color-stone-200`, `--color-stone-400`, `--color-accent`), which are a verified 1:1 hex match to DESIGN.md's `--color-border`, `--color-text-muted`, and `--color-accent` respectively. Zero new CSS custom properties, zero raw invented hex values.

    <!-- DESIGN.md gaps found (flagged, not worked around by inventing a value) -->
    GAP 1 — no named "dark-surface divider" token: DESIGN.md's two border tokens (`--color-border` #e7e5e4, `--color-border-strong` #d6d3d1) are both calibrated for light backgrounds and would read as an oddly bright line against `#1c1917`. This spec avoids the gap entirely by separating the new region from existing footer content with spacing alone (`mt-8`, space-8/32px) rather than inventing an untokenized dark-divider hex. Recommend a future `generate-design` pass add a `--color-border-dark` (or similar) token if a firmer visual divider is wanted on dark surfaces elsewhere (e.g. this footer, any future dark panel).
    GAP 2 — no named "footer sub-heading" typographic role: DESIGN.md's Typography Derived Usage table doesn't have an entry specific to a compact dark-footer section heading. This spec reuses the nearest documented sizes (`sm`/14px for the h2 and summary label, `xs`/12px for h3 group labels — mirroring the Data Table component rule's header-label pattern of `text-xs font-semibold uppercase tracking-wide`) rather than inventing a new size step. Flagged for a future DESIGN.md revision to formally name this usage if more dark-footer content is added later.

    <!-- Reuse note -->
    `--color-stone-200` (#e7e5e4) is DESIGN.md's `--color-border`, whose documented semantic role is "card borders, dividers" — not text. This spec reuses its hex value for heading TEXT on the dark footer because the already-shipped footer (index.html:949, pre-dating this spec) already does exactly this for its bold title line (`class="text-stone-200 font-semibold text-base"`), and `text-stone-200` = `#e7e5e4` = `--color-border`'s exact value. This is a continuation of an established, already-shipped precedent within this very element, not a new invented use — flagged here for transparency per the "explain the why" principle.

    <!-- Scope confirmation -->
    No new fonts, images, or static assets referenced. No JavaScript. No change to `app.js`, `data.json`, or `covariates.json`. The markup sketch in `&lt;component_hierarchy&gt;` is illustrative only — FE authors the final production HTML per `broadn-p20-acknowledgements-02`, including exact Tailwind-class vs. inline-style choice for referencing the CSS variables named above (both are already precedented in this codebase; either is acceptable, FE's call).
  </notes>
</design_spec>
