import { generateText, STRATEGY_MODEL } from "../gemini";

export interface ConsultantMessage {
    role: 'user' | 'model';
    text: string;
    // Enhanced actionable payload
    consultantRecommendation?: {
        context: string;
        options: {
            id: string;
            label: string;
            description: string;
            recommended: boolean;
        }[];
        selectedId?: string;
    };
    // Generic placeholder for other outputs (Draft updates, etc)
    [key: string]: any;
}

export type ComplexityLevel = 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';

export class ConsultantBrain {
    constructor(
        private role: string,
        private goal: string,
        private stages: string[],
        private contextKeys: Record<string, string> // key -> instruction
    ) { }

    public generateSystemPrompt(mode: ComplexityLevel): string {
        return `
        You are the "${this.role}" for the Command Deck.
        Your goal is: ${this.goal}.
        
        The process consists of these sequential stages:
        ${this.stages.map((s, i) => `${i + 1}. ${s}`).join('\n')}

        CRITICAL PROTOCOL:
        1. Ask STRICTLY ONE question at a time.
        2. Wait for the user's answer before proceeding.
        3. If you record a decision or recommendation, your text MUST immediately transition to the next topic.
        4. **MANDATORY UI RULE:** If you are asking the user to choose between distinct options (e.g., "A or B?", "Style X or Style Y?"), you **MUST** use the 'consultant_recommendation' object in your JSON response to present these as clickable cards. **NEVER** ask a "this or that" question purely in text.

        **Response Format (JSON):**
        You must output a JSON object with these fields:
        1. "message": Your text response.
        2. "current_phase_status": A short string indicating context (e.g., "PHASE 1/5: VISION").
        3. "consultant_recommendation": (Optional) Use this when offering strategic choices. Structure:
           {
             "context": "Background on the choice needed",
             "options": [
               { "id": "A", "label": "Option Name", "description": "Trade-offs/Reasoning", "recommended": boolean }
             ]
           }
        ${Object.entries(this.contextKeys).map(([k, desc], i) => `${4 + i}. "${k}": ${desc}`).join('\n')}

        **Mode Behavior:**
        ${this.getModeInstructions(mode)}
        `;
    }

    private getModeInstructions(mode: ComplexityLevel): string {
        switch (mode) {
            case 'BEGINNER':
                return `
                **MODE: BEGINNER (The Mentor)**
                - Explain concepts simply (ELI5).
                - Focus on "The Why" before "The How".
                `;
            case 'INTERMEDIATE':
                return `
                **MODE: INTERMEDIATE (The Analyst)**
                - Standard professional tone.
                - Focus on clear requirements and removing ambiguity.
                `;
            case 'EXPERT':
                return `
                **MODE: EXPERT (The Executive)**
                - Critical, challenging, data-driven.
                - Challenge feature bloat aggressively.
                - Focus on MVP definition and limitations.
                `;
            default:
                return "";
        }
    }

    public async processInteraction(
        history: { role: 'user' | 'model', text: string }[],
        userMessage: string,
        contextData: string,
        complexity: ComplexityLevel = 'INTERMEDIATE'
    ): Promise<any> {

        const systemPrompt = this.generateSystemPrompt(complexity);

        const promptContext = `
        CURRENT ARTIFACT STATE:
        ${contextData.substring(0, 6000)}

        CHAT HISTORY:
        ${history.map(h => `${h.role.toUpperCase()}: ${h.text}`).join('\n')}

        USER'S NEW MESSAGE:
        ${userMessage}
        `;

        try {
            const responseText = await generateText(
                promptContext,
                systemPrompt,
                STRATEGY_MODEL,
                true // JSON Mode
            );

            return this.cleanAndParseJSON(responseText);

        } catch (e) {
            console.error(`${this.role} Brain Failed:`, e);
            throw e;
        }
    }

    private cleanAndParseJSON(text: string): any {
        // 1. Remove Markdown delimiters
        let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // 2. Try parsing the completely cleaned text
        try {
            return JSON.parse(cleaned);
        } catch (e1) {
            // 3. Fallback: Try to find a JSON-like substring
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleaned = jsonMatch[0];
                try {
                    return JSON.parse(cleaned);
                } catch (e2) {
                    // 4. Fallback: Sanitize bad escaped characters
                    // Often LLMs output "\s" or windows paths "C:\foo" which are invalid JSON escapes.
                    // This regex finds backslashes NOT followed by valid JSON escape chars and double-escapes them.
                    try {
                        const fixed = cleaned.replace(/\\([^"\\\/bfnrtu])/g, '\\\\$1');
                        return JSON.parse(fixed);
                    } catch (e3) {
                        // As a last resort, try removing newlines inside strings if that was the issue,
                        // but usually "Bad escaped character" is the backslash issue.
                        console.error("Failed to parse JSON even after sanitization:", e3);
                        console.error("Original Text:", text);
                        // Re-throw the inner error which is usually most relevant
                        throw e2;
                    }
                }
            }
            throw e1;
        }
    }
}
