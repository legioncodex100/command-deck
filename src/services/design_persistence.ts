
import { supabase } from "./supabase";
import { ComplexityLevel } from "./core/consultant_engine";

export interface DesignSessionData {
    id: string;
    project_id: string;
    messages: { role: 'user' | 'model'; text: string; recommendation?: any }[];
    current_stitch_prompt: string;
    completed_stages: string[];
    reconciled_code: string;
    last_mode: 'PROMPT' | 'RECONCILE' | 'SPEC';
    current_complexity: ComplexityLevel;
    current_design_doc?: string;
    current_step?: number;
    updated_at?: string;
}

/**
 * Loads the most recent design session for a project.
 */
export async function loadDesignSession(projectId: string): Promise<DesignSessionData | null> {
    try {
        const { data, error } = await supabase
            .from('design_sessions')
            .select('*')
            .eq('project_id', projectId)
            .maybeSingle(); // Use maybeSingle to avoid 406 error on new projects

        if (error) {
            console.error("Error loading design session:", JSON.stringify(error, null, 2));
            return null;
        }

        return data as DesignSessionData;
    } catch (e) {
        console.error("Unexpected error loading design session:", e);
        return null;
    }
}

/**
 * Saves (Upserts) the design session state.
 */
export async function saveDesignSession(session: Partial<DesignSessionData> & { project_id: string }): Promise<string | null> {
    try {
        const payload = {
            project_id: session.project_id,
            messages: session.messages,
            current_stitch_prompt: session.current_stitch_prompt,
            completed_stages: session.completed_stages,
            reconciled_code: session.reconciled_code,
            last_mode: session.last_mode,
            current_complexity: session.current_complexity,
            current_design_doc: session.current_design_doc,
            current_step: session.current_step,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('design_sessions')
            .upsert(payload, { onConflict: 'project_id' })
            .select('id')
            .single();

        if (error) {
            console.error("Error saving design session:", JSON.stringify(error, null, 2));
            return null;
        }

        return data.id;
    } catch (e) {
        console.error("Unexpected error saving design session:", e);
        return null;
    }
}

/**
 * Deletes the design session for a project.
 */
export async function deleteDesignSession(projectId: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('design_sessions')
            .delete()
            .eq('project_id', projectId);

        if (error) {
            console.error("Error deleting design session:", error);
            throw error;
        }
    } catch (e) {
        console.error("Unexpected error deleting design session:", e);
        throw e;
    }
}
