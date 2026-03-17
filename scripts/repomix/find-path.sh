#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG="$SCRIPT_DIR/repomix.config.json"

if [[ ! -f "$CONFIG" ]]; then
  echo "Error: could not find repomix.config.json in $SCRIPT_DIR" >&2
  return 1 2>/dev/null || exit 1
fi

ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
OUTPUT="$ROOT/docs/repomix"
INPUT="$ROOT/scripts/repomix"
TOKEN_SCRIPT="$INPUT/token-counts.sh"
export ROOT CONFIG OUTPUT INPUT TOKEN_SCRIPT