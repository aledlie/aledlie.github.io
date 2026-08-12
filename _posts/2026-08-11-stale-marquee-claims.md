---
layout: single
title: "The Stale Marquee: Four Ways a True Claim Goes Bad"
date: 2026-08-11
author_profile: true
tags: [hugging-face, open-source, documentation, technical-writing, research-verification]
excerpt: "Every claim I caught rotting last week was true when someone wrote it. That is what makes them dangerous — and what makes them predictable."
---

Hugging Face's homepage advertises Text Generation Inference as one of twelve flagship open-source libraries. The repository was [archived read-only on March 21, 2026](https://github.com/huggingface/text-generation-inference). Its README now tells visitors to go use vLLM, SGLang, or llama.cpp instead. The marquee still says come in.

I found that while [auditing the platform](/reports/huggingface-platform-research/), and I assumed it was an oversight — someone forgot to update a list. Then I kept finding the same shape everywhere I looked, in HF's docs, in its own libraries' READMEs, in third-party leaderboard mirrors, and eventually in my own research. It isn't an oversight. It's a category of failure with a predictable structure, and once you can name it you start seeing it in your own writing.

Here's the structure. A claim is **true when written**. It's placed on a **high-visibility surface** — a homepage, a README's first paragraph, an announcement post. It has **no expiry mechanism**: nothing in the system will notice when it stops being true, because nothing connects the claim to the thing it describes. And it is **load-bearing** — people make decisions with it.

Every one of those properties is individually reasonable. Together they manufacture confident, well-sourced, wrong.

## Four ways a true thing goes bad

**The dead entry.** TGI is the pure case: the referent is gone and the pointer remains. What makes it interesting isn't the staleness, it's the asymmetry of who pays. HF loses nothing. The reader who picks TGI for a new project in mid-2026 — from the homepage, which is exactly where a newcomer looks — loses a week.

**The frozen number.** [`smolagents`](https://github.com/huggingface/smolagents) describes itself as roughly a thousand lines of core logic. That was true: at the [v1.0.0 tag](https://github.com/huggingface/smolagents/blob/v1.0.0/src/smolagents/agents.py) in December 2024, `agents.py` was 1,038 lines. Today [it's 1,813](https://github.com/huggingface/smolagents/blob/main/src/smolagents/agents.py), and the package around it went from 5,850 lines to 12,774. The README still says under a thousand — [twice](https://github.com/huggingface/smolagents/blob/main/README.md), and the first instance links to the very file that refutes it. Minimalism is the library's entire pitch, so this is the load-bearing claim, and it has roughly doubled its way out of truth. Stranger still, HF's own [launch blog post](https://huggingface.co/blog/smolagents) now reads "~**thousands** lines" — so the two official descriptions of the same file disagree, and the corrected one isn't the one new users read. The number was never wrong. It just stopped being now, and nothing in a README knows what now is. ([More on this one]({% post_url 2026-08-11-1813-lines-of-simplicity %}).)

The same thing happened to "over 200 community-led leaderboards on Hugging Face." That sentence appears once, in [Clémentine Fourrier's Open LLM Leaderboard retirement announcement](https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard/discussions/1135), dated March 13, 2025. It has been quoted steadily since. It has never been recounted — not in the [finding-a-leaderboard docs](https://huggingface.co/docs/leaderboards/leaderboards/finding_page), not anywhere. Seventeen months on, the honest version of that figure is "at least 200, as of early 2025," which is a much weaker sentence and the only defensible one.

**The false liveness signal.** This one is worse, because the surface *looks* self-updating.

I published that HF's [`evaluate`](https://github.com/huggingface/evaluate) library was "low-velocity but active — feature-complete rather than abandoned." The evidence was a GitHub `pushedAt` of 2026-07-06. Recent! Except `pushedAt` fires on activity that isn't a commit to the default branch, and `evaluate`'s last real commit to `main` was 2026-04-08. The timestamp was a fact about the API, not about the project. Underneath it: 191 of 339 lifetime issues open, a BERTScore incompatibility with `transformers>=5` unfixed since March, a static catalog of 69 metric modules — and [HF's own documentation](https://huggingface.co/docs/evaluate/en/index) telling readers that [LightEval](https://github.com/huggingface/lighteval) is "more actively maintained." The maintainers had already said it. I'd trusted a number that agreed with me instead.

Leaderboard mirrors do this too. A third-party aggregator lists [BigCodeBench](https://github.com/bigcode-project/bigcodebench) with current 2026 results. The actual benchmark repo was archived on July 20, 2026; its Space hasn't moved since February 2025. What the aggregator is showing is vendor self-reported scores, restyled as a curated ranking. A mirror can outlive the thing it mirrors, and it will keep looking maintained the whole time, because rendering fresh-looking output is cheap and being correct is not.

**The unfalsifiable claim.** The endpoint of the pattern. Vectara's hallucination leaderboard is genuinely maintained — updated May 2026, current models, real methodology. Its rankings are produced by HHEM-2.3, which is commercial, closed, and has **no published accuracy figure at all**. The open sibling model self-reports 45–66% F1. So a reader can see model A at 1.8% and model B at 2.4%, and has no way to know whether that gap is a finding or noise, because [as an open issue on the repo puts it](https://github.com/vectara/hallucination-leaderboard/issues/128), the measuring instrument's precision is undisclosed. This isn't a claim that went stale. It's one that was never checkable, presented in a format — a ranked table, three significant figures — that implies it is.

## The tell

The common thread is that in every case, something **cheap and adjacent** stood in for something **expensive and real**. A timestamp instead of a commit log. A homepage list instead of a repo status. A quoted count instead of a query. A ranked table instead of a stated error bar.

That substitution is almost always invisible at the point of reading, because the proxy is *designed* to look like the thing. `pushedAt` is a real field on a real API returning a real date. The homepage list is genuinely HF's list. Nothing is lying. The proxy has simply drifted from its referent and nothing announced the divorce.

Which is why "check your sources" is not the lesson. I did check my sources. My source was the GitHub API. The lesson is narrower and more annoying: **check that your source is measuring the thing you're claiming.** Freshness of repo activity is not maintenance. Presence on a homepage is not existence. A leaderboard's rank order is not a measurement unless someone publishes the instrument's error.

## Writing claims that fail loudly

I don't think you can prevent staleness. You can choose how it fails.

**Date the number in the sentence, not the footer.** "163,751 stars" rots silently. "163,751 stars as of 2026-08-11" is still useful in 2028 — it has become a historical data point instead of a false present-tense assertion. This costs four words and converts a future error into a future citation.

**Prefer a query to a count.** "40 registered benchmarks" needs a human to re-run it. A link to the API call that returns the count re-runs itself every time someone clicks. Where a live query is possible, the number in prose should be an illustration of the query, not a replacement for it.

**Say what you couldn't check.** The single most useful line in my platform audit was the list of things the research failed to establish — including one item that undercut the confidence of everything above it. An explicit "not verified" ages perfectly. It is just as true next year.

**Put the expiry where the change happens.** A claim about a repo belongs in the repo. The reason HF's homepage still lists TGI is that the homepage lives nowhere near the archive button. Nobody had to ignore a warning; there was no warning to ignore. If a claim can't live next to its referent, it should at minimum name it, so the reader can go look.

None of this is novel. It's the same discipline as not hardcoding a value you could compute — which every engineer already believes about code, and then abandons the moment they open a README.

The version of this I keep coming back to: my audit needed a second research pass, and that pass overturned three of its own conclusions. Not because the first pass was careless — it was sourced, hedged, and explicit about uncertainty — but because I'd taken proxies at face value in exactly the three places where checking was expensive. The article about stale marquee claims went stale during the writing of it. That's the honest ending, and I think it's also the point: this isn't a mistake you fix once. It's a tax you pay per claim, forever, and the only real choice is whether you pay it up front or let your readers pay it later.

---

*[1,813 Lines of Simplicity]({% post_url 2026-08-11-1813-lines-of-simplicity %}) takes the second of these four cases apart in detail — a minimalism claim that broke precisely because the project succeeded, on a library where "small enough to read" is the entire pitch. The underlying research is in [a sourced audit of the Hugging Face platform](/reports/huggingface-platform-research/).*
