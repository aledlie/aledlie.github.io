# Backlog

## High Priority

- [x] **B1** — Add OTEL-driven self-optimization to minimal-mistakes-theme skill
  - Parse OTEL telemetry spans (`plugin-pre-tool`/`plugin-post-tool`) to track skill activation frequency, conversion rate, and token cost
  - Build activation-conversion funnel: how often the skill is triggered vs. produces a useful result
  - Auto-tune `SKILL.md` description and trigger keywords based on low-conversion patterns
  - Add threshold checks: flag when activation rate drops or token burn per invocation exceeds budget
  - Store optimization state in `~/.claude/otel-improvement-state.json` (follow otel-improvement pattern)
  - Output a scorecard after each optimization pass (activations, conversions, avg tokens, score delta)
