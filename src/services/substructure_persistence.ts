
import { supabase } from "@/services/supabase";

export interface SubstructureSessionData {
    id?: string;
    project_id: string;
    messages: any[]; // JSONB
    schema_sql: string;
    completed_pillars: string[]; // TEXT[]
    updated_at?: string;
}

/**
 * Loads the most recent substructure session for a project.
 */
export async function loadSubstructureSession(projectId: string): Promise<SubstructureSessionData | null> {
    try {
        const { data, error } = await supabase
            .from('substructure_sessions')
            .select('*')
            .eq('project_id', projectId)
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // No rows found
            console.error("Error loading substructure session:", error);
            return null;
        }

        return data as SubstructureSessionData;
    } catch (e) {
        console.error("Unexpected error loading substructure session:", e);
        return null; // Return null to trigger fresh start logic
    }
}

/**
 * Upserts the substructure session (auto-save).
 */
export async function saveSubstructureSession(session: SubstructureSessionData): Promise<string | null> {
    try {
        const payload = {
            project_id: session.project_id,
            messages: session.messages,
            schema_sql: session.schema_sql,
            completed_pillars: session.completed_pillars,
            updated_at: new Date().toISOString()
        };

        // Use upsert functionality with onConflict on project_id
        // This assumes project_id is unique or there's a constraint. 
        // If not, we might need to rely on ID.
        // Given the 1:1 nature, project_id SHOULD be unique in this table.

        let query = supabase.from('substructure_sessions');
        let result;

        if (session.id) {
            result = await query
                .upsert({ ...payload, id: session.id })
                .select('id')
                .single();
        } else {
            // checking if one exists by project_id to avoid dups if constraint missing
            const { data: existing } = await supabase
                .from('substructure_sessions')
                .select('id')
                .eq('project_id', session.project_id)
                .maybeSingle();

            if (existing) {
                result = await query
                    .upsert({ ...payload, id: existing.id })
                    .select('id')
                    .single();
            } else {
                result = await query
                    .insert(payload)
                    .select('id')
                    .single();
            }
        }

        if (result.error) {
            console.error("Error saving substructure session:", JSON.stringify(result.error, null, 2));
            return null;
        }

        return result.data.id;
    } catch (e) {
        console.error("Unexpected error saving substructure session:", e);
        return null;
    }
}

/**
 * Deletes the substructure session for a project.
 */
export async function deleteSubstructureSession(projectId: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('substructure_sessions')
            .delete()
            .eq('project_id', projectId);

        if (error) {
            console.error("Error deleting substructure session:", error);
            throw error;
        }
    } catch (e) {
        console.error("Unexpected error deleting substructure session:", e);
        throw e;
    }
}
