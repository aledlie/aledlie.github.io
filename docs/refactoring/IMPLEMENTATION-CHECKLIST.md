# Testing Strategy Implementation Checklist

Use this checklist to implement the comprehensive testing strategy before starting the refactoring.

---

## Phase 0: Testing Infrastructure Setup

### ✅ Documentation (COMPLETE)
- [x] Main testing strategy document created
- [x] Quick start guide created
- [x] Testing summary created
- [x] Baseline testing README created
- [x] Visual regression README created

### 📦 Dependencies Installation

**Install testing dependencies:**
```bash
npm install --save-dev pixelmatch pngjs css
```

- [ ] pixelmatch installed (pixel comparison)
- [ ] pngjs installed (PNG manipulation)
- [ ] css installed (CSS parsing)

**Verify Playwright installation:**
```bash
npx playwright install
```

- [ ] Playwright browsers installed (chromium, firefox, webkit)

### 📁 Directory Structure

**Create test directories:**
```bash
mkdir -p tests/baseline
mkdir -p tests/visual/baseline
mkdir -p tests/visual/current
mkdir -p tests/visual/diffs
mkdir -p tests/smoke
mkdir -p tests/scss
mkdir -p tests/deployment
```

- [ ] `tests/baseline/` created
- [ ] `tests/visual/baseline/` created
- [ ] `tests/visual/current/` created
- [ ] `tests/visual/diffs/` created
- [ ] `tests/smoke/` created
- [ ] `tests/scss/` created
- [ ] `tests/deployment/` created

### 📝 Scripts Implementation

**To Create:**

#### 1. Statistical Validation Script
**File:** `tests/baseline/statistical-validation.js`
- [ ] Copy implementation from testing-strategy-2025-11-11.md
- [ ] Section: "8.1.1 Build Time Validation"
- [ ] Test: `node tests/baseline/statistical-validation.js benchmark`

#### 2. Visual Regression Test
**File:** `tests/visual/visual-regression.spec.js`
- [ ] Copy implementation from testing-strategy-2025-11-11.md
- [ ] Section: "2.2 Visual Test Implementation"
- [ ] Update `PAGES_TO_TEST` with actual post URL
- [ ] Test: `npm run test:visual`

#### 3. Visual Comparison Helper
**File:** `tests/visual/visual-comparison-helper.js`
- [ ] Copy implementation from testing-strategy-2025-11-11.md
- [ ] Section: "2.2 Visual Test Implementation"
- [ ] Requires: pixelmatch, pngjs

#### 4. Capture Baseline Spec
**File:** `tests/visual/capture-baseline.spec.js`
- [ ] Create Playwright test to capture baselines
- [ ] Should capture all pages at all viewports
- [ ] Save to `tests/visual/baseline/`

**Example:**
```javascript
const { test } = require('@playwright/test');
const fs = require('fs').promises;

const PAGES_TO_TEST = [
  { path: '/', name: 'homepage' },
  { path: '/about/', name: 'about' },
  { path: '/posts/', name: 'posts' },
  { path: '/projects/', name: 'projects' },
];

const VIEWPORTS = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'tablet', width: 1024, height: 768 },
  { name: 'mobile', width: 375, height: 667 },
];

test.describe('Capture Visual Baseline', () => {
  for (const page of PAGES_TO_TEST) {
    for (const viewport of VIEWPORTS) {
      test(`${page.name} - ${viewport.name}`, async ({ page: browserPage }) => {
        await browserPage.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });

        await browserPage.goto(page.path);
        await browserPage.waitForLoadState('networkidle');
        await browserPage.waitForFunction(() => document.fonts.ready);

        const screenshot = await browserPage.screenshot({
          fullPage: true,
          animations: 'disabled',
        });

        const filename = `tests/visual/baseline/${page.name}-${viewport.name}-chromium.png`;
        await fs.writeFile(filename, screenshot);

        console.log(`Saved: ${filename}`);
      });
    }
  }
});
```

#### 5. Smoke Test Suite
**File:** `tests/smoke/smoke-suite.spec.js`
- [ ] Copy implementation from testing-strategy-2025-11-11.md
- [ ] Section: "6.2 Smoke Test Implementation"
- [ ] Test: `npm run test:smoke`

#### 6. CSS Comparison Test
**File:** `tests/scss/css-comparison.test.js`
- [ ] Copy implementation from testing-strategy-2025-11-11.md
- [ ] Section: "3.2.4 CSS Comparison Testing"
- [ ] Test: `npm run test:scss`

#### 7. Measure Performance Script
**File:** `tests/baseline/measure-performance.sh`
- [ ] Create script to run Lighthouse on key pages
- [ ] Save results to JSON
- [ ] Extract key metrics

**Example:**
```bash
#!/bin/bash
set -e

echo "=== Performance Baseline Measurement ==="

# Start Jekyll server in background
bundle exec jekyll serve --detach
sleep 10

# Run Lighthouse
echo "Running Lighthouse audits..."
npm run test:performance

# Kill server
pkill -f jekyll

echo "Performance baseline captured"
```

#### 8. Capture Visual Baseline Script
**File:** `tests/baseline/capture-visual-baseline.sh`
- [ ] Start Jekyll server
- [ ] Run capture-baseline.spec.js
- [ ] Stop server

**Example:**
```bash
#!/bin/bash
set -e

echo "=== Capturing Visual Baseline ==="

bundle exec jekyll serve --detach
sleep 10

npx playwright test tests/visual/capture-baseline.spec.js

pkill -f jekyll

echo "Visual baseline captured in tests/visual/baseline/"
```

#### 9. Rollback Scripts
- [ ] `rollback-phase-1.sh` (from testing-strategy Section 7.2)
- [ ] `rollback-phase-2.sh` (from testing-strategy Section 7.2)
- [ ] `rollback-phase-3.sh` (from testing-strategy Section 7.2)
- [ ] `rollback-phase-4.sh` (from testing-strategy Section 7.2)
- [ ] `emergency-rollback.sh` (from testing-strategy Section 7.3)

### 📦 package.json Updates

**Add these scripts to package.json:**

```json
{
  "scripts": {
    "test:visual": "playwright test tests/visual/visual-regression.spec.js",
    "test:visual:capture-baseline": "playwright test tests/visual/capture-baseline.spec.js",
    "test:visual:update-baseline": "cp -r tests/visual/current/* tests/visual/baseline/",

    "test:smoke": "playwright test tests/smoke/smoke-suite.spec.js",
    "test:critical": "npm run build && npm run test:smoke && npm run test:visual",
    "test:scss": "jest tests/scss",

    "test:capture-baseline": "bash tests/baseline/measure-build-performance.sh && bash tests/baseline/measure-performance.sh && bash tests/baseline/capture-visual-baseline.sh",
    "test:compare-baseline": "bash tests/baseline/compare-to-baseline.sh"
  }
}
```

- [ ] Scripts added to package.json
- [ ] Test each script individually
- [ ] Verify they work

### 🔧 Git Configuration

**Pre-commit hook (optional but recommended):**
```bash
# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Running pre-commit checks..."
npm run test:smoke
if [ $? -ne 0 ]; then
  echo "❌ Smoke tests failed. Commit aborted."
  exit 1
fi
npm run lint:scss
if [ $? -ne 0 ]; then
  echo "❌ SCSS linting failed. Run 'npm run lint:scss:fix'"
  exit 1
fi
echo "✅ Pre-commit checks passed!"
exit 0
EOF

chmod +x .git/hooks/pre-commit
```

- [ ] Pre-commit hook created
- [ ] Hook is executable
- [ ] Test with dummy commit

### 📊 Baseline Capture

**This is THE MOST IMPORTANT step. Do NOT skip!**

```bash
# 1. Ensure site builds
bundle exec jekyll build

# 2. Capture all baselines
npm run test:capture-baseline

# 3. Verify baseline files exist
ls -lh tests/baseline/
ls -lh tests/visual/baseline/

# 4. Run visual tests to verify
npm run test:visual

# 5. Commit baselines
git add tests/baseline/ tests/visual/baseline/
git commit -m "Add testing baselines before refactoring"
```

- [ ] Site builds successfully
- [ ] Baseline metrics captured
- [ ] Baseline screenshots captured (15+ files)
- [ ] Visual regression tests pass
- [ ] Baselines committed to git

**Expected baseline files:**
- `tests/baseline/metrics-YYYY-MM-DD.json`
- `tests/baseline/benchmark-results-baseline.json`
- `tests/baseline/main-baseline.css`
- `tests/visual/baseline/homepage-desktop-chromium.png`
- `tests/visual/baseline/homepage-tablet-chromium.png`
- `tests/visual/baseline/homepage-mobile-chromium.png`
- (12 more screenshot files...)

### ✅ Verification

**Test the testing infrastructure:**

```bash
# 1. Smoke tests should pass
npm run test:smoke
# Expected: ✅ All tests pass

# 2. Visual tests should pass
npm run test:visual
# Expected: ✅ All tests pass (0 differences)

# 3. Critical tests should pass
npm run test:critical
# Expected: ✅ All tests pass

# 4. Full suite should pass
npm run test:all
# Expected: ✅ All tests pass

# 5. Baseline comparison should work
npm run test:compare-baseline
# Expected: ✅ No significant differences
```

- [ ] Smoke tests pass
- [ ] Visual tests pass (0 differences)
- [ ] Critical tests pass
- [ ] Full test suite passes
- [ ] Baseline comparison works

---

## Implementation Status

**Overall Progress:**
- [ ] Phase 0 setup complete
- [ ] Baselines captured
- [ ] All tests passing
- [ ] Ready to start Phase 1

**Completion Checklist:**
- [ ] All dependencies installed
- [ ] All directories created
- [ ] All scripts implemented
- [ ] All scripts tested
- [ ] All baselines captured
- [ ] All baseline tests pass
- [ ] Documentation read and understood
- [ ] Team trained (if applicable)

---

## Estimated Time

- **Setup:** 2-3 hours
- **Script implementation:** 2-3 hours
- **Baseline capture:** 30 minutes
- **Verification:** 30 minutes
- **Total:** 5-7 hours

**Breakdown:**
1. Dependencies & directories: 30 min
2. Copy/implement scripts: 3 hours
3. Update package.json: 15 min
4. Create rollback scripts: 1 hour
5. Capture baselines: 30 min
6. Test & verify: 1 hour

---

## Troubleshooting

### Issue: Playwright browsers not installing
**Solution:**
```bash
npx playwright install --with-deps
```

### Issue: Scripts not executable
**Solution:**
```bash
chmod +x tests/baseline/*.sh
chmod +x *.sh
```

### Issue: Baseline capture fails
**Solution:**
```bash
# Check if Jekyll builds
bundle exec jekyll build

# Check if Playwright works
npx playwright test tests/e2e/site-navigation.spec.js
```

### Issue: Visual tests always fail
**Solution:**
```bash
# Ensure baseline was captured first
ls tests/visual/baseline/

# If empty, capture baseline
npm run test:visual:capture-baseline
```

---

## Next Steps After Setup

1. ✅ Verify all tests pass
2. ✅ Read refactoring plan
3. ✅ Create Phase 1 branch
4. ✅ Start refactoring with confidence!

---

**Once this checklist is complete, you're ready to start refactoring with comprehensive test coverage and zero-regression confidence! 🚀**
