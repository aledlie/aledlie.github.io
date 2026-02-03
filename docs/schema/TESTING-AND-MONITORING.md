# Schema Testing, Validation & Monitoring Guide

**Last Updated:** 2026-01-19
**Site:** https://www.aledlie.com

This guide covers testing, validating, and monitoring Schema.org structured data.

---

## Table of Contents

1. [Quick Links](#quick-links)
2. [Pre-Deployment Testing](#pre-deployment-testing)
3. [Post-Deployment Validation](#post-deployment-validation)
4. [Search Console Monitoring](#search-console-monitoring)
5. [Troubleshooting](#troubleshooting)
6. [Performance Tracking](#performance-tracking)

---

## Quick Links

### Testing Tools

| Tool | URL | Purpose |
|------|-----|---------|
| **Rich Results Test** | https://search.google.com/test/rich-results | Validate structured data, check eligibility |
| **Schema.org Validator** | https://validator.schema.org/ | Full Schema.org validation |
| **JSON-LD Playground** | https://json-ld.org/playground/ | Debug JSON-LD syntax |
| **Search Console** | https://search.google.com/search-console | Monitor indexing and errors |

### Site URLs to Test

```
Homepage:     https://www.aledlie.com/
About Page:   https://www.aledlie.com/about/
Projects:     https://www.aledlie.com/projects/
Blog Post:    https://www.aledlie.com/posts/{recent-post}/
```

---

## Pre-Deployment Testing

### Step 1: Build Locally

```bash
cd ~/code/PersonalSite
bundle exec jekyll build
bundle exec jekyll serve
```

### Step 2: Inspect JSON-LD Output

1. Open page in browser (http://localhost:4000/)
2. View page source (Cmd+Option+U / Ctrl+U)
3. Search for `<script type="application/ld+json">`
4. Verify JSON-LD block is present

### Step 3: Validate JSON-LD Syntax

1. Copy entire JSON-LD block from page source
2. Paste into https://json-ld.org/playground/
3. Verify no syntax errors
4. Check "Expanded" view to see resolved @id references

### Step 4: Check Core Elements

**Verify in JSON-LD:**
- [ ] `@context` is "https://schema.org"
- [ ] `@graph` array contains core entities (Person, WebSite, Blog)
- [ ] All @id values use consistent base URL
- [ ] Correct schema type for page (TechArticle, BlogPosting, etc.)
- [ ] No duplicate entity definitions

### Pre-Deployment Checklist

```markdown
## Local Validation - [Date]

### JSON-LD Syntax
- [ ] Homepage JSON-LD validates
- [ ] Blog post JSON-LD validates
- [ ] About page JSON-LD validates

### Entity Verification
- [ ] Person entity present (#person)
- [ ] WebSite entity present (#website)
- [ ] Blog entity present (#blog)
- [ ] Correct post type (TechArticle/BlogPosting/etc.)

### @id References
- [ ] All @id values use https://www.aledlie.com
- [ ] Author references resolve to #person
- [ ] Publisher references resolve to #person
- [ ] isPartOf references resolve correctly
```

---

## Post-Deployment Validation

### Step 1: Google Rich Results Test

```
1. Go to: https://search.google.com/test/rich-results
2. Enter URL: https://www.aledlie.com/
3. Click "Test URL"
4. Wait for results (30-60 seconds)
```

**Expected Results:**
- Valid structured data detected
- Person entity recognized
- WebSite entity recognized
- Organization entities recognized
- Zero errors (warnings are OK)

### Step 2: Schema.org Validator

```
1. Go to: https://validator.schema.org/
2. Enter URL: https://www.aledlie.com/
3. Click "Run Test"
```

**Expected Results:**
- Valid Schema.org markup
- All entities validated
- Relationships recognized

### Step 3: Request Indexing

After validation passes:

```
1. Go to Search Console
2. URL Inspection tool
3. Enter your URL
4. Click "Request Indexing"
```

### Post-Deployment Checklist

```markdown
## Production Validation - [Date]

### Rich Results Test
- Homepage: [ ] PASS / [ ] FAIL
- Blog post: [ ] PASS / [ ] FAIL
- About page: [ ] PASS / [ ] FAIL

### Detected Entities
- [ ] Person
- [ ] WebSite
- [ ] Blog
- [ ] BlogPosting / TechArticle / etc.
- [ ] Organization(s)

### Errors/Warnings
- Errors: [count]
- Warnings: [count]
- Notes: [details]
```

---

## Search Console Monitoring

### Initial Setup (One-Time)

1. **Verify property ownership** at https://search.google.com/search-console
2. **Add property** if not set up: `https://www.aledlie.com`
3. **Request initial indexing** for key pages

### Week 1: Daily Monitoring

**Check URL Inspection Tool:**

```
Search Console > URL Inspection > Enter URL
```

**Look for:**
- "URL is on Google" status
- Last crawl date/time
- Coverage status (Valid)

**Check Structured Data:**

```
Search Console > Enhancements > Structured Data
```

**Look for:**
- Items detected (should increase)
- Error count (should be 0)
- Warning count (document)

### Weeks 2-4: Weekly Monitoring

**Structured Data Report:**

```
Search Console > Enhancements > Structured Data
```

**Track by entity type:**
- [ ] Person: Expected 1
- [ ] Organization: Expected 2
- [ ] WebSite: Expected 1
- [ ] Blog: Expected 1
- [ ] BlogPosting/TechArticle: Number of posts

**Performance Baseline:**

```
Search Console > Performance
```

**Record:**
- Total clicks
- Total impressions
- Average CTR
- Average position

### Monthly Monitoring

**Rich Results Status:**

```
Search Console > Enhancements > [Each type]
```

**Track:**
- Valid items count
- Items with warnings
- Items with errors
- Eligible pages

**Knowledge Graph Check:**

Google search your brand name and check for:
- [ ] Knowledge Panel appearing
- [ ] Correct information displayed
- [ ] Social links present
- [ ] Rich snippets for posts
- [ ] Breadcrumb navigation

---

## Troubleshooting

### Common Issues

#### Schema Not Detected

**Symptom:** Validator shows no structured data

**Causes:**
- Schema include missing from layout
- Jekyll build error
- JavaScript blocking (shouldn't affect JSON-LD)

**Fix:**
1. View page source, search for `application/ld+json`
2. If missing, check `_includes/seo.html` is included in layout
3. Rebuild site: `bundle exec jekyll build --trace`

#### @id References Not Resolving

**Symptom:** Validator shows missing entity warnings

**Causes:**
- Typo in @id value
- Inconsistent URL format (http vs https)
- Trailing slash mismatch

**Fix:**
1. Check @id values match exactly (case-sensitive)
2. Ensure all use `https://www.aledlie.com` (no trailing slash)
3. Use JSON-LD Playground "Expanded" view to debug

#### Duplicate Entities Detected

**Symptom:** Multiple Person or Organization definitions

**Causes:**
- Old schema includes still active
- Multiple schema blocks on page

**Fix:**
1. Check only `unified-knowledge-graph-schema.html` defines core entities
2. Remove old includes (organization-schema.html, enhanced-person-schema.html)
3. Verify post-schema.html uses @id references, not nested objects

#### Rich Results Not Showing

**Symptom:** Valid schema but no rich results in search

**Causes:**
- Not yet indexed (can take 2-4 weeks)
- Content quality threshold not met
- Rich result type not eligible for your niche

**Fix:**
1. Verify schema is valid (no errors)
2. Request indexing in Search Console
3. Wait 2-4 weeks for processing
4. Continue creating quality content

#### HowTo Steps Not Appearing

**Symptom:** HowTo validates but steps missing

**Causes:**
- `schema_steps` not an array
- Missing `name` or `text` in step objects
- YAML indentation error

**Fix:**
```yaml
# Correct format:
schema_steps:
  - name: "Step 1 Title"
    text: "Step 1 instructions here"
  - name: "Step 2 Title"
    text: "Step 2 instructions here"
```

### Error Response Guide

| Error Type | Severity | Action |
|------------|----------|--------|
| Missing required field | High | Fix immediately |
| Invalid @id format | High | Fix immediately |
| Duplicate entity | Medium | Fix within week |
| Recommended field missing | Low | Add when convenient |
| Image size warning | Low | Resize if possible |

---

## Performance Tracking

### Monthly Metrics Spreadsheet

| Month | Valid Pages | Entities | Clicks | Impressions | CTR | Position |
|-------|-------------|----------|--------|-------------|-----|----------|
| Jan 2026 | | | | | | |
| Feb 2026 | | | | | | |
| Mar 2026 | | | | | | |

**Data Sources:**
- Valid Pages: Search Console > Coverage
- Entities: Search Console > Enhancements > Structured Data
- Performance: Search Console > Performance

### Success Timeline

**Week 1:**
- Schema detected in Search Console
- Zero errors in Structured Data Report
- All entity types recognized

**Month 1:**
- All pages indexed with valid schema
- Rich results eligible for key content
- Baseline metrics established

**Month 3:**
- Rich results appearing in SERPs
- Improved CTR on key pages
- Knowledge graph connections visible

**Month 6:**
- Sustained organic traffic improvement
- Multiple rich result types appearing
- Full knowledge graph integration

### Monthly Report Template

```markdown
## Schema Performance Report - [Month Year]

### Summary
- Total Valid Pages: [count] ([+/-] from last month)
- Structured Data Items: [count]
- Errors: [count]
- Warnings: [count]

### Entity Detection
| Entity Type | Count | Status |
|-------------|-------|--------|
| Person | | |
| Organization | | |
| WebSite | | |
| Blog | | |
| BlogPosting | | |

### Rich Results
- Eligible Pages: [count]
- Appearing in SERPs: [yes/no]
- Types appearing: [list]

### Traffic Impact
- Organic Clicks: [count] ([%] change)
- Impressions: [count] ([%] change)
- Average CTR: [%] ([%] change)

### Issues
[List any errors or warnings]

### Wins
[Highlight positive changes]

### Next Month Goals
- [ ] Goal 1
- [ ] Goal 2
```

---

## Browser DevTools Testing

### Console Script for Schema Inspection

```javascript
// Run in browser console on your page
const scripts = document.querySelectorAll('script[type="application/ld+json"]');
scripts.forEach((script, i) => {
  console.log(`Schema Block ${i + 1}:`);
  const data = JSON.parse(script.textContent);
  console.log(data);

  // List entities
  if (data['@graph']) {
    console.log('Entities:');
    data['@graph'].forEach(entity => {
      console.log(`  - ${entity['@type']}: ${entity['@id']}`);
    });
  }
});
```

### Entity Relationship Verification

```javascript
// Check for @id references
const scripts = document.querySelectorAll('script[type="application/ld+json"]');
const allIds = new Set();
const allRefs = new Set();

scripts.forEach(script => {
  const data = JSON.parse(script.textContent);
  const findIdsAndRefs = (obj, path = '') => {
    if (typeof obj !== 'object' || obj === null) return;
    if (obj['@id']) allIds.add(obj['@id']);
    Object.values(obj).forEach(v => {
      if (typeof v === 'object' && v !== null) {
        if (v['@id'] && !v['@type']) allRefs.add(v['@id']);
        findIdsAndRefs(v);
      }
    });
  };
  findIdsAndRefs(data);
});

console.log('Defined @ids:', [...allIds]);
console.log('Referenced @ids:', [...allRefs]);
console.log('Unresolved refs:', [...allRefs].filter(r => !allIds.has(r)));
```

---

## Resources

### Google Documentation
- https://developers.google.com/search/docs/appearance/structured-data
- https://support.google.com/webmasters/answer/7552505 (Rich Results)

### Schema.org
- https://schema.org/docs/documents.html
- https://schema.org/TechArticle
- https://schema.org/HowTo

### Internal Documentation
- Implementation: `docs/schema/IMPLEMENTATION-GUIDE.md`
- Site Analysis: `docs/schema/SITE-SCHEMA-ANALYSIS.md`
