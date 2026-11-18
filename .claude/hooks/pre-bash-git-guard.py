"""PreToolUse (Bash): no commits on master and no pushes to master.

Deploys only run when a PR is merged into master, so work goes on a branch.
"""
import json
import re
import subprocess
import sys

data = json.load(sys.stdin)
cmd = data.get("tool_input", {}).get("command", "")
if not re.search(r"\bgit\b.*\b(commit|push)\b", cmd):
    sys.exit(0)

branch = subprocess.run(
    ["git", "branch", "--show-current"], capture_output=True, text=True, cwd=data.get("cwd") or None
).stdout.strip()

reason = None
if re.search(r"\bgit\s+(?:-\S+\s+)*commit\b", cmd) and branch == "master":
    reason = "You are on master. Create a branch before committing; master only changes through merged PRs."
for m in re.finditer(r"\bgit\s+(?:-\S+\s+)*push\b([^;&|]*)", cmd):
    args = m.group(1).split()
    refs = [a for a in args if not a.startswith("-")][1:]  # drop the remote
    if any(re.search(r"(^|:)(refs/heads/)?master$", r) for r in refs) or (not refs and branch == "master"):
        reason = "Do not push to master. Push a feature branch and open a PR; the deploy runs on merge."

if reason:
    print(json.dumps({"hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": reason,
    }}))
