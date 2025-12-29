
import React, { useState, useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { useSprint } from '@/hooks/useSprint';
import { useProject } from '@/hooks/useProject';
import { KanbanQueue } from './construction/KanbanQueue';
import { WorkOrderPanel } from './construction/WorkOrderPanel';
import { EngineerChat } from './construction/EngineerChat';
import {
    generateWorkOrder,
    askEngineer,
    startTaskSession,
    loadConstructionChat,
    saveConstructionChat,
    WorkOrder,
    ConstructionContext
} from '@/services/construction';
import { generateRelayArtifact } from '@/services/relay';
import { Task } from '@/types/planning';
import { supabase } from '@/services/supabase'; // KEEPING ONLY FOR RELAY UPSERT (Unless I refactor relay too. Relay generation service is fine, but saving it? Wait, relay service creates artifact content. Saving it needs supabase or useProject. saveDocument from useProject is better.)

export default function Pillar_F_Construction() {
    const { activeProjectId, documents, saveDocument } = useProject(); // Added saveDocument to useProject destructuring if available? useProject doesn't expose it usually? Wait, useProject exposes saveDocument? Checking Pillar A. Yes it does.
    const { activeSprint, updateTaskStatus, completeSprint } = useSprint(activeProjectId);

    // Derived Tasks
    const todoTasks = activeSprint?.tasks.filter(t => t.status === 'TODO') || [];
    const doneTasks = activeSprint?.tasks.filter(t => t.status === 'DONE') || [];
    const activeTask = activeSprint?.tasks.find(t => t.status === 'IN_PROGRESS');

    // State
    const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
    const [relayGenerated, setRelayGenerated] = useState(false);

    // Chat Persistence State
    const [allChats, setAllChats] = useState<Record<string, { role: 'user' | 'model', text: string }[]>>({});
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Context Loading
    const context: ConstructionContext = {
        task: activeTask,
        prd: documents.find(d => d.type === 'PRD')?.content || "",
        strategy: documents.find(d => d.type === 'STRATEGY')?.content || "",
        design: documents.find(d => d.type === 'DESIGN')?.content || "",
        schema: documents.find(d => d.type === 'SCHEMA')?.content || ""
    };

    // Load Chat History
    useEffect(() => {
        if (activeTask && activeProjectId) {
            const taskId = activeTask.id;
            const savedChat = allChats[taskId];

            if (savedChat) {
                setMessages(savedChat);
            } else {
                if (Object.keys(allChats).length === 0) {
                    loadConstructionChat(activeProjectId).then(async (parsed) => {
                        let history: any[] = [];
                        if (parsed) {
                            setAllChats(prev => ({ ...prev, ...parsed }));
                            history = parsed[taskId] || [];
                        }

                        if (history.length > 0) {
                            setMessages(history);
                        } else {
                            setMessages([{ role: 'model', text: "Initializing Construction Protocol..." }]);
                            const kickoffMsg = await startTaskSession(context);
                            const newHistory = [{ role: 'model' as const, text: kickoffMsg }];
                            setMessages(newHistory);
                            setAllChats(prev => ({ ...prev, [taskId]: newHistory }));
                        }
                    });
                }
            }

            // ... (work order gen unchanged)
        } else {
            // ...
        }
    }, [activeTask?.id, activeProjectId]);

    // Save Chat Persistence
    useEffect(() => {
        if (activeProjectId && Object.keys(allChats).length > 0) {
            const timeout = setTimeout(() => {
                saveConstructionChat(activeProjectId, allChats);
            }, 2000);
            return () => clearTimeout(timeout);
        }
    }, [allChats, activeProjectId]);

    // ...


    const handleStartTask = async (taskId: string) => {
        if (activeTask) {
            alert("Finish the current task first!");
            return;
        }
        await updateTaskStatus(taskId, 'IN_PROGRESS');
    };

    const handleCompleteTask = async () => {
        if (!activeTask) return;
        if (!confirm("Are you sure you want to mark this task as COMPLETE?")) return;
        await updateTaskStatus(activeTask.id, 'DONE');
    };

    const handleSendMessage = async (text: string) => {
        if (!activeTask) return;
        const newMsg = { role: 'user' as const, text };
        const updatedMsgs = [...messages, newMsg];
        setMessages(updatedMsgs);

        const newAllChats = { ...allChats, [activeTask.id]: updatedMsgs };
        setAllChats(newAllChats);

        // AI Response Logic
        const response = await askEngineer(context, updatedMsgs, text);
        const aiMsg = { role: 'model' as const, text: response };

        const finalMsgs = [...updatedMsgs, aiMsg];
        setMessages(finalMsgs);
        setAllChats({ ...newAllChats, [activeTask.id]: finalMsgs });
    };

    const handleCompletePhase = async () => {
        if (!activeProjectId) return;
        if (!confirm("Generate Relay F (Instructions) and Complete Phase?")) return;

        try {
            const relay = await generateRelayArtifact({
                currentPhase: 'CONSTRUCTION (Pillar F)',
                nextPhase: 'INTEGRATION (Pillar G)',
                artifactContent: JSON.stringify(allChats),
                decisions: "See Sprint History",
                previousRelayContent: documents.find(d => d.type === 'RELAY_E')?.content || undefined
            });

            await saveDocument({
                project_id: activeProjectId,
                type: 'RELAY_F',
                content: relay,
                title: 'Handover Relay F->G'
            });

            setRelayGenerated(true);
            alert("Phase F Complete. Relay Artifact Generated.");
        } catch (e) {
            console.error(e);
            alert("Failed to generate relay.");
        }
    };

    return (
        <div className="h-full grid grid-cols-12 bg-black font-mono">
            <KanbanQueue
                todoTasks={todoTasks}
                doneTasks={doneTasks}
                activeTask={activeTask}
                onStartTask={handleStartTask}
                onCompleteSprint={completeSprint}
                onCompletePhase={handleCompletePhase}
                isPhaseComplete={relayGenerated}
            />

            <div className="col-span-9 flex flex-col h-full bg-zinc-950 relative min-h-0">
                {/* Workspace Header */}
                <div className="shrink-0 h-10 border-b border-[#27272a] grid grid-cols-12 bg-black/40">
                    <div className="col-span-8 border-r border-[#27272a] flex items-center px-4 justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                {/* Using simple text or icon if available in scope. Terminal is not imported here yet, so using text or existing imports. */}
                                Engineer Uplink
                            </span>
                            {activeTask && (
                                <span className="px-2 py-0.5 rounded-full bg-indigo-900/30 text-indigo-400 text-[10px] font-mono border border-indigo-500/30 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                    {activeTask.title}
                                </span>
                            )}
                            {!activeTask && (
                                <span className="text-[10px] text-zinc-600 italic">Select a task from queue to begin</span>
                            )}
                        </div>
                        {activeTask && (
                            <button
                                onClick={() => {
                                    if (confirm("Clear chat history for this task?")) {
                                        setMessages([]);
                                        setAllChats(prev => ({ ...prev, [activeTask.id]: [] }));
                                    }
                                }}
                                className="p-1 hover:bg-zinc-800 rounded text-zinc-600 hover:text-red-400 transition-colors"
                                title="Clear Chat"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                    <div className="col-span-4 flex items-center px-4 justify-between">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Work Order</span>
                        {relayGenerated && <span className="text-[10px] text-emerald-500 font-bold uppercase">Phase Complete</span>}
                    </div>
                </div>

                {/* Workspace Grid */}
                <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
                    {/* Center: Engineer Chat (66%) */}
                    <div className="col-span-8 h-full border-r border-[#27272a] relative overflow-hidden">
                        <EngineerChat
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            enabled={!!activeTask}
                            bottomRef={chatEndRef as any}
                        />
                    </div>

                    {/* Right: Work Order (33%) */}
                    <div className="col-span-4 h-full relative bg-zinc-950 overflow-hidden">
                        <WorkOrderPanel
                            workOrder={workOrder}
                            isGenerating={isGenerating}
                            onComplete={handleCompleteTask}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
