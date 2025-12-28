import { generateText } from "./gemini";

// Mocks the behavior of generating a backlog from PRD + Strategy
// In a real scenario, this would send a prompt to Gemini with both documents attached.

const PLANNING_SYSTEM_PROMPT = `
You are the "Master Planner" for Command Deck.
Your goal is to bridge the gap between the Product Vision (PRD) and Technical Strategy (STRATEGY).
You must decompose the project into a prioritized, 10-Phase Build Plan (BACKLOG.md).

**Input:**
- PRD.md (User Stories & Features)
- STRATEGY.md (Technical Decisions & Constraints)

**Output Format (Markdown):**
Return a "BACKLOG.md" file content.
Structure it logically by Phases (Phase 1, Phase 2, etc.).
Each item must have:
- [ ] Task Name (Difficulty: Low/Med/High)
  - Technical Note: (e.g. "Use Stripe Connect" based on Strategy)
  - Priority: Critical/High/Medium

**Rules:**
- Phase 1 is always "Foundation & Scaffolding".
- Phase 10 is always "Launch & Handover".
- Ensure strict adherence to the tech stack defined in Strategy.
`;

export async function generateBacklog(prdContent: string, strategyContent: string) {
    const prompt = `
    PRD CONTENT:
    ${prdContent.substring(0, 10000)}

    STRATEGY CONTENT:
    ${strategyContent.substring(0, 5000)}

    Generate the BACKLOG.md now.
    `;

    try {
        // Use the strategy model (Gemini 2.5) for high reasoning
        // We reuse the generic generateText function
        const text = await generateText(
            prompt,
            PLANNING_SYSTEM_PROMPT,
            "gemini-2.0-flash-exp", // Using 2.0 Flash for speed/context window balance, or switch to 2.5 if needed
            false // Markdown mode
        );
        return text;
    } catch (error) {
        console.error("Backlog Generation Error:", error);
        throw error;
    }
}

export interface BuildItem {
    id: string;
    description: string;
    accepted: boolean;
    phase: number;
}
