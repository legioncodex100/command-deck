import { useState } from "react";
import { generateBlueprint } from "@/services/gemini";
import { supabase } from "@/services/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useProject } from "@/hooks/useProject";

export function useBlueprint() {
    const { user } = useAuth();
    const { activeProjectId } = useProject();
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [blueprint, setBlueprint] = useState<any | null>(null);

    const createBlueprint = async (vision: string) => {
        if (!user) {
            setError("User not authenticated");
            return;
        }

        if (!activeProjectId) {
            setError("No active project selected. Please select or create a project.");
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            // 1. Generate via AI
            const generated = await generateBlueprint(vision);

            // 2. Use Active Project ID
            const projectId = activeProjectId;

            // 3. Save Blueprint
            const { data: savedBlueprint, error: bpError } = await supabase
                .from("blueprints")
                .insert({
                    project_id: projectId,
                    content: generated,
                    version: 1
                })
                .select()
                .single();

            if (bpError) throw new Error(bpError.message);

            setBlueprint(savedBlueprint);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to generate blueprint");
        } finally {
            setIsGenerating(false);
        }
    };

    return { isGenerating, error, blueprint, createBlueprint };
}
