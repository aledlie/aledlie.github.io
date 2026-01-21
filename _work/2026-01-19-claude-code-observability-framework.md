---
layout: single
title: "Claude Code Observability Framework"
date: 2026-01-19
author_profile: true
excerpt: "Production-grade observability system for Claude Code hooks using OpenTelemetry, Langtrace, and SigNoz - featuring distributed tracing, metrics, and correlated logging."
header:
  image: /assets/images/cover-work.png
  teaser: /assets/images/cover-work.png
toc: true
toc_sticky: true
---

A production-grade observability system for Claude Code hooks using OpenTelemetry, Langtrace, and SigNoz.

## Architecture Overview

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

## Components

### 1. OpenTelemetry Core (`hooks/lib/otel.ts`)

**Service Configuration:**
- Service Name: `claude-code-hooks` (via `OTEL_SERVICE_NAME`)
- Service Version: `1.0.0`
- OTLP Endpoint: `https://ingest.us.signoz.cloud`

**Signal Types Exported:**

| Signal  | Local File                        | Remote Endpoint           |
|---------|-----------------------------------|---------------------------|
| Traces  | `telemetry/traces-YYYY-MM-DD.jsonl` | `/v1/traces`             |
| Metrics | N/A (remote only)                 | `/v1/metrics`             |
| Logs    | `telemetry/logs-YYYY-MM-DD.jsonl`   | `/v1/logs`               |

**Key Functions:**

```typescript
import { initTelemetry, shutdown, withSpan, recordMetric, recordGauge, logger } from './lib/otel';

// Initialize at hook start
initTelemetry();

// Create traced operation
await withSpan('operation-name', { 'attr.key': 'value' }, async (span) => {
  // work here is traced
});

// Record metrics
recordMetric('operation.duration', 150, { 'operation.type': 'fetch' });
recordGauge('queue.size', 10, { 'queue.id': 'main' });

// Logging (correlated to active span)
logger.info('Processing complete', { 'items.count': 42 });

// Shutdown at hook end
await shutdown();
```

### 2. Hook Monitor (`hooks/lib/otel-monitor.ts`)

Convenience wrapper that handles the full lifecycle:

```typescript
import { HookMonitor, instrumentHook } from './lib/otel-monitor';

// Full control
const monitor = new HookMonitor('my-hook', { 'env': 'dev' });
await monitor.run(async (ctx) => {
  ctx.addAttribute('files.count', 5);
  ctx.logger.info('Processing started');

  // Child span for sub-operation
  const child = ctx.startChildSpan('fetch-data');
  try {
    await fetchData();
    child.end();
  } catch (error) {
    child.endWithError(error);
  }

  ctx.recordMetric('items.processed', 100);
});

// Quick instrumentation
await instrumentHook('quick-hook', async (ctx) => {
  ctx.logger.info('Hook executed');
});
```

**HookContext Interface:**

| Method | Description |
|--------|-------------|
| `addAttribute(key, value)` | Add attribute to current span |
| `addAttributes(attrs)` | Add multiple attributes |
| `recordEvent(name, attrs)` | Record span event |
| `startChildSpan(name, attrs)` | Create child span |
| `recordMetric(name, value, attrs)` | Record histogram metric |
| `log(level, message, attrs)` | Emit correlated log |
| `logger.{trace,debug,info,warn,error}` | Convenience loggers |

### 3. Langtrace Integration (`hooks/lib/langtrace.ts`)

Auto-instruments LLM API calls (Anthropic, OpenAI, Cohere, etc.):

```typescript
import { initLangtrace } from './lib/langtrace';

initLangtrace({
  serviceName: 'claude-code-example',
  writeToFile: true,
  disableInstrumentations: {
    openai: true  // Disable specific providers
  }
});
```

**Output:** `~/.claude/telemetry/llm-events-YYYY-MM-DD.jsonl`

## Environment Configuration

Set in `~/.claude/.envrc` (loaded by direnv):

```bash
# Infrastructure paths
export CLAUDE_CONFIG_DIR="$HOME/.claude"
export CLAUDE_TELEMETRY_DIR="$CLAUDE_CONFIG_DIR/telemetry"

# OpenTelemetry
export OTEL_ENABLED="true"
export OTEL_EXPORTER_OTLP_ENDPOINT="https://ingest.us.signoz.cloud"
export OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
export OTEL_SERVICE_NAME="claude-code-hooks"

# SigNoz Cloud Authentication
export SIGNOZ_ENABLED="true"
export SIGNOZ_INGESTION_KEY="<from-doppler>"

# Langtrace (optional)
export LANGTRACE_API_KEY="<from-doppler>"
export LANGTRACE_WRITE_TO_FILE="true"
```

**Secrets:** Managed via [Doppler](https://doppler.com) for secure credential handling.

## Instrumented Hooks

| Hook | Trigger | Purpose |
|------|---------|---------|
| `session-start-otel` | SessionStart | Session initialization, env detection |
| `tsc-check-otel` | PreToolUse (Bash) | TypeScript compilation monitoring |
| `stop-build-check-otel` | Stop | Final build verification across repos |
| `error-handling-reminder-otel` | PostToolUse (Bash) | Error stack processing |
| `skill-activation-prompt-otel` | UserPromptSubmit | Skill invocation tracking |
| `mcp-pre-tool-otel` | PreToolUse | MCP tool pre-execution |
| `mcp-post-tool-otel` | PostToolUse | MCP tool results/errors |
| `plugin-pre-tool-otel` | PreToolUse | Plugin invocations |
| `plugin-post-tool-otel` | PostToolUse | Plugin results |
| `agent-pre-tool-otel` | PreToolUse (Task) | Subagent dispatch |
| `agent-post-tool-otel` | PostToolUse (Task) | Subagent completion |

## Metrics Reference

### Hook Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `hook.duration` | Histogram | Hook execution time (ms) |
| `hook.duration.gauge` | Gauge | Current hook duration (alerting) |
| `hook.executions` | Counter | Execution count |

### Tool Metrics

| Metric | Type | Attributes |
|--------|------|------------|
| `mcp.invocations` | Counter | `mcp.server`, `mcp.tool` |
| `agent.invocations` | Counter | `agent.type`, `agent.category`, `agent.model` |
| `plugin.invocations` | Counter | `plugin.server`, `plugin.tool` |

### Build Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `build.check.duration` | Histogram | Per-repo build time |
| `build.errors` | Gauge | Errors per repo |
| `build.total_errors` | Counter | Total errors across repos |

## Span Attributes

Common attributes recorded on spans:

```typescript
// Session spans
'session.id': string
'node.version': string
'npm.version': string
'git.branch': string
'git.uncommitted': boolean

// Hook spans
'hook.name': string
'hook.type': 'session' | 'prompt' | 'tool' | 'stop' | 'error'
'hook.status': 'success' | 'error' | 'skipped'

// Agent spans
'agent.type': string      // e.g., 'Explore', 'Plan', 'code-reviewer'
'agent.category': string  // e.g., 'code', 'testing', 'security'
'agent.model': string     // e.g., 'sonnet', 'opus', 'haiku'
'agent.is_background': boolean
'agent.is_resume': boolean

// MCP spans
'mcp.server': string
'mcp.tool': string
'mcp.input_count': number

// Build spans
'build.repo': string
'build.repos_affected': number
'build.success': boolean
```

## Output Locations

### Local Files

```
~/.claude/telemetry/
  traces-2026-01-19.jsonl     # OpenTelemetry spans
  logs-2026-01-19.jsonl       # OpenTelemetry logs
  llm-events-2026-01-19.jsonl # Langtrace LLM events

~/.claude/logs/
  hook-performance.log        # Legacy performance log

~/.claude/mcp-cache/<session-id>/
  mcp-invocations.log         # MCP tool invocation log

~/.claude/agent-cache/<session-id>/
  agent-invocations.log       # Agent invocation log
```

### SigNoz Cloud

- **Dashboard:** https://tight-ladybird.us.signoz.cloud/
- **Traces:** Traces Explorer with full distributed tracing
- **Metrics:** Custom dashboards and alerting
- **Logs:** Correlated with trace context

## Creating a New Instrumented Hook

1. Create hook file in `~/.claude/hooks/`:

```typescript
#!/usr/bin/env npx ts-node --esm
import { HookMonitor } from './lib/otel-monitor.js';

interface HookInput {
  hook_type: string;
  tool_name?: string;
  tool_input?: Record<string, unknown>;
}

async function main() {
  const input: HookInput = JSON.parse(process.argv[2] || '{}');

  const monitor = new HookMonitor('my-new-hook', {
    'hook.trigger': input.hook_type,
  });

  await monitor.run(async (ctx) => {
    ctx.logger.info('Hook starting', { 'input.type': input.hook_type });

    // Hook logic here

    ctx.addAttribute('result.status', 'success');
    ctx.recordMetric('my_hook.items_processed', 42);
  });
}

main().catch(console.error);
```

2. Register in `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "ToolName",
        "command": "~/.claude/hooks/dist/my-new-hook.js $HOOK_DATA"
      }
    ]
  }
}
```

3. Build and test:

```bash
cd ~/.claude/hooks
npm run build
claude --debug  # Test with verbose output
```

## Alerting (SigNoz)

Example alert for slow hooks (>5s):

{% raw %}
```yaml
alert: SlowHookExecution
expr: hook_duration_gauge > 5000
for: 1m
labels:
  severity: warning
annotations:
  summary: "Hook {{ $labels.hook_name }} taking >5s"
```
{% endraw %}

## Dependencies

```json
{
  "@opentelemetry/sdk-node": "^0.57.0",
  "@opentelemetry/sdk-trace-node": "^1.30.0",
  "@opentelemetry/sdk-metrics": "^1.30.0",
  "@opentelemetry/sdk-logs": "^0.57.2",
  "@opentelemetry/exporter-trace-otlp-http": "^0.57.0",
  "@opentelemetry/exporter-metrics-otlp-http": "^0.57.0",
  "@opentelemetry/exporter-logs-otlp-http": "^0.57.2",
  "@opentelemetry/resources": "^1.30.0",
  "@opentelemetry/semantic-conventions": "^1.28.0",
  "@opentelemetry/api": "^1.9.0",
  "@opentelemetry/api-logs": "^0.57.2",
  "@langtrace/typescript-sdk": "^5.x"
}
```

## Troubleshooting

**No traces in SigNoz:**
- Verify `SIGNOZ_INGESTION_KEY` is set: `echo $SIGNOZ_INGESTION_KEY`
- Check endpoint connectivity: `curl -I https://ingest.us.signoz.cloud`
- Review local exports: `tail ~/.claude/telemetry/traces-$(date +%Y-%m-%d).jsonl`

**Metrics not appearing:**
- Metrics export every 10s; wait for interval
- Check meter is being used: `recordMetric()` or `recordGauge()`

**Logs not correlated:**
- Ensure logging happens within `withSpan()` or `monitor.run()` context
- Use `ctx.logger` instead of raw `console.log`
