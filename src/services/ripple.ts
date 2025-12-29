
import { Document, DocumentType } from '@/types/database';

export interface StaleStatus {
    isStale: boolean;
    reason: string | null;
    upstreamDoc?: DocumentType;
}

const DEPENDENCY_MAP: Partial<Record<DocumentType, DocumentType[]>> = {
    'STRATEGY': ['PRD'],
    'SCHEMA': ['STRATEGY'], // Substructure depends on Strategy
    'DESIGN': ['SCHEMA', 'STRATEGY'], // Design depends on Schema & Strategy
    'BACKLOG': ['DESIGN', 'SCHEMA'], // Planning depends on Design & Schema
    'INSTRUCTIONS': ['BACKLOG'], // Construction depends on Backlog (Instruction implies Code/Build)
    // Virtual types for the Pillar Views checking their local Main Artifact
    'RELAY_B': ['STRATEGY'],
    'RELAY_C': ['SCHEMA'],
    'RELAY_D': ['DESIGN'],
    'RELAY_E': ['BACKLOG'],
    'RELAY_F': ['INSTRUCTIONS'] // or CONSTRUCTION_CHAT
};

/**
 * Checks if a target document is stale relative to its upstream dependencies.
 * @param targetType The document type currently being worked on (e.g., 'STRATEGY')
 * @param documents The list of all project documents
 */
export function checkStaleState(targetType: DocumentType, documents: Document[]): StaleStatus {
    const targetDoc = documents.find(d => d.type === targetType);

    // If target doesn't exist yet, it's not "stale", it's just "not started" (or clean slate).
    // However, if we want to show "Upstream Changed" even before we start, we can check against "now"?
    // But usually we compare timestamps.
    // If target exists, we compare.

    if (!targetDoc) return { isStale: false, reason: null };

    const dependencies = DEPENDENCY_MAP[targetType];
    if (!dependencies) return { isStale: false, reason: null };

    for (const depType of dependencies) {
        const depDoc = documents.find(d => d.type === depType);
        if (depDoc) {
            const targetTime = new Date(targetDoc.updated_at || targetDoc.created_at).getTime();
            const depTime = new Date(depDoc.updated_at || depDoc.created_at).getTime();

            // Buffer of 5 seconds to avoid race conditions during batch creates
            if (depTime > targetTime + 5000) {
                return {
                    isStale: true,
                    reason: `Upstream artifact ${depType} has been updated since this ${targetType} was generated.`,
                    upstreamDoc: depType
                };
            }
        }
    }

    return { isStale: false, reason: null };
}
