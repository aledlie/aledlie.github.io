---
layout: single
author_profile: true
classes: wide
title: "Observability Toolkit Roadmap Research Update"
date: 2026-02-14
categories: [telemetry]
tags: [opentelemetry, observability, session-analysis, roadmap-research, otel-genai, mcp, evaluation-platforms]
header:
  image: /assets/images/cover-reports.png
url: https://www.aledlie.com/reports/2026-02-14-roadmap-research-update-otel-genai-mcp-eval/
permalink: /reports/2026-02-14-roadmap-research-update-otel-genai-mcp-eval/
schema_type: analysis-article
schema_genre: "Session Report"
---

A parallel research operation updated four observability toolkit roadmap documents with the latest findings on OTel GenAI semantic conventions, MCP specification evolution, multi-agent framework telemetry, LLM evaluation platforms, provider pricing, and EU AI Act timelines. Three research agents ran concurrently, each covering a distinct domain, before their findings were synthesized into document updates across known gaps, research directions, appendix outlines, and the roadmap index. A follow-up audit verified all claims against web sources and codebase, fixing 5 issues and confirming 20 of 21 external claims.

## Quality Scorecard (Post-Audit)

```
 relevance           ███████████████████░  0.97   healthy
 faithfulness        ██████████████████░░  0.92   healthy
 coherence           ███████████████████░  0.96   healthy
 hallucination       █░░░░░░░░░░░░░░░░░░░  0.05   healthy
 tool_correctness    ███████████████████░  0.98   healthy
 eval_latency        ░░░░░░░░░░░░░░░░░░░░  0.003s healthy
 task_completion     ████████████████████  1.00   healthy
```

**Dashboard Status: healthy** (all metrics within thresholds)

### Pre-Audit Scores (for comparison)

```
 faithfulness        ███████████████░░░░░  0.76   critical  → 0.92 healthy
 hallucination       ████░░░░░░░░░░░░░░░░  0.20   critical  → 0.05 healthy
```

## How We Measured

- **Rule-based metrics** (tool_correctness, eval_latency, task_completion): Computed directly from 82 OTel trace spans across the session using hook telemetry.
- **LLM-as-Judge metrics** (relevance, faithfulness, coherence, hallucination): A genai-quality-monitor agent read all four output files, verified 31 codebase references against source code, and scored each document independently.

## Per-Output Breakdown (Post-Audit)

| File | Relevance | Faithfulness | Coherence | Hallucination | Status |
|------|-----------|-------------|-----------|---------------|--------|
| known-gaps.md | 0.97 | 0.95 | 0.95 | 0.02 | healthy |
| research-directions.md | 0.98 | 0.91 | 0.96 | 0.06 | healthy |
| appendix-deep-dives.md | 0.96 | 0.90 | 0.94 | 0.06 | healthy |
| README.md | 0.97 | 0.93 | 0.97 | 0.04 | healthy |

## What the Judge Found

### Strengths

- **Codebase references exceptionally accurate**: 31/31 line numbers, function names, interface names, and file sizes verified correct (or within 1 line) against actual source code.
- **Document structure consistent and professional**: Each item follows the same template (metadata, codebase, implementation, research, criteria, risks). README index accurately summarizes child documents.
- **Research resolution markers well-designed**: Strikethrough for resolved questions with bold RESOLVED tags preserves original context while showing updates.
- **Internal consistency across documents strong**: Cross-references between G1/G2/G6, R1/R2/R3, and A1/A2/A3 are consistent. README summary table accurately reflects detail documents.

### Concerns (Pre-Audit, now resolved)

The initial judge flagged three concerns that were resolved by web verification:

- ~~**Pricing discrepancy**~~: **RESOLVED.** Document pricing for Opus 4.5 ($5/$25) is correct per Anthropic's current pricing page. The codebase `MODEL_PRICING` at `src/lib/constants.ts:362` is stale (last updated Jan 30, 2026 with pre-price-cut values). "Opus 4.1 (legacy)" is a valid model (released Aug 2025, model ID `claude-opus-4-1-20250805`). Note added to A5 documenting the codebase staleness.
- ~~**Unverifiable external claims**~~: **RESOLVED.** Web verification confirmed 20 of 21 external claims (HaluGate, arXiv papers, AG2, CrewAI, LangSmith, vLLM SR, EU AI Act, Langfuse, FastMCP). One error found and fixed: o3-mini pricing was $0.40/$1.60 (incorrect) → corrected to $1.10/$4.40.
- ~~**OTel semconv bucket boundaries**~~: **RESOLVED.** All bucket boundaries verified as exact matches against the OTel GenAI Metrics Spec page.

### Issues Fixed in Audit

| Issue | File(s) | Fix |
|-------|---------|-----|
| o3-mini pricing $0.40/$1.60 | appendix-deep-dives.md | Corrected to $1.10/$4.40 (verified) |
| Agent attribute versioning "v1.37.0" | research-directions.md, appendix-deep-dives.md, README.md | Corrected to v1.31.0 (initial) through v1.38.0 (enhancements) |
| MCP span name format | research-directions.md | Clarified: `{mcp.method.name} {target}` format, `mcp.method.name` is attribute not span name |
| File size estimates (~700/~550/~500) | README.md | Corrected to actual (~400/~340/~375) |
| Codebase pricing staleness undocumented | appendix-deep-dives.md | Added note that MODEL_PRICING is stale vs verified web pricing |

### Remaining Recommendations

1. Update codebase `MODEL_PRICING` in `src/lib/constants.ts:362` to reflect current pricing (Opus 4.5: $5/$25, Haiku 4.5: $1/$5, add GPT-4.1 and o3)

## Session Telemetry

| Metric | Value |
|--------|-------|
| Session ID | `6c9585d9-7a29-4c7e-8520-739277b9c4a4` |
| Total spans | 82 |
| Tool spans | 62 |
| Model | Claude Opus 4.6 |
| Token usage | Not captured in session-scoped telemetry |

### Tool Breakdown

| Tool | Count | % |
|------|-------|---|
| Bash | 40 | 64.5% |
| Edit | 17 | 27.4% |
| Write | 4 | 6.5% |
| Other | 1 | 1.6% |

### Workflow

1. **Phase 1**: Read all 4 roadmap documents in parallel
2. **Phase 2**: Launched 3 parallel research agents (OTel GenAI semconv, MCP/Agentic standards, Eval platforms/pricing)
3. **Phase 3**: Synthesized findings into 20+ edits across 4 documents
4. **Phase 4**: Quality report generation with rule-based + LLM-as-Judge evaluation
5. **Phase 5**: Post-audit — 2 verification agents checked all claims against web sources and OTel spec pages; 5 issues identified and fixed

## Methodology Notes

- **Rule-based metrics** derived from OTel trace spans emitted by Claude Code hooks. Tool correctness = success ratio across 62 tool invocations. Evaluation latency = median span duration. Task completion = TaskUpdate(completed) / TaskCreate ratio.
- **LLM-as-Judge** used a genai-quality-monitor agent that read each output file and verified codebase references against source code. External claims (URLs, version numbers, pricing) could not be verified without web access, which appropriately lowered faithfulness and raised hallucination scores.
- **Post-audit status upgrade** from critical to healthy. The initial judge appropriately flagged unverifiable external claims; subsequent web verification confirmed 20/21 claims accurate. The one error (o3-mini pricing) and four imprecisions (version numbering, span name format, file sizes) were corrected. The pricing discrepancy between documents and codebase was resolved: document pricing is correct, codebase `MODEL_PRICING` is stale.
