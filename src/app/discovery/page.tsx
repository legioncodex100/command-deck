"use client";

import { useState, useEffect, useRef } from "react";
import { useProject } from "@/hooks/useProject";
import { useAuth } from "@/hooks/useAuth";
import { DiscoveryPhase, sendDiscoveryMessage } from "@/services/discovery";
import { loadDiscoverySession, saveDiscoverySession } from "@/services/discovery_persistence";
import { Search, SendFilled, Locked, CheckmarkFilled, RadioButton, Document, MachineLearningModel, Activity, MagicWandFilled, Restart } from "@carbon/icons-react";
import { DraftViewer } from "@/components/DraftViewer";
import { StageNavigator } from "@/components/StageNavigator";
import { cn } from "@/lib/utils";
import { supabase } from "@/services/supabase";

// Discovery Phases Checklist
const PHASES: { id: DiscoveryPhase; label: string }[] = [
    { id: 'VISION', label: 'Vision & Value' },
    { id: 'AUDIENCE', label: 'Audience & Pain' },
    { id: 'LOGIC', label: 'Core Mechanics' },
    { id: 'FEATURES', label: 'Priority Features' },
    { id: 'EDGE_CASES', label: 'Risks & Edges' }
];

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    consultantRecommendation?: {
        context: string;
        options: { id: string, label: string, description: string, recommended: boolean }[];
        selectedId?: string; // New field to track selection
    };
}

type ComplexityMode = 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';

// Simple Markdown-like Parser for Bold and Italic
const formatText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|__.*?__)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="font-bold text-emerald-400">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('__') && part.endsWith('__')) {
            return <u key={index} className="decoration-emerald-500 underline-offset-2">{part.slice(2, -2)}</u>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={index} className="italic text-emerald-200">{part.slice(1, -1)}</em>;
        }
        return part;
    });
};

export default function DiscoveryLab() {
    const { activeProject, documents } = useProject();

    // State
    const [sessionId, setSessionId] = useState<string | undefined>(undefined);
    const [complexity, setComplexity] = useState<ComplexityMode>('INTERMEDIATE');
    const [currentPhaseStatus, setCurrentPhaseStatus] = useState("AWAITING INITIALIZATION...");

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [prd, setPrd] = useState("# Product Requirements Document\n\n*Drafting in porgress...*");

    // Ref for Auto-Expanding Textarea
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-Resize Effect
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Reset height to recalculate
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);
    const [completedPhases, setCompletedPhases] = useState<DiscoveryPhase[]>([]);

    const [started, setStarted] = useState(false);
    const [showHandover, setShowHandover] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Load Session Persistence
    useEffect(() => {
        if (!activeProject) return;

        async function load() {
            const saved = await loadDiscoverySession(activeProject!.id);
            if (saved) {
                setSessionId(saved.id);
                setMessages(saved.messages);
                setPrd(saved.current_prd);
                setCompletedPhases(saved.completed_phases as DiscoveryPhase[]);
                setComplexity(saved.last_persona as ComplexityMode);
                setStarted(true);
                if (saved.messages.length > 0) {
                    setCurrentPhaseStatus("SESSION RESTORED");
                }
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

        // Manual Injection of the "First Contact" Card
        const initialMsg: ChatMessage = {
            role: 'model',
            text: "Welcome to the Discovery Lab, Architect. To begin, please categorize the nature of this mission.",
            consultantRecommendation: {
                context: "Project Classification",
                options: [
                    { id: "WEB_APP", label: "Web Application", description: "SaaS, Dashboard, Tool", recommended: false },
                    { id: "WEBSITE", label: "Public Website", description: "Marketing, Portfolio, Blog", recommended: false },
                    { id: "MOBILE", label: "Mobile App", description: "iOS, Android, React Native", recommended: false },
                    { id: "GAME", label: "Video Game", description: "Browser, Unity, Godot", recommended: false },
                    { id: "API", label: "Backend API", description: "Middleware, Data Service", recommended: false },
                    { id: "OTHER", label: "Something Else", description: "Free Chat / Unique Project", recommended: false }
                ]
            }
        };

        setMessages([initialMsg]);
        setCurrentPhaseStatus("PHASE 1/5: VISION");

        // Init session logic
        try {
            const id = await saveDiscoverySession({
                project_id: activeProject.id,
                messages: [initialMsg],
                current_prd: prd,
                completed_phases: [],
                last_persona: complexity
            });
            if (id) setSessionId(id);
        } catch (e) {
            console.error("Failed to init session", e);
        }
    };

    const handleReset = async () => {
        if (!activeProject || !confirm("Are you sure you want to completely restart? This will clear the current session.")) return;

        setMessages([]);
        setPrd("# Product Requirements Document\n\n*Drafting in porgress...*");
        setCompletedPhases([]);
        setStarted(false);
        setCurrentPhaseStatus("AWAITING INITIALIZATION...");
        setSessionId(undefined);

        // If we want to clear db, we could, but creating a new session ID on re-start effectively does the same visual reset.
        // We'll just let handleStart create a new row.
    };

    const handleSend = async (textOverride?: string, historyOverride?: ChatMessage[]) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim() || loading || !activeProject) return;

        const newUserMsg: ChatMessage = { role: 'user', text: textToSend };
        // Use historyOverride if provided, otherwise use current state
        const historyBase = historyOverride || messages;
        const newHistory = [...historyBase, newUserMsg];

        setMessages(newHistory);
        if (!textOverride) setInput("");
        setLoading(true);

        try {
            const simpleHistory = newHistory.map(m => ({ role: m.role, text: m.text }));

            const response = await sendDiscoveryMessage(
                newUserMsg.text,
                simpleHistory,
                prd,
                complexity
            );

            const aiMsg: ChatMessage = {
                role: 'model',
                text: response.message,
                consultantRecommendation: response.consultantRecommendation
            };

            const updatedHistory = [...newHistory, aiMsg];
            setMessages(updatedHistory);
            setCurrentPhaseStatus(response.currentPhaseStatus);

            if (response.prdUpdate) setPrd(response.prdUpdate);

            // Explicitly set completed phases
            let newCompletedPhases = [...completedPhases];
            // @ts-ignore
            if (response.completedPhases && Array.isArray(response.completedPhases)) {
                // @ts-ignore
                response.completedPhases.forEach(pId => {
                    const id = pId.toUpperCase() as DiscoveryPhase;
                    if (PHASES.some(p => p.id === id) && !newCompletedPhases.includes(id)) {
                        newCompletedPhases.push(id);
                    }
                });
                setCompletedPhases(newCompletedPhases);
            }

            // Save
            const savedId = await saveDiscoverySession({
                id: sessionId,
                project_id: activeProject.id,
                messages: updatedHistory,
                current_prd: response.prdUpdate || prd,
                completed_phases: newCompletedPhases,
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

    const isReadyToPublish = completedPhases.length >= 3;

    const handlePublish = async () => {
        if (!isReadyToPublish || !activeProject) return;

        try {
            // 1. Save or Update PRD in Documents Table
            const { data: existing } = await supabase
                .from('documents')
                .select('id')
                .eq('project_id', activeProject.id)
                .eq('type', 'PRD')
                .single();

            // Extract Title (first line) and Summary (first 150 chars)
            // Remove markdown headers, file extensions, and extra whitespace
            const title = prd.split('\n')[0]
                .replace(/^#+\s*/, '')
                .replace(/\.md$/i, '')
                .trim() || "Product Manifesto";

            const summary = prd.replace(/^#.*\n/, '').trim().slice(0, 150) + "...";

            if (existing) {
                await supabase.from('documents').update({
                    content: prd,
                    title,
                    summary
                }).eq('id', existing.id);
            } else {
                await supabase.from('documents').insert({
                    project_id: activeProject.id,
                    type: 'PRD',
                    content: prd,
                    title,
                    summary
                });
            }

            // 2. Update Project Stage to STRATEGY
            // @ts-ignore
            await supabase.from('projects').update({ current_stage: 'STRATEGY' }).eq('id', activeProject.id);

            // 3. Show Success Modal
            setShowHandover(true);

        } catch (e) {
            console.error("Failed to publish PRD", e);
            alert("Failed to publish PRD.");
        }
    };

    return (
        <>
            <div className="flex h-full gap-6 overflow-hidden">

                {/* COLUMN 1: Roadmap */}
                <aside className="w-64 flex flex-col gap-6 shrink-0 border-r border-zinc-800 pr-4">
                    <StageNavigator
                        title="Discovery Track"
                        icon={Search}
                        items={PHASES}
                        completedIds={completedPhases}
                    />

                    <div className="mt-auto flex flex-col gap-3">
                        <div className="p-3 bg-[#020402] border border-emerald-500/20 rounded-md">
                            <label className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest mb-2 block flex items-center gap-2">
                                <Activity className="h-3 w-3" /> Analyst Bandwidth
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
                    </div>
                </aside>

                {/* COLUMN 2: Consultation Cockpit */}
                <section className="flex-1 flex flex-col border border-zinc-800 rounded-lg bg-[#000000] relative">

                    {/* Sticky Header */}
                    {/* Sticky Header */}
                    <div className="absolute top-0 left-0 right-0 p-3 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800 z-10 flex justify-between items-center">
                        <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                            <Activity className="h-3 w-3 text-emerald-500" />
                            {currentPhaseStatus}
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
                                    Initialize Discovery
                                </button>
                            )}
                        </div>
                    </div>

                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 mt-12 scrollbar-thin scrollbar-thumb-zinc-800">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50">
                                <MagicWandFilled className="h-12 w-12 mb-4" />
                                <p className="text-sm font-mono">Ready to define the mission...</p>
                            </div>
                        )}

                        {messages.map((m, i) => (
                            <div key={i} className={cn("flex flex-col gap-1 max-w-3xl", m.role === 'user' ? "ml-auto items-end" : "items-start")}>
                                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">
                                    {m.role === 'user' ? 'ARCHITECT' : 'ANALYST'}
                                </span>

                                {/* Standard Text Bubble */}
                                <div className={cn(
                                    "text-sm leading-relaxed p-0 bg-transparent whitespace-pre-wrap",
                                    m.role === 'user' ? "text-zinc-300 text-right" : "text-emerald-50/90"
                                )}>
                                    {formatText(m.text)}
                                </div>

                                {/* RECOMMENDATION CARD (Multi-Option) */}
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
                                                                : (opt.recommended && <span className="text-[10px] bg-emerald-600/80 text-white px-1.5 py-0.5 rounded font-mono">PREFERRED</span>)
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
                        {loading && <div className="text-xs font-mono text-zinc-500 animate-pulse">Analyst is thinking...</div>}
                    </div>

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
                                placeholder="Type your response..."
                                rows={1}
                                className="w-full bg-black border border-zinc-800 text-zinc-300 text-sm p-3 pr-10 rounded-md focus:outline-none focus:border-zinc-600 placeholder:text-zinc-700 font-mono resize-none overflow-hidden max-h-60"
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

                {/* COLUMN 3: PRD Preview */}
                <DraftViewer
                    title="Live PRD Draft"
                    content={prd}
                    status={'DRAFTING'}
                    canPublish={isReadyToPublish}
                    onPublish={handlePublish}
                />

            </div >

            {/* Handover Bridge Modal */}
            {
                showHandover && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="w-full max-w-lg bg-zinc-950 border border-emerald-500/30 rounded-xl overflow-hidden">
                            <div className="p-6 text-center space-y-4">
                                <div className="mx-auto h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 mb-2">
                                    <Locked className="h-8 w-8 text-emerald-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">PRD Locked & Committed</h2>
                                <p className="text-zinc-400 text-sm leading-relaxed max-w-sm mx-auto">
                                    The vision has been crystalized. The mission parameters are set.
                                    It is time to consult the Systems Architect to define the technical strategy.
                                </p>
                            </div>

                            <div className="p-6 bg-zinc-900/50 border-t border-zinc-900 flex flex-col gap-3">
                                <a
                                    href="/strategy"
                                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:bg-emerald-500/90"
                                >
                                    Enter Strategy Room <div className="h-1 w-1 bg-white rounded-full animate-ping" />
                                </a>
                                <button
                                    onClick={() => setShowHandover(false)}
                                    className="w-full py-3 bg-transparent text-zinc-500 hover:text-zinc-300 text-xs uppercase tracking-wider font-medium"
                                >
                                    Stay in Discovery
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}
