---
layout: single
author_profile: true
classes: wide
title: "Ten Hooks, One Night: Auditing the OTEL Pipeline That Watches Itself"
date: 2026-02-16
categories: [telemetry]
tags: [opentelemetry, observability, session-analysis, llm-as-judge, quality-metrics, hooks, feature-engineering, ewma, correlation-matrix, circuit-breaker]
header:
  image: /assets/images/cover-reports.png
url: https://www.aledlie.com/reports/2026-02-16-hooks-otel-audit-feature-engineering/
permalink: /reports/2026-02-16-hooks-otel-audit-feature-engineering/
schema_type: analysis-article
schema_genre: "Session Report"
---

A telemetry pipeline that monitors AI sessions needs to monitor itself. On a Saturday evening in Austin, session `43a2d8e5` set out to do exactly that -- hardening ten hooks across the Claude Code instrumentation layer while simultaneously shipping a correlation matrix with Benjamini-Hochberg FDR correction and EWMA-based drift detection for the feature engineering library. The session grew to 6.1 million tokens and 28,859 messages, running for hours as it methodically worked through backlog items HA1 through HA10.

---

## Quality Scorecard

Seven metrics. Three from rule-based telemetry analysis, four from LLM-as-Judge evaluation of the session's code outputs. Together they form a complete picture of how well this session did its job.

### The Headline

```
 RELEVANCE       ███████████████████░  0.96   healthy
 FAITHFULNESS    ███████████████████░  0.95   healthy
 COHERENCE       ███████████████████░  0.93   healthy
 HALLUCINATION   ████████████████████  0.03   healthy  (lower is better)
 TOOL ACCURACY   ░░░░░░░░░░░░░░░░░░░░  N/A    no data
 EVAL LATENCY    ██████████████░░░░░░  1.57s  warning
 TASK COMPLETION ░░░░░░░░░░░░░░░░░░░░  N/A    no data
```

**Dashboard status: warning** -- Evaluation latency at 1.57s exceeds the 1s healthy threshold. Tool accuracy and task completion have no data because this session's hooks only emitted `session-start` and `skill-activation-prompt` spans without tool-level instrumentation.

---

### How We Measured

The first three metrics -- tool correctness, evaluation latency, and task completion -- are derived automatically from OpenTelemetry trace spans. Every tool call emits a span; the rule engine checks whether it succeeded and how long it took. In this session, only `session-start` and `skill-activation-prompt` hooks fired, so tool correctness and task completion could not be computed. Evaluation latency reflects the median span duration across all 30 recorded spans.

The content quality metrics come from **LLM-as-Judge evaluation** using a G-Eval pattern. An AI judge read six key outputs from the session -- new handler files, library enhancements, and documentation updates -- and scored each along four criteria: relevance, faithfulness, coherence, and hallucination.

---

### Per-Output Breakdown

Each output was evaluated independently, then aggregated:

| Document | Relevance | Faithfulness | Coherence | Hallucination |
|----------|-----------|-------------|-----------|---------------|
| `hooks/handlers/notification.ts` (error classification handler) | 0.95 | 0.93 | 0.90 | 0.03 |
| `hooks/lib/trace-context.ts` (cross-hook trace correlation) | 0.97 | 0.96 | 0.95 | 0.02 |
| `quality-feature-engineering.ts` (correlation matrix + EWMA) | 0.98 | 0.97 | 0.95 | 0.02 |
| `docs/BACKLOG.md` (status updates for HA1-HA10) | 0.93 | 0.92 | 0.90 | 0.04 |
| `hooks/handlers/pre-tool.ts` (extended parameter capture) | 0.97 | 0.95 | 0.95 | 0.02 |
| `hooks/lib/context-tracker.ts` (TTL-cached file reads) | 0.96 | 0.94 | 0.93 | 0.03 |
| **Session Average** | **0.96** | **0.95** | **0.93** | **0.03** |

---

### What the Judge Found

The feature engineering library scored highest across the board. The Pearson R computation via incomplete beta function (Lentz's continued fraction) and the Benjamini-Hochberg FDR correction were both implemented faithfully from their mathematical definitions -- no shortcuts, no approximations that would compromise statistical validity. The EWMA drift detector with MAD-based thresholds and confirmation windows showed careful attention to false-positive suppression.

The trace-context module earned top marks for coherence: a clean `savePromptContext()` / `loadPromptContext()` API with file-based IPC and 10-minute TTL, solving the cross-process correlation problem without introducing coupling between hook handlers.

The notification handler scored slightly lower on coherence (0.90) due to the error classification taxonomy being defined inline rather than extracted -- a reasonable trade-off for a first implementation but noted for future cleanup.

The BACKLOG.md updates had the highest hallucination score (0.04, still healthy) because some status descriptions extrapolated slightly beyond what the code changes strictly demonstrate. Minor and within acceptable bounds.

No significant hallucination was found in any output. The session's 0.03 average is well below the 0.05 healthy threshold.

---

## Session Telemetry

| Metric | Value |
|--------|-------|
| Session ID | `43a2d8e5-2e44-4e0e-b3ff-18328e39498f` |
| Date | 2026-02-15 to 2026-02-16 |
| Model | Claude Opus 4.6 |
| Total Spans | 30 |
| Tool Calls | 0 (no tool-level spans recorded) |
| Messages | 28,859 |
| Estimated Tokens | ~6.1M |
| Hooks Observed | session-start, skill-activation-prompt |
| Exceptions Logged | 3 (RangeError in `getUtilizationBar` at >100% utilization) |

---

### Methodology Notes

- **Telemetry source**: OpenTelemetry traces and logs from `~/.claude/telemetry/traces/` and `~/.claude/telemetry/logs/`, filtered by `session.id = 43a2d8e5-2e44-4e0e-b3ff-18328e39498f`.
- **Span coverage**: Only hook-level spans were recorded. The session's tool calls (Write, Edit, Bash, etc.) were not instrumented with OTEL spans, which is why tool_correctness and task_completion show N/A. This is expected -- Claude Code's built-in tools emit hook events but the hook runner only creates spans for hook execution, not for individual tool invocations.
- **LLM-as-Judge outputs**: Six files were selected as representative outputs based on git diff analysis of the session's commits. Each was evaluated against the session's stated objectives (hooks hardening HA1-HA10 and feature engineering enhancements).
- **Known bug**: Three `RangeError` exceptions were logged when `getUtilizationBar()` received utilization >100%. This is a pre-existing bug in `session-start.ts` where `String.repeat()` receives a negative argument. The fix (clamping to 0-100 range) was shipped by the current session.
- **Eval latency caveat**: The 1.57s median span duration reflects hook execution time (which includes `execSync` calls for git status, node version, etc.), not LLM inference latency.
