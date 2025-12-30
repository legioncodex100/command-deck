import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

export interface DesignPreferences {
  mood: string;
  density: 'Compact' | 'Default' | 'Spacious';
  radius: 'Sharp' | 'Subtle' | 'Round';
  description: string;
}

const STITCH_PROMPT_SYSTEM = `
You remain an expert UI/UX Designer specializing in the "Google Stitch" design system.
Your goal is to generate a high-fidelity, detailed Prompt that a user can paste into the Stitch engine.

Input: User preferences for Mood, Density, Radius, and a general description.
Output: A structured Markdown prompt that describes:
1.  **Visual Hierarchy**: How to structure the layout.
2.  **Color Palette**: Specific instructions on using the mood (e.g., "Use deep slate blues for backgrounds...").
3.  **Typography**: Font recommendations matching the mood.
4.  **Component Density**: Instructions on padding/margins based on the Density preference.
5.  **Shape Logic**: Instructions on border-radius based on Radius preference.

Keep the output concise but directive. It should look like a professional design brief.
`;

const EXTRACTION_SYSTEM = `
You are a Frontend Reverse-Engineer.
Input: Raw HTML/Tailwind CSS code (likely copied from a Google Stitch export).
Output: A structured JSON object containing the "Design DNA" tokens.

JSON Structure:
{
  "colors": {
    "primary": "#hex",
    "secondary": "#hex",
    "background": "#hex",
    "surface": "#hex"
  },
  "typography": {
    "fontFamily": "string",
    "baseCheck": "string", // e.g. "Create a check for base size"
  },
  "borderRadius": {
    "base": "string", // e.g. "0.5rem"
    "lg": "string"
  }
}

Analyze the classes and inline styles to find the most dominant values.
If you cannot find a specific values, infer reasonable defaults based on the code provided.
RETURN ONLY JSON. NO MARKDOWN.
`;

import { getAgentByKey } from "./crew";

// ... existing imports

export async function generateStitchPrompt(prefs: DesignPreferences) {
  if (!apiKey) throw new Error("API Key missing");

  const agent = await getAgentByKey('facade_architect');
  const systemPrompt = agent?.system_prompt || STITCH_PROMPT_SYSTEM; // Fallback
  const modelName = agent?.model_config?.model || "gemini-2.0-flash-exp";
  const activeModel = genAI.getGenerativeModel({ model: modelName });

  const prompt = `
    Generate a Stitch Prompt for:
    Mood: ${prefs.mood}
    Density: ${prefs.density}
    Radius: ${prefs.radius}
    Description: ${prefs.description}
    `;

  try {
    const result = await activeModel.generateContent(`${systemPrompt}\n\n${prompt}`);
    return result.response.text();
  } catch (e) {
    console.error("Stitch Prompt Gen Error:", e);
    throw e;
  }
}

export async function extractDesignTokens(htmlCode: string) {
  if (!apiKey) throw new Error("API Key missing");

  try {
    const result = await model.generateContent(`${EXTRACTION_SYSTEM}\n\nCODE TO ANALYZE:\n${htmlCode.substring(0, 30000)}`); // Limit context window just in case
    const text = result.response.text();
    // Clean markdown code blocks if present
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Token Extraction Error:", e);
    throw e;
  }
}
