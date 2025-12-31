
import React, { useState, useEffect, useRef } from 'react';
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
import StandardPillarLayout from './StandardPillarLayout';

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
        <StandardPillarLayout
            themeColor="blue"
            leftContent={
                <KanbanQueue
                    todoTasks={todoTasks}
                    doneTasks={doneTasks}
                    activeTask={activeTask}
                    onStartTask={handleStartTask}
                    onCompleteSprint={completeSprint}
                    onCompletePhase={handleCompletePhase}
                    isPhaseComplete={relayGenerated}
                />
            }
            mainContent={
                <EngineerChat
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    enabled={!!activeTask}
                    bottomRef={chatEndRef as any}
                    activeTask={activeTask}
                    onClearChat={() => {
                        if (activeTask && confirm("Clear chat history for this task?")) {
                            setMessages([]);
                            setAllChats(prev => ({ ...prev, [activeTask.id]: [] }));
                        }
                    }}
                />
            }
            rightContent={
                <WorkOrderPanel
                    workOrder={workOrder}
                    isGenerating={isGenerating}
                    onComplete={handleCompleteTask}
                    isPhaseComplete={relayGenerated}
                />
            }
        />
    );
}
