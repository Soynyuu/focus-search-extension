#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
PACKAGE="$DIST_DIR/focus-search-1.0.0.zip"

cd "$ROOT_DIR"
python3 scripts/generate_icons.py
mkdir -p "$DIST_DIR"
rm -f "$PACKAGE"

zip -r "$PACKAGE" \
  manifest.json \
  LICENSE \
  README.md \
  SECURITY.md \
  docs \
  icons \
  src \
  -x "*.DS_Store"

echo "$PACKAGE"
