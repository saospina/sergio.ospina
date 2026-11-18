#!/usr/bin/env bash
# Stop hook: when the CV PDF changed, make sure it has no email or phone
# number and that `cv.updated` in profile.ts was bumped. Runs once per PDF
# version.
set -u
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

pdf=public/cv/antonio-ospina-cv.pdf
profile=src/features/profile/profile.ts

[ -n "$(git status --porcelain -- "$pdf")" ] || exit 0
[ -f "$pdf" ] || exit 0

stamp="$(git rev-parse --git-dir)/claude-cv-checked"
hash=$(shasum "$pdf" | cut -d' ' -f1)
[ -f "$stamp" ] && [ "$(cat "$stamp")" = "$hash" ] && exit 0
echo "$hash" > "$stamp"

problems=()

if ! git diff HEAD -- "$profile" | grep -qE '^\+.*updated:'; then
  problems+=("$pdf changed but \`cv.updated\` in $profile was not bumped.")
fi

if command -v pdftotext >/dev/null; then
  text=$(pdftotext "$pdf" - 2>/dev/null)
  if grep -qiE '[[:alnum:]._%+-]+@[[:alnum:].-]+\.[a-z]{2,}' <<<"$text"; then
    problems+=("$pdf appears to contain an email address. Remove it.")
  fi
  if grep -qE '\+?[0-9][0-9 ().-]{8,}[0-9]' <<<"$text"; then
    problems+=("$pdf may contain a phone number. Check and remove it.")
  fi
else
  problems+=("pdftotext is not installed, so $pdf could not be scanned. Read the PDF and confirm it has no email address or phone number.")
fi

[ ${#problems[@]} -eq 0 ] && exit 0
printf '%s\n' "${problems[@]}" >&2
exit 2
