#!/usr/bin/env bash
set -euo pipefail

CURRENT_DIR="${1:-$PWD}"
CURRENT_DIR="$(cd "$CURRENT_DIR" && pwd)"

if [[ -f "$CURRENT_DIR/repomix.config.json" ]]; then
  ROOT="$CURRENT_DIR"
elif [[ "$(basename "$CURRENT_DIR")" == "scripts" && -f "$CURRENT_DIR/../repomix.config.json" ]]; then
  ROOT="$(cd "$CURRENT_DIR/.." && pwd)"
else
  echo "Error: could not find repomix.config.json from $CURRENT_DIR" >&2
  return 1 2>/dev/null || exit 1
fi

CONFIG="$ROOT/repomix.config.json"
OUTPUT="$ROOT/docs/repomix"
INPUT="$ROOT/scripts"
TOKEN_SCRIPT="$INPUT/token-counts.sh"
export ROOT CONFIG OUTPUT INPUT TOKEN_SCRIPT