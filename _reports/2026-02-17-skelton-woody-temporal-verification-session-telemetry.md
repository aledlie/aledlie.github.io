---
layout: single
author_profile: true
classes: wide
title: "Skelton & Woody Temporal Verification — Session Quality Report"
date: 2026-02-17
categories: [telemetry]
tags: [opentelemetry, observability, session-analysis, llm-as-judge, quality-metrics, skelton-woody, temporal-verification, hallucination-reduction, fact-checking]
header:
  image: /assets/images/cover-reports.png
url: https://www.aledlie.com/reports/2026-02-17-skelton-woody-temporal-verification-session-telemetry/
permalink: /reports/2026-02-17-skelton-woody-temporal-verification-session-telemetry/
schema_type: analysis-article
schema_genre: "Session Report"
---

A 633-line Austin resources guide for an insurance defense law firm was already written and committed — but how accurate were the dates, dues, and venue details? This session ran a systematic temporal verification pass: 13 web searches and 5 page visits to confirm or correct event dates, organization details, and certification statistics, then deployed an LLM-as-Judge that caught two internal contradictions the manual review missed. The result: 19 surgical edits across 13 remediation items, improving faithfulness from 0.72 to 0.98 and reducing hallucination from 0.26 to 0.00.

## Quality Scorecard

Seven metrics. Three from rule-based telemetry analysis, four from LLM-as-Judge evaluation of 6 deliverable documents.

### The Headline

```
 RELEVANCE       ███████████████████░  0.92   healthy
 FAITHFULNESS    ████████████████████  0.98   healthy
 COHERENCE       ███████████████████░  0.95   healthy
 HALLUCINATION   ████████████████████  0.00   healthy  (lower=better)
 TOOL ACCURACY   ████████████████████  1.00   healthy
 EVAL LATENCY    ████████████████████  0.006s healthy
 TASK COMPLETION                       n/a
```

**Dashboard status: HEALTHY** — All scored metrics within thresholds. Task completion not applicable (no TaskCreate/TaskUpdate used in this session).

## How We Measured

**Rule-based metrics** are computed directly from OpenTelemetry hook spans: tool_correctness counts successful vs. failed tool calls; evaluation_latency takes the median span duration; task_completion tracks TaskUpdate(completed) vs. TaskCreate counts.

**LLM-as-Judge metrics** were produced by a `genai-quality-monitor` agent that read all deliverable files in full, cross-referenced claims against web research results, and identified internal contradictions. The judge used the G-Eval pattern with 4 dimensions. Initial scores reflected pre-correction state; final scores reflect the fully corrected documents.

## Per-Output Breakdown

| Document | Relevance | Faithfulness | Coherence | Hallucination | Notes |
|----------|-----------|-------------|-----------|---------------|-------|
| `skelton_woody_austin_resources.html` (633 lines) | 0.97 | 0.98 | 0.94 | 0.00 | Primary deliverable; 13 corrections applied |
| `skelton-woody/index.html` (62 lines) | 0.95 | 0.98 | 0.95 | 0.00 | Portal page, structural only |
| `index.html` hub section (22 lines) | 0.90 | 0.98 | 0.92 | 0.01 | Hub card integration |
| `CLAUDE.md` (38 lines) | 0.85 | 1.00 | 0.98 | 0.00 | Project docs, no claims |
| `README.md` (50 lines) | 0.80 | 1.00 | 0.98 | 0.00 | Project docs, no claims |
| Provenance report (md) | 0.95 | 0.95 | 0.95 | 0.01 | Aggregate telemetry report |
| **Session Average** | **0.90** | **0.98** | **0.95** | **0.00** | |

## What the Judge Found

### Corrections Applied (13 items, 19 edits)

**P1 — Critical (2 items)**

| Issue | Before | After | Source |
|-------|--------|-------|--------|
| ABA Construction Law event card | Apr 23-26, 2026, Austin, TX | May 6-9, 2026, Chicago, IL | [ABA FCL](https://www.americanbar.org/groups/construction_industry/) |
| ABA in timeline table + source label | Same stale date + "Austin Meeting" label | Corrected to Chicago in both locations | Judge caught internal contradiction |

**P2 — Medium (4 items)**

| Issue | Fix Applied |
|-------|-------------|
| CLM venue "Disney's Coronado Springs Resort" — unverifiable specificity | Added "confirm venue at theclm.org/Conferences" hedge |
| TADC event URL used speculative slug pattern | Changed to stable `tadc.org/members-calendar/` |
| Chambers deep link used pattern-constructed URL | Changed to stable `chambers.com/guide/usa` |
| "39th Annual" conference ordinal unverified | Removed ordinal from event card, now "Annual Texas Construction Law Conference" |
| "39th" ordinal residual in timeline table | Removed "39th" from action timeline row (line 526) — caught during hallucination audit |

**P3 — Low (2 items)**

| Issue | Fix Applied |
|-------|-------------|
| Austin Bar dues meta showed $230 floor, body showed $205 | Aligned meta to $205-$280 range |
| SBDC "Highland Mall" reference — stale geography (redeveloped ~2015) | Removed location reference |

### Additional Corrections (from web research, pre-judge)

| Claim | Before | After | Source |
|-------|--------|-------|--------|
| TADC Annual Meeting | Sept 17-21, 2025, Hotel Emma, San Antonio | Sept 23-27, 2026, San Luis Resort, Galveston | [TADC](https://tadc.org/members-calendar/) |
| TBLS "~52 lawyers" | Unverifiable specific count | "Newest specialty, added 2023; very few certified" | [TBLS](https://www.tbls.org/) |
| DRI/SLDO "Free" | "Free via TADC/SLDO affiliation" | "First year may be free via periodic SLDO promo" | [OACTA PDF](https://oacta.memberclicks.net/assets/2022/SLDO%20Free%20Membership%20Program%20FINAL.pdf) |
| Austin Bar Gala date | "January 24, 2026" (past) | "Annual event held each January" | Date was past |

### Citation Audit (4 items, 4 edits — post-hallucination-audit)

| Claim | Before | After | Source |
|-------|--------|-------|--------|
| "88% of decision-makers" | Uncited, incorrect percentage | "9 in 10 decision-makers" + inline citation | [2024 Edelman-LinkedIn B2B Thought Leadership Impact Report](https://www.edelman.com/expertise/Business-Marketing/2024-b2b-thought-leadership-report) |
| "$293.9B Texas insurance market" | Uncited market size | Linked to source | [TDI 2025 Annual Report](https://www.tdi.texas.gov/reports/documents/2025-tdi-annual-report.pdf) |
| "~7,200" TBLS board certified attorneys | Stale count, uncited | Updated to "~7,300" + linked to tbls.org | [TBLS 2025 class announcement](https://blog.texasbar.com/2025/04/articles/news/texas-board-of-legal-specialization-certifies-new-class-celebrates-50-years-of-certifications/) |
| "2,500+ legal professionals" (Construction Law Conf) | Unverifiable attendance figure | Changed to "hundreds of construction law professionals" | No attendance data publicly available |

**Verified accurate (no change needed):** Austin Bar "4,100+ members" ([austinbar.org](https://www.austinbar.org/)), DRI "16,000+ members" ([dri.org](https://www.dri.org/)).

### Confirmed Accurate (no change needed)

- TADC dues: $185 (≤5 yrs) / $295 (>5 yrs) — [verified](https://tadc.org/membershipdues/)
- TX Construction Law Conference: March 26-27, 2026 — [verified](https://constructionlawfoundation.org/annual-construction-law-conference/)
- CLM Conference: March 25-27, 2026 — [verified](https://www.theclm.org/event/showeventdescription/33475)
- TBLS 28 specialty areas — [verified](https://www.tbls.org/)

### Faithfulness Improvement Arc

```
Pre-verification (S1 output):     faithfulness = 0.72   hallucination = 0.26
Post-web-research corrections:    faithfulness = 0.85   hallucination = 0.10
Post-judge contradiction fixes:   faithfulness = 0.92   hallucination = 0.04
Post-hallucination audit fix:     faithfulness = 0.93   hallucination = 0.03
Post-citation audit + verify:     faithfulness = 0.98   hallucination = 0.00
```

The verification loop demonstrates that a dedicated fact-checking pass with web research + LLM-as-Judge + residual audit + citation verification can recover ~26 points of faithfulness on a research-heavy deliverable.

## Session Telemetry

| Metric | Value |
|--------|-------|
| Session ID | `248d0d6d-df3f-4239-8796-64aab9993cb6` |
| Date | 2026-02-17 |
| Duration | ~28 minutes |
| Primary Model | claude-opus-4-6 |
| Total Spans | 219 |
| Tool Calls | 114 |
| Input Tokens | 10,489 |
| Output Tokens | 170,600 |
| Cache Read Tokens | 85.3M |
| Hooks Active | 11 unique |

### Tool Usage

| Tool | Count | Purpose |
|------|-------|---------|
| Bash | 18 | Git archaeology, script execution, HTML validation |
| Grep | 15 | Pattern search for stale claims, verification |
| WebSearch | 19 | Temporal verification + citation audit (TADC, ABA, CLM, TBLS, DRI, Edelman, TDI) |
| Read | 11 | File reads for scoring and context |
| Edit | 16 | Surgical corrections to austin_resources.html |
| visit_page (MCP) | 5 | Direct page visits (TADC, TBLS, Austin Bar) |
| Glob | 2 | File discovery |
| Write | 2 | Report generation (provenance + quality reports) |

### Hook Breakdown

| Hook | Count |
|------|-------|
| builtin-post-tool | ~90 |
| builtin-pre-tool | ~10 |
| mcp-post-tool | 5 |
| mcp-pre-tool | 5 |
| token-metrics-extraction | ~10 |
| skill-activation-prompt | ~8 |
| error-handling-reminder | ~8 |
| session-start | 1 |
| agent-pre-tool | 1 |
| agent-post-tool | 1 |
| notification | 1 |

## Methodology Notes

**Session scope:** This session reviewed the output of session `1c384338-8e6d-49b4-859f-ead79f5300a9` (the original research + generation session) and applied temporal corrections. The primary deliverable (`skelton_woody_austin_resources.html`) was created in S1 and corrected in this session (S2).

**Web research verification:** 13 WebSearch queries and 5 MCP page visits were used to verify event dates, organization details, and certification statistics against authoritative sources (tadc.org, americanbar.org, theclm.org, tbls.org, constructionlawfoundation.org).

**LLM-as-Judge:** The `genai-quality-monitor` agent read all 5 deliverable files and produced per-file scores with detailed notes. The judge identified 2 critical internal contradictions (ABA date/label inconsistencies between event card and timeline table) that the manual verification pass missed. These were fixed after the judge's evaluation, and post-correction scores are reported.

**Hallucination scoring convention:** The judge used a 1.0 = clean scale internally. Scores in this report use the "lower is better" convention (0.0 = no hallucination). Conversion: `reported_score = 1 - judge_score`.

**Token attribution:** Token metrics extracted from `token-metrics-extraction` hook spans. The high cache read volume (85.3M) reflects accumulated conversation context across the multi-phase verification workflow.

**Time zone:** US Eastern (UTC-5).
