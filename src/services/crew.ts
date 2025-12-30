import { supabase } from "./supabase";

export interface AICrewMember {
    id: string;
    key: string;
    name: string;
    designation: string;
    system_prompt: string;
    model_config: {
        model: string;
        temperature: number;
    };
    avatar_url?: string;
    bio?: string;
    pillar?: 'Discovery' | 'Strategy' | 'Substructure' | 'Design' | 'Planning' | 'Construction' | 'Integration' | 'Operations';
    is_active: boolean;
    is_locked: boolean;
}

export const PILLARS = ['Discovery', 'Strategy', 'Substructure', 'Design', 'Planning', 'Construction', 'Integration', 'Operations'] as const;

export const AI_MODELS = [
    { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Experimental) - ACTIVE' },
    { value: 'gemini-1.5-flash-001', label: 'Gemini 1.5 Flash (Standard)' },
    { value: 'gemini-1.5-pro-001', label: 'Gemini 1.5 Pro (Deep)' },
];

export async function getAgentByKey(key: string): Promise<AICrewMember | null> {
    try {
        const { data, error } = await supabase
            .from('ai_crew')
            .select('*')
            .eq('key', key)
            .single();

        if (error) {
            console.error(`AI Crew Fetch Error [${key}]:`, error);
            // In a real app we might want a hardcoded fallback here if the DB is failing
            // For now, we return null to let the caller handle it or use a default
            return null;
        }

        return data as AICrewMember;
    } catch (e) {
        console.error(`Critical AI Crew Error [${key}]:`, e);
        return null;
    }
}

export async function getActiveCrew(): Promise<AICrewMember[]> {
    const { data } = await supabase
        .from('ai_crew')
        .select('*')
        .eq('is_active', true)
        .order('key');
    return (data || []) as AICrewMember[];
}
