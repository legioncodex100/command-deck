import { supabase } from "./supabase";

export interface DiscoverySessionData {
    id: string;
    project_id: string;
    messages: { role: 'user' | 'model'; text: string; consultantRecommendation?: any }[];
    current_prd: string;
    completed_phases: string[];
    last_persona: string;
    updated_at?: string;
}

/**
 * Loads the most recent discovery session for a project.
 */
export async function loadDiscoverySession(projectId: string): Promise<DiscoverySessionData | null> {
    try {
        // Fetch the most recently updated session
        const { data, error } = await supabase
            .from('discovery_sessions')
            .select('*')
            .eq('project_id', projectId)
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // No rows found
            console.error("Error loading discovery session:", error);
            return null;
        }

        return data as DiscoverySessionData;
    } catch (e) {
        console.error("Unexpected error loading discovery session:", e);
        return null;
    }
}

/**
 * Saves (Upserts) the discovery session state.
 */
export async function saveDiscoverySession(session: Partial<DiscoverySessionData> & { project_id: string }): Promise<string | null> {
    try {
        const payload = {
            project_id: session.project_id,
            messages: session.messages,
            current_prd: session.current_prd,
            completed_phases: session.completed_phases,
            last_persona: session.last_persona,
            updated_at: new Date().toISOString()
        };

        let result;

        if (session.id) {
            // Update existing
            result = await supabase
                .from('discovery_sessions')
                .update(payload)
                .eq('id', session.id)
                .select('id')
                .single();
        } else {
            // Insert new (check if one exists first to prevent duplicates if id missing? 
            // - logic implies usually we load first, so ID should be present if exists.
            // - but just in case, we just insert a new row if ID is null)
            result = await supabase
                .from('discovery_sessions')
                .insert(payload)
                .select('id')
                .single();
        }

        if (result.error) {
            console.error("Error saving discovery session:", result.error);
            return null;
        }

        return result.data.id;
    } catch (e) {
        console.error("Unexpected error saving discovery session:", e);
        return null;
    }
}
