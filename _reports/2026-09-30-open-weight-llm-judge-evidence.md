---
layout: single
title: "Can an Open-Weight Model Be Your LLM Judge? What the 2025–2026 Evidence Says"
date: 2026-09-30
author_profile: true
categories: [llm-engineering, evaluation, research]
tags: [llm-as-judge, open-weight-models, gpt-oss, llama, evaluation-benchmarks, cohen-kappa, web-research, workers-ai]
excerpt: "The evidence has moved since MT-Bench and Prometheus 2. gpt-oss-120b is the strongest open judge measured; Llama 3.3 70B is task-dependent; 8B models are not viable as a default. Almost all evidence is pairwise, and no vendor publishes measured quality numbers for an open-weight judge it hosts."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
permalink: /reports/open-weight-llm-judge-evidence/
---

**Session Date**: 2026-09-30<br>
**Project**: observability-toolkit<br>
**Focus**: Open-weight LLM-as-judge viability, 2025–2026 evidence review<br>
**Session Type**: Research

## Executive Summary

The last time many teams benchmarked open-weight models as LLM judges, the reference points were MT-Bench (2023) and Prometheus 2 (2024). The question was whether an open model could track GPT-4o's preferences reliably. That framing is now too narrow.

Six papers published between October 2025 and September 2026 cover 21 judges across three benchmarks and one grounded-QA corpus. The headline result: **gpt-oss-120b** (available on Cloudflare Workers AI) is the strongest open judge found, with a JudgeBench Cohen's kappa of 0.687—above GPT-4.1 (0.487) and GPT-5.4 (0.606), below Claude Opus 4.6 (0.875). On the same paper's RewardBench dimension it scores 0.880, matching the frontier cluster.

**Llama 3.3 70B** tells two different stories depending on the task. On a grounded-QA corpus with three expert annotators it earns a kappa of 0.786 (Tier 1: "Human-like"). On hard correctness-discrimination pairs (JudgeBench) it falls to 0.283, roughly level with GPT-4o's 0.309 on the same benchmark.

**8B models are not supported** as a default judge. Position bias, low human agreement, and outright failure against the human-human spread recur across every 8B-class model in the evidence.

**Almost all evidence is pairwise or binary.** Pointwise 1–5 scoring evidence is thin and unstable. Krippendorff's alpha for Likert scales on one paper ranges 0.33–0.79 depending on model and task; temperature 0 degraded alignment in that study. Anchoring biases flip roughly 10% of correct judgments. No vendor publishes measured judge quality for any open-weight model it hosts or recommends.

The practical conclusion is a validation protocol before any switch: freeze 200 or more human-labelled items from your own stream, measure quadratic-weighted kappa against a human-human ceiling, run three repeats with caching off, apply bias probes, shadow-run the candidate beside the incumbent, and never splice score series from different judges.

## Key Metrics

| Measure | Value |
|---|---|
| Papers covering open-weight judges, 2025–2026 | 6 primary sources |
| Judges evaluated in 2606.19544 | 21 (3 labelled open-weight) |
| gpt-oss-120b JudgeBench kappa | 0.687 |
| Claude Opus 4.6 JudgeBench kappa (frontier ceiling) | 0.875 |
| GPT-5.4 JudgeBench kappa | 0.606 |
| Llama 3.3 70B: grounded-QA kappa (Judge's Verdict) | 0.786 (Tier 1) |
| Llama 3.3 70B: hard correctness pairs (JudgeBench) | 0.283 |
| Qwen3-8B position bias | 0.192 |
| Llama-3.1-8B-Instruct Judge's Verdict tier | Failed (z = −2.73) |
| Providers with published open-weight judge quality numbers | 0 of 10 checked |
| Recommended anchor set size (±5 pp) | 400 or more items |

## What Changed Since 2024

MT-Bench established that GPT-4 preferences were reliable enough to automate pairwise ranking of instruction-following responses. Prometheus 2 (2024) showed a fine-tuned open model could track those preferences well on MT-Bench tasks. Neither addressed hard correctness discrimination, task dependence, or systematic biases.

Three things make the 2025–2026 evidence different.

First, benchmarks now separate *reliability* from *validity*. "Reliability without Validity" (arXiv 2606.19544) names the distinction in its title and measures both: test-retest reliability at temperature 0 across three runs, and Cohen's kappa against ground-truth labels where those exist. The gap is large. GPT-5.4 has the third-highest test-retest (0.932) but is only sixth on JudgeBench kappa (0.606). A judge can return the same answer every time while being wrong about what quality means.

Second, task dependence is now documented at scale. Judge's Verdict (arXiv 2510.09738) ran 54 models—43 open, 11 closed—against three expert annotators on 1,994 grounded-QA and RAG samples. Llama 3.3 70B and Qwen2.5-72B both land in Tier 1 there. The same Llama 3.3 70B appears near chance on JudgeBench's hard correctness pairs. These are not contradictory results; they reflect different task types.

Third, dedicated open-weight judge models have emerged and been benchmarked: Atla Selene Mini (8B, RewardBench 0.756), Skywork-Reward-V2 (8B, RewardBench v1 96.4%), J1 from Meta (8B/32B/70B, weights release unverified), and RM-R1. None of these is on Cloudflare Workers AI as of 2026-09-30. Weights availability for J1 and RM-R1 is unverified in the sources reviewed.

## Per-Model Numbers: arXiv 2606.19544

The most complete single source is "Reliability without Validity" (arXiv 2606.19544, 2026-06-17, preprint). It covers 21 judges, approximately 541,000 judgments, across MT-Bench, JudgeBench, and RewardBench, reporting Cohen's kappa, position bias, and test-retest reliability.

The paper labels Kimi K2.5, GLM-5, DeepSeek V3.2, and Qwen3-8B as "Closed", probably by API access; these are open-weight families. If re-labelled open, Kimi K2.5 (JudgeBench kappa 0.720, RewardBench 0.873) improves the open-weight picture. Confirm against the paper's appendix before using those numbers.

| Model | MT-Bench kappa | JudgeBench kappa | RewardBench | Pos. bias | Test-retest |
|---|---|---|---|---|---|
| Claude Opus 4.6 | 0.489 | 0.875 | 0.879 | 0.004 | 0.958 |
| Gemini 3.1 Pro | 0.511 | 0.841 | 0.898 | 0.038 | 0.977 |
| GPT-5.4 | 0.457 | 0.606 | 0.879 | 0.083 | 0.932 |
| GPT-4o | 0.451 | 0.309 | 0.745 | 0.045 | n/a |
| **gpt-oss-120b (open)** | 0.441 | **0.687** | **0.880** | 0.037 | 0.947 |
| **Llama 3.3 70B (open)** | 0.465 | 0.283 | 0.769 | 0.057 | 0.954 |
| Mixtral 8x22B (open) | 0.392 | 0.271 | 0.679 | 0.058 | n/a |
| Qwen3-8B | 0.406 | 0.289 | 0.616 | 0.192 | 0.992 |
| Kimi K2.5 | 0.461 | 0.720 | 0.873 | 0.004 | 0.917 |
| GLM-5 | 0.442 | 0.596 | 0.838 | 0.052 | 0.934 |
| DeepSeek V3.2 | 0.486 | 0.545 | 0.826 | 0.094 | 0.916 |

Two findings from the same paper: verbosity bias is below 0.011 for all judges on MT-Bench, which is good news. There is a 33–41 percentage point gap between exact-match agreement and kappa for every judge, which is the reason to report kappa rather than agreement rate.

## Per-Model Numbers: Judge's Verdict Tiers

Judge's Verdict (arXiv 2510.09738, 2025-10-10, under review ICLR 2026) ran 54 LLMs—43 open (1B–405B), 11 closed—against three expert annotators on 1,994 grounded-QA and RAG samples. Human-human kappa was 0.801. "Failed" means the model fell outside the human-human spread (|z| > 1), not that its absolute kappa was low.

27 of 54 models reached Tier 1. The authors state that size alone does not determine judge quality.

| Model | Pearson r | Kappa | z vs human | Tier |
|---|---|---|---|---|
| **Llama-3.3-70B-Instruct (open)** | 0.860 | 0.786 | 0.18 | Human-like |
| Qwen2.5-72B-Instruct (open) | 0.858 | 0.785 | 0.14 | Human-like |
| Qwen3-30B-A3B-Instruct-2507 (open) | 0.846 | 0.780 | −0.04 | Human-like |
| gpt-oss-20b (open) | 0.837 | 0.765 | −0.58 | Human-like |
| **Llama-3.1-8B-Instruct (open)** | 0.800 | 0.730 | **−2.73** | **Failed** |
| GPT-4o | 0.818 | 0.728 | −1.55 | Failed |
| Claude-Sonnet-4 | 0.847 | 0.768 | −0.44 | Human-like |
| Gemini-2.5-Flash-Lite | 0.857 | 0.777 | −0.17 | Human-like |
| gpt-4.5 (best closed) | 0.874 | 0.806 | 0.90 | Human-like |

Note that GPT-4o fails this benchmark while Llama 3.3 70B passes. These are grounded-QA tasks; the JudgeBench numbers above are hard correctness-discrimination pairs. Neither benchmark is a universal proxy for the other.

## Bias and Pointwise-Scoring Findings

The bias literature is the part of the evidence that has moved the most since 2024.

**Pointwise 1–5 scoring is thin and unstable.** Rating Roulette (arXiv 2510.27106, 2025-10-31) tested Llama-3.1-70B, DeepSeek-R1-Distill-Qwen, and Qwen3-32B. Krippendorff's alpha ranged 0.33–0.79 on SummaC; Likert 1–5 fluency scoring on SummEval was especially unstable; MT-Bench self-reliability was as low as 0.27. Temperature 0 degraded human alignment (not improved it, which is counterintuitive). The paper recommends majority-voting over multiple runs. A separate scale study (arXiv 2601.03444, 2026-01-08) found that 0–5 gave the best human-LLM intraclass correlation coefficient among scales tested.

**Anchoring.** A prior score shifts judgments with Cohen's d up to 0.71 and flips 10.18% of correct judgments (arXiv 2608.25869, 2026-08-26). Prompt warnings and chain-of-thought did not remove the effect. The practical rule: never pass a prior score to a judge prompt.

**Style bias.** The dominant bias is markdown over plain prose, with a preference rate of 0.10–0.76 across models (arXiv 2604.23178, 2026-04-25). The best mitigation studied achieved kappa 0.549 / 71.0%—a partial fix, not a cure.

**Construct validity.** Across seven judges, invariance to irrelevant changes averaged 0.945, but sensitivity to real quality changes averaged only 0.319 (arXiv 2608.24419, 2026-08-25). Judges that return stable scores are not necessarily detecting what you want them to detect.

**Self-preference.** Two papers argue apparent self-preference mostly disappears once style and quality are controlled (arXiv 2504.03846, 2025-04; EMNLP 2025 proceedings). These are search snippets only—treat as a working hypothesis, not a finding.

**Position and verbosity bias.** From 2606.19544: small and cost-optimised models show the most position bias. Two high-reliability production judges—Gemini 2.5 Flash (0.125) and GPT-5.4 (0.083)—combine high test-retest with notable position bias. This is the "reliability without validity" failure mode: consistent but wrong about order.

**8B models specifically.** Llama-3-8B Pearson correlation with humans was 0.275, Qwen2.5-7B was 0.340, with self-consistency above 90% for both (arXiv 2609.13824, 2026-09-12). High self-consistency did not predict human agreement. That study used GPT-2 outputs and 300 items, so treat the absolute numbers with caution, but the direction is consistent with everything else: 8B models are stable to themselves and unreliable against humans.

## The Provider Gap

Ten observability and evaluation providers were checked: Cloudflare, W&B, Langfuse, Arize, Braintrust, Datadog, LangSmith, Galileo, Patronus, and Atla. None publishes measured judge-quality numbers—kappa, correlation, or agreement against human labels—for any open-weight model they host or recommend as a judge. Their documentation covers methodology: how to think about calibration, what metrics to compute, why 100 examples gives roughly ±10 pp margin of error and 400 gives ±5 pp (Arize, July 2026). The kappa thresholds circulating among practitioners ("0.6 acceptable, 0.8 strong") come from a vendor blog post (futureagi.com, 2026), not from a study. They are practitioner heuristics, not research findings.

One specific gap worth noting: Cloudflare's Workers AI catalogue (checked 2026-09-30) includes gpt-oss-120b, gpt-oss-20b, Llama 3.3 70B fp8-fast, Llama 3.1 8B fp8, Qwen3-30B-A3B-fp8, QwQ-32B, and several others. None of the dedicated judge or reward models (Selene Mini, Skywork-Reward-V2, J1, RM-R1) is on that catalogue. Per-model RewardBench 2 or Preference Proxy Evaluations rows for the Workers AI models were not extracted in this review.

## What This Supports for a 70B Default

**Supported.** Llama 3.3 70B is human-like on grounded-QA correctness tasks: kappa 0.786 against three expert annotators, on par with Claude Sonnet 4 (0.768) and Gemini 2.5 Flash-Lite (0.777) on the same corpus. Position bias is low (0.057). Test-retest reliability is high (0.954). gpt-oss-120b (available on Workers AI) is the strongest open judge found overall: JudgeBench kappa 0.687, RewardBench 0.880, best human alignment in AgentJudgeBench. It is a reasoning judge, which a separate study (arXiv 2603.12246, 2026-03-12) found less susceptible to reward hacking than non-reasoning judges.

**Not supported.** Llama 3.3 70B on hard correctness discrimination: JudgeBench kappa 0.283 is roughly chance-level for that benchmark. Any claim of frontier parity: the best closed judge (Claude Opus 4.6, kappa 0.875) leads the best open judge (gpt-oss-120b, kappa 0.687) by about 0.19 kappa on JudgeBench. Any claim based on Llama 4 Scout, Gemma 4, Mistral Small 3.x, Kimi K2.x, or GLM measured as 1–5 judges against humans—that evidence was not found. Almost all evidence is pairwise or binary. Pointwise 1–5 scoring evidence is thin and unstable.

On this evidence, gpt-oss-120b is the better default than Llama 3.3 70B—but only after measurement on your own anchor set, not before.

## What This Does Not Support for an 8B Default

**Not supported.** Models at 8B are not viable as a default judge. Qwen3-8B has position bias of 0.192 (the highest in the 2606.19544 table) and JudgeBench kappa of 0.289. Llama-3.1-8B-Instruct is classed "Failed" in Judge's Verdict (z = −2.73 against the human-human spread; kappa 0.730 is above 0.6, but the model falls outside the human-human distribution). Llama-3-8B Pearson 0.275 and Qwen2.5-7B Pearson 0.340 with high self-consistency reinforce the pattern.

Dedicated 8B judges (Selene Mini with RewardBench task-average 0.756, Skywork-Reward-V2 with RewardBench v1 96.4%) perform better but are reward models or specifically fine-tuned judges. They are not on Workers AI. A general-purpose 8B instruction model as a rubric-following 1–5 judge is not supported by this evidence.

An 8B model might be viable as a triage-only judge on narrow, well-defined criteria, with escalation to a larger model on low-confidence outputs. That case has not been measured.

## Validation Protocol Before Any Switch

The consistent recommendation across the research and practitioner literature is: measure on your own data before switching judges. The following protocol synthesises 2606.19544, arXiv 2606.15474 (anchor sets and drift attribution), and the shadow-mode guidance from oneuptime (2026-08-31).

1. **Anchor set.** Freeze 200 or more human-labelled items from your own stream, stratified by task type. Use 400 or more for a ±5 pp margin of error. Two to three raters per item. Measure human-human kappa first—that is your ceiling, not a published threshold.

2. **Metrics.** Quadratic-weighted kappa or intraclass correlation for 1–5 scores, exact match, and Spearman. Compare to the human-human baseline. Pre-register thresholds before you run. A kappa of 0.6 as a floor is a practitioner heuristic; your ceiling may be lower or higher.

3. **Reliability.** At least three repeat runs per item, caching off. Report test-retest or Krippendorff's alpha. If sampling above temperature 0, take the median of three runs.

4. **Bias probes.** Order swap on pairwise items; length expansion; markdown versus plain prose; rubric-order permutation; score-ID permutation. Never pass a prior score to any prompt.

5. **Sensitivity check.** Include degraded answers. Confirm scores drop on 90% or more of pairs.

6. **Multi-dataset.** At least two datasets of different label type. Ranks move by up to 14 positions across benchmarks (2606.19544). A single benchmark does not generalise.

7. **Shadow run.** Run the candidate beside the incumbent on the same traffic for two weeks. Compare label distributions, parse failures, latency, and cost. Never splice score series from different judges into a single trend. Re-score the anchor set on every judge or prompt change.

8. **Escalation.** Route low-confidence or disagreeing cases to a stronger judge or a human. Ensembling with k=3 is where returns diminish (2606.19544 and practitioner guidance converge on this).

The anchor set is the long pole. Labelling 200–400 items from your own stream takes time, but it is the only way to know whether a judge's kappa on published benchmarks predicts its behaviour on your tasks.

**Measure on your own data before switching.** The validation protocol above is the path. If you are working on a real pipeline, the companion plan described below applies that protocol to a specific judge migration.

## Connection to a Real Pipeline

The plan described in `docs/roadmap/judge-model-tiers.md` applies this evidence to the observability-toolkit pipeline. It proposes offering the judge in two tiers: a hosted tier running an open-weight model on Cloudflare Workers AI (gpt-oss-120b as the primary candidate), and a specified tier where an organisation names any model and provides its own key.

Phase 2 of that plan is the anchor set and shadow run described above. The model used in production does not change until Phase 2's pre-registered thresholds are met. Claude Haiku 4.5 stays the default until then. That plan also flags the constraint this evidence makes explicit: almost all benchmark evidence is pairwise; the pipeline uses pointwise 1–5 scores; the two are not interchangeable, and the evidence for the latter is thin enough that measurement on the pipeline's own tasks is not optional.

## Open Questions and Unverified Items

The brief this report draws on left these items open. None of them changes the conclusions above, but each is a place where a reader could find more than I did.

- No per-model RewardBench 2 or Preference Proxy Evaluations rows were extracted for the Workers AI models (Llama 3.3 70B, Llama 4 Scout, Qwen3-30B-A3B, Gemma 4, Mistral Small 3.1, Kimi K2.6, GLM 5.3).
- JEV-as-a-Judge (arXiv 2609.26550) reports a cheap decision-only judge within 3 percentage points of "GPT-6" on JudgeBench; its open-weight breakdown was not extracted, so it is listed as a source and not used as a finding.
- Weights availability for J1 and RM-R1 is unverified, and M-Prometheus's venue date is ambiguous between the arXiv month and a later publication date.
- Selene 1 (the full model), Themis, JudgeLM updates, LLM-AggreFact, BiGGen Bench, MM-Eval, and any official Judge Arena board for 2025 or 2026 were not found or not checked.
- The "Closed" labels in arXiv 2606.19544 for Kimi K2.5, GLM-5, DeepSeek V3.2 and Qwen3-8B should be confirmed against the paper's appendix before treating those rows as open-weight results.
- Three claims rest on search snippets rather than fetched pages: the two self-preference papers' conclusions, Langfuse's Cohen's kappa feature, and the vendor-blog thresholds of kappa 0.6 and 200 to 500 gold traces.
- The W&B Inference catalogue was not checked for any of the dedicated judge models.

## Sources

| Source | Date | URL |
|---|---|---|
| Reliability without Validity (arXiv 2606.19544) | 2026-06-17 | <https://arxiv.org/abs/2606.19544> |
| Judge's Verdict (arXiv 2510.09738) | 2025-10-10 | <https://arxiv.org/abs/2510.09738> |
| AgentJudgeBench (arXiv 2608.26623) | 2026-08-27 | <https://arxiv.org/abs/2608.26623> |
| RewardBench 2 (arXiv 2506.01937) | 2026-04-24 | <https://arxiv.org/abs/2506.01937> |
| RewardBench 2 judge-techniques (arXiv 2604.13717) | 2026-04-15 | <https://arxiv.org/abs/2604.13717> |
| JudgeBench (arXiv 2410.12784) | ICLR 2025 | <https://arxiv.org/pdf/2410.12784> |
| JEV-as-a-Judge (arXiv 2609.26550) | 2026-09-22 | <https://arxiv.org/abs/2609.26550> |
| Preference Proxy Evaluations (OpenReview cbttLtO94Q) | ICLR 2025 | <https://openreview.net/pdf?id=cbttLtO94Q> |
| JudgeArena (Atla, Hugging Face blog) | 2024 | <https://huggingface.co/blog/arena-atla> |
| JudgeArena framework (arXiv 2608.02620) | 2026-07-01 | <https://arxiv.org/abs/2608.02620> |
| Atla Selene Mini (arXiv 2501.17195) | 2025-01-27 | <https://arxiv.org/abs/2501.17195> |
| Skywork-Reward-V2 (HuggingFace) | 2025 | <https://huggingface.co/Skywork/Skywork-Reward-V2-Llama-3.1-8B> |
| Skywork-Reward-V2 paper (arXiv 2507.01352) | ICLR 2026 | <https://arxiv.org/abs/2507.01352> |
| J1 Meta (arXiv 2505.10320) | 2025-05-15 | <https://arxiv.org/abs/2505.10320> |
| RM-R1 (arXiv 2505.02387) | 2025-05-05 | <https://arxiv.org/abs/2505.02387> |
| M-Prometheus (arXiv 2504.04953) | 2025-04 | <https://arxiv.org/abs/2504.04953> |
| Rating Roulette (arXiv 2510.27106) | 2025-10-31 | <https://arxiv.org/abs/2510.27106> |
| Grading scale study (arXiv 2601.03444) | 2026-01-08 | <https://arxiv.org/abs/2601.03444> |
| Scoring bias (arXiv 2506.22316) | 2025-06-27 | <https://arxiv.org/abs/2506.22316> |
| Local judges vs humans (arXiv 2609.13824) | 2026-09-12 | <https://arxiv.org/abs/2609.13824> |
| Self-preference (arXiv 2504.03846) | 2025-04 | <https://arxiv.org/pdf/2504.03846> |
| Self-preference EMNLP 2025 (aclanthology) | 2025 | <https://aclanthology.org/2025.emnlp-main.86.pdf> |
| Self-preference (arXiv 2608.18091) | 2026 | <https://arxiv.org/abs/2608.18091> |
| Style bias (arXiv 2604.23178) | 2026-04-25 | <https://arxiv.org/abs/2604.23178> |
| Anchoring (arXiv 2608.25869) | 2026-08-26 | <https://arxiv.org/abs/2608.25869> |
| Construct validity (arXiv 2608.24419) | 2026-08-25 | <https://arxiv.org/abs/2608.24419> |
| Reasoning judges (arXiv 2603.12246) | 2026-03-12 | <https://arxiv.org/abs/2603.12246> |
| Anchor sets and drift attribution (arXiv 2606.15474) | 2026-06 | <https://arxiv.org/abs/2606.15474> |
| Shadow mode, oneuptime | 2026-08-31 | <https://oneuptime.com/blog/post/2026-08-31-evaluate-llm-judge-before-trusting-scores/view> |
| Arize: measuring human-LLM judge alignment | July 2026 | <https://arize.com/blog/measuring-human-llm-judge-alignment/> |
| FutureAGI best practices 2026 (practitioner heuristics, not research) | 2026 | <https://futureagi.com/blog/llm-as-judge-best-practices-2026/> |
| Cloudflare Workers AI catalogue | checked 2026-09-30 | <https://developers.cloudflare.com/workers-ai/models/> |
| Research brief (local, 2026-09-30) | 2026-09-30 | `~/.claude/research-artifacts/20260930-195557-open-weight-llm-judge-evidence/brief.md` |
| Judge model tiers roadmap (local) | 2026-09-30 | `docs/roadmap/judge-model-tiers.md` |

---

## Appendix: Readability Analysis

Readability metrics computed with [textstat](https://github.com/textstat/textstat) on the report body (frontmatter, code blocks, and markdown syntax excluded).

### Scores

| Metric | Score | Notes |
|--------|-------|-------|
| Flesch Reading Ease | 56.7 | 0–30 very difficult, 60–70 standard, 90–100 very easy |
| Flesch-Kincaid Grade | 7.7 | US school grade level (Middle School) |
| Gunning Fog Index | 9.5 | Years of formal education needed |
| SMOG Index | 9.9 | Grade level (requires 30+ sentences) |
| Coleman-Liau Index | 12.8 | Grade level via character counts |
| Automated Readability Index | 8.7 | Grade level via characters/words |
| Dale-Chall Score | 13.37 | <5 = 5th grade, >9 = college |
| Linsear Write | 12.4 | Grade level |
| Text Standard (consensus) | 8th and 9th grade | Estimated US grade level |

### Corpus Stats

| Measure | Value |
|---------|-------|
| Word count | 2,789 |
| Sentence count | 294 |
| Syllable count | 4,633 |
| Avg words per sentence | 9.5 |
| Avg syllables per word | 1.66 |
| Difficult words | 474 |
