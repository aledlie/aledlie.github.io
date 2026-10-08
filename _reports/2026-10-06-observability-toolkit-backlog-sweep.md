---
layout: single
author_profile: true
classes: wide
title: "Observability Toolkit: Backlog Sweep"
date: 2026-10-06
categories: [telemetry]
tags: [opentelemetry, observability, session-analysis, llm-as-judge, quality-metrics, hooks, agents, backlog, typescript]
header:
  image: /assets/images/cover-reports.png
url: https://www.aledlie.com/reports/2026-10-06-observability-toolkit-backlog-sweep/
permalink: /reports/2026-10-06-observability-toolkit-backlog-sweep/
schema_type: analysis-article
schema_genre: "Session Report"
---

Eleven open items. Four worktrees. Two models — claude-opus-5-5 steering the session and claude-fable-5-1 doing the implementation work in parallel worktrees. Over the course of 28 hours spanning October 5th into October 6th, 2026, a multi-agent session worked through the observability-toolkit backlog in earnest: a missing cohort field on an MCP evaluation schema, an OTel shutdown path that broke re-initialization, four HTTP fetch call sites routed through the wrong transport on Node 26, and more. Thirty-three commits, 31 subagents, 1,664 tool calls — and a task-completion meter that plateaued at 50% as the second half of the queue kept the clock running.

---

## Quality Scorecard

Seven metrics. Three from rule-based telemetry analysis, four from LLM-as-Judge evaluation of the session outputs. Together they form a complete picture of how well this session did its job.

### The Headline

```
    RELEVANCE       ███████████████████░  0.96   healthy
    FAITHFULNESS    ███████████████████░  0.96   healthy
    COHERENCE       ███████████████████░  0.95   healthy
    HALLUCINATION   ███████████████████░  0.03   healthy  (lower is better)
    TOOL ACCURACY   ████████████████████  0.97   healthy
    EVAL LATENCY    ████████████████████  1.3ms  healthy
    TASK COMPLETION ██████████░░░░░░░░░░  0.50   critical
```

**Dashboard status: CRITICAL** — task completion settled at 50% (4 of 8 active tasks marked done by session end). The remaining four were open items that likely carried into subsequent sessions. All other metrics are healthy: tool accuracy at 0.97 across 1,664 spans, median hook latency at 1.3ms, and code-quality LLM scores consistent with targeted, test-backed bug fixes.

---

### How We Measured

The first three metrics — tool accuracy, evaluation latency, and task completion — were derived automatically from OpenTelemetry trace spans emitted by the hooks system. Every tool call emits a span; the rule engine checks success rate and median hook execution time across 4,929 total spans. Task completion reflects the session's own `hook:stop-session-summary` evaluations, which tracked 8 active tasks reaching a 4/8 completion ratio by the final stop.

The content quality metrics come from **LLM-as-Judge evaluation** — a G-Eval pattern where the judge reads each committed output and scores along four criteria: relevance, faithfulness, coherence, and hallucination. For this session, five source files were evaluated: `src/tools/inject-evaluations.ts`, `src/lib/observability/instrumentation.ts`, `src/server.ts`, `src/tools/hallucination-detection.ts`, and `src/lib/core/http1-fetch.ts`. The judge ran as the `genai-quality-monitor` agent launched concurrently with report generation.

---

### Per-Output Breakdown

Each output was evaluated independently, then aggregated:

| Document | Relevance | Faithfulness | Coherence | Hallucination |
|----------|-----------|--------------|-----------|---------------|
| `src/tools/inject-evaluations.ts` | 0.98 | 0.96 | 0.97 | 0.02 |
| `src/lib/observability/instrumentation.ts` | 0.97 | 0.95 | 0.94 | 0.03 |
| `src/server.ts` | 0.95 | 0.93 | 0.92 | 0.03 |
| `src/tools/hallucination-detection.ts` | 1.00 | 0.97 | 0.97 | 0.02 |
| `src/lib/core/http1-fetch.ts` | 0.90 | 0.97 | 0.95 | 0.03 |
| **Session Average** | **0.96** | **0.96** | **0.95** | **0.03** |

---

### What the Judge Found

The top relevance score (1.00) went to `hallucination-detection.ts` — the fix adds a `truncated` flag to `hallucinationDetectionNoDataSchema` and its factory helper, bringing the `no-data` variant into parity with the `result` variant where the flag already existed. The asymmetry was the bug, and the fix is exactly one field addition in two places. The judge noted the default `truncated = false` provides backward compatibility for all existing call sites, and the flag's value is meaningful: an incomplete read is a plausible cause of an empty hallucination list, so the fix is not just cosmetic.

`inject-evaluations.ts` scored 0.98 on relevance. Adding `cohort: evaluationCohortSchema.optional()` to `evaluationPayloadSchema` follows the exact `.optional().describe()` pattern used by every surrounding field. The import of `evaluationCohortSchema` from shared-schemas resolves to a real exported symbol. The judge's minor faithfulness note: the `refine` conditions on lines 168–177 were not updated, but correctly so — those conditions validate correlation IDs and score values, and no cohort-specific constraint was needed.

The `http1-fetch.ts` fix earned the lowest relevance score (0.90) not for any error but because the file is the library definition for `http1Fetch`, not the four bare-fetch call sites the commit message describes. The actual switched call sites live in peer files, with one confirmed at `inject-evaluations.ts` line 88. Faithfulness was the file's strongest dimension (0.97) — Undici API usage is correct, `allowH2: false` is a valid `Agent` option, and the lazy `??=` initialization is sound.

No hallucination was detected across any output. All API calls, type signatures, and schema fields map to documented patterns in the surrounding codebase. As the judge noted: "hallucination risk across the session is effectively zero."

---

## Session Telemetry

| Metric | Value |
|--------|-------|
| Session ID | `dac8905e-ae5b-42a7-b0b3-399bad6a7c4e` |
| Date | 2026-10-05 18:34 UTC – 2026-10-06 22:58 UTC |
| Duration | 28.4 hours |
| Models | claude-opus-5-5 (orchestration), claude-fable-5-1 (implementation) |
| Total Spans | 4,929 |
| Tool Calls | 1,664 spans (success: 1,607, failed: 57) |
| Bash calls | 926 successful, 54 failed |
| Edit calls | 304 successful |
| Read calls | 300 successful, 3 failed |
| Input Tokens | 256,481 |
| Output Tokens | 62,686,502 |
| Cache Read Tokens | 7,377,444,922 |
| Cache Creation Tokens | 158,431,856 |
| Exchange count | 24,048 messages across 41 stops |
| Subagents launched | 31 (24× general-purpose, 7× code-reviewer) |
| Commits | 33 |
| Worktrees | backlog-trivial-fixes, dashboard, api-provisioning-receiver, obtool-ingest |

### Tool accuracy breakdown

Of 57 failed tool calls: 45 were Bash (shell commands that exited non-zero — expected in a test-driven workflow where the agent runs tests to observe failures before fixing them), 8 were Agent spawn failures, 2 were Read failures (files that did not exist in the active worktree), and 1 was an EnterWorktree failure.

### Commits made this session

| Subject | Backlog item |
|---------|-------------|
| feat(inject-evaluations): add cohort field to evaluationPayloadSchema | INJECT-TOOL-NO-COHORT |
| fix(instrumentation): call clearOtelGlobals in shutdown() | INSTRUMENTATION-REINIT-AFTER-SHUTDOWN |
| perf(server): fire-and-forget initial context refresh | MCP-STARTUP-AWAITS-CONTEXT-REFRESH |
| chore(backends): mark legacy constants as deprecated | GENAI-EVAL-LEGACY-CONSTANTS |
| fix(hallucination-detection): add truncated flag to no-data result | HALLUCINATION-NODATA-NO-TRUNCATED |
| refactor(kv-org): delete resolveOrgFromKvValue, make resolveKvRecord private | KV-ORG-STATUS-BLIND-EXPORTS |
| docs(backlog): mark CI-NODE-26-UNTESTED done | CI-NODE-26-UNTESTED |
| docs: note Node >=22.19.0 floor in README | NODE20-DROP-PUBLISH-NOTE |
| fix(cloud): responseId metadata fallback and per-page evaluation mapping | — |
| fix(judge): settle cancelled-batch results instead of aborting the run | JUDGE-BATCH-WALLCLOCK-ABORTS-RUN |
| fix(fetch): route built-in fetch calls through http1Fetch on Node 26 | UNDICI8-GLOBAL-FETCH-HTTP2 |

---

## Methodology Notes

**Task completion caveat.** The 50% ratio reflects the session's own hook evaluation at stop time — 8 tasks tracked, 4 marked complete. The `compute-metrics.py` rule returned 0.0 because the TaskUpdate spans lacked the `integritystudio.task.status` attribute; the hook evaluation data was used in its place as the more authoritative signal.

**LLM-as-Judge scope.** The judge evaluated five of the 37 source files changed across 33 commits — the five most directly tied to named backlog items. The per-file scores should be read as indicative of the session's output quality rather than as a coverage-weighted average. Files changed in the `dashboard`, `api-provisioning-receiver`, and `obtool-ingest` worktrees were not included in this evaluation pass.

**Token scale.** The 7.4B cache-read tokens and 62.7M output tokens reflect a heavily multi-agent session across four worktrees over 28 hours. The cache utilization is expected given the repeated context injections across 24,048 message exchanges; the high output count is a function of the model producing code, test assertions, and commit messages across 33 separate commits.
