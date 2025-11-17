---
layout: single
title: "That Time I Remembered IDs are important"
date: 2025-11-11
author_profile: true
categories:
  - Web Development
  - SEO
  - Schema.org
tags:
  - schema-org
  - knowledge-graph
  - seo
  - json-ld
  - jekyll
  - over-engineering
excerpt: "Or: How I spent an entire session turning 11 messy schema files into 1 graph"

# Enhanced Schema.org structured data
schema_type: TechArticle
schema_dependencies: "Jekyll, Schema.org vocabulary, an unhealthy obsession with optimization"
schema_proficiency: "Intermediate (but convinced myself it was Advanced)"
schema_section: "SEO"
schema_about: "Schema.org Structured Data Implementation"
---

## The Setup

So there I was, minding my own business, when I noticed my this site had **11 separate Schema.org include files**. Eleven! Like some kind of schema hoarder who couldn't let go of a single `<script type="application/ld+json">` tag.

I restarted writing this blog in July, when I was still just sorting out what was available to me in the open source world for big projects, as opposed to the facebook core stack that I'd gotten used to over 8 years.  You know that feeling when you look at code you wrote years ago and think "what was I even *doing* here?" Yeah. That.  Except it only took 3-4 months.

Schema.org seemed like the best open-source equivalent to a universal language for something that one of my personal heros, Oliver Dodd, designed at Facebook, called EntSchema.  So I started using it for this blog in July.

But I forgot to give them entity ids!  When I looked recently, half of them were duplicating the same entities. I had my Person schema defined in like 4 different places.  I just threw schema.org at my site and gave it an identity crisis more severe than mine during my first 6-months at Facebook where I was convinced I was secretly a fraud who would be discovered any day now. (Spoiler: still convinced, just better at hiding it.  Actually, I just wrote that down, so worse at hiding it.)

## The Problem

Here's what was wrong:
- 11 fragmented schema files (why? WHY?!)
- Duplicate Person entities everywhere (apparently I really wanted Google to know who I am)
- Nested objects instead of proper @id references (because who needs best practices?)
- Organizations pointing to external URLs
- No unified entity relationships (just vibes)

It was like I'd read the Schema.org documentation, nodded thoughtfully, and then done the exact opposite of everything it recommended.

## The Solution (Or: How I Turned One Problem Into Several Problems)

I read an article from [Momentic Marketing](https://momenticmarketing.com/blog/id-schema-for-seo-llms-knowledge-graphs) about using @id attributes to build knowledge graphs. And look, the term 'knowledge graph' makes me cringe a bit.  It's used by a lot of companies out there, branding themselves as AI data companies, and referring to it as the solution for everything - context windows, reducing hallucinations, making sure your printer never annoys you again.  It's just a *graph.*  You, know, [graph?](https://en.wikipedia.org/wiki/Graph_theory).  But graphs *are* very useful.  And you *do* need to identify the vertices(nodes) in them, and aggregate data about those vertices so that the edges function correctly.  So you need ids for your vertices.  And your edges too, actually, but that's a little less straightforward than the n00b mistake I made by not including them in the vertices.  Oliver Dodd had held my hand for too many years with his beautiful EntSchemas, and handled all of that for me - so 4 months later, I'm writing a quick fix myself, and then writing a better ID algorithm that will be more robust as our databases and data sources grow.

### Phase 1: Unified (ugh, Knowledge) Graph

First, I needed to understand what I had:
- 1 Person (me, allegedly)
- 1 WebSite (this one)
- 1 Blog (the thing you're reading)
- 2 Organizations (Integrity Studios and InventoryAI.io)

So I built a graph. Using actual @id references. Like a responsible adult developer, going back and fixing my open-source n00b mistakes. (I'm as shocked as you are.)

The format: `{canonical_url}#{entity_type}`

```json
{
  "@type": "Person",
  "@id": "https://www.aledlie.com#person",
  "worksFor": [
    {
      "@id": "https://www.aledlie.com/organizations/integrity-studios#organization"
    }
  ]
}
```

Look at that. It's *clean*. It has *relationships*. It follows *SEO best practices for knowledge graphs and LLMs*.

**Results:**
- 11 files → 1 file (that's a 91% reduction, in case you're counting)
- 15 bidirectional entity relationships (Person ↔ WebSite, Person → Organizations, Blog ↔ WebSite)


### Phase 2: Enhanced Blog Schemas (Because One Success Wasn't Enough)

But of course, blogs actually have both *text* in them, styles, and types.  And
according to schema.org and pydantic, mine had 3 types:
- **Technical guides** (like that Jekyll update nightmare)
- **Performance analysis** (with actual data and everything)
- **Personal narratives** (like this one, which is definitely getting too meta)


#### TechArticle Schema
For posts like "Updating Jekyll in 2025" where I explain technical stuff while complaining about M2 chips.

Properties:
- `dependencies`: "Ruby 3.x, Jekyll 4.x, Bundler 2.x, pain"
- `proficiencyLevel`: "Intermediate (I hope)"
- `articleSection`: "Jekyll"

#### AnalysisNewsArticle Schema
For my Wix performance post where I actually included data and metrics like a *real* engineer.

Properties:
- `dateline`: "November 2025"
- `backstory`: "Performance analysis based on real-world production data (I swear)"
- `about`: "Web Performance Optimization"

#### HowTo Schema
For future step-by-step tutorials. Because apparently I'm planning to write more of these.

Properties:
- `steps`: Array of actual steps (revolutionary!)
- `tools`: What you'll need
- `totalTime`: "PT2H" (2 hours in ISO 8601, because we're fancy)

All of them reference the unified knowledge graph via @id. It's knowledge graphs all the way down.

## The Documentation (Or: Future Me Will Thank Present Me)

1. Testing procedures (3 phases, very official)
2. Search Console monitoring (daily/weekly/monthly schedules)
3. Analysis reports (with *statistics*)
4. Before/after comparisons (because I needed validation)

I even created a decision tree for choosing the right schema type. A DECISION TREE. For a personal blog.

```
Is it technical documentation?
├─ Yes → Does it have numbered steps?
│   ├─ Yes → HowTo
│   └─ No → TechArticle
└─ No → Does it analyze data?
    ├─ Yes → AnalysisNewsArticle
    └─ No → BlogPosting (boring)
```

## The Front Matter (Or: How to Use This Madness)

Now I just add this to my blog post front matter:

```yaml
---
title: "My Post Title"
schema_type: TechArticle
schema_dependencies: "Ruby, sanity (optional)"
schema_proficiency: "Intermediate"
---
```

And I get ~more proper Schema.org markup.  Ready for our new  LLM overlords to index my thoughts.

## Expected Benefits (According to The Internet)

Apparently this should give me:
- Better technical documentation indexing
- Rich results in Google (the fancy kind)
- Knowledge panel data (if Google deems me worthy)
- Improved CTR on enhanced posts

Will any of this actually matter? Probably not. But my vertices will have ids, and not a bunch of duplicates, so I feel slightly less shame.

## The Irony

The absolute *best* part about all of this? I spent an entire session optimizing Schema.org markup for better SEO on a personal blog that gets like... maybe 12 visitors a month (7 of them are probably me checking if my changes deployed).

But you know what? Those 12 visitors are going to have the BEST structured data experience of their lives.

## Lessons Learned

1. **@id Best Practices Matter**: Current format is `{canonical_url}#{entity_type}`. Stable IDs only. No timestamps or query parameters, you monster.  But I am going to make this way more robust later.

2. **Validation Saves Lives**: Or at least saves you from deploy-time errors. 100% validation pass rate is achievable and feels amazing.

5. **Sometimes Over-Engineering is Fun**: Sure, I could've just left it alone. But where's the fun in that?

## The Stats (For My Fellow Nerds)

- **17 files changed**
- **4,388 insertions** (Thanks, Claude)
- **45 deletions** (minimal destruction)
- **2 blog posts enhanced** with fancy new schemas
- **91% file reduction** (concise + precise -> beautiful)
- **100% @id validation** (✨ perfection ✨)

## In Conclusion

Was this necessary? No.
Is it over-engineered? Probably.
Do my schemas now follow best practices for SEO, LLMs, and knowledge graphs? Absolutely.
Am I proud of this? Sort of.  I *am* proud of the 91% file reduction.

---

**P.S.** If you actually read this entire post about Schema.org optimization on a personal blog, we should be friends. Or you should seek professional help. Possibly both.

**P.P.S.** Yes, I did use the new TechArticle schema for this post. Meta? Absolutely. Appropriate? Debatable. Do I care? Not even a little bit.

---

*This post brought to you by an unhealthy obsession with optimization, and always working on six separate projects at a time.*
