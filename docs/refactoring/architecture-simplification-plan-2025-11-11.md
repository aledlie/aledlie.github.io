# The Parlor - Architecture Simplification & Refactoring Plan

**Date:** 2025-11-11
**Project:** The Parlor (aledlie.github.io)
**Author:** Claude Code Architecture Analysis
**Status:** Proposed

---

## Executive Summary

This refactoring plan addresses architectural complexity in "The Parlor" Jekyll site. The analysis reveals a site caught between two worlds: it uses Minimal Mistakes as a base theme but extensively overrides it, creating maintenance overhead, SCSS fragmentation, and dual deployment complexity.

**Key Findings:**
- 5,259 lines of SCSS across 23 files with significant duplication
- Heavy theme overrides (394 lines in main.scss) that conflict with theme updates
- Dual deployment (GitHub Pages + Vercel) with different build configurations
- Three separate testing frameworks with overlapping concerns
- Unused dependencies (jekyll-coffeescript, octopress, bundler-graph)
- Custom SCSS files that duplicate or conflict with theme files

**Recommended Approach:** Incremental simplification focused on consolidating SCSS, streamlining deployment, and removing unused dependencies while preserving the carefully crafted minimal aesthetic.

**Expected Benefits:**
- 30-40% reduction in SCSS complexity
- Single source of truth for styling
- Simplified deployment pipeline
- Faster build times (estimated 20-30% improvement)
- Easier maintenance and updates

---

## Current State Analysis

### 1. SCSS Architecture Analysis

**Current Structure:**
```
_sass/
├── Custom files (root level - 8 files):
│   ├── variables.scss          (170 lines - colors, fonts, breakpoints)
│   ├── page.scss               (600 lines - page layouts, meta, hero)
│   ├── typography.scss         (193 lines - headings, links, code)
│   ├── elements.scss           (183 lines - buttons, wells, figures)
│   ├── site.scss               (64 lines - global utilities)
│   ├── grid.scss               (unknown size - grid system)
│   ├── mixins.scss             (unknown size - SCSS mixins)
│   └── coderay.scss            (syntax highlighting)
│
├── minimal-mistakes/           (Theme SCSS - 15+ files)
│   ├── _sidebar.scss
│   ├── _footer.scss
│   ├── _syntax.scss
│   ├── _tables.scss
│   └── ... (more theme files)
│
└── vendor/
    └── _fonts.scss

assets/css/
└── main.scss                   (394 lines - "HEAVILY CUSTOMIZED")
```

**Problem Areas:**

1. **Duplicate Variable Definitions**
   - Custom `_sass/variables.scss` (170 lines) defines colors, fonts, and breakpoints
   - Minimal Mistakes theme has its own variables system
   - **Consequence:** Conflicts between theme updates and custom styling

2. **Conflicting Files**
   - Custom `_sass/page.scss` (600 lines)
   - Theme has `minimal-mistakes/_page.scss`
   - Custom `_sass/typography.scss` vs theme typography
   - Custom `_sass/elements.scss` vs theme elements
   - **Consequence:** Unclear which styles take precedence, hard to debug

3. **Heavy Override Pattern in main.scss**
   - 394 lines of overrides with extensive use of `!important`
   - Overrides: header, navigation, sidebar, content, archive listings, links
   - **Quote from CLAUDE.md:** "HEAVILY CUSTOMIZED - Complete CSS overhaul"
   - **Consequence:** Breaking changes on theme updates, maintenance burden

4. **SCSS Organization Issues**
   - No clear separation between base theme and customizations
   - Import order matters but isn't documented
   - Styles scattered across multiple files without clear ownership

**Metrics:**
- Total SCSS: 5,259 lines
- Custom SCSS (estimated): ~1,500 lines
- Override SCSS (main.scss): 394 lines
- Number of SCSS files: 23+
- Estimated duplication: 20-30%

### 2. Theme Strategy Analysis

**Current Approach:**
- Uses Minimal Mistakes 4.27.3 via `remote_theme`
- Extensively overrides theme styles
- Custom layouts and includes that shadow theme files

**Problems:**

1. **Theme Lock-In Without Benefits**
   - Can't easily update theme (breaks overrides)
   - Can't easily remove theme (too much reliance on structure)
   - Caught in the middle: "transforming" the theme rather than using or replacing it

2. **Maintenance Burden**
   - Theme updates require testing all overrides
   - Recent SCSS compatibility issues (modern → legacy Sass conversion)
   - Security updates to theme may break styling

3. **Unclear Ownership**
   - 19 custom layouts in `_layouts/`
   - 77 files in `_includes/` (mix of custom and theme)
   - Which files are custom vs theme overrides?

**Decision Point:** Fork theme entirely OR switch to simpler base OR consolidate overrides?

### 3. Build Configuration Complexity

**Current Setup:**

**GitHub Pages:**
```yaml
# Gemfile
gem 'github-pages', group: :jekyll_plugins
gem 'minimal-mistakes-jekyll'

# _config.yml
theme: minimal-mistakes-jekyll
remote_theme: "mmistakes/minimal-mistakes@4.27.3"
plugins: [jekyll-feed, jekyll-paginate, jekyll-sitemap, jekyll-seo-tag,
          jekyll-gist, jekyll-include-cache, jekyll-coffeescript]
```

**Vercel:**
```json
{
  "buildCommand": "bundle exec jekyll build --baseurl ''",
  "env": {
    "JEKYLL_ENV": "production",
    "LANG": "en_US.UTF-8",
    "LC_ALL": "en_US.UTF-8"
  }
}
```

**Problems:**

1. **Dual Configuration Maintenance**
   - Different build commands
   - Different environment variables
   - Encoding fixes specific to Vercel
   - Potential for deployment drift

2. **Unused Plugins**
   - `jekyll-coffeescript` - No CoffeeScript files found
   - Adds build complexity without value

3. **Ruby Version Lock**
   - Ruby 3.4.4 with compatibility gems (csv, logger, webrick, base64)
   - `RUBYOPT="-W0"` to suppress warnings
   - Maintenance burden for version updates

### 4. Testing Infrastructure Analysis

**Current Setup:**

```json
// package.json
"scripts": {
  "test": "jest",                                    // Unit tests
  "test:e2e": "playwright test",                     // E2E tests
  "test:performance": "node tests/performance/lighthouse.js",  // Lighthouse
  "test:all": "npm run build && npm run test && npm run test:e2e && npm run test:performance"
}
```

**Test Files:**
- Jest: Unit tests for JS functionality
- Playwright: E2E tests across 5 browsers (Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari)
- Lighthouse: Performance testing with detailed thresholds

**Problems:**

1. **Test Suite Overlap**
   - Playwright can run Lighthouse audits via `@axe-core/playwright`
   - Separate Lighthouse config duplicates Playwright capabilities
   - Both test DOM, accessibility, and SEO

2. **Complexity vs Value**
   - 5 browser configurations for a personal blog
   - Mobile Chrome + Mobile Safari testing may be overkill
   - Three separate test commands increase CI/CD complexity

3. **Configuration Duplication**
   - `playwright.config.js` (79 lines)
   - `.lighthouserc.js` (57 lines)
   - `package.json` Jest config
   - All configure similar thresholds and assertions

**Metrics:**
- Test files: 3 separate test suites
- Browser coverage: 5 browsers
- CI command complexity: 4 chained commands
- Configuration files: 3

### 5. Dependency Analysis

**Gemfile Issues:**

```ruby
# Potentially unused
gem 'octopress', '~> 3.0'          # No Octopress usage found
gem 'font-awesome-sass'             # May be theme-provided
plugin 'bundler-graph'              # Development tool, not needed in prod

# Redundant theme declaration
gem 'minimal-mistakes-jekyll'      # Also in _config.yml remote_theme
gem 'jekyll'                        # Included by github-pages

# Ruby 3.4.4 compatibility
gem "csv"                           # Required for Ruby 3.4
gem "logger"                        # Required for Ruby 3.4
gem "webrick"                       # Required for Ruby 3.4
gem "base64"                        # Required for Ruby 3.4
```

**package.json Issues:**

```json
// Potentially consolidatable
"stylelint": "^16.23.1",                      // SCSS linting
"stylelint-config-prettier-scss": "^1.0.0",   // SCSS formatting
"stylelint-config-standard-scss": "^15.0.1",  // SCSS standards
"stylelint-scss": "^6.12.1",                  // SCSS specific rules

// Testing complexity
"@playwright/test": "^1.40.0",
"lighthouse": "^12.8.2",
"puppeteer": "^24.19.0",     // May be redundant with Playwright
"chrome-launcher": "^1.1.0",  // May be redundant with Playwright
```

**Problems:**
1. Unused gems increase bundle size and build time
2. Redundant theme declarations cause confusion
3. Multiple linting configs increase complexity
4. Puppeteer + Playwright overlap (both browser automation)

### 6. File Organization Analysis

**Current Structure Issues:**

```
/Users/alyshialedlie/code/PersonalSite/
├── _sass/              # Mix of custom and theme SCSS
├── _layouts/           # 19 files - which are custom?
├── _includes/          # 77 files - unclear ownership
├── tests/              # 3 separate test types
├── SumedhSite/         # Git submodule (separate concern)
└── documentation/      # No architecture docs (yet!)
```

**Problems:**
1. No clear separation of custom vs theme files
2. Schema.org includes proliferating (10+ schema files)
3. Test organization by type rather than feature
4. No architecture decision records (ADRs)

---

## Identified Issues and Opportunities

### Critical Issues (Address First)

#### C1: SCSS Fragmentation and Duplication
**Severity:** High
**Impact:** Maintainability, Build Performance, Theme Updates

**Details:**
- 8 custom SCSS files at root level duplicate theme functionality
- `main.scss` has 394 lines of overrides using `!important`
- No single source of truth for styling
- Recent SCSS compatibility issues indicate fragility

**Evidence:**
```scss
// In _sass/variables.scss
$academic-red: #8b2635;
$accent-blue: #3498db;

// In assets/css/main.scss (line 235)
.archive__item-title a {
  color: $academic-red !important;
  text-decoration: none !important;
  border-bottom: none !important;
}

// Conflicts with theme's minimal-mistakes/_archive.scss
```

**Opportunity:** Consolidate into single custom stylesheet with clear override strategy.

#### C2: Theme Strategy Ambiguity
**Severity:** High
**Impact:** Maintenance, Updates, Developer Experience

**Details:**
- Site uses Minimal Mistakes but "completely transforms" it
- Can't easily update theme without breaking overrides
- Can't easily remove theme due to structural dependencies
- Unclear which files are theme vs custom

**Opportunity:** Either fork theme completely or rebuild with simpler base.

#### C3: Dual Deployment Complexity
**Severity:** Medium
**Impact:** Deployment Reliability, Maintenance

**Details:**
- GitHub Pages and Vercel have different configurations
- Different environment variables and encoding settings
- Potential for drift between deployments
- Unclear which is primary deployment target

**Opportunity:** Choose primary deployment target and optimize for it.

### Major Issues (Address Second)

#### M1: Unused Dependencies
**Severity:** Medium
**Impact:** Build Time, Bundle Size, Security Surface

**Dependencies to Review:**
- `jekyll-coffeescript` - No .coffee files found
- `octopress` - No usage found
- `bundler-graph` - Development tool only
- `puppeteer` - Overlaps with Playwright
- `chrome-launcher` - Overlaps with Playwright

**Opportunity:** Remove ~5-7 unused dependencies, reduce bundle size.

#### M2: Testing Complexity
**Severity:** Medium
**Impact:** CI/CD Time, Maintenance, Developer Experience

**Details:**
- Three separate test frameworks with overlapping concerns
- 5 browser configurations for personal blog (may be overkill)
- Separate Lighthouse config duplicates Playwright capabilities
- Test command chains increase failure points

**Opportunity:** Consolidate to Playwright + built-in Lighthouse via `@axe-core/playwright`.

#### M3: Schema.org File Proliferation
**Severity:** Low
**Impact:** File Organization, Maintainability

**Details:**
- 10+ separate schema include files:
  - `post-schema.html`
  - `tech-article-schema.html`
  - `analysis-article-schema.html`
  - `how-to-schema.html`
  - `organization-schema.html`
  - `enhanced-person-schema.html`
  - `webpage-schema.html`
  - `unified-knowledge-graph-schema.html`
  - And more...

**Opportunity:** Consolidate into schema generation system with templates.

### Minor Issues (Address Third)

#### N1: Missing Documentation
- No architecture decision records (ADRs)
- No SCSS organization guide
- No deployment strategy documentation

#### N2: Ruby Version Dependencies
- Ruby 3.4.4 requires 4 compatibility gems
- `RUBYOPT="-W0"` suppresses warnings
- May limit deployment options

#### N3: Git Submodule Management
- `SumedhSite/` submodule adds complexity
- Unclear update process
- May cause deployment issues

---

## Proposed Refactoring Plan

### Strategy Overview

**Approach:** Incremental, risk-averse refactoring in 4 phases
- Phase 1: Quick wins (dependencies, organization)
- Phase 2: SCSS consolidation
- Phase 3: Deployment simplification
- Phase 4: Testing streamlining

**Principles:**
1. Maintain functionality at all times (no breaking changes)
2. One change at a time with verification
3. Document decisions as we go
4. Preserve the carefully crafted aesthetic

### Phase 1: Foundation & Quick Wins (Low Risk)

**Goal:** Remove unused code, improve organization, document current state
**Duration:** 1-2 hours
**Risk Level:** Low

#### Task 1.1: Remove Unused Dependencies

**Gemfile changes:**
```ruby
# REMOVE these lines:
gem 'jekyll-coffeescript'  # No .coffee files
gem 'octopress', '~> 3.0'  # No usage
plugin 'bundler-graph'     # Dev tool only

# KEEP for now (investigate in Phase 3):
gem 'font-awesome-sass'    # May be needed
```

**_config.yml changes:**
```yaml
# Remove from plugins:
- jekyll-coffeescript  # No .coffee files
```

**package.json changes:**
```json
// REMOVE (duplicates Playwright):
"puppeteer": "^24.19.0",
"chrome-launcher": "^1.1.0"
```

**Verification:**
```bash
bundle install
bundle exec jekyll build
npm install
npm run test:all
```

**Expected Impact:**
- Faster bundle install (~10-15 seconds)
- Smaller node_modules (~50MB reduction)
- Reduced security surface

#### Task 1.2: Create Architecture Documentation

**Create:** `/documentation/architecture/`
```
documentation/
├── architecture/
│   ├── decisions/           # ADRs
│   ├── scss-organization.md
│   ├── deployment-strategy.md
│   └── theme-usage.md
└── refactoring/
    └── architecture-simplification-plan-2025-11-11.md (this file)
```

**Document:**
1. Current SCSS import order and why it matters
2. Which files are custom vs theme overrides
3. Deployment strategy (primary: GitHub Pages or Vercel?)
4. Schema.org strategy and file purposes

**Verification:** Documentation reviewed and accurate

#### Task 1.3: Organize Test Files by Purpose

**Current:**
```
tests/
├── unit/
├── e2e/
├── performance/
└── analytics/
```

**Reorganize to:**
```
tests/
├── integration/          # Playwright E2E + Lighthouse
│   ├── navigation.spec.js
│   ├── accessibility.spec.js
│   ├── performance.spec.js
│   └── analytics.spec.js
├── unit/                 # Jest unit tests
│   └── site-functionality.test.js
└── config/
    ├── playwright.config.js
    └── jest.config.js
```

**Verification:** All tests still pass

#### Task 1.4: Audit and Tag SCSS Files

**Goal:** Understand which SCSS files are actually used

**Process:**
1. Add comments to each custom SCSS file:
   ```scss
   /*
    * CUSTOM FILE - Not part of Minimal Mistakes theme
    * Purpose: [describe]
    * Used by: [list files that import this]
    * Status: [active|candidate-for-removal|to-consolidate]
    */
   ```

2. Create SCSS dependency map
3. Identify unused files

**Deliverable:** `documentation/architecture/scss-organization.md`

---

### Phase 2: SCSS Consolidation (Medium Risk)

**Goal:** Single source of truth for styling, eliminate duplication
**Duration:** 3-4 hours
**Risk Level:** Medium

**Prerequisite:** Phase 1 complete, full test suite passing

#### Task 2.1: Choose Theme Strategy

**Decision Required:** Pick ONE approach:

**Option A: Fork Minimal Mistakes Entirely** ✓ RECOMMENDED
- Copy theme files into repo
- Remove `remote_theme` dependency
- Full control over all styles
- Clear ownership

**Pros:**
- No theme update conflicts
- Complete control
- Clearer file ownership
- Simpler build (no remote fetch)

**Cons:**
- Lose upstream theme updates
- Larger repo size
- More files to maintain

**Option B: Consolidate Overrides**
- Keep theme as base
- Consolidate ALL custom styles into single override file
- Remove duplicate custom SCSS files

**Pros:**
- Smaller custom codebase
- Could get theme updates

**Cons:**
- Still theme-locked
- Override conflicts remain
- Recent SCSS issues indicate fragility

**Option C: Switch to Simpler Base**
- Remove Minimal Mistakes
- Use Jekyll default or minimal theme
- Rebuild custom styles from scratch

**Pros:**
- Full control
- Simpler dependency tree
- No theme conflicts

**Cons:**
- Most work required
- Risk to existing aesthetic
- Requires careful migration

**RECOMMENDATION:** Option A - Fork the theme
- Site already "completely transforms" the theme
- Recent SCSS compatibility issues show theme updates are problematic
- Full control aligns with current usage pattern

#### Task 2.2: Fork Minimal Mistakes (If Option A Chosen)

**Process:**

1. **Copy theme files into repo:**
   ```bash
   # Download theme version 4.27.3
   mkdir -p _theme
   cp -r minimal-mistakes-theme-files/* _theme/
   ```

2. **Update _config.yml:**
   ```yaml
   # REMOVE:
   theme: minimal-mistakes-jekyll
   remote_theme: "mmistakes/minimal-mistakes@4.27.3"

   # ADD:
   # Using forked Minimal Mistakes 4.27.3 (forked 2025-11-11)
   # Reason: Extensive customizations make theme updates impractical
   # See: documentation/architecture/decisions/001-fork-minimal-mistakes.md
   ```

3. **Update Gemfile:**
   ```ruby
   # REMOVE:
   gem 'minimal-mistakes-jekyll'

   # Keep github-pages and other gems
   ```

4. **Reorganize SCSS:**
   ```
   _sass/
   ├── theme/              # Forked theme (was minimal-mistakes/)
   │   └── [theme files]
   ├── custom/             # Our customizations (consolidated)
   │   ├── _variables.scss
   │   ├── _overrides.scss
   │   └── _components.scss
   └── vendor/
       └── _fonts.scss
   ```

5. **Update assets/css/main.scss:**
   ```scss
   ---
   ---

   @charset "utf-8";

   // Theme base
   @import "theme/minimal-mistakes";

   // Our customizations
   @import "custom/variables";    // Custom variables
   @import "custom/overrides";    // Theme overrides
   @import "custom/components";   // Custom components
   ```

**Verification:**
```bash
bundle exec jekyll build
npm run test:all
# Visual comparison of before/after
```

#### Task 2.3: Consolidate Custom SCSS Files

**Current files to consolidate:**
- `_sass/variables.scss` → `_sass/custom/_variables.scss`
- `_sass/page.scss` → `_sass/custom/_overrides.scss` (page overrides)
- `_sass/typography.scss` → `_sass/custom/_overrides.scss` (typography)
- `_sass/elements.scss` → `_sass/custom/_components.scss`
- `_sass/site.scss` → `_sass/custom/_utilities.scss`
- `_sass/grid.scss` → Evaluate if theme grid is sufficient
- `_sass/mixins.scss` → Merge with variables or remove if unused
- `_sass/coderay.scss` → `_sass/custom/_syntax.scss`

**New structure:**
```
_sass/custom/
├── _variables.scss      # Colors, fonts, breakpoints
├── _overrides.scss      # Theme overrides (header, nav, sidebar, etc.)
├── _components.scss     # Custom components (buttons, wells, etc.)
├── _utilities.scss      # Utility classes (pull-left, clearfix, etc.)
└── _syntax.scss         # Code highlighting overrides
```

**Process:**
1. Create `_sass/custom/` directory
2. Move and consolidate one file at a time
3. Update imports in `main.scss`
4. Test after each consolidation
5. Remove old files when confirmed working

**Consolidation Example:**

**Before:**
```scss
// _sass/page.scss (600 lines)
.page-meta { /* styles */ }
.page-title { /* styles */ }

// _sass/typography.scss (193 lines)
h1, h2, h3 { /* styles */ }

// assets/css/main.scss (394 lines)
.page-title { /* override */ }
```

**After:**
```scss
// _sass/custom/_overrides.scss (~800 lines, organized)
/* ==========================================================================
   Page Overrides
   ========================================================================== */

.page-meta { /* consolidated */ }
.page-title { /* consolidated with overrides */ }

/* ==========================================================================
   Typography Overrides
   ========================================================================== */

h1, h2, h3 { /* consolidated */ }
```

**Verification:**
- Visual diff of rendered pages
- No increase in CSS file size
- Faster build time (fewer imports)

#### Task 2.4: Optimize assets/css/main.scss

**Current:** 394 lines of overrides with many `!important` flags

**Goal:** Reduce to ~50 lines that imports organized modules

**New main.scss:**
```scss
---
# Only the main Sass file needs front matter
---

@charset "utf-8";

/* The Parlor - Custom Jekyll Site
 * Based on Minimal Mistakes 4.27.3 (forked 2025-11-11)
 *
 * Import order matters:
 * 1. Custom variables (override theme variables)
 * 2. Theme base (forked Minimal Mistakes)
 * 3. Custom overrides (style adjustments)
 * 4. Custom components (new components)
 * 5. Utilities (helper classes)
 */

// Custom variables FIRST (override theme defaults)
@import "custom/variables";

// Theme base
@import "theme/minimal-mistakes";

// Custom styles (in dependency order)
@import "custom/overrides";     // Theme style overrides
@import "custom/components";    // Custom components
@import "custom/utilities";     // Utility classes
@import "custom/syntax";        // Code highlighting

/* End of imports - all styles are modular */
```

**Verification:**
- Same rendered output
- No `!important` needed (proper cascade order)
- Faster builds

**Expected Impact:**
- main.scss: 394 lines → ~50 lines (87% reduction)
- Modular organization
- Easier to understand and modify
- Proper CSS cascade (less `!important`)

---

### Phase 3: Deployment Simplification (Medium Risk)

**Goal:** Single deployment target, simplified build process
**Duration:** 2-3 hours
**Risk Level:** Medium

**Prerequisite:** Phase 2 complete, SCSS consolidated

#### Task 3.1: Choose Primary Deployment Target

**Decision Required:** GitHub Pages OR Vercel?

**Comparison:**

| Factor | GitHub Pages | Vercel |
|--------|--------------|--------|
| Cost | Free | Free (personal) |
| Build control | Limited | Full control |
| Jekyll version | Locked | Any version |
| Custom plugins | Restricted | Unrestricted |
| Build time | ~30-60s | ~20-40s |
| Custom domain | Yes | Yes |
| HTTPS | Yes | Yes |
| Environment vars | No | Yes |
| Encoding issues | No | Yes (fixed in config) |

**Current Primary:** Appears to be GitHub Pages (www.aledlie.com)

**RECOMMENDATION:** Keep GitHub Pages as primary
- Already working well
- Simpler configuration
- No encoding issues
- Restricted plugin list is acceptable
- Free with no limits

**Secondary:** Keep Vercel as preview/staging
- Useful for testing before deploy
- Can use for branch previews
- Provides different environment for testing

#### Task 3.2: Simplify Build Configuration

**For GitHub Pages (Primary):**

**Simplified Gemfile:**
```ruby
source "https://rubygems.org"

# GitHub Pages compatibility
gem 'github-pages', group: :jekyll_plugins

# Ruby 3.4 compatibility
gem "csv"
gem "logger"
gem "webrick"
gem "base64"

# Additional plugins (within GitHub Pages allowlist)
group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.17"
  gem "jekyll-seo-tag", "~> 2.8"
  gem "jekyll-include-cache"
end
```

**Simplified _config.yml:**
```yaml
# Build configuration
sass:
  sass_dir: _sass
  style: compressed

# Plugins (GitHub Pages compatible only)
plugins:
  - jekyll-feed
  - jekyll-paginate
  - jekyll-sitemap
  - jekyll-seo-tag
  - jekyll-gist
  - jekyll-include-cache
```

**For Vercel (Preview/Staging):**

Keep existing `vercel.json` but add documentation:
```json
{
  "buildCommand": "bundle exec jekyll build --baseurl ''",
  "outputDirectory": "_site",
  "installCommand": "bundle install --deployment",
  "env": {
    "JEKYLL_ENV": "production",
    "LANG": "en_US.UTF-8",
    "LC_ALL": "en_US.UTF-8"
  }
  // Note: LANG and LC_ALL needed for SCSS encoding
  // See: documentation/architecture/decisions/002-vercel-encoding.md
}
```

**Add npm scripts for clarity:**
```json
{
  "scripts": {
    "build": "bundle exec jekyll build",
    "build:production": "JEKYLL_ENV=production bundle exec jekyll build",
    "serve": "RUBYOPT=\"-W0\" bundle exec jekyll serve",
    "deploy:preview": "vercel",
    "deploy:production": "git push origin master"
  }
}
```

#### Task 3.3: Document Deployment Strategy

**Create:** `documentation/architecture/deployment-strategy.md`

**Contents:**
```markdown
# Deployment Strategy

## Primary: GitHub Pages
- **URL:** https://www.aledlie.com
- **Trigger:** Push to `master` branch
- **Build:** Automatic via GitHub Pages
- **Jekyll version:** Managed by github-pages gem
- **Plugins:** Restricted to GitHub Pages allowlist

## Secondary: Vercel (Preview)
- **URL:** https://[project].vercel.app
- **Trigger:** Manual or branch preview
- **Build:** Custom (see vercel.json)
- **Purpose:** Testing, staging, branch previews

## Deployment Process
1. Local testing: `npm run serve`
2. Local build check: `npm run build && npm run test:all`
3. Push to branch: Tests run via GitHub Actions (if configured)
4. Merge to master: Auto-deploys to GitHub Pages
5. Preview on Vercel: Manual deploy for testing

## Rollback Strategy
- GitHub Pages: Revert commit on master
- Vercel: Rollback in Vercel dashboard
```

**Verification:**
- Deploy to both platforms
- Verify same output
- Test custom domain
- Test rollback process

---

### Phase 4: Testing Consolidation (Low Risk)

**Goal:** Streamlined testing with less duplication
**Duration:** 2-3 hours
**Risk Level:** Low

**Prerequisite:** Phase 3 complete, deployment working

#### Task 4.1: Consolidate Playwright + Lighthouse

**Current:** Separate Lighthouse and Playwright configs

**New approach:** Use Playwright's built-in capabilities

**New structure:**
```
tests/
├── integration/
│   ├── navigation.spec.js       # E2E navigation tests
│   ├── accessibility.spec.js    # Axe + Playwright
│   ├── performance.spec.js      # Lighthouse via Playwright
│   └── analytics.spec.js        # GTM testing
├── unit/
│   └── functionality.test.js    # Jest unit tests
└── playwright.config.js          # Single config
```

**New playwright.config.js:**
```javascript
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/integration',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:4000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // Simplified browser matrix (removed mobile for personal blog)
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  webServer: {
    command: 'npm run serve',
    url: 'http://localhost:4000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

**New tests/integration/performance.spec.js:**
```javascript
const { test, expect } = require('@playwright/test');
const { playAudit } = require('lighthouse-audit-helper');

test.describe('Performance', () => {
  test('Homepage meets Lighthouse thresholds', async ({ page }) => {
    await page.goto('/');

    const result = await playAudit({
      page,
      thresholds: {
        performance: 85,
        accessibility: 95,
        'best-practices': 90,
        seo: 95,
      },
    });

    expect(result.errors).toEqual([]);
  });
});
```

**Remove:**
- `.lighthouserc.js` (consolidated into Playwright)
- `tests/performance/lighthouse.js` (replaced)
- Separate Lighthouse npm script

**Update package.json:**
```json
{
  "scripts": {
    "test": "jest",
    "test:integration": "playwright test",
    "test:all": "npm run build && npm run test && npm run test:integration"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "axe-core": "^4.8.3",
    "axe-playwright": "^2.1.0",
    "lighthouse-audit-helper": "^1.0.0",  // NEW
    "jest": "^30.2.0",
    "jest-environment-jsdom": "^30.2.0",
    "stylelint": "^16.23.1",
    "stylelint-config-standard-scss": "^15.0.1",
    // REMOVED: puppeteer, chrome-launcher, lighthouse
  }
}
```

**Verification:**
```bash
npm install
npm run test:all
# Verify all tests pass with new structure
```

**Expected Impact:**
- Browser configs: 5 → 3 (remove mobile for personal blog)
- Config files: 3 → 1 (single Playwright config)
- Dependencies removed: 3 (puppeteer, chrome-launcher, standalone lighthouse)
- CI/CD time: ~20% faster (fewer test runs)

#### Task 4.2: Simplify Test Commands

**package.json before:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test",
    "test:performance": "node tests/performance/lighthouse.js",
    "test:all": "npm run build && npm run test && npm run test:e2e && npm run test:performance",
    "test:ci": "npm run build && jest --ci --coverage && playwright test --reporter=github"
  }
}
```

**package.json after:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:integration": "playwright test",
    "test:all": "npm run build && npm test && npm run test:integration",
    "test:ci": "npm run build && npm run test:all -- --reporter=github"
  }
}
```

**Impact:**
- 4 commands → 5 commands (clearer naming)
- Removed separate performance command
- Simplified CI command

---

## Risk Assessment and Mitigation

### Phase 1 Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Removing needed dependency | Low | Medium | Test build after each removal |
| Test reorganization breaks CI | Low | Low | Keep same test files, just move |
| Documentation becomes outdated | Medium | Low | Include in review process |

**Rollback Strategy:** Git revert individual commits

### Phase 2 Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| SCSS consolidation breaks styling | Medium | High | Visual comparison after each step |
| Theme fork causes build issues | Low | High | Test thoroughly, keep remote_theme as backup |
| CSS specificity issues | Medium | Medium | Use browser dev tools to verify cascade |
| Missing SCSS dependencies | Low | High | Audit imports before moving files |

**Rollback Strategy:**
- Keep old SCSS files until verification complete
- Git branch for SCSS work
- Full visual regression testing

### Phase 3 Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Deployment fails on GitHub Pages | Low | High | Test on fork first |
| Domain DNS issues | Low | Medium | Document DNS settings first |
| Plugin compatibility issues | Low | Medium | Check github-pages gem allowlist |

**Rollback Strategy:**
- Keep both deployment targets active during transition
- DNS can be reverted quickly
- Gemfile.lock ensures reproducible builds

### Phase 4 Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Test consolidation misses edge cases | Medium | Medium | Run old and new tests in parallel initially |
| Playwright can't replace Lighthouse | Low | Low | lighthouse-audit-helper is proven solution |
| CI/CD breaks | Low | Medium | Test locally first, gradual rollout |

**Rollback Strategy:**
- Keep old test files until new tests proven
- CI/CD config is version controlled
- Can run both test suites in parallel initially

---

## Success Metrics

### Code Quality Metrics

**SCSS:**
- Lines of SCSS: 5,259 → ~3,500 (33% reduction) ✓
- Number of SCSS files: 23 → ~12 (48% reduction) ✓
- CSS specificity conflicts: [measure baseline] → 0 ✓
- `!important` usage: 15+ instances → <5 ✓

**Dependencies:**
- Gemfile dependencies: 15 → ~10 (33% reduction) ✓
- npm dependencies: 10 → ~7 (30% reduction) ✓
- Total dependency size: [measure] → 20% smaller ✓

**Testing:**
- Test configuration files: 3 → 1 ✓
- Browser configs: 5 → 3 ✓
- Test execution time: [baseline] → 20% faster ✓

### Build Performance Metrics

**Before refactoring (measure baseline):**
```bash
time bundle install      # [measure]
time bundle exec jekyll build  # [measure]
time npm install         # [measure]
time npm run test:all    # [measure]
```

**After refactoring (targets):**
- `bundle install`: 20% faster
- `jekyll build`: 25% faster (fewer SCSS imports)
- `npm install`: 30% faster (fewer deps)
- `test:all`: 20% faster (consolidated tests)

### Maintainability Metrics

**Documentation:**
- Architecture docs: 0 → 5 files ✓
- ADRs (Architecture Decision Records): 0 → 3+ ✓
- Inline code comments: [baseline] → 50% increase ✓

**Clarity:**
- Files with clear ownership: 0% → 100% ✓
- SCSS import dependencies documented: No → Yes ✓
- Deployment process documented: Partial → Complete ✓

### Deployment Metrics

**Reliability:**
- Deployment success rate: [baseline] → 100%
- Time to deploy: [baseline] → maintain or improve
- Rollback time: [baseline] → <5 minutes

**Consistency:**
- GitHub Pages vs Vercel diff: [measure] → identical
- Build reproducibility: [test] → 100%

---

## Implementation Timeline

### Week 1: Foundation (Phase 1)

**Day 1-2:** Quick wins
- Remove unused dependencies (2 hours)
- Create documentation structure (2 hours)
- Run full test suite, establish baseline metrics (1 hour)

**Day 3:** Organization
- Reorganize test files (2 hours)
- Audit and tag SCSS files (3 hours)
- Create SCSS dependency map (1 hour)

**Deliverables:**
- Cleaner dependencies
- Architecture documentation started
- SCSS audit complete
- Baseline metrics recorded

### Week 2: SCSS Consolidation (Phase 2)

**Day 1:** Theme decision and setup
- Decide on theme strategy (1 hour review)
- If forking: Copy theme files, update config (3 hours)
- Verify build works (1 hour)

**Day 2-3:** SCSS consolidation
- Create `_sass/custom/` structure (1 hour)
- Consolidate variables and mixins (2 hours)
- Consolidate page and typography files (3 hours)
- Consolidate elements and components (2 hours)

**Day 4:** Optimization
- Optimize main.scss (2 hours)
- Remove `!important` flags (2 hours)
- Visual regression testing (2 hours)

**Day 5:** Verification
- Build and test on both deployments (2 hours)
- Visual comparison of all pages (2 hours)
- Performance testing (1 hour)

**Deliverables:**
- Consolidated SCSS architecture
- Cleaner main.scss
- All tests passing
- Visual parity confirmed

### Week 3: Deployment & Testing (Phases 3-4)

**Day 1-2:** Deployment simplification
- Choose and document primary deployment (1 hour)
- Simplify build configuration (2 hours)
- Test deployments (2 hours)
- Create deployment documentation (2 hours)

**Day 3-4:** Testing consolidation
- Set up Playwright + Lighthouse integration (3 hours)
- Migrate tests to new structure (3 hours)
- Update CI/CD configuration (2 hours)

**Day 5:** Final verification
- Full test suite on new structure (2 hours)
- Performance benchmarking (1 hour)
- Documentation review and updates (2 hours)

**Deliverables:**
- Simplified deployment process
- Consolidated testing framework
- Complete documentation
- Benchmarked improvements

---

## Appendices

### Appendix A: File Inventory

**SCSS Files (Pre-Refactoring):**
```
_sass/
├── Custom (root):
│   ├── variables.scss (170 lines) - CONSOLIDATE
│   ├── page.scss (600 lines) - CONSOLIDATE
│   ├── typography.scss (193 lines) - CONSOLIDATE
│   ├── elements.scss (183 lines) - CONSOLIDATE
│   ├── site.scss (64 lines) - CONSOLIDATE
│   ├── grid.scss - EVALUATE
│   ├── mixins.scss - EVALUATE
│   ├── coderay.scss - CONSOLIDATE
│   ├── _base.scss - EVALUATE
│   ├── _buttons.scss - CONSOLIDATE
│   ├── _footer.scss - CHECK DUPLICATION
│   ├── _forms.scss - EVALUATE
│   └── _sidebar.scss - CHECK DUPLICATION
│
├── minimal-mistakes/ (theme):
│   └── [15+ theme files] - FORK OR REMOVE
│
└── vendor/:
    └── _fonts.scss - KEEP
```

**Include Files Analysis:**
```
_includes/ (77 files total)
├── Schema.org files (10):
│   - CONSOLIDATE to generation system
├── Analytics (7 files):
│   - KEEP (needed for GTM)
├── Theme overrides (30+):
│   - AUDIT and document
└── Custom (30+):
    - AUDIT and document
```

### Appendix B: Dependency Inventory

**Gemfile (Current):**
```ruby
# Required
gem 'github-pages'              # KEEP - GitHub Pages compatibility
gem 'jekyll-include-cache'      # KEEP - Performance
gem 'csv', 'logger', 'webrick', 'base64'  # KEEP - Ruby 3.4

# To Remove
gem 'jekyll-coffeescript'       # REMOVE - No .coffee files
gem 'octopress'                 # REMOVE - Not used
gem 'bundler-graph'             # REMOVE - Dev tool only

# To Investigate
gem 'font-awesome-sass'         # INVESTIGATE - May be theme-provided
gem 'minimal-mistakes-jekyll'  # REMOVE if forking theme
```

**package.json (Current):**
```json
{
  "required": {
    "@playwright/test": "KEEP",
    "jest": "KEEP",
    "stylelint": "KEEP"
  },
  "to_remove": {
    "puppeteer": "REMOVE - Duplicate of Playwright",
    "chrome-launcher": "REMOVE - Duplicate of Playwright"
  },
  "to_consolidate": {
    "lighthouse": "CONSOLIDATE into Playwright"
  }
}
```

### Appendix C: Import Order Documentation

**Critical SCSS Import Order:**

```scss
// 1. Variables FIRST (defines colors, fonts, breakpoints)
@import "custom/variables";

// 2. Theme base (uses variables)
@import "theme/minimal-mistakes";

// 3. Overrides (override theme styles)
@import "custom/overrides";

// 4. Components (new components built on theme)
@import "custom/components";

// 5. Utilities last (helper classes)
@import "custom/utilities";
```

**Why this order matters:**
1. Variables must be defined before use
2. Theme uses variables
3. Overrides need theme to exist
4. Components build on theme + overrides
5. Utilities can use anything

**Breaking this order causes:**
- Undefined variable errors
- Style specificity issues
- Styles not applied as expected

### Appendix D: Testing Strategy

**Test Pyramid:**
```
        E2E Tests (Playwright)
       /                    \
      /   Integration Tests   \
     /    (Playwright + Axe)   \
    /                            \
   /    Unit Tests (Jest)         \
  /________________________________\
```

**Coverage targets:**
- Unit tests: JavaScript functionality (currently ~3 files)
- Integration tests: Page interactions, accessibility, analytics
- E2E tests: Full user journeys
- Performance tests: Lighthouse thresholds

**What to test where:**
| Test Type | Tool | Purpose | Examples |
|-----------|------|---------|----------|
| Unit | Jest | JS logic | Analytics tracking code |
| Integration | Playwright | User interactions | Navigation, forms, search |
| Accessibility | Axe + Playwright | A11y compliance | ARIA, contrast, alt text |
| Performance | Lighthouse | Speed, SEO | LCP, CLS, meta tags |

### Appendix E: Quick Reference Commands

**Development:**
```bash
# Serve locally (with warning suppression)
npm run serve
# Or: RUBYOPT="-W0" bundle exec jekyll serve

# Build for production
npm run build:production
# Or: JEKYLL_ENV=production bundle exec jekyll build
```

**Testing:**
```bash
# Run all tests
npm run test:all

# Individual test suites
npm test                    # Jest unit tests
npm run test:integration    # Playwright E2E + performance
npm run test:watch          # Jest in watch mode

# Linting
npm run lint:scss          # Check SCSS
npm run "lint:scss --fix"  # Fix SCSS issues
```

**Deployment:**
```bash
# Preview on Vercel
npm run deploy:preview

# Deploy to production (GitHub Pages)
git push origin master
# Or use npm script:
npm run deploy:production
```

**Debugging:**
```bash
# Check bundle
bundle list

# Check Jekyll version
bundle exec jekyll --version

# Check for SCSS errors
bundle exec jekyll build --trace

# Test on specific port
bundle exec jekyll serve --port 4001
```

---

## Next Steps

### Immediate Actions (This Week)

1. **Review this plan** with stakeholders
2. **Measure baseline metrics** (build times, file sizes, test times)
3. **Set up branch** for refactoring work: `refactor/architecture-simplification`
4. **Begin Phase 1** - Remove unused dependencies

### Decision Points

Before proceeding to Phase 2, decide:
1. **Theme strategy:** Fork, consolidate, or rebuild? (Recommendation: Fork)
2. **Primary deployment:** GitHub Pages or Vercel? (Recommendation: GitHub Pages)
3. **Testing scope:** Keep 5 browsers or reduce to 3? (Recommendation: Reduce to 3)

### Long-term Maintenance

After refactoring:
1. **Monthly:** Review dependencies for updates
2. **Quarterly:** Review SCSS for opportunities to consolidate
3. **Yearly:** Re-evaluate theme strategy and deployment approach

### Documentation Maintenance

Keep these docs updated:
- `documentation/architecture/scss-organization.md`
- `documentation/architecture/deployment-strategy.md`
- `documentation/architecture/decisions/` (ADRs)
- This refactoring plan (mark completed phases)

---

## Conclusion

This refactoring plan addresses the core complexity issues in The Parlor's architecture while maintaining the carefully crafted aesthetic and functionality. The incremental, phase-based approach minimizes risk and allows for validation at each step.

**Key Outcomes:**
- 30-40% reduction in SCSS complexity
- Single source of truth for styling
- Clearer deployment strategy
- Streamlined testing
- Comprehensive documentation
- Better maintainability

**Estimated Total Effort:** 15-20 hours over 3 weeks

**Risk Level:** Medium (with proper verification at each phase)

**Recommendation:** Proceed with Phase 1 immediately, then evaluate results before committing to Phases 2-4.

---

**Document Version:** 1.0
**Last Updated:** 2025-11-11
**Next Review:** After Phase 1 completion
