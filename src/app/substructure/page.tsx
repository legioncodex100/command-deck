"use client";

import { useState, useEffect, useRef } from "react";
import { useProject } from "@/hooks/useProject";
import { useAuth } from "@/hooks/useAuth";
import { SchemaPillar, sendSubstructureMessage } from "@/services/substructure";
import { loadStrategySession } from "@/services/strategy_persistence";
import { loadSubstructureSession, saveSubstructureSession, deleteSubstructureSession } from "@/services/substructure_persistence";
import { CenterCircle, SendFilled, Locked, CheckmarkFilled, RadioButton, Document, Code, Terminal, Activity, TrashCan } from "@carbon/icons-react";
import { Database, FileText, Network } from "lucide-react";
import { DraftViewer } from "@/components/DraftViewer";
import { StageNavigator } from "@/components/StageNavigator";
import { SchemaVisualizer } from "@/components/SchemaVisualizer";
import { cn } from "@/lib/utils";
import { supabase } from "@/services/supabase";

const PILLARS: { id: SchemaPillar; label: string }[] = [
    { id: 'TABLES', label: 'Tables & Entities' },
    { id: 'RELATIONSHIPS', label: 'Foreign Keys' },
    { id: 'INDEXES', label: 'Indexes & Perf' },
    { id: 'RLS', label: 'Row-Level Security' },
    { id: 'FUNCTIONS', label: 'Functions & Triggers' }
];

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    consultantRecommendation?: {
        context: string;
        options: { id: string, label: string, description: string, recommended: boolean }[];
        selectedId?: string;
    };
}

export default function SubstructureStudio() {
    const { activeProject, documents } = useProject();

    // State
    const [view, setView] = useState<'CHAT' | 'SCHEMA' | 'STRATEGY'>('SCHEMA');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    // Session State
    const [sessionId, setSessionId] = useState<string | undefined>(undefined);
    const [showVisualizer, setShowVisualizer] = useState(false);

    // Artifacts
    const [strategyContent, setStrategyContent] = useState("");
    const [schemaSql, setSchemaSql] = useState("-- awaiting_architect_input...");

    const [completedPillars, setCompletedPillars] = useState<SchemaPillar[]>([]);
    const [started, setStarted] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-Resize Input
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    // Scroll Chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, view]);

    // Load Strategy Context & Existing Schema
    useEffect(() => {
        if (!activeProject) return;

        const loadContext = async () => {
            // 1. Try to get formal Strategy Document
            const stratDoc = documents.find(d => d.type === 'STRATEGY');

            if (stratDoc) {
                setStrategyContent(stratDoc.content);
            } else {
                // 2. Fallback: Try to get latest Draft Session
                // This bridges the gap if they didn't click "Publish" but have done the work.
                try {
                    const session = await loadStrategySession(activeProject.id);
                    if (session && session.current_draft) {
                        setStrategyContent(session.current_draft);
                    } else {
                        setStrategyContent("> CRITICAL WARNING: NO STRATEGY DEFINED.\n> PLEASE RETURN TO PHASE 2 (STRATEGY).");
                    }
                } catch (e) {
                    setStrategyContent("> ERROR LOADING STRATEGY.\n> PLEASE RETRY.");
                }
            }

            // 3. Load Active Substructure Session
            try {
                // @ts-ignore
                const savedSession = await loadSubstructureSession(activeProject.id);
                if (savedSession) {
                    console.log("Session Found:", savedSession.id);
                    setSessionId(savedSession.id);
                    setMessages(savedSession.messages);
                    setSchemaSql(savedSession.schema_sql);
                    // @ts-ignore
                    setCompletedPillars(savedSession.completed_pillars);
                    setStarted(true);
                } else {
                    console.log("No existing session found.");
                    // 3b. Get Existing Schema from Documents (fallback)
                    const schemaDoc = documents.find(d => d.type === 'SCHEMA');
                    if (schemaDoc) {
                        setSchemaSql(schemaDoc.content);
                        setStarted(true);
                    }
                }
            } catch (err) {
                console.error("CRITICAL: Failed to load Substructure Session", err);

                // Fallback
                const schemaDoc = documents.find(d => d.type === 'SCHEMA');
                if (schemaDoc) {
                    setSchemaSql(schemaDoc.content);
                    setStarted(true);
                }
            }
        };

        loadContext();

    }, [activeProject, documents]);


    const handleStart = async () => {
        if (!activeProject) return;
        setStarted(true);
        setLoading(true);

        const initialMsg: ChatMessage = {
            role: 'model',
            text: "Database Engineer online. Accessing Strategy Context... \n\nI am ready to define the Substructure. Shall we begin with the core Table Definitions?"
        };

        setMessages([initialMsg]);

        // Init Session
        try {
            const newId = await saveSubstructureSession({
                project_id: activeProject.id,
                messages: [initialMsg],
                schema_sql: schemaSql,
                completed_pillars: completedPillars
            });
            if (newId) setSessionId(newId);
        } catch (e) {
            console.error("Failed to init session", e);
        }

        setLoading(false);
    };

    const handleSend = async (textOverride?: string) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim() || loading || !activeProject) return;

        const newUserMsg: ChatMessage = { role: 'user', text: textToSend };
        const newHistory = [...messages, newUserMsg];
        setMessages(newHistory);
        setInput("");
        setLoading(true);

        try {
            const historySimple = newHistory.map(m => ({ role: m.role, text: m.text }));

            const response = await sendSubstructureMessage(
                newUserMsg.text,
                historySimple,
                strategyContent
            );

            const aiMsg: ChatMessage = {
                role: 'model',
                text: response.message,
                consultantRecommendation: response.consultantRecommendation
            };

            const updatedHistory = [...newHistory, aiMsg];
            setMessages(updatedHistory);

            let currentSchema = schemaSql;
            if (response.schemaSql && response.schemaSql !== "NO_CHANGE") {
                setSchemaSql(response.schemaSql);
                currentSchema = response.schemaSql;
            }

            // Update pillars
            const newPillars = [...completedPillars];
            // @ts-ignore
            if (response.completedPillars) {
                // @ts-ignore
                response.completedPillars.forEach(p => {
                    const id = p.toUpperCase() as SchemaPillar;
                    if (PILLARS.some(pil => pil.id === id) && !newPillars.includes(id)) {
                        newPillars.push(id);
                    }
                });
                setCompletedPillars(newPillars);
            }

            // SAVE SESSION
            const savedId = await saveSubstructureSession({
                id: sessionId,
                project_id: activeProject.id,
                messages: updatedHistory,
                schema_sql: currentSchema,
                completed_pillars: newPillars
            });
            if (savedId) setSessionId(savedId);

        } catch (e) {
            console.error("Interaction Failed:", e);
            setMessages(prev => [...prev, { role: 'model', text: "System Failure: Connection Interrupted." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleCommit = async () => {
        if (!activeProject) return;
        if (!confirm("This will lock the current SCHEMA.sql into the Vault. Proceed?")) return;

        try {
            const { data: existing } = await supabase
                .from('documents')
                .select('id')
                .eq('project_id', activeProject.id)
                .eq('type', 'SCHEMA')
                .single();

            if (existing) {
                await supabase.from('documents').update({ content: schemaSql }).eq('id', existing.id);
            } else {
                await supabase.from('documents').insert({
                    project_id: activeProject.id,
                    type: 'SCHEMA',
                    content: schemaSql
                });
            }
            // Update Stage
            // @ts-ignore
            await supabase.from('projects').update({ current_stage: 'CONSTRUCTION' }).eq('id', activeProject.id);
            alert("Schema Committed. Substructure Phase Complete.");
        } catch (e) {
            console.error("Failed to save schema", e);
            alert("Save Failed.");
        }
    };

    const handleReset = async () => {
        if (!activeProject) return;
        if (!confirm("Are you sure you want to CLEAR this session? This will delete all chat history and the current schema draft. This action cannot be undone.")) return;

        setLoading(true);
        await deleteSubstructureSession(activeProject.id);

        // Reset Local State
        setSessionId(undefined);
        setMessages([]);
        setSchemaSql("-- awaiting_architect_input...");
        setCompletedPillars([]);
        setStarted(false);
        setLoading(false);
        alert("Session Cleared.");
    };

    return (
        <div className="flex h-full gap-6 overflow-hidden">

            {/* Visualizer Modal */}
            <SchemaVisualizer
                sql={schemaSql}
                isOpen={showVisualizer}
                onClose={() => setShowVisualizer(false)}
            />

            {/* COLUMN 1: SCHEMA ROADMAP */}
            <aside className="w-64 flex flex-col gap-6 shrink-0 border-r border-zinc-800 pr-4">
                <StageNavigator
                    title="Schema Roadmap"
                    icon={Database}
                    items={PILLARS}
                    completedIds={completedPillars}
                />
                <div className="mt-auto p-4 bg-[#020402] border border-emerald-500/20 rounded-md">
                    <p className="text-[11px] text-emerald-500/70 leading-relaxed italic">
                        "I enforce strict 3NF normalization and mandated RLS policies on all public tables."
                    </p>
                </div>
            </aside>

            {/* COLUMN 2: CONSULTATION FEED (CENTER) */}
            <section className="flex-1 flex flex-col border border-zinc-800 rounded-lg bg-[#000000] relative overflow-hidden">

                <div className="absolute top-0 left-0 right-0 p-3 bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-800 z-10 flex justify-between items-center">
                    <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-emerald-500" />
                        SQL Terminal
                    </span>

                    <div className="flex items-center gap-2">
                        {started && (
                            <>
                                <button
                                    onClick={() => setShowVisualizer(true)}
                                    className="p-1.5 text-zinc-500 hover:text-emerald-500 transition-colors"
                                    title="Visualize Schema"
                                >
                                    <Network className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="p-1.5 text-zinc-500 hover:text-red-500 transition-colors"
                                    title="Clear Session"
                                >
                                    <TrashCan className="h-4 w-4" />
                                </button>
                            </>
                        )}

                        {!started ? (
                            <button
                                onClick={handleStart}
                                className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded transition-colors font-mono whitespace-nowrap"
                            >
                                Initialize
                            </button>
                        ) : (
                            <button
                                onClick={handleCommit}
                                className="text-xs bg-zinc-900 border border-zinc-700 hover:border-emerald-500 hover:text-emerald-400 text-zinc-400 px-3 py-1 rounded transition-colors font-mono uppercase tracking-wider flex items-center gap-2"
                            >
                                <Locked className="h-3 w-3" /> Commit Schema
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Content Area - Chat Only */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 pt-14 scrollbar-thin scrollbar-thumb-zinc-800">
                    {!started && (
                        <div className="h-[60vh] flex flex-col items-center justify-center text-zinc-600 opacity-50">
                            <Database className="h-16 w-16 mb-6" />
                            <p className="text-sm font-mono tracking-wider">AWAITING CONNECTION...</p>
                        </div>
                    )}

                    {messages.map((m, i) => (
                        <div key={i} className={cn("flex flex-col gap-1 max-w-3xl", m.role === 'user' ? "ml-auto items-end" : "items-start")}>
                            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">
                                {m.role === 'user' ? 'ARCHITECT' : 'DB_ENGINEER'}
                            </span>
                            <div className={cn(
                                "text-sm leading-relaxed p-0 bg-transparent whitespace-pre-wrap font-mono",
                                m.role === 'user' ? "text-zinc-300 text-right" : "text-emerald-400"
                            )}>
                                {m.text}
                            </div>
                            {m.consultantRecommendation && (
                                <div className="mt-2 w-full max-w-lg bg-emerald-950/20 border border-emerald-500/20 rounded p-4">
                                    <p className="text-xs text-emerald-500 mb-3 border-l-2 border-emerald-500 pl-2">{m.consultantRecommendation.context}</p>
                                    <div className="grid gap-2">
                                        {(() => {
                                            // Client-side enforcement: Only the FIRST option marked as recommended gets the badge
                                            let hasShownRec = false;
                                            return m.consultantRecommendation.options.map(opt => {
                                                const isRec = opt.recommended && !hasShownRec;
                                                if (isRec) hasShownRec = true;

                                                return (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => handleSend(`Selected Option: ${opt.label}`)}
                                                        className={cn(
                                                            "text-left text-xs p-3 border rounded transition-colors group flex flex-col gap-1 relative overflow-hidden",
                                                            isRec
                                                                ? "bg-emerald-900/20 border-emerald-500/50 hover:bg-emerald-900/30"
                                                                : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                                                        )}
                                                    >
                                                        <div className="flex justify-between items-start w-full">
                                                            <span className={cn(
                                                                "font-bold block mb-1",
                                                                isRec ? "text-emerald-400" : "text-zinc-300 group-hover:text-emerald-400"
                                                            )}>
                                                                {opt.label}
                                                            </span>
                                                            {isRec && (
                                                                <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                                                                    Recommended
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className={cn(
                                                            "block",
                                                            isRec ? "text-emerald-200/80" : "text-zinc-500"
                                                        )}>
                                                            {opt.description}
                                                        </span>
                                                    </button>
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {loading && <div className="text-xs font-mono text-zinc-600 animate-pulse">&gt; Processing_Request...</div>}
                </div>

                {/* Input Area */}
                <div className="p-3 border-t border-zinc-800 bg-zinc-950">
                    <div className="relative">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Execute command..."
                            rows={1}
                            className="w-full bg-black border border-zinc-800 text-emerald-500/90 text-sm p-3 pr-10 rounded-md focus:outline-none focus:border-emerald-500/30 placeholder:text-zinc-700 font-mono resize-none overflow-hidden max-h-60"
                            disabled={!started || loading}
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!started || loading}
                            className="absolute right-2 top-2 p-1 text-zinc-500 hover:text-emerald-500 disabled:opacity-50"
                        >
                            <SendFilled className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </section>

            {/* COLUMN 3: RIGHT PANEL (Tabs: Foundation vs Directive) */}
            <aside className="w-[450px] shrink-0 flex flex-col gap-0 border border-zinc-800 rounded-lg overflow-hidden bg-[#020402]">
                {/* Right Tabs */}
                <div className="flex border-b border-zinc-800 bg-zinc-900/50">
                    <button
                        onClick={() => setView('SCHEMA')}
                        className={cn(
                            "flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                            view === 'SCHEMA' ? "bg-[#020402] text-emerald-400 border-t-2 border-emerald-500" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                        )}
                    >
                        <Code className="h-4 w-4" /> Foundation
                    </button>
                    <button
                        onClick={() => setView('STRATEGY')}
                        className={cn(
                            "flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                            view === 'STRATEGY' ? "bg-[#020402] text-emerald-400 border-t-2 border-emerald-500" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                        )}
                    >
                        <FileText className="h-4 w-4" /> Directive
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden relative">
                    {/* FOUNDATION: SCHEMA.SQL */}
                    {view === 'SCHEMA' && (
                        <div className="absolute inset-0 p-4 overflow-auto scrollbar-thin scrollbar-thumb-zinc-800">
                            <div className="font-mono text-xs text-emerald-100/80 leading-relaxed whitespace-pre">
                                {schemaSql}
                            </div>
                        </div>
                    )}

                    {/* DIRECTIVE: STRATEGY */}
                    {view === 'STRATEGY' && (
                        <DraftViewer
                            title="Strategic Directive"
                            content={strategyContent}
                            status={strategyContent.includes("WARNING") ? 'DRAFTING' : 'LOCKED'}
                            canPublish={false}
                            className="h-full border-none rounded-none w-full"
                        />
                    )}
                </div>
            </aside>

        </div>
    );
}
