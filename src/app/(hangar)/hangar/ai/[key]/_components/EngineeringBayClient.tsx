'use strict';
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AICrewMember, AI_MODELS } from '@/services/crew';
import { updateCrewMember, createCrewMember } from '@/app/actions/crew';
import { ChevronLeft, Save, Cpu, User, Maximize2, X, Eye } from 'lucide-react';
import Link from 'next/link';
import AgentBuilderChat from './AgentBuilderChat';
import StandardPillarLayout from '@/components/pillars/StandardPillarLayout';
import { PillarPanel, PillarHeader, PillarBody } from '@/components/pillars/ui';

interface EngineeringBayClientProps {
    initialAgent: AICrewMember | null;
    isNew: boolean;
}

export default function EngineeringBayClient({ initialAgent, isNew }: EngineeringBayClientProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Core State
    const [formData, setFormData] = useState<Partial<AICrewMember>>(
        initialAgent || {
            name: '',
            designation: '',
            system_prompt: '',
            bio: '',
            is_active: true,
            model_config: { model: 'gemini-1.5-flash', temperature: 0.7 }
        }
    );

    // UI State
    const [isExpanded, setIsExpanded] = useState(false);

    // Save Logic
    const handleSave = async () => {
        setLoading(true);
        try {
            if (isNew) {
                const key = formData.name?.toLowerCase().replace(/\s+/g, '_');
                await createCrewMember({
                    name: formData.name!,
                    designation: formData.designation!,
                    system_prompt: formData.system_prompt!,
                    key: key!,
                    avatar_url: formData.avatar_url,
                    pillar: formData.pillar,
                    bio: formData.bio
                });
                router.replace(`/hangar/ai/${key}`);
            } else {
                await updateCrewMember(initialAgent!.key, {
                    system_prompt: formData.system_prompt,
                    model_config: formData.model_config,
                    is_active: formData.is_active,
                    avatar_url: formData.avatar_url,
                    pillar: formData.pillar,
                    bio: formData.bio
                });
                alert('Configuration Saved.');
            }
        } catch (e) {
            console.error(e);
            alert("Failed to save credentials.");
        } finally {
            setLoading(false);
        }
    };

    // AI Update Handling
    const [pendingUpdates, setPendingUpdates] = useState<Partial<AICrewMember> | null>(null);

    const handleAIUpdates = (updates: Partial<AICrewMember>) => {
        setPendingUpdates(updates);
    };

    const applyUpdates = () => {
        if (!pendingUpdates) return;
        setFormData(prev => ({ ...prev, ...pendingUpdates }));
        setPendingUpdates(null);
        setIsExpanded(false);
    };

    const discardUpdates = () => {
        setPendingUpdates(null);
        setIsExpanded(false);
    };

    // Panels construction

    const VisualsPanel = (
        <PillarPanel>
            <PillarHeader title="Identity Matrix" icon={Eye} />
            <PillarBody>
                <div className="p-6 space-y-8 flex flex-col items-center">
                    {/* Avatar & Upload */}
                    <div className={`w-32 h-32 rounded-full overflow-hidden border-2 flex items-center justify-center bg-black mb-4 group relative ${formData.is_active ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'border-zinc-800'}`}>
                        {formData.avatar_url ? (
                            <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <Cpu size={48} className={formData.is_active ? 'text-emerald-500' : 'text-zinc-700'} />
                        )}

                        <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <span className="text-xs text-emerald-400 font-bold uppercase">Update</span>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    if (file.size > 2 * 1024 * 1024) {
                                        alert("Max size 2MB");
                                        return;
                                    }
                                    try {
                                        const { uploadCrewAvatar } = await import('@/services/storage');
                                        const url = await uploadCrewAvatar(file, initialAgent?.key || formData.name?.toLowerCase() || 'temp');
                                        if (url) setFormData(p => ({ ...p, avatar_url: url }));
                                    } catch (err) { alert('Upload failed'); }
                                }}
                            />
                        </label>
                    </div>

                    <div className="text-center w-full space-y-2">
                        <input
                            value={formData.name || ''}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="bg-transparent text-center text-xl font-bold uppercase text-white/90 border-b border-transparent hover:border-white/20 focus:border-emerald-500 outline-none w-full pb-1 placeholder:text-zinc-700"
                            placeholder="DESIGNATION"
                            disabled={!isNew}
                        />
                        <input
                            value={formData.designation || ''}
                            onChange={e => setFormData({ ...formData, designation: e.target.value })}
                            className="bg-transparent text-center text-xs text-emerald-600 font-mono uppercase border-b border-transparent hover:border-white/20 focus:border-emerald-500 outline-none w-full pb-1 placeholder:text-emerald-900"
                            placeholder="e.g. Ops Officer"
                        />
                    </div>

                    <div className="w-full">
                        <label className="block text-xs text-zinc-500 mb-1 font-mono">Division (Pillar)</label>
                        <select
                            value={formData.pillar || 'Operations'}
                            onChange={e => setFormData({ ...formData, pillar: e.target.value as any })}
                            className="w-full bg-black/50 border border-emerald-900/50 rounded p-2 text-emerald-100 font-mono focus:border-emerald-500 outline-none"
                        >
                            {['Discovery', 'Strategy', 'Substructure', 'Design', 'Planning', 'Construction', 'Integration', 'Operations'].map(p => (
                                <option key={p} value={p}>{p.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Toggle */}
                    <div className="w-full flex items-center justify-between p-3 bg-white/5 rounded border border-white/5">
                        <span className="text-xs text-zinc-400">STATUS</span>
                        <button
                            onClick={() => setFormData(p => ({ ...p, is_active: !p.is_active }))}
                            className={`text-xs px-2 py-1 rounded border ${formData.is_active ? 'bg-emerald-900/30 text-emerald-400 border-emerald-900' : 'bg-red-900/20 text-red-500 border-red-900'}`}
                        >
                            {formData.is_active ? 'ONLINE' : 'OFFLINE'}
                        </button>
                    </div>
                </div>
            </PillarBody>
        </PillarPanel>
    );

    const CorePanel = (
        <PillarPanel>
            <PillarHeader
                title={pendingUpdates ? "Core Update Pending" : "Cognitive Core"}
                icon={Cpu}
                actions={
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold px-3 py-1 rounded text-[10px] uppercase tracking-wide transition-all disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                }
            />
            <PillarBody>
                <div className="p-6 space-y-6">
                    {/* Model Select */}
                    <div>
                        <label className="block text-xs text-zinc-500 mb-2">Model Architecture</label>
                        <select
                            value={pendingUpdates?.model_config?.model || formData.model_config?.model || 'gemini-1.5-flash'}
                            onChange={e => setFormData({
                                ...formData,
                                model_config: {
                                    model: e.target.value,
                                    temperature: formData.model_config?.temperature || 0.7
                                }
                            })}
                            className="w-full bg-black border border-white/10 rounded p-2 text-xs focus:border-emerald-500 outline-none"
                        >
                            {AI_MODELS.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Temp Slider */}
                    <div>
                        <label className="block text-xs text-zinc-500 mb-2 flex justify-between">
                            <span>Temperature</span>
                            <span className="text-emerald-400">{pendingUpdates?.model_config?.temperature || formData.model_config?.temperature}</span>
                        </label>
                        <input
                            type="range"
                            min="0" max="1" step="0.1"
                            value={pendingUpdates?.model_config?.temperature || formData.model_config?.temperature || 0.7}
                            onChange={e => setFormData({
                                ...formData,
                                model_config: {
                                    model: formData.model_config?.model || 'gemini-1.5-flash',
                                    temperature: parseFloat(e.target.value)
                                }
                            })}
                            className="w-full accent-emerald-500 cursor-pointer h-1 bg-white/10 rounded-lg appearance-none"
                        />
                    </div>

                    {/* Review Snippet */}
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs text-zinc-500">Cognitive Configuration</label>
                        {pendingUpdates ? (
                            <span className="text-[10px] text-emerald-400 font-bold animate-pulse">● REVIEW REQUIRED</span>
                        ) : (
                            <button
                                onClick={() => setIsExpanded(true)}
                                className="text-[10px] text-zinc-500 hover:text-white flex items-center gap-1"
                            >
                                <Maximize2 size={10} /> EXPAND
                            </button>
                        )}
                    </div>

                    {pendingUpdates ? (
                        <div className="flex flex-col bg-black/50 border border-emerald-500/50 rounded overflow-hidden relative group">
                            <div className="flex items-center justify-between px-3 py-2 bg-emerald-950/20 border-b border-emerald-900/30 shrink-0">
                                <span className="text-[10px] text-emerald-500 uppercase font-bold tracking-wider">PROPOSED</span>
                                <div className="flex gap-2 items-center">
                                    <button onClick={() => setIsExpanded(true)} className="text-emerald-500 hover:text-emerald-300" title="Expand"><Maximize2 size={12} /></button>
                                    <button onClick={discardUpdates} className="text-red-400 text-[10px] hover:underline">REJECT</button>
                                    <button onClick={applyUpdates} className="text-emerald-400 text-[10px] font-bold hover:underline">ACCEPT</button>
                                </div>
                            </div>
                            <div className="p-3 text-xs text-emerald-300 font-mono">
                                {pendingUpdates.system_prompt || pendingUpdates.bio ? "Updates to Brain/Directives available." : "Configuration updates pending."}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-emerald-600 font-bold uppercase mb-1 block">Directives</label>
                                <textarea
                                    value={formData.system_prompt || ''}
                                    onChange={e => setFormData({ ...formData, system_prompt: e.target.value })}
                                    className="w-full h-24 bg-black/50 border border-emerald-900/30 rounded p-3 text-sm font-mono text-emerald-400 focus:border-emerald-500 outline-none resize-none custom-scrollbar"
                                    placeholder="1. Always be polite..."
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-emerald-600 font-bold uppercase mb-1 block">Identity</label>
                                <textarea
                                    value={formData.bio || ''}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full h-24 bg-black/50 border border-emerald-900/30 rounded p-3 text-sm font-mono text-emerald-400 focus:border-emerald-500 outline-none resize-none custom-scrollbar"
                                    placeholder="You are..."
                                />
                            </div>
                        </div>
                    )}
                </div>
            </PillarBody>
        </PillarPanel>
    );

    const MainPanel = (
        <div className="flex flex-col h-full relative bg-zinc-950/50">
            {/* Simple Desktop Header overlay */}
            <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-black/50 shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/hangar/ai" className="text-zinc-500 hover:text-white transition-colors">
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-sm font-bold uppercase tracking-wider text-white">Engineering Bay</h1>
                        <p className="text-[10px] text-emerald-500/60 uppercase">
                            {isNew ? 'FABRICATION' : `CALIBRATING: ${initialAgent?.key}`}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 relative overflow-hidden">
                <AgentBuilderChat
                    agentName={formData.name || 'Unit'}
                    systemPrompt={formData.system_prompt || ''}
                    onUpdatePrompt={(newP) => handleAIUpdates({ ...pendingUpdates, system_prompt: newP })}
                    onUpdateConfig={(updates) => handleAIUpdates({ ...pendingUpdates, ...updates })}
                />
            </div>
        </div>
    );

    // Modal for Expanded View
    const renderExpandedModal = () => {
        if (!isExpanded) return null;
        const isReviewMode = !!pendingUpdates;
        const bioContent = isReviewMode ? pendingUpdates?.bio : formData.bio;
        const directivesContent = isReviewMode ? pendingUpdates?.system_prompt : formData.system_prompt;

        return (
            <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8">
                <div className="w-full h-full max-w-5xl bg-black border border-emerald-500/30 rounded-lg flex flex-col shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                    <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-zinc-900/50">
                        <div className="flex items-center gap-3">
                            <Cpu size={18} className={isReviewMode ? "text-emerald-500 animate-pulse" : "text-emerald-600"} />
                            <span className="text-sm font-bold text-white uppercase tracking-wider">
                                {isReviewMode ? 'COGNITIVE REVIEW' : 'COGNITIVE EDITOR'}
                            </span>
                        </div>
                        <button onClick={() => setIsExpanded(false)} className="p-2 text-zinc-500 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                        <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-white/10">
                            <div className="p-3 bg-zinc-900/30 border-b border-white/5 text-emerald-400 text-xs font-bold uppercase">Identity</div>
                            <textarea
                                value={bioContent || ''}
                                onChange={e => !isReviewMode && setFormData({ ...formData, bio: e.target.value })}
                                readOnly={isReviewMode}
                                className="flex-1 p-4 bg-zinc-950 text-emerald-100 font-mono text-xs md:text-sm leading-relaxed outline-none resize-none custom-scrollbar"
                                placeholder="Identity..."
                            />
                        </div>
                        <div className="flex-1 flex flex-col">
                            <div className="p-3 bg-zinc-900/30 border-b border-white/5 text-emerald-400 text-xs font-bold uppercase">Directives</div>
                            <textarea
                                value={directivesContent || ''}
                                onChange={e => !isReviewMode && setFormData({ ...formData, system_prompt: e.target.value })}
                                readOnly={isReviewMode}
                                className="flex-1 p-4 bg-zinc-950 text-emerald-100 font-mono text-xs md:text-sm leading-relaxed outline-none resize-none custom-scrollbar"
                                placeholder="Directives..."
                            />
                        </div>
                    </div>

                    {isReviewMode && (
                        <div className="h-16 border-t border-white/10 bg-zinc-900/50 flex items-center justify-end px-6 gap-4">
                            <button onClick={discardUpdates} className="px-4 py-2 text-red-400 border border-red-900/50 rounded uppercase text-xs font-bold hover:bg-red-900/20">Reject</button>
                            <button onClick={applyUpdates} className="px-4 py-2 bg-emerald-600 text-black rounded uppercase text-xs font-bold hover:bg-emerald-500">Accept Updates</button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            {renderExpandedModal()}
            <StandardPillarLayout
                themeColor="emerald"
                leftContent={VisualsPanel}
                mainContent={MainPanel}
                rightContent={CorePanel}
            />
        </>
    );
}
