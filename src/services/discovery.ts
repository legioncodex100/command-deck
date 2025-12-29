import { ConsultantBrain, ComplexityLevel } from "./core/consultant_engine";

// The 5 Phases of Discovery
export type DiscoveryPhase = 'VISION' | 'AUDIENCE' | 'LOGIC' | 'FEATURES' | 'EDGE_CASES';

export interface DiscoveryState {
    completedPhases: DiscoveryPhase[];
    currentPhase: DiscoveryPhase;
    currentPrd: string;
    chatHistory: { role: 'user' | 'model', text: string }[];
}




// The 5 Phases of Discovery


// Instantiate the Senior Business Analyst Brain
const discoveryBrain = new ConsultantBrain(
    "Senior Business Analyst",
    "Extract a comprehensive Product Requirements Document (PRD) from the user via Socratic interrogation.\n\nSTRICT BEHAVIOR PROTOCOL:\n1. ASK STRICTLY ONE QUESTION: Do not ask multiple questions. Ask exactly one guiding question to move the conversation forward.\n2. WAIT FOR ANSWER: Do not assume the user's response.\n3. BE SOCRATIC: If the user is vague, propose options.\n4. FORCE DECISION CARD: If you are proposing options of ANY kind (e.g. 'A vs B'), you MUST use 'consultant_recommendation'. Do not just list them in text. Text-only choices are FORBIDDEN.\n5. RECOMMEND EXACTLY ONE: In 'consultant_recommendation', mark EXACTLY ONE option as 'recommended: true'. Never recommend multiple.\n6. FORMATTING: Use Markdown (bolding, lists) to organize your response.",
    [
        "VISION (Establish **Category/Genre** first, then 'The Why', Core Value Prop, Elevator Pitch)",
        "AUDIENCE (User Personas, Pain Points)",
        "LOGIC (High-level User Flows, Core Mechanics)",
        "FEATURES (Specific Functional Requirements, MoSCoW prioritization)",
        "EDGE_CASES (Error states, constraints, risks)"
    ],
    {
        "prd_update": "The **FULL, CUMULATIVE** Markdown content for PRD.md. Do not return just a snippet. You must include previous sections + the new section. Use 'NO_CHANGE' if no update is needed.",
        "completed_phases": "Array of strings for phases fully defined (e.g. ['VISION']).",
        "consultant_recommendation": "Optional object { context: string, options: [{id, label, description, recommended}] }. Use this to present clear multiple-choice decisions to the user. Triggers when the user needs to select between distinct paths (e.g. 'Choose Project Type', 'Select Auth Strategy')."
    }
);

export async function sendDiscoveryMessage(
    message: string,
    history: { role: 'user' | 'model', text: string }[],
    currentPrd: string,
    complexity: ComplexityLevel = 'INTERMEDIATE'
): Promise<{
    message: string,
    currentPhaseStatus: string,
    prdUpdate: string,
    completedPhases: string[],
    consultantRecommendation?: {
        context: string,
        options: { id: string, label: string, description: string, recommended: boolean }[]
    }
}> {

    try {
        const parsed = await discoveryBrain.processInteraction(
            history,
            message,
            currentPrd,
            complexity
        );

        return {
            message: parsed.message || "I didn't catch that. Could you clarify?",
            currentPhaseStatus: parsed.current_phase_status || "Initializing...",
            prdUpdate: parsed.prd_update === "NO_CHANGE" ? "" : (parsed.prd_update || ""),
            completedPhases: parsed.completed_phases || [],
            consultantRecommendation: parsed.consultant_recommendation
        };

    } catch (e) {
        console.error("Discovery Logic Failed", e);
        return {
            message: "System Error: The Analyst is offline. Please try again.",
            currentPhaseStatus: "ERROR",
            prdUpdate: "",
            completedPhases: []
        };
    }
}
