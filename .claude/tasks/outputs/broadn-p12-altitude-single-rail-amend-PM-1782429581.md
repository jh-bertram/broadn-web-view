<plan_amendment task_id="broadn-p12-altitude-single-rail" packet_ref="broadn-p12-FE-001">

This amendment resolves the 3 Critic WARNINGs (CRITIQUE_PASS) on broadn-p12-FE-001. It is ADDITIVE: no re-decomposition, no packet add/remove, no dependency reorder. It edits item-1 and item-6 scope lines, adds SCs M7/M8/M9/B8, and adds one risk-flag + implementation note. All cited facts re-verified against live code (index.html:136/175, app.js:4108-4133).

<scope_edits>

  <edit target="description item 1 — RAIL MARKUP">
  REPLACE the item-1 sentence "Add a STORY group header ... ABOVE the existing EXPLORE group" with the explicit two-header instruction:
  - There is NO existing "EXPLORE" group today; the existing rail group header literally reads "Slice by" (index.html:136). RENAME that header text "Slice by" → "EXPLORE" in place (keep its element/classes; change only the text node).
  - ADD a new "STORY" group header (same `<p>` header pattern/classes as line 136) with its 4 items (Overview, Geography, Pipeline, Data Management) ABOVE the EXPLORE group.
  - Under EXPLORE, confirm the membership: All BROADN Samples, Project, Location, Lab Group, AND the new Explorer item all sit under the renamed EXPLORE header.
  - LABEL RECONCILIATION (PM decision, stated per the Critic's request): KEEP the existing item label "Location / Hub" (index.html:175) VERBATIM — do NOT normalize to §4's shorthand "Location". Rationale: "Location / Hub" is the established, more-informative label; §4's "Location" is IA shorthand in a bullet list, not a copy-string directive. Keeping it verbatim leaves the slice-btn-location id/handler/aria wiring untouched and avoids a gratuitous, orphan-risking label change. The FE must NOT rename this item.
  </edit>

  <edit target="description item 6 — MOBILE/COLLAPSE PARITY + estimated_new_lines">
  REPLACE the "confirm ... selecting ANY item closes the drawer" framing (which mis-states current behavior) with NEW-WIRING instruction:
  - closeMobileDrawer() (app.js:4108) is TODAY invoked ONLY by the close button (4338) and the overlay (4343). Selecting a rail item does NOT close the drawer — the slice-category handlers (slice-btn-all/project/location/labgroup) call renderView() but never closeMobileDrawer(). Close-on-select is NEW wiring, not a confirmation.
  - WIRE closeMobileDrawer() into EVERY rail selection handler: the new STORY items (×4), the new Explorer item, AND the existing slice-category buttons (slice-btn-all, slice-btn-project, slice-btn-location, slice-btn-labgroup).
  - REUSE closeMobileDrawer() and its existing focus-return (trigger.focus(), 4119); do NOT rebuild the drawer.
  - GUARD the close-on-select call so it fires only when the drawer is actually open (mobile / drawer-open state) — closeMobileDrawer() unconditionally calls trigger.focus() (4119), and the drawer trigger is hidden on desktop (lg:hidden), so an unguarded call on a desktop click would steal/relocate focus. Gate on drawer-open (e.g. overlay not `hidden`, or a viewport/aria-expanded check) before invoking on selection.
  - REVISE estimated_new_lines from ~5 to ~+20 for this item (net packet estimate ~125; the >100 no-split justification in the original packet still holds — single inseparable state-machine + nav refactor, no auditable intermediate).
  </edit>

</scope_edits>

<success_criteria_additions>

  <criterion id="M7" type="mechanical" addresses="W1">
  GROUP-HEADER LABELS: `grep -n '>EXPLORE<\|>STORY<' index.html` (or inspect the two rail group `<p>` headers) must show BOTH literal header strings "STORY" and "EXPLORE" rendered in #slice-sidebar, AND must show ZERO remaining "Slice by" header text (`grep -c 'Slice by' index.html` returns 0). Confirm the existing item label "Location / Hub" is unchanged (`grep -c 'Location / Hub' index.html` returns 1; it was NOT normalized to "Location"). Report the three grep results in the completion packet.
  </criterion>

  <criterion id="M8" type="mechanical" addresses="W2">
  CLOSE-ON-SELECT WIRING (enumerate-and-verify, not an exact count): enumerate every rail selection handler — the 4 STORY items, the Explorer item, and slice-btn-all/project/location/labgroup — and show that each one invokes closeMobileDrawer() (directly or via a shared select helper) behind the drawer-open guard. List each handler → call-site in the packet. ZERO selection handlers may omit the close call. Confirm closeMobileDrawer is REUSED (not re-implemented): `grep -c 'function closeMobileDrawer' assets/app.js` returns 1.
  </criterion>

  <criterion id="M9" type="mechanical" addresses="W3">
  ROVING-HANDLER COVERAGE: if STORY/Explorer items are rendered as `<button>`, getCategoryButtons() (app.js:4126-4133, today a hardcoded 4-button array) MUST be extended to include them so the existing roving ArrowUp/ArrowDown + Enter/Space handler (4135-4163) covers the new sole-nav items; quote the revised array. If STORY items are rendered as `data-section` anchors (`<a>`), they rely on native Tab focus + Enter activation — confirm each carries an href/role making it natively focusable and that aria-current is set on the keyboard-active item (consistent with B2). State which markup pattern was chosen and why the new items are reachable.
  </criterion>

  <criterion id="B8" type="browser" addresses="W3">
  DESKTOP KEYBOARD NAV (auditor, desktop viewport, post cache-bust): Tab reaches each new STORY item and the Explorer item; Enter/Space (and ArrowUp/ArrowDown if buttons) activates them — STORY item activation scrolls + sets aria-current; Explorer item activation opens explorer mode. No focus trap; focus order is logical top-to-bottom through STORY then EXPLORE. (B6 remains the mobile-drawer focus check; B8 is its desktop counterpart for the now-sole nav.)
  </criterion>

  <criterion id="B9" type="browser" addresses="explorer-third-state risk">
  EXPLORER IS A DISTINCT THIRD STATE: verify on the live walk that the explorer pane is a SEPARATE mode and does NOT reuse/overload the `cat===null` default branch. Concretely: B1 (default land → story, "All BROADN Samples") and B5 (return-to-All resets to story scroll) must pass UNCHANGED with the new explorer mode present — i.e. selecting Explorer then returning to "All BROADN Samples" restores the story default, proving explorer did not collide with the cat===null path. (Tightens existing risk-row-1 / B1 / B5.)
  </criterion>

</success_criteria_additions>

<implementation_notes>
  - EXPLORER STATE AXIS (fold into item 3): today the only state axis is filterState.slice.category (null = story default, non-null = slice). Explorer has NO current representation. The FE MUST introduce explorer as a DISTINCT pane mode (a third value/flag in the renderView pane-mode switch) — do NOT overload the cat===null path, which is the "All BROADN Samples" story default. Overloading it collides with B1/B5. The exact representation is the FE's call, but it must leave the cat===null default branch byte-functionally intact (per §6 risk row 1).
</implementation_notes>

<must_contain_additions>
  <item>M7 group-header grep results (STORY present, EXPLORE present, "Slice by" = 0, "Location / Hub" = 1)</item>
  <item>M8 close-on-select handler enumeration (each selection handler → closeMobileDrawer call-site, with the drawer-open guard)</item>
  <item>M9 roving-handler coverage statement (button-array extension OR anchor native-focus rationale)</item>
</must_contain_additions>

<risk_flags_additions>
  - EXPLORER THIRD-STATE COLLISION (High — Critic's top audit-time risk): the FE must NOT overload the cat===null default path for Explorer; it is a third pane mode. Collision would break the "All BROADN Samples" story default (B1) and return-to-default (B5). Mitigated by new SC B9 + the explorer-state-axis implementation note. Auditor must verify B1/B5 are unaffected by explorer mode on the live walk.
  - DESKTOP FOCUS-STEAL ON CLOSE-ON-SELECT (Med): closeMobileDrawer()'s unconditional trigger.focus() (4119) can relocate focus on a desktop selection where the drawer is not open. Mitigated by the drawer-open guard in item-6 wiring + M8.
  - NEW SOLE-NAV ITEMS OUTSIDE ROVING HANDLER (Med, A11Y / standards.md): getCategoryButtons() is a hardcoded 4-button array; new STORY/Explorer items are not auto-covered. Mitigated by M9 + B8 (extend the array if buttons, or confirm native anchor focusability).
</risk_flags_additions>

<unchanged>
  All other packet content stands: M1–M6, B1–B7, out_of_scope, the no-split determination (Critic CONFIRMED), the DESIGN.md / design_system_source=DESIGN_MD note, the FE-no-commit gate (M6), and the hash-routing (item 7) deferral. Dependency order, expectation manifest, and verbatim_deliverable_audit are unchanged.
</unchanged>

</plan_amendment>
