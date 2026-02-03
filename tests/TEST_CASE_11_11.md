---
layout: single
title: "Test Suite"
excerpt: "Comprehensive testing infrastructure for zero-regression refactoring and continuous quality assurance"
modified: 2025-11-11
toc: true
toc_sticky: true
---

## Testing Infrastructure Overview

This site maintains a comprehensive test suite ensuring zero regressions during refactoring and ongoing quality assurance. The testing infrastructure includes unit tests, end-to-end tests, performance monitoring, visual regression testing, and accessibility audits.

---

## Choose Your Path

**Different users have different needs. Pick the path that matches your goal:**

### 🚀 Quick Start (Developers Running Tests)
**Goal**: Run tests right now
**Time**: 2 minutes
Jump to: [Quick Start Commands](#quick-start-commands) → [Status Dashboard](#test-status-dashboard)

### 📚 Onboarding (New Contributors)
**Goal**: Understand how testing works
**Time**: 15 minutes
Jump to: [Testing Philosophy](#testing-philosophy) → [Test Categories](#test-categories) → [Infrastructure](#test-infrastructure-files)

### 📊 Monitoring (Managers/Reviewers)
**Goal**: Check current status and metrics
**Time**: 5 minutes
Jump to: [Status Dashboard](#test-status-dashboard) → [Success Metrics](#success-metrics)

---

## Quick Start Commands

**To run all tests (5-10 minutes):**
```bash
npm run test:all
```

**To run individual test suites:**
```bash
npm run test                  # Unit tests (~30s)
npm run test:e2e             # E2E tests (2-3 min)
npm run test:performance     # Lighthouse (3-5 min)
npm run test:visual          # Visual regression (2-3 min)
```

**For development workflow:**
```bash
npm run test:smoke           # Quick smoke tests (1-2 min)
npm run test:critical        # Critical tests only (2-3 min)
```

**For baseline comparison:**
```bash
npm run test:capture-baseline  # Capture new baseline
npm run test:compare-baseline  # Compare to baseline
```

---

## Test Status Dashboard

**Current Status - All Systems Operational ✅**

| Test Type | Status | Score/Tests | Time | Action Required |
|-----------|--------|-------------|------|-----------------|
| **Unit Tests** | ✅ Pass | 12/12 (100%) | ~30s | None |
| **E2E Tests** | ✅ Pass | 8/8 (100%) | ~2-3min | None |
| **Analytics** | ✅ Pass | 6/6 (100%) | ~1min | None |
| **Performance** | ✅ Pass | 95/100 avg | ~3-5min | None |
| **Visual Regression** | ✅ Pass | 15/15 (0 diffs) | ~2-3min | None |

**Lighthouse Summary (Latest Scan)**

| Page | Performance | Accessibility | Best Practices | SEO |
|------|-------------|---------------|----------------|-----|
| Homepage | 95 ✅ | 98 ✅ | 92 ✅ | 100 ✅ |
| About | 93 ✅ | 98 ✅ | 92 ✅ | 98 ✅ |
| Posts | 94 ✅ | 97 ✅ | 92 ✅ | 100 ✅ |
| Projects | 93 ✅ | 98 ✅ | 92 ✅ | 98 ✅ |

**Core Web Vitals - All Excellent ✅**

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| LCP (Largest Contentful Paint) | <3s | 1.8s | ✅ Excellent |
| FID (First Input Delay) | <100ms | 45ms | ✅ Excellent |
| CLS (Cumulative Layout Shift) | <0.1 | 0.05 | ✅ Excellent |
| FCP (First Contentful Paint) | <2s | 1.2s | ✅ Excellent |
| TTI (Time to Interactive) | <5s | 3.4s | ✅ Good |

### Understanding Your Scores

**Performance (≥90 is good)**
What it means: Page loads quickly and responds to user interaction promptly.
If below 90: Check Core Web Vitals below and investigate slow-loading resources.

**Accessibility (≥95 is good)**
What it means: Site is usable by people with disabilities and follows WCAG guidelines.
If below 95: Test with keyboard navigation and screen readers. Check color contrast.

**Best Practices (≥90 is good)**
What it means: Code follows modern web standards and security practices.
If below 90: Check browser console for deprecation warnings and security issues.

**SEO (≥95 is good)**
What it means: Content is properly indexed by search engines with good metadata.
If below 95: Verify meta tags, structured data, and sitemap configuration.

---

## Before You Commit - Verification Checklist

**✅ Green Flags (All must be present before committing):**
- [ ] All tests pass (no failures in any suite)
- [ ] Visual regression: 0 differences detected
- [ ] Lighthouse scores maintained or improved
- [ ] No console errors in browser
- [ ] CSS file size same or smaller
- [ ] Build completes without warnings

**🚨 Red Flags (Stop and investigate if you see any):**
- [ ] Visual differences in visual regression tests
- [ ] "SIGNIFICANTLY SLOWER" in benchmark comparison
- [ ] CSS file size increased
- [ ] Console errors in browser
- [ ] Lighthouse scores dropped
- [ ] Tests that were passing now fail
- [ ] Build errors or warnings

---

## Test Categories

### 🧪 Unit Tests (Jest)
**Purpose**: Test core functionality and DOM manipulation
**When to run**: After any JavaScript or HTML changes
**Test Time**: ~30 seconds

**To run unit tests:**
```bash
npm run test
```

**What gets tested**:
- Navigation structure and links
- Form validation and submission
- Responsive design elements
- Accessibility features
- Meta tags and SEO elements

---

### 🎭 End-to-End Tests (Playwright)
**Purpose**: Test complete user workflows across multiple browsers
**When to run**: Before committing significant changes
**Test Time**: ~2-3 minutes

**To run E2E tests:**
```bash
npm run test:e2e
```

**Browser Coverage**:
- Chrome (Desktop & Mobile)
- Firefox
- Safari (Desktop & Mobile)

**What gets tested**:
- Site navigation and page loading
- Mobile/tablet/desktop responsiveness
- Error handling (404 pages)
- Performance and console errors
- Analytics implementation

---

### 📊 Analytics Tests
**Purpose**: Verify Google Tag Manager implementation
**GTM Container**: `GTM-TK5J8L38`
**When to run**: After modifying analytics code or includes

**To run analytics tests:**
```bash
npm run test  # Analytics tests are part of unit tests
```

**What gets validated**:
- GTM script loading with correct ID
- Google site verification meta tag
- Event tracking functionality
- Privacy compliance (Do Not Track, opt-out)
- Error handling for blocked/failed analytics

---

### ⚡ Performance Tests (Lighthouse)
**Purpose**: Measure Core Web Vitals and site performance
**When to run**: Before deployment or after major changes
**Test Time**: ~3-5 minutes

**To run performance tests:**
```bash
npm run test:performance
```

**Metrics Tracked**:
- **Performance Score**: ≥90 (page load speed)
- **Accessibility Score**: ≥95 (WCAG compliance)
- **Best Practices**: ≥90 (modern web standards)
- **SEO Score**: ≥95 (search engine optimization)

**Core Web Vitals Targets**:
- **LCP** (Largest Contentful Paint): <3s
- **FID** (First Input Delay): <100ms
- **CLS** (Cumulative Layout Shift): <0.1
- **FCP** (First Contentful Paint): <2s
- **TTI** (Time to Interactive): <5s

---

### 🎨 Visual Regression Tests
**Purpose**: Ensure pixel-perfect visual consistency during refactoring
**When to run**: Before every commit during refactoring
**Test Time**: ~2-3 minutes

**To run visual regression tests:**
```bash
npm run test:visual
```

**How it works**:
1. Capture baseline screenshots before refactoring
2. Take new screenshots after changes
3. Pixel-by-pixel comparison (0.1% tolerance)
4. Generate diff images highlighting changes

**Pages Tested** (15 total screenshots):
- Homepage (Desktop, Tablet, Mobile)
- About (Desktop, Tablet, Mobile)
- Posts Listing (Desktop, Tablet, Mobile)
- Post Detail (Desktop, Tablet, Mobile)
- Projects (Desktop, Tablet, Mobile)

**⚠️ Zero-tolerance policy**: During refactoring, ANY visual difference is considered a bug.

---

### 📈 Baseline Performance Tests
**Purpose**: Statistical validation of build performance
**When to run**: At the end of each refactoring phase
**Test Time**: ~10-15 minutes

**To compare against baseline:**
```bash
npm run test:compare-baseline
```

**To capture a new baseline:**
```bash
npm run test:capture-baseline
```

**What gets measured**:
- Clean build time
- Incremental build time
- CSS file size
- SCSS line count reduction
- SCSS file count reduction

**Validation Method**:
- 5-10 test runs for each metric
- Statistical analysis (mean, standard deviation)
- 95% confidence intervals
- Significance testing

---

## Testing Philosophy

This site uses a **zero-regression approach** to refactoring: every change must maintain or improve quality metrics. Statistical validation ensures changes are genuine improvements, not random fluctuations.

**Core Principles**:
1. **Control Groups**: Keep old code until verified
2. **Measurement Baselines**: Track all metrics systematically
3. **Statistical Validation**: Multiple runs, 95% confidence
4. **Reproducibility**: Deterministic tests, version-controlled baselines

**Simple Workflow**:
1. Run tests (baseline) → 2. Make change → 3. Run tests (should still pass) → 4. If fail: revert and fix → 5. If pass: commit

**When to Run Which Tests**:

| Scenario | Test Suite | Time | Frequency |
|----------|------------|------|-----------|
| After SCSS change | `test:smoke` | 1-2 min | Every change |
| Significant change | `test:critical` | 2-3 min | Before each commit |
| Before committing | `test:all` | 5-10 min | Every commit |
| End of phase | `test:compare-baseline` | 10-15 min | Phase completion |

**Learn More**: See the [Test Suite README](/tests/README.md) for comprehensive methodology and examples.

---

## Rollback Procedures

**Every refactoring phase must be reversible in <5 minutes.** Choose the appropriate rollback method based on severity:

### Phase Rollback (<5 minutes) - Recommended
**When to use**: Rollback a specific refactoring phase while keeping other work

**To rollback a specific phase:**
```bash
bash rollback-phase-N.sh
```

**Then verify everything works:**
```bash
npm run test:all
```

---

### Git Rollback - For Specific Commits
**When to use**: Undo specific commits or changes

**To revert a specific commit:**
```bash
git revert [commit-hash]
```

**To hard reset to master (⚠️ Warning: loses uncommitted work):**
```bash
git reset --hard origin/master
```

---

### 🚨 Emergency Rollback (<3 minutes) - Nuclear Option
**When to use**: Site is broken in production and you need immediate recovery

**⚠️ WARNING**: This reverts ALL changes. Use only in emergencies.

**To execute emergency rollback:**
```bash
bash emergency-rollback.sh
```

**Then verify site is functional:**
```bash
npm run test:smoke
```

---

## Test Infrastructure Files

**Legend**: [Critical] = Read/run first | [Important] = Key functionality | [Reference] = Auto-generated or docs

```
tests/
├── README.md                                    [Critical - Read first]
│
├── unit/                                        ⚡ RUN THIS: Core functionality tests
│   ├── site-functionality.test.js               [Critical - Tests navigation, forms, SEO]
│   └── setup.js                                 [Reference - Test configuration]
│
├── e2e/                                         ⚡ RUN THIS: Complete user workflows
│   ├── site-navigation.spec.js                  [Critical - Tests all page navigation]
│   ├── analytics.spec.js                        [Important - Validates GTM tracking]
│   └── mobile-responsiveness.spec.js            [Important - Tests responsive design]
│
├── analytics/                                   📊 MONITOR: Analytics implementation
│   └── google-analytics.test.js                 [Important - Verifies GTM setup]
│
├── performance/                                 📈 MONITOR: Lighthouse metrics
│   ├── lighthouse.js                            [Important - Performance testing]
│   ├── core-web-vitals.test.js                  [Important - Web vitals validation]
│   └── results/                                 [Reference - Auto-generated reports]
│
├── baseline/                                    📏 COMPARE: Build performance tracking
│   ├── README.md                                [Critical - Read before using]
│   ├── measure-build-performance.sh             [Important - Capture new baselines]
│   └── compare-to-baseline.sh                   [Important - Statistical comparison]
│
└── visual/                                      🎨 RUN BEFORE COMMIT: Visual regression
    ├── README.md                                [Critical - Read first]
    ├── baseline/                                [Reference - Reference screenshots]
    ├── current/                                 [Reference - Auto-generated]
    └── diffs/                                   [Reference - Auto-generated]
```

**Quick Navigation**:
- **New to testing?** Start with `tests/README.md`
- **Running tests?** Focus on `unit/` and `e2e/` directories
- **Before committing?** Run `visual/` tests to catch any visual changes
- **Measuring performance?** Check `baseline/` for comparison tools

---

## Continuous Integration

### GitHub Actions
Tests run automatically on:
- Every push to `main` branch
- Every pull request
- Scheduled nightly builds

### CI Pipeline
1. Install dependencies
2. Build Jekyll site
3. Run unit tests
4. Run E2E tests
5. Run performance tests
6. Generate reports
7. Upload artifacts

---

## Documentation

### Getting Started
- **[Test Suite README](https://github.com/aledlie/PersonalSite/blob/master/tests/README.md)** - Complete test suite documentation

### Deep Dives
- **[Baseline Testing](/tests/baseline/README.md)** - Build performance tracking
- **[Visual Regression](/tests/visual/README.md)** - Screenshot comparison testing

---

## Success Metrics

### Current Achievements
- ✅ **Zero regressions** maintained throughout refactoring
- ✅ **30-40% reduction** in SCSS complexity
- ✅ **Build times**: Same or faster
- ✅ **Test coverage**: 100% critical paths
- ✅ **Rollback capability**: <5 minutes

### Performance Improvements
- ✅ CSS bundle size reduced by 18%
- ✅ SCSS lines reduced by 33% (5,259 → 3,500)
- ✅ SCSS files reduced by 48% (23 → 12)
- ✅ main.scss reduced by 75% (393 → 100 lines)

---

## Contact & Support

**Questions or issues?**
- Review test output for specific error messages
- Check generated reports in `tests/performance/results/`
- Run individual test suites to isolate issues
- Ensure Jekyll site builds and serves correctly

**Contributing:**
When adding new features:
1. Add corresponding unit tests
2. Add E2E tests for user workflows
3. Update performance tests if needed
4. Ensure all tests pass before submitting

---

<div class="notice-info">
  <strong>💡 Pro Tip:</strong> Capture baselines FIRST before any refactoring. They're your insurance policy for zero-regression development.
</div>

**Last Updated**: November 11, 2025
**Test Framework Versions**: Playwright 1.40.0, Jest 30.2.0, Lighthouse 12.8.2
