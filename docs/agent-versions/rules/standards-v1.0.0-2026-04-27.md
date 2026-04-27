# Gander Code Standards

## TypeScript
- Strict mode enabled. No `any` without explicit justification in a comment.
- All function parameters and return types annotated.
- Prefer `unknown` over `any` for external data.

## Zod
- Every API boundary (input and output) gets a Zod schema.
- Schema names: `<Entity>Schema` for objects, `<Entity>InputSchema` for request bodies.
- Infer TypeScript types from schemas: `type Entity = z.infer<typeof EntitySchema>`.

## Naming Conventions
- Files: `kebab-case.ts`
- Components: `PascalCase.tsx`
- Functions/variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Database tables: `snake_case`

## DRY Rules
- No duplicated logic. Extract shared logic to utils before the second use.
- No copy-pasted Zod schemas. Import and extend.

## Accessibility (A11Y)
- All interactive elements must be keyboard-navigable.
- All images must have `alt` text.
- Color contrast must meet WCAG AA (4.5:1 for normal text).
- Use semantic HTML elements.

## Git
- Commit messages: `<type>(<scope>): <description>` (Conventional Commits).
- Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.
- Every commit must include a rationale in the body.
- No commits exceeding 50 lines of new code without a verification gate passed first.

## Security Baseline
- No hardcoded secrets. Use environment variables.
- Validate all user input with Zod at the API boundary.
- Sanitize database query parameters (use ORM parameterization — never string interpolation).
- Dependencies: run `npm audit` before any merge to main.
