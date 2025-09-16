# n8n Workflow Templates

This directory stores the finalized n8n workflow exports that accompany the markdown guides in `docs/workflows/`.
Each automation described in those guides should have a matching JSON definition checked in here once the flow has
been validated in n8n.

## Export & versioning conventions
- Export flows from n8n using **Download > File** so the JSON matches what can be re-imported without modification.
- Keep the **Include credentials** option disabled to prevent secrets from entering version control. Instead, document
  credential requirements in the workflow markdown files.
- Name the canonical file for each workflow `templates/<workflow>-n8n.json` and update the referenced markdown link whenever
  the flow changes.
- Preserve prior revisions by suffixing the filename with a semantic version or date stamp (e.g.,
  `design-n8n.v1.1.0.json` or `deployment-n8n.2024-04-18.json`) before committing the new canonical file. This keeps the
  history auditable while maintaining a stable pointer for the current release.

## Expected templates
- Design workflow JSON: `templates/design-n8n.json`
- Integration workflow JSON: `templates/integration-n8n.json`
- Deployment workflow JSON: `templates/deployment-n8n.json`
