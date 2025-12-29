
import { generateText, STRATEGY_MODEL } from "./gemini";

interface PlanningContext {
    prd: string;
    strategy: string;
    design: string;
    schema?: string;
}

// Helper to clean JSON
const cleanAndParseJSON = (text: string): any => {
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleaned = jsonMatch[0];
    try {
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("JSON Parse Fail:", text);
        // Fallback for when model returns partial text + json
        return { message: "Analysis complete (Partial JSON)", tasks: [] };
    }
};

export async function evaluateHandover(context: PlanningContext): Promise<string> {
    const systemPrompt = `
    You are the Senior Technical Project Manager (PM).
    You have just received the DESIGN HANDOVER (Pillar D -> Pillar E).
    
    **GOAL**:
    Greet the user and provide a high-level summary of what was handed over.
    
    **OUTPUT FORMAT**:
    A single conversational message (Paragraphs + Bullets).
    Step 1: Acknowledge the inputs (e.g., "I've reviewed the design for [Project Name]...").
    Step 2: Highlight key constraints or design choices from the context.
    Step 3: Propose the next immediate step (usually "Shall we decompose this into a backlog?").
    
    Keep it professional, concise, and focused on moving to PLANNING.
    `;

    const prompt = `
    INCOMING CONTEXT:
    PRD Summary: ${context.prd.substring(0, 2000)}
    Strategy Summary: ${context.strategy.substring(0, 1000)}
    Design Handover: ${context.design.substring(0, 4000)}

    TASK: Write the initial PM greeting and evaluation message.
    `;

    try {
        return await generateText(prompt, systemPrompt, STRATEGY_MODEL, false);
    } catch (e) {
        console.error("Handover Eval Error:", e);
        return "System: Error evaluating handover. Ready to plan.";
    }
}

export async function decomposeToBacklog(context: PlanningContext, history: any[] = []): Promise<any> {
    const systemPrompt = `
    You are the Senior Technical Project Manager.
    Your goal is to convert the PRD, Strategy, and Design into a **BACKLOG.md** artifact and a structued Task List.

    **DECOMPOSITION RULES:**
    1.  **Dependency Analysis**: Determine the logical sequence (Schema -> Auth -> API -> UI).
    2.  **Granularity**: Atomic sub-tasks (2-4 per story).
    3.  **Cross-Check**: Align with Strategy & Design.
    4.  **Prioritization**: P0 (Blockers), P1 (Core), P2 (Polish).
    5.  **Markdown Format**: In the backlog_artifact, lists tasks EXACTLY as: - [ ] **TASK-ID**: Title

    **OUTPUT FORMAT (JSON ONLY):**
    You must output a SINGLE JSON object. Do not include any conversational text outside the JSON.
    {
        "message": "Backlog generated successfully.",
        "backlog_artifact": "# Project Backlog\\n\\n## Phase 1...",
        "tasks": [
            { "id": "TAS-1", "title": "Setup DB", "priority": "P0", "phase": "Phase 1: Foundation", "status": "BACKLOG" }
        ]
    }
    `;

    const prompt = `
    CONTEXT:
    PRD: ${context.prd.substring(0, 5000)}
    STRATEGY: ${context.strategy.substring(0, 3000)}
    DESIGN: ${context.design.substring(0, 3000)}
    SCHEMA: ${context.schema?.substring(0, 3000) || "N/A"}

    TASK: Decompose this into a detailed backlog.
    `;

    try {
        const responseText = await generateText(prompt, systemPrompt, STRATEGY_MODEL, true);
        return cleanAndParseJSON(responseText);
    } catch (e) {
        console.error("Backlog Gen Error:", e);
        throw e;
    }
}

export async function assessRisks(context: PlanningContext): Promise<any> {
    const systemPrompt = `
    You are the Lead Solutions Architect.
    Analyze the project for technical risks, bottlenecks, and complexity spikes.

    **OUTPUT FORMAT (JSON ONLY):**
    {
        "message": "Risk assessment complete.",
        "risk_artifact": "# Risk Assessment\\n\\n## Technical Risks\\n- [HIGH] ...",
        "tasks": [] 
    }
    `;

    const prompt = `
    CONTEXT:
    PRD: ${context.prd.substring(0, 5000)}
    STRATEGY: ${context.strategy.substring(0, 3000)}

    TASK: Perform a technical risk assessment.
    `;

    try {
        const responseText = await generateText(prompt, systemPrompt, STRATEGY_MODEL, true);
        return cleanAndParseJSON(responseText);
    } catch (e) {
        console.error("Risk Gen Error:", e);
        throw e;
    }
}

export async function createRoadmap(context: PlanningContext): Promise<any> {
    const systemPrompt = `
    You are the Engineering Director.
    Create a step-by-step Implementation Roadmap.

    **OUTPUT FORMAT (JSON ONLY):**
    {
        "message": "Roadmap generated.",
        "roadmap_artifact": "# Implementation Roadmap\\n\\n1. **Week 1**: ...",
        "tasks": []
    }
    `;

    const prompt = `
    CONTEXT:
    PRD: ${context.prd.substring(0, 5000)}
    STRATEGY: ${context.strategy.substring(0, 3000)}

    TASK: Create a sequential implementation roadmap.
    `;

    try {
        const responseText = await generateText(prompt, systemPrompt, STRATEGY_MODEL, true);
        return cleanAndParseJSON(responseText);
    } catch (e) {
        console.error("Roadmap Gen Error:", e);
        throw e;
    }
}
