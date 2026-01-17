---
layout: single
title: "PersonalSite Error Resolution Plan"
date: 2026-01-16
categories: [bug-fix, maintenance]
tags: [stylelint, ruby, jest, coverage, ci-cd]
excerpt: "Comprehensive bugfix plan for resolving SCSS linting errors, Ruby deprecation warnings, and Jest coverage collection failures in PersonalSite repository"
author_profile: true
toc: true
toc_sticky: true
header:
  overlay_image: /assets/images/bug-detective-header.png
  teaser: /assets/images/bug-detective-header.png
---

# PersonalSite Error Resolution Plan

**Created:** 2026-01-16
**Severity:** 🟠 High (CI/CD blockers) + 🟡 Medium (maintenance items)
**Estimated Duration:** 3-4 hours
**Status:** 🟡 Planning Complete - Ready for Implementation

---

## Executive Summary

This bugfix plan addresses 5 prioritized errors in the PersonalSite Jekyll static site repository. While no critical runtime issues exist (all tests passing), several CI/CD pipeline blockers and maintenance issues require resolution to ensure code quality, maintainability, and future compatibility.

**Key Issues:**
1. **SCSS Precision Errors** - Blocks clean linting (High Priority)
2. **Ruby Deprecation Warnings** - Liquid gem compatibility issues (Medium Priority)
3. **Babel Coverage Collection Failure** - Node.js 25 incompatibility (Medium Priority)
4. **Duplicate GA4 Script Loading** - Recently fixed, requires regression test (Low Priority)
5. **Accessibility Issues** - Recently fixed, requires monitoring (Low Priority)

**Overall Impact:** Development workflow friction, noisy build output, inability to measure code coverage.

---

## Bug 1: SCSS Precision Errors

### Bug Description

**Summary:** Stylelint fails on every run due to number precision violations in vendor theme file.

**Reproduction Steps:**
1. Run `npm run lint:scss`
2. Observe failures at `_sass/minimal-mistakes/_sidebar.scss:252-253`

**Expected Behavior:** Linting should pass with no errors.

**Actual Behavior:**
```
_sass/minimal-mistakes/_sidebar.scss
  252:16  ✖  Expected "4.1666666667" to be "4.1667"  number-max-precision
  253:17  ✖  Expected "4.1666666667" to be "4.1667"  number-max-precision
```

**Impact:**
- **Severity:** 🟠 High
- **Frequency:** Every `npm run lint:scss` execution
- **User Impact:** Blocks CI/CD pipeline, prevents clean builds, contributes to developer fatigue
- **Business Impact:** Cannot enforce SCSS code quality standards

---

### Environment

- **Affected Environments:** Development, CI/CD
- **Node.js Version:** v25.2.1
- **Stylelint Version:** 16.23.1
- **Stylelint Config:** stylelint-config-standard-scss (15.0.1)
- **Browser/Platform:** N/A (build-time issue)

---

### Evidence

**Error Messages:**
```bash
$ npm run lint:scss

_sass/minimal-mistakes/_sidebar.scss
  252:16  ✖  Expected "4.1666666667" to be "4.1667"  number-max-precision
  253:17  ✖  Expected "4.1666666667" to be "4.1667"  number-max-precision

✖ 2 problems (2 errors, 0 warnings)
```

**Affected Code (Lines 252-253):**
```scss
.author__urls,
.author-urls {
  display: none;
  position: absolute;
  inset-inline-end: 0;
  margin-top: 15px;
  margin-left: 4.1666666667%;   // ← Line 252: 10 decimal places
  margin-right: 4.1666666667%;  // ← Line 253: 10 decimal places
  padding: 10px;
  list-style-type: none;
  // ...
}
```

**Stylelint Configuration:**
```json
{
  "extends": [
    "stylelint-config-standard-scss",
    "stylelint-config-prettier-scss"
  ]
}
```

The `stylelint-config-standard-scss` preset includes the `number-max-precision` rule with a default of 4 decimal places.

---

### Root Cause Analysis

**Hypothesis:** The minimal-mistakes theme uses high-precision percentage calculations (likely from `100% / 24` grid system = 4.166666...) that exceed Stylelint's default 4 decimal place limit.

**Affected Components:**
- `/Users/alyshialedlie/code/PersonalSite/_sass/minimal-mistakes/_sidebar.scss:252-253`

**Investigation Steps Taken:**
1. ✅ Confirmed error occurs on every lint run
2. ✅ Identified exact lines and values
3. ✅ Verified stylelint config uses standard preset
4. ✅ Confirmed no custom `number-max-precision` rule override exists
5. ✅ Researched stylelint rule documentation (see [number-max-precision](https://stylelint.io/user-guide/rules/number-max-precision/))

**Confirmed Root Cause:**
The vendor theme file contains precision values (10 decimal places) that exceed the stylelint-config-standard-scss default limit of 4 decimal places. This is a collision between third-party theme code and linting standards.

**Why It Happened:**
- Theme authors used high-precision calculations for exact grid percentages
- Default stylelint config enforces 4 decimal places for readability
- No custom rule override was configured when linting was added to the project

---

### Fix Strategy

#### Option 1: Configure Stylelint Rule (Recommended)

**Approach:** Add `number-max-precision` rule override to allow up to 10 decimal places.

**Pros:**
- Quick fix (5 minutes)
- Preserves vendor code unchanged
- Maintains existing theme behavior
- Future-proof for theme updates
- Explicit intent documentation

**Cons:**
- Allows less readable precision throughout codebase
- May hide future precision issues in custom code

**Risk Level:** 🟢 Low
**Implementation Time:** 5 minutes

---

#### Option 2: Round Values in Vendor File

**Approach:** Edit `_sass/minimal-mistakes/_sidebar.scss` to round to 4 decimal places.

**Pros:**
- Enforces strict precision standards
- No config changes needed
- More readable values

**Cons:**
- Modifies vendor code (merge conflicts on theme updates)
- Risk of visual regression (margin calculation change)
- Requires extensive visual regression testing
- Will be overwritten if theme is updated

**Risk Level:** 🟡 Medium
**Implementation Time:** 30 minutes (including visual regression testing)

---

#### Option 3: Ignore Vendor Files from Linting

**Approach:** Add `_sass/minimal-mistakes/**` to `ignoreFiles` in stylelintrc.json.

**Pros:**
- Prevents all vendor linting issues
- No code changes needed
- Theme updates won't cause lint failures

**Cons:**
- Loses visibility into vendor code quality
- May mask other linting issues in vendor files
- Reduces overall code quality coverage

**Risk Level:** 🟢 Low
**Implementation Time:** 2 minutes

---

### Selected Approach

**Choice:** Option 1 (Configure Stylelint Rule)

**Justification:**
- Balances code quality with pragmatism
- Preserves vendor code for easier theme updates
- Explicit configuration documents the decision
- Can be scoped to only vendor files using `ignoreProperties` if needed
- Minimal risk of unintended consequences

**Implementation Details:**
Update `/Users/alyshialedlie/code/PersonalSite/config/stylelintrc.json`:

```json
{
  "extends": [
    "stylelint-config-standard-scss",
    "stylelint-config-prettier-scss"
  ],
  "ignoreFiles": [
    "../SumedhSite/**",
    "**/vendor/**",
    "../_site/**",
    "../node_modules/**",
    "../.bundle/**",
    "../assets/css/main.scss"
  ],
  "rules": {
    "selector-class-pattern": [
      "^([a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?|ais-[A-Z][a-zA-Z]*)$",
      {
        "message": "Expected class selector to be kebab-case, BEM format, or Algolia class"
      }
    ],
    "no-descending-specificity": null,
    "number-max-precision": [4, {
      "ignoreProperties": ["/^margin/", "/^padding/"]
    }]
  }
}
```

**Alternative (more permissive):**
```json
"number-max-precision": 10
```

---

## Implementation Plan

### Phase 1: Reproduce & Verify (15 minutes)

**Task 1.1: Confirm Error State**
- [ ] Run `npm run lint:scss` and capture baseline error
- [ ] Verify exact error message matches documentation
- [ ] Document current behavior with screenshots/logs

**Acceptance Criteria:**
- Error reproduces consistently
- Line numbers and messages match plan

**Files to Check:**
- `/Users/alyshialedlie/code/PersonalSite/_sass/minimal-mistakes/_sidebar.scss:252-253`
- `/Users/alyshialedlie/code/PersonalSite/config/stylelintrc.json`

---

### Phase 2: Fix Implementation (30 minutes)

**Task 2.1: Update Stylelint Configuration**
- [ ] Open `/Users/alyshialedlie/code/PersonalSite/config/stylelintrc.json`
- [ ] Add `number-max-precision` rule with `ignoreProperties` option
- [ ] Save file

**Task 2.2: Verify Fix**
- [ ] Run `npm run lint:scss`
- [ ] Confirm no errors reported
- [ ] Run `npm run lint:scss:fix` to verify auto-fix doesn't change anything

**Task 2.3: Regression Prevention**
- [ ] Document the change in commit message
- [ ] Add comment to stylelintrc.json explaining the rule override

**Acceptance Criteria:**
- `npm run lint:scss` passes with 0 errors
- No unintended changes to other SCSS files
- Rule override is documented

**Files to Edit:**
- `/Users/alyshialedlie/code/PersonalSite/config/stylelintrc.json`

---

### Phase 3: Verification & Testing (20 minutes)

**Task 3.1: Manual Verification**
- [ ] Run full test suite: `npm run test:all`
- [ ] Build site: `npm run build`
- [ ] Visually inspect author sidebar layout at breakpoints (mobile, tablet, desktop)
- [ ] Verify margin-left/margin-right values are unchanged in compiled CSS

**Task 3.2: CI/CD Validation**
- [ ] Commit changes with descriptive message
- [ ] Push to feature branch
- [ ] Verify GitHub Actions CI passes linting step

**Acceptance Criteria:**
- All tests pass (unit, E2E, performance)
- Visual layout unchanged
- CI/CD pipeline runs clean

---

## Testing Plan

### Unit Tests

**Not Applicable** - This is a linting configuration issue, not runtime code.

---

### Integration Tests

**Test Scenario 1: SCSS Linting Passes**
```bash
# Test Command
npm run lint:scss

# Expected Result
✔ No errors, 0 warnings

# Actual Result
(To be filled during implementation)
```

**Test Scenario 2: Auto-Fix Doesn't Modify Files**
```bash
# Test Command
npm run lint:scss:fix

# Expected Result
No files changed

# Actual Result
(To be filled during implementation)
```

---

### Manual Testing Scenarios

**Scenario 1: Author Sidebar Layout**
- **Steps:**
  1. Build site: `npm run serve`
  2. Open http://localhost:4000
  3. Navigate to any page with author sidebar
  4. Resize browser to mobile (375px), tablet (768px), desktop (1200px)
- **Expected:** Author URLs menu has proper margins at all breakpoints
- **Pass/Fail:** ___________

**Scenario 2: Vendor Theme Unchanged**
- **Steps:**
  1. Check git diff on `_sass/minimal-mistakes/_sidebar.scss`
- **Expected:** No changes to vendor file
- **Pass/Fail:** ___________

---

### Regression Tests

**Regression Test 1: Future Theme Updates**
- **Risk:** Theme updates may introduce new precision violations
- **Test:** After any theme gem updates, run `npm run lint:scss`
- **Prevention:** The `ignoreProperties` approach allows theme updates without breaking linting

**Regression Test 2: Custom SCSS Precision**
- **Risk:** Developers may add overly precise values in custom SCSS
- **Test:** Code review checklist should flag precision > 4 in custom files
- **Prevention:** Consider using separate rule for `/assets/css/` vs vendor files

---

## Rollout Plan

### Deployment Strategy

**Environment:** Development → CI/CD (no production impact)

**Steps:**
1. Implement fix in feature branch: `fix/scss-precision-linting`
2. Verify locally with `npm run lint:scss`
3. Commit and push to GitHub
4. Verify GitHub Actions CI passes
5. Merge to master via PR (no deployment needed for config-only change)

**Rollback Plan:**
- If lint errors reoccur: Revert commit with `git revert <commit-sha>`
- If visual regressions occur: Not applicable (no code changes)
- If CI breaks: Check stylelint version compatibility, may need to pin version

---

### Monitoring Approach

**Immediate Monitoring (First 24 hours):**
- [ ] Verify GitHub Actions CI runs clean on next 3 commits
- [ ] Check no new lint errors appear in unrelated SCSS files

**Ongoing Monitoring (First Week):**
- [ ] Monitor developer feedback about linting speed/accuracy
- [ ] Check for any precision-related issues in code reviews

**Long-term Monitoring:**
- [ ] Include lint check in PR checklist
- [ ] Review stylelint errors quarterly for patterns

**Alerts to Configure:**
- None required (linting is synchronous and immediate)

---

## Prevention Measures

### Why It Happened

**Root Cause:** Mismatch between third-party theme precision standards and default stylelint config.

**Contributing Factors:**
1. No custom stylelint rule configuration when linting was first added
2. Vendor code not excluded from linting
3. Precision limits not validated against existing codebase before enforcement

---

### Prevention Measures

**Technical Prevention:**
1. **Document Linting Standards:**
   - Create `/Users/alyshialedlie/code/PersonalSite/docs/LINTING-STANDARDS.md`
   - Document all custom stylelint rule overrides with rationale

2. **Pre-commit Hook:**
   - Add `npm run lint:scss` to Git pre-commit hook
   - Prevents committing code that fails linting

3. **CI/CD Enforcement:**
   - Ensure GitHub Actions runs `npm run lint:scss` as separate job
   - Fail build if linting errors exist

**Process Prevention:**
1. **Code Review Checklist:**
   - Add item: "Check for precision > 4 decimal places in custom SCSS"
   - Require explanation if high precision is needed

2. **Dependency Update Protocol:**
   - When updating minimal-mistakes theme, run lint immediately
   - Document any new rule overrides needed

3. **Developer Documentation:**
   - Add stylelint troubleshooting guide to CLAUDE.md
   - Include example of how to override rules properly

---

### Similar Bugs to Check

**Potential Related Issues:**
1. **Check other vendor files for precision issues:**
   ```bash
   grep -r "\..*[0-9]\{5,\}" _sass/
   ```

2. **Check for other stylelint rule violations:**
   ```bash
   npm run lint:scss -- --formatter verbose
   ```

3. **Check Prettier SCSS config alignment:**
   - Verify `config/prettierrc.json` doesn't conflict with stylelint rules
   - Run `npm run format:scss` and check for changes

4. **Check for similar precision issues in CSS:**
   - Review `assets/css/main.scss` for precision patterns
   - Verify main.scss is intentionally excluded from linting (already in ignoreFiles)

---

## Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| **Phase 1: Reproduce & Verify** | 15 min | None |
| **Phase 2: Fix Implementation** | 30 min | Phase 1 complete |
| **Phase 3: Verification & Testing** | 20 min | Phase 2 complete |
| **Total Estimated Time** | **1 hour 5 minutes** | |

**Confidence Level:** 🟢 High - Simple configuration change with low risk

---

## Bug 2: Ruby Deprecation Warnings - Liquid Gem

### Bug Description

**Summary:** Excessive Ruby deprecation warnings from Liquid 4.0.4 gem on every Jekyll build, creating noisy output and indicating future compatibility issues.

**Reproduction Steps:**
1. Run `bundle exec jekyll build` (or `npm run build`)
2. Observe 192+ repetitive warnings about frozen string literals

**Expected Behavior:** Clean build output with minimal warnings.

**Actual Behavior:**
```
/Users/alyshialedlie/.gem/ruby/3.4.4/gems/liquid-4.0.4/lib/liquid/parser.rb:72:
warning: literal string will be frozen in the future

(Repeated 192+ times across multiple Liquid gem files)
```

**Impact:**
- **Severity:** 🟡 Medium
- **Frequency:** Every Jekyll build (local and CI)
- **User Impact:** Obscures real warnings/errors, developer fatigue, slow build perception
- **Business Impact:** Future Ruby 3.5+ compatibility risk, harder to debug actual issues

---

### Environment

- **Affected Environments:** Development, CI/CD
- **Ruby Version:** 3.4.4
- **Liquid Gem Version:** 4.0.4
- **Jekyll Version:** 4.4.1 (requires liquid ~> 4.0)
- **Bundler Version:** 2.6.9

---

### Evidence

**Error Pattern:**
```
/Users/alyshialedlie/.gem/ruby/3.4.4/gems/liquid-4.0.4/lib/liquid/parser.rb:72:
warning: literal string will be frozen in the future

/Users/alyshialedlie/.gem/ruby/3.4.4/gems/liquid-4.0.4/lib/liquid/tags/for.rb:160:
warning: literal string will be frozen in the future
```

**Frequency:** 192+ occurrences per build (based on user report)

**Affected Gem Files:**
- `liquid-4.0.4/lib/liquid/parser.rb:72`
- `liquid-4.0.4/lib/liquid/tags/for.rb:160`
- (Multiple other files in liquid gem)

**Current Workaround in Use:**
```bash
# package.json
"serve": "RUBYOPT=\"-W0\" bundle exec jekyll serve"
"build": "RUBYOPT=\"-W0\" bundle exec jekyll build"
```

Using `RUBYOPT="-W0"` suppresses ALL warnings, which masks legitimate warnings.

---

### Root Cause Analysis

**Hypothesis:** Liquid 4.0.4 gem has not been updated for Ruby 3.4+ frozen string literal changes.

**Affected Components:**
- Liquid gem 4.0.4 (dependency of Jekyll 4.4.1)
- Multiple files in liquid gem codebase

**Investigation Steps:**
1. ✅ Confirmed Liquid 4.0.4 is installed (`gem list | grep liquid`)
2. ✅ Verified Jekyll 4.4.1 requires `liquid ~> 4.0` (Gemfile.lock line 54)
3. ✅ Checked Liquid gem releases: Latest is 5.5.1 (as of 2024)
4. ✅ Identified Jekyll compatibility constraint prevents upgrade
5. ✅ Confirmed warnings are from vendor gem, not project code

**Confirmed Root Cause:**
- Ruby 3.0+ introduced frozen string literals by default
- Liquid 4.0.4 (released 2020) predates this change
- Liquid 5.x addresses these warnings
- Jekyll 4.4.1 requires `liquid ~> 4.0`, preventing upgrade to Liquid 5.x
- Upgrading requires either:
  - Waiting for Jekyll 5.x (which may support Liquid 5.x)
  - Using a fork/patch of Liquid 4.x
  - Accepting the warnings

**Why It Happened:**
- Ruby ecosystem deprecation cycle
- Jekyll's conservative dependency management
- Project upgraded Ruby (3.4.4) but Jekyll dependencies lagged

---

### Fix Strategy

#### Option 1: Wait for Jekyll 5.x (Recommended)

**Approach:** Accept warnings until Jekyll 5.x is released with Liquid 5.x support.

**Pros:**
- No changes needed now
- Official upgrade path
- Avoids dependency conflicts
- `RUBYOPT="-W0"` already suppresses warnings

**Cons:**
- Warnings persist indefinitely (unknown Jekyll 5.x release date)
- Masks other legitimate Ruby warnings
- No proactive solution

**Risk Level:** 🟢 Low
**Implementation Time:** 0 minutes (status quo)
**Timeline:** Unknown (depends on Jekyll release schedule)

---

#### Option 2: Patch Liquid Gem Locally

**Approach:** Fork Liquid 4.0.4, add `# frozen_string_literal: true` to affected files, use local gem.

**Pros:**
- Silences warnings immediately
- Maintains Jekyll compatibility
- Full control over patch

**Cons:**
- High maintenance burden (must track upstream changes)
- Risk of introducing bugs
- Complicates gem management
- May break on bundle update

**Risk Level:** 🔴 High
**Implementation Time:** 2-3 hours
**Maintenance Cost:** Ongoing

---

#### Option 3: Selectively Suppress Warnings

**Approach:** Use `RUBYOPT="-W:no-deprecated"` instead of `RUBYOPT="-W0"` to suppress only deprecation warnings.

**Pros:**
- Allows other warnings (errors, security issues) to show
- More targeted than `-W0`
- No code changes needed
- Immediate implementation

**Cons:**
- Still hides deprecation warnings (though those are the problem)
- Doesn't solve the root cause
- Warning flags may vary by Ruby version

**Risk Level:** 🟢 Low
**Implementation Time:** 5 minutes

---

#### Option 4: Use GitHub Pages Gem Bundle

**Approach:** Switch back to `github-pages` gem which pins Jekyll and dependencies to GitHub Pages versions.

**Pros:**
- Known compatible versions
- Matches production environment (GitHub Pages)
- Tested by GitHub

**Cons:**
- Forces downgrade to Jekyll 3.10.0 (lose Jekyll 4.x features)
- May reintroduce warnings (depends on github-pages version)
- Lose modern Sass compiler (jekyll-sass-converter 3.0)
- Conflicts with project's decision to use Jekyll 4.3 (per CLAUDE.md)

**Risk Level:** 🟡 Medium
**Implementation Time:** 30 minutes (plus testing)

---

### Selected Approach

**Choice:** Option 3 (Selectively Suppress Warnings) with monitoring for Option 1

**Justification:**
- Pragmatic short-term solution
- Preserves visibility of non-deprecation warnings
- Minimal implementation effort
- Reversible when Jekyll 5.x is released
- Maintains Jekyll 4.x features and modern Sass compiler

**Implementation Details:**

Update `/Users/alyshialedlie/code/PersonalSite/package.json`:

```json
{
  "scripts": {
    "build": "RUBYOPT=\"-W:no-deprecated\" bundle exec jekyll build",
    "serve": "RUBYOPT=\"-W:no-deprecated\" bundle exec jekyll serve"
  }
}
```

**Monitoring Plan:**
- Check Jekyll release notes quarterly for Liquid 5.x support
- When Jekyll 5.x is released, test upgrade path
- Create reminder to revisit this in Q2 2026

---

## Implementation Plan - Bug 2

### Phase 1: Reproduce & Verify (10 minutes)

**Task 1.1: Capture Warning Baseline**
- [ ] Run `bundle exec jekyll build` (without RUBYOPT)
- [ ] Count and document exact warning frequency
- [ ] Identify all affected Liquid gem files

**Task 1.2: Test Current Workaround**
- [ ] Run `RUBYOPT="-W0" bundle exec jekyll build`
- [ ] Verify warnings are suppressed
- [ ] Confirm build still succeeds

**Acceptance Criteria:**
- Warning count documented (target: 192+)
- Current workaround verified functional

---

### Phase 2: Fix Implementation (15 minutes)

**Task 2.1: Update Package.json Scripts**
- [ ] Change `RUBYOPT="-W0"` to `RUBYOPT="-W:no-deprecated"`
- [ ] Update both `build` and `serve` scripts

**Task 2.2: Test New Approach**
- [ ] Run `npm run build`
- [ ] Verify deprecation warnings are suppressed
- [ ] Verify other warnings still appear (test by introducing a deliberate warning)

**Task 2.3: Document Decision**
- [ ] Add comment to package.json explaining RUBYOPT flag
- [ ] Update CLAUDE.md with explanation of Liquid gem situation
- [ ] Add TODO to revisit when Jekyll 5.x is released

**Acceptance Criteria:**
- Build output is clean (no Liquid deprecation warnings)
- Non-deprecation warnings still visible
- Decision documented

**Files to Edit:**
- `/Users/alyshialedlie/code/PersonalSite/package.json`
- `/Users/alyshialedlie/code/PersonalSite/CLAUDE.md`

---

### Phase 3: Verification & Long-term Monitoring (15 minutes)

**Task 3.1: Verify Build Quality**
- [ ] Run full test suite: `npm run test:all`
- [ ] Check CI/CD output for clarity
- [ ] Verify site builds correctly

**Task 3.2: Set Up Monitoring**
- [ ] Create calendar reminder for Q2 2026 to check Jekyll 5.x status
- [ ] Add to project backlog: "Upgrade to Jekyll 5.x when available"
- [ ] Document known limitation in troubleshooting guide

**Acceptance Criteria:**
- All tests pass
- Build output is readable
- Monitoring plan established

---

## Testing Plan - Bug 2

### Integration Tests

**Test Scenario 1: Deprecation Warnings Suppressed**
```bash
# Test Command
npm run build 2>&1 | grep -c "warning: literal string will be frozen"

# Expected Result
0 warnings

# Actual Result
(To be filled during implementation)
```

**Test Scenario 2: Other Warnings Still Visible**
```bash
# Test Setup: Add a test warning to _config.yml (invalid YAML comment)

# Test Command
npm run build 2>&1 | grep -i "warning"

# Expected Result
Shows non-deprecation warnings (if any exist)

# Actual Result
(To be filled during implementation)
```

---

### Regression Tests

**Regression Test 1: Jekyll Upgrades**
- **Risk:** Future Jekyll updates may change warning behavior
- **Test:** After `bundle update jekyll`, check build output
- **Prevention:** Monitor Jekyll changelog for Liquid dependency changes

**Regression Test 2: Ruby Version Upgrades**
- **Risk:** Ruby 3.5+ may have different warning flags
- **Test:** Before upgrading Ruby, test RUBYOPT flags in new version
- **Prevention:** Check Ruby release notes for deprecation changes

---

## Prevention Measures - Bug 2

### Why It Happened

**Root Cause:** Dependency version mismatch between Ruby ecosystem and Jekyll dependencies.

**Contributing Factors:**
1. Jekyll's conservative dependency management (Liquid ~> 4.0)
2. Ruby 3.0+ introducing frozen string literals
3. Liquid 4.0.4 not being updated for Ruby 3.4 compatibility
4. No proactive dependency monitoring

---

### Prevention Measures

**Technical Prevention:**
1. **Dependency Monitoring:**
   - Use Dependabot to monitor Jekyll and Ruby gem updates
   - Subscribe to Jekyll blog/release notes
   - Track Liquid gem releases

2. **Deprecation Dashboard:**
   - Create script to parse build warnings and categorize them
   - Monthly review of deprecation warnings
   - Prioritize resolution before warnings become errors

**Process Prevention:**
1. **Quarterly Dependency Review:**
   - Check for major version updates to Jekyll, Ruby, gems
   - Test upgrades in isolated branch
   - Document upgrade blockers

2. **Ruby Upgrade Policy:**
   - Before upgrading Ruby version, audit gem compatibility
   - Test build output for new warnings
   - Update RUBYOPT flags as needed

---

### Similar Bugs to Check

**Potential Related Issues:**
1. **Check other gem deprecation warnings:**
   ```bash
   bundle exec jekyll build 2>&1 | grep -i "deprecated" | sort | uniq
   ```

2. **Check for Ruby 3.4-specific compatibility issues:**
   - Review other gems for frozen string literal warnings
   - Check for method signature changes

3. **Check Sass deprecation warnings:**
   - CLAUDE.md mentions SCSS deprecation warnings from vendor files
   - Verify these are expected and documented

---

## Timeline - Bug 2

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| **Phase 1: Reproduce & Verify** | 10 min | None |
| **Phase 2: Fix Implementation** | 15 min | Phase 1 complete |
| **Phase 3: Verification & Monitoring** | 15 min | Phase 2 complete |
| **Total Estimated Time** | **40 minutes** | |

**Confidence Level:** 🟢 High - Configuration change with known workaround

---

## Bug 3: Babel Istanbul Coverage Collection Failure

### Bug Description

**Summary:** Jest fails to collect code coverage due to Node.js 25 incompatibility with babel-plugin-istanbul's dependency `test-exclude`.

**Reproduction Steps:**
1. Run `npm test -- --coverage`
2. Observe Babel errors for every JavaScript file
3. Coverage report shows 0% coverage

**Expected Behavior:** Coverage collected successfully for all JavaScript files in `assets/js/`.

**Actual Behavior:**
```
ERROR: [BABEL]: The "original" argument must be of type function.
Received an instance of Object
(While processing: babel-plugin-istanbul/lib/index.js)

STACK: TypeError [ERR_INVALID_ARG_TYPE]: The "original" argument must be
of type function. Received an instance of Object
    at promisify (node:internal/util:464:3)
    at Object.<anonymous> (/Users/alyshialedlie/code/PersonalSite/node_modules/test-exclude/index.js:5:14)
```

**Impact:**
- **Severity:** 🟡 Medium
- **Frequency:** Every coverage collection attempt
- **User Impact:** Cannot measure code coverage, blocks quality metrics
- **Business Impact:** No visibility into untested code, risk of shipping bugs

---

### Environment

- **Affected Environments:** Development, CI/CD
- **Node.js Version:** v25.2.1
- **npm Version:** 11.6.2
- **Jest Version:** 30.2.0
- **babel-plugin-istanbul Version:** 7.0.1
- **test-exclude Version:** 6.0.0 (transitive dependency)

---

### Evidence

**Full Error Stack:**
```
ERROR: [BABEL]: The "original" argument must be of type function. Received an instance of Object
(While processing: /Users/alyshialedlie/code/PersonalSite/node_modules/babel-plugin-istanbul/lib/index.js)

STACK: TypeError [ERR_INVALID_ARG_TYPE]: [BABEL]: The "original" argument must be of type function.
Received an instance of Object
    at promisify (node:internal/util:464:3)
    at Object.<anonymous> (/Users/alyshialedlie/code/PersonalSite/node_modules/test-exclude/index.js:5:14)
    at Module._compile (node:internal/modules/cjs/loader:1760:14)
    at Object..js (node:internal/modules/cjs/loader:1892:10)
    at Module.load (node:internal/modules/cjs/loader:1480:32)
    at Module._load (node:internal/modules/cjs/loader:1299:12)
    at TracingChannel.traceSync (node:diagnostics_channel:328:14)
    at Object.<anonymous> (/Users/alyshialedlie/code/PersonalSite/node_modules/babel-plugin-istanbul/lib/index.js:12:43)
```

**Dependency Tree:**
```
jest@30.2.0
  └── @jest/transform@30.2.0
      └── babel-plugin-istanbul@7.0.1
          └── test-exclude@6.0.0  ← Problem dependency
```

**Affected Files:**
All JavaScript files in coverage collection:
- `/Users/alyshialedlie/code/PersonalSite/assets/js/scripts.min.js`
- `/Users/alyshialedlie/code/PersonalSite/assets/js/_main.js`
- `/Users/alyshialedlie/code/PersonalSite/assets/js/plugins/jquery.fitvids.js`
- `/Users/alyshialedlie/code/PersonalSite/assets/js/csrf-protection.js`
- `/Users/alyshialedlie/code/PersonalSite/assets/js/email-obfuscation.js`

---

### Root Cause Analysis

**Hypothesis:** Node.js 25.x changed the `util.promisify` API in a breaking way that `test-exclude@6.0.0` depends on.

**Investigation Steps:**
1. ✅ Confirmed babel-plugin-istanbul 7.0.1 is installed
2. ✅ Identified test-exclude@6.0.0 as transitive dependency
3. ✅ Verified error occurs at `test-exclude/index.js:5:14` during promisify call
4. ✅ Researched Node.js 25.x util.promisify changes
5. ✅ Searched for known issues with babel-plugin-istanbul + Node.js 25
6. ✅ Found [Jest issue #15777](https://github.com/jestjs/jest/issues/15777) documenting deprecated dependencies in babel-plugin-istanbul

**Confirmed Root Cause:**
- Node.js 25.x introduced stricter type checking for `util.promisify`
- `test-exclude@6.0.0` attempts to promisify an object instead of a function
- `babel-plugin-istanbul@7.0.1` depends on outdated `test-exclude@6.0.0`
- `babel-plugin-istanbul@8.0.0` (released recently) updates to `test-exclude@7.x` which fixes this
- Jest 30.2.0 currently bundles babel-plugin-istanbul 7.0.1, not 8.0.0

**Why It Happened:**
- Project upgraded to Node.js 25.2.1 (cutting edge)
- Jest 30.2.0 includes older babel-plugin-istanbul (7.0.1)
- Dependencies haven't caught up to Node.js 25 changes
- No version pinning or compatibility testing before Node upgrade

---

### Fix Strategy

#### Option 1: Downgrade Node.js to LTS (Recommended)

**Approach:** Use Node.js 22.x LTS instead of 25.x (current release).

**Pros:**
- Immediate fix
- LTS = better ecosystem compatibility
- Recommended for production use
- No code changes needed
- Lower risk of other compatibility issues

**Cons:**
- Can't use Node.js 25-specific features
- Requires coordinating Node version across team/CI
- May feel like regression

**Risk Level:** 🟢 Low
**Implementation Time:** 10 minutes
**Long-term Sustainability:** High (LTS supported until 2027)

---

#### Option 2: Force Upgrade babel-plugin-istanbul to 8.x

**Approach:** Use npm overrides to force Jest to use babel-plugin-istanbul@8.0.0.

**Pros:**
- Keeps Node.js 25.x
- Uses latest babel-plugin-istanbul
- May improve coverage collection

**Cons:**
- Untested with Jest 30.2.0 (potential incompatibility)
- Risk of breaking coverage collection entirely
- May conflict with Jest's internal expectations
- Requires ongoing override maintenance

**Risk Level:** 🟡 Medium
**Implementation Time:** 20 minutes (plus testing)

**Example package.json:**
```json
{
  "overrides": {
    "babel-plugin-istanbul": "^8.0.0"
  }
}
```

---

#### Option 3: Disable Coverage Collection

**Approach:** Remove coverage collection from test suite, rely on E2E/integration tests for quality.

**Pros:**
- Immediate unblock
- Focuses on functional testing
- No dependency changes

**Cons:**
- Loses code coverage visibility
- Cannot identify untested code paths
- Blocks coverage-based quality gates
- Regression from current state (coverage previously worked)

**Risk Level:** 🔴 High (quality regression)
**Implementation Time:** 5 minutes

---

#### Option 4: Wait for Jest 31.x

**Approach:** Wait for next Jest major version which may bundle babel-plugin-istanbul 8.x.

**Pros:**
- Official upgrade path
- Tested compatibility
- No workarounds needed

**Cons:**
- Unknown timeline
- Coverage collection broken indefinitely
- Passive approach

**Risk Level:** 🟢 Low (if acceptable to wait)
**Implementation Time:** 0 minutes (waiting)

---

### Selected Approach

**Choice:** Option 1 (Downgrade Node.js to LTS) + Option 4 (Plan to upgrade when Jest 31.x is released)

**Justification:**
- Node.js 25.x is current release (not LTS), risky for production
- Node.js 22.x LTS is supported until 2027-04-30
- Better ecosystem compatibility across all dependencies
- Lower risk of encountering other cutting-edge compatibility issues
- Can upgrade back to Node.js 26+ LTS when available
- Coverage collection is critical for code quality metrics

**Implementation Details:**

1. **Update `.nvmrc` (if exists):**
   ```
   22.13.1
   ```

2. **Update GitHub Actions workflow (`.github/workflows/jekyll.yml`):**
   ```yaml
   - name: Setup Node.js
     uses: actions/setup-node@v3
     with:
       node-version: '22'
   ```

3. **Document in CLAUDE.md:**
   ```markdown
   ## Node.js Version

   - **Required:** Node.js 22.x LTS (not 25.x)
   - **Reason:** Jest coverage collection incompatible with Node.js 25
   - **Tracking:** Upgrade to Node.js 26 LTS when Jest supports it
   - **Install:** `nvm install 22 && nvm use 22`
   ```

4. **Update package.json engines:**
   ```json
   {
     "engines": {
       "node": ">=22.0.0 <26.0.0",
       "npm": ">=10.0.0"
     }
   }
   ```

**Monitoring Plan:**
- Subscribe to Jest releases for babel-plugin-istanbul 8.x adoption
- Test coverage collection with Node.js 26 LTS when released (April 2026)
- Re-evaluate Node version policy quarterly

---

## Implementation Plan - Bug 3

### Phase 1: Reproduce & Verify (15 minutes)

**Task 1.1: Confirm Coverage Failure**
- [ ] Run `npm test -- --coverage`
- [ ] Capture full error output
- [ ] Verify 0% coverage reported
- [ ] Document affected files

**Task 1.2: Verify Node.js Version**
- [ ] Run `node --version` (expect v25.2.1)
- [ ] Check if `.nvmrc` exists
- [ ] Check GitHub Actions workflow for Node version

**Acceptance Criteria:**
- Coverage collection failure reproduced
- Current Node.js version documented
- Baseline established

---

### Phase 2: Fix Implementation (30 minutes)

**Task 2.1: Install Node.js 22 LTS**
- [ ] Install Node.js 22.13.1 (or latest 22.x)
- [ ] Create/update `.nvmrc` file
- [ ] Run `nvm use 22` (or equivalent)

**Task 2.2: Update Configuration Files**
- [ ] Update `package.json` engines field
- [ ] Update GitHub Actions workflow (`.github/workflows/jekyll.yml`)
- [ ] Update CLAUDE.md with Node version requirements

**Task 2.3: Reinstall Dependencies**
- [ ] Delete `node_modules/` and `package-lock.json`
- [ ] Run `npm install`
- [ ] Verify lockfile uses Node.js 22-compatible packages

**Acceptance Criteria:**
- Node.js 22.x installed and active
- All config files updated
- Dependencies reinstalled

**Files to Edit:**
- `/Users/alyshialedlie/code/PersonalSite/.nvmrc` (create if missing)
- `/Users/alyshialedlie/code/PersonalSite/package.json`
- `/Users/alyshialedlie/code/PersonalSite/.github/workflows/jekyll.yml`
- `/Users/alyshialedlie/code/PersonalSite/CLAUDE.md`

---

### Phase 3: Verification & Testing (30 minutes)

**Task 3.1: Verify Coverage Collection**
- [ ] Run `npm test -- --coverage`
- [ ] Verify coverage report generated
- [ ] Check coverage percentages (expect >0%)
- [ ] Verify HTML coverage report created

**Task 3.2: Run Full Test Suite**
- [ ] Run `npm run test:all`
- [ ] Verify all tests pass
- [ ] Check for any Node.js version-related warnings

**Task 3.3: CI/CD Validation**
- [ ] Commit changes
- [ ] Push to GitHub
- [ ] Verify GitHub Actions CI passes with Node.js 22
- [ ] Verify coverage artifacts generated in CI

**Acceptance Criteria:**
- Coverage collection works locally
- All tests pass
- CI/CD uses Node.js 22 and succeeds

---

## Testing Plan - Bug 3

### Integration Tests

**Test Scenario 1: Coverage Collection Success**
```bash
# Test Command
npm test -- --coverage

# Expected Result
✓ Coverage collected for all JS files
✓ Coverage report generated
✓ No Babel errors

# Actual Result
(To be filled during implementation)
```

**Test Scenario 2: Coverage Percentages**
```bash
# Test Command
npm test -- --coverage --verbose

# Expected Result
Coverage percentages displayed for each file
Overall coverage summary shown

# Actual Result
(To be filled during implementation)
```

---

### Manual Testing Scenarios

**Scenario 1: Node Version Check**
- **Steps:**
  1. Run `node --version`
  2. Verify output is `v22.x.x`
- **Expected:** Node.js 22.x active
- **Pass/Fail:** ___________

**Scenario 2: Local Development Workflow**
- **Steps:**
  1. Run `npm install`
  2. Run `npm test`
  3. Run `npm run serve`
  4. Verify site builds and tests run
- **Expected:** All commands succeed without Node version warnings
- **Pass/Fail:** ___________

---

### Regression Tests

**Regression Test 1: Future Node.js Upgrades**
- **Risk:** Node.js 26 LTS may have new compatibility issues
- **Test:** Before upgrading Node, run `npm test -- --coverage` in test environment
- **Prevention:** Document Node version testing procedure

**Regression Test 2: Jest Upgrades**
- **Risk:** Jest updates may change coverage tooling
- **Test:** After `npm update jest`, verify coverage still works
- **Prevention:** Review Jest changelog for coverage changes

---

## Prevention Measures - Bug 3

### Why It Happened

**Root Cause:** Premature adoption of non-LTS Node.js version without compatibility testing.

**Contributing Factors:**
1. No Node.js version policy documented
2. No pre-upgrade testing of dependencies
3. Node.js 25.x is current release (not LTS), has bleeding-edge changes
4. No engines field in package.json to enforce version

---

### Prevention Measures

**Technical Prevention:**
1. **Node.js Version Policy:**
   - **Rule:** Only use LTS versions for production projects
   - **Exception:** Explicitly test current release in isolated branch before adopting
   - Document in CLAUDE.md and package.json engines field

2. **Pre-upgrade Testing:**
   - Before upgrading Node.js:
     1. Create test branch
     2. Run full test suite (including coverage)
     3. Check for deprecation warnings
     4. Test in CI/CD environment
   - Checklist in docs/NODE-UPGRADE-CHECKLIST.md

3. **Version Enforcement:**
   - Add `.nvmrc` to repository
   - Add engines field to package.json
   - Consider using Volta or other version manager
   - Add Node version check to CI/CD

**Process Prevention:**
1. **Dependency Compatibility Matrix:**
   - Create matrix of Node.js versions vs key dependencies
   - Update quarterly
   - Track which Node versions are tested/supported

2. **Early Warning System:**
   - Subscribe to Node.js release blog
   - Monitor LTS schedule
   - Plan upgrades 1 month before current LTS goes EOL

3. **Developer Onboarding:**
   - Add Node version requirement to README
   - Include in development setup instructions
   - Automated check in `npm run setup` script

---

### Similar Bugs to Check

**Potential Related Issues:**
1. **Check other Node.js 25-specific issues:**
   ```bash
   npm test 2>&1 | grep -i "ERR_INVALID_ARG_TYPE"
   npm run build 2>&1 | grep -i "deprecated"
   ```

2. **Check Playwright compatibility:**
   - Playwright may have Node.js version requirements
   - Verify E2E tests run on Node.js 22

3. **Check npm version compatibility:**
   - npm 11.6.2 is very new
   - Consider downgrading to npm 10.x (bundled with Node.js 22)

4. **Audit all dependencies for Node.js 22 compatibility:**
   ```bash
   npm ls --depth=0
   npm audit
   ```

---

## Timeline - Bug 3

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| **Phase 1: Reproduce & Verify** | 15 min | None |
| **Phase 2: Fix Implementation** | 30 min | Phase 1 complete |
| **Phase 3: Verification & Testing** | 30 min | Phase 2 complete |
| **Total Estimated Time** | **1 hour 15 minutes** | |

**Confidence Level:** 🟢 High - Well-understood version compatibility issue

---

## Bug 4: Duplicate GA4 Script Loading (Recently Fixed)

### Bug Description

**Summary:** Google Analytics 4 script was loaded twice, causing unnecessary network requests and potential data duplication.

**Status:** ✅ **RESOLVED** (Commit 48754081)

**Reproduction Steps (Historical):**
1. Build site and view source
2. Search for `gtag/js?id=G-J7TL7PQH7S`
3. Observe script tag appeared twice

**Fix Applied:**
```
Commit: 48754081
Message: fix(analytics): remove duplicate GA4 script loading
Date: Recent (within last 15 bug fixes)
```

**Impact:**
- **Severity:** 🟢 Low (performance issue, not functional)
- **Status:** Fixed, requires regression test

---

### Why It Was Included

This bug is included in the plan to:
1. **Document the fix** for future reference
2. **Create regression tests** to prevent reoccurrence
3. **Verify the fix is working** in production

---

### Regression Test Implementation

**Test File:** `/Users/alyshialedlie/code/PersonalSite/tests/analytics/ga4-script-loading.test.js`

**Test Content:**
```javascript
/**
 * Regression test for Bug #4: Duplicate GA4 Script Loading
 *
 * Fixed in commit 48754081
 *
 * This test verifies that the Google Analytics 4 script is only
 * loaded once per page to prevent performance issues and data duplication.
 */

describe('GA4 Script Loading', () => {
  test('should load GA4 script exactly once', () => {
    // Simulate page HTML with analytics includes
    document.body.innerHTML = `
      <!-- Simulated analytics include -->
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-J7TL7PQH7S"></script>
    `;

    const scripts = document.querySelectorAll('script[src*="gtag/js?id=G-J7TL7PQH7S"]');

    expect(scripts.length).toBe(1);
  });

  test('should not have duplicate gtag initialization', () => {
    // Check that window.gtag is only defined once
    expect(typeof window.gtag).toBe('function');

    // Verify dataLayer is initialized once
    expect(Array.isArray(window.dataLayer)).toBe(true);
  });
});
```

**E2E Test:** `/Users/alyshialedlie/code/PersonalSite/tests/e2e/analytics-loading.spec.js`

```javascript
/**
 * E2E Regression Test: GA4 Script Duplication
 *
 * Verifies that analytics scripts are loaded exactly once in production builds.
 */

import { test, expect } from '@playwright/test';

test.describe('Analytics Script Loading', () => {
  test('should load GA4 script only once on homepage', async ({ page }) => {
    await page.goto('/');

    const ga4Scripts = await page.locator('script[src*="gtag/js"]').count();
    expect(ga4Scripts).toBe(1);
  });

  test('should load GA4 script only once on blog posts', async ({ page }) => {
    await page.goto('/posts/');

    const ga4Scripts = await page.locator('script[src*="gtag/js"]').count();
    expect(ga4Scripts).toBe(1);
  });

  test('should initialize dataLayer exactly once', async ({ page }) => {
    await page.goto('/');

    const dataLayerCount = await page.evaluate(() => {
      return window.dataLayer ? 1 : 0;
    });

    expect(dataLayerCount).toBe(1);
  });
});
```

---

### Verification Checklist

**Manual Verification:**
- [ ] View source of built site homepage
- [ ] Search for `gtag/js?id=G-J7TL7PQH7S`
- [ ] Confirm only 1 instance exists
- [ ] Check browser Network tab for duplicate requests
- [ ] Verify GA4 events are firing correctly (no double-counting)

**Automated Verification:**
- [ ] Create unit test (see above)
- [ ] Create E2E test (see above)
- [ ] Add to CI/CD pipeline
- [ ] Run tests in staging environment

---

### Prevention Measures

**Why It Happened:**
- Likely duplicate includes in Jekyll layout/partial hierarchy
- No automated check for duplicate script tags
- Manual include management

**Prevention:**
1. **Script Loading Audit:**
   - Add test to check for duplicate `<script>` tags with same `src`
   - Run on every build in CI/CD

2. **Analytics Include Pattern:**
   - Centralize analytics includes in single partial
   - Use Jekyll conditional to ensure single inclusion
   - Document include hierarchy in CLAUDE.md

3. **Code Review Checklist:**
   - Item: "Check for duplicate script tags"
   - Item: "Verify analytics only included in head or footer, not both"

---

## Bug 5: Accessibility Issues (Recently Fixed)

### Bug Description

**Summary:** Multiple WCAG 2.1 Level AA compliance issues including duplicate landmarks, missing H1 headings, and improper heading hierarchy.

**Status:** ✅ **RESOLVED** (Multiple commits)

**Fixes Applied:**
```
Commit c7eee2b4: fix(a11y): resolve duplicate banner landmarks and H1 issues
Commit a1e41b84: fix(a11y): add H1 to post-index layout for blog archive
Commit 459a1ea6: fix(a11y): change The Parlor to H1 for WCAG compliance
```

**Test Status:** All 69 E2E accessibility tests passing (0 violations)

**Impact:**
- **Severity:** 🟢 Low (already fixed)
- **Status:** Fixed, requires ongoing monitoring

---

### Why It Was Included

This bug is included in the plan to:
1. **Document the comprehensive fix** (multiple commits over time)
2. **Ensure accessibility tests remain passing**
3. **Establish monitoring for future changes**
4. **Prevent regression during refactoring**

---

### Accessibility Test Coverage

**Current Tests:** `/Users/alyshialedlie/code/PersonalSite/tests/e2e/accessibility.spec.js`

**Coverage:**
- Homepage accessibility (desktop + mobile)
- About page accessibility (desktop + mobile)
- Posts archive accessibility (desktop + mobile)
- Individual blog post accessibility
- Keyboard navigation
- Focus indicators
- Heading hierarchy
- Landmark uniqueness
- Color contrast ratios
- ARIA attributes

**Results:** 69/69 tests passing, 0 violations

---

### Ongoing Monitoring Plan

**Automated Monitoring:**
1. **E2E Tests (Every PR):**
   - Run `npm run test:e2e` in GitHub Actions
   - Fail build if accessibility violations detected
   - Generate accessibility report

2. **Lighthouse Audits (Every Deploy):**
   - Accessibility score ≥95% required
   - Monitor specific metrics:
     - Color contrast
     - ARIA attributes
     - Heading order
     - Landmark structure

3. **Manual Testing (Monthly):**
   - Screen reader testing (VoiceOver on macOS)
   - Keyboard-only navigation
   - Zoom testing (up to 200%)

**Manual Checklist (For Future HTML Changes):**
- [ ] Maintain proper heading hierarchy (H1 → H2 → H3, no skips)
- [ ] Use ARIA attributes only on landmarks and interactive elements
- [ ] Ensure color contrast ≥4.5:1 for text
- [ ] Keep semantic HTML (nav, main, aside, footer)
- [ ] Preserve skip navigation links
- [ ] Test keyboard navigation (Tab, Enter, Esc)
- [ ] Verify focus indicators visible

---

### Accessibility Documentation

**Key Files:**
- `/Users/alyshialedlie/code/PersonalSite/_includes/skip-links.html` - Skip navigation
- `/Users/alyshialedlie/code/PersonalSite/_includes/breadcrumbs.html` - Breadcrumb navigation
- `/Users/alyshialedlie/code/PersonalSite/_includes/author-profile.html` - Author info
- `/Users/alyshialedlie/code/PersonalSite/_includes/page__hero.html` - Overlay headers
- `/Users/alyshialedlie/code/PersonalSite/_sass/_footer.scss` - Footer contrast

**Compliance Report:**
- `/Users/alyshialedlie/code/PersonalSite/_reports/2025-11-26-accessibility-quick-wins-wcag-compliance.md`

---

### Prevention Measures

**Why It Happened:**
- Incremental theme customization without accessibility audits
- No automated accessibility testing initially
- Overlay headers hiding H1 elements

**Prevention:**
1. **Pre-commit Accessibility Check:**
   - Add accessibility test to Git pre-commit hook
   - Prevents committing code with violations

2. **Component Development Checklist:**
   - New components must include accessibility tests
   - Require ARIA label review
   - Document heading level expectations

3. **Quarterly Accessibility Audits:**
   - Full manual screen reader testing
   - Color contrast audit (all new colors)
   - Keyboard navigation flow review

4. **Developer Training:**
   - Document common WCAG violations in CLAUDE.md
   - Share accessibility testing guide with contributors
   - Include accessibility in code review checklist

---

## Combined Timeline

### Overall Bugfix Plan Timeline

| Bug | Priority | Estimated Time | Dependencies |
|-----|----------|----------------|--------------|
| **Bug 1: SCSS Precision** | 🟠 High | 1 hour 5 min | None |
| **Bug 2: Ruby Warnings** | 🟡 Medium | 40 min | None |
| **Bug 3: Coverage Failure** | 🟡 Medium | 1 hour 15 min | None |
| **Bug 4: GA4 Duplication** | 🟢 Low | 30 min (tests) | Bug 1-3 complete |
| **Bug 5: Accessibility** | 🟢 Low | 20 min (monitoring) | Bug 1-3 complete |
| **Total Estimated Time** | | **3 hours 50 min** | |

---

### Recommended Implementation Order

1. **Bug 1 (SCSS Precision)** - Unblocks linting, quick win
2. **Bug 3 (Coverage Failure)** - Requires Node.js downgrade, affects all npm commands
3. **Bug 2 (Ruby Warnings)** - Cleans up build output after Node changes
4. **Bug 4 (GA4 Tests)** - Add regression tests with clean environment
5. **Bug 5 (Accessibility)** - Final verification and monitoring setup

---

## Success Criteria

### Overall Success Metrics

**Immediate Success:**
- [ ] `npm run lint:scss` passes with 0 errors
- [ ] `npm run build` produces clean output (no Liquid warnings)
- [ ] `npm test -- --coverage` generates coverage reports
- [ ] All 186 unit tests pass
- [ ] All 69 E2E tests pass
- [ ] All performance tests meet thresholds
- [ ] GitHub Actions CI pipeline runs clean

**Quality Metrics:**
- [ ] Code coverage visible and measurable
- [ ] No CI/CD blockers
- [ ] Build output is readable (minimal noise)
- [ ] All accessibility tests passing
- [ ] No duplicate analytics tracking

**Developer Experience:**
- [ ] Linting runs fast and provides actionable feedback
- [ ] Build warnings are relevant and actionable
- [ ] Coverage reports aid in identifying untested code
- [ ] Documentation explains all configuration decisions

---

## Rollback Plan

### Bug 1 Rollback (SCSS Precision)

**If linting breaks:**
```bash
git revert <commit-sha>
# Restore previous stylelintrc.json
```

**No production impact** (config-only change)

---

### Bug 2 Rollback (Ruby Warnings)

**If builds fail:**
```bash
# Revert to RUBYOPT="-W0"
git revert <commit-sha>
```

**No production impact** (build-time config)

---

### Bug 3 Rollback (Node.js Version)

**If tests fail with Node.js 22:**
```bash
# Reinstall Node.js 25
nvm install 25
nvm use 25

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Restore coverage collection (broken but builds work)
```

**Production impact:** None (Node.js only affects build process)

**Monitoring:** Check GitHub Actions still passes after rollback

---

## Post-Implementation Review

### Review Checklist (Complete After Implementation)

**Technical Review:**
- [ ] All bugs resolved as planned
- [ ] No new bugs introduced
- [ ] Test suite passes completely
- [ ] CI/CD pipeline stable
- [ ] Code quality metrics improved

**Documentation Review:**
- [ ] CLAUDE.md updated with new constraints
- [ ] Configuration changes documented
- [ ] Troubleshooting guide updated
- [ ] Known limitations documented

**Process Review:**
- [ ] Lessons learned documented
- [ ] Prevention measures implemented
- [ ] Monitoring alerts configured
- [ ] Team informed of changes

**Metrics to Track (First Week):**
- CI/CD pipeline failure rate
- Build time changes
- Developer feedback
- Test execution time
- Coverage percentage baseline

---

## Appendix A: Quick Reference Commands

### Verification Commands

```bash
# SCSS Linting
npm run lint:scss

# Ruby Build (with warnings visible)
bundle exec jekyll build

# Coverage Collection
npm test -- --coverage

# Full Test Suite
npm run test:all

# E2E Accessibility Tests
npx playwright test tests/e2e/accessibility.spec.js

# Node.js Version Check
node --version
```

---

### Fix Implementation Commands

```bash
# Bug 1: SCSS Precision
# Edit config/stylelintrc.json (manual)
npm run lint:scss

# Bug 2: Ruby Warnings
# Edit package.json scripts (manual)
npm run build

# Bug 3: Node.js Version
nvm install 22
nvm use 22
rm -rf node_modules package-lock.json
npm install
npm test -- --coverage

# Bug 4: GA4 Tests
# Create test files (manual)
npm test tests/analytics/ga4-script-loading.test.js
npx playwright test tests/e2e/analytics-loading.spec.js

# Bug 5: Accessibility Monitoring
npx playwright test tests/e2e/accessibility.spec.js
npm run test:performance
```

---

## Appendix B: Related Documentation

### Internal Documentation

- `/Users/alyshialedlie/code/PersonalSite/CLAUDE.md` - Project configuration
- `/Users/alyshialedlie/code/PersonalSite/docs/CHANGELOG.md` - Change history
- `/Users/alyshialedlie/code/PersonalSite/docs/REFACTORING_STATUS.md` - Refactoring status
- `/Users/alyshialedlie/code/PersonalSite/_reports/2025-11-26-accessibility-quick-wins-wcag-compliance.md` - Accessibility compliance

### External Documentation

**Bug 1 (SCSS Precision):**
- [Stylelint number-max-precision rule](https://stylelint.io/user-guide/rules/number-max-precision/)
- [Stylelint configuration guide](https://stylelint.io/user-guide/configure/)

**Bug 2 (Ruby Warnings):**
- [Ruby frozen string literals](https://docs.ruby-lang.org/en/3.4/syntax/comments_rdoc.html#label-Magic+Comments)
- [Liquid gem releases](https://github.com/Shopify/liquid/releases)

**Bug 3 (Coverage):**
- [Jest issue #15777](https://github.com/jestjs/jest/issues/15777) - babel-plugin-istanbul deprecated dependencies
- [Node.js LTS schedule](https://nodejs.org/en/about/previous-releases)
- [babel-plugin-istanbul GitHub](https://github.com/istanbuljs/babel-plugin-istanbul)

**Bug 5 (Accessibility):**
- [WCAG 2.1 Level AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/?versions=2.1&levels=aa)
- [axe-core documentation](https://github.com/dequelabs/axe-core)

---

## Appendix C: Contact and Escalation

### Issue Tracking

**GitHub Repository:** aledlie/aledlie.github.io
**Branch for Fixes:** `bugfix/personalsite-errors-2026-01-16`

### Escalation Path

**If fixes fail:**
1. Review implementation steps carefully
2. Check error logs for new messages
3. Consult related documentation (Appendix B)
4. Create GitHub issue with full error output

**If rollback needed:**
1. Follow rollback plan for specific bug
2. Document why rollback was needed
3. Re-assess fix strategy
4. Update this plan with lessons learned

---

## Completion Checklist

### Final Sign-Off

- [ ] All 5 bugs addressed (fixed or monitored)
- [ ] All tests passing (186 unit, 69 E2E)
- [ ] CI/CD pipeline clean
- [ ] Documentation updated
- [ ] Regression tests added
- [ ] Team notified of changes
- [ ] This plan saved to `/Users/alyshialedlie/code/PersonalSite/_reports/2026-01-16-bugfix-personalsite-errors.md`

**Plan Created:** 2026-01-16
**Estimated Completion:** 2026-01-16 (same day)
**Actual Completion:** ________________
**Notes:** ________________________________

---

**End of Bugfix Plan**
