# DB Specialist — Evals

## Eval 1: New Entity Migration

**Prompt:**
> The backend needs a Project entity with: id (cuid), name (string, required), description (optional string), ownerId (FK to User, cascade delete), createdAt, updatedAt, deletedAt.

**Expected output structure:**
- Wraps result in `<data_packet>` XML
- `<action_type>` is `MIGRATION`
- `<affected_entities>` lists `projects`
- `<validation>` confirms referential integrity and indexes

**Quality assertions:**
- [ ] Uses `cuid()` as ID default
- [ ] All four base fields present: `id`, `createdAt`, `updatedAt`, `deletedAt`
- [ ] `deletedAt` is nullable (`DateTime?`) for soft delete support
- [ ] `ownerId` FK has an `@@index([ownerId])` — not just the relation declaration
- [ ] `onDelete: Cascade` is specified on the User relation
- [ ] Migration file has a descriptive comment block with reason and rollback stub
- [ ] `@@map("projects")` present for snake_case table naming
- [ ] No application-layer code (no API routes, no React)

---

## Eval 2: Many-to-Many with Explicit Join Table

**Prompt:**
> Add the ability for multiple users to be members of a project with different roles (admin, member, viewer). Use an explicit join model.

**Expected output structure:**
- `<data_packet>` with `<action_type>MIGRATION</action_type>`
- `<affected_entities>` includes the new join model
- `<validation>` confirms unique constraint on the pair

**Quality assertions:**
- [ ] Creates an explicit `ProjectMember` model — not Prisma's implicit `@@relation` many-to-many
- [ ] `@@unique([userId, projectId])` present to prevent duplicate memberships
- [ ] Both `userId` and `projectId` have `@@index` declarations
- [ ] `role` field uses a Prisma `enum` — not a raw string
- [ ] `onDelete: Cascade` on both User and Project relations
- [ ] Join model has its own `id`, `createdAt` base fields
- [ ] Rollback SQL included in migration comment

---

## Eval 3: Query Optimization Request

**Prompt:**
> The GET /projects endpoint is slow. It fetches all projects for a user, including their members count. Write the optimized Prisma query with proper includes and return the recommended index additions.

**Expected output structure:**
- `<data_packet>` with `<action_type>QUERY_OPTIMIZATION</action_type>`
- `<validation>` explains why the recommended indexes improve the query

**Quality assertions:**
- [ ] Uses `_count` include for members count — not a separate query
- [ ] Filters by `deletedAt: null` in the where clause
- [ ] Recommends composite index if filtering by multiple columns
- [ ] Uses `$transaction([count, findMany])` pattern for paginated response
- [ ] Does not suggest `$queryRawUnsafe`
- [ ] Explains the N+1 problem if it was present in the original query
