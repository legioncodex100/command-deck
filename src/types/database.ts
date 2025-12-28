export type Stage = 'DISCOVERY' | 'STRATEGY' | 'DESIGN' | 'SUBSTRUCTURE' | 'CONSTRUCTION' | 'AUDIT' | 'HANDOVER' | 'MAINTENANCE';

export interface Project {
    id: string; // uuid
    user_id: string; // uuid
    name: string;
    description: string | null;
    current_stage: Stage;
    is_completed: boolean;
    created_at: string; // timestamptz
    updated_at: string; // timestamptz
}

export interface Blueprint {
    id: string; // uuid
    project_id: string; // uuid
    content: any; // jsonb, keeping flexible for now
    version: number; // int
    created_at: string; // timestamptz
}

export interface AuditLog {
    id: string; // uuid
    project_id: string; // uuid
    findings: any; // jsonb
    risk_score: number; // int
    created_at: string; // timestamptz
}

export type DocumentType = 'PRD' | 'STRATEGY' | 'DESIGN' | 'SCHEMA' | 'TECH_SPEC' | 'USER_GUIDE' | 'INSTRUCTIONS' | 'BACKLOG';

export interface Document {
    id: string; // uuid
    project_id: string; // uuid
    type: DocumentType;
    content: string; // text
    title?: string;
    summary?: string;
    created_at: string; // timestamptz
}
