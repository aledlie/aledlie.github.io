---
layout: single
title: "EU AI Act: Observability Requirements for LLM/GenAI Systems"
date: 2026-01-29
author_profile: true
breadcrumbs: true
permalink: /reports/eu-ai-act-observability-requirements/
categories: [documentation, regulatory-compliance]
tags: [eu-ai-act, compliance, transparency, observability, llm, genai, regulation]
excerpt: "Mapping EU AI Act (Regulation 2024/1689) transparency and observability requirements to LLM/GenAI system implementations."
header:
  overlay_image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
---

# EU AI Act: Observability Requirements for LLM/GenAI Systems

**Document Version**: 1.2
**Created**: 2026-01-29
**Updated**: 2026-01-31
**Source**: EU AI Act (Regulation 2024/1689)

---

## Overview

The EU AI Act entered into force on August 1, 2024, with a phased implementation timeline. This document summarizes the observability, logging, and documentation requirements relevant to LLM and GenAI systems.

### Implementation Timeline

| Date | Requirements |
|------|--------------|
| **Aug 2024** | Act enters into force |
| **Feb 2025** | Prohibited AI practices apply |
| **Aug 2025** | GPAI obligations (Articles 53, 55) |
| **Aug 2026** | High-risk AI system requirements (Articles 12, 19) |

---

## General-Purpose AI (GPAI) Requirements

### Article 53: GPAI Provider Obligations
**Effective**: August 2, 2025

All GPAI model providers must:
- Maintain technical documentation per **Annex XI**
- Provide information to downstream providers per **Annex XII**
- Establish copyright compliance policies
- Publish training data summaries

### Article 55: Systemic Risk GPAI Obligations
**Effective**: August 2, 2025

Models trained with >10^25 FLOPs additionally require:
- Model evaluation using standardized protocols
- Adversarial testing (red teaming)
- Systemic risk tracking and mitigation
- Cybersecurity protection
- Incident reporting to EU AI Office

---

## Annex XI: GPAI Technical Documentation Requirements

**Applies to**: All GPAI providers (including LLM providers)

### Section 1: All GPAI Providers

#### 1. General Description
| Element | Description |
|---------|-------------|
| Tasks | Intended tasks and AI system integration types |
| Acceptable Use | Policies governing permitted uses |
| Release Info | Date and distribution methods |
| Architecture | Model architecture and parameter count |
| I/O Format | Input/output modalities and formats |
| License | Licensing terms |

#### 2. Design & Training Process
| Element | Description |
|---------|-------------|
| Technical Means | Infrastructure, tools, usage instructions for integration |
| Design Specifications | Training methodologies, key design choices, rationale, assumptions |
| Optimization | What the model optimizes for, parameter relevance |

#### 3. Data Documentation
| Element | Description |
|---------|-------------|
| Data Sources | Type and provenance of training/test/validation data |
| Curation Methods | Cleaning, filtering, preprocessing techniques |
| Data Points | Number, scope, and main characteristics |
| Data Selection | How data was obtained and selected |
| Bias Detection | Methods to identify unsuitable sources and biases |

#### 4. Compute & Energy
| Element | Description |
|---------|-------------|
| Compute Resources | FLOPs used for training |
| Training Time | Duration of training process |
| Energy Consumption | Known or estimated (can estimate from compute) |

### Section 2: Systemic Risk GPAI (Additional)

| Element | Description |
|---------|-------------|
| Evaluation Strategies | Criteria, metrics, methodology for identifying limitations |
| Adversarial Testing | Red teaming, alignment, fine-tuning measures |
| System Architecture | Software component interactions, processing flow |

---

## High-Risk AI System Requirements

### Article 12: Record-Keeping
**Effective**: August 2, 2026

#### Core Requirements

1. **Automatic Logging Capability**
   - Systems must technically enable automatic event recording (logs)
   - Logging must persist over the system's entire lifetime

2. **Required Log Events**
   - Situations that may present risk (per Article 79(1))
   - Substantial modifications to the system
   - Events relevant to post-market monitoring (Article 72)
   - Operational monitoring events (Article 26(5))

3. **Biometric Identification Systems** (Annex III, point 1(a))
   - Session timestamps (start/end of each use)
   - Reference database against which input was checked
   - Input data that produced matches
   - Identity of humans who verified results (per Article 14(5))

#### Rationale (Recital 71)

> "Having comprehensible information on how high-risk AI systems have been developed and how they perform throughout their lifetime is essential to enable traceability of those systems, verify compliance with the requirements under this Regulation, as well as monitoring of their operations and post market monitoring."

Key points:
- Technical documentation must be kept **up to date** throughout lifetime
- Enables traceability and compliance verification
- Supports post-market surveillance

### Article 19: Automatically Generated Logs
**Effective**: August 2, 2026

- Providers must retain logs generated by high-risk AI systems
- **Minimum retention period**: 6 months (unless otherwise specified by law)
- Deployers under provider control must also maintain logs

---

## Observability Implementation Mapping

### OTel GenAI Semantic Conventions Alignment

| EU AI Act Requirement | OTel GenAI Attribute/Event |
|-----------------------|---------------------------|
| Session timestamps | `gen_ai.conversation.id` + span timestamps |
| Model identification | `gen_ai.response.model` |
| Input logging | `gen_ai.content.prompt` event |
| Output logging | `gen_ai.content.completion` event |
| Tool/database references | `gen_ai.tool.name`, `gen_ai.tool.call.id` |
| Token usage | `gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens` |
| Request parameters | `gen_ai.request.temperature`, `gen_ai.request.max_tokens` |
| Finish reasons | `gen_ai.response.finish_reasons` |
| Provider identification | `gen_ai.provider.name`, `gen_ai.system` |

### observability-toolkit Configuration

```typescript
// Recommended settings for EU AI Act compliance
{
  RETENTION_DAYS: 180,          // 6+ months per Article 19
  LOG_LEVEL: 'info',            // Capture operational events
  TRACE_CONTENT: true,          // Enable input/output logging
  SESSION_TRACKING: true,       // Track conversation sessions
}
```

### Compliance Checklist

- [x] Enable automatic event logging for all AI system interactions
- [x] Capture session start/end timestamps
- [x] Log model version and configuration per request
- [x] Record input data and corresponding outputs
- [ ] Track human verification events (if applicable) - *see [1.8.6/BACKLOG.md](1.8.6/BACKLOG.md#c1-human-verification-event-tracking)*
- [x] Implement 6+ month log retention (`RETENTION_DAYS` config)
- [x] Maintain technical documentation and keep it updated
- [x] Enable traceability via trace IDs and session IDs

---

## Penalties

| Violation | Fine |
|-----------|------|
| Prohibited AI practices | Up to 35M EUR or 7% global turnover |
| High-risk AI non-compliance | Up to 15M EUR or 3% global turnover |
| Incorrect information to authorities | Up to 7.5M EUR or 1% global turnover |
| GPAI provider violations | Up to 15M EUR or 3% global turnover |

---

## References

### Official Sources
- [EU AI Act (Regulation 2024/1689)](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689)
- [Implementation Timeline](https://artificialintelligenceact.eu/implementation-timeline/)
- [EU AI Act Compliance Checker](https://artificialintelligenceact.eu/assessment/eu-ai-act-compliance-checker/)

### Article References
- [Article 12: Record-Keeping](https://artificialintelligenceact.eu/article/12/)
- [Article 19: Automatically Generated Logs](https://artificialintelligenceact.eu/article/19/)
- [Article 53: GPAI Provider Obligations](https://artificialintelligenceact.eu/article/53/)
- [Article 55: Systemic Risk GPAI Obligations](https://artificialintelligenceact.eu/article/55/)

### Annex References
- [Annex XI: GPAI Technical Documentation](https://artificialintelligenceact.eu/annex/11/)
- [Annex XII: GPAI Transparency Information](https://artificialintelligenceact.eu/annex/12/)
- [Annex XIII: Systemic Risk Criteria](https://artificialintelligenceact.eu/annex/13/)

### Recitals
- [Recital 66: High-Risk Requirements Rationale](https://artificialintelligenceact.eu/recital/66/)
- [Recital 71: Traceability & Documentation](https://artificialintelligenceact.eu/recital/71/)

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-29 | Initial research compilation |
| 1.1 | 2026-01-29 | Added Appendix A (session telemetry) and Appendix B (toolkit compliance) |
| 1.2 | 2026-01-31 | Updated to v1.8.5; marked evaluation events complete; updated compliance checklist |

---

## Appendix A: Session Telemetry Data

This appendix demonstrates telemetry data captured during the research session that produced this document, showing how observability-toolkit captures EU AI Act-relevant data.

### Session Overview

| Attribute | Value |
|-----------|-------|
| **Session ID** | `a8a71f9f-58de-4733-b912-d677b14f1575` |
| **Model** | `claude-opus-4-5-20251101` |
| **Date** | 2026-01-29 |
| **Messages** | 106 |
| **Total Tokens** | 85,385 |
| **Context Utilization** | 42.7% |

### Token Breakdown

| Category | Tokens |
|----------|--------|
| System Prompt | 8,000 |
| System Tools | 15,000 |
| Messages | 62,385 |
| Cache Read | 85,123 |
| Cache Creation | 252 |

### Cost Tracking

| Metric | Value |
|--------|-------|
| Input Cost | $0.0001 |
| Output Cost | $0.0006 |
| **Total Cost** | $0.0007 |

### Sample Traces Captured

The following traces were captured during this session, demonstrating automatic event logging per Article 12 requirements:

#### 1. MCP Tool Invocations
```
Trace ID: 464192682aa7f9cc25a9fa92bb136768
Span: hook:mcp-pre-tool
Duration: 4.35ms
Attributes:
  - mcp.server: observability-toolkit
  - mcp.tool: obs_query_traces
  - session.id: a8a71f9f-58de-4733-b912-d677b14f1575
  - service.name: claude-code-hooks
```

#### 2. Web Research Tool Usage
```
Trace ID: d856db220dcee13d71c861488e76b9e4
Span: hook:mcp-post-tool
Duration: 2.38ms
Attributes:
  - mcp.server: webresearch
  - mcp.tool: visit_page
  - mcp.success: true
  - session.id: a8a71f9f-58de-4733-b912-d677b14f1575
```

#### 3. File Operations
```
Trace ID: 2711401030067a7d545db286379692a7
Span: hook:builtin-post-tool
Duration: 4.50ms
Attributes:
  - builtin.tool: Write
  - builtin.category: file
  - builtin.success: true
  - session.id: a8a71f9f-58de-4733-b912-d677b14f1575
```

#### 4. Token Metrics Extraction
```
Trace ID: 917fa2b09b9a4e4062bb5ad07737771c
Span: hook:token-metrics-extraction
Duration: 17.07ms
Attributes:
  - tokens.input: 883
  - tokens.output: 185
  - tokens.cache_read: 3,523,578
  - tokens.model: claude-opus-4-5-20251101
```

### Historical Session Data

| Date | Avg Tokens | Sessions |
|------|------------|----------|
| 2026-01-27 | 60,000 | 3 |
| 2026-01-28 | 65,000 | 2 |
| 2026-01-29 | 128,580 | 8 |

---

## Appendix B: observability-toolkit EU AI Act Compliance Assessment

### Compliance Matrix

| EU AI Act Requirement | Article | observability-toolkit Capability | Status |
|-----------------------|---------|----------------------------------|--------|
| **Automatic event logging** | Art. 12(1) | Automatic trace/span recording via OTel | Supported |
| **Session timestamps** | Art. 12(3)(a) | `session.id` + span start/end times | Supported |
| **Tool/database references** | Art. 12(3)(b) | `mcp.server`, `mcp.tool`, `gen_ai.tool.name` | Supported |
| **Input data logging** | Art. 12(3)(c) | Content events, request parameters | Supported |
| **Human verification tracking** | Art. 12(3)(d) | Custom span attributes | Extensible |
| **Log retention (6+ months)** | Art. 19 | `RETENTION_DAYS` configuration | Configurable |
| **Model identification** | Annex XI | `gen_ai.response.model`, `tokens.model` | Supported |
| **Provider identification** | Annex XI | `gen_ai.provider.name`, `gen_ai.system` | Supported |
| **Token usage tracking** | Annex XI | `tokens.input`, `tokens.output`, `gen_ai.usage.*` | Supported |
| **Cost estimation** | Annex XI | Session cost breakdown | Supported |

### Tool Capabilities Summary

#### Query Tools
| Tool | EU AI Act Use Case |
|------|-------------------|
| `obs_query_traces` | Retrieve logged events for compliance audits |
| `obs_query_logs` | Search operational logs by severity/session |
| `obs_query_metrics` | Aggregate usage metrics with percentiles |
| `obs_query_llm_events` | Query LLM-specific events and token usage |
| `obs_query_evaluations` | Query quality evaluation events with aggregations |
| `obs_context_stats` | Session-level context and cost analysis |

#### Compliance Tools
| Tool | EU AI Act Use Case |
|------|-------------------|
| `obs_health_check` | Verify telemetry system operational status |
| `obs_get_trace_url` | Generate shareable trace URLs for audits |
| `obs_setup_claudeignore` | Configure retention and exclusion policies |

### OTel GenAI Semantic Conventions (v1.8.5)

observability-toolkit implements 10/10 OTel GenAI semantic convention attributes:

| Attribute | Implementation |
|-----------|---------------|
| `gen_ai.operation.name` | chat, embeddings, invoke_agent, execute_tool |
| `gen_ai.provider.name` | Fallback chain with `gen_ai.system` |
| `gen_ai.conversation.id` | Session correlation |
| `gen_ai.response.model` | Model version tracking |
| `gen_ai.response.finish_reasons` | Completion status |
| `gen_ai.request.temperature` | Request parameters |
| `gen_ai.request.max_tokens` | Request parameters |
| `gen_ai.tool.name` | Tool identification |
| `gen_ai.tool.call.id` | Tool invocation tracking |
| `gen_ai.agent.id` / `gen_ai.agent.name` | Agent identification |

### Backend Support

| Backend | Traces | Metrics | Logs | Notes |
|---------|--------|---------|------|-------|
| **Local JSONL** | Yes | Yes | Yes | Default, file-based storage |
| **SigNoz Cloud** | Yes | Yes | Yes | OTLP export supported |
| **Langfuse** | Planned | Planned | N/A | Phase 4b roadmap |

### Gaps & Roadmap

| Gap | EU AI Act Relevance | Status |
|-----|--------------------|--------------------|
| ~~Evaluation events~~ | Quality assurance | ✅ Implemented: `obs_query_evaluations` |
| Langfuse export | External audit tools | Planned: Phase 4b OTLP export utility |
| LLM-as-Judge hooks | Automated evaluation | Planned: Phase 4c webhook integration |
| Human verification spans | Art. 12(3)(d) | Extensible via custom span attributes |

### Recommended Configuration for EU AI Act Compliance

```typescript
// Environment variables for EU AI Act compliance
{
  // Retention (Article 19)
  RETENTION_DAYS: 180,              // Minimum 6 months

  // Telemetry paths
  TELEMETRY_DIR: '~/.claude/telemetry',

  // SigNoz integration (optional)
  SIGNOZ_URL: 'https://ingest.us.signoz.cloud',
  SIGNOZ_API_KEY: '<your-key>',

  // Cache settings
  CACHE_TTL_MS: 60000,              // Query cache TTL
}
```

### Conclusion

observability-toolkit v1.8.5 provides substantial coverage for EU AI Act observability requirements:

- **Article 12 (Record-Keeping)**: Full support for automatic event logging, session tracking, and tool invocation recording
- **Article 19 (Log Retention)**: Configurable retention with `RETENTION_DAYS`
- **Annex XI (Technical Documentation)**: Model, provider, and usage metrics captured automatically

**v1.8.5 Security Enhancements** (65+ commits since v1.8.0):
- Circuit breaker for local backend resilience
- SSRF protection with IPv6 zone ID handling
- Rate limiter overflow prevention
- Cloud environment detection warnings
- ~100 negative security test cases
- 2083 total tests (up from ~1700)
