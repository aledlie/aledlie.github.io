# Schema.org Testing & Validation Guide

**Date:** November 10, 2024
**Status:** Ready for Testing
**Implementation:** Unified Knowledge Graph Schema

## Quick Links

### Testing Tools
- **Google Rich Results Test:** https://search.google.com/test/rich-results
- **Schema.org Validator:** https://validator.schema.org/
- **Google Search Console:** https://search.google.com/search-console
- **JSON-LD Playground:** https://json-ld.org/playground/

### Your Site URLs to Test
```
Homepage:     https://www.aledlie.com/
About Page:   https://www.aledlie.com/about/
Projects:     https://www.aledlie.com/projects/
Blog Post:    https://www.aledlie.com/posts/ (pick latest)
```

---

## Testing Checklist

### Phase 1: Pre-Deploy Validation (Local)

#### 1. Build the Site Locally
```bash
cd ~/code/PersonalSite
bundle exec jekyll build
bundle exec jekyll serve
```

#### 2. Test Homepage (http://localhost:4000/)
- [ ] Open page in browser
- [ ] View source, find `<script type="application/ld+json">`
- [ ] Copy entire JSON-LD block
- [ ] Paste into https://json-ld.org/playground/
- [ ] Verify no syntax errors
- [ ] Check all @id values are present
- [ ] Verify Person, WebSite, Blog, Organizations in @graph

#### 3. Test Blog Post Page
- [ ] Navigate to a blog post
- [ ] View source, find BlogPosting schema
- [ ] Verify author uses `{"@id": "https://www.aledlie.com#person"}`
- [ ] Verify isPartOf uses `{"@id": "https://www.aledlie.com#blog"}`
- [ ] Check in JSON-LD Playground for errors

#### 4. Check for Duplicates
- [ ] Search page source for multiple Person definitions
- [ ] Ensure no duplicate entity definitions
- [ ] Verify entities only defined once in unified schema

---

### Phase 2: Post-Deploy Validation (Production)

#### 1. Google Rich Results Test

**Homepage Test:**
```
1. Go to: https://search.google.com/test/rich-results
2. Enter URL: https://www.aledlie.com/
3. Click "Test URL"
4. Wait for results...
```

**Expected Results:**
- ✅ Valid structured data detected
- ✅ Person entity recognized
- ✅ WebSite entity recognized
- ✅ Organization entities recognized
- ⚠️  May show warnings (not errors) - warnings are OK
- ❌ NO errors should appear

**What to Check:**
- [ ] No errors in structured data
- [ ] All entities detected
- [ ] @id references working correctly
- [ ] Images properly formatted

**Blog Post Test:**
```
1. Test URL: https://www.aledlie.com/posts/[recent-post]
2. Check for BlogPosting detection
3. Verify author/publisher references resolved
```

**Expected Results:**
- ✅ BlogPosting detected
- ✅ Article eligible for rich results
- ✅ Author information present
- ✅ Published date present

#### 2. Schema.org Validator

```
1. Go to: https://validator.schema.org/
2. Enter URL: https://www.aledlie.com/
3. Click "Run Test"
```

**Expected Results:**
- ✅ Valid Schema.org markup
- ✅ All entities validated
- ✅ Relationships recognized
- [ ] Check for any warnings or suggestions

**Pages to Validate:**
- [ ] Homepage (/)
- [ ] About page (/about/)
- [ ] Projects page (/projects/)
- [ ] Recent blog post (/posts/...)

#### 3. Manual Schema Inspection

**View Source Check:**
```html
<!-- Look for this structure in page source -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://www.aledlie.com#person",
      ...
    },
    {
      "@type": "WebSite",
      "@id": "https://www.aledlie.com#website",
      ...
    }
  ]
}
</script>
```

**Verification Points:**
- [ ] @context is "https://schema.org"
- [ ] @graph array present with multiple entities
- [ ] All @id values use consistent base URL
- [ ] Relationships use @id references, not nested objects
- [ ] No duplicate entity definitions

---

### Phase 3: Entity Relationship Validation

#### Check Key Relationships

**Person → WebSite:**
```json
// In Person entity:
"owns": {
  "@id": "https://www.aledlie.com#website"
}

// In WebSite entity:
"publisher": {
  "@id": "https://www.aledlie.com#person"
}
```
- [ ] Bidirectional relationship exists
- [ ] Both @id references match exactly

**Person → Organizations:**
```json
// In Person entity:
"worksFor": [
  {
    "@id": "https://www.aledlie.com/organizations/integrity-studios#organization"
  },
  {
    "@id": "https://www.aledlie.com/organizations/inventoryai#organization"
  }
]

// In Organization entities:
"founder": {
  "@id": "https://www.aledlie.com#person"
}
```
- [ ] All organization @id references exist
- [ ] Founder relationship bidirectional

**Blog → WebSite:**
```json
// In Blog entity:
"isPartOf": {
  "@id": "https://www.aledlie.com#website"
}

// In WebSite entity:
"hasPart": [
  {
    "@id": "https://www.aledlie.com#blog"
  }
]
```
- [ ] hasPart includes blog reference
- [ ] isPartOf references website

---

## Common Issues & Fixes

### Issue 1: @id References Not Resolving
**Symptom:** Validator shows missing entity warnings
**Fix:** Check @id values match exactly (case-sensitive, no trailing slashes)

### Issue 2: Duplicate Entities Detected
**Symptom:** Multiple Person or Organization definitions
**Fix:** Remove old schema includes, use only unified schema

### Issue 3: Rich Results Not Showing
**Symptom:** Valid schema but no rich results
**Fix:** This is normal - rich results can take weeks to appear. Check:
- [ ] Schema is valid (no errors)
- [ ] Content is high quality
- [ ] Site has been crawled recently

### Issue 4: Warning About Missing Properties
**Symptom:** Validator suggests adding more properties
**Fix:** Warnings are OK. Core properties are implemented. Add optional ones if desired.

### Issue 5: Image Errors
**Symptom:** Image URL issues in structured data
**Fix:** Check image URLs are absolute, not relative:
```
✓ "https://www.aledlie.com/assets/images/avatar.jpg"
✗ "/assets/images/avatar.jpg"
```

---

## Validation Results Template

Use this template to document your validation results:

```markdown
## Validation Results - [Date]

### Google Rich Results Test

Homepage (https://www.aledlie.com/):
- Status: ✅ / ❌
- Entities Detected: [list]
- Errors: [list or "None"]
- Warnings: [list or "None"]

Blog Post (https://www.aledlie.com/posts/[title]):
- Status: ✅ / ❌
- BlogPosting Detected: Yes / No
- Errors: [list or "None"]
- Warnings: [list or "None"]

### Schema.org Validator

Homepage:
- Status: ✅ / ❌
- Validation Score: [if provided]
- Issues: [list or "None"]

### Manual Inspection

@id Values Validated:
- ✅ https://www.aledlie.com#person
- ✅ https://www.aledlie.com#website
- ✅ https://www.aledlie.com#blog
- ✅ https://www.aledlie.com/organizations/integrity-studios#organization
- ✅ https://www.aledlie.com/organizations/inventoryai#organization

Relationships Verified:
- ✅ Person ↔ WebSite (bidirectional)
- ✅ Person → Organizations
- ✅ Blog ↔ WebSite (bidirectional)
- ✅ BlogPosts → Blog → WebSite chain

### Next Steps
- [ ] Monitor in Search Console
- [ ] Check back in 1 week for indexing status
- [ ] Review performance in 1 month
```

---

## Advanced Testing

### JSON-LD Playground Deep Dive

1. **Expand Schema:**
   - Copy JSON-LD from page source
   - Paste into https://json-ld.org/playground/
   - Click "Expand" to see full RDF representation
   - Verify all @id references expand correctly

2. **Validate Context:**
   - Check @context resolves to Schema.org
   - Ensure all property names are valid Schema.org terms

3. **Test Compaction:**
   - Try compacting with different contexts
   - Ensure structure remains intact

### Browser DevTools Testing

```javascript
// Run in browser console on your page
const scripts = document.querySelectorAll('script[type="application/ld+json"]');
scripts.forEach((script, i) => {
  console.log(`Schema Block ${i + 1}:`);
  const data = JSON.parse(script.textContent);
  console.log(data);

  // Check for @id values
  if (data['@graph']) {
    data['@graph'].forEach(entity => {
      console.log(`Entity: ${entity['@type']}, @id: ${entity['@id']}`);
    });
  }
});
```

---

## Success Criteria

Your schema implementation is successful when:

✅ **Validation**
- [ ] Google Rich Results Test shows no errors
- [ ] Schema.org Validator shows valid markup
- [ ] All @id values validated successfully

✅ **Completeness**
- [ ] All 5 core entities present (Person, WebSite, Blog, 2 Organizations)
- [ ] All relationships properly defined with @id references
- [ ] No duplicate entity definitions

✅ **Consistency**
- [ ] Same @id used across all pages for each entity
- [ ] All references use canonical base URL (https://www.aledlie.com)
- [ ] No nested entities where @id should be used

✅ **Coverage**
- [ ] Homepage has full knowledge graph
- [ ] Blog posts reference main entities via @id
- [ ] All key pages tested and validated

---

## Next: Search Console Setup

Once validation is complete, proceed to:
**SEARCH-CONSOLE-MONITORING-GUIDE.md**

This covers:
- Setting up monitoring
- Tracking rich results
- Performance analysis
- Troubleshooting indexing issues

---

## Support & Resources

- **Momentic Marketing Guide:** https://momenticmarketing.com/blog/id-schema-for-seo-llms-knowledge-graphs
- **Schema.org Docs:** https://schema.org/
- **Google Structured Data:** https://developers.google.com/search/docs/appearance/structured-data
- **Your Implementation Guide:** `_includes/SCHEMA-KNOWLEDGE-GRAPH-GUIDE.md`

## Questions?

If you encounter issues:
1. Check error messages in validators
2. Compare against examples in SCHEMA-KNOWLEDGE-GRAPH-GUIDE.md
3. Use `validate_entity_id` tool from ast-grep-mcp server
4. Review SCHEMA-BEFORE-AFTER-COMPARISON.md for reference
