---
layout: single
title: "Catching Lies in AI Translation"
date: 2026-02-17
read_time: 5
author: Alyshia Ledlie
author_title: "Founder, Integrity Studio"
author_profile: true
excerpt: "An AI translator made up a story about the Netherlands. Our system caught it. Here's how we keep machine translations honest."
description: "How we built a system to detect and fix made-up facts in AI-generated translations, with real results from a client project."
keywords: ai translation quality, llm hallucination detection, translation evaluation, ai quality assurance, portuguese translation
header:
  image: /assets/images/cover-work.png
  teaser: /assets/images/cover-work.png
toc: true
toc_sticky: true
permalink: /work/2026-02-17-catching-lies-in-AI-translation/
categories:
  - AI
  - Observability
tags:
  - ai-translation
  - hallucination-detection
  - opentelemetry
  - llm-evaluation
  - portuguese
schema_type: tech-article
---

An AI translated an artist's bio into Portuguese, and the result sounded great — until we looked closer.

The AI had added this line:

> *"A jornada que começou na Holanda, atravessou oceanos e agora retorna ao lar"*
> ("The journey that began in the Netherlands, crossed oceans, and now returns home")

The artist never went to the Netherlands. The English source says nothing about it. The AI made the whole thing up.

We built a system to catch exactly this kind of lie — and over six days, it brought the error rate from 17% down to zero:

```
Session        Hallucination Rate
─────────────  ──────────────────
Feb 11 (early)  ████████████████░░░░  17.2%
Feb 11 (mid)    █████████░░░░░░░░░░░   9.9%
Feb 11 (late)   ████░░░░░░░░░░░░░░░░   4.3%
Feb 14 (pre)    ██████████████░░░░░░  14.3%
Feb 14 (post)   ███░░░░░░░░░░░░░░░░░   3.2%
Feb 17 (final)  ░░░░░░░░░░░░░░░░░░░░   0.0%
```

Here's how we got there.

## The Problem: Perfect Grammar, Fake Facts

Old translation tools were easy to spot. The grammar was wrong, the phrasing was awkward, and you knew right away something was off.

Today's AI is different. The grammar is perfect and the word choices are natural. But sometimes the AI adds things that aren't in the original — a date no one wrote, a place no one named, or a number that doesn't exist.

You can't see these problems just by reading the translation. Everything sounds right. You have to check every line against the original source to find what's been added, and no one has time to do that by hand.

So we taught a second AI to do it for us.

## How We Catch the Lies

Our tool reads both versions — the English original and the Portuguese translation — and checks every line. If something appears in the translation that has no match in the source, it gets flagged.

But not every addition is a problem. Portuguese is a warm, lively language. Good translations add phrases like "Energia demais!" (So much energy!) or "Maravilhoso!" (Wonderful!). Those aren't lies — they're just how people talk in Brazil. Our tool knows the difference between added warmth and added fiction.

When it finds a real problem — a made-up fact, a place name, or a date that doesn't exist in the source — it removes the false content, keeps the tone, and runs the check again. It keeps going until everything passes.

## What Actually Happened

We ran this system on three Portuguese files we had translated for a dance company.

**The first attempt was rough.** Made-up content showed up in 5 to 17 percent of the output. That's where the Netherlands line came from — the AI had learned real facts about Brazilian dance groups in Europe and then guessed a detail that seemed to fit.

**The second round got better.** We traced the problem to the AI's training data and built more focused checks. The error rate dropped to around 3 percent.

**The third round came back clean.** All three files passed every check with zero made-up content:

| File | Quality Score | Made-Up Content |
|------|:------------:|:---------------:|
| Artist profile | 99.9% | 0% |
| Market analysis (zouk) | 99.9% | 0% |
| Market analysis (Austin) | 99.9% | 0% |

One fix was all it took: remove the Netherlands line.

## Why This Lie Was So Dangerous

The Netherlands line tells us something important about how AI fails at translation.

The AI didn't make a grammar mistake. It didn't use the wrong word. It pulled from its training data, found real information about Brazilian dancers in Europe, and guessed a detail that seemed to fit. Then it wrote that guess in the same confident tone as the real facts around it.

The result sounds right, looks right, and reads like something a person would write. But it's completely wrong.

This is what makes AI translation risky for business content. The errors don't look like errors. They look like facts. And if you're publishing someone's bio, putting out a market report, or translating client-facing content, a single made-up detail can damage trust in ways that are hard to undo.

## Flavor vs. Fiction

Ten added phrases passed our checks on purpose:

- "Energia demais!" (So much energy!)
- "So gente top!" (Only the best people!)
- "Maravilhoso!" (Wonderful!)
- "Incrivel!" (Amazing!)
- "Gratidao!" (Gratitude!)

These phrases don't claim any facts. They add warmth, which is how people actually talk in Brazil. Stripping them out would make the translation sound flat and robotic.

The hard part is knowing which additions are fine and which are lies. "Energia demais!" adds charm. "The journey began in the Netherlands" adds fiction. You need a system smart enough to tell them apart.

## What Makes This Work at Scale

Every time our tool runs a check, it saves the results. Over time, this creates a history you can look back on. That gives you four things:

- **Catch repeat errors** — if a lie comes back in a future edit, the next check flags it automatically
- **Compare across files** — every document gets scored the same way
- **Spot trends** — see whether quality is going up or down over time
- **Get alerts** — know about problems before bad translations go live

## What Comes Next

Three of our 19 English reports now have Portuguese versions. The system is built to grow:

- **More languages** — the checks work for any language pair
- **More files** — every run scores all the files it touches
- **Voice matching** — a new tool will check whether translations sound like the client's real voice
- **Always running** — translation quality feeds into the same tracking system we use for everything else

The lesson keeps showing up across AI work: making things is the easy part, but *checking* them is where the real value lives. Without this system, the Netherlands line goes live on a client's website. With it, you catch the lie and keep the "Energia demais!"

---

*AI systems can look like they work while hiding mistakes you can't see. At [Integrity Studio](https://integritystudio.ai), we build tools that make quality visible. If your AI output looks right but you can't prove it, [that's where we start](https://integritystudio.ai/contact).*

---

## Appendix: Readability Analysis (textstat)

### Full Article

| Metric | Score | Interpretation |
|--------|-------|----------------|
| **Flesch Reading Ease** | 77.7 | Fairly Easy |
| **Flesch-Kincaid Grade** | 5.5 | 6th grade |
| **SMOG Index** | 8.5 | 8th grade |
| **Gunning Fog** | 7.2 | 7th grade |
| **Automated Readability Index** | 6.5 | 7th grade |
| **Dale-Chall** | 8.9 | 11th-12th grade |
| **Coleman-Liau Index** | 8.1 | 8th grade |
| **Linsear Write** | 5.2 | 5th grade |
| **Consensus** | **7th-8th grade** | Middle school |

| Statistic | Value |
|-----------|-------|
| Word count | 871 |
| Sentence count | 71 |
| Syllable count | 1,201 |
| Polysyllabic words | 62 (7.1%) |
| Difficult words | 102 (11.7%) |
| Est. reading time | 1.0 min |

### Per-Section Breakdown

| Section | Flesch Ease | FK Grade | Consensus |
|---------|-----------|----------|-----------|
| Introduction | 80.5 | 4.7 | 7th-8th |
| Good Grammar, Bad Facts | 83.7 | 5.0 | 6th-7th |
| Netherlands Analysis | 72.9 | 6.9 | 8th-9th |
| What Comes Next | 70.8 | 6.7 | 8th-9th |

### Comparison to Original Draft

| Metric | Original (11th-12th) | This Version (7th-8th) | Change |
|--------|----------------------|------------------------|--------|
| Flesch Reading Ease | 43.4 | 77.7 | +34 pts |
| FK Grade | 9.6 | 5.5 | -4.1 grades |
| Gunning Fog | 12.5 | 7.2 | -5.3 |
| Polysyllabic words | 23.3% | 7.1% | -16.2 pp |
| Difficult words | 24.6% | 11.7% | -12.9 pp |
| Dale-Chall | 11.1 | 8.9 | -2.2 |

**Note**: Dale-Chall remains elevated (8.9, "11th-12th grade") because technical domain vocabulary (`hallucination`, `faithfulness`, `OTEL`, `telemetry`) appears on the Dale-Chall difficult-word list regardless of sentence structure. All other metrics hit the 8th-grade target or below.

### Methodology

- Scores generated by the `textstat` Python library via MCP server integration
- Analysis run on article body text only (front matter, code blocks, and table markup excluded)
- Section boundaries follow the H2 headings in the article structure
- Flesch Reading Ease scale: 0-29 Very Confusing, 30-49 Difficult, 50-59 Fairly Difficult, 60-69 Standard, 70-79 Fairly Easy, 80+ Easy
