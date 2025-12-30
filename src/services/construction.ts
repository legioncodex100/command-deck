import { STRATEGY_MODEL } from "./gemini";

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

// Helper for API Calls
async function callAiApi(prompt: string, systemPrompt: string, model: string, jsonMode: boolean) {
    const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, systemPrompt, model, jsonMode })
    });

    if (!response.ok) {
        throw new Error(`AI API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result;
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

import { getAgentByKey } from "./crew";

// ... existing imports

export async function generateWorkOrder(context: ConstructionContext): Promise<any> {
    const agent = await getAgentByKey('lead_engineer');
    // Fallback if DB is empty/offline
    const systemPrompt = agent ? agent.system_prompt : `You are the Lead Engineer... (FALLBACK)`;
    const model = agent && agent.model_config ? agent.model_config.model : STRATEGY_MODEL;

    const prompt = `
    CONTEXT:
    TASK: ${JSON.stringify(context.task)}
    STRATEGY: ${context.strategy.substring(0, 3000)}
    DESIGN: ${context.design.substring(0, 3000)}
    SCHEMA: ${context.schema?.substring(0, 3000) || "N/A"}

    GOAL: Create a Work Order for this task.
    `;

    try {
        const responseText = await callAiApi(prompt, systemPrompt, model, true);
        return cleanAndParseJSON(responseText);
    } catch (e) {
        console.error("Work Order Gen Error:", e);
        throw e;
    }
}

export async function askEngineer(context: ConstructionContext, history: any[], question: string): Promise<string> {
    const agent = await getAgentByKey('senior_software_engineer');
    const systemPrompt = agent?.system_prompt || `You are the Senior Software Engineer... (FALLBACK)`;
    const model = agent?.model_config?.model || STRATEGY_MODEL;

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
        const responseText = await callAiApi(fullPrompt, systemPrompt, model, false);
        return responseText;
    } catch (e) {
        console.error("Engineer Chat Error:", e);
        return "I'm having trouble connecting to the engineering mainframe. Try again.";
    }
}

export async function startTaskSession(context: ConstructionContext): Promise<string> {
    const agent = await getAgentByKey('lead_engineer');
    const systemPrompt = agent?.system_prompt || `You are the Lead Engineer... (FALLBACK)`;
    const model = agent?.model_config?.model || STRATEGY_MODEL;

    const prompt = `
    TASK: ${JSON.stringify(context.task)}
    PRD: ${context.prd.substring(0, 1000)}
    STRATEGY: ${context.strategy.substring(0, 1000)}
    SCHEMA: ${context.schema?.substring(0, 1000) || "N/A"}
    
    Generate the Kickoff Message.
    `;

    try {
        const responseText = await callAiApi(prompt, systemPrompt, model, false);
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
