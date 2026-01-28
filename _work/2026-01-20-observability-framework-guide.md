---
layout: single
title: "Claude Code Observability Framework Guide"
date: 2026-01-20
author_profile: true
excerpt: "A comprehensive guide to the production-grade observability system for Claude Code hooks using OpenTelemetry, Langtrace, and SigNoz."
header:
  image: /assets/images/cover-work.png
  teaser: /assets/images/cover-work.png
toc: true
toc_sticky: true

# HowTo Schema - Step-by-step setup guide
schema_type: HowTo
schema_total_time: "PT45M"
schema_estimated_cost: "0"
schema_cost_currency: "USD"
schema_tools:
  - "Text editor or IDE"
  - "Terminal"
  - "Node.js runtime"
schema_supplies:
  - "SigNoz Cloud account"
  - "Doppler CLI (optional)"
  - "OpenTelemetry SDK"
schema_steps:
  - name: "Configure environment variables"
    text: "Add OTEL_ENABLED, SIGNOZ_ENABLED, OTEL_EXPORTER_OTLP_ENDPOINT, and SIGNOZ_INGESTION_KEY to ~/.claude/.envrc"
  - name: "Initialize telemetry in your code"
    text: "Import and call initTelemetry() from the otel library at application startup"
  - name: "Wrap operations in spans"
    text: "Use withSpan() to wrap async functions for tracing, passing operation name and attributes"
  - name: "Record custom metrics"
    text: "Use recordMetric() and recordGauge() to track custom application metrics"
  - name: "Add structured logging"
    text: "Use logger.info(), logger.warn(), and logger.error() for correlated log output"
  - name: "Configure Langtrace for LLM tracking"
    text: "Call initLangtrace() to enable automatic LLM provider instrumentation with PII redaction"
  - name: "Verify telemetry export"
    text: "Check ~/.claude/telemetry/ for local JSONL files and SigNoz dashboard for remote data"
---

A comprehensive guide to the production-grade observability system for Claude Code hooks using OpenTelemetry, Langtrace, and SigNoz.

## Overview

This framework provides full visibility into Claude Code hook execution through:

- **Distributed tracing** - Track operations across hook invocations
- **Metrics collection** - Monitor performance and usage patterns
- **Structured logging** - Debug issues with correlated logs
- **LLM instrumentation** - Track token usage and costs

All telemetry exports to both local files (for offline analysis) and SigNoz Cloud (for dashboards and alerting).

---

## Architecture

```
Claude Code Hooks
       │
       ▼
 HookMonitor (otel-monitor.ts)
 • Initializes OpenTelemetry SDK
 • Creates root spans for each hook
 • Records metrics and logs
       │
       ▼
┌─────────────────────────────────────┐
│       Dual Export Pattern           │
├──────────────────┬──────────────────┤
│  Local Files     │  SigNoz Cloud    │
│  JSONL format    │  OTLP/gzip       │
│  ~/.claude/      │  Real-time       │
│  telemetry/      │  dashboards      │
└──────────────────┴──────────────────┘
```

---

## Quick Start

### 1. Environment Setup

Add to `~/.claude/.envrc`:

```bash
# Enable telemetry
export OTEL_ENABLED="true"
export SIGNOZ_ENABLED="true"

# SigNoz Cloud endpoint
export OTEL_EXPORTER_OTLP_ENDPOINT="https://ingest.us.signoz.cloud"
export OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
export OTEL_EXPORTER_OTLP_COMPRESSION="gzip"

# Service identification
export OTEL_SERVICE_NAME="claude-code-hooks"
export OTEL_RESOURCE_ATTRIBUTES="deployment.environment=development,service.version=1.0.0"

# Authentication (from Doppler)
export SIGNOZ_INGESTION_KEY="<your-key>"
```

### 2. Basic Usage

```typescript
import {
  initTelemetry,
  shutdown,
  withSpan,
  recordMetric,
  logger,
  getTraceUrl
} from './lib/otel';

// Initialize at startup
initTelemetry();

// Wrap operations in spans
await withSpan('my-operation', { 'attr.key': 'value' }, async (span) => {
  // Your code here
  logger.info('Processing item', { itemId: 123 });
});

// Record custom metrics
recordMetric('items.processed', 42, { queue: 'main' });

// Get trace link for debugging
console.log(`View trace: ${getTraceUrl()}`);

// Clean shutdown
await shutdown();
```

---

## Core Components

### OpenTelemetry Core (`hooks/lib/otel.ts`)

The foundation providing tracing, metrics, and logging.

| Function | Purpose |
|----------|---------|
| `initTelemetry()` | Initialize SDK with exporters |
| `withSpan(name, attrs, fn)` | Wrap async function in a span |
| `recordMetric(name, value, attrs)` | Record counter metric |
| `recordGauge(name, value, attrs)` | Record gauge metric |
| `logger.info/warn/error()` | Structured logging |
| `getTraceUrl()` | Get SigNoz trace link |
| `getTraceId()` | Get current trace ID |
| `shutdown()` | Graceful cleanup |

### Hook Monitor (`hooks/lib/otel-monitor.ts`)

Simplified instrumentation for hooks via `instrumentHook()`.

```typescript
import { instrumentHook } from './lib/otel-monitor';

instrumentHook('my-hook', async (ctx) => {
  ctx.addAttribute('custom.attr', 'value');
  ctx.recordEvent('processing_started');
  ctx.logger.info('Hook executing');

  // Create child span for sub-operations
  await ctx.startChildSpan('fetch-data', {}, async () => {
    // Nested operation
  });
});
```

### Langtrace (`hooks/lib/langtrace.ts`)

Automatic LLM provider instrumentation with PII protection.

```typescript
import { initLangtrace, recordLLMEvent } from './lib/langtrace';

// Initialize with PII redaction (default)
initLangtrace();

// Or with custom patterns
initLangtrace({
  contentProcessor: createPIIProcessor([
    { pattern: /ACME-\d{6}/g, replacement: '[ACME_ID]' }
  ])
});
```

**Auto-redacted patterns:**
- Email addresses, phone numbers, SSNs
- Credit card numbers, API keys, AWS keys
- JWT tokens, Bearer tokens, passwords

---

## Instrumented Hooks

| Hook | Event | Description |
|------|-------|-------------|
| `session-start-otel.ts` | SessionStart | Session initialization |
| `mcp-pre-tool-otel.ts` | PreToolUse | MCP tool invocation start |
| `mcp-post-tool-otel.ts` | PostToolUse | MCP tool completion |
| `agent-pre-tool-otel.ts` | PreToolUse | Subagent spawn |
| `agent-post-tool-otel.ts` | PostToolUse | Subagent completion |
| `skill-activation-prompt-otel.ts` | UserPromptSubmit | Skill detection |
| `tsc-check-otel.ts` | PostToolUse | TypeScript checks |
| `stop-build-check-otel.ts` | Stop | Build verification |

---

## Metrics Reference

### Hook Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `hook.duration` | Histogram | Execution time distribution |
| `hook.executions` | Counter | Total invocations |
| `mcp.invocations` | Counter | MCP tool calls |
| `agent.invocations` | Counter | Subagent spawns |

### LLM Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `gen_ai.client.token.usage` | Counter | Tokens consumed |
| `gen_ai.client.cost` | Counter | Cost in USD |
| `gen_ai.client.operation.duration` | Histogram | LLM call latency |

### Build Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `build.check.duration` | Histogram | Type check time |
| `build.errors` | Gauge | Error count |

---

## Output Locations

### Local Files

```
~/.claude/telemetry/
├── traces-YYYY-MM-DD.jsonl    # Span data
├── logs-YYYY-MM-DD.jsonl      # Log records
└── llm-events-YYYY-MM-DD.jsonl # LLM calls
```

### Remote Dashboard

**URL:** https://tight-ladybird.us.signoz.cloud/

### Available Dashboards

| Dashboard | Purpose |
|-----------|---------|
| Claude Code Hooks Observability | Core hook performance |
| Token Usage & Cost Efficiency | LLM consumption tracking |
| Tool & MCP Usage Analytics | MCP server/tool usage |
| Error & Anomaly Detection | Error monitoring |
| Subagent Analytics | Agent invocations |
| Session Health Overview | Session activity |

---

## Configuration Options

### Trace Sampling

Control telemetry volume with sampling:

```bash
# Development - capture everything
export OTEL_TRACES_SAMPLER="always_on"

# Production - 10% sampling
export OTEL_TRACES_SAMPLER="parentbased_traceidratio"
export OTEL_TRACES_SAMPLER_ARG="0.1"
```

### Debug Mode

Enable verbose SDK logging:

```bash
export OTEL_LOG_LEVEL="debug"
```

### Circuit Breaker

Built-in protection when SigNoz is unreachable:
- Trips after 3 consecutive failures
- Resets after 60 seconds
- Fails fast to prevent request blocking

---

## Troubleshooting

### No data in SigNoz

1. Check `OTEL_ENABLED="true"` and `SIGNOZ_ENABLED="true"`
2. Verify `SIGNOZ_INGESTION_KEY` is set
3. Enable debug: `OTEL_LOG_LEVEL="debug"`
4. Check local files exist in `~/.claude/telemetry/`

### High latency on exports

1. Ensure compression: `OTEL_EXPORTER_OTLP_COMPRESSION="gzip"`
2. Reduce sampling in production
3. Check for circuit breaker trips in logs

### Missing LLM traces

1. Verify `initLangtrace()` called at startup
2. Check `LANGTRACE_WRITE_TO_FILE="true"` for local debugging
3. Confirm provider is supported (OpenAI, Anthropic, Bedrock, etc.)

---

## Related Documentation

- [SigNoz Cloud Setup](./signoz-cloud-setup.md) - Initial configuration
- [Context Management](./CONTEXT_MANAGEMENT.md) - Claude Code optimization
- MCP Tools: `signoz_list_services`, `signoz_search_metric_by_text`
