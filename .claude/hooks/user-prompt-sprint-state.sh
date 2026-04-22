#!/usr/bin/env bash
# Hook: user-prompt-sprint-state (PROTOTYPE)
# Trigger: UserPromptSubmit — fires on every human message.
#
# Purpose: inject lightweight orientation context so Claude stops asking
# "what branch are we on" / "is there a sprint in flight" every other turn.
#
# Injects:
#   - Current git branch
#   - Short git status summary (modified/untracked counts)
#   - Sprint-in-flight indicator: count of SPAWNs in today's event log
#     without a matching COMPLETE/FAIL/AUDIT_*
#   - Most recent session checkpoint name + mtime, if any
#
# Guardrails:
#   - Silent no-op if cwd isn't a git repo
#   - Hard cap on output size — no full diffs, no raw status, just counts
#   - Skip injection on prompts that start with "/" (slash commands carry
#     their own scoped context)
#
# This hook is user-facing on every turn, so performance matters: it runs
# git + a small python block. Should stay under ~100ms on a healthy repo.
#
# Scope: prototype lives at broadn project level. If it earns its keep,
# promote to ~/.claude/hooks/ later.

set -euo pipefail

EVENT=$(cat)

PROMPT=$(python3 -c "
import sys, json
try:
    d = json.loads(sys.stdin.read())
    print(d.get('prompt', ''))
except Exception:
    pass
" <<< "$EVENT" 2>/dev/null || true)

# Skip slash commands — they bring their own framing.
if [[ "$PROMPT" == /* ]]; then
  exit 0
fi

PROJECT_ROOT="${CLAUDE_PROJECT_DIR:-}"
if [[ -z "$PROJECT_ROOT" ]]; then
  PROJECT_ROOT=$(python3 -c "
import sys, json
try:
    d = json.loads(sys.stdin.read())
    print(d.get('cwd', ''))
except Exception:
    pass
" <<< "$EVENT" 2>/dev/null || true)
fi
PROJECT_ROOT="${PROJECT_ROOT:-$PWD}"

# Bail silently if not a git repo
if ! git -C "$PROJECT_ROOT" rev-parse --git-dir >/dev/null 2>&1; then
  exit 0
fi

BRANCH=$(git -C "$PROJECT_ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "?")
STATUS_LINES=$(git -C "$PROJECT_ROOT" status --porcelain 2>/dev/null || true)

MODIFIED=$(echo "$STATUS_LINES" | grep -c '^.M' || true)
STAGED=$(echo "$STATUS_LINES" | grep -cE '^[MADRC]' || true)
UNTRACKED=$(echo "$STATUS_LINES" | grep -c '^??' || true)
DELETED=$(echo "$STATUS_LINES" | grep -c '^.D' || true)

# Normalize (grep -c can return "0" via || true)
MODIFIED=${MODIFIED:-0}
STAGED=${STAGED:-0}
UNTRACKED=${UNTRACKED:-0}
DELETED=${DELETED:-0}

export PROJECT_ROOT BRANCH MODIFIED STAGED UNTRACKED DELETED

python3 - <<'PYEOF'
import json, os, sys
from datetime import datetime, timezone
from pathlib import Path

root = Path(os.environ["PROJECT_ROOT"])
branch = os.environ.get("BRANCH", "?")
modified = os.environ.get("MODIFIED", "0")
staged = os.environ.get("STAGED", "0")
untracked = os.environ.get("UNTRACKED", "0")
deleted = os.environ.get("DELETED", "0")

# Sprint in-flight check: today's event log for open SPAWNs
today = datetime.now(timezone.utc).date().isoformat()
events_file = root / "docs" / "events" / f"agent-events-{today}.jsonl"
open_spawns = []
if events_file.exists():
    spawned, terminal = {}, set()
    for line in events_file.read_text().splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            ev = json.loads(line)
        except json.JSONDecodeError:
            continue
        tid = ev.get("task_id", "")
        evt = ev.get("ev", "")
        if evt == "SPAWN":
            spawned[tid] = ev.get("agent_id", "?")
        elif evt in ("COMPLETE", "FAIL", "AUDIT_PASS", "AUDIT_FAIL"):
            terminal.add(tid)
    open_spawns = [(tid, aid) for tid, aid in spawned.items() if tid not in terminal]

# Most recent checkpoint
outputs_dir = root / ".claude" / "agents" / "tasks" / "outputs"
checkpoint = None
if outputs_dir.exists():
    cps = sorted(outputs_dir.glob("SESSION-CHECKPOINT-*.md"))
    if cps:
        checkpoint = cps[-1]
legacy = root / "docs" / "SESSION-CHECKPOINT.md"
if checkpoint is None and legacy.exists():
    checkpoint = legacy

lines = [f"branch: `{branch}`"]
status_parts = []
if int(staged):
    status_parts.append(f"{staged} staged")
if int(modified):
    status_parts.append(f"{modified} modified")
if int(deleted):
    status_parts.append(f"{deleted} deleted")
if int(untracked):
    status_parts.append(f"{untracked} untracked")
if not status_parts:
    status_parts = ["clean"]
lines.append("working tree: " + ", ".join(status_parts))

if open_spawns:
    lines.append(f"sprint in flight: {len(open_spawns)} open SPAWN(s) in today's event log — {', '.join(f'{a}/{t}' for t, a in open_spawns[:3])}")
else:
    lines.append("sprint in flight: none (no open SPAWNs today)")

if checkpoint:
    mtime = datetime.fromtimestamp(checkpoint.stat().st_mtime)
    age_days = (datetime.now() - mtime).days
    rel = checkpoint.relative_to(root)
    lines.append(f"latest checkpoint: `{rel}` ({age_days}d old)")

# Keep under 6 lines; wrap in a small heading
ctx = "## Session state (auto-injected)\n" + "\n".join(f"- {l}" for l in lines)

print(json.dumps({
    "hookSpecificOutput": {
        "hookEventName": "UserPromptSubmit",
        "additionalContext": ctx,
    }
}))
PYEOF

exit 0
