import { supabase } from "@/services/supabase";

export type TimelineEvent = {
    id: string;
    type: "blueprint" | "audit";
    date: string; // ISO string
    summary: string;
    details?: any;
};

export async function getProjectHistory(projectId: string): Promise<TimelineEvent[]> {
    const events: TimelineEvent[] = [];

    // Fetch Blueprints
    const { data: blueprints, error: bpError } = await supabase
        .from("blueprints")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

    if (bpError) throw bpError;

    if (blueprints) {
        blueprints.forEach((bp) => {
            events.push({
                id: bp.id,
                type: "blueprint",
                date: bp.created_at,
                summary: `Blueprint v${bp.version}`,
                details: bp.content,
            });
        });
    }

    // Fetch Audit Logs
    const { data: audits, error: auditError } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

    if (auditError) throw auditError;

    if (audits) {
        audits.forEach((audit) => {
            events.push({
                id: audit.id,
                type: "audit",
                date: audit.created_at,
                summary: `Audit Score: ${100 - audit.risk_score}/100`,
                details: audit.findings,
            });
        });
    }

    // Sort strictly by date (newest first)
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
