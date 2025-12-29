# ARCHITECTURE.md: Engineering Blueprint (v5.7)

## 1. Core Technology Stack
The Command Deck is built for speed, persistence, and high-fidelity intelligence.

*   **Frontend**: React 18 (Next.js 14 App Router).
*   **Styling**: Tailwind CSS (Utility-first, zero custom CSS where possible).
*   **Icons**: Lucide-React (Standardized stroke width: 1.5 - 2).
*   **Database**: Supabase (PostgreSQL + RLS).
*   **Intelligence**: Google Gemini 2.0 Flash-EXP (Total Context Synthesis).
*   **State Management**: React Hooks + Context API.

## 2. Directory Structure (Strict Layer Separation)
Following the SLS mandate to separate Data, Logic, and UI:

```
/docs                 # The Project Vault (Permanent Markdown Artifacts)
/src/app
    /actions          # Server Actions (Disk I/O, Sync Operations)
/src/components       # The Facade: Pure UI components
    /pillars          # Pillar Workbenches (A-G)
        /construction # Kanban & Engineer Chat visuals
        /planning     # Backlog & Roadmap visuals
    /shared           # Reusable UI elements (Buttons, Cards)
    /debug            # Developer Mode Tools (Overlay, Panel)
/src/hooks            # The Mechanical: State management (useProject, useSprint)
/src/services         # The Logic: AI Prompt Engineering & API Calls
    /core             # Core AI utilities
    discovery.ts      # Pillar A Logic
    strategy.ts       # Pillar B Logic
    relay.ts          # Handover Artifact Generation
    ripple.ts         # Stale State Detection
    integration.ts    # Sync Bridge Logic
/src/types            # TypeScript Definitions
```

## 3. Communication Pattern: The Golden Loop
To ensure stability, logic never resides directly in the UI.

1.  **Workbench (UI)**: Dispatches user action (e.g., `handleCompletePhase`).
2.  **Hook/Service (Logic)**: Calls `src/services/*.ts` for AI generation or `src/app/actions` for system ops.
3.  **Database**: Persists the result (Output Artifact + Relay Doc).
4.  **State Update**: React State/Effects detect the change and re-render the Facade.

## 4. Pillar Logic & Protocols

### The Consultant Pattern
Every pillar utilizes a specialized service module (e.g., `strategy.ts`) responsible for:
*   **Context Injection**: Loading `documents` + `previousRelay`.
*   **Socratic Interrogation**: Asking 1 targeted question at a time.
*   **Decision Cards**: Returning structured JSON recommendations.

### Rolling Synthesis Protocol (v6.0)
To prevent context fragmentation, every **Relay Artifact** (`RELAY_X.md`) must be a cumulative snapshot.
*   **Input**: `Previous Relay` + `Current Work`.
*   **Output**: Unified `Current Relay` containing "The Core Soul", "Pillar Progress", "Handover Brief", and "Technical Debt".

### Context Ripple Protocol (v5.3)
*   **Detection**: `ripple.ts` compares `updated_at` timestamps of upstream artifacts vs. downstream artifacts.
*   **Action**: If Upstream > Downstream, mark Downstream as `[STALE]`.

## 5. The Integration Bridge (Pillar G)
Acts as the physical manifestation of the project.
*   **Sync Bridge (Host)**: Pushes virtual Supabase documents to the local `/docs` filesystem.
*   **Virtual Bridge (Civilian)**: Strictly routes "Save" operations to the Supabase `documents` table and `storage` bucket.
    *   *Security Enforcement*: The `updateArchitectureFile` and `syncDocs` actions check specific RLS roles before allowing file `fs` access.
*   **Sync Log**: Appends operations to `SYNC_LOG.txt` (Host) or `audit_logs` table (Civilian).
*   **Gatekeeper**: Ensures no code is written to disk without explicit "Sync" approval (Host Only).

## 6. Developer Mode (Host Debugger)
A hidden verification layer (`Cmd+Shift+D`) for the Architect-Pilot.
*   **Context Inspector**: Visualizes the raw context buffer sent to Gemini.
*   **SLS Scanner**: Real-time regex check for forbidden patterns in UI code.
*   **Ripple Trigger**: Simulation tool to test Stale State UI reactivity.