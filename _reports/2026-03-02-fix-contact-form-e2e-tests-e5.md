---
layout: single
title: "E2E Test Root-Cause Archaeology: contact_form_test All 14 Failing"
date: 2026-03-02
author_profile: true
classes: wide
categories: [flutter-web, testing, debugging]
tags: [flutter, e2e, integration-test, root-cause-analysis, otel-metrics, contact-form]
excerpt: "Systematic bisection across 25+ debug test iterations identified two root causes behind all 14 contact_form_test.dart failures: broken testTextInput binding in profile mode and a widget-tree placeholder collision hiding in plain sight."
schema_type: analysis-article
schema_genre: "Session Report"
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
url: https://www.aledlie.com/reports/2026-03-02-fix-contact-form-e2e-tests-e5/
permalink: /reports/2026-03-02-fix-contact-form-e2e-tests-e5/
---

**Session Date**: 2026-03-02
**Project**: IntegrityLandingPage (Flutter Web)
**Focus**: Debug and fix all 14 failing `contact_form_test.dart` E2E integration tests
**Session Type**: Root-Cause Analysis + Bug Fix
**Session ID**: `779aebd9-245f-461e-a814-d53ab205b017`

---

## Opening Narrative

What began as "five remaining failures" from a prior context window turned into a methodical excavation of two deeply hidden Flutter internals. The first culprit — `tester.enterText()` silently failing in `IntegrationTestWidgetsFlutterBinding` — required 15+ incremental debug test files to expose: the null `_client` dereference in `testTextInput` produces an empty TypeError in dart2js profile mode, leaving no error message to chase. The second culprit was stranger still: test data `'Smith'` matched the lastName field's placeholder hint text, because Flutter's `InputDecorator` keeps hint `Text` widgets in the tree at opacity 0 even after the field is filled — so `find.text('Smith')` found two matches and `findsOneWidget` failed. With both root causes identified and fixed (via `directEnterText()` + `'Doe'` as test data), all 14 tests flipped green in a single run.

---

## Quality Scorecard

| Metric | Bar | Score | Status |
|--------|-----|-------|--------|
| `tool_correctness` | `████████████████████` | 0.975 | ✅ healthy |
| `task_completion` | `████████████████████` | 1.00 | ✅ healthy |
| `eval_latency` | `█░░░░░░░░░░░░░░░░░░░` | 0.002s | ✅ healthy |
| `relevance` (LLM) | `██████████████████░░` | 0.88 | ✅ healthy |
| `faithfulness` (LLM) | `███████████████████░` | 0.95 | ✅ healthy |
| `coherence` (LLM) | `███████████████████░` | 0.94 | ✅ healthy |
| `completeness` (LLM) | `█████████████████░░░` | 0.87 | ✅ healthy |
| `hallucination_risk` (LLM) | `████████████████████` | 0.07 | ✅ healthy |

**Dashboard Status: ✅ HEALTHY** — all 8 metrics within thresholds.

> `task_completion` from compute-metrics (1.0) supersedes the mid-session 0.5 readings — those snapshots were taken before the final test run confirmed all 14 passing.

---

## How We Measured

**Rule-based (hooks):**
- `tool_correctness` — ratio of successful tool calls to total tool calls across 240 tool spans
- `task_completion` — final evaluation from `hook:stop`; mid-session snapshots showed 0.5 (4 tasks tracked), final state is 1.0 after all tests passed
- `eval_latency` — OTEL span duration for evaluation hook runs (0.002s median)

**LLM-as-Judge (`genai-quality-monitor` agent):**
- Evaluated 4 output files against the session goal (fix 14 E2E failures via two identified root causes)
- Scored 5 dimensions: relevance, faithfulness, coherence, completeness, hallucination_risk
- Grounding: Flutter framework source code (`form.dart`, `text_form_field.dart`) was used to verify root cause claims

---

## Per-Output Breakdown

| File | Relevance | Faithfulness | Coherence | Completeness | Hallucination Risk | Notes |
|------|-----------|--------------|-----------|--------------|-------------------|-------|
| `contact_form_test.dart` | 0.98 | 0.96 | 0.91 | 0.95 | 0.05 | Primary fix; all 14 tests present; comments cite correct Flutter internals |
| `docs/BACKLOG.md` | 0.95 | 0.92 | 0.97 | 0.94 | 0.14 | E4+E5 documented accurately; minor: `landing_page_test` claim unverifiable |
| `lib/main.dart` | 0.87 | 0.93 | 0.88 | 0.85 | 0.08 | try-catch guard correct; undocumented interaction with `--profile`/`kDebugMode` |
| `smoke_test.dart` | 0.52 | 0.99 | 0.99 | 0.72 | 0.02 | Correct harness test; low relevance to 14-test fix goal |

---

## What the Judge Found

The judge gave highest marks to `contact_form_test.dart` for precisely targeting both root causes with no overclaiming: the `directEnterText()` helper correctly uses `EditableTextState.updateEditingValue()` to bypass the broken `testTextInput` pipeline, and the `'Doe'` substitution eliminates the placeholder collision. The inline doc comments — citing opacity-0 hint widgets and null `_client` — were verified against the actual Flutter 3.38.5 framework source.

The main finding was a mild hallucination risk in `BACKLOG.md`: the E4 entry claims "full `landing_page_test` confirmed passing," but that file was not in the committed changeset and the smoke test is trivially minimal, making the claim partially unverifiable from available evidence.

`lib/main.dart`'s try-catch guard drew a coherence note: in `--profile` mode (the recommended `flutter drive` mode per E4), `kDebugMode` is `false`, so the entire MarionetteBinding branch is bypassed entirely — the try-catch never runs. This is the correct behavior but the comment only describes the integration-test scenario, leaving the profile-mode path undocumented.

---

## Session Telemetry

| Dimension | Value |
|-----------|-------|
| Session ID | `779aebd9-245f-461e-a814-d53ab205b017` |
| Duration | ~131 minutes (2026-03-01 23:36 → 2026-03-02 01:47) |
| Total spans | 306 |
| Tool spans | 240 |
| Input tokens | 277 |
| Output tokens | 97,517 |
| Cache read tokens | 30,020,796 |
| Model | Claude Opus 4.6 |
| Hooks active | 10 |

**Tool breakdown (top hooks):**
- `hook:plugin-post-tool` / `hook:builtin-post-tool` — post-tool evaluation on every tool call
- `hook:skill-activation-prompt` — checked on each user prompt
- `hook:telemetry-alert-evaluation` — OTEL threshold monitoring
- `hook:token-metrics-extraction` — token usage extraction per span

**Cache note:** 30M cache-read tokens reflect the multi-context-window session — this session continued from two prior compacted contexts, each contributing large accumulated context that was cache-hit rather than re-processed.

---

## Debug Archaeology: The 25-Iteration Path

The root cause was not obvious. The full investigation sequence:

1. **Scroll fix** (prior session): `scrollUntilVisible` replaced 15-fling scroll — 9 tests now pass
2. **`ensureVisible` + `tester.enterText`**: still failed silently
3. **Isolated `testTextInput`**: confirmed `_client` is null in `LiveTestWidgetsFlutterBinding` — dart2js profile mode suppresses the assertion, producing an empty TypeError
4. **`directEnterText` via `updateEditingValue`**: single field → PASS; multiple fields → FAIL
5. **Multi-field bisection** (I-series): found controllers DO have correct values (I4 PASS), but `find.text` fails (I5 FAIL)
6. **Find.text semantics** (J-series): `findsWidgets` passes (≥1 match), `findsAtLeast(2)` fails — exactly 1 match
7. **Test order isolation** (N-series): N1 fails as the FIRST test — not test interaction
8. **Content search**: `grep 'placeholder' content.yaml` → `placeholder: "Smith"` at line 702
9. **Fix**: `'Smith'` → `'Doe'`, all 14 tests pass

---

## Methodology Notes

- LLM-as-Judge was run via `genai-quality-monitor` agent against 4 output files
- Rule-based metrics computed via `compute-metrics.py` from OTEL traces in `~/.claude/telemetry/traces-2026-03-02.jsonl`
- `task_completion` mid-session snapshots (0.5) reflect an incomplete task list state; the final value is 1.0 per post-commit verification (all 14 tests passing, pushed to `origin/main` at `1d2f8e5`)
- `hallucination_risk` of 0.07 is well below the 0.20 healthy threshold; the main risk area is the `landing_page_test` claim in BACKLOG.md, which references a file not present in the committed diff
