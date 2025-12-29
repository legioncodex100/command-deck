
"use client";

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Sparkles, Terminal, Trash2, MessageSquare, CheckCircle2, AlertCircle, ArrowRight, CheckCheck } from 'lucide-react';
import { checkStaleState } from '@/services/ripple';
import { useProject } from '@/hooks/useProject';
import { sendDesignMessage } from '@/services/design';
import { loadDesignSession, saveDesignSession, deleteDesignSession } from '@/services/design_persistence';
import { ComplexitySelector, ComplexityLevel } from '@/components/ComplexitySelector';
import { generateRelayArtifact } from '@/services/relay';

export default function Pillar_D_Design() {
    const { activeProjectId, documents, saveDocument } = useProject();
    const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string; recommendation?: any }[]>([]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [designDoc, setDesignDoc] = useState('# Design System\n\n*(Pending Designer input...)*');
    const [pillars, setPillars] = useState<string[]>([]);
    const [complexity, setComplexity] = useState<ComplexityLevel>('INTERMEDIATE');
    const [relayGenerated, setRelayGenerated] = useState(false);
    const staleState = checkStaleState('DESIGN', documents as any);

    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (activeProjectId) {
            loadDesignSession(activeProjectId).then(session => {
                if (session) {
                    setMessages(session.messages || []);
                    setDesignDoc(session.current_design_doc || designDoc);
                    setPillars(session.completed_stages || []);
                }
            });
            const hasRelay = documents.some(d => d.type === 'RELAY_D');
            if (hasRelay) setRelayGenerated(true);
        }
    }, [activeProjectId, documents]);

    useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    const handleSend = async (text: string) => {
        if (!text.trim() || !activeProjectId) return;

        // Inheritance
        const schemaDoc = documents.find(d => d.type === 'SCHEMA');
        const schemaContent = schemaDoc?.content || "No Schema available.";
        const prdDoc = documents.find(d => d.type === 'PRD');
        const prdContent = prdDoc?.content || "No PRD available.";
        const strategyDoc = documents.find(d => d.type === 'STRATEGY');
        const strategyContent = strategyDoc?.content || "No Strategy available.";

        const newMsgs = [...messages, { role: 'user' as const, text }];
        setMessages(newMsgs);
        setInput('');
        setIsProcessing(true);
        if (textareaRef.current) textareaRef.current.style.height = 'auto';

        try {
            const result = await sendDesignMessage(text, newMsgs, {
                schema: schemaContent,
                prd: prdContent,
                strategy: strategyContent
            }, complexity);

            const updatedMsgs = [...newMsgs, {
                role: 'model' as const,
                text: result.message,
                recommendation: result.consultantRecommendation
            }];

            setMessages(updatedMsgs);
            if (result.designDocument) {
                setDesignDoc(result.designDocument);
                // Auto-save
                await saveDocument({ project_id: activeProjectId, type: 'DESIGN', content: result.designDocument, title: 'Design System' });
            }
            // setPillars(result.completedPillars); // Service doesn't return this yet

            await saveDesignSession({
                project_id: activeProjectId,
                messages: updatedMsgs,
                current_design_doc: result.designDocument || designDoc,
                completed_stages: pillars // Persist current pillars state or empty for now
            });

        } catch (e) {
            console.error("Design Error:", e);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClear = async () => {
        if (!activeProjectId) return;
        if (!confirm("Are you sure you want to clear the Design Studio?")) return;

        setIsProcessing(true);
        await deleteDesignSession(activeProjectId);
        setMessages([]);
        setDesignDoc('# Design System\n\n*(Pending Designer input...)*');
        setPillars([]);
        setIsProcessing(false);
    };

    const handleCompletePhase = async () => {
        if (!activeProjectId || !designDoc) return;
        if (staleState.isStale && !confirm(`WARNING: ${staleState.reason}\n\nDo you still want to proceed?`)) return;
        if (!confirm("Generate Relay Artifact and Complete Phase D? This will lock the Design System.")) return;

        setIsProcessing(true);
        try {
            const relay = await generateRelayArtifact({
                currentPhase: 'DESIGN (Pillar D)',
                nextPhase: 'PLANNING (Pillar E)',
                artifactContent: designDoc,
                decisions: messages.map(m => m.text).join('\n'),
                previousRelayContent: documents.find(d => d.type === 'RELAY_C')?.content || undefined
            });

            await saveDocument({
                project_id: activeProjectId,
                type: 'RELAY_D',
                content: relay,
                title: 'Handover Relay D->E'
            });

            setRelayGenerated(true);
            alert("Phase D Complete. Relay Artifact Generated.");
        } catch (e) {
            console.error(e);
            alert("Failed to generate relay.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleInit = () => {
        const schemaDoc = documents.find(d => d.type === 'SCHEMA');
        const initText = schemaDoc
            ? `Initialize Design Studio. Inherited Schema Context: ${schemaDoc.title || 'Database Schema'}.`
            : "Initialize Design Studio. Warning: No Schema detected.";
        handleSend(initText);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(input);
        }
    };

    const PillarItem = ({ label, done }: { label: string, done: boolean }) => (
        <div className={`p-3 border-l-2 flex items-center justify-between transition-colors ${done ? 'bg-indigo-950/20 border-indigo-500' : 'bg-transparent border-zinc-800'}`}>
            <span className={`text-xs font-mono font-bold tracking-wider ${done ? 'text-indigo-400' : 'text-zinc-600'}`}>{label}</span>
            {done && <CheckCircle2 className="h-4 w-4 text-indigo-500" />}
        </div>
    );

    return (
        <div className="h-full w-full grid grid-cols-12 gap-0 overflow-hidden bg-black text-zinc-300 font-mono">
            {/* COLUMN 1: STAGES (Left Pane) */}
            <div className="col-span-2 border-r border-[#27272a] bg-[#020402] flex flex-col overflow-hidden">
                <header className="p-4 flex flex-col gap-4 mb-2 shrink-0 border-b border-white/5">
                    <div>
                        <h2 className="text-sm font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                            <Sparkles className="h-4 w-4" /> Design Studio
                        </h2>
                        <div className="flex items-center justify-between mt-1">
                            <p className="text-[10px] text-zinc-600">PHASE 12.5 // ACTIVE</p>
                        </div>
                        {staleState.isStale && (
                            <div className="mt-2 text-[9px] text-amber-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                <span>Input Updated</span>
                            </div>
                        )}
                    </div>
                </header>
                <div className="flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-4 scrollbar-thin scrollbar-thumb-indigo-900/50 flex flex-col gap-1">
                        {["PALETTE", "TYPOGRAPHY", "COMPONENTS", "LAYOUTS", "INTERACTIONS"].map(p => (
                            <PillarItem key={p} label={p} done={pillars.some(active => active.toUpperCase() === p.toUpperCase())} />
                        ))}
                    </div>
                </div>
            </div>

            {/* COLUMN 2: WORKBENCH (Middle) */}
            <div className="col-span-6 flex flex-col border-r border-zinc-900 bg-black relative overflow-hidden">
                <header className="p-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                        <Terminal className="h-4 w-4" /> UX Console
                    </div>
                    <div className="flex items-center gap-3">
                        <ComplexitySelector value={complexity} onChange={setComplexity} />
                        <button
                            onClick={handleClear}
                            className="p-1.5 hover:bg-red-950/30 text-zinc-600 hover:text-red-500 rounded transition-colors group"
                            title="Clear Session"
                        >
                            <Trash2 className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-0 animate-fadeIn" style={{ animationFillMode: 'forwards', animationDuration: '0.5s' }}>
                            <div className="h-16 w-16 bg-indigo-900/10 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20">
                                <Sparkles className="h-8 w-8 text-indigo-500" />
                            </div>
                            <h3 className="text-xl font-bold text-indigo-100 mb-2">Design Studio</h3>
                            <button onClick={handleInit} className="group relative px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm tracking-widest uppercase rounded">
                                Initialize Session
                            </button>
                        </div>
                    ) : (
                        messages.map((m, i) => (
                            <div key={i} className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 opacity-50">
                                    {m.role === 'model' ? <MessageSquare className="h-3 w-3 text-indigo-500" /> : <div className="h-3 w-3 bg-zinc-700 rounded-full" />}
                                    <span className="text-[10px] uppercase font-bold tracking-wider">{m.role === 'model' ? 'UX CONSULTANT' : 'USER'}</span>
                                </div>
                                <div className={`pl-4 border-l ${m.role === 'model' ? 'border-indigo-500/50 text-indigo-100/90' : 'border-zinc-700 text-zinc-400'} text-xs leading-relaxed whitespace-pre-wrap`}>
                                    <ReactMarkdown>{m.text}</ReactMarkdown>
                                </div>
                                {/* Decision Cards - Reuse from Strategy/Substructure style if needed, checking existing impl */}
                                {m.recommendation && (
                                    <div className="ml-4 mt-2 mb-2 w-full max-w-sm bg-black border border-indigo-500/30 rounded overflow-hidden">
                                        <div className="p-2 border-b border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-950/30">
                                            Decision Required
                                        </div>
                                        <div className="p-2 space-y-1">
                                            {m.recommendation.options.map((opt: any) => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => handleSend(`Selected: ${opt.label}`)}
                                                    className={`w-full text-left p-2 rounded text-[10px] border ${opt.recommended ? 'border-indigo-500/50 bg-indigo-950/20 text-indigo-200' : 'border-zinc-800 hover:border-indigo-500/30 text-zinc-500 hover:text-indigo-300'}`}
                                                >
                                                    <div className="font-bold mb-0.5">{opt.label}</div>
                                                    <div className="opacity-70">{opt.description}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                    <div ref={scrollRef} />
                </div>

                <div className="p-3 border-t border-zinc-800 bg-zinc-950">
                    <div className="relative flex items-end gap-2 bg-zinc-900/50 border border-zinc-800 rounded p-1 focus-within:border-indigo-500/50">
                        <textarea
                            ref={textareaRef}
                            className="flex-1 bg-transparent p-2 text-xs text-indigo-100 placeholder-zinc-700 focus:outline-none resize-none max-h-[200px] min-h-[36px]"
                            placeholder="Discuss design..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isProcessing}
                            rows={1}
                        />
                        <button onClick={() => handleSend(input)} className="p-2 text-zinc-600 hover:text-indigo-500"><Send className="h-3 w-3" /></button>
                    </div>
                </div>
            </div>

            {/* COLUMN 3: OUTPUT (Right) */}
            <div className="col-span-4 bg-[#050505] flex flex-col border-l border-zinc-900 overflow-hidden">
                <header className="p-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                        <FileText className="h-4 w-4" /> DESIGN_SYSTEM.md
                    </div>
                    {relayGenerated ? (
                        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-900/30 rounded border border-indigo-500/30 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                            <CheckCheck className="h-3 w-3" /> Phase Complete
                        </div>
                    ) : (
                        <button
                            onClick={handleCompletePhase}
                            disabled={isProcessing}
                            className={`flex items-center gap-2 px-3 py-1 text-black text-[10px] font-bold uppercase tracking-wider rounded transition-all disabled:opacity-50 ${staleState.isStale ? 'bg-amber-600 hover:bg-amber-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}
                        >
                            {staleState.isStale ? 'Complete (Stale)' : 'Complete Phase'} <ArrowRight className="h-3 w-3" />
                        </button>
                    )}
                </header>
                <div className="flex-1 overflow-y-auto p-6 font-mono text-[11px] leading-6 text-zinc-400 whitespace-pre-wrap scrollbar-thin scrollbar-thumb-zinc-800">
                    {designDoc}
                </div>
            </div>
        </div>
    );
}

function FileText({ className }: { className?: string }) {
    return <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>;
}
