# Frontend Engineer — Evals

## Eval 1: Form Component with Validation

**Prompt:**
> Build a "Create Project" form component. Fields: name (required), description (optional textarea), and a submit button. Use the CreateProjectInputSchema from the backend. Show field-level validation errors. Show a loading state while submitting.

**Expected output structure:**
- Wraps result in `<ui_packet>` XML
- `<components_created>` lists the component path
- `<state_hydration_map>` describes how BE schema maps to form state
- `<a11y_verification>` is populated
- `<integration_status>` is present

**Quality assertions:**
- [ ] Uses `react-hook-form` with `zodResolver` — not manual `useState` per field
- [ ] `<integration_status>` is MOCKED if no live API exists yet (not SUCCESS)
- [ ] Loading state renders a disabled button or spinner — not just text change
- [ ] Each form field has a `<label>` associated via `htmlFor` / `id`
- [ ] Error messages are rendered using `FormMessage` (not `<p>` with raw state)
- [ ] No hardcoded hex colors — only Tailwind design tokens
- [ ] No raw CSS files created

**Anti-patterns to flag:**
- `useState` for form field values
- Inline style attributes
- `<input>` without associated `<label>`

---

## Eval 2: Data Table with Loading and Empty States

**Prompt:**
> Build a ProjectsTable component that displays a list of projects with columns: Name, Owner, Created At, and an Actions menu. Handle loading, empty, and error states.

**Expected output structure:**
- `<ui_packet>` present
- `<components_created>` lists the table component and any sub-components
- `<a11y_verification>` confirms table headers use `<th>` with scope attributes
- `<state_hydration_map>` shows how the projects data prop maps to rows

**Quality assertions:**
- [ ] Uses Shadcn `Table`, `TableHeader`, `TableRow`, `TableCell` — not a raw `<table>`
- [ ] Loading state uses `<Skeleton>` rows — not a spinner over the whole table
- [ ] Empty state has a message component — not just an empty table with headers
- [ ] Error state renders an `<Alert variant="destructive">`
- [ ] Actions column uses Shadcn `DropdownMenu` — not raw `<button>` with absolute positioning
- [ ] Table column headers have accessible sort indicators if sortable

---

## Eval 3: Modal with Form

**Prompt:**
> Build an "Edit Project" modal that opens from the Actions menu in the projects table. Pre-populate fields from the selected project. Optimistically update the table on submit.

**Expected output structure:**
- `<ui_packet>` present
- `<state_hydration_map>` explains optimistic update flow
- `<integration_status>` is either SUCCESS (wired) or MOCKED (needs BE)

**Quality assertions:**
- [ ] Uses Shadcn `Dialog` — not a custom overlay
- [ ] Form is pre-populated using `defaultValues` from selected project data
- [ ] Optimistic update uses TanStack Query `useMutation` with `onMutate` / `onError` rollback — not manual state
- [ ] Modal closes on successful submit
- [ ] Escape key closes modal (handled by Shadcn Dialog automatically — verify this isn't disabled)
- [ ] Focus returns to the triggering button on close
