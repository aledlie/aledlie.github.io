#!/usr/bin/env bash
# Runs repomix --token-count-tree and writes the token tree section to OUTPUT_FILE
set -euo pipefail

OUTPUT_FILE="${1:?missing output path}"

npx repomix "$ROOT" -c "$CONFIG" --token-count-tree --no-files --no-file-summary 2>&1 \
  | tr -d '\r' \
  | awk 'BEGIN{keep=0} /^🔢 Token Count Tree:/{keep=1} /^🔎 Security Check:/{keep=0} keep' \
  > "$OUTPUT_FILE"
