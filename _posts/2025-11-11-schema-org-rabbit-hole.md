---
layout: single
title: "That Time I Fell Down a Schema.org Rabbit Hole and Emerged with a Knowledge Graph"
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
excerpt: "Or: How I spent an entire session turning 11 messy schema files into 1 beautiful knowledge graph (and then made 3 more schema files because apparently I can't help myself)"

# Enhanced Schema.org structured data
schema_type: TechArticle
schema_dependencies: "Jekyll, Schema.org vocabulary, an unhealthy obsession with optimization"
schema_proficiency: "Intermediate (but convinced myself it was Advanced)"
schema_section: "SEO"
schema_about: "Schema.org Structured Data Implementation"
---

## The Setup

So there I was, minding my own business, when I noticed my personal site had **11 separate Schema.org include files**. Eleven! Like some kind of schema hoarder who couldn't let go of a single `<script type="application/ld+json">` tag.

You know that feeling when you look at code you wrote years ago and think "what was I even *doing* here?" Yeah. That.

The worst part? Half of them were duplicating the same entities. I had my Person schema defined in like 4 different places. My website had an identity crisis more severe than mine during that 6-month period at Facebook where I was convinced I was secretly a fraud who would be discovered any day now. (Spoiler: still convinced, just better at hiding it.)

## The Problem (According to Me, Who Clearly Needed a Project)

Here's what was wrong:
- 11 fragmented schema files (why? WHY?!)
- Duplicate Person entities everywhere (apparently I really wanted Google to know who I am)
- Nested objects instead of proper @id references (because who needs best practices?)
- Organizations pointing to external URLs (missing the whole point of knowledge graphs)
- No unified entity relationships (just vibes)

It was like I'd read the Schema.org documentation, nodded thoughtfully, and then done the exact opposite of everything it recommended.

## The Solution (Or: How I Turned One Problem Into Several Solved Problems)

I discovered this absolutely *fantastic* article from [Momentic Marketing](https://momenticmarketing.com/blog/id-schema-for-seo-llms-knowledge-graphs) about using @id attributes to build knowledge graphs. And friends, I got **ideas**.

### Phase 1: Unified Knowledge Graph

First, I needed to understand what I even had. Turns out:
- 1 Person (me, allegedly)
- 1 WebSite (this one)
- 1 Blog (the thing you're reading)
- 2 Organizations (Integrity Studios and InventoryAI.io)

So I built a *knowledge graph*. Using actual @id references. Following actual best practices. Like a responsible adult developer. (I'm as shocked as you are.)

The format is beautiful: `{canonical_url}#{entity_type}`

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
- 100% @id validation pass rate (I'm putting this on my resume)
- 15 bidirectional entity relationships (Person ↔ WebSite, Person → Organizations, Blog ↔ WebSite)

Did I over-engineer this? Absolutely. Do I regret it? Not even a little bit.

### Phase 2: Enhanced Blog Schemas (Because One Success Wasn't Enough)

Then I had a *realization*. (This is the point in the story where my partner would roll their eyes.)

Not all blog posts are created equal! I had:
- **Technical guides** (like that Jekyll update nightmare)
- **Performance analysis** (with actual data and everything)
- **Personal narratives** (like this one, which is definitely getting too meta)

So naturally, instead of leaving well enough alone, I created **three new specialized schema types**:

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

You know what's more satisfying than writing code? Writing documentation *about* the code. I created **8 comprehensive guides**:

1. Testing procedures (3 phases, very official)
2. Search Console monitoring (daily/weekly/monthly schedules)
3. Implementation guide (800+ lines of "here's how to use this")
4. Analysis reports (with *statistics*)
5. Before/after comparisons (because I needed validation)

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

And BAM. Proper Schema.org markup. SEO-friendly. Knowledge-graph-enabled. Ready for the LLM overlords to index my thoughts.

## Expected Benefits (According to The Internet)

Apparently this should give me:
- Better technical documentation indexing
- Rich results in Google (the fancy kind)
- Knowledge panel data (if Google deems me worthy)
- Improved CTR on enhanced posts

Will any of this actually matter? Probably not. But my schemas will be *beautiful* and that's what really counts.

## The Irony

The absolute *best* part about all of this? I spent an entire session optimizing Schema.org markup for better SEO on a personal blog that gets like... maybe 12 visitors a month (7 of them are probably me checking if my changes deployed).

But you know what? Those 12 visitors are going to have the BEST structured data experience of their lives.

## Lessons Learned

1. **@id Best Practices Matter**: Format is `{canonical_url}#{entity_type}`. Stable IDs only. No timestamps or query parameters, you monster.

2. **Schema Type Selection is An Art**: Different content deserves different schemas. This is not over-engineering, this is *craft*.

3. **Validation Saves Lives**: Or at least saves you from deploy-time errors. 100% validation pass rate is achievable and feels amazing.

4. **Documentation is Love**: Future me (probably next week) will appreciate these 8 guides when I inevitably forget how all this works.

5. **Sometimes Over-Engineering is Exactly Right**: Sure, I could've just left it alone. But where's the fun in that?

## The Stats (For My Fellow Nerds)

- **17 files changed**
- **4,388 insertions** (I was BUSY)
- **45 deletions** (minimal destruction)
- **2 blog posts enhanced** with fancy new schemas
- **8 documentation files** for a personal blog (this is fine)
- **91% file reduction** (I will never stop bragging about this)
- **100% @id validation** (✨ perfection ✨)

## What's Next?

Well, according to my meticulously documented monitoring guide:
- Week 1: Watch Google Search Console like a hawk
- Weeks 2-4: Check if schemas are being detected
- Months 2-3: See if rich results appear
- Month 6+: Analyze knowledge graph impact on my 12 monthly visitors

Will I actually monitor all this? Let's be real, I'll check it obsessively for 3 days and then forget about it until I write another blog post.

## In Conclusion

I turned 11 messy schema files into 1 beautiful unified knowledge graph, then immediately created 3 more specialized schemas because apparently I can't help myself.

Is this necessary? No.
Is it over-engineered? Probably.
Do my schemas now follow best practices for SEO, LLMs, and knowledge graphs? Absolutely.
Am I proud of this? You bet.

Now if you'll excuse me, I need to add "Schema.org Knowledge Graph Expert" to my LinkedIn profile.

---

**P.S.** If you actually read this entire post about Schema.org optimization on a personal blog, we should be friends. Or you should seek professional help. Possibly both.

**P.P.S.** Yes, I did use the new TechArticle schema for this post. Meta? Absolutely. Appropriate? Debatable. Do I care? Not even a little bit.

---

*This post brought to you by an unhealthy obsession with optimization, too much free time, and the MCP tools that made it all possible.*
