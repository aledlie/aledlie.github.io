---
layout: single
title: "Claude Code Observability Framework: Production-Ready Implementation Complete"
date: 2026-01-20
author_profile: true
categories: [observability, opentelemetry, monitoring]
tags: [otel, signoz, langtrace, typescript, hooks, tracing, metrics, logging]
excerpt: "Complete implementation of production-grade observability for Claude Code hooks using OpenTelemetry, Langtrace, and SigNoz Cloud with 8 dashboards and comprehensive instrumentation."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
---


**Session Date**: 2026-01-20<br>
**Project**: Claude Code Dev Environment<br>
**Focus**: Observability framework status and capabilities overview<br>
**Session Type**: Completion verification

## Executive Summary

The Claude Code observability framework is now **production-ready** with all four implementation phases complete. The system provides unified tracing, metrics, and logging for Claude Code hooks using OpenTelemetry as the foundation, Langtrace for LLM-specific instrumentation, and SigNoz Cloud as the observability backend.

The framework instruments **12 hook types** across session, prompt, tool, stop, and error events. It exports telemetry via a **dual export pattern**—local JSONL files for offline analysis and OTLP to SigNoz Cloud for real-time dashboards. Key reliability features include circuit breaker protection, gzip compression, and configurable trace sampling.

**Key Metrics:**

| Metric | Value |
|--------|-------|
| **Instrumented Hooks** | 12 |
| **SigNoz Dashboards** | 8 |
| **Implementation Phases** | 4/4 Complete |
| **Metrics Tracked** | 15+ |
| **LLM Span Attributes** | 11 auto-instrumented |

## Architecture

```
Claude Code Hooks
        |
        v
  HookMonitor (otel-monitor.ts)
  - Initializes OTel SDK
  - Creates root span
  - Records metrics/logs
        |
        v
+-------------------------------------------+
|         Dual Export Pattern               |
+-------------------------------------------+
|  Local File Export    |   Remote OTLP     |
|  (FileSpanExporter)   |   (SigNoz Cloud)  |
|  JSONL Format         |   TLS + Auth      |
|  ~/.claude/telemetry/ |   ingestion key   |
+-------------------------------------------+
        |                       |
        v                       v
   Local Cache           SigNoz Dashboard
   (JSONL files)         (traces, metrics, logs)
```

## Core Components

### 1. OpenTelemetry Core (`hooks/lib/otel.ts`)

| Feature | Status |
|---------|--------|
| NodeSDK initialization | ✅ Complete |
| FileSpanExporter (JSONL) | ✅ Complete |
| FileLogExporter (JSONL) | ✅ Complete |
| OTLP trace/metric/log export | ✅ Complete |
| SigNoz auth headers | ✅ Complete |
| Graceful shutdown | ✅ Complete |
| Trace URL/ID helpers | ✅ Complete |
| OTLP gzip compression | ✅ Complete |
| Resource detectors | ✅ Complete |
| Debug mode | ✅ Complete |
| Span links | ✅ Complete |
| Circuit breaker | ✅ Complete |
| Trace sampling | ✅ Complete |

**Key Functions:**
```typescript
import {
  initTelemetry, shutdown, withSpan,
  recordMetric, recordGauge, logger,
  getTraceUrl, getTraceId
} from './lib/otel';

initTelemetry();
await withSpan('operation-name', { 'attr.key': 'value' }, async (span) => { ... });
recordMetric('operation.duration', 150, { 'operation.type': 'fetch' });
const traceUrl = getTraceUrl();  // https://tight-ladybird.us.signoz.cloud/trace/<id>
await shutdown();
```

### 2. Hook Monitor (`hooks/lib/otel-monitor.ts`)

| Feature | Status |
|---------|--------|
| HookMonitor class | ✅ Complete |
| HookContext interface | ✅ Complete |
| instrumentHook helper | ✅ Complete |
| Legacy log compat | ✅ Complete |
| Hook type inference | ✅ Complete |

**HookContext Methods:**
- `addAttribute(key, value)` / `addAttributes(attrs)`
- `recordEvent(name, attrs)`
- `startChildSpan(name, attrs)` / `startLinkedSpan(name, linkedSpans, attrs)`
- `recordMetric(name, value, attrs)`
- `logger.{trace,debug,info,warn,error}`

### 3. Langtrace Integration (`hooks/lib/langtrace.ts`)

| Feature | Status |
|---------|--------|
| SDK initialization | ✅ Complete |
| SigNoz Cloud routing | ✅ Complete |
| Local file export | ✅ Complete |
| Instrumentation toggles | ✅ Complete |
| `recordLLMEvent()` | ✅ Complete |
| `withLLMTrace()` | ✅ Complete |
| PII redaction | ✅ Complete |
| Custom processors | ✅ Complete |

**PII Redaction Patterns:**

| Pattern | Replacement |
|---------|-------------|
| Email addresses | `[EMAIL]` |
| Phone numbers | `[PHONE]` |
| SSN | `[SSN]` |
| Credit card numbers | `[CREDIT_CARD]` |
| API keys | `[API_KEY]` |
| AWS access keys | `[AWS_KEY]` |
| IPv4 addresses | `[IP_ADDRESS]` |
| JWT tokens | `[JWT_TOKEN]` |
| Bearer tokens | `Bearer [TOKEN]` |
| Generic secrets | `[REDACTED_SECRET]` |

### 4. Token/Cost Metrics (`hooks/lib/token-metrics.ts`)

| Feature | Status |
|---------|--------|
| Token usage counter | ✅ Complete |
| Cost counter (USD) | ✅ Complete |
| Operation duration histogram | ✅ Complete |
| Operation counter | ✅ Complete |
| Model pricing table | ✅ Complete |
| LLMMetricsTracker class | ✅ Complete |
| GenAI semantic conventions | ✅ Complete |

## Instrumented Hooks

| Hook File | Event | Status |
|-----------|-------|--------|
| `session-start-otel.ts` | SessionStart | ✅ |
| `mcp-pre-tool-otel.ts` | PreToolUse (MCP) | ✅ |
| `mcp-post-tool-otel.ts` | PostToolUse (MCP) | ✅ |
| `plugin-pre-tool-otel.ts` | PreToolUse (Plugin) | ✅ |
| `plugin-post-tool-otel.ts` | PostToolUse (Plugin) | ✅ |
| `agent-pre-tool-otel.ts` | PreToolUse (Agent) | ✅ |
| `agent-post-tool-otel.ts` | PostToolUse (Agent) | ✅ |
| `skill-activation-prompt-otel.ts` | UserPromptSubmit | ✅ |
| `tsc-check-otel.ts` | PostToolUse | ✅ |
| `stop-build-check-otel.ts` | Stop | ✅ |
| `error-handling-reminder-otel.ts` | Stop | ✅ |
| `hook-runner.ts` | Unified router | ✅ |

## Metrics Reference

### Hook Metrics

| Metric | Type | Attributes |
|--------|------|------------|
| `hook.duration` | Histogram | `hook.name`, `hook.status` |
| `hook.duration.gauge` | UpDownCounter | `hook.name`, `hook.status` |
| `hook.executions` | Counter | `hook.name`, `hook.status` |
| `hook.duration.max` | Gauge | `hook.name` |
| `hook.duration.min` | Gauge | `hook.name` |

### Tool/Agent Metrics

| Metric | Type | Attributes |
|--------|------|------------|
| `mcp.invocations` | Counter | `mcp.server`, `mcp.tool` |
| `agent.invocations` | Counter | `agent.type`, `agent.category`, `agent.model` |
| `plugin.invocations` | Counter | `plugin.server`, `plugin.tool` |

### Build Metrics

| Metric | Type | Attributes |
|--------|------|------------|
| `build.check.duration` | Histogram | `build.repo` |
| `build.errors` | Gauge | `build.repo` |

### GenAI Metrics

| Metric | Type | Attributes |
|--------|------|------------|
| `gen_ai.client.token.usage` | Counter | `gen_ai.request.model`, `gen_ai.token.type` |
| `gen_ai.client.cost` | Counter | `gen_ai.request.model` |
| `gen_ai.client.operation.duration` | Histogram | `gen_ai.request.model`, `gen_ai.operation.name` |

### Langtrace Auto-Instrumented Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `gen_ai.system` | string | Provider (anthropic, openai, etc.) |
| `gen_ai.request.model` | string | Model identifier |
| `gen_ai.request.max_tokens` | int | Max tokens requested |
| `gen_ai.request.temperature` | float | Temperature setting |
| `gen_ai.request.top_p` | float | Top-p sampling |
| `gen_ai.usage.input_tokens` | int | Input tokens used |
| `gen_ai.usage.output_tokens` | int | Output tokens used |
| `gen_ai.response.finish_reason` | string | stop, length, tool_calls |
| `llm.request.type` | string | chat, completion, embedding |
| `gen_ai.prompt` | string | Prompt (PII redacted) |
| `gen_ai.completion` | string | Response (PII redacted) |

## SigNoz Dashboards

| Dashboard | UUID | Description |
|-----------|------|-------------|
| Claude Code Hooks Observability | `019ba681-...` | Core hook performance |
| Claude Code Hooks Performance | `019bd87e-...` | Duration and status distribution |
| Token Usage & Cost Efficiency | `019bdcb8-...` | LLM consumption and costs |
| Tool & MCP Usage Analytics | `019bdcdd-...` | MCP server/tool usage |
| Error & Anomaly Detection | `019bdce0-...` | Error monitoring |
| Build & Type Check Performance | `019bddd3-...` | TSC/Python metrics |
| Subagent Analytics | `019bddd7-...` | Agent invocations |
| Session Health Overview | `019bddd8-...` | Session activity |

## Output Locations

**Local Files:**
```
~/.claude/telemetry/
  traces-YYYY-MM-DD.jsonl     # OpenTelemetry spans
  logs-YYYY-MM-DD.jsonl       # OpenTelemetry logs
  llm-events-YYYY-MM-DD.jsonl # Langtrace LLM events

~/.claude/logs/
  hook-performance.log        # Legacy performance log
```

**Remote:** https://tight-ladybird.us.signoz.cloud/

## Environment Configuration

```bash
# Infrastructure paths
export CLAUDE_CONFIG_DIR="$HOME/.claude"
export CLAUDE_TELEMETRY_DIR="$CLAUDE_CONFIG_DIR/telemetry"

# OpenTelemetry
export OTEL_ENABLED="true"
export OTEL_EXPORTER_OTLP_ENDPOINT="https://ingest.us.signoz.cloud"
export OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
export OTEL_EXPORTER_OTLP_COMPRESSION="gzip"
export OTEL_SERVICE_NAME="claude-code-hooks"

# SigNoz Cloud
export SIGNOZ_ENABLED="true"
export SIGNOZ_INGESTION_KEY="<from-doppler>"

# Langtrace
export LANGTRACE_API_KEY="<from-doppler>"
export LANGTRACE_WRITE_TO_FILE="true"
export LANGTRACE_PII_REDACTION="true"
```

## Implementation Phases

### Phase 1: Quick Wins - COMPLETE
- [x] OTLP gzip compression
- [x] `getTraceUrl()` and `getTraceId()` helpers
- [x] Debug mode documentation
- [x] Resource detectors for host/OS/process
- [x] `startLinkedSpan()` for operation correlation
- [x] Sampling configuration docs

### Phase 2: Reliability - COMPLETE
- [x] Circuit breaker for OTLP export (3 failures, 60s reset)
- [x] Export timeout configuration (`OTEL_EXPORTER_OTLP_TIMEOUT=5000`)

### Phase 3: Langtrace Enhancements - COMPLETE
- [x] PII redaction processor with 10 pattern types
- [x] Streaming instrumentation verified (SDK supports 6 providers)
- [x] Langtrace metrics documented in reference

### Phase 4: Dashboards & Alerts - COMPLETE
- [x] 8 SigNoz dashboard templates
- [x] 5 alert rule types documented
- [x] MCP query format documented

## Key Decisions

### Decision 1: Dual Export Pattern
**Choice**: Export to both local JSONL files and SigNoz Cloud
**Rationale**: Local files enable offline analysis and debugging; cloud enables real-time dashboards
**Trade-off**: Slight storage overhead for redundancy

### Decision 2: PII Redaction Default Enabled
**Choice**: Enable PII redaction by default in Langtrace
**Rationale**: Prevents accidental sensitive data exposure in LLM traces
**Trade-off**: Minor processing overhead, can be disabled with `LANGTRACE_PII_REDACTION=false`

### Decision 3: Circuit Breaker for Exports
**Choice**: Fail fast after 3 consecutive export failures, reset after 60s
**Rationale**: Prevents hook slowdown when SigNoz is unreachable
**Trade-off**: May miss telemetry during outages (local files still capture)

## References

### Code Files
- `hooks/lib/otel.ts` - OpenTelemetry core
- `hooks/lib/otel-monitor.ts` - Hook instrumentation
- `hooks/lib/langtrace.ts` - LLM tracing
- `hooks/lib/token-metrics.ts` - Cost tracking

### Documentation
- `docs/observability-framework-current.md` - Full technical reference
- `docs/signoz-cloud-setup.md` - SigNoz configuration
