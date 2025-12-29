
"use client";

import React, { useState, useEffect } from 'react';
import { Layers, FileText, Rocket, ArrowRight, CheckCheck, AlertCircle } from 'lucide-react';
import { useProject } from '@/hooks/useProject';
import { useSprint } from '@/hooks/useSprint';
import { cn } from '@/lib/utils';
import { PlanningChat } from './planning/PlanningChat';
import { RequirementFeed } from './planning/RequirementFeed';
import { BacklogMapper } from './planning/BacklogMapper';
import { BacklogPreview } from './planning/BacklogPreview';
import { saveBacklogSession, loadBacklogSession } from '@/services/planning_persistence';
import { decomposeToBacklog, assessRisks, createRoadmap, evaluateHandover } from '@/services/planning';
import { generateRelayArtifact } from '@/services/relay';
import { checkStaleState } from '@/services/ripple';

export default function Pillar_E_Planning() {
    const { activeProjectId, documents, saveDocument } = useProject();
    const { activeSprint, startSprint, backlogTasks } = useSprint(activeProjectId);

    // UI State
    const [activeTab, setActiveTab] = useState<'CHAT' | 'REQS'>('CHAT');
    const [rightView, setRightView] = useState<'TASKS' | 'DOC'>('TASKS');
    const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

    // Data State
    const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [backlogMarkdown, setBacklogMarkdown] = useState('# Project Backlog\n\nWaiting for decomposition...');

    // Relay State
    const [relayGenerated, setRelayGenerated] = useState(false);

    // Cast documents to any to avoid strict type mismatch with Ripple service for now
    const staleState = checkStaleState('BACKLOG', documents as any);

    // Initial Load
    useEffect(() => {
        if (activeProjectId) {
            loadBacklogSession(activeProjectId).then(session => {
                if (session) {
                    setMessages(session.messages || []);
                    setBacklogMarkdown(session.backlog_artifact || backlogMarkdown);
                } else {
                    // New Session - Auto-Analyze Handover
                    const prd = documents.find(d => d.type === 'PRD')?.content || "";
                    const strategy = documents.find(d => d.type === 'STRATEGY')?.content || "";
                    const design = documents.find(d => d.type === 'RELAY_D')?.content || documents.find(d => d.type === 'DESIGN')?.content || "No Design";

                    if (prd && design) {
                        setIsProcessing(true);
                        evaluateHandover({ prd, strategy, design }).then(greeting => {
                            const newMsgs = [{ role: 'model' as const, text: greeting }];
                            setMessages(newMsgs);
                            // Initial save
                            saveBacklogSession({
                                project_id: activeProjectId,
                                messages: newMsgs,
                                backlog_artifact: backlogMarkdown,
                                risk_log: {},
                                roadmap: {}
                            });
                            setIsProcessing(false);
                        });
                    }
                }
            });
        }
    }, [activeProjectId]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || !activeProjectId) return;

        setIsProcessing(true);
        const newMsgs = [...messages, { role: 'user' as const, text }];
        setMessages(newMsgs);

        try {
            // Context Logic
            const designDoc = documents.find(d => d.type === 'DESIGN')?.content || "No Design Doc";
            const context = `Design Context:\n${typeof designDoc === 'string' ? designDoc : JSON.stringify(designDoc)}\n\nUser Request: ${text}`;

            // Dispatcher Logic (Standardized)
            let result: any;
            if (text.toLowerCase().includes('risk')) {
                result = await assessRisks({
                    prd: documents.find(d => d.type === 'PRD')?.content || "",
                    strategy: documents.find(d => d.type === 'STRATEGY')?.content || "",
                    design: documents.find(d => d.type === 'DESIGN')?.content || ""
                });
            } else if (text.toLowerCase().includes('roadmap')) {
                result = await createRoadmap({
                    prd: documents.find(d => d.type === 'PRD')?.content || "",
                    strategy: documents.find(d => d.type === 'STRATEGY')?.content || "",
                    design: documents.find(d => d.type === 'DESIGN')?.content || ""
                });
            } else {
                // Default: Backlog Decomposition
                result = await decomposeToBacklog({
                    prd: documents.find(d => d.type === 'PRD')?.content || "",
                    strategy: documents.find(d => d.type === 'STRATEGY')?.content || "",
                    design: documents.find(d => d.type === 'DESIGN')?.content || "",
                    schema: documents.find(d => d.type === 'SCHEMA')?.content || ""
                }, []);
            }

            // Response Handling
            const aiMsg = { role: 'model' as const, text: result.message || "Processed." };
            const updatedMsgs = [...newMsgs, aiMsg];
            setMessages(updatedMsgs);

            if (result.backlog_artifact) {
                setBacklogMarkdown(result.backlog_artifact);
                await saveDocument({ project_id: activeProjectId, type: 'BACKLOG', content: result.backlog_artifact, title: 'Backlog Artifact' });
            }

            // Persistence
            await saveBacklogSession({
                project_id: activeProjectId,
                messages: updatedMsgs,
                backlog_artifact: result.backlog_artifact || backlogMarkdown,
                risk_log: {},
                roadmap: {}
            });

        } catch (e) {
            console.error(e);
            setMessages([...newMsgs, { role: 'model' as const, text: "Error processing request." }]);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCreateSprint = async () => {
        if (selectedTasks.length === 0) return;
        if (!activeProjectId) return;

        const date = new Date();
        const sprintName = `Sprint ${date.toISOString().split('T')[0]}`;
        await startSprint(activeProjectId, sprintName, `Sprint focused on ${selectedTasks.length} items`, date, new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), selectedTasks);
        setSelectedTasks([]);
        alert(`Started ${sprintName}!`);
    };

    const handleCompletePhase = async () => {
        if (!activeProjectId || !backlogMarkdown) return;
        if (staleState.isStale && !confirm(`WARNING: ${staleState.reason}\n\nDo you still want to proceed?`)) return;
        if (!confirm("Generate Relay Artifact and Complete Phase E? This will lock the Backlog.")) return;

        setIsProcessing(true);
        try {
            const relay = await generateRelayArtifact({
                currentPhase: 'PLANNING (Pillar E)',
                nextPhase: 'CONSTRUCTION (Pillar F)',
                artifactContent: backlogMarkdown,
                decisions: messages.map(m => m.text).join('\n'),
                previousRelayContent: documents.find(d => d.type === 'RELAY_D')?.content || undefined
            });

            await saveDocument({
                project_id: activeProjectId,
                type: 'RELAY_E',
                content: relay,
                title: 'Handover Relay E->F'
            });

            setRelayGenerated(true);
            alert("Phase E Complete. Relay Artifact Generated.");
        } catch (e) {
            console.error(e);
            alert("Failed to generate relay.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="h-full w-full grid grid-cols-12 gap-0 overflow-hidden bg-[#020402] text-zinc-300 font-mono">

            {/* Col 1: Context/Reqs (20%) - LEFT */}
            <div className="col-span-3 border-r border-[#27272a] flex flex-col bg-black/40 overflow-hidden">
                <div className="flex border-b border-[#27272a] p-3 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    <FileText className="h-4 w-4 text-emerald-500 mr-2" /> Context & Requirements
                </div>
                <div className="flex-1 overflow-hidden relative">
                    <RequirementFeed prd={documents.find(d => d.type === 'PRD')?.content || "No PRD"} />
                </div>
            </div>

            {/* Col 2: Chat (50%) - CENTER */}
            <div className="col-span-6 flex flex-col border-r border-[#27272a] bg-[#0A0A0A] relative overflow-hidden">
                <div className="flex border-b border-[#27272a]">
                    <button
                        className="flex-1 py-3 text-[10px] font-bold uppercase tracking-wider bg-zinc-900 text-indigo-400 border-b-2 border-indigo-500"
                    >
                        PM Uplink
                    </button>
                </div>
                <div className="flex-1 overflow-hidden relative">
                    <PlanningChat
                        messages={messages}
                        isProcessing={isProcessing}
                        onSendMessage={handleSendMessage}
                        onClear={() => setMessages([])}
                    // placeholder="Discuss strategy, risks, or roadmap..." // If PlanningChat supports placeholder
                    />
                </div>
            </div>

            {/* Col 3: Task Mapper / Backlog (30%) - RIGHT */}
            <div className="col-span-3 min-w-0 flex flex-col bg-[#050505] h-full overflow-hidden">
                {/* View Toggles */}
                <div className="flex border-b border-[#27272a] bg-zinc-950 items-center">
                    <button
                        onClick={() => setRightView('TASKS')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors border-r border-[#27272a]",
                            rightView === 'TASKS' ? "bg-zinc-900 text-purple-400" : "text-zinc-600 hover:text-zinc-400"
                        )}
                    >
                        <Layers className="h-3.5 w-3.5" /> Task Map
                    </button>
                    <button
                        onClick={() => setRightView('DOC')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors border-r border-[#27272a]",
                            rightView === 'DOC' ? "bg-zinc-900 text-emerald-400" : "text-zinc-600 hover:text-zinc-400"
                        )}
                    >
                        <FileText className="h-3.5 w-3.5" /> Backlog
                    </button>
                    <div className="px-2">
                        {relayGenerated ? (
                            <CheckCheck className="h-4 w-4 text-emerald-500" />
                        ) : (
                            <button
                                onClick={handleCompletePhase}
                                disabled={isProcessing}
                                className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-emerald-500 transition-colors"
                                title={staleState.isStale ? `Stale: ${staleState.reason}` : "Complete Phase"}
                            >
                                {staleState.isStale ? <AlertCircle className="h-4 w-4 text-amber-500" /> : <ArrowRight className="h-4 w-4" />}
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-hidden relative">
                    {rightView === 'DOC' ? (
                        <BacklogPreview
                            markdown={backlogMarkdown}
                            onSave={async () => {
                                setIsProcessing(true);
                                await saveDocument({ project_id: activeProjectId!, type: 'BACKLOG', content: backlogMarkdown, title: 'Backlog Artifact' });
                                setIsProcessing(false);
                            }}
                            isSaving={isProcessing}
                        />
                    ) : (
                        /* Task Mapper in Right Col */
                        <div className="flex flex-col h-full">
                            <header className="p-3 border-b border-zinc-900 flex justify-between items-center bg-black/60 shadow-sm">
                                {selectedTasks.length > 0 && (
                                    <button
                                        onClick={handleCreateSprint}
                                        className="w-full flex items-center justify-center gap-2 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold uppercase tracking-wider rounded transition-all animate-in fade-in zoom-in duration-300"
                                    >
                                        <Rocket className="h-3 w-3" /> Launch ({selectedTasks.length})
                                    </button>
                                )}
                            </header>
                            {staleState.isStale && (
                                <div className="bg-amber-900/20 border-b border-amber-500/20 p-2 flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide truncate">Ripple: {staleState.reason}</span>
                                </div>
                            )}
                            <div className="flex-1 overflow-auto p-0 min-h-0">
                                <BacklogMapper
                                    tasks={backlogTasks}
                                    isGenerating={isProcessing}
                                    onGenerate={() => handleSendMessage('Decompose strategy to backlog and tasks')}
                                    selectedIds={selectedTasks}
                                    onToggleSelect={(id) => setSelectedTasks(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
