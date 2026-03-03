#!/usr/bin/env bash
# Runs repomix --token-count-tree and writes docs/repomix/token-count-tree.txt
set -euo pipefail

# set correct filepaths
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_DIR="/docs/repomix"
OUTPUT_FILE="$OUTPUT_DIR/token-tree.txt"
OUTPUT="$ROOT$OUTPUT_FILE"


# Make directory if it doesn't exist; delete existing token tree file
mkdir -p "$(dirname "$OUTPUT")"
rm -f "$OUTPUT"
echo "Generating token count tree for "$ROOT" at $OUTPUT_FILE"

tree_lines="$(npx repomix $ROOT --token-count-tree --no-files --no-file-summary -o /dev/null 2>&1)"

# Keep only from the Token Count Tree header onward
tree_lines_filtered="$(printf '%s\n' "$tree_lines" \
  | awk 'BEGIN{keep=0} /^📈 Top 5 Files by Token Count:/{keep=1} keep'
)"

echo "$tree_lines_filtered" > "$OUTPUT"
