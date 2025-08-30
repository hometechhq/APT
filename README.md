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

## 4) State & Idempotency

A core design principle of AI Dev Tasks is that **every phase is resumable** and **every action is idempotent**.  
This means the workflow can be stopped and restarted without losing progress, and repeated actions do not create conflicts or duplication.

### 4.1 State Tracking

Each phase maintains explicit state in versioned or gitignored artifacts:

- **Design Phase**  
  - Human docs: `/design/docs/<feature>.md`  
  - JSON specs: `/design/*.json` (e.g., `research.json`, `backend.json`, `frontend.json`, `plan.json`)  
  - Status: stakeholder approval recorded in the doc itself and in commits.

- **Dependency Prep Phase**  
  - `/design/dependencies.json` — structured list of prerequisites with status.  
  - Updates: as dependencies move from `missing` → `available`, the file is updated and committed.

- **Integration Phase**  
  - `/design/plan.json` — authoritative task plan; each task has `status` = `pending`, `in_progress`, `completed`, or `skipped`.  
  - `/state/runs/<run-id>/task-<id>.json` (gitignored) — snapshot of every ReturnEnvelope generated for a task.  
  - Git commits — exactly one per completed task on the feature branch.  

- **Deployment Phase**  
  - `/cd/release.json` — authoritative ReleasePlan.  
  - `/state/cd/<run-id>/<env>/deploy.json` — DeployEnvelope.  
  - `/state/cd/<run-id>/<env>/db.json` — DBChangeEnvelope.  
  - `/state/cd/<run-id>/<env>/tests.json` — TestReports.  
  - Logs/artifacts — captured alongside JSON under `/state/cd/<run-id>/<env>/`.

### 4.2 Idempotency Rules

- **Tasks (Integration)**  
  - Each task includes an `idempotency_signature` in `plan.json` (e.g., “`POST /login` returns 200” or “function `hashPassword` exists in `auth.js`”).  
  - If the Implementor finds this condition already satisfied, it may set `idempotent_satisfied=true` in the ReturnEnvelope and produce no changes.  
  - Manager marks such tasks as `skipped` instead of re-running them.

- **Database changes (Deployment)**  
  - Each migration in `release.json` includes `up` and `down` commands.  
  - Pre- and post-checks confirm whether the migration is already applied.  
  - If already applied, DBA agent marks migration as `skipped`.  
  - If failure occurs, orchestrator runs `down` to rollback, ensuring idempotent reversibility.

- **Deployments (Deployment)**  
  - Deployment strategies (rolling, blue-green, canary) are designed to allow safe retries.  
  - Failed or partial deploys can be retried without corrupting state.  
  - Rollback plans are defined in every DeployEnvelope before prod promotion.

### 4.3 Resume Safety

- **Crash or stop tolerance:** Because state is written to JSON artifacts and ReturnEnvelopes, the orchestrator can reload and pick up where it left off.  
- **Plan-driven selection:** Manager agents always choose the first `pending` task whose dependencies are complete. CD Manager always chooses the next incomplete environment in `release.json`.  
- **Audit trail:** Past ReturnEnvelopes, TestReports, and DeployEnvelopes remain in `/state/` for forensic review, while the authoritative design and plan files live under version control.  

### 4.4 Human Touch Points in State

- **Design approvals:** humans approve or request changes in `/design/docs/<feature>.md`.  
- **Dependency checks:** humans confirm or resolve missing items in `/design/dependencies.json`.  
- **Reviewer escalations:** humans may step in if an escalation loops or tasks cannot be auto-resolved.  
- **Deployment holds:** humans explicitly approve environments flagged `hold_for_approval` in `release.json`.

---

**In practice:**  
- The **plan and release files** (`plan.json`, `dependencies.json`, `release.json`) are the **source of truth**.  
- The **runtime state directories** (`/state/runs/`, `/state/cd/`) are the **ledger of what happened**.  
- This separation ensures reproducibility, safety, and a clean audit trail.

## 5) Repository Layout

The repository is organized so that every phase of the lifecycle has a clear place to store its artifacts.  
This makes the process predictable, auditable, and easy to resume.

### Top-Level Directories

- **`/design/`** — Design & dependency phase outputs  
  - `/design/docs/<feature>.md` → human-readable design document (narrative spec, approved by stakeholders).  
  - `/design/*.json` → machine-readable artifacts (research, backend, frontend, architecture, identity, dataflow, plan, dependencies).  

- **`/specs/`** — JSON Schemas used to validate agent outputs.  
  - **Key files:**  
    - `Plan.schema.json` — structure of the execution DAG.  
    - `ReturnEnvelope.schema.json` — structure of Implementor outputs.  
    - `ReleasePlan.schema.json` — environment promotion plan.  
  - Additional schemas cover design modules (research, backend, frontend, identity, dataflow, dependencies, etc.).

- **`/state/`** — Runtime state (gitignored; not checked in)  
  - `/state/runs/<run-id>/task-<id>.json` → ReturnEnvelopes from integration.  
  - `/state/cd/<run-id>/<env>/...` → Deployment artifacts: DeployEnvelope, DBChangeEnvelope, TestReports, logs.  

- **`/cd/`** — Deployment planning inputs  
  - `/cd/release.json` → ReleasePlan describing environments, strategies, health budgets, test suites, DB changes.  

- **`/docs/planning/`** — Prompt templates and guides for design  
  - `TEAM.chat.md`, individual module prompts, planner prompt, dependencies prompt, `USAGE-n8n.md`.  

- **`/docs/cd/`** — Prompt templates and guides for deployment  
  - Prompts for CD Manager, Deployer, DBA, Tester, SRE Reviewer.  
  - `USAGE-CD.md` → guide to set up n8n CD workflow.  

- **`/tools/`** — Orchestrator-side scripts and helpers  
  - `repo-snapshot.mjs`, `apply-envelope.mjs`, `deploy.mjs`, `run-tests.mjs`, `healthcheck.mjs`, `backup-db.mjs`, `migrate-db.mjs`.  

- **`/.github/workflows/`** — CI definitions  
  - `validate-schemas.yml` → validate design and plan files.  
  - Additional workflows for lint, tests, build (project-specific).  

### Lifecycle Mapping

- **Design →** `/design/docs/*` + `/design/*.json`  
- **Dependency Prep →** `/design/dependencies.json`  
- **Integration →** commits, updated `/design/plan.json`, and ReturnEnvelopes in `/state/runs/`  
- **Deployment →** `/cd/release.json` (input) + `/state/cd/*` (runtime outputs)
## 6) Data Model Contracts

AI Dev Tasks is **schema-first**. Every agent output must validate against a JSON Schema in `/specs/`.  
This keeps the workflow predictable, auditable, and safe for automation.

### Core Contracts

- **PRD (`/specs/Prd.schema.json`)**  
  Defines the structure of a Product Requirements Document in JSON.  
  • Title, goals, non-functional requirements.  
  • Functional requirements with acceptance criteria.  
  • Risks, assumptions, and release slices.  
  • Basis for both stakeholder docs and the Planner’s task DAG.

- **Plan (`/specs/Plan.schema.json`)**  
  Represents the execution plan (task DAG).  
  • Tasks with `id`, `title`, `description`.  
  • Explicit `depends_on` references (tasks and external dependencies).  
  • Acceptance criteria for each task.  
  • Routing hints (`nano | mini | pro`) and retry policies.  
  • Idempotency signature so tasks can be skipped if already satisfied.  

- **ReturnEnvelope (`/specs/ReturnEnvelope.schema.json`)**  
  Captures an Implementor agent’s proposed code change.  
  • Diff (human-readable patch).  
  • Files[] (base64 + optional hashes).  
  • Tests to run or add.  
  • Costs (model tokens, USD).  
  • Notes/rationale.  
  • Idempotent flag if task is already satisfied.  
  One ReturnEnvelope is produced per task and saved under `/state/runs/<run-id>/task-<id>.json`.

- **ReleasePlan (`/specs/ReleasePlan.schema.json`)**  
  Governs deployment through environments.  
  • Ordered list of environments (dev → test → stage → prod).  
  • Deployment strategy (rolling, blue-green, canary).  
  • Health policies (checks + error budgets).  
  • Test suites per environment.  
  • Database changes (with backup + rollback).  
  • Manual approval holds.  
  Input file: `/cd/release.json`.

### Supporting Contracts

Additional schemas exist for specialized outputs, including:  
- **Dependencies** (`Dependencies.schema.json`) → external libraries, services, credentials, infra resources.  
- **DeployEnvelope** (`DeployEnvelope.schema.json`) → actual deployment attempt details and rollback plan.  
- **DBChangeEnvelope** (`DBChangeEnvelope.schema.json`) → migration execution results with backups.  
- **TestReport** (`TestReport.schema.json`) → results of unit, integration, smoke, or perf suites.  
- **Design module JSONs** (`research.json`, `backend.json`, `frontend.json`, `identity.json`, `dataflow.json`) → detailed designs aligned with their respective prompts.

---

**In short:**  
- **PRD** → defines *what to build*.  
- **Plan** → defines *how to build it step by step*.  
- **ReturnEnvelope** → defines *the unit of change for each task*.  
- **ReleasePlan** → defines *how to safely promote the built artifact through environments*.
## 7) Branch, Commit, and CI Policy

The Integration and Deployment phases rely on a strict branching and commit discipline, backed by automated CI gates.  
This ensures that every task is traceable, every change is testable, and merges only occur when quality criteria are satisfied.

### 7.1 Branch Policy

- **Feature branches**  
  - One branch per feature or PRD, named `feat/<slug>`.  
  - Example: `feat/login-2fa` or `feat/reporting-dashboard`.  
  - All commits for tasks in that feature land on this branch.  

- **Main branch**  
  - Protected.  
  - Only updated via Pull Request from feature branches.  
  - Requires all CI checks to pass and reviewer approval before merge.

### 7.2 Commit Policy

- **One commit per task**  
  - Every task in `plan.json` corresponds to exactly one commit.  
  - Commit message format:  
    ```
    Task <id>: <task title>
    ```
    Example: `Task 2.1: Add /login endpoint with password validation`

- **Commit contents**  
  - Derived from the Implementor’s ReturnEnvelope.  
  - Includes code changes, tests, and notes.  
  - Changes are applied by orchestrator tooling (`apply-envelope.mjs`) to ensure safe, atomic commits.  

- **Audit trail**  
  - Commits can be traced back to task IDs in `plan.json`.  
  - Runtime ReturnEnvelope snapshots live under `/state/runs/<run-id>/task-<id>.json` for additional detail.

### 7.3 Continuous Integration (CI)

- **Required gates**  
  - **Lint**: static style/lint check.  
  - **Unit tests**: must run cleanly and cover updated code.  
  - **Build**: project must build successfully.

- **Optional/Recommended gates**  
  - **SAST / dependency scanning**: detect security issues in dependencies.  
  - **Semantic evaluation**: AI-based test assertions or rubric checks from `/eval/`.

- **CI enforcement**  
  - Orchestrator runs CI after each Implementor commit.  
  - Reviewer considers CI results as part of verdict.  
  - Branch protection enforces green CI before merge into `main`.

### 7.4 Merge Policy

- Pull Requests are created automatically or manually from feature branches to `main`.  
- Merge is only allowed when:  
  - All commits follow the one-task-per-commit rule.  
  - All required CI gates are green.  
  - Reviewer verdict = approved.  
  - Human approval is granted if required (e.g., for production deployment holds).  

---

**Why it matters**  
- Keeps **traceability** between design tasks, ReturnEnvelopes, and commits.  
- Ensures **predictable quality gates** before code reaches `main`.  
- Maintains **auditability**: every change is tied back to a schema-validated artifact and a human-approved design.
```mermaid
flowchart LR
  subgraph FeatureBranch["Feature Branch: feat/<slug>"]
    T1[Commit: Task 1] --> T2[Commit: Task 2] --> T3[Commit: Task 3]
  end

  FeatureBranch --> PR[Pull Request to main]

  PR --> CI[CI Gates: lint · tests · build]
  CI --> Review[Reviewer Approval]
  Review --> Merge[Merge into main]

  style Review fill:#fff6d5,stroke:#d4a300,color:#3d2e00
```
