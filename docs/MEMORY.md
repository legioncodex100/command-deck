# MEMORY.md

## Project: Command Deck

### Core Objective
Build a "civilian-facing" interface (The Deck) for the Command Deck, allowing non-admin users (Civilians/Operatives) to view their stats, manage their profile, and interact with the system.

### Session: Persistent Profile & Matrix Filter (Current)
- **Goal**: Implement persistent profile editing and a "Matrix" style avatar filter.
- **Accomplished**:
    - Created `src/app/(deck)/profile/page.tsx` for persistent profile management.
    - Added "Identity Settings" to `Sidebar.tsx`, integrating avatar display in the footer.
    - Implemented `src/utils/imageProcessing.ts` for client-side "Matrix" neural filter (Canvas API).
    - Added "Remove Avatar" and "Toggle Filter" functionality.
    - Refined Sidebar UI for proper alignment of Hangar icon and Avatar.
- **Key Decisions**:
    - **Client-Side Processing**: Used HTML5 Canvas for the image filter to ensure speed and privacy (no external AI).
    - **Sidebar Integration**: Merged profile access into the sidebar footer for persistent visibility.
    - **Supabase RLS**: Enforced strict RLS policies for `profiles` table and `avatars` bucket.
- **Next Steps**:
    - Implement "Resend Invite" functionality for admins (Completed).
    - Verify full production deployment.

### Configuration
- **Production Domain**: `https://command-deck.dev` (Configured in Supabase Auth).
- **Storage Policy**: Auto-cleanup of old avatars on new upload.

### Session: Identity Protocol & Progression
- **Goal**: Implement dual identity (Legal/Code Name), uniqueness, and automated rank progression.
- **Accomplished**:
    - **Dual Identity**: Separated `full_name` (Legal) and `display_name` (Code Name) in schema and UI.
    - **Generators**: Added `generateCodename()` utility for thematic random names (e.g., "NEON-WOLF").
    - **Progression**: Implemented auto-promotion from `CIVILIAN` to `PILOT` upon first project creation (`useProject.tsx`).
    - **Security**: Applied `UNIQUE` constraint to `display_name` via migration.
    - **Refinement**: Updated Profile UI with "Code Name" labels and generation tools.
- **Key Decisions**:
    - **Code Name Uniqueness**: Enforced via database constraint to prevent collisions.
    - **Auto-Promotion**: Tied to project creation as the "First Flight" milestone.

### Context
- **Active User**: `mohammed@legiongrappling.com` (Commander Role).
- **Civilian Role**: Standard users are "Operatives" or "Civilians".

### Session: Civilian Onboarding Flow (Previous)
- **Goal**: Finalize invite-to-access flow for civilians.
- **Accomplished**:
    - Verified `inviteCivilian` server action (fixed RLS/Service Key).
    - Created `src/app/setup-profile/page.tsx` for initial profile creation.
    - Implemented `src/services/storage.ts` for avatar uploads.
    - Connected `update-password` -> `setup-profile` -> `dashboard`.
- **Key Decisions**:
    - **Supabase Service Key**: Required for admin invite actions (`inviteCivilian`).
    - **Profile Table**: Utilizing `public.profiles` linked to `auth.users` via `id`.

### Session: Synthetic Division (AI Crew Management)
- **Goal**: Centralize and manage AI Consultants (Agents) within the Hangar dashboard.
- **Accomplished**:
    - **Schema**: Created `ai_crew` table with JSONB `model_config` and `is_locked` protection.
    - **Migration**: Seeded 12 Core Agents using a Star Trek roster (Quark, Seven of Nine, Picard, etc.).
    - **UI**: Built `/hangar/ai` for fleet visibility and `AgentEditor` for "Tuning" (Prompts/Models).
    - **Service Layer**: Refactored `construction.ts`, `facade.ts`, and `documentation.ts` to fetch dynamic instructions from the DB via `crew.ts`.
- **Key Decisions**:
    - **Global State**: Tuned agents update instantly for ALL users on the instance (Single Source of Truth).
    - **Hybrid Roster**: Core agents are "Key-Locked" (cannot be deleted) but are fully "Tunable" (editable prompts/models).
    - **Model Flexibility**: Added selector for `gemini-1.5-pro` vs `flash` to optimize cost/intelligence per agent.
    - **Avatar Upload**: Implemented "Retro/Pixel Art" avatar upload for agents, storing in `avatars/crew/` bucket.
    - **Security**: Fixed RLS policies to allow authenticated Commanders full CRUD access to `ai_crew` and storage.
    - **Engineering Bay**: Replaced `AgentEditor` modal with a dedicated "Tri-Pane" workstation (`/hangar/ai/[key]`) for immersive agent design.
    - **Personnel Director**: Implemented a "Meta-Agent" chat interface (`consultPersonnelDirector`) that uses `gemini-1.5-flash` to generate and update agent configs (System Prompt, Role, Model) via natural language.
    - **Divisional Structure**: Introduced 7 Pillars (Discovery, Strategy, Substructure, Design, Planning, Construction, Integration) and enforced strict assignment via schema constraints and UI selectors.

### Session: Flight Deck Intelligence & Evolution Sync
- **Goal**: Upgrade the Flight Deck with an AI Copilot and synchronize the entire Hangar with live architectural context.
- **Accomplished**:
    - **Flight Deck Chat**: Replaced the static "Active Task" card with a **Persistent Chat Interface** (`task_chat_messages`).
    - **Technical Copilot**: Implemented a "Senior Technical Architect" persona in `flight-deck-chat.ts` that assists with task execution (code snippets, debugging).
    - **Live Context Pipeline**: Built `src/app/actions/context.ts` (`getSystemContext`) to auto-read `MEMORY.md`, `ARCHITECTURE.md`, and `MASTER_SPEC.md` at runtime.
    - **Global Sync**: Injected this Live Context into both the **Flight Deck Chat** (Execution) and **Evolution Lab Advisor** (Strategy).
    - **Auto-Ignition**: Configured the Flight Deck to automatically trigger an AI analysis ("Mission Briefing") when a task is engaged.
    - **Logic Upgrades**: Added "Abort Mission" (Return to Backlog) logic to `useSprint.ts` and UI.
- **Key Decisions**:
    - **Live Read vs. Database Sync**: Decided to read markdown files directly using `fs/promises` rather than syncing them to a database. This ensures zero latency and always-up-to-date context without manual synchronization steps.
    - **Auto-Ignition**: Using a hidden system message to trigger the AI analysis immediately upon engagement improves the "Copilot" feel.
    - **Persistent Drafts**: Added `tasks_draft` JSONB to `evolutions` table to prevent data loss in the Evolution Lab interact.

### Session: Deployment & Infrastructure Hardening
- **Goal**: stabilize the Supabase database schema and resolve migration conflicts for a clean production deployment.
- **Accomplished**:
    - **Migration Repair**: Resolved version collisions (e.g., `20251230000700`) and "already exists" errors by making all migration scripts idempotent (`IF NOT EXISTS`, conditional policy creation).
    - **Schema Visualization**: Successfully deployed 34 migration files, establishing a robust foundation for the `ai_crew`, `evolutions`, and `task_chat_messages` tables.
    - **Constraint Fixes**: Updated strict `CHECK` constraints (document types) to `NOT VALID` to gracefully handle legacy data while enforcing rules for new entries.

### Session: Landing Page & Layout Polish
- **Goal**: Refine the initial user experience (Landing Page) and ensure robust mobile responsiveness.
- **Accomplished**:
    - **Animation Tuning**: Slowed landing page typing speed (150ms) and reduced glitch duration (2.5s) for a more cinematic feel.
    - **Header Formatting**: Fixed wrapping issues on "COMMAND YOUR CODEBASE" using `whitespace-nowrap` and expanded container width.
    - **Font Standardization**: Adopted **Geist Mono** as the global default font for all UI/Body text, while enforcing **VT323** for specialized headers via `font-vt323-force`.
    - **Mobile Layout**: Implemented a "Solid Flexbox Sidebar" to prevent content overlap and configured dynamic "Safe Area" padding (`pt-[calc(env(safe-area-inset-top)+3rem+7px)]`) to perfectly clear notches on all devices.
- **Key Decisions**:
    - **Global Monospace**: Switched the entire application to Geist Mono to reinforce the "Terminal/Command Deck" aesthetic at a foundational level.
    - **CSS Env Variables**: Moved away from hardcoded padding to `env(safe-area-inset-top)` to future-proof mobile layout against different device form factors (Notch vs. Dynamic Island vs. Standard).