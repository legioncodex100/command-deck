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

export type DocumentType = 'PRD' | 'STRATEGY' | 'DESIGN' | 'SCHEMA' | 'TECH_SPEC' | 'USER_GUIDE' | 'INSTRUCTIONS' | 'BACKLOG' | 'STITCH_PROMPT' | 'SPRINT' | 'PLANNING_CHAT' | 'CONSTRUCTION_CHAT'
    | 'RELAY_A' | 'RELAY_B' | 'RELAY_C' | 'RELAY_D' | 'RELAY_E' | 'RELAY_F';

export interface Document {
    id: string; // uuid
    project_id: string; // uuid
    type: DocumentType;
    content: string; // text
    title?: string;
    summary?: string;
    created_at: string; // timestamptz
    updated_at?: string; // timestamptz
}

export type UserRole = 'COMMANDER' | 'PILOT' | 'CIVILIAN';

export interface Profile {
    id: string; // uuid
    email: string;
    display_name: string | null;
    full_name: string | null;
    avatar_url: string | null;
    role: UserRole;
    created_at: string;
    updated_at: string;
}

export interface ExtendedProfile extends Profile {
    last_sign_in_at?: string;
}

export interface Invitation {
    id: string;
    email: string;
    token: string;
    invited_by: string; // uuid
    status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
    created_at: string;
    expires_at: string;
}

export type EvolutionStatus = 'IDEA' | 'PLANNED' | 'PUSHED' | 'COMPLETED';

export interface Evolution {
    id: string;
    title: string;
    description: string | null;
    status: EvolutionStatus;
    spec_content: string | null;
    tasks_draft: { title: string, priority: 'P0' | 'P1' | 'P2' }[] | null;
    created_at: string;
    updated_at: string;
}
