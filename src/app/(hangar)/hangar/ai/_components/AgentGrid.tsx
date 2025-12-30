'use client';

import { useRouter } from 'next/navigation';
import { AICrewMember } from '@/services/crew';
// import AgentEditor from '@/components/hangar/AgentEditor'; // Deprecated
import { Shield, Plus, User, Cpu, Power } from 'lucide-react';
import { updateCrewMember } from '@/app/actions/crew';

import { useState } from 'react';
import OrgChart from './OrgChart';
import { LayoutGrid, Network } from 'lucide-react';

export default function AgentGrid({ crew }: { crew: AICrewMember[] }) {
    const router = useRouter(); // Import useRouter
    const [viewMode, setViewMode] = useState<'GRID' | 'ORG'>('GRID');

    const handleEdit = (agent: AICrewMember) => {
        router.push(`/hangar/ai/${agent.key}`);
    };

    const handleCreate = () => {
        router.push('/hangar/ai/fabricate');
    };

    const toggleActive = async (agent: AICrewMember, e: React.MouseEvent) => {
        e.stopPropagation();
        await updateCrewMember(agent.key, { is_active: !agent.is_active });
    };

    return (
        <div className="space-y-8">

            {/* Toolbar */}
            <div className="flex justify-between items-center">
                {/* View Toggle */}
                <div className="flex bg-black/40 border border-white/10 rounded-lg p-1 gap-1">
                    <button
                        onClick={() => setViewMode('GRID')}
                        className={`p-2 rounded flex items-center gap-2 text-xs font-bold uppercase transition-all ${viewMode === 'GRID' ? 'bg-emerald-900/30 text-emerald-400' : 'text-zinc-500 hover:text-white'}`}
                    >
                        <LayoutGrid size={14} /> Grid
                    </button>
                    <button
                        onClick={() => setViewMode('ORG')}
                        className={`p-2 rounded flex items-center gap-2 text-xs font-bold uppercase transition-all ${viewMode === 'ORG' ? 'bg-emerald-900/30 text-emerald-400' : 'text-zinc-500 hover:text-white'}`}
                    >
                        <Network size={14} /> Org Chart
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 bg-emerald-900/30 hover:bg-emerald-500 text-emerald-400 hover:text-black font-mono uppercase text-sm px-4 py-2 rounded transition-all border border-emerald-500/20 hover:border-emerald-500"
                    >
                        <Plus size={16} /> Fabricate New Unit
                    </button>
                </div>
            </div>

            {viewMode === 'ORG' ? (
                <OrgChart crew={crew} />
            ) : (
                /* Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {crew.map((agent) => (
                        <div
                            key={agent.id}
                            onClick={() => handleEdit(agent)}
                            className={`
                                group relative p-6 rounded-lg border transition-all cursor-pointer overflow-hidden
                                ${agent.is_active
                                    ? 'bg-zinc-950/50 border-emerald-900/40 hover:border-emerald-500/50 hover:bg-emerald-950/10'
                                    : 'bg-black border-zinc-900 hover:border-zinc-800 opacity-60 grayscale'}
                            `}
                        >
                            {/* Status Light */}
                            <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${agent.is_active ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-800'}`} />

                            <div className="flex items-start justify-between mb-4">
                                <div className="relative w-16 h-16 rounded-lg border border-white/10 overflow-hidden bg-black/50 shrink-0">
                                    {agent.avatar_url ? (
                                        <img
                                            src={agent.avatar_url}
                                            alt={agent.name}
                                            className={`w-full h-full object-cover transition-all duration-500 ${agent.is_active ? 'grayscale-0' : 'grayscale'}`}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            {agent.is_locked ? <Shield className="text-emerald-400" size={24} /> : <User className="text-emerald-600" size={24} />}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-emerald-100 font-mono tracking-tight group-hover:text-emerald-400 transition-colors">
                                    {agent.name}
                                </h3>
                                <div className="flex items-center gap-2 mb-4">
                                    <p className="text-xs text-emerald-600/80 font-mono uppercase tracking-wider">
                                        {agent.designation}
                                    </p>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border ${agent.pillar ? 'bg-emerald-900/30 text-emerald-400 border-emerald-900/50' : 'bg-red-900/20 text-red-500 border-red-900/40'}`}>
                                        {agent.pillar || 'UNASSIGNED'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 group-hover:text-zinc-400">
                                    <span className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded">
                                        <Cpu size={12} /> {agent.model_config?.model || 'Unknown'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        Temp: {agent.model_config?.temperature}
                                    </span>
                                </div>
                            </div>

                            {/* Hover Actions */}
                            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button
                                    onClick={(e) => toggleActive(agent, e)}
                                    className="p-2 bg-black rounded-full border border-emerald-900 text-emerald-600 hover:text-emerald-400 hover:border-emerald-500"
                                    title={agent.is_active ? "Deactivate" : "Activate"}
                                >
                                    <Power size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
