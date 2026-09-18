---
layout: single
title: "Auditing a Self-Optimization Roadmap Against 2026 Practice: From Side-Policy PPO to Hosted-Model Levers"
date: 2026-09-18
author_profile: true
categories: [architecture-review, llm-engineering, documentation]
tags: [opentelemetry, genai-semconv, reinforcement-learning, reward-hacking, evolutionary-search, web-research, repomix, pandoc, technical-writing]
excerpt: "A research-verified audit of a 980-line agent self-optimization design found 8 of 20 external claims contradicted and an RL layer that could not run on the library it named. The document was revised to v1.2, committed, and rendered to a 26-page PDF."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
permalink: /reports/aso-roadmap-audit-revision/
---

**Session Date**: 2026-09-17 to 2026-09-18<br>
**Project**: claude-dev-environment (`~/.claude`)<br>
**Focus**: Audit and revision of `docs/roadmap/AGENTIC_SELF_OPTIMIZATION_ARCHITECTURE.md` against September 2026 best practice<br>
**Session Type**: Architecture Review and Documentation Revision

## Executive Summary

The session began as a routine repository pack and ended with a research-verified rewrite of a design document. Running `npm run repomix` produced seven artifacts totalling 2.63 million tokens and exposed that an untracked `skills/synced/` directory accounted for 43% of the pack. Scanning the docs-only pack then surfaced the roadmap documents, and the user asked for an audit of the largest design spec: a 980-line architecture for training agents to write longer-lived code, using 21-day code survival as a reinforcement learning reward.

A web-research subagent verified 20 externally checkable claims against primary sources. Eight were contradicted, five held only partially, and seven were confirmed. The two decisive findings were structural. First, the RL layer trained a 64x64 MLP with PPO but never connected that policy to anything the hosted model emits, so it could not change the agent's behaviour even if it had trained. Second, the code could not run on Stable Baselines3 as written: a Dict observation space needs `MultiInputPolicy`, and no SB3 algorithm supports a Dict action space at all. Repo-side cross-checks found the document's self-reported status accurate, with 0 survival spans across 152 trace files.

The document was revised to v1.2 in four scripted passes with assert-exactly-once replacements: 415 insertions, 425 deletions. Sections 4 and 5 were rewritten around the optimization surface a hosted model actually exposes (manifests, skills, injected context, harness gates), with 21-day survival retained as Tier 3 fitness in the sibling document's three-tier scheme. Six OpenTelemetry claims were corrected, the survival measurement was aligned with the source paper's content-tracking method, and eleven text defects were fixed. The result was committed as `070aac49` and rendered to a 26-page PDF.

## Key Metrics

| Metric | Value |
|--------|-------|
| External claims verified by research agent | 20 |
| Contradicted / partially confirmed / confirmed | 8 / 5 / 7 |
| Research agent cost | 43 tool uses, 118,006 tokens, 312 s |
| Document size before / after | 980 / 970 lines |
| Diff | 415 insertions, 425 deletions |
| Sections renumbered | 0 (all external §-references still resolve) |
| Text defects fixed | 11 |
| Live `code-survival-checkpoint` spans (recount) | 0 across 152 trace files |
| Repomix pack | 700 files, 2,633,652 tokens |
| Share of pack from untracked `skills/synced/` | 1,130,047 tokens (43%) |
| PDF output | 26 pages, 308 KB |
| Commits | 1 (`070aac49`) |

## Problem Statement

The architecture document dated April 2026 proposed converting the churn metrics from Popescu et al. (arXiv 2604.00917) into RL reward signals, training per-skill PPO policies via Stable Baselines3, and deploying improved policies behind a canary. It had been revised twice for OTel semantic-convention alignment and reclassified in August as an unbuilt research specification. No one had checked its technical claims against current practice, and a companion plan (`AA3`) had just been gated on this document's Phase 1.

Three risks made an audit worth doing before any Phase 1 work started:

1. **Spec drift.** The document pinned GenAI semantic conventions at "v1.42.0" and asserted that no registered `gen_ai.agent.version` existed. Both claims were dated June 2026 and the conventions had been moving.
2. **Paradigm mismatch.** By mid-2026 every credible RL-for-code result trained the language model's own weights. A design that trained a side network for a hosted model whose weights are not accessible needed either a justification or a rewrite.
3. **Gameable reward.** The reward function combined survival, churn, merge speed, task completion and change size as weighted terms. Reward-hacking research from 2025 warns specifically against thin social proxies of this kind.

The user's request was to audit against "best practices as of September 2027". Since the session ran on 2026-09-17 and web research can only confirm the present, the audit treated this as September 2026 and said so up front.

## Approach

### Phase 1: Repository pack and document inventory

`npm run repomix` ran cleanly and wrote seven artifacts to `docs/repomix/`. The token tree showed the pack dominated by vendored Office XML schemas under `skills/synced/`, an untracked directory neither gitignored nor in the repomix ignore list. The same 74,717-token `sml.xsd` appeared three times. This was reported with a one-line fix (add `skills/synced/**` to `customPatterns`) but not applied, since the request was only to run the pack.

The docs-only pack held 12 Markdown files. Its selection rule (`scripts/repomix/repomix-docs.config.json`) deliberately excludes `BACKLOG.md`, `CHANGELOG.md`, `changelog/`, `archive/` and `reviews/`. A heading extractor over the XML produced a per-document outline, which is how the five roadmap documents came into view.

### Phase 2: Parallel audit

The audit split into two independent tracks:

- **External claims** went to the `web-research-analyst` agent with a 13-item brief: the Popescu paper's existence and quoted figures, the GenAI semconv state, registered metric names, `vcs.*` and `code.*` stability, Prometheus OTLP translation, the spanmetrics connector, SB3 and Gymnasium and PufferLib versions and capabilities, the state of RL-for-code, reward-hacking literature, Anthropic's published agent guidance, and delayed-reward credit assignment.
- **Repo-facing claims** were checked locally while the agent ran: the agent-auditor Q5 query and D7 scoring spec against the span schema, the `DECISIONS.md` row governing both roadmaps, the AA3 gates, the installed semconv package exports, the hooks' metric constants, and a live recount of survival spans.

### Phase 3: Scripted revision

Rather than hand-editing a 980-line file, the revision ran as four Python passes over the file, each a sequence of `replace_once(old, new)` calls that assert the old text occurs exactly once before substituting. Sections 4 and 5 were replaced wholesale by slicing between their headings. This kept every edit reviewable in the diff and made a partial or double application impossible.

## Findings

### Contradicted claims

| # | Claim in document | Finding | Source |
|---|---|---|---|
| 1 | Reuse SB3 `MlpPolicy` with a Dict observation space | SB3 requires `MultiInputPolicy` for Dict observations | SB3 docs, issues #444, #1713 |
| 2 | PPO over a Dict action space | No SB3 algorithm supports Dict action spaces | SB3 algorithms table |
| 3 | A side MLP policy improves a coding agent | No 2025-2026 system does this; SOTA trains model weights via GRPO/RLVR | SWE-RL 2502.18449, DeepSeek-R1 2501.12948 |
| 4 | "No registered `gen_ai.agent.version`" | Registered; Conditionally Required on `invoke_agent` spans; exported by installed semconv 1.43.0 | semantic-conventions-genai agent spans |
| 5 | `vcs.*` keys are Development tier | They are Release Candidate | `model/vcs/registry.yaml` |
| 6 | Prometheus mapping is dots-to-underscores | That is the default strategy `UnderscoreEscapingWithSuffixes`; `NoTranslation` and `NoUTF8EscapingWithSuffixes` preserve dots | Prometheus OTLP guide |
| 7 | spanmetrics can derive the survival histogram | Alpha; emits only R.E.D. metrics with attributes as labels, never as values | connector README |
| 8 | Survival measured with `git blame` | Paper tracks added lines by content through diffs to the nearest subsequent commit | Popescu et al. §3.2 |

### Partially confirmed

- **Popescu et al. figures** all matched, including the 3-day, 7-day and 21-day windows the paper actually uses. The paper studies five agents; the document omitted Jules.
- **The semconv pin** "v1.42.0" is a real release, but it is the release that moved all `gen_ai.*` content out of the core repo into `semantic-conventions-genai`, which has no versioned release of its own. Pinning v1.42.0 therefore pins nothing about `gen_ai.*`. The same wording appears in `PERFORMANCE_PROFILE.md` and `SESSION_HISTORY.md`.
- **`gen_ai.invoke_agent.duration` and `gen_ai.execute_tool.duration`** are registered histograms. An interim local check had flagged them because the installed JavaScript package exports no constants for them; the spec confirmed them and the interim note was withdrawn. The repo's `hooks/lib/constants.ts:349-358` cites both correctly.

### Confirmed

Span-name template, `gen_ai.provider.name`, the `gen_ai.tool.type` enum incompatibility, the Stable source-location-only `code.*` namespace, SB3 2.9.0 maintained, PufferLib 3.x as an SB3 complement, Gymnasium 1.3.0, and the document's own status sections. The Q5 query at `agents/resources/agent-auditor-telemetry-queries.md:293-318` and the D7 withdrawal rule at `agents/resources/agent-auditor-scoring-spec.md:74-145` both match the span schema exactly.

### Text defects

Section 8 twice pointed to instruments "defined in §2" that live in §3. The reward function used an undefined `task_success`. The delayed-reward pseudocode accumulated into an undefined `loss` and mixed `torch` with `th`. The feedback collector used `Set` without importing it. The scheduler decorator `day_of_week=3` runs weekly on Thursday, not "every 3 days" as commented. The `gamma=0.99` comment claimed to account for a 21-day wall-clock delay. Three citations pointed to a "Whitepaper" absent from the references, later identified as Paper 1 of a three-paper series that is not filed in the repository. "SurveyL2" appeared once and nowhere else. Examples named a Sonnet 4.6 model and used the GPT-2 vocabulary size for a Claude agent.

## Implementation Details

### Section 4: Optimization Surface and Fitness Signal

The new §4 (`AGENTIC_SELF_OPTIMIZATION_ARCHITECTURE.md:326-424`) opens by recording the withdrawal as a decision with its three verified grounds, then defines the candidate unit:

| Lever | Where it lives |
|---|---|
| Agent manifest | `agents/*.md`, `lazy-agents/*.md`, `skills/*/agents/*.md` |
| Skill instructions | `skills/*/SKILL.md` + `skills/skill-rules.json` |
| Injected context | `CLAUDE.md`; hook output at `SessionStart` / `UserPromptSubmit` |
| Harness gates | `hooks/handlers/stop-*.ts`, post-commit review, verify-docs |

Every candidate is identified by `gen_ai.agent.version`, the attribute the document had wrongly vendor-prefixed. Fitness is Tier 3 of the sibling document's scheme: mean 21-day survival over the cohort of merged PRs produced under a candidate, carried as one `gen_ai.evaluation.result` event per candidate per window with `score.value` in [0, 1]. That is the encoding AA3 Gate 1 had already fixed, so the two documents now agree by construction.

The anti-Goodhart design replaces weighted terms with gates and exclusions:

- **Gates**: Tier 1 checks (tests, type check, execution) must pass and change size must meet a minimum for a PR to enter the cohort. A gate cannot be traded against.
- **Excluded**: churn and deletion, because they partition the same lines as survival and would double-count; merge time, merge rate and review-comment count, because they are the thin proxies MacDiarmid et al. 2025 and Baker et al. 2025 show get gamed.
- **Withdrawn formula**: `R = 100*survival - 50*churn + 30*merge_speed + 50*task_success - 20*scope` is recorded so the change history reads.

The 21-day delay is reframed from a credit-assignment problem to a cadence problem. With no gradient step to correct, a candidate's fitness is simply absent until its checkpoints land. The former PPO-clip retrofit is withdrawn with a pointer to what the literature actually uses (RUDDER, hindsight credit assignment, synthetic returns, offline RL).

### Section 5: Ownership and Data Flow

The new §5 (`:425-487`) is an ownership table and a data-flow diagram. The document keeps the span schema, fitness signal, measurement, safety envelope and dashboards. AA3 owns the loop. ASI_EVOLVE owns the tier definitions and the evolutionary span model. A closing subsection states what this removes from the siblings' picture, so the follow-up edits are named rather than implied.

### Section 3: OpenTelemetry corrections

```yaml
gen_ai.request.model: "claude-fable-5-1"
gen_ai.agent.version: "2026-09-18"        # registered; Conditionally Required on invoke_agent.
                                          #   The manifest version under test — §4's candidate id
```

The stability box now distinguishes Development (`gen_ai.*`) from Release Candidate (`vcs.*`), explains what v1.42.0 actually pins, and instructs pinning the GenAI conventions by commit SHA. The fifth metric instrument was renamed from `integritystudio.rl.policy.training` to `integritystudio.evolution.round`, reusing the namespace the sibling document already mandates for its span model. The spanmetrics alternative was deleted with the reason stated. Survival and merge-time histograms gained `gen_ai.agent.version` as a key attribute so the canary query in §8 can compare candidate versions.

### Section 6: Content-tracking survival

The rewritten `SurvivalMeasurer` (`:544-660`) implements the paper's method:

```python
def _added_lines(self, commit_hash: str) -> Counter:
    """(path, content) multiset of lines the seed commit ADDED.

    A multiset per file — not a global set — so duplicate lines and code that merely
    moved elsewhere are not counted as survivors. Renames must be followed
    (`--find-renames`) or a renamed file reads as 100% deleted.
    """
    diff = self._git("show", "--format=", "--unified=0", "--find-renames", commit_hash)
```

The original used a global `Set[str]` intersection, which collapses duplicate lines and counts a line as alive if identical text exists anywhere in the tree. The scheduler became a single interval-triggered job that emits any (PR, window) checkpoint whose due time has passed, replacing the `day_of_week=3` decorator. The docstring names the two things a real implementation must get right: resolving `at_ref` to the commit nearest the due time rather than live HEAD, and hunk-level tracking before churn and deletion rates are emitted.

### Sections 7 through 11

Value-function monitoring became Goodhart monitoring: three checks per candidate (survival rising while median change size falls, gate pass rate falling while survivors look better, and 7-day-to-21-day rank correlation going non-positive), each triggering human review rather than a penalty. The risk table gained a semconv-drift row and rewrote every mitigation that referenced a value network. The Core Assumption was restated for the new surface with its evidence level left at "None". The tertiary success metrics dropped "Training Success Rate" and "Value Function Calibration Error" for checkpoint-job success and early-window agreement. References grew from 6 to 14, keeping the PPO and library citations with a note that they belong to the withdrawn design.

## Decisions

**Withdraw the RL layer rather than repair it**
- **Choice**: Remove Gymnasium, Dict spaces and SB3 PPO entirely; record why in the document.
- **Rationale**: Fixing `MlpPolicy` to `MultiInputPolicy` would make the code run but not make it useful. The trained network had no path to the agent's behaviour.
- **Alternative Considered**: Keep an RL section for a future where weights are trainable.
- **Trade-off**: The sibling document's "hybrid RL + evolution" now describes half a design. Flagged in three places; not edited.

**Keep section numbers stable**
- **Choice**: Rewrite §4 and §5 in place; leave 1 through 11 numbered as before.
- **Rationale**: `DECISIONS.md:298`, the AA1 plan and the agent-auditor resources reference §3, §9 and §11 by number.
- **Trade-off**: §5 is thinner than its neighbours.

**Gates and exclusions, not weights**
- **Choice**: Task success and minimum change size gate cohort entry; Tier 2 proxies are diagnostics only.
- **Rationale**: Every weighted proxy in the old formula was either double-counted or shown gameable in the 2025 literature.
- **Alternative Considered**: Re-weight the formula.
- **Trade-off**: Fewer signals enter selection; Tier 1 and Tier 2 act as priors in AA3 instead.

**Do not edit the sibling documents**
- **Choice**: Flag `ASI_EVOLVE_AUDIT_AND_INTEGRATION.md` §5.1-5.2, AA3 Phase 3 and the repo-wide "v1.42.0" wording as follow-ups.
- **Rationale**: The request scoped the recommendation to this document. Whether to propagate is the user's call.

**Render the PDF through HTML, not LaTeX**
- **Choice**: `pandoc -f gfm -t html5 --pdf-engine=weasyprint` with an inline stylesheet.
- **Rationale**: No TeX engine is installed, and the document's box-drawing diagrams and symbols render cleanly through a browser-grade engine.
- **Trade-off**: Two renders; the first duplicated the title via pandoc's title block.

## Testing and Verification

Post-revision structural checks:

```
=== H1/H2 outline ===
1:# Agentic Self-Optimization Framework: Architecture & Design
14:## Current State (verified 2026-08-22)
76:## Executive Summary
93:## 1. Problem Statement
...
326:## 4. Optimization Surface and Fitness Signal (Hosted-Model Agent)
425:## 5. Optimization Loop: Ownership and Data Flow
488:## 6. Feedback Integration Pipeline
...
926:## References
=== fence balance (even) ===
22
=== python blocks compile ===
block 1: ok (112 lines)
block 2: ok (12 lines)
```

A stale-term sweep for `PPO|SB3|MlpPolicy|Gymnasium|Whitepaper|SurveyL2|rl\.policy|integritystudio\.agent\.version|git blame|sonnet-4|task_success|Value Function|§2\)` returned only deliberate historical mentions in the revision header, the withdrawal rationale, and the references.

Live recount of the framework's own emission, matching on span name rather than substring:

```
files: 152 real checkpoint spans: 0
```

PDF verification via `pdfinfo` and visual inspection of pages 1, 2, 13 and 16:

```
Title:           Agentic Self-Optimization Framework: Architecture & Design
Pages:           26
Page size:       612 x 792 pts (letter)
```

Commit, second attempt (the first was refused for a 72-character header overflow):

```
070aac49 docs(roadmap): withdraw PPO design; fix audited OTel claims (v1.2)
[SKILL_COMPLETE] skill=git-commit-smart outcome=success commit_type=docs files_staged=1 commits_created=1 repo=/Users/alyshialedlie/.claude branch=main branch_moved=false dry_run=false
```

## Files Modified

| File | Change | Lines |
|------|--------|-------|
| `docs/roadmap/AGENTIC_SELF_OPTIMIZATION_ARCHITECTURE.md` | Revised to v1.2; committed `070aac49` | 970 (+415 / -425) |

## Files Created

| File | Purpose | Size |
|------|---------|------|
| `~/Desktop/AGENTIC_SELF_OPTIMIZATION_ARCHITECTURE.pdf` | Rendered copy of v1.2 | 26 pages, 308 KB |
| `research-artifacts/20260917-231441-aso-doc-claims-audit/` | Research agent's queries, extractions and cross-reference | 5 files |
| `docs/repomix/*.xml`, `*.txt` | Regenerated pack artifacts (untracked) | 7 files |

## Follow-Ups Left Open

1. `ASI_EVOLVE_AUDIT_AND_INTEGRATION.md` §5.1-5.2 and `AA3_ASI_EVOLVE_IMPLEMENTATION_PLAN.md` Phase 3 still describe the RL half of a hybrid that no longer exists.
2. The "pinned semconv-genai v1.42.0" wording in `PERFORMANCE_PROFILE.md:659` and `SESSION_HISTORY.md:26,142` carries the same caveat now recorded in §3.
3. `skills/synced/**` should be added to `scripts/repomix/repomix.config.json` `customPatterns`, or the directory gitignored, before the next pack.
4. The docs-only pack under `docs/repomix/` holds the pre-revision text until the pack is rerun.
5. A modified submodule pointer at `mcp-servers/observability-toolkit` and the untracked `skills/synced/` directory were left uncommitted as out of scope.

## References

- `docs/roadmap/AGENTIC_SELF_OPTIMIZATION_ARCHITECTURE.md` (v1.2, commit `070aac49`)
- `docs/roadmap/ASI_EVOLVE_AUDIT_AND_INTEGRATION.md` §5.3 (three-tier fitness), §5.4 (evolution span model)
- `docs/roadmap/AA3_ASI_EVOLVE_IMPLEMENTATION_PLAN.md` Gate 1 (fitness encoding), Gate 4 (decided against)
- `docs/DECISIONS.md:298` (both roadmaps unscheduled by choice)
- `agents/resources/agent-auditor-telemetry-queries.md:293-318` (Q5), `agents/resources/agent-auditor-scoring-spec.md:74-145` (D7)
- `hooks/lib/constants.ts:349-358` (GenAI duration histogram buckets)
- Popescu et al. (2026), arXiv 2604.00917; SWE-RL, arXiv 2502.18449; DeepSeek-R1, arXiv 2501.12948; GEPA, arXiv 2507.19457; Baker et al. (2025), arXiv 2503.11926; MacDiarmid et al. (2025), Anthropic; RUDDER, arXiv 1806.07857
- OpenTelemetry `semantic-conventions` v1.42.0 release; `semantic-conventions-genai` agent spans and metrics; Prometheus OTLP receiver guide; `spanmetricsconnector` README
- Previous report: [LLM Observability Best Practices: A Comparative Analysis](/reports/llm-observability-best-practices-2026/) (2026-08-31), which established the GenAI semconv baseline this audit re-verified

---

## Appendix: Readability Analysis

Readability metrics computed with [textstat](https://github.com/textstat/textstat) on the report body (frontmatter, code blocks, and markdown syntax excluded).

### Scores

| Metric | Score | Notes |
|--------|-------|-------|
| Flesch Reading Ease | 47.8 | 0–30 very difficult, 60–70 standard, 90–100 very easy |
| Flesch-Kincaid Grade | 10.7 | US school grade level (High School) |
| Gunning Fog Index | 13.3 | Years of formal education needed |
| SMOG Index | 12.9 | Grade level (requires 30+ sentences) |
| Coleman-Liau Index | 13.1 | Grade level via character counts |
| Automated Readability Index | 11.3 | Grade level via characters/words |
| Dale-Chall Score | 13.08 | <5 = 5th grade, >9 = college |
| Linsear Write | 17.2 | Grade level |
| Text Standard (consensus) | 12th and 13th grade | Estimated US grade level |

### Corpus Stats

| Measure | Value |
|---------|-------|
| Word count | 2,409 |
| Sentence count | 145 |
| Syllable count | 4,048 |
| Avg words per sentence | 16.6 |
| Avg syllables per word | 1.68 |
| Difficult words | 580 |
