# AGENTS

## 1. Purpose
- This repository is the **AI Dev Tasks blueprint**. It is copied into project-specific repositories to manage feature delivery.
- When cloning, update the prompt templates under `docs/prompts/` so they reference the target project's repo name and URL.

## 2. Directory Map
| Path | Responsibilities |
| --- | --- |
| `docs/prompts/` | Prompt templates for design, planning, integration, and CD agents. Update these after copying the repo. |
| `design/` | Human design docs (`docs/<feature>.md`), machine artifacts (`*.json`), and planning files like `plan.json` and `dependencies.json`. |
| `specs/` | JSON schemas that every artifact must validate against. |
| `cd/` | Deployment plans (`release.json`). |
| `docs/runs/` | Committed audit snapshots of completed runs. |
| `state/` | Runtime state produced by orchestration (gitignored). |

## 3. Workflow Phases & How It Is Used
1. **Design** – Specialized agents append narrative sections to `/design/docs/<feature>.md` and emit JSON specs validated against `/specs/*.schema.json`.
2. **Dependency Prep** – Humans or agents list external resources in `design/dependencies.json`; integration waits until required items are `available`.
3. **Integration** – Manager, Implementor, and Reviewer agents loop on tasks. Each task yields one commit and a `ReturnEnvelope` snapshot.
4. **Deployment** – CD Manager, Deployer, DBA, Tester, and SRE Reviewer promote builds using `cd/release.json`, producing `DeployEnvelope`, `DBChangeEnvelope`, and `TestReport` artifacts.

## 4. End-State Goal
A feature branch with one commit per task and green CI, accompanied by validated design, dependency, and deployment artifacts, plus audit snapshots for traceability and rollback.

## 5. Schema-First Rules
- Every JSON artifact (`research.json`, `plan.json`, `ReturnEnvelope`, `DeployEnvelope`, etc.) must validate against its counterpart in `specs/`.
- Failing validation blocks progression to the next step.

## 6. Commit & Repo Hygiene
- One commit per integration task using the message format `Task <id>: <title>`.
- Ensure CI/tests pass before committing.
- Persist long-term records under `docs/runs/<feature>/`; keep transient runtime data in `state/`.

## 7. Blueprint Copy Notes
- When copying this repo into a new project, keep directory structure and schema files intact.
- Update prompt files and any repository references to the new project.

## 8. References
- `README.md` – detailed workflow guide and FAQ.
- `product-manager-agent*.gpt5.md` – operating principles for the Product Manager agent.
