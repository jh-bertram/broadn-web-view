<design_spec>
  <task_id>broadn-p17-t1-ui</task_id>
  <surface>Sample-Checkout Cart (Explorer add-to-cart row control + persistent cart badge + checkout review panel + request-form dialog)</surface>
  <design_system_source>DESIGN_MD</design_system_source>

  <!-- DESIGN.md v2.0.0 (2026-06-25, UI#1 broadn-p10-design-implementation-UI-001) read in full before drafting.
       No live-page inspection performed: the surfaces specified below (cart control, badge, panel,
       dialog) do not exist yet in the running app — there is nothing rendered to screenshot. Grounding
       instead comes from static source review: assets/app.js:1710-1772 (renderTable — the exact cell
       being replaced) and index.html:860-939 (Explorer toolbar + table markup, and the sticky-nav
       structure used to place the persistent badge). See <notes> for what was found there. -->

  <component_hierarchy>
Sticky Nav (existing, h-16, bg-white)
  └─ CartBadgeButton (NEW — persistent, always mounted, all panes)
       icon (lucide ShoppingCart) + CountChip (conditional)
       on click → opens CartReviewPanel

Explorer Section (existing #explorer)
  └─ Table (#explorer-table)
       └─ tbody row (per sample, existing renderTable() row)
            └─ Cart cell (REPLACES the existing "Request ✉" <a> cell, app.js:1769)
                 └─ AddToCartButton (NEW — toggle control, aria-pressed)
                      state=default  → label "Add to cart"
                      state=in-cart  → label "In cart ✓" (idle) / "Remove" (hover/focus)

CartReviewPanel (NEW — modal Sheet, role="dialog" aria-modal="true", right slide-over)
  ├─ Header
  │    ├─ Title "Sample Cart ({N})"  (h2)
  │    └─ CloseButton (44×44, icon X)
  ├─ Body
  │    ├─ EmptyState (icon + heading + body text)              [cart.length === 0]
  │    └─ ItemList (scrollable when many)                        [cart.length > 0]
  │         └─ CartItemRow × N
  │              ├─ Sample ID + site/date (text)
  │              └─ RemoveItemButton (44×44, icon X)
  └─ Footer (sticky, hidden when empty)
       ├─ "{N} samples selected" (text)
       └─ RequestSamplesButton (primary) → opens RequestFormDialog

RequestFormDialog (NEW — modal, role="dialog" aria-modal="true", stacks ON TOP of CartReviewPanel)
  ├─ Scrim (covers CartReviewPanel + page — see <tokens>)
  ├─ Header
  │    ├─ Title "Request These Samples"  (h2)
  │    └─ CloseButton (44×44, icon X)
  ├─ Body — state-dependent:
  │    ├─ state=form        → 4 labeled fields + inline field-error slots
  │    │     FieldGroup: Requester Name    (input type=text,  required)
  │    │     FieldGroup: Requester Email   (input type=email, required)
  │    │     FieldGroup: Affiliation       (input type=text,  required)
  │    │     FieldGroup: Intended Use      (textarea, required)
  │    ├─ state=submit-error → ErrorBanner above footer, form fields retained (not cleared)
  │    ├─ state=unconfigured → fields visible+enabled, Submit disabled, InlineNotice below form
  │    └─ state=success      → SuccessPanel (icon + heading + body), form fields removed from DOM
  └─ Footer
       ├─ CancelButton (secondary)     [hidden in success state]
       └─ SubmitButton (primary)       [replaced by CloseButton in success state]

Component-vocabulary note: names above (Sheet, Dialog, Button, Input, Label, Textarea) are used as a
design vocabulary for structure/behavior parity with common component libraries — see <notes> re:
this app's actual "vanilla Tailwind + Chart.js, no framework imports" Constitution rule. FE implements
these as plain HTML/CSS/JS elements with equivalent semantics, not literal React/Shadcn imports.
  </component_hierarchy>

  <layout>
    <grid>
      AddToCartButton: inline within existing table cell, `<td class="px-6 py-4">` wrapper unchanged (matches sibling cells).
      CartBadgeButton: inline-flex within sticky nav's existing right-hand cluster, sized to match nav's other icon/utility controls (h-16 nav height governs vertical centering).
      CartReviewPanel: fixed-position slide-over, `width: 384px` on desktop (viewport ≥768px), full-width (`left:16px; right:16px`) bottom-anchored-to-full-height on mobile (&lt;768px) — this mirrors the existing `.fb-popover` responsive split (desktop anchored panel / mobile full-width) already proven in feedback-widget.css, reused as a *pattern*, not as shared CSS.
      RequestFormDialog: centered overlay, `max-width: 480px`, full viewport-centered on all breakpoints (form entry does not benefit from a bottom-sheet treatment the way a short popover does).
    </grid>
    <spacing>
      AddToCartButton: padding `space-3` (12px) vertical + `space-3` (12px) horizontal — larger than the table's other pill badges (`space-2`/`space-1`) specifically to clear the 44px minimum touch target; see <notes> for why this is an intentional deviation from the compact badge convention.
      CartBadgeButton: `space-2` (8px) padding around a 24px icon, consistent with nav-link hit-area sizing.
      CartReviewPanel header/footer: `space-4` (16px) padding. Body list: `space-4` (16px) outer padding, `space-3` (12px) gap between item rows.
      RequestFormDialog: `space-6` (24px) padding. Field groups: `space-4` (16px) vertical gap between groups, `space-2` (8px) gap between each label and its input.
    </spacing>
    <responsive>
      <breakpoint name="sm">CartReviewPanel becomes a full-width bottom sheet (`left/right: 16px`, rounded-xl top corners) rather than a right-edge slide-over — matches `.fb-popover` mobile treatment. RequestFormDialog remains centered but narrows to `calc(100vw - 32px)` with `space-4` outer margin instead of a fixed 480px.</breakpoint>
      <breakpoint name="md">CartReviewPanel: right-edge slide-over, fixed 384px width, full viewport height minus nav (`top: 64px; height: calc(100vh - 64px)`).</breakpoint>
    </responsive>
  </layout>

  <states>
    <!-- 1. Add-to-cart row control -->
    <state name="add-to-cart: default">
      Outline pill button. Border `--color-primary` (#0c5454), text `--color-primary`, background transparent. Icon: lucide `ShoppingCart` (16px) + label "Add to cart", `text-sm font-medium`. `aria-pressed="false"`, `aria-label="Add sample {id} to cart"`.
    </state>
    <state name="add-to-cart: hover / focus-visible (default)">
      Background `--color-primary-light` (#ccefef), border/text unchanged (`--color-primary`). Focus-visible additionally gets `outline: 2px solid --color-accent (#0c9cb4); outline-offset: 2px` — matches the app's existing focus-visible convention on the CSV button and sort headers.
    </state>
    <state name="add-to-cart: active (mouse/keyboard press)">
      Background `--color-surface-hover` (#e7e5e4), border/text unchanged.
    </state>
    <state name="add-to-cart: in-cart (idle)">
      Solid filled pill. Background `--color-primary` (#0c5454), text `#ffffff`, icon lucide `Check`, label "In cart ✓". `aria-pressed="true"`, `aria-label="Sample {id} is in your cart. Activate to remove."`.
    </state>
    <state name="add-to-cart: in-cart hover / focus-visible (remove-intent)">
      Swap treatment (deliberate "reveal the destructive action on interaction" pattern): background reverts to `--color-surface` (#ffffff), border `--color-error` (#b91c1c), text `--color-error`, icon lucide `X`, label swaps to "Remove". Focus-visible adds the same `outline: 2px solid --color-accent` ring as the default state (ring color stays brand-accent even though the fill signals error — this keeps the focus indicator consistent app-wide and avoids a second competing red ring).
    </state>
    <state name="add-to-cart: active (in-cart, press to remove)">
      Background `--color-error` (#b91c1c) fully filled, text `#ffffff` — a one-frame confirm-of-action press state before the row updates to `default`.
    </state>

    <!-- 2. Persistent cart badge -->
    <state name="cart-badge: empty (0 items)">
      Icon-only, no count chip rendered. Icon color `--color-text-secondary` (#57534e) — NOT `--color-text-muted` (#a8a29e, ~2.8:1, fails even the 3:1 non-text WCAG floor); `--color-text-secondary` clears both text and non-text thresholds. `aria-label="Cart, empty"`. Still fully clickable — opens CartReviewPanel in its empty state.
    </state>
    <state name="cart-badge: 1 item">
      Icon color shifts to `--color-primary` (#0c5454). A circular CountChip overlays the icon's top-right: `background: --color-primary`, `color: #ffffff`, `border-radius: rounded-full`, fixed diameter matching a single glyph (18px), `text-xs font-semibold`. `aria-label="Cart, 1 sample"`.
    </state>
    <state name="cart-badge: many items (2+)">
      Same icon/chip coloring as the 1-item state (`--color-primary` fill, white text) — the *visual distinction* from the 1-item state is that the chip becomes a pill instead of a circle once its digit count exceeds one character (`rounded-full` retained, but `min-width` grows to fit 2+ digits with `space-1` horizontal padding), and counts above 99 are capped at the literal string "99+". `aria-label="Cart, {N} samples"`.
    </state>
    <state name="cart-badge: hover / focus-visible">
      Background (behind the icon, a small `44×44` hit-area) tints to `--color-surface-alt` (#f5f5f4); icon/chip colors unchanged from their empty/1/many state. Focus-visible adds `outline: 2px solid --color-accent; outline-offset: 2px`.
    </state>

    <!-- 3. Checkout review panel -->
    <state name="review-panel: empty">
      Body shows the DESIGN.md "Empty state" pattern (icon + heading + body text, no CTA needed since the panel itself is reached from the cart the user is trying to fill): lucide `ShoppingCart` icon (32px, `--color-text-secondary`), heading "Your cart is empty" (`text-lg font-semibold text-stone-800`), body "Add samples from the Explorer table to request them." (`text-sm` , `--color-text-secondary`). Footer is NOT rendered in this state (no "0 samples selected" bar, no disabled Submit — an absent footer communicates "nothing to do here" more clearly than a disabled button).
    </state>
    <state name="review-panel: populated (1–~5 items, fits without scroll)">
      ItemList renders inline, no scroll affordance. Each CartItemRow: Sample ID (`text-sm font-medium text-stone-900`), site + date on the line below (`text-xs`, `--color-text-secondary`), RemoveItemButton right-aligned (44×44 hit area, icon `X`, default color `--color-text-secondary`, hover/focus color `--color-error` + background `--color-surface-alt`). Row divider: `border-b border-stone-200` (`--color-border`) between rows, no divider after the last row.
    </state>
    <state name="review-panel: many items (scrolling)">
      Once ItemList content exceeds the panel's available body height, the list region gets `overflow-y: auto` with a `max-height` computed as the panel height minus header and footer (`calc(100% - header - footer)`); the Footer stays `position: sticky; bottom: 0` with `background: --color-surface` and a `border-t border-stone-200` separator so the "Request These Samples" CTA is always reachable without scrolling to the bottom of a long cart.
    </state>
    <state name="review-panel: item removal in-flight">
      Removing a row is instantaneous (client-side array splice, no network round-trip per D2 — cart is in-session state) — no loading spinner needed on RemoveItemButton. The row is simply removed from the list; if that was the last item, the panel re-renders into the `empty` state described above.
    </state>

    <!-- 4/5. Request-form dialog -->
    <state name="request-dialog: form (default)">
      All 4 fields rendered, empty or pre-filled with nothing (D2 scope: no persisted identity — every open starts blank). Submit enabled once required-field validation would pass client-side (exact validation rules are FE/T3's to define; this spec only requires that Submit becomes actionable and pressing it while any required field is empty produces the field-error state below rather than a silent no-op).
    </state>
    <state name="request-dialog: field validation error">
      The offending field's input border becomes `--color-error`, with helper text below in `--color-error` (`text-xs`), e.g. "Requester email is required." — mirrors the feedback widget's proven `.fb-field-error` treatment (reused as a *pattern*, new class names in cart's own stylesheet — see reuse-vs-new decision below).
    </state>
    <state name="request-dialog: submitting">
      Submit button shows a spinner glyph + label "Submitting…", `aria-disabled="true"`, `background: --color-border-strong` is NOT correct here (that's the disabled-idle look) — submitting keeps the button's normal primary fill (`--color-primary`) at reduced `opacity: 0.8` so it reads as "busy," not "unavailable." All 4 fields become `disabled`/`aria-disabled="true"` for the duration. Cancel button is also disabled during submit (prevents a race between user-cancel and in-flight request).
    </state>
    <state name="request-dialog: success">
      Body replaces the form entirely with a confirmation: lucide `CheckCircle` icon (32px, `--color-success` #15803d), heading "Request submitted" (`text-lg font-semibold text-stone-800`), body "We'll be in touch about your {N} requested samples." (`text-sm`, `--color-text-secondary`). Footer's Cancel/Submit pair is replaced by a single "Close" button (secondary style). See <notes> for the cart-clearing side effect this implies for T3.
    </state>
    <state name="request-dialog: submit error">
      Form fields and their entered values are RETAINED (not cleared — do not make the requester retype everything). An ErrorBanner renders above the footer using DESIGN.md's "Error state" component rule: `background: --color-surface-alt` (#f5f5f4), `border: 1px solid --color-border`, `border-radius: rounded-lg`, `padding: space-4`, text `--color-text-secondary` — NOT a red background (per Constitution: "No red background — reserved for inline field errors only"). A small error glyph (lucide `AlertCircle`, `--color-error`, icon-only, non-text so no contrast obligation beyond 3:1 which #b91c1c clears) sits to the left of the message text, e.g. "Something went wrong submitting your request. Try again." Submit re-enables immediately.
    </state>
    <state name="request-dialog: endpoint-unconfigured">
      Fields remain visible and editable (user can still fill the form for their own reference / copy-paste elsewhere) but Submit is `disabled` + `aria-disabled="true"`: `background: --color-border-strong` (#d6d3d1), `color: --color-text-secondary` (#57534e), `cursor: not-allowed` — this exact treatment already exists as `.fb-submit:disabled` in feedback-widget.css and is reused as a *value pattern* here. Directly below the Submit button, an InlineNotice (`text-sm`, `--color-text-secondary`) reads: "Sample requests aren't configured yet. Contact the BROADN team directly." This is a deliberate divergence from feedback-widget.css's own not-configured treatment (which hides the whole form and shows an icon+message instead) — see <notes> for rationale.
    </state>

    <!-- 6 is covered under accessibility_spec > keyboard_flow below, per format. -->
  </states>

  <tokens>
    <token element="AddToCartButton border/text (default)" token="--color-primary" value="#0c5454" />
    <token element="AddToCartButton background (hover/focus, default state)" token="--color-primary-light" value="#ccefef" />
    <token element="AddToCartButton background (active press, default state)" token="--color-surface-hover" value="#e7e5e4" />
    <token element="AddToCartButton background (in-cart idle)" token="--color-primary" value="#0c5454" />
    <token element="AddToCartButton text on in-cart idle" token="(white, structural — see note)" value="#ffffff" />
    <token element="AddToCartButton border/text (in-cart hover/focus, remove-intent)" token="--color-error" value="#b91c1c" />
    <token element="AddToCartButton background (active press, in-cart/remove)" token="--color-error" value="#b91c1c" />
    <token element="Focus-visible ring, all interactive cart controls" token="--color-accent" value="#0c9cb4" />
    <token element="Cart badge icon (empty state)" token="--color-text-secondary" value="#57534e" />
    <token element="Cart badge icon + CountChip fill (1/many state)" token="--color-primary" value="#0c5454" />
    <token element="Cart badge hover background" token="--color-surface-alt" value="#f5f5f4" />
    <token element="Review-panel / dialog surface background" token="--color-surface" value="#ffffff" />
    <token element="Review-panel row divider" token="--color-border" value="#e7e5e4" />
    <token element="Review-panel footer top border" token="--color-border" value="#e7e5e4" />
    <token element="RemoveItemButton default icon color" token="--color-text-secondary" value="#57534e" />
    <token element="RemoveItemButton hover/focus icon color" token="--color-error" value="#b91c1c" />
    <token element="RemoveItemButton hover/focus background" token="--color-surface-alt" value="#f5f5f4" />
    <token element="Empty-state heading text" token="(stone-800 structural, see note)" value="#292524" />
    <token element="Empty-state body text / review-panel secondary text" token="--color-text-secondary" value="#57534e" />
    <token element="RequestSamplesButton (primary CTA, panel footer)" token="--color-primary" value="#0c5454" />
    <token element="RequestFormDialog scrim/overlay" token="--color-tooltip-bg" value="rgba(28,25,23,0.92)" />
    <token element="Field input border (default)" token="--color-border-strong" value="#d6d3d1" />
    <token element="Field input border/shadow (focus)" token="--color-primary-mid" value="#0e7474" />
    <token element="Field validation error border/text" token="--color-error" value="#b91c1c" />
    <token element="Submit button (default/submitting fill)" token="--color-primary" value="#0c5454" />
    <token element="Submit button (hover)" token="--color-primary-mid" value="#0e7474" />
    <token element="Submit button (active/press)" token="--color-primary-dark" value="#083838" />
    <token element="Submit button (disabled / endpoint-unconfigured)" token="--color-border-strong bg / --color-text-secondary text" value="#d6d3d1 / #57534e" />
    <token element="Success state icon" token="--color-success" value="#15803d" />
    <token element="Error banner background" token="--color-surface-alt" value="#f5f5f4" />
    <token element="Error banner border" token="--color-border" value="#e7e5e4" />
    <token element="Error banner icon" token="--color-error" value="#b91c1c" />
    <token element="Cancel/secondary button border/text" token="--color-border-strong / --color-text-secondary" value="#d6d3d1 / #57534e" />
    <token element="Panel/dialog header title typography" token="text-lg (Typography scale)" value="18px" />
    <token element="Field label typography" token="text-sm (Typography scale)" value="14px" />
    <token element="Body/helper typography" token="text-xs (Typography scale)" value="12px" />
    <token element="Field/button radius" token="rounded-md (Border Radius scale)" value="6px" />
    <token element="Dialog panel radius" token="rounded-xl (Border Radius scale)" value="12px" />
    <token element="CountChip radius" token="rounded-full (Border Radius scale)" value="9999px" />
    <token element="AddToCartButton padding" token="space-3 (Spacing scale)" value="12px" />
    <token element="Panel/dialog outer padding" token="space-4 / space-6 (Spacing scale)" value="16px / 24px" />
  </tokens>

  <interactions>
    <interaction trigger="Click/Enter/Space on AddToCartButton (default state)" response="Sample added to in-session cart array; row control flips to in-cart state; cart badge count increments by 1; no page navigation, no network call (per D2, cart is client-side only)." />
    <interaction trigger="Click/Enter/Space on AddToCartButton (in-cart state)" response="Sample removed from cart array; row control flips back to default state; cart badge count decrements by 1 (or badge returns to empty state if count reaches 0)." />
    <interaction trigger="Click/Enter/Space on CartBadgeButton" response="Opens CartReviewPanel (modal). If cart is empty, panel opens in empty state; otherwise populated/many state per current count." />
    <interaction trigger="Click/Enter/Space on RemoveItemButton (inside CartReviewPanel)" response="Removes that item from the cart array; row disappears from the list with no confirmation step (low-cost, instantly reversible via re-adding from the Explorer table); badge count decrements; panel re-renders empty state if that was the last item." />
    <interaction trigger="Click/Enter/Space on RequestSamplesButton (panel footer)" response="Opens RequestFormDialog, stacked on top of the still-open CartReviewPanel." />
    <interaction trigger="Click/Enter/Space on Submit (request-dialog, valid form)" response="Enters submitting state; on success transitions to success state; on failure transitions to submit-error state with form data retained." />
    <interaction trigger="Click Cancel, press Escape, or click outside RequestFormDialog (non-submitting state only)" response="Dialog closes without submitting; CartReviewPanel remains open underneath, unchanged." />
    <interaction trigger="Press Escape or click outside CartReviewPanel" response="Panel closes; underlying page (Explorer/Dashboard/Slice, whichever is active) is unaffected." />
    <interaction trigger="Click Close on RequestFormDialog success state" response="Dialog closes; per <notes>, the cart is expected to clear as a consequence of a successful submission — CartReviewPanel (still open beneath) re-renders to its empty state." />
  </interactions>

  <accessibility_spec>
    <contrast_pairs>
      <pair element="AddToCartButton text/border (default)" foreground="--color-primary #0c5454" background="#ffffff" ratio="~9.1:1" wcag_level="AAA" />
      <pair element="AddToCartButton text (in-cart idle)" foreground="#ffffff" background="--color-primary #0c5454" ratio="~9.1:1" wcag_level="AAA" />
      <pair element="AddToCartButton text/border (in-cart hover, remove-intent)" foreground="--color-error #b91c1c" background="#ffffff" ratio="~5.9:1" wcag_level="AA" />
      <pair element="Cart badge icon (empty)" foreground="--color-text-secondary #57534e" background="#ffffff" ratio="~7.4:1" wcag_level="AAA (also clears non-text 3:1 floor)" />
      <pair element="CountChip text" foreground="#ffffff" background="--color-primary #0c5454" ratio="~9.1:1" wcag_level="AAA" />
      <pair element="RemoveItemButton icon (hover/focus)" foreground="--color-error #b91c1c" background="--color-surface-alt #f5f5f4" ratio="~5.6:1 (est., darker bg slightly lowers vs. pure white but stays well above 3:1 non-text floor)" wcag_level="AA (non-text)" />
      <pair element="Field validation helper text" foreground="--color-error #b91c1c" background="#ffffff" ratio="~5.9:1" wcag_level="AA" />
      <pair element="Submit disabled text" foreground="--color-text-secondary #57534e" background="--color-border-strong #d6d3d1" ratio="~3.7:1 (est.)" wcag_level="FAILS 4.5:1 normal-text AA — see note below" />
      <pair element="Error banner message text" foreground="--color-text-secondary #57534e" background="--color-surface-alt #f5f5f4" ratio="~7.1:1 (est., near-white bg)" wcag_level="AAA" />
      <pair element="Success heading" foreground="stone-800 #292524 (structural, not a v2 named token — see note)" background="#ffffff" ratio="~14:1" wcag_level="AAA" />
    </contrast_pairs>
    <heading_structure>
      CartReviewPanel title "Sample Cart ({N})" → `h2` (panel is its own modal landmark, not nested under the page's `h2 Data Explorer`). RequestFormDialog title "Request These Samples" → `h2` (same reasoning — independent modal landmark). Neither introduces an `h1`; the page's existing single `h1`/hero heading is untouched.
    </heading_structure>
    <keyboard_flow>
      Tab order within CartReviewPanel: Close button → (if populated) each CartItemRow's RemoveItemButton in list order → RequestSamplesButton. Tab order within RequestFormDialog: Requester Name → Requester Email → Affiliation → Intended Use → Cancel → Submit (or → Close in success state). Both dialogs trap focus (Tab from the last focusable element cycles to the first; Shift+Tab from the first cycles to the last) while open — implementation detail for T3, but the *contract* (a closed loop, no focus leaking to the page behind the scrim) is binding.
    </keyboard_flow>
    <aria_requirements>
      AddToCartButton: `aria-pressed` (true/false) + dynamic `aria-label` naming the sample ID and current action ("Add sample {id} to cart" / "Sample {id} is in your cart. Activate to remove."). CartBadgeButton: dynamic `aria-label` stating the count in words ("Cart, empty" / "Cart, 1 sample" / "Cart, {N} samples") — do not rely on the visual chip glyph alone. Cart count changes announce via a visually-hidden `aria-live="polite"` region (distinct from the badge's own label, so screen-reader users are told "Sample BR-0231 added to cart" at the moment of the action, not only when they next focus the badge) — mirrors the existing `#explorer-status` `aria-live="polite"` pattern already in index.html for CSV export. CartReviewPanel: `role="dialog" aria-modal="true" aria-labelledby="cart-panel-title"` (id on the h2). RequestFormDialog: `role="dialog" aria-modal="true" aria-labelledby="request-dialog-title"`. Each required field: `aria-required="true"`; each field-error message: `id` referenced by the field's `aria-describedby`, `role="alert"` on first appearance (not on every re-render) so it's announced once. Submit's submitting/disabled states: `aria-disabled` (not native `disabled` alone) so the reason (busy vs. unconfigured) can be paired with the adjacent visible/InlineNotice text via `aria-describedby`.
    </aria_requirements>
  </accessibility_spec>

  <notes>
- **Scrim decision (D3):** uses `--color-tooltip-bg` (`rgba(28,25,23,0.92)`) as directed by the PM plan's default — no new `--color-scrim` token proposed. DESIGN.md is not edited by this spec.
- **Reuse-vs-new CSS decision:** RECOMMEND new, additive cart styling in its own stylesheet (e.g. `assets/cart.css`, FE's naming call in T3) rather than extending `assets/feedback-widget.css`. Rationale: (1) feedback-widget.css's own header states its class prefix (`.fb-`) exists specifically "to avoid collision with Tailwind" for *that* widget — repurposing it for an unrelated feature blurs a boundary that was deliberately drawn; (2) the two overlay mechanics differ structurally: the feedback widget is an anchored, non-trapping popover (`position: absolute`, closes on outside click, no focus trap) while both cart overlays are true modals with a scrim and a focus trap — forcing shared classes across these two behaviors risks a future feedback-widget fix silently regressing the cart or vice versa; (3) task constraint explicitly forbids editing feedback-widget.css. This spec DOES reuse feedback-widget.css's proven *token values and interaction timing* (the `.fb-submit`/`.fb-input`/`.fb-field-error` visual treatments, the desktop-anchored/mobile-full-width responsive split) as a pattern reference — see inline citations above — which keeps the two surfaces visually consistent without coupling their code.
- **Persistent badge placement — sticky nav, not Explorer toolbar:** the task brief's "always-visible" requirement is only satisfiable from the sticky global nav, since the Explorer pane (and its toolbar) is hidden whenever Dashboard or Slice panes are active (`index.html:861`, `class="hidden"` by default, toggled by `paneMode`). Placing the badge in the Explorer toolbar next to `#explorer-csv-btn` would make it disappear exactly when a user has switched away after adding items — the opposite of "persistent." Flagging this as a deliberate placement call for T3 to confirm, since the PM brief didn't specify a location.
- **AddToCartButton padding deviates from the table's other pill badges** (`px-2 py-1` used for type/category/stage) — those are non-interactive status badges with no touch-target obligation; AddToCartButton is interactive and must clear 44×44px, so it uses `space-3`/`space-3` padding instead. Do not copy the compact badge padding onto this control.
- **Two structural (non-DESIGN.md) values used, flagged for transparency:** `#ffffff` (white, used as literal text-on-fill, not itself a DESIGN.md color entry but implied throughout DESIGN.md's own Component Rules table, e.g. hero `text-white`) and `stone-800 #292524` (used for the empty-state/success-state heading, matching DESIGN.md's own "Empty state" component rule wording "heading (`text-lg font-semibold`)" which doesn't pin an explicit color — `stone-800` is the app's established heading-on-white convention per multiple Component Rules rows, e.g. KPI card title, chart card title). Neither is a "raw hex invented for this spec" — both trace to established usage already present in DESIGN.md's own component rules; noting them explicitly rather than silently treating them as free-standing hex values.
- **Submit-disabled contrast flag:** `--color-text-secondary` (#57534e) on `--color-border-strong` (#d6d3d1) computes to roughly 3.7:1, below the 4.5:1 normal-text AA floor — however this exact pairing is the PRE-EXISTING, already-shipped `.fb-submit:disabled` treatment in feedback-widget.css (lines 395–401), reused here only because the task brief explicitly asks for endpoint-unconfigured to visually match established disabled-button conventions. Disabled controls are widely treated as exempt from the 4.5:1 text floor under WCAG 2.1 (disabled/inert UI components are excluded from the Success Criterion 1.4.3 contrast requirement), so this is not a new violation — but flagging it here so AUD doesn't need to re-derive the exemption reasoning from scratch, and so a future DESIGN.md pass could consider a dedicated `--color-disabled-text` token if this pattern keeps recurring.
- **Endpoint-unconfigured divergence from feedback-widget.css's own pattern:** feedback-widget.css hides the entire form and shows only an icon+message (`.fb-not-configured`) when unconfigured. This spec instead keeps the 4 request fields visible/editable with only Submit disabled, because the task brief's literal wording is "Submit disabled + message" (not "form hidden + message"), and because a sample request form has meaningfully more user-invested content (4 fields vs. feedback's single textarea) — hiding it after a user starts filling it in would be a more jarring loss than for the lighter-weight feedback widget. Flagging this explicit divergence for the record rather than letting FE discover a mismatch during implementation.
- **Cart-clearing side effect (flag for T3-FE and T2-BE, not decided here):** this spec assumes a successful submission clears the in-session cart (so CartReviewPanel naturally falls back to its empty state once the dialog's Close is pressed) — this is a reasonable default but is NOT a payload/backend decision and is explicitly out of this spec's scope to mandate; T3 should confirm the clear-on-success behavior against T2's contract before implementing.
- **Vanilla-stack note:** DESIGN.md's Constitution states this app is "HTML + Tailwind CDN + Chart.js... no framework imports." The component hierarchy above names Sheet/Dialog/Button/Input/Label/Textarea as a structural vocabulary only (parity of behavior/semantics with common component libraries) — T3-FE must implement all of it as plain HTML/CSS/vanilla-JS matching the rest of app.js's existing DOM-construction style (see renderTable's own `tr.innerHTML =` pattern), not as literal component-library imports.
  </notes>
</design_spec>
