INSTRUCTIONS_AUDIT.md: Pillar H

Objective: Build the Structural Auditor to enforce SLS Compliance, file length limits, and architectural integrity.

1. Primary Tasks

Route: Create the /audit route.

Brain: Instantiate the "Security & Quality Auditor" persona.

Logic: Implement the Code Intake terminal. The AI must audit pasted code against the MASTER_SPECIFICATION.md and ARCHITECTURE.md.

Audit Logic:

Detect direct database/Supabase calls in UI components.

Flag files exceeding 150 lines.

Verify naming conventions for Services and Hooks.

Output: Generate an AUDIT_LOG.md with an Integrity Score (0-100).

2. Construction Command

"Agent, build the Structural Auditor (Pillar H).

Index /docs/MASTER_SPECIFICATION.md.

Create a 3-column cockpit with a 'Code Intake' terminal in the center.

Use the Auditor persona to evaluate code integrity and provide refactoring work orders if the score is below 80%."