'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateCrewMember(key: string, updates: {
    system_prompt?: string;
    model_config?: any;
    is_active?: boolean;
    avatar_url?: string;
    pillar?: string;
    bio?: string;
}) {
    const supabase = await createClient(); // Initialize per request
    const { error } = await supabase
        .from('ai_crew')
        .update(updates)
        .eq('key', key);

    if (error) {
        console.error("Update Crew Error:", error);
        throw new Error("Failed to update crew member");
    }

    revalidatePath('/hangar/ai');
}

export async function createCrewMember(data: {
    key: string;
    name: string;
    designation: string;
    system_prompt: string;
    avatar_url?: string;
    pillar?: string;
    bio?: string;
}) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('ai_crew')
        .insert({
            ...data,
            model_config: { model: 'gemini-1.5-flash', temperature: 0.7 }
        });

    if (error) {
        console.error("Create Crew Error:", error);
        throw new Error("Failed to fabricate new unit");
    }

    revalidatePath('/hangar/ai');
}

export async function deleteCrewMember(key: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('ai_crew')
        .delete()
        .eq('key', key)
        .eq('is_locked', false); // Extra safety check

    if (error) {
        console.error("Delete Crew Error:", error);
        throw new Error("Failed to decommission unit");
    }

    revalidatePath('/hangar/ai');
}
