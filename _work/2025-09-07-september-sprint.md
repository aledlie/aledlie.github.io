---
layout: single
title: "September Sprint: Jekyll, Schemas, and MCP Servers"
date: 2025-09-07
author_profile: true
breadcrumbs: true
categories: [work-updates]
excerpt: "A whirlwind week of fixing build bugs, improving schema.org implementation, and diving deep into MCP server development."
header:
  overlay_image: /images/cover-work.png
  teaser: /images/cover-work.png
---

## What I Accomplished This Week

This was one of those productive weeks where everything just clicked. Here's what got done:

### Jekyll & Site Infrastructure
- ✅ Fixed that annoying [build bug](https://vercel.com/aledlies-projects/aledlie/FPBXEKNx9KTEr2rvKMT5bWKcHXpZ?filter=errors) that only appeared in Vercel
- ✅ Finished the homage clone styling for Sumedh's website ahead of the 31st deadline
- ✅ Wrote and posted the August 31st Homage post

### Data & Analysis
- ✅ Improved calendar scrapers & importers
- ✅ Updated [When Do I Write Code](https://www.sumedhmjoshi.com/programming/when-do-i-write-code/) with data from my own GitHub profile
- ✅ Posted my update as a blog entry on this site
- ✅ Analyzed golf statistics using Sumedh's posts to explain neural network performance

### MCP Server Development
The real focus this week was on MCP (Model Context Protocol) servers. I:

- ✅ Created an MCP for my various important filesystems
- ✅ Built an MCP server that auto-identifies appropriate schemas out of HTML code
- ✅ Read [OpenAI's MCP Server specs](https://blog.christianposta.com/semantics-matter-exposing-openapi-as-mcp-tools/) and implemented one
- ✅ Parsed [this comprehensive list](https://github.com/SchemaStore/schemastore/tree/master/src/schemas/json) of JSON struct definitions
- ✅ Explored [TypeScript data tools](https://json-schema.org/tools?query=&sortBy=name&sortOrder=ascending&groupBy=toolingTypes&licenses=&languages=TypeScript%2CYAML&drafts=&toolingTypes=&environments=&showObsolete=false&supportsBowtie=false)

### Schema.org Integration
- ✅ Followed best practices for integrating schema.org and JSON data
- ✅ Got the schema auto-identification working smoothly

## What's Next

Looking ahead, I'm focusing on:

1. **Data Aggregation MCP**: Building an MCP server that scrapes emails, docs, messages, and websites to create TODO lists (using Bright Data)
2. **ML Commons Contribution**: Getting more involved with the [AI Risk & Reliability](https://mlcommons.org/working-groups/ai-risk-reliability/ai-risk-reliability/) working group
3. **BrightData Integration**: Scaling up my SingleSiteScraper with BrightData

It's been a productive week. Now to keep the momentum going!
