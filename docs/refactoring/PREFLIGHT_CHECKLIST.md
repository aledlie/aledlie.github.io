# Pre-Flight Checklist: Phase 0

**Project:** The Parlor
**Phase:** Phase 0 - Pre-Flight
**Duration:** 2 hours
**Status:** Ready to Execute

---

## Overview

This checklist guides you through Phase 0: establishing baseline metrics, safety measures, and rollback procedures before any refactoring begins.

**Critical:** Phase 0 is NON-NEGOTIABLE. Do not skip any tasks.

**Success Criteria:** All checkboxes must be checked before proceeding to Phase 1.

---

## Prerequisites

**Before starting Phase 0:**

- [ ] Read MASTER_IMPLEMENTATION_GUIDE.md (30 min)
- [ ] Read EXECUTIVE_SUMMARY.md (10 min)
- [ ] Read DECISION_TREES.md (15 min)
- [ ] Team approval obtained for 4-week timeline
- [ ] Dedicated time available (2 hours uninterrupted)
- [ ] Currently on `master` branch with clean working directory

**Verify prerequisites:**
```bash
# Check on master branch
git branch | grep "* master"

# Check working directory clean
git status
# Should show "nothing to commit, working tree clean"

# Check all documentation read
ls documentation/refactoring/*.md
# Confirm you've read the key documents
```

---

## Task 0.1: Measure Baseline Metrics (30 minutes)

### Build Performance Metrics

**Objective:** Establish baseline build performance for comparison.

- [ ] **Clean build time**
```bash
rm -rf _site .jekyll-cache .sass-cache
time bundle exec jekyll build 2>&1 | tee baseline-build-clean.log

# Record time (e.g., "real 0m12.543s")
CLEAN_BUILD_TIME="_____ seconds"
```

- [ ] **Incremental build time**
```bash
touch _posts/2024-01-01-test-post.md
time bundle exec jekyll build 2>&1 | tee baseline-build-incremental.log

# Record time
INCREMENTAL_BUILD_TIME="_____ seconds"
```

- [ ] **Bundle install time**
```bash
rm -rf vendor/bundle .bundle
time bundle install 2>&1 | tee baseline-bundle-install.log

# Record time
BUNDLE_INSTALL_TIME="_____ seconds"
```

- [ ] **NPM install time**
```bash
rm -rf node_modules package-lock.json
time npm install 2>&1 | tee baseline-npm-install.log

# Record time
NPM_INSTALL_TIME="_____ seconds"
```

### Size Metrics

- [ ] **Built site size**
```bash
du -sh _site/
SITE_SIZE="_____ MB"
```

- [ ] **CSS file size**
```bash
ls -lh _site/assets/css/main.css
CSS_SIZE="_____ KB"
```

- [ ] **SCSS source lines**
```bash
find _sass -name "*.scss" -exec wc -l {} + | tail -1
SCSS_TOTAL_LINES="_____ lines"
```

- [ ] **main.scss lines**
```bash
wc -l assets/css/main.scss
MAIN_SCSS_LINES="_____ lines"
```

- [ ] **SCSS file count**
```bash
find _sass -name "*.scss" -type f | wc -l
SCSS_FILE_COUNT="_____ files"
```

- [ ] **Dependency counts**
```bash
cat Gemfile | grep "^gem" | wc -l
RUBY_GEM_COUNT="_____ gems"

cat package.json | jq '.dependencies | length'
NPM_PACKAGE_COUNT="_____ packages"
```

### Performance Metrics

- [ ] **Run Lighthouse tests**
```bash
# Start Jekyll server
RUBYOPT="-W0" bundle exec jekyll serve --detach
sleep 10

# Run Lighthouse
npm run test:performance 2>&1 | tee baseline-lighthouse.log

# Kill server
pkill -f jekyll
```

- [ ] **Extract Core Web Vitals**
```bash
# From Lighthouse output, record:
HOMEPAGE_PERFORMANCE="_____ %"
HOMEPAGE_LCP="_____ s"
HOMEPAGE_FCP="_____ s"
HOMEPAGE_CLS="_____ "
```

### Create Baseline Metrics File

- [ ] **Compile all metrics into JSON**
```bash
cat > baseline-metrics-2025-11-11.json <<EOF
{
  "date": "$(date -I)",
  "build_metrics": {
    "clean_build_time_seconds": $CLEAN_BUILD_TIME,
    "incremental_build_time_seconds": $INCREMENTAL_BUILD_TIME,
    "bundle_install_time_seconds": $BUNDLE_INSTALL_TIME,
    "npm_install_time_seconds": $NPM_INSTALL_TIME
  },
  "size_metrics": {
    "site_total_mb": "$SITE_SIZE",
    "css_compiled_kb": "$CSS_SIZE",
    "scss_source_lines": $SCSS_TOTAL_LINES,
    "main_scss_lines": $MAIN_SCSS_LINES,
    "scss_file_count": $SCSS_FILE_COUNT,
    "node_modules_mb": "$(du -sh node_modules | cut -f1)",
    "ruby_bundle_mb": "$(du -sh vendor/bundle | cut -f1)"
  },
  "dependency_metrics": {
    "ruby_gems": $RUBY_GEM_COUNT,
    "npm_packages": $NPM_PACKAGE_COUNT
  },
  "performance_metrics": {
    "homepage_performance_score": $HOMEPAGE_PERFORMANCE,
    "homepage_lcp": $HOMEPAGE_LCP,
    "homepage_fcp": $HOMEPAGE_FCP,
    "homepage_cls": $HOMEPAGE_CLS
  }
}
EOF
```

- [ ] **Verify metrics file created**
```bash
cat baseline-metrics-2025-11-11.json
# Should show all metrics
```

- [ ] **Commit baseline metrics**
```bash
git add baseline-metrics-2025-11-11.json baseline-*.log
git commit -m "docs: Establish baseline metrics before refactoring

Baseline measurements:
- Clean build: ${CLEAN_BUILD_TIME}s
- CSS size: ${CSS_SIZE}
- SCSS files: ${SCSS_FILE_COUNT}

Phase 0: Pre-Flight"
```

**Checkpoint:** Baseline metrics recorded and committed.

---

## Task 0.2: Create Safety Branches (15 minutes)

### Create Git Tag

- [ ] **Create snapshot tag**
```bash
git tag -a pre-refactor-snapshot-2025-11-11 -m "Pre-refactoring snapshot

Site state before architecture refactoring begins.
All tests passing, site functional.
Use this tag for emergency rollback.

Date: $(date)
Commit: $(git rev-parse HEAD)"
```

- [ ] **Verify tag created**
```bash
git tag | grep pre-refactor-snapshot
```

- [ ] **Push tag to remote**
```bash
git push origin pre-refactor-snapshot-2025-11-11
```

- [ ] **Verify tag on remote**
```bash
git ls-remote --tags origin | grep pre-refactor-snapshot
```

### Create Feature Branch

- [ ] **Create refactoring branch**
```bash
git checkout -b refactor/architecture-simplification
```

- [ ] **Verify on new branch**
```bash
git branch | grep "* refactor/architecture-simplification"
```

- [ ] **Push to remote**
```bash
git push -u origin refactor/architecture-simplification
```

- [ ] **Verify branch on remote**
```bash
git ls-remote --heads origin | grep refactor/architecture-simplification
```

### Create Emergency Rollback Branch

- [ ] **Create local rollback branch**
```bash
git branch emergency-rollback-2025-11-11
```

- [ ] **Verify branch created**
```bash
git branch | grep emergency-rollback
```

**Note:** Don't push emergency branch - it's local only for fast recovery.

### Document Branch Strategy

- [ ] **Create branch strategy document**
```bash
cat > BRANCH_STRATEGY.md <<EOF
# Branch Strategy for Refactoring

**Created:** $(date)

## Branches

**master**
- Production branch
- Auto-deploys to GitHub Pages
- DO NOT commit here during refactoring
- Only merge refactor branch when complete

**refactor/architecture-simplification**
- Feature branch for all refactoring work
- All phases done here
- Tests must pass before merge to master
- Use Vercel for preview deployments

**emergency-rollback-2025-11-11**
- Local-only branch
- Same as pre-refactor state
- For fast rollback if needed
- Never push to remote

## Tags

**pre-refactor-snapshot-2025-11-11**
- Snapshot of site before refactoring
- Use for rollback if needed
- Permanent tag, do not delete

## Workflow

1. Work on: refactor/architecture-simplification
2. Commit frequently
3. Push to remote regularly
4. Never commit to master
5. Merge to master only when all phases complete

## Rollback

If emergency rollback needed:
\`\`\`bash
git reset --hard pre-refactor-snapshot-2025-11-11
git push --force origin refactor/architecture-simplification
\`\`\`
EOF
```

- [ ] **Commit branch strategy**
```bash
git add BRANCH_STRATEGY.md
git commit -m "docs: Document branch strategy for refactoring

Phase 0: Pre-Flight"
```

**Checkpoint:** Safety branches and tags created.

---

## Task 0.3: Set Up Visual Regression Testing (45 minutes)

### Install Visual Regression Tools

**Option A: Use Existing Playwright (Recommended)**

- [ ] **Check Playwright installed**
```bash
npm ls @playwright/test
```

- [ ] **If not installed, install Playwright**
```bash
npm install --save-dev @playwright/test
npx playwright install
```

- [ ] **Install pixelmatch for image comparison**
```bash
npm install --save-dev pixelmatch pngjs
```

**Option B: Install BackstopJS (Alternative)**

- [ ] **Install BackstopJS**
```bash
npm install --save-dev backstopjs
```

- [ ] **Initialize BackstopJS**
```bash
npx backstop init
```

### Configure Visual Regression Tests

**Using Playwright (Recommended):**

- [ ] **Create visual regression test file**
```bash
mkdir -p tests/visual
cat > tests/visual/visual-regression.spec.js <<'EOF'
const { test, expect } = require('@playwright/test');
const { compareScreenshots } = require('./visual-comparison-helper');

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

test.describe('Visual Regression Tests', () => {
  for (const page of PAGES_TO_TEST) {
    for (const viewport of VIEWPORTS) {
      test(\`\${page.name} - \${viewport.name}\`, async ({ page: browserPage }) => {
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

        const baselinePath = \`tests/visual/baseline/\${page.name}-\${viewport.name}-\${browserPage.context().browser().browserType().name()}.png\`;
        const currentPath = \`tests/visual/current/\${page.name}-\${viewport.name}-\${browserPage.context().browser().browserType().name()}.png\`;
        const diffPath = \`tests/visual/diffs/\${page.name}-\${viewport.name}-\${browserPage.context().browser().browserType().name()}.png\`;

        const comparison = await compareScreenshots(
          baselinePath,
          screenshot,
          currentPath,
          diffPath,
          { threshold: 0.1 }
        );

        expect(comparison.diffPixelCount).toBeLessThan(
          comparison.totalPixels * 0.001
        );
      });
    }
  }
});
EOF
```

- [ ] **Create visual comparison helper**
```bash
# See testing-strategy-2025-11-11.md for full helper code
# Or copy from documentation
```

- [ ] **Add NPM scripts**
```bash
# Add to package.json scripts:
# "test:visual": "playwright test tests/visual/visual-regression.spec.js",
# "test:visual:update-baseline": "cp -r tests/visual/current/* tests/visual/baseline/"
```

### Capture Baseline Screenshots

- [ ] **Start Jekyll server**
```bash
RUBYOPT="-W0" bundle exec jekyll serve --detach
sleep 10
```

- [ ] **Run visual regression tests to create baseline**
```bash
npm run test:visual
# First run will create baseline screenshots
```

- [ ] **Verify baseline screenshots created**
```bash
ls tests/visual/baseline/
# Should have ~48 screenshots (4 pages × 3 viewports × 4 browsers)
```

- [ ] **Kill Jekyll server**
```bash
pkill -f jekyll
```

- [ ] **Commit visual regression setup**
```bash
git add tests/visual/ package.json
git commit -m "test: Set up visual regression testing

- Add Playwright visual regression tests
- Add image comparison helper
- Capture baseline screenshots (48 images)

Phase 0: Pre-Flight"
```

**Checkpoint:** Visual regression testing configured and baseline captured.

---

## Task 0.4: Test Rollback Procedure (30 minutes)

### Document Rollback Procedure

- [ ] **Verify ROLLBACK_PROCEDURES.md exists**
```bash
test -f documentation/refactoring/ROLLBACK_PROCEDURES.md && echo "PASS" || echo "FAIL: File missing"
```

- [ ] **Read rollback procedures (10 min)**
```bash
# Open and read:
cat documentation/refactoring/ROLLBACK_PROCEDURES.md
```

### Practice Rollback on Test Branch

- [ ] **Create test branch**
```bash
git checkout -b test-rollback-procedure
```

- [ ] **Make a fake breaking change**
```bash
echo "// DELIBERATE BREAK FOR TESTING" >> assets/css/main.scss
```

- [ ] **Commit the break**
```bash
git add assets/css/main.scss
git commit -m "test: Deliberately break site for rollback test"
```

- [ ] **Verify site is "broken" (has test change)**
```bash
cat assets/css/main.scss | tail -1
# Should show "// DELIBERATE BREAK FOR TESTING"
```

### Test Level 2 Rollback (Single Commit)

- [ ] **Execute rollback using revert**
```bash
git revert HEAD --no-edit
```

- [ ] **Verify rollback worked**
```bash
cat assets/css/main.scss | tail -1
# Should NOT show the break comment
```

- [ ] **Test build**
```bash
bundle exec jekyll build
# Should succeed
```

- [ ] **Record time taken**
```bash
# How long did rollback take? _____ seconds
# Target: < 5 minutes
```

### Test Level 4 Rollback (Full Rollback)

- [ ] **Reset to snapshot**
```bash
git reset --hard pre-refactor-snapshot-2025-11-11
```

- [ ] **Verify reset worked**
```bash
git log -1
# Should show commit before refactoring
```

- [ ] **Test build**
```bash
bundle install
bundle exec jekyll build
# Should succeed
```

- [ ] **Test site**
```bash
RUBYOPT="-W0" bundle exec jekyll serve --detach
sleep 10
curl -I http://localhost:4000
# Should return 200 OK
pkill -f jekyll
```

- [ ] **Record time taken**
```bash
# How long did full rollback take? _____ seconds
# Target: < 15 minutes
```

### Clean Up Test

- [ ] **Return to refactor branch**
```bash
git checkout refactor/architecture-simplification
```

- [ ] **Delete test branch**
```bash
git branch -D test-rollback-procedure
```

### Document Rollback Test Results

- [ ] **Create rollback test log**
```bash
cat > rollback-test-log.txt <<EOF
# Rollback Procedure Test Results

**Date:** $(date)
**Tester:** [Your Name]

## Test Scenarios

### Level 2 Rollback (Single Commit Revert)
- Status: PASS / FAIL
- Time: _____ seconds
- Method: git revert HEAD
- Build after rollback: SUCCESS / FAIL
- Notes: [Any observations]

### Level 4 Rollback (Full Reset to Snapshot)
- Status: PASS / FAIL
- Time: _____ seconds
- Method: git reset --hard pre-refactor-snapshot-2025-11-11
- Build after rollback: SUCCESS / FAIL
- Site functional: YES / NO
- Notes: [Any observations]

## Lessons Learned
[Any insights from testing rollback procedures]

## Procedure Updates Needed
[Any updates to ROLLBACK_PROCEDURES.md based on testing]

## Sign-off
Rollback procedures tested and verified functional.

Signed: _______________
Date: $(date)
EOF
```

- [ ] **Commit rollback test log**
```bash
git add rollback-test-log.txt
git commit -m "test: Document rollback procedure test results

Both Level 2 and Level 4 rollbacks tested successfully.
Recovery time meets RTO targets.

Phase 0: Pre-Flight"
```

**Checkpoint:** Rollback procedures tested and verified.

---

## Phase 0 Completion

### Final Verification

- [ ] **All tasks complete**
  - [ ] Task 0.1: Baseline metrics ✓
  - [ ] Task 0.2: Safety branches ✓
  - [ ] Task 0.3: Visual regression ✓
  - [ ] Task 0.4: Rollback testing ✓

- [ ] **All files committed**
```bash
git status
# Should show "nothing to commit, working tree clean"
```

- [ ] **Push all commits**
```bash
git push origin refactor/architecture-simplification
```

### Verification Checklist

**Baseline Metrics:**
- [ ] `baseline-metrics-2025-11-11.json` exists
- [ ] Contains all required metrics
- [ ] Baseline logs committed

**Safety Branches:**
- [ ] Tag `pre-refactor-snapshot-2025-11-11` exists
- [ ] Tag pushed to remote
- [ ] Branch `refactor/architecture-simplification` exists
- [ ] Branch pushed to remote
- [ ] Branch `emergency-rollback-2025-11-11` exists locally

**Visual Regression:**
- [ ] Visual regression tests configured
- [ ] Baseline screenshots captured (~48 images)
- [ ] `npm run test:visual` command works
- [ ] Visual test files committed

**Rollback:**
- [ ] ROLLBACK_PROCEDURES.md exists
- [ ] Rollback procedures tested
- [ ] Test results documented
- [ ] Both Level 2 and Level 4 rollbacks successful

### Acceptance Criteria Check

Review ACCEPTANCE_CRITERIA.md → Phase 0:

- [ ] All Phase 0 acceptance criteria met
- [ ] No failures in verification
- [ ] All commits pushed

### Create Phase 0 Completion Tag

- [ ] **Tag completion**
```bash
git tag -a phase-0-complete -m "Phase 0: Pre-Flight Complete

All baseline metrics recorded.
Safety branches created.
Visual regression testing configured.
Rollback procedures tested.

Ready to proceed to Phase 1.

Date: $(date)
Commit: $(git rev-parse HEAD)"
```

- [ ] **Push tag**
```bash
git push origin phase-0-complete
```

### Update Status

- [ ] **Update STAKEHOLDER_UPDATES.md**
```bash
cat >> documentation/refactoring/STAKEHOLDER_UPDATES.md <<EOF

---

## Update: Phase 0 Complete

**Date:** $(date)
**Phase:** Phase 0 - Pre-Flight
**Status:** COMPLETE ✓
**Time Spent:** _____ hours (Target: 2 hours)

### Completed
- ✓ Baseline metrics established
- ✓ Safety branches and tags created
- ✓ Visual regression testing configured
- ✓ Rollback procedures tested

### Metrics
- Clean build time: ${CLEAN_BUILD_TIME}s
- CSS size: ${CSS_SIZE}
- SCSS files: ${SCSS_FILE_COUNT}
- Visual baseline: 48 screenshots

### Next Steps
- Begin Phase 1: Foundation
- Expected duration: 3 hours
- Expected completion: [Date]

### Risks
None identified at this stage.

**Prepared by:** [Your Name]
EOF
```

### Document Time Spent

- [ ] **Record actual time**
```bash
ACTUAL_TIME="_____ hours"
# Target: 2 hours
# Acceptable: 1.5-2.5 hours
```

- [ ] **If over time, document why**
```bash
# Reasons: _________________
```

---

## Ready to Proceed?

**Before proceeding to Phase 1:**

- [ ] All checkboxes in this document checked
- [ ] All acceptance criteria met
- [ ] All commits pushed
- [ ] Phase 0 complete tag created
- [ ] Team/stakeholders notified (if applicable)
- [ ] Time available for Phase 1 (3 hours)

**If all checked:**
✓ **Phase 0 COMPLETE**
→ Proceed to Phase 1: Foundation

**If any unchecked:**
✗ **Phase 0 INCOMPLETE**
→ Complete remaining tasks before proceeding

---

## Phase 0 Sign-Off

```
Phase 0: Pre-Flight Complete

I have completed all Phase 0 tasks:
✓ Baseline metrics recorded
✓ Safety branches created
✓ Visual regression configured
✓ Rollback procedures tested

All acceptance criteria met.
Ready to proceed to Phase 1.

Signed: _______________
Date: $(date)
Time Spent: _____ hours
```

---

**Next Document:** IMPLEMENTATION-CHECKLIST.md → Phase 1

**Version:** 1.0
**Last Updated:** 2025-11-11
