#!/usr/bin/env bash
# Stop hook: run `npm run build` when site files changed since the last
# successful build. A failure is fed back to Claude (exit 2) so it fixes it.
set -u
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

input=$(cat)
paths=(src public astro.config.mjs package.json package-lock.json)

[ -n "$(git status --porcelain -- "${paths[@]}")" ] || exit 0

# Fingerprint the working-tree changes so an unchanged tree is not rebuilt.
stamp="$(git rev-parse --git-dir)/claude-build-ok"
hash=$({
  git rev-parse HEAD
  git diff HEAD -- "${paths[@]}"
  git ls-files -o --exclude-standard -z -- "${paths[@]}" | xargs -0 shasum 2>/dev/null
} | shasum | cut -d' ' -f1)
[ -f "$stamp" ] && [ "$(cat "$stamp")" = "$hash" ] && exit 0

if out=$(npm run build 2>&1); then
  echo "$hash" > "$stamp"
  exit 0
fi

# Second failure in a row: report to the user instead of looping.
if [ "$(jq -r '.stop_hook_active // false' <<<"$input")" = "true" ]; then
  jq -n --arg m "npm run build is still failing. Last output:
$(tail -20 <<<"$out")" '{systemMessage: $m}'
  exit 0
fi

{
  echo "npm run build failed. Fix it before finishing:"
  tail -40 <<<"$out"
} >&2
exit 2
