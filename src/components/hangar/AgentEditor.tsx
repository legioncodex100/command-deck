'use client';

import { useState } from 'react';
import { AICrewMember, AI_MODELS } from '@/services/crew';
import { updateCrewMember, createCrewMember, deleteCrewMember } from '@/app/actions/crew';
import { X, Save, Trash2, Cpu, User, Activity, Lock } from 'lucide-react';

interface AgentEditorProps {
    agent?: AICrewMember | null;
    onClose: () => void;
}

export default function AgentEditor({ agent, onClose }: AgentEditorProps) {
    const isNew = !agent;
    const [formData, setFormData] = useState<Partial<AICrewMember>>(
        agent || {
            name: '',
            designation: '',
            system_prompt: '',
            is_active: true,
            model_config: { model: 'gemini-1.5-flash', temperature: 0.7 }
        }
    );
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (isNew) {
                // Generate a key from name if new
                const key = formData.name?.toLowerCase().replace(/\s+/g, '_');
                await createCrewMember({
                    name: formData.name!,
                    designation: formData.designation!,
                    system_prompt: formData.system_prompt!,
                    key: key!,
                    avatar_url: formData.avatar_url
                });
            } else {
                await updateCrewMember(agent!.key, {
                    system_prompt: formData.system_prompt,
                    model_config: formData.model_config,
                    is_active: formData.is_active,
                    avatar_url: formData.avatar_url
                });
            }
            onClose();
        } catch (e) {
            console.error(e);
            alert("Failed to save credentials.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Decommission this unit? This cannot be undone.")) return;
        setLoading(true);
        try {
            await deleteCrewMember(agent!.key);
            onClose();
        } catch (e) {
            alert("Could not delete unit.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end">
            <div className="w-full max-w-2xl bg-zinc-950 border-l border-emerald-900/50 h-full p-6 flex flex-col shadow-2xl">

                {/* Header */}
                <div className="flex justify-between items-center mb-8 border-b border-emerald-900/30 pb-4">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className={`w-16 h-16 rounded-full overflow-hidden border-2 flex items-center justify-center bg-black ${formData.is_active ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-red-900/50'}`}>
                                {formData.avatar_url ? (
                                    <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <Cpu size={32} className={formData.is_active ? 'text-emerald-500' : 'text-red-500'} />
                                )}
                            </div>

                            {/* Upload Overlay */}
                            <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                                <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase">Upload</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        // Safety Check: Max 2MB
                                        if (file.size > 2 * 1024 * 1024) {
                                            alert("File too large. Max size is 2MB.");
                                            return;
                                        }

                                        // If it's a new agent, we need a key first. 
                                        // We can fallback to a temp key or require name first.
                                        // For now let's use a temp key if no name, or derive from name.
                                        const tempKey = formData.name
                                            ? formData.name.toLowerCase().replace(/\s+/g, '_')
                                            : `temp_${Date.now()}`;

                                        // Set loading state if we want tailored feedback
                                        try {
                                            const { uploadCrewAvatar } = await import('@/services/storage');
                                            const url = await uploadCrewAvatar(file, agent?.key || tempKey);
                                            if (url) {
                                                setFormData(prev => ({ ...prev, avatar_url: url }));
                                            }
                                        } catch (err) {
                                            alert("Upload failed");
                                        }
                                    }}
                                />
                            </label>
                        </div>

                        <div>
                            <h2 className="text-xl font-mono text-emerald-100 font-bold uppercase tracking-wider">
                                {isNew ? 'FABRICATE UNIT' : 'NEURAL LINK ESTABLISHED'}
                            </h2>
                            <p className="text-xs text-emerald-600 font-mono">
                                {isNew ? 'INITIALIZING NEW PROTOCOL' : `CONNECTED TO: ${agent?.key?.toUpperCase()}`}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-emerald-900/20 rounded-full text-emerald-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">

                    {/* Identity Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-400 text-sm font-mono uppercase font-bold">
                            <User size={14} /> Identity Protocol
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-zinc-500 mb-1 font-mono">Designation (Name)</label>
                                <input
                                    value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-black/50 border border-emerald-900/50 rounded p-2 text-emerald-100 font-mono focus:border-emerald-500 outline-none"
                                    placeholder="e.g. Data"
                                    disabled={!isNew} // Core agents name locked? Maybe allowed but key is locked.
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-500 mb-1 font-mono">Functional Role</label>
                                <input
                                    value={formData.designation || ''}
                                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                    className="w-full bg-black/50 border border-emerald-900/50 rounded p-2 text-emerald-100 font-mono focus:border-emerald-500 outline-none"
                                    placeholder="e.g. Ops Officer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Model Config */}
                    <div className="space-y-4 p-4 bg-emerald-950/20 rounded border border-emerald-900/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-emerald-400 text-sm font-mono uppercase font-bold">
                                <Cpu size={14} /> Cognitive Engine
                            </div>
                            {agent?.is_locked && (
                                <div className="flex items-center gap-1 text-[10px] text-amber-500 bg-amber-950/30 px-2 py-1 rounded border border-amber-900/50">
                                    <Lock size={10} /> CORE SYSTEM PROTECTED
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs text-zinc-500 mb-2 font-mono">Model Architecture</label>
                                <select
                                    value={formData.model_config?.model || 'gemini-1.5-flash'}
                                    onChange={e => setFormData({
                                        ...formData,
                                        model_config: {
                                            model: e.target.value,
                                            temperature: formData.model_config?.temperature ?? 0.7
                                        }
                                    })}
                                    className="w-full bg-black border border-emerald-900/50 rounded p-2 text-emerald-100 text-xs font-mono focus:border-emerald-500 outline-none"
                                >
                                    {AI_MODELS.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-500 mb-2 font-mono flex justify-between">
                                    <span>Temperature (Creativity)</span>
                                    <span className="text-emerald-400">{formData.model_config?.temperature}</span>
                                </label>
                                <input
                                    type="range"
                                    min="0" max="1" step="0.1"
                                    value={formData.model_config?.temperature || 0.7}
                                    onChange={e => setFormData({
                                        ...formData,
                                        model_config: {
                                            model: formData.model_config?.model ?? 'gemini-1.5-flash',
                                            temperature: parseFloat(e.target.value)
                                        }
                                    })}
                                    className="w-full accent-emerald-500 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* System Prompt */}
                    <div className="space-y-2 h-full flex flex-col">
                        <div className="flex items-center gap-2 text-emerald-400 text-sm font-mono uppercase font-bold">
                            <Activity size={14} /> Neural Directives (System Prompt)
                        </div>
                        <p className="text-xs text-zinc-500">Define the core personality, behavioral constraints, and expertise.</p>
                        <textarea
                            value={formData.system_prompt || ''}
                            onChange={e => setFormData({ ...formData, system_prompt: e.target.value })}
                            className="w-full flex-1 min-h-[300px] bg-black/50 border border-emerald-900/50 rounded p-4 text-emerald-100/90 font-mono text-sm leading-relaxed focus:border-emerald-500 outline-none resize-none"
                            placeholder="You are..."
                        />
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="pt-6 border-t border-emerald-900/30 flex justify-between items-center">
                    <div>
                        {!isNew && !agent?.is_locked && (
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-2 text-red-900/60 hover:text-red-500 transition-colors font-mono text-sm uppercase px-4 py-2"
                                disabled={loading}
                            >
                                <Trash2 size={16} /> Decommission
                            </button>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-emerald-600 font-mono text-sm uppercase hover:bg-emerald-900/10 rounded transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-black font-bold px-6 py-2 rounded font-mono text-sm uppercase tracking-wide transition-all disabled:opacity-50"
                        >
                            <Save size={16} /> {loading ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
