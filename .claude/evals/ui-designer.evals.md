# UI Designer — Evals

## Eval 1: New Page Layout Spec

**Prompt:**
> Design the Projects List page. It should have a sidebar navigation, a header with a "New Project" button, a data table of projects, and empty + loading states.

**Expected output structure:**
- Wraps result in `<design_spec>` XML
- All required sections present: `<component_hierarchy>`, `<layout>`, `<states>`, `<tokens>`, `<interactions>`

**Quality assertions:**
- [ ] `<component_hierarchy>` uses Shadcn component names where applicable (`Sidebar`, `Table`, `Button`, etc.)
- [ ] Empty state and loading state both specified in `<states>` — not just default state
- [ ] `<tokens>` entries reference token names — no raw hex values
- [ ] `<layout>` specifies responsive behavior for at least two breakpoints
- [ ] `<interactions>` covers the "New Project" button click behavior
- [ ] No implementation prescriptions (no `className=`, no `px-6`)
- [ ] No application code (no JSX, no TypeScript)

---

## Eval 2: Component State Specification

**Prompt:**
> Design the ProjectCard component. It should show project name, member count, last updated date, and an action menu. Specify all interactive and status states.

**Expected output:**
- `<design_spec>` with comprehensive state coverage

**Quality assertions:**
- [ ] At minimum 4 states: default, hover, loading, error
- [ ] Action menu specified as Shadcn `DropdownMenu` — not custom
- [ ] All typography uses project type scale tokens — no raw font sizes
- [ ] Spacing values reference the spacing scale — not pixel values
- [ ] `<interactions>` specifies: hover behavior, menu open behavior, keyboard focus state
- [ ] Loading state described as skeleton shape matching card layout

---

## Eval 3: Form Design with Validation States

**Prompt:**
> Design the "Invite Member" form. Fields: email input, role selector (admin/member/viewer). Include states for: empty, valid input, invalid email, API error, and success.

**Expected output:**
- `<design_spec>` covering all five states

**Quality assertions:**
- [ ] Role selector specified as Shadcn `Select` — not native `<select>` or radio buttons
- [ ] All five states in `<states>` section
- [ ] Error state describes visual treatment (border color token, error message position)
- [ ] Success state specified — not just assumed to close the form
- [ ] Token names are real design tokens — not `red` or `green` but `destructive` / `success` etc.
- [ ] Does not prescribe implementation details (no `z.string().email()`, no `useState`)
