import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { AICrewMember } from '@/services/crew';
import HangarSynthetic from '@/components/dev/HangarSynthetic';

export default async function HangarAIPage() {
    const supabase = await createClient(); // Await the promise

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Verify Commander/Pilot Role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role === 'CIVILIAN') redirect('/');

    // Fetch Crew
    const { data: crew } = await supabase
        .from('ai_crew')
        .select('*')
        .order('is_active', { ascending: false })
        .order('is_locked', { ascending: false });

    // Group by Status
    const activeCrew = crew?.filter(c => c.is_active) || [];
    const reserveCrew = crew?.filter(c => !c.is_active) || [];

    return (
        <HangarSynthetic
            crew={crew as AICrewMember[]}
            activeCount={activeCrew.length}
            reserveCount={reserveCrew.length}
        />
    );
}
