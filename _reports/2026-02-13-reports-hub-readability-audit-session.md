---
layout: single
title: "AI-Assisted Website Audit: How We Quality-Checked 22 Pages in One Session"
date: 2026-02-13
author_profile: true
classes: wide
categories: [observability, web-quality]
tags: [opentelemetry, readability-audit, accessibility, dark-mode, responsive-design, reports-hub, session-analysis]
excerpt: "An AI assistant audited 22 web pages for readability and accessibility issues, producing a prioritized backlog of improvements -- all tracked through OpenTelemetry instrumentation."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
---

**Session Date**: 2026-02-13<br>
**Project**: ReportsHub (integritystudio.io)<br>
**Focus**: Readability & Accessibility Audit Across All Report Pages<br>
**Session Type**: Quality Audit + Documentation<br>
**Session ID**: `01af120d-c2c7-4a0b-8e65-1c0276987bc0`

## What Happened

We ran an AI-assisted audit of the entire [Integrity Studio reports hub](https://integritystudio.io) -- a collection of 22 HTML pages spanning client research reports, opportunity analyses, market studies, and operational dashboards. The goal: find every readability and accessibility issue that could make these reports harder to use on phones, in dark mode, or for readers who need larger text.

The session produced a comprehensive backlog document (`docs/BACKLOG.md`) with 17 prioritized issues, a graded scorecard for every project directory, and a phased plan to bring all pages up to a consistent quality bar.

## What We Found

### The Good News

One report -- the Capital City Village analysis -- already met every standard we checked for. It became our "gold standard" reference: proper dark mode support, responsive tables, print-friendly styles, keyboard navigation, and accessible font sizing. This proved the template was achievable; most other pages just hadn't caught up yet.

### The Issues (By Priority)

We categorized findings into four severity levels:

| Priority | Count | Examples |
|----------|-------|---------|
| **Critical** | 3 | No dark mode on 15 pages; no mobile breakpoints on 11 pages; tables overflow on small screens |
| **High** | 4 | Fixed sidebar breaks mobile layout; external font dependency violates self-contained rule; inconsistent color scheme conventions |
| **Medium** | 6 | Missing semantic landmarks; small source text; low-contrast opacity values; paragraphs too wide for comfortable reading |
| **Low** | 4 | No skip-to-content links; no print styles; CSS typo in one file |

### Template Families

The audit revealed that most pages fall into one of five template families, which means fixes can be applied in batches rather than file-by-file:

- **Research Report template** (11 pages) -- the most common, used across balloon-collective, edgar_nadyne, holliday_lighting, integrity-studio-ai, trp-austin, and zoukmx
- **Capital City template** (2 pages) -- the reference standard
- **Leora Forms/Dashboard** (4 pages) -- form and dashboard layouts with pixel-based sizing
- **Hub/Portal pages** (4 pages) -- navigation portals linking to reports
- **Unique layouts** (1 page) -- the TRP competitor analysis with its inverted dark-first design

### Scorecard Snapshot

| Directory | Grade | Key Issue |
|-----------|-------|-----------|
| capital_city | **A** | Reference implementation |
| leora_research | **B+** | Portal is solid; forms use px sizing |
| holliday_lighting | **B-** | Mixed quality; one file has external font dependency |
| edgar_nadyne | **C+** | No dark mode; inline grid layouts break on mobile |
| balloon-collective | **C** | No dark mode or responsive design |
| integrity-studio-ai | **C** | No dark mode or responsive design |
| trp-austin | **C-** | Inconsistent conventions between two files |
| ngo-market | **D+** | Fixed sidebar unusable on mobile |
| zoukmx | **C** | No dark mode; otherwise clean |

## How the AI Session Worked

The entire audit was conducted through a Claude Code session with OpenTelemetry instrumentation tracking every operation. Here's what the telemetry captured:

### Session Telemetry Overview

| Metric | Value |
|--------|-------|
| Session ID | `01af120d-c2c7-4a0b-8e65-1c0276987bc0` |
| Working Directory | `/Users/alyshialedlie/reports` |
| Git Branch | `main` |
| Repository | `integritystudio/reports` |
| Node.js | v25.6.0 |
| npm | 11.8.0 |

### What the AI Did (Tool Operations)

The session executed **39 tool operations** with a **100% success rate** -- no failed operations across the entire audit.

| Tool | Count | What It Did |
|------|-------|-------------|
| Bash | 34 | Directory listing, file discovery, telemetry queries |
| TaskCreate | 1 | Created the audit tracking task |
| TaskUpdate | 2 | Updated task progress and completion |
| Edit | 1 | Modified existing file content |
| Write | 1 | Created the BACKLOG.md deliverable |

### Specialized Agents

The session launched an **Explore agent** to quickly scan the repository structure and identify all HTML files while excluding submodule directories (ai-news, ai-observability, calender-updates, isabel_budenz, john_skelton).

### Observability Pipeline

Every tool call, agent launch, and skill check was recorded as an OpenTelemetry span and exported to both local storage and SigNoz Cloud:

| Signal | Destination | Status |
|--------|-------------|--------|
| Traces | Local JSONL + SigNoz Cloud | Active |
| Logs | Local JSONL + SigNoz Cloud | Active |
| Metrics | SigNoz Cloud | Active |

The session generated **54 trace spans** and **73 log entries** across the audit workflow:

| Span Type | Count | Purpose |
|-----------|-------|---------|
| `builtin-post-tool` | 37 | Tracked every tool completion |
| `skill-activation-prompt` | 7 | Checked for matching skills on each prompt |
| `session-start` | 3 | Session initialization and resumptions |
| `builtin-pre-tool` | 3 | Pre-tool validation checks |
| `agent-pre-tool` / `agent-post-tool` | 2 | Explore agent lifecycle |
| `plugin-pre-tool` / `plugin-post-tool` | 2 | Plugin integration hooks |

### Log Activity

| Severity | Count | Examples |
|----------|-------|---------|
| INFO | 50 | Tool completions, session starts, context tracking |
| DEBUG | 23 | Skill activation checks, environment validation |

### Broader Context: Today's Platform Activity

This audit session was part of a busy day across the platform:

- **86,400 total hook executions** recorded in the performance log
- **23,180 trace spans** and **45,701 log entries** across all sessions today
- **35 session starts** across multiple projects
- **22 agent launches** including Explore, general-purpose, code-reviewer, and webscraping-research-analyst agents

## What Happens Next

The BACKLOG.md document organizes fixes into four phases:

1. **Phase 1 -- Critical Fixes**: Add dark mode and responsive breakpoints to the 11 research-template pages (highest impact, moderate effort)
2. **Phase 2 -- High Priority**: Fix the ngo-market sidebar, remove external font dependency, standardize color scheme conventions
3. **Phase 3 -- Medium Priority**: Add semantic HTML landmarks, improve contrast ratios, constrain paragraph widths
4. **Phase 4 -- Polish**: Add skip-to-content links, print styles, fix the CSS typo

The phased approach means the most impactful improvements -- dark mode and mobile support -- ship first, with diminishing-priority refinements following.

## Key Takeaway

An AI-assisted audit found 17 distinct issues across 22 pages, categorized them by severity, identified that batch fixes across template families could address most problems efficiently, and produced a structured backlog -- all in a single session. The OpenTelemetry instrumentation made it possible to verify that every operation completed successfully and to reconstruct the exact workflow after the fact.

---

*Generated from OpenTelemetry session data exported to SigNoz Cloud. All telemetry signals (traces, metrics, logs) are available for further analysis in the SigNoz dashboard.*
