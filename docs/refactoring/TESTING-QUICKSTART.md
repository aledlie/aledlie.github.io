# Testing Quick Start Guide

This guide helps you get started with the comprehensive testing strategy for the architecture refactoring.

## Prerequisites

- Ruby 3.4.4 installed
- Node.js 18+ installed
- All dependencies installed (`bundle install && npm install`)
- Site builds successfully (`bundle exec jekyll build`)

## Step 1: Install Testing Dependencies

```bash
# Install additional testing dependencies
npm install --save-dev pixelmatch pngjs css

# Verify Playwright browsers are installed
npx playwright install
```

## Step 2: Capture Baseline (BEFORE ANY CHANGES)

This is crucial! Run this before you start refactoring.

```bash
# Create baseline directories
mkdir -p tests/baseline tests/visual/baseline tests/visual/current tests/visual/diffs

# Build the site
bundle exec jekyll build

# Capture baseline metrics
bash tests/baseline/measure-build-performance.sh > tests/baseline/baseline-build.log 2>&1
bash tests/baseline/measure-performance.sh > tests/baseline/baseline-performance.log 2>&1

# Capture baseline screenshots
npm run test:visual:capture-baseline

# Run statistical benchmarks
node tests/baseline/statistical-validation.js benchmark
mv tests/baseline/benchmark-results.json tests/baseline/benchmark-results-baseline.json

# Save CSS baseline
cp _site/assets/css/main.css tests/baseline/main-baseline.css

# Commit baselines
git add tests/baseline/ tests/visual/baseline/
git commit -m "Add testing baselines before refactoring"
```

**Expected files created:**
- `tests/baseline/baseline-build.log`
- `tests/baseline/baseline-performance.log`
- `tests/baseline/benchmark-results-baseline.json`
- `tests/baseline/main-baseline.css`
- `tests/visual/baseline/*.png` (15+ screenshot files)

## Step 3: Verify Baseline Capture

```bash
# Check that baseline files exist
ls -lh tests/baseline/
ls -lh tests/visual/baseline/

# Run tests to verify they pass with current baseline
npm run test:visual

# Should output:
# ✓ All visual regression tests passed
```

## Step 4: Daily Refactoring Workflow

### Before Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b refactor/phase-N-description
   ```

2. Verify everything works:
   ```bash
   npm run test:smoke
   ```

### After Making Changes

Run this after every significant change (e.g., after consolidating one SCSS file):

```bash
# Quick validation (2-3 minutes)
npm run test:critical

# This runs:
# - Build test
# - Smoke tests
# - Visual regression tests
```

**If tests pass:** ✅ Commit and continue
```bash
git add .
git commit -m "Consolidate typography.scss"
```

**If tests fail:** ❌ Investigate and fix
```bash
# Check what failed
# Review diff images in tests/visual/diffs/

# Either fix the issue or revert
git checkout -- _sass/problematic-file.scss

# Re-test
npm run test:critical
```

### Before Committing

```bash
# Run full test suite (5-10 minutes)
npm run test:all

# This runs:
# - Unit tests
# - SCSS tests
# - E2E tests
# - Visual regression tests
# - Performance tests
```

**Only commit if all tests pass!**

### End of Day

```bash
# Compare to baseline
bash tests/baseline/compare-to-baseline.sh

# Review summary:
# - Build time changes
# - File size changes
# - Any regressions detected
```

## Step 5: Phase Completion Checklist

Before merging a phase (e.g., Phase 2: SCSS Consolidation):

- [ ] All tests pass (`npm run test:all`)
- [ ] Visual regression: 0 differences
- [ ] Build time: Same or faster
- [ ] CSS size: Same or smaller
- [ ] No console errors
- [ ] Documentation updated
- [ ] Changes committed with clear messages
- [ ] Peer review completed

Run the completion validation:
```bash
# Full validation
npm run test:all

# Statistical comparison
node tests/baseline/statistical-validation.js compare \
  tests/baseline/benchmark-results-baseline.json \
  tests/baseline/benchmark-results.json

# Check for regressions
# Should show "NO SIGNIFICANT DIFFERENCE" or "SIGNIFICANTLY FASTER"
# If "SIGNIFICANTLY SLOWER" - investigate!
```

If everything passes:
```bash
# Merge to master
git checkout master
git merge refactor/phase-N-description
git push origin master

# Update baseline for next phase
cp tests/baseline/benchmark-results.json tests/baseline/benchmark-results-baseline.json
npm run test:visual:update-baseline
git add tests/baseline/ tests/visual/baseline/
git commit -m "Update baselines after Phase N completion"
```

## Step 6: Emergency Rollback

If something goes wrong:

```bash
# Quick rollback
bash emergency-rollback.sh

# Or manual rollback
git checkout master
git reset --hard origin/master
bundle install
npm install
bundle exec jekyll build
npm run test:smoke
```

## Common Commands Reference

```bash
# Fast tests (1-2 minutes)
npm run test:smoke              # Critical functionality only

# Medium tests (2-5 minutes)
npm run test:critical           # Smoke + Visual regression
npm run test:visual             # Visual regression only

# Full tests (5-10 minutes)
npm run test:all                # Everything

# Specific test types
npm run test:unit               # Jest unit tests
npm run test:e2e                # Playwright E2E tests
npm run test:scss               # SCSS/CSS tests
npm run test:performance        # Lighthouse tests

# Baseline operations
npm run test:capture-baseline   # Capture new baseline
npm run test:compare-baseline   # Compare to baseline
npm run test:visual:update-baseline  # Update visual baseline

# Development
npm run build                   # Build site
npm run serve                   # Serve locally
npm run lint:scss               # Lint SCSS
npm run lint:scss:fix           # Auto-fix SCSS issues
```

## Troubleshooting

### Problem: "Baseline not found"

**Solution:**
```bash
# You haven't captured baseline yet
npm run test:capture-baseline
```

### Problem: Visual tests always fail

**Solution:**
```bash
# Check if you captured baseline
ls tests/visual/baseline/

# If empty, capture baseline
npm run test:visual:capture-baseline

# If baseline exists, review diffs
open tests/visual/diffs/
```

### Problem: Tests fail in CI but pass locally

**Solution:**
```bash
# CI might have different fonts or rendering
# Check CI artifacts for diff images
# May need to adjust tolerance or use web fonts
```

### Problem: Tests are too slow

**Solution:**
```bash
# Use smoke tests during development
npm run test:smoke

# Use critical tests for quick validation
npm run test:critical

# Only run full suite before committing
```

### Problem: "SIGNIFICANTLY SLOWER" in benchmark comparison

**Solution:**
```bash
# This means your changes made the build slower
# Investigate what changed:
git diff HEAD~1

# Common causes:
# - Added imports that slow down SCSS compilation
# - Introduced complex selectors
# - Added large dependencies

# Fix and re-test
```

## Testing Philosophy

**During refactoring:**
- Run tests frequently (after every change)
- Trust the tests - if they fail, investigate
- Never skip visual regression tests
- Never update baseline during refactoring (only after)
- If in doubt, run the full suite

**Red flags:**
- ❌ Any visual differences detected
- ❌ Build time significantly slower
- ❌ CSS file size increased
- ❌ Tests that were passing now fail
- ❌ Console errors

**Green flags:**
- ✅ All tests pass
- ✅ Build time same or faster
- ✅ CSS size same or smaller
- ✅ No visual differences
- ✅ No console errors

## Test Coverage Summary

| Test Type | What It Checks | When to Run | Time |
|-----------|----------------|-------------|------|
| Smoke | Site loads, critical elements present | After every change | 1-2 min |
| Visual Regression | Pixel-perfect appearance | After SCSS changes | 2-3 min |
| Unit | JavaScript functionality | Before commit | 30 sec |
| E2E | Navigation, interactions | Before commit | 2-3 min |
| Performance | Lighthouse scores | Before commit | 3-4 min |
| Statistical | Build time analysis | End of phase | 5-10 min |

## Next Steps

1. ✅ Capture baseline (Step 2)
2. ✅ Verify baseline (Step 3)
3. ✅ Start refactoring with confidence
4. ✅ Follow daily workflow (Step 4)
5. ✅ Validate phase completion (Step 5)

## Questions?

- Review the full testing strategy: `testing-strategy-2025-11-11.md`
- Review the refactoring plan: `architecture-simplification-plan-2025-11-11.md`
- Check test-specific READMEs: `tests/baseline/README.md`, `tests/visual/README.md`

---

**Remember:** Tests are your safety net. Use them!
