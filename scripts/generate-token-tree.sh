#!/usr/bin/env bash
# Runs repomix --token-count-tree and writes docs/repomix/token-count-tree.txt
set -euo pipefail

# filepaths
ROOT="${1}"
OUTPUT_FILE="${2}"

# Keep only from the Token Count Tree from header onward
tree_lines="$(npx repomix $ROOT --token-count-tree --no-files --no-file-summary -o /dev/null 2>&1)"
tree_lines_filtered="$(printf '%s\n' "$tree_lines" \
  | awk 'BEGIN{keep=0} /^📈 Top 5 Files by Token Count:/{keep=1} keep'
)"

echo "$tree_lines_filtered" > "$OUTPUT_FILE"
