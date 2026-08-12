---
layout: single
title: "Your Eval Data Is Lying to You (and It's Your Fault)"
date: 2026-05-16
author_profile: true
tags: [opentelemetry, observability, llm-as-judge, quality-metrics, classification, schema-org]
excerpt: "Label rot is silent, structural, and more common than you think. Here's how three triage passes cleaned up a schema classification test set — and why guarding already-confident labels is the hardest part."
---

A test set is a promise. It says: when you run your model against these inputs and measure it against these labels, the score you get is real. It says the labels were right when someone wrote them, and they're still right now.

That second part is where most evaluation pipelines quietly fall apart.

I spent a session this month fixing label rot in the [schema-org-file-system](https://github.com/integritystudio/schema-org-file-system) evaluation data — a set of files used to check whether a file classifier puts things in the right category. Some of those files had landed in `uncategorized` or `media` during a prior production run, even when their filepath made the correct answer obvious. A file path with `sprites/` in the directory tree is almost certainly a sprite. A file named `screenshot_2024_03_15.png` is not ambiguous. The classifier missed them; the test set kept the wrong labels; every evaluation run since then was measuring against corrupted ground truth.

Nobody noticed, because corrupted ground truth looks exactly like correct ground truth until you go looking.

## What Label Rot Actually Is

Label rot isn't mislabeling at write time. It's what happens when a label assignment process has gaps, and those gaps accumulate silently in your data.

In this case, the schema-org-file-system classifier runs triage passes — sequential filters that look at filepath signals to assign a category. The existing passes covered a lot of ground but missed a specific pattern: files that ended up in `uncategorized` because their filepath signals weren't being checked at all. The classifier didn't choose wrong. It just ran out of passes before it reached the right one.

That's a subtle distinction. When a model makes a wrong prediction, you can measure it, track it, address it. When your *evaluation data* has wrong labels, every metric you compute is now reporting on the wrong thing. Your system could be improving while your scores hold flat — or vice versa.

## Three Passes, Three Signal Types

The fix was surgical. Three new triage passes (3–5) added to [`relabel_test_set.py`](https://github.com/integritystudio/schema-org-file-system/blob/main/scripts/relabel_test_set.py), each targeting a specific filepath signal:

- **Pass 3** targets sprite vocabulary: directory names and filename fragments that reliably indicate asset sprites (`_SPRITE_KEYWORD_SET`).
- **Pass 4** targets screenshot patterns: regex matching the date-stamped naming conventions that screenshot tools produce (`_SCREENSHOT_RE`).
- **Pass 5** targets document semantics: a mapping from filename patterns to document-type labels (`_DOCUMENT_LABEL_MAP`).

None of these are novel ideas. They're the kind of rules any experienced engineer would write in the first pass — except they weren't, and the gap cost several evaluation cycles of signal quality before anyone caught it.

What's more interesting than the passes themselves is the guard that wraps all of them.

## The Hard Part: Not Breaking What's Already Right

The most technically precise piece of the fix is `_RELABEL_ELIGIBLE_CATEGORIES = frozenset({'uncategorized', 'media'})`.

A triage pass that can overwrite any label is dangerous. Some files in the test set already have confident, correct labels assigned by a model or a human reviewer. A filepath-signal pass should never touch those — it has less information than the process that produced the existing label. The guard enforces exactly that: a triage pass can only apply to files currently sitting in `uncategorized` or `media`, the two categories that signal genuine uncertainty. Everything else is out of bounds.

This matters because the failure mode without the guard is subtle. If Pass 3 can overwrite a label that a more sophisticated classifier already set correctly, you've degraded your data while thinking you improved it. You've introduced rot in the act of cleaning it.

The pattern generalizes: any automated correction system needs a defined scope of what it's allowed to touch, and that scope should be conservative. Fixing known unknowns shouldn't risk disturbing known knowns.

## How We Knew It Worked

The session was evaluated using LLM-as-Judge — a pattern where a separate model reads the outputs and scores along four criteria: relevance, faithfulness, coherence, and hallucination. The two modified files (`relabel_test_set.py` and the documentation) scored 0.97 on relevance, 0.97 on faithfulness, 0.95 on coherence, and 0.02 on hallucination.

The one borderline flag was `_TRIAGE_PATH_FRAGMENTS` — a complementary check that inspects the full filepath string when `parent_folder` metadata isn't present. The judge flagged it as potentially invented. It isn't: it's a defensive implementation detail that handles a real edge case where a file exists in the data without a normalized `parent_folder` field. But the flag is fair, because the code didn't make that context explicit in the docstring. That's a legibility debt that the evaluation caught before it became a confusion debt downstream.

Tool accuracy was 1.0 — five tool calls, five successes. Token use was dominated by cache reads (474,339 cached tokens, 2,644 generated), which is the expected signature of a focused expansion session: load the codebase once, then work within an established pattern.

## The Structural Point

Label rot in evaluation data is a confidence problem before it's a quality problem. The labels look right. The format is correct. The pipeline runs cleanly. Nothing raises an error, because the error isn't computational — it's semantic. A file is in the wrong bucket and the system has no mechanism to notice.

The fix here was three passes and a guard. The broader fix is building triage passes that are *legible about their scope* from the start: what signals they use, what categories they're allowed to touch, and what they defer to when they're uncertain. A pass that says "I only touch uncategorized files, and only when I see a filepath I recognize" is self-limiting in a useful way. It documents its own failure modes.

That's what you want from an automated correction system. Not ambition. Precision about what it knows and honesty about what it doesn't.

*The full session report — per-pass detail, the complete quality scorecard, and the telemetry — is [here](/reports/2026-05-16-relabel-triage-passes-schema-org-file-system/).*
