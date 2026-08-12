---
layout: single
author_profile: true
classes: wide
title: "Relabel Triage Passes: Expanding Test Set Correction for Schema.org File System"
date: 2026-05-16
categories: [telemetry]
tags: [opentelemetry, observability, session-analysis, llm-as-judge, quality-metrics, python, classification, schema-org]
excerpt: "Three new triage passes fix label rot in the schema-org-file-system test set — files that landed in `uncategorized` because a prior run missed obvious filepath signals."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
url: https://www.aledlie.com/reports/2026-05-16-relabel-triage-passes-schema-org-file-system/
permalink: /reports/2026-05-16-relabel-triage-passes-schema-org-file-system/
schema_type: analysis-article
schema_genre: "Session Report"
---

A test set is only as good as its labels. This session tackled label rot in the [schema-org-file-system](https://github.com/integritystudio/schema-org-file-system) evaluation data — files that landed in `uncategorized` or `media` because a prior production run missed them, even when their filepath and filename made the true category obvious. The fix: three new triage passes (3–5) wired into [`relabel_test_set.py`](https://github.com/integritystudio/schema-org-file-system/blob/main/scripts/relabel_test_set.py), each targeting a specific signal (sprite vocabulary, screenshot patterns, document semantics) and guarded against clobbering already-confident labels.

## Quality Scorecard

Seven metrics. Three from rule-based telemetry analysis, four from LLM-as-Judge evaluation of the session outputs. Together they form a complete picture of how well this session did its job.

### The Headline

```
      RELEVANCE  ████████████████████  0.97  healthy
    FAITHFULNESS  ████████████████████  0.97  healthy
       COHERENCE  ███████████████████░  0.95  healthy
    HALLUCINATION  ████████████████████  0.02  healthy  (lower is better)
   TOOL ACCURACY  ████████████████████  1.00  healthy
    EVAL LATENCY  ████████████████████  1.5ms  healthy
 TASK COMPLETION  ████████████████████  1.00  healthy
```

**Dashboard status: HEALTHY** — all seven metrics within healthy thresholds. Tool correctness was perfect (1 tool call, 1 success). Hallucination scored 0.02 — the only near-invention was `_TRIAGE_PATH_FRAGMENTS` as a complementary check, which is consistent with the documented pass logic and not a fabrication.

## How We Measured

The first three metrics — tool correctness, evaluation latency, and task completion — were derived automatically from OpenTelemetry trace spans emitted by the hook runner. Every tool call generates a span; the rule engine checks `builtin.success` and computes median hook duration.

The content quality metrics come from **LLM-as-Judge evaluation** — a G-Eval pattern where the judge reads session outputs and scores along four criteria: relevance, faithfulness, coherence, and hallucination. For this session, evaluation covered two files modified across the 7-commit run ahead of `origin/main`: `scripts/relabel_test_set.py` (185 lines) and `CLAUDE.md` (181 lines).

## Per-Output Breakdown

Each output was evaluated independently, then aggregated:

| Document | Relevance | Faithfulness | Coherence | Hallucination |
|----------|-----------|-------------|-----------|---------------|
| `scripts/relabel_test_set.py` (185 lines) | 0.97 | 0.96 | 0.95 | 0.02 |
| `CLAUDE.md` (181 lines) | 0.96 | 0.97 | 0.94 | 0.02 |
| **Session Average** | **0.97** | **0.97** | **0.95** | **0.02** |

## What the Judge Found

`relabel_test_set.py` scored highest on relevance (0.97) because every new symbol maps directly to a documented pass: `_SPRITE_KEYWORD_SET` for Pass 3, `_SCREENSHOT_RE` for Pass 4, `_DOCUMENT_LABEL_MAP` for Pass 5. The guard logic (`_RELABEL_ELIGIBLE_CATEGORIES = frozenset({'uncategorized', 'media'})`) is the most technically precise piece of the file — it prevents any triage pass from overwriting a label the classifier already felt confident about, which is exactly what the docstring promises.

`CLAUDE.md` scored highest on faithfulness (0.97): the new gotcha entries for screenshot/image handling and the updated test count reflect verifiable facts about the codebase. The `relabel_test_set.py` reference in the scripts section is accurate and useful. Coherence was marginally lower (0.94) because the CLAUDE.md gotchas table now has entries of varying specificity sitting adjacently, but this is minor.

Hallucination was negligible at 0.02 across both files. The one borderline addition — `_TRIAGE_PATH_FRAGMENTS` checking string fragments in `filepath` alongside `_TRIAGE_PARENTS` checking `parent_folder` — is a defensive complementary check, not an invented fact; it correctly handles cases where `parent_folder` metadata is missing but the filepath is present.

## Session Telemetry

| Metric | Value |
|--------|-------|
| Session ID | `d56be687-168a-468e-9683-4e1b862e4b85` |
| Date | 2026-05-16 |
| Model | claude-opus-4-7 |
| Total Spans | 16 |
| Tool Calls | 5 (success: 5, failed: 0) |
| Input Tokens | 39 |
| Output Tokens | 2,644 |
| Cache Read Tokens | 474,339 |
| Hooks Observed | session-start, skill-activation-prompt, builtin-pre-tool, builtin-post-tool, notification, token-metrics-extraction |

Cache read tokens (474,339) dwarf output (2,644), which is typical for a focused code-expansion session where context is loaded once and the model works within a well-established codebase pattern.

## Methodology Notes

- Trace data was available for this session (16 spans across 1 trace). Token summary was aggregated from 3 token-metrics-extraction events across multiple Stop hooks.
- `task_completion` fell back to 1.0 (no TaskCreate/TaskUpdate tool spans recorded in this session).
- LLM-as-Judge evaluated the two most recently modified files from the 7-commit run ahead of `origin/main`. Binary files and files >500 lines were excluded (none present).
- Hallucination threshold is 0.05 for healthy; the 0.02 score reflects that `_TRIAGE_PATH_FRAGMENTS` is a defensive implementation detail consistent with documented behavior, not fabricated content.
- `evaluation_latency_seconds` of 0.0015s (1.5ms) reflects hook median span duration, not model inference latency.

---

*A narrative version of this work, written for a general audience, is at [Your Eval Data Is Lying to You]({% post_url 2026-05-16-your-eval-data-is-lying-to-you %}).*
