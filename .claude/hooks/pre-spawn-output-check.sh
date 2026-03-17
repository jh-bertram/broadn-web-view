#!/bin/bash
# PreToolUse hook — fires before every Agent tool call.
# Warns Claude if the subagent prompt is missing the mandatory Output Path directive.

input=$(cat)

prompt=$(python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('tool_input', {}).get('prompt', ''))
except Exception:
    pass
" <<< "$input" 2>/dev/null || true)

if [[ -n "$prompt" ]] && ! echo "$prompt" | grep -q "Output Path"; then
    cat <<'MSG'
HOOK WARNING — Output Path directive missing from subagent prompt.

Every subagent prompt MUST contain this section:

  ## Output Path
  Write your primary output to:
    .claude/agents/tasks/outputs/{task_id}-{AGENT_CODE}-{unix_ts}.md
  Create the directory if it does not exist.
  Record this path in output_files of your COMPLETE event.

Also log a SPAWN event to docs/events/agent-events-YYYY-MM-DD.jsonl before spawning.
MSG
fi
