MASTER_SPECIFICATION.md (v5.6 - Absolute Sync)

1. Vision

Command Deck is an open-workbench lifecycle orchestrator for Architect-Pilots. It digitizes the professional agency workflow through an immutable chain of contextual Markdown artifacts, overseen by a council of World-Class AI Consultants.

2. Service Architecture: The SaaS Protocol (v1.0)

To support multi-tenancy while preserving the "Host Integrity," the system operates on a Two-Tier Hierarchy:

*   **Tier 1: The Commander (Host)**
    *   **Access**: Full System Root.
    *   **Storage**: Physical Disk (`/docs` sync) + Database Mirror.
    *   **Privilege**: Can inspect, ban, and manage all Civilian projects via the Hangar Console.

*   **Tier 2: The Civilian (Tenant)**
    *   **Access**: Isolated Project Views.
    *   **Storage**: Virtual File System (Database `documents` table + S3 Storage). **Zero Physical Disk Access.**
    *   **Privilege**: Restricted to own projects. Cannot see or interact with other tenants.

3. The 11 Pillars: Linear Build Sequence

The mission follows a strict linear sequence where each lettered pillar hardens the blueprint for the next. Each phase produces a core artifact and a handover relay.

Pillar A: Discovery Lab (Output: PRD.md, RELAY_A.md)
    *   **Focus**: Socratic interrogation to define use case, audience, and core logic.

Pillar B: Strategy Room (Output: STRATEGY.md, RELAY_B.md)
    *   **Focus**: The "5-Pillar Framework" (Tenancy, State, Boundaries, Privacy, Infrastructure).
    *   **Rule**: Must flag contradictions between Technical Decisions and the PRD.

Pillar C: Substructure Architect (Output: SCHEMA.sql, RELAY_C.md)
    *   **Focus**: Tables, Relationships, RLS Policies, and Indexes.

Pillar D: Design Studio (Output: DESIGN.md, STITCH_PROMPT.md, RELAY_D.md)
    *   **Focus**: The "Perfection Loop". Bridges technical substructure and visual design.
    *   **Atomic Tokens**: Maps Google Stitch outputs to IDE-ready variables (Colors, Radii, Spacing).

Pillar E: Planning Hub (Output: BACKLOG.md, RELAY_E.md)
    *   **Focus**: Agile Sprint Planning. Decomposes the PRD into executable tasks.

Pillar F: Construction Factory (Output: INSTRUCTIONS.md, RELAY_F.md)
    *   **Focus**: Kanban-based execution. Enforces "Single Task Focus."

Pillar G: Integration Bridge (Output: SYNC_LOG.txt / Local Disk Mirror)
    *   **Focus**: The "Golden Gate" to production.
    *   **Host Protocol**: Syncs virtual artifacts to the physical disk (`/docs`).
    *   **Civilian Protocol**: Syncs artifacts to the "Virtual Vault" (Supabase Storage/DB). **Physical Write Access is HARD-BLOCKED.**

Pillar H: Structural Auditor (Output: AUDIT_LOG.md)
    *   **Focus**: Automated health checks and strict line-count enforcement.

Pillar I: Context Bridge (Output: MEMORY.md)

Pillar J: Documentation Engine (Output: TECH_SPEC.md)

Pillar K: Mission Mural (Output: CHRONOLOGY.md)

3. The Relay & Handover Protocols (Roling Synthesis v6.0)

To eliminate "Information Decay" and "Context Fragmentation," every pillar transition employs a **Rolling Synthesis Model**.

**The Concept:**
Every Relay Artifact functions as a "Save Game" or "Project Snapshot." It is cumulative.
*   RELAY_A: Pure Discovery intent.
*   RELAY_B: Synthesis of [RELAY_A + Strategy Decisions].
*   RELAY_C: Synthesis of [RELAY_B + Database Architecture].

**Goal:** The current AI Consultant only needs to read the Master Spec and the **Immediate Previous RELAY** to possess 90% of the project's "soul" and context.

**The "Relay Schema" (Mandatory Sections):**
Every `RELAY_[LETTER].md` must contain these four Context Anchors:

1.  **The Core Soul**: 1-sentence project essence. (Prevents forgetting the mission).
2.  **Pillar Progress**: Rolling summary of all previous pillars (Cumulative Chain).
3.  **Handover Brief**: Direct instructions for the next persona (AI-to-AI communication).
4.  **Technical Debt**: Decisions that may cause friction later ("Weak Spot" flags).

4. The Context Ripple Protocol (v5.3)

If a Pilot modifies an early pillar (e.g., Pillar A) while downstream pillars (B-K) are active:

Stale State: Downstream pillars are immediately marked [REVIEW REQUIRED].

Reconciliation: The Pilot must "re-handshake" through the sequence to ensure changes "ripple" correctly from the point of origin to the current build phase.

5. Consultant Behavioral Standards

All AI instances within the workbench must adhere to the Standard Consultant Protocol:

Single Question Limit: Ask exactly one targeted question at a time to prevent cognitive overload.

Forced Decision Cards: If a choice is required, the AI must provide a structured JSON decision card.

Context Injection: The AI must prioritize the PRD.md as the primary source of truth for business intent.

Session Reset Obligations: If the Pilot signals a pivot, the AI must summarize the previous session before clearing the buffer.

6. Antigravity Indexing Rules

The /docs Mandate: Every strategic decision must be written to a file in the /docs directory.

Context Injection: Before any code generation, the Pilot must command the Agent to "Index /docs".

SLS Compliance: Strict Layer Separation (Data/Logic/UI) is mandatory. Data logic is forbidden inside UI components.

7. Technical Guardrails

Aesthetic: NASA-Modern Minimalist (#000000 root, #27272a borders, zero shadows).

File Limits: Strict 150-line limit per file. Overages require immediate refactoring.

Inheritance: Pillar [X] inherits [All Previous Artifacts + All Previous RELAY files].

8. Developer Mode Protocol (Host Debugger)

To ensure architectural integrity, the platform includes a hidden "God View" for the Architect-Pilot.

**Access Control:**
*   **Activation**: Hidden toggle via `Cmd + Shift + D`.
*   **Visual Indicator**: A persistent **Amber Border (#f59e0b)** surrounds the viewport when active.

**Core Debugging Tools:**
*   **Context Inspector**: Real-time visualization of the "Rolling Synthesis" buffer (Master Spec + Relays) sent to Gemini.
*   **SLS Scanner**: A live regex-auditor that flags prohibited database patterns (e.g., `useEffect` data fetching) in the UI.
*   **Ripple Trigger**: A simulation button to manually force downstream pillars into a [STALE] state to verify UI reactivity.

**Safety Rule**: Developer Mode is for **Observation & Simulation** only. It does not bypass RLS or production write protections.