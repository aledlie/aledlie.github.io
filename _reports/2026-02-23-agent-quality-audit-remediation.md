---
layout: single
author_profile: true
classes: wide
title: "Agent Quality Audit: Closing 12 Action Items with Telemetry Evidence"
date: 2026-02-23
categories: [telemetry]
tags: [opentelemetry, observability, session-analysis, llm-as-judge, quality-metrics, agent-auditor, otel-hooks, false-positive, telemetry-investigation]
header:
  image: /assets/images/cover-reports.png
url: https://www.aledlie.com/reports/2026-02-23-agent-quality-audit-remediation/
permalink: /reports/2026-02-23-agent-quality-audit-remediation/
schema_type: analysis-article
schema_genre: "Session Report"
---

Two action items were still open after a week of fixes. One had a root cause buried in a regex. The other turned out not to be a bug at all — just a mislabeled assumption about how skills get invoked. This session closed both by reading the actual telemetry.

## Quality Scorecard

Seven metrics. Three from rule-based telemetry analysis, four from LLM-as-Judge evaluation of the session's primary output. Together they form a complete picture of how well this session did its job.

### The Headline

```
 RELEVANCE        ██████████████████░░  0.92   healthy
 FAITHFULNESS     ███████████████████░  0.96   healthy
 COHERENCE        █████████████████░░░  0.87   healthy
 HALLUCINATION    ████████████████████  0.04   healthy  (lower is better)
 TOOL ACCURACY    ███████████████████░  0.97   healthy
 EVAL LATENCY     ████████████████████  0.006s healthy
 TASK COMPLETION  n/a — telemetry ratio > 1.0 (see methodology)
```

**Dashboard status: HEALTHY** — all scoreable metrics at or above threshold. Coherence is the lowest at 0.87, driven by a stale line in the remediation section that was not cleaned up.

### How We Measured

The first three metrics — tool correctness, evaluation latency, and task completion — were derived automatically from OpenTelemetry trace spans emitted by the hooks system in `~/.claude/hooks/`. Every tool call emits a span; the rule engine checks whether it succeeded (`builtin.success`) and how long it took (span duration in nanoseconds).

The content quality metrics come from **LLM-as-Judge evaluation** — a G-Eval pattern where an AI judge reads the session's primary output and scores along four criteria: relevance, faithfulness, coherence, and hallucination. The judge evaluated the newly added "Remediation Status" section of `agent-quality/audit-2026-02-20.md` — a structured record of 12 action items, 8 commit references, and 2 telemetry investigation findings — against the session's stated goals.

## Per-Output Breakdown

Each output was evaluated independently, then aggregated:

| Document | Relevance | Faithfulness | Coherence | Hallucination |
|----------|:---------:|:------------:|:---------:|:-------------:|
| audit-2026-02-20.md — Remediation Status section | 0.92 | 0.96 | 0.87 | 0.04 |
| **Session Average** | **0.92** | **0.96** | **0.87** | **0.04** |

## What the Judge Found

**Faithfulness was the strongest signal (0.96).** Every commit hash in the remediation table corresponds to a real commit verified from `git log`. The specific regex pattern cited in the investigation notes — `/\berror[:\s]/i` — matches the actual source in the pre-fix hooks handler. The span counts for intent-detection matches (25 for otel-improvement, 13 for otel-output-provenance) were derived from live telemetry queries, not estimated. The "27-case test suite" is a real file at `~/.claude/hooks/handlers/post-tool-agent-error.test.ts`.

**Relevance at 0.92 reflects good alignment with one miss.** The session was asked to (1) update the audit with commit data, and (2) implement the remaining open action items. Both were accomplished. The 0.08 gap is attributable to a stale summary line (`"Resolved: 10/12 items — 2 remaining..."`) left in the document at line 169 after the final "12/12" conclusion was added above it — the two lines contradict each other.

**Coherence at 0.87 — solid, same root cause.** The remediation section itself is logically organized: commits table → action item resolution table → investigation notes → per-definition status annotations. The stale line is the only structural inconsistency that pulls coherence below 0.90.

**Hallucination at 0.04** — the only interpretive content is the three-layer taxonomy used to explain the otel-improvement telemetry situation (Layer 1: intent detection, Layer 2: Skill tool invocation, Layer 3: incidental file reference). This is an analytical framework, not a factual claim, and is clearly marked as such in the document. No fabricated data.

## Session Telemetry

| Metric | Value |
|--------|-------|
| Session ID | `897dca12-ee25-4af8-b65b-afc10d9becfb` |
| Date | 2026-02-23 |
| Model | claude-opus-4-6 |
| Total Spans | 164 |
| Tool Calls | 127 (success: 123, failed: 4) |
| Input Tokens | 216 (main conversation) |
| Output Tokens | 21,009 |
| Cache Read Tokens | 6,930,893 |
| Hooks Observed | agent-post-tool, agent-pre-tool, builtin-post-tool, builtin-pre-tool, error-handling-reminder, notification, session-start, skill-activation-prompt, telemetry-alert-evaluation, token-metrics-extraction |

**Agent invocations:** 2 general-purpose agents (investigation tasks). One was flagged `has_error: true` — likely a false positive from the agent reporting on error-rate analysis, which caused the still-deployed regex to fire on its own output discussing error patterns. The second agent completed cleanly.

## Methodology Notes

**Session identification:** The trace file `traces-2026-02-23.jsonl` contained 30 distinct session IDs. The correct session was identified by filtering for spans touching `audit-2026-02-20.md` (11 matching spans across 5 Edit calls + 6 Read calls).

**Task completion metric:** The reported ratio of 1.667 is an artifact of telemetry tracking: 2 TaskCreate calls were logged but the corresponding TaskUpdate calls were rejected with "Task not found" (the task IDs were not persisted between tool calls in this context). The metric is not meaningful for this session.

**Output selection for LLM-as-Judge:** The primary measurable output was the Remediation Status section added to the audit file. The two investigation agents' outputs (6,547 and 9,006 bytes respectively) were the evidence source for that section rather than standalone deliverables, so they were not scored independently.

**Cache token volume (6.9M):** Reflects repeated reads of the 322-line audit file and large OTEL trace files during investigation — all cached after the first read, explaining the 0.006s median hook latency.
