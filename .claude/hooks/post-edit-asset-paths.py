"""PostToolUse (Edit|Write): flag root-absolute asset paths in src/.

`base` is /sergio.ospina, so "/img/x" works in dev but 404s on GitHub Pages.
"""
import json
import os
import re
import sys

data = json.load(sys.stdin)
path = data.get("tool_input", {}).get("file_path", "")
root = os.environ.get("CLAUDE_PROJECT_DIR", data.get("cwd", ""))
rel = os.path.relpath(path, root) if path else ""

if not rel.startswith("src/") or not rel.endswith((".astro", ".ts", ".js", ".mjs", ".css", ".html")):
    sys.exit(0)

pattern = re.compile(
    r"""(?:\b(?:src|href|poster|srcset|action)\s*=\s*["']|url\(\s*["']?)/(?!/)"""
)
try:
    with open(path, encoding="utf-8") as f:
        hits = [f"{rel}:{n}: {line.strip()}" for n, line in enumerate(f, 1) if pattern.search(line)]
except OSError:
    sys.exit(0)

if hits:
    print(json.dumps({
        "decision": "block",
        "reason": "Root-absolute paths 404 in production (base is /sergio.ospina). "
                  "Prefix public assets with import.meta.env.BASE_URL:\n" + "\n".join(hits[:10]),
    }))
