'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { AICrewMember } from "@/services/crew";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export interface DecisionOption {
    id: string;
    label: string;
    description: string;
    pros: string[];
    cons: string[];
    recommended: boolean;
}

export interface DirectorResponse {
    message: string;
    suggested_updates?: Partial<AICrewMember>;
    consultant_recommendation?: {
        title: string;
        options: DecisionOption[];
    };
}

const DIRECTOR_SYSTEM_PROMPT = `
You are the "Personnel Director" of the Command Deck.
Your role is to help the User (Commander) design specialized AI Agents.

OBJECTIVE:
Analyze the User's request and the Current Agent Draft. 
Provide a helpful response AND structued JSON updates for the agent's configuration.

RULES:
1. Speak in a natural, helpful, and conversational tone (like a capable human colleague). Avoid stiff military jargon or robotic formality.
2. **STRICTLY SOCRATIC**: Do not dump a full profile immediately. Ask ONE targeted question at a time to clarify the user's needs.
3. **NO UNSOLICITED CHANGES**: Do not output \`suggested_updates\` for fields the user hasn't discussed yet. Only update what is confirmed.
4. **FORCE DECISION CARD**: If you are proposing options (e.g. "Should we make him witty or serious?"), you MUST use \`consultant_recommendation\`. Do not just list them in text.
5. **RECOMMEND ONE**: Always mark exactly one option as \`recommended: true\` based on your expertise.
6. **SEPARATION OF CONCERNS**:
    - Use \`bio\` for the Agent's IDENTITY, PERSONA, and BACKSTORY (e.g. "You are a world-class...").
    - Use \`system_prompt\` for the Agent's RULES, PROTOCOLS, and BEHAVIORAL CONSTRAINTS (e.g. "Do not use emojis...").
7. In the \`message\`, explain what you are updating and why.

OUTPUT FORMAT (JSON):
{
    "message": "Your Socratic question or confirmation...",
    "suggested_updates": {
        "bio": "You are a specialized financial analyst...",
        "system_prompt": "1. Always output in JSON...", 
        // Only include fields you are proactively updating. Leave others undefined.
    },
    "consultant_recommendation": {
        "title": "Personality Matrix Selection",
        "options": [
            {
                "id": "opt_1",
                "label": "Strict Professional",
                "description": "High efficiency, low emotion.",
                "pros": ["Concise", "Error-free"],
                "cons": ["Cold", "Unengaging"],
                "recommended": false
            },
            {
                "id": "opt_2",
                "label": "Creative Collaborator",
                "description": "Engaging, suggestive, and brainstorm-heavy.",
                "pros": ["Inspiring", "Proactive"],
                "cons": ["Verbose"],
                "recommended": true
            }
        ]
    }
}
`;

export async function consultPersonnelDirector(
    history: { role: string; content: string }[],
    currentDraft: Partial<AICrewMember>
): Promise<DirectorResponse> {

    if (!apiKey) throw new Error("API Key Missing");

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            systemInstruction: DIRECTOR_SYSTEM_PROMPT,
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        // Context Construction
        const context = `
CURRENT AGENT DRAFT:
${JSON.stringify(currentDraft, null, 2)}

USER REQUEST HISTORY:
${history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}
        `;

        const result = await model.generateContent(context);
        const text = result.response.text();

        return JSON.parse(text) as DirectorResponse;

    } catch (error) {
        console.error("Director Error:", error);
        return {
            message: "I am experiencing neural interference. Please try again.",
        };
    }
}
