---
name: visual-inspect
description: Run a structured visual and accessibility inspection of a live web page using Playwright MCP tools. Produces an <observed_state> block (when gathering context for a new spec) or a <visual_audit> block (when auditing an existing implementation). Any agent with the Playwright MCP tools declared can invoke this skill.
---

## When To Use

- **New component or page design:** UI Designer needs the current rendered context before writing a spec — grounding token choices, spacing, and hierarchy in the actual page rather than inferred source values.
- **Post-implementation audit:** Verify that a shipped component matches the design spec it was built from. Catches rendering bugs, CSS specificity overrides, and Tailwind purge issues that source-read misses.
- **Visual regression check:** Orchestrator or Auditor wants to compare visual state before and after a feature sprint.

## Prerequisites

- The page must be served (dev server running) or openable as a static file.
- For static HTML files, use `file:///absolute/path/to/index.html` as the URL — note the triple slash and the absolute path from the filesystem root.
- For dev servers, confirm the port before invoking: read `package.json` scripts if not given in the task brief (Vite default: 5173).

## Required Tools

```
mcp__playwright__browser_navigate
mcp__playwright__browser_wait_for
mcp__playwright__browser_take_screenshot
mcp__playwright__browser_snapshot
mcp__playwright__browser_console_messages
mcp__playwright__browser_close
```

## 7-Step Procedure

### Step 1 — Navigate to the page

```
mcp__playwright__browser_navigate  { "url": "<target URL>" }
```

Use the URL provided in the task brief. For static files: `file:///home/user/project/dist/index.html`. Do not proceed if navigation fails — surface the error.

### Step 2 — Wait for render completion

```
mcp__playwright__browser_wait_for  { "selector": "body", "timeout": 10000 }
```

**What to look for:** confirmation that the page has loaded. If the page uses Chart.js, D3, or any JS-rendered canvas: wait for `canvas` selector instead, with `timeout: 15000`. If the page has a known loading spinner, wait for a selector that only appears after loading completes.

### Step 3 — Take a full-page screenshot

```
mcp__playwright__browser_take_screenshot  {}
```

**What to evaluate from the screenshot:**

| Signal | What to look for |
|---|---|
| Spacing rhythm | Are gaps between sections consistent? Does a 4px/8px/16px/24px/32px grid appear to be followed? Flag any gap that does not fit the scale. |
| Visual hierarchy | Does the most important element draw the eye first? Is h1 visually dominant over h2 and body copy? Is there a clear size progression? |
| Color restraint | Count distinct functional colors. More than 5 is palette bloat — flag it. |
| Alignment | Do column edges align across rows? Do labels align with their data values? |
| Typography ratio | Are there at least 3 distinct text size levels? Is body copy distinguishable from labels and headings? |

Record observations as concrete notes: "Section header is 24px, body is 14px — 1.7x ratio, weak hierarchy" rather than generic impressions.

### Step 4 — Snapshot the accessibility tree

```
mcp__playwright__browser_snapshot  {}
```

**What to evaluate from the snapshot:**

Run through this checklist:
- [ ] Exactly one `h1` on the page
- [ ] No skipped heading levels (h1 → h3 without h2 is a failure; flag the gap)
- [ ] All images have non-empty accessible names (`alt` attribute or `aria-label`)
- [ ] All interactive elements (buttons, links, inputs) have accessible names
- [ ] At least one `main` landmark present
- [ ] At least one `header` or `banner` landmark present
- [ ] No interactive elements with `role="none"` or `tabindex="-1"` that should be keyboard-reachable
- [ ] Tables have a caption or `aria-label`; `th` elements present with `scope` attribute

The snapshot does NOT include computed CSS color values. Color contrast must be verified via source token reading + the WCAG quick reference below.

### Step 5 — Check console for rendering errors

```
mcp__playwright__browser_console_messages  {}
```

**What to look for:** any message with `type: "error"`. These indicate the page is in an abnormal rendering state. Note each error before evaluating aesthetics — a JS error may suppress visual content and make the aesthetic evaluation unreliable.

Warnings are informational; errors are blockers for reliable evaluation.

### Step 6 — Aesthetic evaluation

Using observations from Step 3 (screenshot) and Step 4 (snapshot), score the five aesthetic signals:

1. **Spacing rhythm** — CONSISTENT or INCONSISTENT. Note which elements break the scale.
2. **Visual hierarchy** — CLEAR or UNCLEAR. Cite the heading/body size relationship.
3. **Color restraint** — PASS (≤5 functional colors) or FAIL (>5). List the colors in use.
4. **Alignment** — ALIGNED or MISALIGNED. Note any specific misaligned elements.
5. **Typography ratio** — CLEAR (3+ distinct levels) or FLAT (fewer than 3 levels).

### Step 7 — Close the browser

```
mcp__playwright__browser_close  {}
```

Always close after inspection. Do not leave browser sessions open.

---

## Output Format

### When gathering context for a new spec (Mode A)

Feed observations into the `<observed_state>` field of the `<design_spec>`:

```xml
<observed_state>
  <screenshot_taken>yes</screenshot_taken>
  <visual_notes>[spacing, hierarchy, color, alignment, and typography observations from Step 3 and Step 6]</visual_notes>
  <accessibility_tree_findings>[heading structure, landmark issues, missing labels from Step 4 checklist]</accessibility_tree_findings>
  <console_errors>[JS errors from Step 5, or "none"]</console_errors>
</observed_state>
```

### When auditing an existing implementation (Mode B)

Produce a standalone `<visual_audit>` block:

```xml
<visual_audit>
  <task_id>[task being audited]</task_id>
  <screenshot_observations>[what was seen — layout, spacing, color, alignment; cite Step 3 and Step 6 findings]</screenshot_observations>
  <accessibility_tree_findings>[heading structure, landmarks, ARIA issues from Step 4 checklist]</accessibility_tree_findings>
  <console_errors>[JS errors from Step 5, or "none"]</console_errors>
  <spec_compliance>[PASS / PARTIAL / FAIL — with specific deviations noted]</spec_compliance>
</visual_audit>
```

`PARTIAL` means some spec requirements are met and some are not — list each deviation. `FAIL` means the implementation does not reflect the spec in material ways. Route `PARTIAL` or `FAIL` results back to the spawning agent with deviation detail so the implementing agent can remediate.

---

## WCAG Contrast Quick Reference

AA threshold: 4.5:1 for normal text, 3:1 for large text (18pt+ or 14pt bold). AAA threshold: 7:1.

### Common Tailwind pairs against white background

| Foreground token | Hex | Approx. ratio vs. white | AA normal | AA large |
|---|---|---|---|---|
| `text-gray-900` | #111827 | 19.1:1 | PASS | PASS |
| `text-gray-700` | #374151 | 10.7:1 | PASS | PASS |
| `text-gray-600` | #4B5563 | 7.0:1 | PASS | PASS |
| `text-gray-500` / `text-stone-500` | #6B7280 | 4.6:1 | PASS | PASS |
| `text-gray-400` / `text-stone-400` | #9CA3AF | 2.8:1 | FAIL | FAIL |
| `text-gray-300` | #D1D5DB | 1.6:1 | FAIL | FAIL |
| `text-blue-600` | #2563EB | 5.9:1 | PASS | PASS |
| `text-blue-500` | #3B82F6 | 4.0:1 | FAIL | PASS |
| `text-red-600` | #DC2626 | 4.6:1 | PASS | PASS |
| `text-green-800` | #166534 | 8.9:1 | PASS | PASS |
| `text-orange-700` | #C2410C | 4.6:1 | PASS (borderline) | PASS |
| `text-yellow-400` | #FACC15 | 1.9:1 | FAIL | FAIL |

(Source: Tailwind v3 color hex values; ratios computed via WCAG relative luminance formula: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance)

For pairs not listed: use the formula `(L1 + 0.05) / (L2 + 0.05)` where L is relative luminance and L1 is the lighter value. Tailwind v3 color hex values are at https://tailwindcss.com/docs/customizing-colors.

---

## Notes on Static HTML Files

When the task brief refers to a local HTML file with no dev server, construct the URL as:
```
file:///absolute/path/to/file.html
```
Example: `file:///home/jhber/projects/broadn-web-view/apps/dashboard/dist/index.html`

Do not use relative paths. The `file://` protocol requires three slashes followed by an absolute filesystem path. If the file path is unknown, use `Read` and `Glob` to locate it before invoking `browser_navigate`.
