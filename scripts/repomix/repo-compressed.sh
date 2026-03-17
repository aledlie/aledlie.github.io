#!/usr/bin/env bash
# Runs repomix --compress and writes the compressed output file
set -euo pipefail

OUTPUT_FILE="${1:?missing output path}"

env -u FORCE_COLOR NO_COLOR=1 \
npx repomix "$ROOT" -c "$CONFIG" --compress -o "$OUTPUT_FILE" >/dev/null