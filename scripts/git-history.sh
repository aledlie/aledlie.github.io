#!/usr/bin/env bash
# Writes git history for the last 200 commits
set -euo pipefail

OUTPUT_FILE="${1:?missing output path}"

git -C "$ROOT" log -n 200 \
  --date=iso \
  --stat \
  --summary \
  --decorate \
  > "$OUTPUT_FILE"