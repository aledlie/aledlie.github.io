---
layout: single
title: "Claude Code Usage Analysis: December 2025 - January 2026"
date: 2026-01-20
author_profile: true
categories: [analytics, claude-code, observability]
tags: [token-usage, cost-analysis, context-management, opentelemetry]
excerpt: "Comprehensive analysis of Claude Code usage patterns, costs, and context efficiency from December 2025 through January 2026, with implementation of context tracking."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
toc: true
toc_sticky: true
---

# Claude Code Usage Analysis

**Session Date:** January 20, 2026
**Analysis Period:** December 9, 2025 - January 20, 2026
**Data Source:** `~/.claude/stats-cache.json`, git history

---

## Executive Summary

- **Total Cost:** $3,674.37 over 42 active days
- **Total Sessions:** 306 sessions
- **Total Messages:** 110,288 messages
- **Key Finding:** 69% reduction in cost-per-message from December to January
- **Implementation:** Added context window tracking to session-start hooks

---

## 1. January 2026 Daily Activity

| Date | Messages | Sessions | Tool Calls | Msgs/Session |
|------|----------|----------|------------|--------------|
| Jan 3 | 1,569 | 3 | 469 | 523 |
| Jan 8 | 100 | 1 | 34 | 100 |
| Jan 10 | 6,627 | 31 | 1,891 | 214 |
| Jan 11 | 9,022 | 22 | 2,629 | 410 |
| Jan 12 | 30 | 1 | 10 | 30 |
| Jan 14 | 501 | 3 | 134 | 167 |
| Jan 16 | 7,543 | 16 | 1,049 | 471 |
| Jan 17 | 22,124 | 16 | 1,420 | 1,383 |
| Jan 18 | 6,019 | 11 | 573 | 547 |
| Jan 19 | 19,123 | 83 | 2,902 | 230 |
| Jan 20 | 8,721 | 31 | 1,352 | 281 |

### January Token Usage by Model

| Date | Opus 4.5 | Haiku 4.5 | Sonnet 4.5 | Total |
|------|----------|-----------|------------|-------|
| Jan 3 | 67,376 | 0 | 0 | 67,376 |
| Jan 8 | 20,377 | 0 | 0 | 20,377 |
| Jan 10 | 590,831 | 12,023 | 0 | 602,854 |
| Jan 11 | 1,315,439 | 12,901 | 47,379 | 1,375,719 |
| Jan 12 | 5,207 | 0 | 0 | 5,207 |
| Jan 14 | 29,742 | 1,243 | 0 | 30,985 |
| Jan 16 | 149,389 | 1,598 | 312 | 151,299 |
| Jan 17 | 97,184 | 211 | 6,871 | 104,266 |
| Jan 18 | 85,665 | 320 | 0 | 85,985 |
| Jan 19 | 497,342 | 1,302 | 49 | 498,693 |
| Jan 20 | 180,740 | 0 | 0 | 180,740 |

### January Weekly Comparison

| Period | Messages | Sessions | Tokens | Avg Tokens/Session |
|--------|----------|----------|--------|-------------------|
| **Week 1** (Jan 1-7) | 1,569 | 3 | 67,376 | 22,459 |
| **Week 2** (Jan 8-14) | 16,280 | 58 | 2,015,142 | 34,744 |
| **Week 3** (Jan 15-20) | 63,530 | 157 | 1,020,983 | 6,503 |

---

## 2. December 2025 Daily Activity

| Date | Messages | Sessions | Tool Calls | Msgs/Session |
|------|----------|----------|------------|--------------|
| Dec 9 | 1,852 | 5 | 651 | 370 |
| Dec 10 | 1,714 | 10 | 625 | 171 |
| Dec 11 | 1,574 | 2 | 572 | 787 |
| Dec 12 | 127 | 1 | 44 | 127 |
| Dec 14 | 9,572 | 27 | 2,996 | 355 |
| Dec 16 | 577 | 5 | 159 | 115 |
| Dec 20 | 757 | 1 | 218 | 757 |
| Dec 21 | 115 | 1 | 35 | 115 |
| Dec 24 | 5,585 | 14 | 1,714 | 399 |
| Dec 25 | 1,774 | 7 | 517 | 253 |
| Dec 26 | 200 | 2 | 50 | 100 |
| Dec 27 | 5,062 | 13 | 1,401 | 389 |

### December Token Usage by Model

| Date | Opus 4.5 | Haiku 4.5 | Sonnet 4.5 | Total |
|------|----------|-----------|------------|-------|
| Dec 9 | 180,838 | 7,604 | 4,390 | 192,832 |
| Dec 10 | 142,945 | 12,550 | 0 | 155,495 |
| Dec 11 | 166,471 | 9,583 | 0 | 176,054 |
| Dec 12 | 77,116 | 0 | 0 | 77,116 |
| Dec 14 | 1,055,057 | 22,840 | 0 | 1,077,897 |
| Dec 16 | 146,036 | 2,011 | 0 | 148,047 |
| Dec 20 | 107,681 | 0 | 0 | 107,681 |
| Dec 21 | 8,470 | 0 | 0 | 8,470 |
| Dec 24 | 823,447 | 11,348 | 0 | 834,795 |
| Dec 25 | 301,135 | 7,689 | 0 | 308,824 |
| Dec 26 | 5,466 | 0 | 0 | 5,466 |
| Dec 27 | 443,140 | 5,816 | 0 | 448,956 |

---

## 3. Monthly Comparison: December vs January

### Totals Comparison

| Metric | December | January | Change |
|--------|----------|---------|--------|
| **Messages** | 28,909 | 81,379 | +181% |
| **Sessions** | 88 | 218 | +148% |
| **Tool Calls** | 8,982 | 12,463 | +39% |
| **Total Tokens** | 3,541,633 | 3,123,501 | -12% |
| **Active Days** | 12 | 11 | -8% |

### Averages Comparison

| Metric | December | January | Change |
|--------|----------|---------|--------|
| **Msgs/Day** | 2,409 | 7,398 | +207% |
| **Sessions/Day** | 7.3 | 19.8 | +171% |
| **Tools/Day** | 749 | 1,133 | +51% |
| **Tokens/Day** | 295,136 | 283,955 | -4% |
| **Tokens/Session** | 40,246 | 14,328 | -64% |
| **Tokens/Message** | 122.5 | 38.4 | -69% |

### Model Distribution

| Model | December | January | Change |
|-------|----------|---------|--------|
| **Opus 4.5** | 3,457,802 (97.6%) | 3,039,292 (97.3%) | -12% |
| **Haiku 4.5** | 79,441 (2.2%) | 29,598 (0.9%) | -63% |
| **Sonnet 4.5** | 4,390 (0.1%) | 54,611 (1.7%) | +1144% |

---

## 4. Cost Analysis

### API Pricing (per million tokens)

| Model | Input | Output | Cache Read (0.1x) | Cache Write (1.25x) |
|-------|-------|--------|-------------------|---------------------|
| **Opus 4.5** | $5.00 | $25.00 | $0.50 | $6.25 |
| **Sonnet 4.5** | $3.00 | $15.00 | $0.30 | $3.75 |
| **Haiku 4.5** | $1.00 | $5.00 | $0.10 | $1.25 |

### All-Time Token Usage

| Model | Input | Output | Cache Read | Cache Write |
|-------|-------|--------|------------|-------------|
| **Opus 4.5** | 2.76M | 3.74M | 3,806M | 256.2M |
| **Sonnet 4.5** | 42.7K | 16.3K | 11.4M | 3.2M |
| **Haiku 4.5** | 32.1K | 77.0K | 102.9M | 29.0M |

### Cost Breakdown by Model

#### Claude Opus 4.5
| Category | Tokens | Rate | Cost |
|----------|--------|------|------|
| Input | 2,755,560 | $5.00/M | $13.78 |
| Output | 3,741,534 | $25.00/M | $93.54 |
| Cache Read | 3,805,996,551 | $0.50/M | $1,903.00 |
| Cache Write | 256,194,956 | $6.25/M | $1,601.22 |
| **Subtotal** | | | **$3,611.54** |

#### Claude Sonnet 4.5
| Category | Tokens | Rate | Cost |
|----------|--------|------|------|
| Input | 42,689 | $3.00/M | $0.13 |
| Output | 16,312 | $15.00/M | $0.24 |
| Cache Read | 11,362,461 | $0.30/M | $3.41 |
| Cache Write | 3,240,361 | $3.75/M | $12.15 |
| **Subtotal** | | | **$15.93** |

#### Claude Haiku 4.5
| Category | Tokens | Rate | Cost |
|----------|--------|------|------|
| Input | 32,050 | $1.00/M | $0.03 |
| Output | 76,989 | $5.00/M | $0.38 |
| Cache Read | 102,914,527 | $0.10/M | $10.29 |
| Cache Write | 28,960,773 | $1.25/M | $36.20 |
| **Subtotal** | | | **$46.90** |

### Total Cost Summary

| Model | Cost | % of Total |
|-------|------|------------|
| Opus 4.5 | $3,611.54 | 98.3% |
| Haiku 4.5 | $46.90 | 1.3% |
| Sonnet 4.5 | $15.93 | 0.4% |
| **TOTAL** | **$3,674.37** | 100% |

### Cost by Category

| Category | Cost | % of Total |
|----------|------|------------|
| Cache Write | $1,649.57 | 44.9% |
| Cache Read | $1,916.70 | 52.2% |
| Output | $94.16 | 2.6% |
| Input | $13.94 | 0.4% |

### Monthly Cost Breakdown

| Period | Token Share | Estimated Cost |
|--------|-------------|----------------|
| December 2025 | 53.1% | **$1,951.10** |
| January 2026 | 46.9% | **$1,723.27** |
| **Total** | 100% | **$3,674.37** |

### Cost Efficiency Metrics

| Metric | December | January | Change |
|--------|----------|---------|--------|
| **Total Cost** | $1,951.10 | $1,723.27 | -12% |
| **Daily Avg Cost** | $162.59 | $156.66 | -4% |
| **Cost/Session** | $22.17 | $7.90 | **-64%** |
| **Cost/Message** | $0.067 | $0.021 | **-69%** |
| **Cost/Tool Call** | $0.217 | $0.138 | -36% |

---

## 5. Spike Day Analysis

### All Spike Days Comparison

| Day | Type | Sessions | Tokens | Tokens/Session | Commits |
|-----|------|----------|--------|----------------|---------|
| Dec 14 | Research | 27 | 1.08M | 39,922 | 0 |
| Dec 24 | Research | 14 | 835K | 59,628 | 0 |
| Jan 11 | Research | 22 | 1.38M | 62,533 | 0 |
| Jan 17 | Implementation | 16 | 104K | 6,517 | 13 |
| Jan 19 | Rapid iteration | 83 | 499K | 6,008 | 12 |

### December 14 Analysis

**The Numbers:**
| Metric | Dec 14 | Dec Avg | vs Avg |
|--------|--------|---------|--------|
| Tokens | 1,077,897 | 295,136 | **3.7x** |
| Messages | 9,572 | 2,409 | **4.0x** |
| Sessions | 27 | 7.3 | 3.7x |
| Tool Calls | 2,996 | 749 | **4.0x** |

**Cause:** Research sprint for OpenTelemetry integration (shipped Dec 27)

### December 24 Analysis

**The Numbers:**
| Metric | Dec 24 | Dec Avg | vs Avg |
|--------|--------|---------|--------|
| Tokens | 834,795 | 295,136 | **2.8x** |
| Messages | 5,585 | 2,409 | 2.3x |
| Sessions | 14 | 7.3 | 1.9x |
| Tool Calls | 1,714 | 749 | 2.3x |

**Cause:** Final research push before Dec 27 OTel implementation

### January 11 Analysis

**The Numbers:**
| Metric | Jan 11 | Average | vs Avg |
|--------|--------|---------|--------|
| Tokens | 1,375,719 | 283,955 | **4.8x** |
| Messages | 9,022 | 7,398 | 1.2x |
| Sessions | 22 | 19.8 | 1.1x |
| Tool Calls | 2,629 | 1,133 | 2.3x |

**Cause:** Research for SigNoz integration (shipped Jan 16)

### January 17 Analysis — Anomaly Day

**The Numbers:**
| Metric | Jan 17 | Jan Avg | vs Avg |
|--------|--------|---------|--------|
| **Messages** | **22,124** | 7,398 | **3.0x** (HIGHEST) |
| Tokens | 104,266 | 283,955 | **0.37x** (LOW) |
| Sessions | 16 | 19.8 | 0.8x |
| Tool Calls | 1,420 | 1,133 | 1.3x |

**Unique Pattern:** Highest messages, lowest tokens = Implementation day (not research)

**Efficiency:** 4.7 tokens/message vs 152.5 on Jan 11 (32x more efficient)

### January 19 Analysis — Session Explosion

**The Numbers:**
| Metric | Jan 19 | Jan Avg | vs Avg |
|--------|--------|---------|--------|
| Messages | 19,123 | 7,398 | 2.6x |
| **Sessions** | **83** | 19.8 | **4.2x** (RECORD) |
| Tool Calls | 2,902 | 1,133 | 2.6x |
| Tokens | 498,693 | 283,955 | 1.8x |

**Cause:** High-velocity shipping day with frequent context resets

---

## 6. Research vs Implementation Pattern

### Token Efficiency by Activity Type

| Type | Example | Messages | Tokens | Tokens/Msg |
|------|---------|----------|--------|------------|
| **Research** | Jan 11, Dec 14 | Medium | Very High | 100-150 |
| **Implementation** | Jan 17 | Very High | Low | 4-5 |

### OTel Project Total (Dec 9 - Dec 28)

| Phase | Dates | Tokens | % of Project |
|-------|-------|--------|--------------|
| Sprint 1 | Dec 9-16 | 1,826,321 | 48% |
| Break | Dec 17-23 | 116,151 | 3% |
| Sprint 2 | Dec 24-26 | 1,149,085 | 30% |
| Ship | Dec 27-28 | 723,269 | 19% |
| **Total** | | **3,814,826** | 100% |

### SigNoz Project Total (Jan 10 - Jan 19)

| Phase | Dates | Tokens | Commits |
|-------|-------|--------|---------|
| Research | Jan 10-11 | 1.98M | 0 |
| Quiet | Jan 12-14 | 36K | 0 |
| Implementation | Jan 16 | 151K | 6 |
| Polish | Jan 17-19 | 689K | 25 |

---

## 7. Context Utilization Patterns

### Cache Statistics

| Model | Cache Read | Cache Write | Read:Write Ratio |
|-------|------------|-------------|------------------|
| Opus 4.5 | 3,806M | 256M | **14.9:1** |
| Haiku 4.5 | 103M | 29M | 3.6:1 |
| Sonnet 4.5 | 11M | 3.2M | 3.5:1 |

### Estimated Context Per Session

| Period | Sessions | Est. Context/Session |
|--------|----------|----------------------|
| December | 88 | ~1.5M tokens |
| January | 218 | ~550K tokens |
| **Change** | +148% | **-63%** |

### Context Trend by Day

| Day | Sessions | Tokens | Est. Avg Context/Session |
|-----|----------|--------|--------------------------|
| Dec 14 | 27 | 1.08M | 2.7M |
| Dec 24 | 14 | 835K | 4.0M |
| Jan 11 | 22 | 1.38M | 4.2M |
| Jan 17 | 16 | 104K | 437K |
| Jan 19 | 83 | 499K | 398K |
| Jan 20 | 31 | 181K | 5.8K |

---

## 8. Implementation: Context Tracking

### New Files Created

**`hooks/lib/context-tracker.ts`**
- Estimates tokens from transcript content (~0.25 tokens/char)
- Records OpenTelemetry metrics
- Maintains historical data in `~/.claude/context-history.json`
- Tracks daily averages for trend analysis

### New Metrics (exported to SigNoz)

| Metric | Description |
|--------|-------------|
| `session.context.size` | Estimated tokens at session start |
| `session.context.utilization` | Context window % used (of 200K) |
| `session.starts` | Session start counter |

### New Trace Attributes

| Attribute | Description |
|-----------|-------------|
| `context.estimated_tokens` | Token estimate |
| `context.utilization_percent` | % of 200K window |
| `context.transcript_size` | Raw transcript bytes |
| `context.message_count` | Conversation turns |
| `context.is_resume` | Whether session was resumed |

### Visual Output Format

```
📊 Context: 45K tokens (22.5%)
   [████░░░░░░░░░░░░░░░░] 🟢
```

---

## 9. Key Insights

### Efficiency Gains

1. **3x more messages in January with fewer tokens** = significant efficiency gain
2. **Tokens per message dropped 69%**: 122→38 tokens
3. **Tokens per session dropped 64%**: 40K→14K
4. **Cost per session dropped 64%**: $22.17→$7.90

### Usage Patterns

1. **Research days** have high tokens, low commits
2. **Implementation days** have high messages, low tokens
3. **More sessions = smaller contexts** (deliberate management)
4. **Cache hit ratio of 14.9:1** indicates excellent context reuse

### Cost Optimization

1. **Cache operations = 97% of cost**
2. **Without caching**, input would cost ~$19,600 (5.3x more expensive)
3. **Net cache benefit**: ~$16,000 saved via cache reads

---

## 10. Recommendations

1. **Continue short session strategy** — Week 3 showed 81% cost reduction per session
2. **Track context utilization** — New hooks will provide visibility
3. **Monitor research spikes** — 7x research:implementation token ratio is high
4. **Consider Sonnet for subagents** — 11x increase shows good delegation

---

*Report generated: January 20, 2026*
*Data period: December 9, 2025 - January 20, 2026*
*Total analysis cost: Included in Jan 20 session metrics*
