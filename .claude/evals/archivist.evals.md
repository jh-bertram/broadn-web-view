# Archivist — Evals

## Eval 1: Task Completion Log Entry

**Prompt:**
> Task PROJ-003 (FE: Create Project form) passed audit. The team chose react-hook-form over Formik because of Zod resolver compatibility. Log the completion.

**Expected output:**
- Appends an `<archive_entry>` to `docs/project_log.md`

**Quality assertions:**
- [ ] `<timestamp>` is ISO-8601 format
- [ ] `<task_id>` matches PROJ-003
- [ ] `<event_type>` is `TASK_COMPLETE`
- [ ] `<rationale>` explains the react-hook-form choice and why Formik was rejected
- [ ] `<dependencies>` links to the BE schema task that provided the Zod contract
- [ ] `<retention_keys>` lists the component path and form library choice for next session
- [ ] Does NOT write application code
- [ ] Entry is concise — not a narrative

---

## Eval 2: Context Compression

**Prompt:**
> The session is long. We've completed PROJ-001 (DS), PROJ-002 (BE), PROJ-003 (FE). PROJ-004 (email) is blocked — no provider chosen. Produce a context snapshot.

**Expected output:**
- Writes a snapshot file to `docs/snapshots/[date]-snapshot.md`
- Moves history to `docs/history/`

**Quality assertions:**
- [ ] Snapshot is under 200 lines
- [ ] Uses headers and bullet points — not prose paragraphs
- [ ] All four task statuses present: DONE×3, BLOCKED×1
- [ ] PROJ-004 block reason included
- [ ] Key file paths listed under each completed task
- [ ] Unresolved decisions section present (email provider choice)
- [ ] Does NOT include granular chat history in the snapshot

---

## Eval 3: Architecture Decision Record

**Prompt:**
> We decided to use Prisma instead of Drizzle. The researcher found Drizzle is faster at raw queries but Prisma's migration tooling and TypeScript integration are more mature. Record this.

**Expected output:**
- `<archive_entry>` with `<event_type>ARCHITECTURE</event_type>`

**Quality assertions:**
- [ ] `<rationale>` includes BOTH the reason for choosing Prisma AND the reason Drizzle was rejected
- [ ] `<dependencies>` references the researcher's dossier
- [ ] `<retention_keys>` includes "ORM: Prisma" so future sessions don't re-open this decision
- [ ] Entry is a decision record — not a tutorial on Prisma
