# MEMORY.md

## Project: Command Deck

### Core Objective
Build a "civilian-facing" interface (The Deck) for the Legion Grappling CRM, allowing non-admin users (Civilians/Operatives) to view their stats, manage their profile, and interact with the system.

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