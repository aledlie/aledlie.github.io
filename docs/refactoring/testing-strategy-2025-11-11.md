# Comprehensive Testing Strategy for Architecture Refactoring
**Project:** The Parlor (aledlie.github.io)
**Date:** 2025-11-11
**Author:** Testing Strategy Analysis
**Status:** Proposed
**Related:** architecture-simplification-plan-2025-11-11.md

---

## Executive Summary

This document defines a scientifically rigorous testing strategy for the architecture refactoring plan. The approach follows experimental design principles: establish control groups, measure baselines, enable reproducibility, and validate statistically. Zero regressions are the target.

**Key Principles:**
- **Control Groups:** Keep old code until verified
- **Measurement Baselines:** Build times, bundle sizes, CSS sizes, performance metrics
- **Statistical Validation:** Performance metrics with confidence intervals
- **Reproducibility:** Deterministic tests that produce identical results
- **Visual Regression:** Pixel-perfect comparison of rendered pages
- **Rollback Ready:** Every phase can be reverted in <5 minutes

**Testing Coverage:**
- Visual Regression: Pixel-perfect UI comparison
- Build Performance: Time and size metrics
- Runtime Performance: Lighthouse/Core Web Vitals
- Functional: E2E navigation and interaction
- Deployment: Both GitHub Pages and Vercel
- Accessibility: WCAG 2.1 AA compliance

---

## Table of Contents

1. [Baseline Establishment](#1-baseline-establishment)
2. [Visual Regression Testing Strategy](#2-visual-regression-testing-strategy)
3. [Phase-by-Phase Testing Plans](#3-phase-by-phase-testing-plans)
4. [Test Matrix](#4-test-matrix)
5. [Tools and Infrastructure](#5-tools-and-infrastructure)
6. [Smoke Test Suite](#6-smoke-test-suite)
7. [Rollback Procedures](#7-rollback-procedures)
8. [Statistical Validation](#8-statistical-validation)
9. [CI/CD Integration](#9-cicd-integration)

---

## 1. Baseline Establishment

### 1.1 Pre-Refactoring Metrics Collection

**Goal:** Establish measurable baselines for all aspects of the site before any changes.

#### Build Metrics
```bash
#!/bin/bash
# File: tests/baseline/measure-build-performance.sh

echo "=== Build Performance Baseline ==="
echo "Date: $(date)"
echo ""

# Clean build
rm -rf _site .jekyll-cache
echo "Clean build time:"
time bundle exec jekyll build --profile 2>&1 | tee baseline-build-clean.log

# Incremental build
touch _posts/2024-01-01-test.md
echo "Incremental build time:"
time bundle exec jekyll build 2>&1 | tee baseline-build-incremental.log

# Bundle install time
rm -rf vendor/bundle
echo "Bundle install time:"
time bundle install 2>&1 | tee baseline-bundle-install.log

# npm install time
rm -rf node_modules
echo "npm install time:"
time npm install 2>&1 | tee baseline-npm-install.log

echo ""
echo "=== File Size Metrics ==="
echo "Built site size: $(du -sh _site | cut -f1)"
echo "CSS file size: $(du -sh _site/assets/css/main.css | cut -f1)"
echo "SCSS source lines: $(find _sass -name "*.scss" -exec wc -l {} + | tail -1)"
echo "main.scss lines: $(wc -l assets/css/main.scss)"
echo "node_modules size: $(du -sh node_modules | cut -f1)"
echo "vendor/bundle size: $(du -sh vendor/bundle | cut -f1)"
```

**Expected Baseline Values (to be measured):**
```yaml
build_metrics:
  clean_build_time: "TBD seconds"
  incremental_build_time: "TBD seconds"
  bundle_install_time: "TBD seconds"
  npm_install_time: "TBD seconds"

size_metrics:
  site_total: "15MB (measured)"
  css_compiled: "TBD KB"
  scss_lines: "5,259 lines"
  main_scss_lines: "393 lines"
  node_modules: "TBD MB"
  ruby_bundle: "TBD MB"

dependency_metrics:
  ruby_gems: "TBD count"
  npm_packages: "TBD count"
  scss_files: "23 files"
```

#### Performance Metrics
```bash
#!/bin/bash
# File: tests/baseline/measure-performance.sh

echo "=== Performance Baseline ==="

# Start Jekyll server
bundle exec jekyll serve --detach
sleep 10

# Run Lighthouse on key pages
echo "Running Lighthouse audits..."
npm run test:performance 2>&1 | tee baseline-lighthouse.log

# Kill server
pkill -f jekyll

# Extract key metrics
echo ""
echo "=== Core Web Vitals Baseline ==="
echo "See baseline-lighthouse.log for details"
```

**Key Performance Metrics:**
- First Contentful Paint (FCP): Target <2s
- Largest Contentful Paint (LCP): Target <3s
- Total Blocking Time (TBT): Target <300ms
- Cumulative Layout Shift (CLS): Target <0.1
- Speed Index: Target <4s
- Accessibility Score: Target ≥95%
- SEO Score: Target ≥95%
- Best Practices Score: Target ≥90%

#### Visual Baseline
```bash
#!/bin/bash
# File: tests/baseline/capture-visual-baseline.sh

echo "=== Visual Baseline Capture ==="

# Start Jekyll server
bundle exec jekyll serve --detach
sleep 10

# Capture screenshots of key pages
npx playwright test tests/visual/capture-baseline.spec.js

# Kill server
pkill -f jekyll

echo "Baseline screenshots saved to tests/visual/baseline/"
```

### 1.2 Baseline Storage

**Directory Structure:**
```
tests/
├── baseline/
│   ├── README.md                           # How to use baselines
│   ├── metrics-YYYY-MM-DD.json             # JSON metrics snapshot
│   ├── build-clean.log
│   ├── build-incremental.log
│   ├── lighthouse-homepage.json
│   ├── lighthouse-about.json
│   ├── lighthouse-posts.json
│   └── lighthouse-projects.json
├── visual/
│   ├── baseline/                           # Reference screenshots
│   │   ├── homepage-desktop-chromium.png
│   │   ├── homepage-mobile-chromium.png
│   │   ├── about-desktop-chromium.png
│   │   ├── posts-desktop-chromium.png
│   │   ├── post-detail-desktop-chromium.png
│   │   └── projects-desktop-chromium.png
│   └── current/                            # Current test screenshots
└── reports/
    └── baseline-YYYY-MM-DD.html            # HTML report
```

**Baseline Capture Command:**
```bash
npm run test:capture-baseline
```

**Implementation in package.json:**
```json
{
  "scripts": {
    "test:capture-baseline": "bash tests/baseline/measure-build-performance.sh && bash tests/baseline/measure-performance.sh && bash tests/baseline/capture-visual-baseline.sh",
    "test:compare-baseline": "bash tests/baseline/compare-to-baseline.sh"
  }
}
```

---

## 2. Visual Regression Testing Strategy

### 2.1 Tool Selection: Playwright + Pixelmatch

**Why Playwright for Visual Regression:**
- Already in use for E2E testing
- Built-in screenshot capabilities
- Cross-browser support (Chromium, Firefox, WebKit)
- Deterministic rendering
- No additional dependencies needed

**Visual Comparison Library: Pixelmatch**
- Industry-standard pixel comparison
- Configurable tolerance levels
- Generates visual diffs
- Fast and reliable

### 2.2 Visual Test Implementation

**File: tests/visual/visual-regression.spec.js**
```javascript
const { test, expect } = require('@playwright/test');
const { compareScreenshots } = require('./visual-comparison-helper');

const PAGES_TO_TEST = [
  { path: '/', name: 'homepage' },
  { path: '/about/', name: 'about' },
  { path: '/posts/', name: 'posts' },
  { path: '/projects/', name: 'projects' },
  // Add a real post URL after checking what exists
  { path: '/posts/2024-01-01-sample-post/', name: 'post-detail' },
];

const VIEWPORTS = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'tablet', width: 1024, height: 768 },
  { name: 'mobile', width: 375, height: 667 },
];

// Run in Chromium only by default for speed
test.describe('Visual Regression Tests', () => {
  for (const page of PAGES_TO_TEST) {
    for (const viewport of VIEWPORTS) {
      test(`${page.name} - ${viewport.name}`, async ({ page: browserPage }) => {
        // Set viewport
        await browserPage.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });

        // Navigate to page
        await browserPage.goto(page.path);

        // Wait for page to be fully loaded
        await browserPage.waitForLoadState('networkidle');

        // Wait for fonts to load
        await browserPage.waitForFunction(() => document.fonts.ready);

        // Remove dynamic content that changes (dates, etc.)
        await browserPage.evaluate(() => {
          // Hide elements with timestamps
          document.querySelectorAll('.date, .timestamp, time').forEach(el => {
            el.style.visibility = 'hidden';
          });
        });

        // Take screenshot
        const screenshot = await browserPage.screenshot({
          fullPage: true,
          animations: 'disabled', // Disable CSS animations
        });

        // Compare with baseline
        const baselinePath = `tests/visual/baseline/${page.name}-${viewport.name}-${browserPage.context().browser().browserType().name()}.png`;
        const currentPath = `tests/visual/current/${page.name}-${viewport.name}-${browserPage.context().browser().browserType().name()}.png`;
        const diffPath = `tests/visual/diffs/${page.name}-${viewport.name}-${browserPage.context().browser().browserType().name()}.png`;

        const comparison = await compareScreenshots(
          baselinePath,
          screenshot,
          currentPath,
          diffPath,
          {
            threshold: 0.1, // 0.1% difference tolerance
            includeAA: false, // Ignore anti-aliasing differences
          }
        );

        // Assert visual match
        expect(comparison.diffPixelCount).toBeLessThan(
          comparison.totalPixels * 0.001 // Allow 0.1% difference
        );

        if (comparison.diffPixelCount > 0) {
          console.log(`Visual differences detected: ${comparison.diffPercentage}%`);
          console.log(`Diff image saved to: ${diffPath}`);
        }
      });
    }
  }
});
```

**File: tests/visual/visual-comparison-helper.js**
```javascript
const fs = require('fs').promises;
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

/**
 * Compare two images and generate a diff
 * @param {string} baselinePath - Path to baseline image
 * @param {Buffer} currentBuffer - Current screenshot buffer
 * @param {string} currentPath - Path to save current screenshot
 * @param {string} diffPath - Path to save diff image
 * @param {Object} options - Comparison options
 * @returns {Promise<Object>} Comparison result
 */
async function compareScreenshots(
  baselinePath,
  currentBuffer,
  currentPath,
  diffPath,
  options = {}
) {
  const { threshold = 0.1, includeAA = false } = options;

  // Ensure directories exist
  await fs.mkdir(path.dirname(currentPath), { recursive: true });
  await fs.mkdir(path.dirname(diffPath), { recursive: true });

  // Save current screenshot
  await fs.writeFile(currentPath, currentBuffer);

  // Check if baseline exists
  let baselineExists = false;
  try {
    await fs.access(baselinePath);
    baselineExists = true;
  } catch (err) {
    // Baseline doesn't exist - save current as baseline
    await fs.mkdir(path.dirname(baselinePath), { recursive: true });
    await fs.copyFile(currentPath, baselinePath);
    console.log(`No baseline found. Saved current screenshot as baseline: ${baselinePath}`);
    return {
      baselineCreated: true,
      diffPixelCount: 0,
      totalPixels: 0,
      diffPercentage: 0,
    };
  }

  // Load images
  const baselineBuffer = await fs.readFile(baselinePath);
  const baselineImg = PNG.sync.read(baselineBuffer);
  const currentImg = PNG.sync.read(currentBuffer);

  // Ensure dimensions match
  if (
    baselineImg.width !== currentImg.width ||
    baselineImg.height !== currentImg.height
  ) {
    throw new Error(
      `Image dimensions mismatch: baseline ${baselineImg.width}x${baselineImg.height}, current ${currentImg.width}x${currentImg.height}`
    );
  }

  // Create diff image
  const { width, height } = baselineImg;
  const diffImg = new PNG({ width, height });

  // Compare images
  const diffPixelCount = pixelmatch(
    baselineImg.data,
    currentImg.data,
    diffImg.data,
    width,
    height,
    {
      threshold,
      includeAA,
      diffColor: [255, 0, 0], // Red for differences
      diffMask: false,
    }
  );

  // Save diff image if differences found
  if (diffPixelCount > 0) {
    const diffBuffer = PNG.sync.write(diffImg);
    await fs.writeFile(diffPath, diffBuffer);
  }

  const totalPixels = width * height;
  const diffPercentage = (diffPixelCount / totalPixels) * 100;

  return {
    diffPixelCount,
    totalPixels,
    diffPercentage,
    width,
    height,
  };
}

module.exports = { compareScreenshots };
```

### 2.3 Visual Test Workflow

**Before Refactoring:**
```bash
# 1. Capture baseline screenshots
npm run test:visual:capture-baseline

# This creates baseline images in tests/visual/baseline/
```

**During Refactoring:**
```bash
# 2. After each SCSS change, run visual regression tests
npm run test:visual

# 3. If tests fail, review diff images in tests/visual/diffs/
# 4. Decide: Is this a bug (revert) or intentional (update baseline)?
```

**Updating Baselines (only if changes are intentional):**
```bash
# Copy current to baseline
npm run test:visual:update-baseline
```

### 2.4 Critical Visual Elements to Test

**SCSS Impact Areas:**
| Element | Critical Measurements | Tolerance |
|---------|----------------------|-----------|
| Header height | Exact 100px | 0px |
| Navigation centering | Horizontal alignment | 2px |
| Sidebar profile image | 150px circle | 0px |
| Content max-width | 1200px | 0px |
| Font sizes | 16px base | 0px |
| Line heights | 1.7 | 0.01 |
| Link colors | $academic-red (#8b2635) | Exact hex |
| Border widths | As specified | 0px |
| Responsive breakpoints | 768px, 1024px | 0px |
| Archive item spacing | As styled | 2px |

**Screenshot Coverage:**
- Homepage (with sidebar)
- About page
- Posts archive listing
- Individual post (with typography)
- Projects page
- All at 3 viewports: Desktop (1920x1080), Tablet (1024x768), Mobile (375x667)
- **Total: 15 screenshots**

---

## 3. Phase-by-Phase Testing Plans

### Phase 1: Foundation & Quick Wins

**Goal:** Remove unused dependencies, organize files, document architecture.

#### 3.1.1 Test Checklist

**Pre-Phase Tests:**
- [ ] Capture baseline metrics
- [ ] Capture visual baseline
- [ ] Run full test suite and record results
- [ ] Commit on branch: `refactor/phase-1-foundation`

**Dependency Removal Tests:**

For each dependency removed:
1. [ ] Remove from Gemfile/package.json
2. [ ] Run `bundle install` or `npm install`
3. [ ] Build site: `bundle exec jekyll build`
4. [ ] Run test suite: `npm run test:all`
5. [ ] Check for errors in build log
6. [ ] Visual regression test: `npm run test:visual`
7. [ ] If all pass: commit with message "Remove [dependency]: [reason]"
8. [ ] If any fail: revert and document why dependency is needed

**Dependencies to Test:**

```bash
# Test removing jekyll-coffeescript
grep -r "\.coffee$" . --exclude-dir=node_modules --exclude-dir=vendor
# Expected: No .coffee files found → Safe to remove

# Test removing octopress
grep -r "octopress" _config.yml Gemfile
grep -r "Octopress" . --exclude-dir=node_modules --exclude-dir=vendor
# Expected: Only in Gemfile → Safe to remove

# Test removing bundler-graph
# This is a dev tool, safe to remove

# Test removing puppeteer
grep -r "puppeteer" . --exclude-dir=node_modules
# Expected: Not used in tests → Safe to remove (Playwright replaces it)

# Test removing chrome-launcher
grep -r "chrome-launcher" . --exclude-dir=node_modules
# Expected: Not used in tests → Safe to remove (Playwright includes it)
```

**File Organization Tests:**
1. [ ] Move test files to new structure
2. [ ] Update test paths in configs
3. [ ] Run each test suite individually
4. [ ] Run full test suite
5. [ ] Verify test:all still works

**Documentation Tests:**
1. [ ] Create architecture docs
2. [ ] Verify SCSS file audit is accurate
3. [ ] Test documentation links
4. [ ] Peer review documentation

#### 3.1.2 Acceptance Criteria

**Success Criteria:**
- [ ] 5-7 dependencies removed
- [ ] Bundle install time: Same or faster
- [ ] npm install time: 20-30% faster
- [ ] node_modules size: ~50MB smaller
- [ ] All tests pass (100% pass rate)
- [ ] Visual regression: 0 differences
- [ ] Build completes without errors
- [ ] Site renders identically
- [ ] Documentation complete and accurate

**Metrics to Record:**
```yaml
phase_1_metrics:
  dependencies_removed:
    ruby: ["jekyll-coffeescript", "octopress", "bundler-graph"]
    npm: ["puppeteer", "chrome-launcher"]

  performance_change:
    bundle_install_time: "baseline → new (% change)"
    npm_install_time: "baseline → new (% change)"
    node_modules_size: "baseline → new (MB saved)"

  test_results:
    unit_tests: "pass/fail"
    e2e_tests: "pass/fail"
    visual_regression: "0 differences"
    build_success: true
```

#### 3.1.3 Rollback Procedure

**If Phase 1 fails:**
```bash
# 1. Identify what failed
git diff HEAD

# 2. Revert to before Phase 1
git reset --hard origin/master

# 3. Document why it failed
echo "Phase 1 rollback: [reason]" >> documentation/refactoring/rollback-log.md

# 4. Investigate and fix
# 5. Try again on new branch
```

**Time to Rollback:** <2 minutes

---

### Phase 2: SCSS Consolidation

**Goal:** Consolidate SCSS files, fork theme if chosen, establish single source of truth.

**Risk Level:** HIGH - This phase directly affects visual appearance.

#### 3.2.1 Test Checklist

**Pre-Phase Tests:**
- [ ] Create branch: `refactor/phase-2-scss`
- [ ] Capture fresh baseline (after Phase 1)
- [ ] Document current SCSS import order
- [ ] Map all SCSS dependencies
- [ ] Identify all places where each SCSS file is imported

**Theme Forking Tests (if Option A chosen):**
1. [ ] Download Minimal Mistakes 4.27.3
2. [ ] Copy theme files to `_sass/theme/`
3. [ ] Remove `remote_theme` from _config.yml
4. [ ] Remove `minimal-mistakes-jekyll` from Gemfile
5. [ ] Update imports in main.scss
6. [ ] Build site: `bundle exec jekyll build --profile`
7. [ ] Check build time (should be faster without remote fetch)
8. [ ] Visual regression test: `npm run test:visual`
9. [ ] Expected: 0 visual differences
10. [ ] If differences found: investigate and fix
11. [ ] Commit: "Fork Minimal Mistakes 4.27.3 theme"

**SCSS File Consolidation Tests:**

For each file to consolidate:

**Step 1: Analyze dependencies**
```bash
# Find all imports of this file
grep -r "@import.*variables" _sass/ assets/

# Find all variables/mixins this file provides
grep -E "^\$|^@mixin|^%placeholder" _sass/variables.scss
```

**Step 2: Create consolidated file**
1. [ ] Create `_sass/custom/[new-file].scss`
2. [ ] Copy content from old file
3. [ ] Add documentation comments
4. [ ] Organize by section

**Step 3: Update imports**
1. [ ] Update main.scss to import from new location
2. [ ] Remove old import
3. [ ] Build site
4. [ ] Check for SCSS errors

**Step 4: Test**
1. [ ] Build: `bundle exec jekyll build`
2. [ ] Visual test: `npm run test:visual`
3. [ ] E2E tests: `npm run test:e2e`
4. [ ] Compare compiled CSS size: `du -sh _site/assets/css/main.css`
5. [ ] Expected: Same or smaller CSS size
6. [ ] Expected: 0 visual differences

**Step 5: Verify and commit**
1. [ ] Check CSS is identical:
   ```bash
   # Build before consolidation
   bundle exec jekyll build
   cp _site/assets/css/main.css /tmp/css-before.css

   # Make changes
   # ...

   # Build after consolidation
   bundle exec jekyll build
   cp _site/assets/css/main.css /tmp/css-after.css

   # Compare (should be identical or smaller)
   diff /tmp/css-before.css /tmp/css-after.css
   ```
2. [ ] If identical: delete old file
3. [ ] Commit: "Consolidate [filename] into custom/[newname]"

**Step 6: Repeat for each SCSS file**

**Files to consolidate (in order):**
1. `_sass/variables.scss` → `_sass/custom/_variables.scss`
2. `_sass/mixins.scss` → `_sass/custom/_variables.scss` (or remove if unused)
3. `_sass/typography.scss` → `_sass/custom/_overrides.scss`
4. `_sass/page.scss` → `_sass/custom/_overrides.scss`
5. `_sass/elements.scss` → `_sass/custom/_components.scss`
6. `_sass/site.scss` → `_sass/custom/_utilities.scss`
7. `_sass/coderay.scss` → `_sass/custom/_syntax.scss`
8. `_sass/grid.scss` → Evaluate if needed, else merge into utilities
9. `_sass/_buttons.scss` → Merge into components
10. `_sass/_footer.scss` → Check duplication with theme
11. `_sass/_sidebar.scss` → Check duplication with theme

**main.scss Optimization Tests:**
1. [ ] Before: Record line count (393 lines)
2. [ ] Move inline styles to custom modules
3. [ ] Update to modular imports only
4. [ ] After: Verify <100 lines
5. [ ] Build and test
6. [ ] Visual regression: 0 differences
7. [ ] CSS file size: Same or smaller

#### 3.2.2 Acceptance Criteria

**Success Criteria:**
- [ ] SCSS files: 23 → ~12 (48% reduction)
- [ ] main.scss: 393 lines → <100 lines (75% reduction)
- [ ] SCSS lines: 5,259 → ~3,500 (33% reduction)
- [ ] All custom SCSS in `_sass/custom/` directory
- [ ] Clear separation: theme vs. custom
- [ ] Build time: Same or faster
- [ ] CSS file size: Same or smaller
- [ ] Visual regression: 0 differences
- [ ] All tests pass
- [ ] No `!important` flags needed (proper cascade)
- [ ] Documentation updated

**Measurements:**
```yaml
phase_2_metrics:
  scss_consolidation:
    files_before: 23
    files_after: "TBD"
    lines_before: 5259
    lines_after: "TBD"
    reduction_percentage: "TBD%"

  main_scss:
    lines_before: 393
    lines_after: "TBD"
    reduction_percentage: "TBD%"

  build_performance:
    build_time_before: "baseline"
    build_time_after: "TBD"
    improvement_percentage: "TBD%"
    css_size_before: "baseline"
    css_size_after: "TBD"

  visual_regression:
    screenshots_compared: 15
    differences_found: 0
    pass_rate: "100%"
```

#### 3.2.3 Rollback Procedure

**Risk:** HIGH - Visual appearance may break.

**Safety Net:**
```bash
# Keep old SCSS files during consolidation
# Only delete after verification

# Create backup branch
git checkout -b refactor/phase-2-scss-backup
git checkout refactor/phase-2-scss

# After each consolidation, commit separately
# This allows surgical rollback
```

**If visual regression detected:**
```bash
# 1. Review diff images
open tests/visual/diffs/

# 2. Decide: Bug or intentional change?

# If bug:
# 3. Identify which consolidation caused it
git log --oneline

# 4. Revert that specific commit
git revert [commit-hash]

# 5. Re-test
npm run test:visual

# If intentional (should not be):
# This means we made a mistake - review and fix
```

**Complete rollback:**
```bash
# Revert all Phase 2 changes
git checkout master
git branch -D refactor/phase-2-scss

# Verify site works
bundle exec jekyll build
npm run test:visual
```

**Time to Rollback:** <5 minutes

#### 3.2.4 CSS Comparison Testing

**Automated CSS diff test:**

**File: tests/scss/css-comparison.test.js**
```javascript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const css = require('css');

describe('CSS Output Comparison', () => {
  let baselineCSS, currentCSS;

  beforeAll(() => {
    // Paths
    const baselinePath = 'tests/baseline/main.css';
    const currentPath = '_site/assets/css/main.css';

    // Read CSS files
    baselineCSS = fs.readFileSync(baselinePath, 'utf8');
    currentCSS = fs.readFileSync(currentPath, 'utf8');
  });

  test('CSS file size should not increase', () => {
    const baselineSize = Buffer.byteLength(baselineCSS, 'utf8');
    const currentSize = Buffer.byteLength(currentCSS, 'utf8');

    console.log(`Baseline CSS: ${baselineSize} bytes`);
    console.log(`Current CSS: ${currentSize} bytes`);
    console.log(`Difference: ${currentSize - baselineSize} bytes`);

    // Allow up to 5% increase (for minor formatting differences)
    expect(currentSize).toBeLessThanOrEqual(baselineSize * 1.05);
  });

  test('Critical CSS rules should be present', () => {
    // Parse CSS
    const currentAST = css.parse(currentCSS);

    // Check for critical selectors
    const criticalSelectors = [
      '.masthead',
      '.greedy-nav',
      '.sidebar',
      '.page-content',
      '.archive__item',
      '.page-hero',
      '#main',
    ];

    criticalSelectors.forEach(selector => {
      const found = findSelector(currentAST, selector);
      expect(found).toBeTruthy();
    });
  });

  test('Critical CSS properties should be preserved', () => {
    const currentAST = css.parse(currentCSS);

    // Test specific rules
    const tests = [
      { selector: 'body', property: 'font-size', value: '16px' },
      { selector: 'body', property: 'line-height', value: '1.7' },
      { selector: '.page-hero', property: 'height', value: '100px' },
      { selector: '#main', property: 'max-width', value: '1200px' },
      { selector: '.sidebar .author-avatar img', property: 'width', value: '150px' },
    ];

    tests.forEach(test => {
      const rule = findRule(currentAST, test.selector, test.property);
      expect(rule).toBeTruthy();
      if (rule) {
        expect(rule.value).toContain(test.value);
      }
    });
  });
});

function findSelector(ast, selector) {
  // Implementation to find selector in CSS AST
  // Returns true if found
}

function findRule(ast, selector, property) {
  // Implementation to find specific rule
  // Returns declaration node if found
}
```

---

### Phase 3: Deployment Simplification

**Goal:** Choose primary deployment, simplify configuration, document strategy.

#### 3.3.1 Test Checklist

**Pre-Phase Tests:**
- [ ] Create branch: `refactor/phase-3-deployment`
- [ ] Document current deployment configs
- [ ] Test both GitHub Pages and Vercel deployments
- [ ] Capture deployment metrics

**Deployment Decision Tests:**
1. [ ] Test GitHub Pages build
2. [ ] Test Vercel build
3. [ ] Compare build times
4. [ ] Compare build success rates
5. [ ] Check for differences in output
6. [ ] Document decision

**Configuration Simplification:**
1. [ ] Update Gemfile
2. [ ] Update _config.yml
3. [ ] Update vercel.json (if keeping)
4. [ ] Test local build
5. [ ] Test CI/CD build
6. [ ] Deploy to staging
7. [ ] Visual regression test on deployed site

**Deployment Tests:**
```bash
# Test GitHub Pages deployment
git push origin refactor/phase-3-deployment
# Wait for GitHub Pages build
# Visit site: https://[username].github.io
npm run test:visual:deployed https://[username].github.io

# Test Vercel deployment
vercel --prod
# Visit preview URL
npm run test:visual:deployed [preview-url]
```

#### 3.3.2 Acceptance Criteria

**Success Criteria:**
- [ ] Primary deployment chosen and documented
- [ ] Secondary deployment configured for previews
- [ ] Build configuration simplified
- [ ] Both deployments produce identical output
- [ ] Deployment documentation complete
- [ ] Build time: Same or faster
- [ ] Deploy time: Same or faster
- [ ] Rollback procedure documented and tested

**Metrics:**
```yaml
phase_3_metrics:
  deployment:
    primary: "GitHub Pages"
    secondary: "Vercel (preview)"

  build_config:
    gemfile_gems_before: "TBD"
    gemfile_gems_after: "TBD"
    config_complexity: "Simplified"

  performance:
    github_pages_build_time: "TBD"
    vercel_build_time: "TBD"

  verification:
    output_identical: true
    visual_regression: "0 differences"
```

#### 3.3.3 Rollback Procedure

**Deployment rollback is critical:**

**GitHub Pages:**
```bash
# If deployment breaks, revert commit
git revert [commit-hash]
git push origin master

# GitHub Pages will auto-rebuild
# Time: ~2-5 minutes
```

**Vercel:**
```bash
# Use Vercel dashboard to rollback
# Or redeploy previous commit
vercel --prod --yes
```

**Time to Rollback:** <5 minutes

---

### Phase 4: Testing Consolidation

**Goal:** Consolidate Playwright and Lighthouse, reduce browser matrix, simplify test commands.

#### 3.4.1 Test Checklist

**Pre-Phase Tests:**
- [ ] Create branch: `refactor/phase-4-testing`
- [ ] Run full test suite with current config
- [ ] Record test times and coverage
- [ ] Ensure all tests pass

**Browser Matrix Reduction:**
1. [ ] Update playwright.config.js
2. [ ] Remove Mobile Chrome and Mobile Safari
3. [ ] Keep Chromium, Firefox, WebKit
4. [ ] Run E2E tests: `npm run test:e2e`
5. [ ] Verify coverage is still adequate
6. [ ] Measure time saved

**Lighthouse Integration:**
1. [ ] Install lighthouse Playwright plugin
2. [ ] Create performance.spec.js
3. [ ] Migrate Lighthouse assertions
4. [ ] Run: `npm run test:e2e` (now includes Lighthouse)
5. [ ] Compare results with standalone Lighthouse
6. [ ] Verify thresholds are met
7. [ ] Remove .lighthouserc.js
8. [ ] Remove tests/performance/lighthouse.js
9. [ ] Update npm scripts

**Test Command Simplification:**
1. [ ] Update package.json scripts
2. [ ] Test each script
3. [ ] Test test:all
4. [ ] Test test:ci
5. [ ] Verify CI/CD still works

#### 3.4.2 Acceptance Criteria

**Success Criteria:**
- [ ] Browser configs: 5 → 3 (40% reduction)
- [ ] Test config files: 3 → 1 (67% reduction)
- [ ] Dependencies removed: 2 (lighthouse standalone, chrome-launcher if not already removed)
- [ ] Test execution time: 20% faster
- [ ] Test coverage: Maintained or improved
- [ ] All tests pass
- [ ] CI/CD working

**Metrics:**
```yaml
phase_4_metrics:
  test_consolidation:
    browser_configs_before: 5
    browser_configs_after: 3
    config_files_before: 3
    config_files_after: 1

  performance:
    test_time_before: "baseline"
    test_time_after: "TBD"
    improvement: "TBD%"

  coverage:
    unit_tests: "maintained"
    e2e_tests: "maintained"
    lighthouse_tests: "migrated"
    visual_regression: "maintained"
```

#### 3.4.3 Rollback Procedure

**Low risk phase - easy rollback:**

```bash
# Revert playwright.config.js
git checkout master -- playwright.config.js

# Restore .lighthouserc.js
git checkout master -- .lighthouserc.js

# Restore test scripts
git checkout master -- package.json

# Reinstall dependencies
npm install

# Verify
npm run test:all
```

**Time to Rollback:** <3 minutes

---

## 4. Test Matrix

### 4.1 Comprehensive Test Coverage Matrix

| Test Type | Tool | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Frequency | Critical |
|-----------|------|---------|---------|---------|---------|-----------|----------|
| **Build Tests** |
| Clean build | Jekyll | ✓ | ✓ | ✓ | ✓ | Every commit | Yes |
| Incremental build | Jekyll | ✓ | ✓ | ✓ | ✓ | Every commit | Yes |
| Build time | Script | ✓ | ✓ | ✓ | ✓ | Every commit | Yes |
| Bundle install | Bundler | ✓ | - | ✓ | - | On dependency change | Yes |
| npm install | npm | ✓ | - | - | ✓ | On dependency change | Yes |
| **SCSS Tests** |
| SCSS compilation | Jekyll | ✓ | ✓ | ✓ | ✓ | Every commit | Yes |
| CSS file size | Script | - | ✓ | - | - | After SCSS changes | Yes |
| CSS output comparison | Custom | - | ✓ | - | - | After SCSS changes | Yes |
| SCSS linting | Stylelint | ✓ | ✓ | ✓ | ✓ | Every commit | No |
| **Visual Regression** |
| Homepage | Playwright | ✓ | ✓ | ✓ | ✓ | Every commit | Yes |
| About page | Playwright | ✓ | ✓ | ✓ | ✓ | Every commit | Yes |
| Posts listing | Playwright | ✓ | ✓ | ✓ | ✓ | Every commit | Yes |
| Post detail | Playwright | ✓ | ✓ | ✓ | ✓ | Every commit | Yes |
| Projects page | Playwright | ✓ | ✓ | ✓ | ✓ | Every commit | Yes |
| Desktop viewport | Playwright | ✓ | ✓ | ✓ | ✓ | Every commit | Yes |
| Tablet viewport | Playwright | ✓ | ✓ | ✓ | ✓ | Every commit | Yes |
| Mobile viewport | Playwright | ✓ | ✓ | ✓ | ✓ | Every commit | Yes |
| **Functional Tests** |
| Navigation | Playwright | ✓ | ✓ | ✓ | ✓ | Every commit | Yes |
| Links | Playwright | ✓ | ✓ | ✓ | ✓ | Every commit | Yes |
| Search | Playwright | - | - | - | - | Every commit | No |
| Forms | Playwright | - | - | - | - | Every commit | No |
| **Performance Tests** |
| Lighthouse scores | Lighthouse | ✓ | ✓ | ✓ | ✓ | Every commit | Yes |
| FCP | Lighthouse | ✓ | ✓ | ✓ | ✓ | Every commit | Yes |
| LCP | Lighthouse | ✓ | ✓ | ✓ | ✓ | Every commit | Yes |
| TBT | Lighthouse | ✓ | ✓ | ✓ | ✓ | Every commit | Yes |
| CLS | Lighthouse | ✓ | ✓ | ✓ | ✓ | Every commit | Yes |
| **Accessibility Tests** |
| Axe audit | Playwright | ✓ | ✓ | ✓ | ✓ | Every commit | Yes |
| Color contrast | Lighthouse | ✓ | ✓ | ✓ | ✓ | Every commit | Yes |
| Alt text | Lighthouse | ✓ | ✓ | ✓ | ✓ | Every commit | Yes |
| ARIA labels | Lighthouse | ✓ | ✓ | ✓ | ✓ | Every commit | Yes |
| **SEO Tests** |
| Meta tags | Lighthouse | ✓ | ✓ | ✓ | ✓ | Every commit | Yes |
| Structured data | Custom | ✓ | ✓ | ✓ | ✓ | Every commit | Yes |
| Sitemap | Custom | ✓ | ✓ | ✓ | ✓ | Every commit | Yes |
| Robots.txt | Custom | ✓ | ✓ | ✓ | ✓ | Every commit | Yes |
| **Unit Tests** |
| JS functionality | Jest | ✓ | ✓ | ✓ | ✓ | Every commit | Yes |
| Analytics | Jest | ✓ | ✓ | ✓ | ✓ | Every commit | Yes |
| **Deployment Tests** |
| GitHub Pages deploy | GitHub | - | - | ✓ | - | On merge to master | Yes |
| Vercel deploy | Vercel | - | - | ✓ | - | On merge to master | Yes |
| Deploy time | Script | - | - | ✓ | - | On deploy | No |
| Deployment parity | Script | - | - | ✓ | - | On deploy | Yes |

**Total Test Cases:** 50+

---

## 5. Tools and Infrastructure

### 5.1 Required Tools

**Already Installed:**
- ✓ Playwright 1.40.0 - E2E testing and visual regression
- ✓ Jest 30.2.0 - Unit testing
- ✓ Lighthouse 12.8.2 - Performance testing
- ✓ Axe 4.8.3 - Accessibility testing
- ✓ Stylelint 16.23.1 - SCSS linting

**To Install:**
```json
{
  "devDependencies": {
    "pixelmatch": "^5.3.0",
    "pngjs": "^7.0.0",
    "css": "^3.0.0"
  }
}
```

```bash
npm install --save-dev pixelmatch pngjs css
```

### 5.2 Test Infrastructure Setup

**Directory Structure:**
```
tests/
├── baseline/                           # Baseline measurements
│   ├── measure-build-performance.sh
│   ├── measure-performance.sh
│   ├── capture-visual-baseline.sh
│   ├── compare-to-baseline.sh
│   ├── metrics-YYYY-MM-DD.json
│   └── README.md
├── visual/                             # Visual regression
│   ├── baseline/                       # Reference screenshots
│   ├── current/                        # Current screenshots
│   ├── diffs/                          # Diff images
│   ├── visual-regression.spec.js
│   ├── visual-comparison-helper.js
│   └── capture-baseline.spec.js
├── scss/                               # SCSS-specific tests
│   ├── css-comparison.test.js
│   ├── scss-lint.test.js
│   └── critical-rules.test.js
├── e2e/                                # E2E tests (existing)
│   ├── navigation.spec.js
│   ├── accessibility.spec.js
│   └── analytics.spec.js
├── performance/                        # Performance tests
│   ├── lighthouse-integrated.spec.js   # New: Playwright + Lighthouse
│   └── core-web-vitals.test.js
├── unit/                               # Unit tests (existing)
│   └── site-functionality.test.js
├── deployment/                         # Deployment tests (new)
│   ├── github-pages.test.js
│   ├── vercel.test.js
│   └── deployment-parity.test.js
└── smoke/                              # Smoke tests (new)
    └── smoke-suite.spec.js
```

### 5.3 npm Scripts

**Update package.json:**
```json
{
  "scripts": {
    "build": "bundle exec jekyll build",
    "serve": "RUBYOPT=\"-W0\" bundle exec jekyll serve",

    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test tests/e2e",
    "test:visual": "playwright test tests/visual/visual-regression.spec.js",
    "test:performance": "playwright test tests/performance",
    "test:unit": "jest tests/unit",
    "test:scss": "jest tests/scss",
    "test:smoke": "playwright test tests/smoke",

    "test:all": "npm run build && npm run test:unit && npm run test:scss && npm run test:e2e && npm run test:visual && npm run test:performance",
    "test:critical": "npm run build && npm run test:smoke && npm run test:visual",

    "test:capture-baseline": "bash tests/baseline/measure-build-performance.sh && bash tests/baseline/measure-performance.sh && bash tests/baseline/capture-visual-baseline.sh",
    "test:compare-baseline": "bash tests/baseline/compare-to-baseline.sh",
    "test:visual:capture-baseline": "playwright test tests/visual/capture-baseline.spec.js",
    "test:visual:update-baseline": "cp -r tests/visual/current/* tests/visual/baseline/",

    "lint:scss": "stylelint '**/*.scss'",
    "lint:scss:fix": "stylelint '**/*.scss' --fix",
    "format:scss": "prettier --write '**/*.scss'",

    "ci:test": "npm run test:all -- --reporter=github",
    "ci:smoke": "npm run test:critical -- --reporter=github"
  }
}
```

### 5.4 CI/CD Integration

**GitHub Actions Workflow:**

**File: .github/workflows/refactoring-tests.yml**
```yaml
name: Refactoring Tests

on:
  push:
    branches:
      - 'refactor/**'
  pull_request:
    branches:
      - master

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.4.4'
          bundler-cache: true

      - name: Set up Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: |
          bundle install
          npm install

      - name: Build site
        run: bundle exec jekyll build

      - name: Run unit tests
        run: npm run test:unit

      - name: Run SCSS tests
        run: npm run test:scss

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Run visual regression tests
        run: npm run test:visual

      - name: Run performance tests
        run: npm run test:performance

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: |
            tests/visual/diffs/
            test-results/
            playwright-report/

      - name: Compare to baseline
        run: npm run test:compare-baseline

      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const metrics = JSON.parse(fs.readFileSync('tests/baseline/comparison-report.json', 'utf8'));

            const comment = `## Refactoring Test Results

            ### Build Performance
            - Build time: ${metrics.build_time_change}
            - CSS size: ${metrics.css_size_change}

            ### Visual Regression
            - Screenshots compared: ${metrics.screenshots_compared}
            - Differences found: ${metrics.visual_differences}

            ### Test Results
            - Unit tests: ${metrics.unit_tests}
            - E2E tests: ${metrics.e2e_tests}
            - Visual tests: ${metrics.visual_tests}
            - Performance tests: ${metrics.performance_tests}
            `;

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

---

## 6. Smoke Test Suite

### 6.1 Purpose

**Smoke tests** are a minimal set of critical tests that verify the site is functional. Run after every major change to quickly catch breaking issues before running the full test suite.

**Goal:** Complete in <2 minutes

### 6.2 Smoke Test Implementation

**File: tests/smoke/smoke-suite.spec.js**
```javascript
const { test, expect } = require('@playwright/test');

test.describe('Smoke Tests - Critical Functionality', () => {
  test('Site builds successfully', async ({ request }) => {
    // This test assumes the site is already built by webServer
    // Just verify the server is responsive
    const response = await request.get('/');
    expect(response.status()).toBe(200);
  });

  test('Homepage loads and displays content', async ({ page }) => {
    await page.goto('/');

    // Check critical elements exist
    await expect(page.locator('.masthead')).toBeVisible();
    await expect(page.locator('.sidebar')).toBeVisible();
    await expect(page.locator('#main')).toBeVisible();

    // Check content loaded
    const hasContent = await page.locator('.page-content').count() > 0;
    expect(hasContent).toBeTruthy();
  });

  test('Navigation works', async ({ page }) => {
    await page.goto('/');

    // Test main navigation links
    await page.click('a[href*="about"]');
    await expect(page).toHaveURL(/about/);

    await page.click('a[href*="posts"]');
    await expect(page).toHaveURL(/posts/);

    await page.click('a[href*="projects"]');
    await expect(page).toHaveURL(/projects/);
  });

  test('CSS is loaded', async ({ page }) => {
    await page.goto('/');

    // Check that main.css is loaded
    const cssLoaded = await page.evaluate(() => {
      const links = document.querySelectorAll('link[rel="stylesheet"]');
      return Array.from(links).some(link => link.href.includes('main.css'));
    });
    expect(cssLoaded).toBeTruthy();

    // Check critical CSS is applied
    const bodyFontSize = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontSize;
    });
    expect(bodyFontSize).toBe('16px');
  });

  test('Critical visual elements are present', async ({ page }) => {
    await page.goto('/');

    // Header
    const header = page.locator('.page-hero');
    if (await header.count() > 0) {
      const height = await header.evaluate(el => el.offsetHeight);
      expect(height).toBe(100);
    }

    // Content width
    const main = page.locator('#main');
    const mainWidth = await main.evaluate(el => {
      return window.getComputedStyle(el).maxWidth;
    });
    expect(mainWidth).toBe('1200px');

    // Sidebar avatar
    const avatar = page.locator('.sidebar .author-avatar img');
    if (await avatar.count() > 0) {
      const width = await avatar.evaluate(el => el.offsetWidth);
      expect(width).toBeCloseTo(150, 5); // Allow 5px tolerance
    }
  });

  test('Posts page loads', async ({ page }) => {
    await page.goto('/posts/');

    // Check archive items exist
    const hasArchiveItems = await page.locator('.archive__item').count() > 0;
    expect(hasArchiveItems).toBeTruthy();
  });

  test('About page loads', async ({ page }) => {
    await page.goto('/about/');

    // Check page title exists
    await expect(page.locator('.page-title')).toBeVisible();
  });

  test('Projects page loads', async ({ page }) => {
    await page.goto('/projects/');

    // Check page loads
    await expect(page.locator('#main')).toBeVisible();
  });

  test('No console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out expected errors (if any)
    const unexpectedErrors = errors.filter(error => {
      // Add filters here if needed
      return true;
    });

    expect(unexpectedErrors).toHaveLength(0);
  });

  test('No broken images', async ({ page }) => {
    await page.goto('/');

    const brokenImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.filter(img => !img.complete || img.naturalWidth === 0).length;
    });

    expect(brokenImages).toBe(0);
  });

  test('Basic accessibility check', async ({ page }) => {
    await page.goto('/');

    // Check lang attribute
    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();

    // Check title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    // Check main landmark
    await expect(page.locator('main, [role="main"]')).toBeVisible();
  });
});
```

### 6.3 Smoke Test Usage

**When to run:**
1. After any SCSS change
2. After any configuration change
3. Before committing
4. Before running full test suite
5. In CI/CD pipeline (fast feedback)

**Command:**
```bash
npm run test:smoke
```

**Expected time:** <2 minutes

---

## 7. Rollback Procedures

### 7.1 General Rollback Strategy

**Principle:** Every phase must be reversible in <5 minutes.

**Git Strategy:**
```
master (protected)
  │
  ├── refactor/phase-1-foundation
  │   ├── commit: "Remove unused dependency X"
  │   ├── commit: "Remove unused dependency Y"
  │   └── commit: "Reorganize tests"
  │
  ├── refactor/phase-2-scss
  │   ├── commit: "Fork Minimal Mistakes theme"
  │   ├── commit: "Consolidate variables.scss"
  │   ├── commit: "Consolidate typography.scss"
  │   └── commit: "Optimize main.scss"
  │
  ├── refactor/phase-3-deployment
  │   └── ...
  │
  └── refactor/phase-4-testing
      └── ...
```

**Each commit:**
- Is small and focused
- Has a clear, descriptive message
- Passes all tests before committing
- Can be reverted individually

### 7.2 Phase-Specific Rollback Procedures

#### Phase 1: Foundation & Quick Wins

**Rollback Command:**
```bash
#!/bin/bash
# File: rollback-phase-1.sh

echo "Rolling back Phase 1: Foundation & Quick Wins"

# Checkout master versions of modified files
git checkout master -- Gemfile
git checkout master -- package.json
git checkout master -- tests/

# Reinstall dependencies
bundle install
npm install

# Verify
bundle exec jekyll build
npm run test:smoke

echo "Phase 1 rollback complete. Verify with: npm run test:all"
```

**Verification:**
- [ ] Site builds
- [ ] All tests pass
- [ ] Dependencies restored

**Time:** <2 minutes

#### Phase 2: SCSS Consolidation

**Rollback Command:**
```bash
#!/bin/bash
# File: rollback-phase-2.sh

echo "Rolling back Phase 2: SCSS Consolidation"

# Checkout master versions of SCSS files
git checkout master -- _sass/
git checkout master -- assets/css/
git checkout master -- _config.yml
git checkout master -- Gemfile

# Reinstall (in case theme was removed)
bundle install

# Build
bundle exec jekyll build

# Verify
npm run test:visual
npm run test:smoke

echo "Phase 2 rollback complete. Check visual regression results."
```

**Verification:**
- [ ] SCSS compiles
- [ ] CSS output matches baseline
- [ ] Visual regression: 0 differences
- [ ] All tests pass

**Time:** <5 minutes

#### Phase 3: Deployment Simplification

**Rollback Command:**
```bash
#!/bin/bash
# File: rollback-phase-3.sh

echo "Rolling back Phase 3: Deployment Simplification"

# Checkout master versions
git checkout master -- Gemfile
git checkout master -- _config.yml
git checkout master -- vercel.json
git checkout master -- package.json

# Reinstall
bundle install
npm install

# Build and deploy
bundle exec jekyll build

# Test both deployments
echo "Testing GitHub Pages deployment..."
git push origin master

echo "Testing Vercel deployment..."
vercel --prod

echo "Phase 3 rollback complete. Verify deployments."
```

**Verification:**
- [ ] GitHub Pages deploys
- [ ] Vercel deploys
- [ ] Both produce identical output
- [ ] Site accessible

**Time:** <5 minutes (excluding deploy time)

#### Phase 4: Testing Consolidation

**Rollback Command:**
```bash
#!/bin/bash
# File: rollback-phase-4.sh

echo "Rolling back Phase 4: Testing Consolidation"

# Checkout master versions
git checkout master -- playwright.config.js
git checkout master -- .lighthouserc.js
git checkout master -- package.json
git checkout master -- tests/

# Reinstall
npm install

# Verify
npm run test:all

echo "Phase 4 rollback complete."
```

**Verification:**
- [ ] All tests run
- [ ] All tests pass
- [ ] Test configuration restored

**Time:** <3 minutes

### 7.3 Emergency Rollback (Complete)

**Scenario:** Everything is broken, need to go back to last known good state immediately.

**Command:**
```bash
#!/bin/bash
# File: emergency-rollback.sh

echo "EMERGENCY ROLLBACK - Reverting all refactoring changes"

# Identify current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# Stash any uncommitted changes
git stash save "Emergency rollback stash $(date)"

# Checkout master
git checkout master

# Hard reset to origin/master
git fetch origin
git reset --hard origin/master

# Clean up
git clean -fd

# Reinstall dependencies
bundle install
npm install

# Build
bundle exec jekyll build

# Verify
npm run test:smoke

echo ""
echo "Emergency rollback complete."
echo "Site reverted to master branch."
echo "Stashed changes available with: git stash list"
echo ""
echo "Next steps:"
echo "1. Verify site is working: npm run test:all"
echo "2. Investigate what went wrong"
echo "3. Fix issues on a new branch"
```

**Time:** <3 minutes

---

## 8. Statistical Validation

### 8.1 Performance Metrics Statistical Analysis

**Goal:** Ensure performance changes are real and not random variation.

**Approach:** Run tests multiple times, calculate mean and confidence intervals.

#### 8.1.1 Build Time Validation

**File: tests/baseline/statistical-validation.js**
```javascript
const { execSync } = require('child_process');
const fs = require('fs');

/**
 * Run a command multiple times and collect timing data
 */
function benchmarkCommand(command, runs = 10) {
  const times = [];

  console.log(`Running ${command} ${runs} times...`);

  for (let i = 0; i < runs; i++) {
    const start = Date.now();

    try {
      execSync(command, { stdio: 'ignore' });
    } catch (err) {
      console.error(`Run ${i + 1} failed:`, err.message);
      continue;
    }

    const end = Date.now();
    const duration = end - start;
    times.push(duration);

    console.log(`Run ${i + 1}: ${duration}ms`);
  }

  return times;
}

/**
 * Calculate statistical metrics
 */
function calculateStats(times) {
  const n = times.length;
  const mean = times.reduce((a, b) => a + b, 0) / n;
  const variance = times.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  const stdError = stdDev / Math.sqrt(n);

  // 95% confidence interval (z = 1.96 for 95% CI)
  const marginOfError = 1.96 * stdError;
  const ci_lower = mean - marginOfError;
  const ci_upper = mean + marginOfError;

  return {
    n,
    mean,
    stdDev,
    stdError,
    ci_lower,
    ci_upper,
    min: Math.min(...times),
    max: Math.max(...times),
  };
}

/**
 * Compare two sets of measurements
 */
function compareStats(baseline, current) {
  const difference = current.mean - baseline.mean;
  const percentChange = (difference / baseline.mean) * 100;

  // Check if confidence intervals overlap
  const significantlyDifferent =
    current.ci_lower > baseline.ci_upper ||
    current.ci_upper < baseline.ci_lower;

  return {
    difference,
    percentChange,
    significantlyDifferent,
    interpretation: significantlyDifferent
      ? percentChange > 0
        ? 'SIGNIFICANTLY SLOWER'
        : 'SIGNIFICANTLY FASTER'
      : 'NO SIGNIFICANT DIFFERENCE',
  };
}

/**
 * Main benchmark suite
 */
function runBenchmarks() {
  console.log('=== Performance Benchmark Suite ===\n');

  // Clean build benchmark
  console.log('1. Clean Build Benchmark');
  console.log('Cleaning...');
  execSync('rm -rf _site .jekyll-cache', { stdio: 'ignore' });
  const cleanBuildTimes = benchmarkCommand(
    'bundle exec jekyll build',
    5 // 5 runs for clean build (slower)
  );
  const cleanBuildStats = calculateStats(cleanBuildTimes);

  console.log('\nClean Build Statistics:');
  console.log(`  Mean: ${cleanBuildStats.mean.toFixed(0)}ms`);
  console.log(`  Std Dev: ${cleanBuildStats.stdDev.toFixed(0)}ms`);
  console.log(`  95% CI: [${cleanBuildStats.ci_lower.toFixed(0)}, ${cleanBuildStats.ci_upper.toFixed(0)}]ms`);
  console.log(`  Range: [${cleanBuildStats.min}, ${cleanBuildStats.max}]ms\n`);

  // Incremental build benchmark
  console.log('2. Incremental Build Benchmark');
  const incrementalBuildTimes = benchmarkCommand(
    'touch _posts/*.md && bundle exec jekyll build',
    10 // 10 runs for incremental (faster)
  );
  const incrementalBuildStats = calculateStats(incrementalBuildTimes);

  console.log('\nIncremental Build Statistics:');
  console.log(`  Mean: ${incrementalBuildStats.mean.toFixed(0)}ms`);
  console.log(`  Std Dev: ${incrementalBuildStats.stdDev.toFixed(0)}ms`);
  console.log(`  95% CI: [${incrementalBuildStats.ci_lower.toFixed(0)}, ${incrementalBuildStats.ci_upper.toFixed(0)}]ms`);
  console.log(`  Range: [${incrementalBuildStats.min}, ${incrementalBuildStats.max}]ms\n`);

  // Save results
  const results = {
    timestamp: new Date().toISOString(),
    cleanBuild: cleanBuildStats,
    incrementalBuild: incrementalBuildStats,
  };

  fs.writeFileSync(
    'tests/baseline/benchmark-results.json',
    JSON.stringify(results, null, 2)
  );

  console.log('Results saved to tests/baseline/benchmark-results.json');

  return results;
}

/**
 * Compare benchmarks
 */
function compareBenchmarks(baselinePath, currentPath) {
  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  const current = JSON.parse(fs.readFileSync(currentPath, 'utf8'));

  console.log('=== Benchmark Comparison ===\n');

  console.log('Clean Build:');
  const cleanComparison = compareStats(
    baseline.cleanBuild,
    current.cleanBuild
  );
  console.log(`  Baseline: ${baseline.cleanBuild.mean.toFixed(0)}ms (±${baseline.cleanBuild.stdDev.toFixed(0)})`);
  console.log(`  Current:  ${current.cleanBuild.mean.toFixed(0)}ms (±${current.cleanBuild.stdDev.toFixed(0)})`);
  console.log(`  Change:   ${cleanComparison.difference.toFixed(0)}ms (${cleanComparison.percentChange.toFixed(1)}%)`);
  console.log(`  Result:   ${cleanComparison.interpretation}\n`);

  console.log('Incremental Build:');
  const incrementalComparison = compareStats(
    baseline.incrementalBuild,
    current.incrementalBuild
  );
  console.log(`  Baseline: ${baseline.incrementalBuild.mean.toFixed(0)}ms (±${baseline.incrementalBuild.stdDev.toFixed(0)})`);
  console.log(`  Current:  ${current.incrementalBuild.mean.toFixed(0)}ms (±${current.incrementalBuild.stdDev.toFixed(0)})`);
  console.log(`  Change:   ${incrementalComparison.difference.toFixed(0)}ms (${incrementalComparison.percentChange.toFixed(1)}%)`);
  console.log(`  Result:   ${incrementalComparison.interpretation}\n`);

  return {
    cleanBuild: cleanComparison,
    incrementalBuild: incrementalComparison,
  };
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];

  if (command === 'benchmark') {
    runBenchmarks();
  } else if (command === 'compare') {
    const baselinePath = process.argv[3] || 'tests/baseline/benchmark-results.json';
    const currentPath = process.argv[4] || 'tests/baseline/benchmark-results-current.json';
    compareBenchmarks(baselinePath, currentPath);
  } else {
    console.log('Usage:');
    console.log('  node statistical-validation.js benchmark');
    console.log('  node statistical-validation.js compare <baseline> <current>');
  }
}

module.exports = {
  benchmarkCommand,
  calculateStats,
  compareStats,
  runBenchmarks,
  compareBenchmarks,
};
```

#### 8.1.2 Performance Test Statistical Validation

**Lighthouse tests should run multiple times:**

**File: tests/performance/lighthouse-statistical.spec.js**
```javascript
const { test, expect } = require('@playwright/test');

const RUNS = 3; // Run each Lighthouse test 3 times
const PAGES = [
  { path: '/', name: 'homepage' },
  { path: '/about/', name: 'about' },
  { path: '/posts/', name: 'posts' },
];

test.describe('Lighthouse Statistical Performance Tests', () => {
  for (const page of PAGES) {
    test(`${page.name} - Performance (${RUNS} runs)`, async ({ page: browserPage }) => {
      const scores = [];

      for (let i = 0; i < RUNS; i++) {
        await browserPage.goto(page.path);

        // Run Lighthouse
        // (Implementation depends on Lighthouse plugin)
        const result = await runLighthouse(browserPage);

        scores.push({
          performance: result.performance,
          accessibility: result.accessibility,
          seo: result.seo,
          bestPractices: result.bestPractices,
        });

        console.log(`Run ${i + 1}: Performance=${result.performance}`);
      }

      // Calculate mean scores
      const meanScores = {
        performance: scores.reduce((sum, s) => sum + s.performance, 0) / RUNS,
        accessibility: scores.reduce((sum, s) => sum + s.accessibility, 0) / RUNS,
        seo: scores.reduce((sum, s) => sum + s.seo, 0) / RUNS,
        bestPractices: scores.reduce((sum, s) => sum + s.bestPractices, 0) / RUNS,
      };

      // Assert against thresholds
      expect(meanScores.performance).toBeGreaterThanOrEqual(0.85);
      expect(meanScores.accessibility).toBeGreaterThanOrEqual(0.95);
      expect(meanScores.seo).toBeGreaterThanOrEqual(0.95);
      expect(meanScores.bestPractices).toBeGreaterThanOrEqual(0.90);

      console.log(`\nMean scores for ${page.name}:`, meanScores);
    });
  }
});
```

### 8.2 Statistical Validation Workflow

**Before refactoring:**
```bash
# Run benchmarks to establish baseline
node tests/baseline/statistical-validation.js benchmark

# This creates tests/baseline/benchmark-results.json with:
# - Mean build times
# - Standard deviation
# - 95% confidence intervals
```

**After each phase:**
```bash
# Run benchmarks again
node tests/baseline/statistical-validation.js benchmark
mv tests/baseline/benchmark-results.json tests/baseline/benchmark-results-current.json

# Compare to baseline
node tests/baseline/statistical-validation.js compare \
  tests/baseline/benchmark-results.json \
  tests/baseline/benchmark-results-current.json

# Check output for "SIGNIFICANTLY FASTER" or "SIGNIFICANTLY SLOWER"
```

**Acceptance criteria:**
- Performance improvements must be statistically significant (95% confidence)
- No statistically significant performance regressions allowed
- If "NO SIGNIFICANT DIFFERENCE", that's acceptable (no harm done)

---

## 9. CI/CD Integration

### 9.1 Continuous Integration Strategy

**Refactoring branches must pass all tests before merge.**

#### 9.1.1 GitHub Actions Workflow (Detailed)

**File: .github/workflows/refactoring-comprehensive-tests.yml**
```yaml
name: Refactoring - Comprehensive Tests

on:
  push:
    branches:
      - 'refactor/**'
  pull_request:
    branches:
      - master
      - 'refactor/**'

jobs:
  baseline-comparison:
    name: Compare to Baseline
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Need full history for baseline

      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.4.4'
          bundler-cache: true

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: |
          bundle install
          npm install

      - name: Restore baseline
        uses: actions/cache@v3
        with:
          path: tests/baseline/
          key: baseline-${{ hashFiles('tests/baseline/metrics-*.json') }}
          restore-keys: baseline-

      - name: Run statistical benchmarks
        run: |
          node tests/baseline/statistical-validation.js benchmark
          mv tests/baseline/benchmark-results.json tests/baseline/benchmark-results-current.json

      - name: Compare to baseline
        id: comparison
        run: |
          if [ -f tests/baseline/benchmark-results-baseline.json ]; then
            node tests/baseline/statistical-validation.js compare \
              tests/baseline/benchmark-results-baseline.json \
              tests/baseline/benchmark-results-current.json > comparison-output.txt

            cat comparison-output.txt

            # Check for regressions
            if grep -q "SIGNIFICANTLY SLOWER" comparison-output.txt; then
              echo "❌ Performance regression detected!"
              exit 1
            fi
          else
            echo "No baseline found, skipping comparison"
          fi

      - name: Upload comparison results
        uses: actions/upload-artifact@v3
        with:
          name: benchmark-comparison
          path: |
            comparison-output.txt
            tests/baseline/benchmark-results-current.json

  build-tests:
    name: Build Tests
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.4.4'
          bundler-cache: true

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: |
          bundle install
          npm install

      - name: Build site (clean)
        run: |
          rm -rf _site .jekyll-cache
          time bundle exec jekyll build --profile

      - name: Check CSS output
        run: |
          ls -lh _site/assets/css/main.css
          du -sh _site/assets/css/main.css

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: built-site
          path: _site/

  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: build-tests

    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Run Jest tests
        run: npm run test:unit -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  visual-regression:
    name: Visual Regression Tests
    runs-on: ubuntu-latest
    needs: build-tests

    steps:
      - uses: actions/checkout@v3

      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.4.4'
          bundler-cache: true

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: |
          bundle install
          npm install
          npx playwright install --with-deps chromium

      - name: Restore visual baseline
        uses: actions/cache@v3
        with:
          path: tests/visual/baseline/
          key: visual-baseline-${{ hashFiles('tests/visual/baseline/**') }}
          restore-keys: visual-baseline-

      - name: Run visual regression tests
        run: npm run test:visual

      - name: Upload visual diffs
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: visual-diffs
          path: tests/visual/diffs/

      - name: Comment on PR with visual results
        if: failure() && github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const diffs = fs.readdirSync('tests/visual/diffs/');

            const comment = `## ❌ Visual Regression Detected

            ${diffs.length} visual difference(s) found:

            ${diffs.map(f => `- ${f}`).join('\n')}

            Check the artifacts for diff images.
            `;

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: build-tests
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]

    steps:
      - uses: actions/checkout@v3

      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.4.4'
          bundler-cache: true

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: |
          bundle install
          npm install
          npx playwright install --with-deps ${{ matrix.browser }}

      - name: Run E2E tests
        run: npx playwright test tests/e2e --project=${{ matrix.browser }}

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-results-${{ matrix.browser }}
          path: test-results/

  performance-tests:
    name: Performance Tests
    runs-on: ubuntu-latest
    needs: build-tests

    steps:
      - uses: actions/checkout@v3

      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.4.4'
          bundler-cache: true

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: |
          bundle install
          npm install
          npx playwright install --with-deps chromium

      - name: Run Lighthouse tests (3 runs per page)
        run: npm run test:performance

      - name: Check performance thresholds
        run: |
          # Extract Lighthouse scores
          # Check against thresholds
          # Fail if below thresholds

      - name: Upload Lighthouse reports
        uses: actions/upload-artifact@v3
        with:
          name: lighthouse-reports
          path: tests/performance/results/

  smoke-tests:
    name: Smoke Tests
    runs-on: ubuntu-latest
    needs: build-tests

    steps:
      - uses: actions/checkout@v3

      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.4.4'
          bundler-cache: true

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: |
          bundle install
          npm install
          npx playwright install --with-deps chromium

      - name: Run smoke tests
        run: npm run test:smoke

      - name: Upload smoke test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: smoke-test-results
          path: test-results/

  all-tests-passed:
    name: All Tests Passed
    runs-on: ubuntu-latest
    needs:
      - baseline-comparison
      - build-tests
      - unit-tests
      - visual-regression
      - e2e-tests
      - performance-tests
      - smoke-tests

    steps:
      - name: All tests passed
        run: echo "✅ All refactoring tests passed!"

      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '## ✅ All Refactoring Tests Passed!\n\nThis PR is ready for review.'
            });
```

### 9.2 Pre-commit Hooks

**File: .git/hooks/pre-commit** (or use husky)
```bash
#!/bin/bash

echo "Running pre-commit checks..."

# Run smoke tests
echo "Running smoke tests..."
npm run test:smoke

if [ $? -ne 0 ]; then
  echo "❌ Smoke tests failed. Commit aborted."
  exit 1
fi

# Run SCSS linting
echo "Running SCSS lint..."
npm run lint:scss

if [ $? -ne 0 ]; then
  echo "❌ SCSS linting failed. Commit aborted."
  echo "Run 'npm run lint:scss:fix' to auto-fix issues."
  exit 1
fi

echo "✅ Pre-commit checks passed!"
exit 0
```

---

## 10. Summary and Quick Reference

### 10.1 Testing Strategy Summary

| Phase | Primary Risk | Key Tests | Pass Criteria |
|-------|-------------|-----------|---------------|
| Phase 1 | Dependency removal breaks build | Build, Smoke, Unit | 100% pass, same performance |
| Phase 2 | SCSS changes break visual appearance | Visual Regression, CSS Comparison | 0 visual differences |
| Phase 3 | Deployment configuration breaks site | Deployment, E2E | Both deployments work |
| Phase 4 | Test consolidation loses coverage | All test types | Same or better coverage |

### 10.2 Quick Command Reference

```bash
# Baseline capture
npm run test:capture-baseline

# Run all tests
npm run test:all

# Run critical tests only
npm run test:critical

# Run smoke tests (fast)
npm run test:smoke

# Run visual regression
npm run test:visual

# Update visual baseline (after intentional changes)
npm run test:visual:update-baseline

# Run statistical benchmarks
node tests/baseline/statistical-validation.js benchmark

# Compare to baseline
npm run test:compare-baseline

# Emergency rollback
bash emergency-rollback.sh
```

### 10.3 Success Checklist

**Before starting any phase:**
- [ ] Capture baseline metrics
- [ ] Capture visual baseline
- [ ] All tests passing
- [ ] Create feature branch
- [ ] Document current state

**After each commit:**
- [ ] Build succeeds
- [ ] Smoke tests pass
- [ ] Visual regression: 0 differences
- [ ] Performance: No significant regression

**Before merging phase:**
- [ ] All tests pass (100%)
- [ ] Visual regression: 0 differences
- [ ] Performance: Same or better
- [ ] Documentation updated
- [ ] Rollback procedure tested
- [ ] Peer review complete

**After merge:**
- [ ] Monitor production
- [ ] Check analytics
- [ ] Verify no errors
- [ ] Update baseline for next phase

---

## Conclusion

This testing strategy provides comprehensive coverage with scientific rigor. The approach ensures zero regressions through:

1. **Baseline establishment** - Measurable starting point
2. **Visual regression testing** - Pixel-perfect comparison
3. **Statistical validation** - Confidence in performance changes
4. **Phase-by-phase testing** - Isolated verification
5. **Smoke tests** - Fast feedback on critical functionality
6. **Rollback procedures** - Quick recovery from issues
7. **CI/CD integration** - Automated validation

**Expected Time Investment:**
- Setup: 4-6 hours (one-time)
- Per commit testing: 5-10 minutes
- Per phase validation: 30-60 minutes
- Total for all phases: 15-20 hours

**Risk Level:** LOW (with this testing strategy in place)

The strategy prioritizes reproducibility and control groups, allowing for confident refactoring with the ability to quickly identify and fix any issues.

---

**Document Version:** 1.0
**Last Updated:** 2025-11-11
**Related Documents:**
- architecture-simplification-plan-2025-11-11.md
- CLAUDE.md

**Next Steps:**
1. Review and approve this testing strategy
2. Set up test infrastructure (install dependencies, create scripts)
3. Capture baseline metrics
4. Begin Phase 1 refactoring with confidence
