"use server";

export async function generateIdePrompt(taskTitle: string, taskPriority: string) {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return { error: "GEMINI_API_KEY is missing." };
    }

    try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const systemPrompt = `You are a Senior Technical Architect for "Command Deck".
Your goal is to write a highly specific, ready-to-execute "Cursor Prompt" that a developer can copy and paste into their IDE (Cursor, VS Code, Windsurf) to immediately start working on the task.

**Context (The App):**
- **App Name**: Command Deck (Flight Deck Module)
- **Tech Stack**: Next.js 16 (App Router), Tailwind CSS v4, Supabase, Lucide React, TypeScript.
- **Design System**: Dark mode, "Mission Control" aesthetic, mono fonts, emerald/zinc palette.

**Task To Implement:**
- **Title**: "${taskTitle}"
- **Priority**: ${taskPriority}

**Output Format:**
Produce a single code block containing the prompt.
The prompt should be written to the "Agent" (the IDE AI).
Structure the prompt like this:
---
"You are an expert Next.js developer.
Task: [Task Title]
Context: We are building the Flight Deck module of Command Deck.
Stack: Next.js 16, Tailwind v4, Supabase.

Requirements:
1. ... (Derive 3-4 specific technical requirements based on the title)
2. ...
3. ...

Please verify your files before editing and strictly follow the design system (Zinc/Emerald colors, Lucide icons)."
---

Do not add extra conversational fluff. Just return the prompt text.`;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        return { prompt: response.text() };

    } catch (err: any) {
        console.error("AI Error:", err);
        return { error: err.message };
    }
}
