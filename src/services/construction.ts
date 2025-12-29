
import { generateText, STRATEGY_MODEL } from "./gemini";

export interface ConstructionContext {
    task: any;
    prd: string;
    strategy: string;
    design: string;
    schema?: string;
}

export interface WorkOrder {
    technical_context: string;
    steps: string[];
    acceptance_criteria: string[];
    code_hints?: { filename: string; snippet: string }[];
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
        return null;
    }
};

export async function generateWorkOrder(context: ConstructionContext): Promise<any> {
    const systemPrompt = `
    You are the Lead Engineer.
    Your goal is to generate a detailed "Work Order" for a specific task.
    
    The Work Order should provide the developer with EVERYTHING they need to build the task without looking elsewhere.
    - Context (Why?)
    - Technical Specs (What?)
    - Implementation Steps (How?)
    - Acceptance Criteria (Success?)

    **OUTPUT FORMAT (JSON ONLY):**
    {
        "technical_context": "Brief summary of how this fits into the architecture.",
        "steps": [
            "Step 1: Create file X...",
            "Step 2: Import Y..."
        ],
        "acceptance_criteria": [
            "Feature works when...",
            "Tests pass..."
        ],
        "code_hints": [
            { "filename": "utils.ts", "snippet": "function helper() {...}" }
        ]
    }
    `;

    const prompt = `
    CONTEXT:
    TASK: ${JSON.stringify(context.task)}
    STRATEGY: ${context.strategy.substring(0, 3000)}
    DESIGN: ${context.design.substring(0, 3000)}
    SCHEMA: ${context.schema?.substring(0, 3000) || "N/A"}

    GOAL: Create a Work Order for this task.
    `;

    try {
        const responseText = await generateText(prompt, systemPrompt, STRATEGY_MODEL, true);
        return cleanAndParseJSON(responseText);
    } catch (e) {
        console.error("Work Order Gen Error:", e);
        throw e;
    }
}

export async function askEngineer(context: ConstructionContext, history: any[], question: string): Promise<string> {
    const systemPrompt = `
    You are the Senior Software Engineer assisting with the build.
    You are an expert in React, Node.js, and Supabase.
    
    - Be concise and code-focused.
    - If the user asks for code, provide full, copy-pasteable blocks.
    - Refuse non-technical questions.
    `;

    const prompt = `
    CONTEXT:
    CURRENT TASK: ${JSON.stringify(context.task)}
    TECH STACK: ${context.strategy.substring(0, 2000)}
    SCHEMA: ${context.schema?.substring(0, 2000) || "N/A"}

    USER QUESTION: ${question}
    `;

    // Flatten history for simple prompt context
    const chatHistory = history.map(h => `${h.role.toUpperCase()}: ${h.text}`).join('\n');

    const fullPrompt = `
    ${prompt}
    
    HISTORY:
    ${chatHistory}
    `;

    try {
        const responseText = await generateText(fullPrompt, systemPrompt, STRATEGY_MODEL, false); // False = standard text mode
        return responseText;
    } catch (e) {
        console.error("Engineer Chat Error:", e);
        return "I'm having trouble connecting to the engineering mainframe. Try again.";
    }
}

export async function startTaskSession(context: ConstructionContext): Promise<string> {
    const systemPrompt = `
    You are the Lead Engineer and Architect.
    A developer is starting a new task. Your job is to GUIDE them through the build process iteratively.

    Kickoff Protocol:
    1.  **Summarize**: Briefly explain what we are building and why (1-2 sentences).
    2.  **Implementation Plan**: Outline the 2-3 major steps to build this.
    3.  **Step 1 Prompt**: Provide a SPECIFIC, COPY-PASTEABLE PROMPT that the developer should feed into their AI Editor (Windsurf, Cursor, etc.) to implement Step 1.
    
    Structure your response like this:
    "**Task Kickoff: [Task Name]**
    
    [Summary]
    
    **The Plan:**
    1. [Step 1]
    2. [Step 2]...
    
    ---
    
    **READY? Let's start with Step 1.**
    Copy this into your AI Editor:
    
    \`\`\`
    [Detailed Prompt for AI Editor to write the code for Step 1]
    \`\`\`
    
    Report back when done!"
    `;

    const prompt = `
    TASK: ${JSON.stringify(context.task)}
    PRD: ${context.prd.substring(0, 1000)}
    STRATEGY: ${context.strategy.substring(0, 1000)}
    SCHEMA: ${context.schema?.substring(0, 1000) || "N/A"}
    
    Generate the Kickoff Message.
    `;

    try {
        const responseText = await generateText(prompt, systemPrompt, STRATEGY_MODEL, false);
        return responseText;
    } catch (e) {
        console.error("Kickoff Error:", e);
        return "Ready to start. Asking for instructions...";
    }
}

import { supabase } from "./supabase";

export async function loadConstructionChat(projectId: string): Promise<Record<string, { role: 'user' | 'model', text: string }[]> | null> {
    try {
        const { data } = await supabase.from('documents')
            .select('content')
            .eq('project_id', projectId)
            .eq('type', 'CONSTRUCTION_CHAT')
            .single();

        if (data?.content) {
            return typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
        }
        return null;
    } catch (e) {
        console.error("Load Chat Error:", e);
        return null;
    }
}

export async function saveConstructionChat(projectId: string, chats: Record<string, any[]>): Promise<void> {
    try {
        await supabase.from('documents').upsert({
            project_id: projectId,
            type: 'CONSTRUCTION_CHAT',
            content: JSON.stringify(chats),
            title: 'Construction Chat Logs',
            updated_at: new Date().toISOString()
        }, { onConflict: 'project_id, type' });
    } catch (e) {
        console.error("Save Chat Error:", e);
    }
}
