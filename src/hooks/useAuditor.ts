import { useState } from "react";
import { auditCode, AuditResult } from "@/services/auditor";
import { supabase } from "@/services/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useProject } from "@/hooks/useProject";

export function useAuditor() {
    const { user } = useAuth();
    const { activeProjectId } = useProject();
    const [isAuditing, setIsAuditing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scanResult, setScanResult] = useState<AuditResult | null>(null);

    const performAudit = async (code: string) => {
        if (!user) {
            setError("User not authenticated");
            return;
        }

        if (!activeProjectId) {
            setError("No active project selected.");
            return;
        }

        setIsAuditing(true);
        setError(null);
        setScanResult(null);

        try {
            // 1. Run Gemini Audit
            const result = await auditCode(code);
            setScanResult(result);

            // 2. Use Active Project ID
            const projectId = activeProjectId;

            if (!projectId) throw new Error("Could not determine Project ID for logging.");

            // 3. Save to Audit Logs
            const { error: logError } = await supabase
                .from("audit_logs")
                .insert({
                    project_id: projectId,
                    findings: result as any, // Cast to any for JSONB compatibility
                    risk_score: 100 - result.score
                });

            if (logError) console.error("Failed to save audit log:", logError);

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Audit failed");
        } finally {
            setIsAuditing(false);
        }
    };

    return { isAuditing, error, scanResult, performAudit };
}
