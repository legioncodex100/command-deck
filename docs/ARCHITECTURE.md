ARCHITECTURE.md: Engineering Blueprint

1. Core Technology Stack

The Command Deck is built for speed, persistence, and high-fidelity intelligence.

Frontend: React 18 (Functional Components & Hooks).

Styling: Tailwind CSS (Utility-first, zero custom CSS where possible).

Icons: Lucide-React (Standardized stroke width: 1.5 - 2).

Database & Auth: Supabase (PostgreSQL for persistence, RLS for security).

Intelligence Engine: Google Gemini 2.5 Flash-preview (Total Context synthesis).

2. Directory Structure (Total Integrity)

Following the Strict Layer Separation (SLS) mandate:

/docs                 # The Project Vault (Permanent Markdown Artifacts)
/src/components       # The Facade: Pure UI components (No data fetching)
    /pillars          # Individual Pillar Workbenches (A-K)
    /shared           # Reusable UI elements (Buttons, Cards, Inputs)
/src/hooks            # The Mechanical: React Hooks for state & Firestore sync
/src/services         # The Logic: Business logic, AI prompt engineering
    /core             # ConsultantBrain factory & API handlers
    /pillars          # Pillar-specific logic (e.g., SQL validation)
/src/lib              # System foundation (Supabase config, Constants)
/src/types            # TypeScript definitions (Project, Document, Message)


3. Communication Pattern: The Golden Loop

To ensure stability, logic must never reside directly in the UI. All pillars follow this flow:

Workbench (UI): Dispatches a user action (e.g., handleSend).

Hook (Mechanical): Manages the local state and triggers a Service call.

Service (Logic): Communicates with the Gemini API or Supabase.

Database: Persists the change (Cumulative Inheritance).

State Update: The Hook detects the database change and re-renders the Facade.

4. Pillar Logic: The "Consultant Brain" Factory

Every conversational pillar (A, B, D, E) must utilize the central ConsultantBrain service. This service is responsible for:

Injecting the Cumulative Context from preceding pillars.

Enforcing the Socratic Interrogation protocol.

Returning Decision Cards in the mandatory JSON format.

5. Security Protocol: Project Scoping

All artifacts and chat logs are scoped to a unique project_id.

Row Level Security (RLS) ensures that Pilots can only access the data associated with their specific project context