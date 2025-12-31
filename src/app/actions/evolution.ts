"use server";

import { createClient } from "@/utils/supabase/server";
import { Evolution } from "@/types/database";

const CORE_PROJECT_ID = 'c0de0000-0000-0000-0000-000000000000';

// 1. Fetch
export async function listEvolutions() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('evolutions')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return { error: error.message };
    return { data: data as Evolution[] };
}

export async function getEvolution(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('evolutions')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return { error: error.message };
    return { data: data as Evolution };
}

// 2. Create
export async function createEvolution(title: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('evolutions')
        .insert({ title, status: 'IDEA' })
        .select()
        .single();

    if (error) return { error: error.message };
    return { data: data as Evolution };
}

// 3. Update Spec (Strategy)
export async function updateEvolutionSpec(id: string, content: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('evolutions')
        .update({ spec_content: content, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) return { error: error.message };
    return { success: true };
}

// 4. Update Status
export async function updateEvolutionStatus(id: string, status: 'IDEA' | 'PLANNED' | 'PUSHED' | 'COMPLETED') {
    const supabase = await createClient();
    const { error } = await supabase
        .from('evolutions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) return { error: error.message };
    return { success: true };
}

// 4.5 Update Draft Tasks
export async function updateEvolutionDraftTasks(id: string, tasks: { title: string, priority: 'P0' | 'P1' | 'P2' }[]) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('evolutions')
        .update({ tasks_draft: tasks, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) return { error: error.message };
    return { success: true };
}

// 5. Push to Flight Deck
export async function pushTasksToFlightDeck(evolutionId: string, tasksBytes: { title: string, priority: 'P0' | 'P1' | 'P2' }[]) {
    const supabase = await createClient();

    // 1. Create Tasks in Sprint Board
    const tasksToInsert = tasksBytes.map(t => ({
        project_id: CORE_PROJECT_ID,
        title: t.title,
        priority: t.priority,
        status: 'todo'
    }));

    const { error } = await supabase
        .from('tasks')
        .insert(tasksToInsert);

    if (error) return { error: error.message };

    // 2. Update Evolution Status
    await updateEvolutionStatus(evolutionId, 'PUSHED');

    return { success: true };
}
