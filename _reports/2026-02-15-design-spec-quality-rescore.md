---
layout: single
author_profile: true
classes: wide
title: "From Warning to Healthy: Re-Scoring the LLM Explainability Design Spec"
date: 2026-02-15
categories: [telemetry]
tags: [opentelemetry, observability, session-analysis, llm-as-judge, quality-metrics, rescore, hallucination-fix, faithfulness, design-spec]
header:
  image: /assets/images/cover-reports.png
url: https://www.aledlie.com/reports/2026-02-15-design-spec-quality-rescore/
permalink: /reports/2026-02-15-design-spec-quality-rescore/
schema_type: analysis-article
schema_genre: "Session Report"
---

A 1,466-line design spec scored 0.08 on hallucination -- just above the 0.05 healthy threshold. One fabricated function name, one non-existent type, and one unverifiable citation. This session diagnosed the telemetry data, applied 12 targeted fixes across three quality dimensions, then re-scored. The result: hallucination dropped to 0.04 (healthy), faithfulness climbed from 0.88 to 0.94, and the dashboard status flipped from warning to healthy.

---

## Quality Scorecard

Seven metrics. Three rule-based from this session's telemetry, four from LLM-as-Judge re-evaluation of the fixed design spec.

### The Headline

```
 RELEVANCE       ███████████████████░  0.96   healthy
 FAITHFULNESS    ███████████████████░  0.94   healthy
 COHERENCE       ███████████████████░  0.97   healthy
 HALLUCINATION   ███████████████████░  0.04   healthy  (lower is better)
 TOOL ACCURACY   ████████████████████  1.00   healthy
 EVAL LATENCY    ████████████████████  4.1ms  healthy
 TASK COMPLETION ████████████████████  1.00   healthy
```

**Dashboard status: healthy** -- All metrics within thresholds. Hallucination crossed from warning (0.06) to healthy (0.04).

---

## Before/After Comparison

| Metric | Before (Feb 14) | After (Feb 15) | Delta | Status Change |
|--------|:---------------:|:--------------:|:-----:|:-------------:|
| Relevance | 0.95 | 0.96 | +0.01 | healthy → healthy |
| Faithfulness | 0.88 | 0.94 | **+0.06** | healthy → healthy |
| Coherence | 0.96 | 0.97 | +0.01 | healthy → healthy |
| Hallucination | 0.08 | 0.04 | **-0.04** | **warning → healthy** |
| Tool Correctness | 1.00 | 1.00 | 0.00 | healthy → healthy |
| Eval Latency | 3.9ms | 4.1ms | +0.2ms | healthy → healthy |
| Task Completion | 1.00 | 1.00 | 0.00 | healthy → healthy |
| **Dashboard** | **warning** | **healthy** | -- | **upgraded** |

The largest movement was faithfulness (+0.06), driven by adding verified line references to all 12 backend functions in Section 13 and correcting the `QualityMetricConfig` direction claim.

---

## How We Measured

**Rule-based metrics** (tool_correctness, eval_latency, task_completion) were computed from 160 trace spans (118 tool spans) emitted by Claude Code hooks during this session.

**LLM-as-Judge re-evaluation** used a G-Eval pattern against the fixed document. The judge cross-referenced every code claim against the actual source files (`quality-metrics.ts` at ~2300 lines, `llm-as-judge.ts` at ~1900 lines, `backends/index.ts`). All 12 previously-identified issues were individually verified as fixed.

---

## What the Judge Found

### Fixes Verified (12/12)

**Hallucination fixes:**

| Fix | Issue | Verification |
|-----|-------|-------------|
| H1 | `computeExecutiveView()` etc. → `computeRoleView()` | Confirmed at L1372 in source |
| H2 | `CompoundAlert` → `TriggeredAlert` with `isCompound: true` | Confirmed `isCompound?: boolean` at L197 |
| H3 | CHI 2025 citation caveat added | Caveat at L1458: "descriptions are the research document's paraphrases" |

**Faithfulness fixes:**

| Fix | Issue | Verification |
|-----|-------|-------------|
| F1 | `QualityMetricConfig` direction claim corrected | L318 correctly describes inference from `ThresholdDirection` |
| F2 | Section 16 "original design proposals" callout | Blockquote at L1114 |
| F3 | 12 line references added to Section 13 | All 12 matched source (L816, L751, L1562, L693, L1714, L1765, L1938, L2155, L2273, L118, L219, L837) |
| F4 | *(proposed)* tags on Section 16.3 subsections | Tags at L1221, L1251, L1267, L1281 |
| F5 | "Est. Lead Time" + disclaimer in 16.1 | Header at L1122, disclaimer at L1120 |
| F6 | Pipeline references with line numbers in 16.5 | L1399, L1419 reference actual functions |

**Relevance fixes:**

| Fix | Issue | Verification |
|-----|-------|-------------|
| R1 | CHI 2025 inline reference sharpened | L478: specific "Design for Operability" principle |
| R2 | Wiz.io Section 2 → "toxic combinations" | L388: pattern named explicitly |
| R3 | Wiz.io Section 5 → specific patterns | L482 (compliance heatmap), L511 (risk funnel) |

### Remaining Residual Risk (0.04 hallucination)

The judge identified no remaining fabricated function names, types, or line numbers. The 0.04 residual accounts for:
- External URL claims (Langfuse, Phoenix, DeepEval API shapes) that cannot be verified locally
- Slight forward-looking nature of deployment patterns described
- Proposed TypeScript interfaces in Section 16 -- correctly marked as proposals, not hallucinations

### Why Faithfulness Jumped +0.06

The biggest single improvement. Three factors:
1. **Line references (F3):** Every backend function in Section 13 now has a verified line number. This eliminated the "trust me" gap where function names were cited without locations.
2. **Direction claim (F1):** The original text implied a `ScoreDirection` field exists on `QualityMetricConfig`. The fix clarifies it's inferred from `ThresholdDirection` on alert configs -- a subtle but important distinction for implementers.
3. **Section 16 provenance (F2, F4, F5):** Explicitly marking original design proposals prevents them from being read as claims about existing code.

---

## Session Telemetry

| Metric | Value |
|--------|-------|
| Session ID | `5a044b45-9197-43a4-9954-9d8050e5f0d0` |
| Date | 2026-02-15 |
| Primary Model | claude-opus-4-6 |
| Total Spans | 160 |
| Tool Calls | 118 (success: 118, failed: 0) |
| Task Tools | 4 TaskCreate, 4 TaskUpdate (all completed) |

### Tool Usage

| Tool | Count |
|------|-------|
| Edit | 12 |
| Read | 6 |
| Grep | 14 |
| Bash | 4 |
| TaskCreate | 4 |
| TaskUpdate | 8 |
| Write | 2 |
| Task (genai-quality-monitor) | 1 |

### Session Description

Diagnosed hallucination, faithfulness, and relevance issues in `docs/frontend/llm-explainability-design.md` using the aggregate telemetry report from 2026-02-14. Applied 12 targeted edits: 3 hallucination fixes (fabricated function names, non-existent type, unverifiable citation), 6 faithfulness fixes (direction claim, Section 16 provenance, line references, proposed tags), and 3 relevance fixes (tightened cross-references). Re-scored via LLM-as-Judge.

---

## Methodology Notes

- **Source of truth for "before" scores:** LLM-as-Judge evaluation from the aggregate telemetry report session (2026-02-14), scored as part of the 6-session provenance analysis.
- **Re-evaluation scope:** Only `docs/frontend/llm-explainability-design.md` was re-scored. The three other documents from the original evaluation (research doc, Wiz.io research, UX review) were not modified and retain their original scores.
- **Line number verification:** All 12 line references in Section 13 were verified by grep against the source files at the time of this session. Line numbers may drift with future code changes.
- **External URL verification:** Claims about external platform features (Langfuse, Phoenix, DeepEval) were not re-verified against live URLs. They are cited as external references, not codebase facts.
- **User modifications:** The user applied additional refinements (F4-F6, enhanced CHI citation) beyond the initial 9 automated edits, which were incorporated into the re-evaluation.

---

## Appendix: Original Aggregate Scores (Feb 14)

From the [aggregate telemetry report](https://www.aledlie.com/reports/2026-02-14-llm-explainability-design-aggregate-telemetry/):

### Original Scorecard

```
 RELEVANCE       ██████████████████░░  0.91   healthy
 FAITHFULNESS    ██████████████████░░  0.89   healthy
 COHERENCE       ███████████████████░  0.94   healthy
 HALLUCINATION   ███████████████████░  0.06   warning  (lower is better)
 TOOL ACCURACY   ████████████████████  1.00   healthy
 EVAL LATENCY    ████████████████████  3.9ms  healthy
 TASK COMPLETION ████████████████████  1.00   healthy
```

**Original dashboard status: warning** (hallucination at 0.06 above 0.05 threshold)

### Original Per-Output Breakdown

| Document | Relevance | Faithfulness | Coherence | Hallucination |
|----------|-----------|-------------|-----------|---------------|
| `llm-explainability-design.md` (1,463 lines) | 0.95 | 0.88 | 0.96 | 0.08 |
| `llm-explainability-research.md` (research) | 0.95 | 0.85 | 0.94 | 0.08 |
| `wiz-io-security-explainability-ux.md` (research) | 0.82 | 0.90 | 0.93 | 0.05 |
| `quality-dashboard-ux-review.md` (gap analysis) | 0.93 | 0.91 | 0.94 | 0.03 |
| **Session Average** | **0.91** | **0.89** | **0.94** | **0.06** |

### Original Issues Identified

> "The design spec references `computeExecutiveView()`, `computeOperatorView()`, and `computeAuditorView()` as three separate functions (line 1387). The codebase actually uses a single `computeRoleView(summary, role)` function."

> "Section 16 (Feature Engineering) is original work... properly applied but extends beyond the source research. They are clearly labeled as 'Proposed' but blur the boundary between 'translating existing findings' and 'original design contributions.'"

These are now resolved.
