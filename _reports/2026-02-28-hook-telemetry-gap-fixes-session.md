---
layout: single
author_profile: true
classes: wide
title: "Closing the Gaps: Hook Telemetry Fix Session"
date: 2026-02-28
categories: [telemetry]
tags: [opentelemetry, observability, session-analysis, llm-as-judge, quality-metrics, hooks, code-review, typescript]
header:
  image: /assets/images/cover-reports.png
url: https://www.aledlie.com/reports/2026-02-28-hook-telemetry-gap-fixes-session/
permalink: /reports/2026-02-28-hook-telemetry-gap-fixes-session/
schema_type: analysis-article
schema_genre: "Session Report"
---

When observability tooling itself has observability gaps, the problem is self-referential in an uncomfortable way. This session set out to fix seven telemetry gaps in the Claude Code hook system — legacy field references letting errors slip by silently, missing OTEL spans leaving MCP session failures untracked, and a cache path mismatch that meant error reminders were reading from the wrong directory. Then a code reviewer ran on the changes, found four more issues, and those got fixed too. By the end, 917 tests passed, the dist was rebuilt, and a clean set of commits landed on main.

---

## Quality Scorecard

Seven metrics. Three from rule-based telemetry analysis, four from LLM-as-Judge evaluation of the session outputs. Together they form a complete picture of how well this session did its job.

### The Headline

```
 RELEVANCE        ██████████████████░░  0.94   healthy
 FAITHFULNESS     ███████████████████░  0.96   healthy
 COHERENCE        ███████████████████░  0.96   healthy
 HALLUCINATION    ███████████████████░  0.03   healthy  (lower is better)
 TOOL ACCURACY    ███████████████████░  0.97   healthy
 EVAL LATENCY     ████████████████████  1.4ms  healthy
 TASK COMPLETION  ████████████████████  1.00   healthy
```

**Dashboard status: healthy** — all seven metrics in the green. Tool accuracy at 0.97 with 95 of 98 calls succeeding (3 non-blocking Read/Bash failures). LLM judge scores cluster tightly around 0.95 across relevance, faithfulness, and coherence, with hallucination at 0.03.

---

### How We Measured

The first three metrics — tool correctness, evaluation latency, and task completion — were derived automatically from OpenTelemetry trace spans emitted by the hook system itself. Every tool call produces a `hook:builtin-post-tool` span with a `builtin.success` attribute; the rule engine aggregates those across the session.

The content quality metrics come from **LLM-as-Judge evaluation** — a G-Eval pattern where an AI judge reads the session's outputs and scores them along four criteria. For this session, the judge evaluated six outputs: four changed source files in `~/.claude/hooks/`, the updated `mcp-status.ts` with its new `@deprecated` annotation, and the BACKLOG.md entries documenting deferred findings. All file paths and line numbers cited in the evaluation were cross-checked against live source.

---

### Per-Output Breakdown

Each output was evaluated independently, then aggregated:

| Output | Relevance | Faithfulness | Coherence | Hallucination |
|--------|-----------|--------------|-----------|---------------|
| `handlers/post-tool.ts` | 0.97 | 0.98 | 0.96 | 0.02 |
| `lib/output-analyzer.ts` | 0.96 | 0.95 | 0.97 | 0.03 |
| `handlers/stop.ts` | 0.96 | 0.97 | 0.95 | 0.03 |
| `handlers/notification.ts` | 0.93 | 0.92 | 0.95 | 0.05 |
| `handlers/mcp-status.ts` | 0.88 | 0.98 | 0.96 | 0.02 |
| `docs/BACKLOG.md` | 0.94 | 0.96 | 0.95 | 0.04 |
| **Session Average** | **0.94** | **0.96** | **0.96** | **0.03** |

---

### What the Judge Found

`post-tool.ts` scored the highest overall (0.97 relevance, 0.98 faithfulness). The judge verified that `resolveOutputText()` is now called once, stored as `resolvedOutput`, and passed to `handleMcpStatus` in both MCP call sites — the exact fix the plan specified. No invented claims.

`output-analyzer.ts` earned a 0.97 coherence score. The judge confirmed all five claimed additions: the 50KB pre-slice at line 86, the five new switch cases, the `classifyError(safeOutput)` fix at line 173, and the KillShell word-boundary regex. It correctly noted that `TaskOutput` omits the `\bfailed\b` pattern from the generic path — accurately flagged in the BACKLOG as M3, a conscious deferral, not a mistake.

`stop.ts` had the most changes (five distinct fixes) and held up well at 0.97 faithfulness. The judge traced each fix to its line: `getTypeCheckCacheDir` at line 419, `instrumentHook` wrapping at lines 956–975, isolated `callLlmJudge` try/catch blocks at lines 774–786, the parse-failure throw at line 877, and `sessionIdForMcp` narrowing at lines 946–947.

`mcp-status.ts` scored lowest on relevance (0.88) — the judge noted that adding a `@deprecated` JSDoc is a minimal intervention for a dead-code gap; a more complete fix might have removed or re-routed the function. That's a fair read, and why the finding was intentionally low priority.

The BACKLOG entries were praised for accuracy: all four line number references were verified against live source, with a minor uncertainty on the H3 budget claim (the `1.5 cents per call` figure would need cross-checking against `quality-budget.ts`).

---

## Session Telemetry

| Metric | Value |
|--------|-------|
| Session ID | `99daa61f-c413-4692-9dab-4fa7f604e3ca` |
| Date | 2026-02-28 |
| Model | claude-opus-4-6 |
| Duration | 38.3 min (15:20–15:58) |
| Total Spans | 169 |
| Tool Calls | 98 (success: 95, failed: 3) |
| Input Tokens | 755 |
| Output Tokens | 87,061 |
| Cache Read Tokens | 33,759,937 |
| Top Tools | Bash (44), Read (20), Edit (16), Grep (9), TaskUpdate (6), TaskCreate (3) |
| Commits | 6 (4 reviewed by post-commit-review hook) |
| Hooks Observed | builtin-post-tool, builtin-pre-tool, code-structure, error-handling-reminder, notification, post-commit-review, session-start, skill-activation-prompt, telemetry-alert-evaluation, token-metrics-extraction, tsc-check |

The cache read token count (33.7M) reflects heavy context reuse across the hook files — most of the large files were read once and reused across subsequent edits without re-reading.

---

### Methodology Notes

- **tool_correctness** computed from `hook:builtin-post-tool` spans with `builtin.success` attribute. The 3 failures were non-blocking: one `Bash` call and two `Read` calls (likely probing files that didn't exist yet).
- **task_completion** reflects the in-session task tracker ratio: 3 tasks created, 3 completed = 1.0. The evaluation log records 0.5 from mid-session stop events captured before tasks resolved; the final ratio is 1.0.
- **evaluation_latency** is the median span duration (1.4ms) across all 169 hook spans — a measure of hook overhead, not LLM latency.
- LLM-as-Judge evaluation used the `genai-quality-monitor` agent with G-Eval scoring. Six source outputs were evaluated; each file/line reference was cross-checked against live source for faithfulness scoring.
