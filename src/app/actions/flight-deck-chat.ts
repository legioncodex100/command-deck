"use server";

import { createClient } from "@/utils/supabase/server";
import { getSystemContext } from "./context";

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

export async function getTaskChat(taskId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('task_chat_messages')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

    if (error) return { error: error.message };
    return { data: data as ChatMessage[] };
}

export async function clearTaskChat(taskId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('task_chat_messages')
        .delete()
        .eq('task_id', taskId);

    if (error) return { error: error.message };
    return { success: true };
}

export async function sendTaskMessage(taskId: string, content: string, taskContext: { title: string, priority: string, description?: string }) {
    const supabase = await createClient();

    // 1. Save User Message
    const { error: userError } = await supabase
        .from('task_chat_messages')
        .insert({
            task_id: taskId,
            role: 'user',
            content: content
        });

    if (userError) return { error: userError.message };

    // 2. Generate AI Response (Gemini)
    let aiContent = "System offline.";

    try {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is missing. Please check .env.local");
        }

        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Load Live Context
        const { memory, architecture, masterSpec } = await getSystemContext();

        const systemPrompt = `You are the **Senior Technical Architect** (Copilot) for the Flight Deck.
Your goal is to help the developer EXECUTE the active task. You are not a project manager; you are a coder.

**Live System Context (Read from Project Files):**
<MEMORY_LOG>
${memory}
</MEMORY_LOG>

<ARCHITECTURE>
${architecture}
</ARCHITECTURE>

<MASTER_SPEC>
${masterSpec}
</MASTER_SPEC>

**Context:**
- **App Name**: Command Deck

**Context:**
- **App Name**: Command Deck
- **Tech Stack**: Next.js 16 (App Router), Tailwind CSS v4, Supabase, Lucide React, TypeScript.
- **Current Task**: "${taskContext.title}" (Priority: ${taskContext.priority})
- **Description**: ${taskContext.description || "No additional details."}

**Directives:**
1. **Be Technical**: Focus on code, file structure, and implementation details.
2. **Generate Prompts**: If the user asks for a prompt, generate a specific "Cursor/IDE Prompt" in a code block that strictly follows the tech stack.
3. **Debug**: If the user pastes an error, analyze it based on the Next.js/Supabase stack.
4. **Brevity**: Be concise. Code snippets > Long explanations.

**User Input:** ${content}`;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        aiContent = response.text() || "No response generated.";

    } catch (err: any) {
        console.error("AI Error:", err);
        aiContent = `[SYSTEM FAILURE]: ${err.message}`;
    }

    // 3. Save Assistant Message
    const { data: assistantMsg, error: aiError } = await supabase
        .from('task_chat_messages')
        .insert({
            task_id: taskId,
            role: 'assistant',
            content: aiContent
        })
        .select()
        .single();

    if (aiError) return { error: aiError.message };

    return { data: assistantMsg as ChatMessage };
}
