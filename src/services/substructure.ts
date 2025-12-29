
import { ConsultantBrain, ComplexityLevel } from "./core/consultant_engine";

export type SchemaPillar = 'TABLES' | 'RELATIONSHIPS' | 'INDEXES' | 'RLS' | 'FUNCTIONS';

export const substructureBrain = new ConsultantBrain(
    "Senior Database Engineer",
    "Define a high-performance, normalized PostgreSQL schema (SCHEMA.sql) based on the STRATEGY.\n\nSTRICT BEHAVIOR PROTOCOL:\n1. ASK STRICTLY ONE QUESTION: Ask exactly one guiding question.\n2. BE SOCRATIC: Propose options if vague.\n3. FORCE DECISION CARD: If offering options, you MUST use 'consultant_recommendation'. Text-only choices are FORBIDDEN.\n4. RECOMMEND EXACTLY ONE: Mark EXACTLY ONE option as 'recommended: true'.\n5. FORMATTING: Use Markdown.",
    [
        "TABLES (Entities, types, constraints) -> STOP & VERIFY",
        "RELATIONSHIPS (Foreign keys, cascades) -> STOP & VERIFY",
        "INDEXES (Performance tuning) -> STOP & VERIFY",
        "RLS (Row Level Security Policies - MANDATORY) -> STOP & VERIFY",
        "FUNCTIONS (Triggers, automations)"
    ],
    {
        "schema_sql": "The CURRENT SQL content. If you have defined new tables or constraints, include them here merged with the previous SQL. If you are only discussing options and not changing the schema yet, return 'NO_CHANGE'.",
        "completed_pillars": "Array of strings for phases fully decided.",
        "consultant_recommendation": "Optional object { context: string, options: [{id, label, description, recommended}] }. Use this to present clear multiple-choice decisions to the user. Triggers when the user needs to select between distinct paths (e.g. 'Choose Primary Key')."
    }
);

export async function sendSubstructureMessage(
    message: string,
    history: { role: 'user' | 'model', text: string }[],
    strategyContent: string,
    prdContent: string,
    complexity: ComplexityLevel = 'INTERMEDIATE'
): Promise<{
    message: string,
    currentPhaseStatus: string,
    schemaSql: string,
    completedPillars: string[],
    consultantRecommendation?: {
        context: string,
        options: { id: string, label: string, description: string, recommended: boolean }[]
    }
}> {

    try {
        const combinedContext = `
        PROJECT PRD (The User's App Idea - PRIORITY):
        ${prdContent}

        TECHNICAL STRATEGY (The Constraints):
        ${strategyContent}
        `;

        const parsed = await substructureBrain.processInteraction(
            history,
            message,
            combinedContext,
            complexity
        );

        return {
            message: parsed.message || "Query failed.",
            currentPhaseStatus: parsed.current_phase_status || "Processing...",
            schemaSql: (typeof parsed.schema_sql === 'string' && parsed.schema_sql !== "NO_CHANGE")
                ? parsed.schema_sql
                : "",
            completedPillars: parsed.completed_pillars || [],
            consultantRecommendation: parsed.consultant_recommendation
        };

    } catch (e) {
        console.error("Substructure Engine Failed", e);
        return {
            message: "System Error: Database Engineer is unreachable.",
            currentPhaseStatus: "ERROR",
            schemaSql: "",
            completedPillars: []
        };
    }
}
