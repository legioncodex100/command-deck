import { ConsultantBrain } from "./core/consultant_engine";

// 1. PHASE INITIALIZER (Architect Persona)
const architectBrain = new ConsultantBrain(
    "Lead System Architect",
    "Decompose Product Requirements into a strictly sequential build backlog.",
    ["Analyze PRD", "Identify Dependencies", "Generate Backlog List"],
    { "PRD": "Product Requirements Document" }
);

export async function breakdownPhases(prdContext: string): Promise<string[]> {
    try {
        const response = await architectBrain.processInteraction(
            [], // No history
            "Analyze the PRD and output a JSON array of strings representings the build phases. Example: ['1. Setup', '2. Auth']. Keep them high-level.",
            `PRD CONTENT:\n${prdContext}`,
            'EXPERT'
        );

        // The Brain returns { message: string, ... }. 
        // We need to parse the array from the message or a specific field if we adjusted the brain.
        // For now, let's assume the Brain's 'message' MIGHT contain the JSON, or we force it.

        // Actually, let's try to extract JSON from the response text
        const text = typeof response === 'string' ? response : (response.message || JSON.stringify(response));
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        // Fallback: Split by newlines if it looks like a list
        return text.split('\n')
            .filter((l: string) => /^\d+\./.test(l.trim()))
            .map((l: string) => l.trim());

    } catch (e) {
        console.error("Architect Breakdown Error:", e);
        return ["1. Foundation Setup", "2. Core Infrastructure", "3. Feature Implementation", "4. Polish"];
    }
}

// 2. PILOT SCRIPT GENERATOR (Engineer Persona)
const engineerBrain = new ConsultantBrain(
    "Lead Software Engineer",
    "Generate strictly technical 'Pilot Scripts' (Markdown Work Orders) for external coding agents.",
    ["Review Context", "Check Schema Compliance", "Draft Script"],
    {
        "PRD": "Requirements",
        "SCHEMA": "Database Structure (SQL)",
        "STRATEGY": "Technical Constraints",
        "DESIGN": "UI Tokens"
    }
);

export async function generatePilotScript(
    phase: string,
    context: { prd: string, schema: string, strategy: string, design: string }
): Promise<string> {

    const contextString = `
    PRD: ${context.prd.substring(0, 5000)}
    STRATEGY: ${context.strategy.substring(0, 5000)}
    SCHEMA: ${context.schema.substring(0, 5000)}
    DESIGN: ${context.design.substring(0, 2000)}
    `;

    const instructions = `
    Generate a PILOT SCRIPT for Phase: "${phase}".
    
    FORMAT:
    The output must be raw Markdown.
    
    SECTIONS:
    1. # Work Order: ${phase}
    2. ## Objective (One sentence)
    3. ## File Plan (List of files to create/edit)
    4. ## Step-by-Step Instructions (Atomic steps for an agent)
    5. ## Validation (How to check it works)
    
    RULES:
    - Reference specific table names from the SCHEMA.
    - Reference specific design tokens from DESIGN.
    - Do NOT write full code files. Write INSTRUCTIONS.
    - Enforce "Strict Layer Separation": DB calls in Actions/Services only.
    `;

    try {
        const response = await engineerBrain.processInteraction(
            [],
            instructions,
            contextString,
            'EXPERT'
        );

        return response.message || "Failed to generate script.";
    } catch (e) {
        console.error("Pilot Script Gen Error:", e);
        throw e;
    }
}
