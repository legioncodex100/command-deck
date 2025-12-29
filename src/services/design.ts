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

export const designBrain = new ConsultantBrain(
    "Facade Architect",
    "Technical Design Systems Expert. Generates Stitch Prompts and extracts atomic tokens.\n\nSTRICT BEHAVIOR PROTOCOL:\n1. ASK STRICTLY ONE QUESTION: Ask exactly one guiding question locally.\n2. BE SOCRATIC: Propose options if vague.\n3. FORCE DECISION CARD: If offering options, you MUST use 'consultant_recommendation'. Text-only choices are FORBIDDEN.\n4. RECOMMEND EXACTLY ONE: Mark EXACTLY ONE option as 'recommended: true'.\n5. IMMEDIATE ACTION: If you say you are going to generate or update the design/prompt, YOU MUST DO IT IN THIS RESPONSE. Do not say 'I will do this'. DO IT NOW in the `stitch_prompt` or `design_document` fields.",
    ["Engineering Domain Atmosphere", "Defining Layout Topology", "Enforcing Atomic Constraints"],
    {
        "stitch_prompt": "Current Stitch Prompt content. MUST be formatted in Markdown. MUST include a section '## Screen Specifications' listing every required screen with detailed layout logic based on the schema. Use Headers for sections (## Visual, ## Layout, ## Screen Specifications) and Bullet points for lists. Do not produce a single wall of text.",
        "design_document": "The current Markdown content of the Design Specification. You must maintain this document, adding new decisions (Colors, Typography, Layout, Atmosphere) as they are made in the chat. Do not reset it, just append or refine.",
        "consultant_recommendation": "Optional object { context: string, options: [{id, label, description, recommended}] }."
    }
);

export async function sendDesignMessage(
    message: string,
    history: { role: 'user' | 'model', text: string }[],
    context: { prd: string, strategy: string, schema?: string, imageAnalysis?: string, currentStitchPrompt?: string, currentDesignDoc?: string },
    complexity: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT' = 'INTERMEDIATE'
): Promise<{
    message: string,
    stitchPrompt?: string,
    designDocument?: string,
    consultantRecommendation?: {
        context: string,
        options: { id: string, label: string, description: string, recommended: boolean }[]
    }
}> {

    const combinedContext = `
    PRD CONTENT:
    ${context.prd.substring(0, 5000)}

    STRATEGY CONTENT:
    ${context.strategy.substring(0, 5000)}

    ${context.schema ? `SCHEMA (DATA STRUCTURE) - CRITICAL SOURCE OF TRUTH:
    ${context.schema.substring(0, 3000)}
    INSTRUCTION: THE SCHEMA IS THE BLUEPRINT. YOU MUST EXTRACT EVERY SINGLE TABLE/ENTITY AND DESIGN A CORRESPONDING LIST SCREEN AND DETAIL SCREEN.
    
    EXAMPLE OUTPUT FORMAT (Follow this structure):
    ## Screen Specifications
    ### 1. User Dashboard (Table: users)
    - **Layout**: Sidebar navigation, 3-column grid for 'Recent Activity'.
    - **Data Binding**: Display 'username', 'avatar_url', and 'last_login' from 'users' table.
    - **Actions**: 'Edit Profile' button links to Settings.
    
    ### 2. Project List (Table: projects)
    - **Layout**: Card-based masonry grid.
    - **Components**: Search bar, Filter dropdown (by status).
    
    YOU MUST GENERATE A LIST LIKE THE ABOVE FOR EVERY TABLE IN THE SCHEMA.` : ''}

    ${context.imageAnalysis ? `IMAGE ANALYSIS CONTEXT:\n${context.imageAnalysis}` : ''}

    ${context.currentStitchPrompt ? `CURRENT STITCH PROMPT (Refine this):
    ${context.currentStitchPrompt.substring(0, 5000)}` : ''}

    ${context.currentDesignDoc ? `CURRENT DESIGN SPECIFICATION (Append/Refine this):
    ${context.currentDesignDoc.substring(0, 8000)}` : `CURRENT DESIGN SPECIFICATION: (Empty, start creating one)`}
    `;

    try {
        const response = await designBrain.processInteraction(
            history,
            message,
            combinedContext,
            complexity
        );

        return {
            message: response.message || "Design engine unreachable.",
            stitchPrompt: response.stitch_prompt,
            designDocument: response.design_document,
            consultantRecommendation: response.consultant_recommendation
        };
    } catch (e) {
        console.error("Design Engine Error:", e);
        return {
            message: "Design Engine offline.",
            stitchPrompt: ""
        };
    }
}

export function extractDesignDNA(code: string) {
    // Regex extractors for Tailwind classes
    const colors = new Set<string>();
    const radii = new Set<string>();
    const typography = new Set<string>();

    // Parse Colors (bg-*, text-*, border-*) - simplifed for hex and standard scales
    const bgMatches = code.match(/bg-\[#[0-9a-fA-F]{6}\]/g) || [];
    const textMatches = code.match(/text-\[#[0-9a-fA-F]{6}\]/g) || [];
    const borderMatches = code.match(/border-\[#[0-9a-fA-F]{6}\]/g) || [];

    // Add standard tailwind colors if found
    const standardMatches = code.match(/(bg|text|border)-(zinc|slate|gray|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}/g) || [];

    [...bgMatches, ...textMatches, ...borderMatches, ...standardMatches].forEach(m => colors.add(m));

    // Parse Radius
    const radiusMatches = code.match(/rounded-(sm|md|lg|xl|2xl|3xl|full|none|\[.*?\])/g) || [];
    radiusMatches.forEach(m => radii.add(m));

    // Parse Typography (font-*, text-*, tracking-*)
    const typeMatches = code.match(/(font-(sans|serif|mono)|text-(xs|sm|base|lg|xl|2xl|3xl)|tracking-(tighter|tight|normal|wide|widest))/g) || [];
    typeMatches.forEach(m => typography.add(m));

    return {
        colors: Array.from(colors).slice(0, 10), // Limit reasonable amount
        radii: Array.from(radii).slice(0, 5),
        typography: Array.from(typography).slice(0, 8)
    };
}
