---
layout: single
title: "My Pricing Table Was About to Lie to Me"
date: 2026-10-05
author_profile: true
categories: [engineering, observability]
tags: [opentelemetry, pricing, staleness, data-freshness]
excerpt: "I checked a batch of AI model prices this morning. In six weeks, my own tool would have called them stale. Here's why, and what the industry standard says about it (nothing)."
---

I checked a batch of AI model prices this morning. In six weeks, my own tool would have told me they were out of date.

That's a particular flavor of bug I find deeply annoying: the technically-correct lie.

## The Milk Carton Problem

Imagine a grocery store that stamps every milk carton with the date the fridge was installed. The stamp is accurate. It's just answering the wrong question.

My observability toolkit had that problem with prices. It keeps a table of what 65 AI models charge per million tokens (a token is roughly three-quarters of a word), and its cost tools use that table to estimate what your AI usage costs. The table has one date on it: 13 August.

Before reporting a cost, the tools check that date. If it's more than 90 days old, they add a warning:

> Pricing data is 91 days old (last updated: 2026-08-13).

This morning I added ten new rows, priced from rates published today. Nine are OpenAI "snapshots", frozen versions of a model that each carry their own price. The tenth is an alias, a short name for one of Anthropic's Claude models.

The tools had no idea those rows were new. From 12 November, every cost result would have carried that warning, including results priced entirely from this morning's rates. And the warning would have named 13 August, a date those rows never had.

## The Fix

Each row should know when *it* was last checked.

And a warning about a result should look only at the prices that result actually used. If any of them is old, it should measure from the oldest one, because that's the price most likely to be wrong.

## I Went Looking for the Industry Standard

Before building anything, I wanted to know whether a convention already existed. OpenTelemetry (OTel) is the open standard for recording what software does: traces, metrics, logs and, increasingly, how AI models get used. If anyone had defined how fresh pricing data should be, it would be there.

I searched both of its "semantic conventions" repositories, the shared vocabulary OTel tools agree on. Here's what they define about pricing:

- **No price data.** Nowhere to record what a model costs.
- **No cost attribute.** No standard field for "this request cost $0.04".
- **No freshness rule.** Nothing on how old a price may be.

The closest thing I found was one line in the token-metrics docs. It says token counts "serve as a proxy for cost approximation." In plain terms: OTel will count your tokens, and leave the price list to you.

There's one more rule nearby. When a provider reports both the tokens you used and the tokens you're billed for, OTel says to report the billed ones.

That's it.

**The standard doesn't exist.** How fresh your prices need to be, how you track that and when you warn are all your call. The 90-day threshold in my toolkit isn't a convention; it's a number the project chose. I added a comment to the code saying exactly that, with links to those passages, so nobody (including future me) mistakes it for a rule.

I find that kind of discovery genuinely useful, even when the answer is "you're on your own." Better to know now than to build something and later find a standard I'd missed.

## The Implementation

Three changes, none of them complicated:

**1. A date on every row that needs one.** Each price can now carry its own "verified on" date. Today's ten rows have one. Every other row still uses the table's 13 August date.

**2. A smarter check.** The staleness check now takes the list of models a result used and measures from the oldest date among them. It skips models it doesn't know. If it knows none of them, or gets no list, it checks the whole table.

**3. Wiring.** Each of the three cost tools now tells the check which models it priced. One line each.

So a result priced only from today's rows stays fresh until 4 January. A result that mixes old and new rows is measured from the oldest one. And the warning names the date of the prices that produced the number.

## Testing It Properly

The tests don't use today's date. They set the clock to fixed days, so they can test the future.

The key case is 12 November. On that day, the old check would call this morning's prices 91 days old and stale. The new check says 38 days, and fresh.

Then I ran what's called a positive control: I broke the code on purpose, to prove the tests would notice. I made the check ignore its list of models. Exactly three tests failed, the three that depend on that list. The tests that expect a whole-table answer kept passing, as they should.

Green tests against broken code are a much scarier failure than red tests against working code. A positive control is how you find out which one you have.

After the fix, all of the project's roughly 5,600 automated tests passed.

## The Bigger Thing

There's a pattern I keep running into in observability work: measuring what's *available* instead of what's *relevant*.

A table-wide "last updated" date is available. It's easy to grab and cheap to check. And it produces a warning that *looks* right until you look closely.

The right question isn't "when was this table last touched?" It's "when were the prices I'm actually using last checked?" Those are different questions. Treat them as one and you get a warning that's technically true and practically misleading.

The fix was small: a field, a refactor, three lines of wiring. The harder part was asking the precise question in the first place.

**So here's my suggestion:** pick one "last updated" date on a dashboard or report you rely on, and ask what it's actually dating. Is it the thing you care about, or the fridge?

---

*This work is committed to [observability-toolkit](https://github.com/integritystudio) for its upcoming v4.0.0 release. The full technical write-up is in the [session report](/reports/2026-otel-semconv-pricing-staleness/).*
