---
layout: single
author_profile: true
classes: wide
title: "How We Made Our AI Helper Report Cards Smarter and More Fair"
date: 2026-02-16
categories: [observability, agent-quality, telemetry]
tags: [otel, deepeval, genai-semconv, agent-auditor, rule-based-scoring, cost-tracking, jaccard-similarity]
excerpt: "We upgraded our AI helper grading system with a new cost and speed score, fairer checklists, better overlap detection, and richer tracking data."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
url: https://www.aledlie.com/reports/2026-02-16-agent-auditor-enhancement-telemetry-rule-based-scoring/
permalink: /reports/2026-02-16-agent-auditor-enhancement-telemetry-rule-based-scoring/
schema_type: analysis-article
schema_genre: "Session Report"
---

## What This Is About

We improved the system that grades our AI helpers. Think of it like upgrading a report card. The old version had five categories. Now it has six. And the grading is more fair and consistent.

We made changes in three areas:

- **What we track:** We now collect more information about what AI helpers do and how well they do it.
- **How we store that info:** Our data system knows about the new labels we are tracking.
- **How we grade:** The scoring rules are clearer, more consistent, and cover a new area: cost and speed.

**Here is what changed at a glance:**

- 5 new output quality attributes track what AI helpers produce
- 3 existing GenAI standard labels now emitted on agent spans
- We created 1 new grading category (Efficiency and Cost)
- We replaced 3 subjective grades with repeatable checklists
- The maximum score went from 50 to 60

## What We Track Now

### New Output Labels

When an AI helper finishes a task, we now record extra details about its output. These labels answer simple yes-or-no questions:

- **Does the output have structure?** Does it use headings or tables to organize information?
- **Does the output include code?** Did the helper write any code snippets?
- **Does the output suggest actions?** Did it recommend next steps or flag issues?
- **Was the output cut short?** Did it end abruptly or hit a size limit?
- **Was the output too short?** Did it give a very brief answer when more was expected?

We also estimate how much each request costs. We do this by measuring the size of the input and output.

### AI Helper Identity Labels

We now attach three standard identity labels to every AI helper action. These labels record the helper's name, its ID, and what kind of task it ran. This makes it easier to search for a specific helper's work in our data.

## How the Grading Works Now

The grading system scores each AI helper on six categories. Each category is worth up to 10 points. The total possible score is 60.

### New Category: Efficiency and Cost (up to 10 points)

This is the brand-new category. It measures how well an AI helper uses time and resources. We look at four things:

- **Speed:** How fast did it finish compared to others?
- **Error rate:** Did it hit errors or have to retry a lot?
- **Output value:** Did it produce useful output relative to the cost?
- **Right mode:** Did it run in the background when it should have?

### Improved Category: Tracking Data Health (up to 10 points)

This category checks whether the AI helper sends enough usage data for us to monitor it. We added two new checks:

- **Usage trend:** Is usage going up or down compared to last week?
- **Session variety:** Is the helper used across many different sessions, or just one?

### Improved Category: Definition Quality (up to 10 points)

Before, a human reviewer judged this category. That meant two reviewers could give different scores. Now we use a 10-item checklist. Each item is worth 1 point. The checklist covers things like:

- Does the helper have a name and description?
- Is the description long enough to be useful?
- Does it list which tools it can use?
- Does it explain what its output should look like?

Every reviewer gets the same score every time. Like grading a quiz with an answer key.

### Improved Category: Instructions Quality (up to 10 points)

Same idea here. We replaced a subjective review with a 10-item checklist. It checks things like:

- Does it describe the helper's role?
- Does it include step-by-step instructions?
- Does it set guardrails and limits?
- Does it show examples of expected output?

Again, this gives the same score every time. No guesswork.

### Improved Category: Overlap and Redundancy (up to 10 points)

This category checks whether two AI helpers do the same job. We now use a math-based approach, like comparing two shopping lists to see how many items they share.

We compare each helper's tool list and description to every other helper. If two helpers share most of the same tools and similar descriptions, we flag them as overlapping. The more overlap, the lower the score.

### Improved Category: Usage Fit (up to 10 points)

This checks whether people use the AI helper for its intended purpose. We look at the helper's description to figure out what category of work it should handle. Then we check whether real usage matches that category. A high match means a high score.

### Grade Scale

The letter grades work like school:

- **A (48-60):** Excellent. The helper is well-built and well-used.
- **B (36-47):** Good. Some room for improvement.
- **C (24-35):** Needs work. Several areas need attention.
- **D (below 24):** Poor. Major improvements needed.

The system still shows the old 5-category subtotal (out of 50) for comparison with past scores.

## Why We Made These Choices

**Checklists over opinions.** When a human judge scores something, two judges might disagree. A checklist gives the same result every time. This makes it possible to track scores over time and see real trends.

**Estimating cost from output size.** We cannot see the exact cost of each AI helper call. But we can measure how much text goes in and comes out. That gives us a good-enough estimate to compare helpers.

**Labeling every action.** We put the helper's name and ID on every tracked action. This way, you can search for one helper's work without needing to piece together related records.

## How We Verified It

- All code compiles without errors in both projects.
- The data system builds successfully.
- New labels are accessible at runtime.
- All previously tracked data still works the same way. Nothing broke.

## Readability

| Metric | Score |
|--------|-------|
| Flesch Reading Ease | 14.1 |
| Flesch-Kincaid Grade | 14.3 |
| Word Count | 749 |
| Reading Time | ~88s |

Scores reflect the tabular, specification-heavy nature of the underlying changes. The accessible version above targets a general developer audience.
