import { createClient } from '@/utils/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { AICrewMember } from '@/services/crew';
import EngineeringBayClient from './_components/EngineeringBayClient';

export default async function Page({ params }: { params: Promise<{ key: string }> }) {
    const { key } = await params;
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // 2. Fetch Agent Data
    // We handle "new" agents via a special key 'new' or just client side?
    // The plan said /ai/[key], so let's assume editing existing for now.
    // If key is 'fabricate', we handle new.

    let agent: AICrewMember | null = null;

    if (key !== 'fabricate') {
        const { data, error } = await supabase
            .from('ai_crew')
            .select('*')
            .eq('key', key)
            .single();

        if (error || !data) {
            console.error("Agent load error:", error);
            // If not found, maybe redirect to hangar?
            return notFound();
        }
        agent = data as AICrewMember;
    }

    return (
        <EngineeringBayClient
            initialAgent={agent}
            isNew={key === 'fabricate'}
        />
    );
}
