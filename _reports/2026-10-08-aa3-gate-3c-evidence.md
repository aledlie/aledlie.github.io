---
layout: single
title: "AA3 Gate 3c: From an Open Row to an Audited Evidence Whitepaper"
date: 2026-10-08
author_profile: true
categories: [research-planning, ai-evaluation, documentation]
tags: [asi-evolve, llm-as-judge, faithfulness, self-preference, sabotage-monitoring, arxiv, research-synthesis, fact-checking, hallucination-audit]
excerpt: "Built the evidence base for AA3 Gate 3c, wrote a 42-source recency-weighted whitepaper, ran hallucination-checker over it, and corrected what the audit and three full-text reads showed was overstated or wrong."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
permalink: /reports/aa3-gate-3c-evidence/
---

**Session Date**: 2026-10-08<br>
**Project**: claude-dev-environment (`~/.claude`)<br>
**Focus**: Evidence for AA3 Gate 3c, the whitepaper that followed, and the audit that corrected it<br>
**Session Type**: Research synthesis

## Executive Summary

Gate 3c of the AA3 evolutionary-loop plan asks whether a programmatic check of a report's numerical claims against raw execution logs (safeguard A) can stand in for a second evaluator from a different model family (safeguard B). The row was tagged `[open]` with no evidence attached. Over four user-directed passes it acquired a sourced context section, a targeted re-check that falsified one of that section's sentences, a 42-source whitepaper with a September–October 2026 recency sweep, and a `hallucination-checker` audit whose 28 findings drove a revision pass, including three full-text reads that overturned two claims the whitepaper had made from abstracts.

The evidence sorts by error class. A deterministic check is favoured over a model judge for numeric claims, by inference from three adjacent settings; no head-to-head on experiment reports exists. A is blind by construction to four other classes: right numbers with a wrong story, omission, correct numbers from a flawed experiment, and tampered logs. Same-family judge preference is real and measured at the frontier (Pombal: most judges over-credit relatives, up to an 11.9 ratio on code rubrics; preference leakage: 2.8–8.9% same-family vs 23.6% same-model), smaller than same-model preference, and no study found tests whether switching family or calibrating the judge is the better remedy. Deliberate deception is addressed by neither safeguard as written; the monitoring evidence that points to a remedy is transferred from sandbagging settings, not tested on report fabrication.

The user adopted the whitepaper's reframing into Gate 3c: the check is an integrity plane with prerequisites the plan did not list, the second reader is a support plane whose family is deferred to deliverable 1.5, and deception is a third plane. The audit did not change that decision; it narrowed how firmly the evidence under it is described.

## Key Metrics

| Metric | Value |
|---|---|
| External sources in the whitepaper | 42 (16 submitted Sep–Oct 2026) plus 2 local |
| Sources by read grade (final) | 6 full text, 33 abstract, 3 abstract with secondary figures, 2 secondary |
| arXiv searches | 46 (32 initial and recency, 14 falsification; 6 failed on query syntax) |
| Extended web searches | 5 |
| Full-text fetches | 15 (7 before the audit, 3 slices of one paper, 3 post-audit reads, 2 re-reads) |
| Headline figures re-verified on abstract pages | 10 of 10 held; 2 gained qualifications |
| Claims falsified by re-check or audit reads | 3 (the "no measurement exists" sentence; "Pombal reports only self-judging"; "preference leakage not sized at the frontier") |
| Audit findings | 28 (8 high, 16 medium, 4 low); 24 acted on, 4 judged incorrect or already answered |
| Revision marks in the whitepaper | 26 `[rev.]` |
| Plan diff vs `main` at end of session | +149 / −99 across the plan and whitepaper (post-commit edits) |
| Commits this session | 2 (`90d72aab`, `07397e30`); audit revisions uncommitted |

## Problem Statement

§4.3 of the source design mandates both safeguards and justifies B in one sentence: a same-family Analyzer "may share blind spots." The plan's Gate 3c carried that forward as an open local judgement with nothing to judge from. Getting it wrong is asymmetric: if A suffices, B is a cost the sixteen-week sizing does not contain; if A does not suffice and is treated as if it did, the Analyzer gets built around an evaluator design that the plan's own Gate 3 header says is invalidated rather than tuned. The plan also had a prior local experiment on the question (Gate 3b: same-family judge harsher, AUC 0.84 vs 0.93 on 11 labelled items, graded weak), so the literature had something to be read against.

## Implementation Details

### Pass 1: the § 3c context section

Two inputs ran in parallel: a `web-research-analyst` brief across five areas (artefacts in `~/.claude/research-artifacts/20261008-011600-numeric-check-vs-cross-model-judge/`), and `scientific-skills` → `arxiv-database` with twelve phrase-pair searches yielding 24 abstracts. The first six searches returned nothing because the script ANDs each keyword as an exact phrase; phrase pairs fixed it. The section was organised by error class using the `scientific-critical-thinking` framing, which is what turned an unanswerable yes/no into three answerable sub-questions.

### Pass 2: the re-check

The user asked for a double-check of one sentence: that the numeric-vs-non-numeric split in LLM-written experiment reports "does not exist in the literature." Fourteen further searches and full-text reads of five candidates found it false. Google's Co-Scientist study (`2608.26701`, §3.4 and Appendix D) scores result hallucination and methodological hallucination separately on 150 AI-generated papers: with the system's reliability modules on, severe result hallucination fell to 4% (ablated 46%, Agent Laboratory 90%) while severe methodological hallucination stayed at 24% (52%, 100%). The correction was dated in the plan.

### Pass 3: the whitepaper

`docs/roadmap/AA3_GATE3C_EVIDENCE_WHITEPAPER.md`, in the repo's Markdown rather than the `scientific-writing` skill's LaTeX template so it can be linked by section and diffed. Three features: a fact-check of ten figures on their arXiv abstract pages (all held; Pombal's ">50%" is scoped to rubrics the generator failed; Roytburg's "51% of examples" sits beside "89.6% of the effect mass"); a recency sweep of twenty date-sorted searches that brought in sixteen September–October 2026 sources; and a read grade on every reference. The sources that changed the argument were ClaimReceipt and Open-Endedness Bench (A extends to omitted experiments and unsupported propositions), Actions with Receipts (the integrity-plane / support-plane split), the Oversight Gap (an executed second run takes monitors from 50.4% to 90.0%), and Awuni et al. (the first design isolating family from identity).

The user then had Gate 3c edited to align with the whitepaper's § 6: `[resolved — evidence]`, with a four-point decision block in the plan's § 3c context.

### Pass 4: the audit

The user asked for `hallucination-checker` on the session. The agent is a static analyser of prompt text, so it was pointed at the three documents the session wrote and given the full verification record: which papers were read in full, which figures were confirmed on abstract pages, and which came only from the research subagent or press coverage.

It returned 28 findings. The ones that mattered most:

| Finding | What was wrong | Fix |
|---|---|---|
| Co-Scientist's 4% presented as "safeguard A done by hand" | Reviewers' log cross-referencing was the *measurement*; the *intervention* was the system's reliability modules, whose contents were never established | Reframed in whitepaper §3.1, §3.5 and the plan; synthesis row downgraded to Moderate; "A beats a model judge" replaced with "favoured, by inference; no head-to-head" |
| "Family is not a blind spot" built on absence | No study tests family on error detection; the one cited measurement had a CI excluding zero | Three full-text reads (below); conclusion rewritten |
| Negative claims about paper bodies made from abstracts | "Pombal reports only self-judging"; "preference leakage not sized at the frontier"; "Panickssery has no same-family arm" | Read in full; two of three were false |
| Status inconsistency across documents | Whitepaper §1 and §6 and the report still said open; the plan's decision named no decider | "Decided by the user 2026-10-08" throughout |
| FRANK cited under omission | Its out-of-source category is extrinsic addition | Removed from class 2 in both documents |
| "4.85 times as likely" | Misstates an odds ratio | "4.85 times the odds" |
| §2 cross-references to §4.3/§4.4/§4.5 | Wrong section numbers, colliding with the source design's §4.3 | §3.1, §3.3, §3.5 |
| Awuni "7–9B models" | Size inferred; abstract gives families only | Removed |
| "Strong" grades with no rubric | Several rested on abstracts alone, one on a secondary source | Rubric added to front matter; table regraded |
| Sakana timeout-edit incident in the plan | Press coverage via the subagent, cited to a paper that does not contain it | Removed |
| Counts and ranges in the report | Grade counts, search counts, line ranges and commit state did not reconcile | This report |

Four findings were judged incorrect or already answered: several specifics the auditor flagged as unverified (RAIM's ten judges and 93% κ, Fox's eight designs, Awuni's crossed design, the "integrity plane / support plane" phrase) are in abstracts the session read; the hosted-model premise is sourced to §4.3's "Evaluator (Claude API call)" and now cites it; the Gate 2 decisions were the user's instructions and the report's Gate 2 omission was the user's scoping; and the "fourth approval gate" row described an edit the session itself made to the Safety Controls table.

**The post-audit reads.** Pombal et al. (`2604.06996`) report a family-level over-crediting ratio for every judge in Appendix D Table 5: "most judges also over-credit their relatives, most severely on LiveCodeBench (GPT-5: 11.91)", on frontier models (GPT-5, Claude 4.5, Gemma 3, Llama 4, Qwen 3), with the Llama family showing no family preference on HealthBench. Preference leakage (`2502.01534`) sizes relatedness with GPT-4o, Gemini 1.5 and Claude 3.5 judges: 23.6% same model, 8.9% same family and series, 2.8% same family and different series. Panickssery et al. (`2404.13076`) confirmed its headline figures; its design has GPT-4 and GPT-3.5 judging each other but is not framed as a family test. The whitepaper's §3.3 now leads with these three measurements, and its conclusion is that same-family preference is real, smaller than same-model preference, and that the remedy comparison is untested.

**Design decisions**

- **Choice**: Mark every audit-driven revision `[rev.]` in place rather than rewrite silently.
  **Rationale**: the plan's own convention since `DOC8` is to leave falsified statements visible; a reader should be able to see what the audit changed.
- **Choice**: Keep the Gate 3c decision, re-word its evidence.
  **Rationale**: the decision was the user's; the audit found the evidence over-described, not the decision unsupported. The decision block in the plan says so.
- **Choice**: Attribute the decision explicitly ("decided by the user 2026-10-08").
  **Rationale**: rows 2a and 2c already carried attribution; 3c did not, and the auditor was right that a decision with no decider reads as the document's own.

### Link back to the plan

`AA3_ASI_EVOLVE_IMPLEMENTATION_PLAN.md`: row 3c (`:382`), § 3c context (`:743-876`) with the decision block at `:822`, the "Whether B" paragraph at `:795`, and the Co-Scientist paragraph at `:852`. The whitepaper's front matter names the plan as what it serves and records the outcome and the audit.

## Testing and Verification

Citation integrity, checked after each edit batch:

```
PLAN used-not-defined: set() defined-not-used: set()
WP cited-not-listed: [] listed-not-cited: []
```

The plan check initially reported `ev-3c-frank` defined but unused after the FRANK removal; the key was deleted. The whitepaper check confirms [31], [41] and the new [44] are now cited and nothing dangles.

Fact-check results on arXiv abstract pages (pass 3) and full texts (pass 4):

| Figure | Source | Result |
|---|---|---|
| >50% more likely to pass own failed rubric | 2604.06996 | Confirmed; scoped to rubrics the generator failed. Full read: family-level ratios exist (Table 5) |
| 0.50–0.63 omission vs 0.79–0.94 addition | 2608.31016 | Confirmed verbatim; eight judge designs |
| 26–73% over-generalisation; OR 4.85 | 2504.00025 | Confirmed; 3 of 10 models; CI [3.06, 7.70] |
| 3.4–8.4 pp same-family lift | 2609.17857 | Confirmed; 9,312 judgments, pairwise; sizes not stated |
| 54 cycles, 56% zero-or-negative delta | 2607.25152 | Confirmed verbatim |
| GPT-4o monitors o3-mini | 2503.11926 | Confirmed verbatim |
| ~80% fabricated or invalidated | 2505.19955 | Confirmed; term undefined |
| Four failure modes; trace logs enable detection | 2509.08713 | Confirmed; NeurIPS 2025 AI4Science spotlight |
| All harnesses but Muse Code allow trace deletion | 2609.30266 | Confirmed verbatim |
| 51% of examples survive | 2601.22548 | Confirmed; plus 89.6% of effect mass |
| Same-family leakage size | 2502.01534 | Full read: 8.9% / 2.8% vs 23.6% same-model; frontier judges |
| Self-recognition 73.5%; label swap 0.73→0.32 | 2404.13076 | Full read: confirmed; GPT-4/3.5 cross-judging not framed as family |

Git state at end of session in `~/.claude`:

```
 M docs/roadmap/AA3_ASI_EVOLVE_IMPLEMENTATION_PLAN.md
 M docs/roadmap/AA3_GATE3C_EVIDENCE_WHITEPAPER.md
 2 files changed, 149 insertions(+), 99 deletions(-)
07397e30 docs(roadmap): tighten the Gate 3c whitepaper prose
90d72aab docs(roadmap): decide AA3 Gate 2 and add the Gate 3c whitepaper
```

No test suites apply; all changes are documentation.

## Files Modified and Created

| File | Change |
|---|---|
| `docs/roadmap/AA3_GATE3C_EVIDENCE_WHITEPAPER.md` | New (committed `90d72aab`, copyedited `07397e30`); audit revisions uncommitted: rubric, 26 `[rev.]` passages, three references regraded to F, [44] added, grade counts |
| `docs/roadmap/AA3_ASI_EVOLVE_IMPLEMENTATION_PLAN.md` | Gate 2a/2c rows and Safety Controls row (committed); 3c row, § 3c context, decision block, 26 citation keys (committed, then revised uncommitted after the audit) |

Files read, not modified: `docs/archive/ASI_EVOLVE_AUDIT_AND_INTEGRATION.md` §4.3 and Open Question 5; the plan's § 3b sections; `docs/BACKLOG.md` (`CSV4`, `G3B2`).

Temporary search outputs (about 60 JSON files) are in `~/.claude/jobs/db599fd3/tmp/` and are cleaned with the job.

## Open Items

- Gate 3c is decided; the second reader's model family is deferred to deliverable 1.5's design, where the measured same-family preference must either be calibrated away or avoided by family choice.
- Two sources remain secondary (grade S): Anthropic's eval guidance and Khullar et al.; three carry subagent-sourced figures over an abstract read (Beel, FRANK, SHADE-Arena). Full reads would retire those grades.
- The non-numeric residual (omission vs over-generalisation vs framing) is unmeasured for experiment reports and is the cheapest local experiment that would change 1.5's report schema.
- The audit revisions in both roadmap files are uncommitted. `/git-commit-smart docs/roadmap/AA3_ASI_EVOLVE_IMPLEMENTATION_PLAN.md docs/roadmap/AA3_GATE3C_EVIDENCE_WHITEPAPER.md` scopes the commit.

## References

- `docs/roadmap/AA3_GATE3C_EVIDENCE_WHITEPAPER.md` — the deliverable, with § 4 synthesis table and § 7 graded references
- `docs/roadmap/AA3_ASI_EVOLVE_IMPLEMENTATION_PLAN.md` § Gate 3 (`:371-876`): 3b results, 3b labelled set, 3c context and decision
- `docs/archive/ASI_EVOLVE_AUDIT_AND_INTEGRATION.md` §4.3, Open Question 5
- Research artefacts: `~/.claude/research-artifacts/20261008-011600-numeric-check-vs-cross-model-judge/`
- Key sources: [Co-Scientist](https://arxiv.org/abs/2608.26701), [Pombal et al.](https://arxiv.org/abs/2604.06996), [Preference leakage](https://arxiv.org/abs/2502.01534), [Oversight Gap](https://arxiv.org/abs/2609.07162), [ClaimReceipt](https://arxiv.org/abs/2609.01992), [Awuni et al.](https://arxiv.org/abs/2609.17857), [Fox et al.](https://arxiv.org/abs/2608.31016), [trace tampering](https://arxiv.org/abs/2609.30266), [RAIM](https://arxiv.org/abs/2609.39229)
- Previous session: [Gate 3b judge-family analysis](/reports/gate-3b-judge-family-analysis/)

---

## Appendix: Readability Analysis

Readability metrics computed with [textstat](https://github.com/textstat/textstat) on the report body (frontmatter, code blocks, and markdown syntax excluded).

### Scores

| Metric | Score | Notes |
|--------|-------|-------|
| Flesch Reading Ease | 47.5 | 0–30 very difficult, 60–70 standard, 90–100 very easy |
| Flesch-Kincaid Grade | 11.1 | US school grade level (High School) |
| Gunning Fog Index | 13.5 | Years of formal education needed |
| SMOG Index | 13.1 | Grade level (requires 30+ sentences) |
| Coleman-Liau Index | 12.5 | Grade level via character counts |
| Automated Readability Index | 11.7 | Grade level via characters/words |
| Dale-Chall Score | 12.90 | <5 = 5th grade, >9 = college |
| Linsear Write | 23.7 | Grade level |
| Text Standard (consensus) | 12th and 13th grade | Estimated US grade level |

### Corpus Stats

| Measure | Value |
|---------|-------|
| Word count | 2,055 |
| Sentence count | 113 |
| Syllable count | 3,421 |
| Avg words per sentence | 18.2 |
| Avg syllables per word | 1.66 |
| Difficult words | 421 |
