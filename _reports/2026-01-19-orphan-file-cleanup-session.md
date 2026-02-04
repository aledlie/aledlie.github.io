---
layout: single
author_profile: true
classes: wide
title: "Orphan File Cleanup Session"
date: 2026-01-19
categories: [maintenance]
tags: [cleanup, jekyll, optimization]
excerpt: "Systematic identification and removal of 45 orphan files across _includes, _layouts, _sass, and assets/js directories, removing ~5,400 lines of unused code."
header:
  image: /assets/images/cover-reports.png
---

## Summary

Comprehensive cleanup session to identify and remove orphan files from the PersonalSite Jekyll repository. Used the `ARCHITECTURE-DATA-FLOWS.md` documentation as a reference to trace file usage through import chains, layout inheritance, and include statements.

**Total Impact:**
- **45 files deleted**
- **~5,400 lines removed**
- **4 commits pushed**

## Methodology

For each directory, the analysis followed this approach:

1. **List all files** in the target directory
2. **Trace usage** via grep for `@import`, `include` tags, `layout:`, or `src=` references
3. **Check inheritance chains** (layouts extend layouts, SCSS imports SCSS)
4. **Verify theme provides** - compare local files against theme gem to identify duplicates
5. **Test build** after deletion to ensure no breakage
6. **Commit and push** changes

## Detailed Results

### 1. `_includes/` - 20 files deleted (826 lines)

**Commit:** `61d4869c`

#### Superseded Schema Files (replaced by unified-knowledge-graph-schema.html)
- `organization-schema.html`
- `enhanced-person-schema.html`
- `creative-work-schema.html`
- `homepage-enhanced-schema.html`
- `projects-page-schema.html`
- `schema.html`

#### Submodule-Only Files (exist in SumedhSite's own _includes/)
- `_feed-footer.html`
- `_open-graph.html`

#### Name Mismatches
- `documents_collection.html` - theme uses `documents-collection.html` (hyphen)

#### Typos and Errors
- `sripts.html` - typo of "scripts.html"
- `search-action-schema.html` - documented but never included

#### Directory Mismatch
- `comment-providers/` (9 files) - theme uses `comments-providers/` (with 's')

---

### 2. `_layouts/` - 4 files deleted (~200 lines)

**Commit:** `7395c3c7`

| File | Reason |
|------|--------|
| `page.html` | Standalone base layout only used by SumedhSite submodule; uses deprecated includes |
| `posts.html` | Superseded by `post-index.html` with better semantic HTML |
| `splash.html` | Landing page layout with 0 content references |
| `search.html` | Search not enabled in `_config.yml` |

**Layouts Retained:** compress, default, archive, single, home, post-index, post, collection, category, tag, categories, tags, taxonomy-archive (used by Jekyll taxonomy system)

---

### 3. `_sass/` - 15 files deleted (4,173 lines)

**Commit:** `bbb6c55f`

Legacy files from old Octopress/So Simple theme that were never imported by the main site's `assets/css/main.scss`:

#### Root Partials
- `_base.scss`
- `_buttons.scss`
- `_forms.scss`
- `coderay.scss`
- `elements.scss`
- `grid.scss`
- `mixins.scss`
- `normalize.scss`
- `page.scss`
- `print.scss`
- `site.scss`
- `typography.scss`
- `utils.scss`

#### Vendor Files
- `vendor/_fonts.scss`
- `vendor/` directory removed

#### Backup Files
- `minimal-mistakes/utils.scss.backup`

**Files Retained:** `variables.scss`, `minimal-mistakes.scss`, `minimal-mistakes/*.scss` (theme overrides)

---

### 4. `assets/js/` - 6 files deleted (177 lines)

**Commit:** `b2bf2fb2`

| File | Reason |
|------|--------|
| `_main.js` | Source file, not loaded directly |
| `plugins/jquery.fitvids.js` | Already bundled in `scripts.min.js` |
| `vendor/html5shiv.min.js` | IE8 compatibility, not referenced |
| `vendor/jquery-1.9.1.min.js` | Old jQuery 1.9, site uses 3.7.1 |
| `vendor/modernizr-2.7.1.custom.min.js` | IE compatibility, not referenced |
| `vendor/respond.min.js` | IE8 media queries, not referenced |

**Files Retained:** `scripts.min.js`, `vendor/jquery-3.7.1.min.js`, `vendor/glightbox.min.js`, `email-obfuscation.js`, `csrf-protection.js`

---

### 5. `_data/` - No orphans found

Both files actively used:
- `navigation.yml` - site navigation menu
- `ui-text.yml` - localized UI labels

---

## Build Verification

Each deletion batch was verified with a successful Jekyll build:

```bash
RUBYOPT="-W0" bundle exec jekyll build
```

All builds completed successfully with no errors related to missing files.

## Files by Category

### Theme Migration Artifacts
Files left over from migrating between themes (Octopress/So Simple to Minimal Mistakes):
- 13 SCSS partials
- 1 layout (`page.html`)
- 6 JS vendor files

### Schema Consolidation Artifacts
Files superseded by the unified knowledge graph architecture:
- 6 schema includes

### Naming Convention Issues
Files with incorrect names that don't match what's actually included:
- `documents_collection.html` (underscore vs hyphen)
- `comment-providers/` (missing 's')
- `sripts.html` (typo)

### Submodule Duplicates
Files that exist in both main site and SumedhSite (submodule has its own copies):
- `_feed-footer.html`
- `_open-graph.html`

## Recommendations

1. **Update ARCHITECTURE-DATA-FLOWS.md** to remove references to deleted schema files
2. **Update CLAUDE.md** to remove `search-action-schema.html` from available schema includes list
3. **Consider periodic orphan audits** after major refactoring work
4. **Add pre-commit hook** to detect unused includes (optional)

## Git Log

```
b2bf2fb2 chore: remove orphan JavaScript files
bbb6c55f chore: remove orphan SCSS files
7395c3c7 chore: remove orphan layout files
61d4869c chore: remove orphan includes files
```

---

**Session Duration:** ~30 minutes
**Repository:** PersonalSite (aledlie.github.io)
**Branch:** master
