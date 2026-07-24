<ui_packet>
  <task_id>broadn-p20-acknowledgements-02</task_id>
  <components_created>
    None (React). This is the static `broadn-web-view` GitHub Pages dashboard — no build system,
    no components. Implementation is a pure HTML addition to `index.html` inside the existing
    `<footer id="site-footer">` element, per the T1 design_spec
    (`.claude/tasks/outputs/broadn-p20-acknowledgements-01-UI-1784935564.md`).
  </components_created>

  <files_modified>
    - /home/jhber/projects/broadn-web-view/index.html  (+24 lines, footer region, lines 961-984)
  </files_modified>
  <files_not_modified_confirmed>
    assets/app.js, assets/styles.css, data.json, covariates.json — none touched. No new CSS was
    needed; all styling is expressed via Tailwind utility classes (Play CDN, JIT arbitrary-value
    syntax) plus references to the existing `--color-accent` CSS custom property already defined
    in assets/styles.css:11.
  </files_not_modified_confirmed>

  <state_hydration_map>
    N/A — 100% static markup, no client state, no data fetch, no JS added. The block sits inside
    the existing footer, after the four pre-existing paragraphs (title, org line, NSF disclaimer,
    "Data updated" line), none of which were touched or reordered.
  </state_hydration_map>

  <a11y_verification>
    - Heading levels: new `<h2>` "Acknowledgements &amp; Citation" continues the page's existing
      h1→h2 pattern (footer previously had no heading). Two `<h3>` group labels ("Funding &amp;
      Program Support", "Site Access &amp; Facilities") continue the existing h2→h3 card-title
      pattern used elsewhere on the page. No heading level skipped.
    - Collapsible region: native `<details>`/`<summary>`, zero JavaScript. `<summary>` is
      natively keyboard-focusable and keyboard-operable (Enter/Space toggles open/closed) with no
      added markup. Descriptive summary label: "View funding, site access &amp; facility
      acknowledgements" (not a verbatim repeat of the h2).
    - Focus-visible: both `<summary>` and the NEON `<a>` carry
      `outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
      focus-visible:outline-[var(--color-accent)]` — matches DESIGN.md's documented v1→v2
      migration target ("focus:ring-green-700 → outline: 2px solid var(--color-accent)",
      DESIGN.md:225) and the design_spec's focus-visible state spec.
    - NEON link: real `<a href="https://www.neonscience.org/data/guidelines-policies/citing"
      rel="noopener noreferrer">`, color `text-[var(--color-accent)]` (#0c9cb4) PLUS a permanent
      `underline underline-offset-2` (thickens via `hover:decoration-2` on hover) — distinguishable
      without relying on color alone (WCAG 1.4.1). No `target="_blank"` per design_spec (avoids an
      unannounced context change per WCAG 3.2.5); `rel="noopener noreferrer"` applied defensively
      regardless, per the PM packet instruction.
    - Click-handler keyboard-equivalent audit: N/A — this addition contains zero `onClick`
      handlers on any element (no JS at all); grep for
      `<(span|div|li|a)[^>]*onClick=` in the new block returned no matches.
    - Semantic HTML: `<h2>`, `<h3>`, `<p>`, `<details>`, `<summary>`, `<a href>` — no `<span>`/`<div>`
      standing in for an interactive element.
  </a11y_verification>

  <design_tokens_used>
    - `text-stone-200` (DESIGN.md `--color-border` #e7e5e4, reused for text per the existing
      shipped precedent at index.html:949) — h2 and summary label text (~13.93:1 on #1c1917, AAA).
    - `text-stone-400` (DESIGN.md `--color-text-muted` #a8a29e) — A1/A2-A6 body paragraphs and h3
      group labels (~6.94:1 on #1c1917, AA).
    - `text-[var(--color-accent)]` / `outline-[var(--color-accent)]` (DESIGN.md `--color-accent`
      #0c9cb4) — NEON link text/underline/focus-outline and summary focus-outline. Computed
      ~5.35:1 contrast on #1c1917 (bg-stone-900) — PASSES WCAG AA normal text (>=4.5:1). Deep teal
      `#0c5454` was explicitly NOT used (fails contrast on this dark surface per design_spec).
    - Spacing scale (DESIGN.md Spacing Scale, base 4px): `mt-8` (32px, separates new region from
      existing footer content), `space-y-4` (16px, h2→A1→details rhythm), `mt-4` (16px,
      summary→revealed-content gap), `space-y-6` (24px, between the two groups), `mb-2` (8px,
      h3→paragraphs gap), `space-y-3` (12px, between paragraphs within a group).
    - `max-w-3xl` (DESIGN.md Component Rules "Section intro description max-width") — prose width
      constraint, block stays `mx-auto`-centered on the page.
    - Typography: `text-sm` (14px, DESIGN.md sm) for h2/summary/body paragraphs with
      `leading-relaxed` (1.6 line-height); `text-xs` (12px) + `font-semibold uppercase
      tracking-wide` for h3 group labels (mirrors the Data Table header-label pattern).
    - Zero raw/invented hex values; zero new CSS custom properties. All values traced to named
      DESIGN.md tokens or existing shipped CSS custom properties in assets/styles.css:4-14.
  </design_tokens_used>

  <style_conflict_check>NONE — no inline `style="..."` attributes were added anywhere in the new block; all styling is Tailwind utility classes.</style_conflict_check>

  <data_contract_verified>N/A — no data-field access, no tRPC/API calls, no chart callbacks in this task.</data_contract_verified>

  <sc_verification>
Run from repo root `/home/jhber/projects/broadn-web-view`:

=== SC1 (8 anchors, each expected == 1) ===
$ grep -Fc "NSF Biology Integration Institutes Program under Award # 2120117" index.html
1
$ grep -Fc "Amy Bibbey and Troy Bauder and other staff at the Colorado Agricultural Experiment Station" index.html
1
$ grep -Fc "operated under cooperative agreement by Battelle. This material is based in part" index.html
1
$ grep -Fc "Data collected/used in this research were obtained through the NEON Assignable Assets program" index.html
1
$ grep -Fc "United States Department of Agriculture agency of Agricultural Research Services by providing site access at the Central Plains Experimental Range (CPER)" index.html
1
$ grep -Fc "The Air Quality Research Center at the University of California, Davis is the central analytical laboratory" index.html
1
$ grep -Fc "carbon analysis provided by Desert Research Institute" index.html
1
$ grep -Fc "The Niwot Ridge forest tower is located on land in the Arapaho and Roosevelt National Forests" index.html
1

=== SC1b (period-inversion trap, each expected == 1) ===
$ grep -Fc "US Environmental Protection Agency" index.html
1
$ grep -Fc "U.S. Forest Service" index.html
1

=== SC2 (NEON URL + rel) ===
$ grep -Fc "https://www.neonscience.org/data/guidelines-policies/citing" index.html
1
$ grep -F 'rel="noopener noreferrer"' index.html
(one matching line — the NEON <a> tag; the only rel="noopener noreferrer" in the file)

=== SC3 (DRY — NSF disclaimer not duplicated, expected == 1) ===
$ grep -Fc "do not necessarily reflect the views of NSF" index.html
1

=== SC7 (out-of-scope drift check) ===
$ git diff --name-only HEAD
.claude/tasks/outputs/SESSION-CHECKPOINT-2026-07-23.md
docs/SESSION-CHECKPOINT.md
index.html

NOTE on SC7: `.claude/tasks/outputs/SESSION-CHECKPOINT-2026-07-23.md` and
`docs/SESSION-CHECKPOINT.md` were ALREADY modified (shown as "M" in git status) BEFORE this task
began — per the session's initial gitStatus snapshot at conversation start, which listed exactly
these two files as pre-existing modifications unrelated to broadn-p20-acknowledgements-02. This
FE task did not touch either file. `index.html` is the only file this task modified.
`assets/app.js`, `data.json`, and `covariates.json` are untouched (confirmed absent from the diff
list). `assets/styles.css` was not modified (no non-utility CSS was required).
  </sc_verification>

  <tag_balance_verification>
    Manual inspection of the new block (index.html:961-984): `<div>` 6 open / 6 close,
    `<p>` 7 open / 7 close, `<h2>` 1/1, `<h3>` 2/2, `<details>` 1/1, `<summary>` 1/1, `<a>` 1/1.
    All balanced. No SC-anchor phrase is split by an inline tag (verified by reading each anchor
    against the source lines — the one inline tag inserted, the NEON `<a>`, sits entirely AFTER
    the "...NEON Assignable Assets program" anchor phrase, as a separate trailing sentence).
  </tag_balance_verification>

  <integration_status>SUCCESS</integration_status>
</ui_packet>
