---
layout: single
title: "Claude Code Hooks Architecture Inventory"
date: 2026-03-10
author_profile: true
categories: [hooks, observability]
tags: [claude-code, hooks, otel, telemetry, typescript, architecture, mcp]
excerpt: "Complete inventory of the Claude Code hooks system: 7 hook events, 7 handlers, 28 library modules, and their dependency graph across the session lifecycle."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
---

**Session Date**: 2026-03-10<br>
**Project**: claude-dev-environment (`~/.claude/hooks/`)<br>
**Focus**: Hooks architecture inventory and dependency mapping<br>
**Session Type**: Documentation

## Executive Summary

Audited the full Claude Code hooks system to produce a consolidated reference of all hook events, handler files, library modules, and their dependency relationships. The system comprises 7 hook events routed through a single `hook-runner.js` entry point, backed by 7 handler source files and 28 library modules. Each library was mapped to the specific hook event(s) that consume it, with 8 libraries identified as ad-hoc/cross-cutting utilities not tied to any single event.

| Metric | Count |
|--------|-------|
| Registered hook events | 6 |
| Handler source files | 7 |
| Library modules | 28 |
| Standalone dist scripts | 4 |
| Event-specific libraries | 17 |
| Cross-cutting libraries | 8 |

## Hook Events and Handlers

All hooks route through `~/.claude/node-shim.sh ~/.claude/hooks/dist/hook-runner.js <hook-type>`, which reads JSON from stdin and dispatches to the appropriate handler.

### SessionStart

**Handler**: `handlers/session-start.ts`<br>
**Matcher**: `(all)`<br>
**Command**: `hook-runner.js session-start`

Sets up each new coding session by checking the development environment, restoring any in-progress task state, and clearing stale data from previous sessions.

**Libraries used**: otel-monitor, constants, context-tracker, task-tracker, agent-context, file-utils, quality-sampler, mcp-status (reset)

### PreToolUse

**Handler**: `handlers/pre-tool.ts`<br>
**Matcher**: `mcp__.*|Skill|Agent|Task`<br>
**Command**: `hook-runner.js pre-tool`

Records telemetry just before Claude invokes a tool, tracking what was called and saving context so related actions can be linked together later. Routes internally to MCP, Plugin, Agent, or Built-in sub-handlers based on tool name.

**Libraries used**: otel-monitor, constants, trace-context, categorizers, parsers, cache-tracker, agent-context

### PostToolUse

**Handler**: `handlers/post-tool.ts`<br>
**Matcher**: `Read|Glob|Grep|Write|Edit|MultiEdit|NotebookEdit|Bash|WebFetch|WebSearch|TaskCreate|TaskUpdate|mcp__.*|Skill|Agent|Task`<br>
**Command**: `hook-runner.js post-tool`

The central switchboard that runs after every tool action, routing to specialized handlers that perform type checking, lint code, analyze code structure, review commits, and update task progress. Routing priority: MCP > plugin > agent > McpResource > Write > Edit/MultiEdit > Bash > builtin fallback.

**Libraries used**: otel-monitor, constants, otel, file-utils, categorizers, parsers, output-analyzer, cache-tracker, repo-utils, mcp-config, type-check-cache, mcp-status, task-tracker, exponential-backoff, mcp-completeness, quality-signals, agent-context, synth-spans

### Stop

**Handler**: `handlers/stop.ts`<br>
**Matcher**: `(all)`<br>
**Command**: `hook-runner.js stop`

Wraps up the session by running final build checks, tallying token usage, firing any telemetry alerts, and optionally scoring session quality with an LLM-based evaluator.

**Libraries used**: otel-monitor, constants, otel, file-utils, output-analyzer, type-check-cache, categorizers, token-metrics, mcp-completeness, telemetry-alerts, task-tracker, quality-signals, quality-sampler, quality-budget, transcript-parser

### UserPromptSubmit

**Handler**: `handlers/user-prompt.ts`<br>
**Matcher**: `(all)`<br>
**Command**: `hook-runner.js user-prompt`

Fires each time the user sends a message, measuring how much of the context window is in use and tagging the prompt so downstream tool calls can be traced back to it.

**Libraries used**: otel-monitor, constants, context-tracker, trace-context

### Notification

**Handler**: `handlers/notification.ts`<br>
**Matcher**: `(all)`<br>
**Command**: `hook-runner.js notification`

Catches system notifications, sorts them by severity, and records errors as exceptions in telemetry so problems surface in dashboards.

**Libraries used**: otel-monitor, constants, categorizers

### MCP Status (sub-handler)

**Handler**: `handlers/mcp-status.ts`<br>
**Called from**: PostToolUse (on MCP tool errors)

Detects when an external MCP tool server fails to start or respond, logs which servers are down, and reports the failures with configuration details.

**Libraries used**: otel-monitor

## Library Modules

### Foundational

Used by all or most handlers as core infrastructure.

| Module | Description |
|--------|-------------|
| `otel-monitor.ts` | Wraps every hook handler in an instrumented span that automatically captures timing, logs, and errors |
| `constants.ts` | Central home for shared threshold values, tool name lists, and helper functions that resolve agent and skill source types |
| `otel.ts` | Initializes the OpenTelemetry tracer, meter, and logger providers and exposes a convenience function for recording metrics |
| `circuit-breaker.ts` | Stops calling failing external services after repeated errors and automatically retries once conditions improve. Used by `otel.ts` |

### Event-Specific

Each module is tied to one or more hook events.

| Module | Events | Description |
|--------|--------|-------------|
| `context-tracker.ts` | SessionStart, UserPromptSubmit | Estimates how much of the context window has been consumed by looking at transcript size and API response data |
| `task-tracker.ts` | SessionStart, PostToolUse, Stop | Saves task progress to disk so it persists even when earlier conversation history gets compacted away |
| `agent-context.ts` | SessionStart, PreToolUse, PostToolUse | Holds pending agent invocation data in memory so the pre-tool and post-tool hooks can produce a single consolidated span per agent call |
| `trace-context.ts` | PreToolUse, UserPromptSubmit | Stores the current prompt's trace ID so that any tool spans triggered by that prompt can be linked back to it |
| `categorizers.ts` | PreToolUse, PostToolUse, Stop, Notification | Classifies tools, skills, agents, files, and notifications into human-readable semantic categories for cleaner telemetry |
| `parsers.ts` | PreToolUse, PostToolUse | Extracts structured details like server name and skill identity from raw MCP tool names and inputs |
| `cache-tracker.ts` | PreToolUse, PostToolUse | Keeps a running count of how many times each tool has been called during a session, persisted to a cache directory |
| `output-analyzer.ts` | PostToolUse, Stop | Scans tool output for error messages, warnings, and success patterns to determine whether a tool call succeeded |
| `repo-utils.ts` | PostToolUse | Locates project root directories and resolves the correct TypeScript or Python commands for type checking |
| `mcp-config.ts` | PostToolUse | Reads MCP server configuration from `.mcp.json` files and determines whether each server is project-scoped or global |
| `type-check-cache.ts` | PostToolUse, Stop | Caches recent type-check results so the same file isn't re-checked unnecessarily within a short window |
| `mcp-completeness.ts` | PostToolUse, Stop | Compares which MCP tools were actually used against the full set of configured tools to measure coverage |
| `quality-signals.ts` | PostToolUse, Stop | Emits heuristic metrics about tool correctness and logical coherence across a sequence of actions |
| `synth-spans.ts` | PostToolUse | Creates synthetic telemetry spans that represent full agent lifecycles assembled from individual tool calls |
| `token-metrics.ts` | Stop | Extracts token counts from API responses and records them as telemetry metrics |
| `telemetry-alerts.ts` | Stop | Checks session metrics against predefined alert rules and fires warnings when thresholds are exceeded |
| `quality-sampler.ts` | SessionStart, Stop | Uses probabilistic sampling to decide which sessions undergo a full quality evaluation |
| `quality-budget.ts` | Stop | Caps how much compute the quality evaluator can spend on any single session |
| `transcript-parser.ts` | Stop | Pulls conversation turns from the session transcript and samples a subset for quality evaluation |
| `metric-registry.ts` | (via token-metrics, context-tracker) | Maintains a registry of custom metrics so they can be reused without re-declaration |

### Ad-Hoc / Cross-Cutting

Utility modules not tied to a specific hook event. Called by handlers or other libraries as needed.

| Module | Consumers | Description |
|--------|-----------|-------------|
| `file-utils.ts` | SessionStart, PostToolUse, Stop | Provides safe JSON read/write helpers and ensures directories exist before writing |
| `exponential-backoff.ts` | PostToolUse | Detects rate-limit responses and signals callers to back off |
| `error-handling-utils.ts` | `error-handling-reminder.ts` (standalone) | Standardizes how errors are classified, formatted, and reported |
| `skill-matching.ts` | `skill-activation-prompt.ts` (standalone) | Matches incoming skill names against a registry of known skill definitions |
| `load-envrc.ts` | (available, unused) | Loads environment variables from `.envrc` files so hooks can pick up project-specific configuration |
| `langtrace.ts` | (example only) | Integrates with Langtrace to add LLM-specific observability on top of the base telemetry |

## Standalone Dist Scripts

These compiled scripts live in `hooks/dist/` outside the handler/lib structure:

| Script | Purpose |
|--------|---------|
| `hook-runner.js` | Main entry point; dispatches stdin JSON to the appropriate handler |
| `error-handling-reminder.js` | Standalone error handling reminder (uses `error-handling-utils.ts`) |
| `session-start-otel.js` | Standalone OTEL-focused session start variant |
| `skill-activation-prompt.js` | Standalone skill activation prompt checker (uses `skill-matching.ts`) |
| `skill-activation-prompt-otel.js` | OTEL-instrumented variant of skill activation prompt |

## Dependency Heat Map

Which libraries are most widely shared across hook events:

| Library | Events Using It |
|---------|----------------|
| `otel-monitor.ts` | All 7 |
| `constants.ts` | All 7 |
| `categorizers.ts` | 4 (PreToolUse, PostToolUse, Stop, Notification) |
| `task-tracker.ts` | 3 (SessionStart, PostToolUse, Stop) |
| `agent-context.ts` | 3 (SessionStart, PreToolUse, PostToolUse) |
| `file-utils.ts` | 3 (SessionStart, PostToolUse, Stop) |
| `cache-tracker.ts` | 2 (PreToolUse, PostToolUse) |
| `parsers.ts` | 2 (PreToolUse, PostToolUse) |
| `context-tracker.ts` | 2 (SessionStart, UserPromptSubmit) |
| `trace-context.ts` | 2 (PreToolUse, UserPromptSubmit) |
| `output-analyzer.ts` | 2 (PostToolUse, Stop) |
| `type-check-cache.ts` | 2 (PostToolUse, Stop) |
| `mcp-completeness.ts` | 2 (PostToolUse, Stop) |
| `quality-signals.ts` | 2 (PostToolUse, Stop) |
| `quality-sampler.ts` | 2 (SessionStart, Stop) |
| `otel.ts` | 2 (PostToolUse, Stop) |

## Files Analyzed

- `~/.claude/settings.json` — Hook registrations
- `~/.claude/hooks/handlers/session-start.ts` (287 lines)
- `~/.claude/hooks/handlers/pre-tool.ts` (364 lines)
- `~/.claude/hooks/handlers/post-tool.ts` (~1200 lines)
- `~/.claude/hooks/handlers/stop.ts` (~1100 lines)
- `~/.claude/hooks/handlers/user-prompt.ts` (289 lines)
- `~/.claude/hooks/handlers/notification.ts` (57 lines)
- `~/.claude/hooks/handlers/mcp-status.ts` (231 lines)
- `~/.claude/hooks/dist/hook-runner.js` (entry point)
- 28 library modules in `~/.claude/hooks/lib/`

## References

- [CLAUDE.md hooks architecture section](~/.claude/CLAUDE.md)
- Hook runner entry point: `~/.claude/hooks/dist/hook-runner.js`
- Node shim: `~/.claude/node-shim.sh`
