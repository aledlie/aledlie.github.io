---
layout: single
title: "LLM Observability Best Practices: A Practitioner's Guide for 2026 — August 2026 Update to the January Edition"
date: 2026-08-31
author_profile: true
excerpt: "Technical white paper (v2.0) on LLM observability standards: OpenTelemetry GenAI semantic conventions, agent tracking, metric and histogram conformance, and the evaluation layer. A vendor-neutral guide to what full conformance requires."
header:
  image: /assets/images/cover-work.png
  teaser: /assets/images/llm-obs-2026-graphical-abstract.png
toc: true
toc_sticky: true
categories: [observability]
tags: [llm-observability, opentelemetry, genai-semantic-conventions, agent-tracking, evaluation, whitepaper]
schema_type: tech-article
permalink: /work/llm-observability-best-practices-08-2026/
---

**Technical White Paper — Version 2.0** · Published 31 August 2026 · Research conducted January–August 2026

*This is the current edition, superseding the [January 2026 edition](/work/llm-observability-best-practices-01-2026/).*

![Graphical abstract: four conformance tiers — span attributes, agent and tool semantics, metrics and histogram buckets, and evaluation records with provenance — followed by a comparison of 89% observability adoption against 52% evaluation adoption.](/assets/images/llm-obs-2026-graphical-abstract.png)
{: .align-center}

*Graphical abstract — the four conformance tiers of Section 6, and the adoption gap that Section 5 identifies as the field's most consequential shortfall.*

**Scope and method.** This paper draws on two bodies of evidence gathered on different
schedules. The industry-facing material — the adoption timeline in Section 2, the specification
versions in Section 3, the platform landscape in Sections 5 and A.6, the research surveyed in
Section 5.6, and the references — was compiled through systematic web research and verified against
primary sources on 31 August 2026. The conformance guidance in Section 6 is drawn from
implementation experience across the period and is stated in vendor-neutral terms; it describes
what the conventions require rather than what any particular product provides. Where a claim rests
on survey data or a dated observation, the paper says so.

---

## Abstract

As Large Language Model (LLM) applications transition from experimental deployments to production-critical systems, the need for standardized observability practices has become paramount. This paper examines the current state of LLM observability standards, with particular focus on OpenTelemetry's emerging GenAI semantic conventions, agent tracking methodologies, and quality measurement frameworks. We set out what full conformance requires across four independent tiers — attributes, agent and tool semantics, metrics and histogram boundaries, and evaluation records — and derive implications for teams adopting the conventions: that attribute-level conformance is cheap and disproportionately valuable, that agent-level signals are often easier to reconstruct than to capture in flight, and that the principal risk in the evaluation layer is methodological rather than technical. We conclude that the gap between tracing adoption and evaluation adoption, rather than instrumentation coverage, is the field's most consequential shortfall.

**Keywords:** LLM observability, OpenTelemetry, GenAI semantic conventions, agent tracking, AI quality metrics, distributed tracing

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Background: The Evolution of LLM Observability](#2-background-the-evolution-of-llm-observability)
3. [OpenTelemetry GenAI Semantic Conventions](#3-opentelemetry-genai-semantic-conventions)
4. [Agent Observability Standards](#4-agent-observability-standards)
5. [Quality and Evaluation Metrics](#5-quality-and-evaluation-metrics)
6. [Implementation Reference: What Full Conformance Requires](#6-implementation-reference-what-full-conformance-requires)
7. [Discussion: Implications for Implementers](#7-discussion-implications-for-implementers)
8. [Future Research Directions](#8-future-research-directions)
9. [Conclusion](#9-conclusion)
10. [References](#10-references)
11. [Appendices](#11-appendices)
    - [Appendix A: Quality Evaluation Layer](#appendix-a-quality-evaluation-layer)

---

## 1. Introduction

### 1.1 Problem Statement

The rapid adoption of LLM-based applications has outpaced the development of observability tooling, creating a fragmented landscape where teams rely on vendor-specific instrumentation, proprietary formats, and ad-hoc monitoring solutions. This fragmentation leads to:

- **Vendor lock-in** through non-standard telemetry formats
- **Incomplete visibility** into multi-step agent workflows
- **Inability to compare** performance across providers and models
- **Quality blind spots** where systems appear operational but produce low-quality outputs

### 1.2 Scope

This paper focuses on three primary areas:

1. **Standardization**: OpenTelemetry GenAI semantic conventions (core semconv v1.44.0; GenAI conventions now versioned separately in `semantic-conventions-genai`)
2. **Agent Tracking**: Multi-turn, tool-use, and reasoning chain observability
3. **Quality Measurement**: Production evaluation metrics beyond latency and throughput

### 1.3 Methodology

Research was conducted through:
- Analysis of OpenTelemetry specification documents (v1.40.0, re-verified against v1.44.0 and the `semantic-conventions-genai` repo in August 2026) and GitHub discussions
- Review of industry tooling (Langfuse, Arize Phoenix, DeepEval, MLflow, Datadog, LangSmith, Galileo, Patronus AI, Opik, W&B Weave)
- Examination of academic literature on hallucination detection and LLM/agent evaluation (2024-2026)
- Conformance requirements for implementations of the GenAI semantic conventions

---

## 2. Background: The Evolution of LLM Observability

### 2.1 Traditional ML Observability vs. LLM Observability

Traditional machine learning observability focused on:
- Model accuracy metrics (precision, recall, F1)
- Feature drift detection
- Inference latency and throughput
- Resource utilization

LLM applications introduce fundamentally different observability challenges:

| Dimension | Traditional ML | LLM Applications |
|-----------|----------------|------------------|
| **Input Nature** | Structured features | Unstructured natural language |
| **Output Nature** | Discrete classes/values | Free-form generated text |
| **Evaluation** | Ground truth comparison | Subjective quality assessment |
| **Cost Model** | Compute-based | Token-based pricing |
| **Failure Modes** | Classification errors | Hallucinations, toxicity, irrelevance |
| **Execution Pattern** | Single inference | Multi-turn, tool-augmented chains |

### 2.2 The Three Pillars Extended

![Three columns headed Traces, Metrics and Logs, each listing four signal types, above a full-width band headed Evaluation Layer listing six quality measures.](/assets/images/llm-obs-2026-fig2-pillars.png)
{: .align-center}

*Figure 2 — the three classical pillars of observability, and the evaluation layer LLM systems require in addition.*


The traditional observability pillars (metrics, traces, logs) require extension for LLM systems:

```
┌─────────────────────────────────────────────────────────────────┐
│                    LLM Observability Pillars                     │
├─────────────────┬─────────────────┬─────────────────────────────┤
│     TRACES      │     METRICS     │           LOGS              │
├─────────────────┼─────────────────┼─────────────────────────────┤
│ • Prompt chains │ • Token usage   │ • Prompt/completion content │
│ • Tool calls    │ • Latency (TTFT)│ • Error details             │
│ • Agent loops   │ • Cost per req  │ • Reasoning chains          │
│ • Retrieval     │ • Quality scores│ • Human feedback            │
└─────────────────┴─────────────────┴─────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EVALUATION LAYER (NEW)                        │
├─────────────────────────────────────────────────────────────────┤
│ • Hallucination detection    • Answer relevancy                 │
│ • Factual accuracy           • Task completion                  │
│ • Tool correctness           • Safety/toxicity                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Key Industry Developments (2024-2026)

| Date | Development | Impact |
|------|-------------|--------|
| Apr 2024 | OTel GenAI SIG formation | Standardization effort begins |
| Jun 2024 | GenAI semantic conventions draft | Initial attribute definitions |
| Oct 2024 | Langfuse OTel support | Open-source adoption |
| Dec 2024 | Datadog native OTel GenAI support | Enterprise validation |
| Jan 2025 | OTel v1.37+ GenAI conventions | Production-ready standards |
| Feb 2025 | OTel semantic-conventions v1.40.0 | Cache token attrs, `gen_ai.agent.version`, MCP conventions |
| Mar 2025 | Agent framework conventions proposed | Multi-agent standardization |
| Jun 2025 | Langfuse Python SDK v3 GA | OTel-native context propagation, unified @observe |
| Jun 2025 | MLflow 3.0 GA | GenAI tracing for 20+ libraries, LLM judges |
| Jul 2025 | Galileo Agent Reliability Platform | Sub-200ms real-time eval (Luna-2), free tier |
| Dec 2025 | OTel v1.39 GenAI conventions | Agent/tool span semantics |
| Dec 2025 | Langfuse tool usage analytics | Tool-call filtering, dashboard widgets, dataset versioning |
| Jan 2026 | ClickHouse acquires Langfuse (with $400M Series D) | Consolidation wave continues; Langfuse stays open-source |
| Feb 2026 | Braintrust raises $80M Series B (ICONIQ-led) | Eval-platform investment accelerates |
| Mar 2026 | OpenAI acquires Promptfoo; Mintlify acquires Helicone | Eval/observability consolidation continues |
| Apr 2026 | Cisco announces intent to acquire Galileo | Luna-2 folds into Splunk Observability Cloud |
| May 2026 | Palo Alto Networks completes Portkey acquisition | AI gateway absorbed into Prisma AIRS |
| Jun 2026 | OTel semconv v1.42.0 splits GenAI/agent/MCP conventions into `semantic-conventions-genai` repo | GenAI conventions now versioned separately; all still Development maturity |
| Jun 2026 | Datadog DASH 2026: "Patterns" agent-interaction clustering | Per-cluster traffic/latency/cost/eval-score signals |
| Jun 2026 | Patronus AI raises $50M Series B | Agent stress-testing "digital worlds" |
| Jul 2026 | EU Digital Omnibus (Regulation (EU) 2026/1744) enters into force | High-risk AI Act deadlines delayed to Dec 2027 / Aug 2028; Article 50 transparency stays Aug 2026 |
| Aug 2026 | OTel semantic-conventions v1.44.0 (core) | GenAI repo still has zero tagged releases |
| Aug 2026 | Dynatrace announces $915M acquisition of Arize AI | Largest LLM-observability deal to date; eighth evals/observability acquisition since Mar 2025 |

---

## 3. OpenTelemetry GenAI Semantic Conventions

> **Further reading**: *OTel GenAI Attribute Reference* — complete `gen_ai.*` attribute list, requirement levels by operation, and provider extensions.

### 3.1 Overview

The OpenTelemetry GenAI semantic conventions establish a standardized schema. As of August 2026 the core semantic-conventions repo is at **v1.44.0** (2026-08-04), but at **v1.42.0 (2026-06-12) all GenAI conventions — `gen_ai.*` spans/attributes/metrics, OpenAI-specific conventions, and MCP conventions — were extracted into a dedicated repo, [`open-telemetry/semantic-conventions-genai`](https://github.com/open-telemetry/semantic-conventions-genai)**. That repo has zero tagged releases as of 2026-08-31; every GenAI attribute, span, metric and event still carries **Development** maturity — nothing has graduated to Stable or Release Candidate. The attribute tables below reflect the v1.40.0 snapshot this paper was written against; the substance (operation names, agent/tool spans, core attributes) is unchanged in the new repo. The conventions cover:

- **Spans**: LLM inference calls, tool executions, agent invocations
- **Metrics**: Token usage histograms, operation duration, latency breakdowns
- **Events**: Input/output messages, system instructions, tool definitions
- **Attributes**: Model parameters, provider metadata, conversation context

### 3.2 Core Span Attributes

#### 3.2.1 Required Attributes

| Attribute | Type | Description | Example |
|-----------|------|-------------|---------|
| `gen_ai.operation.name` | string | Operation type | `chat`, `invoke_agent`, `execute_tool` |
| `gen_ai.provider.name` | string | Provider identifier | `anthropic`, `openai`, `aws.bedrock` |

#### 3.2.2 Conditionally Required Attributes

| Attribute | Condition | Type | Example |
|-----------|-----------|------|---------|
| `gen_ai.request.model` | If available | string | `claude-3-opus-20240229` |
| `gen_ai.conversation.id` | When available | string | `conv_5j66UpCpwteGg4YSxUnt7lPY` |
| `error.type` | If error occurred | string | `timeout`, `rate_limit` |

#### 3.2.3 Recommended Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `gen_ai.request.temperature` | double | Sampling temperature |
| `gen_ai.request.max_tokens` | int | Maximum output tokens |
| `gen_ai.request.top_p` | double | Nucleus sampling parameter |
| `gen_ai.response.model` | string | Actual model that responded |
| `gen_ai.response.finish_reasons` | string[] | Why generation stopped |
| `gen_ai.usage.input_tokens` | int | Prompt token count |
| `gen_ai.usage.output_tokens` | int | Completion token count |

### 3.3 Operation Types

The specification defines seven standard operation names:

```
gen_ai.operation.name:
├── chat                 # Chat completion (most common)
├── text_completion      # Legacy completion API
├── generate_content     # Multimodal generation
├── embeddings           # Vector embeddings
├── create_agent         # Agent instantiation
├── invoke_agent         # Agent execution
└── execute_tool         # Tool/function execution
```

### 3.4 Provider Identifiers

Standardized `gen_ai.provider.name` values:

| Provider | Value | Notes |
|----------|-------|-------|
| Anthropic | `anthropic` | Claude models |
| OpenAI | `openai` | GPT models |
| AWS Bedrock | `aws.bedrock` | Multi-model |
| Azure OpenAI | `azure.ai.openai` | Azure-hosted |
| Google Gemini | `gcp.gemini` | AI Studio API |
| Google Vertex AI | `gcp.vertex_ai` | Enterprise API |
| Cohere | `cohere` | |
| Mistral AI | `mistral_ai` | |

### 3.5 Standard Metrics

#### 3.5.1 Client Metrics

| Metric | Type | Unit | Buckets |
|--------|------|------|---------|
| `gen_ai.client.token.usage` | Histogram | `{token}` | [1, 4, 16, 64, 256, 1024, 4096, 16384, 65536, ...] |
| `gen_ai.client.operation.duration` | Histogram | `s` | [0.01, 0.02, 0.04, 0.08, 0.16, 0.32, 0.64, 1.28, ...] |

#### 3.5.2 Server Metrics (for model hosting)

| Metric | Type | Unit | Purpose |
|--------|------|------|---------|
| `gen_ai.server.request.duration` | Histogram | `s` | Total request time |
| `gen_ai.server.time_to_first_token` | Histogram | `s` | Prefill + queue latency |
| `gen_ai.server.time_per_output_token` | Histogram | `s` | Decode phase performance |

### 3.6 Content Handling

The specification addresses sensitive content through three approaches:

1. **Default**: Do not capture prompts/completions
2. **Opt-in attributes**: Record on spans (`gen_ai.input.messages`, `gen_ai.output.messages`)
3. **External storage**: Upload to secure storage, record references

```
Recommended for production:
┌─────────────────────────────────────────────────────────┐
│  Span: gen_ai.operation.name = "chat"                   │
│  ├── gen_ai.input.messages.uri = "s3://bucket/msg/123"  │
│  └── gen_ai.output.messages.uri = "s3://bucket/msg/124" │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Agent Observability Standards

> **Further reading**: *Agent Span Hierarchies* — span-hierarchy patterns for single-agent, multi-agent, and tool-execution workflows.

### 4.1 The Agent Observability Challenge

AI agents introduce observability complexity through:

- **Non-deterministic execution**: Same input may produce different tool call sequences
- **Multi-turn reasoning**: Extended context across many LLM calls
- **Tool orchestration**: External system interactions within agent loops
- **Framework diversity**: LangGraph, CrewAI, AutoGen, etc. have different patterns

### 4.2 Agent Application vs. Framework Distinction

The OpenTelemetry specification distinguishes:

| Concept | Definition | Examples |
|---------|------------|----------|
| **Agent Application** | Specific AI-driven entity | Customer support bot, coding assistant |
| **Agent Framework** | Infrastructure for building agents | LangGraph, CrewAI, Claude Code |

### 4.3 Agent Span Semantics

#### 4.3.1 Agent Creation Span

```
Span: create_agent {agent_name}
├── gen_ai.operation.name: "create_agent"
├── gen_ai.agent.id: "agent_abc123"
├── gen_ai.agent.name: "CustomerSupportAgent"
├── gen_ai.agent.version: "1.2.0"          # NEW in v1.40.0
└── gen_ai.agent.description: "Handles tier-1 support queries"
```

#### 4.3.2 Agent Invocation Span

```
Span: invoke_agent {agent_name}
├── gen_ai.operation.name: "invoke_agent"
├── gen_ai.agent.id: "agent_abc123"
├── gen_ai.agent.name: "CustomerSupportAgent"
└── gen_ai.conversation.id: "conv_xyz789"
    │
    ├── Child Span: chat claude-3-opus
    │   └── gen_ai.operation.name: "chat"
    │
    ├── Child Span: execute_tool get_customer_info
    │   ├── gen_ai.tool.name: "get_customer_info"
    │   ├── gen_ai.tool.type: "function"
    │   └── gen_ai.tool.call.id: "call_abc"
    │
    └── Child Span: chat claude-3-opus
        └── gen_ai.operation.name: "chat"
```

### 4.4 Tool Execution Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `gen_ai.tool.name` | string | Tool identifier |
| `gen_ai.tool.type` | string | `function`, `extension`, `datastore` |
| `gen_ai.tool.description` | string | Human-readable description |
| `gen_ai.tool.call.id` | string | Unique call identifier |
| `gen_ai.tool.call.arguments` | any | Input parameters (opt-in, sensitive) |
| `gen_ai.tool.call.result` | any | Output (opt-in, sensitive) |

### 4.5 Framework Instrumentation Approaches

| Approach | Pros | Cons | Examples |
|----------|------|------|----------|
| **Baked-in** | Zero config, consistent | Bloat, version lag | CrewAI |
| **External OTel** | Decoupled, community-maintained | Integration complexity | OpenLLMetry |
| **OTel Contrib** | Official support, best practices | Review queue delays | `instrumentation-genai` |
| **MCP Gateway** | Centralized auth + telemetry | Extra hop, session state | MCP semantic conventions (Dev) |

### 4.6 Claude Code as Agent System

Claude Code exhibits agent characteristics:
- Multi-turn conversation management
- Tool execution (Bash, Read, Write, Edit, etc.)
- Reasoning chains across tool calls
- Session-based context

As of this survey, general-purpose coding agents did not emit the standardised agent span
vocabulary described above, exposing tool invocations through proprietary event streams
instead. Section 6 examines one system that reconstructs the equivalent signals from session
transcripts rather than receiving them directly.

---

## 5. Quality and Evaluation Metrics

> **Further reading**: *LLM Evaluation Frameworks* — comparative analysis of Langfuse, Phoenix, DeepEval, and Datadog.

### 5.1 The Quality Visibility Problem

![A two-by-two matrix of performance against quality. The cell where performance is good but quality is degraded is outlined in warning colour and labelled Invisible Failure.](/assets/images/llm-obs-2026-fig4-invisible-failure.png)
{: .align-center}

*Figure 3 — the quadrant conventional monitoring cannot see: healthy performance metrics concealing degraded output quality.*


Traditional observability answers: "Is the system up and performing?"

LLM observability must also answer: "Is the system producing good outputs?"

```
System Status Matrix:
                    │ Quality: Good    │ Quality: Bad
────────────────────┼──────────────────┼──────────────────
Performance: Good   │ Healthy          │ INVISIBLE FAILURE
Performance: Bad    │ Investigate      │ Obvious failure
```

The "invisible failure" quadrant is uniquely dangerous for LLM systems.

### 5.2 Core Quality Metrics

| Metric | Description | Measurement Method |
|--------|-------------|-------------------|
| **Answer Relevancy** | Output addresses input intent | LLM-as-judge, embedding similarity |
| **Faithfulness** | Output grounded in provided context | LLM-as-judge, NLI models |
| **Hallucination** | Fabricated or false information | LLM-as-judge, fact verification |
| **Task Completion** | Agent accomplished stated goal | Rule-based + LLM assessment |
| **Tool Correctness** | Correct tools called with valid args | Deterministic validation |
| **Toxicity/Safety** | Output meets safety guidelines | Classifier models, guardrails |

### 5.3 LLM-as-Judge Pattern

The dominant approach for quality evaluation:

```
┌─────────────────────────────────────────────────────────────┐
│                    LLM-as-Judge Pipeline                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Production LLM Call                                         │
│  ┌──────────┐    ┌───────────┐    ┌──────────┐             │
│  │  Input   │───▶│  Model A  │───▶│  Output  │             │
│  └──────────┘    └───────────┘    └──────────┘             │
│       │                                │                     │
│       │         Evaluation LLM         │                     │
│       │    ┌───────────────────────┐   │                     │
│       └───▶│       Model B         │◀──┘                     │
│            │  (Judge: GPT-4, etc.) │                         │
│            └───────────┬───────────┘                         │
│                        │                                     │
│                        ▼                                     │
│            ┌───────────────────────┐                         │
│            │   Quality Scores      │                         │
│            │ • Relevancy: 0.85     │                         │
│            │ • Faithfulness: 0.92  │                         │
│            │ • Hallucination: 0.08 │                         │
│            └───────────────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### 5.4 Evaluation Tool Landscape (August 2026)

| Tool | Type | Key Features |
|------|------|--------------|
| **Langfuse** | Open Source (MIT) | Tracing, prompt management, evals; Python SDK v4 / TS SDK v5; ~34k stars; **acquired by ClickHouse (Jan 2026)**, remains open-source |
| **Arize Phoenix** | Open Source (ELv2) | OTel-native, OTLP ingestion, agent flowcharts, v20.4.0, 11.2k+ stars; parent Arize AI: **$915M Dynatrace acquisition announced Aug 2026** |
| **DeepEval** | Open Source (Apache 2.0) | 50+ metrics, DAG metric, CI/CD-native pytest, v4.2.0 + new TypeScript SDK, 18k+ stars |
| **MLflow** | Open Source (Apache 2.0) | GenAI tracing for 20+ libs, Mosaic AI judges, v3.15.x, 27.7k+ stars |
| **Opik** | Open Source (Apache 2.0) | 40M+ traces/day scale, hallucination/moderation evals, 21.7k+ stars |
| **Datadog LLM Obs** | Commercial | MCP client monitoring, agent console, "Patterns" agent-interaction clustering (DASH 2026), Google ADK auto-instrumentation |
| **LangSmith** | Commercial | Insights failure clustering, end-to-end OTel export, unified agent-workflow cost view, LangSmith Fleet |
| **Braintrust** | Commercial | Eval datasets, prompt playground, CI/CD deployment gates; $80M Series B (ICONIQ-led, Feb 2026) |
| **Galileo** | Commercial | Luna-2 sub-200ms real-time eval; **acquired by Cisco (Apr 2026)**, folding into Splunk Observability Cloud |
| **Patronus AI** | Commercial | Generative simulators, HaluBench, agent stress-test environments; $50M Series B (Jun 2026) |

**Consolidation**: eight evaluation/observability companies have been acquired since March 2025 — Weights & Biases → CoreWeave (~$1.7B, Mar 2025), Velvet → Arize (Mar 2025), Humanloop → Anthropic (Aug 2025), Statsig → OpenAI ($1.1B, Sep 2025), Langfuse → ClickHouse (Jan 2026), Helicone → Mintlify (Mar 2026), Promptfoo → OpenAI (Mar 2026), and Galileo → Cisco (Apr 2026) — capped by Dynatrace's announced $915M acquisition of Arize itself (Aug 2026), the largest deal in the category to date.

### 5.5 Production Evaluation Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  Production Evaluation Flow                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. CAPTURE                2. EVALUATE              3. ITERATE   │
│  ┌─────────────┐          ┌─────────────┐         ┌───────────┐ │
│  │ Production  │          │ Async Eval  │         │ Feedback  │ │
│  │   Traces    │─────────▶│   Workers   │────────▶│   Loop    │ │
│  └─────────────┘          └─────────────┘         └───────────┘ │
│        │                        │                       │        │
│        │                        │                       │        │
│        ▼                        ▼                       ▼        │
│  ┌─────────────┐          ┌─────────────┐         ┌───────────┐ │
│  │   Span +    │          │   Quality   │         │  Prompt   │ │
│  │  Metadata   │          │   Scores    │         │ Iteration │ │
│  └─────────────┘          └─────────────┘         └───────────┘ │
│                                                                  │
│  Promote interesting traces to evaluation datasets               │
└─────────────────────────────────────────────────────────────────┘
```

### 5.6 Hallucination Detection Challenges

Research (arXiv:2504.18114, arXiv:2510.06265, arXiv:2509.18970) reveals ongoing limitations:

- Metrics often fail to align with human judgments (arXiv:2504.18114)
- Inconsistent gains with model parameter scaling
- Agent-specific hallucination modes: tool call hallucinations, planning hallucinations, memory retrieval hallucinations (arXiv:2509.18970)
- Attribution remains ambiguous: prompt strategy vs. intrinsic model behavior (Frontiers in AI, 2025)
- Benchmarks continue evolving: HaluLens (ACL 2025), PsiloQA (14-language span-level detection, extended beyond document grounding by arXiv:2607.00895, July 2026); 2026 additions include TRIVIA+ (longest-context samples, arXiv:2605.11330), OpenHalDet (unified multi-scenario, arXiv:2606.06959), and HalluAudio (multimodal audio extension, arXiv:2604.19300)
- Benchmark methodology itself is under fire: PARALLAX (arXiv:2605.17028) found 4 of 6 prior hallucination corpora leak the ground-truth answer into the input prompt, and human-adjudicated re-scoring (arXiv:2605.08462) suggests earlier benchmarks understated detector accuracy by 6-8%
- Real-time evaluation economically viable: Luna-2 achieves sub-200ms on L4 GPUs with batched metrics, >80x cost reduction vs LLM-judge baselines (arXiv:2602.18583). Pricing caveat: the widely-repeated "$175/1M queries" figure traces to a June 2024 VentureBeat article about the *original* Luna, not Luna-2; Galileo's current public pricing is tiered (free / $100/mo / custom-enterprise) with no per-query list price

---

## 6. Implementation Reference: What Full Conformance Requires

### 6.1 Scope of Conformance

Conformance to the GenAI conventions is not a single threshold but four largely independent ones,
and a system may satisfy any of them without satisfying the others. Attribute conformance concerns
what is recorded on an individual span. Agent and tool conformance concerns the relationships
between spans. Metric conformance concerns aggregate series and, critically, their bucket
boundaries. Evaluation conformance concerns a signal class that most observability backends have
no prior notion of. This section sets out what each requires in practice.

### 6.2 Attribute Conformance

The minimum bar is the required and conditionally required set described in Section 3, and
implementations reach it by populating fields the instrumentation layer already holds at the point
of emission. Two details separate a conformant implementation from a superficially conformant one.

The first is provider resolution. `gen_ai.provider.name` superseded earlier spellings, and
telemetry in the wild still carries the older ones. A conformant implementation resolves provider
identity through an explicit fallback chain rather than reading a single field, because a reader
that assumes one spelling will silently drop provider attribution for every span emitted by an
older instrumentation library.

The second is the treatment of recommended attributes whose availability varies by provider. The
cache-token attributes added in v1.40.0 are the clearest case: they are absent from many providers'
responses entirely. They should be stored opportunistically when present and never required, since
treating a recommended attribute as mandatory rejects otherwise-valid telemetry. The cost of
getting this wrong is not a missing field but systematically overstated spend, because cache reads
are priced at a fraction of standard input tokens.

| Attribute | Level | Conformance requirement |
|---|---|---|
| `gen_ai.operation.name` | Required | Populate on every span; use the specification's seven operation values |
| `gen_ai.provider.name` | Required | Resolve through a fallback chain, not a single field |
| `gen_ai.request.model` | Conditional | Populate when known at request time |
| `gen_ai.conversation.id` | Conditional | Populate when a conversation context exists |
| `error.type` | Conditional | Populate on failure paths only |
| `gen_ai.usage.*_tokens` | Recommended | Populate when the provider returns counts |
| `gen_ai.usage.cache_*.input_tokens` | Recommended (v1.40.0) | Store opportunistically; never require |

### 6.3 Agent and Tool Conformance

Agent conformance is structurally harder than attribute conformance because it is a property of
relationships rather than of individual records. An `invoke_agent` span must parent the `chat` and
`execute_tool` spans produced during that invocation, and the correlation must survive process
boundaries and asynchronous lifetimes.

Two practical constraints recur. First, the conventions offer conversation identity but no notion
of a working session spanning multiple conversations; implementations needing one must supply it
themselves, accepting that this dimension will not be portable. Second, tool-call duration is
frequently not observable from the live event stream, because the event marking a call's completion
often carries no duration and the call's start may have been emitted by a different process.
Implementations commonly reconstruct these intervals after the fact from an execution record rather
than measuring them in flight, and teams should evaluate both paths rather than assuming the
streaming one is available.

Where agent-level metrics are emitted rather than derived, a conformant reader should distinguish
measured values from reconstructed ones. Reporting which source produced a given figure costs
little and is the difference between a diagnosable metric and a plausible one.

### 6.4 Metric and Histogram Conformance

Token usage and operation duration are histograms, and the single most consequential conformance
detail in this category is bucket boundaries. The conventions specify boundary sets because a
duration histogram carrying default, millisecond-shaped boundaries places an entire seconds-valued
distribution in its first bucket — a metric that is present, queryable, and analytically worthless.
Boundaries cannot be corrected cheaply after the fact, since changing them invalidates historical
series, so this is a decision to get right at instrumentation time.

Exponential histograms are the appropriate representation where distributions have long tails and
fixed boundaries lose resolution precisely where it matters. Support for them is uneven across
backends and should be confirmed before adoption.

The server-side metrics — time to first token and time per output token — belong to a different
category and are a common source of confusion. The conventions define them as signals emitted by
model-hosting infrastructure. A client positioned outside that infrastructure has no observation
point at which first-token latency can be measured, and any value synthesised at the client layer
describes the client's own buffering rather than the model service. Conformant clients store these
metrics when they arrive over OTLP and do not attempt to derive them.

### 6.5 Evaluation Conformance

The evaluation layer has the least settled conventions and the most design freedom, which makes
disciplined choices more rather than less important. Three properties distinguish an evaluation
store that remains trustworthy as it grows.

Scores must carry their unit, and aggregation must refuse to average across incompatible units
rather than silently coercing them. A store mixing a 0–1 ratio with a 1–5 Likert scale under one
metric name produces averages that are arithmetically valid and semantically meaningless.

Scores must carry their provenance — which evaluator produced them, by what method, and against
what version of the evaluation prompt or rule. Without this, a shift in a quality metric cannot be
distinguished from a change in how quality was measured.

Cheap deterministic signals must be separable from expensive model-graded ones. The first tier can
run on every interaction; the second must be sampled under a budget. Keeping them distinct is what
permits the expensive tier to be sampled, re-run, or replaced without invalidating the cheap tier.

### 6.6 A Conformance Checklist

A system may be assessed against the following, in the order given, since each tier is cheaper than
the one after it and independently valuable:

1. Required and conditionally required attributes are populated on every span, with provider
   identity resolved through a fallback chain.
2. Recommended attributes are stored opportunistically and never required.
3. Agent invocations parent their inference and tool spans, and the correlation survives process
   boundaries.
4. Histograms use the specified bucket boundaries; server-side metrics are stored rather than
   derived.
5. Evaluation records carry unit and provenance, and aggregation refuses incompatible units.
6. The attribute vocabulary is isolated behind a single translation layer, so a specification
   change is a localised edit.

---

## 7. Discussion: Implications for Implementers

![Four conformance tiers stacked from cheapest to most expensive: attribute conformance, metrics and histograms, agent and tool semantics, and the evaluation layer.](/assets/images/llm-obs-2026-fig6-adoption-order.png)
{: .align-center}

*Figure 4 — the four tiers ordered by cost, which is the order in which they should be attempted.*


The conformance tiers set out in Section 6 differ sharply in cost, and that difference — rather
than any architectural preference — is what should govern the order in which a team attempts them.
The sequence below reflects the cost structure common to implementations of the GenAI conventions,
and offers a reasonable prior for what to attempt first.

Attribute-level conformance proved to be the cheapest and most consequential step. Emitting
`gen_ai.operation.name`, resolving a provider identity through a documented fallback chain, and
capturing request and response model identifiers required no architectural change; each is a
matter of populating fields that the instrumentation layer already has in hand at the point of
emission. The payoff is disproportionate, because conformant attributes are what make telemetry
portable between backends. An implementation that emits the standard attribute set can change
observability vendors, or export to several concurrently, without re-instrumenting. One that
invents its own attribute vocabulary cannot, and the cost of that divergence compounds with every
additional span type.

Aggregation and histogram support occupied a middle tier of cost. Percentile and rate aggregation
are straightforward once a metrics pipeline exists, but histograms introduce a subtlety that
repeatedly catches implementers: bucket boundaries must be chosen to match the distribution being
measured. The GenAI conventions specify boundary sets precisely because a duration histogram
carrying default, millisecond-shaped boundaries will place an entire seconds-valued distribution
in its first bucket, producing a metric that is technically present and analytically worthless.
Adopting the specified boundaries costs nothing at instrumentation time and cannot be retrofitted
cheaply, since changing boundaries invalidates historical series.

Agent and tool semantics proved substantially more expensive than either, and for a structural
reason. Attribute conformance is a property of a single span, whereas agent observability is a
property of the relationships between spans — an invocation must be correlated with the tool calls
it spawned, across process boundaries and often across asynchronous lifetimes. The implementation
studied here ultimately derived its agent metrics from a bounded read of each agent's own
transcript at termination, rather than from the live event stream, precisely because the streaming
path offered no reliable point at which a tool call's duration could be observed. This is a
recurring pattern: agent-level signals are frequently easier to reconstruct after the fact than to
instrument in flight, and implementers should evaluate both paths before committing.

The quality and evaluation layer was the most expensive of all, and its cost is qualitatively
different. The preceding categories are engineering problems with determinate answers; evaluation
is a measurement-design problem in which the principal risk is producing numbers that look
authoritative but measure nothing stable. The durable answer is to separate
cheap deterministic signals from expensive model-graded ones, sampling the latter under an explicit
budget, and retaining provenance for every score so that a metric's basis remains inspectable.
That separation matters more than the particular judging technique chosen, because it is what
permits the expensive tier to be sampled, re-run, or replaced without invalidating the cheap tier
that runs on every interaction.

Two limitations of this analysis deserve emphasis. First, the observed sequence reflects the
constraints of one deployment context — a coding-agent workload with access to local transcripts —
and an implementation without that access would face a different ordering, particularly for agent
metrics. Second, the evaluation measures conformance to a specification that remains formally
unstable: as Section 3 records, the GenAI conventions carry Development status and the
`semantic-conventions-genai` repository has issued no tagged release. Conformance to a moving
specification is a claim with a short half-life, and the practical implication for implementers is
to isolate the attribute vocabulary behind a single translation layer rather than distributing
literal attribute names throughout an instrumentation codebase.

---

## 8. Future Research Directions

### 8.1 Emerging Standards

1. **MCP Semantic Conventions**: OTel defines MCP client/server spans (`mcp.client.operation.duration`, `mcp.server.operation.duration`), session metrics, and attributes (`mcp.method.name`, `mcp.session.id`). Status: Development, now maintained in the `semantic-conventions-genai` repo alongside agent conventions — unifying the trace vocabulary. Active churn continues: a July 2026 SIG issue tracks aligning the conventions with the MCP protocol's own 2026-07-28 spec revision.
2. **Agentic System Semantics**: OTel GenAI SIG working on common conventions covering IBM Bee Stack, wxFlow, CrewAI, AutoGen, and LangGraph. Key blocker: promoting from Development to Experimental requires broader implementation evidence — as of August 2026 the `semantic-conventions-genai` repo has no tagged release and nothing has graduated.
3. **Multi-Agent Coordination**: Failures unique to MAS (coordination breakdowns, conflicting tool usage, emergent behaviors) require parent-agent spans referencing child-agent spans across service boundaries. No consensus convention yet.
4. **AI/Observability Convergence**: Industry prediction (Dynatrace 2026): the distinction between "AI observability" and traditional observability collapses — unified view across AI components, application logic, and cloud infrastructure.

### 8.2 Quality Measurement Evolution

1. **Real-time evaluation at scale**: Galileo Luna-2 achieves sub-200ms eval on L4 GPUs with batched metrics (>80x cheaper than LLM-judge baselines; no public per-query price — the old "$175/1M" figure belongs to the 2024 original Luna); teams now run real-time guardrails and batch analysis concurrently
2. **DAG-based evaluation**: DeepEval's DAG metric enables fully deterministic, customizable LLM-powered decision trees — bridging rule-based and LLM-judge approaches
3. **Agent-specific benchmarks**: tau-bench, superseded by the actively-maintained tau2-bench (v1.0.0, Mar 2026, shipped 75+ task fixes; v1.0.1, Jul 2026, fixed banking_knowledge grading), Terminal-Bench (sandboxed CLI, now the de facto terminal-agent standard), DPAI Arena (multi-language coding), SWE-Bench family (Verified, Multilingual, Multimodal; UTBoost proposes more rigorous scoring)
4. **Automated regression detection**: Braintrust and DeepEval now gate CI/CD deployments on statistical quality regression thresholds
5. **Eval-cost methodology**: 2026 meta-papers ("Efficient Benchmarking of AI Agents" arXiv:2603.23749, "General Agent Evaluation" arXiv:2602.22953) target cheaper, more general agent evaluation as eval costs become a first-order concern

### 8.3 Cost Optimization

1. **Cache token observability**: OTel v1.40.0 adds `gen_ai.usage.cache_read.input_tokens` and `gen_ai.usage.cache_creation.input_tokens` for Anthropic/OpenAI prompt caching cost tracking
2. **Agentic cost attribution**: Tracing cost back through 10+ tool calls to an initiating user intent remains an unsolved UX problem across platforms
3. **Reasoning token gap**: Most teams still have zero tracking on reasoning token costs (chain-of-thought, extended thinking)
4. **Tag-based spending**: Budget alerts and trend analysis by user/feature/team/model now table-stakes in enterprise platforms

### 8.4 Privacy and Compliance

1. **EU AI Act timeline**: Prohibited practices active (Feb 2025), GPAI obligations active (Aug 2025). **The Digital Omnibus passed** — Regulation (EU) 2026/1744, in force 2026-07-27 — delaying stand-alone high-risk (Annex III) obligations from Aug 2026 to **Dec 2, 2027** and product-embedded (Annex I) to **Aug 2, 2028**. Article 50 transparency obligations (AI-interaction disclosure, AI-content labeling) were **not** delayed and took effect on schedule Aug 2, 2026 (watermarking for pre-existing systems gets a grace period to Dec 2, 2026). The Omnibus also added two Article 5 prohibitions and reinforced AI Office enforcement powers.
2. **Compliance artifacts**: High-risk systems must produce evidence packs capturing prompts, model versions, human-in-the-loop actions, guardrail events. Driving demand for immutable trace storage and OCSF audit logs (LangSmith, Datadog already shipping).
3. **Content redaction pipelines**: OTel Collector processors for PII removal
4. **Differential privacy**: Aggregated telemetry without individual exposure

---

## 9. Conclusion

The standardisation of LLM observability is further advanced than it appears from the outside and
less settled than its adopters generally assume. The OpenTelemetry GenAI conventions now supply a
usable vocabulary for the operations that matter — model invocation, agent execution, tool calls,
and evaluation results — and the major observability platforms have converged on ingesting it.
That convergence is the principal development of the period surveyed, and it changes the economics
of instrumentation: telemetry emitted against the standard vocabulary is portable, and telemetry
emitted against a proprietary one is not.

The conventions nevertheless remain formally unstable. At the time of writing the GenAI conventions
carry Development status, the repository that houses them has issued no tagged release, and the
agent-level semantics are the least settled part of the specification. Implementers should
therefore treat conformance as a moving target and isolate the attribute vocabulary behind a single
translation layer, so that a specification change is a localised edit rather than a distributed one.

Three findings recur across implementations. First, attribute-level
conformance is cheap and disproportionately valuable, and should be completed before any more
ambitious instrumentation is attempted. Second, agent-level signals are frequently easier to
reconstruct after the fact than to capture in flight, and implementers should evaluate both paths
rather than assuming the streaming one. Third, the evaluation layer's principal risk is not
technical but methodological: separating cheap deterministic signals from expensive model-graded
ones, and retaining provenance for both, matters more than the choice of judging technique.

The gap that remains most consequential is not instrumentation coverage but evaluation adoption.
Organisations that have invested in tracing overwhelmingly have not invested in measuring output
quality, which leaves them able to observe that a system is running without being able to observe
whether it is working. Closing that gap is the substantive work ahead, and the conventions now
provide enough of a foundation to attempt it.

---

## 10. References

### 9.1 OpenTelemetry Specifications

1. OpenTelemetry. "Semantic conventions for generative AI systems." https://opentelemetry.io/docs/specs/semconv/gen-ai/ (Accessed February 2026)

2. OpenTelemetry. "Semantic conventions for generative client AI spans." https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/ (Accessed February 2026)

3. OpenTelemetry. "Semantic conventions for generative AI metrics." https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-metrics/ (Accessed February 2026)

4. OpenTelemetry. "Gen AI Registry Attributes." https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/ (Accessed February 2026)

5. OpenTelemetry. "Semantic conventions for MCP." https://opentelemetry.io/docs/specs/semconv/gen-ai/mcp/ (Accessed February 2026)

6. OpenTelemetry. "Semantic conventions for GenAI agent spans." https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans/ (Accessed February 2026)

6a. OpenTelemetry. `semantic-conventions-genai` repository (GenAI/agent/MCP conventions since v1.42.0). https://github.com/open-telemetry/semantic-conventions-genai (Accessed August 2026; zero tagged releases)

### 9.2 Industry Publications

7. Liu, G. & Solomon, S. "AI Agent Observability - Evolving Standards and Best Practices." OpenTelemetry Blog, March 2025. https://opentelemetry.io/blog/2025/ai-agent-observability/

8. Jain, I. "An Introduction to Observability for LLM-based applications using OpenTelemetry." OpenTelemetry Blog, June 2024. https://opentelemetry.io/blog/2024/llm-observability/

9. Datadog. "Datadog LLM Observability natively supports OpenTelemetry GenAI Semantic Conventions." December 2025. https://www.datadoghq.com/blog/llm-otel-semantic-convention/

10. Datadog. "MCP Client Monitoring." 2025. https://www.datadoghq.com/blog/mcp-client-monitoring/

11. Horovits, D. "OpenTelemetry for GenAI and the OpenLLMetry project." Medium, November 2025. https://horovits.medium.com/opentelemetry-for-genai-and-the-openllmetry-project-81b9cea6a771

12. Databricks. "MLflow 3.0: Unified AI Experimentation, Observability, and Governance." June 2025. https://www.databricks.com/blog/mlflow-30-unified-ai-experimentation-observability-and-governance

### 9.3 Evaluation and Quality

13. Confident AI. "LLM Evaluation Metrics: The Ultimate LLM Evaluation Guide." https://www.confident-ai.com/blog/llm-evaluation-metrics-everything-you-need-for-llm-evaluation (Accessed February 2026)

14. DeepEval. "Hallucination Metric Documentation." https://deepeval.com/docs/metrics-hallucination (Accessed February 2026)

15. "Evaluating Evaluation Metrics -- The Mirage of Hallucination Detection." arXiv:2504.18114, 2025.

16. "Large Language Models Hallucination: A Comprehensive Survey." arXiv:2510.06265, October 2025.

17. "LLM-based Agents Suffer from Hallucinations: A Survey of Taxonomy, Methods, and Directions." arXiv:2509.18970, September 2025.

18. "Establishing Best Practices for Building Rigorous Agentic Benchmarks." arXiv:2507.02825, July 2025.

### 9.4 Tools and Frameworks

19. Langfuse. "OpenTelemetry (OTel) for LLM Observability." https://langfuse.com/blog/2024-10-opentelemetry-for-llm-observability (Accessed February 2026)

20. Traceloop. "OpenLLMetry: Open-source observability for GenAI." https://github.com/traceloop/openllmetry (Accessed February 2026)

21. Anthropic. "Building effective agents." https://www.anthropic.com/research/building-effective-agents (Accessed February 2026)

22. Sierra AI. "Benchmarking AI Agents." https://sierra.ai/blog/benchmarking-ai-agents (Accessed February 2026)

### 9.5 August 2026 Update Sources

23. ClickHouse. "ClickHouse acquires Langfuse." January 2026. https://clickhouse.com/blog/clickhouse-acquires-langfuse-open-source-llm-observability

24. Cisco. "Cisco Announces Intent to Acquire Galileo." April 2026. https://blogs.cisco.com/news/cisco-announces-the-intent-to-acquire-galileo

25. Palo Alto Networks. "Palo Alto Networks Completes Acquisition of Portkey." May 2026. https://investors.paloaltonetworks.com/news-releases/news-release-details/palo-alto-networks-completes-acquisition-portkey-secure-ai

26. European Commission. "Regulatory framework for AI" (Regulation (EU) 2026/1744, Digital Omnibus on AI). https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai (Accessed August 2026)

27. TechCrunch. "Patronus AI lands $50M to build digital worlds that stress-test AI agents." June 2026. https://techcrunch.com/2026/06/25/patronus-ai-lands-50m-to-build-digital-worlds-that-stress-test-ai-agents/

28. Datadog. "DASH 2026 new feature roundup." June 2026. https://www.datadoghq.com/blog/dash-2026-new-feature-roundup-keynote/

29. "Rethinking Evaluation for LLM Hallucination Detection" (TRIVIA+). arXiv:2605.11330, May 2026.

30. "PARALLAX: Benchmark leakage in hallucination detection corpora." arXiv:2605.17028, May 2026.

31. "Luna-2: Scalable Single-Token Evaluation with Small Language Models." arXiv:2602.18583, February 2026.

32. Dynatrace. "Dynatrace to Acquire AI Observability Leader Arize" ($915M). August 13, 2026. https://ir.dynatrace.com/news-events/press-releases/detail/435/dynatrace-to-acquire-ai-observability-leader-arize

33. Braintrust. "Announcing our Series B" ($80M, ICONIQ-led). February 17, 2026. https://www.braintrust.dev/blog/announcing-series-b

34. OpenTelemetry. `gen_ai.evaluation.result` event definition. `semantic-conventions-genai`, `model/gen-ai/events.yaml`. https://github.com/open-telemetry/semantic-conventions-genai/blob/main/model/gen-ai/events.yaml (Accessed August 2026; stability: development)

35. "Beyond Document Grounding" (PsiloQA extension). arXiv:2607.00895, July 2026.

36. Sierra Research. tau2-bench releases v1.0.0 (March 2026) and v1.0.1 (July 2026). https://github.com/sierra-research/tau2-bench/releases

37. Consolidation sources: CoreWeave/W&B ([TechCrunch, Mar 2025](https://www.techcrunch.com/2025/03/04/coreweave-acquires-ai-developer-platform-weights-biases/)); Arize/Velvet ([SiliconANGLE, Mar 2025](https://siliconangle.com/2025/03/13/arize-ai-acquires-velvet-expand-support-ai-observability-llm-evaluation/)); Anthropic/Humanloop ([TechCrunch, Aug 2025](https://techcrunch.com/2025/08/13/anthropic-nabs-humanloop-team-as-competition-for-enterprise-ai-talent-heats-up)); OpenAI/Statsig ([TechCrunch, Sep 2025](https://techcrunch.com/2025/09/02/openai-acquires-product-testing-startup-statsig-and-shakes-up-its-leadership-team/)); Mintlify/Helicone ([Mintlify blog, Mar 2026](https://www.mintlify.com/blog/mintlify-acquires-helicone)); OpenAI/Promptfoo ([OpenAI, Mar 2026](https://openai.com/index/openai-to-acquire-promptfoo/))

---

## 11. Appendices

### Appendix A: Quality Evaluation Layer

> **Status**: Phases 4a-4d + Quality Library + Cloud Infrastructure + Hooks Hardening implemented (v2.26, February 2026)

This appendix examines industry standards, implementation patterns, and integration approaches for LLM and agent quality assessment.

**Deep Dive Architecture Guides**:
- *LLM-as-Judge Architecture* - G-Eval, QAG, bias mitigation, production utilities
- *Agent-as-Judge Architecture* - Multi-agent collaboration, tool-augmented verification, agent metrics

---

#### A.1 The Quality Observability Imperative

Traditional observability measures system health through latency, throughput, and error rates. For LLM applications, these metrics can paint a misleading picture: a system may exhibit excellent performance metrics while consistently producing hallucinated, irrelevant, or harmful outputs.

**Industry Statistics (LangChain State of AI Agents, Dec 2025):**
- 89% of teams have implemented observability for agents
- Only 52% have implemented evaluations
- 40% of data + AI teams now have agents running in production
- Organizations use a hybrid approach: LLM-as-judge (53.3%) + human review (59.8%)

This gap between observability adoption and evaluation adoption represents a critical blind spot.

#### A.2 OpenTelemetry Evaluation Event Convention

The OpenTelemetry GenAI semantic conventions (introduced v1.39.0; since June 2026 maintained in the `semantic-conventions-genai` repo — spec source: `model/gen-ai/events.yaml`, stability `development`, requirement level `recommended`) define a standardized event for capturing evaluation results:

**Event Name**: `gen_ai.evaluation.result`

| Attribute | Requirement | Type | Description | Example |
|-----------|-------------|------|-------------|---------|
| `gen_ai.evaluation.name` | Required | string | Evaluation metric name | `Relevance`, `Faithfulness` |
| `gen_ai.evaluation.score.value` | Cond. Required | double | Numeric score | `4.0`, `0.85` |
| `gen_ai.evaluation.score.label` | Cond. Required | string | Human-readable interpretation | `relevant`, `pass`, `fail` |
| `gen_ai.evaluation.explanation` | Recommended | string | Free-form reasoning | "Response is accurate but lacks detail" |
| `gen_ai.response.id` | Recommended | string | Correlation to evaluated response | `chatcmpl-123` |
| `error.type` | Cond. Required | string | Error class if evaluation failed | `timeout`, `rate_limit` |

**Span Parenting**: The evaluation event SHOULD be parented to the GenAI operation span being evaluated. When span ID is unavailable, `gen_ai.response.id` provides correlation.

```
Trace: Customer Support Query
├── Span: invoke_agent CustomerSupportBot
│   ├── Span: chat claude-3-opus
│   │   └── Event: gen_ai.evaluation.result
│   │       ├── gen_ai.evaluation.name: "Relevance"
│   │       ├── gen_ai.evaluation.score.value: 0.92
│   │       ├── gen_ai.evaluation.score.label: "relevant"
│   │       └── gen_ai.evaluation.explanation: "Response directly addresses query"
│   │
│   └── Span: execute_tool lookup_customer
│       └── Event: gen_ai.evaluation.result
│           ├── gen_ai.evaluation.name: "ToolCorrectness"
│           └── gen_ai.evaluation.score.label: "pass"
```

#### A.3 LLM-as-Judge Pattern

The dominant approach for automated quality evaluation uses an LLM (the "judge") to assess outputs from another LLM (the "subject").

**Cost-Quality Tradeoff:**
- Human evaluation: High accuracy, $$$, doesn't scale
- LLM-as-judge: 500x-5000x cost reduction, 80% agreement with human preferences
- Research indicates: GPT-4 as judge matches human-to-human agreement rates (~81%)

**Known Biases:**

| Bias Type | Description | Mitigation |
|-----------|-------------|------------|
| **Position Bias** | 40% inconsistency when response order changes | Randomize presentation order |
| **Verbosity Bias** | ~15% score inflation for longer responses | Normalize for length |
| **Self-Enhancement** | Models favor their own outputs | Use different model as judge |
| **Style Matching** | Preference for similar writing styles | Use diverse judge models |

**Implementation Pattern:**

```
┌─────────────────────────────────────────────────────────────────┐
│                     LLM-as-Judge Pipeline                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Production Call                    Async Evaluation            │
│   ┌──────────┐                      ┌──────────────────┐        │
│   │  Input   │──────────────────────│  Judge Model     │        │
│   └────┬─────┘                      │  (GPT-4/Claude)  │        │
│        │                            └────────┬─────────┘        │
│        ▼                                     │                   │
│   ┌──────────┐    ┌──────────┐              ▼                   │
│   │ Subject  │───▶│  Output  │───────▶┌──────────────────┐      │
│   │  Model   │    └──────────┘        │ Evaluation Scores │      │
│   └──────────┘                        │ • relevance: 0.85 │      │
│                                       │ • faithful: 0.92  │      │
│   Optional Context:                   │ • halluc: 0.08    │      │
│   • Retrieved documents               └──────────────────┘      │
│   • Conversation history                                         │
│   • Ground truth (if available)                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### A.4 Agent-as-a-Judge: Evaluating Agent Quality

A newer paradigm emerging in 2025-2026 addresses the unique challenges of evaluating agentic systems.

**Why Standard LLM-as-Judge Falls Short for Agents:**
- Agents have multi-step execution with intermediate states
- Tool calls introduce external system interactions
- Success depends on task completion, not just response quality
- Reasoning chains may be valid even if final output differs

**Agent-as-a-Judge Architecture:**

The judge agent is endowed with similar capabilities as the subject agent:
- **Observation**: Can inspect intermediate steps and action logs
- **Tool Access**: Can verify tool calls against expected behavior
- **Parallel Execution**: Monitors decisions at each step in real-time
- **Granular Feedback**: Identifies which requirements were met/missed

```
┌─────────────────────────────────────────────────────────────────┐
│                    Agent-as-a-Judge Evaluation                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Subject Agent Execution          Judge Agent (Parallel)       │
│   ┌─────────────────────┐         ┌─────────────────────┐       │
│   │ Step 1: Reasoning   │◀───────▶│ Evaluate: Reasoning │       │
│   └─────────┬───────────┘         └─────────────────────┘       │
│             │                              │                     │
│   ┌─────────▼───────────┐         ┌───────▼─────────────┐       │
│   │ Step 2: Tool Call   │◀───────▶│ Evaluate: Tool Args │       │
│   │ get_customer(id=42) │         │ ✓ Correct tool      │       │
│   └─────────┬───────────┘         │ ✓ Valid parameters  │       │
│             │                     └─────────────────────┘       │
│   ┌─────────▼───────────┐         ┌─────────────────────┐       │
│   │ Step 3: Response    │◀───────▶│ Evaluate: Task Done │       │
│   └─────────────────────┘         │ Score: 0.94         │       │
│                                   │ "Goal achieved"      │       │
│                                   └─────────────────────┘       │
│                                                                  │
│   Output: Step-by-step evaluation with pinpointed feedback      │
└─────────────────────────────────────────────────────────────────┘
```

#### A.5 Core Agent Evaluation Metrics

| Metric | Scope | Type | Description |
|--------|-------|------|-------------|
| **Task Completion** | End-to-end | Single-turn | Did agent achieve stated goal? |
| **Argument Correctness** | Component | LLM-as-judge | Were tool parameters valid? |
| **Tool Correctness** | End-to-end | Reference-based | Were correct tools selected? |
| **Conversation Completeness** | End-to-end | Multi-turn | Did multi-turn agent satisfy user? |
| **Turn Relevancy** | End-to-end | Multi-turn | Did agent stay on track? |
| **Handoff Correctness** | Component | Multi-agent | Was agent delegation appropriate? |

**Single-Turn vs Multi-Turn Distinction:**

```
Single-Turn Agent:
┌─────────────────────────────────────────────────────┐
│  Input ────▶ Agent Execution ────▶ Output          │
│              (one interaction)                       │
│                                                      │
│  Metrics: Task Completion, Tool Correctness         │
└─────────────────────────────────────────────────────┘

Multi-Turn Agent:
┌─────────────────────────────────────────────────────┐
│  Turn 1: User ─▶ Agent ─▶ Response                  │
│  Turn 2: User ─▶ Agent ─▶ Response                  │
│  Turn N: User ─▶ Agent ─▶ Response                  │
│                                                      │
│  Component Metrics: Same as single-turn per turn    │
│  End-to-End Metrics: Conversation Completeness,     │
│                      Turn Relevancy                 │
└─────────────────────────────────────────────────────┘
```

**Important**: Internal agent-to-agent calls (swarms, handoffs) do NOT count as turns. Only end-user interactions define turn boundaries.

#### A.6 Evaluation Tool Landscape (August 2026)

| Tool | Type | OTel Support | Key Differentiator |
|------|------|--------------|------------------- |
| **Langfuse** | Open Source (MIT, ~34k stars; ClickHouse-owned since Jan 2026) | Native OTLP | Tracing + evals + prompt mgmt, Python SDK v4 / TS SDK v5 OTel-native |
| **DeepEval** | Open Source (Apache, 18k+ stars) | Via Confident AI | 50+ metrics, DAG metric, CI/CD pytest-native, v4.2.0 + TS SDK |
| **Arize Phoenix** | Open Source (ELv2, 11.2k+ stars) | OTLP first-class | Agent flowcharts, evals-as-experiments, v20.4.0 |
| **MLflow** | Open Source (Apache, 27.7k+ stars) | Partial | 20+ lib tracing, Mosaic AI judges, Databricks-backed, v3.15.x |
| **Opik** | Open Source (Apache, 21.7k+ stars) | Yes | 40M+ traces/day, hallucination/moderation evals |
| **Confident AI** | Commercial | DeepEval-powered | Cloud platform, human feedback, 20M+ daily evals |
| **Datadog LLM Obs** | Commercial | Native GenAI | MCP monitoring, agent console, Patterns clustering, cost attribution |
| **LangSmith** | Commercial | Yes (end-to-end OTel export) | Insights failure clustering, unified agent cost view, OCSF audit logs |
| **Galileo** | Commercial (Cisco/Splunk since Apr 2026) | No | Luna-2 sub-200ms eval, agent reliability platform |
| **Patronus AI** | Commercial | No | Generative simulators, HaluBench, agent stress-test environments |
| **Braintrust** | Commercial | Custom | Eval datasets, CI/CD gates, 100+ model proxy |

**Langfuse OpenTelemetry Integration:**

Langfuse operates as an OpenTelemetry backend:
- Receives traces on `/api/public/otel` (OTLP endpoint)
- SDK v3 is OTel-native (thin wrapper on official OTel client)
- Supports GenAI semantic conventions with attribute mapping
- Enables multi-destination export (not locked to Langfuse)

```
OTEL_EXPORTER_OTLP_ENDPOINT="https://cloud.langfuse.com/api/public/otel"
OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic ${AUTH_STRING}"
```

#### A.7 Production Evaluation Architecture

![Four ascending steps labelled Level 1 Ad-hoc, Level 2 Offline, Level 3 Asynchronous Online and Level 4 Continuous, each listing its defining practices.](/assets/images/llm-obs-2026-fig5-maturity.png)
{: .align-center}

*Figure 5 — the evaluation maturity model, from manual spot-checking to continuous real-time guardrails.*


**Maturity Model:**

| Level | Approach | Frequency | Characteristics |
|-------|----------|-----------|-----------------|
| 1 | Ad-hoc | Manual | Spot-checking, no automation |
| 2 | Offline | Pre-deploy | Golden datasets, CI/CD gates |
| 3 | Online | Async | Production sampling, drift detection |
| 4 | Continuous | Real-time | Every request evaluated, alerts |

**High-Performing Team Schedule:**
- **Weekly**: Health checks on latency, cost, error rates
- **Monthly**: Deep dives on goal fulfillment, user satisfaction
- **Quarterly**: Comprehensive regression testing, model tuning

**Production Flow:**

```
┌─────────────────────────────────────────────────────────────────┐
│              Production Evaluation Pipeline                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. CAPTURE           2. EVALUATE           3. FEEDBACK LOOP    │
│  ┌───────────────┐   ┌───────────────┐    ┌───────────────┐    │
│  │ Production    │   │  Async Eval   │    │   Alerting    │    │
│  │ Traces + Logs │──▶│   Workers     │───▶│   + Triage    │    │
│  └───────────────┘   └───────────────┘    └───────────────┘    │
│         │                   │                    │               │
│         ▼                   ▼                    ▼               │
│  ┌───────────────┐   ┌───────────────┐    ┌───────────────┐    │
│  │ OTel Spans +  │   │ gen_ai.eval   │    │ Prompt/Model  │    │
│  │ Eval Events   │   │ .result       │    │  Iteration    │    │
│  └───────────────┘   │ Events        │    └───────────────┘    │
│                      └───────────────┘                          │
│                                                                  │
│  4. DATASET CURATION                                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Promote interesting traces → Golden evaluation datasets     │ │
│  │ • Failures for regression testing                          │ │
│  │ • Edge cases for robustness testing                        │ │
│  │ • High-quality examples for few-shot prompting             │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

#### A.8 References for Quality Evaluation

15. OpenTelemetry. "Semantic conventions for Generative AI events." https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-events/ (Accessed January 2026)

16. LangChain. "State of AI Agents." https://www.langchain.com/state-of-agent-engineering (Accessed January 2026)

17. Confident AI. "AI Agent Evaluation: The Definitive Guide." https://www.confident-ai.com/blog/definitive-ai-agent-evaluation-guide (Accessed January 2026)

18. Langfuse. "Open Source LLM Observability via OpenTelemetry." https://langfuse.com/integrations/native/opentelemetry (Accessed January 2026)

19. Spring. "LLM Response Evaluation with Spring AI: Building LLM-as-a-Judge." https://spring.io/blog/2025/11/10/spring-ai-llm-as-judge-blog-post/ (Accessed January 2026)

20. arXiv. "When AIs Judge AIs: The Rise of Agent-as-a-Judge Evaluation for LLMs." https://arxiv.org/html/2508.02994v1 (Accessed January 2026)

21. Monte Carlo. "LLM-As-Judge: 7 Best Practices & Evaluation Templates." https://www.montecarlodata.com/blog-llm-as-judge/ (Accessed January 2026)

---

## Revision History

| Edition | Date | Summary |
|---|---|---|
| 1.0 | 29 January 2026 | Initial publication: semantic conventions, agent observability, quality metrics, and a comparative evaluation. |
| 1.1–1.8 | Jan–Feb 2026 | Successive revisions extending the evaluation and quality-layer material; fact-check pass correcting platform metrics, pricing, and citation details. |
| 1.9–1.11 | 31 August 2026 | Industry-facing refresh to August 2026: specification versions, platform landscape, consolidation activity, regulatory status, and 2026 benchmark literature re-verified against primary sources. |
| 2.0 | 31 August 2026 | Restructured for publication as a vendor-neutral practitioner's guide. Status matrices, phase plans, product release history, and implementation logs replaced with analytic prose; Section 6 recast as conformance requirements stated independently of any product, and its forward-looking material as a discussion of implications (Section 7). |

---

*Cite as:* LLM Observability Best Practices: A Comparative Analysis, v2.0, August 2026.

