# Schema.org Implementation Guide

**Last Updated:** 2026-01-19
**Status:** Production
**Site:** https://www.aledlie.com

This guide covers how to implement and modify Schema.org structured data on The Parlor.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Blog Post Schemas](#blog-post-schemas)
3. [Knowledge Graph Architecture](#knowledge-graph-architecture)
4. [Schema Templates](#schema-templates)
5. [Front Matter Reference](#front-matter-reference)
6. [Advanced Usage](#advanced-usage)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Adding Schema to a Blog Post

1. Choose the appropriate schema type
2. Add `schema_type` and related fields to front matter
3. Build and validate locally
4. Deploy

```yaml
---
title: "Your Post Title"
date: 2026-01-19
layout: single
categories: [Category]
tags: [tag1, tag2]

# Choose one schema type:
schema_type: TechArticle  # For technical content
# schema_type: AnalysisNewsArticle  # For analysis/data content
# schema_type: HowTo  # For step-by-step guides
---
```

### Decision Tree

```
Is it a blog post?
|
+-- Does it explain how to implement a technology?
|   +-- YES --> TechArticle
|   +-- NO
|       |
|       +-- Does it analyze data or provide expert commentary?
|           +-- YES --> AnalysisNewsArticle
|           +-- NO
|               |
|               +-- Does it have explicit numbered steps?
|                   +-- YES --> HowTo
|                   +-- NO --> BlogPosting (default, no schema_type needed)
```

---

## Blog Post Schemas

### TechArticle Schema

**Use for:** Technical tutorials, developer guides, implementation docs, troubleshooting articles

```yaml
---
title: "Updating Jekyll in 2025"
date: 2025-07-02
layout: single
categories: [Jekyll, Web Development]
tags: [jekyll, ruby, bundler, static-site]

# Required
schema_type: TechArticle

# Recommended
schema_dependencies: "Ruby 3.x, Jekyll 4.x, Bundler 2.x"
schema_proficiency: "Intermediate"  # Beginner, Intermediate, Advanced
schema_section: "Jekyll"

# Optional
schema_about: "Jekyll Static Site Generator"
schema_keywords: [jekyll, ruby, bundler, static-site-generator]
---
```

**Properties:**
- `schema_dependencies` - Prerequisites (text string)
- `schema_proficiency` - Skill level: "Beginner", "Intermediate", "Advanced"
- `schema_section` - Technology category (fallback to `categories`)
- `schema_keywords` - Technical terms (fallback to `tags`)
- `schema_about` - Main subject

---

### AnalysisNewsArticle Schema

**Use for:** Performance analysis, data-driven investigations, expert commentary, case studies

```yaml
---
title: "Wix Performance Improvement Analysis"
date: 2025-09-02
layout: single
categories: [Web Performance]
tags: [performance, wix, optimization]

# Required
schema_type: AnalysisNewsArticle

# Recommended
schema_about: "Web Performance Optimization"
schema_dateline: "Web Development, November 2025"
schema_section: "Performance Analysis"

# Optional
schema_backstory: "Analysis based on real-world production data..."
schema_keywords: [performance, web-vitals, optimization]
---
```

**Properties:**
- `schema_about` - Subject of analysis (highly recommended)
- `schema_dateline` - Location/context and date
- `schema_section` - Category (fallback to `categories`)
- `schema_backstory` - Why/how article was created
- `schema_keywords` - Key terms (fallback to `tags`)

---

### HowTo Schema

**Use for:** Step-by-step tutorials, installation guides, procedural documentation

```yaml
---
title: "How to Deploy Jekyll to GitHub Pages"
date: 2025-11-11
layout: single
categories: [Jekyll, Deployment]
tags: [jekyll, github-pages, tutorial]

# Required
schema_type: HowTo

# Recommended
schema_total_time: "PT30M"  # ISO 8601 duration
schema_steps:
  - name: "Configure repository"
    text: "Create a new repository on GitHub. Enable GitHub Pages in Settings."
  - name: "Update _config.yml"
    text: "Set baseurl and url in your Jekyll configuration."
  - name: "Push to GitHub"
    text: "Commit changes and push to main branch."

# Optional
schema_estimated_cost: "0"
schema_cost_currency: "USD"
schema_tools:
  - "Git"
  - "Text editor"
  - "GitHub account"
schema_supplies:
  - "Jekyll site repository"
---
```

**Properties:**
- `schema_total_time` - ISO 8601 duration (PT30M = 30 min, PT1H = 1 hour)
- `schema_steps` - Array of step objects with `name` and `text`
- `schema_estimated_cost` - Cost as string
- `schema_cost_currency` - Currency code (default: USD)
- `schema_tools` - Array of tool names
- `schema_supplies` - Array of materials needed

**Step Object Format:**
```yaml
schema_steps:
  - name: "Step title"       # Required
    text: "Instructions"     # Required
    url: "/path/to/section"  # Optional
    image: "/assets/images/step1.jpg"  # Optional
```

**ISO 8601 Duration Format:**
- `PT15M` = 15 minutes
- `PT1H` = 1 hour
- `PT1H30M` = 1 hour 30 minutes
- `P1D` = 1 day

---

## Knowledge Graph Architecture

### Unified Knowledge Graph Approach

The site uses a single unified knowledge graph (`_includes/unified-knowledge-graph-schema.html`) instead of multiple fragmented schema files.

**Benefits:**
- Single source of truth for entities
- Consistent @id references across all pages
- Proper bidirectional relationships
- No duplicate entity definitions
- Easier maintenance

### Core Entities

```
Person (#person) [HUB ENTITY]
    |
    +-- owns --> WebSite (#website)
    +-- worksFor --> Organizations
    +-- mainEntityOfPage --> /about
    |
WebSite (#website)
    |
    +-- publisher/author --> Person
    +-- mainEntity --> Person
    +-- hasPart --> Blog, /about, /projects
    +-- potentialAction --> SearchAction, ReadAction
    |
Blog (#blog)
    |
    +-- author/publisher --> Person
    +-- isPartOf --> WebSite
    +-- blogPost --> [BlogPosting entities]
```

### @id Format

All entity identifiers use the format: `{canonical_url}#{entity_type}`

```
Person:          https://www.aledlie.com#person
WebSite:         https://www.aledlie.com#website
Blog:            https://www.aledlie.com#blog
BlogPosting:     https://www.aledlie.com/post-url#blogposting
Organization:    https://www.aledlie.com/organizations/name#organization
```

### Entity Reference Pattern

Instead of nesting full entity objects, use @id references:

```json
// Correct - Reference by @id
"author": {
  "@id": "https://www.aledlie.com#person"
}

// Incorrect - Duplicated nested object
"author": {
  "@type": "Person",
  "name": "Alyshia Ledlie",
  ...
}
```

---

## Schema Templates

### Include File Structure

```
_includes/
├── unified-knowledge-graph-schema.html  # Core entities (always included)
├── seo.html                             # Main SEO include (orchestrates schemas)
├── post-schema.html                     # BlogPosting (default)
├── tech-article-schema.html             # TechArticle
├── analysis-article-schema.html         # AnalysisNewsArticle
├── how-to-schema.html                   # HowTo
├── about-page-schema.html               # AboutPage/ProfilePage
├── breadcrumb-schema.html               # BreadcrumbList
├── webpage-schema.html                  # Generic WebPage
└── search-action-schema.html            # SearchAction
```

### How Schema Selection Works

In `_includes/seo.html`:

```liquid
{% comment %}Enhanced schema based on content type{% endcomment %}
{% if page.schema_type == 'TechArticle' %}
  {% include tech-article-schema.html %}
{% elsif page.schema_type == 'AnalysisNewsArticle' %}
  {% include analysis-article-schema.html %}
{% elsif page.schema_type == 'HowTo' %}
  {% include how-to-schema.html %}
{% elsif page.layout == "single" and page.date %}
  {% include post-schema.html %}
{% endif %}
```

---

## Front Matter Reference

### Complete TechArticle Example

```yaml
---
title: "Complete Guide to Jekyll Performance"
date: 2025-12-01
layout: single
author_profile: true
categories: [Jekyll, Performance]
tags: [jekyll, performance, optimization, ruby]
excerpt: "Learn how to optimize your Jekyll site for maximum performance"

# TechArticle Schema
schema_type: TechArticle
schema_dependencies: "Ruby 3.x, Jekyll 4.x, Bundler 2.x, Node.js"
schema_proficiency: "Intermediate"
schema_section: "Jekyll"
schema_about: "Jekyll Performance Optimization"
schema_keywords: [jekyll, performance, build-time, optimization]

# Optional: Entity mentions
schema_mentions:
  - name: "Jekyll"
    type: "SoftwareApplication"
    url: "https://jekyllrb.com/"
  - name: "Ruby"
    type: "ComputerLanguage"
    url: "https://www.ruby-lang.org/"
---
```

### Complete AnalysisNewsArticle Example

```yaml
---
title: "Comprehensive Performance Analysis"
date: 2025-12-01
layout: single
author_profile: true
categories: [Analysis, Performance]
tags: [performance, metrics, analysis]
excerpt: "Data-driven analysis of web performance optimization"

# AnalysisNewsArticle Schema
schema_type: AnalysisNewsArticle
schema_about: "Web Performance Optimization"
schema_dateline: "Web Development, December 2025"
schema_section: "Performance Analysis"
schema_backstory: "Analysis based on 3 months of production data"

# Optional: Multiple about topics
schema_about_extended:
  - "Web Performance"
  - "Core Web Vitals"
  - "User Experience"
---
```

### Complete HowTo Example

```yaml
---
title: "How to Set Up Jekyll on macOS"
date: 2025-12-01
layout: single
categories: [Jekyll, Tutorial]
tags: [jekyll, macos, setup, tutorial]
excerpt: "Step-by-step guide to setting up Jekyll on macOS"

# HowTo Schema
schema_type: HowTo
schema_total_time: "PT45M"
schema_estimated_cost: "0"
schema_cost_currency: "USD"

schema_tools:
  - "Terminal"
  - "Homebrew"
  - "Text Editor"

schema_supplies:
  - "macOS computer"
  - "Internet connection"

schema_steps:
  - name: "Install Homebrew"
    text: "Open Terminal and run the Homebrew installation command from brew.sh"
  - name: "Install Ruby"
    text: "Use Homebrew to install the latest version of Ruby"
  - name: "Install Jekyll"
    text: "Run gem install jekyll bundler to install Jekyll and Bundler"
  - name: "Create Site"
    text: "Run jekyll new my-site to create a new Jekyll site"
  - name: "Serve Locally"
    text: "Navigate to your site directory and run bundle exec jekyll serve"
---
```

---

## Advanced Usage

### Custom Schema Properties

Add custom properties via front matter:

```yaml
schema_custom:
  discussionUrl: "https://github.com/user/repo/discussions/123"
  citation: "https://example.com/source"
```

### Entity Mentions

Reference technologies, tools, or people:

```yaml
schema_mentions:
  - name: "Jekyll"
    type: "SoftwareApplication"
    url: "https://jekyllrb.com/"
  - name: "Moncef Belyamani"
    type: "Person"
    url: "https://www.moncefbelyamani.com/"
```

### Citations

Reference external sources:

```yaml
schema_citation:
  name: "Author Name"
  url: "https://example.com/article"
```

---

## Troubleshooting

### Schema Not Detected

**Check:**
1. Is `schema_type` spelled correctly in front matter?
2. Did Jekyll rebuild after changes?
3. Is the schema include file present in `_includes/`?
4. View page source - is JSON-LD script present?

**Fix:**
```bash
# Force rebuild
bundle exec jekyll build --verbose

# Check for Liquid errors
bundle exec jekyll serve --trace
```

### Validation Errors

**Common Causes:**
- Missing required front matter fields
- Invalid ISO 8601 duration format
- Unescaped quotes in text
- Array fields formatted incorrectly

**Fix:**
- Check YAML syntax (proper indentation, quotes)
- Use `jsonify` filter in templates
- Validate YAML with online tool

### HowTo Steps Not Showing

**Check:**
- `schema_steps` is an array in front matter
- Each step has both `name` and `text`
- YAML indentation is correct (2 spaces)

**Example correct format:**
```yaml
schema_steps:
  - name: "Step 1"
    text: "Do the first thing"
  - name: "Step 2"
    text: "Do the second thing"
```

### @id References Not Resolving

**Check:**
- @id values match exactly (case-sensitive)
- No trailing slashes mismatch
- Base URL is consistent (`https://www.aledlie.com`)

**Validation:**
Use JSON-LD Playground to expand and verify references resolve.

---

## Resources

### Schema.org Documentation

- **TechArticle:** https://schema.org/TechArticle
- **AnalysisNewsArticle:** https://schema.org/AnalysisNewsArticle
- **HowTo:** https://schema.org/HowTo
- **BlogPosting:** https://schema.org/BlogPosting
- **Person:** https://schema.org/Person

### Testing Tools

- **Rich Results Test:** https://search.google.com/test/rich-results
- **Schema Validator:** https://validator.schema.org/
- **JSON-LD Playground:** https://json-ld.org/playground/

### Internal Files

- **Schema include files:** `_includes/*.html`
- **SEO orchestration:** `_includes/seo.html`
- **Testing guide:** `docs/schema/TESTING-AND-MONITORING.md`

---

## Support

For issues:

1. Validate with Google Rich Results Test
2. Check this guide for correct usage
3. Review troubleshooting section above
4. Inspect `_includes/` schema template files
