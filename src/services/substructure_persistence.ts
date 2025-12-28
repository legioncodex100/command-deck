
import { supabase } from "@/services/supabase";
import { SchemaPillar } from "./substructure";

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
            throw error;
        }

        return data as SubstructureSessionData;
    } catch (e) {
        console.error("Failed to load session:", e);
        return null;
    }
}

/**
 * Upserts the substructure session (auto-save).
 */
export async function saveSubstructureSession(session: SubstructureSessionData): Promise<string | null> {
    try {
        if (!session.project_id) {
            throw new Error("Critical: Missing project_id in save payload");
        }

        // 1. Check if we have an ID to update
        if (session.id) {
            const { error } = await supabase
                .from('substructure_sessions')
                .update({
                    messages: session.messages,
                    schema_sql: session.schema_sql,
                    completed_pillars: session.completed_pillars,
                    updated_at: new Date().toISOString()
                })
                .eq('id', session.id);

            if (error) throw error;
            return session.id;
        }

        // 2. Otherwise check for existing by project_id to avoid dupes (singleton per project)
        const existing = await loadSubstructureSession(session.project_id);
        if (existing && existing.id) {
            const { error } = await supabase
                .from('substructure_sessions')
                .update({
                    messages: session.messages,
                    schema_sql: session.schema_sql,
                    completed_pillars: session.completed_pillars,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id);
            if (error) throw error;
            return existing.id;
        } else {
            // Create new
            const { data, error } = await supabase
                .from('substructure_sessions')
                .insert({
                    project_id: session.project_id,
                    messages: session.messages,
                    schema_sql: session.schema_sql,
                    completed_pillars: session.completed_pillars
                })
                .select('id')
                .single();

            if (error) throw error;
            return data.id;
        }

    } catch (e: any) {
        console.error("Failed to save substructure session:", e.message || e);
        return null;
    }
}

/**
 * Deletes the substructure session for a project (Hard Reset).
 */
export async function deleteSubstructureSession(projectId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('substructure_sessions')
            .delete()
            .eq('project_id', projectId);

        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Failed to delete session", e);
        return false;
    }
}
