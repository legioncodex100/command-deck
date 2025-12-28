import { useState, useEffect, useCallback } from "react";
import { getProjectHistory, TimelineEvent } from "@/services/memory";
import { useAuth } from "@/hooks/useAuth";
import { useProject } from "@/hooks/useProject";

export function useMemory() {
    const { user } = useAuth();
    const { activeProjectId } = useProject();
    const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTimeline = useCallback(async () => {
        if (!user || !activeProjectId) return;

        setIsLoading(true);
        try {
            const history = await getProjectHistory(activeProjectId);
            setTimeline(history);

        } catch (err: any) {
            console.error(err);
            setError("Failed to load project memory.");
        } finally {
            setIsLoading(false);
        }
    }, [user, activeProjectId]);

    useEffect(() => {
        fetchTimeline();
    }, [fetchTimeline]);

    const generateContextExport = () => {
        if (timeline.length === 0) return "No project history available.";

        const latestBlueprint = timeline.find(e => e.type === "blueprint");
        const latestAudit = timeline.find(e => e.type === "audit");

        const exportText = `# Project Memory: Save Point
**Generated**: ${new Date().toISOString()}

## Latest Status
- **Last Blueprint**: ${latestBlueprint ? latestBlueprint.summary : "N/A"} (${latestBlueprint?.date})
- **Last Audit**: ${latestAudit ? latestAudit.summary : "N/A"} (${latestAudit?.date})

## Context Summary
${latestBlueprint ? `### Active Schema
` + JSON.stringify(latestBlueprint.details.foundation, null, 2) : "No Schema Linked."}

${latestAudit ? `### Quality Report
` + JSON.stringify(latestAudit.details.recommendation, null, 2) : "No Audit Recommendations."}
`;

        return exportText;
    };

    return { timeline, isLoading, error, generateContextExport, refresh: fetchTimeline };
}
