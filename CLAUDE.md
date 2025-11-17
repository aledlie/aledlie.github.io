# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Jekyll-based personal website ("The Parlor") built on the Minimal Mistakes theme with extensive custom styling. The site features clean, minimal academic blog aesthetics, comprehensive SEO/analytics, and is optimized for both GitHub Pages and Vercel deployment.

**Primary URL:** https://www.aledlie.com

## Build and Development Commands

### Local Development

```bash
# Install Ruby dependencies
bundle install

# Serve site locally (with Ruby warnings suppressed)
RUBYOPT="-W0" bundle exec jekyll serve
# Site will be available at http://localhost:4000

# Build for production
bundle exec jekyll build
# Output to _site/ directory
```

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

- **Jekyll Version:** 4.3 (NOT using github-pages gem - deploys to Vercel)
- **Theme:** Minimal Mistakes with "contrast" skin
- **Ruby:** 3.4.4 (requires compatibility gems: csv, logger, webrick, base64)
- **Markdown:** kramdown with rouge syntax highlighting
- **Pagination:** 8 posts per page via jekyll-paginate
- **Sass:** jekyll-sass-converter ~> 3.0 (modern Sass compiler)

### Key Directories

```
/
├── _config.yml           # Site-wide configuration (title, author, analytics, plugins)
├── _data/
│   └── navigation.yml    # Custom navigation menu structure
├── _includes/            # ~80 template components (analytics, schema, headers, pagination)
├── _layouts/             # 16 page templates (home, single, post-index, archive, collection, etc.)
├── _posts/               # Blog posts (YYYY-MM-DD-title.md format)
├── _projects/            # Projects collection
├── _reports/             # Reports collection
├── _work/                # Work-related content collection
├── _sass/                # SCSS partials (theme styling)
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
- **single.html**: Individual pages and posts - supports headers, breadcrumbs, author profile
- **post-index.html**: Blog archive (extends archive) - groups posts by year
- **archive.html**: Base archive layout - used by home and post-index
- **collection.html**: For projects, reports, and work collections

**Layout Features:**
- **Header Images:** Controlled by `header.overlay_image` and `header.teaser` in front matter
- **Breadcrumbs:** Enabled via `breadcrumbs: true` in front matter (requires site.breadcrumbs or page.breadcrumbs)
- **Author Profile:** Enabled via `author_profile: true` in front matter

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

**When editing styles:** Always test that changes don't break the carefully crafted minimal aesthetic.

### Deployment Configuration

**Primary Deployment: Vercel (vercel.json)**
- **Build Command:** `bundle exec jekyll build --baseurl ''`
- **Install Command:** `bundle install --deployment`
- **Output Directory:** `_site`
- **Environment Variables:**
  - `JEKYLL_ENV=production`
  - `LANG=en_US.UTF-8` (fixes character encoding in SCSS)
  - `LC_ALL=en_US.UTF-8`
- **Security Headers:** CSP, HSTS, X-Frame-Options, X-XSS-Protection, Referrer-Policy
- **Cache Strategy:** 1 year for static assets (CSS, JS, images)
- **URL Configuration:** Clean URLs enabled, trailing slashes enforced
- **Content-Type Headers:** Explicit UTF-8 charset for CSS and JS

**Note:** This site uses Jekyll 4.3 (not github-pages gem) for modern Sass compiler support

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

**Lighthouse (Performance):**
- Config: `.lighthouserc.js`
- Tests: Homepage, About, Posts, Projects
- Thresholds: Performance ≥85%, Accessibility ≥95%, SEO ≥95%
- Core Web Vitals monitoring (LCP, FID, CLS, FCP, TTI)

### Analytics Implementation

- **Provider:** Google Tag Manager (GTM-TK5J8L38)
- **Implementation:** `_includes/_google_analytics.html`
- **Privacy:** Anonymous IP enabled
- **Testing:** Comprehensive unit and E2E tests in `tests/analytics/`

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

- **_projects/**: Portfolio/project showcase items
- **_reports/**: Case studies and reports
- **_work/**: Work-related content and current projects

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

# Run performance tests on specific URL
# Edit .lighthouserc.js to configure URLs
npm run test:performance
```

### Testing Vercel Deployment Locally

```bash
# Set Vercel environment variables
JEKYLL_ENV=production LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 bundle exec jekyll build --baseurl ''

# Then serve the _site directory
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

1. **Ruby Warnings:** Always use `RUBYOPT="-W0"` when serving locally to suppress deprecation warnings from the theme.

2. **Character Encoding:** Vercel requires explicit UTF-8 encoding settings to handle special characters in SCSS.

3. **CSS Specificity:** Some CSS overrides use `!important` to ensure theme defaults are properly overridden. This is intentional.

4. **Performance Monitoring:** All deployments should meet Lighthouse thresholds. Check `tests/performance/results/` for detailed reports.

5. **Browser Compatibility:** Test responsive design at breakpoints: 768px (mobile), 1024px (tablet), 1200px (desktop).

6. **Analytics Privacy:** GTM implementation includes Do Not Track respect and opt-out capabilities.

## Excluded from Build

Important paths excluded in `_config.yml`:
- node_modules/
- tests/
- test_results/
- schema-org-optimizer.md
- Various config and build files

## RSS Feeds

- Main feed: `/feed.xml` (Jekyll Feed plugin)
