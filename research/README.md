# Raw Research Archive

This directory stores unsummarized research captures produced by the Research Analyst agent. Each JSON file should:

- Live under a feature-specific subdirectory (e.g., `./<feature_id>/2024-06-03T180000Z-market-scan.raw.json`).
- Validate against [`specs/raw-research.schema.json`](../specs/raw-research.schema.json).
- Record the queries that were issued, the precise timestamps (`captured_at` and `entries[].collected_at`), and complete source metadata for every finding.
- Set `valid_until` to document when the findings should be refreshed and populate `supersedes[]` when replacing an older capture.

These raw artifacts provide provenance for the summarized research stored in `/design/research.json` and enable future tasks to reuse still-valid findings without repeating external searches.
