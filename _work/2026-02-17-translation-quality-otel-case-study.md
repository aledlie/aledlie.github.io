---
layout: single
title: "Catching AI Lies in Translation: An OTEL-Powered Quality Loop"
date: 2026-02-17
read_time: 7
author: Alyshia Ledlie
author_title: "Founder, Integrity Studio"
author_profile: true
excerpt: "When an AI translator invented a backstory about the Netherlands, our telemetry caught it. Here's how OpenTelemetry-driven evaluation loops keep machine translations honest."
description: "A case study on using OpenTelemetry evaluation pipelines to detect and fix hallucinations in AI-generated Portuguese translations, with real telemetry data from multiple improvement sessions."
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

Here's a sentence from an AI-translated biography of a Brazilian dance artist:

> *"A jornada que começou na Holanda, atravessou oceanos e agora retorna ao lar"*
> ("The journey that began in the Netherlands, crossed oceans, and now returns home")

Beautiful, right? Poetic, even. One problem: the artist never went to the Netherlands. The English source doesn't mention the Netherlands. Nobody mentioned the Netherlands. The AI made it up, wove it into flawless Portuguese, and kept going like nothing happened.

If you've ever trusted an AI translation without reading it against the source — and let's be honest, who has the time — this is what's slipping through. Not garbled grammar. Not obvious errors. *Confident fiction that reads like fact.*

We built a pipeline that catches it. Here's how.

## Fluent Doesn't Mean Faithful

Old-school machine translation was bad in obvious ways. Mangled grammar, robotic phrasing, wrong idioms. You could tell at a glance that something was off.

Modern LLMs have the opposite problem. The grammar is perfect. The tone is natural. The idioms land. And sometimes the model quietly invents information that doesn't exist in the source — a date, a statistic, a biographical detail — and buries it in prose so fluent you'd never question it.

For client-facing business reports, this isn't a style issue. A fabricated statistic in a market analysis misleads decisions. An invented biographical detail damages professional relationships. You can't catch it by reading the translation alone. You have to compare every claim against the source.

Nobody does that manually. So we automated it.

## The Loop

The translation-improvement agent runs a continuous quality loop over translated documents:

1. **Read both files** — English source and PT-BR translation
2. **Line-by-line audit** — flag translated content with no source counterpart
3. **Classify** — is it a hallucination (fabricated fact, P0) or an embellishment (tone-only, safe)?
4. **Fix** — remove or correct fabricated content
5. **Score** — emit OTEL evaluations for every quality dimension
6. **Check thresholds** — pass or fail against criteria
7. **Iterate** — repeat until everything passes

Step 3 is the key insight. Not all deviations are problems. Brazilian Portuguese is expressive — a good translation *should* add flavor. "Energia demais!" (So much energy!) isn't a hallucination. It's localization. A pipeline that flags every deviation produces noise. Ours distinguishes between cultural embellishments and fabricated facts.

## What Gets Measured

Every run emits `gen_ai.evaluation.result` records — structured OTEL events — tracking seven dimensions per file:

| Metric | What It Measures | Target |
|--------|-----------------|--------|
| `translation.hallucination` | Rate of fabricated factual content | <= 0.01 |
| `translation.faithfulness` | Fidelity to source document facts | >= 0.98 |
| `translation.readability_parity` | Reading level gap (FK grade) | <= 2 grades |
| `translation.coherence` | Natural flow in target language | >= 0.98 |
| `translation.relevance` | All source content preserved | >= 0.98 |
| `translation.length_ratio` | Word count EN-to-PT ratio | 1.05 - 1.25 |
| `translation.quality.score` | Weighted composite | >= 0.90 |

The composite formula weights hallucination prevention highest:

```
composite = (1 - hallucination) * 0.30
          + faithfulness * 0.25
          + relevance * 0.20
          + coherence * 0.15
          + readability_parity * 0.10
```

## The Numbers: From 17% to Zero

The pipeline has run across multiple sessions since early February 2026, translating three PT-BR documents for a dance company. Here's the trajectory.

### Feb 11: First Pass

Early LLM-as-Judge evaluations surfaced warning signals immediately:

| Session | Faithfulness | Hallucination | Status |
|---------|-------------|---------------|--------|
| `a75991f7` (early) | 0.828 | 0.172 | Warning |
| `a75991f7` (mid) | 0.901 | 0.099 | Improving |
| `a75991f7` (late) | 0.957 | 0.043 | Near-pass |
| `bab0a186` | 0.906 | 0.095 | Warning |

Hallucination rates between 5-17%. The session also burned 1.75M tokens with a 998:1 input-to-output ratio, and 63% of tool calls went to task management overhead rather than actual translation. Expensive, noisy, and untrustworthy.

### Feb 13-14: Post-Mortem

We found the Netherlands sentence, traced it to likely LLM confabulation from training data about Brazilian dance communities in Europe, and designed specialized agents to replace the bloated general-purpose approach.

Session evaluations showed the improvement work paying off:

| Session | Faithfulness | Hallucination | Context |
|---------|-------------|---------------|---------|
| `4c6726ce` | 0.857 | 0.143 | Pre-fix session |
| `b95c2314` | 0.966 | 0.034 | Post-fix session |
| `b95c2314` (re-eval) | 0.968 | 0.032 | Confirmed |

### Feb 17: Clean Sweep

The mature pipeline hit its stride. Per-file evaluation data from session `trans-quality-1771322194`:

| File | Quality | Hallucination | Faithfulness | Coherence | Relevance | Length Ratio |
|------|---------|---------------|-------------|-----------|-----------|-------------|
| `edghar_nadyne_perfil_artista.html` | 0.999 | 0.000 | 1.000 | 0.990 | 1.000 | 1.169 |
| `analise_mercado_zouk.html` | 0.999 | 0.000 | 1.000 | 0.990 | 1.000 | 1.204 |
| `analise_mercado_austin.html` | 0.999 | 0.000 | 1.000 | 0.990 | 1.000 | 1.247 |

All thresholds pass. One fix applied: the Netherlands sentence, removed.

The full trajectory:

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

## Why the Netherlands Sentence Matters

That fabricated sentence is instructive beyond this one project.

The model drew on training data — probably real information about Brazilian dance communities in Europe — inferred a plausible biographical detail, and inserted it with the same tone as verified content. It reads beautifully. It sounds authentic. It is entirely made up.

This is the invisible failure mode that makes AI translation dangerous for business content. Not wrong grammar. Not awkward phrasing. *Plausible fiction presented as fact.* And the pipeline caught it the only way it can be caught at scale: comparing every sentence in the translation against the source, flagging content with no counterpart.

## Embellishment Is Not Hallucination

Ten colloquial additions survived the audit — intentionally:

- "Energia demais!" (So much energy!)
- "So gente top!" (Only top-notch people!)
- "Maravilhoso!" (Wonderful!)
- "Incrivel!" (Incredible!)
- "Gratidao!" (Gratitude!)

These carry no factual claims. They're characteristic of natural Brazilian Portuguese. A translation that stripped them would be technically faithful and culturally dead.

This is the hard part of automated translation evaluation: you need a system smart enough to know that "Energia demais!" is localization and "The journey began in the Netherlands" is fabrication. Flag everything, and you drown in false positives. Flag nothing, and the Netherlands sentence ships.

## The OTEL Architecture

Each evaluation emits a structured JSON record using the OpenTelemetry `gen_ai.evaluation.result` semantic convention:

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

Written to daily JSONL files, aggregatable across sessions, files, and metrics. This gives you:

- **Regression detection** — a future edit re-introduces a hallucination? Next run catches it.
- **Cross-file comparison** — quality scores comparable across documents and languages
- **Trend analysis** — is the pipeline improving or degrading over time?
- **Alerting** — threshold breaches trigger notifications before bad translations reach production

## What's Next

Three of 19 English reports have PT-BR translations (15.8% coverage). The architecture scales from here:

- **New languages**: Evaluation dimensions are language-agnostic; only the length ratio target changes
- **New documents**: Each session automatically emits evaluations for all files processed
- **Voice matching**: A planned voice style matcher will score translations against the client's actual communication style (target: > 0.85 fidelity)
- **Continuous monitoring**: Translation quality feeds into the same observability stack as everything else

The lesson is the same one that keeps surfacing across AI work: generation is the easy part. *Verification* is the competitive advantage. Without structured telemetry, the Netherlands sentence ships to production. With it, you catch the fabrication — and keep the "Energia demais!"

---

*Translation quality is one instance of a broader problem: AI systems that appear to work perfectly while producing invisible failures. At [Integrity Studio](https://integritystudio.ai), we build the measurement systems that make quality visible. If your AI outputs look right but you can't prove it, [that's where we start](https://integritystudio.ai/contact).*

---

## Appendix: Readability Analysis (textstat)

Readability scores computed via the [textstat](https://github.com/textstat/textstat) MCP server on the full article body and individual sections.

### Full Article

| Metric | Score | Interpretation |
|--------|-------|----------------|
| **Flesch Reading Ease** | 43.4 | Difficult (college level) |
| **Flesch-Kincaid Grade** | 9.6 | 10th grade |
| **SMOG Index** | 11.7 | 12th grade |
| **Gunning Fog** | 12.5 | College freshman |
| **Automated Readability Index** | 10.3 | 10th grade |
| **Dale-Chall** | 11.1 | College |
| **Coleman-Liau Index** | 13.6 | College freshman |
| **Linsear Write** | 8.4 | 8th grade |
| **Consensus** | **10th-11th grade** | High school junior |

| Statistic | Value |
|-----------|-------|
| Word count | 785 |
| Sentence count | 81 |
| Syllable count | 1,425 |
| Polysyllabic words | 183 (23.3%) |
| Difficult words | 193 (24.6%) |
| Est. reading time | 1.1 min |

### Per-Section Breakdown

| Section | Flesch Ease | FK Grade | Gunning Fog | Dale-Chall | Consensus |
|---------|-----------|----------|-------------|------------|-----------|
| Introduction | 63.3 | 7.2 | 9.7 | 9.9 | 9th-10th |
| Fluent vs. Faithful | 49.3 | 8.4 | 11.1 | 10.3 | 10th-11th |
| Netherlands Analysis | 50.2 | 8.8 | 11.9 | 11.0 | 11th-12th |
| What's Next / Conclusion | 38.2 | 10.3 | 13.7 | 11.1 | 11th-12th |

**Target audience**: Technical professionals and AI practitioners; readability is consistent with industry case studies and technical blog posts (typically 10th-14th grade). The introduction scores most accessible (9th-10th grade, Flesch 63.3 "Standard") due to short punchy sentences and direct address. The conclusion scores highest difficulty due to compound technical noun phrases.

### Methodology

- Scores generated by the `textstat` Python library via MCP server integration
- Analysis run on article body text only (front matter, code blocks, and table markup excluded)
- Section boundaries follow the H2 headings in the article structure
- Flesch Reading Ease scale: 0-29 Very Confusing, 30-49 Difficult, 50-59 Fairly Difficult, 60-69 Standard, 70+ Easy
