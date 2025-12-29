STRATEGY.md: Command Deck Technical Directive (Host)

1. Tenancy & Isolation

Logic: The platform must support multi-project management.

Implementation: Every record in the database (documents, messages, projects) MUST include a project_id uuid.

Enforcement: Row-Level Security (RLS) in Supabase will restrict access so a user can only view artifacts tied to their current project session.

2. State & Workflow

Logic: Linear Chronological Progression (A through K).

System Flow: 1. A pillar is "Active" when its preceding artifact is committed.
2. Artifacts are immutable once "Published" to the Vault.
3. "Context Ripples" (modifying an early artifact like a PRD) will trigger "Review Required" flags on downstream pillars (Strategy, Schema).

3. External Boundaries

Intelligence: Standardized on gemini-2.5-flash-preview-09-2025.

Persistence: Standardized on Supabase (PostgreSQL).

Integration: Direct file-system access (Pillar G) to mirror the /docs folder to the local machine.

4. Privacy & Security

Data Handling: No sensitive API keys are to be stored in the documents table.

Auth: Authentication is handled via Supabase Auth (Anonymous or Custom Token) to generate the user_id required for RLS.

5. Infrastructure Constants

Framework: React 18 / Next.js.

Design System: Cyber-Industrial (Geist Sans, Pure Black #000000, Zinc-800 borders).

File Limits: Strict 150-line maximum per file to maintain modularity.