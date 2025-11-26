#!/bin/bash
# Measure build performance metrics

set -e

echo "=== Build Performance Baseline Measurement ==="
echo "Date: $(date)"
echo "Git Commit: $(git rev-parse --short HEAD)"
echo ""

# Store results
RESULTS_FILE="tests/baseline/metrics-$(date +%Y-%m-%d).json"
echo "{" > "$RESULTS_FILE"
echo "  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"," >> "$RESULTS_FILE"
echo "  \"git_commit\": \"$(git rev-parse HEAD)\"," >> "$RESULTS_FILE"

# Clean build time
echo "=== Clean Build Time ==="
rm -rf _site .jekyll-cache
START=$(date +%s)
bundle exec jekyll build > /dev/null 2>&1
END=$(date +%s)
CLEAN_BUILD_TIME=$((END - START))
echo "Clean build time: ${CLEAN_BUILD_TIME}s"
echo "  \"clean_build_time_seconds\": ${CLEAN_BUILD_TIME}," >> "$RESULTS_FILE"

# Incremental build time
echo ""
echo "=== Incremental Build Time ==="
touch _posts/*.md 2>/dev/null || echo "No posts to touch"
START=$(date +%s)
bundle exec jekyll build > /dev/null 2>&1
END=$(date +%s)
INCREMENTAL_BUILD_TIME=$((END - START))
echo "Incremental build time: ${INCREMENTAL_BUILD_TIME}s"
echo "  \"incremental_build_time_seconds\": ${INCREMENTAL_BUILD_TIME}," >> "$RESULTS_FILE"

# File size metrics
echo ""
echo "=== File Size Metrics ==="

# Built site size
SITE_SIZE=$(du -sb _site 2>/dev/null | cut -f1)
SITE_SIZE_MB=$(echo "scale=2; $SITE_SIZE / 1024 / 1024" | bc)
echo "Built site size: ${SITE_SIZE_MB}MB"
echo "  \"site_size_bytes\": ${SITE_SIZE}," >> "$RESULTS_FILE"

# CSS file size
if [ -f "_site/assets/css/main.css" ]; then
  CSS_SIZE=$(wc -c < _site/assets/css/main.css)
  CSS_SIZE_KB=$(echo "scale=2; $CSS_SIZE / 1024" | bc)
  echo "CSS file size: ${CSS_SIZE_KB}KB"
  echo "  \"css_size_bytes\": ${CSS_SIZE}," >> "$RESULTS_FILE"
else
  echo "CSS file not found!"
  echo "  \"css_size_bytes\": null," >> "$RESULTS_FILE"
fi

# SCSS source lines
SCSS_LINES=$(find _sass -name "*.scss" -exec cat {} \; 2>/dev/null | wc -l | tr -d ' ')
echo "SCSS source lines: ${SCSS_LINES}"
echo "  \"scss_total_lines\": ${SCSS_LINES}," >> "$RESULTS_FILE"

# main.scss lines
MAIN_SCSS_LINES=$(wc -l < assets/css/main.scss | tr -d ' ')
echo "main.scss lines: ${MAIN_SCSS_LINES}"
echo "  \"main_scss_lines\": ${MAIN_SCSS_LINES}," >> "$RESULTS_FILE"

# SCSS file count
SCSS_FILE_COUNT=$(find _sass -name "*.scss" 2>/dev/null | wc -l | tr -d ' ')
echo "SCSS file count: ${SCSS_FILE_COUNT}"
echo "  \"scss_file_count\": ${SCSS_FILE_COUNT}," >> "$RESULTS_FILE"

# node_modules size (if exists)
if [ -d "node_modules" ]; then
  NODE_MODULES_SIZE=$(du -sb node_modules 2>/dev/null | cut -f1)
  NODE_MODULES_SIZE_MB=$(echo "scale=2; $NODE_MODULES_SIZE / 1024 / 1024" | bc)
  echo "node_modules size: ${NODE_MODULES_SIZE_MB}MB"
  echo "  \"node_modules_size_bytes\": ${NODE_MODULES_SIZE}," >> "$RESULTS_FILE"
else
  echo "  \"node_modules_size_bytes\": null," >> "$RESULTS_FILE"
fi

# vendor/bundle size (if exists)
if [ -d "vendor/bundle" ]; then
  BUNDLE_SIZE=$(du -sb vendor/bundle 2>/dev/null | cut -f1)
  BUNDLE_SIZE_MB=$(echo "scale=2; $BUNDLE_SIZE / 1024 / 1024" | bc)
  echo "vendor/bundle size: ${BUNDLE_SIZE_MB}MB"
  echo "  \"vendor_bundle_size_bytes\": ${BUNDLE_SIZE}" >> "$RESULTS_FILE"
else
  echo "  \"vendor_bundle_size_bytes\": null" >> "$RESULTS_FILE"
fi

# Close JSON
echo "}" >> "$RESULTS_FILE"

echo ""
echo "=== Metrics saved to: $RESULTS_FILE ==="
echo ""
echo "Summary:"
cat "$RESULTS_FILE"
