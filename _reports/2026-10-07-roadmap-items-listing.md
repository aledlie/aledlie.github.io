---
layout: single
author_profile: true
classes: wide
title: "Roadmap Items Listing: Session Quality Report"
date: 2026-10-07
categories: [telemetry]
tags: [opentelemetry, observability, session-analysis, llm-as-judge, quality-metrics, roadmap, tool-correctness]
header:
  image: /assets/images/cover-reports.png
url: https://www.aledlie.com/reports/2026-10-07-roadmap-items-listing/
permalink: /reports/2026-10-07-roadmap-items-listing/
schema_type: analysis-article
schema_genre: "Session Report"
---

A directory listing is not a document read. This session opened with an ambitious question -- surface every actionable item buried across three dense roadmap documents -- then dispatched a `/bin/ls` to find out what files existed. The judge found the gap between what was asked and what the tool could answer to be wide enough to drive a critical quality rating.

## Quality Scorecard

Seven metrics. Three from rule-based telemetry analysis, four from LLM-as-Judge evaluation of the session outputs. Together they form a complete picture of how well this session did its job.

### The Headline

```
 RELEVANCE        ██████░░░░░░░░░░░░░░  0.30  critical
 FAITHFULNESS     ████░░░░░░░░░░░░░░░░  0.20  critical
 COHERENCE        ██████████░░░░░░░░░░  0.50  critical
 HALLUCINATION    ██████░░░░░░░░░░░░░░  0.72  critical  (lower is better)
 TOOL ACCURACY    ████████████████████  1.00  healthy
 EVAL LATENCY     ████████████████████  2.64ms  healthy
 TASK COMPLETION  ████████████████████  1.00  healthy
```

**Dashboard status: CRITICAL** -- All four LLM-as-Judge content metrics fell below their critical thresholds. The root cause is a tool selection mismatch: the session used `/bin/ls` (a file lister) to respond to a prompt requiring document reads. The infrastructure performed flawlessly; the content retrieval strategy did not.

### How We Measured

The first three metrics -- tool correctness, evaluation latency, and task completion -- were derived automatically from OpenTelemetry trace spans. Every tool call emits a span; the rule engine checks whether it succeeded and how long it took.

The content quality metrics come from **LLM-as-Judge evaluation** -- a G-Eval pattern where an AI judge reads the session's outputs and scores along four criteria: relevance, faithfulness, coherence, and hallucination. The judge evaluated the session's conversational response to the roadmap items query, cross-referenced against the three actual roadmap documents (`AA1_D7_STANDUP.md`, `AA3_ASI_EVOLVE_IMPLEMENTATION_PLAN.md`, `AGENTIC_SELF_OPTIMIZATION_ARCHITECTURE.md`), which contain launchd install commands, 17-deliverable dependency graphs, and phase-gating conditions tied to 21-day checkpoint timelines.

### Per-Output Breakdown

Each output was evaluated independently, then aggregated:

| Document | Relevance | Faithfulness | Coherence | Hallucination |
|----------|-----------|-------------|-----------|---------------|
| session_response | 0.30 | 0.20 | 0.50 | 0.72 |
| **Session Average** | **0.30** | **0.20** | **0.50** | **0.72** |

### What the Judge Found

The judge's verdict is direct: `/bin/ls` returns file metadata -- names, timestamps, permissions -- not document content. The roadmap files it listed contain dense, specific technical deliverables. Any response that named actionable items from those documents drew on model priors, not on the documents themselves, scoring faithfulness at 0.20. Relevance at 0.30 reflects that the session at least engaged with the correct directory; hallucination at 0.72 reflects the high probability that details in the response were generated rather than read. Coherence at 0.50 was scored neutrally -- the response structure could not be independently verified, but it was likely organized enough to read.

The instrumentation held. One tool was called, it succeeded (`tool_correctness: 1.00`), and hook latency was sub-millisecond across all four spans. The session's quality failure was upstream of the hooks.

## Session Telemetry

| Metric | Value |
|--------|-------|
| Session ID | `267f9b5f-9aea-4cb5-82ea-4d6a4991d0b6` |
| Date | 2026-10-07 |
| Model | claude-sonnet-4-6 |
| Total Spans | 4 |
| Tool Calls | 1 (success: 1, failed: 0) |
| Input Tokens | not captured |
| Output Tokens | not captured |
| Cache Read Tokens | not captured |
| Hooks Observed | builtin-post-tool, builtin-pre-tool, session-start, skill-activation-prompt |

## Methodology Notes

Telemetry was captured from `~/.claude-history/telemetry/` for session `267f9b5f`. The session is early-stage: only 4 spans were recorded at evaluation time, reflecting the session-start and the first prompt's tool execution. Token data was not captured in the trace spans available at report time (all token fields read 0).

The LLM-as-Judge evaluation sourced its assessment from the three roadmap documents at `~/.claude/docs/roadmap/` (173, 1,096, and 1,020 lines respectively) and compared them against what a `/bin/ls` command could reasonably return. Task completion defaults to 1.0 when no Task tool spans are present -- this reflects telemetry availability, not whether the user received a useful answer.
