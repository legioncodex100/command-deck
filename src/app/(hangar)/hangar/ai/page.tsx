import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { AICrewMember } from '@/services/crew';
import { Bot, Plus, Settings2, ShieldCheck, User } from 'lucide-react';
import AgentGrid from './_components/AgentGrid'; // Client component wrapper

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
        <div className="p-8 max-w-7xl mx-auto space-y-12">

            {/* Header */}
            <div className="flex justify-between items-end border-b border-emerald-900/30 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-emerald-400 tracking-tighter mb-2 uppercase flex items-center gap-3">
                        <Bot size={32} /> Synthetic Division
                    </h1>
                    <p className="text-emerald-600/60 font-mono max-w-xl">
                        Manage your AI Consultants. Tune their neural directives, upgrade their cognitive models, and optimize fleet performance.
                    </p>
                </div>

                {/* Stats */}
                <div className="flex gap-8 text-right font-mono text-sm">
                    <div>
                        <span className="block text-2xl font-bold text-emerald-100">{activeCrew.length}</span>
                        <span className="text-emerald-700 uppercase">Active Units</span>
                    </div>
                    <div>
                        <span className="block text-2xl font-bold text-zinc-500">{reserveCrew.length}</span>
                        <span className="text-emerald-900/60 uppercase">In Reserve</span>
                    </div>
                </div>
            </div>

            {/* Grid Client Component */}
            <AgentGrid crew={crew as AICrewMember[]} />

        </div>
    );
}
