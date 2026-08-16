---
layout: single
title: "Closing the Agent Fleet Audit: 43 Findings to Zero"
date: 2026-08-16
author_profile: true
categories: [agent-governance, developer-tooling]
tags: [claude-code, agent-manifests, governance-audit, tool-grants, routing-boundaries, are-simulation, multi-agent]
excerpt: "A three-day remediation arc closing every finding from the 2026-08-14 agent fleet governance audit — 28 fixes across 17 manifests, verified by re-running the audit, which surfaced one new critical caused by an earlier fix."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
permalink: /reports/agent-fleet-audit-remediation/
---

**Session Date**: 2026-08-16 (arc began 2026-08-15)<br>
**Project**: claude-dev-environment (`~/.claude`)<br>
**Focus**: Close every gap identified by the 2026-08-14 agent fleet governance audit, then verify by re-running the audit<br>
**Session Type**: Remediation

## Executive Summary

On 2026-08-14 an ARE simulation audited the 17 [Claude Code](https://docs.claude.com/en/docs/claude-code) agent manifests in my `~/.claude/agents` directory and returned **43 findings — 1 critical, 41 warnings, 1 positive**. This report covers the full remediation arc that closed all of them: **28 fixes (AG1–AG28) across 23 commits**, touching every manifest in the fleet, each recorded as a numbered changelog entry.

The findings clustered into four classes, and each demanded a different kind of fix. **Nine overlapping agent pairs** had real boundaries that lived only in body prose, invisible to the routing surface that actually picks an agent — fixed by making each boundary reciprocal and description-visible (AG2–AG4, AG7–AG12). **Four overly broad tool grants** were narrowed or justified (AG1, AG18, AG27, AG28). **Three vague descriptions and one stale cross-reference** were corrected (AG13, AG15, plus the description halves of AG2 and AG4). The remainder were per-agent defects: undisclosed shell writes, a guardrail requiring a tool the agent lacked, an unexplained model choice, four unexplained `Bash` grants, and an agent that could rewrite its own manifest mid-audit.

A recurring pattern shaped the work: **a tool grant is a claim, and the manifest body is the evidence for it.** Where the body justified a grant, the fix was to document and bound it; where nothing justified it, the fix was to remove it. That test resolved every capability finding without guesswork — WebFetch left `ui-ux-design-expert` and `react-vite-antd-scaffold` because no step used it, while `hallucination-checker` kept Read/Glob/Grep because its documented job is auditing prompt *files*.

Verification re-ran the audit scenario against the remediated fleet. Remediated items now rate `[OK]` where they were findings, and one **new critical** appeared — a direct consequence of the first fix. AG1 had declared all 27 previously-hidden `obs_*` MCP tools on `genai-quality-monitor` for governance visibility; with the grant finally visible, the re-audit could see it included write-capable and externally-publishing tools on an agent described as a monitor. Closing that (AG26) took the fleet to **zero open findings**.

## Key Metrics

| Metric | Value |
|--------|-------|
| Audit findings at start | 43 (1 critical, 41 warnings, 1 positive) |
| Open findings now | 0 |
| Fixes applied | 28 (AG1–AG28) |
| Commits | 23 |
| Manifests in fleet / modified | 17 / 17 |
| Overlapping pairs given declared boundaries | 9 of 9 |
| Overly broad tool grants resolved | 4 of 4 |
| Tool grants removed | 10 — 2× WebFetch, 1× WebSearch, prompt-finder's Read/Glob/Grep, orchestrator's `Bash`, and 3 `obs_*` tools |
| Tool grants added (to close documented gaps) | 3 — `Bash` to code-simplifier, `WebSearch` to webscraping-research-analyst, `Glob` to the orchestrator |
| Agents renamed | 1 (`senior-frontend-developer-simple` → `react-vite-antd-scaffold`) |
| Re-audit wall-clock | 5 m 55 s |

## Where the Audit Came From

Both the original audit and its verification run were produced by a custom scenario built on [Meta Agents Research Environments](https://github.com/facebookresearch/meta-agents-research-environments) (ARE), Meta's open-source agent-evaluation platform. The scenario copies the live fleet into a sandboxed filesystem, tasks an agent with a per-manifest governance report, and then programmatically checks that the report actually spans the fleet — passing only if it names at least 80% of the manifests it was given. The auditing agent reads sandbox copies and cannot modify the originals.

That coverage check is what makes the findings worth acting on: model judgment supplies the findings, but completeness is verified by code rather than inferred from the report's confident tone. The harness, the scenario internals, and what coverage validation can and cannot prove are covered separately in [Auditing a Live Agent Fleet Inside Meta's ARE](/reports/are-claude-agent-audit-scenario/).

## Problem Statement

The audit scored each manifest on governance dimensions and produced a cross-fleet section naming four systemic problems:

- **Overlapping responsibilities (9 pairs)** — agents whose scopes genuinely differ, but whose distinction was documented only in body prose. A router reading descriptions could not tell `code-reviewer` from `code-simplifier`, or `telemetry-archaeologist` from `telemetry-backfill`.
- **Overly broad tool grants (4 agents)** — capabilities granted without a use case, including one critical: `genai-quality-monitor` declared 4 native tools while silently depending on 25+ MCP tools, leaving frontmatter-based governance blind to what it could actually do.
- **Missing or vague descriptions (3 agents)** — scope limits and companion relationships buried in guardrails where routing never sees them.
- **Stale cross-references (1 agent)** — `claude-code-guide` referred users to two agents that did not exist.

The unifying defect: **the frontmatter description is the routing surface, and none of this information was on it.** Correct behavior was documented in places that only take effect once an agent has already been chosen.

## Remediation by Finding Class

### The critical finding, and the finding it created

`genai-quality-monitor`'s frontmatter listed only `Read, Grep, Glob, Bash`, while every primary workflow required `obs_*` tools from an observability [MCP](https://modelcontextprotocol.io) server. Worse, the runtime allowlist was blocking that MCP access entirely — captured subagent transcripts showed Read-only fallback with zero `obs_*` calls. **AG1** declared all 27 tools, stated the hard server dependency in the description, and reworded a pseudo-CLI `bash` fence into "Analysis Recipes" (no `obs_*` CLI exists).

That fix worked exactly as intended, and its reward was a new critical. Once the grant was visible, the re-audit could see what it contained: dataset create/delete, evaluation injection, span/trace ingestion, four third-party exporters, and a `.claudeignore` editor — on an agent whose description says *monitor*. **AG26** resolved it by applying the claim-and-evidence test: three grants no workflow justified were removed (`obs_ingest_spans` and `obs_ingest_traces`, since pushing spans into a backend is `telemetry-backfill`'s scope and nothing here produces spans; `obs_setup_claudeignore`, unrelated to output quality), while the six that *are* documented were bounded — the tool table now splits into a read-only working set of 18 and a gated write/publish tier of 6 with a blast-radius column, behind a Write & Publish Gate:

| Rule | Effect |
|------|--------|
| Explicit request naming the destination | "Investigate the hallucination spike" never authorizes an export; "push these to Datadog" does |
| Exports are unrecallable outbound disclosure | The four exporters ship prompts, outputs, and trace context to third-party SaaS — state what and where, confirm first |
| `obs_manage_datasets delete` needs its own named confirmation | Irreversible; `list`/`get` stay ungated |
| Injected evaluations must be labeled | They land in the store this agent reads — unlabeled synthetic events corrupt later regression analysis |
| No span ingestion | Hand off to `telemetry-backfill` |

The governing principle, now stated in the manifest: analysis ends at a recommendation; acting on it is a separate, explicitly requested job.

### Nine overlapping pairs, nine declared boundaries

Each pair had a real distinction that no router could see. The fix was the same shape every time — state the boundary in **both** descriptions, reciprocally, on the axis that actually separates them:

| Pair | Separating axis | Entry |
|------|-----------------|-------|
| hallucination-checker / genai-quality-monitor | Static prompt **text** pre-deployment vs. runtime **outputs** | AG2 |
| genai-quality-monitor / telemetry-archaeologist | Interpreting metrics vs. locating data ("where is the data for X?") | AG3 |
| telemetry-archaeologist / telemetry-backfill | Read-only diagnosis vs. read-write reconstruction | AG4 |
| code-reviewer / code-simplifier | Ordering: simplify **before** review, so review gates what lands | AG7 |
| code-reviewer / auto-error-resolver | Handoff: reviewer emits a fix list, never writes; resolver fixes, never reviews | AG8 |
| code-simplifier / auto-error-resolver | Behavior: resolver changes it as the error requires; simplifier preserves it exactly | AG9 |
| web-research-analyst / webscraping-research-analyst | Evaluating scraping **tools** vs. general research — including market sizing *of* the scraping industry | AG10 |
| ui-ux-design-expert / senior-frontend-developer-simple | File ownership: new scaffold files vs. edits to existing components | AG11 |
| agent-auditor / skill-auditor | Write scope: agent manifests vs. `SKILL.md` files | AG12 |

Four of these resolved into explicit pipelines, which is what makes them useful rather than merely disambiguating: **Red → Fix → Green → Simplify → Review → Re-review**, and **Scaffold → Polish**.

### Tool grants: claim versus evidence

| Agent | Finding | Resolution | Entry |
|-------|---------|-----------|-------|
| genai-quality-monitor | 25+ MCP tools undeclared | Declared, then trimmed 27 → 24 and gated | AG1, AG26 |
| web-research-analyst | Unbounded `Agent` grant | Scoped to `haiku-extractor` only, in description and Guardrails | AG18 |
| ui-ux-design-expert | WebFetch + WebSearch unexplained | **Removed** — workflow is entirely local | AG27 |
| react-vite-antd-scaffold | WebFetch unexplained | **Removed**; "check docs via WebFetch" became "take endpoints from the prompt, halt if unspecified" | AG28 |
| code-simplifier | Guardrail required verification, no test runner granted | **Added** `Bash`, bounded to verification; workflow step made concrete (same-baseline check) | AG6 |
| webscraping-research-analyst | Workflow required search, no WebSearch granted | **Added** — step 2 already documented the use case | AG20 |
| prompt-finder | Read/Glob/Grep on a remote-only agent | **Removed** — every access path is remote, and with no Write grant it cannot even cache locally | AG19 |
| hallucination-checker | Read/Glob/Grep unexplained | **Kept and explained** — its job includes auditing prompt *files*; new Input Modes section bounds them to read-only loading of the prompt under review | AG25 |
| telemetry-backfill | Writes described, no Write tool granted | Documented the Bash-write pattern and bounded it to one script with `--write`; no redirects, `tee`, or `sed -i` | AG5 |
| documentation-architect | `Bash` unexplained | Documented (verifies examples compile, paths exist) and bounded to verification | AG16 |
| multi-agent-orchestrator | `Bash` unexplained | **Removed** — its own guardrails forbid direct implementation | AG17 |

Ten grants were removed and three added. The additions matter as much as the removals: a guardrail demanding verification from an agent with no test runner is a rule that cannot be followed, and a research workflow without search is a documented step that cannot execute.

### Descriptions, cross-references, and model choice

**AG13** surfaced `auto-error-resolver`'s buried scope limits (≤3 files, no API/schema/config changes) into its description, so a router can see at a glance that it handles small fixes, not refactors. **AG15** fixed `claude-code-guide`'s stale referrals — they pointed at `otel-quality-reporting` and `otel-session-summary`, which are *skills*, not agents — and stated its read-only intent explicitly, since orchestrators had no way to know it cannot create config files. **AG14** documented the fleet's one non-Sonnet model choice: `code-reviewer` runs on haiku deliberately, as a cost optimization for a high-frequency post-edit reviewer, with an escalation rule making clear that "no security issues" from haiku on auth, crypto, tokens, or payments is *a screen, not a clearance*.

### Structural and self-referential hazards

Three findings were about the fleet's ability to govern and route itself.

**AG21 — an auditor that could rewrite itself.** `agent-auditor` audits `agents/`, which includes its own manifest. A C/D self-grade could route into the rewrite path and alter the instructions governing the audit in progress — including the approval gate meant to constrain it. Self-*scoring* remains permitted; self-*rewrite* is now blocked in-invocation, emitting a diff labeled `SELF-REWRITE — MANUAL APPLICATION REQUIRED` that is never written regardless of confirmation in that session. The rule extends to the `resources/` scoring spec and telemetry queries in active use.

**AG22 — a fallback that hid its own degradation.** `skill-auditor`'s external scorer is the sole source of every telemetry-derived signal (D1 activation funnel, D5 alignment, half of D6). Its manual fallback covered only text-readable dimensions but carried no warning, so a degraded run could produce grades indistinguishable from measured ones — and trigger a full rebuild on them. Telemetry dimensions now default to a marked neutral `5*` rather than being estimated from SKILL.md text, reports open with a `⚠ DEGRADED EVALUATION` banner stating grades are not comparable, and rebuilds and baseline updates are barred from degraded runs.

**AG23/AG24 — a roster that broke silently, demonstrated by the rename that broke it.** `senior-frontend-developer-simple` was renamed to `react-vite-antd-scaffold` ("simple" said nothing; the stack constraint is the agent's defining property). The rename required 13 cross-reference edits across three manifests — **11 of them in `multi-agent-orchestrator`'s hardcoded 16-agent roster**, the exact silent-breakage mode the audit had predicted. It also nearly slipped past `agent-auditor`'s built-in protection pattern, whose `senior-*.md` glob matched only this agent and would have quietly stopped protecting it. AG24 then fixed the underlying cause: the live `agents/` directory is now authoritative, `Glob` was added for discovery (the agent previously had only `Read` and literally could not check its roster against reality), and the table was demoted to a dated cheat-sheet with drift rules — stale rows non-routable, unlisted live manifests routable, frontmatter-less `.md` files treated as docs. Recursive orchestration was banned in the same pass: nested plans are flattened rather than delegated to another orchestrator.

## Testing and Verification

Two fixes were implemented by background `/backlog-implementer` forks with per-item code-review gates; both returned **PASS**, with the `ui-ux-design-expert` review independently confirming the remaining six tools cover all five workflow steps. Post-rename, a repo-wide grep found zero stale references outside historical documents, and the harness itself confirmed re-registration — `react-vite-antd-scaffold` appeared in the available-agents roster and the old name was delisted.

The full re-audit ran against the remediated fleet:

```
are-run -s scenario_claude_agent_manifests -a default --provider local -m anthropic/claude-sonnet-4-6
```

```
Validation ScenarioValidationResult(success=False, ...,
  rationale='final report names 9/18 manifests (need 14)')
Running scenarios: 1it [05:55, 355.21s/it, Success=0.0%]
```

The auditing agent split its work across 11 user-facing messages; the complete 17-section report was recovered from the run log's tool-call trace. What it shows:

- **Remediated findings now rate `[OK]`/`[INFO]`** — `hallucination-checker`: "Tool grant is minimal and read-only, scoped to loading prompt files"; the research pair: "clearly documented in both manifests"; the code pipeline: "explicitly documented".
- **Remaining `[WARN]`s are prose-vs-schema notes** — e.g. `web-research-analyst`'s haiku-extractor restriction "is not schema-enforced". This is a ceiling of frontmatter-level governance, not an unfixed finding: Claude Code has no mechanism to constrain *which* sub-agents an `Agent` grant may spawn, so the constraint lives at the two surfaces that exist (description and Guardrails).
- **One new `[CRIT]`** on `genai-quality-monitor`'s tool breadth, described above and closed by AG26.

## Complete Remediation Index

| Entry | Fix | Manifests |
|-------|-----|-----------|
| AG1 | Declare 27 `obs_*` MCP tools; state server dependency | genai-quality-monitor |
| AG2 | Static-text vs. runtime-output boundary | hallucination-checker, genai-quality-monitor |
| AG3 | Metric interpretation vs. data location split | telemetry-archaeologist, genai-quality-monitor |
| AG4 | Read-only/read-write companion pairing declared | telemetry-archaeologist, telemetry-backfill |
| AG5 | Shell-write pattern disclosed and bounded to one script | telemetry-backfill |
| AG6 | `Bash` added, bounded to verification; concrete same-baseline step | code-simplifier |
| AG7 | Pipeline ordering: simplify → review | code-simplifier, code-reviewer |
| AG8 | Handoff protocol: fix list → fix → re-review | code-reviewer, auto-error-resolver |
| AG9 | Fix-vs-simplify boundary on the behavior axis | auto-error-resolver, code-simplifier |
| AG10 | Research boundary incl. the ambiguous middle case | web-research-analyst, webscraping-research-analyst |
| AG11 | File ownership: scaffold vs. polish | ui-ux-design-expert, senior-frontend-developer-simple |
| AG12 | Write scopes declared; agent vs. SKILL.md split | agent-auditor, skill-auditor |
| AG13 | Scope limits surfaced into description | auto-error-resolver |
| AG14 | haiku choice justified; security escalation rule | code-reviewer |
| AG15 | Stale cross-references fixed; read-only intent stated | claude-code-guide |
| AG16 | `Bash` documented and bounded to verification | documentation-architect |
| AG17 | `Bash` removed; tools scoped to `Read` | multi-agent-orchestrator |
| AG18 | `Agent` grant scoped to haiku-extractor | web-research-analyst |
| AG19 | Vestigial filesystem tools trimmed | prompt-finder |
| AG20 | Missing `WebSearch` added | webscraping-research-analyst |
| AG21 | Self-audit guardrail: no in-invocation self-rewrite | agent-auditor |
| AG22 | Manual-fallback degradation made visible and non-destructive | skill-auditor |
| AG23 | Renamed to state the stack constraint; 13 refs updated | react-vite-antd-scaffold (+3) |
| AG24 | Roster made discovery-based; recursion banned | multi-agent-orchestrator |
| AG25 | Filesystem grant explained via Input Modes and bounded | hallucination-checker |
| AG26 | Write/export grant trimmed 27 → 24 and gated | genai-quality-monitor |
| AG27 | Unjustified WebFetch + WebSearch removed | ui-ux-design-expert |
| AG28 | Unjustified WebFetch removed | react-vite-antd-scaffold |

AG27 and AG28 were applied on 2026-08-16 but initially landed without changelog entries — a gap caught while compiling this report, since the entry count did not reconcile against the commit history. Recording them retroactively completed the ledger at 28 of 28.

## Scope of Changes

Every one of the 17 manifests was modified at least once across the arc. Alongside them, three supporting records moved: the action-item ledger tracking the audit's findings went to zero open items, the changelog gained entries AG1–AG28, and one manifest was renamed on disk (`senior-frontend-developer-simple` → `react-vite-antd-scaffold`) via `git mv`, which also required migrating the auditor's per-agent scoring state to the new key so its trust-tier and score history survived the rename.

The harness that produced the findings — a custom ARE scenario, its sandbox bridge, and its coverage validator — is documented in [Auditing a Live Agent Fleet Inside Meta's ARE](/reports/are-claude-agent-audit-scenario/).


---

## Appendix: Readability Analysis

Readability metrics computed with [textstat](https://github.com/textstat/textstat) on the report body (frontmatter, code blocks, and markdown syntax excluded).

### Scores

| Metric | Score | Notes |
|--------|-------|-------|
| Flesch Reading Ease | 21.4 | 0–30 very difficult, 60–70 standard, 90–100 very easy |
| Flesch-Kincaid Grade | 17.6 | US school grade level (Graduate+) |
| Gunning Fog Index | 20.1 | Years of formal education needed |
| SMOG Index | 17.5 | Grade level (requires 30+ sentences) |
| Coleman-Liau Index | 16.7 | Grade level via character counts |
| Automated Readability Index | 18.7 | Grade level via characters/words |
| Dale-Chall Score | 13.82 | <5 = 5th grade, >9 = college |
| Linsear Write | 23.7 | Grade level |
| Text Standard (consensus) | 17th and 18th grade | Estimated US grade level |

### Corpus Stats

| Measure | Value |
|---------|-------|
| Word count | 2,404 |
| Sentence count | 81 |
| Syllable count | 4,413 |
| Avg words per sentence | 29.7 |
| Avg syllables per word | 1.84 |
| Difficult words | 560 |
