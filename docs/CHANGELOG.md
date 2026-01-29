# Changelog

All notable changes to this project are documented in this file.

## [2026-01-29] - Code Consolidation & Maintainability

Removed redundant config, schema guards, unused SCSS variables, and improved maintainability based on expert code review.

### Maintainability Improvements (Code Review)
- Removed unused dependencies: `octopress`, `jekyll-coffeescript` (bundle: 68 → 52 gems)
- Deleted duplicate `.stylelintrc` (kept consolidated `config/stylelintrc.json`)
- Deleted unused `config/_octopress.yml`
- Reorganized `utils/` into logical subdirectories:
  - `analysis/` - Git commit analysis scripts (9 files)
  - `plotting/` - Python visualization scripts (8 files)
  - `scripts/` - Build, migration, cleanup utilities (7 files)
- Updated Python import paths for new directory structure
- Added `npm run test:performance:clean` script for Lighthouse result cleanup
- Cleaned stale Lighthouse results (kept last 3)
- Added architecture cross-reference in CLAUDE.md
- Documented `!important` usage (110+ declarations, intentional for theme overrides)

### Documentation Updates
- Created root `README.md` with project overview and quick start
- Condensed `CLAUDE.md` from 410 → 95 lines (77% reduction)
- Updated `docs/ARCHITECTURE-DATA-FLOWS.md`:
  - Added utils/ to mermaid diagram with subdirectories
  - Updated Gemfile/package.json sections
  - Added utils/ to directory purposes table
- Added repository structure mermaid diagram
- Added directory statistics and purposes tables
- Added session telemetry report (`_reports/2026-01-29-session-telemetry-report.md`)
- Added weekly git activity report (`_reports/2026-01-29-git-activity-report.md`)

### Settings Consolidation
- Removed 6 scattered `.claude/settings.local.json` files from subdirectories
- Consolidated all Claude Code permissions to root `.claude/settings.local.json`
- Directories cleaned: `_includes/`, `_reports/`, `_posts/`, `utils/`, `docs/`, `docs/schema/`

### File Cleanup
- Removed `assets/js/scripts.min.js.bak` (orphan backup file)

### Config Cleanup (`_config.yml`)
- Removed obsolete `owner:` block (duplicates `author:` block)
- Removed disabled `pagination:` v2 block (unused)
- Removed `whitelist:` block (outdated Jekyll config)

### Schema Include Guards
- Removed redundant `{% if %}` guards from 4 schema files already dispatched via seo.html:
  - `tech-article-schema.html`
  - `analysis-article-schema.html`
  - `how-to-schema.html`
  - `software-application-schema.html`
- Single point of control now in `_includes/seo.html` dispatcher

### SCSS Cleanup (`_sass/variables.scss`)
- Removed unused Base16 color palette (`$base00` through `$base0f`)

### Python Utilities Consolidation (`utils/`)
- Refactored `plot_commits_by_hour.py` to use shared `plot_utils.py` functions
- Removed redundant `plot_bar_graph.py` backward-compat wrapper
- Merged `plot_repo_by_hour.py` + `plot_repo_by_pie.py` into single `plot_repo.py`
- Added CLI args (`--input`, `--output`, `--title`) to pie chart scripts
- Updated `mcp_server.py` to use `plot_commits_by_hour.py` directly
- Files reduced: 9 → 7 plot files (-60 lines)

### Code Reduction
- ~137 lines removed total (81 + 60 from Python consolidation)
- 9 files cleaned up

---

## [2026-01-28] - DRY Consolidation

Comprehensive codebase consolidation using DRY principles.

### SCSS Consolidation
- Consolidated category/tag list includes into parameterized `taxonomy-list.html`
- Removed redundant text color variables (`$text-dark`, `$basecolor`)
- Replaced hardcoded border colors (#ddd) with `$border-medium` variable
- Added `$link-transition` and `$hover-transition` variables
- Created `status-indicator` mixin for pass/fail/warning patterns
- Extracted magic numbers into named constants

### Code Reduction
- ~50 lines reduced through mixin and variable consolidation
- 3 files consolidated into 1 (taxonomy lists)
- Improved theming flexibility with centralized color/transition definitions

---

## [2026-01-24] - Performance & DRY Refactoring

Major performance optimizations and DRY principle implementation.

### Performance
- Optimized homepage load with WebP images and conditional loading
- Deferred Facebook Pixel loading to improve page load metrics
- Removed unused fitvids.js from scripts bundle

### DRY Refactoring
- Consolidated schema partials using shared includes (`_article-core.html`, `_author-publisher.html`)
- Replaced hardcoded breakpoints with `$large` variable
- Consolidated breadcrumbs, footer colors, and schema image patterns
- Used breakpoint variables consistently for media queries

### Cleanup
- Removed duplicate and misplaced files from assets
- Removed unused `copyright.js` from `_includes`
- Cleaned up generated artifacts and backup files
- Added video schema support

---

## [2026-01-21] - Schema & Content Fixes

### Refactoring
- Consolidated schema partials, color variables, and layout logic

### Content
- Corrected typos in posts
- Updated SigNoz optimization report

---

## [2026-01-19] - Documentation Cleanup & CI/CD Fixes

### Documentation
- Removed duplicate README_ENHANCED.md files from multiple directories
- Removed outdated SESSION_2025-11-27_PRIORITY_1_REFACTORING.md
- Moved SCHEMA-KNOWLEDGE-GRAPH-GUIDE.md from _includes to docs/schema
- Cleaned up Python cache files from utils directory
- Added weekly git activity report (Jan 11-18, 2026)
- Added IntegrityStudio.ai schema enhancement session report

### Testing
- Added unit tests for CSRF protection, email obfuscation, and collections front matter
- Skip Firefox E2E tests locally when browser not installed
- Added analytics regression tests

### CI/CD
- Fixed Lighthouse CI config path specification
- Resolved CI/CD blockers preventing successful builds
- Updated Node.js version management (.nvmrc, mise.toml)

### Site Structure
- Removed vita section from site navigation
- Consolidated Isabel Budenz capstone proposals into single file
- Updated analytics data files and visualizations

---

## [2025-12-28] - Homepage Redesign & Cover Photo Cleanup

### Homepage Changes
- Moved "The Parlor" title from cover photo overlay to H1 heading below image
- Changed homepage header from `overlay_image` to `image` type for clean cover photo
- Added "The Parlor" as H1 in `_layouts/home.html` for accessibility compliance

### Site-wide Cover Photo Changes
- Removed title overlays from all 75 pages (changed `overlay_image` to `image`)
- Cover photos now display without text overlays across entire site
- Added `width: 100%` to `.page-hero-image` CSS for full-width cover photos
- Increased `margin-bottom` from 1em to 2em for `.page-hero` and `.page-hero-overlay`
- Added `position: relative` to `.page-hero-overlay`
- Removed breadcrumbs from About and About Me pages

### Accessibility Fixes (WCAG Compliance)
- Fixed duplicate banner landmarks by changing `<header>` to `<div>` in:
  - `_includes/page__hero.html` - hero section no longer creates banner landmark
  - `_layouts/single.html` - inner header changed to `<div class="page-header">`
- Added H1 headings for pages with `image` header type:
  - `_layouts/home.html` - "The Parlor" H1
  - `_layouts/post-index.html` - page title as H1
  - `_layouts/single.html` - shows H1 for non-overlay pages
- Updated `_layouts/archive.html` condition to check for `page.header.image`

### Test Results
- All E2E accessibility tests passing
- Both Deploy and Test Suite workflows succeeded

---

## [2025-12-27] - Repository Refactoring

Major structural cleanup and consolidation.

### Image Asset Migration
- Moved all images from root `/images/` to `/assets/images/`
- Updated all references across pages, posts, reports, and work collections
- Standardized image path pattern: `/assets/images/filename.ext`

### Configuration Consolidation
- Created `config/` directory for all configuration files
- Moved: `lighthouserc.js`, `playwright.config.js`, `stylelintrc.json`, `prettierrc.json`, `audit-ci.json`, `_octopress.yml`
- Root directory now cleaner with configs centralized

### Template Cleanup
- Removed unused `_templates/` directory and duplicate template files
- Removed orphan SCSS files
- Consolidated duplicate includes

### Code Quality
- Resolved all SCSS linting warnings
- Fixed 404 page duplicate archive link
- Removed unused `dist/` from `.gitignore`
- Deleted redundant `ReadMe.md` (content in CLAUDE.md)
- Fixed duplicate H1 title on pages with overlay headers (archive layout)
- Centered Follow button in author sidebar
- Centered location text in author sidebar (switched from flexbox to block with text-align)

### Reports Collection Fixes
- Fixed image paths in 9 reports still using old `/images/` path

### CI Improvements
- Made Lighthouse CI non-blocking with `continue-on-error`
- Added xvfb virtual display for Lighthouse Chrome in CI
- Fixed accessibility job Playwright config path after config consolidation

---

## [2025-11-26] - Accessibility WCAG 2.1 AA Compliance

Comprehensive WCAG 2.1 Level AA compliance work completed.

### Quick Wins Implemented
- Removed positive tabindex values from skip links (WCAG 2.4.3)
- Improved color contrast ratios to WCAG AA standards (WCAG 1.4.3)
- Added H1 fallback for archive pages (WCAG 2.4.6)
- Fixed breadcrumb list structure (WCAG 1.3.1)
- Removed nested landmark roles (WCAG 1.3.1)
- Corrected heading hierarchy across site (WCAG 2.4.6)

### Final Fixes
- Added H1 headings to overlay header pages (`_includes/page__hero.html`)
- Removed aria-label from non-landmark page-meta div (`_layouts/single.html`)
- Fixed heading hierarchy in author profile (H3→H2, H4→H3) (`_includes/author-profile.html`)
- Improved footer color contrast to WCAG AAA levels (`_sass/_footer.scss`)
- Removed improper role/aria-label from sidebar div (`_includes/sidebar.html`)

### Test Results
- All 7 E2E accessibility tests passing
- Zero WCAG violations across homepage, about, posts, mobile, tablet
- Keyboard navigation and focus indicators validated

### Documentation
- Compliance report: `_reports/2025-11-26-accessibility-quick-wins-wcag-compliance.md`

---

## [2025-11-23] - Writing Quality Improvements

Applied Elements of Style principles across reports and posts.

### Changes
- Eliminated passive voice constructions
- Removed unnecessary words and phrases
- Improved sentence structure and flow

### Documentation
- Report: `_reports/2025-11-23-elements-of-style-batch-improvements.md`

---

## [2025-11] - SCSS Modernization

Migrated from deprecated SCSS functions to modern Sass module system.

### Changes
- Replaced `darken()`, `lighten()` with `sass:color` functions
- Updated `percentage()` to `sass:math.div()`
- All custom SCSS now uses `@use` instead of `@import`

### Tools
- Migration script: `utils/migrate-scss-functions.sh`

---

## [2025-11] - Reports Collection Enhancement

### Changes
- Standardized front matter across all reports
- Added unique collection header images
- Improved visual formatting and readability
- Fixed sidebar alignment issues in reports
- Added comprehensive formatting audit documentation
