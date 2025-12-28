# Changelog

All notable changes to this project are documented in this file.

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
