---
layout: single
author_profile: true
classes: wide
title: "Auditing the Auditor: When a False Positive Becomes a Better Comment"
date: 2026-02-16
categories: [telemetry]
tags: [opentelemetry, observability, session-analysis, llm-as-judge, quality-metrics, hooks, refactoring, statistical-testing]
header:
  image: /assets/images/cover-reports.png
url: https://www.aledlie.com/reports/2026-02-16-hooks-otel-audit-classifier-extraction/
permalink: /reports/2026-02-16-hooks-otel-audit-classifier-extraction/
schema_type: analysis-article
schema_genre: "Session Report"
---

A prior session's quality report flagged a potential two-tailed p-value bug in the feature engineering library. This session set out to fix it -- and discovered the math was right all along. The real deliverable became a clearer comment, a set of scipy-validated regression tests, and a long-overdue extraction of an inline error taxonomy into a shared classifier.

## Quality Scorecard

Seven metrics. Three from rule-based telemetry analysis, four from LLM-as-Judge evaluation of the session outputs. Together they form a complete picture of how well this session did its job.

### The Headline

```
 RELEVANCE       ████████████████████  0.97   healthy
 FAITHFULNESS    ███████████████████░  0.95   healthy
 COHERENCE       ███████████████████░  0.94   healthy
 HALLUCINATION   ████████████████████  0.03   healthy  (lower is better)
 TOOL ACCURACY   ████████████████████  1.00   healthy
 EVAL LATENCY    ████████████████████  0.004s healthy
 TASK COMPLETION ░░░░░░░░░░░░░░░░░░░░  N/A    --
```

**Dashboard status: healthy** -- All measured metrics within healthy thresholds. Task completion not applicable (no TaskCreate/TaskUpdate spans).

### How We Measured

The first three metrics -- tool correctness, evaluation latency, and task completion -- were derived automatically from OpenTelemetry trace spans. Every tool call emits a span; the rule engine checks whether it succeeded and how long it took.

The content quality metrics come from **LLM-as-Judge evaluation** -- a G-Eval pattern where an AI judge reads the session's outputs and scores along four criteria: relevance, faithfulness, coherence, and hallucination. The judge evaluated three deliverables: the audit analysis itself, the pearsonPValue comment fix with regression tests, and the notification classifier extraction. Each claim was cross-referenced against actual diffs, scipy reference values, and test results.

### Per-Output Breakdown

Each output was evaluated independently, then aggregated:

| Output | Relevance | Faithfulness | Coherence | Hallucination |
|--------|-----------|-------------|-----------|---------------|
| Audit analysis (6 deliverables verified) | 0.95 | 0.93 | 0.90 | 0.05 |
| quality-feature-engineering.ts (comment + test) | 0.98 | 0.97 | 0.95 | 0.02 |
| categorizers.ts + notification.ts (classifier extraction) | 0.97 | 0.95 | 0.96 | 0.03 |
| **Session Average** | **0.97** | **0.95** | **0.94** | **0.03** |

### What the Judge Found

The feature engineering fix scored highest on faithfulness (0.97). All four scipy reference values -- `pearsonPValue(0.6033, 10) = 0.0649`, `(0.5, 20) = 0.0247`, `(0.3, 30) = 0.1082`, `(-0.8, 10) = 0.0056` -- were verified against actual `scipy.stats.pearsonr` with a maximum deviation of 0.000954. The algebraic identity `2 * 0.5 * I_x(df/2, 1/2) = I_x(df/2, 1/2)` was confirmed correct, making the original audit flag a false positive.

The classifier extraction achieved the highest coherence (0.96). The refactoring replaced two inline boolean checks (`isError`, `isWarning`) with a single `classifyNotification()` call returning a typed severity string. Pattern coverage expanded from 4 to 9 terms across error and warning categories. The judge noted the function uses a generic `string` type for the level parameter rather than a union type -- acceptable but slightly less type-safe.

The audit analysis itself scored lowest on coherence (0.90) because it was a reasoning exercise without a persistent artifact, making structural evaluation harder. All numeric claims (37 commits, 24 backlog items, 6 deliverables) were traceable to git history.

No hallucination concerns across any output. Every number, file path, and mathematical claim was verified against actual artifacts.

## Session Telemetry

| Metric | Value |
|--------|-------|
| Session ID | `8d1c75fb-257e-4ee6-8230-9d60d37df9ac` |
| Date | 2026-02-16 |
| Model | Claude Opus 4.6 |
| Total Spans | 74 |
| Tool Calls | 53 (success: 53, failed: 0) |
| Hooks Observed | session-start, builtin-post-tool, mcp-pre-tool, mcp-post-tool, tsc-check, skill-activation-prompt |

### Methodology Notes

Telemetry was extracted from `~/.claude/telemetry/traces-2026-02-16.jsonl` filtered by `session.id = 8d1c75fb`. Token counts were not captured in trace attributes for this session (hook token-metrics spans exist in adjacent sessions but not this one). Task completion is N/A because no TaskCreate/TaskUpdate tool calls were instrumented. The session's outputs were identified from git commits `ec44eee` (pearsonPValue comment + tests) and `1d18420` (classifier extraction), plus the in-conversation audit analysis.
