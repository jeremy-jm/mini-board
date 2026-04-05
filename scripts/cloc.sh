#!/usr/bin/env bash
#
# Run cloc on backend/src and frontend/src (project root = parent of this script's directory).
# Requires: cloc — https://github.com/AlDanial/cloc
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

BACKEND_SRC="${ROOT}/backend/src"
FRONTEND_SRC="${ROOT}/frontend/src"

if ! command -v cloc >/dev/null 2>&1; then
  echo "cloc not found. Install it first, e.g.:" >&2
  echo "  brew install cloc" >&2
  exit 1
fi

for dir in "$BACKEND_SRC" "$FRONTEND_SRC"; do
  if [ ! -d "$dir" ]; then
    echo "Missing directory: $dir" >&2
    exit 1
  fi
done

echo "Project root: $ROOT"
echo "Counting: backend/src, frontend/src"
echo ""

exec cloc "$BACKEND_SRC" "$FRONTEND_SRC" "$@"
