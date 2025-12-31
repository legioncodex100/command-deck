"use server";

import { createClient } from "@/utils/supabase/server";
import { getSystemContext } from "./context";

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

export async function getEvolutionChat(evolutionId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('evolution_chat_messages')
        .select('*')
        .eq('evolution_id', evolutionId)
        .order('created_at', { ascending: true });

    if (error) return { error: error.message };
    return { data: data as ChatMessage[] };
}

export async function clearEvolutionChat(evolutionId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('evolution_chat_messages')
        .delete()
        .eq('evolution_id', evolutionId);

    if (error) return { error: error.message };
    return { success: true };
}

export async function sendEvolutionMessage(evolutionId: string, content: string, contextSpec: string) {
    const supabase = await createClient();

    // 1. Save User Message
    const { error: userError } = await supabase
        .from('evolution_chat_messages')
        .insert({
            evolution_id: evolutionId,
            role: 'user',
            content: content
        });

    if (userError) return { error: userError.message };

    // 2. Generate AI Response (Gemini)
    let aiContent = "I am unable to connect to the Strategic Neural Network. Please check system logs.";

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

        const systemPrompt = `You are the **Strategic Advisor** for **Command Deck**, a mission control application for high-velocity software evolution.
Your goal is to assist the Commander in planning software features ("Evolutions") by acting as a Socratic Coach.

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
- **Purpose**: A "Flight Deck" for managing high-velocity software evolution projects.
- **Tech Stack**: 
    - **Framework**: Next.js 16 (App Router)
    - **Styling**: Tailwind CSS v4 (Utility-first)
    - **Database**: Supabase (PostgreSQL)
    - **Icons**: Lucide React

- **Feature Map (Existing Modules):**
    - **The Hangar [INTERNAL / ADMIN ONLY]**: 
        *Current Location.* This is the "Backstage" or "Dev Ops" area. Clients NEVER see this.
        - **Strategic Command**: Feature Planning (Evolution Lab).
        - **Flight Deck**: Task Execution & Sprints.
        - **AI Division**: Manage Agents.
        - **Civilians**: User Management.
        - **Maintenance**: System Settings.
    - **The Deck [CLIENT FACING]**:
        *The Product.* This is what the Client uses to manage their project.
        - **Lifecycle Phases**: Discovery -> Strategy -> Planning -> Design -> Construction -> Handover.
        - **Systems**: Facade, Substructure, Integration, Audit, Chronology.

- **Current Mission**: "${contextSpec ? "Refining requirements based on the spec below." : "Brainstorming a new feature."}"

**Directives:**
1. **Be Proactive**: If the user asks for a recommendation or gives a broad goal (e.g., "make it mobile responsive"), do NOT ask vague clarification questions. Instead, **propose a concrete starting point** or a list of areas to focus on immediately.
2. **Drive the OODA Loop**: Your goal is to move from "Observe" (Strategy) to "Decide" (Tasks). Always try to move the user towards actionable tasks.
3. **Be Concise but Helpful**: brief is good, but "recommendations" should be substantial enough to be useful.
4. **Task Extraction**: Whenever actionable items appear, suggest them as **Decision Cards**:
   \`[[TASK: <Title> | <Priority (P0, P1, P2)>]]\`

**Evolution Spec:**
> ${contextSpec || "No spec defined yet."}

**User Input:** ${content}

Be a Strategic Partner. Don't go in circles. Make a recommendation.`;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        aiContent = response.text() || "No response generated.";

    } catch (err: any) {
        console.error("AI Error:", err);
        // Fallback for missing keys or errors
        aiContent = `[SYSTEM FAILURE]: AI Neural Link Unstable. Error: ${err.message}. \n\n(Ensure GEMINI_API_KEY is set in .env.local)`;
    }

    // 3. Save Assistant Message
    const { data: assistantMsg, error: aiError } = await supabase
        .from('evolution_chat_messages')
        .insert({
            evolution_id: evolutionId,
            role: 'assistant',
            content: aiContent
        })
        .select()
        .single();

    if (aiError) return { error: aiError.message };

    return { data: assistantMsg as ChatMessage };
}
