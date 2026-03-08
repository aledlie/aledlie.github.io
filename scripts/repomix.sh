#!/usr/bin/env bash
# Runs repomix and writes the full output file
set -euo pipefail

OUTPUT_FILE="${1:?missing output path}"

env -u FORCE_COLOR NO_COLOR=1 \
npx repomix "$ROOT" -c "$CONFIG" -o "$OUTPUT_FILE" >/dev/null