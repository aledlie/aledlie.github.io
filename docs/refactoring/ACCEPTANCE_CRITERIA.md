# Acceptance Criteria for Architecture Refactoring

**Project:** The Parlor
**Version:** 1.0
**Last Updated:** 2025-11-11
**Purpose:** Gate criteria for phase progression

---

## How to Use This Document

**Before starting each phase:**
- Review prerequisites section
- Ensure all prerequisites met
- If not met, stop and address gaps

**After completing each phase:**
- Review acceptance criteria section
- Check each criterion
- All must pass before proceeding

**Decision Gates:**
- Some phases are BLOCKING (cannot proceed without passing)
- Others are RECOMMENDED (can proceed with documented exceptions)
- Document any exceptions in ADR

---

## Phase 0: Pre-Flight

**Type:** BLOCKING - Cannot start refactoring without this
**Duration:** 2 hours
**Prerequisites:** None (this is the start)

### Acceptance Criteria

#### 1. Baseline Metrics Recorded

**Must Have:**
- [ ] Build times recorded (clean and incremental)
- [ ] Bundle install time recorded
- [ ] NPM install time recorded
- [ ] Site size recorded (in MB)
- [ ] CSS file size recorded (in KB)
- [ ] SCSS line count recorded
- [ ] main.scss line count recorded
- [ ] Lighthouse scores recorded (all 4 key pages)
- [ ] All metrics saved in `baseline-metrics-2025-11-11.json`

**Validation:**
```bash
# File exists and has all fields
test -f baseline-metrics-2025-11-11.json && echo "PASS" || echo "FAIL"

# Contains all required metrics
grep -q "build_time_clean" baseline-metrics-2025-11-11.json && echo "PASS" || echo "FAIL"
```

#### 2. Safety Branches Created

**Must Have:**
- [ ] Git tag created: `pre-refactor-snapshot-2025-11-11`
- [ ] Tag pushed to remote
- [ ] Feature branch created: `refactor/architecture-simplification`
- [ ] Feature branch pushed to remote
- [ ] Emergency rollback branch created locally

**Validation:**
```bash
# Check tag exists
git tag | grep "pre-refactor-snapshot-2025-11-11" && echo "PASS" || echo "FAIL"

# Check tag on remote
git ls-remote --tags origin | grep "pre-refactor-snapshot-2025-11-11" && echo "PASS" || echo "FAIL"

# Check on feature branch
git branch | grep "refactor/architecture-simplification" && echo "PASS" || echo "FAIL"
```

#### 3. Visual Regression Baseline Captured

**Must Have:**
- [ ] BackstopJS or Playwright visual tests configured
- [ ] Baseline screenshots captured (45 total: 5 pages × 3 viewports × 3 browsers)
- [ ] Baseline stored in `tests/visual/baseline/`
- [ ] Visual regression test command works

**Validation:**
```bash
# Check baseline directory exists and has files
test -d tests/visual/baseline && echo "PASS" || echo "FAIL"
ls tests/visual/baseline/ | wc -l  # Should be ~45

# Test visual regression command works
npm run test:visual && echo "PASS" || echo "FAIL"
```

#### 4. Rollback Procedure Tested

**Must Have:**
- [ ] Rollback procedure documented in ROLLBACK_PROCEDURES.md
- [ ] Test rollback executed on throwaway branch
- [ ] Rollback successful (returned to working state in < 5 minutes)
- [ ] Rollback steps verified and updated if needed

**Validation:**
```bash
# Document exists
test -f documentation/refactoring/ROLLBACK_PROCEDURES.md && echo "PASS" || echo "FAIL"

# Rollback test log exists
test -f rollback-test-log.txt && echo "PASS" || echo "FAIL"
```

### Phase 0 Gate Decision

**All criteria must pass to proceed to Phase 1.**

**If any criterion fails:**
- Stop and address the failure
- Do not proceed until all pass
- This phase is critical for safety

---

## Phase 1: Foundation

**Type:** BLOCKING - Cannot proceed to Phase 1.5 without this
**Duration:** 3 hours
**Prerequisites:** Phase 0 complete

### Prerequisites

- [ ] Phase 0 acceptance criteria all met
- [ ] Currently on `refactor/architecture-simplification` branch
- [ ] All tests passing before starting Phase 1

### Acceptance Criteria

#### 1. Submodule State Resolved

**Must Have:**
- [ ] Submodule state documented
- [ ] Decision made: commit, revert, or exclude
- [ ] Decision executed and working
- [ ] `git status` shows clean or expected state

**Validation:**
```bash
# Check submodule status
git submodule status
# Should not show unexpected "+" or "-" prefix
```

#### 2. Dependencies Audited

**Must Have:**
- [ ] Dependency audit document created
- [ ] All Ruby gems checked for usage
- [ ] All NPM packages checked for usage
- [ ] Each dependency categorized: REQUIRED, REMOVE, or INVESTIGATE

**Validation:**
```bash
# Audit document exists
test -f documentation/architecture/dependency-audit.md && echo "PASS" || echo "FAIL"

# Contains all current gems
grep "jekyll-feed" documentation/architecture/dependency-audit.md && echo "PASS" || echo "FAIL"
```

#### 3. Unused Dependencies Removed

**Must Have:**
- [ ] Each dependency removed in separate commit
- [ ] Build tested after each removal
- [ ] All tests passed after each removal
- [ ] At least 1-2 dependencies removed (if any were unused)
- [ ] font-awesome-sass NOT removed (required)

**Validation:**
```bash
# Check individual commits
git log --oneline | grep "Remove.*dependency"
# Should see individual commits for each removal

# Verify font-awesome-sass still present
grep "font-awesome-sass" Gemfile && echo "PASS" || echo "FAIL: RESTORED REQUIRED"

# Build still works
bundle exec jekyll build && echo "PASS" || echo "FAIL"
```

#### 4. CI/CD Updated

**Must Have:**
- [ ] CI workflow file checked (`.github/workflows/test.yml`)
- [ ] Branch trigger added for `refactor/*` (if not present)
- [ ] Workflow tested (trigger a run)
- [ ] All CI checks passing

**Validation:**
```bash
# Check workflow file
grep "refactor/" .github/workflows/test.yml && echo "PASS" || echo "FAIL"

# Check recent CI run passed
# Manually check GitHub Actions tab
```

#### 5. Architecture Documentation Created

**Must Have:**
- [ ] Current architecture documented
- [ ] Documentation stored in `documentation/architecture/`
- [ ] At least initial ADR created (if decisions made)

**Validation:**
```bash
# Documentation directory exists
test -d documentation/architecture && echo "PASS" || echo "FAIL"

# Has some documentation
ls documentation/architecture/*.md | wc -l  # Should be > 0
```

### Phase 1 Gate Decision

**All criteria must pass to proceed to Phase 1.5.**

**Critical:** Phase 1.5 is NON-NEGOTIABLE. Do not skip.

---

## Phase 1.5: SCSS Analysis

**Type:** CRITICAL BLOCKING GATE
**Duration:** 4 hours
**Prerequisites:** Phase 1 complete

**NOTE:** This is the MOST CRITICAL phase. Cannot proceed to Phase 2 without complete and thorough SCSS analysis.

### Prerequisites

- [ ] Phase 1 acceptance criteria all met
- [ ] Dedicated 4 hours available for analysis
- [ ] Fresh perspective (not rushed)

### Acceptance Criteria

#### 1. Complete SCSS File Inventory

**Must Have:**
- [ ] ALL `.scss` files in `_sass/` inventoried (expected: 13+ files)
- [ ] Line count for each file
- [ ] Imports identified for each file
- [ ] Files checked against what's actually imported in `main.scss`
- [ ] NO files missing from inventory

**Required Files (at minimum):**
- [ ] variables.scss
- [ ] page.scss
- [ ] typography.scss
- [ ] elements.scss
- [ ] site.scss
- [ ] coderay.scss
- [ ] grid.scss
- [ ] mixins.scss
- [ ] _base.scss
- [ ] _buttons.scss
- [ ] _footer.scss
- [ ] _forms.scss
- [ ] _sidebar.scss

**Validation:**
```bash
# Count actual SCSS files
find _sass -name "*.scss" -type f | wc -l

# Should match inventory count
# Compare to PHASE_1.5_SCSS_ANALYSIS_TEMPLATE.md

# All files documented
find _sass -name "*.scss" -type f | while read file; do
    grep "$(basename $file)" PHASE_1.5_SCSS_ANALYSIS_TEMPLATE.md || echo "MISSING: $file"
done
```

#### 2. Duplicate Files Identified

**Must Have:**
- [ ] `_footer.scss` analyzed (root vs minimal-mistakes)
- [ ] `_sidebar.scss` analyzed (root vs minimal-mistakes)
- [ ] Differences documented
- [ ] Decision made on which to keep
- [ ] Import usage verified

**Validation:**
```bash
# Check analysis document has duplicate section
grep -A 10 "Duplicate Files" PHASE_1.5_SCSS_ANALYSIS_TEMPLATE.md

# Should document both duplicates
```

#### 3. SCSS Dependency Map Created

**Must Have:**
- [ ] Import hierarchy visualized
- [ ] Dependencies between files mapped
- [ ] Circular dependencies identified (if any)
- [ ] Theme dependencies documented
- [ ] Critical import order identified

**Validation:**
```bash
# Dependency map section exists
grep -A 20 "Dependency Map" PHASE_1.5_SCSS_ANALYSIS_TEMPLATE.md

# Shows import tree structure
grep "@import" PHASE_1.5_SCSS_ANALYSIS_TEMPLATE.md
```

#### 4. Detailed Consolidation Plan

**Must Have:**
- [ ] Each file assigned to a batch (1-5)
- [ ] Target consolidation files defined
- [ ] Import order for new structure defined
- [ ] Estimated time per batch
- [ ] Rationale for each decision

**Required Batches:**
- [ ] Batch 1: Utilities defined
- [ ] Batch 2: Variables & Mixins defined
- [ ] Batch 3: Components defined
- [ ] Batch 4: Syntax defined
- [ ] Batch 5: Layout Overrides defined

**Validation:**
```bash
# Consolidation plan section exists
grep -A 30 "Consolidation Plan" PHASE_1.5_SCSS_ANALYSIS_TEMPLATE.md

# All 5 batches defined
for i in 1 2 3 4 5; do
    grep "Batch $i:" PHASE_1.5_SCSS_ANALYSIS_TEMPLATE.md && echo "Batch $i: PASS" || echo "Batch $i: FAIL"
done
```

#### 5. No Surprises

**Must Have:**
- [ ] NO files discovered that weren't expected
- [ ] File count matches actual codebase
- [ ] All imports accounted for
- [ ] No "unknown" line counts (all measured)
- [ ] Analysis reviewed by peer (if team available)

**Validation:**
```bash
# No "unknown" or "TBD" in analysis
! grep -i "unknown\|tbd" PHASE_1.5_SCSS_ANALYSIS_TEMPLATE.md && echo "PASS" || echo "FAIL: Complete analysis"

# File count matches
EXPECTED=$(grep "Total Files:" PHASE_1.5_SCSS_ANALYSIS_TEMPLATE.md | grep -o '[0-9]\+')
ACTUAL=$(find _sass -name "*.scss" -type f | wc -l)
[ "$EXPECTED" -eq "$ACTUAL" ] && echo "PASS" || echo "FAIL: Count mismatch"
```

### Phase 1.5 Gate Decision

**CRITICAL BLOCKING GATE**

**All criteria must pass. No exceptions.**

**If any criterion fails:**
- STOP immediately
- Complete the analysis thoroughly
- Do not rush to Phase 2
- This is insurance against catastrophic failure

**Why this gate is non-negotiable:**
- Original plan missed 38% of SCSS files (5 of 13)
- Cannot consolidate files without understanding dependencies
- Phase 2B failure risk: HIGH without Phase 1.5, MEDIUM with Phase 1.5
- Time investment now (4 hours) prevents days of debugging later

**Sign-off Required:**
```
Phase 1.5 Complete Sign-off

I have thoroughly analyzed all SCSS files and confirm:
✓ All 13+ files inventoried
✓ No files missing
✓ Dependency map complete
✓ Consolidation plan detailed
✓ No surprises

Signed: _______________
Date: _______________
```

---

## Phase 2A: Theme Strategy

**Type:** RECOMMENDED BLOCKING (proceed with documented decision)
**Duration:** 4 hours
**Prerequisites:** Phase 1.5 complete

### Prerequisites

- [ ] Phase 1.5 acceptance criteria all met
- [ ] Phase 1.5 signed off
- [ ] Theme dependency analysis time available

### Acceptance Criteria

#### 1. Theme Dependency Analysis Complete

**Must Have:**
- [ ] Layout dependencies analyzed
- [ ] Include usage counted and documented
- [ ] Variable dependencies mapped
- [ ] Theme vs custom file ratio calculated

**Validation:**
```bash
# Analysis document exists
test -f documentation/architecture/theme-dependency-analysis.md && echo "PASS" || echo "FAIL"

# Contains key metrics
grep "includes used:" documentation/architecture/theme-dependency-analysis.md
grep "custom layouts:" documentation/architecture/theme-dependency-analysis.md
```

#### 2. Theme Strategy Decision Made

**Must Have:**
- [ ] Decision made: FORK or CONSOLIDATE
- [ ] Decision based on analysis (not gut feeling)
- [ ] Rationale documented
- [ ] Trade-offs understood

**Validation:**
```bash
# ADR exists
test -f documentation/architecture/decisions/001-theme-strategy.md && echo "PASS" || echo "FAIL"

# Contains decision
grep -E "FORK|CONSOLIDATE" documentation/architecture/decisions/001-theme-strategy.md
```

#### 3. Implementation Plan Created

**Must Have:**
- [ ] Step-by-step plan for chosen strategy
- [ ] File lists (if forking)
- [ ] Effort estimate
- [ ] Risk assessment

**Validation:**
```bash
# Implementation plan section in ADR
grep -A 10 "Implementation Plan" documentation/architecture/decisions/001-theme-strategy.md
```

### Phase 2A Gate Decision

**Recommended blocking. Can proceed with documented decision.**

**Required:** Clear decision documented in ADR
**Recommended:** Stakeholder review of decision (if available)

---

## Phase 2B: SCSS Consolidation

**Type:** CRITICAL - High Risk Phase
**Duration:** 6 hours (5 batches)
**Prerequisites:** Phase 2A complete

### Prerequisites

- [ ] Phase 2A decision made
- [ ] Phase 1.5 consolidation plan ready
- [ ] Visual regression tests working
- [ ] Backup of current `_site/` exists

### Acceptance Criteria

#### Per-Batch Criteria (Must pass after EACH batch)

**After Each Batch (1-5):**
- [ ] CSS output unchanged (verified with diff)
- [ ] Visual regression tests passing (0 unintended pixel differences)
- [ ] All tests passing (`npm run test:all`)
- [ ] Build time acceptable (within 20% of previous)
- [ ] Changes committed with good message
- [ ] Backup updated

**Validation After Each Batch:**
```bash
# 1. CSS diff
diff _site.backup/assets/css/main.css _site/assets/css/main.css
# Should show no differences or only expected changes

# 2. Visual regression
npm run test:visual
# Should show 0 failures or only intentional changes

# 3. All tests
npm run test:all
# Should show 100% pass rate

# 4. Build time
time bundle exec jekyll build
# Should be within 20% of previous batch
```

#### Overall Phase Criteria (After all 5 batches)

**Must Have:**
- [ ] All 5 batches complete
- [ ] All files consolidated per plan
- [ ] main.scss optimized (< 100 lines)
- [ ] No duplicate files remaining
- [ ] SCSS file count reduced by 30%+ from baseline
- [ ] All tests passing
- [ ] Visual regression baseline matches (or updates documented)

**Validation:**
```bash
# Check main.scss line count
wc -l assets/css/main.scss
# Should be < 100 lines

# Check SCSS file count reduction
BEFORE=$(grep "Total Files:" baseline-metrics-2025-11-11.json | grep -o '[0-9]\+')
AFTER=$(find _sass -name "*.scss" -type f | wc -l)
REDUCTION=$(( 100 - (AFTER * 100 / BEFORE) ))
[ "$REDUCTION" -ge 30 ] && echo "PASS: ${REDUCTION}% reduction" || echo "FAIL: Only ${REDUCTION}% reduction"

# All tests pass
npm run test:all && echo "PASS" || echo "FAIL"
```

### Phase 2B Gate Decision

**CRITICAL HIGH-RISK GATE**

**All criteria must pass.**

**If any batch fails:**
- STOP immediately
- Do not proceed to next batch
- Rollback failed batch
- Fix issue
- Retry batch
- Only proceed when batch passes all criteria

**If visual regression fails:**
- Review diff images carefully
- Determine if changes are intentional
- If intentional: update baseline and document
- If unintentional: rollback and fix

---

## Phase 2C: Theme Fork (If Applicable)

**Type:** CRITICAL if chosen in Phase 2A, SKIP if not
**Duration:** 4 hours
**Prerequisites:** Phase 2B complete, Fork chosen in Phase 2A

### Skip Criteria

**Skip this phase if:**
- [ ] CONSOLIDATE strategy chosen in Phase 2A
- [ ] Documented in ADR-001

### Acceptance Criteria (If Forking)

#### 1. Theme Files Forked

**Must Have:**
- [ ] All theme files copied to `_sass/theme/`
- [ ] Directory structure preserved
- [ ] File list matches plan from Phase 2A

**Validation:**
```bash
# Check theme directory exists
test -d _sass/theme && echo "PASS" || echo "FAIL"

# Count theme files
find _sass/theme -name "*.scss" -type f | wc -l
# Should match expected count from plan
```

#### 2. Configuration Updated

**Must Have:**
- [ ] `remote_theme` removed from `_config.yml`
- [ ] `minimal-mistakes-jekyll` removed from Gemfile
- [ ] Import paths updated in all SCSS files
- [ ] All references to theme gem removed

**Validation:**
```bash
# Check config.yml
! grep "remote_theme:" _config.yml && echo "PASS" || echo "FAIL: Remove remote_theme"

# Check Gemfile
! grep "minimal-mistakes-jekyll" Gemfile && echo "PASS" || echo "FAIL: Remove theme gem"

# Build without theme gem
bundle install
bundle exec jekyll build && echo "PASS" || echo "FAIL: Build broken"
```

#### 3. Build Succeeds on All Platforms

**Must Have:**
- [ ] Builds locally
- [ ] Deploys to Vercel successfully (staging)
- [ ] Deploys to GitHub Pages successfully (via PR)
- [ ] No missing includes errors
- [ ] No missing layouts errors

**Validation:**
```bash
# Local build
bundle exec jekyll build && echo "Local: PASS" || echo "Local: FAIL"

# Check Vercel deployment (manual)
# Go to Vercel dashboard → Deployments → Latest
# Status should be "Ready"

# Check GitHub Pages deployment (manual)
# Go to GitHub → Actions → Latest workflow
# Status should be "Success"
```

#### 4. Visual Parity Confirmed

**Must Have:**
- [ ] Visual regression tests passing
- [ ] All pages manually verified
- [ ] Homepage matches production
- [ ] About page matches production
- [ ] Posts page matches production
- [ ] Individual post matches production
- [ ] Projects page matches production
- [ ] Mobile layout correct
- [ ] No missing styles

**Validation:**
```bash
# Visual regression
npm run test:visual && echo "PASS" || echo "FAIL: Review diffs"

# Manual verification checklist
# Open site locally and compare to production
# Check all major pages
```

### Phase 2C Gate Decision

**CRITICAL HIGH-RISK GATE (if forking)**

**All criteria must pass before proceeding.**

**Theme fork is irreversible without major rollback.**

**If build fails after fork:**
- Immediate rollback required
- Review missing files
- Check import paths
- Test on separate branch before applying to main branch

---

## Phase 3: Deployment Simplification

**Type:** RECOMMENDED
**Duration:** 2-3 hours
**Prerequisites:** Phase 2B complete (and Phase 2C if applicable)

### Prerequisites

- [ ] Phase 2B acceptance criteria met
- [ ] Phase 2C acceptance criteria met (if forked)
- [ ] Site stable and all tests passing

### Acceptance Criteria

#### 1. Primary Deployment Identified

**Must Have:**
- [ ] DNS checked (where does www.aledlie.com point?)
- [ ] Current primary deployment documented
- [ ] Recent deployment activity reviewed

**Validation:**
```bash
# DNS check
nslookup www.aledlie.com
dig www.aledlie.com

# Document in ADR-002
test -f documentation/architecture/decisions/002-deployment-strategy.md && echo "PASS" || echo "FAIL"
```

#### 2. Primary Deployment Chosen

**Must Have:**
- [ ] Decision made: GitHub Pages or Vercel
- [ ] Decision documented in ADR
- [ ] Rationale clear

**Validation:**
```bash
# ADR has decision
grep -E "GitHub Pages|Vercel" documentation/architecture/decisions/002-deployment-strategy.md
```

#### 3. Configuration Simplified

**Must Have:**
- [ ] Unnecessary config removed
- [ ] Build commands streamlined
- [ ] Deployment working

**Validation:**
```bash
# Primary deployment works
# Manual check of deployment platform

# Secondary deployment works
# Manual check of deployment platform
```

#### 4. Deployment Strategy Documented

**Must Have:**
- [ ] Deployment process documented
- [ ] Deployment checklist created
- [ ] Rollback for deployments documented

**Validation:**
```bash
# Documentation exists
ls documentation/architecture/deployment*.md

# Contains deployment steps
grep -i "deploy" documentation/architecture/deployment*.md
```

### Phase 3 Gate Decision

**Recommended: All criteria should pass**

**Can proceed with minor exceptions if:**
- Both deployments work
- Documentation planned to be completed
- Strategy is clear

---

## Phase 4: Testing Consolidation

**Type:** RECOMMENDED
**Duration:** 4 hours
**Prerequisites:** Phase 3 complete

### Prerequisites

- [ ] Phase 3 acceptance criteria met
- [ ] All previous tests passing
- [ ] Coverage baseline recorded

### Acceptance Criteria

#### 1. New Consolidated Tests Running

**Must Have:**
- [ ] New test configuration created
- [ ] Tests run successfully
- [ ] Coverage meets or exceeds baseline

**Validation:**
```bash
# New tests run
npm run test:all && echo "PASS" || echo "FAIL"

# Coverage acceptable
npm run test:coverage
# Check coverage percentage
```

#### 2. Browser Matrix Optimized

**Must Have:**
- [ ] Browser matrix reduced (5 → 3 or 4)
- [ ] Mobile Chrome kept (most common)
- [ ] Decision documented
- [ ] Playwright config updated

**Validation:**
```bash
# Check playwright.config.js
cat playwright.config.js | grep "name:"
# Should show 3-4 browsers

# Mobile Chrome present
grep "mobile.*chrome" playwright.config.js -i && echo "PASS" || echo "FAIL"
```

#### 3. Validation Period Complete

**Must Have:**
- [ ] Old and new tests run in parallel (1 week)
- [ ] Results compared
- [ ] Agreement verified (>95% same results)
- [ ] Discrepancies documented and resolved

**Validation:**
```bash
# Check parallel test results
test -f test-comparison-report.md && echo "PASS" || echo "FAIL"

# Agreement percentage
grep "Agreement:" test-comparison-report.md
# Should be >95%
```

#### 4. Coverage Maintained

**Must Have:**
- [ ] Test coverage ≥ baseline
- [ ] No regression in coverage
- [ ] Coverage report generated

**Validation:**
```bash
# Generate coverage
npm run test:coverage

# Compare to baseline
BASELINE_COVERAGE=$(grep "coverage" baseline-metrics-2025-11-11.json | grep -o '[0-9]\+')
CURRENT_COVERAGE=$(grep "coverage" coverage/coverage-summary.json | grep -o '[0-9]\+' | head -1)

[ "$CURRENT_COVERAGE" -ge "$BASELINE_COVERAGE" ] && echo "PASS" || echo "FAIL: Coverage regression"
```

### Phase 4 Gate Decision

**Recommended: All criteria should pass**

**Can proceed with minor exceptions if:**
- Core test coverage maintained
- New tests proven reliable
- Old tests can be archived (not deleted immediately)

---

## Project Completion Criteria

**All phases complete - Final acceptance before declaring success:**

### Technical Criteria

**Must Pass (Blocking):**
- [ ] All tests passing
- [ ] Visual regression tests passing
- [ ] CSS file size within 10% of baseline
- [ ] Build time not slower than baseline (or faster)
- [ ] Site loads at primary URL
- [ ] Analytics tracking works
- [ ] Search functionality works
- [ ] RSS feeds validate
- [ ] Mobile responsive behavior preserved
- [ ] No console errors in browser

**Should Pass (Important):**
- [ ] SCSS file count reduced by 30%+
- [ ] main.scss < 100 lines
- [ ] Dependencies reduced by 20%+
- [ ] Documentation complete
- [ ] Build time improved by 5%+

### Documentation Criteria

**Must Pass:**
- [ ] All ADRs created for key decisions
- [ ] Architecture documentation complete
- [ ] Deployment strategy documented
- [ ] Testing strategy documented
- [ ] Rollback procedures verified

### Validation Criteria

**Must Pass:**
- [ ] Stakeholders reviewed changes (if applicable)
- [ ] Site tested on production
- [ ] Analytics verified working
- [ ] Search verified working
- [ ] Mobile experience verified
- [ ] RSS feeds validated
- [ ] All pages manually checked

### Cleanup Criteria

**Must Pass:**
- [ ] Feature branch merged to master
- [ ] Backup branches/tags retained
- [ ] Old files archived
- [ ] Lessons learned documented

---

## Exception Handling

**If any criterion cannot be met:**

1. **Document the exception**
   - Create exception document
   - Explain why criterion cannot be met
   - Describe workaround or mitigation
   - Get approval for exception

2. **Assess impact**
   - Low impact: Document and proceed
   - Medium impact: Get stakeholder approval
   - High impact: Stop and address or rollback

3. **Create follow-up task**
   - If criterion deferred
   - Set target date to address
   - Track in backlog

---

**Version:** 1.0
**Last Updated:** 2025-11-11
**Next Review:** After each phase completion
**Critical:** Use this as gate checklist before proceeding between phases
