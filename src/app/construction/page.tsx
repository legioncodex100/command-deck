"use client";

import { useState, useEffect } from "react";
import { useProject } from "@/hooks/useProject";
import { breakdownPhases, generatePilotScript } from "@/services/construction";
import { supabase } from "@/services/supabase";
import { updateInstructionsFile } from "@/app/actions/files";
import { Loader2, Hammer, ClipboardList, CheckCircle, RotateCw, FileCode, ArrowRight, Lock, Database, FileText, Cpu, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { RecommendationBanner } from "@/components/RecommendationBanner";

export default function ConstructionFactory() {
    const { activeProject, activeProjectId, updateStage } = useProject();

    // State
    const [backlogItems, setBacklogItems] = useState<string[]>([]);
    const [selectedTask, setSelectedTask] = useState<string | null>(null);
    const [pilotScript, setPilotScript] = useState("");
    const [isInitializing, setIsInitializing] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // UI State
    const [activeContextTab, setActiveContextTab] = useState<'SCHEMA' | 'STRATEGY' | 'PRD'>('SCHEMA');

    // Context Data
    const [contextData, setContextData] = useState<{ prd: string, schema: string, strategy: string, design: string } | null>(null);

    // Stage Gate
    const isLocked = !activeProject || (activeProject.current_stage !== 'CONSTRUCTION' && activeProject.current_stage !== 'AUDIT' && activeProject.current_stage !== 'HANDOVER' && activeProject.current_stage !== 'MAINTENANCE');

    useEffect(() => {
        if (!activeProjectId) return;
        loadContext();
    }, [activeProjectId]);

    const loadContext = async () => {
        if (!activeProjectId) return;

        // Parallel Fetching
        const [prdReq, designReq, strategyReq, schemaReq, backlogReq] = await Promise.all([
            supabase.from('documents').select('content').eq('project_id', activeProjectId).eq('type', 'PRD').order('created_at', { ascending: false }).limit(1).single(),
            supabase.from('documents').select('content').eq('project_id', activeProjectId).eq('type', 'DESIGN').order('created_at', { ascending: false }).limit(1).single(),
            supabase.from('documents').select('content').eq('project_id', activeProjectId).eq('type', 'STRATEGY').order('created_at', { ascending: false }).limit(1).single(),
            supabase.from('blueprints').select('content').eq('project_id', activeProjectId).order('version', { ascending: false }).limit(1).single(),
            supabase.from('documents').select('content').eq('project_id', activeProjectId).eq('type', 'BACKLOG').order('created_at', { ascending: false }).limit(1).single()
        ]);

        const schemaContent = schemaReq.data?.content;
        let schemaText = "No Schema found.";

        if (schemaContent) {
            if (typeof schemaContent === 'string') {
                schemaText = schemaContent;
            } else if (schemaContent.sql) {
                schemaText = schemaContent.sql;
            } else {
                schemaText = JSON.stringify(schemaContent, null, 2);
            }
        }

        setContextData({
            prd: prdReq.data?.content || "No PRD found.",
            design: designReq.data?.content || "No Design found.",
            strategy: strategyReq.data?.content || "No Strategy found.",
            schema: schemaText
        });

        // Load Backlog if exists
        if (backlogReq.data?.content) {
            try {
                // Try JSON first
                setBacklogItems(JSON.parse(backlogReq.data.content));
            } catch {
                // Fallback text parsing
                const items = backlogReq.data.content.split('\n').filter(l => l.trim().length > 0);
                setBacklogItems(items);
            }
        }
    };

    const handleInitializeBacklog = async () => {
        if (!contextData) return;
        setIsInitializing(true);
        try {
            // 1. Generate Breakdown
            const list = await breakdownPhases(contextData.prd);
            setBacklogItems(list);

            // 2. Save as BACKLOG Doc
            await supabase.from('documents').insert({
                project_id: activeProjectId!,
                type: 'BACKLOG',
                content: JSON.stringify(list, null, 2),
                title: 'Construction Backlog',
                summary: 'Atomic phases for construction.'
            });

            if (list.length > 0) setSelectedTask(list[0]);
        } catch (e) {
            console.error(e);
            alert("Failed to initialize backlog.");
        } finally {
            setIsInitializing(false);
        }
    };

    const handleGenerateScript = async () => {
        if (!selectedTask || !contextData) return;
        setIsGenerating(true);
        try {
            const script = await generatePilotScript(selectedTask, contextData);
            setPilotScript(script);
        } catch (e) {
            console.error(e);
            alert("Failed to generate pilot script.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePrepareAgent = async () => {
        if (!pilotScript) return;
        setIsSyncing(true);
        try {
            // 1. Sync file to local disk (via server action)
            await updateInstructionsFile(pilotScript);

            // 2. Overwrite INSTRUCTIONS doc in DB (Single Source of Truth)
            // First check if exists
            const { data: existing } = await supabase.from('documents').select('id').eq('project_id', activeProjectId!).eq('type', 'INSTRUCTIONS').single();

            if (existing) {
                await supabase.from('documents').update({
                    content: pilotScript,
                    title: `Work Order: ${selectedTask}`,
                    summary: `Directives for ${selectedTask}`
                }).eq('id', existing.id);
            } else {
                await supabase.from('documents').insert({
                    project_id: activeProjectId!,
                    type: 'INSTRUCTIONS',
                    content: pilotScript,
                    title: `Work Order: ${selectedTask}`,
                    summary: `Directives for ${selectedTask}`
                });
            }

            alert("Agent Instructions Updated! Execute with: @Agent Please execute Phase 12.6...");
        } catch (e) {
            console.error(e);
            alert("Sync failed.");
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 gap-6 max-w-[1600px] mx-auto overflow-hidden">
            <header className="mb-2 shrink-0">
                <div className="text-sm font-medium text-emerald-500/80 mb-1 font-mono tracking-wider">PHASE 4 // CONSTRUCTION</div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-white">
                    <Hammer className="h-8 w-8 text-orange-500" />
                    Construction Factory
                </h1>
                <p className="text-zinc-400">Transform blueprints into executable Pilot Scripts for autonomous agents.</p>
            </header>

            {isLocked && (
                <RecommendationBanner
                    title="Prerequisites Missing"
                    description="Ensure Schema and Strategy are finalized before beginning Construction."
                    linkHref="/substructure"
                    linkText="Go to Substructure"
                />
            )}

            <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">

                {/* COLUMN 1: Build Queue (Backlog) - 25% */}
                <div className="col-span-3 bg-[#0a0a0a] border border-zinc-800 rounded-xl flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-zinc-800 bg-[#050505] flex justify-between items-center">
                        <h2 className="font-semibold text-zinc-100 flex items-center gap-2">
                            <ClipboardList className="h-4 w-4 text-emerald-500" />
                            Build Queue
                        </h2>
                        {backlogItems.length === 0 && (
                            <button
                                onClick={handleInitializeBacklog}
                                disabled={isInitializing || !contextData}
                                className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded flex items-center gap-1 transition-colors"
                            >
                                {isInitializing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCw className="h-3 w-3" />}
                                Initialize
                            </button>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {backlogItems.length === 0 ? (
                            <div className="text-xs text-zinc-500 text-center mt-10 px-4">
                                No build plan detected.<br />Initialize to decompose functionality.
                            </div>
                        ) : (
                            backlogItems.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedTask(item)}
                                    className={cn(
                                        "w-full text-left p-3 rounded border text-sm transition-all flex items-center gap-3",
                                        selectedTask === item
                                            ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-100"
                                            : "bg-transparent border-transparent hover:bg-zinc-900 text-zinc-400"
                                    )}
                                >
                                    <div className={cn(
                                        "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-mono border",
                                        selectedTask === item ? "border-emerald-500 text-emerald-500" : "border-zinc-700 text-zinc-600"
                                    )}>
                                        {idx + 1}
                                    </div>
                                    <span className="truncate">{item.replace(/^\d+\.\s*/, '')}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* COLUMN 2: Script Workbench - 50% */}
                <div className="col-span-6 bg-[#0a0a0a] border border-zinc-800 rounded-xl flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-zinc-800 bg-[#050505] flex justify-between items-center">
                        <h2 className="font-semibold text-zinc-100 flex items-center gap-2">
                            <Terminal className="h-4 w-4 text-blue-500" />
                            Pilot Script Terminal
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={handleGenerateScript}
                                disabled={isGenerating || !selectedTask}
                                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                            >
                                {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Cpu className="h-3 w-3" />}
                                Generate Script
                            </button>
                            <button
                                onClick={handlePrepareAgent}
                                disabled={isSyncing || !pilotScript}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                            >
                                {isSyncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowRight className="h-3 w-3" />}
                                Prepare for Agent
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 bg-[#020402] p-4 overflow-y-auto relative font-mono text-sm">
                        {pilotScript ? (
                            <pre className="whitespace-pre-wrap text-emerald-100/90 leading-relaxed">
                                {pilotScript}
                            </pre>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 gap-2">
                                <Terminal className="h-8 w-8 opacity-20" />
                                <p className="text-xs">Select a task and generate a script to begin.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUMN 3: Context Panel - 25% */}
                <div className="col-span-3 bg-[#0a0a0a] border border-zinc-800 rounded-xl flex flex-col overflow-hidden">
                    <div className="flex border-b border-zinc-800">
                        {(['SCHEMA', 'STRATEGY', 'PRD'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveContextTab(tab)}
                                className={cn(
                                    "flex-1 py-3 text-xs font-medium border-b-2 transition-colors",
                                    activeContextTab === tab
                                        ? "border-emerald-500 text-emerald-400 bg-emerald-950/10"
                                        : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 bg-[#050505]">
                        {contextData ? (
                            <pre className="whitespace-pre-wrap text-xs text-zinc-400 font-mono leading-relaxed">
                                {activeContextTab === 'SCHEMA' && (contextData.schema || "No Schema data.")}
                                {activeContextTab === 'STRATEGY' && (contextData.strategy || "No Strategy data.")}
                                {activeContextTab === 'PRD' && (contextData.prd || "No PRD data.")}
                            </pre>
                        ) : (
                            <div className="flex items-center justify-center h-full text-zinc-600">
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
