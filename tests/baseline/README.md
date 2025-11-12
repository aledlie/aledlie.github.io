# Baseline Testing

This directory contains scripts and data for establishing and comparing performance baselines during the refactoring process.

## Purpose

Baseline testing ensures that refactoring changes don't introduce performance regressions. We measure:
- Build times (clean and incremental)
- Bundle sizes (npm and Ruby)
- CSS output size
- Lighthouse performance scores

## Files

- `measure-build-performance.sh` - Measures build times and file sizes
- `measure-performance.sh` - Runs Lighthouse audits on key pages
- `capture-visual-baseline.sh` - Captures reference screenshots
- `compare-to-baseline.sh` - Compares current metrics to baseline
- `statistical-validation.js` - Statistical analysis of performance data
- `metrics-YYYY-MM-DD.json` - Snapshot of metrics on a specific date
- `benchmark-results.json` - Statistical benchmark results

## Usage

### First Time Setup (Before Refactoring)

```bash
# Capture baseline metrics
npm run test:capture-baseline

# This creates:
# - metrics-YYYY-MM-DD.json (current metrics)
# - benchmark-results.json (statistical benchmarks)
# - Visual baseline screenshots in tests/visual/baseline/
```

### After Changes

```bash
# Compare to baseline
npm run test:compare-baseline

# Check output for:
# ✅ Improvements (faster, smaller)
# ⚠️  No significant change
# ❌ Regressions (slower, larger)
```

### Updating Baseline (After Successful Refactoring)

```bash
# After Phase N is complete and validated:
cp tests/baseline/metrics-YYYY-MM-DD.json tests/baseline/metrics-baseline.json
cp tests/baseline/benchmark-results.json tests/baseline/benchmark-results-baseline.json

# Update visual baseline:
npm run test:visual:update-baseline
```

## Metrics Tracked

### Build Performance
- Clean build time
- Incremental build time
- Bundle install time
- npm install time

### File Sizes
- Total site size
- CSS file size
- SCSS line count
- node_modules size
- Ruby bundle size

### Lighthouse Scores
- Performance score
- Accessibility score
- Best Practices score
- SEO score
- Core Web Vitals (FCP, LCP, TBT, CLS)

## Acceptance Criteria

**For build times:**
- No statistically significant regressions (p < 0.05)
- Improvements are welcome

**For file sizes:**
- CSS size: Same or smaller
- Total site size: Same or 5% increase max

**For Lighthouse scores:**
- Performance: ≥85%
- Accessibility: ≥95%
- SEO: ≥95%
- Best Practices: ≥90%

## Statistical Validation

Build time tests run multiple times (5-10) to account for system variability. We calculate:
- Mean
- Standard deviation
- 95% confidence intervals

Changes are only considered significant if confidence intervals don't overlap.

See `statistical-validation.js` for implementation.
