---
layout: single
title: "Auditing an AI's Honesty: How We Catch Hallucinations Before They Become Liabilities"
date: 2026-02-10
author: Alyshia Ledlie
author_profile: true
excerpt: "An auditor-friendly walkthrough of an LLM evaluation pipeline that detects when AI systems fabricate information — what it measures, how it works, and what the findings mean for system trustworthiness."
description: "A narrative explanation of the LLM-as-Judge hallucination evaluation pipeline, written for investigators and auditors of automation systems. Covers methodology, findings, and trust implications."
keywords: ai hallucination detection, llm evaluation, ai audit, automation trustworthiness, faithfulness scoring, ai quality assurance
header:
  image: /assets/images/cover-work.png
  teaser: /assets/images/cover-work.png
toc: true
toc_sticky: true
permalink: /work/auditing-ai-hallucination-pipeline/
categories:
  - AI
  - Observability
tags:
  - ai-audit
  - hallucination-detection
  - llm-evaluation
  - ai-quality
  - automation-trust
schema_type: tech-article
---

When an AI assistant tells you it created a file with 310 lines of code, did it actually do that? Or did it just say so, confidently and convincingly, without any basis in reality?

That question — whether an AI system's outputs are grounded in evidence or quietly fabricated — is the central concern of the evaluation pipeline documented here. This article walks through how the pipeline works, what it found during a real session, and what those findings mean if you are responsible for auditing or investigating the trustworthiness of automated systems.

## Why This Matters for Auditors

AI systems are increasingly embedded in workflows where their outputs drive real decisions: code deployments, data analyses, operational changes. Unlike a human employee, an AI model can produce entirely fabricated claims with the same tone and confidence as verified facts. The industry calls this **hallucination** — and it is arguably the single most important failure mode for any organization relying on AI automation.

A hallucination is not a crash, an error message, or a timeout. It is an invisible failure. The system appears to be working correctly. The output looks plausible. But the information is wrong, and there is no built-in signal to tell you so.

This pipeline exists to create that signal.

## What Was Built

On February 10, 2026, a complete evaluation pipeline was implemented — a script called `judge-evaluations.ts` — that does the following:

1. **Discovers session transcripts** from telemetry logs, finding the actual conversation records between a user and an AI assistant.
2. **Extracts conversation turns**, isolating what the user asked, what the assistant said, and what tool results (file reads, command outputs, API responses) were available at the time.
3. **Evaluates each turn** across four quality dimensions, producing scored assessments for every interaction.

The four dimensions are:

| Dimension | What It Measures |
|-----------|-----------------|
| **Relevance** | Did the assistant actually address what was asked? |
| **Coherence** | Was the response logically organized and internally consistent? |
| **Faithfulness** | Were the assistant's claims supported by the available evidence? |
| **Hallucination** | Did the assistant fabricate information not present in any evidence? |

For an auditor, the last two — faithfulness and hallucination — are where the real accountability lives.

## How Hallucination Detection Works

The hallucination assessment uses a method called **Question-Answer Generation (QAG)**, a three-step decomposition process that breaks down AI responses into individually verifiable claims and checks each one against the evidence.

Here is how it works, step by step.

### Step 1: Break the Response Into Atomic Claims

The assistant's response is decomposed into individual factual statements. Each statement must be small enough to be independently verified as true or false.

For example, suppose the assistant says: *"I created judge-evaluations.ts with 310 lines that discovers transcripts from log files."*

That single sentence becomes three separate claims:
- A file named `judge-evaluations.ts` was created
- The file has approximately 310 lines
- The file discovers transcripts from log files

This decomposition is critical. A response that is 90% accurate can still contain a fabricated claim buried in an otherwise truthful paragraph. By atomizing the response, every individual assertion gets its own verdict.

### Step 2: Convert Each Claim Into a Verification Question

Each atomic claim is reformulated as a yes-or-no question:
- Was a file named `judge-evaluations.ts` created?
- Does the file have approximately 310 lines?
- Does the file discover transcripts from log files?

This step standardizes the evaluation. Instead of asking a model to perform a vague "accuracy check," it creates a precise, binary verification task for each claim.

### Step 3: Answer Each Question Using Only the Evidence

Each verification question is answered using **only** the tool results from that conversation turn — the file contents that were read, the command outputs that were returned, the API responses that came back. No external knowledge. No assumptions. Just the artifacts.

Each answer is one of three values: **yes**, **no**, or **unknown**.

The final scores are computed from these answers:

- **Faithfulness** = (number of "yes" answers) / (total answered questions)
- **Hallucination** = 1 - Faithfulness

A faithfulness score of 0.92 means 92% of the assistant's verifiable claims were confirmed by the available evidence. The corresponding hallucination score is 0.08, or 8%.

### Built-In Safeguards

Two safeguards are worth noting for an audit context:

- **Input sanitization**: All text is processed through a sanitization function before entering the evaluation chain, protecting against prompt injection — a technique where malicious text in the input could manipulate the evaluator itself.
- **Context limits**: The system caps evaluations at 20 atomic statements and 20 context items per turn. This prevents runaway evaluations and keeps the scoring focused on the most substantive claims.

## What the Evaluation Found

The pipeline was run against a real session (ID: `01198165`) in which the assistant performed implementation work — creating files, modifying configurations, and managing tasks. Here are the results across three evaluated conversation turns.

### Per-Turn Hallucination Results

| Turn | Faithfulness | Hallucination | What It Means |
|------|-------------|---------------|---------------|
| 1 | 96.4% | 3.6% | Nearly all claims verified against evidence |
| 2 | 97.8% | 2.2% | Best score — strong grounding in tool results |
| 3 | 81.5% | 18.5% | Elevated — some claims not verifiable from evidence |

**The important finding is Turn 3.** The hallucination rate jumped to 18.5%, more than five times higher than Turn 2. Investigation into the cause revealed that the assistant included conversational guidance and forward-looking recommendations ("when you have API credits, swap to live mode") that, while reasonable advice, were not grounded in any tool output. The pipeline correctly flagged these as unverifiable.

This is a key insight for auditors: **not all hallucination is malicious or erroneous**. Some of it reflects a gap between what an assistant communicates (recommendations, explanations, caveats) and what the evaluation system can verify (concrete artifacts). A mature audit framework should distinguish between:

- **Substantive hallucination**: Claims about factual outputs (files created, data produced) that are fabricated
- **Conversational hallucination**: Forward-looking advice or explanatory framing that lacks a verification artifact

Both are captured by this pipeline. Distinguishing between them requires human review — but the pipeline ensures neither goes undetected.

### Aggregate Health Metrics

| Metric | Session Average | Global Average (6 sessions) | Status |
|--------|----------------|---------------------------|--------|
| Relevance | 0.81 | 0.82 | Healthy |
| Coherence | 0.79 | 0.80 | Healthy |
| Faithfulness | 0.92 | 0.89 | Healthy |
| Hallucination | 0.08 | 0.11 | **Warning** |

The global hallucination rate of 11% triggered an automated warning alert. The threshold is set at 10% — a conservative boundary that treats even moderate fabrication as worth investigating.

### Distribution of Hallucination Rates

Across all six evaluated sessions:
- **33% of evaluations** (2 of 6) fell in the low range (0-10% hallucination)
- **67% of evaluations** (4 of 6) fell in the moderate range (10-20% hallucination)
- **No evaluations** exceeded 20%

This distribution tells a clear story: the system is not producing egregious fabrications, but it routinely operates near the boundary of what the pipeline considers acceptable. For an auditor, this suggests the system is functional but warrants ongoing monitoring — it is not in a "set and forget" state.

## Operational Integrity: The Session Itself

Beyond the quality scores, the session's operational data provides additional audit evidence. The pipeline recorded 41 trace spans — individual instrumented operations — with complete success:

- **18 tool operations** (6 file edits, 1 file write, 3 task creations, 8 task updates) — all succeeded
- **6 TypeScript type-checks** on the generated code — all passed
- **14 post-tool execution hooks** — all completed without error
- **Zero tool failures** across the entire session

This operational telemetry, captured through OpenTelemetry instrumentation, provides a tamper-evident record of what the system actually did during the session. Every file modification, every task state change, and every validation step is logged with timestamps and span IDs.

## What This Means for Trust

For anyone responsible for auditing or investigating automated systems, this pipeline provides three things:

**1. A quantitative trust signal.** Instead of relying on subjective assessments of AI output quality, you have a numerical score — faithfulness and hallucination rates — computed through a reproducible, documented methodology. The QAG decomposition pattern is transparent: you can inspect exactly which claims were extracted, which questions were generated, and how each was answered.

**2. An early warning system.** The 10% hallucination threshold and automated alerting mean you do not have to wait for a downstream failure to discover that the system is fabricating claims. The warning is raised proactively, before the hallucinated output reaches a decision-maker or a production system.

**3. An audit trail.** Every evaluation is written in OpenTelemetry-formatted JSONL records that are append-only (never overwritten). These records can be ingested by standard observability platforms, queried historically, and correlated with the session traces that produced the original outputs.

## Limitations to Keep in Mind

No evaluation system is without blind spots, and an auditor should be aware of these:

- **Small sample size.** Six evaluated sessions with three turns each is not statistically robust. The confidence intervals on these metrics are wide. The standard deviation of 0.067 on both faithfulness and hallucination scores reflects genuine measurement uncertainty.
- **Single evaluator.** The pipeline uses one LLM (Claude Haiku) as the judge. There is no inter-rater reliability check. A second evaluator model would strengthen confidence in the scores.
- **Context-dependent scope.** Hallucination is only assessed when tool results exist. Turns where the assistant provides advice without triggering any tools are not scored. This is methodologically sound (you cannot verify claims without evidence to check against), but it means some assistant outputs fall outside the evaluation scope.
- **The evaluator can hallucinate too.** The LLM that judges faithfulness is itself a language model capable of errors. This is a known limitation of the LLM-as-Judge pattern and is an active area of research in the field.

## Conclusion

This pipeline represents a meaningful step toward auditable AI: a system that not only generates outputs but subjects those outputs to structured, evidence-based scrutiny. The hallucination rate of 8-11% across evaluated sessions is not alarming, but it is not negligible either. It confirms what experienced auditors already suspect — AI systems are generally reliable but routinely make small, confident claims that cannot be verified against the evidence at hand.

The right response is not to distrust the system entirely, nor to trust it blindly. It is to measure, monitor, and investigate — which is exactly what this pipeline enables.

---

*This article is a narrative adaptation of the technical session report [LLM-as-Judge Evaluation Pipeline: Hallucination Assessment Deep Dive](/reports/2026-02-10-llm-judge-evaluation-pipeline-session-01198165/), rewritten for an audit and investigation audience.*

---

## Appendix A: Readability Analysis

This article was evaluated using [textstat](https://pypi.org/project/textstat/) readability metrics to confirm it is pitched at the appropriate reading level for a professional auditor audience. The body text (excluding front matter, tables, and code blocks) was analyzed.

### Grade-Level Metrics

| Metric | Score | Interpretation |
|--------|-------|----------------|
| Flesch-Kincaid Grade | 12.2 | 12th-grade reading level |
| SMOG Index | 13.9 | College freshman level |
| Gunning Fog Index | 15.1 | College junior level |
| Automated Readability Index | 12.3 | 12th-grade reading level |
| Coleman-Liau Index | 14.5 | College sophomore level |
| Dale-Chall Readability | 12.0 | College graduate level |
| Linsear Write Formula | 13.8 | College freshman level |
| **Consensus** | **11th-12th grade** | **College-level text** |

### Ease-of-Reading

| Metric | Score | Label |
|--------|-------|-------|
| Flesch Reading Ease | 33.3 | Difficult |
| Target audience | -- | College level |
| Estimated reading time | -- | 1.7 minutes (body text only) |

### Text Statistics

| Statistic | Value |
|-----------|-------|
| Word count | 1,193 |
| Sentence count | 82 |
| Character count | 6,879 |
| Syllable count | 2,239 |
| Polysyllabic words | 291 (24.4%) |
| Monosyllabic words | 661 (55.4%) |
| Difficult words | 302 (25.3%) |

### Assessment

The Flesch Reading Ease score of 33.3 places this article in the "Difficult" range, consistent with professional and academic writing. The consensus grade level of 11th-12th grade confirms the text is accessible to professionals with standard educational backgrounds while maintaining the precision expected in audit documentation. The polysyllabic word count (24.4%) reflects the domain-specific vocabulary (hallucination, faithfulness, decomposition, sanitization) that is unavoidable when describing evaluation methodology accurately.

---

## Appendix B: OpenTelemetry Session Telemetry

The following telemetry was captured during the Claude Code session used to produce this article. All spans were exported via the OpenTelemetry protocol.

### Session Overview

| Field | Value |
|-------|-------|
| Date | 2026-02-13 |
| Session start | 08:06:00 |
| Duration | ~6 minutes (ongoing at time of capture) |
| Total trace spans | 870 |
| Telemetry exporter | OTLP (OpenTelemetry Protocol) |

### Span Type Breakdown

| Span Type | Count | Description |
|-----------|-------|-------------|
| `token-metrics-extraction` | 742 | Token usage tracking per API call |
| `builtin-post-tool` | 84 | Post-tool execution hooks |
| `skill-activation-prompt` | 21 | Skill matching checks |
| `session-start` | 9 | Session initialization (3 sessions in window) |
| `builtin-pre-tool` | 6 | Pre-tool validation hooks |
| `agent-pre-tool` | 4 | Subagent launch events |
| `agent-post-tool` | 4 | Subagent completion events |

### Tool Operations (All Successful)

| Tool | Count | Category |
|------|-------|----------|
| Bash | 64 | shell |
| TaskUpdate | 12 | task-management |
| Write | 11 | file |
| Edit | 3 | file |

Additionally, 2 MCP tool calls were made to `textstat` for readability analysis (these are not captured by the builtin hook telemetry as they route through the MCP protocol).

### Token Usage

| Metric | Value |
|--------|-------|
| Input tokens | 3,150,013 |
| Output tokens | 69,714 |
| Cache read tokens | 69,023,066 |
| **Total tokens** | **72,242,793** |

### Models Used

| Model | API Calls | Purpose |
|-------|-----------|---------|
| `claude-opus-4-6` | 2 | Primary reasoning and content generation |
| `claude-haiku-4-5-20251001` | 9 | Hook evaluations and skill activation checks |
| `<synthetic>` | 360 | Internal token accounting spans |

### Notes for Auditors

- **Span-per-hook architecture**: Each hook invocation generates its own trace ID. Correlating spans to a single logical session requires filtering by timestamp window rather than a single trace ID.
- **Telemetry window overlap**: The 870-span count covers the full time window from session start. Other concurrent sessions may contribute spans to this window.
- **Append-only logging**: All telemetry is written to `logs-YYYY-MM-DD.jsonl` files in append-only mode. Records are never overwritten or deleted.
- **Export destination**: Spans are exported in real time via OTLP (traces, metrics, and logs endpoints).
