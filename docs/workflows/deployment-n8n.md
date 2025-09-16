# n8n Deployment Workflow

## Flow Overview
```mermaid
flowchart LR
    ReleasePlan[(cd/release.json)]
    DeployEnv[[DeployEnvelope]]
    DBEnv[[DBChangeEnvelope]]
    TestArtifact[[TestReport]]

    Manager[CD Manager (n8n)]
    Deployer[Deployer Agent (codex)]
    DBA[DBA Agent (n8n)]
    Tester[Tester Agent (n8n)]
    SRE[SRE Reviewer (n8n)]
    Decision{SRE verdict}

    ReleasePlan -. rollout gates .-> Manager
    Manager -->|dispatch window| Deployer -->|handoff change set| DBA -->|apply migrations| Tester -->|validate build| SRE --> Decision

    Decision -->|promote| Manager
    Decision -->|retry| Deployer
    Decision -->|rollback| DBA
    Decision -->|hold| Manager

    Deployer -->|produces| DeployEnv
    DBA -->|produces| DBEnv
    Tester -->|produces| TestArtifact

    DeployEnv -. deployment notes .-> SRE
    DBEnv -. migration status .-> SRE
    TestArtifact -. quality signals .-> SRE
```

## Stage Notes

### CD Manager (n8n)
- **Consumes:** The canonical release specification in `cd/release.json` plus the latest `DeployEnvelope`, `DBChangeEnvelope`, and `TestReport` artifacts returned by downstream agents to determine readiness for promotion.
- **Produces:** Dispatch instructions, environment targeting, and scheduling windows for the deployment run, persisting status updates back to the release plan when new envelopes arrive.
- **Schema alignment:** Ensures every `DeployEnvelope` and `DBChangeEnvelope` routed upstream validates [`specs/DeployEnvelope.schema.json`](../../specs/DeployEnvelope.schema.json) and [`specs/DBChangeEnvelope.schema.json`](../../specs/DBChangeEnvelope.schema.json) before recording the state transition.

### Deployer Agent (codex)
- **Consumes:** The CD Manager’s task brief, prepared change artifacts, and prior deployment telemetry captured in the last `DeployEnvelope` iteration.
- **Produces:** An updated `DeployEnvelope` that documents infrastructure steps, package versions, and runtime health checks, validating [`specs/DeployEnvelope.schema.json`](../../specs/DeployEnvelope.schema.json) before handing it to the DBA agent and CD Manager.
- **Loop behavior:** On `retry`, resumes from the last successful checkpoint in the envelope; on `rollback`, collaborates with the DBA to ensure application state is restored before reissuing a fresh envelope.

### DBA Agent (n8n)
- **Consumes:** The Deployer’s `DeployEnvelope` plus database migration plans or feature flag toggles queued in the release plan.
- **Produces:** A `DBChangeEnvelope` covering migration status, rollback scripts, and data quality verification, validated against [`specs/DBChangeEnvelope.schema.json`](../../specs/DBChangeEnvelope.schema.json).
- **Loop behavior:** On rollback directives, executes the contingency path enumerated in the envelope and updates it with the rollback outcome before returning control to the CD Manager.

### Tester Agent (n8n)
- **Consumes:** Application endpoints and verification hooks referenced in the `DeployEnvelope` and `DBChangeEnvelope`, along with acceptance criteria from `cd/release.json`.
- **Produces:** A `TestReport` summarizing functional, integration, and smoke test results, conforming to [`specs/TestReport.schema.json`](../../specs/TestReport.schema.json).
- **Loop behavior:** On retry, reruns only the failed suites flagged in the prior `TestReport`, annotating the rerun scope so the SRE Reviewer can see what changed.

### SRE Reviewer (n8n)
- **Consumes:** The consolidated `DeployEnvelope`, `DBChangeEnvelope`, and `TestReport` along with observability dashboards and change risk indicators.
- **Produces:** A promote/retry/rollback/hold verdict plus escalation notes returned to the CD Manager, closing the loop in the workflow diagram.
- **Decision logic:**
  - **Promote:** Signals the CD Manager to finalize the release window and notify stakeholders.
  - **Retry:** Routes the task back to the Deployer and Tester with targeted remediation guidance drawn from the envelopes.
  - **Rollback:** Directs the DBA (and Deployer as needed) to execute the rollback path documented in their respective envelopes before revalidation.
  - **Hold:** Keeps the deployment in a frozen state while additional analysis or approvals are gathered; the CD Manager maintains the hold status in `cd/release.json` pending resolution.
