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

- **Theme:** Minimal Mistakes 4.27.3 with "contrast" skin
- **Ruby:** 3.4.4 (requires compatibility gems: csv, logger, webrick, base64)
- **Markdown:** kramdown with rouge syntax highlighting
- **Pagination:** 8 posts per page via jekyll-paginate

### Key Directories

```
/
├── _config.yml           # Site-wide configuration (title, author, analytics, plugins)
├── _data/
│   └── navigation.yml    # Custom navigation menu structure
├── _includes/            # Reusable template components (analytics, schema, headers)
├── _layouts/             # Page templates (home, single, archive, collection)
├── _posts/              # Blog posts (YYYY-MM-DD-title.md format)
├── _reports/            # Reports collection (output: true)
├── _sass/               # SCSS partials (theme styling)
├── assets/
│   ├── css/main.scss    # HEAVILY CUSTOMIZED - Complete CSS overhaul
│   ├── js/              # JavaScript files
│   └── images/          # Profile and header images
├── tests/               # Comprehensive test suite (unit, e2e, performance, analytics)
├── utils/               # Python utilities and shell scripts
└── SumedhSite/          # Separate site (git submodule for sumedhjoshi.github.io)
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

**GitHub Pages:**
- Auto-deploys from `master` branch
- Uses github-pages gem for compatibility
- Requires Jekyll-compatible plugins only

**Vercel (vercel.json):**
- Custom build command: `bundle exec jekyll build --baseurl ''`
- Encoding fixes: `LANG=en_US.UTF-8`, `LC_ALL=en_US.UTF-8`
- Security headers: CSP, HSTS, X-Frame-Options, etc.
- Cache headers: 1 year for static assets
- Clean URLs and trailing slashes enabled

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

Two custom collections with permalinks:

```yaml
collections:
  projects:
    output: true
    permalink: /:collection/:path/
  reports:
    output: true
    permalink: /:collection/:path/
```

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

### Running Tests Before Deploy

Always run full test suite before deployment:
```bash
npm run build && npm run test:all
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

### Testing Vercel Deployment Locally

```bash
# Set Vercel environment variables
JEKYLL_ENV=production LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 bundle exec jekyll build --baseurl ''
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
- Football RSS: `/football-rss.xml` (custom RSS for Sumedh's content)
