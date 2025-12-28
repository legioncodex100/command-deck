
import { supabase } from "@/services/supabase";
import { StrategyPillar } from "./strategy";

// Explicit interface matching the 'strategy_sessions' table
export interface StrategySessionData {
    id?: string;
    project_id: string;
    messages: any[]; // JSONB
    current_draft: string;
    completed_pillars: string[]; // TEXT[]
    last_persona: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';
    updated_at?: string;
}

/**
 * Loads the most recent strategy session for a project.
 */
export async function loadStrategySession(projectId: string): Promise<StrategySessionData | null> {
    try {
        const { data, error } = await supabase
            .from('strategy_sessions')
            .select('*')
            .eq('project_id', projectId)
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // No rows found
            console.error("Error loading strategy session:", error);
            throw error;
        }

        return data as StrategySessionData;
    } catch (e) {
        console.error("Failed to load session:", e);
        return null; // Return null to trigger fresh start logic
    }
}

/**
 * Upserts the strategy session (auto-save).
 * If sessionId is provided, it updates. If not, it attempts to find existing or creates new.
 */
export async function saveStrategySession(session: StrategySessionData): Promise<string | null> {
    try {
        // 1. Check if we have an ID to update
        if (session.id) {
            const { error } = await supabase
                .from('strategy_sessions')
                .update({
                    messages: session.messages,
                    current_draft: session.current_draft,
                    completed_pillars: session.completed_pillars,
                    last_persona: session.last_persona,
                    updated_at: new Date().toISOString()
                })
                .eq('id', session.id);

            if (error) throw error;
            return session.id;
        }

        // 2. Otherwise insert new (or could try to find existing by project_id if we want strictly 1 per project)
        // Let's assume 1 per project for now to keep it simple, so we upsert by project_id?
        // Actually, the table has a PK 'id'. 
        // Best approach: load first. If load returns data, use that ID.

        const existing = await loadStrategySession(session.project_id);
        if (existing && existing.id) {
            const { error } = await supabase
                .from('strategy_sessions')
                .update({
                    messages: session.messages,
                    current_draft: session.current_draft,
                    completed_pillars: session.completed_pillars,
                    last_persona: session.last_persona,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id);
            if (error) throw error;
            return existing.id;
        } else {
            // Create new
            const { data, error } = await supabase
                .from('strategy_sessions')
                .insert({
                    project_id: session.project_id,
                    messages: session.messages,
                    current_draft: session.current_draft,
                    completed_pillars: session.completed_pillars,
                    last_persona: session.last_persona
                })
                .select('id')
                .single();

            if (error) throw error;
            return data.id;
        }

    } catch (e) {
        console.error("Failed to save session:", e);
        return null;
    }
}
