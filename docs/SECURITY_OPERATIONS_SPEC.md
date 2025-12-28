Module Spec: Security & Maintenance Cycle

Objective: Ensure the longevity, security, and data integrity of apps built via the Command Deck.

1. Security Architecture

Identity Management: Leveraging Supabase Auth for JWT-based session security.

Data Isolation: All multi-tenant logic is enforced at the database level using Postgres Row-Level Security (RLS).

Secrets Management: Environment variables (API Keys, DB Secrets) are never stored in blueprints or documents. They are managed via the host environment (Vercel/Netlify).

2. Data Integrity Checks

Schema Validation: The Blueprint Studio validates all SQL migrations against the ARCHITECTURE.md before execution.

The "Ghost Check": A periodic check to identify "Orphaned Records" (e.g., a student record with no valid academy ID) and flag them for the Architect-Pilot.

3. The Maintenance Cycle (The "Sustain" Loop)

The Command Deck automates the "Healthy App" lifecycle:

The Refactor Window: Every 5 construction phases, the app mandates a "Refactor Phase." The Auditor identifies the messiest files and generates a work order specifically for cleanup.

Context Refresh: Every 30 days, the app summarizes all MEMORY.md logs into a "Golden Record" to ensure future agents don't get confused by old technical debt.

Security Audit: Automated scans for outdated packages or exposed endpoints.