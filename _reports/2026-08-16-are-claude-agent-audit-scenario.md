---
layout: single
title: "Auditing a Live Agent Fleet Inside Meta's ARE"
date: 2026-08-16
author_profile: true
categories: [agent-governance, evaluation-harnesses]
tags: [are-simulation, meta-agents-research-environments, claude-code, agent-manifests, scenario-design, gaia2, evaluation]
excerpt: "Building a custom Meta Agents Research Environments scenario that loads a real Claude Code agent fleet into a sandbox and grades an agent on whether it audits all of it — plus what coverage-based validation can and cannot prove."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
permalink: /reports/are-claude-agent-audit-scenario/
---

**Session Date**: 2026-08-14 (scenario authored), 2026-08-16 (verification run)<br>
**Project**: `meta-agents-research-environments` fork · `claude-dev-environment`<br>
**Focus**: A custom ARE scenario that audits real Claude Code agent manifests inside a sandbox<br>
**Session Type**: Tooling

## Executive Summary

I needed a governance audit of the 17 [Claude Code](https://docs.claude.com/en/docs/claude-code) agent manifests in my `~/.claude/agents` directory — and specifically, I needed one whose *completeness* I could trust. Asking a model to "review my agents" produces something audit-shaped every time; what it does not produce is any guarantee the model read all 17 rather than 6 and then generalized.

So instead of prompting, I built a scenario for [Meta Agents Research Environments](https://github.com/facebookresearch/meta-agents-research-environments) (ARE), Meta's open-source platform for evaluating AI agents — the harness behind the [Gaia2 benchmark](https://huggingface.co/blog/gaia2). The scenario, `scenario_claude_agent_manifests`, copies a real agent fleet from the host into a sandboxed filesystem, tasks an agent with a per-manifest governance report, and then **programmatically verifies coverage**: the run passes only if the final report names at least 80% of the manifests it was given.

That last piece is the whole point. The audit's *judgment* still comes from a model and inherits every limitation that implies. But "did it actually cover the fleet?" becomes a question answered by code inspecting end state rather than by the report's own confident tone. Two runs later, that check earned its keep — it caught a verification run that had audited all 17 manifests internally but named only 9 in its final message, a shortfall no amount of reading the summary would have revealed.

The findings those runs produced, and the 28 fixes that closed them, are a separate story: [Closing the Agent Fleet Audit](/reports/agent-fleet-audit-remediation/). This piece is about the harness.

## Key Details

| Item | Value |
|------|-------|
| Platform | [Meta Agents Research Environments](https://github.com/facebookresearch/meta-agents-research-environments) (ARE), MIT-licensed |
| Scenario | `scenario_claude_agent_manifests` (137 lines + `__init__.py`) |
| Fleet audited | 18 `*.md` files in `~/.claude/agents` (17 manifests + 1 usage doc) |
| Validation | ≥80% of manifest names must appear in the final report (14 of 18) |
| Model used | `anthropic/claude-sonnet-4-6` via LiteLLM (`--provider local`) |
| Run 1 (2026-08-14) | PASS — 18/18 named, ~8 min, 43 findings |
| Run 2 (2026-08-16) | 9/18 named in final message, 5 m 55 s — full report recovered from trace |

## Why Not Just Prompt a Model?

The obvious approach to "audit my agent manifests" is to open a session, point a capable model at the directory, and read what comes back. That works, and it is how the first draft of this work started. The problem is a specific and quiet failure mode.

A model asked to audit 18 files in one pass will sometimes read all 18 and report on all 18. It will also sometimes read all 18, report on 8, and close with a summary confident enough that nothing in the output signals the gap. Both outputs are structurally identical: numbered sections, per-agent findings, a total at the end. Distinguishing them means cross-checking the report against a directory listing by hand — which is exactly the kind of tedious verification the audit was supposed to save.

What I wanted was a harness that made completeness a property of the run rather than a thing I had to spot-check. ARE provides that, because scenarios end in a `validate()` method that runs real Python against the environment's final state.

## How ARE Works

ARE exists because static benchmarks under-measure agents. A fixed question-and-answer pair rewards retrieval; real tasks evolve while the agent works, with new information arriving mid-run and requiring strategy changes. ARE models that as a simulated world with a clock. Four [core concepts](https://facebookresearch.github.io/meta-agents-research-environments/foundations/index.html) carry the design:

- **Apps** — simulated tools the agent can call: a file system, a messaging interface, a calendar, a shopping cart. The agent perceives the environment *only* through apps, which makes the boundary of what it can touch explicit and enforceable.
- **Events** — timed occurrences on a dependency graph. The user's opening message is an event; so is a colleague messaging halfway through, or a file changing under the agent.
- **Scenario** — a Python class binding apps and events into a task, plus the rule for judging the outcome.
- **Validation** — a programmatic pass/fail check against end state. Not a rubric, not a judge model: code.

For benchmark work this supports elaborate setups — Gaia2 spans 800 scenarios across 10 simulated universes, with a public [leaderboard](https://huggingface.co/spaces/meta-agents-research-environments/leaderboard) and a [browser demo](https://huggingface.co/spaces/meta-agents-research-environments/demo). For a governance audit, the appeal is narrower and mostly about that fourth concept. I want the model's qualitative judgment, but I want a non-negotiable check wrapped around it.

## The Custom Scenario

ARE ships scenarios for its own benchmark domains, so auditing a real Claude Code fleet meant writing one. It lives in a fork of ARE as a self-contained package under `are/simulation/scenarios/scenario_claude_agent_manifests/` — no changes to ARE itself, since scenarios self-register by decorator and are discovered by import:

```python
@register_scenario("scenario_claude_agent_manifests")
class ScenarioClaudeAgentManifests(Scenario):
    """Inventory-and-audit task over real Claude Code agent manifests."""

    start_time: float | None = 0
    tags: tuple[CapabilityTag, ...] = (CapabilityTag.Exploration,)
    manifest_names: list[str] = field(default_factory=list)
```

Three parts do the work.

### 1. Bridging a live fleet into the sandbox

This is the load-bearing modification, and the reason the scenario is useful rather than a toy. `init_and_populate_apps` reads every `*.md` from a host directory and writes each into a `SandboxLocalFileSystem`:

```python
MANIFEST_DIR_ENV = "CLAUDE_AGENTS_DIR"
DEFAULT_MANIFEST_DIR = "~/.claude/agents"

def init_and_populate_apps(self, *args, **kwargs) -> None:
    fs = SandboxLocalFileSystem(sandbox_dir=kwargs.get("sandbox_dir", None))
    aui = AgentUserInterface()

    src = _manifest_dir()
    fs.makedirs("agents", exist_ok=True)
    self.manifest_names = []
    for path in sorted(src.glob("*.md")):
        try:
            content = path.read_text(encoding="utf-8", errors="replace")
        except OSError as e:
            logging.getLogger(__name__).warning(
                "skipping unreadable manifest %s: %s", path, e
            )
            continue
        fs.write_text(f"agents/{path.name}", content)
        self.manifest_names.append(path.stem)

    if not self.manifest_names:
        raise RuntimeError(
            f"No *.md manifests found in {src} — set {MANIFEST_DIR_ENV}"
        )

    self.apps = [fs, aui]
```

Ordinary ARE scenarios ship fixtures — invented emails, synthetic calendars. This one takes a live, working configuration as its fixture set, which buys realism the usual way round: the audit targets manifests I actually route work to, not plausible-looking inventions.

The sandbox copy is what makes that safe. The auditing agent gets a `SandboxLocalFileSystem` populated with *copies* under `agents/`; it has no path to the real `~/.claude/agents`, so an agent asked to critique manifests cannot decide to improve them. Given the audit's subject matter — one finding concerned an agent that could rewrite its own manifest mid-run — running the auditor without write access to the originals felt like the minimum standard of not being embarrassing.

Two failure-handling choices matter more than they look:

- **Unreadable files are logged and skipped**, not fatal. One malformed file should not void an 18-manifest audit.
- **An empty source directory raises immediately**, naming the env var in the message. Without this, a mis-set `CLAUDE_AGENTS_DIR` yields a zero-manifest sandbox, an agent that truthfully reports nothing to audit, and a validator that passes it — the threshold is `max(1, ...)`, but an empty `manifest_names` list makes "named all of them" vacuously true. A silent pass on an empty audit is the worst possible outcome for a governance tool, so the scenario refuses to start.

`manifest_names` accumulates the file stems. That list is the ground truth the validator scores against.

### 2. The task, as a timed event

`build_events_flow` registers the request through `AgentUserInterface`, inside ARE's capture mode:

```python
user_request = (
    aui.send_message_to_agent(
        content=(
            "The `agents/` directory contains Claude Code agent "
            "manifest files (markdown with YAML frontmatter). "
            "Audit them: read every manifest, then report — for "
            "each one — its name, a one-line summary of its role, "
            "its declared tools and model, and any governance "
            "issues you notice (missing or vague description, "
            "overlapping responsibilities with another agent, "
            "overly broad tool grants). End with the total count "
            "of manifests audited."
        ),
    )
    .depends_on(None, delay_seconds=0)
    .with_id("user_request")
)
```

The prompt names the three finding classes explicitly rather than asking for open-ended critique. That is a deliberate narrowing: "find problems" invites a model to generate plausible-sounding issues to fill space, while "check for vague descriptions, overlapping responsibilities, and overly broad tool grants" gives it categories with observable criteria. Requesting declared tools and model per agent also forces a read of every frontmatter block, making a skimmed manifest harder to disguise.

A paired `oracle` event describes the ideal response and marks the run as graded rather than a demonstration. Events are wired with `depends_on`, so richer versions of this scenario could inject mid-audit developments — a manifest changing under the agent, a follow-up question — which is the dynamic-environment capability I have not needed yet but which is the reason to build on ARE rather than a bare script.

### 3. Coverage-based validation

```python
def validate(self, env: AbstractEnvironment) -> ScenarioValidationResult:
    try:
        res = validation_utils.get_last_message_from_agent(env) or ""
    except Exception:
        res = ""

    # Word-boundary match so one manifest name embedded in another
    # (or in unrelated prose) doesn't count as a mention.
    mentioned = [
        name
        for name in self.manifest_names
        if re.search(rf"\b{re.escape(name)}\b", res)
    ]
    threshold = max(1, int(len(self.manifest_names) * 0.8))
    success = len(mentioned) >= threshold
    return ScenarioValidationResult(
        success,
        rationale=(
            f"final report names {len(mentioned)}/"
            f"{len(self.manifest_names)} manifests (need {threshold})"
        ),
    )
```

Three decisions are embedded here.

**Word-boundary matching.** A naive substring check counts `prompt-finder` as mentioned when the report only says `PROMPT_FINDER_USAGE`, and counts any agent whose name is a common word fragment against unrelated prose. `\b` anchoring closes both.

**80%, not 100%.** The fleet contains `PROMPT_FINDER_USAGE.md`, a usage guide with no YAML frontmatter — correctly *excluded* by a careful auditor. A 100% threshold would fail the most accurate possible report for doing the right thing. 80% tolerates a small number of principled omissions while still catching a report that covers half the fleet.

**The rationale string carries the ratio.** `ScenarioValidationResult` takes free-text rationale, and spending it on `9/18 (need 14)` rather than `"insufficient coverage"` is what turned the second run's outcome into a diagnosable fact instead of a bare FAIL.

## What Coverage Validation Can and Cannot Prove

Worth being precise about, because it is easy to overclaim.

**It cannot verify a finding is correct.** If the model asserts two agents overlap when they do not, validation passes it without comment. Catching that needs a second model or a human, and I did the latter — reviewing each finding before acting on it, which turned up several that were already fixed or misread the manifest.

**It cannot verify findings are complete.** An agent can name all 18 manifests and report one trivial issue each. Coverage measures breadth of attention, not depth.

**What it does prove is that the report spans the fleet** — and that turns out to be the failure mode that actually threatens this kind of audit. It is also the one hardest to spot by reading, because a partial audit and a complete one are indistinguishable in shape.

The verification run demonstrated exactly this. The validator reported `9/18`. Recovering the full trace from the run log showed the agent *had* audited all 17 manifests, writing a complete report into the sandbox — but its final user-facing message, the only thing the validator can see, truncated after the eighth. Without the coverage check I would have read a report ending mid-fleet and had no signal that anything was missing. With it, I knew to go looking, and found the complete audit in the tool-call trace.

That is a validator working correctly on an imperfect signal: it measures the final message, the agent's real work exceeded it, and the mismatch was itself the useful information.

## Running It

```
are-run -s scenario_claude_agent_manifests -a default \
  --provider local -m anthropic/claude-sonnet-4-6
```

`-a default` selects ARE's built-in [ReAct](https://arxiv.org/abs/2210.03629) agent; `--provider local` routes through the [LiteLLM](https://github.com/BerriAI/litellm) engine, which makes the scenario model-agnostic. The same audit can run against a different model with the coverage check held constant — a way to compare governance judgment across models on identical inputs, which I have not done yet but is the natural next use.

`CLAUDE_AGENTS_DIR` retargets the fleet directory, so the scenario works against any Claude Code installation, a checked-out copy of someone else's agents, or a fixture set built for testing.

One practical note: the run needs `ANTHROPIC_API_KEY` in the environment it actually executes in. Sourcing it from a secrets manager at the shell level is easy to get subtly wrong when the command is launched detached, and LiteLLM's failure mode is a fast, unmistakable `Auth error in litellm` — quick to diagnose, but only if you check the log rather than assuming a long-running job is running.

Both runs used identical scenario code against the same fleet directory. That is what makes the before-and-after meaningful: between the 2026-08-14 audit and the 2026-08-16 verification, the only thing that changed was the manifests themselves.

## Reproducing It

The scenario is two files dropped into a clone of [ARE](https://github.com/facebookresearch/meta-agents-research-environments), under `are/simulation/scenarios/scenario_claude_agent_manifests/`: `scenario.py` (137 lines — the class above, in full) and an `__init__.py` package marker that lets the registry discover it. Nothing in ARE itself is modified, which keeps the fork mergeable against upstream and means the scenario can be lifted into any ARE checkout as-is.

Point `CLAUDE_AGENTS_DIR` at any directory of agent manifests and it will audit those instead — the scenario has no knowledge of my particular fleet beyond the default path.

---

## Appendix: Readability Analysis

Readability metrics computed with [textstat](https://github.com/textstat/textstat) on the report body (frontmatter, code blocks, and markdown syntax excluded).

### Scores

| Metric | Score | Notes |
|--------|-------|-------|
| Flesch Reading Ease | 49.2 | 0–30 very difficult, 60–70 standard, 90–100 very easy |
| Flesch-Kincaid Grade | 11.5 | US school grade level (High School) |
| Gunning Fog Index | 13.7 | Years of formal education needed |
| SMOG Index | 13.0 | Grade level (requires 30+ sentences) |
| Coleman-Liau Index | 11.2 | Grade level via character counts |
| Automated Readability Index | 12.0 | Grade level via characters/words |
| Dale-Chall Score | 10.98 | <5 = 5th grade, >9 = college |
| Linsear Write | 22.7 | Grade level |
| Text Standard (consensus) | 10th and 11th grade | Estimated US grade level |

### Corpus Stats

| Measure | Value |
|---------|-------|
| Word count | 1,817 |
| Sentence count | 88 |
| Syllable count | 2,936 |
| Avg words per sentence | 20.6 |
| Avg syllables per word | 1.62 |
| Difficult words | 359 |
