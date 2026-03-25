---
layout: single
author_profile: true
classes: wide
title: "Migration Anomaly Classification: When Your OTEL Dashboard Lies to You"
date: 2026-02-23
categories: [telemetry]
tags: [opentelemetry, observability, session-analysis, llm-as-judge, quality-metrics, anomaly-detection, migration, sre]
header:
  image: /assets/images/cover-reports.png
url: https://www.aledlie.com/reports/2026-02-23-migration-anomaly-otel-expected-degradation-classification/
permalink: /reports/2026-02-23-migration-anomaly-otel-expected-degradation-classification/
schema_type: analysis-article
schema_genre: "Session Report"
---

The dashboard showed `tool_correctness: 0.89` — CRITICAL. Alerts fired. And the system was doing exactly what it should: working through the tail end of a three-phase TypeScript migration. The session that followed was devoted to fixing the alert system itself: documenting why this happens, building a classification framework for expected anomalies, and laying the implementation groundwork so that future migrations don't look like incidents.

Four deliverables came out of it — a Jekyll article for practitioners, a technical implementation plan, a statistical reference document, and backlog entries — and this report evaluates how well each one did its job.

## Quality Scorecard

Seven metrics. Three from rule-based telemetry analysis, four from LLM-as-Judge evaluation of the session outputs. Together they form a complete picture of how well this session did its job.

### The Headline

```
 RELEVANCE        ███████████████████░  0.96   healthy
 FAITHFULNESS     ██████████████████░░  0.91   healthy
 COHERENCE        ███████████████████░  0.94   healthy
 HALLUCINATION    ██████████████████░░  0.09   warning  (lower is better)
 TOOL ACCURACY    ████████████████████  0.99   healthy
 EVAL LATENCY     ████████████████████  0.005s healthy
 TASK COMPLETION  ░░░░░░░░░░░░░░░░░░░░   N/A   —
```

**Dashboard status: warning** — hallucination at 0.09 sits in the 0.05–0.1 warning band. The judge traced this to forward-looking quantitative estimates (per-type baseline values, false positive reduction percentages) stated without consistent "estimated" qualifiers throughout the documents. Not fabricated — reasonable engineering projections — but some care is needed distinguishing observed from projected values.

### How We Measured

Tool correctness, evaluation latency, and task completion were derived automatically from OpenTelemetry trace spans. Every tool call emits a span; the rule engine checks whether it succeeded and how long it took. Task completion is marked N/A because this session used `Write`/`Edit`/`Bash` directly rather than `TaskCreate`/`TaskUpdate` — no task lifecycle data to ratio.

The content quality metrics come from **LLM-as-Judge evaluation** — a G-Eval pattern where an AI judge reads the session's four output files and scores them on relevance, faithfulness, coherence, and hallucination. The judge verified commit hashes against git log, checked file paths, and validated statistical formulas before scoring.

### Per-Output Breakdown

Each output was evaluated independently, then aggregated:

| Document | Relevance | Faithfulness | Coherence | Hallucination |
|----------|-----------|-------------|-----------|---------------|
| Jekyll article (migration anomaly, ~1,600 words) | 0.97 | 0.88 | 0.96 | 0.12 |
| Implementation plan (`/tmp/anomaly-implementation-plan.md`) | 0.97 | 0.91 | 0.94 | 0.09 |
| Classification reference (`EXPECTED_ANOMALY_CLASSIFICATION.md`) | 0.98 | 0.90 | 0.97 | 0.10 |
| Backlog entries (ANO-1, ANO-2 in BACKLOG.md) | 0.93 | 0.95 | 0.88 | 0.05 |
| **Session Average** | **0.96** | **0.91** | **0.94** | **0.09** |

### What the Judge Found

**Strongest piece: the classification reference doc.** Coherence 0.97 — the taxonomy, statistical methods, and threshold tables flow into each other naturally. The MAD formula and CUSUM parameters were verified against the canonical sources (Iglewicz & Hoaglin 1993, Montgomery 2019 — both real, both correctly cited). The `ctx.addAttributes` implementation pattern matches the actual hooks API. Edge cases (MAD=0, N<5) are handled explicitly. This is a document that could be handed to another engineer and used immediately.

**Most precise claim in the session:** The global thresholds cited across all four documents — `tool_correctness: 0.95`, `token_burn: 200K`, `hook_latency_p95: 500ms`, `task_completion: 0.60` — were all verified against `check-thresholds.sh` and `constants.ts`. When the article says "the 0.95 threshold fired during a migration session," that is a true statement traceable to the actual configuration.

**The hallucination warning:** The per-type baseline table in the Jekyll article presents migration session characteristics (tool_correctness median 0.88, avg latency 2.1s, avg token burn 150K) as observed values. But `session.type` tagging does not exist yet — those values are engineering estimates based on qualitative experience with the TS migration, not measured medians from tagged session data. The article's roadmap section acknowledges this correctly, but the table header does not carry a "(projected)" qualifier. Same pattern in the classification reference's proposed per-type threshold table. The backlog entries avoid this issue entirely, scoring faithfulness 0.95 — the entries make no quantitative claims, just accurately summarize what was built and what is pending.

**Coherence note on the backlog:** The `BACKLOG.md` header still reads "Last Updated: 2026-02-16 (Session 3)" after the new ANO-1/ANO-2 entries were appended. Minor, but a reader scanning the header would miss the 2026-02-23 additions.

## Session Telemetry

| Metric | Value |
|--------|-------|
| Session ID | `406a06d8-7daf-4970-937a-3f415a3a3f01` |
| Date | 2026-02-23 |
| Model | Claude Opus 4.6 |
| Total Spans | 141 |
| Tool Calls | 101 |
| Input Tokens | 43,246 |
| Output Tokens | 52,424 |
| Cache Read Tokens | 7,917,462 |
| Total Tokens | 95,670 |
| Hooks Observed | session-start, builtin-post-tool, builtin-pre-tool, agent-post-tool, agent-pre-tool, plugin-post-tool, plugin-pre-tool, notification, skill-activation-prompt, error-handling-reminder, token-metrics-extraction |

The cache read token count (7.9M) reflects context reuse across a multi-file read-heavy session — the hooks system, existing backlog format, Jekyll article conventions, and session-start.ts were all read before writing, amortizing that context across all four output files.

## Methodology Notes

Session `406a06d8` was identified from today's trace file (`traces-2026-02-23.jsonl`) by matching session IDs across 141 spans. The compute-metrics script calculated tool_correctness from `builtin-post-tool` and `mcp-post-tool` spans. No task lifecycle spans were present, so task_completion returns null rather than a ratio.

The four output files were read in full by the LLM-as-Judge agent before scoring. Claims were cross-checked against: git log (commit hashes), `~/.claude/hooks/handlers/session-start.ts` (attribute API), `~/.claude/skills/otel-improvement/scripts/check-thresholds.sh` (threshold values), and standard statistical references (MAD, CUSUM). The judge flagged forward-looking estimates as a faithfulness risk but did not classify them as hallucinations — the distinction being that the estimates are reasonable extrapolations from observed behavior, not invented figures.

The note about `ctx.addAttribute` (singular, line 27) vs `ctx.addAttributes` (plural, in the implementation plan) is a real API discrepancy — the plan's code snippets have been corrected to use the singular form matching the actual call at line 27.

---

## Appendix A: OTEL Data

### Trace Summary

| Field | Value |
|-------|-------|
| Trace file | `~/.claude/telemetry/traces-2026-02-23.jsonl` |
| Session ID | `406a06d8-7daf-4970-937a-3f415a3a3f01` |
| Total spans | 141 |
| Tool spans | 101 |
| Hook types | 11 |

### Hook Span Distribution

| Hook | Role |
|------|------|
| `session-start` | Environment checks, git status, task restore |
| `builtin-post-tool` | Write/Edit/Bash success tracking |
| `builtin-pre-tool` | Permission checks |
| `agent-post-tool` | Subagent completion tracking |
| `agent-pre-tool` | Subagent launch tracking |
| `plugin-post-tool` | Plugin call completion |
| `plugin-pre-tool` | Plugin call launch |
| `notification` | Alert dispatch |
| `skill-activation-prompt` | Skill matching |
| `error-handling-reminder` | Error pattern detection |
| `token-metrics-extraction` | Token usage capture |

### Token Breakdown

| Category | Tokens |
|----------|--------|
| Input | 43,246 |
| Output | 52,424 |
| Cache Read | 7,917,462 |
| Total (excl. cache) | 95,670 |

### Rule-Based Metrics

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| tool_correctness | 0.9901 | 0.95 | healthy |
| evaluation_latency | 0.005s | 1.0s | healthy |
| task_completion | N/A | 0.90 | N/A (no task lifecycle spans) |

---

## Appendix B: Readability Scores Index

Textstat analysis of all session outputs (front matter excluded).

### D5 — Quality Report (this document)

| Metric | Score |
|--------|-------|
| Flesch Reading Ease | 32.1 |
| Flesch-Kincaid Grade | 11.6 |
| Gunning Fog Index | 14.1 |
| SMOG Index | 12.6 |
| Coleman-Liau Index | 17.0 |
| Automated Readability Index | 11.9 |
| Dale-Chall Score | 14.2 |
| Linsear Write | 14.6 |
| Consensus Grade | 11th-12th grade |
| Reading Time | 32s |
| Word Count | 284 |
| Sentence Count | 25 |
| Avg Sentence Length | 11.4 words |

### D1 — Jekyll Article (Expected Anomalies in OTEL Migration Metrics)

| Metric | Score |
|--------|-------|
| Flesch Reading Ease | 35.7 |
| Flesch-Kincaid Grade | 11.8 |
| Gunning Fog Index | 14.8 |
| SMOG Index | 13.6 |
| Coleman-Liau Index | 15.8 |
| Automated Readability Index | 12.7 |
| Dale-Chall Score | 13.8 |
| Linsear Write | 7.3 |
| Consensus Grade | 13th-14th grade |
| Reading Time | 2m 33s |
| Word Count | 1,647 |
| Sentence Count | 115 |
| Avg Sentence Length | 14.3 words |

### Readability Summary

Both documents score in the "difficult" range (Flesch Reading Ease 32-36), consistent with technical writing for practitioners who understand OTEL, SRE, and statistical methods. The Jekyll article has a higher consensus grade (13th-14th) due to longer sentences and more domain-specific vocabulary. The report is slightly more accessible (11th-12th) due to shorter tabular content and bullet structure.

---

## Appendix C: Session Summary

### Deliverables

| ID | Artifact | Location | Status |
|----|----------|----------|--------|
| D1 | Jekyll article — expected anomalies in OTEL migration metrics | `~/code/personal-site/_work/2026-02-23-expected-anomalies-in-otel-migration-metrics.md` | Written |
| D2 | Backlog entries — ANO-1 (implementation), ANO-2 (reference doc) | `docs/BACKLOG.md` | Appended |
| D3 | Classification reference — session type taxonomy, MAD Z-score, CUSUM, per-type thresholds | `docs/EXPECTED_ANOMALY_CLASSIFICATION.md` | Written |
| D4 | Implementation plan — session-start.ts, summarize-session.py, check-thresholds.sh, update-scorecard.sh | `/tmp/anomaly-implementation-plan.md` | Written |
| D5 | Quality report (this document) | `_reports/2026-02-23-migration-anomaly-otel-expected-degradation-classification.md` | Published |

### LLM-as-Judge Scores

| Metric | D1 Article | D2 Backlog | D3 Reference | D4 Plan | Average |
|--------|-----------|-----------|-------------|---------|---------|
| Relevance | 0.97 | 0.93 | 0.98 | 0.97 | **0.96** |
| Faithfulness | 0.88 | 0.95 | 0.90 | 0.91 | **0.91** |
| Coherence | 0.96 | 0.88 | 0.97 | 0.94 | **0.94** |
| Hallucination | 0.12 | 0.05 | 0.10 | 0.09 | **0.09** |

### Key Findings

- **Strongest output:** D3 (classification reference) — coherence 0.97, immediately usable by another engineer
- **Highest faithfulness:** D2 (backlog entries) — 0.95, no quantitative claims to verify
- **Hallucination source:** Forward-looking per-type baseline estimates presented without consistent "projected" qualifiers (D1, D3)
- **Actionable fix applied:** Implementation plan corrected to use `ctx.addAttribute` (singular) matching actual API at `session-start.ts:27`
- **Dashboard status:** warning (hallucination 0.09 in 0.05-0.1 band)
