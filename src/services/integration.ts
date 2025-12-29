
import { syncDocsToDisk } from "@/app/actions/syncDocs";
import { generateText, STRATEGY_MODEL } from "./gemini";

// MOCK: In a real app, these would be disk reads. 
// Since we are client-side with server actions, we trust the action's return.

export interface SyncStatus {
    success: boolean;
    synced?: string[];
    error?: string;
    logEntry?: string;
}

export async function runSyncOperation(documents: { type: string, content: string }[]): Promise<SyncStatus> {
    // Map internal types to filenames
    const fileMap: Record<string, string> = {
        'PRD': 'PRD.md',
        'STRATEGY': 'STRATEGY.md',
        'SCHEMA': 'SCHEMA.sql', // Technically SQL but stored in docs for reference
        'DESIGN': 'DESIGN_SYSTEM.md',
        'BACKLOG': 'BACKLOG.md',
        'MEMORY': 'MEMORY.md',
        'RELAY_A': 'RELAY_A.md',
        'RELAY_B': 'RELAY_B.md',
        'RELAY_C': 'RELAY_C.md',
        'RELAY_D': 'RELAY_D.md',
        'RELAY_E': 'RELAY_E.md',
        'RELAY_F': 'RELAY_F.md',
    };

    const payload = documents
        .filter(d => fileMap[d.type]) // Only sync known types
        .map(d => ({
            filename: fileMap[d.type],
            content: d.content
        }));

    if (payload.length === 0) return { success: false, error: "No syncable documents found." };

    return await syncDocsToDisk(payload);
}

export async function generateReleaseNotes(sprintTasks: any[]): Promise<string> {
    const prompt = `
    Generate semantic release notes for this sprint.
    Task List: ${JSON.stringify(sprintTasks)}

    Format as Markdown. Group by 'Features', 'Fixes', 'Refactor'.
    Use emojis. Be concise.
    `;

    return await generateText(prompt, "You are a Release Manager.", STRATEGY_MODEL);
}
