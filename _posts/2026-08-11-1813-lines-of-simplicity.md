---
layout: single
title: "1,813 Lines of Simplicity"
date: 2026-08-11
author_profile: true
excerpt: "smolagents promises its agent logic fits in ~1,000 lines, and links to the file to prove it. The file is 1,813 lines. This is what happens when your pitch is a number and your project succeeds."
---

The `smolagents` README makes a promise in its feature list:

> ✨ **Simplicity**: the logic for agents fits in ~1,000 lines of code (see [agents.py](https://github.com/huggingface/smolagents/blob/main/src/smolagents/agents.py)). We kept abstractions to their minimal shape above raw code!

I want to draw attention to the parenthetical, because it's doing something unusual. The claim cites its own evidence. It doesn't ask you to trust it — it hands you the file and invites you to check.

So I checked. `agents.py` on `main` is **1,813 lines**.

The README repeats the claim further down, less hedged: *"the main code in `agents.py` has <1,000 lines of code."* At the v1.0.0 tag in December 2024, that was true — 1,038 lines, near enough to a thousand that "~1,000" was fair and "<1,000" was a rounding error in the author's favor. Twenty months later the file has grown 75%, and the package around it went from 5,850 lines across 13 files to 12,774 across 18.

Nothing here is deception. Every one of those lines was added by someone doing their job well. That's exactly what makes it worth writing about.

## The pitch is a measurement

Most marketing claims are unfalsifiable by construction. *Blazing fast. Developer-friendly. Enterprise-grade.* Nobody can check those, which is precisely why companies use them.

`smolagents` did the opposite. It picked a claim that is a **number**, about a **specific file**, and **linked to the file**. That's admirably concrete — and it converts a marketing statement into a standing assertion about the current state of the repository, one that anybody can refute in about four seconds.

Which is the trap. An unfalsifiable claim never becomes wrong; it just becomes noise. A falsifiable claim on a fast-moving artifact has a shelf life, and the more precisely you state it, the shorter that life gets.

The parenthetical link makes this sharper still. In December 2024 it was a proof. Today it's a pointer to the counterevidence, sitting inside the sentence it refutes. The README is arguing against itself and can't tell, because a Markdown file has no idea what's in the Python file next to it.

## Success is the mechanism

Here's what separates this from an ordinary stale fact.

When Hugging Face archived Text Generation Inference but left it on the homepage's flagship library list, the claim went stale because the thing *died*. When "over 200 community-led leaderboards" kept getting quoted eighteen months after anyone counted, it went stale because the world *moved*.

The `smolagents` number went stale because the project **worked**.

Look at what those 775 new lines in `agents.py` are. Support for more model backends — `LiteLLM`, `VLLM`, `MLX`, `AmazonBedrock`, `AzureOpenAI`. Multi-agent composition, so a manager agent can call sub-agents as if they were tools. A typed memory model with replay. Planning steps on an interval. Structured output. Streaming. Every one of those is a thing users asked for, and each one is a few dozen lines that no reasonable maintainer would refuse.

Nobody ever decided to abandon minimalism. There was no meeting. There was a sequence of individually correct decisions, each of which cost about 2% of the claim, and the claim had no mechanism to object. A README doesn't fail CI. There is no test that reads `assert len(open('agents.py').readlines()) < 1000`.

And that's the part I find genuinely interesting: **the property was measurable and nobody measured it.** Not because the team was careless, but because the number lived in prose, and prose isn't wired to anything. If minimalism is your differentiator, it is a functional requirement, and functional requirements that aren't enforced are just intentions with good PR.

## Why it's load-bearing

You could reasonably ask whether this matters. The library is excellent. It has 28,761 stars. Its GAIA scaffold got 55% pass@1 against OpenAI's closed Deep Research at 67% — a respectable showing for something you can read end to end.

It matters because of *which* claim it is.

`smolagents` competes with LangGraph, CrewAI, the OpenAI Agents SDK, and Pydantic AI. It does not win on features, ecosystem, or enterprise support. It wins — when it wins — on being small enough to read, hack, and hold in your head. Simplicity isn't one bullet among many. It's the entire differentiated pitch, and the line count is the only hard evidence offered for it.

So the false number sits precisely on the load-bearing claim. Someone choosing an agent framework on a Thursday afternoon reads "~1,000 lines," pictures an afternoon of reading, and commits. The reality is 1,813 lines in the core file and 12,774 in the package — a different afternoon.

Note that the *decision* might still be right. `smolagents` may well remain the smallest serious option in its class; I haven't measured the competitors and I'm not claiming otherwise. But "smallest available" and "about a thousand lines" are different assertions, and the reader was given the second one to reason with.

## The claim outruns its source

The other thing that happens to a good number is that it travels.

Search for `smolagents` and you'll find the thousand-line figure in Medium posts, DataCamp tutorials, framework roundups, aggregator summaries. None of them are lying either. They read the README, quoted it accurately, and published. Some did that in early 2025, when it was true.

But a quote has no expiry date attached, and each repetition strips a little more context — first the tilde, then the scoping to `agents.py`, until you get "smolagents is about a thousand lines" as a free-floating fact about a library. The copies will outlive the correction by years, and there is no mechanism by which fixing the README fixes them. This is the ordinary fate of any crisp, quotable number placed on a high-traffic surface: it gets adopted by people who have no way to know when it expired.

## What a durable version looks like

The fix isn't to delete the claim. Minimalism is real and it's worth advertising. The fix is to state it in a form that either maintains itself or fails loudly.

**Anchor it to a version.** "At v1.0.0, the agent logic was 1,038 lines" is permanently true. It's weaker as marketing and stronger as a fact, and it degrades into history rather than into error.

**Make it relative.** "Smaller than any comparable framework" survives your own growth, because it's a claim about a gap rather than a level. It only breaks if a competitor gets smaller, which is a thing you'd want to know anyway.

**Or wire it up.** A line-count badge computed at build time can't go stale. A CI check that fails when `agents.py` crosses a threshold turns the claim into a constraint — and forces the honest conversation at the moment of the fifteenth backend, rather than eighteen months later when a stranger counts the lines.

That last option is the only one that treats simplicity as a real requirement instead of a description. Which is the general lesson, and it isn't really about `smolagents`: **if a property is important enough to advertise, it's important enough to test.** We all know this about latency and correctness. We write the benchmark, we set the budget, we fail the build. Then we make an equally specific claim about our own codebase in a README and enforce it with nothing at all.

The number in that README was true when it was written. That's the whole problem. Claims don't rot because someone lied — they rot because nothing was watching, and the project kept getting better.
