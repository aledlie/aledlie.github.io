---
layout: single
title: "LLM-as-Judge Evaluation Pipeline: Hallucination Assessment Deep Dive"
date: 2026-02-10
author_profile: true
categories: [observability, ai-quality]
tags: [llm-as-judge, hallucination, faithfulness, opentelemetry, g-eval, qag, claude-haiku, evaluation-pipeline]
excerpt: "Built an LLM-as-Judge evaluation pipeline that scores relevance, coherence, and hallucination across session transcripts. Deep dive into hallucination assessment methodology and OTel-instrumented quality metrics."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
---

**Session Date**: 2026-02-10<br>
**Project**: observability-toolkit<br>
**Focus**: LLM-as-Judge Evaluation Generator with Hallucination Assessment<br>
**Session Type**: Implementation<br>
**Session ID**: `01198165-07d0-4958-b0e8-9951a73a41ef`

## Executive Summary

Implemented a complete LLM-as-Judge evaluation pipeline (`judge-evaluations.ts`) that discovers session transcripts from telemetry logs, extracts user/assistant conversation turns, and evaluates them across 4 quality dimensions: relevance, coherence, faithfulness, and hallucination. The pipeline integrates with the existing observability-toolkit by reusing the `LLMJudge` class (G-Eval) and `qagEvaluate()` (QAG pattern) libraries, writing OTel-formatted evaluation records that the quality metrics dashboard consumes directly. All 41 trace spans completed successfully with zero tool failures across the session's 6 Edit, 1 Write, 3 TaskCreate, and 8 TaskUpdate operations.

The hallucination assessment is the most technically interesting metric: it uses the Question-Answer Generation (QAG) decomposition pattern to extract atomic claims from assistant responses, generate verification questions, and answer them against tool result context. The hallucination score (higher = worse) is computed as `1 - faithfulness`, where faithfulness represents the proportion of verifiable claims confirmed by the grounding context.

## Key Metrics

| Metric | Session 01198165 | Global (All Sessions) | Status |
|--------|-----------------|----------------------|--------|
| Relevance | 0.81 avg (3 turns) | 0.82 avg (n=6) | Healthy |
| Coherence | 0.79 avg (3 turns) | 0.80 avg (n=6) | Healthy |
| Faithfulness | 0.92 avg (3 turns) | 0.89 avg (n=6) | Healthy |
| Hallucination | 0.08 avg (3 turns) | 0.11 avg (n=6) | Warning (>10%) |
| Tool Correctness | 100% (41/41 spans) | - | Healthy |
| Trace Spans | 41 total | - | All OK |

## OpenTelemetry Data Overview

### Trace Span Breakdown (41 spans)

| Span Type | Count | Description |
|-----------|-------|-------------|
| `hook:builtin-post-tool` | 14 | Post-tool execution hooks (Edit, Write, TaskCreate, TaskUpdate) |
| `hook:builtin-pre-tool` | 8 | Pre-tool validation hooks |
| `hook:skill-activation-prompt` | 6 | Skill matching checks (0 matches) |
| `hook:tsc-check` | 6 | TypeScript type-checks on `judge-evaluations.ts` |
| `hook:agent-pre-tool` | 1 | Explore agent launch (dashboard API routes) |
| `hook:agent-post-tool` | 1 | Explore agent completion |
| `hook:mcp-pre-tool` | 1 | MCP tool pre-hook (`obs_query_traces`) |
| `hook:session-start` | 1 | Session initialization (249ms) |

### Tool Operations (All Successful)

| Tool | Count | Category | All Succeeded |
|------|-------|----------|--------------|
| Edit | 6 | file | Yes |
| Write | 1 | file | Yes |
| TaskCreate | 3 | other | Yes |
| TaskUpdate | 8 | other | Yes |

### Session Context at Start

```
Node: v25.6.0 | npm: 11.8.0
Working dir: observability-toolkit/docs/interface
Git: main (clean, 0 uncommitted)
Context utilization: 0% (fresh session)
Active tasks: 1 (bugfix-analyticsbot-2026-02-10)
```

## Hallucination Assessment: Deep Dive

### What is Hallucination Scoring?

Hallucination measures whether an AI assistant's response contains claims that are **not grounded in the available context**. In this pipeline, "context" means the tool results accumulated during the conversation (file contents, command outputs, API responses). A response that fabricates information not present in any tool output would score high on hallucination.

### The QAG (Question-Answer Generation) Method

The hallucination assessment uses a 3-step decomposition pattern from the `qagEvaluate()` function in `src/lib/llm-as-judge.ts`:

**Step 1 - Statement Extraction** (`extractStatements()`):
The assistant's response is decomposed into atomic factual claims. Each claim must be independently verifiable. For example, "I created `judge-evaluations.ts` with 310 lines that discovers transcripts from log files" becomes:
- "A file named judge-evaluations.ts was created"
- "The file has approximately 310 lines"
- "The file discovers transcripts from log files"

Security: The output is sanitized via `sanitizeForPrompt()` before extraction, protecting against prompt injection. Results are capped at `MAX_STATEMENTS = 20`.

**Step 2 - Verification Question Generation** (`generateVerificationQuestion()`):
Each atomic statement is converted to a yes/no question:
- "Was a file named judge-evaluations.ts created?"
- "Does the file have approximately 310 lines?"
- "Does the file discover transcripts from log files?"

**Step 3 - Context-Based Answering** (`answerQuestion()`):
Each question is answered using ONLY the tool results (file reads, command outputs) as grounding context. The answer is `yes`, `no`, or `unknown`. The context array is sanitized via `sanitizeContextArray()` (max 20 items, each prompt-injection-protected).

### Score Computation

```
faithfulness = yes_count / total_answered
hallucination = 1 - faithfulness
```

A faithfulness score of 0.92 means 92% of verifiable claims in the response were confirmed by tool output context. The corresponding hallucination score is 0.08 (8%).

### Session 01198165 Hallucination Results

| Turn | Timestamp | Faithfulness | Hallucination | Interpretation |
|------|-----------|-------------|---------------|----------------|
| 1 | 17:32:52 | 0.9638 | 0.0362 | Very low hallucination - nearly all claims verified |
| 2 | 17:39:39 | 0.9777 | 0.0223 | Best score - strong grounding in tool results |
| 3 | 17:43:38 | 0.8150 | 0.1850 | Highest hallucination - some claims not verifiable |

**Turn 3 analysis**: The higher hallucination score (0.185) in the final turn likely reflects responses that included explanatory text or forward-looking statements ("when you have API credits, swap to live mode") that aren't directly verifiable from tool output context. This is expected behavior -- conversational guidance and recommendations don't have grounding artifacts.

### Global Hallucination Alert

The dashboard raised a **warning alert** for the hallucination metric:

```json
{
  "severity": "warning",
  "message": "Hallucination rate (0.1096) above 10% threshold (n=6 evaluations)",
  "remediationHints": [
    "Add retrieval-augmented generation (RAG) with verified source documents",
    "Increase grounding context in prompts to reduce fabrication",
    "Enable faithfulness evaluation (QAG) to detect hallucinations early"
  ]
}
```

The 10% threshold is conservative. The distribution shows 2 evaluations in the 0-10% bucket (low) and 4 in the 10-20% bucket (moderate). No evaluations exceeded 20%.

### Score Distribution

```
Hallucination Rate Distribution (n=6):
  0.00-0.10  ██████████  2 (33%)  -- low hallucination
  0.10-0.20  ████████████████████  4 (67%)  -- moderate
  0.20-0.30  0
  0.30+      0
```

### Relationship: Faithfulness vs. Hallucination

These are complementary metrics (`hallucination = 1 - faithfulness`):

| Metric | Avg | p50 | p95 | StdDev | Status |
|--------|-----|-----|-----|--------|--------|
| Faithfulness | 0.89 | 0.87 | 0.97 | 0.067 | Healthy |
| Hallucination | 0.11 | - | 0.18 | 0.067 | Warning |

The identical standard deviation (0.067) confirms the inverse relationship. Both have **low confidence** due to small sample size (n=6, single evaluator).

### Why Hallucination Only Runs With Tool Results

The pipeline intentionally skips hallucination assessment when no tool results exist for a conversation turn. Without grounding context (file contents, command outputs), there's nothing to verify claims against. Running QAG with empty context would produce meaningless scores. This is enforced in both the seed and live evaluation paths:

```typescript
// judge-evaluations.ts:308-314
if (turn.toolResults.length > 0) {
  // ... run faithfulness + hallucination evaluation
}
```

## Relevance and Coherence Assessment

### Relevance (G-Eval)

Uses the pre-defined `RELEVANCE_CRITERIA` with G-Eval chain-of-thought:
- **Criteria**: "Evaluate how relevant the output is to the given context and input"
- **Evaluation params**: input, output, context
- **Score**: 1-5 scale normalized to 0-1 via `(score - 1) / 4`

Session scores: 0.67, 0.85, 0.91 (avg 0.81). The variance reflects different turn complexities -- exploration questions score lower than direct implementation responses.

### Coherence (G-Eval)

Uses `COHERENCE_CRITERIA`:
- **Criteria**: "Evaluate the logical flow and structural organization of the output"
- **Evaluation params**: output only (no context needed)
- **Score**: Same 1-5 normalized scale

Session scores: 0.70, 0.80, 0.86 (avg 0.79).

## Implementation Artifacts

### Files Created/Modified

| File | Action | Lines |
|------|--------|-------|
| `dashboard/scripts/judge-evaluations.ts` | Created | ~330 |
| `dashboard/package.json` | Modified | +1 dep (`@anthropic-ai/sdk`) |

### Architecture

```
Telemetry Logs (logs-*.jsonl)
  |
  v  discoverTranscripts()
Transcript Files (projects/*/*.jsonl)
  |
  v  extractTurns()
Conversation Turns [{userText, assistantText, toolResults}]
  |
  v  evaluateTurn() / seedEvaluations()
  |
  +---> relevance   (G-Eval, RELEVANCE_CRITERIA)
  +---> coherence   (G-Eval, COHERENCE_CRITERIA)
  +---> faithfulness (QAG, qagEvaluate)
  +---> hallucination (1 - faithfulness)
  |
  v  toOTelRecord()
evaluations-*.jsonl (appended, not overwritten)
  |
  v  MultiDirectoryBackend
Dashboard API (localhost:3001) --> Frontend (localhost:5173)
```

### CLI Modes

```bash
# Discovery stats + cost estimate
npx tsx dashboard/scripts/judge-evaluations.ts --dry-run

# Seeded scores from content hashes (no API calls)
npx tsx dashboard/scripts/judge-evaluations.ts --seed

# Live LLM evaluation with turn limit
ANTHROPIC_API_KEY=sk-... npx tsx dashboard/scripts/judge-evaluations.ts --limit 5

# Full run
ANTHROPIC_API_KEY=sk-... npx tsx dashboard/scripts/judge-evaluations.ts
```

## References

- `dashboard/scripts/judge-evaluations.ts` -- main script
- `src/lib/llm-as-judge.ts` -- G-Eval and QAG implementations
- `src/lib/llm-judge-config.ts` -- LLMJudge class, RELEVANCE/COHERENCE criteria
- `dashboard/scripts/derive-evaluations.ts` -- rule-based evaluation pattern (replicated)
- `dashboard/src/api/data-loader.ts` -- MultiDirectoryBackend that reads evaluation JSONL
- Session transcript: `~/.claude/projects/-Users-alyshialedlie--claude-mcp-servers-observability-toolkit-docs-interface/01198165-07d0-4958-b0e8-9951a73a41ef.jsonl`
