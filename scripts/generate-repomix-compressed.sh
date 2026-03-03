#!/usr/bin/env bash
# Runs repomix --compressand writes docs/repomix/repo-compressed.xml
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_PATH="$ROOT/docs/repomix/repo-compressed.xml"

raw=$(NO_COLOR=1 timeout 60 npx repomix --compress -o "$OUTPUT_PATH")