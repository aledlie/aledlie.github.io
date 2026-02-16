---
layout: single
author_profile: true
classes: wide
title: "Quality Score Improvements: Fixing Five Root Causes Across 894 Sessions"
date: 2026-02-16
categories: [telemetry]
tags: [opentelemetry, observability, session-analysis, llm-as-judge, quality-metrics, session-id, performance, deduplication, hooks]
header:
  image: /assets/images/cover-reports.png
url: https://www.aledlie.com/reports/2026-02-16-quality-score-improvements-session-telemetry/
permalink: /reports/2026-02-16-quality-score-improvements-session-telemetry/
schema_type: analysis-article
schema_genre: "Session Report"
---

What happens when your telemetry tells you that 88% of your spans are invisible? You drop everything and fix the plumbing. This session attacked five root causes dragging down quality scores across 894 sessions and 328K+ spans -- from missing session identifiers to a hook that was running its I/O in series when it didn't have to.

## Quality Scorecard

Seven metrics. Three from rule-based telemetry analysis, four from LLM-as-Judge evaluation of the session's committed code. Together they form a complete picture of how well this session did its job.

### The Headline

```
 RELEVANCE       ██████████████████░░  0.92   healthy
 FAITHFULNESS    ██████████████████░░  0.90   healthy
 COHERENCE       █████████████████░░░  0.89   healthy
 HALLUCINATION   ███████████████████░  0.05   healthy  (lower is better)
 TOOL ACCURACY   ████████████████████  1.00   healthy
 EVAL LATENCY    ████████████████████  5.1ms  healthy
 TASK COMPLETION ██████████████████░░  0.90   healthy
```

**Dashboard status: healthy** -- all seven metrics within healthy thresholds; tool accuracy at a perfect 1.00 across 132 tool spans.

### How We Measured

The first three metrics -- tool correctness, evaluation latency, and task completion -- were derived automatically from OpenTelemetry trace spans. Every tool call emits a span; the rule engine checks whether it succeeded and how long it took.

The content quality metrics come from **LLM-as-Judge evaluation** -- a G-Eval pattern where an AI judge reads the session's outputs and scores along four criteria: relevance, faithfulness, coherence, and hallucination. For this code-focused session, the judge evaluated all six committed source files against the stated plan: auto-inject session.id, parallelize session-start I/O, deduplicate token-metrics, and expand the PostToolUse matcher.

### Per-Output Breakdown

Each output was evaluated independently, then aggregated:

| Document | Relevance | Faithfulness | Coherence | Hallucination |
|----------|-----------|-------------|-----------|---------------|
| `otel-monitor.ts` (setSessionId) | 0.95 | 0.95 | 0.95 | 0.02 |
| `hook-runner.ts` (wire setSessionId) | 0.95 | 0.95 | 0.95 | 0.00 |
| `stop.ts` (session.id + dedup) | 0.90 | 0.90 | 0.88 | 0.05 |
| `session-start.ts` (parallelize I/O) | 0.95 | 0.92 | 0.92 | 0.02 |
| `otel-monitor.test.ts` (3 new tests) | 0.85 | 0.82 | 0.78 | 0.10 |
| `settings.json` (matcher expansion) | 0.90 | 0.88 | 0.85 | 0.08 |
| **Session Average** | **0.92** | **0.90** | **0.89** | **0.05** |

### What the Judge Found

**Strongest outputs:** `otel-monitor.ts` and `hook-runner.ts` scored highest across all four dimensions. The setSessionId pattern is minimal, correctly placed (before `...attributes` in the constructor spread, so explicit overrides still win), and wired at the single right call site in hook-runner.ts.

**Weakest output:** `otel-monitor.test.ts` drew the lowest coherence (0.78) and highest hallucination (0.10). The judge flagged three issues: an unused `spanAttrs` variable (dead code from an abandoned approach), a test titled "should inject session.id into span attributes" that only verifies the getter rather than actual span injection, and a "not set" test defeated by module caching from the prior test case.

**Dedup cache design trade-off:** The `_tokenMetricsCache` in stop.ts uses file size as a change indicator. The judge noted this is pragmatic but imperfect -- two writes of identical total size would be treated as unchanged. Since hook-runner.js spawns a new process per invocation, the cache resets each time, meaning dedup only works within a single `handleStop` call where `handleTokenMetrics` might fire multiple times.

**Session-start parallelization:** Correct use of `Promise.allSettled` to overlap node/npm and git I/O. The execSync calls inside async functions still block the event loop individually, but the two groups now overlap -- reducing latency from sum to max.

## Session Telemetry

| Metric | Value |
|--------|-------|
| Session ID | `613069ee-0ba4-4b25-a685-79f527c57c13` |
| Date | 2026-02-16 |
| Model | Claude Opus 4.6 |
| Total Spans | 193 |
| Tool Calls | 132 (success: 132, failed: 0) |
| Input Tokens | -- (not captured in hook spans) |
| Output Tokens | -- (not captured in hook spans) |
| Cache Read Tokens | -- |
| Hooks Observed | session-start, builtin-pre-tool, builtin-post-tool, agent-pre-tool, agent-post-tool, skill-activation-prompt, tsc-check |

## Methodology Notes

- Telemetry data sourced from `~/.claude/telemetry/traces-2026-02-16.jsonl` (32K lines, 193 spans matching session ID)
- 201 correlated log entries extracted across 193 traces
- Token usage was not recorded in hook-level spans (token-metrics-extraction fires at Stop events; the dedup cache change was committed mid-session so earlier Stop events may have captured usage before the change took effect)
- Task completion of 0.90 reflects 9/10 TaskUpdate completions tracked via telemetry; actual deliverable completion was 5/5 planned commits plus 1 dist rebuild commit
- LLM-as-Judge evaluation treated each committed TypeScript source file as a distinct output, scoring against the plan's stated objectives
