#!/usr/bin/env bash
# Wrapper: generates token tree + compressed repomix output
set -euo pipefail

# Optional input directory (defaults to repo root)
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
INPUT_DIR="${1:-$ROOT}"

# repomix compression variant names
TREE_FILE="token-tree"
COMPRESSED_FILE="repo-compressed"
LOSSLESS_FILE="repomix"

# output filepaths
OUTPUT_PATH="docs/repomix"
OUT_DIR="$ROOT/$OUTPUT_PATH"
TOKEN_TREE_FILE="$OUT_DIR/$TREE_FILE.txt"
COMPRESSED_REPO_FILE="$OUT_DIR/$COMPRESSED_FILE.xml"
LOSSLESS_REPO_FILE="$OUT_DIR/$LOSSLESS_FILE.xml"
TREE_FILE_NAME="$OUTPUT_PATH/$TREE_FILE.txt"
COMPRESSED_FILE_NAME="$OUTPUT_PATH/$COMPRESSED_FILE.xml"
LOSSLESS_FILE_NAME="$OUTPUT_PATH/$LOSSLESS_FILE.xml"

# input file paths
INPUT_DIR="$ROOT/scripts/generate-"
TOKEN_TREE_SCRIPT="$INPUT_DIR$TREE_FILE.sh"
COMPRESS_SCRIPT="$INPUT_DIR$COMPRESSED_FILE.sh"
LOSSLESS_SCRIPT="$INPUT_DIR$LOSSLESS_FILE.sh"

echo "File set up..."
# make output dir if not exists
mkdir -p "$HOME/$OUT_DIR"
#delete existing files
rm -f "$OUT_DIR/*"


#project-level logging
PROJECT_DIR="$(basename "$(cd "$(dirname "$0")/.." && pwd)")"

echo "Generating token count tree for $PROJECT_DIR at $TREE_FILE_NAME"
bash "$TOKEN_TREE_SCRIPT" "$ROOT" "$TOKEN_TREE_FILE"
echo "Success!"
echo

echo "Generating compressed repomix file for $PROJECT_DIR at $COMPRESSED_FILE_NAME"
bash "$COMPRESS_SCRIPT" "$ROOT" "$COMPRESSED_REPO_FILE"
echo "Success!"
echo

echo "Generating repomix file for $PROJECT_DIR at $LOSSLESS_FILE_NAME"
bash "$LOSSLESS_SCRIPT" "$ROOT" "$LOSSLESS_REPO_FILE"
echo "Success!"
echo

echo "Artifacts:"
echo " - $TREE_FILE_NAME"
echo " - $COMPRESSED_FILE_NAME"
echo " - $LOSSLESS_FILE_NAME"