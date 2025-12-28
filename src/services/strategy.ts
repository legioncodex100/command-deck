import { ConsultantBrain, ComplexityLevel } from "./core/consultant_engine";

// The 5 Pillars of Technical Strategy
export type StrategyPillar = 'TENANCY' | 'STATE' | 'BOUNDARIES' | 'PRIVACY' | 'INFRASTRUCTURE';

export interface StrategyState {
    completedPillars: StrategyPillar[];
    currentTopic: StrategyPillar | 'DONE';
    draftContent: string; // The live markdown content
    chatHistory: { role: 'user' | 'model', text: string }[];
}

const strategyBrain = new ConsultantBrain(
    "Lead Systems Architect",
    "Define a robust technical strategy (STRATEGY.md) by rigorously questioning the user across 5 pillars.",
    [
        "TENANCY (Database isolation, RLS)",
        "STATE (Complex logic, stores, optimistic UI)",
        "BOUNDARIES (External APIs, webhooks, rate limits)",
        "PRIVACY (PII, access controls, compliance)",
        "INFRASTRUCTURE (Environment vars, edge config, regions)"
    ],
    {
        "draft_update": "The **FULL, CUMULATIVE** Markdown content for STRATEGY.md. Do not return just a snippet. You must include previous sections + the new section. Use 'NO_CHANGE' if no update is needed.",
        "completed_pillars": "Array of strings for pillars fully decided."
    }
);

export async function sendStrategyMessage(
    message: string,
    history: { role: 'user' | 'model', text: string }[],
    prdContent: string,
    complexity: ComplexityLevel = 'INTERMEDIATE'
): Promise<{
    message: string,
    currentPhaseStatus: string,
    draftUpdate: string,
    completedPillars: string[],
    consultantRecommendation?: {
        context: string,
        options: { id: string, label: string, description: string, recommended: boolean }[]
    }
}> {

    try {
        const parsed = await strategyBrain.processInteraction(
            history,
            message,
            prdContent,
            complexity
        );

        return {
            message: parsed.message || "I didn't catch that. Could you clarify?",
            currentPhaseStatus: parsed.current_phase_status || "Initializing...",
            draftUpdate: (typeof parsed.draft_update === 'string' && parsed.draft_update !== "NO_CHANGE")
                ? parsed.draft_update
                : (typeof parsed.draft_update === 'object' ? JSON.stringify(parsed.draft_update) : ""),
            completedPillars: parsed.completed_pillars || [],
            consultantRecommendation: parsed.consultant_recommendation
        };

    } catch (e) {
        console.error("Strategy Verification Failed", e);
        return {
            message: "System Error: The Consultant is offline. Please try again.",
            currentPhaseStatus: "ERROR",
            draftUpdate: "",
            completedPillars: []
        };
    }
}
