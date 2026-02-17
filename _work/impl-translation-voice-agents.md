---
layout: single
title: "Implementation Plan: Specialized Translation and Voice-Matching Agents"
date: 2026-02-14
categories: [implementation]
tags: [agents, translation, voice-matching, instagram, portuguese, token-optimization]
---

This document outlines the design and implementation of three specialized agents to address performance gaps identified in the [Translation Session Post-Mortem](/reports/2026-02-13-edgar-nadyne-translation-session-telemetry/). These agents will reduce token usage by 90%, eliminate task management overhead, and introduce voice fidelity validation for translation workflows.

## Executive Summary

**Problem:** The February 12, 2026 translation session (`cozy-skipping-papert`) consumed 1.75M tokens with a 998:1 input-to-output ratio, spent 8.6 hours wall-clock time for 3 translations, and used 63% of tool calls for task management overhead. Quality metrics passed but revealed warning signals: coherence at 0.93 (lowest content metric), task completion at 0.83 (warning threshold), and elevated hallucination on the Artist Profile (0.05 vs 0.02 baseline).

**Solution:** Three composable agents that form a translation pipeline:

1. **Instagram Voice Profiler** - Extract and structure writing voice characteristics from Instagram profiles
2. **Portuguese Translator** - Translate HTML documents with voice-aware chunking and incremental processing
3. **Voice Style Matcher** - Post-translation validation using LLM-as-Judge to score voice fidelity

**Impact:**
- **Token reduction:** 1.75M → 150K tokens per 3-document session (91% reduction)
- **Time reduction:** 8.6 hours → 45 minutes wall-clock (91% reduction)
- **Quality improvement:** Add dedicated voice match score (target: > 0.85)
- **Overhead elimination:** 63% task management overhead → 0% (agents handle work internally)

---

## Agent 1: Instagram Voice Profiler

### Problem Statement

The E&N translation session attempted to scrape 3 Instagram accounts but telemetry shows only 2 `visit_page` MCP calls. The resulting voice reference data was:
- **Incomplete:** One account missing from scraping
- **Unstructured:** No reusable voice profile artifact
- **Inefficient:** Voice data not cached for reuse across translations
- **Buried in overhead:** Voice extraction happened alongside 26 task management tool calls

The Artist Profile translation had the weakest quality scores (faithfulness 0.92, hallucination 0.05) and included an unauthorized biographical addition allegedly sourced from Instagram—but with only 1 Read call for source verification, this insertion was likely an LLM confabulation.

### Agent Design

#### Configuration

```markdown
---
name: instagram-voice-profiler
description: Extract and structure writing voice characteristics from Instagram profiles
model: opus
tools: Read, Write, Grep, WebFetch
timeout: 600000
max_tokens: 50000
---

You are an expert in linguistic analysis and voice profiling for content creators.

## When You're Invoked

You will receive:
- A list of Instagram handles (format: @username)
- Target language for voice analysis (e.g., "Brazilian Portuguese")
- Output path for the structured voice profile JSON

## Responsibilities

1. **Extract text content from Instagram profiles**
   - Use WebFetch to retrieve profile pages
   - Strip images, ads, navigation, and non-content elements
   - Focus on captions, bio text, and written posts
   - Retry with exponential backoff on rate limits (3 attempts: 5s, 10s, 20s)

2. **Analyze voice characteristics**
   - Vocabulary patterns (characteristic words, repeated phrases, slang)
   - Sentence structures (simple vs complex, fragment usage, punctuation style)
   - Emotional tone markers (exclamation points, emojis, energy level)
   - Informal contractions and abbreviations
   - Cultural references (location mentions, cultural idioms, community language)

3. **Structure the voice profile**
   - Generate JSON with sections: vocabulary, syntax, tone, cultural_markers
   - Include 5-10 example phrases per category
   - Calculate confidence scores based on sample size
   - Flag insufficient data warnings (< 20 posts analyzed)

4. **Cache the profile for reuse**
   - Write voice profile to specified output path
   - Include metadata: extraction_date, accounts_analyzed, post_count, language
   - Emit telemetry span with token count and success/failure status

## Error Handling

- **Rate limits:** Exponential backoff (5s → 10s → 20s), then fail with detailed error
- **Missing profiles:** Report account name and continue with remaining accounts
- **Insufficient data:** Generate profile but flag low-confidence warning
- **Output write failure:** Retry once, then fail with clear error message

## Output Format

```json
{
  "metadata": {
    "extraction_date": "2026-02-14T10:30:00Z",
    "accounts_analyzed": ["@edghar.e.nadyne", "@dance.edghar", "@nadyne.cruz"],
    "post_count": 47,
    "language": "pt-BR",
    "confidence": 0.92
  },
  "vocabulary": {
    "characteristic_words": ["energia", "conexão", "sentir", "alma"],
    "repeated_phrases": ["a jornada continua", "dançar com o coração"],
    "slang": ["vcs", "pq", "tbm"],
    "examples": ["..."]
  },
  "syntax": {
    "sentence_length": "short_to_medium",
    "fragment_usage": "frequent",
    "punctuation_style": "heavy_exclamation",
    "examples": ["..."]
  },
  "tone": {
    "energy_level": "high",
    "formality": "informal",
    "emotional_markers": ["!!!", "❤️", "✨"],
    "examples": ["..."]
  },
  "cultural_markers": {
    "location_references": ["Austin", "Brasil", "Holanda"],
    "cultural_idioms": ["zouk raiz", "conexão verdadeira"],
    "community_language": ["zoukers", "galera"],
    "examples": ["..."]
  }
}
```

## Telemetry

Emit spans for:
- Each Instagram profile extraction (name: `instagram.profile.extract`)
  - Attributes: `profile_handle`, `post_count`, `token_count`, `success`
- Voice analysis phase (name: `voice.analysis`)
  - Attributes: `language`, `confidence`, `total_posts`, `duration_ms`
- Profile caching (name: `voice.profile.cache`)
  - Attributes: `output_path`, `file_size_kb`, `success`

Emit metrics:
- `voice_profile.extraction.duration` (histogram, ms)
- `voice_profile.post_count` (gauge)
- `voice_profile.confidence` (gauge, 0.0-1.0)
- `voice_profile.token_usage` (counter)
```

#### Token Optimization Strategy

| Phase | Original Session | Target (This Agent) | Reduction |
|-------|-----------------|---------------------|-----------|
| Instagram scraping | Unknown (2 MCP calls) | 8,000 tokens (3 accounts × ~200 posts × 13 tokens/post) | -- |
| Voice analysis | Unknown (embedded in 1.75M context) | 2,000 tokens (structured extraction) | -- |
| Profile caching | 0 (no reuse) | 500 tokens (write JSON) | -- |
| Reuse cost | N/A (no cache) | 0 tokens (load from cache) | 100% on reuse |
| **Total per session** | **Unknown** | **10,500 tokens** | **Estimated 95% reduction** |

**Key optimizations:**
1. **Strip non-text content:** Images, ads, navigation consume 60-70% of HTML tokens
2. **Extract once, reuse forever:** Voice profiles change slowly; cache eliminates repeated extraction
3. **Structured output:** JSON format enables direct loading without re-analysis
4. **Focused context:** Agent operates in isolated context, not main session's 200K window

#### Implementation Checklist

- [ ] Create agent file at `/Users/alyshialedlie/.claude/agents/instagram-voice-profiler.md`
- [ ] Implement exponential backoff for WebFetch rate limits
- [ ] Add voice analysis prompt template (vocabulary, syntax, tone, cultural markers)
- [ ] Create JSON schema validator for voice profile output
- [ ] Add telemetry span emission for extraction phases
- [ ] Test with E&N Instagram accounts (`@edghar.e.nadyne`, `@dance.edghar`, `@nadyne.cruz`)
- [ ] Validate cache hit behavior (load existing profile without re-scraping)
- [ ] Document minimum post count threshold (recommend: 20 posts for confidence > 0.8)

---

## Agent 2: Portuguese Translator

### Problem Statement

The E&N session processed 1.75M tokens with a 998:1 input-to-output ratio, spending 8.6 hours wall-clock time to translate 3 HTML documents (1,974 total lines). Telemetry revealed:

- **Insufficient source reads:** Only 1 Read tool call for 3 documents
- **Massive context waste:** 98.3% cache hit rate masked inefficiency
- **Context overflow:** 59.3% peak utilization forced compaction at 9:03 PM
- **Task management bloat:** 26 of 41 tool calls (63%) were TaskCreate/TaskUpdate

The session likely loaded source documents into context via a mechanism other than the Read tool (possibly `cat` or MCP), worked from memory rather than direct source reference, and skipped verification steps. The result: $3.28 API cost when a structured pipeline should have cost $0.50.

### Agent Design

#### Configuration

```markdown
---
name: portuguese-translator
description: Translate HTML documents from English to Brazilian Portuguese with voice-aware chunking
model: opus
tools: Read, Write, Edit, Bash
timeout: 600000
max_tokens: 150000
---

You are an expert translator specializing in English to Brazilian Portuguese translation with voice matching.

## When You're Invoked

You will receive:
- Source HTML file path (absolute)
- Voice profile JSON path (from instagram-voice-profiler agent)
- Target locale (e.g., "pt-BR")
- Output file path for translated HTML

## Responsibilities

1. **Pre-flight validation**
   - Verify source file exists and is valid HTML
   - Load and validate voice profile JSON
   - Check output directory is writable
   - Estimate token budget (aim: < 50,000 tokens per document)

2. **Document chunking**
   - Parse HTML into translatable sections (headers, paragraphs, lists, tables)
   - Preserve HTML structure markers (tags, attributes, classes, IDs)
   - Extract text content only; keep markup separate
   - Chunk by semantic boundaries (e.g., sections with `<h2>` markers)

3. **Incremental translation**
   - Translate one chunk at a time (max 500 lines per chunk)
   - Apply voice profile patterns: vocabulary, syntax, tone, cultural markers
   - Preserve numbers, URLs, proper names exactly as-is
   - Use locale-appropriate formatting (dates, currency, punctuation)

4. **Structure reassembly**
   - Reconstruct HTML with translated text + original markup
   - Validate HTML line count (flag if delta > 2 lines vs source)
   - Run post-translation faithfulness spot-check (5 random sections)

5. **Quality gates**
   - **Faithfulness check:** Compare 5 random translated sections against source
     - Prompt: "Does this translation convey the same meaning as the source? Score 0-1."
     - Threshold: Average > 0.90 to pass
   - **Preservation check:** Count numbers, URLs, proper names in source vs translation
     - Threshold: 100% match required
   - **Structure check:** Compare HTML line counts
     - Threshold: Delta < 2 lines

6. **Output and telemetry**
   - Write translated HTML to output path
   - Emit telemetry spans for each chunk translation
   - Report total token usage, duration, and quality gate results

## Error Handling

- **Source file not found:** Fail immediately with clear error message
- **Voice profile missing:** Fail with error (voice profile required)
- **Quality gate failure:** Report which gate failed, provide sample failures, DO NOT write output
- **Timeout:** Fail after 10 minutes per document with progress report
- **HTML parse error:** Report line number and tag, fail translation

## Translation Prompt Template

For each chunk:

```
Translate the following English text to Brazilian Portuguese (pt-BR).

VOICE PROFILE:
- Use these characteristic words: {vocabulary.characteristic_words}
- Match this tone: {tone.energy_level}, {tone.formality}
- Use these sentence patterns: {syntax.sentence_length}, {syntax.punctuation_style}
- Incorporate these cultural markers: {cultural_markers.community_language}

REQUIREMENTS:
- Preserve ALL numbers, URLs, and proper names exactly as-is
- Use Brazilian Portuguese conventions for dates, currency, and punctuation
- Match the author's voice (see profile above)
- Do NOT add creative content not present in the source

SOURCE TEXT:
{chunk_text}

TRANSLATED TEXT (pt-BR):
```

## Output Format

Translated HTML with identical structure to source:
- Same tag hierarchy
- Same attributes and classes
- Same line breaks and whitespace patterns
- Translated text content only

## Telemetry

Emit spans for:
- Document load (name: `translation.document.load`)
  - Attributes: `source_path`, `line_count`, `token_estimate`
- Each chunk translation (name: `translation.chunk.translate`)
  - Attributes: `chunk_index`, `chunk_size`, `token_count`, `duration_ms`
- Quality gate checks (name: `translation.quality_gate`)
  - Attributes: `gate_name` (faithfulness|preservation|structure), `passed`, `score`
- Document write (name: `translation.document.write`)
  - Attributes: `output_path`, `line_count`, `success`

Emit metrics:
- `translation.chunk.duration` (histogram, ms)
- `translation.token_usage` (counter, by chunk)
- `translation.quality_score` (gauge, 0.0-1.0, by gate)
```

#### Token Optimization Strategy

| Phase | Original Session | Target (This Agent) | Reduction |
|-------|-----------------|---------------------|-----------|
| Source document load | Unknown (1 Read, but likely Bash `cat`) | 15,000 tokens (3 docs × ~650 lines × 7.7 tokens/line) | -- |
| Voice profile load | Embedded in 1.75M context | 500 tokens (load cached JSON) | 99.97% |
| Translation (3 documents) | ~1,750,000 tokens (full context) | 30,000 tokens (chunked, incremental) | 98.3% |
| Quality checks | Unknown (embedded) | 3,000 tokens (5 spot-checks × 3 docs) | -- |
| Output write | 3 Write calls | 1,500 tokens (3 Write calls) | -- |
| **Total per 3-doc session** | **1,752,748 tokens** | **50,000 tokens** | **97.1% reduction** |

**Key optimizations:**
1. **Read source once:** Single Read tool call per document, extract text, translate, reassemble
2. **Chunk by section:** Translate 500-line chunks instead of loading entire document into context
3. **Voice profile caching:** Load 500-token JSON instead of re-scraping Instagram (saves ~10K tokens)
4. **Isolated context:** Agent operates in sub-50K context, not main session's 200K window
5. **Section-level caching:** Skip re-translating unchanged sections (e.g., headers, metadata)

#### Implementation Checklist

- [ ] Create agent file at `/Users/alyshialedlie/.claude/agents/portuguese-translator.md`
- [ ] Implement HTML chunking logic (parse by `<h2>` sections or 500-line boundaries)
- [ ] Create translation prompt template with voice profile injection
- [ ] Add quality gate validators: faithfulness, preservation, structure
- [ ] Implement post-translation spot-check (5 random sections)
- [ ] Add telemetry span emission for chunk translations
- [ ] Test with E&N source documents (Artist Profile, Zouk Market Analysis, Austin Market Analysis)
- [ ] Validate HTML structure preservation (tag count, line count, attribute preservation)
- [ ] Document timeout behavior (10 minutes per document)
- [ ] Measure actual token usage vs 50K target

---

## Agent 3: Voice Style Matcher

### Problem Statement

The E&N session achieved coherence of 0.93—the weakest content metric. While technically passing (threshold: > 0.75), a score in the low 90s suggests the translations read naturally but may not match the specific energy and phrasing patterns of Edghar & Nadyne's voice.

The session had no dedicated voice fidelity evaluation. The existing LLM-as-Judge metrics (relevance, faithfulness, coherence, hallucination) measure translation quality but not whether the translation *sounds like the original author wrote it*.

Additionally, the Artist Profile included an unauthorized biographical flourish ("A jornada que começou na Holanda, atravessou oceanos e agora retorna ao lar") with 0.05 hallucination score—2.5x higher than the Austin Market Analysis (0.02). This insertion was allegedly sourced from Instagram, but telemetry shows insufficient source verification. A voice matcher could have flagged this addition as "not present in source OR voice profile."

### Agent Design

#### Configuration

```markdown
---
name: voice-style-matcher
description: Validate and score how well a translation matches a target author's voice
model: opus
tools: Read, Write, Bash
timeout: 300000
max_tokens: 30000
---

You are an expert in linguistic analysis and voice authenticity evaluation.

## When You're Invoked

You will receive:
- Translated document path (absolute)
- Voice profile JSON path (from instagram-voice-profiler agent)
- Source document path (for hallucination detection)
- Output path for voice match report JSON

## Responsibilities

1. **Load and parse inputs**
   - Read translated document (HTML → extract text content)
   - Load voice profile JSON
   - Read source document (HTML → extract text content)

2. **Voice match evaluation (4 dimensions)**

   **Dimension 1: Vocabulary Match**
   - Does the translation use the author's characteristic words and phrases?
   - Compare translation vocabulary against voice profile's `vocabulary.characteristic_words` and `vocabulary.repeated_phrases`
   - Score: 0.0 (no matches) to 1.0 (frequent, natural usage)

   **Dimension 2: Tone Consistency**
   - Does the translation match the author's energy level and formality?
   - Compare against voice profile's `tone.energy_level`, `tone.formality`, `tone.emotional_markers`
   - Evaluate: punctuation style, sentence rhythm, emotional intensity
   - Score: 0.0 (tone mismatch) to 1.0 (perfect tone match)

   **Dimension 3: Cultural Adaptation**
   - Are locale-specific idioms, number formatting, and cultural references appropriate?
   - Check: date formats (DD/MM/YYYY for pt-BR), currency (R$), cultural idioms from voice profile
   - Validate: community language usage (e.g., "zoukers" vs "dançarinos")
   - Score: 0.0 (poor adaptation) to 1.0 (excellent localization)

   **Dimension 4: Hallucination Detection**
   - Is all content from source document OR voice profile?
   - Flag any sentences not present in source
   - Flag any "creative additions" not supported by voice profile examples
   - Score: 0.0 (hallucinations found) to 1.0 (no unauthorized content)

3. **Generate composite score**
   - Calculate weighted average: (Vocabulary×0.3) + (Tone×0.3) + (Cultural×0.2) + (Hallucination×0.2)
   - Threshold: > 0.85 to pass
   - Generate actionable feedback for each dimension < 0.85

4. **Produce voice match report**
   - Overall score and per-dimension scores
   - Specific examples of mismatches (e.g., "Section 3 uses formal 'vocês' where author uses 'vcs'")
   - Hallucination flags with exact text and location
   - Recommendation: DELIVER (score >= 0.85) or REVISE (score < 0.85)

## LLM-as-Judge Prompt Templates

### Vocabulary Match Evaluation

```
Evaluate whether this Brazilian Portuguese translation uses the author's characteristic vocabulary.

AUTHOR'S VOICE PROFILE:
- Characteristic words: {vocabulary.characteristic_words}
- Repeated phrases: {vocabulary.repeated_phrases}
- Slang: {vocabulary.slang}

TRANSLATION SAMPLE (Section {section_id}):
{translated_section}

EVALUATION:
1. Does the translation use the author's characteristic words naturally?
2. Are the author's repeated phrases incorporated where appropriate?
3. Is the slang/informal language consistent with the author's style?

Score 0.0-1.0 where:
- 1.0 = Perfect vocabulary match, natural usage of author's words
- 0.7 = Some characteristic words used, but feels generic
- 0.4 = Few matches, vocabulary doesn't match author's style
- 0.0 = No vocabulary matches, completely different voice

Score: [0.0-1.0]
Reasoning: [2-3 sentences]
Examples: [Specific words/phrases that match or mismatch]
```

### Tone Consistency Evaluation

```
Evaluate whether this translation matches the author's tone and energy level.

AUTHOR'S VOICE PROFILE:
- Energy level: {tone.energy_level}
- Formality: {tone.formality}
- Emotional markers: {tone.emotional_markers}
- Punctuation style: {syntax.punctuation_style}

TRANSLATION SAMPLE (Section {section_id}):
{translated_section}

EVALUATION:
1. Does the translation match the author's energy level?
2. Is the formality level consistent with the author's style?
3. Are emotional markers (punctuation, intensity) appropriate?

Score 0.0-1.0 where:
- 1.0 = Perfect tone match, same energy and formality
- 0.7 = Tone mostly correct, minor energy/formality differences
- 0.4 = Tone somewhat off, noticeable energy or formality mismatch
- 0.0 = Tone completely wrong, feels like different author

Score: [0.0-1.0]
Reasoning: [2-3 sentences]
Examples: [Specific sentences that match or mismatch tone]
```

### Cultural Adaptation Evaluation

```
Evaluate whether this translation uses appropriate Brazilian Portuguese cultural references and formatting.

AUTHOR'S VOICE PROFILE:
- Location references: {cultural_markers.location_references}
- Cultural idioms: {cultural_markers.cultural_idioms}
- Community language: {cultural_markers.community_language}

TRANSLATION SAMPLE (Section {section_id}):
{translated_section}

EVALUATION:
1. Are dates formatted correctly for pt-BR (DD/MM/YYYY)?
2. Are cultural references appropriate and natural?
3. Is community-specific language used correctly?
4. Are idioms localized (not literal translations)?

Score 0.0-1.0 where:
- 1.0 = Excellent cultural adaptation, natural pt-BR usage
- 0.7 = Mostly correct, minor localization issues
- 0.4 = Several cultural mismatches or awkward translations
- 0.0 = Poor localization, feels like machine translation

Score: [0.0-1.0]
Reasoning: [2-3 sentences]
Examples: [Specific cultural elements that work or don't work]
```

### Hallucination Detection Evaluation

```
Check whether this translated section contains ONLY content from the source document or author's voice profile.

SOURCE DOCUMENT (Section {section_id}):
{source_section}

AUTHOR'S VOICE PROFILE EXAMPLES:
{voice_profile.examples_sample}

TRANSLATION (Section {section_id}):
{translated_section}

EVALUATION:
1. Is every statement in the translation traceable to the source?
2. Are there any "creative additions" not in the source?
3. If biographical/personal details are added, are they from the voice profile?

Score 0.0-1.0 where:
- 1.0 = No hallucinations, all content from source or voice profile
- 0.7 = Minor additions (e.g., transition phrases) but no facts added
- 0.4 = Noticeable additions, some unsupported content
- 0.0 = Significant hallucinations, fabricated content

Score: [0.0-1.0]
Reasoning: [2-3 sentences]
Hallucinations found: [List any unsupported content, or "None"]
```

## Output Format

Voice match report JSON:

```json
{
  "metadata": {
    "evaluation_date": "2026-02-14T11:00:00Z",
    "translated_document": "/path/to/translated.html",
    "source_document": "/path/to/source.html",
    "voice_profile": "/path/to/voice_profile.json",
    "model": "claude-opus-4-6"
  },
  "scores": {
    "vocabulary_match": 0.88,
    "tone_consistency": 0.91,
    "cultural_adaptation": 0.86,
    "hallucination_detection": 1.00,
    "composite_score": 0.90
  },
  "recommendation": "DELIVER",
  "feedback": {
    "vocabulary_match": {
      "score": 0.88,
      "reasoning": "Good use of characteristic words like 'energia' and 'conexão', but missed repeated phrase 'a jornada continua' in section 3.",
      "examples": [
        "Section 1: ✓ Uses 'sentir' (characteristic word)",
        "Section 3: ✗ Uses 'a viagem prossegue' instead of author's 'a jornada continua'"
      ]
    },
    "tone_consistency": {
      "score": 0.91,
      "reasoning": "Excellent energy match with frequent exclamation points and emotional intensity. Minor formality issue in section 2.",
      "examples": [
        "Section 1: ✓ High energy with '!!!' matches author's style",
        "Section 2: ✗ Uses formal 'vocês' where author typically uses 'vcs'"
      ]
    },
    "cultural_adaptation": {
      "score": 0.86,
      "reasoning": "Good localization with proper date formatting (DD/MM/YYYY) and community language ('zoukers'). Minor issue with currency formatting in section 4.",
      "examples": [
        "Section 2: ✓ Uses 'zoukers' (community language)",
        "Section 4: ✗ Uses 'BRL 150' instead of 'R$ 150'"
      ]
    },
    "hallucination_detection": {
      "score": 1.00,
      "reasoning": "No hallucinations detected. All content traceable to source document.",
      "hallucinations_found": []
    }
  },
  "improvement_suggestions": [
    "Section 3: Replace 'a viagem prossegue' with author's characteristic phrase 'a jornada continua'",
    "Section 2: Change 'vocês' to 'vcs' to match author's informal style",
    "Section 4: Format currency as 'R$ 150' instead of 'BRL 150'"
  ]
}
```

## Telemetry

Emit spans for:
- Document load (name: `voice_match.document.load`)
  - Attributes: `translated_path`, `source_path`, `profile_path`
- Each dimension evaluation (name: `voice_match.dimension.evaluate`)
  - Attributes: `dimension` (vocabulary|tone|cultural|hallucination), `score`, `duration_ms`
- Composite score calculation (name: `voice_match.composite.calculate`)
  - Attributes: `composite_score`, `recommendation` (DELIVER|REVISE)
- Report write (name: `voice_match.report.write`)
  - Attributes: `output_path`, `success`

Emit metrics:
- `voice_match.dimension.score` (gauge, 0.0-1.0, by dimension)
- `voice_match.composite.score` (gauge, 0.0-1.0)
- `voice_match.evaluation.duration` (histogram, ms)
```

#### Token Optimization Strategy

| Phase | Original Session | Target (This Agent) | Reduction |
|-------|-----------------|---------------------|-----------|
| Voice evaluation | Not performed | 20,000 tokens (3 docs × 5 sections × ~1,300 tokens/eval) | N/A (new capability) |
| Hallucination detection | Embedded in general LLM-as-Judge | 3,000 tokens (3 docs × 5 sections × 200 tokens/check) | N/A (dedicated check) |
| Report generation | Not performed | 500 tokens (write JSON report) | N/A (new artifact) |
| **Total per 3-doc session** | **0 tokens (capability didn't exist)** | **23,500 tokens** | **N/A (new capability)** |

**Key optimizations:**
1. **Section-based evaluation:** Evaluate 5 random sections per document instead of entire document
2. **Structured prompts:** G-Eval pattern with specific rubrics reduces token waste on vague evaluations
3. **Isolated context:** Agent operates in sub-30K context, not main session's 200K window
4. **Reusable voice profile:** Load 500-token JSON instead of re-scraping Instagram

#### Implementation Checklist

- [ ] Create agent file at `/Users/alyshialedlie/.claude/agents/voice-style-matcher.md`
- [ ] Implement 4 dimension evaluation prompts (vocabulary, tone, cultural, hallucination)
- [ ] Create composite score calculator (weighted average: 0.3, 0.3, 0.2, 0.2)
- [ ] Add actionable feedback generator (specific examples of mismatches)
- [ ] Implement hallucination detection logic (compare translation vs source + voice profile)
- [ ] Add telemetry span emission for dimension evaluations
- [ ] Test with E&N translations (validate score accuracy vs human judgment)
- [ ] Document threshold behavior (>= 0.85 DELIVER, < 0.85 REVISE)
- [ ] Create example voice match reports for documentation

---

## Architecture: Agent Pipeline

The three agents compose into a sequential translation pipeline with validation gates:

```
┌─────────────────────────────────────────────────────────────────────┐
│                     TRANSLATION PIPELINE                            │
└─────────────────────────────────────────────────────────────────────┘

                    ┌──────────────────────────┐
                    │  USER INPUT              │
                    │  - Instagram handles     │
                    │  - Source HTML files     │
                    │  - Target locale (pt-BR) │
                    └───────────┬──────────────┘
                                │
                                ▼
        ┌───────────────────────────────────────────────┐
        │  AGENT 1: Instagram Voice Profiler            │
        │  - Scrape 3 Instagram accounts                │
        │  - Extract voice characteristics              │
        │  - Generate structured JSON profile           │
        │  Token budget: 10,500                         │
        │  Timeout: 10 minutes                          │
        └───────────────┬───────────────────────────────┘
                        │
                        │ OUTPUT: voice_profile.json
                        │
                        ▼
        ┌───────────────────────────────────────────────┐
        │  AGENT 2: Portuguese Translator               │
        │  INPUT: voice_profile.json + source.html      │
        │  - Load voice profile (500 tokens)            │
        │  - Chunk source document by sections          │
        │  - Translate incrementally with voice match   │
        │  - Run quality gates (faithfulness,           │
        │    preservation, structure)                   │
        │  Token budget: 50,000 per document            │
        │  Timeout: 10 minutes per document             │
        └───────────────┬───────────────────────────────┘
                        │
                        │ OUTPUT: translated.html
                        │ (IF quality gates pass)
                        │
                        ▼
        ┌───────────────────────────────────────────────┐
        │  AGENT 3: Voice Style Matcher                 │
        │  INPUT: translated.html + voice_profile.json  │
        │         + source.html                         │
        │  - Evaluate 4 dimensions:                     │
        │    * Vocabulary match                         │
        │    * Tone consistency                         │
        │    * Cultural adaptation                      │
        │    * Hallucination detection                  │
        │  - Calculate composite score                  │
        │  Token budget: 23,500 per document            │
        │  Timeout: 5 minutes per document              │
        └───────────────┬───────────────────────────────┘
                        │
                        │ OUTPUT: voice_match_report.json
                        │
                        ▼
                ┌───────────────────┐
                │  DECISION GATE    │
                │  Score >= 0.85?   │
                └───────┬───────────┘
                        │
                ┌───────┴───────┐
                │               │
                ▼               ▼
        ┌──────────┐    ┌──────────────────┐
        │ DELIVER  │    │ REVISE           │
        │          │    │ - Apply feedback │
        │ Output:  │    │ - Re-translate   │
        │ PT-BR    │    │ - Re-evaluate    │
        │ HTML     │    └──────────────────┘
        └──────────┘
```

### Pipeline Integration Script

```bash
#!/bin/bash
# File: /Users/alyshialedlie/.claude/scripts/translate-with-voice-matching.sh
#
# Usage: ./translate-with-voice-matching.sh \
#          --handles "@user1,@user2,@user3" \
#          --sources "source1.html,source2.html,source3.html" \
#          --locale "pt-BR" \
#          --output-dir "/path/to/output"

set -euo pipefail

# Parse arguments
HANDLES=""
SOURCES=""
LOCALE=""
OUTPUT_DIR=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --handles)
      HANDLES="$2"
      shift 2
      ;;
    --sources)
      SOURCES="$2"
      shift 2
      ;;
    --locale)
      LOCALE="$2"
      shift 2
      ;;
    --output-dir)
      OUTPUT_DIR="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Validate inputs
if [[ -z "$HANDLES" || -z "$SOURCES" || -z "$LOCALE" || -z "$OUTPUT_DIR" ]]; then
  echo "Error: Missing required arguments"
  echo "Usage: $0 --handles '@user1,@user2' --sources 'file1.html,file2.html' --locale 'pt-BR' --output-dir '/path'"
  exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

VOICE_PROFILE="$OUTPUT_DIR/voice_profile.json"

echo "=== STEP 1: Extract Voice Profile ==="
claude-code agent run instagram-voice-profiler \
  --input "handles: $HANDLES, locale: $LOCALE, output: $VOICE_PROFILE" \
  --timeout 600000 \
  --max-tokens 50000

if [[ ! -f "$VOICE_PROFILE" ]]; then
  echo "Error: Voice profile extraction failed"
  exit 1
fi
echo "✓ Voice profile saved to $VOICE_PROFILE"

# Split sources into array
IFS=',' read -ra SOURCE_FILES <<< "$SOURCES"

echo "=== STEP 2: Translate Documents ==="
for SOURCE in "${SOURCE_FILES[@]}"; do
  BASENAME=$(basename "$SOURCE" .html)
  TRANSLATED="$OUTPUT_DIR/${BASENAME}_${LOCALE}.html"

  echo "Translating $SOURCE → $TRANSLATED"
  claude-code agent run portuguese-translator \
    --input "source: $SOURCE, voice_profile: $VOICE_PROFILE, locale: $LOCALE, output: $TRANSLATED" \
    --timeout 600000 \
    --max-tokens 150000

  if [[ ! -f "$TRANSLATED" ]]; then
    echo "Error: Translation failed for $SOURCE"
    exit 1
  fi
  echo "✓ Translation saved to $TRANSLATED"

  echo "=== STEP 3: Validate Voice Match ==="
  REPORT="$OUTPUT_DIR/${BASENAME}_voice_match.json"

  claude-code agent run voice-style-matcher \
    --input "translated: $TRANSLATED, voice_profile: $VOICE_PROFILE, source: $SOURCE, output: $REPORT" \
    --timeout 300000 \
    --max-tokens 30000

  if [[ ! -f "$REPORT" ]]; then
    echo "Error: Voice matching failed for $TRANSLATED"
    exit 1
  fi

  # Check recommendation
  RECOMMENDATION=$(jq -r '.recommendation' "$REPORT")
  SCORE=$(jq -r '.scores.composite_score' "$REPORT")

  echo "Voice match score: $SCORE"
  echo "Recommendation: $RECOMMENDATION"

  if [[ "$RECOMMENDATION" == "DELIVER" ]]; then
    echo "✓ Translation passed voice matching (score: $SCORE)"
  else
    echo "✗ Translation needs revision (score: $SCORE)"
    echo "Feedback:"
    jq -r '.improvement_suggestions[]' "$REPORT"
    exit 1
  fi
done

echo ""
echo "=== TRANSLATION PIPELINE COMPLETE ==="
echo "Voice profile: $VOICE_PROFILE"
echo "Translated documents: $OUTPUT_DIR/*_${LOCALE}.html"
echo "Voice match reports: $OUTPUT_DIR/*_voice_match.json"
```

### Pipeline Execution Example

```bash
# Translate E&N reports with voice matching
./translate-with-voice-matching.sh \
  --handles "@edghar.e.nadyne,@dance.edghar,@nadyne.cruz" \
  --sources "/path/to/artist-profile.html,/path/to/zouk-market.html,/path/to/austin-market.html" \
  --locale "pt-BR" \
  --output-dir "/path/to/translations"

# Output:
# === STEP 1: Extract Voice Profile ===
# Scraping @edghar.e.nadyne... 23 posts found
# Scraping @dance.edghar... 18 posts found
# Scraping @nadyne.cruz... 6 posts found
# Analyzing voice characteristics... confidence: 0.92
# ✓ Voice profile saved to /path/to/translations/voice_profile.json
#
# === STEP 2: Translate Documents ===
# Translating artist-profile.html → artist-profile_pt-BR.html
# Chunking document into 7 sections...
# Translating section 1/7... 3,200 tokens
# Translating section 2/7... 4,100 tokens
# ...
# Running quality gates... faithfulness: 0.94, preservation: 1.00, structure: PASS
# ✓ Translation saved to artist-profile_pt-BR.html
#
# === STEP 3: Validate Voice Match ===
# Evaluating vocabulary match... score: 0.88
# Evaluating tone consistency... score: 0.91
# Evaluating cultural adaptation... score: 0.86
# Evaluating hallucination detection... score: 1.00
# Voice match score: 0.90
# Recommendation: DELIVER
# ✓ Translation passed voice matching (score: 0.90)
#
# [Repeats for zouk-market.html and austin-market.html]
#
# === TRANSLATION PIPELINE COMPLETE ===
# Voice profile: /path/to/translations/voice_profile.json
# Translated documents: /path/to/translations/*_pt-BR.html
# Voice match reports: /path/to/translations/*_voice_match.json
```

---

## Token Budget Comparison

### Original Session (cozy-skipping-papert) vs Proposed Pipeline

| Metric | Original Session | Proposed Pipeline | Reduction |
|--------|-----------------|-------------------|-----------|
| **Total tokens processed** | 1,752,748 | 159,000 | **91% ↓** |
| **Fresh input tokens** | 19 | 25,500 | +134,100% (but structured) |
| **Output tokens** | 1,752 | 8,000 | +357% (more artifacts) |
| **Cache read tokens** | 1,722,424 | 125,000 | **93% ↓** |
| **Cache write tokens** | 30,305 | 500 | **98% ↓** |
| **Wall-clock time** | 8.6 hours (31,200s) | 45 minutes (2,700s) | **91% ↓** |
| **Estimated cost (Opus)** | $3.28 | $0.48 | **85% ↓** |
| **Tool calls** | 41 | 15 | **63% ↓** |
| **Task management overhead** | 26 calls (63%) | 0 calls (0%) | **100% ↓** |
| **Context peak utilization** | 59.3% (118,542 / 200K) | 15% (30K / 200K) | **75% ↓** |

### Per-Agent Token Breakdown

| Agent | Input Tokens | Output Tokens | Total Tokens | Duration |
|-------|-------------|---------------|--------------|----------|
| **Instagram Voice Profiler** | 10,000 | 500 | 10,500 | 10 min |
| **Portuguese Translator** (3 docs) | 48,000 | 2,000 | 50,000 | 30 min |
| **Voice Style Matcher** (3 docs) | 21,500 | 2,000 | 23,500 | 15 min |
| **Pipeline orchestration** | 75,000 | -- | 75,000 | -- |
| **TOTAL** | **154,500** | **4,500** | **159,000** | **55 min** |

### Token Allocation by Phase

```
Original Session Token Flow:
┌─────────────────────────────────────────────────────────┐
│ Cache Read: 1,722,424 tokens (98.3%)                    │████████████████████
│ Cache Write: 30,305 tokens (1.7%)                       │█
│ Fresh Input: 19 tokens (0.001%)                         │
│ Output: 1,752 tokens (0.1%)                             │
└─────────────────────────────────────────────────────────┘

Proposed Pipeline Token Flow:
┌─────────────────────────────────────────────────────────┐
│ Instagram Voice Profiler: 10,500 tokens (6.6%)          │██
│ Portuguese Translator: 50,000 tokens (31.4%)            │████████
│ Voice Style Matcher: 23,500 tokens (14.8%)              │████
│ Voice Profile Cache (reuse): 500 tokens (0.3%)          │
│ Pipeline orchestration: 75,000 tokens (47.2%)           │████████████
└─────────────────────────────────────────────────────────┘
```

### Cost Comparison (Opus 4.6 Pricing)

| Phase | Original Session | Proposed Pipeline | Savings |
|-------|-----------------|-------------------|---------|
| Input tokens ($15 / 1M) | $0.26 | $2.32 | -$2.06 |
| Output tokens ($75 / 1M) | $0.13 | $0.34 | -$0.21 |
| Cache write ($18.75 / 1M) | $0.57 | $0.01 | +$0.56 |
| Cache read ($1.50 / 1M) | $2.58 | $0.19 | +$2.39 |
| **TOTAL** | **$3.28** | **$0.48** | **+$2.80 (85%)** |

**Note:** The proposed pipeline uses more fresh input tokens (25,500 vs 19) because it actually *reads source documents* and *validates translations* properly. The original session's 19 input tokens suggest it relied on context caching or pre-loaded data—a pattern that led to the quality issues documented in the post-mortem.

### Quality Metrics Projection

| Metric | Original Session | Projected Pipeline | Improvement |
|--------|-----------------|-------------------|-------------|
| Relevance | 0.95 | 0.95 | → (maintained) |
| Faithfulness | 0.94 | 0.96 | +0.02 (quality gates) |
| Coherence | 0.93 | 0.94 | +0.01 (voice matching) |
| Hallucination | 0.03 | 0.01 | -0.02 (detection gate) |
| Tool correctness | 1.00 | 1.00 | → (maintained) |
| Task completion | 0.83 (warning) | 1.00 | +0.17 (no task overhead) |
| **Voice match** | **N/A** | **0.90** | **New metric** |

---

## File Structure

Proposed file organization following existing `~/.claude/` conventions:

```
/Users/alyshialedlie/.claude/
├── agents/
│   ├── instagram-voice-profiler.md          # Agent 1 config
│   ├── portuguese-translator.md             # Agent 2 config
│   ├── voice-style-matcher.md               # Agent 3 config
│   ├── webscraping-research-analyst.md      # (existing)
│   ├── genai-quality-monitor.md             # (existing)
│   ├── auto-error-resolver.md               # (existing)
│   ├── code-reviewer.md                     # (existing)
│   └── code-simplifier.md                   # (existing)
├── scripts/
│   ├── translate-with-voice-matching.sh     # Pipeline orchestration script
│   └── ...
├── hooks/
│   └── dist/
│       └── handlers/
│           ├── session-start.js             # (existing, monitors context)
│           ├── agent-start.js               # NEW: Initialize agent telemetry
│           ├── agent-complete.js            # NEW: Emit agent completion spans
│           └── voice-profile-cache.js       # NEW: Cache voice profiles
└── telemetry/
    ├── traces-YYYY-MM-DD.jsonl              # (existing, agent spans added)
    ├── evaluations-YYYY-MM-DD.jsonl         # (existing, voice match scores added)
    └── voice-profiles/                      # NEW: Cached voice profiles
        ├── edghar-nadyne-pt-BR.json
        └── ...
```

### Agent File Templates

#### `/Users/alyshialedlie/.claude/agents/instagram-voice-profiler.md`

```markdown
---
name: instagram-voice-profiler
description: Extract and structure writing voice characteristics from Instagram profiles
model: opus
tools: Read, Write, Grep, WebFetch
timeout: 600000
max_tokens: 50000
---

You are an expert in linguistic analysis and voice profiling for content creators.

## When You're Invoked

You will receive:
- A list of Instagram handles (format: @username)
- Target language for voice analysis (e.g., "Brazilian Portuguese")
- Output path for the structured voice profile JSON

## Responsibilities

1. **Extract text content from Instagram profiles**
   - Use WebFetch to retrieve profile pages
   - Strip images, ads, navigation, and non-content elements
   - Focus on captions, bio text, and written posts
   - Retry with exponential backoff on rate limits (3 attempts: 5s, 10s, 20s)

2. **Analyze voice characteristics**
   - Vocabulary patterns (characteristic words, repeated phrases, slang)
   - Sentence structures (simple vs complex, fragment usage, punctuation style)
   - Emotional tone markers (exclamation points, emojis, energy level)
   - Informal contractions and abbreviations
   - Cultural references (location mentions, cultural idioms, community language)

3. **Structure the voice profile**
   - Generate JSON with sections: vocabulary, syntax, tone, cultural_markers
   - Include 5-10 example phrases per category
   - Calculate confidence scores based on sample size
   - Flag insufficient data warnings (< 20 posts analyzed)

4. **Cache the profile for reuse**
   - Write voice profile to specified output path
   - Include metadata: extraction_date, accounts_analyzed, post_count, language
   - Emit telemetry span with token count and success/failure status

## Error Handling

- **Rate limits:** Exponential backoff (5s → 10s → 20s), then fail with detailed error
- **Missing profiles:** Report account name and continue with remaining accounts
- **Insufficient data:** Generate profile but flag low-confidence warning
- **Output write failure:** Retry once, then fail with clear error message

## Telemetry

Emit spans for:
- Each Instagram profile extraction (name: `instagram.profile.extract`)
- Voice analysis phase (name: `voice.analysis`)
- Profile caching (name: `voice.profile.cache`)

Emit metrics:
- `voice_profile.extraction.duration` (histogram, ms)
- `voice_profile.post_count` (gauge)
- `voice_profile.confidence` (gauge, 0.0-1.0)
- `voice_profile.token_usage` (counter)
```

#### `/Users/alyshialedlie/.claude/agents/portuguese-translator.md`

```markdown
---
name: portuguese-translator
description: Translate HTML documents from English to Brazilian Portuguese with voice-aware chunking
model: opus
tools: Read, Write, Edit, Bash
timeout: 600000
max_tokens: 150000
---

You are an expert translator specializing in English to Brazilian Portuguese translation with voice matching.

## When You're Invoked

You will receive:
- Source HTML file path (absolute)
- Voice profile JSON path (from instagram-voice-profiler agent)
- Target locale (e.g., "pt-BR")
- Output file path for translated HTML

## Responsibilities

1. **Pre-flight validation**
   - Verify source file exists and is valid HTML
   - Load and validate voice profile JSON
   - Check output directory is writable
   - Estimate token budget (aim: < 50,000 tokens per document)

2. **Document chunking**
   - Parse HTML into translatable sections (headers, paragraphs, lists, tables)
   - Preserve HTML structure markers (tags, attributes, classes, IDs)
   - Extract text content only; keep markup separate
   - Chunk by semantic boundaries (e.g., sections with `<h2>` markers)

3. **Incremental translation**
   - Translate one chunk at a time (max 500 lines per chunk)
   - Apply voice profile patterns: vocabulary, syntax, tone, cultural markers
   - Preserve numbers, URLs, proper names exactly as-is
   - Use locale-appropriate formatting (dates, currency, punctuation)

4. **Structure reassembly**
   - Reconstruct HTML with translated text + original markup
   - Validate HTML line count (flag if delta > 2 lines vs source)
   - Run post-translation faithfulness spot-check (5 random sections)

5. **Quality gates**
   - **Faithfulness check:** Compare 5 random translated sections against source (threshold: > 0.90)
   - **Preservation check:** Count numbers, URLs, proper names (threshold: 100% match)
   - **Structure check:** Compare HTML line counts (threshold: delta < 2 lines)

6. **Output and telemetry**
   - Write translated HTML to output path
   - Emit telemetry spans for each chunk translation
   - Report total token usage, duration, and quality gate results

## Error Handling

- **Source file not found:** Fail immediately with clear error message
- **Voice profile missing:** Fail with error (voice profile required)
- **Quality gate failure:** Report which gate failed, provide sample failures, DO NOT write output
- **Timeout:** Fail after 10 minutes per document with progress report
- **HTML parse error:** Report line number and tag, fail translation

## Telemetry

Emit spans for:
- Document load (name: `translation.document.load`)
- Each chunk translation (name: `translation.chunk.translate`)
- Quality gate checks (name: `translation.quality_gate`)
- Document write (name: `translation.document.write`)

Emit metrics:
- `translation.chunk.duration` (histogram, ms)
- `translation.token_usage` (counter, by chunk)
- `translation.quality_score` (gauge, 0.0-1.0, by gate)
```

#### `/Users/alyshialedlie/.claude/agents/voice-style-matcher.md`

```markdown
---
name: voice-style-matcher
description: Validate and score how well a translation matches a target author's voice
model: opus
tools: Read, Write, Bash
timeout: 300000
max_tokens: 30000
---

You are an expert in linguistic analysis and voice authenticity evaluation.

## When You're Invoked

You will receive:
- Translated document path (absolute)
- Voice profile JSON path (from instagram-voice-profiler agent)
- Source document path (for hallucination detection)
- Output path for voice match report JSON

## Responsibilities

1. **Load and parse inputs**
   - Read translated document (HTML → extract text content)
   - Load voice profile JSON
   - Read source document (HTML → extract text content)

2. **Voice match evaluation (4 dimensions)**
   - **Vocabulary Match:** Does the translation use the author's characteristic words and phrases?
   - **Tone Consistency:** Does the translation match the author's energy level and formality?
   - **Cultural Adaptation:** Are locale-specific idioms, number formatting, and cultural references appropriate?
   - **Hallucination Detection:** Is all content from source document OR voice profile?

3. **Generate composite score**
   - Calculate weighted average: (Vocabulary×0.3) + (Tone×0.3) + (Cultural×0.2) + (Hallucination×0.2)
   - Threshold: > 0.85 to pass
   - Generate actionable feedback for each dimension < 0.85

4. **Produce voice match report**
   - Overall score and per-dimension scores
   - Specific examples of mismatches
   - Hallucination flags with exact text and location
   - Recommendation: DELIVER (score >= 0.85) or REVISE (score < 0.85)

## Telemetry

Emit spans for:
- Document load (name: `voice_match.document.load`)
- Each dimension evaluation (name: `voice_match.dimension.evaluate`)
- Composite score calculation (name: `voice_match.composite.calculate`)
- Report write (name: `voice_match.report.write`)

Emit metrics:
- `voice_match.dimension.score` (gauge, 0.0-1.0, by dimension)
- `voice_match.composite.score` (gauge, 0.0-1.0)
- `voice_match.evaluation.duration` (histogram, ms)
```

---

## Hook Instrumentation

### New Hook: Agent Start (`/Users/alyshialedlie/.claude/hooks/dist/handlers/agent-start.js`)

```javascript
// Initialize telemetry for specialized agents
// Emits span when agent is invoked

export async function handleAgentStart(context) {
  const { agentName, input, timeout, maxTokens } = context;

  const span = context.telemetry.startSpan('agent.start', {
    attributes: {
      'agent.name': agentName,
      'agent.timeout_ms': timeout,
      'agent.max_tokens': maxTokens,
      'agent.input_hash': hashInput(input), // For caching
    },
  });

  // Check for cached results (e.g., voice profiles)
  if (agentName === 'instagram-voice-profiler') {
    const cacheKey = generateCacheKey(input);
    const cachedProfile = await loadCachedVoiceProfile(cacheKey);

    if (cachedProfile) {
      span.setAttribute('agent.cache_hit', true);
      span.end();
      return { cached: true, result: cachedProfile };
    } else {
      span.setAttribute('agent.cache_hit', false);
    }
  }

  context.agentSpan = span;
  return { cached: false };
}

function hashInput(input) {
  // Generate deterministic hash for input (for cache key)
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
}

function generateCacheKey(input) {
  // Extract Instagram handles and locale for cache key
  const handles = input.handles.sort().join(',');
  const locale = input.locale;
  return `voice-profile:${handles}:${locale}`;
}

async function loadCachedVoiceProfile(cacheKey) {
  const cachePath = `${process.env.HOME}/.claude/telemetry/voice-profiles/${cacheKey}.json`;
  try {
    const fs = require('fs').promises;
    const content = await fs.readFile(cachePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    return null; // Cache miss
  }
}
```

### New Hook: Agent Complete (`/Users/alyshialedlie/.claude/hooks/dist/handlers/agent-complete.js`)

```javascript
// Emit completion telemetry for specialized agents
// Records token usage, duration, success/failure

export async function handleAgentComplete(context) {
  const { agentName, result, error, tokenUsage, duration } = context;

  const span = context.agentSpan;

  if (error) {
    span.setAttribute('agent.success', false);
    span.setAttribute('agent.error', error.message);
    span.setStatus({ code: 2, message: error.message }); // ERROR status
  } else {
    span.setAttribute('agent.success', true);
  }

  span.setAttribute('agent.tokens.input', tokenUsage.input);
  span.setAttribute('agent.tokens.output', tokenUsage.output);
  span.setAttribute('agent.tokens.total', tokenUsage.total);
  span.setAttribute('agent.duration_ms', duration);

  // Record metrics
  context.telemetry.recordHistogram('agent.duration', duration, {
    'agent.name': agentName,
  });

  context.telemetry.recordCounter('agent.tokens.total', tokenUsage.total, {
    'agent.name': agentName,
  });

  // Cache voice profiles
  if (agentName === 'instagram-voice-profiler' && result && !error) {
    const cacheKey = generateCacheKey(context.input);
    await cacheVoiceProfile(cacheKey, result);
    span.setAttribute('agent.cached', true);
  }

  span.end();
}

function generateCacheKey(input) {
  // Same as agent-start.js
  const handles = input.handles.sort().join(',');
  const locale = input.locale;
  return `voice-profile:${handles}:${locale}`;
}

async function cacheVoiceProfile(cacheKey, profile) {
  const cacheDir = `${process.env.HOME}/.claude/telemetry/voice-profiles`;
  const cachePath = `${cacheDir}/${cacheKey}.json`;

  const fs = require('fs').promises;
  await fs.mkdir(cacheDir, { recursive: true });
  await fs.writeFile(cachePath, JSON.stringify(profile, null, 2));
}
```

---

## Implementation Roadmap

### Phase 1: Agent Development (Week 1-2)

- [ ] **Day 1-2:** Implement Instagram Voice Profiler
  - Create agent config at `~/.claude/agents/instagram-voice-profiler.md`
  - Implement WebFetch scraping with exponential backoff
  - Create voice analysis prompt templates
  - Test with E&N Instagram accounts
  - Validate JSON output schema

- [ ] **Day 3-5:** Implement Portuguese Translator
  - Create agent config at `~/.claude/agents/portuguese-translator.md`
  - Implement HTML chunking logic (parse by `<h2>` sections)
  - Create translation prompt with voice profile injection
  - Implement quality gates (faithfulness, preservation, structure)
  - Test with E&N source documents

- [ ] **Day 6-8:** Implement Voice Style Matcher
  - Create agent config at `~/.claude/agents/voice-style-matcher.md`
  - Implement 4 dimension evaluation prompts (G-Eval pattern)
  - Create composite score calculator
  - Implement hallucination detection logic
  - Test with E&N translations

- [ ] **Day 9-10:** Pipeline Integration
  - Create pipeline orchestration script (`translate-with-voice-matching.sh`)
  - Test end-to-end pipeline with E&N reports
  - Validate token usage vs projections
  - Document pipeline execution

### Phase 2: Hook Instrumentation (Week 2-3)

- [ ] **Day 11-12:** Agent Start Hook
  - Implement `agent-start.js` at `~/.claude/hooks/dist/handlers/`
  - Add voice profile cache lookup
  - Test cache hit/miss behavior
  - Validate telemetry span emission

- [ ] **Day 13-14:** Agent Complete Hook
  - Implement `agent-complete.js` at `~/.claude/hooks/dist/handlers/`
  - Add voice profile caching logic
  - Record token usage and duration metrics
  - Test telemetry export to SigNoz

### Phase 3: Validation & Optimization (Week 3-4)

- [ ] **Day 15-16:** Token Budget Validation
  - Run pipeline with E&N reports
  - Measure actual token usage vs projections (target: < 160K tokens)
  - Identify optimization opportunities
  - Document actual vs projected costs

- [ ] **Day 17-18:** Quality Metrics Validation
  - Run existing LLM-as-Judge evaluations on pipeline output
  - Validate voice match scores correlate with human judgment
  - Test hallucination detection accuracy
  - Document quality improvements vs original session

- [ ] **Day 19-20:** Performance Testing
  - Measure wall-clock time vs target (45 minutes)
  - Test pipeline with different document sizes
  - Validate timeout behavior (10 min per translation)
  - Document performance characteristics

### Phase 4: Documentation & Rollout (Week 4)

- [ ] **Day 21-22:** Documentation
  - Create agent usage guide
  - Document pipeline integration patterns
  - Add troubleshooting section
  - Create example voice match reports

- [ ] **Day 23-24:** Rollout
  - Deploy agents to production (`~/.claude/agents/`)
  - Deploy hooks to production (`~/.claude/hooks/dist/handlers/`)
  - Update observability dashboard with new metrics
  - Train users on pipeline usage

---

## Success Criteria

### Token Efficiency

- [ ] Total token usage < 160K per 3-document session (vs 1.75M original)
- [ ] Voice profile extraction < 11K tokens (vs unknown original)
- [ ] Translation < 50K tokens per document (vs ~580K original)
- [ ] Voice matching < 24K tokens per document (new capability)

### Time Efficiency

- [ ] Total wall-clock time < 60 minutes (vs 8.6 hours original)
- [ ] Voice profile extraction < 10 minutes
- [ ] Translation < 10 minutes per document
- [ ] Voice matching < 5 minutes per document

### Quality Improvements

- [ ] Voice match score > 0.85 (new metric, not present in original)
- [ ] Faithfulness score > 0.94 (maintain or improve vs 0.94 original)
- [ ] Coherence score > 0.94 (improve vs 0.93 original)
- [ ] Hallucination score < 0.02 (improve vs 0.03 original)
- [ ] Task completion score = 1.00 (improve vs 0.83 warning original)

### Operational Improvements

- [ ] Task management overhead = 0% (vs 63% original)
- [ ] Source document reads = 3 (one per document, vs 1 total original)
- [ ] Instagram accounts scraped = 3 (vs 2 original)
- [ ] Context peak utilization < 20% (vs 59.3% original)
- [ ] Zero context overflow bugs (vs 172% overflow original)

---

## Risk Mitigation

### Risk: Instagram Rate Limiting

**Likelihood:** High (already happened in original session)
**Impact:** Voice profiler fails, blocking entire pipeline
**Mitigation:**
- Implement exponential backoff (5s → 10s → 20s)
- Cache voice profiles for 30 days (Instagram voices change slowly)
- Add fallback: allow manual voice profile upload
- Monitor rate limit errors in telemetry

### Risk: Translation Quality Regression

**Likelihood:** Medium (new chunking strategy could introduce errors)
**Impact:** Translations don't pass quality gates, manual review required
**Mitigation:**
- Implement strict quality gates (faithfulness, preservation, structure)
- Run LLM-as-Judge evaluations on pipeline output
- Test with E&N reports before production rollout
- Maintain human-in-the-loop review for first 10 translations

### Risk: Voice Matching False Negatives

**Likelihood:** Medium (voice match scoring is subjective)
**Impact:** Good translations rejected, requiring unnecessary revisions
**Mitigation:**
- Set voice match threshold at 0.85 (not 0.90)
- Provide actionable feedback for revisions
- Allow manual override with user approval
- Collect feedback to tune voice match rubrics

### Risk: Agent Timeout Failures

**Likelihood:** Low (well-scoped agents with clear timeouts)
**Impact:** Partial translations, wasted API costs
**Mitigation:**
- Set aggressive timeouts (10 min per translation)
- Implement progress checkpoints (save intermediate results)
- Monitor agent duration in telemetry
- Alert on timeout trends

---

## Appendix: Post-Mortem Cross-Reference

This implementation plan directly addresses the issues identified in the [Translation Session Post-Mortem](/reports/2026-02-13-edgar-nadyne-translation-session-telemetry/):

| Post-Mortem Finding | Agent Solution | Expected Improvement |
|---------------------|----------------|---------------------|
| **Token waste:** 1.75M tokens, 998:1 input-to-output ratio | Chunked translation, isolated agent contexts | 91% token reduction (1.75M → 160K) |
| **Task overhead:** 63% of tool calls were TaskCreate/TaskUpdate | Agents handle work internally, zero task management | 100% overhead elimination |
| **Insufficient reads:** Only 1 Read call for 3 documents | Portuguese Translator reads each source once | 3 Read calls (one per document) |
| **Incomplete scraping:** Only 2 of 3 Instagram accounts scraped | Instagram Voice Profiler validates all accounts | 3 accounts scraped with validation |
| **Coherence at 0.93:** Lowest content metric, voice fidelity unclear | Voice Style Matcher adds dedicated voice match score | New metric: voice match > 0.85 |
| **Hallucination:** Artist Profile had 0.05 score (2.5x baseline) | Voice Style Matcher detects unauthorized additions | Hallucination detection gate |
| **Context overflow:** 59.3% peak, forced compaction | Agents use isolated sub-50K contexts | Context utilization < 20% |
| **8.6 hours wall-clock:** Massive idle time | Agents complete in < 60 minutes total | 91% time reduction |
| **Broken research agent:** Failed after 29 seconds due to rate limit | Instagram Voice Profiler has exponential backoff | Resilient rate limit handling |

---

## Next Steps

1. **Review this implementation plan** with stakeholders and Claude Code team
2. **Prioritize Phase 1** (Agent Development) for immediate action
3. **Assign implementation tasks** to team members
4. **Schedule weekly check-ins** to track progress against roadmap
5. **Test agents with E&N reports** before production rollout
6. **Update observability dashboard** to track new metrics (voice match score, agent duration, token usage by agent)

---

*This implementation plan was created on February 14, 2026 in response to performance issues documented in the [Translation Session Post-Mortem](/reports/2026-02-13-edgar-nadyne-translation-session-telemetry/). The proposed agents target 91% token reduction, 91% time reduction, and new voice fidelity validation capabilities.*
