---
layout: single
author_profile: true
classes: wide
title: "Feature Engineering Backlog Sprint: CQI Sensitivity, Spearman Rank, and EMA Smoothing"
date: 2026-02-16
categories: [telemetry]
tags: [opentelemetry, observability, session-analysis, llm-as-judge, quality-metrics, feature-engineering, backlog, spearman, cqi, ema]
header:
  image: /assets/images/cover-reports.png
url: https://www.aledlie.com/reports/2026-02-16-feature-engineering-backlog-session/
permalink: /reports/2026-02-16-feature-engineering-backlog-session/
schema_type: analysis-article
schema_genre: "Session Report"
---

Three deferred backlog items had been waiting their turn in the observability toolkit's quality feature engineering library. On a Sunday evening, a Claude Code session picked up the queue and worked through them one by one -- adding CQI weight sensitivity analysis, EMA velocity smoothing with confidence scoring, and Spearman rank correlation with Cohen's d effect size -- each implementation reviewed at enterprise level before moving to the next.

## Quality Scorecard

Seven metrics. Three from rule-based telemetry analysis, four from LLM-as-Judge evaluation of the session outputs. Together they form a complete picture of how well this session did its job.

### The Headline

```
 RELEVANCE       ████████████████░░░░  0.84   healthy
 FAITHFULNESS    ███████████████████░  0.95   healthy
 COHERENCE       ███████████████████░  0.96   healthy
 HALLUCINATION   ███████████████████░  0.03   healthy  (lower is better)
 TOOL ACCURACY   ███████████████████░  0.97   healthy
 EVAL LATENCY    ░░░░░░░░░░░░░░░░░░░░  n/a    no data
 TASK COMPLETION ████████████████████  1.00   healthy
```

**Dashboard status: healthy** -- All measured metrics within healthy thresholds. Evaluation latency unavailable due to telemetry export lag (session ran after last daily export).

## How We Measured

Tool correctness and task completion were derived from session context: tool calls observed (git, tsc, npm test, code-reviewer agents) and task tracking (3 created, 3 completed). Evaluation latency was unavailable -- this session's OTel spans had not yet been exported to the local JSONL telemetry store when the report was generated (last export: Feb 16 16:08, session active through Feb 17 02:00+).

The content quality metrics come from **LLM-as-Judge evaluation** -- a G-Eval pattern where an AI judge reads the session's outputs and scores along four criteria. The judge reviewed git diffs, all 5 committed output files, the original backlog specifications, and the mathematical correctness of implemented formulas (EMA, Spearman via fractional ranks, Cohen's d conversion).

## Per-Output Breakdown

Each output was evaluated independently, then aggregated:

| Document | Relevance | Faithfulness | Coherence | Hallucination |
|----------|-----------|-------------|-----------|---------------|
| `quality-feature-engineering.ts` (+144 lines) | 0.97 | 0.95 | 0.96 | 0.02 |
| `quality-feature-engineering.test.ts` (+192 lines) | 0.96 | 0.97 | 0.95 | 0.01 |
| `quality-metrics.ts` (+6 lines) | 0.98 | 1.00 | 0.98 | 0.00 |
| `BACKLOG.md` (status updates) | 0.95 | 0.96 | 0.97 | 0.02 |
| `otel-improvement/` skill (548 lines) | 0.35 | 0.85 | 0.92 | 0.10 |
| **Session Average** | **0.84** | **0.95** | **0.96** | **0.03** |

## What the Judge Found

The core deliverables -- FE1, FE2, and FE4 implementations -- scored exceptionally well. The judge verified mathematical correctness of all three algorithms: EMA smoothing with `alpha * x[i] + (1-alpha) * ema[i-1]`, Spearman correlation via fractional ranks fed through Pearson, and Cohen's d via the standard `2r/sqrt(1-r^2)` conversion. Confidence formula assertions in tests (`0.2 + 0.075 * n`) matched the implementation exactly.

The relevance score was pulled down by the `otel-improvement` skill (commit `e486902`), which the judge correctly flagged as **out-of-scope** for the stated task. This was tangential work committed alongside the backlog sprint. Excluding it, the core deliverables would average **0.97 relevance**.

Faithfulness was strong across the board. The judge noted that backlog summaries accurately reflected implementations -- FE4's claim of "8 new tests" was verified (6 Spearman + 2 effectSize), and the "pValue already present" note was confirmed as truthful rather than claiming credit for pre-existing work.

The only hallucination flag (0.10 on the otel-improvement skill) came from references to an `OTEL_IMPROVEMENT_PLAN.md` and directory structures whose existence was not verified during review.

## Session Telemetry

| Metric | Value |
|--------|-------|
| Session ID | `09bb6596-0feb-4b51-8a98-0b27e4b12687` |
| Date | 2026-02-16 |
| Model | claude-opus-4-6 |
| Commits | 5 (4 feature + 1 review fix) |
| Files Changed | 12 (4 core + 8 skill) |
| Lines | +888 / -15 |
| Tests | 4,091 passing (17 new) |
| Code Reviews | 3 (FE1: 8.5/10, FE4 fix: approved, full-stack: 9.2/10) |
| Task Tracking | 3 created, 3 completed |
| Hooks Observed | OTel trace data unavailable (export lag) |

## Methodology Notes

This session's telemetry was not available in the local JSONL store because the last daily export occurred at 16:08 on Feb 16, and the session's hook-instrumented spans ran from ~20:20 through 02:00+. Tool correctness (0.97) was estimated from observable tool call outcomes in the conversation (successful git operations, tsc, test runs, with minor bash permission denials in subagents). Task completion (1.00) reflects the TodoWrite/TaskUpdate tracking within the session. Evaluation latency is reported as unavailable rather than estimated.

The LLM-as-Judge evaluation was performed by an Opus 4.6 judge agent that read the actual git diffs, all source files, original backlog specifications, and verified mathematical formulas against known standards. The judge evaluated 5 distinct output groups independently.
