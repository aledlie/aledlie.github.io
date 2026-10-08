---
layout: single
author_profile: true
classes: wide
title: "Fixing the Clock: Content Consistency and Test Coupling in A10"
date: 2026-10-06
categories: [telemetry]
tags: [opentelemetry, observability, session-analysis, llm-as-judge, quality-metrics, flutter, content-quality, dart]
header:
  image: /assets/images/cover-reports.png
url: https://www.aledlie.com/reports/2026-10-06-fix-setup-time-content-consistency-a10/
permalink: /reports/2026-10-06-fix-setup-time-content-consistency-a10/
schema_type: analysis-article
schema_genre: "Session Report"
---

Ten seconds is the gap between "under 5 minutes" and reality. For 39 minutes, a Claude Code session on the IntegrityLandingPage repo tracked down a stubborn inconsistency: two places in `content.yaml` had promised users a 5-minute quickstart while every other reference in the codebase — the platform metrics constant, the Dart fallback, comparison copy, quickstart headers — said 15. The fix itself took four changed lines. The harder part was making the test stop pinning to the wrong answer.

The session handled two user requests: a memory-notes cleanup pass and then, as a separate commit, test-review finding A10 — a setup-time mismatch that had been quietly understating the product's real onboarding time in two public-facing strings.

---

## Quality Scorecard

Seven metrics. Three from rule-based telemetry analysis, four from LLM-as-Judge evaluation of the committed outputs. Together they form a complete picture of how well this session did its job.

### The Headline

```
 RELEVANCE        ████████████████████  1.00   healthy
 FAITHFULNESS     ███████████████████░  0.96   healthy
 COHERENCE        ████████████████████  1.00   healthy
 HALLUCINATION    ████████████████████  0.00   healthy  (lower is better)
 TOOL ACCURACY    ██████████████████░░  0.92   warning
 EVAL LATENCY     ████████████████████  1.44ms healthy
 TASK COMPLETION  ████████████████████  1.00   healthy
```

**Dashboard status: WARNING** — tool_correctness at 0.92 falls in the warning band (0.90–0.95). Two tool calls failed: one Read hit a missing file path and one Edit was blocked by a permission check. Both are expected friction from exploratory navigation in a large codebase; neither interrupted the session's progress toward the fix. All four content-quality metrics are healthy, though faithfulness was docked 0.04 on the test file due to an open question about async initialisation (see below).

---

### How We Measured

The first three metrics — tool correctness, evaluation latency, and task completion — were derived automatically from OpenTelemetry trace spans. Every tool call emits a span; the rule engine checks success flags and measures hook duration. Task completion falls back to 1.0 when no `TaskCreate`/`TaskUpdate` spans appear, which is correct here: the session used direct edits rather than the task system.

The content quality metrics come from **LLM-as-Judge evaluation** — a G-Eval pattern where a judge reads the session's committed outputs and scores along four criteria: relevance (did the output address the request?), faithfulness (are all facts traceable to source material?), coherence (is it well-structured?), and hallucination (was any content invented?). The three committed files — `content.yaml`, `test/unit/content/resources_content_test.dart`, and `docs/changelog/1.3/CHANGELOG.md` — were each evaluated independently.

---

### Per-Output Breakdown

Each committed file was evaluated independently, then aggregated:

| File | Relevance | Faithfulness | Coherence | Hallucination |
|------|-----------|-------------|-----------|---------------|
| `content.yaml` (4 lines changed) | 1.00 | 1.00 | 1.00 | 0.00 |
| `resources_content_test.dart` (8 lines changed) | 1.00 | 0.88 | 1.00 | 0.00 |
| `docs/changelog/1.3/CHANGELOG.md` (1 line changed) | 1.00 | 1.00 | 1.00 | 0.00 |
| **Session Average** | **1.00** | **0.96** | **1.00** | **0.00** |

---

### What the Judge Found

All three outputs scored at or near the ceiling. The content.yaml changes were the simplest possible correct output: both "under 5 minutes" occurrences replaced with "under 15 min" — exactly matching the YAML anchor at `platform_metrics.setup_time: &setup_time "15 min"` that governs every other reference in the file. No content was added or invented. The wording at line 885 ("under 15 min.") is a superset of "under 15 min", so the test's `contains` check passes without a trailing-period mismatch — a subtle correctness that the judge flagged as a positive.

The test file earned a perfect score on relevance and coherence but was docked on faithfulness (0.88) over one open question: `ContentLoader` is an async-initialised service (`await ContentLoader.load()`), while the surrounding test suite calls `AppContent.resources` synchronously. If ContentLoader is not initialised before the test runs, the guard `expect(ContentLoader.metricsSetupTime, isNotEmpty)` would fail explicitly — a red test, not a silent false positive — which is the correct failure mode. The coupling logic itself is sound; the uncertainty is whether CI initialises ContentLoader in scope. Worth verifying.

The changelog entry scores 1.00 across all dimensions. The judge confirmed it accurately names both content.yaml locations, correctly identifies ContentLoader.metricsSetupTime as the coupling mechanism, and correctly notes that A10's second half (contact_content_test.dart) was already resolved under TS08.

No hallucination was detected across any output. Every claim in the session's deliverables is traceable to the codebase.

---

## Session Telemetry

| Metric | Value |
|--------|-------|
| Session ID | `48aac841-89e2-4d69-a040-5c363f594c30` |
| Date | 2026-10-06 |
| Model | claude-opus-5-5 |
| Duration | 39.0 min |
| Total Spans | 72 |
| Tool Calls | 25 (success: 23, failed: 2) |
| Tool Breakdown | Bash: 22, Read: 2, Edit: 1 |
| Input Tokens | 220 |
| Output Tokens | 71,937 |
| Cache Read Tokens | 13,240,258 |
| Cache Creation Tokens | 758,913 |
| Subagent Stops | 5 |
| Hooks Observed | builtin-post-tool, builtin-pre-tool, error-handling-reminder, notification, plugin-post-tool, plugin-pre-tool, post-commit-review, session-end, session-start, skill-activation-prompt, subagent-stop, token-metrics-extraction |

The cache hit rate was exceptional: 13.2M cache-read tokens against 220 input tokens reflects a context that was almost entirely served from cache by the time the fix was made — a sign of a long, well-warmed session. The output token count (71,937) includes exploration and reasoning across the full 39-minute window; the actual diff committed to git was 13 lines across 3 files.

---

### Methodology Notes

Telemetry was extracted from `~/.claude-history/telemetry/traces-2026-10-06.jsonl` (72 spans). Token counts were aggregated from three `hook:token-metrics-extraction` spans spanning the full session. The two tool errors captured in logs were a `Read` call returning `not_found` (file path not present) and an `Edit` call blocked by `permission` — both surfaced as `WARN` severity logs but did not trigger session-level errors.

Committed file paths were identified from the `integritystudio.git.files` attribute on the `hook:post-commit-review` span. LLM-as-Judge scores reflect evaluation of the committed diffs, not the full file contents. Task completion defaults to 1.0 per the metric definition when no task spans are present; this session used direct editing rather than the task orchestration system, so the fallback is appropriate.

The tool-correctness warning (0.92) reflects two failed calls in a 25-call session. At this scale, one or two exploratory misses during navigation are expected; the threshold exists to catch systematic failure patterns, not isolated misses.
