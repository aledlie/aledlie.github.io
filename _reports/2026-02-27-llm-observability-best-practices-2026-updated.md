---
layout: single
title: "Oservability Best Practices Update: February 27, 2026"
date: 2026-02-27
permalink: /reports/obs_best_practices_feb
author_profile: true
categories: [observability, ai-quality]
tags: [opentelemetry, llm-observability, genai-conventions, agent-tracking, quality-metrics, arize-phoenix, deepeval, langfuse]
excerpt: "Comprehensive white paper on LLM observability best practices covering OTel GenAI semantic conventions, agent tracking, quality evaluation frameworks, and the observability-toolkit MCP implementation through v2.26."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
---

**Session Date**: 2026-02-27<br>
**Project**: observability-toolkit MCP Server<br>
**Focus**: LLM observability standards, fact-check corrections, protobuf wire format update<br>
**Session Type**: Documentation Update

## LLM Observability Best Practices: A Comparative Analysis

**Technical White Paper v1.8**
**February 2026**

---

## Abstract

As Large Language Model (LLM) applications transition from experimental deployments to production-critical systems, the need for standardized observability practices has become paramount. This paper examines the current state of LLM observability standards, with particular focus on OpenTelemetry's emerging GenAI semantic conventions, agent tracking methodologies, and quality measurement frameworks. We evaluate the observability-toolkit MCP server against these industry standards, identifying alignment areas and gaps. This document serves as an index to deeper technical analyses across five key domains: semantic conventions, agent observability, quality metrics, performance optimization, and tooling ecosystem.

**Keywords:** LLM observability, OpenTelemetry, GenAI semantic conventions, agent tracking, AI quality metrics, distributed tracing

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Background: The Evolution of LLM Observability](#2-background-the-evolution-of-llm-observability)
3. [OpenTelemetry GenAI Semantic Conventions](#3-opentelemetry-genai-semantic-conventions)
4. [Agent Observability Standards](#4-agent-observability-standards)
5. [Quality and Evaluation Metrics](#5-quality-and-evaluation-metrics)
6. [Comparative Analysis: observability-toolkit MCP](#6-comparative-analysis-observability-toolkit-mcp)
7. [Recommendations and Roadmap](#7-recommendations-and-roadmap)
8. [Future Research Directions](#8-future-research-directions)
9. [References](#9-references)
10. [Appendices](#10-appendices)
    - [Appendix F: Quality Evaluation Layer](#appendix-f-quality-evaluation-layer) *(NEW)*

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

1. **Standardization**: OpenTelemetry GenAI semantic conventions (v1.40.0)
2. **Agent Tracking**: Multi-turn, tool-use, and reasoning chain observability
3. **Quality Measurement**: Production evaluation metrics beyond latency and throughput

### 1.3 Methodology

Research was conducted through:
- Analysis of OpenTelemetry specification documents (v1.40.0) and GitHub discussions
- Review of industry tooling (Langfuse, Arize Phoenix, DeepEval, MLflow, Datadog, LangSmith, Galileo, Patronus AI, Opik, W&B Weave)
- Examination of academic literature on hallucination detection and LLM/agent evaluation (2024-2026)
- Comparative analysis against the observability-toolkit MCP server implementation

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

The traditional observability pillars (metrics, traces, logs) require extension for LLM systems:

```
+-------------------------------------------------------------+
|                    LLM Observability Pillars                  |
+-----------------+-----------------+--------------------------+
|     TRACES      |     METRICS     |           LOGS           |
+-----------------+-----------------+--------------------------+
| - Prompt chains | - Token usage   | - Prompt/completion      |
| - Tool calls    | - Latency (TTFT)|   content                |
| - Agent loops   | - Cost per req  | - Error details          |
| - Retrieval     | - Quality scores| - Reasoning chains       |
+-----------------+-----------------+ - Human feedback          |
                          |                                    |
                          v                                    |
+-------------------------------------------------------------+
|                    EVALUATION LAYER (NEW)                     |
+-------------------------------------------------------------+
| - Hallucination detection    - Answer relevancy              |
| - Factual accuracy           - Task completion               |
| - Tool correctness           - Safety/toxicity               |
+-------------------------------------------------------------+
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
| Jan 2026 | observability-toolkit v1.8.0 | 10/10 OTel GenAI compliance |
| Jan 2026 | observability-toolkit v1.8.4 | OTel evaluation events support |
| Feb 2026 | observability-toolkit v1.8.6 | Langfuse OTLP export integration |
| Feb 2026 | observability-toolkit v1.8.9 | Confident AI integration |
| Feb 2026 | observability-toolkit v1.8.10 | Arize Phoenix + Datadog LLM Obs |
| Feb 2026 | observability-toolkit v2.0.0 | Quality library, LLM-as-Judge, Agent-as-Judge |
| Feb 2026 | observability-toolkit v2.10-v2.15 | Security hardening (90+ items), hooks robustness, CI/CD pipeline |
| Feb 2026 | observability-toolkit v2.16-v2.18 | Agent telemetry classification, dashboard hardening, ingest deploy |
| Feb 2026 | observability-toolkit v2.19-v2.21 | Naming conventions, KV sync hardening, session N+1 fix (8m->6s) |
| Feb 2026 | observability-toolkit v2.22-v2.23 | Cloud API/ingest workers (D1/R2), per-signal watermarks, input validation |
| Feb 2026 | observability-toolkit v2.24 | Hook stats persistence, webhook config CRUD, TOCTOU fixes |
| Feb 2026 | observability-toolkit v2.25 | Doc/code sync tests, sanitization OTel spans, security benchmarks |
| Feb 2026 | observability-toolkit v2.26 | Evaluation-hooks hardening, .tmp cleanup fix, crash-at-discovery guard |
| Feb 2026 | observability-toolkit v2.26+ | Phoenix protobuf wire format (`@bufbuild/protobuf`), hex validation, review backlog cleanup |

---

## 3. OpenTelemetry GenAI Semantic Conventions

> **Deep Dive Reference**: See [Appendix A: OTel GenAI Attribute Reference](#appendix-a-otel-genai-attribute-reference)

### 3.1 Overview

The OpenTelemetry GenAI semantic conventions (v1.40.0, agent spans remain Development status) establish a standardized schema for:

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
+-- chat                 # Chat completion (most common)
+-- text_completion      # Legacy completion API
+-- generate_content     # Multimodal generation
+-- embeddings           # Vector embeddings
+-- create_agent         # Agent instantiation
+-- invoke_agent         # Agent execution
+-- execute_tool         # Tool/function execution
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
+----------------------------------------------------------+
|  Span: gen_ai.operation.name = "chat"                    |
|  +-- gen_ai.input.messages.uri = "s3://bucket/msg/123"   |
|  +-- gen_ai.output.messages.uri = "s3://bucket/msg/124"  |
+----------------------------------------------------------+
```

---

## 4. Agent Observability Standards

> **Deep Dive Reference**: See [Appendix B: Agent Span Hierarchies](#appendix-b-agent-span-hierarchies)

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
+-- gen_ai.operation.name: "create_agent"
+-- gen_ai.agent.id: "agent_abc123"
+-- gen_ai.agent.name: "CustomerSupportAgent"
+-- gen_ai.agent.version: "1.2.0"          # NEW in v1.40.0
+-- gen_ai.agent.description: "Handles tier-1 support queries"
```

#### 4.3.2 Agent Invocation Span

```
Span: invoke_agent {agent_name}
+-- gen_ai.operation.name: "invoke_agent"
+-- gen_ai.agent.id: "agent_abc123"
+-- gen_ai.agent.name: "CustomerSupportAgent"
+-- gen_ai.conversation.id: "conv_xyz789"
    |
    +-- Child Span: chat claude-3-opus
    |   +-- gen_ai.operation.name: "chat"
    |
    +-- Child Span: execute_tool get_customer_info
    |   +-- gen_ai.tool.name: "get_customer_info"
    |   +-- gen_ai.tool.type: "function"
    |   +-- gen_ai.tool.call.id: "call_abc"
    |
    +-- Child Span: chat claude-3-opus
        +-- gen_ai.operation.name: "chat"
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

**Current gap**: Claude Code telemetry doesn't emit standardized agent spans.

---

## 5. Quality and Evaluation Metrics

> **Deep Dive Reference**: See [Appendix C: LLM Evaluation Frameworks](#appendix-c-llm-evaluation-frameworks)

### 5.1 The Quality Visibility Problem

Traditional observability answers: "Is the system up and performing?"

LLM observability must also answer: "Is the system producing good outputs?"

```
System Status Matrix:
                    | Quality: Good    | Quality: Bad
--------------------+------------------+------------------
Performance: Good   | Healthy          | INVISIBLE FAILURE
Performance: Bad    | Investigate      | Obvious failure
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
+-------------------------------------------------------------+
|                    LLM-as-Judge Pipeline                      |
+-------------------------------------------------------------+
|                                                               |
|  Production LLM Call                                          |
|  +----------+    +-----------+    +----------+               |
|  |  Input   |--->|  Model A  |--->|  Output  |               |
|  +----------+    +-----------+    +----------+               |
|       |                                |                      |
|       |         Evaluation LLM         |                      |
|       |    +-----------------------+   |                      |
|       +--->|       Model B         |<--+                      |
|            |  (Judge: GPT-4, etc.) |                          |
|            +-----------+-----------+                          |
|                        |                                      |
|                        v                                      |
|            +-----------------------+                          |
|            |   Quality Scores      |                          |
|            | - Relevancy: 0.85     |                          |
|            | - Faithfulness: 0.92  |                          |
|            | - Hallucination: 0.08 |                          |
|            +-----------------------+                          |
+-------------------------------------------------------------+
```

### 5.4 Evaluation Tool Landscape (2026)

| Tool | Type | Key Features |
|------|------|--------------|
| **Langfuse** | Open Source (MIT) | Tracing, prompt management, evals, SDK v3, 22k+ stars |
| **Arize Phoenix** | Open Source (ELv2) | OTel-native, OTLP ingestion, agent flowcharts, v13.5.0, 8.7k+ stars |
| **DeepEval** | Open Source (Apache 2.0) | 50+ metrics, DAG metric, CI/CD-native pytest, v3.8.8, 13.8k+ stars |
| **MLflow 3.0** | Open Source (Apache 2.0) | GenAI tracing for 20+ libs, Mosaic AI judges, 24k+ stars |
| **Opik** | Open Source (Apache 2.0) | 40M+ traces/day scale, hallucination/moderation evals |
| **Datadog LLM Obs** | Commercial | MCP client monitoring, agent console, hallucination detection |
| **LangSmith** | Commercial | Insights agent, multi-turn evals, Polly AI assistant |
| **Braintrust** | Commercial | Eval datasets, prompt playground, CI/CD deployment gates |
| **Galileo** | Commercial | Luna-2 sub-200ms real-time eval, agent reliability platform |
| **Patronus AI** | Commercial | Generative simulators, HaluBench, 91% human agreement |

### 5.5 Production Evaluation Architecture

```
+-------------------------------------------------------------------+
|                  Production Evaluation Flow                        |
+-------------------------------------------------------------------+
|                                                                    |
|  1. CAPTURE                2. EVALUATE              3. ITERATE     |
|  +-------------+          +-------------+         +-----------+   |
|  | Production  |          | Async Eval  |         | Feedback  |   |
|  |   Traces    |--------->|   Workers   |-------->|   Loop    |   |
|  +-------------+          +-------------+         +-----------+   |
|        |                        |                       |          |
|        v                        v                       v          |
|  +-------------+          +-------------+         +-----------+   |
|  |   Span +    |          |   Quality   |         |  Prompt   |   |
|  |  Metadata   |          |   Scores    |         | Iteration |   |
|  +-------------+          +-------------+         +-----------+   |
|                                                                    |
|  Promote interesting traces to evaluation datasets                 |
+-------------------------------------------------------------------+
```

### 5.6 Hallucination Detection Challenges

Research (arXiv:2504.18114, arXiv:2510.06265, arXiv:2509.18970) reveals ongoing limitations:

- Metrics often fail to align with human judgments (arXiv:2504.18114)
- Inconsistent gains with model parameter scaling
- Agent-specific hallucination modes: tool call hallucinations, planning hallucinations, memory retrieval hallucinations (arXiv:2509.18970)
- Attribution remains ambiguous: prompt strategy vs. intrinsic model behavior (Frontiers in AI, 2025)
- New benchmarks emerging: HaluLens (ACL 2025), PsiloQA (14-language span-level detection)
- Real-time evaluation now economically viable: Luna-2 achieves sub-200ms on L4 GPUs with batched metrics (pricing: $175/1M queries)

---

## 6. Comparative Analysis: observability-toolkit MCP

### 6.1 Architecture Overview

The observability-toolkit MCP server provides:

```
+-------------------------------------------------------------+
|                  observability-toolkit v2.26                  |
+-------------------------------------------------------------+
|                                                               |
|  Data Sources:                                                |
|  +-- Local JSONL files (~/.claude/telemetry/)                |
|  +-- Cloud backend (obtool-api -> D1/R2)                     |
|                                                               |
|  Cloud Infrastructure:                                        |
|  +-- obtool-ingest  - OTLP ingest -> R2 NDJSON, batch -> D1 |
|  +-- obtool-api     - Hono worker, D1/R2 query, bearer auth |
|                                                               |
|  Query Tools:                                                 |
|  +-- obs_query_traces       - Distributed trace queries      |
|  +-- obs_query_metrics      - Metric aggregation             |
|  +-- obs_query_logs         - Log search with boolean ops    |
|  +-- obs_query_llm_events   - LLM-specific event queries     |
|  +-- obs_query_evaluations  - Quality evaluation events      |
|  +-- obs_query_verifications- Human verification tracking    |
|                                                               |
|  Export Tools:                                                |
|  +-- obs_export_langfuse    - OTLP export to Langfuse        |
|  +-- obs_export_confident   - OTLP export to Confident AI    |
|  +-- obs_export_phoenix     - OTLP export to Arize Phoenix   |
|  +-- obs_export_datadog     - Export to Datadog LLM Obs      |
|                                                               |
|  Utility Tools:                                               |
|  +-- obs_health_check       - System health + cache stats    |
|  +-- obs_context_stats      - Context window utilization     |
|  +-- obs_setup_claudeignore - Configure .claudeignore        |
|  +-- obs_get_trace_url      - SigNoz trace viewer links      |
|                                                               |
|  Quality Library:                                             |
|  +-- quality-metrics.ts (~2300 lines)                        |
|  |   +-- Aggregations, alerts, correlation, SLA, trends      |
|  |   +-- Role views, multi-agent evaluation                  |
|  +-- llm-as-judge.ts (~1900 lines)                           |
|  |   +-- G-Eval + QAG evaluation                             |
|  |   +-- Bias mitigation, prompt injection protection        |
|  +-- agent-as-judge.ts (~820 lines)                          |
|      +-- Tool verification, trajectory analysis              |
|      +-- Multi-agent consensus                               |
|                                                               |
|  Dashboard (git submodule):                                   |
|  +-- React 19 + Vite 6, Hono API on :3001                   |
|  +-- derive-evaluations.ts (rule-based scoring)              |
|  +-- judge-evaluations.ts (LLM-based scoring)               |
|                                                               |
|  Performance Features:                                        |
|  +-- LRU query caching                                       |
|  +-- File indexing (.idx sidecars)                           |
|  +-- Gzip compression support                                |
|  +-- Streaming with early termination                        |
|  +-- Circuit breaker for obtool + local backends             |
|  +-- Per-signal watermarks (composite cursor pagination)     |
|  +-- Content hash skip for tsc/py hook checks                |
|  +-- Hook stats persistence (survives restarts)              |
|  +-- Webhook config CRUD with atomic writes (0o600)          |
|  +-- Automated doc/code sync tests                           |
+-------------------------------------------------------------+
```

### 6.2 OTel GenAI Compliance Matrix

| Requirement | Spec | Implementation | Status |
|-------------|------|----------------|--------|
| `gen_ai.operation.name` | Required | Query filter + response | Compliant |
| `gen_ai.provider.name` | Required | Fallback chain (provider.name -> system -> provider) | Compliant |
| `gen_ai.request.model` | Cond. Required | Captured | Compliant |
| `gen_ai.conversation.id` | Cond. Required | Query filter + response | Compliant |
| `gen_ai.usage.input_tokens` | Recommended | Captured | Compliant |
| `gen_ai.usage.output_tokens` | Recommended | Captured | Compliant |
| `gen_ai.response.model` | Recommended | Captured | Compliant |
| `gen_ai.response.finish_reasons` | Recommended | Captured | Compliant |
| `gen_ai.request.temperature` | Recommended | Captured | Compliant |
| `gen_ai.request.max_tokens` | Recommended | Captured | Compliant |
| `gen_ai.usage.cache_read.input_tokens` | Recommended (v1.40.0) | Captured when present | Compliant |
| `gen_ai.usage.cache_creation.input_tokens` | Recommended (v1.40.0) | Captured when present | Compliant |

**Compliance Score**: 10/10 core attributes (v1.8.0); v1.40.0 cache token attributes captured passthrough

### 6.3 Agent Tracking Analysis

| Capability | Spec Requirement | Implementation | Status |
|------------|------------------|----------------|--------|
| Agent spans (`create_agent`, `invoke_agent`) | Defined | Query filters available | Compliant |
| Tool execution spans (`execute_tool`) | Defined | Query filters available | Compliant |
| `gen_ai.agent.id` | Recommended | Query filter (`agentId`) | Compliant |
| `gen_ai.agent.name` | Recommended | Query filter (`agentName`) | Compliant |
| `gen_ai.tool.name` | Recommended | Query filter (`toolName`) | Compliant |
| `gen_ai.tool.call.id` | Recommended | Query filter (`toolCallId`) | Compliant |
| `gen_ai.tool.type` | Recommended | Query filter (`toolType`) | Compliant |
| `gen_ai.operation.name` | Defined | Query filter (`operationName`) | Compliant |
| Session correlation | Custom | Uses `session.id` | Compliant |

**Agent Compliance**: Full query support for agent/tool attributes (v1.7.0)

### 6.4 Metrics Compliance

| Metric | Spec | Implementation | Status |
|--------|------|----------------|--------|
| `gen_ai.client.token.usage` | Histogram w/ buckets | D1 `metric_histograms` table; `obs_query_metric_histograms` | Complete |
| `gen_ai.client.operation.duration` | Histogram w/ buckets | D1 `metric_histograms` table; `obs_query_metric_histograms` | Complete |
| `gen_ai.server.time_to_first_token` | Histogram | Stored when received via OTLP; `obs_query_metric_histograms` | Complete |
| `gen_ai.server.time_per_output_token` | Histogram | Stored when received via OTLP; `obs_query_metric_histograms` | Complete |
| Aggregation support | sum, avg, p50, p95, p99 | sum, avg, min, max, count, p50, p95, p99, rate | Compliant |

**Metrics Enhancement (v1.7.0)**: Added p50, p95, p99 percentile and rate aggregations

### 6.5 Quality/Eval Capabilities

| Capability | Industry Standard | Implementation | Status |
|------------|-------------------|----------------|--------|
| Evaluation event storage | OTel `gen_ai.evaluation.result` | `obs_query_evaluations` | Complete |
| Evaluation aggregation | avg, p50, p95, p99 | Full aggregation support | Complete |
| Langfuse export | OTLP integration | `obs_export_langfuse` | Complete |
| Confident AI export | OTLP integration | `obs_export_confident` | Complete |
| Arize Phoenix export | OTLP integration | `obs_export_phoenix` | Complete |
| Datadog LLM Obs export | HTTP API | `obs_export_datadog` | Complete |
| Human verification tracking | EU AI Act compliance | `obs_query_verifications` | Complete |
| LLM-as-Judge pipeline | G-Eval + QAG | `judge-evaluations.ts` | Complete |
| Agent-as-Judge pipeline | Tool verification + trajectory | `agent-as-judge.ts` | Complete |
| Prompt injection protection | Input sanitization | `sanitizeForPrompt()` | Complete |
| Task completion tracking | Status transitions | `builtin.task_status` hook attributes | Complete |
| Hook stats persistence | Evaluation state survives restarts | `persistHookStats`/`loadPersistedHookStats` | Complete |
| Webhook config CRUD | Atomic writes with secret protection | `loadWebhookConfigs`/`saveWebhookConfig`/`deleteWebhookConfig` | Complete |
| Sanitization OTel spans | Performance monitoring for prompt sanitization | `withSpanSync` wrapping `sanitizeForPrompt()` | Complete |
| Doc/code sync tests | Automated line-reference verification | `doc-sync.test.ts` parses docs for `file.ts:N` refs | Complete |
| Cloud ingest pipeline | OTLP -> D1/R2 batch processing | `obtool-ingest` worker | Complete |
| Cloud query API | Bearer token auth, cursor pagination | `obtool-api` worker | Complete |
| Eval dataset management | Trace promotion | Create/list/get/delete via `obs_manage_datasets`; `/v1/datasets` API | Complete |
| Cost tracking | Price * tokens | Model-level USD estimation via `GET /v1/cost`; 12-model pricing table | Complete |
| TOCTOU elimination | Atomic file operations | tmp -> chmod -> rename pattern across hooks | Complete |

### 6.6 Strengths Relative to Industry

| Strength | Description | Competitive Position |
|----------|-------------|---------------------|
| **Multi-directory scanning** | Aggregates telemetry across locations | Unique |
| **Gzip support** | Transparent compression handling | Standard |
| **Index files** | Fast lookups via .idx sidecars | Above average |
| **Query caching** | LRU with TTL and stats | Standard |
| **OTLP export** | JSON + protobuf wire formats, Langfuse integration | Compliant |
| **Evaluation events** | OTel `gen_ai.evaluation.result` support | Industry standard |
| **Human verification** | EU AI Act compliance tracking | Differentiator |
| **Local-first** | No cloud dependency required | Differentiator |
| **Claude Code integration** | Purpose-built for CC sessions | Unique |
| **Security hardening** | SSRF, rate limiting, input validation, ReDoS defense | Enterprise-grade |
| **Cloud backend** | D1/R2 ingest + API workers, per-signal watermarks | Production-grade |
| **Input validation** | Param clamping, LIKE escaping, URL scheme rejection, allowlists | Defense-in-depth |
| **Hook optimization** | Content hash skip, async exec, parallel repos, incremental tsc | Low-latency |
| **Hook persistence** | Stats survive restarts, webhook config CRUD with atomic writes | Differentiator |
| **Doc/code sync** | Automated verification of line references in quality docs | Unique |
| **Sanitization observability** | OTel spans for prompt sanitization with perf benchmarks | Enterprise-grade |

---

## 7. Recommendations and Roadmap

### 7.1 Priority Matrix

```
                        Impact
                    Low         High
                +---+-----+----+-----+
           High | P3: Nice  | P1: Do    |
    Effort      |  to have  |   First   |
                +-----------+-----------+
            Low | P4: Maybe | P2: Quick |
                |   later   |    Wins   |
                +-----------+-----------+
```

### 7.2 Phase 1: OTel GenAI Compliance (P1/P2) - COMPLETE

**Goal**: Achieve 100% compliance with GenAI semantic conventions

| Task | Priority | Effort | Impact | Status |
|------|----------|--------|--------|--------|
| Add `gen_ai.operation.name` to LLM events | P1 | Low | High | Done |
| Support `gen_ai.provider.name` fallback | P2 | Low | Medium | Done |
| Capture `gen_ai.conversation.id` | P1 | Medium | High | Done |
| Add `gen_ai.response.model` | P2 | Low | Medium | Done |
| Add `gen_ai.response.finish_reasons` | P2 | Low | Medium | Done |
| Add `gen_ai.request.temperature` | P2 | Low | Medium | Done |
| Add `gen_ai.request.max_tokens` | P2 | Low | Medium | Done |

**Implementation**: v1.8.0 (2026-01-29)

### 7.3 Phase 2: Agent Observability (P1) - COMPLETE

**Goal**: First-class support for agent/tool span semantics

| Task | Priority | Effort | Impact | Status |
|------|----------|--------|--------|--------|
| Define agent span schema | P1 | Medium | High | Done |
| Tool execution span tracking | P1 | Medium | High | Done |
| Agent invocation correlation | P1 | High | High | Done |
| Index agent/tool fields | P2 | Medium | Medium | Done |
| Multi-agent workflow visualization | P3 | High | Medium | Future |

**Implementation**: v1.7.0 - Added query filters for `agentId`, `agentName`, `toolName`, `toolCallId`, `toolType`, `operationName`

### 7.4 Phase 3: Metrics Enhancement (P2) - COMPLETE

**Goal**: Standard histogram metrics with OTel bucket boundaries

| Task | Priority | Effort | Impact | Status |
|------|----------|--------|--------|--------|
| Implement histogram aggregation | P2 | Medium | Medium | Done (v1.5.0) |
| Add p50/p95/p99 percentiles | P2 | Low | Medium | Done |
| Add rate aggregation | P2 | Low | Medium | Done |
| Time-to-first-token metric | P2 | Medium | Medium | Future |
| Cost estimation layer | P3 | Low | Low | Future |

**Implementation**: v1.7.0 - Schema now includes p50, p95, p99, rate aggregations

### 7.5 Phase 4: Quality Layer (P3) - COMPLETE

> **Deep Dive Reference**: See [Appendix F: Quality Evaluation Layer](#appendix-f-quality-evaluation-layer)

**Goal**: Optional integration with evaluation frameworks for quality assessment

| Task | Priority | Effort | Impact | Status |
|------|----------|--------|--------|--------|
| OTel `gen_ai.evaluation.result` event support | P2 | Medium | High | Done (v1.8.4) |
| Langfuse OTLP export integration | P3 | Medium | Medium | Done (v1.8.6) |
| Eval score storage schema | P3 | Medium | Medium | Done (v1.8.4) |
| Human verification tracking | P3 | Medium | Medium | Done (v1.8.6) |
| Confident AI export integration | P3 | Medium | Medium | Done (v1.8.9) |
| Arize Phoenix export integration | P3 | Medium | Medium | Done (v1.8.10) |
| Datadog LLM Obs export integration | P3 | Medium | High | Done (v1.8.10) |
| LLM-as-Judge pipeline (G-Eval + QAG) | P1 | High | High | Done (v2.0.0) |
| Agent-as-Judge (tool verification + consensus) | P1 | High | High | Done (v2.0.0) |
| Task completion via status transitions | P1 | Medium | High | Done (v2.0.0) |

**Phase 4a Implementation (v1.8.4)**:
- `obs_query_evaluations` tool with full filtering (evaluationName, scoreMin/Max, scoreLabel, evaluator, evaluatorType)
- Aggregation support: avg, min, max, count, p50, p95, p99
- GroupBy support: evaluationName, scoreLabel, evaluator

**Phase 4b Implementation (v1.8.6)**:
- `obs_export_langfuse` tool for OTLP export to Langfuse
- Security hardening: SSRF protection, DNS rebinding defense, credential sanitization
- Retry logic with exponential backoff for 429, 5xx errors
- Memory protection with OOM prevention at 600MB threshold

**Phase 4c Implementation (v1.8.9)**:
- `obs_export_confident` tool for OTLP export to Confident AI
- DeepEval metric collection support
- Environment-based configuration (production/staging/development)

**Phase 4d Implementation (v1.8.10)**:
- `obs_export_phoenix` tool for OTLP export to Arize Phoenix
- Project-based organization support
- `obs_export_datadog` tool for Datadog LLM Observability
- Two-phase export: spans + evaluation metrics
- Auto-detection of metric types (categorical, score, boolean)
- 2781 tests at v1.8.10 (3684 at v2.0.0, +67 in obtool-api/ingest workers at v2.23)

### 7.6 Implementation Roadmap

```
2026 Q1 (COMPLETED)
-------------------------------------------------------------------------
| Phase 1-3: COMPLETE (v1.7.0)  | Phase 4a-4d: COMPLETE (v1.8.10)      |
| - gen_ai.operation.name       | - obs_query_evaluations               |
| - gen_ai.provider.name        | - obs_export_langfuse                 |
| - gen_ai.conversation         | - obs_export_confident                |
| - Agent/tool filters          | - obs_export_phoenix                  |
| - p50/p95/p99/rate            | - obs_export_datadog                  |
| - 10/10 OTel compliance       | - obs_query_verifications             |
-------------------------------------------------------------------------
| Phase 5: Quality Library (v2.0.0)                                     |
| - LLM-as-Judge (G-Eval + QAG, bias mitigation, prompt injection)     |
| - Agent-as-Judge (tool verification, trajectory, consensus)           |
| - Quality metrics (SLA, trends, alerts, role views, multi-agent)      |
| - Task completion via explicit status transitions                     |
| - Dashboard submodule (React 19 + Vite 6, rule + LLM eval scripts)   |
| - 8 enterprise code reviews (v2.2-v2.9), 3684 tests                  |
-------------------------------------------------------------------------
| Phase 6: Cloud Infrastructure + Hardening (v2.10-v2.23)              |
| - obtool-ingest worker (OTLP -> R2 NDJSON, batch -> D1)              |
| - obtool-api worker (Hono, D1/R2 query, bearer token auth)           |
| - Per-signal watermarks, composite cursor pagination                  |
| - Security hardening: input validation, URL scheme rejection, LIKE    |
|   escaping, param clamping, allowlists, auth cache eviction           |
| - Hook perf: async exec, parallel repos, content hash skip            |
| - Session N+1 fix (8m->6s), KV sync hardening (10K->100K eval limit) |
| - 23 enterprise code reviews (v2.2-v2.23), 200+ findings resolved    |
-------------------------------------------------------------------------
| Phase 7: Hooks Hardening + Dev Tooling (v2.24-v2.26)                 |
| - Hook stats persistence (survives restarts, non-additive restore)    |
| - Webhook config CRUD (atomic writes, chmod 0o600, TOCTOU fix)       |
| - OTel spans for sanitization performance monitoring                  |
| - Automated doc/code sync tests (line-reference verification)         |
| - sanitizeForPrompt() performance benchmarks (4 timing tests)         |
| - evaluation-hooks hardening (.tmp cleanup, crash-at-discovery)       |
| - Phoenix protobuf wire format (@bufbuild/protobuf, hex validation)   |
| - 26 enterprise code reviews (v2.2-v2.26), 210+ findings resolved    |
-------------------------------------------------------------------------
                                 | Future Enhancements                   |
                                 | +-- Cost estimation layer             |
-------------------------------------------------------------------------
```

**v2.26 Achievement**: Phases 1-7 completed (Feb 2026), 26 code review cycles, 210+ findings resolved, protobuf wire format for Phoenix export

---

## 8. Future Research Directions

### 8.1 Emerging Standards

1. **MCP Semantic Conventions**: OTel now defines MCP client/server spans (`mcp.client.operation.duration`, `mcp.server.operation.duration`), session metrics, and attributes (`mcp.method.name`, `mcp.session.id`). Status: Development. Designed for compatibility with GenAI `execute_tool` spans.
2. **Agentic System Semantics**: OTel GenAI SIG working on common conventions covering IBM Bee Stack, wxFlow, CrewAI, AutoGen, and LangGraph. Key blocker: promoting from Development to Experimental requires broader implementation evidence.
3. **Multi-Agent Coordination**: Failures unique to MAS (coordination breakdowns, conflicting tool usage, emergent behaviors) require parent-agent spans referencing child-agent spans across service boundaries. No consensus convention yet.
4. **AI/Observability Convergence**: Industry prediction (Dynatrace 2026): the distinction between "AI observability" and traditional observability collapses -- unified view across AI components, application logic, and cloud infrastructure.

### 8.2 Quality Measurement Evolution

1. **Real-time evaluation at scale**: Galileo Luna-2 achieves sub-200ms eval on L4 GPUs with batched metrics ($175/1M queries); teams now run real-time guardrails and batch analysis concurrently
2. **DAG-based evaluation**: DeepEval's DAG metric enables fully deterministic, customizable LLM-powered decision trees -- bridging rule-based and LLM-judge approaches
3. **Agent-specific benchmarks**: tau-bench (multi-attempt reliability), Terminal-Bench (sandboxed CLI), DPAI Arena (multi-language coding), SWE-Bench family (Verified, Multilingual, Multimodal)
4. **Automated regression detection**: Braintrust and DeepEval now gate CI/CD deployments on statistical quality regression thresholds

### 8.3 Cost Optimization

1. **Cache token observability**: OTel v1.40.0 adds `gen_ai.usage.cache_read.input_tokens` and `gen_ai.usage.cache_creation.input_tokens` for Anthropic/OpenAI prompt caching cost tracking
2. **Agentic cost attribution**: Tracing cost back through 10+ tool calls to an initiating user intent remains an unsolved UX problem across platforms
3. **Reasoning token gap**: Most teams still have zero tracking on reasoning token costs (chain-of-thought, extended thinking)
4. **Tag-based spending**: Budget alerts and trend analysis by user/feature/team/model now table-stakes in enterprise platforms

### 8.4 Privacy and Compliance

1. **EU AI Act timeline**: Prohibited practices active (Feb 2025), GPAI obligations active (Aug 2025), full high-risk system rules (Aug 2026, pending Digital Omnibus extension to Dec 2027)
2. **Compliance artifacts**: High-risk systems must produce evidence packs capturing prompts, model versions, human-in-the-loop actions, guardrail events. Driving demand for immutable trace storage and OCSF audit logs (LangSmith, Datadog already shipping).
3. **Content redaction pipelines**: OTel Collector processors for PII removal
4. **Differential privacy**: Aggregated telemetry without individual exposure

---

## 9. References

### 9.1 OpenTelemetry Specifications

1. OpenTelemetry. "Semantic conventions for generative AI systems." https://opentelemetry.io/docs/specs/semconv/gen-ai/ (Accessed February 2026)

2. OpenTelemetry. "Semantic conventions for generative client AI spans." https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/ (Accessed February 2026)

3. OpenTelemetry. "Semantic conventions for generative AI metrics." https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-metrics/ (Accessed February 2026)

4. OpenTelemetry. "Gen AI Registry Attributes." https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/ (Accessed February 2026)

5. OpenTelemetry. "Semantic conventions for MCP." https://opentelemetry.io/docs/specs/semconv/gen-ai/mcp/ (Accessed February 2026)

6. OpenTelemetry. "Semantic conventions for GenAI agent spans." https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans/ (Accessed February 2026)

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

---

## 10. Appendices

### Appendix A: OTel GenAI Attribute Reference

> **Status**: Index entry for future deep dive

Complete reference of all `gen_ai.*` attributes with:
- Full attribute list with types and examples
- Requirement levels by operation type
- Provider-specific extensions
- Migration guide from pre-1.37 conventions

### Appendix B: Agent Span Hierarchies

> **Status**: Index entry for future deep dive

Detailed span hierarchy patterns for:
- Single-agent workflows
- Multi-agent orchestration
- Tool execution chains
- Error propagation patterns
- Correlation strategies

### Appendix C: LLM Evaluation Frameworks

> **Status**: Index entry for future deep dive

Comparative analysis of:
- Langfuse evaluation capabilities
- Arize Phoenix integration patterns
- DeepEval metric implementations
- Custom evaluator development
- Production deployment patterns

### Appendix D: observability-toolkit Schema Migration

> **Status**: Index entry for future deep dive

Migration guide covering:
- Current schema documentation
- Target OTel-compliant schema
- Backward compatibility strategy
- Data migration procedures
- Validation test suites

### Appendix E: Cost Tracking Implementation

> **Status**: Index entry for future deep dive

Cost observability implementation covering:
- Provider pricing models
- Token-to-cost calculation
- Budget alerting patterns
- Cost attribution by session/user
- Optimization recommendations

### Appendix F: Quality Evaluation Layer

> **Status**: Phases 4a-4d + Quality Library + Cloud Infrastructure + Hooks Hardening implemented (v2.26, February 2026)

This appendix provides comprehensive coverage of the Quality Evaluation Layer (Phase 4), examining industry standards, implementation patterns, and integration approaches for LLM and agent quality assessment.

**Deep Dive Architecture Guides**:
- [LLM-as-Judge Architecture](quality/llm-as-judge.md) - G-Eval, QAG, bias mitigation, production utilities
- [Agent-as-Judge Architecture](quality/agent-as-judge.md) - Multi-agent collaboration, tool-augmented verification, agent metrics

---

#### F.1 The Quality Observability Imperative

Traditional observability measures system health through latency, throughput, and error rates. For LLM applications, these metrics can paint a misleading picture: a system may exhibit excellent performance metrics while consistently producing hallucinated, irrelevant, or harmful outputs.

**Industry Statistics (LangChain State of AI Agents, Dec 2025):**
- 89% of teams have implemented observability for agents
- Only 52% have implemented evaluations
- 40% of data + AI teams now have agents running in production
- Organizations use a hybrid approach: LLM-as-judge (53.3%) + human review (59.8%)

This gap between observability adoption and evaluation adoption represents a critical blind spot.

#### F.2 OpenTelemetry Evaluation Event Convention

The OpenTelemetry GenAI semantic conventions (v1.39.0+, latest v1.40.0) define a standardized event for capturing evaluation results:

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
+-- Span: invoke_agent CustomerSupportBot
|   +-- Span: chat claude-3-opus
|   |   +-- Event: gen_ai.evaluation.result
|   |       +-- gen_ai.evaluation.name: "Relevance"
|   |       +-- gen_ai.evaluation.score.value: 0.92
|   |       +-- gen_ai.evaluation.score.label: "relevant"
|   |       +-- gen_ai.evaluation.explanation: "Response directly addresses query"
|   |
|   +-- Span: execute_tool lookup_customer
|       +-- Event: gen_ai.evaluation.result
|           +-- gen_ai.evaluation.name: "ToolCorrectness"
|           +-- gen_ai.evaluation.score.label: "pass"
```

#### F.3 LLM-as-Judge Pattern

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
+-------------------------------------------------------------+
|                     LLM-as-Judge Pipeline                     |
+-------------------------------------------------------------+
|                                                               |
|   Production Call                    Async Evaluation         |
|   +----------+                      +------------------+     |
|   |  Input   |--------------------->|  Judge Model     |     |
|   +----+-----+                      |  (GPT-4/Claude)  |     |
|        |                            +--------+---------+     |
|        v                                     |               |
|   +----------+    +----------+              v               |
|   | Subject  |--->|  Output  |------->+------------------+  |
|   |  Model   |    +----------+        | Evaluation Scores |  |
|   +----------+                        | - relevance: 0.85 |  |
|                                       | - faithful: 0.92  |  |
|   Optional Context:                   | - halluc: 0.08    |  |
|   - Retrieved documents               +------------------+  |
|   - Conversation history                                     |
|   - Ground truth (if available)                              |
+-------------------------------------------------------------+
```

#### F.4 Agent-as-a-Judge: Evaluating Agent Quality

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
+-------------------------------------------------------------+
|                    Agent-as-a-Judge Evaluation                |
+-------------------------------------------------------------+
|                                                               |
|   Subject Agent Execution          Judge Agent (Parallel)    |
|   +---------------------+         +---------------------+   |
|   | Step 1: Reasoning   |<------->| Evaluate: Reasoning |   |
|   +----------+----------+         +---------------------+   |
|              |                              |                |
|   +----------v----------+         +--------v------------+   |
|   | Step 2: Tool Call   |<------->| Evaluate: Tool Args |   |
|   | get_customer(id=42) |         | - Correct tool      |   |
|   +----------+----------+         | - Valid parameters   |   |
|              |                     +---------------------+   |
|   +----------v----------+         +---------------------+   |
|   | Step 3: Response    |<------->| Evaluate: Task Done |   |
|   +---------------------+         | Score: 0.94         |   |
|                                   | "Goal achieved"      |   |
|                                   +---------------------+   |
|                                                               |
|   Output: Step-by-step evaluation with pinpointed feedback   |
+-------------------------------------------------------------+
```

#### F.5 Core Agent Evaluation Metrics

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
+-----------------------------------------------------+
|  Input ----> Agent Execution ----> Output            |
|              (one interaction)                        |
|                                                       |
|  Metrics: Task Completion, Tool Correctness          |
+-----------------------------------------------------+

Multi-Turn Agent:
+-----------------------------------------------------+
|  Turn 1: User --> Agent --> Response                 |
|  Turn 2: User --> Agent --> Response                 |
|  Turn N: User --> Agent --> Response                 |
|                                                       |
|  Component Metrics: Same as single-turn per turn     |
|  End-to-End Metrics: Conversation Completeness,      |
|                      Turn Relevancy                  |
+-----------------------------------------------------+
```

**Important**: Internal agent-to-agent calls (swarms, handoffs) do NOT count as turns. Only end-user interactions define turn boundaries.

#### F.6 Evaluation Tool Landscape (2026)

| Tool | Type | OTel Support | Key Differentiator | observability-toolkit |
|------|------|--------------|-------------------|----------------------|
| **Langfuse** | Open Source (MIT, 22k+ stars) | Native OTLP | Tracing + evals + prompt mgmt, SDK v3 OTel-native | Integrated (v1.8.6) |
| **DeepEval** | Open Source (Apache, 13.8k+ stars) | Via Confident AI | 50+ metrics, DAG metric, CI/CD pytest-native | Via Confident AI |
| **Arize Phoenix** | Open Source (ELv2, 8.7k+ stars) | OTLP first-class | Agent flowcharts, evals-as-experiments, v13.5.0 | Integrated (v1.8.10), protobuf wire format |
| **MLflow 3.0** | Open Source (Apache, 24k+ stars) | Partial | 20+ lib tracing, Mosaic AI judges, Databricks-backed | - |
| **Opik** | Open Source (Apache) | Yes | 40M+ traces/day, hallucination/moderation evals | - |
| **Confident AI** | Commercial | DeepEval-powered | Cloud platform, human feedback, 20M+ daily evals | Integrated (v1.8.9) |
| **Datadog LLM Obs** | Commercial | Native GenAI | MCP monitoring, agent console, cost attribution | Integrated (v1.8.10) |
| **LangSmith** | Commercial | Yes (multi-SDK) | Insights agent, Polly assistant, OCSF audit logs | - |
| **Galileo** | Commercial | No | Luna-2 sub-200ms eval, agent reliability platform | - |
| **Patronus AI** | Commercial | No | Generative simulators, HaluBench, multimodal | - |
| **Braintrust** | Commercial | Custom | Eval datasets, CI/CD gates, 100+ model proxy | - |

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

#### F.7 Production Evaluation Architecture

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
+-------------------------------------------------------------------+
|              Production Evaluation Pipeline                         |
+-------------------------------------------------------------------+
|                                                                     |
|  1. CAPTURE           2. EVALUATE           3. FEEDBACK LOOP       |
|  +---------------+   +---------------+    +---------------+       |
|  | Production    |   |  Async Eval   |    |   Alerting    |       |
|  | Traces + Logs |-->|   Workers     |--->|   + Triage    |       |
|  +---------------+   +---------------+    +---------------+       |
|         |                   |                    |                  |
|         v                   v                    v                  |
|  +---------------+   +---------------+    +---------------+       |
|  | OTel Spans +  |   | gen_ai.eval   |    | Prompt/Model  |       |
|  | Eval Events   |   | .result       |    |  Iteration    |       |
|  +---------------+   | Events        |    +---------------+       |
|                      +---------------+                             |
|                                                                     |
|  4. DATASET CURATION                                               |
|  +---------------------------------------------------------------+ |
|  | Promote interesting traces -> Golden evaluation datasets       | |
|  | - Failures for regression testing                              | |
|  | - Edge cases for robustness testing                            | |
|  | - High-quality examples for few-shot prompting                 | |
|  +---------------------------------------------------------------+ |
+-------------------------------------------------------------------+
```

#### F.8 Implementation Status for observability-toolkit

**Phase 4a: OTel Evaluation Event Support** - COMPLETE (v1.8.4)

Implemented evaluation event storage and query capabilities via `obs_query_evaluations`:

```typescript
// Implemented in src/tools/query-evaluations.ts
export const queryEvaluationsSchema = z.object({
  evaluationName: z.string().optional(),   // Filter by metric type (substring)
  scoreMin: z.number().optional(),         // Minimum score threshold
  scoreMax: z.number().optional(),         // Maximum score threshold
  scoreLabel: z.string().optional(),       // e.g., "fail", "relevant" (exact)
  evaluator: z.string().optional(),        // Evaluator identity
  evaluatorType: z.enum(['llm', 'human', 'rule', 'classifier']).optional(),
  responseId: z.string().optional(),       // Correlate to specific response
  traceId: z.string().optional(),          // All evals for a trace
  sessionId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().optional().default(50),
  aggregation: z.enum(['avg', 'min', 'max', 'count', 'p50', 'p95', 'p99']).optional(),
  groupBy: z.array(z.enum(['evaluationName', 'scoreLabel', 'evaluator'])).optional(),
});
```

**Phase 4b: Langfuse Integration** - COMPLETE (v1.8.6)

Implemented OTLP export to Langfuse via `obs_export_langfuse`. Security features: SSRF protection, DNS rebinding defense, credential sanitization, retry with exponential backoff, OOM prevention at 600MB.

**Phase 4c: Confident AI Integration** - COMPLETE (v1.8.9)

Implemented OTLP export to Confident AI via `obs_export_confident`:
- DeepEval metric collection support
- Environment tagging (production/staging/development/testing)
- Shared export utilities refactored to `src/lib/export-utils.ts`

**Phase 4d: Arize Phoenix + Datadog Integration** - COMPLETE (v1.8.10)

Implemented two additional export destinations:

`obs_export_phoenix` - Arize Phoenix OTLP export:
- `format: 'json' | 'protobuf'` parameter (default: json)
- Protobuf path via `@bufbuild/protobuf` (fromJson+toBinary) with hex->base64 ID conversion
- Input validation: hex format enforcement, parentSpanId conversion for child spans
- Project-based organization
- Legacy auth support for pre-June 2025 installations

`obs_export_datadog` - Datadog LLM Observability export:
- Two-phase export: spans + evaluation metrics
- Auto-detection of metric types (categorical, score, boolean)
- ML application tagging via `DD_LLMOBS_ML_APP`
- Multi-site support (US, EU, AP regions)
- 160 dedicated tests

**Phase 5a: LLM-as-Judge Pipeline** - COMPLETE (v2.0.0)

Implemented in `dashboard/scripts/judge-evaluations.ts` and `src/lib/llm-as-judge.ts` (~1900 lines):
- G-Eval + QAG evaluation methods with transcript discovery and turn extraction
- Prompt injection protection via `sanitizeForPrompt()` (P0 security fix)
- Atomic lockfile (`O_CREAT|O_EXCL`) preventing concurrent file write corruption
- Streaming JSONL processing via readline (eliminates unbounded memory from `readFileSync`)
- `--dry-run` and `--seed` modes for cost estimation and reproducible evaluation
- 45 dedicated unit tests

**Phase 5b: Agent-as-Judge** - COMPLETE (v2.0.0)

Implemented in `src/lib/agent-as-judge.ts` (~820 lines):
- Tool verification and trajectory analysis
- Multi-agent consensus evaluation
- Type guards replacing unsafe `as` type assertions (P0 fix)

**Phase 5c: Quality Metrics Library** - COMPLETE (v2.0.0)

Implemented in `src/lib/quality-metrics.ts` (~2300 lines):
- SLA tracking with `evaluateSLAs()` and typed `SLAStatus` union
- Multi-agent evaluation with `computeMultiAgentEvaluation()` and handoff thresholds
- Role views (executive `topIssues`, operator info-level filtering)
- Trend analysis with `TREND_MIN_SAMPLE_SIZE` and `lowSampleWarning`
- Contextual severity with glob patterns and ReDoS mitigation
- NaN/Infinity filtering via `isFiniteScore()` + `finiteNumber` Zod schema
- Precision constants (`SCORE_PRECISION`, `PERCENT_PRECISION`)

**Phase 5d: Task Completion Tracking** - COMPLETE (v2.0.0)

- `derive-evaluations.ts` tracks explicit `pending->in_progress->completed` status transitions via `builtin.task_status` span attributes
- Graduated scoring (0.0/0.5/1.0 averaged per session) with ratio heuristic fallback
- Hook emits `builtin.task_status` and `builtin.task_id` for TaskCreate/TaskUpdate spans

**Enterprise Code Reviews (v2.2-v2.23)**

23 review iterations resolved 200+ findings across all severity levels:

| Version | Key Fixes |
|---------|-----------|
| v2.2 | Inter-evaluator agreement formula, distribution bounds, trend stability |
| v2.3 | SLA types, multi-agent validation, ReDoS mitigation (P0) |
| v2.4 | Lazy-sort optimization, NaN filtering, precision constants |
| v2.6 | NaN production bug (P0), coverage heatmap threshold fix (P0) |
| v2.7 | Prompt injection sanitization (P0), atomic lockfile (P1), streaming IO (P1) |
| v2.8 | Canonical dot convention alignment, type guards, edge case tests |
| v2.9 | Unsafe type assertion replacement (P0), null dereference guard (P0), taskId trimming (P1) |
| v2.9.1-v2.9.3 | Export module review, dashboard eval pipeline, full-stack review |
| v2.10-v2.11 | Dashboard UX error boundaries, CI/CD pipeline review, composite project refs |
| v2.12-v2.14 | Trivial backlog items, feature engineering frontend, frontend F1-F6 implementation |
| v2.15 | Hooks hardening (90+ items): PII leak fix (P0), shell injection fix (P0), TOCTOU race fix |
| v2.16 | P1 explainability, dashboard hardening |
| v2.17 | Agent quality audit, scoring extraction |
| v2.18-v2.19 | Skill-agent telemetry classification, naming conventions |
| v2.20-v2.21 | KV sync hardening, session N+1 query fix (8m->6s), trace 404 handling |
| v2.22 | T2 metric namespace rename to `llm.judge.*`, API key scope fix |
| v2.23 | O(n^2) Cohen's Kappa fix, per-signal watermarks, input validation (35+ items) |

#### F.9 Quality Metrics for observability-toolkit Integration

**Implemented Metrics (v1.8.6):**

The `obs_query_evaluations` tool now supports querying with these aggregations:

| Aggregation | Description | Example Query |
|-------------|-------------|---------------|
| `avg` | Average score across evaluations | `aggregation: 'avg', groupBy: ['evaluationName']` |
| `min` | Minimum score | `aggregation: 'min', scoreMin: 0.5` |
| `max` | Maximum score | `aggregation: 'max', evaluatorType: 'llm'` |
| `count` | Total evaluation count | `aggregation: 'count', groupBy: ['scoreLabel']` |
| `p50` | Median score (50th percentile) | `aggregation: 'p50'` |
| `p95` | 95th percentile score | `aggregation: 'p95'` |
| `p99` | 99th percentile score | `aggregation: 'p99'` |

**Proposed Alert Thresholds (for monitoring dashboards):**

| Metric | Aggregation | Alert Threshold | Purpose |
|--------|-------------|-----------------|---------|
| `eval.relevance.score` | p50, p95 | p50 < 0.7 | Response quality |
| `eval.task_completion.rate` | avg | < 0.85 | Agent effectiveness |
| `eval.tool_correctness.rate` | avg | < 0.95 | Tool selection accuracy |
| `eval.hallucination.rate` | avg | > 0.1 | Factual accuracy |
| `eval.latency.seconds` | p95 | > 5s | Evaluation overhead |

#### F.10 References for Quality Evaluation

15. OpenTelemetry. "Semantic conventions for Generative AI events." https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-events/ (Accessed January 2026)

16. LangChain. "State of AI Agents." https://www.langchain.com/state-of-agent-engineering (Accessed January 2026)

17. Confident AI. "AI Agent Evaluation: The Definitive Guide." https://www.confident-ai.com/blog/definitive-ai-agent-evaluation-guide (Accessed January 2026)

18. Langfuse. "Open Source LLM Observability via OpenTelemetry." https://langfuse.com/integrations/native/opentelemetry (Accessed January 2026)

19. Spring. "LLM Response Evaluation with Spring AI: Building LLM-as-a-Judge." https://spring.io/blog/2025/11/10/spring-ai-llm-as-judge-blog-post/ (Accessed January 2026)

20. arXiv. "When AIs Judge AIs: The Rise of Agent-as-a-Judge Evaluation for LLMs." https://arxiv.org/html/2508.02994v1 (Accessed January 2026)

21. Monte Carlo. "LLM-As-Judge: 7 Best Practices & Evaluation Templates." https://www.montecarlodata.com/blog-llm-as-judge/ (Accessed January 2026)

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-29 | Research Analysis | Initial publication |
| 1.1 | 2026-01-29 | Research Analysis | Added Appendix F: Quality Evaluation Layer covering OTel evaluation events, LLM-as-Judge patterns, Agent-as-a-Judge paradigm, and integration recommendations |
| 1.2 | 2026-02-01 | Session Update | Updated to reflect v1.8.6 implementation: Phase 4a-4b complete, added obs_query_evaluations/obs_export_langfuse/obs_query_verifications tools, 2414 tests, updated roadmap and compliance matrices |
| 1.3 | 2026-02-01 | Session Update | Updated to reflect v1.8.10: Phase 4c-4d complete, added obs_export_confident/obs_export_phoenix/obs_export_datadog tools, 2781 tests, all major evaluation platforms integrated |
| 1.4 | 2026-02-13 | Session Update | Updated to reflect v2.0.0: LLM-as-Judge pipeline (G-Eval + QAG), Agent-as-Judge, quality metrics library (~5000 LOC), task completion via status transitions, 8 enterprise code reviews (v2.2-v2.9), dashboard git submodule, 3684 tests |
| 1.5 | 2026-02-27 | Session Update | Updated to reflect v2.23: Cloud infrastructure (obtool-ingest D1/R2 + obtool-api Hono workers), 23 code review cycles (v2.2-v2.23) resolving 200+ findings, security hardening (input validation, URL scheme rejection, LIKE escaping, param clamping, auth cache eviction), hook perf optimization (async exec, content hash skip), session N+1 fix (8m->6s), KV sync hardening, per-signal watermarks with composite cursor pagination |
| 1.6 | 2026-02-27 | Session Update | Updated to reflect v2.24-v2.26: hook stats persistence, webhook config CRUD, evaluation-hooks hardening |
| 1.7 | 2026-02-27 | Session Update | Fact-check pass: corrected DeepEval metrics (14->50+), Confident AI scale (800k->20M+), Galileo pricing ($0.02/M->$175/1M queries), updated star counts (DeepEval 13.8k+, Phoenix 8.7k+), fixed truncated arXiv titles, updated tool versions (DeepEval 3.8.8, Phoenix v13.5.0) |
| 1.8 | 2026-02-27 | Session Update | Added Phoenix protobuf wire format support (`@bufbuild/protobuf`, hex->base64 ID conversion, input validation), updated roadmap and implementation sections |

---

*This document was produced through systematic web research and comparative analysis. It represents the state of LLM observability standards as of February 2026 and should be reviewed periodically as the field evolves rapidly.*
