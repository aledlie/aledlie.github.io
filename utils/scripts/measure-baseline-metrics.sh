#!/bin/bash
# Phase 0.1: Measure Baseline Metrics
# This script measures all baseline metrics before refactoring begins

set -e

BASELINE_DIR="baseline-metrics"
TIMESTAMP=$(date +%Y-%m-%d)
BASELINE_FILE="${BASELINE_DIR}/baseline-metrics-${TIMESTAMP}.json"

echo "=== Phase 0.1: Measuring Baseline Metrics ==="
echo "Date: $(date)"
echo ""

# Create baseline directory
mkdir -p ${BASELINE_DIR}

# Initialize JSON file
echo "{" > ${BASELINE_FILE}
echo "  \"date\": \"${TIMESTAMP}\"," >> ${BASELINE_FILE}
echo "  \"timestamp\": \"$(date -Iseconds)\"," >> ${BASELINE_FILE}

##############################################
# 1. Build Performance Metrics
##############################################
echo "=== 1. Build Performance Metrics ===" | tee -a ${BASELINE_DIR}/baseline.log

echo "  \"build_metrics\": {" >> ${BASELINE_FILE}

# Clean build time
echo "  Measuring clean build time..."
rm -rf _site .jekyll-cache .sass-cache
START_TIME=$(date +%s.%N)
BUNDLE_GEMFILE=config/Gemfile bundle exec jekyll build --config config/_config.yml > ${BASELINE_DIR}/build-clean.log 2>&1
END_TIME=$(date +%s.%N)
CLEAN_BUILD_TIME=$(echo "$END_TIME - $START_TIME" | bc)
echo "    Clean build: ${CLEAN_BUILD_TIME}s"
echo "    \"clean_build_seconds\": ${CLEAN_BUILD_TIME}," >> ${BASELINE_FILE}

# Incremental build time
echo "  Measuring incremental build time..."
touch _posts/*.md 2>/dev/null || touch README.md
START_TIME=$(date +%s.%N)
BUNDLE_GEMFILE=config/Gemfile bundle exec jekyll build --config config/_config.yml > ${BASELINE_DIR}/build-incremental.log 2>&1
END_TIME=$(date +%s.%N)
INCREMENTAL_BUILD_TIME=$(echo "$END_TIME - $START_TIME" | bc)
echo "    Incremental build: ${INCREMENTAL_BUILD_TIME}s"
echo "    \"incremental_build_seconds\": ${INCREMENTAL_BUILD_TIME}," >> ${BASELINE_FILE}

# Bundle install time
echo "  Measuring bundle install time..."
rm -rf .bundle vendor/bundle
START_TIME=$(date +%s.%N)
BUNDLE_GEMFILE=config/Gemfile bundle install > ${BASELINE_DIR}/bundle-install.log 2>&1
END_TIME=$(date +%s.%N)
BUNDLE_INSTALL_TIME=$(echo "$END_TIME - $START_TIME" | bc)
echo "    Bundle install: ${BUNDLE_INSTALL_TIME}s"
echo "    \"bundle_install_seconds\": ${BUNDLE_INSTALL_TIME}," >> ${BASELINE_FILE}

# NPM install time
echo "  Measuring npm install time..."
rm -rf node_modules config/package-lock.json
START_TIME=$(date +%s.%N)
cd config && npm install > ../${BASELINE_DIR}/npm-install.log 2>&1 && cd ..
END_TIME=$(date +%s.%N)
NPM_INSTALL_TIME=$(echo "$END_TIME - $START_TIME" | bc)
echo "    NPM install: ${NPM_INSTALL_TIME}s"
echo "    \"npm_install_seconds\": ${NPM_INSTALL_TIME}" >> ${BASELINE_FILE}

echo "  }," >> ${BASELINE_FILE}

##############################################
# 2. Size Metrics
##############################################
echo ""
echo "=== 2. Size Metrics ===" | tee -a ${BASELINE_DIR}/baseline.log

echo "  \"size_metrics\": {" >> ${BASELINE_FILE}

# Built site size
SITE_SIZE=$(du -sk _site/ | cut -f1)
SITE_SIZE_MB=$(echo "scale=2; $SITE_SIZE / 1024" | bc)
echo "    Site total: ${SITE_SIZE_MB} MB"
echo "    \"site_total_kb\": ${SITE_SIZE}," >> ${BASELINE_FILE}

# CSS file size
if [ -f "_site/assets/css/main.css" ]; then
    CSS_SIZE=$(stat -f%z _site/assets/css/main.css 2>/dev/null || stat -c%s _site/assets/css/main.css 2>/dev/null)
    CSS_SIZE_KB=$(echo "scale=2; $CSS_SIZE / 1024" | bc)
    echo "    CSS compiled: ${CSS_SIZE_KB} KB"
    echo "    \"css_compiled_bytes\": ${CSS_SIZE}," >> ${BASELINE_FILE}
fi

# SCSS source lines
SCSS_LINES=$(find _sass -name "*.scss" -exec cat {} + | wc -l | xargs)
echo "    SCSS source lines: ${SCSS_LINES}"
echo "    \"scss_source_lines\": ${SCSS_LINES}," >> ${BASELINE_FILE}

# main.scss lines
MAIN_SCSS_LINES=$(wc -l < assets/css/main.scss | xargs)
echo "    main.scss lines: ${MAIN_SCSS_LINES}"
echo "    \"main_scss_lines\": ${MAIN_SCSS_LINES}," >> ${BASELINE_FILE}

# SCSS file count
SCSS_FILE_COUNT=$(find _sass -name "*.scss" -type f | wc -l | xargs)
echo "    SCSS files: ${SCSS_FILE_COUNT}"
echo "    \"scss_file_count\": ${SCSS_FILE_COUNT}," >> ${BASELINE_FILE}

# node_modules size
if [ -d "node_modules" ]; then
    NODE_MODULES_SIZE=$(du -sk node_modules | cut -f1)
    NODE_MODULES_MB=$(echo "scale=2; $NODE_MODULES_SIZE / 1024" | bc)
    echo "    node_modules: ${NODE_MODULES_MB} MB"
    echo "    \"node_modules_kb\": ${NODE_MODULES_SIZE}," >> ${BASELINE_FILE}
fi

# Ruby bundle size
if [ -d "vendor/bundle" ]; then
    BUNDLE_SIZE=$(du -sk vendor/bundle | cut -f1)
    BUNDLE_MB=$(echo "scale=2; $BUNDLE_SIZE / 1024" | bc)
    echo "    Ruby bundle: ${BUNDLE_MB} MB"
    echo "    \"ruby_bundle_kb\": ${BUNDLE_SIZE}" >> ${BASELINE_FILE}
fi

echo "  }," >> ${BASELINE_FILE}

##############################################
# 3. Dependency Metrics
##############################################
echo ""
echo "=== 3. Dependency Metrics ===" | tee -a ${BASELINE_DIR}/baseline.log

echo "  \"dependency_metrics\": {" >> ${BASELINE_FILE}

# Ruby gems count
RUBY_GEM_COUNT=$(grep -c "^gem" config/Gemfile || echo 0)
echo "    Ruby gems: ${RUBY_GEM_COUNT}"
echo "    \"ruby_gems\": ${RUBY_GEM_COUNT}," >> ${BASELINE_FILE}

# NPM packages count
NPM_DEV_COUNT=$(cat config/package.json | jq '.devDependencies | length' 2>/dev/null || echo 0)
NPM_PROD_COUNT=$(cat config/package.json | jq '.dependencies | length' 2>/dev/null || echo 0)
NPM_TOTAL=$((NPM_DEV_COUNT + NPM_PROD_COUNT))
echo "    NPM packages: ${NPM_TOTAL} (${NPM_PROD_COUNT} prod, ${NPM_DEV_COUNT} dev)"
echo "    \"npm_packages_total\": ${NPM_TOTAL}," >> ${BASELINE_FILE}
echo "    \"npm_packages_prod\": ${NPM_PROD_COUNT}," >> ${BASELINE_FILE}
echo "    \"npm_packages_dev\": ${NPM_DEV_COUNT}" >> ${BASELINE_FILE}

echo "  }," >> ${BASELINE_FILE}

##############################################
# 4. Test Performance Metrics
##############################################
echo ""
echo "=== 4. Test Performance Metrics ===" | tee -a ${BASELINE_DIR}/baseline.log

echo "  \"test_metrics\": {" >> ${BASELINE_FILE}

# Run all tests and measure time
echo "  Running full test suite..."
START_TIME=$(date +%s.%N)
npm run test:all > ${BASELINE_DIR}/test-suite.log 2>&1 || echo "    WARNING: Some tests may have failed"
END_TIME=$(date +%s.%N)
TEST_TIME=$(echo "$END_TIME - $START_TIME" | bc)
echo "    Test suite: ${TEST_TIME}s"
echo "    \"test_suite_seconds\": ${TEST_TIME}" >> ${BASELINE_FILE}

echo "  }," >> ${BASELINE_FILE}

##############################################
# 5. File Inventory
##############################################
echo ""
echo "=== 5. File Inventory ===" | tee -a ${BASELINE_DIR}/baseline.log

echo "  \"file_inventory\": {" >> ${BASELINE_FILE}

# Count files by type
echo "    \"scss_files\": [" >> ${BASELINE_FILE}
find _sass -name "*.scss" -type f | while read file; do
    LINES=$(wc -l < "$file" | xargs)
    echo "      {\"path\": \"$file\", \"lines\": $LINES}," >> ${BASELINE_FILE}
done
# Remove last comma
sed -i '' '$ s/,$//' ${BASELINE_FILE}
echo "    ]," >> ${BASELINE_FILE}

POST_COUNT=$(find _posts -name "*.md" -type f | wc -l | xargs)
echo "    \"post_count\": ${POST_COUNT}," >> ${BASELINE_FILE}

PAGE_COUNT=$(find . -maxdepth 2 -name "*.md" -o -name "*.html" | grep -v "_site\|node_modules\|vendor" | wc -l | xargs)
echo "    \"page_count\": ${PAGE_COUNT}" >> ${BASELINE_FILE}

echo "  }" >> ${BASELINE_FILE}

# Close JSON
echo "}" >> ${BASELINE_FILE}

##############################################
# 6. Copy important files for comparison
##############################################
echo ""
echo "=== 6. Creating Baseline Snapshots ===" | tee -a ${BASELINE_DIR}/baseline.log

# Copy CSS for later comparison
cp _site/assets/css/main.css ${BASELINE_DIR}/main-baseline.css
echo "    ✓ Copied compiled CSS"

# Copy package.json and Gemfile
cp config/package.json ${BASELINE_DIR}/package-baseline.json
cp config/Gemfile ${BASELINE_DIR}/Gemfile-baseline
echo "    ✓ Copied dependency manifests"

# Create SCSS file listing
find _sass -name "*.scss" -type f | sort > ${BASELINE_DIR}/scss-files-list.txt
echo "    ✓ Created SCSS file list"

##############################################
# 7. Summary
##############################################
echo ""
echo "=== BASELINE METRICS SUMMARY ===" | tee -a ${BASELINE_DIR}/baseline.log
echo "Date: ${TIMESTAMP}" | tee -a ${BASELINE_DIR}/baseline.log
echo "" | tee -a ${BASELINE_DIR}/baseline.log
echo "Build Performance:" | tee -a ${BASELINE_DIR}/baseline.log
echo "  Clean build: ${CLEAN_BUILD_TIME}s" | tee -a ${BASELINE_DIR}/baseline.log
echo "  Incremental build: ${INCREMENTAL_BUILD_TIME}s" | tee -a ${BASELINE_DIR}/baseline.log
echo "  Bundle install: ${BUNDLE_INSTALL_TIME}s" | tee -a ${BASELINE_DIR}/baseline.log
echo "  NPM install: ${NPM_INSTALL_TIME}s" | tee -a ${BASELINE_DIR}/baseline.log
echo "" | tee -a ${BASELINE_DIR}/baseline.log
echo "Site Size:" | tee -a ${BASELINE_DIR}/baseline.log
echo "  Total: ${SITE_SIZE_MB} MB" | tee -a ${BASELINE_DIR}/baseline.log
echo "  CSS: ${CSS_SIZE_KB} KB" | tee -a ${BASELINE_DIR}/baseline.log
echo "  SCSS files: ${SCSS_FILE_COUNT}" | tee -a ${BASELINE_DIR}/baseline.log
echo "  SCSS lines: ${SCSS_LINES}" | tee -a ${BASELINE_DIR}/baseline.log
echo "" | tee -a ${BASELINE_DIR}/baseline.log
echo "Dependencies:" | tee -a ${BASELINE_DIR}/baseline.log
echo "  Ruby gems: ${RUBY_GEM_COUNT}" | tee -a ${BASELINE_DIR}/baseline.log
echo "  NPM packages: ${NPM_TOTAL}" | tee -a ${BASELINE_DIR}/baseline.log
echo "" | tee -a ${BASELINE_DIR}/baseline.log
echo "Tests: ${TEST_TIME}s" | tee -a ${BASELINE_DIR}/baseline.log
echo "" | tee -a ${BASELINE_DIR}/baseline.log
echo "✓ Baseline metrics saved to: ${BASELINE_FILE}" | tee -a ${BASELINE_DIR}/baseline.log
echo "✓ Full log saved to: ${BASELINE_DIR}/baseline.log" | tee -a ${BASELINE_DIR}/baseline.log
echo ""
echo "Phase 0.1 Complete!"
