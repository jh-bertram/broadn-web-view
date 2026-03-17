# Code Auditor — Evals

## Eval 1: Catch a Missing Zod Schema (SA failure)

**Prompt — provide this code for review:**
```ts
// POST /api/projects
app.post('/api/projects', async (req, res) => {
  const { name, description, ownerId } = req.body
  const project = await prisma.project.create({
    data: { name, description, ownerId }
  })
  res.json({ project })
})
```

**Expected output:**
- Standards check returns `FAIL`
- Does NOT proceed to QA or security scan (stops at first fail)

**Quality assertions:**
- [ ] `<audit_review>` `<status>` is `FAIL`
- [ ] Violation cites missing Zod input validation at API boundary
- [ ] `<rule>` references a rule from `standards.md` — not a generic statement
- [ ] `<remediation>` specifies wrapping `req.body` with a Zod schema — not just "validate input"
- [ ] QA and SX blocks are absent (correct — stopped at SA)

---

## Eval 2: Catch an IDOR Vulnerability (SX failure, after SA/QA pass)

**Prompt — provide this code for review:**
```ts
const UpdateProjectInputSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
})

app.patch('/api/projects/:id', authenticate, async (req, res) => {
  const input = UpdateProjectInputSchema.parse(req.body)
  const project = await prisma.project.update({
    where: { id: req.params.id },
    data: input,
  })
  res.json({ success: true, data: project })
})
```

**Expected output:**
- SA PASS (Zod schema present, standards met)
- QA PASS (assume tests pass)
- SX FAIL — IDOR: the query doesn't verify the requesting user owns the project

**Quality assertions:**
- [ ] SA status is PASS
- [ ] SX status is VULNERABLE
- [ ] `<type>` is `IDOR` or equivalent
- [ ] `<location>` points to the `prisma.project.update` line
- [ ] `<description>` explains the exploit: any authenticated user can update any project by guessing the ID
- [ ] `<mitigation>` specifies adding `ownerId: req.user.id` to the `where` clause — not a vague "add auth check"

---

## Eval 3: Clean Code Passes All Checks

**Prompt — provide this code for review:**
```ts
const CreateProjectInputSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

app.post('/api/projects', authenticate, async (req, res) => {
  const input = CreateProjectInputSchema.parse(req.body)
  const project = await prisma.project.create({
    data: { ...input, ownerId: req.user.id },
  })
  res.json({ success: true, data: project })
})
```

**Expected output:**
- All three checks PASS
- Output is brief — no verbose commentary

**Quality assertions:**
- [ ] All three status blocks present (SA, QA, SX)
- [ ] All show PASS or SECURE
- [ ] No positive reinforcement text ("great job", "looks good", "well done")
- [ ] No suggestions for "nice to have" improvements — only compliance checking
- [ ] Total output is short (no padding)
