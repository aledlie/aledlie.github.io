---
layout: single
title: "Wiz.io Security Explainability UX Research"
date: 2026-02-06
author_profile: true
breadcrumbs: true
permalink: /reports/wiz-io-security-explainability-ux/
categories: [research, ux-design]
tags: [wiz-io, security, explainability, ux-patterns, cloud-security]
excerpt: "Research into Wiz.io's UI/UX patterns for presenting complex security findings in an understandable, actionable way."
header:
  overlay_image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
---

# Wiz.io Security Explainability UX Research

Research into Wiz.io's UI/UX patterns for presenting complex security findings in an understandable, actionable way. Focused on concrete design patterns applicable to security and observability tooling.

## 1. Platform Overview

Wiz is a cloud-native application protection platform (CNAPP) that unifies multiple security domains into a single interface, built on an agentless, graph-based architecture.

**Core Product Areas:**
- **CSPM** - Cloud Security Posture Management (misconfiguration detection)
- **CWPP** - Cloud Workload Protection Platform (workload scanning)
- **CIEM** - Cloud Infrastructure Entitlement Management (identity/access governance)
- **DSPM** - Data Security Posture Management (sensitive data discovery)
- **CDR** - Cloud Detection and Response (threat detection)
- **Vulnerability Management** - Agentless vulnerability scanning
- **AI-SPM** - AI Security Posture Management
- **Code Security** - IaC scanning and supply chain security

**Key Differentiator:** Agentless scanning + graph database architecture (Amazon Neptune) that correlates risks across all domains rather than treating them as separate point solutions.

---

## 2. Security Graph: Core Visualization Pattern

The Wiz Security Graph is the foundational UX paradigm. It is not merely a visualization layer -- it is the database, the normalizing data model, and the analysis layer combined.

### Architecture
- Built on Amazon Neptune (graph database)
- Stores hundreds of billions of relationships
- Nodes = cloud resources (VMs, containers, databases, APIs, identities, data stores)
- Edges = relationships (network access, permissions, data flows, exposure paths)
- Real-time event capture from cloud providers

### How It Communicates Security Context

**Toxic Combinations (the core explainability concept):**
- Individual risks (a misconfiguration, a vulnerability, a public exposure) displayed in isolation may appear low severity
- The graph reveals combinations where multiple low-severity risks chain together into a critical attack path
- Example: `public-facing VM` + `unpatched CVE` + `lateral movement path` + `access to sensitive database` = critical toxic combination
- This moves from "you have 10,000 vulnerabilities" to "these 12 combinations are actually exploitable"

**Graph Query Interface:**
- Custom query language (Wiz Query Language) for power users
- Path-based queries to explore relationships across data, identity, exposure, and risk
- Natural language query via "Ask AI" / Mika AI (RAG-powered text-to-graph-query engine)
- Users without graph expertise can ask questions like "Show me all internet-facing resources with access to PII"

### Design Pattern Takeaways

| Pattern | Implementation |
|---------|---------------|
| Relationship-first model | Show connections between entities, not just flat lists |
| Toxic combination surfacing | Correlate multiple risk signals into composite findings |
| Dual query modes | Expert query language + natural language for accessibility |
| Context-as-data-model | Store relationships in the data layer, not just the view |

---

## 3. Attack Path Visualization

Attack paths are the primary mechanism Wiz uses to explain **why** a finding matters.

### How It Works
1. Graph traversal identifies sequences of actions an attacker could take
2. Each step in the path is a concrete, verifiable relationship (not hypothetical)
3. Paths terminate at critical assets (databases with sensitive data, admin accounts)
4. Visual representation shows the exploitable pathway end-to-end

### UI Patterns
- **Linear path visualization**: Left-to-right or top-to-bottom flow showing attacker progression
- **Node annotations**: Each node in the path shows the resource type, risk factor, and its role in the chain
- **Severity escalation**: Visual indication of how risk compounds at each hop
- **Root cause highlighting**: Starting point of the attack path emphasized
- **Blast radius indication**: What gets impacted if the path is exploited

### Design Pattern Takeaways
- Attack paths answer "so what?" for every finding
- A single graph view replaces multiple disconnected alert types
- Path visualization makes non-obvious risk chains visible to non-experts
- Each node in the path is clickable for deeper investigation (progressive disclosure)

---

## 4. Risk Scoring and Issue Prioritization

Wiz explicitly moves beyond traditional CVSS-only scoring to context-aware prioritization.

### Prioritization Dimensions
- **Vulnerability severity** (CVSS as one input, not the sole factor)
- **Exploitability** (is there a known exploit? is it in KEV?)
- **Exposure** (internet-facing, publicly reachable)
- **Identity paths and permissions** (lateral movement potential)
- **Data sensitivity** (does it lead to PII, secrets, financial data?)
- **Runtime signals** (is it actually running in production?)
- **Code reachability** (is the vulnerable function actually called?)

### Two Issue Types

**Risk Issues:**
- Span multiple security domains (cross-domain toxic combinations)
- Represent immediately exploitable attack paths
- Highest urgency; require immediate response

**Posture Issues:**
- Group findings within a single domain (e.g., all vulnerabilities matching criteria)
- Not immediately exploitable but must be addressed for posture maintenance
- Driven by Posture Policies (customizable rules for grouping/promoting findings)
- Enable backlog management with SLA tracking
- Transform a noisy CVE list into a prioritized, assignable work queue

### Severity Communication
- Standard severity levels: Critical, High, Medium, Low
- But severity is contextual -- a "Medium" CVSS vulnerability in a toxic combination may surface as a "Critical" Issue
- Risk scoring communicates compound risk, not individual finding severity

### Design Pattern Takeaways

| Pattern | Benefit |
|---------|---------|
| Multi-factor risk scoring | Reduces alert fatigue; surfaces real risk |
| Separate urgency tracks (Risk vs Posture) | Matches different response workflows |
| Policy-driven grouping | Consolidates hundreds of findings into actionable issues |
| SLA-aware prioritization | Ties security work to business commitments |
| Contextual severity override | CVSS 6.0 + public exposure + sensitive data = Critical |

---

## 5. Dashboard and Data Visualization

### Executive/Posture Dashboard
- **Compliance heatmap**: Bird's-eye view across all compliance frameworks (100+ supported: CIS, NIST, SOC2, HIPAA, HiTrust, etc.)
- Overall compliance score per framework rendered as color-coded cells
- Cross-framework heatmap shows where gaps overlap across standards
- Top-down drill-down: Framework > Categories > Controls > Resource-level assessments

### Vulnerability Dashboard
- Centralized view collecting all vulnerability data for the remediation team
- **Risk funnel**: Shows where you are in terms of each impact stage
- Key metrics: time to triage, time to patch, exploitable risk percentage resolved in production
- Breakdown by risk impact visible per vulnerability

### Non-Human Identities Dashboard
- Holistic view of service accounts, API keys, machine identities
- Prioritized queue of identity-related risks
- Surfaces risky service accounts (admin/high privileges)
- Lateral movement path detection from identity perspective

### AI Security Dashboard
- AI security posture overview
- Prioritized risk queue specific to AI/ML workloads
- Maps AI model deployments, training data, and inference endpoints

### Exposure Management Dashboard
- Single pane of glass across cloud, on-prem, code, AI, SaaS
- Centralizes findings from external scanners + native scanners
- Deduplicates and correlates findings from all sources

### Reporting
- Scheduled, role-based reports: executive vs. operator vs. auditor
- Editable templates for board-level risk communication
- On-demand dashboards for day-to-day operations
- Trend tracking: MTTR, recurrence rate, SLA adherence over time

### Design Pattern Takeaways
- Heatmaps for compliance posture (high information density, scannable)
- Funnel visualization for vulnerability lifecycle tracking
- Role-specific dashboard views (executive, operator, auditor)
- Cross-framework overlap visualization reduces duplicate effort
- Drill-down from summary to resource-level detail

---

## 6. Explainability Patterns

### Remediation Guidance

**AI-Powered Remediation 2.0:**
- "Choose Your Own Remediation Path" -- users select a remediation strategy, AI generates specific steps for that strategy
- Combines GenAI with Wiz Research team's attack path expertise
- Breaks down toxic combinations into concrete, actionable steps
- Generates remediation as: UI guidance, Terraform code, or CLI commands
- Links suggested changes directly in collaboration tools (Slack, Jira)

**Remediation Context Includes:**
- Why the issue matters (attack path visualization)
- What the recommended fix is (step-by-step)
- Who should own the fix (automated ownership detection)
- How to implement it (code generation for the chosen path)

### Mika AI (Natural Language Explainability)

**Capabilities:**
- Natural language queries against the Security Graph
- Explain findings in plain language
- Surface supporting evidence for any finding
- Automate policy creation from descriptions
- Text-to-query engine using RAG (retrieval-augmented generation)
- Zero-shot and few-shot learning for query generation

**UX Flow:**
1. User asks a question in natural language
2. System translates to graph query
3. Results returned with contextual explanation
4. User can drill down or ask follow-up questions

### AI Agents (Agentic Automation)

**Issues Agent:**
- Automatically evaluates most efficient remediation paths
- Surfaces issue-specific steps and recommended owners in the UI
- Can trigger pull requests to development teams
- Links context directly in Slack/Jira

**SecOps Agent:**
- Triages alerts at scale automatically
- Validates severity through graph correlation
- Produces explainable reports SOC teams can trust
- Correlates attack paths during active incidents

### MCP Server Integration
- Model Context Protocol server for external AI tool integration
- Translates natural language into Wiz-specific operations
- Enables investigation time reduction (reported: 30-45 min to ~4 min per ticket at Grammarly)
- Maintains security boundaries while enabling AI access

### Design Pattern Takeaways
- Remediation must be strategy-aware, not one-size-fits-all
- Generated code for the chosen fix reduces time-to-action
- AI explanations must show supporting evidence, not just conclusions
- Agentic automation handles triage at scale while maintaining explainability
- MCP integration enables AI-native security workflows

---

## 7. Information Architecture

### Unified Console Model
Wiz consolidates CSPM, CWPP, CIEM, DSPM, CDR, Vulnerability Management, Code Security, and AI-SPM into a single console. The Security Graph is the unifying data model.

### Organizational Structure

```
Platform
  |-- Wiz Cloud (posture management)
  |     |-- Security Graph (query + visualize)
  |     |-- Issues (Risk Issues + Posture Issues)
  |     |-- Compliance (frameworks + heatmaps)
  |     |-- Dashboards (vulnerability, identity, AI, etc.)
  |
  |-- Wiz Code (shift-left)
  |     |-- IaC scanning
  |     |-- Supply chain security
  |     |-- Code-to-cloud traceability
  |
  |-- Wiz Defend (detection + response)
  |     |-- Threat detection
  |     |-- Incident response
  |     |-- Runtime monitoring
  |
  |-- Exposure Management
  |     |-- Unified vulnerability management
  |     |-- Attack surface management
  |     |-- External + internal scanner aggregation
  |
  |-- Integrations
        |-- Jira, Slack, ServiceNow (ticket routing)
        |-- CI/CD pipelines
        |-- MCP Server (AI tool integration)
        |-- SIEM/SOAR platforms
```

### Navigation Philosophy
- Domain-specific dashboards accessible from unified console
- Graph is the common exploration layer across all domains
- Issues are the common action unit across all domains
- Any resource can be explored in graph context regardless of entry point

### Design Pattern Takeaways
- Single data model (graph) unifies otherwise fragmented security domains
- Two universal primitives: Graph (for exploration) and Issues (for action)
- Entry points are domain-specific, but investigation is cross-domain
- Integration layer pushes findings into existing developer workflows

---

## 8. Best Practices for Security/Observability Tools

Distilled from Wiz's approach, applicable to building security and observability UX.

### Making Complex Graph Relationships Understandable
- **Use attack paths as the narrative structure** -- a linear path is easier to read than a full graph
- **Surface toxic combinations, not individual nodes** -- composite findings are more actionable
- **Offer dual query modes** -- expert query language for power users, natural language for everyone else
- **Annotate nodes with their role in the risk chain** -- "entry point", "lateral movement", "target asset"
- **Make the graph explorable, not just viewable** -- click any node to see its full context

### Progressive Disclosure of Security Detail
- **Level 1: Dashboard** -- aggregate posture scores, heatmaps, top-N critical issues
- **Level 2: Issue list** -- filtered, prioritized issues with severity and status
- **Level 3: Issue detail** -- attack path, affected resources, risk factors, remediation guidance
- **Level 4: Resource detail** -- full graph context for any resource, all relationships
- **Level 5: Raw data** -- configuration details, scan results, event logs
- Each level provides enough context to decide whether to drill deeper

### Risk Communication and Prioritization Visualization
- **Multi-factor risk scoring** -- never use a single severity score (CVSS alone is insufficient)
- **Contextual severity** -- same vulnerability can be Critical or Low depending on exposure, data sensitivity, and reachability
- **Separate urgency tracks** -- immediately exploitable (Risk Issues) vs. posture maintenance (Posture Issues)
- **Funnel visualization** -- show pipeline from detection through triage to resolution
- **Heatmaps for coverage** -- quickly identify gaps across frameworks, regions, accounts
- **Trend lines** -- MTTR, recurrence rate, SLA adherence over time

### Actionable Alert Design
- **Include the "why"** -- attack path or toxic combination, not just the finding
- **Include the "who"** -- automated ownership detection and routing
- **Include the "how"** -- concrete remediation steps, ideally generated code
- **Offer remediation strategy choice** -- "patch", "isolate", "restrict access" with steps for each
- **Deduplicate aggressively** -- consolidate related findings into single actionable issues
- **Route to existing tools** -- Jira tickets, Slack messages, PR suggestions, not just a security portal

### Security Context Presentation
- **Graph-first context** -- show relationships, not just attributes
- **Blast radius visualization** -- what gets impacted if this is exploited
- **Evidence-backed explanations** -- AI-generated explanations must cite specific graph relationships
- **Role-appropriate detail** -- executive summary vs. operator detail vs. auditor evidence
- **Cross-domain correlation** -- connect code findings to cloud misconfigurations to runtime behavior

---

## 9. Key Patterns Summary

| Wiz Pattern | Abstracted Design Principle |
|-------------|---------------------------|
| Security Graph | Relationship-first data model enables cross-domain correlation |
| Toxic Combinations | Composite risk findings are more actionable than individual alerts |
| Attack Path Visualization | Linear narrative structure makes graph data readable |
| Risk vs Posture Issues | Separate urgency tracks match different response workflows |
| Compliance Heatmap | High-density overview with drill-down for detailed investigation |
| AI-Powered Remediation 2.0 | Strategy-aware, code-generating remediation guidance |
| Mika AI / Ask AI | Natural language access to complex security data |
| AI Agents (Issues, SecOps) | Agentic triage and remediation at scale with explainability |
| MCP Server | Standard protocol for AI tool integration into security workflows |
| Posture Policies | User-defined rules for grouping and prioritizing findings |

---

## Sources

- [Wiz Platform Overview](https://www.wiz.io/platform)
- [Wiz Security Graph: How It Works](https://www.wiz.io/lp/wiz-security-graph)
- [How Wiz Reimagines Cloud Security Using a Graph in Amazon Neptune (AWS)](https://aws.amazon.com/blogs/database/the-world-is-a-graph-how-wiz-reimagines-cloud-security-using-a-graph-in-amazon-neptune/)
- [Anatomy of a Toxic Combination of Risk](https://www.wiz.io/blog/the-anatomy-of-a-toxic-combination-of-risk)
- [Security Graph Root Cause Analysis for Cloud IR](https://www.wiz.io/blog/wiz-security-graph-enhances-cloud-incident-response)
- [Introducing Posture Issues](https://www.wiz.io/blog/introducing-posture-issues-transform-security-findings-into-actionable-outcomes)
- [AI-Powered Remediation 2.0](https://www.wiz.io/blog/introducing-ai-powered-remediation-2-0)
- [AI Agents in Wiz](https://www.wiz.io/blog/wiz-ai-agents)
- [Building a Text-to-Query Engine (Ask AI)](https://www.wiz.io/blog/askai-text-to-security-graph-query)
- [Wiz Ask AI Suite](https://www.wiz.io/lp/wiz-ask-ai)
- [MCP Server for Wiz](https://www.wiz.io/blog/introducing-mcp-server-for-wiz)
- [Grammarly Uses Wiz MCP](https://www.wiz.io/blog/grammarly-mcp-ai-server)
- [Assess Cloud Compliance Posture in Minutes](https://www.wiz.io/blog/wiz-cloud-compliance-posture)
- [Continuous Cloud Compliance](https://www.wiz.io/solutions/compliance)
- [Non-Human Identities Dashboard](https://www.wiz.io/blog/non-human-identities-dashboard)
- [Wiz for Exposure Management](https://www.wiz.io/blog/introducing-wiz-for-exposure-management)
- [Wiz Remediation Best Practices](https://www.wiz.io/blog/wiz-remediation-and-response-security-best-practices)
- [Cloud Vulnerability Remediation](https://www.wiz.io/blog/operationalize-vulnerability-remediation)
- [Vulnerability Prioritization](https://www.wiz.io/academy/vulnerability-prioritization)
- [Risk-Based Vulnerability Management](https://www.wiz.io/academy/vulnerability-management/risk-based-vulnerability-management)
- [Attack Path Analysis](https://www.wiz.io/academy/detection-and-response/attack-path-analysis)
- [Wiz and Jira Integration](https://www.wiz.io/integrations/jira)
- [Security Built for Developers](https://www.wiz.io/blog/what-security-should-look-like-when-built-for-developers)
- [Identify and Prioritize Security Risks with Wiz and Google Cloud](https://cloud.google.com/architecture/partners/id-prioritize-security-risks-with-wiz)
- [Recreating Wiz's Security Graph with PuppyGraph](https://www.puppygraph.com/blog/wiz-security-graph)
