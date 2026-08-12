---
layout: single
title: "Auditing Agent Benchmark Claims: From a Stale Test Assertion to a 17% Contaminated Benchmark"
date: 2026-08-11
author_profile: true
categories: [ai-evaluation, research-verification]
tags: [gaia-benchmark, swe-bench, tau-bench, agent-evaluation, playwright, pytest, repomix, openreview]
excerpt: "Fixed a stale E2E assertion, then traced a #1 GAIA leaderboard claim to a repository containing no code — and found the same benchmark-contamination failure mode in SWE-bench Lite (17%) and tau-Bench."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
permalink: /reports/agent-benchmark-integrity-audit/
---

**Session Date**: 2026-08-11<br>
**Project**: schema-org-file-system (test maintenance) + independent research verification<br>
**Focus**: E2E/unit test runs, then verification of published AI-agent benchmark claims<br>
**Session Type**: Maintenance + Investigation

## Executive Summary

The session began as routine test maintenance and turned into a verification exercise on published agent-benchmark claims. The test work was small and closed cleanly: the Playwright E2E suite reported 5 failures, all of which were a single stale assertion replicated across five browser projects, fixed in 5 lines. The Python unit suite passed at 2,357 tests with no intervention.

The larger part of the session traced a specific public claim — a GitHub repository asserting the #1 position on the GAIA benchmark at 93.36% — and found that the leaderboard entry is real and correctly quoted, while the repository backing it contains no source code whatsoever, and no paper exists. Extending the same scrutiny to a related arXiv preprint (SABER, 2512.07850) surfaced that it was rejected from ICLR 2026 and has zero citations, despite an arXiv comment field that reads only "Submitted to ICLR2026."

The unifying finding is a repeated, independent failure mode in agent evaluation: widely-cited benchmarks contain a substantial minority of tasks that leak their own answers, mislead, or are unanswerable — and in every case the defect was found by a group *building on* the benchmark, never by its maintainers or its users. Quantified on SWE-bench Lite, that rate is 17%.

## Key Metrics

| Metric | Value |
|--------|-------|
| E2E tests run | 300 (295 passed, 5 failed → 300 passing after fix) |
| E2E fix size | 5 lines, 1 file |
| Unit tests | 2,357 passed, 2 skipped (29.70s) |
| Commits created | 3 |
| Repositories packed and inspected | 3 |
| SWE-bench Lite tasks audited | 300 |
| SWE-bench Lite tasks compromised | 51 (17.0%) |
| Papers analyzed in depth | 1 (arXiv 2512.07850) |
| Papers found citing it | 0 |

## Part 1: Test Maintenance

### Problem Statement

`npm run test:e2e` reported 5 failures across `chromium`, `firefox`, `webkit`, `mobile-chrome`, and `mobile-safari` — all the same assertion:

```
Error: expect(locator).toHaveCount(expected) failed
Locator:  locator('.feature-card')
Expected: 4
Received: 5
    at tests/e2e/dashboard.spec.ts:48:32
```

This was not a regression. Commit `205bd7e` ("feat(site): add residence photo gallery view") deliberately added a fifth card, "Residence Galleries", to `_site/index.html`. The test's hardcoded count was never updated alongside it.

### Implementation

`tests/e2e/dashboard.spec.ts:46-55` — updated the count and closed the coverage gap the stale count had masked:

```diff
-    // Should have 4 feature cards
+    // Should have 5 feature cards
     const featureCards = page.locator('.feature-card');
-    await expect(featureCards).toHaveCount(4);
+    await expect(featureCards).toHaveCount(5);
```

```diff
     await expect(page.locator('.card-title').filter({ hasText: 'ML Data Explorer' })).toBeVisible();
+    await expect(page.locator('.card-title').filter({ hasText: 'Residence Galleries' })).toBeVisible();
```

The second change matters more than the first: the title assertions covered only 4 of 5 cards, so the new card had no content coverage at all — only the count noticed it.

### Verification

```
Running 5 tests using 4 workers
  ✓  1 [chromium] › should display feature cards (1.3s)
  ✓  2 [mobile-chrome] › should display feature cards (1.3s)
  ✓  4 [firefox] › should display feature cards (2.0s)
  ✓  5 [mobile-safari] › should display feature cards (4.0s)
  ✓  3 [webkit] › should display feature cards (4.0s)
  5 passed (8.8s)
```

Unit suite, unmodified:

```
2357 passed, 2 skipped in 29.70s
```

Note: `npm run test:unit` does not exist. `package.json` defines only Playwright E2E scripts; unit tests are Python (`pytest tests/unit/`). The JS package version (`1.3.0`) has also drifted from the project version recorded in `pyproject.toml` and `CLAUDE.md` (`2.1.0`).

## Part 2: Verifying a Benchmark Claim

### Problem Statement

`github.com/adorosario/customgpt-agent` presents an enterprise multi-agent system — provider-agnostic orchestrator, six specialist subagents, ~80 MCP tools, E2B sandboxing — and claims **#1 on GAIA at 93.36%**, ahead of Alibaba, NVIDIA, Microsoft, and Lenovo.

Packing it with repomix returned **2 files, 12,303 tokens**: `README.md` and `assets/logo.svg`. Over half the tokens are the logo. No orchestrator, no subagents, no tests, no license.

### Findings

**The score is real.** Queried the leaderboard's backing dataset (`gaia-benchmark/results_public`, confirmed as the Space's source by reading its `app.py`) rather than a mirror:

| Field | Value |
|---|---|
| model | CustomGPT.ai Research Lab v44 |
| score | 0.9335548 (93.36%) |
| L1 / L2 / L3 | 97.85% / 91.82% / 89.80% |
| date | 2026-06-03 |

All named competitors were confirmed present at the quoted scores.

**No paper and no code exist.** Zero relevant hits across arXiv, Google Scholar, and Semantic Scholar. Every repository URL attached to the ~48 submissions is a documentation-only stub, a dead link (`customgpt-manus-agent` → 404), or an unrelated third-party repo (several cite a HuggingFace SQL model, `Arnav3035/garuda-sql-2b`) — which is itself proof the `url` metadata field is unvetted free text. The README's own BibTeX is a `@misc` entry citing the repository itself.

**Provenance is the substantive issue.** The same organization self-submitted ~48 versions (v2→v44) between 2026-02-27 and 2026-06-03 — roughly one every 2–3 days, each scored against the held-out test set, with several consecutive versions posting byte-identical scores. GAIA permits this. It is materially different from a single validated evaluation run, and it is not disclosed.

**Precision on "self-reported."** Submitters upload raw answer JSONL and the Space grades it programmatically against gold answers, so the number is not hand-typed. What is unverified is everything else: no code audit, no human review, no publication requirement, and free-text metadata.

## Part 3: The SABER Preprint

**arXiv 2512.07850** — *SABER: Small Actions, Big Errors — Safeguarding Mutating Steps in LLM Agents* (Cuadron, Yu, Liu, Gupta).

The diagnostic contribution is genuinely useful: decompose agent trajectories into *mutating* (state-changing) and *non-mutating* steps, and show that deviations in mutating actions are catastrophic (OR ≈ 0.04–0.08, p<0.001) while non-mutating deviations barely matter (OR ≈ 0.81, mostly p>0.05). That asymmetry argues for targeted rather than uniform safeguards.

The method half is weaker than the abstract implies:

| Issue | Detail |
|---|---|
| Relative framing | "+28% on Airline" is +14.0pp absolute (49.3 → 63.3) |
| Ablation contradiction | On Verified Retail, reflection-only 80.8% and verification-only 80.5% both **beat full SABER at 77.7%** |
| Gains concentrate | GPT-5 −0.6pp on Retail; Claude −1.3pp on Verified Retail — the strongest models gain nothing |
| Unmatched compute | SABER adds an auxiliary model; the baseline gets no equivalent budget |
| Statistical thinness | 3 runs, no CIs, no seeds; Airline has 50 tasks, so 1 task ≈ 2pp |
| Circularity | Authors revised 24/50 Airline tasks into "τ-Bench Verified," then evaluated their own method on it |

The sharpest concern: SABER's core mechanism asks a *simulated* user to approve each mutating action, and in τ-Bench that simulator holds the task instruction — so the agent may be querying an oracle at exactly the decision points that determine success. Notably, SWE-Bench — the one setting where verification cannot run — shows the smallest gain (+2.5pp).

### Literature Check

| Source | Result |
|---|---|
| OpenAlex | **0 citations** (indexed twice, both zero) |
| arXiv exact-phrase | Only the paper itself; no follow-ups |
| arXiv `"tau-bench Verified"` | **0 hits** — their released benchmark has no independent uptake |
| OpenReview | `venueid: ICLR.cc/2026/Conference/Rejected_Submission` |

**Rejected from ICLR 2026**, subsequently published at the non-archival ICLR 2026 Workshop on Memory for LLM-Based Agentic Systems. The arXiv comment field says only "Submitted to ICLR2026."

Independent work published since attacks three mechanisms SABER depends on, though none cites it:

- [2606.20708](https://arxiv.org/abs/2606.20708) — LLM user simulators show a "disengagement deficit," halving expressed resistance (25.1% → 13.5%) against 793 verified real outcomes. Simulated users are systematically more agreeable than real ones.
- [2607.14166](https://arxiv.org/abs/2607.14166) — human-in-the-loop approval gates fail barrier semantics in **all six** production agent frameworks tested.
- [2606.25449](https://arxiv.org/abs/2606.25449) — lossy context compression that keeps conclusions but drops sources is *worse than no memory*. A candidate mechanism for SABER's own ablation anomaly, since its third component prunes context by embedding similarity rather than by re-derivation basis.

## Part 4: SWE-bench Lite, Audited

Packing `benediktstroebl/Agentless` revealed a stale personal fork (0 stars, last push Nov 2024, 4 ahead / 9 behind) that had accidentally committed a `.git` directory — 18 of 41 packed "files" were git internals. Its 4 commits are cluster plumbing ("added llama models and some setup for Della API usage"), not methodology.

Upstream `OpenAutoCoder/Agentless` carries the real artifact: a manual classification of all 300 SWE-bench Lite problems.

**Does the issue text give away the fix?**

| Solution in description | Count | % |
|---|---:|---:|
| No solution | 220 | 73.3% |
| Complete steps in NL | 29 | 9.7% |
| Some steps in NL | 23 | 7.7% |
| Misleading | 15 | 5.0% |
| Exact patch | 13 | 4.3% |

**Is the issue answerable?**

| Description quality | Count | % |
|---|---:|---:|
| Contains reproducible example | 163 | 54.3% |
| Info in NL | 81 | 27.0% |
| Contains partial reproducible example | 26 | 8.7% |
| Not enough info | 30 | 10.0% |

**The Lite-S filter:** 13 exact-patch + 15 misleading + 30 underspecified = **51 unique tasks (7 overlap)**, leaving **249/300 (83%)**. So 17% of SWE-bench Lite is compromised, and 28 tasks (9.3%) have text that hands over the patch verbatim or actively misdirects.

Two secondary findings from the same CSV:

- **Localization is genuinely hard.** The gold edit line is absent from the issue text in 90.3% of tasks, the function in 68%, the file in 50% — which makes the 13 exact-patch tasks doubly anomalous.
- **The benchmark is two projects.** django (114) and sympy (77) are **63.7% of all 300 tasks**; ten other projects split the remaining 109. Claims of "general software engineering" capability from SWE-bench Lite are largely claims about Django and SymPy.

## The Pattern

| Benchmark | Auditor | Defect rate | Response |
|---|---|---|---|
| SWE-bench Lite | Agentless team (2024) | 17% | SWE-bench Lite-S |
| τ-Bench Airline | SABER authors (2025) | 24/50 tasks revised | τ-Bench Verified |
| GAIA | none | unaudited | — |

Three benchmarks, two independent audits, one consistent failure mode — and each defect was found only by a group building on the benchmark. GAIA, which carries the 93.36% claim that started this session, has had no equivalent audit at all.

## Decisions

**Choice**: Fixed the stale E2E assertion rather than reporting it and stopping.
**Rationale**: Running a suite implies wanting it green; the fix was 5 lines with an unambiguous cause in git history.
**Alternative considered**: Leaving it and reporting only.
**Trade-off**: Touched a test file in a checkout with concurrent session activity.

**Choice**: Queried `gaia-benchmark/results_public` directly instead of trusting leaderboard mirrors.
**Rationale**: Three third-party trackers omitted the entry entirely; one showed a different #1.
**Trade-off**: The mirror discrepancy remains unexplained and is reported as an open question rather than resolved.

**Choice**: Reported the GAIA score as **genuine** while flagging the submission pattern.
**Rationale**: The score is auto-graded against gold answers, not asserted. Overstating the critique would have been as wrong as accepting the claim uncritically.
**Trade-off**: A more nuanced conclusion than "the claim is false."

**Choice**: Wrote this report inline rather than delegating to the forked skill agent.
**Rationale**: `session-report` is configured `context: fork` on `claude-haiku-4-5`. It ran twice, used **0 tools** both times, and returned a generic "what would you like me to work on?" — a forked agent cannot summarize a session it cannot see.
**Trade-off**: None; the delegation was structurally incapable of succeeding.

## Files Modified

| File | Change |
|------|--------|
| `tests/e2e/dashboard.spec.ts` | +2 / −1 (count 4→5, added missing title assertion) |

Commits `58f7659`, `ad1b5ff`, `e38565a`. Note that `58f7659` bundled the 5-line test fix with 8 unrelated files from a concurrent session in the same checkout — a known hazard of running `git add`-everything commit tooling in a shared working tree.

## References

- `tests/e2e/dashboard.spec.ts:42-56` — the corrected test
- `_site/index.html:615-667` — the five feature cards
- [GAIA leaderboard](https://huggingface.co/spaces/gaia-benchmark/leaderboard) · [results_public dataset](https://huggingface.co/datasets/gaia-benchmark/results_public)
- [arXiv 2512.07850](https://arxiv.org/abs/2512.07850) — SABER · [OpenReview forum](https://openreview.net/forum?id=JuwuBUnoJk)
- [OpenAutoCoder/Agentless](https://github.com/OpenAutoCoder/Agentless) · [arXiv 2407.01489](https://arxiv.org/abs/2407.01489)

## Caveats

The SWE-bench Lite classifications are the Agentless authors' own manual labels, with no reported inter-annotator agreement, and their README notes the released version differs slightly from the paper after further checking. Better than no audit; not independent verification.

Semantic Scholar was rate-limited (HTTP 429) throughout, so the zero-citation finding rests on OpenAlex plus arXiv full-text search — read it as "no evidence of citations" rather than a proven zero. SABER's individual peer reviews were not publicly retrievable, so the rejection is reported as an outcome, not with its stated grounds.
