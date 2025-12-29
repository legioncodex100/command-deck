Module Spec: Developer Mode & Sandbox Integration (v5.7)

Objective: Provide a high-velocity testing environment that uses the Sandbox Engine to simulate project lifecycles without risking "Live" agency data.

1. The Separation of Concerns

To ensure you never test on live projects, the system enforces a strict data boundary:

Production Mode: Accesses real projects. Sandbox tools are hidden.

Developer Mode: Only allowed to interact with projects prefixed with sandbox_test_.

2. Core Integration: The Sandbox Utility

The Sandbox is the "Fast-Forward" button within Developer Mode.

A. The State Injector (Warp Gate)

Function: Instead of manual chatting, the Pilot can click a "Warp to Pillar [X]" button.

Logic: The Sandbox Engine instantly writes mock PRD.md, STRATEGY.md, SCHEMA.sql, and RELAY files into the documents table for that test project.

Purpose: Allows testing of downstream pillars (like the Construction Factory) without manually completing the preceding dialogue phases.

B. The "Ghost Project" Protocol

When Developer Mode is toggled ON, any "Create Project" action automatically generates a sandbox_test_[UUID] identifier.

Row Level Security (RLS) handles the isolation, but the UI must visually distinguish these missions with an Amber border.

3. Observability Tools (The X-Ray)

While the Sandbox provides the data, Developer Mode provides the visibility:

Context Inspector: Shows the raw string being sent to Gemini (including the cumulative Relay files and Master Spec).

SLS Scanner: A real-time UI overlay that flags any prohibited database calls (e.g., onSnapshot or addDoc appearing directly in a Pillar component instead of a service).

Ripple Simulator: Manually marks an artifact as "Stale" to verify the Sidebar's reactive [REVIEW REQUIRED] states.

4. Access & Aesthetics

Shortcut: Cmd + Shift + D (Mac) or Ctrl + Shift + D (Windows).

Visual Identity: A persistent 3px Amber border (#f59e0b) around the entire viewport when active.

Control Center: A slide-over "System Inspector" panel on the right side of the screen.

5. Operational Safety

Purge Button: A "Nuke Sandbox" utility that deletes all records with the sandbox_test_ prefix.

Persistence Toggle: Ability to run the AI in "Memory Only" mode where generated artifacts are not committed to the database.