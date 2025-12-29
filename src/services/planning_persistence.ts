
import { supabase } from "@/services/supabase";

export interface BacklogSessionData {
    project_id: string;
    messages: any[];
    backlog_artifact?: string;
    risk_log?: any;
    roadmap?: any;
    updated_at?: string;
}

/**
 * Loads the planning session (chat history + context) from the 'PLANNING_CHAT' document.
 */
export async function loadBacklogSession(projectId: string): Promise<BacklogSessionData | null> {
    try {
        const { data, error } = await supabase
            .from('documents')
            .select('content, updated_at')
            .eq('project_id', projectId)
            .eq('type', 'PLANNING_CHAT')
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error("Error loading planning session:", JSON.stringify(error, null, 2));
            return null;
        }

        if (!data || !data.content) return null;

        // Parse content if it's a string, or use as object
        const content = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;

        return {
            project_id: projectId,
            messages: content.messages || [],
            backlog_artifact: content.backlog_artifact,
            risk_log: content.risk_log,
            roadmap: content.roadmap,
            updated_at: data.updated_at
        };

    } catch (e) {
        console.error("Failed to load planning session:", e);
        return null;
    }
}

/**
 * Saves the planning session to the 'PLANNING_CHAT' document.
 */
export async function saveBacklogSession(session: BacklogSessionData): Promise<void> {
    try {
        const content = {
            messages: session.messages,
            backlog_artifact: session.backlog_artifact,
            risk_log: session.risk_log,
            roadmap: session.roadmap
        };

        const { error } = await supabase
            .from('documents')
            .upsert({
                project_id: session.project_id,
                type: 'PLANNING_CHAT',
                content: content, // JSONB or Stringified JSON depending on column type (usually text or jsonb)
                title: 'Planning Session History'
            }, { onConflict: 'project_id, type' });

        if (error) throw error;

    } catch (e) {
        console.error("Failed to save planning session:", e);
    }
}
