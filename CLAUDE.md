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

**Key Features:** Semantic HTML, proper heading hierarchy (H1→H2→H3), WCAG AA contrast ratios (4.5:1 minimum), skip navigation links, all pages have H1 headings.

**Testing:** `npx playwright test tests/e2e/accessibility.spec.js`

**Documentation:** `_reports/2025-11-26-accessibility-quick-wins-wcag-compliance.md`

### Schema.org Architecture

**Critical:** Extensive Schema.org structured data for SEO. Schema includes are modular and combinable.

**Key Files:**
- `unified-knowledge-graph-schema.html` - Core Person/WebSite/Blog entities
- `post-schema.html`, `tech-article-schema.html`, `analysis-article-schema.html`, `how-to-schema.html` - Article types
- Shared partials in `_includes/schema/` (`_article-core.html`, `_author-publisher.html`, etc.)

**Documentation:** `docs/schema/` - Implementation guides, testing procedures, entity analysis

**Validation:** [Google Rich Results Test](https://search.google.com/test/rich-results), [Schema.org validator](https://validator.schema.org/)

### Key Directories

```
/
├── _config.yml           # Site-wide configuration (title, author, analytics, plugins)
├── _data/
│   └── navigation.yml    # Custom navigation menu structure
├── _includes/            # Template components (analytics, schema, headers, pagination)
│   ├── skip-links.html   # Accessible skip navigation (WCAG 2.4.3)
│   ├── breadcrumbs.html  # Semantic breadcrumb navigation (disabled by default)
│   ├── author-profile.html # Author info with proper heading hierarchy
│   └── page__hero.html   # Header images with H1 support
├── _layouts/             # 13 page templates (home, single, post-index, archive, collection, etc.)
├── _posts/               # Blog posts (YYYY-MM-DD-title.md format)
├── _projects/            # Projects collection
├── _reports/             # Reports collection (technical documentation)
├── _work/                # Work-related content collection
├── _sass/                # SCSS partials (theme styling)
│   ├── variables.scss    # Color definitions, font stacks, spacing
│   └── minimal-mistakes/ # Theme overrides (footer, navigation, search, sidebar, syntax, tables)
├── assets/
│   ├── css/main.scss     # HEAVILY CUSTOMIZED - Complete CSS overhaul
│   ├── js/               # JavaScript files
│   └── images/           # ALL site images (profile, headers, covers, visualizations)
├── config/               # Consolidated configuration files
│   ├── _octopress.yml    # Octopress configuration
│   ├── audit-ci.json     # CI audit configuration
│   ├── lighthouserc.js   # Lighthouse performance config
│   ├── playwright.config.js # Playwright E2E test config
│   ├── prettierrc.json   # Prettier formatting config
│   └── stylelintrc.json  # Stylelint SCSS linting config
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
- **single.html**: Individual pages and posts - supports headers, author profile, schema includes
- **post-index.html**: Blog archive (extends archive) - groups posts by year
- **archive.html**: Base archive layout - used by home and post-index, includes H1 fallback
- **collection.html**: For projects, reports, and work collections

**Layout Features:**
- **Header Images:** Controlled by `header.image` and `header.teaser` in front matter
- **Breadcrumbs:** Disabled by default; can be enabled via `breadcrumbs: true` in front matter
- **Author Profile:** Enabled via `author_profile: true` in front matter
- **Schema.org Markup:** Automatic inclusion based on layout and page type (see Schema.org Architecture section)
- **H1 Headings:** All pages include H1 headings

**Front Matter Pattern for Pages:**
```yaml
---
layout: single
title: "Page Title"
permalink: /page-url/
author_profile: true
header:
  image: /assets/images/cover-image.png
  teaser: /assets/images/cover-image.png
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

**Jest:** Unit tests in `tests/unit/`, jsdom environment, setup in `tests/setup.js`

**Playwright:** E2E tests in `tests/e2e/`, config at `config/playwright.config.js`. Browsers: Chromium, Firefox, WebKit, Mobile. Auto-starts Jekyll on port 4000.

**Lighthouse:** Performance tests, config at `config/lighthouserc.js`. Thresholds: Performance ≥85%, Accessibility ≥95%, SEO ≥95%

### Analytics Implementation

- **Provider:** Google Tag Manager (GTM)
- **GTM Container ID:** GTM-NR4GGH5K (configured in `_config.yml` under `analytics.google_tag_manager.container_id`)
- **GA4 Tracking ID:** G-J7TL7PQH7S (configured in `_config.yml` under `analytics.google.tracking_id`)
- **Facebook Pixel:** 685721201205820 (configured in `_config.yml` under `analytics.facebook_pixel.pixel_id`)
- **Implementation:** Config-driven includes (`_google_tag_manager.html`, `_facebook_pixel.html`)
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
# Edit config/lighthouserc.js to configure URLs
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

1. **Ruby Warnings:** Use `RUBYOPT="-W0"` to suppress vendor deprecation warnings (configured in `npm run serve`).

2. **CSS Specificity:** Some overrides use `!important` intentionally to override theme defaults.

3. **Testing:** Run `npm run test:all` before pushing. All tests must pass.

4. **Accessibility:** Maintain WCAG 2.1 AA compliance. Test with `npx playwright test tests/e2e/accessibility.spec.js`.

5. **Schema Validation:** Validate schema changes with Google Rich Results Test before deploying.

6. **Liquid Conflicts:** Wrap code with `{{...}}` syntax in `{% raw %}...{% endraw %}` tags.

7. **Collections:** Reports → `_reports/`, ongoing work → `_work/`, projects → `_projects/`.

## Excluded from Build

Important paths excluded in `_config.yml`:
- node_modules/
- tests/
- test_results/
- SumedhSite/
- config/Gemfile, config/package.json
- schema-org-optimizer.md
- Various build, vendor, and cache files

**Note:** Files in `config/` (like `.js` and `.json`) are not processed by Jekyll since they lack front matter.


## Utilities and Scripts

**Duplication Detection:** `./utils/find-duplicates.sh --preset js|scss|all` - Uses ast-grep MCP

**Visual Regression:** `npm run test:visual-baseline` then `npm run test:visual` - Zero-tolerance for visual changes during refactoring

**Performance Baseline:** `npm run test:capture-baseline` and `npm run test:compare-baseline` - Statistical build performance validation

## Documentation

Project documentation exists in `docs/`:
- **Documentation Index:** `docs/README.md` - Complete documentation overview
- **Architecture:** `docs/ARCHITECTURE-DATA-FLOWS.md` - Data flows and component relationships
- **Changelog:** `docs/CHANGELOG.md` - Change history
- **Setup Guides:** `docs/setup/` - Local development setup (Doppler, build issues, Ruby compatibility)
- **Schema Guides:** `docs/schema/` - Schema.org implementation and entity analysis

**When making significant changes:** Consult architecture docs to understand existing patterns and testing requirements.

## Recent Updates

See **[docs/CHANGELOG.md](docs/CHANGELOG.md)** for detailed change history.

**Latest:** 2026-01-29 - Code consolidation (redundant config, schema guards, unused SCSS vars)

---

**Last Updated:** 2026-01-29