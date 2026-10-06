---
layout: single
title: "OpenTelemetry Semantic Conventions and Model Pricing Staleness Checks"
date: 2026-10-05
author_profile: true
categories: [observability, semantic-conventions]
tags: [opentelemetry, pricing, model-routing, staleness-detection, test-coverage]
excerpt: "OTel semconv says nothing about how fresh model pricing must be, so the toolkit's 90-day threshold is now documented as local policy, and the staleness check measures only the prices a result actually used."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
permalink: /reports/2026-otel-semconv-pricing-staleness/
---

**Session Date**: 2026-10-05<br>
**Project**: observability-toolkit<br>
**Focus**: What OTel semconv says about pricing, how pricing staleness is checked, and how that is tested<br>
**Session Type**: Implementation

## Executive Summary

**OTel has no rule for how old a model price may be.** Neither pinned semantic conventions repository defines pricing data, a cost attribute or a freshness window. Only two passages touch cost: token usage counters are "a proxy for cost approximation", and instrumentation must report billable token counts. The toolkit's 90-day threshold is therefore its own policy, and the source now says so next to the number.

The staleness check changed in two steps. Each pricing row gained an optional `verifiedAt` date, which the 10 rows checked on 2026-10-05 carry. Then `checkPricingStaleness` began measuring age from the oldest date among the models a result actually priced, instead of the table-wide `lastUpdated`. All three cost tools now pass in the models they priced.

The two steps added 20 constants tests (15 for the dates, 5 for the scoping), two `isPricingStale` tests and one call-argument check in `query-metrics`. For each step, a positive control (breaking the code on purpose to confirm the tests notice) failed exactly the predicted tests: 11 for the dates, 3 for the scoping.

| Metric | Value |
|--------|-------|
| Pricing references found in OTel semconv | 0 definitions, 2 relevant passages |
| Pricing rows | 65, of which 10 carry `verifiedAt: 2026-10-05` |
| Constants tests | 70 → 89 (`ee34446e`: 15 `verifiedAt` + 4 alias-pricing) → 94 (`f33a0133`: 5 scoped) |
| Other new tests | 2 in `cost-estimation.test.ts`, 1 assertion in `query-metrics.test.ts` |
| Positive controls | 11/11 and 3/3 predicted failures |
| Full suites | vitest 4,886 passed; node:test 708/708 |
| Commits | `ee34446e`, `00335a95` (dates); `f33a0133`, `fd12f4a0` (scoping) |

---

## Problem Statement

Earlier the same day, nine dated OpenAI snapshots and the `claude-opus-4-1` alias entered the pricing table at prices checked on 2026-10-05. The table's only date was `MODEL_PRICING_METADATA.lastUpdated`, and a code comment was the only record of the October check.

The staleness check read only `lastUpdated`, so fresh rows aged with old ones:

| Date | Event |
|------|-------|
| 2026-08-13 | `lastUpdated`: the table's only date |
| 2026-10-05 | 10 rows priced from that day's published rates; the table is 53 days old and no warning fires |
| 2026-11-12 | Old check: every cost result warns "91 days old (last updated: 2026-08-13)", including results priced only from October rows |
| 2027-01-04 | New check: results priced only from October rows first go stale |

The 90-day threshold also had no recorded basis, so it was worth checking whether OpenTelemetry sets one.

---

## What OTel Semconv Says About Pricing

Searched for pricing, price, cost and staleness terms: [`semantic-conventions-genai@cb10b70c`](https://github.com/open-telemetry/semantic-conventions-genai/tree/cb10b70c15c099ccab144e8316d934c9699da0fd) and [`semantic-conventions@a5324fb0`](https://github.com/open-telemetry/semantic-conventions/tree/a5324fb0).

- **Neither repository defines pricing.** No price data, no cost attribute, no freshness window.
- **Usage counters are a cost proxy, not a cost.** The `gen_ai.client.inference.usage.*` counters "serve as a proxy for cost approximation", and the operation histograms "should not be used for total usage or cost calculations." ([`gen-ai-token-metrics.md` L32–43](https://github.com/open-telemetry/semantic-conventions-genai/blob/cb10b70c15c099ccab144e8316d934c9699da0fd/docs/gen-ai/gen-ai-token-metrics.md?plain=1#L32-L43))
- **Report billable tokens.** "When systems report both used tokens and billable tokens, instrumentation MUST report billable tokens." ([`token-metrics.yaml` L95](https://github.com/open-telemetry/semantic-conventions-genai/blob/cb10b70c15c099ccab144e8316d934c9699da0fd/model/gen-ai/token-metrics.yaml#L95))
- **Prices appear only as an example.** A non-normative design note mentions that Anthropic prices 5-minute and 1-hour cache writes differently, to explain why the cache-write counter can take a TTL attribute. ([`token-metrics-design.md` L93–97](https://github.com/open-telemetry/semantic-conventions-genai/blob/cb10b70c15c099ccab144e8316d934c9699da0fd/docs/gen-ai/non-normative/token-metrics-design.md?plain=1#L93-L97))

**Conclusion.** The conventions leave converting tokens to money, and deciding how old a price may be, to the consumer. The comment on `staleThresholdDays` (`src/lib/core/constants-models.ts:231-239`) now records this with pinned links, as does `docs/constants-and-conventions.md`.

---

## How the Staleness Check Works Now

### Per-row dates

`src/lib/core/constants-models.ts:27` adds an optional field to the pricing entry schema:

```typescript
verifiedAt: z.iso.date().optional(),
```

A row without it dates from `lastUpdated`. The 10 rows checked on 2026-10-05 reference one constant, `PRICING_VERIFIED_2026_10_05` (`:254`).

### Scoped check

`checkPricingStaleness` (`src/lib/core/constants-models.ts:270-283`):

```typescript
export function checkPricingStaleness(now: Date = new Date(), models?: readonly string[]): PricingStaleness {
  const known = (models ?? []).filter((model) => MODEL_PRICING[model] !== undefined);
  const checked = known.length > 0 ? known : Object.keys(MODEL_PRICING);
  // ISO calendar dates order lexically, so the smallest string is the oldest date
  const pricedAt = checked
    .map((model) => MODEL_PRICING[model]?.verifiedAt ?? MODEL_PRICING_METADATA.lastUpdated)
    .reduce((oldest, date) => (date < oldest ? date : oldest));
  const daysSinceUpdate = Math.floor((now.getTime() - new Date(pricedAt).getTime()) / TIME_MS.DAY);
  return {
    isStale: daysSinceUpdate > MODEL_PRICING_METADATA.staleThresholdDays,
    daysSinceUpdate,
    pricedAt,
  };
}
```

- A row's effective date is its `verifiedAt`, else `lastUpdated`.
- The check measures age from the oldest effective date among the models passed in, and returns that date as `pricedAt`.
- It ignores models missing from the table. If it knows none of them, or gets no list, it checks every row. Today that resolves to `lastUpdated`, because every `verifiedAt` is newer.

`isPricingStale(models)` (`src/lib/cost/cost-estimation.ts:316`) passes the list through and reports `pricedAt` as its `lastUpdated`, so the warning names the date of the prices in use.

### Callers

| Tool | Call | Models passed |
|------|------|---------------|
| `obs_query_metrics` | `src/tools/query-metrics.ts:123` | models it costed |
| `obs_estimate_cost` | `src/tools/estimate-cost.ts:135` | models it compares |
| `obs_context_stats` | `src/tools/context-stats.ts:255` | the session's model, else `DEFAULT_COST_MODEL` |

### Decision

- **Choice**: measure from the oldest date among the priced models.
- **Rationale**: a warning should describe the prices that produced the number, and the oldest one bounds how wrong it can be.
- **Alternative considered**: bump `lastUpdated` whenever any row is checked. That would mark unchecked rows as fresh.
- **Trade-off**: each tool must pass its model list; three one-line changes.

---

## How It Is Tested

The tests pin the clock to fixed dates through the injectable `now` parameter, so they can check behaviour weeks or months ahead without waiting for it.

### `verifiedAt` (`src/lib/core/constants.test.ts:205-244`, 15 tests)

- One test per stamped row asserts `verifiedAt` is `2026-10-05` (10 tests).
- One test fails if any row's `verifiedAt` is earlier than `lastUpdated`.
- The schema rejects `2026-13-45`, `05/10/2026` and `yesterday` (3 tests) and accepts an entry with no date (1 test).

**Positive control**: setting the date constant to `2026-08-01` failed exactly the 11 tests that read it (10 stamps plus the ordering check).

### Scoped staleness (`src/lib/core/constants.test.ts:398-440`, 5 tests)

| Test | Measured at | New check expects | Old check would say |
|------|-------------|-------------------|---------------------|
| Re-verified row from its own date | 2026-11-12 | 38 days, fresh, `pricedAt` 2026-10-05 | 91 days, stale |
| Same row once its own date passes 90 days | 2027-01-04 | 91 days, stale | 144 days, stale |
| Stamped and unstamped rows together | 2026-11-12 | 91 days, stale, `pricedAt` 2026-08-13 | 91 days, stale |
| Only an unknown model | 2026-11-12 | same as the whole-table check | 91 days, stale |
| Whole table | 2026-11-12 | `pricedAt` 2026-08-13 | 91 days, stale |

Only the first row separates the two checks. The others guard the fallbacks, so a fix for the first case can't silently change them.

### Wiring

- `src/lib/cost/cost-estimation.test.ts:327-335`: `isPricingStale()` reports `lastUpdated` with no models, and `2026-10-05` for `gpt-4o-2024-08-06`.
- `src/tools/query-metrics.test.ts:554`: the existing stale-warning test now also asserts `isPricingStale` received `[['claude-haiku-4-5']]`, the model it costed.

**Positive control**: making the check ignore its model list failed exactly 3 tests: the first two scoped cases and the `gpt-4o-2024-08-06` case in `cost-estimation.test.ts`. The mixed, unknown-model and whole-table cases still passed, as they should, because they expect the whole-table result. That break leaves the call arguments unchanged, so the `query-metrics` assertion also passed.

### Full verification

```
Test Files  136 passed (136)
     Tests  4886 passed | 4 skipped (4890)
ℹ pass 708
ℹ fail 0
```

`tsc --noEmit`, eslint (0 errors), `check:dedup` (duplicate-constant guard) and `verify-docs` all exited 0.

---

## Commits

- **`ee34446e`** feat(core): stamp re-verified pricing rows and price the opus 4.1 alias (+77 / −11; includes 4 alias-pricing tests)
- **`00335a95`** docs: document per-row verifiedAt and the opus 4.1 alias (+4 / −3)
- **`f33a0133`** feat: judge pricing staleness on the models actually priced (+98 / −16 across 8 files)
- **`fd12f4a0`** docs: record per-row pricing staleness and the semconv finding (+14 / −2)

The commits are on `main` and not yet pushed. The 4.0.0 changelog entries are `PRICING-DATED-SNAPSHOTS` (per-row dates) and `PRICING-STALENESS-PER-ROW` (scoping).

---

## References

- OTel GenAI semconv, pinned [`cb10b70c`](https://github.com/open-telemetry/semantic-conventions-genai/tree/cb10b70c15c099ccab144e8316d934c9699da0fd): `docs/gen-ai/gen-ai-token-metrics.md` L32–43; `model/gen-ai/token-metrics.yaml` L95; `docs/gen-ai/non-normative/token-metrics-design.md` L93–97
- OTel semconv, pinned [`a5324fb0`](https://github.com/open-telemetry/semantic-conventions/tree/a5324fb0)
- Source: `src/lib/core/constants-models.ts:27`, `:231-239`, `:254`, `:270-283`; `src/lib/cost/cost-estimation.ts:316`
- Tests: `src/lib/core/constants.test.ts:205-244`, `:398-440`; `src/lib/cost/cost-estimation.test.ts:327-335`; `src/tools/query-metrics.test.ts:554`
- Docs: `docs/constants-and-conventions.md`; `docs/changelog/4.0.0/CHANGELOG.md`
- Companion post: [My Pricing Table Was About to Lie to Me]({% post_url 2026-10-05-when-last-updated-isnt-enough %})

---

## Appendix: Readability Analysis

Readability metrics computed with [textstat](https://github.com/textstat/textstat) on the report body (frontmatter, code blocks, and markdown syntax excluded).

### Scores

| Metric | Score | Notes |
|--------|-------|-------|
| Flesch Reading Ease | 63.4 | 0–30 very difficult, 60–70 standard, 90–100 very easy |
| Flesch-Kincaid Grade | 9.2 | US school grade level (High School) |
| Gunning Fog Index | 11.3 | Years of formal education needed |
| SMOG Index | 11.0 | Grade level (requires 30+ sentences) |
| Coleman-Liau Index | 10.6 | Grade level via character counts |
| Automated Readability Index | 9.6 | Grade level via characters/words |
| Dale-Chall Score | 12.19 | <5 = 5th grade, >9 = college |
| Linsear Write | 13.0 | Grade level |
| Text Standard (consensus) | 10th and 11th grade | Estimated US grade level |

### Corpus Stats

| Measure | Value |
|---------|-------|
| Word count | 1,063 |
| Sentence count | 55 |
| Syllable count | 1,556 |
| Avg words per sentence | 19.3 |
| Avg syllables per word | 1.46 |
| Difficult words | 179 |
