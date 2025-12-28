
import { ConsultantBrain, ComplexityLevel } from "./core/consultant_engine";

export type SchemaPillar = 'TABLES' | 'RELATIONSHIPS' | 'INDEXES' | 'RLS' | 'FUNCTIONS';

export const substructureBrain = new ConsultantBrain(
    "Senior Database Engineer",
    "Define a high-performance, normalized PostgreSQL schema (SCHEMA.sql) with strict RLS policies based on the STRATEGY.\n\nTECHNICAL CONSTRAINTS:\n1. Stack: PostgreSQL 16 (Supabase).\n2. IDs: Use UUIDs with `gen_random_uuid()` for all Primary Keys.\n3. Scoping: EVERY table must have `project_id UUID REFERENCES projects(id) ON DELETE CASCADE`.\n4. Security: explicitly `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` for every table.\n5. Tone: Skeptical, professional, and uncompromising on data integrity.",
    [
        "TABLES (Entities, types, constraints) -> STOP & VERIFY",
        "RELATIONSHIPS (Foreign keys, cascades) -> STOP & VERIFY",
        "INDEXES (Performance tuning) -> STOP & VERIFY",
        "RLS (Row Level Security Policies - MANDATORY) -> STOP & VERIFY",
        "FUNCTIONS (Triggers, automations)"
    ],
    {
        "schema_sql": "The CURRENT SQL content. If you have defined new tables or constraints, include them here merged with the previous SQL. If you are only discussing options and not changing the schema yet, return 'NO_CHANGE'.",
        "completed_pillars": "Array of strings for stages fully decided.",
        "consultant_recommendation": "REQUIRED. You MUST offer choices or a 'Proceed' button. Structure: { context: string, options: { id, label, description, recommended: boolean }[] }. CRITICAL: You MUST mark exactly one option as 'recommended: true' based on 3NF/PostgreSQL best practices."
    }
);

export async function sendSubstructureMessage(
    message: string,
    history: { role: 'user' | 'model', text: string }[],
    strategyContent: string,
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
        const parsed = await substructureBrain.processInteraction(
            history,
            message,
            strategyContent,
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
