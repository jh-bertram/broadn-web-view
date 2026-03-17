# Agent Evals

This directory contains test cases for verifying agent output quality. Each agent has its own eval file with 2–3 realistic test prompts and expected output characteristics.

## Purpose

When an agent's `.md` file is updated, run its eval set to verify the change doesn't degrade output quality. This is the regression test layer for agent prompts.

## Structure

```
evals/
├── README.md           (this file)
├── backend.evals.md
├── frontend.evals.md
├── database.evals.md
├── auditor.evals.md
├── archivist.evals.md
├── researcher.evals.md
├── pm.evals.md
├── ui-designer.evals.md
└── dispatcher.evals.md
```

## How to Run an Eval

1. Open a fresh Claude Code session (no prior context)
2. Load the agent file being tested as context
3. Give it the test prompt from the eval file
4. Compare the output against the assertions listed

## Eval Format

Each eval file contains:
- **Prompt:** The realistic user input that triggers this agent
- **Expected output structure:** Which XML tags and fields must be present
- **Quality assertions:** Specific things the output must / must not contain
- **Baseline comparison:** What a non-agent response looks like (to confirm the agent adds value)

## Updating Evals

When an agent's behavior intentionally changes:
1. Update the eval file to reflect new expected behavior
2. Run the eval to confirm the new behavior is consistent
3. Note the change in `docs/project_log.md`
