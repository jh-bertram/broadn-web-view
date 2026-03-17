---
name: convention-detect
description: Scan the active project and produce a structured <project_conventions> block for inclusion in orchestrator_brief. Fast, read-only. Run at Step 0.5 before PM decomposition so every downstream agent works from the same grounding.
---

# Convention Detect

Scan the project in the current working directory and produce a `<project_conventions>` block. This block travels in every `orchestrator_brief` and is included verbatim in the `<context>` field. It eliminates the "agent assumed wrong test runner" class of first-pass audit failures.

This is a read-only, zero-decision task. Do not make recommendations. Do not evaluate quality. Detect and report.

---

## Step 1: Scan for Signal Files

Check for each of the following in order. Record what you find; record "not found" explicitly — do not omit absent entries.

### Package Manager
Check for lock files:
- `package-lock.json` → npm
- `yarn.lock` → yarn
- `pnpm-lock.yaml` → pnpm
- `bun.lockb` → bun
- `Cargo.lock` → cargo (Rust)
- `go.sum` → go modules

### Language / Runtime
- `tsconfig.json` → TypeScript; record `strict`, `target`, `module` values if present
- `pyproject.toml` or `setup.py` → Python; record Python version if found
- `go.mod` → Go; record module name
- `Cargo.toml` → Rust; record edition

### Test Runner
Check for config files in priority order:
- `vitest.config.*` → vitest
- `jest.config.*` → jest
- `pytest.ini` or `[tool.pytest]` in `pyproject.toml` → pytest
- `.mocharc.*` → mocha
- If none found, check `package.json` `scripts` for `test` key and record the command verbatim

### Linter / Formatter
- `eslint.config.*` or `.eslintrc.*` → eslint; record whether it extends a known config (e.g., `plugin:@typescript-eslint/recommended`)
- `.prettierrc.*` or `prettier` key in `package.json` → prettier
- `ruff.toml` or `[tool.ruff]` → ruff (Python)
- `.golangci.yml` → golangci-lint

### Build System
- `vite.config.*` → vite
- `next.config.*` → Next.js
- `webpack.config.*` → webpack
- `turbo.json` → turborepo
- `Makefile` → make; record available targets
- `tsup.config.*` → tsup

### Scripts (from package.json)
If `package.json` exists, read the `scripts` object and record all keys and their values verbatim. These are the canonical commands — do not infer from elsewhere.

### Directory Structure (top-level only)
List top-level directories. Note which of these standard paths exist:
- `src/`, `lib/`, `app/`, `packages/`, `apps/`
- `tests/`, `__tests__/`, `spec/`, `e2e/`
- `docs/`, `scripts/`, `public/`, `dist/`, `build/`

### Monorepo Detection
If `packages/` or `apps/` directories exist at the root, check for `turbo.json`, `pnpm-workspace.yaml`, or `workspaces` in `package.json`. If any found, record as monorepo and list workspace package names.

---

## Step 2: Produce the Block

Write the output as a `<project_conventions>` XML block. Every field must be populated — use `"not found"` rather than omitting a field.

```xml
<project_conventions>
  <package_manager>{npm | yarn | pnpm | bun | cargo | go | not found}</package_manager>
  <language>{TypeScript | JavaScript | Python | Go | Rust | not found}</language>
  <typescript_strict>{true | false | not found}</typescript_strict>
  <test_runner>{vitest | jest | pytest | mocha | not found}</test_runner>
  <test_command>{exact command from scripts.test, e.g. "vitest run" | not found}</test_command>
  <lint_command>{exact command from scripts.lint, e.g. "eslint src --ext .ts" | not found}</lint_command>
  <typecheck_command>{exact command from scripts.typecheck or tsc invocation | not found}</typecheck_command>
  <build_command>{exact command from scripts.build | not found}</build_command>
  <dev_command>{exact command from scripts.dev or scripts.start | not found}</dev_command>
  <build_system>{vite | next | webpack | turbo | make | tsup | not found}</build_system>
  <monorepo>{true | false}</monorepo>
  <monorepo_tool>{turborepo | pnpm workspaces | yarn workspaces | not found}</monorepo_tool>
  <workspaces>
    {if monorepo: one <workspace> element per package with name and path}
    {if not monorepo: <none/>}
  </workspaces>
  <key_directories>
    {one <dir> element per top-level directory that exists}
  </key_directories>
  <all_scripts>
    {one <script name="{key}">{value}</script> per entry in package.json scripts}
    {if no package.json: <none/>}
  </all_scripts>
</project_conventions>
```

---

## Step 3: Write the Output

Write the `<project_conventions>` block to `docs/project-conventions.md` so it persists across the sprint and doesn't need to be re-detected.

If the file already exists and the content is identical, skip the write. If the content differs (dependencies changed, new config added), overwrite it and note the diff in a comment at the top of the file.

---

## Usage

The orchestrator calls this skill at Step 0.5. The resulting block is pasted verbatim into the `<context>` field of the `orchestrator_brief`. The PM includes it in every `<task_packet>`. Implementing agents read it to know the exact commands to use — they do not re-scan.

If the project has no `package.json`, no lock files, and no recognizable config files, output a `<project_conventions>` block with all fields set to `"not found"` and add a `<note>` field: "No build system detected. Verify working directory is correct before proceeding."
