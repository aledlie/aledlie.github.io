---
layout: single
title: "Catching AI Lies in Translation: An OTEL-Powered Quality Loop"
date: 2026-02-17
read_time: 6
author: Alyshia Ledlie
author_title: "Founder, Integrity Studio"
author_profile: true
excerpt: "An AI translator made up a story about the Netherlands. Our telemetry caught it. Here's how we keep machine translations honest."
description: "A case study on using OpenTelemetry to detect and fix hallucinations in AI-generated Portuguese translations, with real data from multiple sessions."
keywords: ai translation quality, opentelemetry, llm hallucination detection, translation evaluation, ai quality assurance, portuguese translation
header:
  image: /assets/images/cover-work.png
  teaser: /assets/images/cover-work.png
toc: true
toc_sticky: true
permalink: /work/translation-quality-otel-case-study/
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

The artist never went to the Netherlands, and the English source says nothing about it. The AI made the whole thing up and kept going like nothing happened.

That's what makes this scary. The sentence sounds real and fits the tone perfectly, reading like something a person would write. But it's fiction, dressed up as fact.

We built a system to catch exactly this kind of lie. Here's how it works.

## Good Grammar, Bad Facts

Old translation tools were easy to spot because the grammar was wrong and the phrasing was awkward. You knew right away that something was off.

Today's AI is different. The grammar is perfect, the tone is right, and the word choices are natural. But sometimes the AI adds things that aren't in the source — a date no one wrote, a place no one named, or a number that doesn't exist.

You can't see the problem just by reading the translation. You have to check every line against the original source, and no one has time to do that by hand. So we taught an AI to do it for us.

## How the Loop Works

Our tool checks translations in a cycle. It runs these steps in order:

1. **Read both files** — the English source and the Portuguese version
2. **Check each line** — look for content with no match in the source
3. **Sort the results** — is it a made-up fact or just added flavor?
4. **Fix the fakes** — take out false content
5. **Score the work** — log results as OTEL data
6. **Check the scores** — do they pass or fail?
7. **Run again** — keep going until all scores pass

Step 3 is the key part, because not every change is a problem. Portuguese is a warm, lively language, and good translations add phrases like "Energia demais!" (So much energy!). That's not a lie — it's just good translation. Our tool knows the difference between added warmth and added fiction.

## What Gets Scored

Each run logs seven scores per file:

| Metric | What It Checks | Goal |
|--------|---------------|------|
| `translation.hallucination` | Made-up facts | <= 0.01 |
| `translation.faithfulness` | Match to source | >= 0.98 |
| `translation.readability_parity` | Reading level gap | <= 2 grades |
| `translation.coherence` | Natural flow | >= 0.98 |
| `translation.relevance` | Nothing left out | >= 0.98 |
| `translation.length_ratio` | Word count ratio | 1.05 - 1.25 |
| `translation.quality.score` | Overall score | >= 0.90 |

The overall score weighs each part. Catching lies counts the most:

```
score = (1 - hallucination) * 0.30
      + faithfulness * 0.25
      + relevance * 0.20
      + coherence * 0.15
      + readability_parity * 0.10
```

## The Scores Over Time

We ran this tool across three sessions. It checked three Portuguese files for a dance company. Here's what happened.

### Feb 11: First Try

The first run showed problems right away:

| Session | Faithfulness | Hallucination | Status |
|---------|-------------|---------------|--------|
| `a75991f7` (early) | 0.828 | 0.172 | Warning |
| `a75991f7` (mid) | 0.901 | 0.099 | Getting better |
| `a75991f7` (late) | 0.957 | 0.043 | Almost there |
| `bab0a186` | 0.906 | 0.095 | Warning |

Lies showed up in 5 to 17 percent of the output, while the system burned through 1.75 million tokens. On top of that, 63 percent of its work went to task tracking instead of the actual translation — too slow, too costly, and too risky.

### Feb 13-14: Finding the Problem

We found the Netherlands line and traced it to the AI's training data. The model had likely learned real facts about Brazilian dance groups in Europe and then guessed details that seemed to fit.

We built new, focused tools, and the scores improved:

| Session | Faithfulness | Hallucination | Context |
|---------|-------------|---------------|---------|
| `4c6726ce` | 0.857 | 0.143 | Before fixes |
| `b95c2314` | 0.966 | 0.034 | After fixes |
| `b95c2314` (re-check) | 0.968 | 0.032 | Confirmed |

### Feb 17: All Clear

The latest run passed every test. Session `trans-quality-1771322194`:

| File | Quality | Hallucination | Faithfulness | Coherence | Relevance | Length Ratio |
|------|---------|---------------|-------------|-----------|-----------|-------------|
| `edghar_nadyne_perfil_artista.html` | 0.999 | 0.000 | 1.000 | 0.990 | 1.000 | 1.169 |
| `analise_mercado_zouk.html` | 0.999 | 0.000 | 1.000 | 0.990 | 1.000 | 1.204 |
| `analise_mercado_austin.html` | 0.999 | 0.000 | 1.000 | 0.990 | 1.000 | 1.247 |

One fix was needed: remove the Netherlands line.

Here's the full trend:

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

From 17.2% down to zero.

## Why This One Lie Matters

The Netherlands line tells us something important about how AI fails at translation.

The AI pulled from its training data, found real info about Brazilian dancers in Europe, and guessed a detail that seemed to fit. It wrote that guess in the same confident tone as the verified facts around it. The result sounds right and looks right, but it's completely wrong.

This is why AI translation is risky for business content — the errors don't look like errors. They look like facts. Our tool caught it the only way you can at scale: checking every line in the translation against the source and flagging anything with no match.

## Flavor vs. Fiction

Ten added phrases passed the check on purpose:

- "Energia demais!" (So much energy!)
- "So gente top!" (Only the best people!)
- "Maravilhoso!" (Wonderful!)
- "Incrivel!" (Amazing!)
- "Gratidao!" (Gratitude!)

These phrases don't claim any facts — they just add warmth, which is how people actually talk in Brazil. Stripping them out would make the translation flat and lifeless.

The hard part is knowing which additions are fine and which are lies. "Energia demais!" adds charm, while "The journey began in the Netherlands" adds fiction. You need a tool smart enough to tell them apart, and that's what the classification step provides.

## How OTEL Ties It Together

Each check writes a record in this format:

```json
{
  "timestamp": "2026-02-17T09:56:34.000Z",
  "name": "gen_ai.evaluation.result",
  "attributes": {
    "gen_ai.evaluation.name": "translation.hallucination",
    "gen_ai.evaluation.score.value": 0.000,
    "gen_ai.evaluation.evaluator": "translation-improvement",
    "gen_ai.evaluation.evaluator.type": "llm",
    "gen_ai.agent.name": "translation-improvement",
    "gen_ai.evaluation.file": "edghar_nadyne_perfil_artista.html",
    "session.id": "trans-quality-1771322194"
  }
}
```

These records go into daily log files that you can search across sessions, files, and score types. This structure gives you four important abilities:

- **Catch repeat errors** — if a lie comes back in a future edit, the next run flags it automatically
- **Compare files** — scores work the same way across all documents and languages
- **Spot trends** — see whether quality is going up or down over time
- **Set alerts** — get warned before bad translations go live on your site

## What Comes Next

Three of 19 English reports now have Portuguese versions (15.8%). The system is built to grow:

- **More languages**: The scoring works for any language, since only the word count ratio target changes between them.
- **More files**: Each run automatically scores every file it touches during the session.
- **Voice matching**: A new tool will check whether translations sound like the client's real voice, with a goal of reaching a 0.85 match score.
- **Always on**: Translation scores feed into the same tracking system as all of our other development tools.

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
