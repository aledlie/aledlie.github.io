#!/usr/bin/env bash
# Writes a lean repo evolution artifact from the last 200 commits
set -euo pipefail

OUTPUT_FILE="${1:?missing output path}"

env -u FORCE_COLOR NO_COLOR=1 \
npx repomix "$ROOT" \
  -c "$CONFIG" \
  --include-logs \
  --include-logs-count 200 \
  --include-diffs \
  --no-files \
  --no-file-summary \
  --output "$OUTPUT_FILE" \
  >/dev/null