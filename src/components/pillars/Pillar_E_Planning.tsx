
"use client";

import React, { useState, useEffect } from 'react';
import { useProject } from '@/hooks/useProject';
import { useSprint } from '@/hooks/useSprint';
import { PlanningChat } from './planning/PlanningChat';
import { RequirementFeed } from './planning/RequirementFeed';
import { PlanningTools } from './planning/PlanningTools';
import { saveBacklogSession, loadBacklogSession } from '@/services/planning_persistence';
import { decomposeToBacklog, assessRisks, createRoadmap, evaluateHandover } from '@/services/planning';
import { generateRelayArtifact } from '@/services/relay';
import { checkStaleState } from '@/services/ripple';
import StandardPillarLayout from '../StandardPillarLayout';

export default function Pillar_E_Planning() {
    const { activeProjectId, documents, saveDocument } = useProject();
    const { activeSprint, startSprint, backlogTasks } = useSprint(activeProjectId);

    // Right Panel View State is now handled in PlanningTools, but we hold data here
    const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

    // Data State
    const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [backlogMarkdown, setBacklogMarkdown] = useState('# Project Backlog\n\nWaiting for decomposition...');

    // Relay State
    const [relayGenerated, setRelayGenerated] = useState(false);

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
            // Check for existing relay
            if (documents.some(d => d.type === 'RELAY_E')) {
                setRelayGenerated(true);
            }
        }
    }, [activeProjectId, documents]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || !activeProjectId) return;

        setIsProcessing(true);
        const newMsgs = [...messages, { role: 'user' as const, text }];
        setMessages(newMsgs);

        try {
            // Context Logic
            const designDoc = documents.find(d => d.type === 'DESIGN')?.content || "No Design Doc";
            // const context = `Design Context:\n${typeof designDoc === 'string' ? designDoc : JSON.stringify(designDoc)}\n\nUser Request: ${text}`;

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

    const handleSaveBacklog = async () => {
        if (!activeProjectId) return;
        setIsProcessing(true);
        await saveDocument({ project_id: activeProjectId, type: 'BACKLOG', content: backlogMarkdown, title: 'Backlog Artifact' });
        setIsProcessing(false);
    };

    return (
        <StandardPillarLayout
            themeColor="purple"
            leftContent={
                <RequirementFeed
                    prd={documents.find(d => d.type === 'PRD')?.content || "No PRD"}
                />
            }
            mainContent={
                <PlanningChat
                    messages={messages}
                    isProcessing={isProcessing}
                    onSendMessage={handleSendMessage}
                    onClear={() => setMessages([])}
                />
            }
            rightContent={
                <PlanningTools
                    backlogTasks={backlogTasks}
                    backlogMarkdown={backlogMarkdown}
                    selectedTasks={selectedTasks}
                    relayGenerated={relayGenerated}
                    staleState={staleState}
                    isProcessing={isProcessing}
                    onGenerate={() => handleSendMessage('Decompose strategy to backlog and tasks')}
                    onToggleSelect={(id) => setSelectedTasks(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                    handleCreateSprint={handleCreateSprint}
                    onSaveBacklog={handleSaveBacklog}
                    onCompletePhase={handleCompletePhase}
                />
            }
        />
    );
}
