'use strict';
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AICrewMember, AI_MODELS } from '@/services/crew';
import { updateCrewMember, createCrewMember, deleteCrewMember } from '@/app/actions/crew';
import { ChevronLeft, Save, Trash2, Cpu, User, Activity, Lock, Maximize2, X } from 'lucide-react';
import Link from 'next/link';
import AgentBuilderChat from './AgentBuilderChat';

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
                // Redirect to edit page of new agent
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

    // Unified Review Panel
    const renderReviewPanel = () => {
        return (
            <div className="flex flex-col w-full h-[500px] bg-black/50 border border-emerald-500/50 rounded overflow-hidden relative group">
                {/* Header for Actions */}
                <div className="flex items-center justify-between px-3 py-2 bg-emerald-950/20 border-b border-emerald-900/30 shrink-0">
                    <span className="text-[10px] text-emerald-500 uppercase font-bold tracking-wider">PROPOSED UPDATE</span>
                    <div className="flex gap-2 items-center">
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="text-emerald-500 hover:text-emerald-300 transition-colors mr-2"
                            title="Expand View"
                        >
                            <Maximize2 size={12} />
                        </button>
                        <button onClick={discardUpdates} className="bg-red-900/20 hover:bg-red-900/40 text-red-400 text-[10px] px-2 py-1 rounded border border-red-900/50 uppercase transition-colors">
                            Reject
                        </button>
                        <button onClick={applyUpdates} className="bg-emerald-600 hover:bg-emerald-500 text-black text-[10px] px-3 py-1 rounded font-bold uppercase transition-colors">
                            Accept
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">

                    {/* Bio / Identity Update */}
                    {(pendingUpdates?.bio !== undefined) && (
                        <div>
                            <div className="text-[10px] text-emerald-600 font-bold uppercase mb-1">Identity / Brain</div>
                            <div className="text-sm leading-relaxed font-mono text-emerald-300 whitespace-pre-wrap border-l-2 border-emerald-500/30 pl-2">
                                {pendingUpdates.bio || <span className="text-zinc-600 italic">No identity defined...</span>}
                            </div>
                        </div>
                    )}

                    {/* Directives Update */}
                    {(pendingUpdates?.system_prompt !== undefined) && (
                        <div>
                            <div className="text-[10px] text-emerald-600 font-bold uppercase mb-1 mt-2">Directives / Rules</div>
                            <div className="text-sm leading-relaxed font-mono text-emerald-300 whitespace-pre-wrap border-l-2 border-emerald-500/30 pl-2">
                                {pendingUpdates.system_prompt}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Render Expanded Modal (Updated for Split View)
    const renderExpandedModal = () => {
        if (!isExpanded) return null;

        const isReviewMode = !!pendingUpdates;
        // If reviewing, use pending data. If editing, use form data.
        const bioContent = isReviewMode ? pendingUpdates?.bio : formData.bio;
        const directivesContent = isReviewMode ? pendingUpdates?.system_prompt : formData.system_prompt;

        return (
            <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-8">
                <div className="w-full h-full max-w-5xl bg-black border border-emerald-500/30 rounded-lg flex flex-col shadow-[0_0_50px_rgba(16,185,129,0.1)]">

                    {/* Modal Header */}
                    <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-zinc-900/50">
                        <div className="flex items-center gap-3">
                            <Cpu size={18} className={isReviewMode ? "text-emerald-500 animate-pulse" : "text-emerald-600"} />
                            <span className="text-sm font-bold text-white uppercase tracking-wider">
                                {isReviewMode ? 'COGNITIVE REVIEW // PROPOSED CHANGES' : 'COGNITIVE EDITOR // LIVE CONFIG'}
                            </span>
                        </div>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="p-2 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Modal Content - Split View */}
                    <div className="flex-1 overflow-hidden flex flex-row">

                        {/* Identity (Bio) Pane */}
                        <div className="flex-1 flex flex-col border-r border-white/10">
                            <div className="p-3 bg-zinc-900/30 border-b border-white/5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                Identity / Brain (Who I Am)
                            </div>
                            {isReviewMode ? (
                                <div className="flex-1 p-4 text-emerald-300 font-mono text-sm leading-relaxed whitespace-pre-wrap overflow-y-auto custom-scrollbar">
                                    {bioContent !== undefined ? bioContent : <span className="text-zinc-600 italic">No changes to Identity.</span>}
                                </div>
                            ) : (
                                <textarea
                                    value={bioContent || ''}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    className="flex-1 p-4 bg-zinc-950 text-emerald-100 font-mono text-sm leading-relaxed outline-none focus:bg-black transition-all resize-none custom-scrollbar placeholder:text-zinc-700"
                                    placeholder="You are a world-class..."
                                    spellCheck="false"
                                />
                            )}
                        </div>

                        {/* Directives Pane */}
                        <div className="flex-1 flex flex-col">
                            <div className="p-3 bg-zinc-900/30 border-b border-white/5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                Directives / Rules (How I Operate)
                            </div>
                            {isReviewMode ? (
                                <div className="flex-1 p-4 text-emerald-300 font-mono text-sm leading-relaxed whitespace-pre-wrap overflow-y-auto custom-scrollbar">
                                    {directivesContent !== undefined ? directivesContent : <span className="text-zinc-600 italic">No changes to Directives.</span>}
                                </div>
                            ) : (
                                <textarea
                                    value={directivesContent || ''}
                                    onChange={e => setFormData({ ...formData, system_prompt: e.target.value })}
                                    className="flex-1 p-4 bg-zinc-950 text-emerald-100 font-mono text-sm leading-relaxed outline-none focus:bg-black transition-all resize-none custom-scrollbar placeholder:text-zinc-700"
                                    placeholder="1. Always be polite..."
                                    spellCheck="false"
                                />
                            )}
                        </div>

                    </div>

                    {/* Modal Footer (Actions) */}
                    <div className="h-16 border-t border-white/10 bg-zinc-900/50 flex items-center justify-end px-6 gap-4">
                        {isReviewMode ? (
                            <>
                                <button onClick={discardUpdates} className="px-6 py-2 rounded border border-red-900/50 bg-red-950/30 text-red-400 hover:bg-red-900/50 font-bold uppercase tracking-wide transition-all text-sm">
                                    Reject Changes
                                </button>
                                <button onClick={applyUpdates} className="px-6 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-black font-bold uppercase tracking-wide transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] text-sm">
                                    Accept & Merge
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setIsExpanded(false)} className="px-6 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-black font-bold uppercase tracking-wide transition-all text-sm">
                                Done
                            </button>
                        )}
                    </div>

                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen bg-[#050505] text-emerald-100 font-mono overflow-hidden">
            {renderExpandedModal()}

            {/* Top Bar */}
            <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/50 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/hangar/ai" className="text-zinc-500 hover:text-white transition-colors">
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold uppercase tracking-wider text-white">Engineering Bay</h1>
                        <p className="text-[10px] text-emerald-500/60 uppercase">
                            {isNew ? 'FABRICATION SEQUENCE' : `CALIBRATING: ${initialAgent?.key}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-black font-bold px-6 py-2 rounded font-mono text-sm uppercase tracking-wide transition-all disabled:opacity-50"
                    >
                        <Save size={16} /> {loading ? 'Saving...' : 'Save Config'}
                    </button>
                </div>
            </header>

            {/* Tri-Pane layout */}
            <div className="flex-1 flex overflow-hidden">

                {/* LEFT: The Shell (Visuals & Stats) */}
                <aside className="w-80 border-r border-white/10 bg-black/20 flex flex-col p-6 overflow-y-auto custom-scrollbar">
                    <div className="space-y-8">
                        {/* Avatar & Upload (Reused logic will go here) */}
                        <div className="flex flex-col items-center">
                            <div className={`w-32 h-32 rounded-full overflow-hidden border-2 flex items-center justify-center bg-black mb-4 group relative ${formData.is_active ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'border-zinc-800'}`}>
                                {formData.avatar_url ? (
                                    <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <Cpu size={48} className={formData.is_active ? 'text-emerald-500' : 'text-zinc-700'} />
                                )}

                                {/* Quick Upload Overlay (Simplified for now) */}
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
                                            // Quick inline upload logic reuse
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

                            <div className="col-span-2">
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
                        </div>
                        {/* Status Toggle */}
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/5">
                            <span className="text-xs text-zinc-400">STATUS</span>
                            <button
                                onClick={() => setFormData(p => ({ ...p, is_active: !p.is_active }))}
                                className={`text-xs px-2 py-1 rounded border ${formData.is_active ? 'bg-emerald-900/30 text-emerald-400 border-emerald-900' : 'bg-red-900/20 text-red-500 border-red-900'}`}
                            >
                                {formData.is_active ? 'ONLINE' : 'OFFLINE'}
                            </button>
                        </div>
                    </div>
                </aside>


                {/* CENTER: The Mind (Chat/Builder) */}
                <main className="flex-1 bg-zinc-950/50 p-6 flex flex-col relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

                    {/* Placeholder for Builder Chat */}
                    <AgentBuilderChat
                        agentName={formData.name || 'Unit'}
                        systemPrompt={formData.system_prompt || ''}
                        onUpdatePrompt={(newP) => handleAIUpdates({ ...pendingUpdates, system_prompt: newP })}
                        onUpdateConfig={(updates) => handleAIUpdates({ ...pendingUpdates, ...updates })}
                    />

                </main>


                {/* RIGHT: The Core (Config) */}
                <aside className="w-[500px] border-l border-white/10 bg-black/20 flex flex-col p-6 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold uppercase mb-6">
                        <Cpu size={14} /> Cognitive Core
                        {pendingUpdates && (
                            <span className="ml-auto text-[10px] bg-emerald-500 text-black px-2 py-0.5 rounded font-bold animate-pulse">
                                UPDATE PENDING
                            </span>
                        )}
                    </div>

                    <div className="space-y-6">
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

                        {/* Cognitive Core (Review or Edit) */}
                        <div className="flex-1 flex flex-col min-h-0">
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
                                renderReviewPanel()
                            ) : (
                                <div className="flex-1 flex flex-col gap-4 overflow-hidden">

                                    {/* Directives (Top) */}
                                    <div className="flex-1 flex flex-col min-h-0">
                                        <label className="text-[10px] text-emerald-600 font-bold uppercase mb-1">Directives / Rules</label>
                                        <textarea
                                            value={formData.system_prompt || ''}
                                            onChange={e => setFormData({ ...formData, system_prompt: e.target.value })}
                                            className="flex-1 bg-black/50 border border-emerald-900/30 rounded p-3 text-sm leading-relaxed font-mono text-emerald-400 focus:text-emerald-300 focus:border-emerald-500 outline-none resize-none transition-all custom-scrollbar placeholder:text-zinc-700"
                                            placeholder="1. Always be polite..."
                                        />
                                    </div>

                                    {/* Identity (Bottom) */}
                                    <div className="flex-1 flex flex-col min-h-0">
                                        <label className="text-[10px] text-emerald-600 font-bold uppercase mb-1">Identity / Brain</label>
                                        <textarea
                                            value={formData.bio || ''}
                                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                            className="flex-1 bg-black/50 border border-emerald-900/30 rounded p-3 text-sm leading-relaxed font-mono text-emerald-400 focus:text-emerald-300 focus:border-emerald-500 outline-none resize-none transition-all custom-scrollbar placeholder:text-zinc-700"
                                            placeholder="You are a world-class..."
                                        />
                                    </div>

                                </div>
                            )}

                            <p className="text-[10px] text-zinc-600 mt-2 shrink-0">
                                Use the Center Panel to generate this using the Personnel Director.
                            </p>
                        </div>
                    </div>

                </aside>

            </div>
        </div>
    );
}
