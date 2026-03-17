#!/usr/bin/env bash
# Hook: agent-stop-checkpoint
# Trigger: Stop event (fires when any agent session ends — including context exhaustion)
#
# Purpose: Detect agents with a SPAWN but no COMPLETE in today's event log.
# For each detected incomplete agent, append an INTERRUPTED marker to their latest.md.
# This ensures the log always reflects reality even if the agent couldn't write Stage 3.
#
# Limitation: This hook cannot access the agent's in-memory state — it can only
# mark the log as interrupted. The agent's own incremental checkpoints (written
# during the task) are the source of truth for what was completed.
#
# Invoked by Claude Code as a Stop hook. Receives JSON on stdin.

set -euo pipefail

GANDER_ROOT="${GANDER_ROOT:-/home/jhber/projects/gander}"
EVENTS_DIR="$GANDER_ROOT/docs/events"
LOGS_DIR="$GANDER_ROOT/docs/agent-logs"
TODAY=$(date -u +%Y-%m-%d)
EVENTS_FILE="$EVENTS_DIR/agent-events-${TODAY}.jsonl"

# Read the Stop event from stdin (we don't use its content but consume it)
STOP_EVENT=$(cat)

# Only proceed if events file exists
if [[ ! -f "$EVENTS_FILE" ]]; then
  exit 0
fi

# Find agents that have a SPAWN but no COMPLETE or FAIL for the same task_id today
# Using python3 for robust JSONL parsing
python3 - <<'PYEOF'
import json, os, sys
from pathlib import Path

gander_root = os.environ.get("GANDER_ROOT", "/home/jhber/projects/gander")
today = __import__("datetime").date.today().isoformat()
events_file = Path(gander_root) / "docs" / "events" / f"agent-events-{today}.jsonl"
logs_dir = Path(gander_root) / "docs" / "agent-logs"

if not events_file.exists():
    sys.exit(0)

spawned = {}   # task_id -> agent_id
completed = set()  # task_ids

for line in events_file.read_text().strip().splitlines():
    try:
        ev = json.loads(line)
    except json.JSONDecodeError:
        continue
    task_id = ev.get("task_id", "")
    ev_type = ev.get("ev", "")
    if ev_type == "SPAWN":
        spawned[task_id] = ev.get("agent_id", "UNKNOWN")
    elif ev_type in ("COMPLETE", "FAIL", "AUDIT_PASS", "AUDIT_FAIL"):
        completed.add(task_id)

interrupted = {tid: aid for tid, aid in spawned.items() if tid not in completed}

for task_id, agent_id in interrupted.items():
    # Derive AGENT_CODE from agent_id (e.g. "BE#5" -> "BE", "FE#2" -> "FE")
    code = agent_id.split("#")[0] if "#" in agent_id else agent_id[:2].upper()
    agent_log_dir = logs_dir / code
    latest_path = agent_log_dir / "latest.md"
    task_log_path = agent_log_dir / f"{task_id}.md"

    # Only append if the file exists and doesn't already have STAGE 3
    for path in [task_log_path, latest_path]:
        if path.exists():
            content = path.read_text()
            if "[STAGE 3]" not in content:
                ts = __import__("datetime").datetime.utcnow().isoformat() + "Z"
                interrupted_block = f"""
## [STAGE 3] INTERRUPTED
- **At:** {ts}
- **Detected by:** agent-stop-checkpoint hook (session ended without Stage 3)
- **Action required:** Re-dispatch {agent_id} for task `{task_id}`.
  Read `docs/agent-logs/{code}/latest.md` before starting — skip completed checkpoints.
"""
                path.write_text(content + interrupted_block)

PYEOF

exit 0
