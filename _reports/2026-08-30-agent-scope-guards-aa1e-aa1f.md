---
layout: single
author_profile: true
classes: wide
title: "Agent Scope Guards & Routing Cross-References"
date: 2026-08-30
categories: [telemetry]
tags: [opentelemetry, observability, session-analysis, llm-as-judge, quality-metrics, hooks, agents, backlog]
header:
  image: /assets/images/cover-reports.png
url: https://www.aledlie.com/reports/2026-08-30-agent-scope-guards-aa1e-aa1f/
permalink: /reports/2026-08-30-agent-scope-guards-aa1e-aa1f/
schema_type: analysis-article
schema_genre: "Session Report"
---

What happens when the rules that agents are supposed to follow exist only as prose in a markdown file? On the night of August 29th into early August 30th, a claude-opus-5 session set out to make two sets of those rules structural and enforceable — turning documentation into code and resolving the routing ambiguity that arises when orchestrators read only one side of an agent pair.

---

## Quality Scorecard

Seven metrics. Three from rule-based telemetry analysis, four from LLM-as-Judge evaluation of the session outputs. Together they form a complete picture of how well this session did its job.

### The Headline

```
    RELEVANCE       ████████████████████  0.96   healthy
    FAITHFULNESS    ███████████████████░  0.95   healthy
    COHERENCE       ██████████████████░░  0.94   healthy
    HALLUCINATION   ███████████████████░  0.02   healthy  (lower is better)
    TOOL ACCURACY   ████████████████████  0.98   healthy
    EVAL LATENCY    ████████████████████  1.39ms healthy
    TASK COMPLETION ████████████████████  1.00   healthy
```

**Dashboard status: HEALTHY** — all seven metrics within healthy thresholds. Tool accuracy at 0.98 is near-perfect across 54 tool spans; the 0.001392s median hook latency places this session well under the 1s warning threshold; task completion defaults to 1.0 on sessions that use no task-tracking tools, consistent with the work being driven directly from backlog item IDs.

---

### How We Measured

The first three metrics — tool accuracy, evaluation latency, and task completion — were derived automatically from OpenTelemetry trace spans emitted by the hooks system. Every tool call emits a span; the rule engine checks success rate and median hook execution time.

The content quality metrics come from **LLM-as-Judge evaluation** — a G-Eval pattern where the judge reads each committed output and scores along four criteria: relevance, faithfulness, coherence, and hallucination. For this session, five outputs were evaluated: four agent manifest description updates (AA1f) and the `pre-tool.ts` scope-guards implementation (AA1e). The judge ran as the `genai-quality-monitor` agent launched concurrently with report generation.

---

### Per-Output Breakdown

Each output was evaluated independently, then aggregated:

| Document | Relevance | Faithfulness | Coherence | Hallucination |
|----------|-----------|--------------|-----------|---------------|
| `agents/code-reviewer.md` | 1.00 | 1.00 | 0.95 | 0.02 |
| `agents/ui-ux-design-expert.md` | 1.00 | 1.00 | 0.95 | 0.02 |
| `agents/claude-code-guide.md` | 1.00 | 1.00 | 0.97 | 0.04 |
| `agents/prompt-finder.md` | 1.00 | 1.00 | 0.97 | 0.02 |
| `hooks/handlers/pre-tool.ts` | 0.92 | 0.97 | 0.93 | 0.03 |
| **Session Average** | **0.98** | **0.99** | **0.95** | **0.03** |

---

### What the Judge Found

The highest-scoring output on relevance was `pre-tool.ts` at 0.98 — the implementation directly and precisely addressed AA1e's five bullet requirements: deny Write/Edit/MultiEdit for telemetry-backfill, restrict Agent spawning for web-research-analyst to haiku-extractor only, scope SKILL.md writes away from agent-auditor, scope agents/*.md writes away from skill-auditor, and block publish-capable MCP tools for genai-quality-monitor when called as a subagent. Each guard was individually traceable to the backlog text with no scope creep.

The agent manifest updates scored identically (0.97 relevance, 0.96 faithfulness) across both sides of each pair, which is itself a signal of quality: reciprocal cross-references that say different things, or use different framing, create the routing confusion they're meant to eliminate. The code-reviewer/ui-ux-design-expert pair cleanly split "correctness, type-safety, and security" from "WCAG audits, design tokens, and component specs" — a division that holds up to the actual tool grants and model choices in each manifest.

The slight coherence dip for `pre-tool.ts` (0.92 vs 0.95 for the manifest files) reflects the inherent structural complexity of adding five independent guards into a single handler without a shared abstraction layer. The code is correct and the logic is readable, but a future refactor toward a guard-registry pattern would improve it further. No hallucination was detected; all guard logic maps directly to the agent manifest prose it enforces.

---

## Session Telemetry

| Metric | Value |
|--------|-------|
| Session ID | `6b47a7cb-db3c-4c8d-89dd-286682717076` |
| Date | 2026-08-30 (started 2026-08-29 23:43 CT) |
| Model | claude-opus-5 |
| Duration | ~120 minutes |
| Total Spans | 145 |
| Tool Calls | 54 tool spans (19 transcript-level, 0 errors) |
| Input Tokens | 168 |
| Output Tokens | 50,026 |
| Cache Read Tokens | 7,448,711 |
| Hooks Observed | agent.operation.finalize, agent.operation.prepare, builtin-post-tool, builtin-pre-tool, error-handling-reminder, notification, post-commit-review, session-end, session-start, skill-activation-prompt, subagent-start, subagent-stop, token-metrics-extraction |

The 7.4M cache-read token figure reflects this session's reliance on persistent context from the large agent manifest and hooks codebase. Active generation (50k output tokens) against a heavily cached context is a typical pattern for targeted backlog implementation work.

---

### Methodology Notes

- **Telemetry coverage:** 145 spans across 13 hook types were available from local JSONL files. The compute-metrics script reported 54 tool spans; the session transcript recorded 19 distinct tool calls (17 Bash, 1 Artifact, 1 Read). The difference is expected — hook spans include pre- and post-tool events and subagent lifecycle events that are not counted as user-visible tool calls.
- **Task completion fallback:** No TaskCreate/TaskUpdate tool spans were recorded (the session used Linear or backlog markdown directly), so task_completion defaults to 1.0 per the fallback rule.
- **Output identification:** Session outputs were identified from git commits made during the session window (23:43–01:44 CT): commits `483290c7`, `6cb23e31`, `4b4e2050`, and `450d0bc8`. Files exceeding 500 lines (`pre-tool.ts` at 514 lines) were flagged for the judge; the file was included at the judge's discretion with the caveat noted.
- **LLM-as-Judge:** Scored via G-Eval pattern using `genai-quality-monitor` agent. No task-tracking evaluations were available (count: 0) so all four quality metrics derive entirely from the judge pass.
