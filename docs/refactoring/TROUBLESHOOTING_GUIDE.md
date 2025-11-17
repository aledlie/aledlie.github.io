# Troubleshooting Guide for Architecture Refactoring

**Project:** The Parlor
**Version:** 1.0
**Last Updated:** 2025-11-11
**Purpose:** Solutions for common issues during refactoring

---

## How to Use This Guide

1. **Identify the symptom** - Find your issue in the table of contents
2. **Check the diagnostic steps** - Gather information about the problem
3. **Try the solutions** - Start with "Quick Fix" then escalate if needed
4. **Document the outcome** - Add notes if you find new solutions

**Emergency:** If site is completely broken, skip to [Emergency Procedures](#emergency-procedures)

---

## Table of Contents

### Build and Deployment Issues
1. [Jekyll Build Fails](#1-jekyll-build-fails)
2. [SCSS Compilation Errors](#2-scss-compilation-errors)
3. [GitHub Pages Deployment Fails](#3-github-pages-deployment-fails)
4. [Vercel Deployment Fails](#4-vercel-deployment-fails)
5. [Encoding Errors](#5-encoding-errors)

### Dependency Issues
6. [Bundle Install Fails](#6-bundle-install-fails)
7. [NPM Install Fails](#7-npm-install-fails)
8. [Dependency Removal Breaks Build](#8-dependency-removal-breaks-build)
9. [Version Conflicts](#9-version-conflicts)

### Testing Issues
10. [Visual Regression Tests Failing](#10-visual-regression-tests-failing)
11. [Playwright Tests Failing](#11-playwright-tests-failing)
12. [Lighthouse Performance Drop](#12-lighthouse-performance-drop)
13. [Tests Pass Locally But Fail in CI](#13-tests-pass-locally-but-fail-in-ci)

### CSS and Styling Issues
14. [CSS Output Changed Unexpectedly](#14-css-output-changed-unexpectedly)
15. [Layout Broken on Mobile](#15-layout-broken-on-mobile)
16. [Fonts Not Loading](#16-fonts-not-loading)
17. [Colors Wrong After SCSS Consolidation](#17-colors-wrong-after-scss-consolidation)

### Git and Version Control
18. [Merge Conflicts](#18-merge-conflicts)
19. [Lost Commits After Reset](#19-lost-commits-after-reset)
20. [Submodule Issues](#20-submodule-issues)

### Theme Issues
21. [Theme Fork Breaks Site](#21-theme-fork-breaks-site)
22. [Missing Theme Includes](#22-missing-theme-includes)
23. [Theme Variables Not Found](#23-theme-variables-not-found)

### Analytics and Features
24. [Analytics Not Tracking](#24-analytics-not-tracking)
25. [Search Not Working](#25-search-not-working)
26. [RSS Feeds Broken](#26-rss-feeds-broken)

---

## Emergency Procedures

### Site Completely Broken

**Symptoms:**
- Won't build at all
- 500 errors on deployment
- Blank pages
- Multiple cascading failures

**Immediate Action:**
```bash
# 1. Stop and assess
# Don't make more changes!

# 2. Check git status
git status
git log --oneline -5

# 3. Quick rollback to last known good state
git reset --hard HEAD~1
bundle install
bundle exec jekyll build

# 4. If still broken, nuclear option
git reset --hard pre-refactor-snapshot-2025-11-11
bundle install
bundle exec jekyll build

# 5. Verify it works
RUBYOPT="-W0" bundle exec jekyll serve
# Check http://localhost:4000

# 6. If working, document what happened
# Create incident-YYYY-MM-DD.md
```

**After Emergency Rollback:**
1. Site is safe and working
2. Document timeline of changes
3. Identify what broke it
4. Create plan to fix issue
5. Test fix on separate branch
6. Apply fix when ready

---

## Build and Deployment Issues

### 1. Jekyll Build Fails

**Symptoms:**
- `bundle exec jekyll build` fails
- Error messages about missing files or invalid syntax
- Build stops partway through

#### Diagnostic Steps

```bash
# 1. Check build output for specific error
bundle exec jekyll build --verbose

# 2. Check Jekyll version
bundle exec jekyll --version

# 3. Check for syntax errors in recent changes
git diff HEAD~1

# 4. Try clean build
rm -rf _site .jekyll-cache
bundle exec jekyll build
```

#### Common Causes & Solutions

**Cause 1: Invalid YAML Front Matter**
```bash
# Symptom
Error: YAML Exception reading /path/to/file.md

# Solution
# Check front matter syntax
head -20 _posts/problematic-file.md

# Fix: Ensure valid YAML
---
layout: single
title: "Valid Title"
---
```

**Cause 2: Missing Include File**
```bash
# Symptom
Liquid Exception: Liquid error: included file '_includes/missing.html' not found

# Solution
# Find what's trying to include it
grep -r "{% include missing.html" .

# Fix: Either create the file or remove the include
```

**Cause 3: SCSS Import Error**
```bash
# Symptom
Sass error: File to import not found or unreadable: custom/missing

# Solution
# Check main.scss imports
cat assets/css/main.scss

# Fix: Remove or correct the import path
```

#### Quick Fix

```bash
# Revert last commit
git reset --hard HEAD~1
bundle exec jekyll build

# If works: Last commit broke it
# Restore commit and fix incrementally
git reset --hard HEAD@{1}
```

#### Prevention

- Test build after every change
- Commit frequently with clear messages
- Keep backups of working state
- Use linter for YAML and SCSS

---

### 2. SCSS Compilation Errors

**Symptoms:**
- SCSS files won't compile
- CSS output missing or incomplete
- Sass error messages

#### Diagnostic Steps

```bash
# 1. Check SCSS syntax
bundle exec sass-convert --check _sass/problematic.scss

# 2. Test individual file
sass _sass/problematic.scss test-output.css

# 3. Check import order
cat assets/css/main.scss

# 4. Validate variable definitions
grep -r "\$undefined-variable" _sass/
```

#### Common Causes & Solutions

**Cause 1: Variable Used Before Definition**
```scss
// WRONG
.class {
  color: $primary-color; // Used here
}

$primary-color: #333; // Defined here

// RIGHT
$primary-color: #333; // Define first

.class {
  color: $primary-color; // Use after
}
```

**Cause 2: Import Order Wrong**
```scss
// WRONG in main.scss
@import "custom/components"; // Uses variables
@import "custom/variables"; // Defines variables

// RIGHT in main.scss
@import "custom/variables"; // Define variables first
@import "custom/components"; // Use variables after
```

**Cause 3: Duplicate Variable Definitions**
```bash
# Find duplicate definitions
grep -r "^\$variable-name:" _sass/

# Solution: Keep one, remove others
```

#### Quick Fix

```bash
# Revert SCSS changes
git checkout HEAD -- _sass/ assets/css/main.scss
bundle exec jekyll build
```

---

### 3. GitHub Pages Deployment Fails

**Symptoms:**
- Push to master doesn't trigger deployment
- GitHub Actions workflow fails
- Site shows old version

#### Diagnostic Steps

```bash
# 1. Check GitHub Actions tab
# Go to repo → Actions → Check latest workflow run

# 2. Check Pages settings
# Go to repo → Settings → Pages

# 3. Check _config.yml
cat _config.yml | grep -E "(baseurl|url|remote_theme)"

# 4. Check for GitHub Pages incompatible plugins
cat Gemfile | grep gem
```

#### Common Causes & Solutions

**Cause 1: Incompatible Plugin**
```ruby
# Gemfile has non-GitHub-Pages plugin
gem "jekyll-some-incompatible-plugin"

# Solution: Check GitHub Pages dependencies
# https://pages.github.com/versions/
# Remove or replace incompatible plugins
```

**Cause 2: Build Command Issues**
```yaml
# .github/workflows/jekyll.yml
# Wrong build command

# Solution: Use correct command
- name: Build
  run: bundle exec jekyll build --baseurl "/repository-name"
```

**Cause 3: Theme Fork Not Complete**
```bash
# After forking theme, forgot to remove theme gem

# Solution
# Remove from Gemfile:
gem "minimal-mistakes-jekyll"

# Remove from _config.yml:
remote_theme: "mmistakes/minimal-mistakes"
```

#### Quick Fix

```bash
# Deploy to Vercel instead temporarily
git push

# Fix GitHub Pages in parallel
# Then switch back when ready
```

---

### 4. Vercel Deployment Fails

**Symptoms:**
- Build fails on Vercel
- Deploy succeeds but site broken
- 500 errors on Vercel

#### Diagnostic Steps

```bash
# 1. Check Vercel build logs
# Go to Vercel dashboard → Project → Latest deployment → Build logs

# 2. Test build command locally
JEKYLL_ENV=production bundle exec jekyll build --baseurl ''

# 3. Check vercel.json
cat vercel.json

# 4. Check environment variables
# Vercel dashboard → Project → Settings → Environment Variables
```

#### Common Causes & Solutions

**Cause 1: Encoding Issues**
```json
// vercel.json missing encoding vars

{
  "buildCommand": "LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 bundle exec jekyll build --baseurl ''",
  // ...
}
```

**Cause 2: Build Command Changed**
```bash
# Check vercel.json build command matches local

# Local test
JEKYLL_ENV=production LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 bundle exec jekyll build --baseurl ''

# Should match vercel.json buildCommand
```

**Cause 3: Missing Environment Variables**
```bash
# Vercel needs JEKYLL_ENV=production

# Solution: Add to Vercel environment variables
JEKYLL_ENV=production
```

#### Quick Fix

```bash
# Redeploy from known working commit
git log --oneline -10  # Find working commit
git reset --hard <working-commit-hash>
git push --force
```

---

### 5. Encoding Errors

**Symptoms:**
- Special characters display as � or �
- UTF-8 encoding errors
- Build fails with encoding errors

#### Diagnostic Steps

```bash
# 1. Check file encoding
file _posts/*.md

# 2. Check locale
locale

# 3. Check for problematic characters
grep -P "[^\x00-\x7F]" _posts/*.md
```

#### Solutions

```bash
# Solution 1: Set locale environment variables
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
bundle exec jekyll build

# Solution 2: Add to Gemfile
# encoding: utf-8

# Solution 3: Convert files to UTF-8
iconv -f ISO-8859-1 -t UTF-8 input.md > output.md

# Solution 4: Update vercel.json (already done)
# buildCommand includes LANG and LC_ALL
```

---

## Dependency Issues

### 6. Bundle Install Fails

**Symptoms:**
- `bundle install` errors
- Gem dependency conflicts
- Native extension build failures

#### Diagnostic Steps

```bash
# 1. Check Ruby version
ruby --version  # Should be 3.4.4

# 2. Check bundle version
bundle --version

# 3. Try clean install
rm -rf vendor/bundle Gemfile.lock
bundle install

# 4. Check for native extension errors
bundle install --verbose
```

#### Common Causes & Solutions

**Cause 1: Wrong Ruby Version**
```bash
# Solution: Install correct Ruby version
rbenv install 3.4.4
rbenv local 3.4.4
bundle install
```

**Cause 2: Gemfile.lock Conflicts**
```bash
# Solution: Regenerate lock file
rm Gemfile.lock
bundle install
```

**Cause 3: Native Extension Fails**
```bash
# Common for nokogiri, ffi, etc.

# Solution: Install build tools
# Mac:
xcode-select --install

# Linux:
sudo apt-get install build-essential

# Then retry
bundle install
```

---

### 7. NPM Install Fails

**Symptoms:**
- `npm install` errors
- Package conflicts
- Peer dependency warnings

#### Solutions

```bash
# Solution 1: Clean install
rm -rf node_modules package-lock.json
npm install

# Solution 2: Use specific npm version
nvm install 16
nvm use 16
npm install

# Solution 3: Skip peer dependency checks (if needed)
npm install --legacy-peer-deps

# Solution 4: Check for package conflicts
npm ls
```

---

### 8. Dependency Removal Breaks Build

**Symptoms:**
- Removed gem/package, now build fails
- Missing Liquid filters or tags
- Missing SCSS imports

#### Diagnostic Steps

```bash
# 1. Identify what broke
bundle exec jekyll build --verbose

# 2. Search for usage
grep -r "problematic-filter" .

# 3. Check theme dependencies
# Does theme provide the removed dependency?
```

#### Solutions

```bash
# Solution 1: Restore dependency
git checkout HEAD~1 -- Gemfile
bundle install
bundle exec jekyll build

# Solution 2: Find alternative
# Replace removed functionality with equivalent

# Solution 3: Remove usages
# If dependency truly unused, remove all references
```

#### Prevention

**ALWAYS test after removing each dependency:**
```bash
# For each dependency removal:
1. Remove from Gemfile/package.json
2. bundle install OR npm install
3. bundle exec jekyll build
4. npm run test:all
5. If pass: commit
6. If fail: restore and investigate
```

---

### 9. Version Conflicts

**Symptoms:**
- Gem version conflicts
- "Dependency X needs Y but Z is installed"
- Package version mismatches

#### Solutions

```bash
# For Ruby gems
bundle update <specific-gem>
bundle install

# For npm packages
npm update <specific-package>

# Nuclear option (last resort)
rm -rf vendor/bundle node_modules Gemfile.lock package-lock.json
bundle install
npm install
```

---

## Testing Issues

### 10. Visual Regression Tests Failing

**Symptoms:**
- Pixel differences detected
- Visual diff images show changes
- Tests that passed before now fail

#### Diagnostic Steps

```bash
# 1. Check diff images
open tests/visual/diffs/

# 2. Check how much changed
# Look at diff percentage in test output

# 3. Compare baseline vs current
open tests/visual/baseline/homepage-desktop.png
open tests/visual/current/homepage-desktop.png
```

#### Decision Matrix

**Diff < 0.1% (Minor anti-aliasing differences):**
- **Action:** Accept and update baseline
- **Reason:** Browser rendering variations

**Diff 0.1-1% (Small changes):**
- **Check:** Is this intentional from SCSS changes?
  - **If YES:** Accept and update baseline
  - **If NO:** Investigate and fix

**Diff > 1% (Significant changes):**
- **Action:** STOP and investigate
- **Likely:** Bug in SCSS consolidation
- **Fix:** Revert changes and fix properly

#### Solutions

**If changes are intentional:**
```bash
# Update baseline
npm run test:visual:update-baseline

# Or manually:
cp tests/visual/current/* tests/visual/baseline/
git add tests/visual/baseline/
git commit -m "test: Update visual regression baseline after [change]"
```

**If changes are bugs:**
```bash
# Revert SCSS changes
git diff HEAD -- _sass/ assets/css/main.scss
git checkout HEAD -- _sass/ assets/css/main.scss

# Rebuild and test
bundle exec jekyll build
npm run test:visual

# When passing, fix issue properly
```

#### Common Causes

**Font Loading Timing:**
```javascript
// Solution: Wait for fonts in test
await page.waitForFunction(() => document.fonts.ready);
```

**Animation Differences:**
```javascript
// Solution: Disable animations
await page.addStyleTag({ content: '* { animation: none !important; }' });
```

**Dynamic Content:**
```javascript
// Solution: Hide timestamps
await page.evaluate(() => {
  document.querySelectorAll('.date, time').forEach(el => {
    el.style.visibility = 'hidden';
  });
});
```

---

### 11. Playwright Tests Failing

**Symptoms:**
- E2E tests fail
- Timeout errors
- Element not found errors

#### Diagnostic Steps

```bash
# 1. Run with debug mode
npx playwright test --debug

# 2. Check screenshots
open test-results/

# 3. Run specific test
npx playwright test tests/e2e/navigation.spec.js

# 4. Check if server running
curl http://localhost:4000
```

#### Common Causes & Solutions

**Cause 1: Server Not Running**
```bash
# Solution: Start server first
RUBYOPT="-W0" bundle exec jekyll serve --detach
sleep 10
npx playwright test
```

**Cause 2: Selector Changed**
```javascript
// Old selector no longer works after SCSS changes
await page.click('.old-class-name');

// Solution: Update selector
await page.click('.new-class-name');
```

**Cause 3: Timeout**
```javascript
// Solution: Increase timeout for slow pages
await page.goto('/', { timeout: 30000 });
```

---

### 12. Lighthouse Performance Drop

**Symptoms:**
- Performance score decreased
- Core Web Vitals worse
- Lighthouse tests failing

#### Diagnostic Steps

```bash
# 1. Run Lighthouse locally
npm run test:performance

# 2. Check specific metrics
# FCP, LCP, TTI, CLS

# 3. Compare to baseline
diff tests/baseline/lighthouse-homepage.json tests/reports/latest-lighthouse.json
```

#### Common Causes & Solutions

**Cause 1: CSS File Size Increased**
```bash
# Check CSS size
ls -lh _site/assets/css/main.css

# Solution: Optimize SCSS
# Remove unused styles
# Consolidate duplicates
```

**Cause 2: SCSS Processing Slower**
```bash
# Check build time
time bundle exec jekyll build --profile

# Solution: Check for circular imports
# Simplify complex selectors
```

**Cause 3: Layout Shift**
```bash
# Check CLS metric in Lighthouse

# Solution: Add explicit dimensions
img { width: 100%; height: auto; }
```

#### Acceptable Variations

**Small decreases are normal:**
- 1-2 points: Acceptable variance
- 3-5 points: Investigate but not blocking
- 5+ points: Investigate and fix

---

### 13. Tests Pass Locally But Fail in CI

**Symptoms:**
- Green locally, red in GitHub Actions
- Different results in CI

#### Diagnostic Steps

```bash
# 1. Check CI logs
# GitHub → Actions → Failed workflow → Logs

# 2. Compare environments
echo "Local Node: $(node --version)"
echo "Local Ruby: $(ruby --version)"
# Check CI versions in workflow file

# 3. Run tests exactly as CI does
# Copy commands from .github/workflows/
```

#### Common Causes & Solutions

**Cause 1: Different Ruby/Node Versions**
```yaml
# .github/workflows/test.yml
# Ensure versions match local

- uses: ruby/setup-ruby@v1
  with:
    ruby-version: '3.4.4'  # Match local

- uses: actions/setup-node@v3
  with:
    node-version: '16'  # Match local
```

**Cause 2: Missing Environment Variables**
```yaml
# .github/workflows/test.yml
env:
  JEKYLL_ENV: production
  LANG: en_US.UTF-8
  LC_ALL: en_US.UTF-8
```

**Cause 3: Timing Issues**
```bash
# CI is slower, increase timeouts

# playwright.config.js
timeout: 60000, // Increase for CI
```

---

## CSS and Styling Issues

### 14. CSS Output Changed Unexpectedly

**Symptoms:**
- CSS file different after SCSS consolidation
- Styles not applying as expected
- CSS diff shows unexpected changes

#### Diagnostic Steps

```bash
# 1. Compare CSS output
diff _site.backup/assets/css/main.css _site/assets/css/main.css

# 2. Check what SCSS changed
git diff HEAD~1 -- _sass/ assets/css/main.scss

# 3. Check import order
cat assets/css/main.scss

# 4. Check for variable changes
git diff HEAD~1 -- _sass/variables.scss _sass/custom/_variables.scss
```

#### Common Causes & Solutions

**Cause 1: Import Order Changed**
```scss
// Import order matters for cascading

// WRONG
@import "custom/overrides";  // Overrides won't work
@import "minimal-mistakes";  // Base theme

// RIGHT
@import "minimal-mistakes";  // Base theme first
@import "custom/overrides";  // Overrides second
```

**Cause 2: Variable Scope Changed**
```scss
// Variables moved but references not updated

// OLD: _sass/variables.scss
$primary-color: #333;

// NEW: _sass/custom/_variables.scss
$primary-color: #333;

// But if other files still import old location:
@import "variables";  // Now missing

// Solution: Update all imports
@import "custom/variables";
```

**Cause 3: Selector Specificity Changed**
```scss
// Consolidation changed specificity

// OLD: _sass/page.scss
.page-title { color: blue; }

// NEW: _sass/custom/_overrides.scss
// Now loaded later, higher specificity
.page-title { color: blue; }

// Solution: Check cascade order
```

#### Solution Process

```bash
# 1. Identify exact difference
diff _site.backup/assets/css/main.css _site/assets/css/main.css > css-diff.txt

# 2. If intentional: Update baseline
cp _site/assets/css/main.css _site.backup/assets/css/main.css

# 3. If unintentional: Revert and fix
git checkout HEAD -- _sass/
bundle exec jekyll build
# Try consolidation again more carefully
```

---

### 15. Layout Broken on Mobile

**Symptoms:**
- Mobile layout looks wrong
- Responsive breakpoints not working
- Elements overlapping on mobile

#### Diagnostic Steps

```bash
# 1. Test locally on mobile size
# Browser dev tools → Toggle device toolbar

# 2. Check responsive SCSS
grep -r "@media" _sass/

# 3. Check viewport meta tag
grep "viewport" _includes/head.html

# 4. Run mobile visual regression
npm run test:visual -- --project=mobile-chrome
```

#### Common Causes & Solutions

**Cause 1: Breakpoint Variables Changed**
```scss
// Check breakpoint definitions
grep -r "\$medium:" _sass/
grep -r "\$large:" _sass/

// Ensure they match expected values
$medium: 768px;
$large: 1024px;
```

**Cause 2: Grid System Missing**
```scss
// Check if grid.scss was accidentally removed

// Solution: Restore or consolidate properly
git show HEAD~1:_sass/grid.scss > _sass/custom/_grid.scss
@import "custom/grid";
```

**Cause 3: Mobile-Specific Overrides Missing**
```scss
// Check for lost mobile styles
git diff HEAD~1 -- _sass/*.scss | grep -A5 "@media"
```

---

### 16. Fonts Not Loading

**Symptoms:**
- Fonts showing as fallback
- Font Awesome icons missing
- Web fonts not loading

#### Diagnostic Steps

```bash
# 1. Check browser console for 404s
# Look for failed font requests

# 2. Check font imports
grep -r "@import url" _sass/ assets/css/

# 3. Check Font Awesome
grep -r "font-awesome" Gemfile _config.yml
```

#### Common Causes & Solutions

**Cause 1: Font Awesome Gem Removed**
```ruby
# If removed font-awesome-sass gem

# Solution: Restore it (REQUIRED for profile icons)
# Gemfile
gem "font-awesome-sass", "~> 5.15"

bundle install
```

**Cause 2: Font Import Lost**
```scss
// Check main.scss for font imports
cat assets/css/main.scss | grep -i "font"

// Solution: Restore font imports
@import url('https://fonts.googleapis.com/css2?family=PT+Sans+Narrow&display=swap');
```

---

### 17. Colors Wrong After SCSS Consolidation

**Symptoms:**
- Site colors changed
- Links wrong color
- Theme colors missing

#### Diagnostic Steps

```bash
# 1. Check variable definitions
grep -r "color:" _sass/custom/

# 2. Compare to baseline
git diff HEAD~1 -- _sass/variables.scss _sass/custom/_variables.scss

# 3. Check hex codes
grep -r "#[0-9a-f]\{6\}" _sass/custom/
```

#### Solution

```bash
# Restore color variables from backup
git show HEAD~1:_sass/variables.scss | grep "color:" > /tmp/colors.txt

# Merge colors back into new structure
# Edit _sass/custom/_variables.scss
```

---

## Git and Version Control

### 18. Merge Conflicts

**Symptoms:**
- Git merge shows conflicts
- Files marked with <<<<<<< HEAD

#### Solution

```bash
# 1. Check conflict files
git status

# 2. Resolve conflicts
# Edit each conflicted file
# Remove <<<<<<, =======, >>>>>>> markers
# Keep desired content

# 3. Mark as resolved
git add <resolved-file>

# 4. Complete merge
git commit

# Or abort merge
git merge --abort
```

---

### 19. Lost Commits After Reset

**Symptoms:**
- Reset too far, lost work
- Can't find previous commits

#### Solution

```bash
# Git reflog shows all history
git reflog

# Find your lost commit
# Look for commit message or hash

# Restore it
git cherry-pick <lost-commit-hash>

# Or create new branch from it
git branch recovered-work <lost-commit-hash>
```

---

### 20. Submodule Issues

**Symptoms:**
- Submodule showing as modified
- Can't commit changes
- Submodule pointing to wrong commit

#### Diagnostic Steps

```bash
# 1. Check submodule status
git submodule status

# 2. Check what changed
cd SumedhSite/sumedhjoshi.github.io
git status
git log -1

# 3. Check parent repo
cd ../..
git diff SumedhSite/sumedhjoshi.github.io
```

#### Solutions

**Option 1: Commit Submodule Changes**
```bash
cd SumedhSite/sumedhjoshi.github.io
git add .
git commit -m "Update submodule content"
cd ../..
git add SumedhSite/sumedhjoshi.github.io
git commit -m "Update submodule pointer"
```

**Option 2: Revert Submodule Changes**
```bash
cd SumedhSite/sumedhjoshi.github.io
git reset --hard HEAD
cd ../..
git submodule update
```

**Option 3: Exclude from Refactoring**
```bash
# .gitignore
SumedhSite/

# Don't track submodule changes during refactor
```

---

## Theme Issues

### 21. Theme Fork Breaks Site

**Symptoms:**
- After forking theme, site won't build
- Missing includes
- Missing layouts

#### Diagnostic Steps

```bash
# 1. Check build error
bundle exec jekyll build --verbose

# 2. Check theme files copied
ls -R _sass/theme/
ls _layouts/
ls _includes/

# 3. Check imports updated
grep -r "@import" assets/css/main.scss
```

#### Solutions

```bash
# Solution 1: Ensure all theme files copied
# Find theme location
bundle show minimal-mistakes-jekyll

# Copy missing files
cp -r $(bundle show minimal-mistakes-jekyll)/_sass/* _sass/theme/
cp -r $(bundle show minimal-mistakes-jekyll)/_includes/* _includes/
cp -r $(bundle show minimal-mistakes-jekyll)/_layouts/* _layouts/

# Solution 2: Update imports
# assets/css/main.scss
# Change:
@import "minimal-mistakes/theme";
# To:
@import "theme/theme";

# Solution 3: Rollback fork
git checkout HEAD~1 -- _sass/ _includes/ _layouts/ assets/css/main.scss Gemfile _config.yml
bundle install
```

---

### 22. Missing Theme Includes

**Symptoms:**
- Liquid error: included file not found
- Partial not rendering

#### Solution

```bash
# 1. Find which include is missing
# Check error message

# 2. Search for it in theme
find $(bundle show minimal-mistakes-jekyll) -name "missing-file.html"

# 3. Copy to project
cp $(bundle show minimal-mistakes-jekyll)/_includes/missing-file.html _includes/

# 4. Rebuild
bundle exec jekyll build
```

---

### 23. Theme Variables Not Found

**Symptoms:**
- SCSS error: Undefined variable
- Theme variables missing

#### Solution

```scss
// 1. Find variable definition in theme
grep -r "\$missing-variable" $(bundle show minimal-mistakes-jekyll)

// 2. Copy variable definitions
// From theme's _variables.scss to your _sass/custom/_variables.scss

// 3. Ensure variables imported before usage
// main.scss
@import "minimal-mistakes/variables";  // Theme variables
@import "custom/variables";  // Custom variables
@import "custom/components";  // Usage
```

---

## Analytics and Features

### 24. Analytics Not Tracking

**Symptoms:**
- Google Analytics shows no data
- GTM not firing
- Events not tracking

#### Diagnostic Steps

```bash
# 1. Check browser console
# Look for GTM/GA errors

# 2. Check analytics include
cat _includes/_google_analytics.html

# 3. Check if included in layout
grep "google_analytics" _layouts/default.html

# 4. Check GTM container ID
grep "GTM-" _config.yml _includes/_google_analytics.html
```

#### Solutions

```bash
# Solution 1: Verify GTM container ID
# _config.yml
analytics:
  provider: "google-gtm"
  google:
    tracking_id: "GTM-TK5J8L38"  # Verify this is correct

# Solution 2: Check include is present
cat _includes/_google_analytics.html

# If missing, restore from git
git checkout HEAD~1 -- _includes/_google_analytics.html

# Solution 3: Verify include in layout
# _layouts/default.html should have:
{% include _google_analytics.html %}
```

---

### 25. Search Not Working

**Symptoms:**
- Search box doesn't work
- No results returned
- Search page blank

#### Diagnostic Steps

```bash
# 1. Check search configuration
grep -r "search" _config.yml

# 2. Check search includes
ls _includes/ | grep search

# 3. Check JavaScript
find assets/js -name "*search*"

# 4. Check browser console for errors
```

#### Solutions

```bash
# Check if search styles were lost
git diff HEAD~1 -- _sass/*.scss | grep -i "search"

# Restore search SCSS if missing
git checkout HEAD~1 -- _sass/search.scss

# Check search provider is configured
# _config.yml
search: true
search_provider: lunr
```

---

### 26. RSS Feeds Broken

**Symptoms:**
- /feed.xml returns 404
- Invalid XML
- Feed not updating

#### Diagnostic Steps

```bash
# 1. Check if feed generated
ls _site/feed.xml
ls _site/football-rss.xml

# 2. Validate XML
xmllint _site/feed.xml

# 3. Check jekyll-feed plugin
grep "jekyll-feed" Gemfile _config.yml

# 4. Check feed template
ls feed.xml football-rss.xml
```

#### Solutions

```ruby
# Solution 1: Ensure jekyll-feed installed
# Gemfile
gem "jekyll-feed"

bundle install

# Solution 2: Ensure plugin enabled
# _config.yml
plugins:
  - jekyll-feed

# Solution 3: Check feed templates exist
ls feed.xml football-rss.xml

# If missing, restore from git
git checkout HEAD~1 -- feed.xml football-rss.xml
```

---

## Issue Reporting Template

When you encounter a new issue, document it:

```markdown
## Issue: [Brief Description]

**Date:** YYYY-MM-DD
**Phase:** Phase X
**Severity:** Low/Medium/High/Critical

### Symptoms
- What you observed
- Error messages
- What doesn't work

### Context
- What you were doing
- What changed recently
- git commit hash

### Diagnostic Steps Taken
1. What you checked
2. Commands you ran
3. Results

### Solution
- What fixed it
- Why it worked
- Prevention for future

### Commands
```bash
# Exact commands used
```

### References
- Links to documentation
- Related issues
```

Add to this guide for future reference!

---

**Version:** 1.0
**Last Updated:** 2025-11-11
**Contributions:** Document solutions as you discover them
**Next Review:** After Phase 2B completion
