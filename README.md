# AI Dev Tasks

## 1) Project Overview

**AI Dev Tasks** is a schema-first, orchestrator-driven framework that turns a feature idea into deployed code through four phases:

1. **Design Phase (ChatGPT) — dual-audience & modular**
   - Executed by a **team of specialized agents**, each producing two deliverables:
     - **Human-oriented spec sections** → appended to `/design/docs/<feature>.md` for stakeholders.  
     - **Machine-oriented artifacts** → `/design/*.json`, validated against `/specs/*.schema.json`, for automation.  
   - **Agents and responsibilities:**
     - **Research Analyst Agent** → *Product Research & Prospectus*: market, competitors, TAM/SAM/SOM, pricing, **cost-to-deliver**, **margin projections**.  
       - Human: prospectus narrative.  
       - AI: `research.json`.  
     - **Backend Designer Agent** → *Backend Design*: processing flows, data models, APIs, storage/scaling trade-offs.  
       - Human: backend design section.  
       - AI: `backend.json`.  
     - **Frontend Designer Agent** → *Frontend Design*: pages, components, flows, accessibility, wireframes/mermaid diagrams.  
       - Human: UI/UX section.  
       - AI: `frontend.json`.  
     - **Architect Agent** → *Architecture Design*: hosted environment, deployment topology, infra dependencies.  
       - Human: architecture diagrams/overview.  
       - AI: `architecture.json`.  
     - **Identity Designer Agent** → *Identity Design*: authn/authz, roles, MFA, IdP integration.  
       - Human: identity design section.  
       - AI: `identity.json`.  
     - **Data Flow Agent** → *Data Flow Diagrams*: request/data lifecycles across components.  
       - Human: sequence/data flow diagrams.  
       - AI: `dataflow.json`.  
     - **Planner Agent** → *Execution Plan*: consolidate modules into a task DAG.  
       - Human: roadmap section.  
       - AI: `plan.json`.  
   - **Iteration protocol:** one agent runs → produce dual outputs → stakeholder approves human doc → commit → move to next agent.  
     The final design doc is all sections combined; JSON artifacts form execution contracts.

2. **Dependency Prep Phase (Human + ChatGPT support)**
   - **Goal:** ensure all external/environmental dependencies are defined and ready before Integration.  
   - **Deliverables:**
     - Human-oriented *Dependencies Checklist* → appended to `/design/docs/<feature>.md`.  
     - Machine artifact: `dependencies.json` (validates `/specs/Dependencies.schema.json`) listing:
       - required libraries, APIs, services, credentials, infra resources,  
       - each marked as `available`, `missing`, or `manual` (human action needed).  
   - **Responsibilities:**
     - Humans confirm environment readiness (e.g., DB seeded, cloud resources provisioned).  
     - Planner Agent updates `plan.json` so tasks include explicit `depends_on` references to `dependencies.json`.  
   - **Result:** Integration won’t start until required dependencies are marked “available,” preventing AI tasks from failing due to missing prerequisites.

3. **Integration Phase (n8n implementation) — agentic build loop**
   - This phase is run by a **set of implementation agents** under n8n orchestration.  
   - **Agents and responsibilities:**
     - **Manager Agent** → reads `plan.json`, selects first `pending` task with dependencies met.  
     - **Implementor Agent** → produces a `ReturnEnvelope` (validates `/specs/ReturnEnvelope.schema.json`) with diff, files, tests, costs, notes.  
     - **Reviewer Agent** → validates acceptance criteria, scope, CI results; issues verdict (`approved`, `needs_changes`, `escalate`).  
     - **CI Gate** → runs lint, tests, build, and optional static analysis.  
   - **Iteration protocol:**
     1. Manager selects next task.  
     2. Implementor produces ReturnEnvelope.  
     3. Orchestrator applies files, runs CI.  
     4. Reviewer issues verdict → approve/needs_changes/escalate.  
     5. Loop until all tasks are completed or skipped (idempotency satisfied).  
   - **Outputs:**
     - One commit per task (message: `Task <id>: <title>`).  
     - Updated `plan.json` with statuses.  
     - `/state/runs/<run-id>/task-<id>.json` snapshots for audit/resume.  
   - **Quality gates:** schema compliance, passing tests, minimal diffs, idempotency enforcement.

4. **Deployment Phase (n8n CD) — controlled promotion & rollback**
   - After Integration lands code, the Deployment Phase promotes a built artifact across environments safely and audibly.  
   - **Agents and responsibilities:**
     - **CD Manager Agent** → reads `release.json`, selects next environment, enforces order, respects approvals.  
     - **Deployer Agent** → produces `DeployEnvelope` (validates `/specs/DeployEnvelope.schema.json`) with strategy, commands/Helm values, rollback plan.  
     - **DBA Agent** → produces `DBChangeEnvelope` (validates `/specs/DBChangeEnvelope.schema.json`), ensures backups, migrations, rollback.  
     - **Tester Agent** → produces `TestReport` specs (validates `/specs/TestReport.schema.json`); orchestrator executes suites and captures results.  
     - **SRE Reviewer Agent** → verdict: `promote`, `retry`, `rollback`, or `hold`.  
   - **Iteration protocol:**
     1. CD Manager picks next environment.  
     2. Deployer plans; orchestrator executes deploy.  
     3. DBA handles backups/migrations if defined.  
     4. Tester defines/runs suites, produces TestReports.  
     5. Health checks run; results attached to DeployEnvelope.  
     6. SRE Reviewer issues verdict.  
     7. Loop until all environments are promoted or halted.  
   - **Outputs:**
     - DeployEnvelope per environment.  
     - DBChangeEnvelope for migrations.  
     - TestReports for suites.  
     - Logs/artifacts under `/state/cd/<run-id>/<env>/`.  
     - Final release status (successful prod or rollback summary).  
   - **Quality gates:** schema compliance, test pass, health checks within budgets, rollback plan required for prod, approvals honored.

### Principles
- **Schema-first:** all artifacts must validate against `/specs/*.schema.json`.  
- **Orchestrator-driven:** agents only plan; n8n performs side effects.  
- **Dual-audience design:** humans get a stakeholder-readable spec; AI gets machine contracts.  
- **Auditable & resumable:** design lives in `/design/`; runtime artifacts in `/state/`.

### Who this is for
- Product teams needing both stakeholder clarity and deterministic automation.  
- Engineers wanting CI-gated, resumable AI-driven implementation.  
- SREs/Leads needing deployment gates, rollback, and audit trails.

### Why this exists
- To connect **business viability** (prospectus with explicit margins) → **technical design** (backend, frontend, architecture, identity, data flows, dependencies) → **delivery** (integration and deployment) with safety and predictability.

```mermaid

flowchart TD

  %% style for human touch points
  classDef human fill:#fff6d5,stroke:#d4a300,color:#3d2e00;

  %% phase 1 design
  subgraph Phase1[Phase 1: Design]
    HREQ[Human requester submits idea]

    Research[Research Analyst Agent] --> Doc1[Append to design docs]
    Research --> Art1[Write research.json]

    Backend[Backend Designer Agent] --> Doc1
    Backend --> Art2[Write backend.json]

    Frontend[Frontend Designer Agent] --> Doc1
    Frontend --> Art3[Write frontend.json]

    Architect[Architect Agent] --> Doc1
    Architect --> Art4[Write architecture.json]

    Identity[Identity Designer Agent] --> Doc1
    Identity --> Art5[Write identity.json]

    DataFlow[Data Flow Agent] --> Doc1
    DataFlow --> Art6[Write dataflow.json]

    Planner[Planner Agent] --> Doc1
    Planner --> Art7[Write plan.json]

    HREV[Human review approve or request changes]
    Doc1 --> HREV
    HREV -- approve --> D_OK[Design package approved]
    HREV -- request changes --> Revise[Agent revises module] --> Doc1

    HREQ --> Research
    Research --> Backend --> Frontend --> Architect --> Identity --> DataFlow --> Planner
  end

  %% phase 1.5 dependency prep
  subgraph Phase15[Phase 2: Dependency Prep]
    DepAnalyst[Dependency Analyst] --> DepJSON[Write dependencies.json]
    D_OK --> DepAnalyst
    Preflight[Human preflight check libs apis creds infra ready]
    DepJSON --> Preflight
    Preflight -- confirm ready --> DepReady[Dependencies ready]
    Preflight -- missing or manual --> FixGaps[Human resolves gaps] --> Preflight
  end

  %% phase 2 integration
  subgraph Phase2[Phase 3: Integration]
    Manager[Manager Agent selects next task] --> Implementor[Implementor Agent produces ReturnEnvelope]
    Implementor --> Apply[Orchestrator applies files]
    Apply --> CI[CI run lint tests build]
    CI --> Reviewer[Reviewer Agent]

    Reviewer -- approved --> Commit[Commit one per task and update plan.json]
    Reviewer -- needs changes --> Implementor
    Reviewer -- escalate model tier --> Implementor
    CI -- fail --> Implementor

    Commit --> MoreTasks{More tasks}
    MoreTasks -- yes --> Manager
    MoreTasks -- no --> IntDone[Integration complete]
    DepReady --> Manager
  end

  %% phase 3 deployment
  subgraph Phase3[Phase 4: Deployment]
    CDM[CD Manager Agent selects next environment] --> Deployer[Deployer Agent plans deployment]
    Deployer --> ExecDeploy[Orchestrator executes deployment]
    ExecDeploy --> DBQ{Database changes}
    DBQ -- yes --> DBA[DBA Agent plans db changes] --> ExecDB[Backup and migrate with checks]
    DBQ -- no --> Tester[Tester Agent defines suites]
    ExecDB --> Tester
    Tester --> RunTests[Orchestrator runs tests and captures reports]
    RunTests --> Health[Orchestrator runs health checks]
    Health --> SRE[SRE Reviewer Agent decides]

    SRE -- promote --> NextEnv{More environments}
    NextEnv -- yes --> CDM
    NextEnv -- no --> ReleaseDone[Release complete in prod]

    SRE -- retry --> Deployer
    SRE -- rollback --> Rollback[Orchestrator executes rollback plan] --> CDM
    SRE -- hold --> HumanApprove[Human approval required] --> CDM

    IntDone --> CDM
  end

  %% apply human styling
  class HREQ,HREV,Preflight,FixGaps,HumanApprove human;


```

## 2) What’s New in this Version

This version represents a major step forward from earlier iterations of AI Dev Tasks.  
The core updates are:

- **Four-Phase Lifecycle**  
  Previously the lifecycle was 3 phases. We now explicitly split out a **Dependency Prep Phase** between Design and Integration.  
  • Design → Dependency Prep → Integration → Deployment.  
  • This ensures Integration only begins once all external prerequisites are confirmed ready.

- **Dual-Audience Design Deliverables**  
  The Design Phase now always produces:  
  • **Human-oriented documentation** (`/design/docs/<feature>.md`) for stakeholders to read, understand, and approve.  
  • **Machine-oriented JSON artifacts** (`/design/*.json`) that validate against strict schemas for automation.  
  Stakeholders get clarity up front; AI agents get precise execution contracts.

- **Expanded Design Agents**  
  Design Phase is modular, with specialized agents covering:  
  • Product Research & Prospectus (including margin analysis),  
  • Backend Design, Frontend Design, Architecture, Identity, Data Flows,  
  • Planner for the execution DAG.  
  Each agent works iteratively, so the design spec grows step by step with human review.

- **Dependency Management**  
  New `dependencies.json` artifact and *Dependencies Checklist* section in the human doc.  
  Humans confirm availability of libraries, services, APIs, credentials, or infra before Integration starts.  
  Tasks in `plan.json` now explicitly reference these dependencies.

- **Clearer Integration Loop**  
  Integration Phase now lists Manager, Implementor, Reviewer, and CI as distinct agents/steps, each with specific responsibilities.  
  Escalation paths (e.g., `nano → mini → pro` model tiers) are explicitly documented.

- **Deployment Agents and Safeguards**  
  Deployment Phase now specifies:  
  • CD Manager, Deployer, DBA, Tester, SRE Reviewer.  
  • Deliverables: `DeployEnvelope`, `DBChangeEnvelope`, `TestReport`.  
  • Environment-by-environment promotion (dev → test → stage → prod) with rollback, retries, and manual holds.

- **Auditability and Resume Safety**  
  • All artifacts are committed to `/design/` and `/state/` with strict schema validation.  
  • Integration and Deployment can be restarted at any time and will resume from the last known state.  
  • Human gates (reviews, approvals, pre-flight checks) are explicit in the workflow and visible in the Mermaid diagram.

## 3) Architecture at a Glance

The workflow is structured around four phases.  
Each phase has **clear roles**, **human touch points**, and **explicit artifacts** that become inputs to the next phase.

### Phase 1: Design
- **Who acts:** Research Analyst, Backend Designer, Frontend Designer, Architect, Identity Designer, Data Flow, and Planner agents.  
- **Human role:** requester provides context, stakeholders review and approve each design section.  
- **Artifacts produced:**  
  - `/design/docs/<feature>.md` → stakeholder-readable design document (sections for research, backend, frontend, architecture, identity, data flows, roadmap).  
  - `/design/research.json`  
  - `/design/backend.json`  
  - `/design/frontend.json`  
  - `/design/architecture.json` (validates `/specs/Architecture.schema.json`)  
  - `/design/identity.json`  
  - `/design/dataflow.json`  
  - `/design/plan.json` (validates `/specs/Plan.schema.json`)  

### Phase 2: Dependency Prep
- **Who acts:** Dependency Analyst (light agent) + humans confirming readiness.  
- **Human role:** check availability of libraries, APIs, credentials, and infra; resolve gaps flagged as “manual.”  
- **Artifacts produced:**  
  - `/design/docs/<feature>.md` → updated with a “Dependencies Checklist.”  
  - `/design/dependencies.json` (validates `/specs/Dependencies.schema.json`) → structured list of dependencies with status = `available`, `missing`, or `manual`.  

### Phase 3: Integration
- **Who acts:** Manager, Implementor, Reviewer, CI gate.  
- **Human role:** optional intervention if Reviewer escalates or if design/plan adjustments are needed.  
- **Artifacts produced:**  
  - Commits: one per task, branch = `feat/<slug>`.  
  - `/design/plan.json` → updated as tasks progress (`pending`, `in_progress`, `completed`, `skipped`).  
  - `/state/runs/<run-id>/task-<id>.json` (gitignored) → ReturnEnvelope objects (validates `/specs/ReturnEnvelope.schema.json`) containing diffs, files, tests, costs, and notes.  

### Phase 4: Deployment
- **Who acts:** CD Manager, Deployer, DBA, Tester, SRE Reviewer.  
- **Human role:** approvals when `hold_for_approval=true`, and sign-off on production if required.  
- **Artifacts produced:**  
  - `/cd/release.json` (validates `/specs/ReleasePlan.schema.json`) → ReleasePlan describing environments, strategies, health budgets, test suites, DB changes.  
  - `/state/cd/<run-id>/<env>/deploy.json` → DeployEnvelope (validates `/specs/DeployEnvelope.schema.json`) with strategy, executed steps, health, rollback plan.  
  - `/state/cd/<run-id>/<env>/db.json` → DBChangeEnvelope (validates `/specs/DBChangeEnvelope.schema.json`) with migrations, backup, rollback status.  
  - `/state/cd/<run-id>/<env>/tests.json` → TestReports (validates `/specs/TestReport.schema.json`) with pass/fail counts and artifacts.  
  - Logs and execution details under `/state/cd/<run-id>/<env>/`.  

---

**Summary:**  
- **Design** → `/design/docs/<feature>.md` + JSON specs under `/design/`.  
- **Dependency Prep** → `/design/dependencies.json` + checklist in docs.  
- **Integration** → commits, updated `/design/plan.json`, and ReturnEnvelopes in `/state/runs/`.  
- **Deployment** → `release.json` plus per-environment DeployEnvelope, DBChangeEnvelope, TestReports, and logs in `/state/cd/`.

Together, these artifacts make the process **predictable, auditable, and resumable** from idea through production.
