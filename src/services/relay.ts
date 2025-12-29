
import { generateText, STRATEGY_MODEL } from "./gemini";

interface RelayContext {
    currentPhase: string; // e.g., "DISCOVERY"
    nextPhase: string;    // e.g., "STRATEGY"
    artifactContent: string; // The content of the main output (PRD, Strategy Doc, etc.)
    decisions: string;       // Summary of key chat decisions (optional)
    previousRelayContent?: string; // Content of the previous relay for Rolling Synthesis
}

export async function generateRelayArtifact(context: RelayContext): Promise<string> {
    const systemPrompt = `
    You are the "Relay Officer" for the Command Deck. 
    Your strict responsibility is to ensure ZERO INFORMATION DECAY between project phases.

    Goal: Create a **CUMULATIVE RELAY SNAPSHOT** (Rolling Synthesis) that carries the "Soul of the Project" forward.
    You must synthesize the [Previous Relay] + [Current Work] into a new, unified truth.

    **MANDATORY OUTPUT SCHEMA (Markdown):**
    # RELAY PROTOCOL: [CURRENT] -> [NEXT]

    ## 1. The Core Soul
    (1 sentence: The absolute essence of what we are building. Must be preserved from the Previous Relay.)

    ## 2. Pillar Progress (Cumulative)
    (A rolling summary of the project history. Integrate the Previous Pillar's summary with the new work done in this phase.)

    ## 3. Handover Brief
    (Direct, persona-to-persona instructions for the [NEXT PHASE] Consultant. E.g., "The Database is locked, now design the UI within these constraints.")

    ## 4. Technical Debt & Risks
    (List explicit decisions that are "shaky" or need monitoring. Carry over unresolved risks from the previous relay.)
    `;

    const prompt = `
    PHASE TRANSFER: ${context.currentPhase} -> ${context.nextPhase}

    ${context.previousRelayContent ? `
    === PREVIOUS RELAY SNAPSHOT (The Past) ===
    ${context.previousRelayContent.substring(0, 5000)}
    ` : '=== NO PREVIOUS RELAY (Genesis Phase) ==='}

    === CURRENT PHASE WORK (The Present) ===
    Core Artifact:
    ${context.artifactContent.substring(0, 8000)}

    Key Decisions:
    ${context.decisions.substring(0, 2000)}

    TASK: Generate the new RELAY_[LETTER].md using the Rolling Synthesis model.
    `;

    try {
        const response = await generateText(prompt, systemPrompt, STRATEGY_MODEL, false);
        return response;
    } catch (e) {
        console.error("Relay Generation Failed", e);
        throw e;
    }
}
