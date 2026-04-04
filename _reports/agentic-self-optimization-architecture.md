---
layout: single
title: "Agentic Self-Optimization Framework: Architecture & Design"
date: 2026-04-03
author: "Integrity Studio AI Research"
author_profile: true
categories: [technical-report, architecture, reinforcement-learning, code-quality, agentic-systems]
tags: [agentic-systems, RL, code-churn, OTEL, PPO, Gymnasium, self-optimization, Stable Baselines3]
excerpt: "Complete technical specification for an RL-based framework that measures agent code quality using Popescu et al. churn metrics, converting post-deployment code survival into RL rewards for continuous policy improvement."
toc: true
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
---

# Agentic Self-Optimization Framework: Architecture & Design

**Date**: April 3, 2026  
**Authors**: Integrity Studio AI Research  
**Version**: 1.0  
**Status**: Architecture & Design Specification  

---

## Executive Summary

This document defines an OpenTelemetry (OTEL)-based observability framework that measures agent/skill/plugin code quality using the churn data model from Popescu et al. (2026), translating code stability metrics into reinforcement learning (RL) reward signals. The framework enables self-optimizing agentic systems that learn to produce higher-quality, longer-lived code by observing post-deployment code survival, merge velocity, and downstream stability patterns.

**Core Innovation**: Treating agent outputs as continuous experiments with measurable feedback loops, enabling RL agents to optimize for production-grade code stability—not just task completion.

**Key Components**:
1. Code Churn Telemetry Model (OTEL spans + attributes)
2. RL Environment abstraction (Gymnasium-compatible)
3. Multi-agent policy learning (Stable Baselines3 + Pufferlib)
4. Feedback integration pipeline (Git analysis → OTEL → RL reward)
5. Deployment safety guardrails (gradual rollout, rollback triggers)

---

## 1. Problem Statement

### Current State (2026)
Agent-generated code exhibits distinct failure modes:
- **2-3x higher churn** compared to human code (Popescu et al., 3-week window)
- **40-60% lower survival rates** at 3 weeks post-merge
- **Repository concentration bias**: 51-76% of agent PRs in 0-star/test repos
- **~960× spread in merge times** across agent platforms (Codex median 0.5 min vs. Devin median 8 hours)

**Root cause**: Agents optimize for immediate task completion; lack feedback on production-grade code quality.

### Desired Future State
- **Agents learn from code survival signals**: Each line's post-deployment lifetime becomes a training signal
- **Continuous improvement loop**: Agent policies updated as new code stability data arrives
- **Production-grade outputs**: Agents internalize patterns that correlate with high-survival code
- **Measurable framework quality**: Operators track agent skill improvement via OTEL dashboards

---

## 2. Churn Data Model (From Popescu et al. 2026)

### Metrics Collected Per PR/Commit

| Metric | Type | Collection Window | Production Signal |
|--------|------|-------------------|------------------|
| **Survival Rate** | % lines unmodified | 3d, 7d, 21d post-merge | Long-term code viability |
| **Churn Rate** | % lines modified | Same windows | Instability indicator |
| **Deletion Rate** | % lines deleted | Same windows | Code rejection signal |
| **Merge Rate** | % PRs merged | Immediate | Code review quality |
| **Merge Time** | Hours to merge | Immediate | Review friction / urgency |
| **Change Size** | Median lines added | Per PR | Scope complexity |
| **Review Comments** | Count per PR | Pre-merge | Code clarity issues |
| **Review Count** | Number of reviewers | Pre-merge | Review thoroughness |

### Why These Metrics?

1. **Survival metrics** = Ground truth of code quality in production context
2. **Merge signals** = Immediate feedback (faster → less controversial)
3. **Change size** = Proxy for defect density (larger changes → more bugs)
4. **Review signals** = Proxy for code clarity (fewer comments → clearer code)

---

## 3. OTEL Telemetry Architecture

### Span Structure: Code Quality Pipeline

```yaml
# Parent span: Code generation (day 0)
Span: "code-generation"
  start: 2026-04-03T10:15:00Z
  end: 2026-04-03T10:15:45Z
  attributes:
    agent.name: "claude-code-v4.5"
    agent.skill: "api-endpoint-refactor"
    agent.model: "sonnet-4.6"
    tool.type: "plugin|skill|agent"
    correlation.trace_id: "abc-123-def"  # Used to link delayed spans
    code.event: "generated"
    
  # Immediate child: Code review/merge event (same day or +1-7 days)
  Child Span: "code-merge-event"
    start: 2026-04-04T08:00:00Z  # Sometime after generation
    end: 2026-04-04T08:05:00Z
    attributes:
      code.quality.merged: true
      code.quality.merge_time_hours: 22.25
      code.quality.review_comments: 4
      code.quality.review_count: 2
      git.commit_hash: "abc123..."

# Delayed spans: Code survival checkpoints (created on days 3, 7, 21)
# These are NOT children (violates OTEL spec). Instead, link them to parent via trace/correlation.
Span: "code-survival-3d" (created on 2026-04-06T10:15:00Z)
  links:
    - parent_span_context: (from code-generation trace)
  attributes:
    code.quality.survival_3d: 0.92
    code.quality.churn_3d: 0.05
    code.quality.deletion_3d: 0.03
    correlation.trace_id: "abc-123-def"  # Matches parent
    code.event: "survival_checkpoint"
    code.checkpoint_window: "3d"

Span: "code-survival-21d" (created on 2026-04-24T10:15:00Z)
  links:
    - parent_span_context: (from code-generation trace)
  attributes:
    code.quality.survival_21d: 0.78
    code.quality.churn_21d: 0.15
    code.quality.deletion_21d: 0.07
    correlation.trace_id: "abc-123-def"  # Matches parent
    code.event: "survival_checkpoint"
    code.checkpoint_window: "21d"
    code.rl_reward_trigger: true  # This span triggers RL training
```

### OTEL Attribute Naming Convention

**Pattern**: `code.quality.{metric_name}` for all Popescu et al. metrics

```
code.quality.survival_3d      # Float [0.0, 1.0]
code.quality.survival_7d
code.quality.survival_21d
code.quality.churn_7d
code.quality.churn_21d
code.quality.deletion_21d
code.quality.merge_rate       # Float [0.0, 1.0]
code.quality.merge_time_hours # Float >= 0
code.quality.change_size_lines # Int >= 0
code.quality.review_comments   # Int >= 0
code.quality.review_count      # Int >= 0
```

**Resource Attributes** (agent/skill identity):
```
agent.name          # "claude-code", "github-copilot"
agent.skill         # "refactor-api", "write-tests"
agent.model         # "sonnet-4.6", "gpt-4-turbo"
agent.version       # "1.2.3"
tool.type           # "plugin" | "skill" | "agent"
repository.name     # GitHub repo name
```

### Data Ingestion Pipeline

```
[Git Webhook: New PR merged]
    ↓
[Async job: Track commit hash + agent metadata]
    ↓
[Cron: Measure survival @ 3d, 7d, 21d]
    ↓
[Emit OTEL span with code.quality.survival_* attributes]
    ↓
[OTEL collector: Route to feature store + RL feedback buffer]
```

**Implementation**: 
- Git hook (post-merge): Capture PR metadata + agent identity
- Scheduled cron (3d/7d/21d): Git blame analysis → survival metrics
- OTEL exporter: Batch emit spans with aggregated metrics

---

## 4. RL Environment Design (Gymnasium Compatible)

### Agent's Decision Space

**State** (observation):
```python
observation = {
    "task_description": str,           # Task prompt
    "context_files": List[str],        # Code to refactor/modify
    "recent_agent_history": List[{     # Past agent actions in this repo
        "survival_21d": float,
        "churn_7d": float,
        "merge_time": float,
        "change_size": int,
    }],
    "repository_profile": {            # Repo characteristics
        "star_count": int,
        "team_size": int,
        "language": str,
        "avg_pr_size": int,
    },
}
```

**Action**:
```python
action = {
    "code": str,                       # Generated code
    "scope_confidence": float,         # Agent's confidence in change scope
    "test_coverage": float,            # % new code with tests
    "refactor_depth": int,             # 1=minimal, 5=comprehensive
}
```

**Reward Function** (multi-objective):

```python
def compute_reward(action, outcomes_at_21d):
    """
    Outcomes = code metrics observed 21 days post-merge
    """
    
    # Weighted sum of quality signals
    survival_reward = outcomes_at_21d["survival_21d"] * 100  # [0, 100]
    
    # Penalize large, high-churn code
    churn_penalty = outcomes_at_21d["churn_21d"] * -50      # [0, -50]
    
    # Reward fast merges (proxy for code clarity)
    merge_speed = 1.0 / (1.0 + outcomes_at_21d["merge_time_hours"] / 24)
    merge_reward = merge_speed * 30                          # [0, 30]
    
    # Intrinsic reward for reaching the task goal
    task_completion_reward = 50 if task_success else 0
    
    # Shape reward: penalize oversized changes
    scope_penalty = min(outcomes_at_21d["change_size_lines"] / 1000, 1.0) * -20
    
    total = (survival_reward + churn_penalty + merge_reward + 
             task_completion_reward + scope_penalty)
    
    return total
```

### Why 21 Days?

This framework adopts the 21-day window as the primary feedback signal based on the assumption that this timeframe captures meaningful code stability patterns observed in the Popescu et al. study. Using 21d as the reward window:
- ✅ Captures long-term stability patterns (aligns with Popescu et al.'s measurement window)
- ✅ Provides enough data for statistical significance
- ✅ Balances feedback latency with learning speed
- ⚠️ **Trade-off**: RL agents see rewards with 21-day delay; mitigate with auxiliary intermediate rewards (merge time, review count)

*Note: Empirical validation of 21 days as a stability threshold is not provided in the Popescu et al. paper and should be verified via independent replication before deploying this framework to production systems.*

### Auxiliary Rewards (Immediate Feedback)

To reduce 21-day training latency, include immediate proxy rewards:

```python
immediate_reward = {
    "merge_success": +10 if merged else -5,
    "review_velocity": 5 / (1 + merge_time_hours),  # Fast = good signal
    "comment_ratio": -num_review_comments / 10,     # More comments = clarity issues
}
```

These **don't** replace the 21d reward; they're added as auxiliary signals for policy gradient updates.

---

## 5. Multi-Agent RL Training Architecture

### Approach: Multi-Skill Policy Learning

**Goal**: Train separate policies for each skill/agent type; share learned patterns via a central value function.

```
┌─────────────────────────────────────────────────────┐
│ Central Agent Repository (GitHub)                   │
│  - claude-code/refactor-api/v1.2                   │
│  - github-copilot/write-tests/v3.1                 │
│  - devin/debug-integration-tests/v0.9              │
└─────────────────────────────────────────────────────┘
         ↓ (generates code + emits OTEL)
┌─────────────────────────────────────────────────────┐
│ OTEL Observation Buffer (Git-based Feature Store)   │
│  - Collects 21-day survival outcomes               │
│  - Batch exports for training (weekly)             │
└─────────────────────────────────────────────────────┘
         ↓ (feeds into training loop)
┌─────────────────────────────────────────────────────┐
│ RL Training Environment (Gymnasium-compatible)      │
│  - Vectorized environments (parallel training)     │
│  - PPO with vectorized scaling (Pufferlib)         │
│  - Shared value function (transfer learning)       │
└─────────────────────────────────────────────────────┘
         ↓ (produces improved policies)
┌─────────────────────────────────────────────────────┐
│ Policy Deployment                                   │
│  - Canary: 10% of requests → new policy            │
│  - Monitor: Survival rate @ 7d vs. baseline        │
│  - Rollback: If survival drops > 2%                │
└─────────────────────────────────────────────────────┘
```

### Training Algorithm: PPO + Advantage Aggregation

**Why PPO (Proximal Policy Optimization)**:
- ✅ Sample-efficient (reuse 4-5 epochs per trajectory)
- ✅ Handles high-variance delayed rewards (21d window)
- ✅ Proven stable for continuous actions (scope_confidence, test_coverage)
- ⚠️ Limitation: Doesn't natively handle 21-day reward delays

**Mitigation: Advantage Estimation with Bootstrapping**

```python
# Pseudocode (Stable Baselines3 + custom callback)

def compute_gae_with_delayed_rewards(
    trajectories: List[Trajectory],
    delayed_rewards_at_21d: Dict[str, float],
    lambda_gae: float = 0.95,
):
    """
    Use immediate proxy rewards for on-policy updates;
    retroactively adjust value estimates when 21d outcomes arrive.
    """
    
    # Phase 1: Initial training (on immediate rewards)
    for traj in trajectories:
        advantage = compute_gae(
            rewards=traj.immediate_rewards,  # merge time, review signals
            value_estimates=model.value_function(traj.observations),
            lambda=lambda_gae,
        )
        update_policy(advantage)
    
    # Phase 2: Delayed reward correction (async)
    for traj_id, delayed_outcomes in delayed_rewards_at_21d.items():
        actual_reward = compute_reward(delayed_outcomes)
        prior_estimate = value_function_cache[traj_id]
        
        # Adjust advantage retroactively
        advantage_correction = actual_reward - prior_estimate
        
        # Apply importance sampling correction (off-policy safety)
        # PPO-style symmetric clipping: constrain ratio to [1-clip_range, 1+clip_range]
        clip_range = 0.2  # Standard PPO value
        importance_weight = torch.clamp(
            action_prob_current / action_prob_old,
            1 - clip_range,
            1 + clip_range
        )
        
        # Compute clipped advantage correction loss
        advantage_correction = actual_reward - prior_estimate
        policy_loss = -(torch.minimum(
            importance_weight * advantage_correction,
            torch.clamp(importance_weight, 1 - clip_range, 1 + clip_range) * advantage_correction
        ))
        loss += policy_loss.mean()
    
    return loss
```

### Stable Baselines3 Configuration

```python
from stable_baselines3 import PPO
from stable_baselines3.common.env_util import make_vec_env

# 1. Vectorized environments for parallel rollouts
env = make_vec_env(
    CodeQualityEnv,
    n_envs=8,  # 8 parallel agents (skills)
    vec_env_cls=SubprocVecEnv,
)

# 2. PPO with tuned hyperparameters for code generation
model = PPO(
    policy="MlpPolicy",
    env=env,
    learning_rate=3e-4,
    n_steps=2048,              # Rollout buffer size
    batch_size=64,             # Mini-batch for updates
    n_epochs=10,               # Epochs per rollout
    gamma=0.99,                # Discount factor (accounts for 21d delay)
    gae_lambda=0.95,
    clip_range=0.2,
    clip_range_vf=0.2,
    ent_coef=0.01,             # Entropy for exploration
    verbose=1,
)

# 3. Callbacks for intermediate rewards + delayed reward correction
model.learn(
    total_timesteps=1_000_000,
    callback=[
        DelayedRewardCallback(),    # Apply 21d outcomes retroactively
        SurvivalMetricCallback(),   # Log survival_21d to OTEL
        RollbackTriggerCallback(),  # Halt training if survival drops
    ],
)
```

### Multi-Agent Coordination: Skill-Level Policies (Manual Weight Transfer)

**Architecture**: One policy per (agent, skill) pair; shared value function for transfer learning.

**⚠️ Important**: Stable Baselines3 does not natively support cross-policy weight sharing. 
This architecture achieves transfer learning through **manual weight transfer** — loading 
the value network from one trained skill as initialization for the next. This is a 
workaround, not a built-in SB3 feature.

```python
skills = [
    "refactor-api-endpoint",
    "write-integration-tests", 
    "debug-failing-tests",
    "add-observability",
]

base_policy_kwargs = dict(
    net_arch=dict(pi=[64, 64], vf=[64, 64]),  # Separate networks per policy
    activation_fn=th.nn.ReLU,
)

policies = {}
shared_vf_weights = None  # Will hold value network weights from first policy

for i, skill in enumerate(skills):
    env = CodeQualityEnv(skill)
    policies[skill] = PPO(
        policy="MlpPolicy",
        env=env,
        policy_kwargs=base_policy_kwargs,
        learning_rate=3e-4,
    )
    
    # Transfer learning: Use first policy's value network as warm-start for subsequent policies
    if i == 0:
        # Train first policy to convergence
        policies[skill].learn(total_timesteps=100000)
        shared_vf_weights = policies[skill].policy.value_net.state_dict()
    else:
        # Load value network weights from prior skill as initialization
        if shared_vf_weights:
            policies[skill].policy.value_net.load_state_dict(shared_vf_weights)

# Alternative: Use SurveyL2-based reward function to enforce consistency across skills
```

---

## 6. Feedback Integration Pipeline

### Data Flow: Git → OTEL → RL Reward Buffer

```
┌──────────────────────────────────────────────┐
│ 1. GitHub Webhook (Post-Merge Event)        │
│    - PR metadata + agent identity            │
│    - Commit hash + timestamp                 │
└──────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────┐
│ 2. Async Indexer (Real-time)                │
│    - Store metadata in feature store         │
│    - Emit OTEL span "code-generation"       │
│    - Tag with agent.name, tool.type         │
└──────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────┐
│ 3. Survival Measurement Cron (Scheduled)    │
│    - At +3d, +7d, +21d:                     │
│      * Run `git blame` on changed files    │
│      * Count lines still in HEAD             │
│      * Compute survival_rate                 │
│    - Emit OTEL checkpoint span with metrics  │
└──────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────┐
│ 4. OTEL Collector & Export                  │
│    - Route spans to feature store (Parquet)  │
│    - Buffer outcomes for weekly training     │
│    - Dashboard: Survival by agent/skill      │
└──────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────┐
│ 5. RL Training Loop (Weekly)                │
│    - Load feature store → trajectories       │
│    - Compute 21d rewards                     │
│    - Apply PPO updates                       │
│    - Save policy checkpoints                 │
└──────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────┐
│ 6. Deployment & Canary Testing              │
│    - Version new policies                    │
│    - Route 10% of requests to new agents    │
│    - Monitor survival_7d vs. baseline        │
│    - Auto-rollback on degradation            │
└──────────────────────────────────────────────┘
```

### Implementation: Python-Based Feedback Collector

```python
# feedback_collector.py

import json
import subprocess
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Dict, List

@dataclass
class CodeMetrics:
    commit_hash: str
    agent_name: str
    skill: str
    merge_time_hours: float
    survival_3d: float
    survival_7d: float
    survival_21d: float
    churn_7d: float
    deletion_21d: float

class SurvivalMeasurer:
    def __init__(self, repo_path: str):
        self.repo_path = repo_path
    
    def measure_survival_at_timestamp(
        self,
        commit_hash: str,
        target_timestamp: datetime,
    ) -> Dict[str, float]:
        """
        Measure survival at target_timestamp by:
        1. Checkout HEAD (current state)
        2. For each line in commit_hash, check if it still exists
        3. Compute survival_rate = (lines_still_present / original_lines)
        """
        
        # Get original lines from target commit
        original_lines = self._get_lines_from_commit(commit_hash)
        
        # Get current lines from HEAD
        current_lines = self._get_lines_from_head()
        
        # Compute metrics
        survival_rate = self._compute_survival(original_lines, current_lines)
        churn_rate = self._compute_churn(original_lines, current_lines)
        deletion_rate = self._compute_deletion(original_lines, current_lines)
        
        return {
            "survival_rate": survival_rate,
            "churn_rate": churn_rate,
            "deletion_rate": deletion_rate,
        }
    
    def _get_lines_from_commit(self, commit_hash: str) -> Set[str]:
        """Get hash of each line in commit_hash"""
        # Use git show + content hashing
        pass
    
    def _compute_survival(
        self,
        original_lines: Set[str],
        current_lines: Set[str],
    ) -> float:
        return len(original_lines & current_lines) / len(original_lines)

# Cron job: Measure at 3d, 7d, 21d
scheduler = APScheduler()

@scheduler.scheduled_job('cron', day_of_week=3)  # Every 3 days
def measure_survival_3d():
    for commit in pending_measurements_at_3d():
        measurer = SurvivalMeasurer(commit.repo_path)
        metrics = measurer.measure_survival_at_timestamp(
            commit.hash,
            datetime.now() - timedelta(days=3),
        )
        emit_otel_span("code-survival-checkpoint", attributes={
            "code.quality.survival_3d": metrics["survival_rate"],
            "agent.name": commit.agent_name,
            "git.commit_hash": commit.hash,
        })
```

---

## 7. Deployment Safety & Guardrails

### Canary Rollout Strategy

**Phase 1: Shadow Deployment** (1 week)
- New policy runs in parallel; results NOT used
- Monitor 7-day survival rate vs. baseline
- No user impact

**Phase 2: Canary** (2 weeks)
- Route 10% of requests to new policy
- Compare survival_7d, merge_rate to baseline
- If divergence > 2%, revert immediately

**Phase 3: Gradual Rollout** (2-4 weeks)
- 10% → 25% → 50% → 100%
- Monitor at each step
- Roll back if survival_21d drops

### Rollback Triggers

| Metric | Threshold | Action |
|--------|-----------|--------|
| `survival_21d` | < baseline - 2% | Immediate rollback |
| `churn_21d` | > baseline + 3% | Rollback after 24h |
| `merge_rate` | < baseline - 5% | Halt rollout (investigate) |
| `merge_time_hours` | > baseline * 2 | Pause (review friction) |

### Value Function Monitoring

Track the trained value function to detect **reward hacking** (e.g., agent finds spurious correlation):

```python
# Red flags for reward hacking
if value_function(observation) >> expected_value:
    # Policy may have exploited an artifact
    # Trigger manual code review of recent agent outputs
    log_alert("value-function-anomaly", severity="high")
    
if survival_21d_actual < predicted_value * 0.8:
    # Value function consistently overestimates
    # Retrain with calibration adjustment
    log_alert("value-prediction-miscalibration")
```

---

## 8. Monitoring & Observability

### OTEL Dashboard Schema

```yaml
# Grafana dashboard: Agent Code Quality

Panels:
  - Agent Comparison (Heatmap)
    Series: agent.name (rows) × survival_21d (color)
    Metric: code.quality.survival_21d
    
  - Skill Improvement Over Time (Time Series)
    Series: Per-skill survival_21d
    Aggregation: 7d rolling average
    
  - Churn Rate by Agent (Bar Chart)
    Metric: code.quality.churn_21d
    Comparison: Agent vs. human baseline
    
  - Merge Velocity (Box Plot)
    Metric: code.quality.merge_time_hours
    Grouping: agent.name
    
  - Policy Version Deployment (Stacked Area)
    Metric: % requests → policy_v1, policy_v2, etc.
    Trigger: Rollback on survival drop
```

### Key Queries (Prometheus-compatible)

```promql
# Average survival rate by agent (21 days)
avg(code_quality_survival_21d) by (agent_name)

# Survival degradation detection
code_quality_survival_21d < 0.75

# RL training frequency
increase(rl_policy_training_total[1w])

# Canary success (new policy maintains baseline)
(code_quality_survival_21d{policy_version="v2"} 
 / 
 code_quality_survival_21d{policy_version="v1"}) > 0.98
```

---

## 9. Implementation Roadmap

### Phase 1: Instrumentation (Weeks 1-2)
- [ ] Git webhook → OTEL span emitter
- [ ] `SurvivalMeasurer` cron job (3d checkpoint)
- [ ] OTEL collector export to Parquet feature store
- [ ] Dashboard: Survival by agent

### Phase 2: RL Environment (Weeks 3-4)
- [ ] Gymnasium-compatible `CodeQualityEnv`
- [ ] Reward function (21d outcomes + immediate proxies)
- [ ] Stable Baselines3 PPO setup
- [ ] Delayed reward correction callback

### Phase 3: Training Loop (Weeks 5-6)
- [ ] Weekly training cron
- [ ] Policy versioning + checkpointing
- [ ] Canary deployment infrastructure
- [ ] Rollback triggers

### Phase 4: Production Deployment (Weeks 7-8)
- [ ] Shadow testing (1 week, phase 1)
- [ ] Canary rollout (phase 2)
- [ ] Gradual rollout (phase 3)
- [ ] Monitoring + alerting

---

## 10. Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **Reward hacking** | High | Critical | Value function anomaly detection; manual code review; hold-out test set |
| **Distribution shift** (new codebase) | Medium | High | Transfer learning via shared value function; domain adaptation layer |
| **21d training latency** | High | Medium | Auxiliary immediate rewards (merge time, reviews); policy distillation |
| **Data quality (Git blame failures)** | Medium | Medium | Validation checks; fallback to PR size + review count |
| **Agent diversity (models diverge)** | Medium | High | Centralized policy hub; skill-specific fine-tuning only |

---

## 11. Success Metrics

### Primary (21-day outcomes) — Hypothesis-Level Projections

These targets are projections based on reward structure design. Validation requires Phase 1 pilot implementation with controlled rollout and empirical measurement. See Whitepaper §9 for full qualification.

- **Survival Rate @ 21d**: Hypothesis Target ≥ 85% (baseline: agent 75-78%, human ~90%)
- **Churn Rate @ 21d**: Hypothesis Target ≤ 10% (baseline: agent 15-18%, human ~5%)
- **Agent-to-Human Code Quality Ratio**: Hypothesis Target ≥ 0.90
  - Computed as: `min(survival_agent / survival_human, (1 - churn_agent) / (1 - churn_human))`
  - Current baseline ratio: ~0.83-0.87 (agent 75-81% survival vs. human 90%)

### Secondary (user experience)
- **Merge Rate**: Target ≥ 90% (code passes review)
- **Merge Time**: Target ≤ 4 hours median
- **Review Comments**: Target ≤ 2 per PR (clarity proxy)

### Tertiary (system health)
- **Policy Update Frequency**: ≥ 1 per week
- **Canary Rollback Rate**: ≤ 5% (stability)
- **Value Function Calibration Error**: ≤ 10%

---

## References

1. **Popescu et al. (2026)**: "Investigating Autonomous Agent Contributions in the Wild: Activity Patterns and Code Change over Time". arXiv:2604.00917v1. https://arxiv.org/html/2604.00917v1

2. **Schulman et al. (2017)**: "Proximal Policy Optimization Algorithms". arXiv:1707.06347

3. **Stable Baselines3 (2021)**: https://stable-baselines3.readthedocs.io/en/master/

4. **Gymnasium (Farama Foundation)**: Fork of OpenAI Gym, maintained by Farama Foundation. https://gymnasium.farama.org/

5. **OpenTelemetry (CNCF)**: https://opentelemetry.io/docs/

6. **Pufferlib (Suarez, J., et al., 2024)**: Vectorized reinforcement learning library with parallel environment support and 1M+ steps/second performance. https://pypi.org/project/pufferlib/

---

**Document Generated**: April 3, 2026  
**Next Steps**: Implement Phase 1 (Git webhook + OTEL instrumentation)
