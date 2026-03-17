# Backend Engineer — Evals

## Eval 1: New API Endpoint with Zod Schema

**Prompt:**
> Add a POST /api/projects endpoint. It should accept a name (required, 1–100 chars), description (optional, max 500 chars), and ownerId (required UUID). Return the created project.

**Expected output structure:**
- Wraps result in `<completion_packet>` XML
- `<zod_contract>` field is present and contains a schema definition
- `<files_changed>` lists at least one file path
- `<test_traceback>` contains a dry-run or test result (not empty)

**Quality assertions:**
- [ ] The Zod schema validates all three input fields (`name`, `description`, `ownerId`)
- [ ] `ownerId` uses `z.string().uuid()` — not just `z.string()`
- [ ] `description` is marked optional (`.optional()` or `.nullable()`)
- [ ] Response schema is defined, not just input schema
- [ ] No HTML, JSX, or CSS appears in the output
- [ ] No direct database migration code — only Prisma query usage
- [ ] `<critical_logic_notes>` is populated (not empty)

**Anti-patterns to flag (fail if present):**
- Raw SQL strings or `$queryRawUnsafe`
- `any` type without justification comment
- Response that skips the `<completion_packet>` wrapper

---

## Eval 2: Auth Middleware Integration

**Prompt:**
> Add authentication middleware to the /api/projects routes. Verify the JWT, extract the user ID, and attach it to the request. Reject requests with no token or an expired token with appropriate HTTP status codes.

**Expected output structure:**
- `<completion_packet>` present
- `<zod_contract>` contains `JwtPayload` or equivalent schema
- `<test_traceback>` shows both success and rejection paths tested

**Quality assertions:**
- [ ] Uses `z.object()` to validate the JWT payload shape after verification
- [ ] Returns 401 for missing token, 403 for expired/invalid token (or documents the distinction)
- [ ] Does not hardcode the JWT secret — references `process.env`
- [ ] Does not return the full JWT payload to the client
- [ ] `<critical_logic_notes>` explains the token verification library chosen and why

---

## Eval 3: Pagination on List Endpoint

**Prompt:**
> Add pagination to GET /api/projects. Support page and pageSize query params. Return the data array and pagination metadata (total count, total pages, current page).

**Expected output structure:**
- `<completion_packet>` present
- Response schema includes both `data` array and `pagination` object
- `<test_traceback>` includes a test with page=2, pageSize=5

**Quality assertions:**
- [ ] Uses `z.coerce.number()` for query params (they arrive as strings)
- [ ] Enforces a maximum `pageSize` (e.g., max 100)
- [ ] Returns `total`, `totalPages`, and `page` in pagination metadata
- [ ] Handles edge case: page beyond last page returns empty array, not error
- [ ] Uses `skip` + `take` pattern (not offset/limit raw SQL)
