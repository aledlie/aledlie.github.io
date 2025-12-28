---
layout: single
title: "Current Projects & Active TODO List"
date: 2025-11-16
author_profile: true
categories: [work-updates]
excerpt: "What I'm building, learning, and working on right now - from MCP servers to schema optimization, and everything in between."
header:
  image: /assets/images/cover-work.png
  teaser: /assets/images/cover-work.png
---

## Fun Websites/Projects I've Made

Projects I'm not *completely* embarrassed of:

- [Website Analyzer at sitereader.io](https://sitereader.io/)
- [Sumedh's site, of course](https://www.sumedhmjoshi.com/). Source code is at [my public github repo, Homage](https://github.com/aledlie/Homage).
- [This site's source code](https://github.com/aledlie/aledlie.github.io), which is by far the most front-end design work I've ever done - and by far the most work I've ever done on a side-project, ever. Built on a different stack but with the same look and theme (minimal-mistakes) as the one Sumedh used to build his blog site back in 2014. I even managed to use the same header images he did, which on its own took me literally days of AI-assisted attempts at discovering tooling to restore the images that had corrupted over 11 years. Turns out, it's because they were actually, literally, un-recoverable - at least the ones I was using, which were from the last commit he made to his site - but I eventually found one, single commit he'd made in his history where the image files still had enough data to be recoverable.
- [This MCP Server That Visualizes Commit Data](https://github.com/aledlie/RepoViz) *Note: Probably the most fun to work on of all of these
- [Site Performance Test MCP Server](https://github.com/aledlie/PerformanceTest)
- [My actually organized dotfiles](https://github.com/aledlie/dotfiles)
- [This one was fun: easy bootstrap for new GitHub Actions](https://github.com/aledlie/automate.ts). Written mostly to make my own, to auto-convert horrific-looking, confusing .css into pretty little descriptive Tailwind classes, without changing any aesthetics. I *heavily* AI-assist all of my UX now, because I've always hated front-end. Which is fine, but I like to actually know what it's doing, too.
- I have about 20 other half- or mostly-written projects, most of which are listed in the bottom part below; hopefully most of them will have moved up to the top half of this screen by the time Halloween rolls around.

## Recent Completions

**Tasks finished between August 29th and Sept 7th:**
- [x] Fix jekyll [build bug](https://vercel.com/aledlies-projects/aledlie/FPBXEKNx9KTEr2rvKMT5bWKcHXpZ?filter=errors) that appears to only happen in Vercel :/
- [x] Finish good-enough homage clone styling for homage website ahead of the 31st
- [x] Write August 31st Homage post
- [x] Post August 31st Homage post
- [x] Improve calendar scrapers & importers in general
- [x] Update [this post](https://www.sumedhmjoshi.com/programming/when-do-i-write-code/) with data from my own github profile
- [x] Post my update to [this post](https://www.sumedhmjoshi.com/programming/when-do-i-write-code/) as a blog entry on this site
- [x] Use [this post](https://www.sumedhmjoshi.com/golf/how-good-is-the-average-golfer/) and [this post](https://www.sumedhmjoshi.com/golf/how-many-of-me-would-it-take-to-shoot-par-in-a-scramble/) to explain why a neural network trained on your brain would be better than you are at golf, or knowing your own name.
- [x] Grab and analyze 2025 data from [this flights website](https://openflights.org)
- [x] Integrate BrightData into my SingleSiteScraper to scale it and prettify it
- [x] Create MCP for my various important filesystems
- [x] Follow [this format] for integrating schema.org and json data
- [x] MCP server that auto-identifies appropriate schemas out of html code
- [x] Read [OpenAI's MCP Server specs](https://blog.christianposta.com/semantics-matter-exposing-openapi-as-mcp-tools/) and make one with it
- [x] Parse [this](https://github.com/SchemaStore/schemastore/tree/master/src/schemas/json) very comprehensive list of json struct definitions
- [x] Play around with [these](https://json-schema.org/tools?query=&sortBy=name&sortOrder=ascending&groupBy=toolingTypes&licenses=&languages=TypeScript%2CYAML&drafts=&toolingTypes=&environments=&showObsolete=false&supportsBowtie=false) typescript data tools

## Active TODO List

**In Process:**
- [ ] MCP server that scrapes all of my emails, docs, messages, regular websites, and creates yet more TODO lists and emails out of them - probably using Bright Data
- [ ] 'attending working groups', at least - Contribute to the ML Commons [AI Risk & Reliability](https://mlcommons.org/working-groups/ai-risk-reliability/ai-risk-reliability/) working group

**Up Next:**
- [ ] Write contributing guidelines (move fast, break things, plz don't break *everything*)
- [ ] Load [this](https://medium.com/@aywengo/building-my-first-mcp-server-schema-registry-dd37b9c94ba1) as a best-practices README.md into core amazonq resources
- [ ] Update [this post](https://www.sumedhmjoshi.com/misc/how-manys-are-there-to-get-from-austin-to-mumbai/) with data listed above
- [ ] Actually post the article listed directly above
- [ ] Read [this article](https://artificialanalysis.ai/) on NN performance, which was probably out of date the moment it was published.
- [ ] Work these two quotes somewhere into this website:
  - "Selection bias is a hell of a drug." ~F. Perry Wilson, MD, MSCE
  - "The price of reliability is the pursuit of the utmost simplicity." ~C.A.R. Hoare (1980 ACM Turing Award Lecture)
- [ ] Figure out if I want to use [AWS SageMaker](https://aws.amazon.com/sagemaker/) (So far, I do not, although I have been using AWS & Amazon Q quite a bit)
- [ ] Create MCP out of HHSC compliance research that spits out a TODO-list
- [ ] Create MCP out of all Integrity Studio's data and turns it into even more Todo-lists
- [ ] Self-host [n8n](https://docs.n8n.io/hosting/?utm_source=devto&utm_medium=devchallenge), probably on [Docker](https://docs.n8n.io/hosting/?utm_source=devto&utm_medium=devchallenge)
- [ ] Look into this use case for [BrightData](https://github.com/MeirKaD/MCP_ADK) as a quick-start
- [ ] Create some truly ridiculous stuff with my [MailSlurp](https://app.mailslurp.com/dashboard/) MCP server
- [ ] Another [data schema](https://ref.gs1.org/voc/) to play around with/make an MCP server out of
