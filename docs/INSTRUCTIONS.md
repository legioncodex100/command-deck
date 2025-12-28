Work Order: Phase 12.7 (Pillar H - Design Studio)

Objective: Deploy the high-fidelity Design Studio governed by the Creative Director persona. Extract visual intent and design tokens into a DESIGN.md artifact.

1. Primary Tasks

Route: Implement /design.

The Consultant Brain:

Persona: Creative Director.

Tone: Visionary, meticulous about hierarchy, and obsessed with "The Pilot's Cockpit" UX.

Logic: Analyzes the PRD to derive brand keywords and translates them into technical design tokens.

Intelligence Layout: 3-Column Cockpit (Cyber-Industrial Standard).

Left: Design Roadmap (Identity -> Visual DNA -> Journey Map -> Tokens).

Center: Creative Workbench (Conversational UI with Image Analysis capabilities).

Right: Tabbed Output (Tab 1: Live DESIGN.md | Tab 2: Inherited PRD.md).

2. Design Constraints

Output Artifact: DESIGN.md must include:

Brand Identity: Mood and keywords.

Stitch Tokens: CSS variables for Background, Surface, Primary, and Status colors.

Typography: Font definitions for Sans (UI) and Mono (Data).

Journey Map: High-level screen flow definitions.

3. UI/UX Specifications

Aesthetic: Cyber-Industrial (Pure Black, Zinc-800 Borders).

Multimedia: The chat input must support image uploads/pasting for "Inspiration Analysis."

Token Preview: Implement a small visual "DNA Strip" in the right panel that shows the active palette colors as they are decided.

4. Construction Command (Paste into Agent)

"Agent, execute Phase 12.7: The Design Studio.

Create the /design route using the provided Pillar_H_DesignStudio.jsx as the blueprint.

Instantiate the 'Creative Director' persona using the ConsultantBrain factory logic.

On load, the studio must query the documents table to inherit the PRD.md context from Pillar A.

Implement the 'Creative Workbench' in the center, ensuring the Gemini 2.5 Flash model is configured for image understanding (to analyze UI screenshots).

Implement the 'Tabbed Intelligence Panel' on the right:

Tab 1: Live DESIGN.md extraction.

Tab 2: Strategic Vision (PRD) reference.

The 'Commit Design' action must save the final output as DESIGN.md in the documents table, enabling downstream inheritance for the Construction Factory."

5. Verification Gate

[ ] UI follows the 3-column cockpit layout.

[ ] Creative Director uses the PRD to suggest "Brand Keywords."

[ ] Image upload/paste works for design analysis.

[ ] DESIGN.md includes valid Stitch-compatible design tokens.