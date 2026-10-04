---
layout: single
title: "Auditing the Evidence Behind LLM-as-Judge Model Choices"
date: 2026-10-01
author_profile: true
categories: [research, observability, llm-evaluation]
tags: [llm-as-judge, cloudflare-workers-ai, coreweave, anthropic, confidence-intervals, benchmark-methodology, multi-agent-research, scipy]
excerpt: "Re-verified eleven judge-model prices from raw source pages, then ran eight research agents in two rounds to audit the benchmark evidence behind nine candidate judge models, deriving the confidence intervals the papers omit."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
permalink: /reports/llm-judge-evidence-audit/
---

**Session Date**: 2026-10-01<br>
**Project**: observability-toolkit (LLM-as-judge tier planning)<br>
**Focus**: Price verification, provider benchmark evidence, and a four-pass methodology audit of judge-quality studies<br>
**Session Type**: Research

## Executive Summary

The toolkit is planning a Cloudflare-hosted LLM-as-judge tier beside its existing Anthropic judge, with a bring-your-own-key tier through AI Gateway. A research brief written the previous evening had gathered prices and platform facts through a summarising fetcher and flagged its own numbers as unverified. This session re-verified every price from raw page text, added published and checked dates with source links to the brief's table, filled its five blank context-window cells, and then ran two rounds of multi-agent research into the benchmark evidence behind the nine candidate judge models.

The price check found no wrong figure but one wrong conclusion: the brief's "conflict" on Llama 3.1 8B was two different model IDs on the same page. The first research round, four parallel agents covering cross-model judge benchmarks and each provider, produced the single most consequential provider datapoint: Artificial Analysis scores Cloudflare's gpt-oss-120b endpoint at 70 percent of self-hosted reference accuracy against 98 percent for CoreWeave. The second round ran four blind replicate passes of the same methodology question and derived the confidence intervals the papers omit. The headline statistical result is that the apparent ordering "gpt-oss-120b above Haiku 4.5" is not supported at the reported sample sizes, and that Judge's Verdict's "human-like" tiers are drawn inside its own sampling noise.

Eight subagents consumed about 2.1 million tokens across 579 tool calls and left roughly 450 raw source fetches on disk. No repository code changed; every output lives under `~/.claude/research-artifacts/`, which is gitignored, so there are no commits.

## Key Metrics

| Metric | Value |
|--------|-------|
| Prices re-verified from raw source text | 11 of 11, 1 brief conclusion corrected |
| Context-window cells filled from live pages | 5 |
| Subagents run | 8 (two rounds of 4) |
| Subagent tokens / tool calls | ~2.1M / 579 |
| Raw evidence fetched, round 1 | 303 MB, ~450 files |
| Primary papers opened by the judge-benchmark agent | 36 arXiv, 10 GitHub READMEs, 2 ACL PDFs |
| Derived 95% intervals | 12 kappa, 11 Judge's Verdict bounds, 17 Wilson |
| Pairwise significance tests | 17 |
| Skepticism findings tagged by pass in the convergence matrix | 45 |
| Relevant sources found by exactly one of four blind passes | 6 |
| Research briefs written | 3 |
| Citation-verification rows (two further passes) | 225 (124 + 101) |

## Problem Statement

The brief at `research-artifacts/20260930-194708-cf-workers-ai-judge-byok/brief.md` carried a caveat that Cloudflare and CoreWeave pages had been read through a summarising fetcher, so every figure was a summary. It listed one price as a cross-page conflict, left five context windows as "n/a", and said no Cloudflare page showed a date. A sibling brief on open-weight judge evidence had the same fetcher caveat and marked its two load-bearing papers as unverified. Choosing a judge tier on that footing meant choosing on numbers nobody had read from the source, with no idea how wide the error bars were.

The user asked, in sequence, for the prices re-checked and cited, for published and checked dates on each price, for the context windows filled, for provider benchmark evidence with attention to methodology, and finally for four independent passes on the quality of the judge-benchmark evidence itself, including confidence intervals and reasons for skepticism.

## Implementation Details

### Price verification from raw text

Cloudflare's docs serve markdown when `index.md` is appended to a page URL, Anthropic's docs serve it with a `.md` suffix, and CoreWeave's pricing page is server-rendered HTML. Each was fetched with `curl` and grepped by line rather than summarised.

```
61: @cf/meta/llama-3.3-70b-instruct-fp8-fast | $0.293 per M input | $2.253 per M output
67: @cf/meta/llama-3.1-8b-instruct           | $0.282 per M input | $0.827 per M output
68: @cf/meta/llama-3.1-8b-instruct-fp8       | $0.152 per M input | $0.287 per M output
```

Line 67 is the non-fp8 model. The brief had compared it against the fp8 model's page and called the mismatch a conflict. The CoreWeave DeepSeek row was found only after a case-insensitive search, because the page spells it "Deepseek V3.1". The Workers AI pricing page carries "Last updated Sep 17, 2026" in both its body and its JSON-LD; the model pages, the Anthropic page and the CoreWeave page carry no on-page date, so sitemap `lastmod` values were used and labelled as build stamps. Evidence: `pricing-recheck-2026-10-01.md` beside the brief.

The brief's table was rewritten with three new columns by a Python script that asserted each replacement matched exactly once. A post-edit check confirmed 13 table lines of 10 columns each, with 11 of 11 rows carrying a published date, a checked date and a URL.

### Round 1: provider and benchmark evidence

Four `general-purpose` agents ran in parallel: cross-model judge benchmarks, Cloudflare Workers AI, CoreWeave Serverless Inference, and Anthropic. Each was told to fetch raw text, record metric, N, interval, author, date, exact model variant and precision for every number, and save every fetch. Mid-run, each received pointers to the two 2025–2026 papers the sibling brief had relied on. The synthesis and four reports are at `research-artifacts/20261001-093233-provider-judge-benchmark-evidence/`. Findings worth carrying forward:

- **Only CoreWeave has independent serving data.** Artificial Analysis shows "--" for every Workers AI endpoint, and Cloudflare's own speed claims are relative with no absolute figure, hardware, run count or quality metric.
- **The hosted model is not the model card.** Artificial Analysis's Endpoint Accuracy Index puts Cloudflare's gpt-oss-120b at 70 percent of reference against 98 for CoreWeave, 97 for Scaleway and 86 for Groq.
- **fp8 evidence does not transfer.** Every recovery figure is for a Red Hat or Neural Magic W8A8 recipe that Cloudflare has not claimed to use, and Meta states that benchmarks do not adequately reflect fp8 failure modes.
- **Sonnet 5.5 cannot run at temperature zero**, since any non-default temperature returns a 400, and thinking cannot be disabled below `between_tools`.
- The sibling brief's four misreadings were corrected, most importantly that stronger judges show more self-preference, not less.

A usage limit was reached as the synthesis was being written, so the 303 MB of raw fetches stayed in the job's temp directory rather than being copied beside the brief.

### Round 2: four blind replicate passes with statistical derivation

The user asked for four independent passes through the `web-research-analyst` agent with the `scientific-skills` collection. The design chosen was replication rather than division of labour: four identical briefs, each told not to read any prior artifact, so that convergence would measure reliability and divergence would expose coverage gaps. The prompt embedded the skepticism checklist from the collection's `scientific-critical-thinking` references and the kappa standard-error formula from its `statistical-analysis` reference.

In parallel, the intervals were derived here with scipy, since statsmodels was not installed. For each reported kappa with observed agreement, chance agreement was back-solved and Cohen's large-sample approximation applied (`stats/kappa_ci.py:1-40`). Judge's Verdict publishes neither, so its intervals were bounded by sweeping chance agreement over a plausible range (`stats/jv_sensitivity.py:1-30`).

```
model                bench  kappa    p_o    p_e     SE           95% CI
Claude Haiku 4.5     JB    0.653  0.831  0.513 0.0411 [ 0.572,  0.734]
gpt-oss-120b         JB    0.687  0.854  0.534 0.0405 [ 0.608,  0.766]
Llama 3.3 70B        JB    0.283  0.664  0.531 0.0539 [ 0.177,  0.389]

  gpt-oss-120b - Claude Haiku 4.5: diff +0.034, SE 0.058, z +0.59, p 0.556
  Claude Haiku 4.5 - Llama 3.3 70B: diff +0.370, SE 0.068, z +5.46, p 0.000
```

Passes 2 and 4 wrote their own scripts and reproduced these intervals to three decimals. Synthesis: `research-artifacts/20261001-191927-judge-methodology-four-pass-synthesis/brief.md`.

### Decisions

- **Choice**: Raw `curl` reads over the research agent's summarising fetch pipeline. **Rationale**: the original brief's caveat was precisely that summaries had replaced figures. **Trade-off**: none of the eight agents populated the agent's `extractions.jsonl` log, and pass 3's sandboxed shell had no network, so that pass fell back to summaries anyway and its AgentJudgeBench cell values were superseded.
- **Choice**: Blind replicate passes rather than one pass per angle. **Rationale**: replication detects what a single search misses. **Result**: six relevant sources beyond the seed list, none found by more than one pass. **Alternative considered**: dividing benchmarks across passes, which would have given more depth and no reliability signal.
- **Choice**: Cohen's simplified standard error rather than the exact Fleiss-Cohen-Everitt form. **Rationale**: the exact form needs the confusion matrix, which no paper publishes. **Trade-off**: every derived interval assumes independent items and is a lower bound on the real uncertainty, stated as such in the brief.
- **Choice**: Correct the Llama 3.1 8B row while adding citations, rather than only adding columns. **Rationale**: a source URL cannot honestly be attached to a figure the source gives for a different model.

## Testing and Verification

Table integrity after the column edit:

```
rows: 13 column counts: [10]
published cells filled: 11 / 11
checked cells = 2026-10-01: 11 / 11
rows with a source URL: 11 / 11
```

Context-window edit: `remaining 'n/a' context cells in table: 0`.

Cross-validation of the derived intervals against pass 2's independent script:

```
Haiku4.5 EM 0.831 Wilson 0.789-0.867 | kappa 0.653 pe=0.513 se=0.041 CI 0.572-0.734
gpt-oss-120b EM 0.854 Wilson 0.813-0.887 | kappa 0.687 pe=0.534 se=0.040 CI 0.608-0.766
Haiku4.5 vs gpt-oss-120b diff -2.3pp z=-0.84 p=0.404
```

Raw-text verification of the two sources only pass 4 found, grepped from the arXiv HTML:

```
[0.808] ... The two label sets agree on 90.4% of rubrics overall, with Cohen's κ = 0.808 ...
[83.0]  ... Claude Sonnet 4.6 83.0 86.0 87.8 72.1 86.0 ...
[77.1]  ... GPT-OSS-120B 77.1 84.9 74.4 73.6 75.6 ...
[84.8]  ... Haiku 4.5 1761 84.8% (± 1.7) 82.5 83.0 90.2 64.4 94.4 ...
```

Four of four passes independently concluded that Haiku 4.5 and gpt-oss-120b are statistically indistinguishable on both benchmarks and that the Judge's Verdict middle cluster is a tie. The remaining four single-pass sources were not re-verified from raw text and are marked as such in the synthesis.

## Files Modified and Created

All paths are under `~/.claude/research-artifacts/`, which is gitignored in the parent repository. No files in `observability-toolkit` or `~/.claude` tracked content changed, and no commits were made.

| Path | Change |
|------|--------|
| `20260930-194708-cf-workers-ai-judge-byok/brief.md` | Modified: 3 price-provenance columns, 5 context cells, caveat, constraint 11, Sources line |
| `20260930-194708-cf-workers-ai-judge-byok/pricing-recheck-2026-10-01.md` | New, 47 lines |
| `20261001-093233-provider-judge-benchmark-evidence/brief.md` | New, 2,503 words |
| `…/reports/{judge-benchmarks,cloudflare,coreweave,anthropic}.md` | New, 91 / 128 / 132 / 109 lines |
| `20261001-191927-judge-methodology-four-pass-synthesis/brief.md` | New, 3,435 words |
| `…/stats/kappa_ci.py`, `jv_sensitivity.py`, outputs, `derived_cis.json` | New |
| `…/stats/verify-ruverbench-2606.29920.txt`, `verify-composo-2604.13717.txt` | New raw-text extracts |
| `…/passes/pass-{1,2,3,4}-brief.md`, `pass-2-stats.py`, `pass-2-agj.py` | Copied from the four pass directories |
| `20261001-13184{7,8}-judge-methodology-pass-{1..4}/` | Created by the research agent, with raw fetches |

## Open Items

- Copy the 303 MB of round-1 raw fetches out of the job temp directory before the job is deleted, or accept that the per-agent reports are the durable record.
- Before any Workers AI judge is adopted, replicate Artificial Analysis's endpoint-accuracy protocol on the toolkit's own anchor set across providers, since the hosted endpoint scored 70 percent of reference.

## Verification Passes

After the session report was first written, the user asked for two more passes verifying every finding with links and timestamps. Two independent `general-purpose` agents each opened the primary source behind every finding in both briefs and wrote a ledger with the URL, the source's own date from the arXiv version history or the page's last-updated field, the UTC timestamp of the fetch, a verdict and a quote of at most 25 words. Pass A produced 124 rows (111 verified, 12 partial) with a 101-fetch log; pass B produced 101 rows (82 verified, 13 partial, 4 not found, 2 unopenable). No number disagreed between the passes or with its source.

Every non-verified row was a wording overstatement, a mis-attribution, or a figure that renders only in math markup or the PDF. Eleven corrections were applied to each brief, among them: AgentJudgeBench's widest bootstrap interval is ±0.7 points, not ±0.65; "Reliability without Validity" lists reasoning suppression as "none" for gpt-oss-120b, so "suppressed on every reasoning model" was too strong; Haiku 4.5 has three independent judge rows, not one; Opus 4.6 leads only on JudgeBench kappa while Gemini 3.1 Pro leads the other two benchmarks; the Anthropic incident count is a floor because the status feed is capped at 50; and the Fireworks "4-bit and 8-bit" quote belongs to the Fireworks model page, not the paper. The merged headline ledger is `verification/findings-cited.md` in the synthesis directory, beside `pass-A.md` and `pass-B.md`.

## References

Local research artifacts (on the author's machine, not published):

- Pricing brief and recheck: `~/.claude/research-artifacts/20260930-194708-cf-workers-ai-judge-byok/`
- Open-weight judge evidence brief (prior evening): `~/.claude/research-artifacts/20260930-195557-open-weight-llm-judge-evidence/brief.md`
- Round 1 synthesis: `~/.claude/research-artifacts/20261001-093233-provider-judge-benchmark-evidence/brief.md`
- Round 2 synthesis: `~/.claude/research-artifacts/20261001-191927-judge-methodology-four-pass-synthesis/brief.md`

Public sources:

- Reliability without Validity: https://arxiv.org/abs/2606.19544
- Judge's Verdict: https://arxiv.org/abs/2510.09738
- RuVerBench: https://arxiv.org/abs/2606.29920
- Composo cost-effective judge techniques: https://arxiv.org/abs/2604.13717
- Artificial Analysis endpoint-accuracy methodology: https://artificialanalysis.ai/methodology/endpoint-accuracy-index
- Workers AI pricing: https://developers.cloudflare.com/workers-ai/platform/pricing/

---

## Appendix: Readability Analysis

Readability metrics computed with [textstat](https://github.com/textstat/textstat) on the report body (frontmatter, code blocks, and markdown syntax excluded).

### Scores

| Metric | Score | Notes |
|--------|-------|-------|
| Flesch Reading Ease | 44.3 | 0–30 very difficult, 60–70 standard, 90–100 very easy |
| Flesch-Kincaid Grade | 12.2 | US school grade level (High School) |
| Gunning Fog Index | 14.4 | Years of formal education needed |
| SMOG Index | 13.7 | Grade level (requires 30+ sentences) |
| Coleman-Liau Index | 13.9 | Grade level via character counts |
| Automated Readability Index | 14.0 | Grade level via characters/words |
| Dale-Chall Score | 12.57 | <5 = 5th grade, >9 = college |
| Linsear Write | 23.0 | Grade level |
| Text Standard (consensus) | 13th and 14th grade | Estimated US grade level |

### Corpus Stats

| Measure | Value |
|---------|-------|
| Word count | 1,768 |
| Sentence count | 86 |
| Syllable count | 2,961 |
| Avg words per sentence | 20.6 |
| Avg syllables per word | 1.67 |
| Difficult words | 379 |
