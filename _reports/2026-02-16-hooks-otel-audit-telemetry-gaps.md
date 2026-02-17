---
layout: single
author_profile: true
classes: wide
title: "Hooks & OTEL Audit: Closing 25 Telemetry Gaps"
date: 2026-02-16
categories: [telemetry]
tags: [opentelemetry, observability, session-analysis, llm-as-judge, quality-metrics, hooks, code-review, audit]
header:
  image: /assets/images/cover-reports.png
url: https://www.aledlie.com/reports/2026-02-16-hooks-otel-audit-telemetry-gaps/
permalink: /reports/2026-02-16-hooks-otel-audit-telemetry-gaps/
schema_type: analysis-article
schema_genre: "Session Report"
---

A code-reviewer agent was turned loose on the hooks system with a single question: *where are the blind spots?* It came back with 25 findings -- from missing notification handlers to trace correlation gaps to false positives in error detection -- then set about fixing them, one commit at a time.

## Quality Scorecard

Seven metrics. Three from rule-based telemetry analysis, four from LLM-as-Judge evaluation of the session outputs. Together they form a complete picture of how well this session did its job.

### The Headline

```
 RELEVANCE        ███████████████████░  0.93   healthy
 FAITHFULNESS     ██████████████████░░  0.92   healthy
 COHERENCE        ██████████████████░░  0.92   healthy
 HALLUCINATION    ████████████████████  0.04   healthy   (lower is better)
 TOOL ACCURACY    ████████████████████  1.00   healthy
 EVAL LATENCY     ████████████████████  0.005s healthy
 TASK COMPLETION  ██████████░░░░░░░░░░  0.50   critical
```

**Dashboard status: CRITICAL** -- Task completion sits at 0.50 because only half of the TaskCreate spans have corresponding TaskUpdate(completed) spans in telemetry. This reflects the tracking ratio, not actual deliverable status: the 14 commits in the session window demonstrate substantial work was completed.

### How We Measured

The first three metrics -- tool correctness, evaluation latency, and task completion -- were derived automatically from OpenTelemetry trace spans. Every tool call emits a span; the rule engine checks whether it succeeded and how long it took.

The content quality metrics come from **LLM-as-Judge evaluation** -- a G-Eval pattern where an AI judge reads the session's outputs and scores along four criteria: relevance, faithfulness, coherence, and hallucination. The judge read 5 key outputs: the BACKLOG.md audit document, the new notification handler and trace-context modules, and the updated user-prompt handler and output-analyzer. Each file was verified against its backlog claims -- imports resolved, constants checked, cross-module integration confirmed.

### Per-Output Breakdown

Each output was evaluated independently, then aggregated:

| Document | Relevance | Faithfulness | Coherence | Hallucination |
|----------|-----------|-------------|-----------|---------------|
| BACKLOG.md (775 lines) | 0.95 | 0.90 | 0.88 | 0.08 |
| notification.ts (65 lines) | 0.95 | 0.95 | 0.95 | 0.02 |
| trace-context.ts (48 lines) | 0.95 | 0.93 | 0.96 | 0.02 |
| user-prompt.ts (279 lines) | 0.92 | 0.90 | 0.88 | 0.05 |
| output-analyzer.ts (57 lines) | 0.90 | 0.92 | 0.93 | 0.03 |
| **Session Average** | **0.93** | **0.92** | **0.92** | **0.04** |

### What the Judge Found

**Strongest output: `trace-context.ts`** -- minimal, focused, well-documented. The cross-hook flow (user-prompt saves context, pre-tool loads it) was confirmed in source. The 10-minute TTL claim in the backlog matches `THRESHOLDS.PROMPT_CONTEXT_TTL_MS = 600_000` exactly.

**Most interesting verification:** The CR4 division-by-zero fix in `user-prompt.ts` was correctly implemented with independent denominator guards (`hitDenom > 0` and `totalContextTokens > 0`), addressing the original finding where the guard checked `inputTokens > 0` but the denominator was `inputTokens + cacheReadTokens`.

**PII fix confirmed:** The `prompt.text` attribute no longer appears anywhere in `user-prompt.ts` -- only `prompt.length` is emitted, addressing CR1.

**Notable quality issue found:** `analyzeBuiltinOutput` does not populate `errorCategory` (only `errorType`), while `analyzeOutput` populates both. Builtin tool errors cannot be filtered by category in the same way as generic errors. This inconsistency was not flagged in the backlog.

**Hallucination concern:** The BACKLOG.md document (0.08 hallucination score) contains file/line references for already-fixed items that cannot all be verified at exact line numbers since the code has been modified since the audit. This is expected behavior for a living document, not a factual error.

## Session Telemetry

| Metric | Value |
|--------|-------|
| Session ID | `a34b1e7c-26ac-4ed9-a199-e6de226b504e` |
| Date | 2026-02-16 |
| Model | Claude (code-reviewer agent) |
| Total Spans | 36 |
| Tool Calls | 20 (success: 20, failed: 0) |
| Input Tokens | 0 (not captured) |
| Output Tokens | 0 (not captured) |
| Cache Read Tokens | 0 (not captured) |
| Commits in Window | 14 |
| Files Changed | 34 (+1,237 / -86 lines) |
| Hooks Observed | session-start, skill-activation-prompt, agent-pre-tool, agent-post-tool, builtin-pre-tool, builtin-post-tool, tsc-check |

### Methodology Notes

- Telemetry data sourced from `~/.claude/telemetry/traces-2026-02-16.jsonl`
- Session identified via `hook:session-start` span with `session.id` attribute
- Token metrics were not captured for this session (no `hook:token-metrics-extraction` spans)
- Task completion of 0.50 reflects that only 1 of 2 TaskCreate operations had corresponding TaskUpdate(completed) spans -- the session's 14 commits demonstrate that substantially more work was completed than the metric suggests
- Output files for LLM-as-Judge were identified from git diff in the session's time window (16:00-16:30 on 2026-02-16), since the Edit tool spans lacked `builtin.file_path` attributes
- The BACKLOG.md contains accumulated findings from multiple sessions; scoring focused on the sections attributable to this audit session
