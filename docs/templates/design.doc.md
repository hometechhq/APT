# <Feature Title> — Design Document
Version: <x.y.z>  
Created: <YYYY-MM-DD>  
Owners: <PM/Tech Lead>  
Status: Draft | In Review | Approved

## Table of Contents
1. Executive Summary
2. Personas & Jobs-to-Be-Done
3. Market & Prospectus
4. Frontend Design
5. Backend Design
6. Identity Design
7. Architecture
8. Data Flows
9. Roadmap
10. Dependency Prep Checklist (Phase 1.5)
11. Risks & Mitigations
12. Open Questions & Decisions Log

---

## 1. Executive Summary
<Concise overview of the feature/product, goals, and success metrics.>

## 2. Personas & Jobs-to-Be-Done
<Primary and secondary personas; JTBD statements tied to acceptance metrics.>

## 3. Market & Prospectus  _(Research Analyst Agent)_
- **TAM/SAM/SOM (12–24 mo):** <figures + assumptions>  
- **Competitive Landscape:** <top alternatives and our wedge>  
- **Pricing & Packaging (hypothesis):** <tiers, value fences>  
- **Cost-to-Deliver & Margin Model:** <drivers & sensitivities>  
- **Evidence & Sources:** <links, reports, pilots>

## 4. Frontend Design  _(Frontend Designer Agent)_
- **Platforms & Budgets:** LCP/TTI/bundle targets  
- **Information Architecture & Navigation:** <routes>  
- **Screens & Components:** <state tables>  
- **Key User Flows:** <Mermaid allowed>  
- **Accessibility & i18n:** WCAG 2.2 AA; locales  
- **Client State & Offline:** <cache, persistence, sync>  
- **Telemetry & Privacy:** <events, consent, redaction>

## 5. Backend Design  _(Backend Designer Agent)_
- **Data Models & Relationships:** <entities, fields, growth>  
- **APIs & Services:** internal/external with SLAs  
- **Processing Flows:** sync/async/batch jobs  
- **Storage & Scaling Strategy:** <sql/nosql/blob/cache>  
- **Compliance & Observability:** logs, audits, metrics

## 6. Identity Design  _(Identity Designer Agent)_
- **Authentication:** IdPs, protocols, MFA  
- **Authorization:** roles, permissions, model (RBAC/ABAC/Hybrid)  
- **Federation & Lifecycle:** provisioning/deprovisioning  
- **Compliance & Audit:** events, retention, destinations

## 7. Architecture  _(Architect Agent)_
- **Cloud & Regions:** primary/DR; residency  
- **Runtime & Workloads:** containers/serverless/mixed  
- **Data Layer & Resilience:** DBs, RPO/RTO, encryption  
- **Networking & Security Boundaries:** ingress/egress, secrets, trust  
- **Environments & Releases:** dev/test/stage/prod; strategy  
- **Observability & Ops:** logs, traces, SLOs; runbooks  
- **Cost & Tagging:** budgets, tags

## 8. Data Flows  _(Data Flow Agent)_
- **Actors & Systems Inventory:** IDs → names  
- **Sequence Diagrams (Mermaid):** critical journeys  
- **Data Classification Map:** PII/PHI/internal/public  
- **Failure Handling:** timeouts, retries, DLQs, compensation  
- **Observability Hooks:** logs/metrics/traces; synthetic tests

## 9. Roadmap  _(Planner Agent)_
- **Milestones & Critical Path:** serialized vs parallel work  
- **Approvals:** stage/prod human validation instructions

## 10. Dependency Prep Checklist (Phase 1.5)  _(Planner Agent)_
> **All items below must be `available` before Integration begins.**  
For each dependency, provide ID, name, kind (`account|credential|api|infra|contract|repo|license|data|feature`), provider, provisioner hint, owner, due-by, status, evidence links, approvals.

| ID | Name | Kind | Provider | Provisioner Hint | Owner | Due By | Status | Evidence | Approvals |
|---|---|---|---|---|---|---|---|---|---|
| DEP-XXXX | … | credential | GitHub | “Create OIDC + repo token in n8n” | SecOps | 2025-09-10 | to_provision | link/ticket | Finance: requested |

## 11. Risks & Mitigations
| Risk ID | Description | Likelihood | Impact | Mitigations | Tripwires |
|---|---|---|---|---|---|
| R1 | … | medium | high | … | … |

## 12. Open Questions & Decisions Log
- **Q:** … → **A/Decision:** … (date, owner)  
- **Q:** … → **A/Decision:** …

---
_Appendix:_  
- Change history (date, author, summary)  
- Glossary  
