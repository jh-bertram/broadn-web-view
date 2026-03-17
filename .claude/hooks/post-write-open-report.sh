#!/bin/bash
# PostToolUse hook — fires after every Write tool call.
# If the file written is docs/team-report.html, auto-opens it in the Windows browser (WSL environment).

input=$(cat)

file_path=$(python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('tool_input', {}).get('file_path', ''))
except Exception:
    pass
" <<< "$input" 2>/dev/null || true)

if [[ "$file_path" == *"team-report.html" ]]; then
    win_path=$(wslpath -w "$file_path" 2>/dev/null || true)
    if [[ -n "$win_path" ]]; then
        powershell.exe -Command "Start-Process '$win_path'" >/dev/null 2>&1 &
        echo "Team report auto-opened in browser."
    fi
fi
