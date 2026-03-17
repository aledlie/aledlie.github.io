#!/usr/bin/env bash
# Wrapper: generates token tree + compressed repomix output
set -euo pipefail

source "$(cd "$(dirname "$0")" && pwd)/find-path.sh" "${1:-}"

PROJECT="$(basename "$ROOT")"
OUTPUT_SUBDIR="docs/repomix"

echo "File set up..."
mkdir -p "$OUTPUT"
rm -f "$OUTPUT"/*
echo "Generating all $PROJECT repomix files..."

file_ext() {
  case "$1" in
    token-tree|git-history) echo "txt" ;;
    *) echo "xml" ;;
  esac
}

filepath() {
  echo "$1/$2.$3"
}

ARTIFACTS=("git-evolution" "token-tree" "repo-compressed" "repomix" "git-history")
for name in "${ARTIFACTS[@]}"; do
  ext="$(file_ext "$name")"
  script_path="$(filepath "$INPUT" "$name" "sh")"
  output_file="$(filepath "$OUTPUT" "$name" "$ext")"
  output_relative="$(filepath "$OUTPUT_SUBDIR" "$name" "$ext")"

  [[ -f "$script_path" ]] || { echo "Error: missing script: $script_path" >&2; exit 1; }

  bash "$script_path" "$output_file"
  tokens="$("$TOKEN_SCRIPT" "$output_file")"
  printf -- "- %s : %s\n" "$output_relative" "$tokens"
done
