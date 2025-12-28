MEMORY.md: Command Deck Platform Index (Host)

1. Purpose

To maintain a persistent, chronological record of the Command Deck Platform evolution, preventing "Context Drift" for Antigravity agents while they build the tool's 11 pillars. This file serves as the "Context Bridge" for the orchestrator itself.

2. Core Platform Features

The following capabilities are being baked into the deck to maintain project integrity:

Timeline View: A visual history of project creation, blueprint versions, and audit results.

Context Export: Markdown summary generation including schemas, audit scores, and project descriptions.

Intelligence Sync: Multi-pillar inheritance ensures AI agents never start from a blank page.

3. Active System Context

Current Project: Command Deck (Lifecycle Orchestrator)

Target IDE: Google Antigravity

Active Build Stage: STAGE 2 (Foundation & Facade)

Functional Pillars: * Pillar A (Discovery Lab): v2.1 Functional (refactored with ConsultantBrain).

Pillar B (Strategy Room): v2.0 Functional (Socratic branching active).

Pillar C (Substructure): v2.7 Functional (SQL extraction + Visualizer).

In-Progress Pillar: Pillar D (Design Studio - World Class Consultant & Stitch Loop).

4. Platform Architecture Decisions

Persistence: Standardized on Supabase (PostgreSQL) artifacts and documents tables scoped by project_id.

Intelligence: Standardized on gemini-2.5-flash-preview-09-2025 for all Consultant personas.

Pattern: Strict Layer Separation (SLS). Logic resides in src/services, UI in src/components.

Design: Cyber-Industrial aesthetic (Pure Black #000000, Zinc borders #27272a, Geist typography).

5. Maintenance Log (Platform Build)

[2025-12-26] Structural Audit - v1.0 MVP

Status: PASSED

SLS Compliance: 100% (No direct Supabase calls in UI).

File Lengths: All files < 150 lines.

Watchlist: src/app/audit/page.tsx (142 lines) - Requires refactor in Pillar H phase.

Architecture Verification: Confirmed separation of /services, /hooks, and /components.

[2025-12-28] Alphabetical Alignment Sync

Status: PASSED

Action: Re-aligned all 11 pillars to a chronological A-K sequence.

Result: Discovery(A) > Strategy(B) > Substructure(C) > Design(D) > Planning(E) > Construction(F).

[2025-12-28] Design Studio Elevation

Status: ACTIVE

Objective: Implementing the "Stitch Perfection Loop" in Pillar D to allow pixel-perfect UI synthesis.

6. System Schema Snapshot (Core Core)

Projects (Table)

id: uuid (Primary Key)

name: varchar (e.g., "One Piece TCG")

user_id: uuid

current_stage: varchar (A-K sequence tracking)

Documents (Table)

id: uuid

project_id: uuid (Link to project)

type: varchar (PRD, STRATEGY, SCHEMA, DESIGN, MEMORY)

content: text (The actual Markdown/SQL)

Blueprints (Table)

project_id: uuid

content: jsonb (Foundation, Logic Flow)

version: int

Audit Logs (Table)

project_id: uuid

findings: jsonb (Score, Violations)

risk_score: int (0-100 invert)

Messages (Table)

id: uuid

pillar: varchar (e.g., "DESIGN")

role: varchar (user/model/system)

text: text