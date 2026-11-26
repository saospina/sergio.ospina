"""PreToolUse (Edit|Write) guards.

- deploy.yml must keep its `push` trigger and never use `pull_request` or
  `pull_request_target`.
- Edits to the guitar/audio features get a reminder to load the
  interactive-guitar-web skill (once per session).
"""
import json
import os
import re
import sys
import tempfile

data = json.load(sys.stdin)
tool = data.get("tool_name")
inp = data.get("tool_input", {})
path = inp.get("file_path", "")
root = os.environ.get("CLAUDE_PROJECT_DIR", data.get("cwd", ""))
rel = os.path.relpath(path, root) if path else ""


def emit(**fields):
    print(json.dumps({"hookSpecificOutput": {"hookEventName": "PreToolUse", **fields}}))
    sys.exit(0)


if rel == ".github/workflows/deploy.yml":
    if tool == "Write":
        new = inp.get("content", "")
    else:
        try:
            with open(path, encoding="utf-8") as f:
                new = f.read()
        except OSError:
            new = ""
        old_s, new_s = inp.get("old_string", ""), inp.get("new_string", "")
        new = new.replace(old_s, new_s) if inp.get("replace_all") else new.replace(old_s, new_s, 1)
    has_push = re.search(r"^\s*push:", new, re.M)
    has_pr = re.search(r"^\s*pull_request(_target)?:", new, re.M)
    if has_pr or not has_push:
        emit(
            permissionDecision="deny",
            permissionDecisionReason="deploy.yml deploys on push to master (the merge commit). Do not switch to "
            "pull_request (refs/pull/<n>/merge is rejected by the github-pages environment) or "
            "pull_request_target (restricted on public repos from 2026-12-02). See AGENTS.md.",
        )

if rel.startswith(("src/features/interactive-guitar/", "src/features/audio-experience/")):
    marker = os.path.join(tempfile.gettempdir(), f"claude-guitar-skill-{data.get('session_id', 'x')}")
    if not os.path.exists(marker):
        open(marker, "w").close()
        emit(additionalContext="This file belongs to the guitar/audio experience. If you have not already, "
             "read .claude/skills/interactive-guitar-web/SKILL.md and follow it before editing.")
