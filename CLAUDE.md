# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Jekyll-based personal website ("The Parlor") built on the Minimal Mistakes theme with extensive custom styling. The site features clean, minimal academic blog aesthetics, comprehensive SEO/analytics, and is deployed via GitHub Pages.

**Primary URL:** https://www.aledlie.com

**Accessibility Status:** WCAG 2.1 Level AA compliant as of 2025-11-26. All E2E accessibility tests passing with zero violations.

## Build and Development Commands

### Local Development

```bash
# Install Ruby dependencies
bundle install

# Serve site locally (with Ruby warnings suppressed)
bundle exec jekyll serve
# Or with warnings suppressed:
RUBYOPT="-W0" bundle exec jekyll serve
# Site will be available at http://localhost:4000

# Build for production
bundle exec jekyll build
# Output to _site/ directory

# Quick serve via npm script
npm run serve
```

**Build Notes:**
- Bundler 2.6.9 is required (matches Gemfile.lock)
- SCSS deprecation warnings from vendor files (Susy, Magnific Popup) are expected and can be ignored
- Custom SCSS files use modern Sass module system (sass:color, sass:meta, sass:list)
- Use `RUBYOPT="-W0"` to suppress Ruby deprecation warnings during local development

### Testing

```bash
# Install npm dependencies first
npm install

# Run all tests (requires site to be built)
npm run test:all

# Individual test suites
npm run test              # Jest unit tests
npm run test:e2e          # Playwright E2E tests (Chrome, Firefox, Safari, Mobile)
npm run test:performance  # Lighthouse performance tests

# Test in watch mode (for development)
npm run test:watch

# CI-friendly test command
npm run test:ci
```

### Linting and Formatting

```bash
# SCSS linting
npm run lint:scss
npm run "lint:scss --fix"

# SCSS formatting
npm run format:scss
```

## Architecture

### Jekyll Configuration

- **Jekyll Version:** 4.3 (Jekyll 3.10.0 via github-pages gem for GitHub Pages compatibility)
- **Theme:** minimal-mistakes-jekyll with "contrast" skin
- **Ruby:** 3.4.4 (requires compatibility gems: csv, logger, webrick, base64)
- **Markdown:** kramdown with rouge syntax highlighting
- **Pagination:** 8 posts per page via jekyll-paginate
- **Sass:** jekyll-sass-converter ~> 3.0 (modern Sass compiler)
- **Note:** The site currently uses the local theme gem, not remote_theme (temporarily disabled during refactoring)

### Accessibility Architecture

**Status:** WCAG 2.1 Level AA compliant (validated 2025-11-26)

**Key Accessibility Features:**
- Semantic HTML structure with proper heading hierarchy (H1→H2→H3)
- ARIA attributes used only on landmarks and interactive elements
- Color contrast ratios meet WCAG AA standards (4.5:1 minimum)
- Skip navigation links for keyboard users
- Proper list structures for navigation and content
- All pages have H1 headings (including overlay header pages)
- Author profile uses proper heading levels (H2 for name, H3 for sections)
- Footer links have explicit high-contrast colors

**Accessibility Files:**
- `_includes/skip-links.html` - Skip navigation implementation
- `_includes/breadcrumbs.html` - Accessible breadcrumb navigation
- `_includes/author-profile.html` - Semantic author information
- `_includes/page__hero.html` - Overlay headers with H1 support
- `_sass/_footer.scss` - Footer contrast improvements

**Testing:**
- Playwright E2E tests in `tests/e2e/accessibility.spec.js`
- Tests run on desktop and mobile viewports
- All pages tested: Homepage, About, Posts, Archive
- Keyboard navigation and focus indicator tests included

**Documentation:**
- Accessibility compliance report: `_reports/2025-11-26-accessibility-quick-wins-wcag-compliance.md`

### Schema.org Architecture

**Critical:** This site implements extensive Schema.org structured data for SEO optimization. Schema includes are modular and can be combined.

**Schema Implementation Pattern:**
- **Unified Knowledge Graph:** `_includes/unified-knowledge-graph-schema.html` - Core organization/person entity definitions used site-wide
- **Page-Specific Schema:** Included conditionally based on page type (blog posts, about pages, projects)
- **Entity Relationships:** Uses `@id` references to connect entities across pages (author, organization, citations)

**Available Schema Includes:**
- `post-schema.html` - Blog posts (BlogPosting with enhanced metadata)
- `tech-article-schema.html` - Technical articles (TechArticle)
- `analysis-article-schema.html` - Analysis pieces (AnalysisNewsArticle)
- `how-to-schema.html` - Tutorial content (HowTo)
- `about-page-schema.html` - About page (Person/ProfilePage with detailed properties)
- `organization-schema.html` - Organization entity
- `enhanced-person-schema.html` - Person entity with comprehensive properties
- `breadcrumb-schema.html` - Breadcrumb navigation
- `search-action-schema.html` - Site search functionality
- `webpage-schema.html` - Generic webpage markup

**Schema Documentation:**
- Implementation guides in `docs/schema/ENHANCED-SCHEMA-IMPLEMENTATION-GUIDE.md`
- Testing procedures in `docs/schema/SCHEMA-TESTING-VALIDATION-GUIDE.md`
- Analysis and comparisons in `docs/schema/BLOG-SCHEMA-ENHANCEMENT-ANALYSIS.md`
- Complete analysis in `docs/schema/PERSONALSITE-SCHEMA-COMPLETE-ANALYSIS.md`

**Testing Schema Changes:**
- Use Google Rich Results Test: https://search.google.com/test/rich-results
- Use Schema.org validator: https://validator.schema.org/
- Check `docs/schema/SEARCH-CONSOLE-MONITORING-GUIDE.md` for monitoring procedures

### Key Directories

```
/
├── _config.yml           # Site-wide configuration (title, author, analytics, plugins)
├── _data/
│   └── navigation.yml    # Custom navigation menu structure
├── _includes/            # ~80 template components (analytics, schema, headers, pagination)
│   ├── skip-links.html   # Accessible skip navigation (WCAG 2.4.3)
│   ├── breadcrumbs.html  # Semantic breadcrumb navigation (WCAG 1.3.1)
│   ├── author-profile.html # Author info with proper heading hierarchy
│   └── page__hero.html   # Overlay headers with H1 support
├── _layouts/             # 16 page templates (home, single, post-index, archive, collection, etc.)
├── _posts/               # Blog posts (YYYY-MM-DD-title.md format)
├── _projects/            # Projects collection
├── _reports/             # Reports collection (technical documentation)
├── _work/                # Work-related content collection
├── _sass/                # SCSS partials (theme styling)
│   ├── _footer.scss      # Footer styles with WCAG AA contrast
│   └── (other partials)
├── assets/
│   ├── css/main.scss     # HEAVILY CUSTOMIZED - Complete CSS overhaul
│   ├── js/               # JavaScript files
│   └── images/           # Profile and header images
├── tests/                # Comprehensive test suite (unit, e2e, performance, analytics)
│   ├── e2e/              # Playwright tests (accessibility, navigation, etc.)
│   ├── performance/      # Lighthouse performance tests
│   └── unit/             # Jest unit tests
├── index.html            # Homepage (uses 'home' layout for blog listing)
├── about/                # About page
├── about_me/             # About Me page
├── posts/                # Posts archive (uses 'post-index' layout)
└── SumedhSite/           # Separate site (git submodule for sumedhjoshi.github.io)
```

### Layout System Architecture

**Key Layouts:**
- **home.html**: Homepage layout (extends archive) - displays recent posts with pagination
- **single.html**: Individual pages and posts - supports headers, breadcrumbs, author profile, schema includes
- **post-index.html**: Blog archive (extends archive) - groups posts by year
- **archive.html**: Base archive layout - used by home and post-index, includes H1 fallback
- **collection.html**: For projects, reports, and work collections

**Layout Features:**
- **Header Images:** Controlled by `header.overlay_image` and `header.teaser` in front matter
- **Breadcrumbs:** Enabled via `breadcrumbs: true` in front matter (requires site.breadcrumbs or page.breadcrumbs)
- **Author Profile:** Enabled via `author_profile: true` in front matter
- **Schema.org Markup:** Automatic inclusion based on layout and page type (see Schema.org Architecture section)
- **H1 Headings:** All pages include H1 headings, including overlay header pages

**Front Matter Pattern for Pages:**
```yaml
---
layout: single
title: "Page Title"
permalink: /page-url/
author_profile: true
breadcrumbs: true
header:
  overlay_image: /images/cover-image.png
  teaser: /images/cover-image.png
---
```

**Front Matter Pattern for Blog Posts with Schema:**
```yaml
---
layout: single
title: "Article Title"
date: YYYY-MM-DD
categories: [category]
tags: [tag1, tag2]
excerpt: "Brief description for SEO"
schema_type: tech-article  # Options: tech-article, analysis-article, how-to
citations:  # Optional: for academic/analysis posts
  - title: "Reference Title"
    url: "https://example.com"
    author: "Author Name"
---
```

**Schema Type Selection:**
- Use `schema_type: tech-article` for technical tutorials
- Use `schema_type: analysis-article` for data analysis or investigative pieces
- Use `schema_type: how-to` for step-by-step guides
- Default: BlogPosting (no schema_type needed)

### Custom Styling Architecture

**Critical:** `assets/css/main.scss` contains extensive custom styling that completely transforms the Minimal Mistakes theme. This is NOT a default theme implementation.

Key customizations:
- Typography: System fonts, 16px base, 1.7 line-height
- Compact header: 100px height cover images (not full hero)
- Clean navigation: Centered, uppercase PT Sans Narrow
- Constrained content: 1200px max-width with minimal padding
- Academic profile layout in sidebar
- Custom post list styling (no blue underlined titles)
- Color scheme: Black text (#333) on white, subtle gray accents
- **Accessibility**: WCAG AA contrast ratios on all text (footer: #595959, links: #333333)

**When editing styles:** Always test that changes don't break the carefully crafted minimal aesthetic and maintain WCAG AA contrast requirements.

### Deployment Configuration

**Primary Deployment: GitHub Pages**
- **Deployment Method:** GitHub Actions workflow (`.github/workflows/jekyll.yml`)
- **Branch:** `master` (configured in workflow)
- **Build Command:** Automated via GitHub Actions
- **Output Directory:** `_site`
- **Jekyll Version:** GitHub Pages uses Jekyll 3.10.0 via github-pages gem
- **Environment:** Production builds automatically on push to master
- **Custom Domain:** https://www.aledlie.com (configured via CNAME)

**Note:** Site uses github-pages gem for deployment compatibility, though local development may use Jekyll 4.3

### Testing Infrastructure

**Jest (Unit Tests):**
- Test environment: jsdom
- Setup file: `tests/setup.js`
- Coverage: `assets/js/**/*.js` (excluding vendor)

**Playwright (E2E Tests):**
- Config: `playwright.config.js`
- Browsers: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- Auto-starts Jekyll server on port 4000
- Screenshots/videos on failure
- Base URL override: `BASE_URL` environment variable
- **Accessibility tests:** `tests/e2e/accessibility.spec.js` - validates WCAG compliance

**Lighthouse (Performance):**
- Config: `.lighthouserc.js`
- Tests: Homepage, About, Posts, Projects
- Thresholds: Performance ≥85%, Accessibility ≥95%, SEO ≥95%
- Core Web Vitals monitoring (LCP, FID, CLS, FCP, TTI)

### Analytics Implementation

- **Provider:** Google Analytics (GA4)
- **Tracking ID:** G-J7TL7PQH7S
- **Implementation Type:** google-gtag (configured in `_config.yml`)
- **Privacy:** Anonymous IP enabled for privacy compliance
- **Testing:** Comprehensive unit and E2E tests in `tests/analytics/`

### MCP Integration

**AST-Grep MCP Server:**
- Provides AST-based code analysis capabilities
- Schema.org validation and generation tools
- Duplicate code detection via MCP
- Documentation: `_reports/2025-11-16-ast-grep-mcp-*.md`

**Available MCP Tools:**
- `mcp__ast-grep__find_code` - AST-based code search
- `mcp__ast-grep__find_duplication` - Detect duplicate code patterns
- `mcp__ast-grep__validate_entity_id` - Schema.org @id validation
- Full list available via Claude Code's MCP tools

**When using MCP tools:** Prefer MCP-based duplication detection over manual analysis for consistency.

## Collections

Three custom collections with permalinks:

```yaml
collections:
  projects:
    output: true
    permalink: /:collection/:path/
  reports:
    output: true
    permalink: /:collection/:path/
  work:
    output: true
    permalink: /work/:path/
```

- **_projects/**: Portfolio/project showcase items (permanent work)
- **_reports/**: Technical case studies and analysis reports (completed investigations)
- **_work/**: Work-in-progress content, current projects, and activity summaries (ongoing work)

## Common Development Patterns

### Adding a Blog Post

1. Create file: `_posts/YYYY-MM-DD-title.md`
2. Add YAML front matter:
   ```yaml
   ---
   layout: single
   title: "Your Title"
   date: YYYY-MM-DD
   categories: [category]
   tags: [tag1, tag2]
   ---
   ```
3. Build and test locally before pushing

### Running Individual Tests

```bash
# Run specific test file
npm run test tests/unit/site-functionality.test.js

# Run E2E tests for specific browser
npx playwright test --project=chromium

# Run E2E tests with UI (helpful for debugging)
npx playwright test --ui

# Run accessibility tests specifically
npx playwright test tests/e2e/accessibility.spec.js

# Run performance tests on specific URL
# Edit .lighthouserc.js to configure URLs
npm run test:performance
```

### Testing Production Build Locally

```bash
# Build site in production mode
JEKYLL_ENV=production bundle exec jekyll build

# Serve the _site directory
cd _site && python -m http.server 8000
```

### Working with Submodules

The `SumedhSite/sumedhjoshi.github.io` is a git submodule. To update:
```bash
cd SumedhSite/sumedhjoshi.github.io
git pull origin master
cd ../..
git add SumedhSite/sumedhjoshi.github.io
git commit -m "Update Sumedh's site submodule"
```

## Important Notes

1. **Ruby Warnings:** Use `RUBYOPT="-W0"` when serving locally to suppress deprecation warnings from vendor theme files. This is already configured in the `npm run serve` script.

2. **Character Encoding:** Production builds may require UTF-8 encoding settings (`LANG=en_US.UTF-8` and `LC_ALL=en_US.UTF-8`) to handle special characters in SCSS compilation.

3. **CSS Specificity:** Some CSS overrides use `!important` to ensure theme defaults are properly overridden. This is intentional.

4. **Performance Monitoring:** All deployments should meet Lighthouse thresholds. Check `tests/performance/results/` for detailed reports.

5. **Browser Compatibility:** Test responsive design at breakpoints: 768px (mobile), 1024px (tablet), 1200px (desktop).

6. **Analytics Privacy:** GTM implementation includes Do Not Track respect and opt-out capabilities.

7. **Schema.org Validation:** Always validate schema changes using Google Rich Results Test and Schema.org validator before deploying.

8. **Visual Regression:** Run `npm run test:visual` before committing CSS changes to catch unintended visual differences.

9. **Test Suite Requirements:** All tests must pass before deployment. Run `npm run test:all` before pushing to production.

10. **Reports and Work Tracking:** Technical reports go in `_reports/` collection, while ongoing work and activity summaries go in `_work/`. Both are public-facing collections with permalinks.

11. **Liquid Template Conflicts:** When including code examples with template syntax (like `{{...}}` from Handlebars, Plop.js, or similar tools), wrap code blocks with `{% raw %}...{% endraw %}` tags to prevent Jekyll's Liquid processor from interpreting them. Example:
    ```markdown
    {% raw %}
    ```javascript
    // Code with {{template}} syntax here
    ```
    {% endraw %}
    ```

12. **Accessibility Requirements:** All HTML changes must maintain WCAG 2.1 Level AA compliance. Run `npx playwright test tests/e2e/accessibility.spec.js` to verify. Key requirements:
    - Maintain proper heading hierarchy (H1→H2→H3)
    - Use ARIA attributes only on landmarks and interactive elements
    - Ensure color contrast ratios meet 4.5:1 minimum for text
    - Keep semantic HTML structure (nav, main, aside, footer)
    - Preserve skip navigation links

## Excluded from Build

Important paths excluded in `_config.yml`:
- node_modules/
- tests/
- test_results/
- schema-org-optimizer.md
- Various config and build files

## RSS Feeds

- Main feed: `/feed.xml` (Jekyll Feed plugin)

## Utilities and Scripts

### Code Quality Tools

**Duplication Detection** (`utils/find-duplicates.sh`):
- Executable script for finding duplicate code using ast-grep MCP
- Presets: `--preset js`, `--preset scss`, `--preset all`
- Customizable similarity threshold (0.0-1.0, default: 0.8)
- Documentation: `utils/DUPLICATION-FINDER.md`

**Usage:**
```bash
# Quick JavaScript scan
./utils/find-duplicates.sh --preset js

# Custom scan with stricter matching
./utils/find-duplicates.sh --language javascript --similarity 0.9
```

**Git Activity Reports** (`_work/YYYY-MM-DD-git-activity-summary.md`):
- Automated git activity summaries with SVG visualizations
- Programming language breakdown analysis
- Tracks contributions across time periods
- Located in `_work/` collection for ongoing work tracking

### Visual Regression Testing

**Purpose:** Ensure pixel-perfect visual consistency during refactoring

**Workflow:**
```bash
# Capture baseline screenshots
npm run test:visual-baseline

# Run comparison after changes
npm run test:visual

# View diffs in tests/visual/diffs/
```

**Zero-tolerance policy:** ANY visual difference during refactoring is considered a bug.

### Baseline Performance Testing

**Statistical validation of build performance:**
```bash
# Capture new baseline
npm run test:capture-baseline

# Compare against baseline (statistical analysis)
npm run test:compare-baseline
```

**Metrics tracked:**
- Clean build time (statistical significance testing)
- Incremental build time
- CSS file size
- HTML output size
- Memory usage during build

## Refactoring Documentation

Extensive refactoring documentation exists in `docs/`:
- **Documentation Index:** `docs/README.md` - Complete documentation overview
- **Refactoring Status:** `docs/REFACTORING_STATUS.md` - Current status and progress
- **Master Guide:** `docs/refactoring/MASTER_IMPLEMENTATION_GUIDE.md` - Complete refactoring roadmap
- **Setup Guides:** `docs/setup/` - Local development setup (Doppler, build issues, Ruby compatibility)
- **Schema Guides:** `docs/schema/` - Schema.org implementation and entity analysis
- **Testing:** `docs/refactoring/TESTING-QUICKSTART.md` - Testing strategy and procedures

**When making significant changes:** Consult refactoring docs to understand existing patterns and testing requirements.

## Recent Updates (Updated: 2025-11-26)

### Accessibility Improvements (November 2025)

Comprehensive WCAG 2.1 Level AA compliance work completed:

**Quick Wins Implemented:**
- Removed positive tabindex values from skip links (WCAG 2.4.3)
- Improved color contrast ratios to WCAG AA standards (WCAG 1.4.3)
- Added H1 fallback for archive pages (WCAG 2.4.6)
- Fixed breadcrumb list structure (WCAG 1.3.1)
- Removed nested landmark roles (WCAG 1.3.1)
- Corrected heading hierarchy across site (WCAG 2.4.6)

**Final Fixes (2025-11-26):**
- Added H1 headings to overlay header pages (`_includes/page__hero.html`)
- Removed aria-label from non-landmark page-meta div (`_layouts/single.html`)
- Fixed heading hierarchy in author profile (H3→H2, H4→H3) (`_includes/author-profile.html`)
- Improved footer color contrast to WCAG AAA levels (`_sass/_footer.scss`)
- Removed improper role/aria-label from sidebar div (`_includes/sidebar.html`)

**Test Results:**
- All 7 E2E accessibility tests now passing
- Zero WCAG violations across homepage, about, posts, mobile, tablet
- Keyboard navigation and focus indicators validated

**Documentation:**
- Comprehensive compliance report: `_reports/2025-11-26-accessibility-quick-wins-wcag-compliance.md`
- Contains detailed before/after analysis, WCAG citations, implementation details

### Writing Quality Improvements (November 2025)

Applied Elements of Style principles across reports and posts:
- Eliminated passive voice constructions
- Removed unnecessary words and phrases
- Improved sentence structure and flow
- Documentation: `_reports/2025-11-23-elements-of-style-batch-improvements.md`

### SCSS Modernization (November 2025)

Migrated from deprecated SCSS functions to modern Sass module system:
- Replaced `darken()`, `lighten()` with `sass:color` functions
- Updated `percentage()` to `sass:math.div()`
- Migration script: `utils/migrate-scss-functions.sh`
- All custom SCSS now uses `@use` instead of `@import`

### Reports Collection Enhancement (November 2024-2025)

- Standardized front matter across all reports
- Added unique collection header images
- Improved visual formatting and readability
- Fixed sidebar alignment issues in reports
- Added comprehensive formatting audit documentation

---

**Last Major Update:** 2025-11-26 - Accessibility WCAG 2.1 AA compliance achieved
