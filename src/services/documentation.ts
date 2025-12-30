import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

const TECH_SPEC_PROMPT = `
You are the Technical Lead. Generate a DEVELOPER_GUIDE.md based on the provided System Blueprint.

Include:
1. System Overview (Architecture & High-Level Patterns)
2. Data Dictionary (Explain the Schema)
3. Logic Map (Explain key business flows)
4. Setup Instructions

Output Format: Markdown.
`;

const USER_GUIDE_PROMPT = `
You are the Product Manager. Generate a USER_HELP.md based on the provided System Blueprint/PRD.

Include:
1. Introduction (What does this app do?)
2. Feature Guides (How to use the main features?)
3. FAQ (Common questions based on the logic)

Output Format: Markdown.
`;

import { getAgentByKey } from "./crew";

// ... existing imports

export async function generateTechSpec(blueprintContext: string) {
    if (!apiKey) throw new Error("API Key missing");

    const agent = await getAgentByKey('tech_lead');
    const systemPrompt = agent?.system_prompt || TECH_SPEC_PROMPT;
    const modelName = agent?.model_config?.model || "gemini-2.0-flash-exp";
    const activeModel = genAI.getGenerativeModel({ model: modelName });

    try {
        const result = await activeModel.generateContent(`${systemPrompt}\n\nBLUEPRINT CONTEXT:\n${blueprintContext}`);
        return result.response.text();
    } catch (e) {
        console.error("Tech Spec Gen Error:", e);
        throw e;
    }
}

export async function generateUserGuide(blueprintContext: string) {
    if (!apiKey) throw new Error("API Key missing");

    const agent = await getAgentByKey('product_manager');
    const systemPrompt = agent?.system_prompt || USER_GUIDE_PROMPT;
    const modelName = agent?.model_config?.model || "gemini-2.0-flash-exp";
    const activeModel = genAI.getGenerativeModel({ model: modelName });

    try {
        const result = await activeModel.generateContent(`${systemPrompt}\n\nBLUEPRINT CONTEXT:\n${blueprintContext}`);
        return result.response.text();
    } catch (e) {
        console.error("User Guide Gen Error:", e);
        throw e;
    }
}
