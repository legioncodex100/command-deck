"use client";

import { useState, useEffect, useRef } from "react";
import { useProject } from "@/hooks/useProject";
import { useAuth } from "@/hooks/useAuth";
import { StrategyPillar, sendStrategyMessage } from "@/services/strategy";
import { loadStrategySession, saveStrategySession } from "@/services/strategy_persistence";
import { CenterCircle, SendFilled, Locked, CheckmarkFilled, RadioButton, Document, Idea, Scales, MachineLearningModel, Restart, Activity } from "@carbon/icons-react";
import { DraftViewer } from "@/components/DraftViewer";
import { StageNavigator } from "@/components/StageNavigator";
import { cn } from "@/lib/utils";
import { supabase } from "@/services/supabase";

// Mock Pillars for Checklist Visuals
const PILLARS: { id: StrategyPillar; label: string }[] = [
    { id: 'TENANCY', label: 'Tenancy & Isolation' },
    { id: 'STATE', label: 'State Management' },
    { id: 'BOUNDARIES', label: 'API Boundaries' },
    { id: 'PRIVACY', label: 'Data Privacy' },
    { id: 'INFRASTRUCTURE', label: 'Infrastructure' }
];

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    // Enhanced fields for rich UI
    decisionCard?: { title: string, rationale: string, status: string };
    consultantRecommendation?: {
        context: string;
        options: { id: string, label: string, description: string, recommended: boolean }[];
        selectedId?: string;
    };
}

type ComplexityMode = 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';

export default function StrategyRoom() {
    const { activeProject, documents } = useProject();
    const { user } = useAuth();

    // State
    const [sessionId, setSessionId] = useState<string | undefined>(undefined);
    const [complexity, setComplexity] = useState<ComplexityMode>('INTERMEDIATE');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [draft, setDraft] = useState("# Technical Strategy\n\n*Determined via Socratic Consultation*");
    const [completedPillars, setCompletedPillars] = useState<StrategyPillar[]>([]);
    const [started, setStarted] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Load Session Persistence
    useEffect(() => {
        if (!activeProject) return;

        async function load() {
            const saved = await loadStrategySession(activeProject!.id);
            if (saved) {
                setSessionId(saved.id);
                setMessages(saved.messages);
                setDraft(saved.current_draft);
                // Need to cast the string[] back to StrategyPillar[] safely
                setCompletedPillars(saved.completed_pillars as StrategyPillar[]);
                setComplexity(saved.last_persona as ComplexityMode);
                setStarted(true);
            }
        }
        load();
    }, [activeProject]);

    // Auto-scroll chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleStart = async () => {
        if (!activeProject) return;
        setStarted(true);
        setLoading(true);

        // Fetch PRD
        const prd = documents.find(d => d.type === 'PRD');
        const prdContent = prd?.content || "No PRD found. Please proceed with general questions.";

        // Initial Greeting
        try {
            const response = await sendStrategyMessage("Hello. I am ready to define the technical strategy.", [], prdContent, complexity);

            const initialMsg: ChatMessage = { role: 'model', text: response.message };
            setMessages([initialMsg]);

            if (response.draftUpdate) setDraft(response.draftUpdate);

            // Init session logic
            const id = await saveStrategySession({
                project_id: activeProject.id,
                messages: [initialMsg],
                current_draft: response.draftUpdate || draft,
                completed_pillars: [],
                last_persona: complexity
            });
            if (id) setSessionId(id);

        } catch (e) {
            setMessages([{ role: 'model', text: "Connection failed. Please ensure your API Key is valid." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        if (!activeProject || !confirm("Are you sure you want to completely restart? This will clear the current strategy session.")) return;

        setMessages([]);
        setDraft("# Technical Strategy\n\n*Determined via Socratic Consultation*");
        setCompletedPillars([]);
        setStarted(false);
        setSessionId(undefined); // Clearing this will make saveStrategySession find the existing one and overwrite it effectively
    };

    const handleSend = async (textOverride?: string, historyOverride?: ChatMessage[]) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim() || loading || !activeProject) return;

        const prd = documents.find(d => d.type === 'PRD');
        const prdContent = prd?.content || "No PRD available.";

        const newUserMsg: ChatMessage = { role: 'user', text: textToSend };
        // Use historyOverride if provided, otherwise use current state
        const historyBase = historyOverride || messages;
        const newHistory = [...historyBase, newUserMsg];

        setMessages(newHistory);
        if (!textOverride) setInput("");
        setLoading(true);

        try {
            // Include history (strip rich fields for prompt efficiency if needed, but current implementation expects {role, text})
            const simpleHistory = newHistory.map(m => ({ role: m.role, text: m.text }));

            const response = await sendStrategyMessage(
                newUserMsg.text,
                simpleHistory,
                prdContent,
                complexity
            );

            const aiMsg: ChatMessage = {
                role: 'model',
                text: response.message,
                decisionCard: undefined, // Service doesn't return this yet
                consultantRecommendation: response.consultantRecommendation
            };

            const updatedHistory = [...newHistory, aiMsg];
            setMessages(updatedHistory);

            if (response.draftUpdate) setDraft(response.draftUpdate);

            // Explicitly set completed pillars from AI response
            let newCompletedPillars = [...completedPillars];
            // @ts-ignore
            if (response.completedPillars && Array.isArray(response.completedPillars)) {
                // @ts-ignore
                response.completedPillars.forEach(pId => {
                    const id = pId.toUpperCase() as StrategyPillar;
                    if (PILLARS.some(p => p.id === id) && !newCompletedPillars.includes(id)) {
                        newCompletedPillars.push(id);
                    }
                });
                setCompletedPillars(newCompletedPillars);
            }

            // Valid Session ID check before saving
            // If we don't have a session ID yet (rare if started, but possible if loaded null), we let save create it.
            const savedId = await saveStrategySession({
                id: sessionId,
                project_id: activeProject.id,
                messages: updatedHistory,
                current_draft: response.draftUpdate || draft,
                completed_pillars: newCompletedPillars,
                last_persona: complexity
            });
            if (savedId) setSessionId(savedId);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectOption = (optionId: string, optionLabel: string) => {
        // Find the last message with a recommendation and mark it as selected
        const updatedHistory = [...messages];
        const lastRecIndex = updatedHistory.findLastIndex(m => m.consultantRecommendation);

        if (lastRecIndex !== -1) {
            updatedHistory[lastRecIndex] = {
                ...updatedHistory[lastRecIndex],
                consultantRecommendation: {
                    ...updatedHistory[lastRecIndex].consultantRecommendation!,
                    selectedId: optionId
                }
            };
        }

        // Pass the updated history to handleSend so it persists correctly
        handleSend(`I select choice: "${optionLabel}". Proceed.`, updatedHistory);
    };

    const isReadyToPublish = completedPillars.length >= 3;

    const handlePublish = async () => {
        if (!isReadyToPublish) {
            alert("Not ready to publish. Please complete at least 3 strategy pillars.");
            return;
        }
        if (!activeProject) {
            alert("No active project found. Please ensure a project is selected.");
            return;
        }

        try {
            console.log("Publishing Strategy for Project:", activeProject.id);

            const { data: existing, error: fetchError } = await supabase
                .from('documents')
                .select('id')
                .eq('project_id', activeProject.id)
                .eq('type', 'STRATEGY')
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "Row not found"
                console.error("Error fetching existing strategy:", fetchError);
                throw fetchError;
            }

            // Extract Title and Summary
            const title = draft.split('\n')[0]
                .replace(/^#+\s*/, '')
                .replace(/\.md$/i, '')
                .trim() || "Strategic Framework";
            const summary = draft.replace(/^#.*\n/, '').trim().slice(0, 150) + "...";

            if (existing) {
                console.log("Updating existing strategy document:", existing.id);
                const { error: updateError } = await supabase.from('documents').update({
                    content: draft,
                    title,
                    summary
                }).eq('id', existing.id);

                if (updateError) throw updateError;
            } else {
                console.log("Inserting new strategy document");
                const { error: insertError } = await supabase.from('documents').insert({
                    project_id: activeProject.id,
                    type: 'STRATEGY',
                    content: draft,
                    title,
                    summary
                });

                if (insertError) throw insertError;
            }
            alert("Strategy published to Vault.");
        } catch (e: any) {
            console.error("Failed to publish strategy", e);
            const msg = e?.message || e?.error_description || (typeof e === 'string' ? e : JSON.stringify(e));
            alert(`Failed to publish strategy: ${msg}`);
        }
    };

    return (
        <div className="flex h-full gap-6 overflow-hidden">

            {/* COLUMN 1: Socratic Checklist */}
            <aside className="w-64 flex flex-col gap-6 shrink-0 border-r border-zinc-800 pr-4">
                <StageNavigator
                    title="Objectives"
                    icon={CenterCircle}
                    items={PILLARS}
                    completedIds={completedPillars}
                />

                <div className="mt-auto flex flex-col gap-3">
                    <div className="p-3 bg-[#020402] border border-emerald-500/20 rounded-md">
                        <label className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest mb-2 block flex items-center gap-2">
                            <Activity className="h-3 w-3" /> Consultant Mode
                        </label>
                        <div className="grid grid-cols-1 gap-1">
                            {(['BEGINNER', 'INTERMEDIATE', 'EXPERT'] as ComplexityMode[]).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setComplexity(mode)}
                                    className={cn(
                                        "text-xs px-2 py-1.5 rounded-sm text-left transition-all font-mono uppercase tracking-wider",
                                        complexity === mode
                                            ? "bg-emerald-900/40 text-emerald-400 border-l-2 border-emerald-500 font-bold"
                                            : "text-emerald-700/60 hover:text-emerald-400 hover:bg-emerald-900/20 border-l-2 border-transparent"
                                    )}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 bg-[#020402] border border-emerald-500/20 rounded-md">
                        <p className="text-[11px] text-emerald-500/70 leading-relaxed italic">
                            {complexity === 'BEGINNER' && "I will explain concepts simply using analogies."}
                            {complexity === 'INTERMEDIATE' && "We will focus on pragmatic implementation."}
                            {complexity === 'EXPERT' && "I will strictly challenge edge cases and trade-offs."}
                        </p>
                    </div>
                </div>
            </aside>

            {/* COLUMN 2: Chat Feed (The Cockpit) */}
            <section className="flex-1 flex flex-col border border-zinc-800 rounded-lg bg-[#000000] relative">
                <div className="absolute top-0 left-0 right-0 p-3 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800 z-10 flex justify-between items-center">
                    <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                        <Activity className="h-3 w-3 text-emerald-500" />
                        Consultation Feed
                    </span>
                    <div className="flex items-center gap-2">
                        {started && (
                            <button
                                onClick={handleReset}
                                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 px-2 py-1 rounded transition-colors flex items-center gap-1"
                                title="Start Over"
                            >
                                <Restart className="h-3 w-3" />
                            </button>
                        )}
                        {!started && (
                            <button
                                onClick={handleStart}
                                className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded transition-colors"
                            >
                                Initialize Session
                            </button>
                        )}
                    </div>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 mt-10 scrollbar-thin scrollbar-thumb-zinc-800">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50">
                            <CenterCircle className="h-12 w-12 mb-4" />
                            <p className="text-sm font-mono">Waiting to initialize strategy sequence...</p>
                        </div>
                    )}

                    {messages.map((m, i) => (
                        <div key={i} className={cn("flex flex-col gap-1 max-w-3xl", m.role === 'user' ? "ml-auto items-end" : "items-start")}>
                            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">
                                {m.role === 'user' ? 'ARCHITECT' : 'CONSULTANT'}
                            </span>

                            {/* Standard Text Bubble */}
                            <div className={cn(
                                "text-sm leading-relaxed p-0 bg-transparent whitespace-pre-wrap",
                                m.role === 'user' ? "text-zinc-300 text-right" : "text-emerald-50/90"
                            )}>
                                {m.text}
                            </div>

                            {/* DECISION CARD */}
                            {m.decisionCard && (
                                <div className="mt-3 bg-emerald-950/20 border border-emerald-500/20 rounded-md p-4 w-full">
                                    <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                        <Scales className="h-4 w-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Decision Recorded</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-emerald-100 mb-1">{m.decisionCard.title}</h4>
                                    <p className="text-xs text-emerald-200/70 leading-relaxed font-mono">{m.decisionCard.rationale}</p>
                                </div>
                            )}

                            {/* RICHER RECOMMENDATION CARD (Multi-Option) - Matches Discovery */}
                            {m.consultantRecommendation && (
                                <div className="mt-4 w-full bg-emerald-950/30 border border-emerald-500/20 rounded-lg overflow-hidden">
                                    <div className="p-3 bg-emerald-900/20 border-b border-emerald-500/20 flex items-center gap-2">
                                        <MachineLearningModel className="h-4 w-4 text-emerald-400" />
                                        <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Strategic Recommendation</span>
                                    </div>

                                    <div className="p-4 space-y-4">
                                        <p className="text-xs text-emerald-200/80 italic border-l-2 border-emerald-500/50 pl-3">
                                            "{m.consultantRecommendation.context}"
                                        </p>

                                        <div className="grid grid-cols-1 gap-3">
                                            {m.consultantRecommendation.options.filter(opt =>
                                                // If selectedId exists, only show the selected one. Else show all.
                                                m.consultantRecommendation!.selectedId
                                                    ? opt.id === m.consultantRecommendation!.selectedId
                                                    : true
                                            ).map((opt) => (
                                                <div key={opt.id} className={cn(
                                                    "p-3 rounded border transition-all text-left group",
                                                    m.consultantRecommendation!.selectedId
                                                        ? "bg-emerald-500/20 border-emerald-500/50" // Selected State
                                                        : (opt.recommended
                                                            ? "bg-emerald-500/10 border-emerald-500/40 hover:bg-emerald-500/20"
                                                            : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700")
                                                )}>
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className={cn(
                                                            "text-xs font-bold",
                                                            m.consultantRecommendation!.selectedId ? "text-emerald-400" : (opt.recommended ? "text-emerald-300" : "text-zinc-400")
                                                        )}>
                                                            {opt.label}
                                                        </span>
                                                        {m.consultantRecommendation!.selectedId
                                                            ? <CheckmarkFilled className="h-4 w-4 text-emerald-500" />
                                                            : (opt.recommended && <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-mono">PREFERRED</span>)
                                                        }
                                                    </div>
                                                    <p className={cn(
                                                        "text-[11px] mb-3 leading-relaxed",
                                                        m.consultantRecommendation!.selectedId ? "text-emerald-200/70" : "text-zinc-500"
                                                    )}>
                                                        {opt.description}
                                                    </p>
                                                    {!m.consultantRecommendation!.selectedId && (
                                                        <button
                                                            onClick={() => handleSelectOption(opt.id, opt.label)}
                                                            disabled={loading}
                                                            className={cn(
                                                                "w-full py-1.5 text-[10px] font-bold uppercase tracking-wider rounded border transition-colors flex items-center justify-center gap-2",
                                                                opt.recommended
                                                                    ? "bg-emerald-600 hover:bg-emerald-500 text-white border-transparent"
                                                                    : "bg-transparent border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"
                                                            )}
                                                        >
                                                            {loading ? "..." : "Select Option"}
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {m.role === 'model' && <div className="h-px w-full bg-zinc-900 my-4" />}
                        </div>
                    ))}
                    {loading && <div className="text-xs font-mono text-zinc-500 animate-pulse">Consultant is thinking...</div>}
                </div>

                <div className="p-3 border-t border-zinc-800 bg-zinc-950">
                    <div className="relative">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type your technical decision..."
                            className="w-full bg-black border border-zinc-800 text-zinc-300 text-sm p-3 pr-10 rounded-md focus:outline-none focus:border-zinc-600 placeholder:text-zinc-700 font-mono"
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

            {/* COLUMN 3: Intelligence Panel (Live Draft) */}
            <DraftViewer
                title="Live Strategy Draft"
                content={draft}
                status={isReadyToPublish ? 'DRAFTING' : 'DRAFTING'}
                canPublish={isReadyToPublish}
                onPublish={handlePublish}
            />

        </div>
    );
}
