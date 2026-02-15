---
layout: single
author_profile: true
classes: wide
title: "Six Sessions, One Design Spec: Aggregate Telemetry for LLM Explainability Dashboard"
date: 2026-02-14
categories: [telemetry]
tags: [opentelemetry, observability, session-analysis, llm-as-judge, quality-metrics, aggregate, multi-session, frontend-design, explainability]
header:
  image: /assets/images/cover-reports.png
url: https://www.aledlie.com/reports/2026-02-14-llm-explainability-design-aggregate-telemetry/
permalink: /reports/2026-02-14-llm-explainability-design-aggregate-telemetry/
schema_type: analysis-article
schema_genre: "Session Report"
---

How does a 1,463-line frontend design spec come into existence? Not in a single sitting. Over the course of eight days, six Claude Code sessions wove together platform research, codebase audits, regulatory analysis, and UX pattern extraction -- then distilled it all into a production specification for an LLM evaluation explainability dashboard. This report traces the telemetry footprint of that entire arc, from the first Wiz.io research scrape on February 6th to the final `git commit` at 19:23 EST on Valentine's Day.

---

## Quality Scorecard

Seven metrics. Three from rule-based telemetry analysis across all six contributing sessions, four from LLM-as-Judge evaluation of the four deliverable documents. Together they form a complete picture of how well this multi-session workflow performed.

### The Headline

```
 RELEVANCE       ██████████████████░░  0.91   healthy
 FAITHFULNESS    ██████████████████░░  0.89   healthy
 COHERENCE       ███████████████████░  0.94   healthy
 HALLUCINATION   ███████████████████░  0.06   warning  (lower is better)
 TOOL ACCURACY   ████████████████████  1.00   healthy
 EVAL LATENCY    ████████████████████  3.9ms  healthy
 TASK COMPLETION ████████████████████  1.00   healthy
```

**Dashboard status: warning** -- Hallucination at 0.06 sits just above the 0.05 healthy threshold. A single function-reference inaccuracy (`computeExecutiveView()` vs the actual unified `computeRoleView()`) and unverifiable CHI 2025 citation content account for the score.

---

## How We Measured

The first three metrics -- tool correctness, evaluation latency, and task completion -- were derived automatically from OpenTelemetry trace spans emitted by Claude Code's hook pipeline. Every tool call (Write, Edit, Bash, TaskCreate, TaskUpdate, TaskOutput) produces pre/post spans; the rule engine checks `builtin.success` and measures duration. These metrics are aggregated across all six sessions (630 total spans, 393 tool spans).

The content quality metrics come from **LLM-as-Judge evaluation** using a G-Eval pattern. An AI judge read all four deliverable documents in full and cross-referenced claims against the actual codebase (`quality-metrics.ts`, `llm-as-judge.ts`, `backends/index.ts`), the source research documents, and external references (OTel attribute names, regulatory article numbers, platform feature claims). Line-level verification was performed where references cited specific code locations.

---

## Per-Output Breakdown

Each output was evaluated independently, then aggregated:

| Document | Relevance | Faithfulness | Coherence | Hallucination |
|----------|-----------|-------------|-----------|---------------|
| `llm-explainability-design.md` (1,463 lines) | 0.95 | 0.88 | 0.96 | 0.08 |
| `llm-explainability-research.md` (research) | 0.95 | 0.85 | 0.94 | 0.08 |
| `wiz-io-security-explainability-ux.md` (research) | 0.82 | 0.90 | 0.93 | 0.05 |
| `quality-dashboard-ux-review.md` (gap analysis) | 0.93 | 0.91 | 0.94 | 0.03 |
| **Session Average** | **0.91** | **0.89** | **0.94** | **0.06** |

---

## What the Judge Found

**Coherence was the standout signal (0.94 avg).** All four documents demonstrate disciplined internal structure. The design spec uses a repeating pattern throughout its 16 sections: every component includes an anatomy diagram, TypeScript props interface, state definitions, accessibility notes, and data source mapping. Cross-references between documents use precise section numbers (e.g., "[Research Section 3, Pattern 1]", "[UX Review Gap G1]") -- all verified as accurate.

**The one faithfulness slip.** The design spec references `computeExecutiveView()`, `computeOperatorView()`, and `computeAuditorView()` as three separate functions (line 1387). The codebase actually uses a single `computeRoleView(summary, role)` function. The types exist separately, so this is not fabrication -- but it could mislead an implementer. This single inaccuracy accounts for most of the 0.08 hallucination score on the design spec.

**Section 16 (Feature Engineering) is original work.** The statistical methods -- Gini coefficient for coverage uniformity, Pearson R for correlation discovery, composite quality index with configurable weights -- are properly applied but extend beyond the source research. They are clearly labeled as "Proposed" but blur the boundary between "translating existing findings" and "original design contributions."

**The UX Review scored lowest hallucination (0.03).** Because it makes claims primarily about the existing codebase, every assertion was directly verifiable. `MetricConfigBuilder`, `AlertThreshold`, and `TriggeredAlert` interfaces were all confirmed. Implementation status commit hashes provide an audit trail.

**The Wiz.io research scored lowest relevance (0.82).** Much of the document describes security-specific features (CSPM, CWPP, attack paths) that serve as contextual background rather than directly applicable patterns. The abstracted design patterns -- toxic combinations, progressive disclosure, role-based views -- are the pieces that directly informed the design spec.

---

## Session Telemetry

### Aggregate

| Metric | Value |
|--------|-------|
| Contributing Sessions | 6 |
| Date Range | 2026-02-06 to 2026-02-14 |
| Primary Model | claude-opus-4-6 (120 LLM calls) |
| Secondary Model | claude-haiku-4-5 (27 LLM calls) |
| Total Spans | 630 |
| Tool Calls | 393 (success: 393, failed: 0) |
| Input Tokens | 434,772 |
| Output Tokens | 831,080 |
| Cache Read Tokens | 753,838,706 |
| Cache Creation Tokens | 49,218,250 |
| Commit | `e00ab1b` |

### Per-Session Breakdown

| # | Session ID (short) | Phase | Duration | Spans | Tool Calls | Role |
|---|-------------------|-------|----------|-------|------------|------|
| S1 | `452e6359` | Research | 10 min | 8 | 3 | Wiz.io UX scraping (webscraping-research-analyst) |
| S2 | `919e6917` | Research | 7 hours | 130 | 68 | Main research: 8 subagent phases, iterative doc refinement |
| S3 | `eea5c092` | Design | 2 hours | 311 | 195 | Orchestrator: code review + design spec, 5 tasks completed |
| S4 | `769b5ef9` | Design | 18 min | 21 | 10 | Fetch CHI conference + regulatory source material |
| S5 | `bd0dd9fe` | Design | 2.2 hours | 68 | 51 | Explore dashboard UI data flow |
| S6 | `dbbe3b2e` | Design | 16 min | 33 | 28 | Final file creation + git commit |

### Tool Usage (Aggregate)

| Tool | Count | Sessions Used In |
|------|-------|-----------------|
| Edit | 135 | S2, S3, S4, S5, S6 |
| Bash | 139 | S3, S4, S5, S6 |
| TaskUpdate | 42 | S2, S3 |
| TaskOutput | 28 | S1, S2, S3, S4, S5 |
| TaskCreate | 16 | S2, S3 |
| Write | 14 | S1, S2, S3, S4, S6 |

### Token Usage by Phase

| Phase | Model | LLM Calls | Input | Output | Cache Read | Cache Creation |
|-------|-------|-----------|-------|--------|------------|----------------|
| Research (Feb 6) | opus-4-6 | 68 | 349,534 | 487,678 | 618,134,575 | 40,552,678 |
| Research (Feb 6) | haiku-4-5 | 5 | 538 | 5,034 | 8,678,825 | 1,235,592 |
| Design (Feb 14) | opus-4-6 | 52 | 84,622 | 338,116 | 125,320,108 | 6,959,494 |
| Design (Feb 14) | haiku-4-5 | 22 | 78 | 252 | 1,705,198 | 470,486 |

### Session Timeline

```
Feb 6  11:50 ━━━━━━━━ S2: Research Main (130 spans, ~7h) ━━━━━━━━━━━ 18:55
Feb 6  12:14 ━━ S1: Wiz.io Research (8 spans, 10m) ━━ 12:24

Feb 14 16:55 ━━━━━━━ S5: Dashboard Explore (68 spans, ~2.2h) ━━━━━━━━ 19:10
Feb 14 16:57 ━━━━━━━ S3: Main Design (311 spans, ~2h) ━━━━━━━━ 18:55
Feb 14 18:56 ━━━━━ S4: Fetch Sources (21 spans, 18m) ━━━━━ 19:13
Feb 14 19:11 ━━━━━━ S6: Commit (33 spans, 16m) ━━━━━━ 19:27
                                      ^ commit e00ab1b @ 19:23
```

---

## Rule-Based Metrics (Per Session)

| Session | tool_correctness | eval_latency (ms) | task_completion | Total Spans | Tool Spans |
|---------|------------------|--------------------|-----------------|-------------|------------|
| S1 `452e6359` | 1.00 | 2.96 | -- | 8 | 2 |
| S2 `919e6917` | 1.00 | 2.89 | 0.00* | 130 | 68 |
| S3 `eea5c092` | 1.00 | 4.68 | 1.00 | 311 | 195 |
| S4 `769b5ef9` | 1.00 | 4.17 | -- | 21 | 8 |
| S5 `bd0dd9fe` | 1.00 | 4.82 | -- | 68 | 48 |
| S6 `dbbe3b2e` | 1.00 | 3.72 | -- | 33 | 28 |
| **Aggregate** | **1.00** | **3.94** | **1.00** | **630** | **393** |

*S2's task_completion = 0.00 is a telemetry tracking artifact: the session created 6 tasks via TaskCreate but completion signals were emitted via TaskUpdate spans that did not carry the expected `builtin.task_status=completed` attribute in the hook data. The design orchestrator session (S3) correctly tracked all 5 tasks to completion.

---

## Evaluation Coverage

| Session | Rule-Based Evals | LLM-as-Judge Evals | Notes |
|---------|-----------------|---------------------|-------|
| S1 `452e6359` | 7 (4 latency, 2 correctness, 1 completion) | -- | Short subagent, fully evaluated |
| S2 `919e6917` | 114 (61 latency, 51 correctness, 2 completion) | -- | Heaviest evaluation coverage |
| S3-S6 (Design) | 0 | -- | Evaluation pipeline stopped at 21:36 UTC, 19 min before design sessions began |
| All outputs | -- | 4 outputs scored | LLM-as-Judge evaluated all deliverable documents |

---

## Methodology Notes

- **Telemetry source**: Local JSONL files at `~/.claude/telemetry/` (traces, logs, evaluations) supplemented by SigNoz Cloud query for cross-validation.
- **Session identification**: Sessions were identified by correlating `session.id` attributes in hook trace spans with git commit timestamps and `agent.description` fields. File-path-level attribution was not available in hook spans; sessions were linked to outputs via temporal proximity to `git commit` and agent description matching.
- **Token metrics limitation**: Token usage spans (`hook:token-metrics-extraction`) do not carry `session.id` and were attributed by phase time window rather than individual session. This means token numbers represent the full activity in each time window, not strictly the design-doc work.
- **Evaluation gap**: The rule-based evaluation pipeline (`telemetry-rule-engine`) stopped processing at 21:36 UTC on Feb 14. All four design-phase sessions (S3-S6) began after this cutoff and have zero rule-based evaluations in the evaluation JSONL files. The per-session rule-based metrics reported here are computed directly from trace span attributes, not from the evaluation pipeline.
- **Task completion interpretation**: S2's 0.00 task_completion reflects the ratio of `TaskUpdate` spans with `status=completed` to `TaskCreate` spans. The research session used tasks for tracking but completion signals may have been recorded differently. S3's 1.00 reflects all 5 tasks tracked through `builtin.task_id` and `builtin.task_status` attributes.
- **LLM-as-Judge verification**: The judge cross-referenced code-level claims against actual source files, verifying line references (`quality-metrics.ts:1298-1360`, `llm-as-judge.ts:247-282`), function signatures, and interface definitions. Platform feature claims were validated against cited source URLs where possible.
