# Enhanced Blog Post Schema Implementation Guide

**Date:** November 11, 2025
**Status:** Ready for Implementation
**For:** PersonalSite Blog Content

---

## Quick Start

### 3 New Schema Types Available

1. **TechArticle** - Technical guides and tutorials
2. **AnalysisNewsArticle** - Performance analysis and expert commentary
3. **HowTo** - Step-by-step instructional content

### How to Use

Add `schema_type` to your post's front matter:

```yaml
---
title: "Your Post Title"
date: 2025-11-11
schema_type: TechArticle  # or AnalysisNewsArticle or HowTo
# Additional schema-specific fields below
---
```

---

## TechArticle Schema

### When to Use

Use TechArticle for:
- Technical tutorials
- Developer guides
- Implementation documentation
- Troubleshooting articles
- Configuration guides
- Technology specifications

### Front Matter Template

```yaml
---
title: "Updating Jekyll in 2025"
date: 2025-07-02
layout: single
categories: [Jekyll, Web Development]
tags: [jekyll, ruby, bundler, static-site]

# Enhanced Schema
schema_type: TechArticle
schema_dependencies: "Ruby 3.x, Jekyll 4.x, Bundler 2.x"
schema_proficiency: "Intermediate"
schema_section: "Jekyll"
schema_keywords: [jekyll, ruby, bundler, static-site-generator]
schema_about: "Jekyll Static Site Generator"
---
```

### Required Fields

- `schema_type: TechArticle` - Activates TechArticle schema

### Optional Fields

- `schema_dependencies` - Prerequisites (text string)
- `schema_proficiency` - Skill level: "Beginner", "Intermediate", or "Advanced"
- `schema_section` - Technology category (fallback to `categories` if not set)
- `schema_keywords` - Array of specific technical terms (fallback to `tags` if not set)
- `schema_about` - Subject matter (creates "about" entity)

### Example: Jekyll Update Post

```yaml
---
title: "Updating Jekyll in 2025: Complete Guide"
date: 2025-07-02
layout: single
categories: [Jekyll]
tags: [jekyll, ruby, bundler, upgrade]

schema_type: TechArticle
schema_dependencies: "Ruby 3.x installed, Bundler 2.x, Git"
schema_proficiency: "Intermediate"
schema_section: "Jekyll"
schema_about: "Jekyll Static Site Generator Upgrade"
---

# Article content here...
```

---

## AnalysisNewsArticle Schema

### When to Use

Use AnalysisNewsArticle for:
- Performance analysis reports
- Data-driven investigations
- Expert technical commentary
- Benchmark comparisons
- Case studies with metrics
- Technical evaluations

### Front Matter Template

```yaml
---
title: "Wix Performance Improvement Analysis"
date: 2025-09-02
layout: single
categories: [Web Performance]
tags: [performance, wix, optimization, web-vitals]

# Enhanced Schema
schema_type: AnalysisNewsArticle
schema_about: "Web Performance Optimization"
schema_dateline: "Web Development, November 2025"
schema_section: "Performance Analysis"
schema_backstory: "Performance analysis based on real-world metrics from production site migration"
---
```

### Required Fields

- `schema_type: AnalysisNewsArticle` - Activates AnalysisNewsArticle schema

### Optional Fields

- `schema_about` - Subject of analysis (highly recommended)
- `schema_dateline` - Location/context and date (e.g., "Web Development, November 2025")
- `schema_section` - Category (fallback to `categories` if not set)
- `schema_backstory` - Brief explanation of why/how article was created
- `schema_keywords` - Array of key terms (fallback to `tags` if not set)

### Example: Wix Performance Post

```yaml
---
title: "Comprehensive Wix Performance Improvement Analysis"
date: 2025-09-02
layout: single
categories: [Web Performance]
tags: [performance, wix, core-web-vitals, optimization]

schema_type: AnalysisNewsArticle
schema_about: "Web Performance Optimization"
schema_dateline: "Web Development, November 2025"
schema_backstory: "Performance analysis based on 3 months of production data following Wix platform migration"
schema_section: "Performance Analysis"
---

# Article content here...
```

---

## HowTo Schema

### When to Use

Use HowTo for:
- Step-by-step tutorials
- Installation instructions
- Configuration guides with explicit steps
- Procedural documentation
- "How to" guides with clear numbered steps

### Front Matter Template

```yaml
---
title: "How to Deploy Jekyll to GitHub Pages"
date: 2025-11-11
layout: single
categories: [Jekyll, Deployment]
tags: [jekyll, github-pages, deployment, tutorial]

# Enhanced Schema
schema_type: HowTo
schema_total_time: "PT30M"  # 30 minutes in ISO 8601 duration format
schema_estimated_cost: "0"
schema_cost_currency: "USD"
schema_tools:
  - "Git"
  - "Text editor"
  - "GitHub account"
schema_supplies:
  - "Jekyll site repository"
  - "GitHub Pages enabled repo"
schema_steps:
  - name: "Step 1: Configure repository"
    text: "Create a new repository on GitHub or use existing one. Enable GitHub Pages in Settings."
  - name: "Step 2: Update _config.yml"
    text: "Set baseurl and url in your Jekyll configuration to match GitHub Pages URL"
  - name: "Step 3: Push to GitHub"
    text: "Commit your changes and push to the main branch. GitHub Actions will build automatically."
  - name: "Step 4: Verify deployment"
    text: "Visit your GitHub Pages URL to confirm the site is live"
---
```

### Required Fields

- `schema_type: HowTo` - Activates HowTo schema
- `schema_steps` - Array of step objects (highly recommended)

### Optional Fields

- `schema_total_time` - ISO 8601 duration (e.g., "PT30M" = 30 minutes, "PT2H" = 2 hours)
- `schema_estimated_cost` - Cost as string (e.g., "0" for free, "29.99" for paid)
- `schema_cost_currency` - Currency code (default: "USD")
- `schema_tools` - Array of tool names needed
- `schema_supplies` - Array of materials/supplies needed
- `schema_keywords` - Array of keywords (fallback to `tags` if not set)

### Step Object Format

Each step in `schema_steps` can have:

```yaml
- name: "Step title"           # Required
  text: "Detailed instructions" # Required
  url: "/path/to/section"      # Optional: link to step anchor
  image: "/assets/images/step1.jpg"   # Optional: step illustration
```

### ISO 8601 Duration Format

Common durations:
- `PT15M` - 15 minutes
- `PT30M` - 30 minutes
- `PT1H` - 1 hour
- `PT1H30M` - 1 hour 30 minutes
- `PT2H` - 2 hours
- `P1D` - 1 day

---

## Implementation Steps

### Step 1: Update Existing Posts

**High Priority - Wix Performance Post:**

File: `_posts/2025-09-02-WixPerformanceImprovement.md`

Add to front matter:
```yaml
schema_type: AnalysisNewsArticle
schema_about: "Web Performance Optimization"
schema_dateline: "November 2025"
schema_section: "Performance Analysis"
```

**High Priority - Jekyll Update Post:**

File: `_posts/2025-07-02-updating-jekyll-in-2025.markdown`

Add to front matter:
```yaml
schema_type: TechArticle
schema_dependencies: "Ruby 3.x, Bundler 2.x"
schema_proficiency: "Intermediate"
schema_section: "Jekyll"
```

**Low Priority - What3Things Post:**

File: `_posts/2025-08-25-What3Things.md`

No changes needed - standard BlogPosting is appropriate for personal narratives.

### Step 2: Test Locally

```bash
cd ~/code/PersonalSite
bundle exec jekyll build
bundle exec jekyll serve
```

Open in browser:
- Homepage: http://localhost:4000/
- Wix post: http://localhost:4000/posts/WixPerformanceImprovement/
- Jekyll post: http://localhost:4000/posts/updating-jekyll-in-2025/

View source and find the JSON-LD script tags to verify enhanced schemas.

### Step 3: Validate

Copy JSON-LD from source and test in:

1. **JSON-LD Playground**
   - URL: https://json-ld.org/playground/
   - Paste JSON-LD, verify no syntax errors

2. **Schema.org Validator** (after deploy)
   - URL: https://validator.schema.org/
   - Test full post URLs

3. **Google Rich Results Test** (after deploy)
   - URL: https://search.google.com/test/rich-results
   - Test full post URLs

### Step 4: Deploy

```bash
git add _posts/2025-09-02-WixPerformanceImprovement.md
git add _posts/2025-07-02-updating-jekyll-in-2025.markdown
git add _includes/tech-article-schema.html
git add _includes/analysis-article-schema.html
git add _includes/how-to-schema.html
git add _includes/seo.html
git add BLOG-SCHEMA-ENHANCEMENT-ANALYSIS.md
git add ENHANCED-SCHEMA-IMPLEMENTATION-GUIDE.md

git commit -m "Add enhanced blog post schemas (TechArticle, AnalysisNewsArticle, HowTo)

- Create conditional schema templates based on schema_type
- Update Wix post with AnalysisNewsArticle schema
- Update Jekyll post with TechArticle schema
- Add comprehensive documentation and implementation guide

Generated using ast-grep-mcp server Schema.org tools"

git push origin main
```

### Step 5: Monitor

Follow procedures in `SEARCH-CONSOLE-MONITORING-GUIDE.md`:

**Week 1:**
- Check URL Inspection for new posts
- Request indexing in Search Console
- Monitor for structured data detection

**Weeks 2-4:**
- Check Structured Data Report
- Verify TechArticle and AnalysisNewsArticle detected
- Monitor for errors/warnings

**Month 2-3:**
- Track rich result appearances
- Monitor CTR improvements
- Check knowledge graph updates

---

## Future Post Guidelines

### Choosing the Right Schema Type

**Decision Tree:**

```
Is it technical documentation?
├─ Yes → Does it have explicit numbered steps?
│   ├─ Yes → HowTo
│   └─ No → TechArticle
│
└─ No → Does it analyze data or provide expert commentary?
    ├─ Yes → AnalysisNewsArticle
    └─ No → Standard BlogPosting (no schema_type needed)
```

### Quick Reference

| Content Type | Schema Type | Key Indicator |
|-------------|-------------|---------------|
| Technical guide | TechArticle | Explains implementation, has prerequisites |
| Tutorial with steps | HowTo | Numbered steps, clear outcome |
| Performance analysis | AnalysisNewsArticle | Data + expert interpretation |
| Case study with metrics | AnalysisNewsArticle | Findings + recommendations |
| Personal story | BlogPosting | Opinion, narrative, no technical focus |
| Opinion piece | BlogPosting | Subjective viewpoint |

---

## Validation Checklist

### Pre-Deployment

- [ ] Front matter includes `schema_type`
- [ ] Required schema-specific fields populated
- [ ] Jekyll builds without errors
- [ ] JSON-LD validates in Playground
- [ ] All @id references resolve correctly
- [ ] No duplicate schema definitions

### Post-Deployment

- [ ] Google Rich Results Test shows no errors
- [ ] Schema.org Validator shows valid markup
- [ ] Correct schema type detected (TechArticle/AnalysisNewsArticle/HowTo)
- [ ] Author and publisher @id references resolve
- [ ] Images load correctly

### Search Console (Week 1)

- [ ] New schema types detected
- [ ] Zero errors in Structured Data Report
- [ ] Items with enhanced schema increasing

---

## Troubleshooting

### Issue: Schema not detected

**Check:**
1. Is `schema_type` in front matter spelled correctly?
2. Did Jekyll rebuild after changes?
3. Is the schema include file present in `_includes/`?
4. View page source - is JSON-LD script present?

### Issue: Validation errors

**Common Causes:**
- Missing required front matter fields
- Invalid ISO 8601 duration format
- Unescaped quotes in text
- Array fields formatted incorrectly

**Fix:**
- Check front matter YAML syntax
- Ensure string values are quoted
- Use `jsonify` filter in templates
- Validate YAML with online tool

### Issue: Steps not showing

**For HowTo schema:**
- Verify `schema_steps` is an array in front matter
- Each step must have `name` and `text`
- Check YAML indentation (2 spaces)

---

## Advanced Usage

### Custom Properties

You can add custom schema properties in front matter:

```yaml
schema_custom:
  discussionUrl: "https://github.com/username/repo/discussions/123"
  citation: "https://example.com/source"
  mentions:
    - "@type": "SoftwareTool"
      "name": "Jekyll"
```

Then reference in custom schema template.

### Multiple About Entities

```yaml
schema_about:
  - "Web Performance"
  - "Core Web Vitals"
  - "Wix Platform"
```

Modify template to loop through array.

### Step Images

For HowTo posts with visual steps:

```yaml
schema_steps:
  - name: "Step 1: Open settings"
    text: "Navigate to Settings > Configuration"
    image: "/assets/images/tutorials/step1.png"
  - name: "Step 2: Enable feature"
    text: "Toggle the feature switch to ON"
    image: "/assets/images/tutorials/step2.png"
```

---

## SEO Benefits

### Expected Improvements

**TechArticle:**
- ✅ Technical documentation indexing
- ✅ "How-to" rich results eligibility
- ✅ Developer audience targeting
- ✅ Skill level matching

**AnalysisNewsArticle:**
- ✅ Expert analysis recognition
- ✅ Data-driven content highlighting
- ✅ Trust signals (via Trust Project alignment)
- ✅ Analysis query matching

**HowTo:**
- ✅ Step-by-step rich snippets
- ✅ Featured snippet eligibility
- ✅ Voice search optimization
- ✅ FAQ-style results

### Timeline

- **Week 1:** Schema detected by Google
- **Weeks 2-4:** Rich result eligibility confirmed
- **Months 2-3:** Rich results appear in SERPs
- **Months 3-6:** CTR improvements measurable

---

## Resources

### Documentation

- **Analysis Document**: `BLOG-SCHEMA-ENHANCEMENT-ANALYSIS.md`
- **Schema.org Reference**:
  - TechArticle: https://schema.org/TechArticle
  - AnalysisNewsArticle: https://schema.org/AnalysisNewsArticle
  - HowTo: https://schema.org/HowTo

### Testing Tools

- **JSON-LD Playground**: https://json-ld.org/playground/
- **Schema.org Validator**: https://validator.schema.org/
- **Rich Results Test**: https://search.google.com/test/rich-results

### Related Guides

- **Unified Schema Guide**: `_includes/SCHEMA-KNOWLEDGE-GRAPH-GUIDE.md`
- **Testing Guide**: `SCHEMA-TESTING-VALIDATION-GUIDE.md`
- **Monitoring Guide**: `SEARCH-CONSOLE-MONITORING-GUIDE.md`

---

## Support

### Questions?

1. Check `BLOG-SCHEMA-ENHANCEMENT-ANALYSIS.md` for detailed explanations
2. Review schema include files in `_includes/` for examples
3. Test with JSON-LD Playground before deploying
4. Use Schema.org documentation for property details

### Issues?

Common solutions:
1. Rebuild Jekyll: `bundle exec jekyll build`
2. Clear browser cache
3. Validate YAML syntax
4. Check for typos in `schema_type`

---

**Generated by:** ast-grep-mcp server Schema.org analysis tools
**Date:** November 11, 2025
**Status:** ✅ Ready for Implementation
