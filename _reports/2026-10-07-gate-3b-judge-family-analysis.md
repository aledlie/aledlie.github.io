---
layout: single
title: "Schema URLs, a Third Judge, and the Gate 3b Self-Grading Analysis"
date: 2026-10-07
author_profile: true
categories: [observability, llm-evaluation, research]
tags: [opentelemetry, llm-as-judge, schema-url, claude-haiku, grok, meta-evaluation, inter-rater-reliability, aa3]
excerpt: "Stamped a schema URL on evaluation records, confirmed an OpenAI judge routes, and ran AA3 Gate 3b end to end: haiku grades its own explanations 0.12–0.15 lower than grok, the two judges rank explanations differently, and the request text moves scores more than the explanation does."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
permalink: /reports/gate-3b-judge-family-analysis/
---

**Session Date**: 2026-10-07<br>
**Session ID**: `db599fd3-638e-46e8-9ccf-65b4a34abaf0`<br>
**Project**: claude-dev-environment (`~/.claude`)<br>
**Focus**: Roadmap triage, evaluation-record schema versioning, judge routing, AA3 Gate 3b analysis<br>
**Session Type**: Implementation | Analysis

## Executive Summary

The session started as a sweep of `docs/roadmap/*` and found about 40 actionable items across three documents. Most were blocked on 21-day survival data or on a recorded decision against building the evolutionary loop. Three could be done immediately. This session closed two of them, then took AA3's Gate 3b from "stalled" to analysed. Collection needed no restart: all 11 running CLIs already carried the two-judge configuration, and both judges had passed 100 records.

On the code side, `appendEvaluation` now stamps a record-level `schemaUrl` on every evaluation record, so the next rename of an `integritystudio.evaluation.*` key can be a schema transform. A live `gpt-5.4-mini` call confirmed the OpenAI judge routes and prices correctly. The probe became `scripts/otel/judge-probe.mjs`, and the Gate 3b analysis became `scripts/otel/gate3b/`.

The Gate 3b analysis ran in three steps. The production data (259 items) shows haiku grading its own explanations **0.117 lower** than grok, in **6/6** sessions. Cross-scoring the same 259 items with both judges (518 calls, ~81¢) shows a **−0.147** gap on identical prompts, and only moderate ranking agreement (Spearman **0.47**). A same-prompt retest (130 calls, ~21¢) shows the disagreement is real, not noise: haiku re-scores itself at **0.99**, grok at **0.76**. There is no self-leniency, but Question 5 stays open because nothing yet says which judge is right.

## Key Metrics

| Metric | Value |
|---|---|
| Roadmap actionable items catalogued | ~40 across 3 docs |
| Commits on `main` (repo) | 7 |
| Tests (quality-signals + related evaluators) | 35/35 + 37/37 pass |
| Production meta-evals analysed | 259 (135 haiku, 124 grok), 7 sessions |
| Production gap, haiku − grok | −0.117 (95% CI −0.128 to −0.110), 6/6 sessions |
| Paired gap, same items | −0.147 (95% CI −0.173 to −0.138), 239/259 items |
| Inter-judge rank agreement (Spearman) | 0.47 |
| Retest reliability, identical prompt | haiku 0.99, grok 0.76 |
| Judge API spend this session | ~$1.03 (518 + 130 calls + 3 probes) |

## Problem Statement

AA3's Gate 3 asks Open Question 5: can an evaluator detect bad reasoning from a model in its own family? A negative answer would change the evaluator design rather than tune it. Collection had been logged as "stalled" since 2026-09-23, with zero cross-family records as of the 2026-09-28 note. Separately, the AA3 migration section asked for `schema_url` discipline on new evaluation attributes. No evaluation record carried one, so no OpenTelemetry schema transform could ever rename their keys.

## Implementation Details

### Schema URL on evaluation records

The evaluations JSONL has no OTLP scope envelope, so the URL rides as a record field beside `identityKeyRef`:

```typescript
// hooks/lib/evaluation-attrs.ts:37
export const EVALUATION_SCHEMA_URL = 'https://integritystudio.ai/schemas/evaluation/1.0.0';

// hooks/lib/quality-signals.ts:215-217
    // Envelope metadata, not an attribute: the OTLP field a scope would carry,
    // here per record because the evaluations JSONL has no scope envelope.
    schemaUrl: EVALUATION_SCHEMA_URL,
```

- **Choice**: stamp only `appendEvaluation`, which all four hook writers share.
- **Rationale**: hook records are append-once and timestamped at write, so a new field never changes the upload fingerprint of an existing line.
- **Alternative considered**: also stamping the toolkit's `toOTelRecord` (derive).
- **Trade-off**: derive regenerates records each run, so stamping it would re-fingerprint and double-ship them. It stays unstamped until `upload-evaluations.ts` excludes `schemaUrl` from `FINGERPRINT_EXCLUDED_FIELDS`.

A post-commit review raised two HIGH findings (fingerprint and `evaluationId` drift). Both were checked and rejected: no existing line is ever rewritten with the field.

### Judge routing probe

`providerForModel` (`hooks/lib/llm-judge.ts:319`) sends `gpt-` ids to OpenAI. The key resolves through the Doppler fallback, because the Bash shell's credentials are scrubbed. `scripts/otel/judge-probe.mjs` makes one call and writes nothing. A separate logged run produced the first `gpt-5.4-mini` record (producer `manual-probe`), joinable to its judge span `883a49afec2b8d18`.

### Gate 3b pipeline (`scripts/otel/gate3b/`)

| Step | Script | Does |
|---|---|---|
| 1 | `between_arms.py` | Production arms: each item graded once by a random judge; session-cluster bootstrap, within-session signs, OLS with session fixed effects |
| 2 | `export_items.py` | Exports the 259 concurrent-window items |
| 3 | `cross_score.mjs match` / `run` | Recovers each item's user text from transcripts, then grades every item with both judges on an identical prompt; resumable; `EVERY=4` gives the retest subset |
| 4 | `paired.py` | Level gap, rank agreement, retest reliability, production-vs-rerun agreement, match-strength sensitivity |

`common.py` holds the shared loader: arm via `span.id` → judge span → `gen_ai.request.model`, and base pairing via shared `trace.id`. Data lives in `~/.claude-history/analysis/gate3b/`, outside the repo, because it holds explanation text from session transcripts.

- **Choice**: recover the judged turn by IDF-weighted word overlap between the base explanation and each transcript turn.
- **Rationale**: the evaluation records don't store which turn was judged (turns are sampled at random).
- **Trade-off**: the match is weak (median margin 0.04), so absolute rerun scores are not production-faithful. The judge-vs-judge comparison stays fair because both judges saw the same guess.

## Testing and Verification

```text
Test Files  1 passed (1)        # hooks/lib/quality-signals.test.ts
     Tests  35 passed (35)
Test Files  2 passed (2)        # quality-evaluator, agent-evaluations
     Tests  37 passed (37)
tsc exit: 0                     # npm run hooks:build
ok=518 failed=0 cost≈81.30¢     # cross_score.mjs run
ok=130 failed=0 cost≈20.64¢     # retest, EVERY=4
```

After the move into the repo, all four scripts reproduced every number from the job-directory run exactly.

```text
-- production arms --
diff (same - cross) = -0.117   Cohen d = -1.40
session-cluster bootstrap 95% CI for diff: [-0.128, -0.110]  (7 sessions)
  sessions where same < cross: 6/6  sign test p=0.031
-- same items, both judges --
paired diff haiku-grok mean=-0.147  Wilcoxon p=6.5e-42  items haiku<grok=239 ==1 >=19
spearman=+0.47 (p=1.7e-15)  kendall tau-b=+0.39
-- each judge vs its own production score --
claude-haiku-4-5-20251001    n=135  spearman=+0.17
grok-4.3                     n=124  spearman=+0.06
-- identical-prompt retest reliability --
claude-haiku-4-5-20251001    n=65 spearman=+0.99  exact same score=98%
grok-4.3                     n=65 spearman=+0.76  exact same score=51%
```

### Findings

1. **No self-leniency.** Haiku grades its own explanations harder: in production, on identical prompts, and in every session.
2. **The judges disagree for real.** Rank agreement of 0.47–0.58 is far below the ~0.87 their retest reliabilities would allow. Cross-family scores need calibration before pooling.
3. **The request text drives the score.** Each judge is near-stable on an identical prompt, yet barely agrees with its own production score when only the recovered user text differs.
4. **Question 5 stays open.** It needs ground truth: label ~30 items where the judges disagree most, and have the evaluator record which turn it judged.

## Files Modified/Created

| File | Change |
|---|---|
| `hooks/lib/evaluation-attrs.ts` | +16: `EVALUATION_SCHEMA_URL` and writer-scope JSDoc |
| `hooks/lib/quality-signals.ts` | +4/−1: stamp `schemaUrl` |
| `hooks/lib/quality-signals.test.ts` | +10: record-field test |
| `scripts/otel/judge-probe.mjs` | +39 (new) |
| `scripts/otel/gate3b/` | new: `common.py`, `between_arms.py`, `export_items.py`, `cross_score.mjs`, `paired.py` |
| `hooks/dist/lib/*.js` | 6 files rebuilt (+120/−27) |
| `docs/roadmap/AA3_ASI_EVOLVE_IMPLEMENTATION_PLAN.md` | schema_url adoption; Gate 3b to analysis; § 3b results |

Commits on `main`:
- `dd90d13f` feat(hooks): stamp schema URL on evaluation records
- `c853af77` docs(roadmap): record AA3 schema_url adoption
- `797516ec` feat: add judge-probe script
- `c85ec7e4` build(hooks): rebuild hooks dist
- `64904bdb` docs(roadmap): move AA3 Gate 3b to analysis
- `8974e1c8` feat(gate3b): add Gate 3b judge-family analysis scripts
- `ff372464` docs(roadmap): record AA3 Gate 3b results

## References

- `docs/roadmap/AA3_ASI_EVOLVE_IMPLEMENTATION_PLAN.md` — Gate 3 (3b status note, § 3b results), § Migration, Open Questions
- `docs/roadmap/AGENTIC_SELF_OPTIMIZATION_ARCHITECTURE.md`, `docs/roadmap/AA1_D7_STANDUP.md` — roadmap sweep sources
- `hooks/lib/llm-judge.ts:274-319` — OpenAI provider spec and routing
- `hooks/lib/quality-evaluator.ts:300-380` — arm selection and `maybeMetaEvaluate`
- `hooks/lib/transcript-parser.ts:13-175` — `Turn`, `extractTurns`, `sampleTurns`
- `mcp-servers/observability-toolkit/dashboard/scripts/upload-evaluations.ts:348-383` — fingerprint and `evaluationId`

---

## Appendix: Readability Analysis

Readability metrics computed with [textstat](https://github.com/textstat/textstat) on the report body (frontmatter, code blocks, and markdown syntax excluded).

### Scores

| Metric | Score | Notes |
|--------|-------|-------|
| Flesch Reading Ease | 53.1 | 0–30 very difficult, 60–70 standard, 90–100 very easy |
| Flesch-Kincaid Grade | 9.5 | US school grade level (High School) |
| Gunning Fog Index | 11.6 | Years of formal education needed |
| SMOG Index | 11.7 | Grade level (requires 30+ sentences) |
| Coleman-Liau Index | 12.7 | Grade level via character counts |
| Automated Readability Index | 9.5 | Grade level via characters/words |
| Dale-Chall Score | 12.97 | <5 = 5th grade, >9 = college |
| Linsear Write | 13.8 | Grade level |
| Text Standard (consensus) | 11th and 12th grade | Estimated US grade level |

### Corpus Stats

| Measure | Value |
|---------|-------|
| Word count | 905 |
| Sentence count | 61 |
| Syllable count | 1,484 |
| Avg words per sentence | 14.8 |
| Avg syllables per word | 1.64 |
| Difficult words | 191 |
