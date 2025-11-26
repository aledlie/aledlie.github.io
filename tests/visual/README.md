# Visual Regression Testing

This directory contains visual regression tests that ensure SCSS changes don't break the site's appearance.

## Purpose

During refactoring, especially SCSS consolidation, we need to verify that changes don't alter the visual appearance. This is done through pixel-perfect screenshot comparison.

## Directory Structure

```
visual/
├── baseline/           # Reference screenshots (golden images)
├── current/            # Current test screenshots
├── diffs/              # Visual difference images (only when differences detected)
├── visual-regression.spec.js      # Main test file
├── capture-baseline.spec.js       # Script to capture baselines
└── visual-comparison-helper.js    # Comparison utility
```

## Usage

### First Time Setup (Before Refactoring)

```bash
# Capture baseline screenshots
npm run test:visual:capture-baseline

# This creates screenshots in baseline/ for:
# - Homepage (desktop, tablet, mobile)
# - About page (desktop, tablet, mobile)
# - Posts listing (desktop, tablet, mobile)
# - Individual post (desktop, tablet, mobile)
# - Projects page (desktop, tablet, mobile)
```

### Running Visual Regression Tests

```bash
# After making SCSS changes:
npm run test:visual

# This will:
# 1. Build the site
# 2. Take screenshots of all pages
# 3. Compare to baseline
# 4. Generate diff images if differences found
# 5. Pass or fail based on threshold (0.1% difference allowed)
```

### Interpreting Results

**✅ All tests pass:**
No visual changes detected. Safe to proceed.

**❌ Tests fail:**
Visual differences detected. Check `diffs/` directory for comparison images.

**What to do when tests fail:**

1. **Review the diff images:**
   ```bash
   open tests/visual/diffs/
   ```

2. **Determine if changes are intentional or bugs:**
   - Red pixels = differences
   - Review each diff image carefully

3. **If it's a bug:**
   ```bash
   # Revert your changes and fix
   git checkout -- _sass/your-file.scss
   npm run test:visual  # Should pass now
   ```

4. **If changes are intentional (NOT during refactoring!):**
   ```bash
   # Update baseline ONLY if you meant to change the design
   npm run test:visual:update-baseline
   npm run test:visual  # Should pass now
   ```

   **⚠️ WARNING:** During refactoring, visual changes are NOT expected.
   If you see differences, investigate why.

## How It Works

1. **Screenshot Capture:**
   - Playwright navigates to each page
   - Waits for page to fully load (networkidle + fonts)
   - Removes dynamic content (timestamps)
   - Disables animations
   - Takes full-page screenshot

2. **Comparison:**
   - Uses `pixelmatch` library for pixel-by-pixel comparison
   - Allows 0.1% tolerance (for minor rendering differences)
   - Generates red-highlighted diff image

3. **Pass/Fail:**
   - Pass: <0.1% pixels different
   - Fail: ≥0.1% pixels different

## Configuration

**Tolerance levels:**
Edit `visual-regression.spec.js`:
```javascript
threshold: 0.1,  // 0.1% difference allowed (very strict)
includeAA: false // Ignore anti-aliasing differences
```

**Pages tested:**
Edit `PAGES_TO_TEST` in `visual-regression.spec.js`:
```javascript
const PAGES_TO_TEST = [
  { path: '/', name: 'homepage' },
  { path: '/about/', name: 'about' },
  // Add more pages here
];
```

**Viewports:**
Edit `VIEWPORTS` in `visual-regression.spec.js`:
```javascript
const VIEWPORTS = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'tablet', width: 1024, height: 768 },
  { name: 'mobile', width: 375, height: 667 },
];
```

## CI Integration

Visual regression tests run automatically in CI:
- On every push to `refactor/**` branches
- On pull requests to master
- Must pass before merge

If tests fail in CI:
- Check "Artifacts" for diff images
- Download and review
- Fix locally and push

## Troubleshooting

**Problem:** Tests fail with "Image dimensions mismatch"
**Solution:** Baseline was captured at different viewport size. Recapture baseline.

**Problem:** Tests always fail with small differences
**Solution:** Increase tolerance threshold slightly (but be careful!)

**Problem:** Can't see the diff images
**Solution:** They're only generated when differences are found. Check tests/visual/diffs/

**Problem:** Fonts look different
**Solution:** Ensure system fonts are loaded. Test uses 'Georgia' and 'PT Sans Narrow' - check they're available.

**Problem:** Tests fail in CI but pass locally
**Solution:** Font rendering differs between systems. Consider using web fonts instead of system fonts.

## Best Practices

1. **Always capture baseline before refactoring**
2. **Run visual tests after every SCSS change**
3. **Never update baseline during refactoring** (unless you found a bug in the baseline)
4. **Review every diff image carefully**
5. **Use version control for baseline images** (commit to git)
6. **Document any intentional visual changes**

## Performance

Visual regression tests are relatively slow (2-3 minutes for 15 screenshots).

To speed up during development:
- Test only the pages you're changing
- Use only desktop viewport
- Comment out other tests temporarily

## Related Documentation

- Main testing strategy: `/documentation/refactoring/testing-strategy-2025-11-11.md`
- Refactoring plan: `/documentation/refactoring/architecture-simplification-plan-2025-11-11.md`
