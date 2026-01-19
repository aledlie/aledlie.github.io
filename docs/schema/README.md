# Schema.org Documentation

**Last Updated:** 2026-01-19
**Site:** https://www.aledlie.com

This directory contains all Schema.org structured data documentation for The Parlor.

---

## Quick Start

### Which Schema Type Should I Use?

```
Is it a blog post?
  |
  +-- Technical guide/tutorial? --------> TechArticle
  |     (implementation docs, how-tos)
  |
  +-- Data analysis/expert analysis? ---> AnalysisNewsArticle
  |     (performance reports, case studies)
  |
  +-- Step-by-step instructions? -------> HowTo
  |     (numbered steps, clear outcome)
  |
  +-- Personal story/opinion? ----------> BlogPosting (default)
```

### Adding Schema to a Blog Post

Add `schema_type` to your front matter:

```yaml
---
title: "Your Post Title"
date: 2026-01-19
schema_type: TechArticle  # or AnalysisNewsArticle, HowTo
schema_dependencies: "Ruby 3.x, Jekyll 4.x"  # TechArticle only
schema_proficiency: "Intermediate"           # TechArticle only
---
```

See `IMPLEMENTATION-GUIDE.md` for complete front matter templates.

---

## Documentation Files

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **IMPLEMENTATION-GUIDE.md** | How to implement schemas | Adding/modifying schema markup |
| **TESTING-AND-MONITORING.md** | Testing and monitoring | Validating changes, checking Search Console |
| **SITE-SCHEMA-ANALYSIS.md** | Complete site analysis | Understanding current implementation |

---

## Current Schema Implementation

### Core Entities (Unified Knowledge Graph)

The site uses a unified knowledge graph with 5 core entities:

| Entity | @id | Description |
|--------|-----|-------------|
| Person | `https://www.aledlie.com#person` | Author (Alyshia Ledlie) |
| WebSite | `https://www.aledlie.com#website` | Main website |
| Blog | `https://www.aledlie.com#blog` | Blog section |
| Integrity Studios | `...#organization` | Organization entity |
| InventoryAI.io | `...#organization` | Organization entity |

### Schema Include Files

Located in `_includes/`:

**Core:**
- `unified-knowledge-graph-schema.html` - Main knowledge graph (included on all pages)
- `breadcrumb-schema.html` - Breadcrumb navigation
- `webpage-schema.html` - Generic webpage

**Content-Specific:**
- `post-schema.html` - BlogPosting (default for posts)
- `tech-article-schema.html` - TechArticle
- `analysis-article-schema.html` - AnalysisNewsArticle
- `how-to-schema.html` - HowTo

**Page-Specific:**
- `about-page-schema.html` - About/ProfilePage
- `homepage-enhanced-schema.html` - Homepage

---

## Validation Tools

### Essential Links

- **Google Rich Results Test:** https://search.google.com/test/rich-results
- **Schema.org Validator:** https://validator.schema.org/
- **JSON-LD Playground:** https://json-ld.org/playground/
- **Google Search Console:** https://search.google.com/search-console

### Quick Validation

```bash
# Build and serve locally
bundle exec jekyll serve

# View page source, find JSON-LD
# Copy to JSON-LD Playground or Rich Results Test
```

---

## Schema Types Reference

### TechArticle

Best for: Technical guides, tutorials, implementation docs

```yaml
schema_type: TechArticle
schema_dependencies: "Prerequisites needed"
schema_proficiency: "Beginner|Intermediate|Advanced"
schema_section: "Category"
schema_about: "Main subject"
```

### AnalysisNewsArticle

Best for: Performance analysis, data-driven articles, expert commentary

```yaml
schema_type: AnalysisNewsArticle
schema_about: "Subject of analysis"
schema_dateline: "Context, Date"
schema_section: "Category"
schema_backstory: "Why article was created"
```

### HowTo

Best for: Step-by-step tutorials, installation guides

```yaml
schema_type: HowTo
schema_total_time: "PT30M"  # ISO 8601 duration
schema_tools:
  - "Tool 1"
  - "Tool 2"
schema_steps:
  - name: "Step 1"
    text: "Instructions"
```

---

## Architecture

### How Schemas Are Included

```
_includes/seo.html
    |
    +-- unified-knowledge-graph-schema.html (always)
    |
    +-- page.schema_type?
    |     |
    |     +-- TechArticle -------> tech-article-schema.html
    |     +-- AnalysisNewsArticle -> analysis-article-schema.html
    |     +-- HowTo -------------> how-to-schema.html
    |     +-- (default) ---------> post-schema.html (for posts)
    |
    +-- breadcrumb-schema.html (if breadcrumbs enabled)
    +-- webpage-schema.html
```

### @id Best Practices

All entity identifiers use URL hash fragments:

```
https://www.aledlie.com#person       - Person entity
https://www.aledlie.com#website      - WebSite entity
https://www.aledlie.com#blog         - Blog entity
https://www.aledlie.com/post-url#blogposting - Individual posts
```

---

## Archived Documentation

Historical analysis and reference documents are in `archives/`:

- `blog-enhancement-analysis.md` - Original blog schema analysis
- `implementation-complete.md` - Initial implementation completion notes
- `entity-analysis/` - Page-specific entity analysis (about, blog, vita)

These are kept for reference but are not actively maintained.

---

## Resources

### External

- **Schema.org:** https://schema.org/
- **Google Structured Data:** https://developers.google.com/search/docs/appearance/structured-data
- **Momentic Marketing @id Guide:** https://momenticmarketing.com/blog/id-schema-for-seo-llms-knowledge-graphs

### Internal

- **Main CLAUDE.md:** `/CLAUDE.md` - Project overview and instructions
- **Schema includes:** `/_includes/` - Actual template files

---

## Support

If you encounter issues:

1. Validate with Rich Results Test first
2. Check `TESTING-AND-MONITORING.md` for troubleshooting
3. Review `IMPLEMENTATION-GUIDE.md` for correct usage
4. Inspect source code in `_includes/` schema files
