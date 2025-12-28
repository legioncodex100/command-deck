import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    generationConfig: {
        responseMimeType: "application/json",
    }
});

const SYSTEM_PROMPT = `
You are the Structural Integrity Inspector for Command Deck. 
Your job is to audit React/TypeScript code for "Strict Layer Separation" (SLS) and Quality Rules.

Analysis Rules:
1. SLS Violation: No direct database calls (Supabase) inside UI Components (subfolders of /app or /components). Business logic must be in /services.
2. Tangled Pipes: Component is too complex (> 150 lines) or mixes too many concerns (e.g. huge useEffects).
3. Type Safety: Usage of 'any' is a violation.
4. Hardcoding: No hardcoded secrets or magic strings.

Output Format (strict JSON):
{
  "score": number, // 0-100 (100 is perfect, deduct 20 for SLS violation)
  "violations": [
    { "severity": "High" | "Medium" | "Low", "message": "string", "line": number | null }
  ],
  "recommendation": "string" // Concise refactoring advice
}
`;

export type AuditResult = {
    score: number;
    violations: { severity: "High" | "Medium" | "Low"; message: string; line: number | null }[];
    recommendation: string;
};

export async function auditCode(code: string): Promise<AuditResult> {
    if (!apiKey) {
        throw new Error("Gemini API Key is missing");
    }

    try {
        const prompt = `${SYSTEM_PROMPT}\n\nCode to Audit:\n${code}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return JSON.parse(response.text());
    } catch (error) {
        console.error("Auditor Check Failed:", error);
        throw error; // Propagate to hook
    }
}
