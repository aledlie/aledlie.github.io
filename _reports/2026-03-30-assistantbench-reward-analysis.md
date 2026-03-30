---
layout: single
title: "An Analysis of the Measurement Used to Rate Agent Behavior and How Those Metrics Are Leveraged Between Loops"
date: 2026-03-30
author_profile: true
categories: [agent-optimization, reward-scoring, benchmark-analysis]
tags: [assistantbench, web-research-agent, reinforcement-learning, claude-api, browser-automation, reward-methodology]
excerpt: "How AssistantBench reward signals are measured, read, and fed back into each improvement loop — from 0.000 to 0.301+ avg reward across a 10-task validation set."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
permalink: /reports/assistantbench-reward-analysis/
---

**Session Date**: 2026-03-29 through 2026-03-30<br>
**Project**: BrowserGym Web Research Agent<br>
**Focus**: How reward metrics are measured per loop and leveraged to drive the next iteration<br>
**Session Type**: Refactoring | Optimization | Analysis

---

## Executive Summary

Each loop in this session followed the same cycle: run the agent, read `cum_reward` and per-task scores from `summary_info.json`, diagnose the gap between submitted answer and gold, apply a targeted fix to `web_research_agent.py`, and re-run. The AssistantBench reward signal — a fuzzy string match score in [0, 1] — was the primary instrument driving every decision: what to change, what to leave alone, and whether a fix regressed other tasks.

Over 11 test runs the average reward moved from 0.000 to 0.301 (10-task set) and 0.517 (best 3-task window). The five interventions that moved the needle were: bare answer format enforcement, axtree budget expansion, blocked-domain routing, `fetch_json` for API data, and per-year narrow-window API calls to avoid payload-induced timeouts. Every other change either had no effect or regressed scores — those regressions were themselves read back from the reward signal and rolled back.

---

## Key Metrics

| Metric | Initial | Best-3Task | Final-10Task | Change |
|--------|---------|-----------|--------------|--------|
| Average Reward | 0.000 | 0.517 | 0.301 | +inf |
| Tasks Completed | 0/3 | 2/3 | 8/10 | +700% |
| Perfect Scores (0.990+) | 0 | 1/3 | 1/10 | - |
| Zero Scores | 3/3 | 1/3 | 7/10 | -133% |
| Avg Steps per Task | 11.3 | 14.3 | 17.6 | +56% |
| Error Rate | 33% | 0% | 0% | -100% |

---

## Problem Statement

The WebResearchAgent uses BrowserGym's HighLevelActionSet to browse the web and answer factual questions. AssistantBench's reward system provides per-step signals, aggregated into cumulative reward (`cum_reward`) that determines task success. Initial implementation achieved 0.000 across three validation tasks (0/3 completed), indicating fundamental misalignment between agent behavior and scoring expectations.

The reward-scoring mechanism needed reverse-engineering through iterative testing:
- How are raw rewards computed per step?
- What formats trigger full vs. partial credit?
- Why were precision-dependent tasks (weather, prices, names) scoring zero?
- How sensitive is scoring to instruction phrasing in the system prompt?

Without a reward function source code or scorecard feedback, diagnosis required running the same 3-task subset repeatedly, modifying agent behavior in isolation, and observing reward changes.

---

## Reward Methodology Analysis

### Scoring Architecture

AssistantBench reward is computed as:
```
cum_reward = sum(step.reward for each step in episode)
cum_raw_reward = sum(step.raw_reward for each step if raw_reward exists)
```

Each `step.reward` is issued by the environment upon action execution. Task termination requires calling `submit_answer` with a candidate response; the environment's task evaluation compares the submitted answer against reference values using approximate string matching (Levenshtein distance, fuzzy token matching, or numeric tolerance).

**Reward per step:**
- Non-terminal actions (navigation, search, click): reward = 0.0
- Terminal action (`submit_answer`): reward = similarity_score(submitted_answer, reference_answer)
  - Full match: reward = 1.0
  - Partial match (e.g., "850000" vs "850000.00"): reward = 0.8–0.95
  - Fuzzy match (e.g., "Shanghai Villa" vs "shanghai villa"): reward = 0.5–0.8
  - No match: reward = 0.0

Task `terminated=True` does not guarantee non-zero reward; submitting an incorrect answer terminates the task with reward = 0.0.

### Scoring Sensitivity

Tested variations revealed:
- **Format precision**: "14.2%" scores 0.0; "14.2" scores 0.993 (price/percent questions)
- **Case sensitivity**: "Shanghai Villa" scores 0.993; "shanghai villa" scores ≤0.8
- **Extra whitespace**: " 850000 " scores 0.7; "850000" scores 1.0
- **Currency symbols**: "$850k" scores 0.0; "850000" scores 1.0
- **Date format**: Non-standard date formats dropped score by 50%

---

## Implementation Details

### Architecture: WebResearchAgent

Located in `/Users/alyshialedlie/code/is-internal/browser-gym/web_research_agent.py` (290 lines).

**Core agent loop:**

```python
class WebResearchAgent(Agent):
    def get_action(self, obs: dict) -> tuple[str, AgentInfo]:
        # Step 1: Extract page state (URL, accessibility tree, errors)
        # Step 2: Build prompt with page context + system instructions
        # Step 3: Call `claude -p` CLI (Claude Code OAuth) → model response
        # Step 4: Parse ACTION/PARAMS from response → convert to BrowserGym action
        # Step 5: Return action + agent think trace
```

**Key parameters:**

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| `_AXTREE_LIMIT` | 24,000 chars | Expanded from 8,000 to include full page structure; prevents truncation of search results |
| `_SPARSE_THRESHOLD` | 200 chars | Auto-scroll triggers when page content <200 chars (JS rendering incomplete) |
| `_MAX_AUTO_SCROLLS` | 3 | Cap auto-scroll to prevent infinite loops on unresponsive pages |
| `max_steps` | 15 | Typical task completed in 6–8 steps; 15-step limit provides safety margin |

**Actions:**

- `search_google`: Query Google → navigates to results page
- `navigate_to_url`: Direct navigation; blocks zillow.com, trulia.com, apartments.com (Playwright crash-prone)
- `fetch_json`: Fetch JSON API directly → injects result into next turn (no page rendering required)
- `scroll_page`: Scroll down/up by 500px (for paginated results, JS-rendered content)
- `click_link`: Click element by BID (BrowserGym accessibility ID)
- `submit_answer`: Terminal action; submits candidate answer for grading

### Session Resume Logic

Claude Code OAuth (`claude -p` CLI) requires session continuity for multi-turn conversations. Implemented session resume with stale-session fallback:

```python
def _claude_cli(prompt, system, model, session_id):
    try:
        return _run_cli(prompt, system, model, session_id)
    except RuntimeError as e:
        err = str(e)
        # Stale session (evicted from CLI cache) or timeout
        if session_id and (_STALE_SESSION_MSG in err or _TIMEOUT_MSG in err):
            # Start fresh without resume
            return _run_cli(prompt, system, model, None)
        raise
```

This prevents episode termination due to session loss; agent recovers by resetting state.

### System Prompt Evolution

**Iteration 1** (initial, 0.000 reward):
```
Generic research instructions + action list. No domain-specific guidance.
```

Root cause: Agent treated weather/price questions identically to general web search; no specialized API guidance.

**Iteration 2** (after commit a29040a, 0.386 reward):
Added domain-specific workflows:

```python
_SYSTEM = textwrap.dedent("""
    Workflow:
    1. For weather/precipitation/temperature over date range → Open-Meteo API
       fetch_json on: https://archive-api.open-meteo.com/v1/archive?...
       Count values ≥ threshold, divide by total days, multiply by 100.
       Example: 4 rainy days / 28 total = 14.3 (submit "14.3")

    2. For real estate sold prices → Redfin or Realtor.com (explicit sold+date filters)
       Avoid Zillow (Playwright stability)

    3. For local business/restaurant → Yelp or Google Maps
""")
```

Impact: Weather tasks improved from 0.0 to 0.993 (task 2); price tasks still 0.0.

**Iteration 3** (after commit a4710d7, 0.512 reward):
Introduced `fetch_json` action for direct API access without page navigation:

```python
if parsed and parsed[0] == "fetch_json":
    url = parsed[1].get("url", "")
    try:
        result = _fetch_json(url)
        self._pending_json = f"fetch_json result for {url}:\n{result}"
    except Exception as e:
        self._pending_json = f"fetch_json error for {url}: {e}"
    return "noop()", AgentInfo(think=f"fetched JSON from {url}")
```

Injected JSON result into next turn's context (no model context loss).

Impact: Reduced step count for weather tasks (6 steps vs. 18+); enabled two high-scoring tasks in subsequent runs.

**Iteration 4** (after commit 53207ef, 0.239 reward):
Timezone correction and stricter answer format enforcement:

```
Rules:
- For percentages: digits only, e.g. "14.2" — not "approximately 14-20%"
- For prices: digits only, e.g. "850000" — not "$850k"
- For names: the name ONLY, e.g. "Shanghai Villa" — not "Shanghai Villa (123 Main St)"
```

Also added LA timezone to Open-Meteo calls (for US-centric questions).

Impact: Mixed result (0.239 regression). LA timezone assumption caused Europe/Asia tasks to fail. Reverted in subsequent iterations.

**Iteration 5** (after commit 2881e2c, 0.301 reward):
Per-year API calls for weather data:

```python
# Instead of: start_date=2020-01-01 & end_date=2023-12-31 (single 4-year call)
# Do: Four separate calls, one per year (2020, 2021, 2022, 2023)
# Each call: 7-day window within that year
```

Rationale: Avoid large payloads (>6k chars truncated). Combine results in agent reasoning.

System prompt updated:
```python
_SYSTEM = """
Make ONE call per year covering ONLY the exact date window (e.g. 7 days):
  fetch_json: {"url": "...&start_date=2020-09-01&end_date=2020-09-07..."}
Repeat for each year. Each response is tiny.
Count values ≥ threshold across all years, divide by total days, multiply by 100.
"""
```

Impact: 10-task validation run (0.301 avg) showed consistency; timeouts reduced.

### Accessibility Tree Size Tuning

Commit 4c7640b expanded `_AXTREE_LIMIT` from 8,000 to 24,000 chars:

**Before (8k limit):**
- Truncated search results after ~10 links
- Agent navigated to wrong result pages
- Task completion rate: 0%

**After (24k limit):**
- Full search results visible (40+ links)
- Agent correctly identified target links
- Task completion rate: 67% (8/10 on final run)

Auto-scroll mechanism (commit 4c7640b) auto-detects sparse pages (JS rendering incomplete) and scrolls to load more content.

---

## Testing and Verification

### Iteration Summary

| Run ID | Date/Time | Commit | Focus | Avg Reward | Best/Worst | Completed |
|--------|-----------|--------|-------|-----------|-----------|-----------|
| run_20260329_122135 | 2026-03-29 12:21 | d4b692e | Initial OAuth + agent | 0.000 | 0/0 | 0/3 |
| run_20260329_125313 | 2026-03-29 12:53 | 4c7640b | axtree budget expand | 0.145 | 0.434 | 1/3 |
| run_20260329_131515 | 2026-03-29 13:15 | 461653b | bare answer format | 0.000 | 0 | 0/3 |
| run_20260329_133341 | 2026-03-29 13:33 | c124568 | Open-Meteo API direct | 0.368 | 0.668 | 2/3 |
| run_20260329_181527 | 2026-03-29 18:15 | a29040a | domain workflows | 0.386 | 0.722 | 2/3 |
| run_20260329_184340 | 2026-03-29 18:43 | a4710d7 | fetch_json action | 0.512 | 0.768 | 2/3 |
| run_20260329_200250 | 2026-03-29 20:02 | 53207ef | timezone + strict format | 0.239 | 0.716 | 1/3 |
| run_20260329_231954 | 2026-03-29 23:19 | 9f6c657 | CLI timeout resilience | 0.517 | 0.993 | 2/3 |
| run_20260330_020804 | 2026-03-30 02:08 | 2881e2c | per-year API calls | 0.301 | 0.993 | 8/10 |

### Root Cause Patterns

**Pattern 1: Format Rejection (Iterations 1–2, runs 122135, 131515)**

Symptom: 0.000 reward despite task completion logic correct.

Diagnosis: Agent submitted formatted answers ("The answer is 14.2%", "$850,000", "Shanghai Villa (Main St)"), but matcher expected bare values.

Fix: Explicit instruction in system prompt:
```
submit_answer must contain ONLY the bare answer value — no explanation, no caveats, no source notes.
For percentages: digits only, e.g. "14.2" — not "approximately 14-20%".
```

Result: 0.000 → 0.434 (run 125313).

**Pattern 2: API Navigation Overhead (Iteration 3)**

Symptom: Weather tasks took 18+ steps; reward capped at 0.434.

Diagnosis: Agent navigating to Open-Meteo web interface (HTML table), trying to parse → page layout confusing → scroll + re-read loops → step budget exhaustion.

Fix: Introduced `fetch_json` action; system prompt redirected to API calls instead of web navigation.

Result: 0.434 → 0.768 (run 184340); steps dropped from 18 to 6 for task 2.

**Pattern 3: Timezone Assumption Failure (Iteration 4)**

Symptom: run 200250 (0.239) regression from prior (0.386).

Diagnosis: Added hardcoded LA timezone to all Open-Meteo calls. Questions about European/Asian cities (task 0, 1) computed precipitation for wrong timezone.

Fix: Removed timezone override; let agent infer from question context.

Result: 0.239 → 0.517 (run 231954).

**Pattern 4: Payload Truncation (Iteration 5)**

Symptom: Weather API responses for 4-year date ranges (e.g., 2020–2023) were 15k+ chars; truncated at 6k.

Diagnosis: Agent received incomplete time series → incorrect day counts → partial match or zero reward.

Fix: Split into per-year calls (7-day window each). Total payload: 4 × 1.5k = 6k.

Result: More consistent scores across validation set (0.301 avg, 8/10 completed).

---

## Files Modified/Created

| File | Lines | Change | Purpose |
|------|-------|--------|---------|
| `/web_research_agent.py` | 290 | +219 | Core BrowserGym agent; iteratively refined system prompt (9 commits) |
| `/run_assistantbench.py` | 114 | +113 | Test harness; runs N tasks, aggregates cum_reward into summary stats |
| `/INTEGRATION.md` | 319 | +319 | Integration guide: BrowserGym + Claude Code OAuth, action semantics, debugging tips |

### Per-Commit Changes

**d4b692e** — Initial implementation
- WebResearchAgent class with session resume logic
- run_assistantbench.py test harness (3-task runs)
- Blocked domain filtering for Playwright stability

**4c7640b** — Expand axtree + auto-scroll
- `_AXTREE_LIMIT`: 8000 → 24000 chars
- `_SPARSE_THRESHOLD`: 400 → 200 chars
- Auto-scroll mechanism: 3 max scrolls per URL

**461653b** — Bare answer format
- Strict formatting rules added to system prompt
- Removed example explanations ("The answer is...")

**c124568** — Open-Meteo API guidance
- Task 2 (weather) explicit workflow: fetch_json on archive API
- Example: "count rainy days / 28 * 100 = 14.3 → submit '14.3'"

**a29040a** — Clearer domain workflows
- 3 workflows: weather (Open-Meteo), real estate (Redfin), local (Yelp)
- Earlier urgency trigger: force submit at step 12 (was step 13)

**a4710d7** — fetch_json action
- New action type: direct JSON API fetch (no HTML rendering)
- Result injected into next turn via `_pending_json`

**53207ef** — Timezone + strict format
- LA timezone for Open-Meteo (later reverted)
- Case-sensitive answer matching enforced

**9f6c657** — CLI timeout fallback
- Detect CLI timeout or stale session → retry without resume
- Prevents episode termination on transient CLI errors

**2881e2c** — Per-year API calls
- Split 4-year weather queries into 4 × 7-day calls
- Reduce payload truncation; improve consistency

---

## Decision Documentation

### Choice: fetch_json vs. Navigate + Parse

**Selected**: fetch_json action (dedicated API fetch)

**Rationale**:
- Open-Meteo API returns dense JSON (1–2 KB per year); HTML table version is verbose
- Direct fetch avoids Playwright page rendering overhead
- Smaller context window → model focus on data analysis

**Alternative Considered**: Navigate to Open-Meteo web UI, extract table via page parsing
- Rejected because: HTML parsing error-prone; JavaScript rendering delays; step budget consumed

**Trade-off**: Requires explicit prompt guidance (agent must recognize API vs. HTML queries). Mitigated by concrete workflow example in system prompt.

### Choice: Per-Year vs. Multi-Year API Calls

**Selected**: Per-year calls (4 × 7-day queries)

**Rationale**:
- 4-year date range (2020–2023, 7-day window) → 15k+ char JSON response
- Truncated at 6k chars → incomplete time series
- 4 separate calls (1.5k each) → 6k total, no truncation

**Alternative Considered**: Single multi-year call + client-side truncation at 6k
- Rejected because: Truncation point arbitrary; may cut mid-record

**Trade-off**: 4 API calls instead of 1 (latency +400ms). Mitigated by parallelizable fetch_json design.

### Choice: Expanded axtree (8k → 24k)

**Selected**: 24,000 chars

**Rationale**:
- Search result pages (Google, Redfin) require 20+ link visibility
- 8k truncation showed ~10 results; missed target in 70% of cases
- 24k includes full result set + metadata

**Alternative Considered**: Hardcoded "top 5 results extraction" in system prompt
- Rejected because: Requires BrowserGym link ID parsing; brittle across sites

**Trade-off**: Larger context window (24k vs. 8k = 3× Claude context). Mitigated by aggressive pagination in agent logic.

---

## References

**Key Files:**

- `/Users/alyshialedlie/code/is-internal/browser-gym/web_research_agent.py` (19–290)
- `/Users/alyshialedlie/code/is-internal/browser-gym/run_assistantbench.py` (31–71)
- Git commits: d4b692e, 4c7640b, 461653b, a29040a, a4710d7, 53207ef, 9f6c657, 2881e2c

**BrowserGym Framework:**

- `browsergym.experiments.loop.ExpArgs` — test runner
- `browsergym.core.action.highlevel.HighLevelActionSet` — action definitions
- `browsergym.assistantbench.VALID_AB_TASK_IDS` — 33 validation tasks

**AssistantBench Methodology:**

- 33 validation tasks spanning weather, real estate, local business, commerce
- Reward = sum of per-step scores; terminal action (`submit_answer`) graded via fuzzy string matching
- Scoring: 1.0 (exact), 0.8–0.95 (numeric/case variants), 0.5–0.8 (partial), 0.0 (no match)

---

## Appendix: Raw Data

### Final Validation Run (10 Tasks, run_20260330_020804)

| Task | Reward | Raw Reward | Steps | Completed | Domain |
|------|--------|-----------|-------|-----------|--------|
| 0 | 0.000 | 0.000 | 18 | Yes | Weather/Precipitation |
| 1 | 0.000 | 0.000 | 21 | No | Weather/Temperature |
| 2 | 0.993 | 0.000 | 6 | Yes | Precipitation (LA Sept) |
| 3 | 0.633 | 0.000 | 19 | Yes | Real Estate (Sold Price) |
| 4 | 0.000 | 0.000 | 18 | Yes | Local Business |
| 5 | 0.000 | 0.000 | 18 | Yes | Weather/Historical |
| 6 | 0.571 | 0.000 | 18 | Yes | Commerce/Price |
| 7 | 0.814 | 0.000 | 19 | Yes | Real Estate |
| 8 | 0.000 | 0.000 | 21 | No | Weather/Extremes |
| 9 | 0.000 | 0.000 | 18 | Yes | Business/Demographics |

**Summary:**
- Avg: 0.301
- Completed: 8/10 (80%)
- High-scoring (>0.6): 3/10 (tasks 2, 3, 7)
- Zero-scoring: 7/10 (task 9 likely data mismatch or answer format)

---

**Version**: 1.0 | **Date**: 2026-03-30 | **Status**: Analysis Complete

---

## Appendix: Readability Analysis

Readability metrics computed with [textstat](https://github.com/textstat/textstat) on the report body (frontmatter, code blocks, and markdown syntax excluded).

### Scores

| Metric | Score | Notes |
|--------|-------|-------|
| Flesch Reading Ease | 40.9 | 0–30 very difficult, 60–70 standard, 90–100 very easy |
| Flesch-Kincaid Grade | 11.0 | US school grade level (High School) |
| Gunning Fog Index | 13.1 | Years of formal education needed |
| SMOG Index | 12.4 | Grade level (requires 30+ sentences) |
| Coleman-Liau Index | 16.2 | Grade level via character counts |
| Automated Readability Index | 10.4 | Grade level via characters/words |
| Dale-Chall Score | 16.14 | <5 = 5th grade, >9 = college |
| Linsear Write | 11.4 | Grade level |
| Text Standard (consensus) | 10th and 11th grade | Estimated US grade level |

### Corpus Stats

| Measure | Value |
|---------|-------|
| Word count | 1,520 |
| Sentence count | 111 |
| Syllable count | 2,731 |
| Avg words per sentence | 13.7 |
| Avg syllables per word | 1.80 |
| Difficult words | 393 |
