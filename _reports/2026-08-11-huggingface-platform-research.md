---
layout: single
title: "What Hugging Face's Homepage Omits: A Sourced Platform Audit"
date: 2026-08-11
author_profile: true
categories: [research, ai-infrastructure]
tags: [hugging-face, multi-agent, web-research, inference-endpoints, open-source, leaderboards, mlops]
excerpt: "Hugging Face's homepage still advertises a library it archived in March and a leaderboard it retired last year. A four-agent research sweep found both — and why any platform summary built from a marketing page repeats them."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
permalink: /reports/huggingface-platform-research/
---

**Session Date**: 2026-08-11<br>
**Project**: Ad-hoc platform research (no repo changes)<br>
**Focus**: Comprehensive survey of huggingface.co — serving products, OSS libraries, docs/learning, community & evaluation<br>
**Session Type**: Research

## Executive Summary

Two of the claims a reader would take from Hugging Face's homepage are wrong, and a summary built from that page reproduced both.

**[Text Generation Inference (TGI)](https://github.com/huggingface/text-generation-inference) was archived read-only on 2026-03-21**, yet still appears in [the homepage's](https://huggingface.co/) 12-item "Open Source" list. HF's own marquee page advertises a dead repo, whose README now redirects visitors to vLLM, SGLang, and llama.cpp. **The Open LLM Leaderboard is retired** — [v1 archived June 2024](https://huggingface.co/docs/leaderboards/en/open_llm_leaderboard/archive), [v2 retired March 2025](https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard/discussions/1135) after evaluating more than 13,000 models — and was replaced not by a successor leaderboard but by a decentralized `eval.yaml` + `.eval_results/` PR-submission system called [Community Evals](https://huggingface.co/blog/community-evals). Neither deprecation is visible from the front door.

The structural gap behind both errors is larger than either one. The [`/docs` landing page](https://huggingface.co/docs) catalogs roughly 30 products against the homepage's 12, adding `timm`, Sentence Transformers, Kernels, bitsandbytes, OpenEnv, Argilla, Distilabel, LeRobot, Reachy Mini, Trackio, and Xet. Anyone sizing up "what Hugging Face offers" from the front page undercounts by more than half, and inherits its stale entries without any signal that something is missing.

Both findings came out of a structured sweep: four research agents working concurrently across serving products, open-source libraries, docs and learning, and community evaluation, each constrained to primary sources — live docs, pricing pages, and the GitHub API rather than the homepage. The sweep produced 8,176 words of sourced briefs across 42 logged queries and 64 source extractions.

## Key Metrics

What the research produced:

| Metric | Value |
|--------|-------|
| Research areas covered | 4 |
| Search queries logged | 42 |
| Source extractions logged | 64 |
| Brief output | 547 lines / 8,176 words |
| Factual corrections to prior summary | 2 |
| Findings explicitly flagged unverified | 19 |

What it cost to run:

| Metric | Value |
|--------|-------|
| Research agents dispatched | 4 (parallel, single message) |
| Subagent tokens consumed | 294,857 |
| Subagent tool calls | 126 |
| Wall-clock duration | ~71 min (longest agent; parallel) |
| Serial-equivalent duration | ~254 min |
| Artifact files produced | 21 across 4 directories |

A second, narrower sweep followed — four more agents deep-diving Community Evals, three leaderboards, `datasets`/`evaluate`, and `smolagents`. Its findings are folded in below and marked where they **correct** the first sweep rather than extend it.

## Problem Statement

The initial request was a general summary of huggingface.co. One `WebFetch` against [the root domain](https://huggingface.co/) answered it — 2M models, 500k datasets, 1M Spaces, 11 headline libraries, pricing from $0.60/hr GPU — and that answer was fast, cheap, and wrong in two places.

The failure mode is specific and worth naming: **a homepage is a curated claim about a platform, not an inventory of it.** It omits deprecations (TGI), omits retirements (Open LLM Leaderboard), and omits anything the marketing team did not choose to feature (~18 of ~30 documented products). A summary built on it reproduces the curation as if it were fact, with no signal that anything is missing.

The follow-up request — expand four specific sections — was therefore also a request to re-derive those sections from primary sources rather than from the front page.

## Implementation Details

### Dispatch pattern

All four agents went out in a single message so they would run concurrently rather than serially:

```text
Agent(web-research-analyst) × 4, run_in_background: false
  ├── Inference Endpoints + adjacent serving products
  ├── Open-source libraries (purpose / language / stars / deprecation status)
  ├── Docs surface + /learn catalog + Daily Papers + blog
  └── Community primitives + leaderboard live-vs-archived status
```

Each prompt carried three constraints that shaped output quality more than the topic list did:

1. **Name the primary source.** Every prompt specified huggingface.co docs/pricing/GitHub as authoritative, which is why the library brief carries live GitHub REST API star counts rather than remembered ones.
2. **Seed a falsifiable hypothesis.** The leaderboard prompt said *"I believe it was archived/retired in 2025 — verify this and say what replaced it."* The agent confirmed the retirement and found the two-stage timeline plus the successor system, which a neutral "research leaderboards" prompt would likely have missed.
3. **Demand explicit non-findings.** *"Note explicitly anything you could not verify"* produced 19 flagged items, including one that changes how the rest should be read (below).

### Findings that required cross-referencing to surface

Three findings came from noticing that two sources disagreed, not from reading either one:

**Security-tier label conflict** — HF's own docs describe the same three-way access model with two different label sets: [`guides/create_endpoint`](https://huggingface.co/docs/inference-endpoints/guides/create_endpoint) says Protected / Public / Private, while [`guides/configuration`](https://huggingface.co/docs/inference-endpoints/en/guides/configuration) says Private (default) / Public / Authenticated. The behavior is unambiguous; the vocabulary is not. Any integration written against the doc-page labels rather than the API's `type=` values is fragile.

**Azure GPU ambiguity** — the Hardware Configuration UI presents Azure as GPU-selectable, but the published pricing table lists Azure CPU (`intel-xeon`) only, with no GPU or INF2 line items. The pricing page's own text ("if the instance type cannot be selected in the application, you need to request quota") suggests quota-gating rather than non-support, but nothing confirms it either way. Flagged medium confidence rather than resolved.

**Two independent v5 releases** — Transformers v5 (rc ~Dec 2025) and Datasets v5.0.0 (June 2026) are unrelated major versions in separate repos, easily conflated into a single "HF shipped v5" event. The agent caught this via the GitHub Releases API and called it out explicitly.

### Domain findings

**[Inference Endpoints](https://huggingface.co/docs/inference-endpoints/index)** — dedicated single-tenant deployment across AWS/Azure/GCP; [entry $0.033/hr CPU and $0.50/hr GPU (T4)](https://huggingface.co/docs/inference-endpoints/support/pricing), billed hourly and metered per minute. [Native engines](https://huggingface.co/docs/inference-endpoints/about) are vLLM, TGI, SGLang, llama.cpp, and TEI, plus [custom Docker images](https://huggingface.co/docs/inference-endpoints/guides/custom_container) and `handler.py`. H100 and B200 tiers were deprecated Dec 2025; `intel-icl` CPU deprecated July 2025. [AWS PrivateLink](https://huggingface.co/docs/inference-endpoints/guides/security) is the only documented private-networking path — no Azure Private Link or GCP Private Service Connect equivalent appears anywhere in the docs.

The product boundary that most often gets blurred:

| Product | Tenancy | Billing | Purpose |
|---|---|---|---|
| [Inference Endpoints](https://huggingface.co/docs/inference-endpoints/index) | Dedicated single-tenant | Hourly by instance, regardless of traffic | Production serving |
| [Inference Providers](https://huggingface.co/docs/inference-providers/index) | Shared, third-party routed | Per-token at provider rates | Serverless access to hosted models |
| [Spaces hardware](https://huggingface.co/docs/hub/en/spaces-gpus) | Dedicated per-app | Hourly | Demo apps |
| [ZeroGPU](https://huggingface.co/docs/hub/en/spaces-zerogpu) | Shared multi-tenant pool | Free, daily quota; $1/10min overage | Gradio demos only |

Inference Providers replaced the original free Serverless Inference API on **[2025-01-28](https://huggingface.co/blog/inference-providers)**, routing to 17+ partners through an OpenAI-compatible `router.huggingface.co/v1`. It is the successor to the free tier, not to Endpoints — the announcement blog frames the two as complementary.

**Open-source libraries** — star counts pulled live from the GitHub API on 2026-08-11:
[transformers](https://github.com/huggingface/transformers) 163,751 ·
[diffusers](https://github.com/huggingface/diffusers) 34,287 ·
[smolagents](https://github.com/huggingface/smolagents) 28,760 ·
[datasets](https://github.com/huggingface/datasets) 21,830 ·
[peft](https://github.com/huggingface/peft) 21,529 ·
[candle](https://github.com/huggingface/candle) 20,892 ·
[trl](https://github.com/huggingface/trl) 19,050 ·
[transformers.js](https://github.com/huggingface/transformers.js) 16,241 ·
[tokenizers](https://github.com/huggingface/tokenizers) 10,958 ·
[TGI](https://github.com/huggingface/text-generation-inference) 10,886 (archived) ·
[accelerate](https://github.com/huggingface/accelerate) 9,812 ·
[TEI](https://github.com/huggingface/text-embeddings-inference) 4,992 ·
[safetensors](https://github.com/safetensors/safetensors) 3,852 ·
[huggingface_hub](https://github.com/huggingface/huggingface_hub) 3,795 ·
[optimum](https://github.com/huggingface/optimum) 3,457 ·
[lighteval](https://github.com/huggingface/lighteval) 2,515 ·
[evaluate](https://github.com/huggingface/evaluate) 2,476.

One governance detail the list hides: `safetensors` now lives in [its own GitHub org](https://github.com/safetensors/safetensors) rather than under `huggingface/`, though HF still maintains and features it. The old URL 301-redirects.

[Transformers v5](https://huggingface.co/blog/transformers-v5) is the window's defining shift: PyTorch-only (Flax/TF sunset), unified `AttentionInterface`, single-file tokenization dropping the Fast/Slow split, and a new OpenAI-compatible `transformers serve`. HF reports 3M daily pip installs against 20K/day at the v4 launch, and 400+ architectures against 40. The separate [Datasets v5.0.0](https://github.com/huggingface/datasets/releases/tag/5.0.0) (2026-06-05) ships agent-trace loading for `trl` pipelines — via [`teich`](https://github.com/TeichAI/teich), a third-party alpha library, which is a notable dependency for a first-class feature — plus `Dataset.batch(by_column=...)` for robotics and four new formats (Iceberg, TsFile, 3D mesh, CoNLL). The breaking change is streaming shuffle, whose default moved to `max_buffer_input_shards=10`; it shipped with **no migration guide, no release blog post, and no advance deprecation warning** in the 4.8.x series, and has since spawned three still-open `state_dict()` performance issues. [v5.0.1](https://github.com/huggingface/datasets/releases/tag/5.0.1) (2026-07-28) is a pure bugfix. Loading scripts and `trust_remote_code` are often misattributed to this release; they were removed in [v4.0.0](https://github.com/huggingface/datasets/releases/tag/4.0.0), nearly a year earlier.

TGI's archival is the strategic read: HF stopped maintaining a first-party competitor to vLLM/SGLang/llama.cpp and now redirects users to them from the archived README, while keeping TEI and `transformers serve` alive. Genuinely dead projects are [`simulate`](https://github.com/huggingface/simulate) (README says unmaintained), [`neuralcoref`](https://github.com/huggingface/neuralcoref) (no commits since 2023-04), and [`knockknock`](https://github.com/huggingface/knockknock) (since 2023-06). [`evaluate`](https://github.com/huggingface/evaluate) is a harder call, and the first read of it here was wrong. Its GitHub `pushedAt` of 2026-07-06 suggested a merely low-velocity project — but that timestamp **corresponds to no commit on `main`**, whose last real commit is 2026-04-08. On the evidence that matters, 56% of all-time issues are open (191 of 339), including a BERTScore incompatibility with `transformers>=5` unresolved since March 2026; the catalog is a static 69 modules; and [HF's own docs](https://huggingface.co/docs/evaluate/en/index) now tell readers that [LightEval](https://github.com/huggingface/lighteval) is "more actively maintained" and point them there. Community Evals, meanwhile, is built on Inspect AI with no dependency on `evaluate` at all. Not archived, but superseded in everything but name. Separately, `save_pretrained()` now defaults to `.safetensors` following a [Trail of Bits security audit](https://huggingface.co/blog/safetensors-security-audit), though roughly 45% of popular Hub models still ship a pickle file alongside it.

**Docs & learning** — [`/docs`](https://huggingface.co/docs) groups ~30 libraries into five categories, built with [`doc-builder`](https://github.com/huggingface/doc-builder), versioned, community-editable by PR against [`huggingface/hub-docs`](https://github.com/huggingface/hub-docs) with CI preview builds. [`/learn`](https://huggingface.co/learn) currently indexes 12 free courses; four are recent additions absent from older roundups — [MCP Course](https://huggingface.co/learn/mcp-course/en/unit1/certificate) (~May 2025, per-unit certificate exams), [Robotics Course](https://huggingface.co/learn/robotics-course/unit0/1) (LeRobot, SO-100/SO-101 and ALOHA hardware), Context Course (context engineering for code agents), and "a smol course." The Agents Course runs a two-tier certificate: [Fundamentals](https://huggingface.co/learn/agents-course/unit1/get-your-certificate) at ≥80% on the unit-1 quiz, [Completion](https://huggingface.co/learn/agents-course/unit4/get-your-certificate) at ≥30% on the final benchmark. The [LLM Course](https://huggingface.co/learn/llm-course/en/chapter1/1) (13 chapters) is the renamed NLP Course; the [Deep RL Course](https://huggingface.co/learn/deep-rl-course/en/communication/certification) has its own certification path.

[Daily Papers](https://huggingface.co/docs/hub/en/paper-pages) is a curation layer over arXiv (~95% of linked paper URLs). Any repo README linking an arXiv or HF paper URL is auto-indexed and tagged; authorship is email-matched with a manual claim-plus-admin-validation fallback; papers can have standalone pages with no associated repo. Alongside it, the [Open-Source AI Cookbook](https://huggingface.co/learn/cookbook/index) collects applied notebooks, and a [community blog tier](https://huggingface.co/docs/hub/en/blog-articles) lets PRO/Team/Enterprise users self-publish beside official posts.

**Community & evaluation** — beyond the leaderboard retirement, the durable finding is that the ecosystem went decentralized rather than dark. The widely-repeated "200+ community leaderboards on the Hub" figure holds up as a citation but not as a current number: it traces to a single line in [Clémentine Fourrier's retirement announcement](https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard/discussions/1135) of **March 13, 2025**, predates Community Evals entirely, and has never been restated — not even on the current [finding-a-leaderboard docs](https://huggingface.co/docs/leaderboards/leaderboards/finding_page), which describe discovery methods without quoting a count. Discovery now runs through the [OpenEvals org](https://huggingface.co/spaces/OpenEvals/every-leaderboards). Confirmed live: [MTEB](https://huggingface.co/spaces/mteb/leaderboard) (5,000+ submissions), [Open ASR](https://huggingface.co/blog/open-asr-leaderboard) (60+ models, [private-data track](https://huggingface.co/blog/open-asr-leaderboard-private-data) added ~May 2026), [Vectara Hallucinations](https://github.com/vectara/hallucination-leaderboard) (updated 2026-05-11; Antgroup Finix S1 32B leads at a 1.8% hallucination rate, with GPT-5.4, Gemini 3.1, Claude Opus 4-7 and GLM-5 on the board). That last one carries a caveat worth stating: rankings are produced by HHEM-2.3, which is commercial, closed, and has **no published accuracy figure**, while the open [HHEM-2.1-Open](https://huggingface.co/vectara/hallucination_evaluation_model) self-reports only 45–66% F1 — so [as an open issue on the repo argues](https://github.com/vectara/hallucination-leaderboard/issues/128), narrow rank gaps may be noise. [LMArena](https://huggingface.co/spaces/lmarena-ai/chatbot-arena-leaderboard) is live but **not HF-operated** — an independent `lmarena-ai` org using Spaces and Datasets purely as hosting.

Not everything survived. [BigCodeBench](https://github.com/bigcode-project/bigcodebench) is frozen: the GitHub repo was archived read-only on **2026-07-20**, its [Space](https://huggingface.co/spaces/bigcode/bigcodebench-leaderboard) has not changed since Feb 2025, and its result datasets stop in Q1–Q2 2025. A third-party aggregator advertises current 2026 activity for it, which on inspection looks like repackaged vendor self-reported scores rather than curation — a good reminder that a leaderboard mirror can outlive the leaderboard. The BigCode org itself is alive (BigCodeArena is new), but its 2024 flagships are dormant.

The Hub's collaboration model is deliberately simpler than GitHub's: **[no forking](https://huggingface.co/docs/hub/repositories-pull-requests-discussions).** Contributors push to a `refs/pr/N` ref directly on the source repo, and PRs and Discussions share one unified Community tab. [Moderation](https://huggingface.co/docs/hub/moderation) splits by target — repo-level reports open a *public* Discussion, comment-level reports route *privately* to an HF moderation queue with an optional author block. [Gated repos](https://huggingface.co/docs/hub/models-gated) add an access-request queue on top, and [Collections](https://huggingface.co/docs/hub/collections), [Organizations](https://huggingface.co/docs/hub/organizations), and [Posts](https://huggingface.co/posts) round out the social layer.

## Verification and Limits

No tests were run; this session produced no code. Verification here means source provenance, and the honest accounting is mixed.

Directly fetched and high confidence: the full Inference Endpoints pricing table, native engine list, and autoscaling mechanics; all GitHub star counts and `archived` flags; TGI's archival banner and date; the docs category structure; the Open LLM Leaderboard retirement timeline; Community Evals mechanics; the Discussions/PR git-ref model and moderation flows.

Search-derived or single-source, flagged medium confidence: [Open VLM](https://huggingface.co/spaces/opencompass/open_vlm_leaderboard) liveness (never directly fetched); the [Content Policy](https://huggingface.co/content-policy) effective date; the ~35% license-tag coverage figure (third-party, not HF-first-party); certificate availability for several `/learn` courses, which rests on aggregator blogs rather than primary HF pages.

Explicitly unresolved:

- **[GAIA leaderboard](https://huggingface.co/spaces/gaia-benchmark/leaderboard) health** — direct fetch hung on "Fetching metadata… Refreshing"; Feb 2025 threads report runtime errors; a third-party mirror shows an Aug 2026 snapshot with 27 models. No clean first-party confirmation.
- **Per-provider region lists** for Inference Endpoints — [docs](https://huggingface.co/docs/inference-endpoints/en/guides/configuration) show a dropdown example ("East US") and never enumerate.
- **ZeroGPU hardware timeline** — [live docs](https://huggingface.co/docs/hub/en/spaces-zerogpu) describe RTX Pro 6000 Blackwell slices; search snippets referenced older H200 MIG language. Transition date not located.
- **Whether native org-following has shipped** — only a forum feature request was found.
- **Transformers v5 GA date** — sources split between Dec 1 and Dec 18, 2025.
- **Community Evals adoption** — how many model repos actually carry `.eval_results/` is not publicly knowable. HF publishes no figure, and the two available proxies are both weak: 105 rows in the curated [`OpenEvals/leaderboard-data`](https://huggingface.co/spaces/OpenEvals/every-leaderboards) dataset, itself a stale 2026-03-28 snapshot covering only the 11-benchmark subset; and 5 total PRs ever on the [`community-evals`](https://github.com/huggingface/community-evals) tooling repo, which undercounts badly because real submissions land as Hub PRs on individual model repos that no public API enumerates. Treat any specific "X models have submitted results" claim as unsourced unless it comes from a live query.

**What the second sweep overturned.** Three first-sweep claims did not survive a closer look, and the pattern in how they failed is more instructive than any of them individually. `evaluate` was called "active, feature-complete" on the strength of a GitHub `pushedAt` timestamp that turns out to match no commit on `main` — a liveness signal that reads as a fact and isn't. BigCodeBench was filed as "probably live, not directly fetched," and was in fact already archived; the hedge was correctly placed but resolved the wrong way. The Vectara leaderboard's "updated Nov 2025" was simply superseded by an update the first pass didn't reach.

Every one of these was a case of trusting a proxy — a timestamp, a search snippet, a cached figure — over the artifact itself. That is the same failure the homepage produces, reproduced one layer down in the research.

One flagged item therefore deserves promotion out of the footnotes: every star count, product catalog, and pricing figure here is a **2026-08-11 point-in-time snapshot**. The TGI correction exists because a curated list drifted from reality. This article will drift the same way, and its own second sweep is the proof of how fast.

## Decisions

**Choice**: Four parallel agents rather than one sequential deep-dive.<br>
**Rationale**: The four domains share no dependencies — leaderboard status does not inform pricing research. Parallel dispatch cut ~254 minutes of serial agent time to ~71 minutes wall clock.<br>
**Alternative considered**: A single agent with a four-part brief.<br>
**Trade-off**: Four isolated contexts meant no cross-domain synthesis inside the research layer — the TGI-archived-but-still-on-homepage contradiction spans the library and homepage findings and had to be assembled during write-up, not by any agent.

**Choice**: Seed prompts with falsifiable hypotheses instead of neutral topics.<br>
**Rationale**: "I believe X was retired — verify" gives the agent a specific claim to attack, and a negative result is still informative.<br>
**Trade-off**: Anchoring risk. A wrong hypothesis stated confidently could bias an agent toward confirming it; this is tolerable only because the prompts also demanded explicit non-findings.

**Choice**: Report `web-research-analyst` output with confidence levels intact rather than flattening to assertions.<br>
**Rationale**: Nineteen flagged items is roughly one flag per 430 words. Stripping them would have made the brief read cleaner and be less useful.<br>
**Trade-off**: The synthesis carries hedges a reader must parse.

## Output

No repository files were modified. Each agent wrote a brief plus a query log, a per-source extraction log, and a cross-reference file recording where sources disagreed:

| Research area | Brief | Queries | Extractions |
|---|---|---|---|
| Community & evaluation | 81 lines / 1,796 words | 19 | 15 |
| Docs & learning | 125 lines / 2,103 words | 15 | 14 |
| Open-source libraries | 119 lines / 1,637 words | 4 | 11 |
| Inference Endpoints | 222 lines / 2,640 words | 4 | 24 |

The query-to-extraction ratios diverge sharply, and the divergence is the useful part. The community agent ran 19 queries for 15 extractions — a **discovery** problem, where establishing *which* leaderboards still exist was most of the work, and many searches returned nothing worth reading. The Inference Endpoints agent ran 4 queries for 24 extractions — a **known-location** problem, where the docs tree was the answer and thorough reading was the work.

That distinction is worth carrying into future research planning. Discovery problems need wide search budgets and tolerate low extraction yield; depth problems need reading budgets and a short search phase. Prompting both the same way underserves one of them.

## References

Sources are linked inline throughout. The load-bearing ones:

- [Inference Providers launch, 2025-01-28](https://huggingface.co/blog/inference-providers)
- [Inference Endpoints pricing](https://huggingface.co/docs/inference-endpoints/support/pricing)
- [TGI repo (archived 2026-03-21)](https://github.com/huggingface/text-generation-inference)
- [Transformers v5](https://huggingface.co/blog/transformers-v5)
- [Community Evals](https://huggingface.co/blog/community-evals)
- [Open LLM Leaderboard archive](https://huggingface.co/docs/leaderboards/en/open_llm_leaderboard/archive)
- [Paper Pages docs](https://huggingface.co/docs/hub/en/paper-pages)
- [Hub moderation docs](https://huggingface.co/docs/hub/moderation)
- [Docs landing page](https://huggingface.co/docs) — the ~30-product catalog
- [Course catalog](https://huggingface.co/learn)

---

## Appendix: Readability Analysis

Readability metrics computed with [textstat](https://github.com/textstat/textstat) on the report body (frontmatter, code blocks, and markdown syntax excluded).

### Scores

| Metric | Score | Notes |
|--------|-------|-------|
| Flesch Reading Ease | 45.0 | 0–30 very difficult, 60–70 standard, 90–100 very easy |
| Flesch-Kincaid Grade | 11.8 | US school grade level (High School) |
| Gunning Fog Index | 14.2 | Years of formal education needed |
| SMOG Index | 13.5 | Grade level (requires 30+ sentences) |
| Coleman-Liau Index | 14.0 | Grade level via character counts |
| Automated Readability Index | 13.5 | Grade level via characters/words |
| Dale-Chall Score | 13.12 | <5 = 5th grade, >9 = college |
| Linsear Write | 13.0 | Grade level |
| Text Standard (consensus) | 12th and 13th grade | Estimated US grade level |

### Corpus Stats

| Measure | Value |
|---------|-------|
| Word count | 2,735 |
| Sentence count | 141 |
| Syllable count | 4,595 |
| Avg words per sentence | 19.4 |
| Avg syllables per word | 1.68 |
| Difficult words | 662 |
