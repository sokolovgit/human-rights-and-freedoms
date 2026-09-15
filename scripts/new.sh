#!/usr/bin/env bash
# scripts/new.sh 02 pravo-yak-rehuliator "Право як інструмент регулювання"
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
num="$1"; slug="$2"; title="${3:-}"
dir="$ROOT/practicals/$num-$slug"
[ -d "$dir" ] && { echo "$dir already exists" >&2; exit 1; }
mkdir -p "$dir"
sed -e "s/{{TITLE}}/$title/g" -e "s/{{NUM}}/$num/g" "$ROOT/templates/index.html" > "$dir/index.html"
printf '# Практичне %s — %s\n\n## Умова\n\n## План доповіді\n\n## Джерела\n' "$num" "$title" > "$dir/task.md"
echo "created $dir"
