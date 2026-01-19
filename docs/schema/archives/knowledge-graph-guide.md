# Knowledge Graph Schema Implementation Guide

## Overview

This site now uses a unified knowledge graph approach for Schema.org structured data, following best practices from [Momentic Marketing's guide on @id usage](https://momenticmarketing.com/blog/id-schema-for-seo-llms-knowledge-graphs).

**Generated using:** ast-grep-mcp server's `build_entity_graph` tool
**Date:** November 10, 2024

## What Changed

### Before: Fragmented Schemas
- Multiple separate schema files (organization-schema.html, enhanced-person-schema.html, etc.)
- Some relationships used full nested objects instead of @id references
- Inconsistent entity identification
- Organizations used external URLs as @id base

### After: Unified Knowledge Graph
- Single `unified-knowledge-graph-schema.html` file
- All entities use proper @id references
- Consistent entity identification across the entire site
- Organizations referenced from main site using stable @id values
- Bidirectional relationships enabled

## Entity Structure

### Core Entities

| Entity | @id | Description |
|--------|-----|-------------|
| **Person** | `https://www.aledlie.com#person` | Alyshia Ledlie profile |
| **WebSite** | `https://www.aledlie.com#website` | Main website |
| **Blog** | `https://www.aledlie.com#blog` | Blog section |
| **Integrity Studios** | `https://www.aledlie.com/organizations/integrity-studios#organization` | Organization entity |
| **InventoryAI.io** | `https://www.aledlie.com/organizations/inventoryai#organization` | Organization entity |

### Relationships

```
Person ─[owns]──────────────────> WebSite
Person ─[worksFor]──────────────> Integrity Studios
Person ─[worksFor]──────────────> InventoryAI.io
Person ─[mainEntityOfPage]──────> /about (ProfilePage)

WebSite ─[publisher/author]─────> Person
WebSite ─[mainEntity]───────────> Person
WebSite ─[hasPart]──────────────> Blog
WebSite ─[hasPart]──────────────> /about
WebSite ─[hasPart]──────────────> /projects

Blog ─[author/publisher]────────> Person
Blog ─[isPartOf]────────────────> WebSite

Integrity Studios ─[founder]────> Person
InventoryAI.io ─[founder]───────> Person
```

## Key Benefits

### 1. Consistency
- Same @id used everywhere for each entity
- No duplicate entity definitions
- Clear single source of truth

### 2. Scalability
- Add new entities without modifying existing ones
- Reference entities across any page
- Build knowledge base incrementally

### 3. SEO & Knowledge Graphs
- Search engines understand entity relationships
- Better representation in Google Knowledge Graph
- Enhanced rich results
- LLMs can build accurate knowledge graphs from your content

### 4. Maintainability
- Single unified schema file
- Easier to update entity information
- Validation via `validate_entity_id` tool

## How to Use

### Include the Unified Schema

Replace existing schema includes in your layouts with:

```liquid
{% include unified-knowledge-graph-schema.html %}
```

### For Page-Specific Entities

Create page-specific entities that reference the core knowledge graph:

```liquid
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "@id": "{{ page.url | absolute_url }}#blogposting",
  "headline": "{{ page.title }}",
  "author": {
    "@id": "{{ site.url }}#person"
  },
  "publisher": {
    "@id": "{{ site.url }}#person"
  },
  "isPartOf": {
    "@id": "{{ site.url }}#blog"
  }
}
</script>
```

## Validation

All @id values were validated using the `validate_entity_id` tool:

```bash
✓ https://www.aledlie.com#person
✓ https://www.aledlie.com#website
✓ https://www.aledlie.com#blog
✓ https://www.aledlie.com/organizations/integrity-studios#organization
✓ https://www.aledlie.com/organizations/inventoryai#organization
```

## Best Practices Applied

Following guidelines from https://momenticmarketing.com/blog/id-schema-for-seo-llms-knowledge-graphs:

1. ✓ **Canonical URLs + Hash Fragments**
   - Format: `{canonical_url}#{entity_type}` or `{canonical_url}/{slug}#{entity_type}`

2. ✓ **Stable IDs**
   - No timestamps or dynamic values
   - Permanent identifiers

3. ✓ **Descriptive Fragments**
   - `#person` not `#1`
   - `#organization` not `#org`

4. ✓ **Entity References**
   - Use `{"@id": "..."}` for relationships
   - Avoid duplicating entity definitions

5. ✓ **Cross-Page Consistency**
   - Same @id for entity regardless of page
   - Enables knowledge graph building

## Tools Used

This schema was generated and validated using the **ast-grep-mcp** server's Schema.org tools:

### Generation
```bash
build_entity_graph([entities...], "https://www.aledlie.com")
```

### Validation
```bash
validate_entity_id("https://www.aledlie.com#person")
```

### ID Generation
```bash
generate_entity_id("https://www.aledlie.com", "Person")
→ "https://www.aledlie.com#person"

generate_entity_id("https://www.aledlie.com", "Organization", "organizations/integrity-studios")
→ "https://www.aledlie.com/organizations/integrity-studios#organization"
```

## Testing

Test your structured data:
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)
- [Google Search Console](https://search.google.com/search-console)

## Future Additions

To add new entities to the knowledge graph:

1. **Generate the @id**:
   ```bash
   generate_entity_id("https://www.aledlie.com", "Product", "products/my-app")
   ```

2. **Add to entities array**:
   ```javascript
   {
     "type": "Product",
     "id_fragment": "product-myapp",
     "slug": "products/my-app",
     "properties": {...},
     "relationships": {
       "creator": "person"
     }
   }
   ```

3. **Rebuild knowledge graph**:
   ```bash
   build_entity_graph([entities...], "https://www.aledlie.com")
   ```

4. **Update unified-knowledge-graph-schema.html**

## References

- [Momentic Marketing: @id for SEO, LLMs & Knowledge Graphs](https://momenticmarketing.com/blog/id-schema-for-seo-llms-knowledge-graphs)
- [Schema.org](https://schema.org/)
- [Google Structured Data Guidelines](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [ast-grep-mcp Server Documentation](https://github.com/ast-grep/ast-grep-mcp)

## Support

For issues or questions about the knowledge graph implementation:
1. Validate @id values using `validate_entity_id` tool
2. Check relationships in Google Rich Results Test
3. Verify entity definitions at validator.schema.org
