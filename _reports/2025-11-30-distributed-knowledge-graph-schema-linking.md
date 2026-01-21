---
layout: single
title: "Slowly Building a Complete (and Distributed) 'Thing -> Relationship -> Thing' Graph"
date: 2025-11-30
categories: [schema-org, seo, knowledge-graph, cross-domain]
tags: [json-ld, structured-data, entity-linking, semantic-web, seo-optimization]
---


**Session Date**: 2025-11-30<br>
**Project**: Multi-site Schema.org Knowledge Graph<br>
**Focus**: Creating cross-domain entity relationships using @id references<br>

## Executive Summary

This session focused on building a distributed knowledge graph across multiple websites by implementing Schema.org JSON-LD with proper `@id` references that enable entities to reference each other across domain boundaries. The work spanned four interconnected sites: PersonalSite (aledlie.com), IntegrityStudio.ai, Leora Home Health, and Inspired Movement Dance Studio.

The key achievement was establishing bidirectional entity references where a review on one site (IntegrityStudio.ai) references an author entity (`Person`) defined on another site (Leora Home Health), and that person references back to the organization they own—creating a true distributed semantic web of relationships.

## The Vision: Distributed Knowledge Graphs

Traditional Schema.org implementations treat each website as an isolated entity graph. This session explored a more powerful pattern: using canonical `@id` URIs that allow entities across different domains to reference each other, building a web of interconnected knowledge that search engines and AI systems can traverse.

### The Pattern

```
Site A (integritystudio.ai)          Site B (leorahomehealth.com)
─────────────────────────────        ────────────────────────────
Review                               Person
  └─ author: @id ────────────────────→ @id: leorahomehealth.com#owner-monica
  └─ itemReviewed: @id ──┐               └─ worksFor: @id ─→ Organization
                         │               └─ affiliation ───→ Organization
Organization ←───────────┘           Organization
  └─ @id matches exactly ────────────→ @id: leorahomehealth.com#organization
```

## Implementation Details

### 1. PersonalSite Schema Enhancement

**Initial Score**: 62/100 → **Final Score**: 78.6/100

Added entities and fixed references:

```json
{
  "@type": "ProfilePage",
  "@id": "https://www.aledlie.com/about#profilepage",
  "mainEntity": { "@id": "https://www.aledlie.com#person" },
  "isPartOf": { "@id": "https://www.aledlie.com#website" }
}
```

```json
{
  "@type": "CollectionPage",
  "@id": "https://www.aledlie.com/projects#collectionpage",
  "about": { "@id": "https://www.aledlie.com#person" }
}
```

**Key Fix**: Updated Integrity Studio reference to use canonical @id:
```json
"worksFor": [
  { "@id": "https://www.integritystudio.org/#organization" }
]
```

### 2. Cross-Site Organization Sync

Ensured `@id` values match exactly between PersonalSite and IntegrityStudio.ai:

**PersonalSite** references:
```json
"worksFor": [
  { "@id": "https://www.integritystudio.org/#organization" },
  { "@id": "https://www.aledlie.com/organizations/inventoryai#organization" }
]
```

**IntegrityStudio.ai** defines:
```json
{
  "@type": "Organization",
  "@id": "https://www.integritystudio.org/#organization",
  "name": "Integrity Studio",
  ...
}
```

### 3. Contact Information Standardization

Added consistent contact info across all organization entities:
- Phone: `+1-512-829-1644`
- Email: `hello@integritystudio.ai` (updated from `@theintegritystudio.com`)
- Address: Austin, TX, US

### 4. Cross-Domain Review with External Author

The most interesting implementation—a review on IntegrityStudio.ai that references an author defined on a different domain:

**IntegrityStudio.ai** (`schema-structured-data.json:754-771`):
```json
{
  "@type": "Review",
  "@id": "https://www.integritystudio.org/#review-4",
  "itemReviewed": {
    "@id": "https://www.integritystudio.org/#organization"
  },
  "author": {
    "@id": "https://www.leorahomehealth.com#owner-monica-herra-hernandez"
  },
  "reviewBody": "Integrity Studio completely transformed how we present Leora Home Health Care online...",
  "datePublished": "2025-11-30"
}
```

**Leora Home Health** (`schema-org-markup-v2.json:354-363`):
```json
{
  "@type": "Person",
  "@id": "https://www.leorahomehealth.com#owner-monica-herra-hernandez",
  "name": "Monica Herra-Hernandez",
  "honorificSuffix": "RN",
  "jobTitle": "Owner",
  "worksFor": { "@id": "https://www.leorahomehealth.com#organization" },
  "affiliation": { "@id": "https://www.leorahomehealth.com#organization" }
}
```

### 5. Full Organization Entity in External Schema

Added complete Leora Home Health organization to IntegrityStudio.ai schema (`schema-structured-data.json:772-800`):

```json
{
  "@type": ["MedicalOrganization", "LocalBusiness"],
  "@id": "https://www.leorahomehealth.com#organization",
  "name": "Leora Home Health",
  "url": "https://www.leorahomehealth.com",
  "description": "Compassionate in-home health care services in Central Texas...",
  "telephone": "+1-512-222-8103",
  "email": "appointments@leorahomehealth.com",
  "founder": {
    "@id": "https://www.leorahomehealth.com#owner-monica-herra-hernandez"
  },
  "sameAs": [
    "https://www.facebook.com/leorahomehealth",
    "https://www.instagram.com/leorahomehealth",
    "https://www.linkedin.com/company/leora-home-health"
  ]
}
```

## The Complete Entity Relationship Map

```
PersonalSite (aledlie.com)
├── Person (@id: aledlie.com#person)
│   ├── worksFor ──────────────────────────────────────┐
│   ├── worksFor ─→ InventoryAI Organization          │
│   └── owns ─→ WebSite                               │
├── WebSite (@id: aledlie.com#website)                │
│   └── hasPart ─→ [Blog, ProfilePage, CollectionPage]│
└── Organization references ────────────────────────────┼─────────────────────┐
                                                       │                     │
IntegrityStudio.ai                                     │                     │
├── Organization (@id: integritystudio.org/#organization) ←──────────────────┘
│   ├── review ─→ [#review-1, #review-2, #review-3, #review-4]
│   └── hasOfferCatalog ─→ Services
├── Review #review-4
│   ├── author ─────────────────────────────────────────────────────────────┐
│   └── itemReviewed ─→ Organization                                        │
└── Leora Organization (mirror) ───────────────────────────────────────────┐│
    └── founder ───────────────────────────────────────────────────────────┐││
                                                                           │││
Leora Home Health                                                          │││
├── Organization (@id: leorahomehealth.com#organization) ←─────────────────┘││
│   ├── founder ─→ Monica Herra-Hernandez                                   ││
│   └── hasOfferCatalog ─→ [PAS, HHA, Skilled Nursing, etc.]               ││
├── Person: Monica Herra-Hernandez (@id: ...#owner-monica...) ←────────────┘│
│   ├── worksFor ─→ Organization                                            │
│   └── affiliation ─→ Organization                                         │
└── (matches mirror in IntegrityStudio.ai) ←────────────────────────────────┘
```

## Files Modified

| File | Location | Changes |
|------|----------|---------|
| `unified-knowledge-graph-schema.html` | PersonalSite/_includes/ | Added ProfilePage, CollectionPage, updated org references |
| `personal-site-schema.json` | PersonalSite/schema/ | Static snapshot with all enhancements |
| `schema-structured-data.json` | IntegrityStudio.ai/docs/schema/ | Added review #4, Leora org, updated contact info |
| `schema-org-markup-v2.json` | IntegrityStudioClients/Leora/ | Added Monica Herra-Hernandez Person, founder reference |

## Key Design Decisions

### 1. Canonical @id URIs
Used full URLs with hash fragments as @id values. This allows:
- Cross-domain references without ambiguity
- Search engines to potentially crawl and link entities
- Future federation of knowledge graphs

### 2. Mirror Entities
When referencing external entities heavily (like in a review), include a "mirror" of the referenced entity in the local schema. This:
- Provides context if the external schema isn't crawled
- Ensures rich snippets work even without cross-domain resolution
- Maintains the @id consistency for when resolution does work

### 3. Bidirectional References
Always create relationships in both directions where appropriate:
- Review → Author (via @id)
- Person → Organization (via worksFor)
- Organization → Person (via founder)

## SEO and Knowledge Graph Benefits

1. **Rich Snippets**: Review markup with proper author references enhances SERP display
2. **Entity Understanding**: Search engines can understand organizational relationships
3. **Knowledge Panel Potential**: Connected entities may contribute to knowledge panel data
4. **AI Comprehension**: LLMs can better understand the business relationships and context

## Metrics

| Site | Initial Score | Final Score | Improvement |
|------|---------------|-------------|-------------|
| PersonalSite | 62/100 | 78.6/100 | +16.6 |
| IntegrityStudio.ai | 100/100 | 100/100 | maintained |
| Leora Home Health | - | enhanced | +founder link |

## Next Steps

1. **Validate with Google Rich Results Test**: Ensure all cross-domain references render correctly
2. **Add more client reviews**: Continue pattern of external author references
3. **Inspired Movement integration**: Link dance studio schema to PersonalSite projects
4. **Monitor Search Console**: Track entity recognition improvements
5. **Consider Schema.org Actions**: Add potential actions for booking/contact

## References

- [ID Schema for SEO, LLMs, Knowledge Graphs](https://momenticmarketing.com/blog/id-schema-for-seo-llms-knowledge-graphs)
- PersonalSite: `/Users/alyshialedlie/code/PersonalSite/_includes/unified-knowledge-graph-schema.html`
- IntegrityStudio.ai: `/Users/alyshialedlie/code/ISPublicSites/IntegrityStudio.ai/docs/schema/schema-structured-data.json`
- Leora: `/Users/alyshialedlie/code/IntegrityStudioClients/Leora/schema-org-markup-v2.json`
- Inspired Movement: `/Users/alyshialedlie/code/IntegrityStudioClients/InspiredMovement/schema/dance-studio-schema.json`
