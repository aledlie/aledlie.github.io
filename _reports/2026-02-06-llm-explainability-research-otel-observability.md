---
layout: single
title: "LLM UX Interface Explainability for OTel-Native Observability"
date: 2026-02-06
author_profile: true
breadcrumbs: true
permalink: /reports/llm-explainability-research-otel-observability/
categories: [research, llm-observability, explainability]
tags: [opentelemetry, llm-as-judge, evaluation, langfuse, arize-phoenix, datadog, eu-ai-act, nist-ai-rmf, quality-metrics, multi-agent]
excerpt: "Research across 6 platforms on LLM evaluation explainability best practices, OTel GenAI semantic conventions, dashboard UX patterns, and regulatory frameworks for AI observability."
header:
  overlay_image: /images/cover-reports.png
  teaser: /images/cover-reports.png
---

# LLM UX Interface Explainability for OTel-Native Observability

**Version**: 1.0
**Date**: 2026-02-06
**Status**: Research
**Scope**: observability-toolkit v2.0.1

---

## Executive Summary

Research into how leading observability platforms surface LLM evaluation explainability, aligned with OpenTelemetry GenAI semantic conventions. Key findings:

- **OTel GenAI semantic conventions now include a dedicated `gen_ai.evaluation.result` event** with `gen_ai.evaluation.score.value`, `gen_ai.evaluation.explanation`, `gen_ai.evaluation.name`, and `gen_ai.evaluation.score.label` attributes, providing an interoperable wire format for evaluation explainability. This maps directly to the toolkit's existing `EvaluationResult` interface.
- **Langfuse leads in evaluation traceability** with full execution tracing of LLM-as-Judge evaluations (October 2025), where every judge invocation produces an inspectable trace showing the exact prompt, response, and reasoning used to produce a score.
- **Arize Phoenix mandates explanation generation** via a `provide_explanation` parameter on all evaluations, and instruments evaluators with OTel traces, creating a unified observability + evaluation pipeline.
- **Dashboard UX patterns converge on three-tier alerting** (healthy/warning/critical) with percentile-based thresholds, but the industry gap is in making those thresholds actionable -- linking metric breaches to specific traces and evaluation explanations.
- **Regulatory pressure is accelerating**: EU AI Act transparency obligations (Article 50) become fully applicable August 2026, and NIST AI RMF 1.0 emphasizes explainability scoring as a measurable trustworthiness characteristic.

---

## 1. Platform Analysis

### Comparison Matrix

| Capability | Langfuse | Arize Phoenix | Datadog LLM Obs | LangSmith | W&B Weave | Confident AI |
|------------|----------|---------------|------------------|-----------|-----------|--------------|
| **Eval explanations stored** | Yes (via execution trace) | Yes (`provide_explanation` param) | Yes (managed evals) | Yes (linked to traces) | Yes (scorer output) | Yes (all metrics include reasons) |
| **Judge execution tracing** | Full OTel traces per judge call | OTel-instrumented evaluators | Managed eval traces | Linked to run traces | Trace integration | Via DeepEval framework |
| **CoT reasoning visible** | Via score tooltip -> trace link | Explanation column in eval df | Quality check detail view | Step-by-step chain inspection | Custom dashboard panels | CLI output + web reports |
| **Score breakdown UI** | Score badge tooltip on traces | Eval columns on span dataframe | Built-in quality checks panel | Evaluation results tab | Leaderboard aggregation | Conversational turn display |
| **Confidence indicators** | Not built-in | Not built-in | Not built-in | Not built-in | Not built-in | Not built-in |
| **OTel GenAI support** | OTLP export | OpenInference (OTel-compatible) | Native v1.37+ mapping | Proprietary + OTel bridge | OTel trace support | OTel via DeepEval |
| **Multi-agent eval** | Agent evaluation guide | Deep multi-step agent traces | AI Agent Monitoring (2025) | Agent chain visualization | Agent workflow tracking | Agent metrics (2025) |
| **Regulatory features** | Audit trail via traces | Trace provenance | Governance via OTel Collector | Run history | Artifacts + Registry | Test reports |
| **Open source** | Yes (self-host) | Yes (OSS core) | No (SaaS) | No (SaaS) | Partial (Weave OSS) | Partial (DeepEval OSS) |

### Platform Detail: Langfuse

Langfuse introduced LLM-as-a-Judge Execution Tracing in October 2025, which is the most complete implementation of evaluation explainability observed in this research.

**Key UX patterns:**

- **Score tooltip on trace view**: Hovering over any score badge reveals a "View execution trace" link, providing zero-click access to the judge's reasoning
- **Four navigation paths to evaluation traces**: Score tooltip, tracing table filter (`langfuse-llm-as-a-judge` environment), scores table "Execution Trace" column, evaluator logs table
- **Full judge trace capture**: Every LLM-as-Judge execution creates a trace recording the prompt sent to the judge LLM, the complete response including score and reasoning, and token usage/cost

```
┌──────────────────────────────────────────────────────────────┐
│  Langfuse Trace View                                          │
│                                                                │
│  Trace: user-query-abc123                                      │
│  ├── [span] LLM Call: gpt-4o                                  │
│  │   ├── Input: "What is the capital of France?"              │
│  │   └── Output: "The capital of France is Paris."            │
│  │                                                             │
│  │   Score Badges:                                             │
│  │   ┌─────────────┐  ┌──────────────────┐                   │
│  │   │ relevance   │  │ faithfulness     │                   │
│  │   │ 0.92 [i]    │  │ 0.88 [i]        │                   │
│  │   └──────┬──────┘  └──────────────────┘                   │
│  │          │                                                  │
│  │          ▼  (hover tooltip)                                 │
│  │   ┌──────────────────────────────────┐                     │
│  │   │ Score: 0.92                       │                     │
│  │   │ Evaluator: gpt-4o-mini            │                     │
│  │   │ [View execution trace ->]         │                     │
│  │   └──────────────────────────────────┘                     │
│  │                                                             │
│  └── [span] Tool Call: search_api                              │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

**Relevance to observability-toolkit**: The toolkit's `obs_export_langfuse` already supports OTLP + basic auth export. Evaluation results with `explanation` fields could be surfaced in Langfuse's trace view after export.

### Platform Detail: Arize Phoenix

Phoenix takes an "explanation-by-default" approach to evaluation explainability.

**Key UX patterns:**

- **`provide_explanation` parameter**: When set to `True` on `run_evals()`, the evaluator LLM is prompted to explain its reasoning, and the explanation is stored alongside the score in the output dataframe
- **OTel-instrumented evaluators**: Evaluators are natively instrumented via OpenTelemetry tracing, creating Evaluator Traces that show the full evaluation pipeline
- **Prompt management integration**: Prompt templates used by evaluators are versioned and stored, so the exact evaluation prompt can be inspected retroactively
- **Evaluation columns on trace dataframe**: Scores and explanations appear as columns directly on the span/trace dataframe, enabling filtering and sorting

**Relevance to observability-toolkit**: The toolkit's `obs_export_phoenix` (Bearer auth + project org) maps `EvaluationResult.explanation` to Phoenix's explanation column.

### Platform Detail: Datadog LLM Observability

Datadog takes an enterprise-integrated approach with native OTel GenAI Semantic Conventions support (v1.37+).

**Key UX patterns:**

- **LLM Overview dashboard**: Collates trace/span-level error and latency metrics, token consumption, model usage statistics, and triggered monitors in a single view
- **Built-in quality checks**: Out-of-the-box evaluations for "Failure to answer", "Topic relevancy", "Toxicity", and "Negative sentiment" with automatic scoring
- **Managed + custom evaluations**: Automatic detection of hallucinations, prompt injections, unsafe responses, and PII leaks on both live and historical traces; plus custom LLM-as-a-judge evaluations
- **OTel Collector governance**: Data policies (redaction, sampling, enrichment, routing) enforced before telemetry leaves the network
- **LLM Experiments**: Test prompt changes against production data before deployment (June 2025)

**Relevance to observability-toolkit**: The toolkit's `obs_export_datadog` uses two-phase spans + eval metrics. Datadog's native OTel GenAI mapping means the toolkit's OTel-aligned `EvaluationResult` schema is directly consumable.

### Platform Detail: LangSmith

LangSmith provides deep trace inspection with evaluation integration.

**Key UX patterns:**

- **Hierarchical trace visualization**: Step-by-step inspection of chains, agents, and LLM calls with tree-style rendering
- **Evaluation-trace linking**: Failing evaluation grades link back to the exact prompt, tool output, and memory state that caused the failure
- **Online + offline evals**: Offline evals run on datasets (benchmarking/regression); online evals run on production traffic in near real time
- **Customizable dashboard widgets**: High-level statistics, recent runs, and summaries with configurable views

### Platform Detail: W&B Weave

Weave emphasizes side-by-side comparison and leaderboard views.

**Key UX patterns:**

- **Evaluation leaderboards**: Aggregate evaluations into leaderboards featuring best performers, shareable across the organization
- **Side-by-side comparison**: Visualizations for objective, precise comparisons between evaluation runs
- **Custom metric dashboards**: Design dashboards focused on metrics most relevant to specific LLM tasks
- **Human + quantitative integration**: Combine human evaluation results alongside quantitative metrics for holistic performance view

### Platform Detail: Confident AI / DeepEval

DeepEval provides the most explicit explanation-per-metric approach.

**Key UX patterns:**

- **All metrics include explanations**: Every DeepEval metric provides a comprehensive reason for the computed score, not just the numeric value
- **Conversational turn display**: Multi-turn evaluations show role, truncated content, and tools used per turn
- **Agent-specific metrics**: `PlanQualityMetric` (logical, complete, efficient plans), `ToolCorrectnessMetric` (proper tool selection), with explanations for each
- **Shareable reports**: Generate stakeholder-facing reports from evaluation results

**Relevance to observability-toolkit**: The toolkit's `obs_export_confident` (API key + env tagging) exports to the Confident AI platform where DeepEval results are visualized.

---

## 2. OTel GenAI Semantic Conventions for Explainability

### Evaluation Event Specification

The OpenTelemetry GenAI semantic conventions define a `gen_ai.evaluation.result` event for capturing evaluation outcomes. This is the primary interoperability standard for evaluation explainability.

**Event name**: `gen_ai.evaluation.result`

**Event attributes (per OTel GenAI semantic conventions):**

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `gen_ai.evaluation.name` | string | Recommended | Name of the evaluation metric used |
| `gen_ai.evaluation.score.value` | number | No | The evaluation score returned by the evaluator |
| `gen_ai.evaluation.score.label` | string | Recommended | Human-readable interpretation (e.g., "relevant", "pass", "fail") |
| `gen_ai.evaluation.explanation` | string | No | Free-form explanation for the assigned score |
| `gen_ai.response.id` | string | Conditional | Unique ID of the completion being evaluated; used for correlation when span ID unavailable |

Note: The OTel GenAI evaluation event conventions are currently **experimental** (as of February 2026). Attribute names may change before stabilization. The toolkit's `GENAI_EVALUATION_ATTRIBUTES` constant in `src/backends/index.ts` tracks the canonical names.

**Parenting rules:**

- The event SHOULD be parented to the GenAI operation span being evaluated when possible
- When span ID is not available, set `gen_ai.response.id` for correlation

**Score label semantics:**

- The label SHOULD have low cardinality
- Possible values depend on the evaluation metric and evaluator used
- Implementations SHOULD document the possible values
- Example: a `score_value` of 1 could mean "relevant" in one system and "not_relevant" in another

### Mapping to observability-toolkit EvaluationResult

The toolkit's `EvaluationResult` interface already aligns with OTel GenAI semantic conventions:

```typescript
// src/backends/index.ts — actual interface with OTel attribute mapping
interface EvaluationResult {
  timestamp: string;
  evaluationName: string;       // -> gen_ai.evaluation.name
  scoreValue?: number;          // -> gen_ai.evaluation.score.value
  scoreLabel?: string;          // -> gen_ai.evaluation.score.label
  scoreUnit?: string;           // -> gen_ai.evaluation.score.unit (custom extension)
  explanation?: string;         // -> gen_ai.evaluation.explanation
  evaluator?: string;           // -> gen_ai.evaluation.evaluator (custom extension)
  evaluatorType?: EvaluatorType; // -> gen_ai.evaluation.evaluator.type (custom extension)
  responseId?: string;          // -> gen_ai.response.id (correlation)
  traceId?: string;             // -> OTel trace context
  spanId?: string;              // -> OTel span context (parent)
  sessionId?: string;           // -> session correlation

  // Agent-as-Judge fields (Section 10.7)
  agentId?: string;             // -> gen_ai.agent.id
  agentName?: string;           // -> gen_ai.agent.name
  stepScores?: StepScore[];     // -> gen_ai.evaluation.step_scores (custom)
  toolVerifications?: ToolVerification[]; // -> gen_ai.evaluation.tool_verifications (custom)
  trajectoryLength?: number;    // -> gen_ai.evaluation.trajectory_length (custom)
}
```

The toolkit distinguishes between official OTel GenAI attributes (e.g., `gen_ai.evaluation.name`) and custom extensions (e.g., `gen_ai.evaluation.evaluator.type`). Custom extensions are defined in `GENAI_EVALUATION_ATTRIBUTES` and `AGENT_JUDGE_ATTRIBUTES` in `src/backends/index.ts`.

### Agent Span Conventions

The GenAI agent span conventions extend the base GenAI spans with agent-specific operations:

| Operation | `gen_ai.operation.name` | Span Name |
|-----------|-------------------------|-----------|
| Agent creation | `create_agent` | `create_agent {gen_ai.agent.name}` |
| Agent invocation | `invoke_agent` | `invoke_agent {gen_ai.agent.name}` |
| Tool call | (defined in base GenAI spans) | Tool-specific |

### GenAI Metrics

Standard OTel GenAI metrics relevant to evaluation explainability:

| Metric | Type | Unit | Description |
|--------|------|------|-------------|
| `gen_ai.client.token.usage` | Histogram | `{token}` | Token consumption per request |
| `gen_ai.client.operation.duration` | Histogram | `s` | Duration of GenAI operations |
| `gen_ai.server.request.duration` | Histogram | `s` | Server-side request processing time |
| `gen_ai.server.time_per_output_token` | Histogram | `s` | Time per output token (time-to-first-token proxy) |

### Toolkit Query Capabilities

The toolkit's `obs_query_evaluations` supports `groupBy` on: `evaluationName`, `scoreLabel`, `evaluator`. Note: `evaluatorType` is not currently a valid `groupBy` field. Grouping by evaluator type would require a future schema extension.

### Gap Analysis: What OTel Does Not Yet Cover

| Missing Convention | Impact | Workaround |
|--------------------|--------|------------|
| `gen_ai.evaluation.confidence` | No standard for judge confidence/uncertainty | Use event body extension attributes |
| `gen_ai.evaluation.criteria` | No standard for what criteria the evaluator used | Encode in `explanation` or custom attributes |
| `gen_ai.evaluation.metadata` | No standard for evaluation configuration (temperature, model, prompt version) | Use resource/span attributes |
| Agent handoff evaluation events | No standard for scoring handoff quality between agents | Emit custom events parented to handoff spans |
| Turn-level relevancy events | No standard for per-turn evaluation in multi-turn conversations | Emit `gen_ai.evaluation.result` per turn span |

---

## 3. LLM-as-Judge UX Patterns

### Score Presentation

Research across all six platforms reveals three dominant patterns for presenting evaluation scores:

**Pattern 1: Score Badge with Tooltip (Langfuse)**

Compact inline display with progressive disclosure. The score appears as a colored badge on the trace/span. Hovering reveals the evaluator identity, score value, and a link to the full execution trace.

```
┌──────────────────────────────────────────────────────────┐
│  Score Badge Anatomy                                      │
│                                                           │
│  ┌────────────┐                                          │
│  │  0.92      │  <- Color-coded: green (>0.8),           │
│  │  relevance │     yellow (0.5-0.8), red (<0.5)         │
│  └─────┬──────┘                                          │
│        │ hover                                            │
│        ▼                                                  │
│  ┌────────────────────────────┐                          │
│  │ Score: 0.92                │                          │
│  │ Label: relevant            │                          │
│  │ Evaluator: gpt-4o-mini     │                          │
│  │ Type: llm                  │                          │
│  │ ─────────────────────      │                          │
│  │ [View explanation ->]      │                          │
│  │ [View judge trace ->]      │                          │
│  └────────────────────────────┘                          │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

**Pattern 2: Evaluation Column on Trace Table (Phoenix, LangSmith)**

Scores appear as columns alongside trace data, enabling sorting and filtering. Explanations appear in a detail panel when a row is selected.

**Pattern 3: Dedicated Evaluation Tab (Datadog, W&B Weave)**

Separate view for evaluation results with aggregation controls, comparison tools, and drill-down to individual evaluations.

### Chain-of-Thought Explanation Display

Best practices for presenting CoT explanations from LLM-as-Judge evaluations:

**1. Produce reasoning before the score**

The judge prompt should require the LLM to explain its reasoning step-by-step before emitting the final score/label. This improves alignment with human judgments and produces more auditable outputs.

```typescript
// Recommended judge prompt structure (aligns with toolkit's G-Eval pattern)
const judgePrompt = `
Evaluate the following response for relevance to the user query.

User Query: ${input}
Response: ${output}

Think step by step:
1. Identify the key information requested in the query
2. Assess whether the response addresses each key point
3. Check for any irrelevant or off-topic content
4. Consider completeness of the answer

Provide your evaluation in JSON format:
{
  "reasoning": "<step-by-step analysis>",
  "score": <0.0 to 1.0>,
  "label": "relevant" | "partially_relevant" | "not_relevant"
}
`;
```

**2. Display reasoning in collapsible sections**

```
┌──────────────────────────────────────────────────────────┐
│  Evaluation Detail: relevance                             │
│  Score: 0.92  Label: relevant  Evaluator: gpt-4o-mini    │
│                                                           │
│  [v] Reasoning (click to expand)                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 1. The query asks for the capital of France.       │  │
│  │ 2. The response directly states "Paris" which is   │  │
│  │    correct and addresses the core question.        │  │
│  │ 3. No irrelevant content detected.                 │  │
│  │ 4. The answer is complete for the given query.     │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  [>] Judge Trace (click to expand)                        │
│  [>] Evaluation Config (click to expand)                  │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

**3. Binary labels outperform granular scales for reliability**

Industry consensus (Evidently AI, Confident AI, Arize) is that binary evaluations ("pass"/"fail", "relevant"/"not_relevant") are more reliable and consistent for both LLM and human evaluators than numeric scales. When numeric scores are needed, combine binary labels with continuous scores:

| Approach | Reliability | Use Case |
|----------|-------------|----------|
| Binary label | High | Pass/fail gating, regression testing |
| Binary + continuous score | High | Gating + trend analysis |
| 1-5 Likert scale | Medium | Subjective quality assessment |
| 0-100 continuous | Low | Avoid -- high variance between evaluators |

### Confidence Indicators

No platform currently provides built-in confidence indicators for evaluation scores. This is a significant gap. Potential approaches:

| Method | Implementation | Pros | Cons |
|--------|---------------|------|------|
| Logprob-based confidence | Use token logprobs from the judge LLM (toolkit's `normalizeWithLogprobs()`) | Grounded in model uncertainty | Requires logprob API support |
| Multi-judge agreement | Run multiple judges and compute inter-rater agreement | Robust confidence signal | 2-5x cost increase |
| Score variance tracking | Track historical variance for each metric | Low-cost retrospective confidence | No per-evaluation confidence |
| Self-reported confidence | Ask the judge to report confidence alongside score | Simple to implement | Judge may not calibrate well |

The toolkit's existing `panelEvaluation()` (multi-judge panels) provides the infrastructure for multi-judge agreement as a confidence proxy.

---

## 4. Dashboard Metrics Explainability

### Making Percentile Metrics Actionable

The toolkit's `computeDashboardSummary()` already computes p50, p95, and p99 aggregations. The research identifies patterns for making these actionable in downstream UIs.

**Percentile interpretation for LLM quality metrics:**

| Percentile | Interpretation for Quality Scores | Interpretation for Latency |
|------------|-----------------------------------|---------------------------|
| p50 (median) | Typical evaluation quality -- what most responses score | Typical evaluation speed |
| p95 | Quality floor for 95% of responses -- early warning | Performance ceiling for most traffic |
| p99 | Worst-case quality -- outlier detection | Tail latency -- architectural bottlenecks |

**Three-tier alert strategy (aligns with toolkit's existing thresholds):**

```
┌──────────────────────────────────────────────────────────────┐
│  Alert Strategy for Quality Metrics                           │
│                                                               │
│  ┌─────────────┐                                             │
│  │   Primary    │  p50 warning/critical thresholds            │
│  │   SLO        │  (the toolkit's current approach)           │
│  └──────┬──────┘                                             │
│         │                                                     │
│  ┌──────▼──────┐                                             │
│  │  Divergence  │  "p99 < 0.5 * p50 for 15min" = alert      │
│  │  Detection   │  Detects bimodal score distributions        │
│  └──────┬──────┘                                             │
│         │                                                     │
│  ┌──────▼──────┐                                             │
│  │  Drill-down  │  Link alert -> specific low-scoring traces │
│  │  Linkage     │  -> evaluation explanations                │
│  └─────────────┘                                             │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Key UX pattern: Alert-to-trace linkage**

The industry gap is between "metric X is degraded" and "here is why." Best-in-class dashboards link:

1. Triggered alert -> metric detail view showing score distribution
2. Metric detail -> filtered trace list (low-scoring evaluations)
3. Individual trace -> evaluation explanation (judge's reasoning)

This three-level drill-down transforms a p50 threshold breach from "relevance dropped" to "relevance dropped because the retriever returned stale context for queries about product pricing changes."

**Dashboard design principles (from CHI 2025 research):**

The CHI 2025 paper "Design Principles and Guidelines for LLM Observability: Insights from Developers" (CHI '25 Extended Abstracts, ACM, DOI: 10.1145/3706599.3719914) identifies four developer-centric design principles:

| Principle | Description | Application to Quality Dashboards |
|-----------|-------------|----------------------------------|
| Design for Awareness | Surface changes and anomalies proactively | Highlight metric regressions, new alert triggers |
| Design for Monitoring | Enable continuous tracking of key signals | Time-series views of p50/p95/p99 quality scores |
| Design for Intervention | Support direct action from observed data | Link alerts to traces, provide remediation context |
| Design for Operability | Make system behavior understandable in production | Show evaluation pipeline health, judge uptime |

**Recommended panel layout (fewer than 12 panels per view):**

```
┌────────────────────────────────────────────────────────────┐
│  Quality Dashboard - Top Level                              │
│                                                             │
│  Row 1: Status Overview                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ Overall  │ │ Active   │ │ Judge    │ │ Eval     │     │
│  │ Health   │ │ Alerts   │ │ Uptime   │ │ Volume   │     │
│  │ [green]  │ │ 2 warn   │ │ 99.8%    │ │ 1.2k/hr  │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                             │
│  Row 2: Quality Score Time Series                           │
│  ┌────────────────────────────────────────────────────┐    │
│  │  relevance (p50)  ──────────────────────           │    │
│  │  faithfulness (p50) ──  ──  ──  ──  ──             │    │
│  │  coherence (p50)   ─ ─ ─ ─ ─ ─ ─ ─ ─              │    │
│  │  [warning threshold] ........................       │    │
│  │  [critical threshold] ........................      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  Row 3: Metric Cards (expandable)                           │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐  │
│  │ Relevance      │ │ Faithfulness   │ │ Hallucination  │  │
│  │ p50: 0.85      │ │ p50: 0.91      │ │ avg: 0.04      │  │
│  │ p95: 0.72      │ │ p95: 0.78      │ │ p95: 0.12      │  │
│  │ [healthy]      │ │ [healthy]      │ │ [warning]      │  │
│  │ [drill ->]     │ │ [drill ->]     │ │ [drill ->]     │  │
│  └────────────────┘ └────────────────┘ └────────────────┘  │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## 5. Multi-Agent Evaluation Explainability

### Evaluation Dimensions

Multi-agent systems introduce evaluation complexities not present in single-LLM applications. Microsoft's Multi-Agent Reference Architecture and Confident AI's agent evaluation framework identify these key dimensions:

| Dimension | What It Measures | Explainability Requirement |
|-----------|-----------------|---------------------------|
| Trajectory correctness | Did the agent take the right steps? | Show expected vs. actual step sequence |
| Handoff quality | Did agents transfer to the correct sub-agent? | Show handoff decision reasoning |
| Tool selection accuracy | Did agents choose appropriate tools? | Show tool selection context |
| Argument correctness | Were tool call arguments valid and safe? | Show expected vs. actual arguments, safety checks |
| Task completion | Was the overall goal achieved? | Show completion criteria evaluation |
| Per-turn relevancy | Was each turn relevant to the conversation goal? | Show turn-level scores with explanations |
| Conversation completeness | Were all aspects of the user's request addressed? | Show coverage analysis |
| Error propagation | Did errors in one agent cascade? | Show error chain across agent spans |

### Per-Turn Evaluation Pattern

For multi-turn agent conversations, evaluation should happen at both the turn level and the conversation level:

```
┌──────────────────────────────────────────────────────────────┐
│  Multi-Turn Agent Evaluation                                  │
│                                                               │
│  Session: session-abc123                                      │
│  Overall Score: 0.82 (task_completion)                        │
│                                                               │
│  Turn 1: User -> Agent-A (Router)                             │
│  ├── Input: "Help me debug my deployment"                     │
│  ├── Action: Route to Agent-B (DevOps)                        │
│  ├── Handoff Score: 0.95 [correct routing]                    │
│  └── Explanation: "Query contains deployment keywords,        │
│       correctly routed to DevOps specialist"                  │
│                                                               │
│  Turn 2: Agent-B (DevOps) -> Tool Call                        │
│  ├── Tool: kubectl_get_pods                                   │
│  ├── Tool Selection Score: 1.0 [correct]                      │
│  └── Explanation: "Appropriate first diagnostic step"         │
│                                                               │
│  Turn 3: Agent-B -> User                                      │
│  ├── Output: "Your pod is in CrashLoopBackOff..."             │
│  ├── Relevancy Score: 0.88                                    │
│  └── Explanation: "Addresses the deployment issue directly,   │
│       but missing suggested remediation steps"                │
│                                                               │
│  Turn 4: Agent-B -> Agent-C (Handoff)                         │
│  ├── Action: Escalate to Agent-C (Senior DevOps)              │
│  ├── Handoff Score: 0.70 [warning]                            │
│  └── Explanation: "Escalation premature -- Agent-B had        │
│       sufficient context to suggest restart/log check"        │
│                                                               │
│  Conversation Completeness: 0.75                              │
│  └── Explanation: "User's issue was identified but not        │
│       resolved. Missing: remediation steps, verification"     │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Mapping to OTel Spans

Each turn in a multi-agent evaluation maps to OTel span hierarchy:

```
┌──────────────────────────────────────────────────────────┐
│  OTel Span Hierarchy for Multi-Agent Evaluation           │
│                                                           │
│  [root] invoke_agent Router (session-abc123)              │
│  ├── [child] invoke_agent DevOps                          │
│  │   ├── [child] tool_call kubectl_get_pods               │
│  │   │   └── [event] gen_ai.evaluation.result             │
│  │   │       { gen_ai.evaluation.name: "tool_correctness",  │
│  │   │         gen_ai.evaluation.score.value: 1.0,        │
│  │   │         gen_ai.evaluation.explanation: "..." }     │
│  │   │                                                    │
│  │   ├── [event] gen_ai.evaluation.result                 │
│  │   │   { gen_ai.evaluation.name: "relevancy",             │
│  │   │     gen_ai.evaluation.score.value: 0.88,           │
│  │   │     gen_ai.evaluation.explanation: "..." }         │
│  │   │                                                    │
│  │   └── [child] handoff -> SeniorDevOps                  │
│  │       └── [event] gen_ai.evaluation.result             │
│  │           { gen_ai.evaluation.name: "handoff_correctness",│
│  │             gen_ai.evaluation.score.value: 0.70,       │
│  │             gen_ai.evaluation.score.label:              │
│  │               "premature_escalation",                  │
│  │             gen_ai.evaluation.explanation: "..." }     │
│  │                                                        │
│  ├── [child] invoke_agent SeniorDevOps                    │
│  │   └── ...                                              │
│  │                                                        │
│  └── [event] gen_ai.evaluation.result                     │
│      { gen_ai.evaluation.name: "task_completion",           │
│        gen_ai.evaluation.score.value: 0.82,               │
│        gen_ai.evaluation.explanation:                      │
│          "Issue identified, not resolved" }               │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Agent Evaluation Metrics from DeepEval / Confident AI

Confident AI introduced agent-specific metrics in 2025:

| Metric | What It Evaluates | Explanation Output |
|--------|-------------------|-------------------|
| `PlanQualityMetric` | Whether the plan is logical, complete, and efficient | Step-by-step plan analysis |
| `ToolCorrectnessMetric` | Whether the agent selected and used tools correctly | Per-tool selection reasoning |
| Task Completion | Whether the overall task was accomplished | Criteria-based completion check |
| Agent Handoff Quality | Whether handoffs went to the right sub-agent | Routing decision analysis |
| `MCPUseMetric` | Whether MCP tools were used correctly in single-turn | Per-tool selection and argument reasoning |
| `MCPTaskCompletionMetric` | Whether MCP tool usage achieved the task goal | End-to-end MCP task analysis |
| `MultiTurnMCPUseMetric` | MCP tool correctness across multi-turn conversations | Turn-level MCP tool evaluation |

Note: The MCP-specific metrics (`MCPUseMetric`, `MCPTaskCompletionMetric`, `MultiTurnMCPUseMetric`) are particularly relevant to observability-toolkit as it is itself an MCP server. These metrics evaluate whether MCP tools are invoked with correct arguments and in the right sequence.

---

## 6. Regulatory Frameworks

### EU AI Act: Transparency and Explainability

The EU AI Act (Regulation 2024/1689) establishes binding transparency and explainability requirements with a phased implementation timeline.

**Key timeline:**

| Date | Requirement | Relevance to Evaluation Explainability |
|------|-------------|---------------------------------------|
| Feb 2025 | Prohibited AI practices apply | Subliminal manipulation, social scoring banned |
| Aug 2025 | GPAI obligations (Articles 53, 55) | Model evaluation, adversarial testing, documentation |
| Aug 2026 | High-risk AI transparency (Articles 13, 50) | Full transparency obligations including explainability |

**Article 13: Transparency and Provision of Information to Deployers**

High-risk AI systems must be designed to be transparent enough that deployers can:
- Understand and use them correctly
- Access information about the provider, capabilities, and limitations
- Interpret the system's output correctly
- Be aware of potential risks

**Article 50: Transparency Obligations**

- AI systems interacting with humans must inform users they are interacting with AI
- AI-generated content must be identifiable (especially deep fakes and public information content)
- Clear and visible labeling of AI-generated outputs

**Penalties**: Up to 35 million EUR or 7% of global annual turnover.

**Implications for observability-toolkit:**

The toolkit's existing `obs_query_verifications` (EU AI Act human verification tracking) addresses the human oversight requirement. Evaluation explainability strengthens compliance by providing:

1. Audit trail of evaluation decisions (what was evaluated, by what judge, what score, why)
2. Traceability from output to evaluation to explanation
3. Documentation of evaluation methodology (criteria, prompts, models used)

### NIST AI Risk Management Framework (AI RMF 1.0)

NIST AI 100-1 provides voluntary, risk-based guidance structured around four core functions.

**Explainability within the four functions:**

| Function | Explainability Role | Observability-Toolkit Alignment |
|----------|--------------------|---------------------------------|
| **GOVERN** | Establish explainability policies and accountability structures | Configuration: evaluation criteria, judge selection, threshold policies |
| **MAP** | Identify where explainability is needed based on risk context | Map evaluation coverage across metrics and agent types |
| **MEASURE** | Continuously evaluate how explainable the AI system is | `obs_query_evaluations` with explanation analysis |
| **MANAGE** | Monitor explainability in production and improve over time | Dashboard alerts, explanation quality tracking |

**NIST distinction between transparency, explainability, and interpretability:**

| Concept | Answers | Example in Evaluation Context |
|---------|---------|------------------------------|
| Transparency | "What happened?" | The evaluation was run, score was 0.72 |
| Explainability | "How was the decision made?" | The judge compared the response to criteria X, Y, Z |
| Interpretability | "Why was this decision made?" | The score is low because the response omitted pricing context |

**NIST 2025 updates:**

- Explainability scoring is now emphasized as a measurable trustworthiness characteristic
- Risk assessments must include AI-specific vulnerabilities including bias, explainability, and model vulnerabilities
- NIST AI 600-1 (GenAI Profile) requires model evaluation using standardized protocols, adversarial testing, and systemic risk tracking

### Regulatory Mapping to OTel Evaluation Events

```
┌───────────────────────────────────────────────────────────┐
│  Regulatory Requirement -> OTel Evaluation Event Mapping   │
│                                                            │
│  EU AI Act Article 13 (Transparency)                       │
│  ├── "Understand AI output" -> explanation field           │
│  ├── "Capabilities and limitations" ->                     │
│  │    gen_ai.evaluation.name + score.label                 │
│  └── "Potential risks" -> alert thresholds + status        │
│                                                            │
│  NIST MEASURE Function                                     │
│  ├── "Evaluate explainability" -> explanation quality       │
│  │    scoring (meta-evaluation)                            │
│  ├── "Metrics and benchmarks" -> p50/p95/p99 aggregations  │
│  └── "Impact assessments" -> evaluation trend analysis     │
│                                                            │
│  Both Frameworks: Audit Trail                              │
│  ├── gen_ai.evaluation.result events with timestamps       │
│  ├── Trace/span context for full request lineage           │
│  ├── evaluator identity and type                           │
│  └── Historical evaluation data via JSONL backend          │
│                                                            │
└───────────────────────────────────────────────────────────┘
```

---

## 7. Recommendations for observability-toolkit

Prioritized recommendations based on research findings, ordered by impact and feasibility.

### Priority 1: Explanation Quality and Display (High Impact, Low Effort)

**R1.1: Add explanation to `QualityMetricResult`**

Currently, `QualityMetricResult` captures aggregated scores but not representative explanations. Add a field for the lowest-scoring evaluation's explanation to support alert-to-explanation drill-down.

```typescript
interface QualityMetricResult {
  // ... existing fields ...

  // NEW: Representative explanation from lowest-scoring evaluation
  worstExplanation?: {
    scoreValue: number;
    explanation: string;
    traceId?: string;
    timestamp: string;
  };
}
```

**R1.2: Standardize explanation format in G-Eval and QAG prompts**

Ensure all judge prompts produce structured explanations with:
- Step-by-step reasoning (before the score)
- Criteria-specific findings
- Concrete evidence from the evaluated output

This is already partially implemented in the toolkit's G-Eval pattern (`buildEvalPrompt()`) but should be formalized across all evaluation paths.

### Priority 2: Evaluation Traceability (High Impact, Medium Effort)

**R2.1: Emit OTel evaluation events for all judge executions**

When the toolkit runs LLM-as-Judge evaluations via `gEval()`, `qagEvaluate()`, or `panelEvaluation()`, emit `gen_ai.evaluation.result` OTel events parented to the span being evaluated. This enables downstream platforms (Langfuse, Datadog, Phoenix) to display evaluation results natively within their trace views.

```typescript
// Conceptual: emit evaluation result as OTel event
// OTel JS SDK Span.addEvent(name, attributes?, startTime?) — all fields go in attributes
function emitEvaluationEvent(
  span: Span,
  result: EvaluationResult
): void {
  span.addEvent('gen_ai.evaluation.result', {
    'gen_ai.evaluation.name': result.evaluationName,
    'gen_ai.evaluation.score.value': result.scoreValue,
    'gen_ai.evaluation.score.label': result.scoreLabel,
    'gen_ai.evaluation.explanation': result.explanation,
    'gen_ai.response.id': result.responseId,
  });
}
```

**R2.2: Surface judge execution metadata from `EvaluationEvent` into `EvaluationResult`**

The toolkit's `EvaluationEvent` type in `src/lib/llm-as-judge.ts` (lines 247-282) already captures operational metadata: `durationMs`, `inputTokens`, `outputTokens`, `retryCount`, `judgeModel`, `judgeTemperature`, and `samplingReason`. However, this type is separate from `EvaluationResult` in `src/backends/index.ts`.

The recommended approach is to bridge these types rather than duplicating fields:

```typescript
// Option A: Add optional judgeConfig to EvaluationResult (new fields)
interface EvaluationResult {
  // ... existing fields ...

  // NEW: Surfaced from EvaluationEvent for audit/debugging
  judgeConfig?: {
    model: string;            // from EvaluationEvent.judgeModel
    temperature: number;      // from EvaluationEvent.judgeTemperature
    promptVersion?: string;   // NEW: "relevance-v2.3"
    durationMs?: number;      // from EvaluationEvent.durationMs
    tokenUsage?: {
      input: number;          // from EvaluationEvent.inputTokens
      output: number;         // from EvaluationEvent.outputTokens
    };
  };
}

// Option B: Unify EvaluationEvent and EvaluationResult
// type EvaluationResult = EvaluationEvent & AgentJudgeFields;
```

### Priority 3: Confidence Indicators (Medium Impact, Medium Effort)

**R3.1: Expose logprob-based confidence from G-Eval**

The toolkit's `normalizeWithLogprobs()` already computes probability-weighted scores. Surface the confidence distribution as part of the evaluation result:

```typescript
interface EvaluationResult {
  // ... existing fields ...

  // NEW: Confidence from logprob distribution
  confidence?: number;        // 0.0-1.0, derived from logprob entropy
  confidenceMethod?: 'logprobs' | 'multi_judge' | 'historical';
}
```

**R3.2: Compute multi-judge agreement as confidence**

When `panelEvaluation()` runs multiple judges, compute inter-rater agreement (e.g., Krippendorff's alpha or simple percent agreement) and surface it as a confidence indicator.

### Priority 4: Dashboard Explainability Enhancements (Medium Impact, Low Effort)

**R4.1: Add divergence detection to alert system**

Complement existing threshold alerts with ratio alerts that detect bimodal score distributions:

This would require extending the existing `AlertThreshold` interface (which has `aggregation`, `value`, `direction`, `severity`, `message`) with a new `DivergenceAlertThreshold` type:

```typescript
// Requires new interface — not part of current AlertThreshold
interface DivergenceAlertThreshold {
  type: 'divergence';
  aggregationA: EvaluationAggregation;  // e.g., 'p99'
  aggregationB: EvaluationAggregation;  // e.g., 'p50'
  ratio: number;                         // 0.5 = "A < 50% of B"
  severity: AlertSeverity;
  message: string;                       // template with {p99} and {p50}
}

// Example usage:
const divergenceAlert: DivergenceAlertThreshold = {
  type: 'divergence',
  aggregationA: 'p99',
  aggregationB: 'p50',
  ratio: 0.5,                           // Fire when p99 < 0.5 * p50
  severity: 'warning',
  message: 'Score distribution diverging: p99 ({p99}) < 50% of p50 ({p50})',
};
```

**R4.2: Include sample count context in alerts**

Alert messages should include the sample count to help users assess statistical significance:

```
// Current: "Relevance p50 (0.4500) critically low"
// Improved: "Relevance p50 (0.4500) critically low (n=47 evaluations, last 1h)"
```

### Priority 5: Multi-Agent Explainability (High Impact, High Effort)

**R5.1: Add turn-level evaluation support to agent-as-judge**

The toolkit's agent-as-judge module should support emitting `gen_ai.evaluation.result` events at each turn/step of a multi-agent conversation, not just at the conversation level.

**R5.2: Add handoff correctness metric to built-in QUALITY_METRICS**

The toolkit's `agent-eval-metrics.ts` already emits evaluations with `evaluationName: 'handoff_correctness'`. Add a matching built-in dashboard metric to surface these in `computeDashboardSummary()`:

```typescript
const handoffCorrectness = createMetricConfig('handoff_correctness')
  .displayName('Agent Handoff Correctness')
  .description('Measures whether agents correctly transfer to appropriate sub-agents')
  .aggregations('avg', 'p50', 'p95', 'count')
  .range(0, 1)
  .unit('score')
  .alertBelow('avg', 0.85, 'warning', 'Handoff correctness ({value}) below 85% target')
  .alertBelow('avg', 0.70, 'critical', 'Handoff correctness ({value}) critically low')
  .build();
```

### Priority 6: Regulatory Compliance Enhancements (Medium Impact, Low Effort)

**R6.1: Add evaluation provenance fields**

For EU AI Act Article 13 compliance (August 2026 deadline), ensure all evaluation results include sufficient provenance for audit:

- Evaluator identity (model name, version)
- Evaluation criteria used
- Timestamp of evaluation
- Link to the evaluated output (trace/span ID)

The toolkit's existing `EvaluationResult` covers most of these. The gap is evaluation criteria documentation.

**R6.2: Add explanation quality meta-evaluation**

For NIST MEASURE function compliance, add the capability to evaluate the quality of explanations themselves:

```typescript
// Meta-evaluation: score the explanation quality
const explanationQuality = createMetricConfig('explanation_quality')
  .displayName('Explanation Quality')
  .description('Meta-evaluation of judge explanation clarity and completeness')
  .aggregations('avg', 'p50', 'count')
  .range(0, 1)
  .unit('score')
  .alertBelow('avg', 0.7, 'warning', 'Explanation quality ({value}) below target')
  .build();
```

### Implementation Roadmap

| Priority | Recommendation | Effort | Target |
|----------|---------------|--------|--------|
| P1 | Explanation in QualityMetricResult | Low | v2.1 |
| P1 | Standardize explanation format | Low | v2.1 |
| P2 | OTel evaluation event emission | Medium | v2.1 |
| P2 | Judge execution metadata | Medium | v2.1 |
| P3 | Logprob confidence exposure | Medium | v2.2 |
| P3 | Multi-judge agreement confidence | Medium | v2.2 |
| P4 | Divergence detection alerts | Low | v2.1 |
| P4 | Sample count in alert messages | Low | v2.1 |
| P5 | Turn-level agent evaluation | High | v2.2 |
| P5 | Handoff correctness metric | High | v2.2 |
| P6 | Evaluation provenance fields | Low | v2.1 |
| P6 | Explanation quality meta-eval | Low | v2.2 |

---

## 8. Sources

### OpenTelemetry

- [Semantic Conventions for GenAI Systems](https://opentelemetry.io/docs/specs/semconv/gen-ai/)
- [Semantic Conventions for GenAI Events](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-events/)
- [Semantic Conventions for GenAI Agent Spans](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans/)
- [Semantic Conventions for GenAI Metrics](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-metrics/)
- [GenAI Attribute Registry](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/)
- [OpenTelemetry for Generative AI (blog)](https://opentelemetry.io/blog/2024/otel-generative-ai/)
- [GenAI Events spec on GitHub](https://github.com/open-telemetry/semantic-conventions/blob/main/docs/gen-ai/gen-ai-events.md)
- [GenAI Agentic Systems RFC (Issue #2664)](https://github.com/open-telemetry/semantic-conventions/issues/2664)
- [GenAI Tasks RFC (Issue #2665)](https://github.com/open-telemetry/semantic-conventions/issues/2665)

### Platform Documentation

- [Langfuse: LLM-as-a-Judge Evaluation](https://langfuse.com/docs/evaluation/evaluation-methods/llm-as-a-judge)
- [Langfuse: LLM-as-a-Judge Execution Tracing (Oct 2025)](https://langfuse.com/changelog/2025-10-16-llm-as-a-judge-execution-tracing)
- [Langfuse: Automated Evaluations (Sep 2025)](https://langfuse.com/blog/2025-09-05-automated-evaluations)
- [Langfuse: Scores via UI](https://langfuse.com/docs/evaluation/evaluation-methods/scores-via-ui)
- [Langfuse: Evaluation Core Concepts](https://langfuse.com/docs/evaluation/core-concepts)
- [Arize Phoenix: Evals Overview](https://arize.com/docs/phoenix/evaluation/llm-evals)
- [Arize Phoenix: Evals API Reference](https://docs.arize.com/phoenix/evaluation/how-to-evals/evals-reference)
- [Arize: LLM Evaluation Platforms Comparison](https://arize.com/llm-evaluation-platforms-top-frameworks/)
- [Arize: LLM as a Judge](https://arize.com/llm-as-a-judge/)
- [Datadog: LLM Observability](https://docs.datadoghq.com/llm_observability/)
- [Datadog: LLM Observability Metrics](https://docs.datadoghq.com/llm_observability/monitoring/metrics/)
- [Datadog: OTel GenAI Semantic Conventions Support](https://www.datadoghq.com/blog/llm-otel-semantic-convention/)
- [Datadog: OTel Instrumentation for LLM Obs](https://docs.datadoghq.com/llm_observability/instrumentation/otel_instrumentation/)
- [LangSmith: Evaluation Docs](https://docs.langchain.com/langsmith/evaluation)
- [LangSmith: Observability Platform](https://www.langchain.com/langsmith/observability)
- [W&B Weave Documentation](https://docs.wandb.ai/weave)
- [W&B Evaluations](https://wandb.ai/site/evaluations/)
- [DeepEval: Metrics Introduction](https://deepeval.com/docs/metrics-introduction)
- [DeepEval: Agent Evaluation Metrics](https://deepeval.com/guides/guides-ai-agent-evaluation-metrics)
- [Confident AI: Agent Evaluation Guide](https://www.confident-ai.com/blog/definitive-ai-agent-evaluation-guide)

### Multi-Agent Evaluation

- [Microsoft Multi-Agent Reference Architecture: Evaluation](https://microsoft.github.io/multi-agent-reference-architecture/docs/evaluation/Evaluation.html)
- [Microsoft Multi-Agent Reference Architecture: Observability](https://microsoft.github.io/multi-agent-reference-architecture/docs/observability/Observability.html)
- [Statsig: Evaluating Multi-Step Reasoning](https://www.statsig.com/perspectives/evaluatingmultistepreasoningagenteval)
- [IBM: Why Observability Is Essential for AI Agents](https://www.ibm.com/think/insights/ai-agent-observability)

### LLM-as-Judge Best Practices

- [Evidently AI: LLM-as-a-Judge Complete Guide](https://www.evidentlyai.com/llm-guide/llm-as-a-judge)
- [Confident AI: Why LLM-as-a-Judge Is the Best Evaluation Method](https://www.confident-ai.com/blog/why-llm-as-a-judge-is-the-best-llm-evaluation-method)
- [Monte Carlo: LLM-As-Judge Best Practices](https://www.montecarlodata.com/blog-llm-as-judge/)
- [Patronus AI: LLM As a Judge Tutorial](https://www.patronus.ai/llm-testing/llm-as-a-judge)

### Dashboard and Metrics

- [OneUptime: P50 vs P95 vs P99 Latency Percentiles](https://oneuptime.com/blog/post/2025-09-15-p50-vs-p95-vs-p99-latency-percentiles/view)
- [AWS Observability Best Practices: Percentiles and SLAs](https://aws-observability.github.io/observability-best-practices/guides/operational/business/sla-percentile/)
- [OpenObserve: Observability Dashboards](https://openobserve.ai/blog/observability-dashboards/)

### Regulatory and Research

- [EU AI Act: Article 13 Transparency](https://artificialintelligenceact.eu/article/13/)
- [EU AI Act: Article 50 Transparency Obligations](https://artificialintelligenceact.eu/article/50/)
- [EU AI Act: Implementation Timeline](https://artificialintelligenceact.eu/implementation-timeline/)
- [EU AI Act Summary (Jan 2026)](https://www.softwareimprovementgroup.com/blog/eu-ai-act-summary/)
- [EU AI Act: XAI as Compliance Requirement by 2026](https://www.cogentinfo.com/resources/the-xai-reckoning-turning-explainability-into-a-compliance-requirement-by-2026)
- [NIST AI Risk Management Framework (AI RMF 1.0)](https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf)
- [NIST AI 600-1: GenAI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)
- [NIST AI RMF 2025 Updates (ispartnersllc.com)](https://www.ispartnersllc.com/blog/nist-ai-rmf-2025-updates-what-you-need-to-know-about-the-latest-framework-changes/) (accessed 2026-02-06)
- [NIST AI RMF Implementation Guide 2026 (glacis.io)](https://www.glacis.io/guide-nist-ai-rmf) (accessed 2026-02-06)
- [CHI '25 Extended Abstracts: "Design Principles and Guidelines for LLM Observability: Insights from Developers"](https://dl.acm.org/doi/10.1145/3706599.3719914) (DOI: 10.1145/3706599.3719914)

### Industry Overviews

Note: Vendor blog posts may move or be removed. Access dates provided for reference.

- [Honeycomb CEO at KubeCon EU: LLM Observability and UX (InfoQ)](https://www.infoq.com/news/2025/04/llm-observability/) (accessed 2026-02-06)
- [Maxim: LLM Observability Best Practices for 2025](https://www.getmaxim.ai/articles/llm-observability-best-practices-for-2025/) (accessed 2026-02-06)
- [Neptune AI: LLM Observability Fundamentals](https://neptune.ai/blog/llm-observability) (accessed 2026-02-06)
- [SigNoz: Understanding LLM Observability](https://signoz.io/blog/llm-observability/) (accessed 2026-02-06)
- [LLM Observability Tools: 2026 Comparison (lakefs.io)](https://lakefs.io/blog/llm-observability-tools/) (accessed 2026-02-06)
- [Top 5 AI Agent Observability Platforms: 2026 Guide (o-mega.ai)](https://o-mega.ai/articles/top-5-ai-agent-observability-platforms-the-ultimate-2026-guide) (accessed 2026-02-06)

---

## Related Documentation

The following documents are available in the [observability-toolkit](https://github.com/aledlie/observability-toolkit) project:

- Quality Metrics Dashboard (`docs/interface/quality-metrics-dashboard.md`) - Current dashboard implementation
- Wiz.io Security Explainability UX (`docs/interface/wiz-io-security-explainability-ux.md`) - Prior UX research
- Quality Evaluation Architecture (`docs/quality/quality-evaluation.md`) - Evaluation storage and export
- LLM-as-Judge Architecture (`docs/quality/llm-as-judge.md`) - G-Eval, QAG, bias mitigation
- Agent-as-Judge Architecture (`docs/quality/agent-as-judge.md`) - Multi-agent evaluation patterns
- EU AI Act Requirements (`docs/reviews/eu-ai-act-observability-requirements.md`) - Compliance mapping
