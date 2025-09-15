# n8n Design Workflow

## Flow Overview
```mermaid
flowchart LR
    HI[Human Interface Agent] --> RT[Research Tool]
    RT --> PM[Product Manager]
    PM --> ARCH[Architect Designer]
    PM --> FE[Frontend Designer]
    PM --> BE[Backend Designer]
    PM --> DATA[Dataflow Agent]
    PM --> ID[Identity Designer]
    PM --> DOCS[Docs Assembler]
    ARCH --> PL[Planner]
    FE --> PL
    BE --> PL
    DATA --> PL
    ID --> PL
    DOCS --> PL
```

## Stage Notes

### Human Interface Agent
- **Expected input:** Raw stakeholder goals, constraints, and clarifying questions gathered from the requestor.
- **Expected output:** Structured design brief with objectives, success criteria, and open research questions handed to the research tool.
- **Prompt template:** [`docs/prompts/human-interface-agent.gpt5.md`](../prompts/human-interface-agent.gpt5.md)

### Research Tool
- **Expected input:** Design brief plus outstanding questions that require market, technical, or dependency investigation.
- **Expected output:** Curated findings, references, and risk flags that unblock the product manager.
- **Prompt template:** [`docs/prompts/design.research-analyst.gpt5.md`](../prompts/design.research-analyst.gpt5.md)

### Product Manager
- **Expected input:** Research pack and clarified stakeholder goals from the human interface.
- **Expected output:** Prioritized problem statement, acceptance criteria, and task routing for each specialist design agent.
- **Prompt template:** [`docs/prompts/product-manager-agent.gpt5.md`](../prompts/product-manager-agent.gpt5.md)

### Design Specialist Agents
- **Architect Designer**
  - **Expected input:** Product manager brief with functional scope and architectural constraints.
  - **Expected output:** High-level system diagrams and component responsibilities.
  - **Prompt template:** [`docs/prompts/design.architect.gpt5.md`](../prompts/design.architect.gpt5.md)
- **Frontend Designer**
  - **Expected input:** UI requirements, user journeys, and platform guidelines from the product manager.
  - **Expected output:** UI narratives, wireframes, or component specs ready for planning.
  - **Prompt template:** [`docs/prompts/design.frontend-designer.gpt5.md`](../prompts/design.frontend-designer.gpt5.md)
- **Backend Designer**
  - **Expected input:** Service expectations, data contracts, and scalability goals from the product manager.
  - **Expected output:** API designs, storage models, and integration notes.
  - **Prompt template:** [`docs/prompts/design.backend-designer.gpt5.md`](../prompts/design.backend-designer.gpt5.md)
- **Dataflow Agent**
  - **Expected input:** Cross-service data requirements and event lifecycles provided by the product manager.
  - **Expected output:** Sequenced data pipelines and synchronization strategies.
  - **Prompt template:** [`docs/prompts/design.dataflow-agent.gpt5.md`](../prompts/design.dataflow-agent.gpt5.md)
- **Identity Designer**
  - **Expected input:** Authentication, authorization, and compliance needs from the product manager.
  - **Expected output:** Identity flows, role matrices, and security considerations.
  - **Prompt template:** [`docs/prompts/design.identity-designer.gpt5.md`](../prompts/design.identity-designer.gpt5.md)
- **Docs Assembler**
  - **Expected input:** Approved drafts and technical notes from all design specialists.
  - **Expected output:** Consolidated design narrative aligned with publishing standards.
  - **Prompt template:** [`docs/prompts/design.docs-assembler.gpt5.md`](../prompts/design.docs-assembler.gpt5.md)

### Planner
- **Expected input:** Finalized specialist outputs with traceable assumptions and dependencies.
- **Expected output:** Structured implementation plan, milestone sequencing, and task envelopes for integration.
- **Prompt template:** [`docs/prompts/design.planner.gpt5.md`](../prompts/design.planner.gpt5.md)
