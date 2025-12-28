Module Spec: Project Context & Multi-Tenancy (Updated)

Objective: Transform the Command Deck into a multi-project orchestrator with state tracking.

1. Data Scoping & Mission State

Every project record must now track its lifecycle position.

Table: projects

current_stage (enum: DISCOVERY, DESIGN, SUBSTRUCTURE, CONSTRUCTION, AUDIT, HANDOVER)

is_completed (boolean)

2. The Context Map

The useProject() hook will now provide a missionStatus object.

This object informs the UI which tools are active. For example, if current_stage is DISCOVERY, the "Structural Auditor" is hidden to prevent cognitive overload.

3. The Project Switcher

When switching projects, the entire UI "re-skins" itself to match the mission stage of the selected project.