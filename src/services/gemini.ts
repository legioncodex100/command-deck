import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// Default model for blueprints
const BLUEPRINT_MODEL = "gemini-2.0-flash-exp";

// Strategy model (Socratic)
export const STRATEGY_MODEL = "gemini-2.0-flash-exp";

/**
 * Generates content using a specific model and system instruction.
 */
export async function generateText(
  prompt: string,
  systemInstruction: string,
  modelName: string = BLUEPRINT_MODEL,
  jsonMode: boolean = true
) {
  if (!apiKey) {
    throw new Error("Gemini API Key is missing");
  }

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemInstruction,
      generationConfig: {
        responseMimeType: jsonMode ? "application/json" : "text/plain",
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}

const SYSTEM_PROMPT_BLUEPRINT = `
You are the Chief Software Architect for Command Deck.
Your goal is to convert a user's vision into a strict JSON technical blueprint.
Adhere to the "Four Layers" architecture: Foundation, Structure, Mechanical, Facade.

Output Format (JSON):
{
  "project_name": "string",
  "foundation": {
    "tables": [
      { "name": "string", "columns": ["string"] }
    ]
  },
  "logic_flow": [
    { "step": "number", "description": "string", "layer": "string" }
  ],
  "antigravity_command": "string"
}

The 'antigravity_command' should be a prompt the user can copy to an AI agent to build the app, referencing the specific files/layers.
`;

export async function generateBlueprint(vision: string) {
  const text = await generateText(vision, SYSTEM_PROMPT_BLUEPRINT, BLUEPRINT_MODEL, true);
  return JSON.parse(text);
}

export async function analyzeImage(prompt: string, base64Image: string) {
  if (!apiKey) throw new Error("API Key missing");

  // Clean base64 header if present
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|webp);base64,/, "");

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: cleanBase64,
          mimeType: "image/png",
        },
      },
    ]);
    return result.response.text();
  } catch (e) {
    console.error("Gemini Vision Error:", e);
    throw e;
  }
}
