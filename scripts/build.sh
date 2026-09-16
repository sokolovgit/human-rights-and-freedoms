#!/usr/bin/env bash
# Render a practical's deck -> PDF (submission) + PNG previews (visual review).
#   scripts/build.sh 01     one practical
#   scripts/build.sh all    every practical that has an index.html
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
[ -x "$CHROME" ] || { echo "Google Chrome not found at $CHROME" >&2; exit 1; }

build_one() {
  local dir="$1" slug num out
  slug="$(basename "$dir")"
  num="${slug%%-*}"
  out="$ROOT/out/$slug"
  [ -f "$dir/index.html" ] || { echo "skip $slug (no index.html)"; return 0; }
  mkdir -p "$out"

  echo "[$slug] PDF"
  "$CHROME" --headless --disable-gpu --no-pdf-header-footer \
    --print-to-pdf="$out/praktychna-$num.pdf" "file://$dir/index.html" 2>/dev/null

  echo "[$slug] PNG"
  node "$ROOT/scripts/shots.mjs" "$dir"

  echo "[$slug] fit"
  node "$ROOT/scripts/check.mjs" "$dir" || true

  # Optional: only for venues that insist on PowerPoint.
  if python3 -c "import pptx" 2>/dev/null; then
    echo "[$slug] pptx"
    python3 "$ROOT/scripts/to-pptx.py" "$num"
  fi
}

target="${1:-all}"
if [ "$target" = "all" ]; then
  for d in "$ROOT"/practicals/*/; do build_one "${d%/}"; done
else
  d=$(find "$ROOT/practicals" -maxdepth 1 -type d -name "${target}-*" | head -1)
  [ -n "$d" ] || { echo "no practical matching '$target' in practicals/" >&2; exit 1; }
  build_one "$d"
fi
echo "→ out/"
