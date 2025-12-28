Module Spec: The Orchestration Engine (Workbench Mode)

Objective: Transition from a "Forced Wizard" to an "Open Orchestrator" (Workbench) that provides free-flowing access while maintaining a "Golden Path" of recommendations and centralized asset management.

1. Unlocked Navigation

Architecture: All routes in the /src/app directory must be accessible to authenticated users regardless of the project's mission_stage.

UI Feedback: Use visual status checkmarks in the sidebar to show progress without disabling the buttons.

Hollow Circle: Not started.

Pulse Ring: Recommended next step.

Green Check: Substantive artifacts (e.g., PRD, Schema) detected.

2. The Project Dashboard (Mission Hub)

Function: The high-level landing page and "Situation Room" for every project.

Mission Status Banner: A prominent header displaying the AI-recommended "Next Best Action."

Project Vault (File Explorer): A searchable grid/list of all project artifacts.

Actions: "View", "Delete", and "Copy for AI" (wraps content in <context> tags).

Activity Feed: A dynamic timeline showing the last 5 project events (e.g., "PRD Generated", "Work Order Created").

Health Radar: Real-time visibility into "Architectural Integrity" scores derived from Pillar D (Structural Auditor).

3. Soft Guidance (Recommendation Banners)

Logic: The engine analyzes the presence of artifacts to identify the "Golden Path":

IF PRD exists AND DESIGN is missing -> Recommend Design Studio.

IF DESIGN exists AND SCHEMA is missing -> Recommend Substructure Architect.

IF SCHEMA exists AND no INSTRUCTIONS -> Recommend Construction Factory.

UI: Display non-blocking <RecommendationBanner /> alerts at the top of pages when prerequisites are missing, offering a direct link to the recommended stage.

4. Manual Overrides

Autonomy: Users can manually override the project's mission_stage in the settings to align the Recommendation Engine with any external progress or manual updates made to the local /docs folder.

5. State Persistence

All progress tracking and dashboard activity must be persisted to the projects and documents tables in Supabase, ensuring the workbench "remembers" its state across sessions.