#!/bin/bash
# precommit-no-absolute-symlinks.sh
#
# Pre-commit guard: refuse to commit symlinks with absolute targets.
#
# Triggered by .claude/settings.json PreToolUse matcher "Bash(git commit*)".
# Reads the staged index and exits 2 (blocking) if any newly-added entry is
# a symlink (mode 120000) whose target path begins with "/".
#
# Why: an absolute symlink (e.g. .claude/skills -> /home/jhber/projects/...)
# resolves only on the developer's laptop. On any other checkout — CI runner,
# fresh clone, collaborator — the link dangles. This silently broke the
# GitHub Pages artifact-upload step for 24 days during sprint p8 (commit
# b1ab566) before a human eyeballed the failing run on 2026-04-27.
#
# Fix the violation by either:
#   - replacing with a relative symlink that resolves inside the repo, or
#   - untracking the path (git rm --cached) and adding it to .gitignore.
#
# Reference: docs/post-mortems/session-2026-04-27-pages-build-fix.md §5 G1

set -eu

# ---------------------------------------------------------------------------
# SELF-SCOPE: matcher is "Bash" (fires on every Bash call); exit early unless
# the command actually contains "git commit". This mirrors the proven pattern
# from guarded-git-push.sh. We read stdin once into RAW_CMD and check the
# substring before doing any git work.
# ---------------------------------------------------------------------------
RAW_CMD=$(cat)
if [[ "${RAW_CMD}" != *'git commit'* ]]; then
  exit 0
fi

violations=""

while IFS= read -r line; do
  mode=$(printf '%s\n' "$line" | awk '{print $2}')
  status=$(printf '%s\n' "$line" | awk '{print $5}')
  hash=$(printf '%s\n' "$line" | awk '{print $4}')
  path=$(printf '%s\n' "$line" | awk '{$1=$2=$3=$4=$5=""; sub(/^ +/,""); print}')

  if [ "$mode" = "120000" ] && [ "$status" = "A" ]; then
    target=$(git cat-file -p "$hash" 2>/dev/null || true)
    case "$target" in
      /*) violations="${violations}  $path -> $target"$'\n' ;;
    esac
  fi
done < <(git diff --cached --raw 2>/dev/null || true)

if [ -n "$violations" ]; then
  cat >&2 <<EOF
ERROR: refusing to commit tracked symlinks with absolute targets:

${violations}
Absolute symlinks point to paths that exist only on the developer's
laptop and dangle on any other checkout (CI runner, fresh clone,
collaborator). Use a relative symlink, or untrack the path and add
it to .gitignore.

Reference: docs/post-mortems/session-2026-04-27-pages-build-fix.md §5 G1
EOF
  exit 2
fi

exit 0
