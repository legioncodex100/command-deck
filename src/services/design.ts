import { ConsultantBrain } from "./core/consultant_engine";
import { analyzeImage } from "./gemini";

// CREATIVE DIRECTOR PERSONA (Existing code...)

export async function analyzeVisualContext(base64Image: string): Promise<string> {
    const prompt = `
    Analyze this UI/Design image.
    Extract:
    1. Primary Colors (Hex codes if possible)
    2. Design Style (e.g. Flat, Neumorphic, Cyberpunk)
    3. Key UI Elements (Buttons, Cards, Navigation)
    4. Typography Vibe (Serif, Sans, Mono)
    
    Output a concise summary paragraph.
    `;
    return await analyzeImage(prompt, base64Image);
}

// CREATIVE DIRECTOR PERSONA
const directorBrain = new ConsultantBrain(
    "Creative Director",
    "Extract visual intent, brand keywords, and tokens into a robust DESIGN.md artifact.",
    ["Analyze PRD & Strategy for Brand Identity", "Define Color Palette (Hex)", "Establish Typography", "Define Design Tokens"],
    {
        "PRD": "Product Requirements Document",
        "STRATEGY": "Technical Strategy"
    }
);

export async function generateDesignTokens(context: { prd: string, strategy: string, schema?: string, imageAnalysis?: string }, history: any[] = []): Promise<any> {

    const combinedContext = `
    PRD CONTENT:
    ${context.prd.substring(0, 10000)}

    STRATEGY CONTENT:
    ${context.strategy.substring(0, 5000)}

    ${context.schema ? `SCHEMA (DATA STRUCTURE):
    ${context.schema.substring(0, 5000)}
    ` : ''}

    ${context.imageAnalysis ? `IMAGE ANALYSIS CONTEXT:\n${context.imageAnalysis}` : ''}
    `;

    const instructions = `
    You are the **Creative Director** (World-Class UI/UX Expert).
    Your goal is to extract visual intent and generate a 'DESIGN.md' Design System.

    **INTERACTION PROTOCOL (v4.1 - The Master Track):**
    You must guide the user through this 6-Stage Master Track to achieve "Pixel-Perfect" synthesis.
    1. **Domain & Strategy**: Identify domain (SaaS, Game, FinTech). Align with Strategy.
    2. **Schema-UX Mapping**: Analyze SCHEMA.sql. High data density (Tables)? Low density (Cards)?
    3. **Aesthetic Philosophy**: Define Atmosphere (Cyber-Industrial, Minimalist).
    4. **Atomic DNA Extraction**: Synthesize absolute design tokens (Color scales, corner radii).
    5. **Master Stitch Synthesis**: Generate a high-bandwidth prompt for Google Stitch.
    6. **DNA Reconciliation**: Reverse-engineer tokens into DESIGN.md.

    **PROACTIVE BEHAVIOR:**
    1. **Lead the Room**: If ambiguous, **PROPOSE 3 DISTINCT VISUAL DIRECTIONS** using 'consultant_recommendation'.
    2. **Decision Cards**: Use 'consultant_recommendation' for any branching choice.
    3. **Final Artifacts**: 
       - When ready, output 'DESIGN.md' in the 'message' field.
       - **CRITICAL**: You must ALSO generate 'STITCH_PROMPT.md' content in the 'stitch_prompt' JSON field.

    **AESTHETIC RULES:**
    - Hex #000000 Background, Geist Sans, 1px Borders (#27272a).
    - "Logic-to-Skin": Justify density/radius choices with SCHEMA/STRATEGY constraints.

    **OUTPUT FORMAT (JSON):**
    - "message": Chat text OR full 'DESIGN.md' markdown.
    - "consultant_recommendation": { options: [...] }
    - "stitch_prompt": "String containing the Google Stitch high-fidelity prompt..." (Only when finalizing).
    `;

    try {
        const response = await directorBrain.processInteraction(
            history,
            instructions,
            combinedContext,
            'EXPERT'
        );

        // Return the full structured response (message + recommendations)
        return response;
    } catch (e) {
        console.error("Design Token Gen Error:", e);
        throw e;
    }
}
