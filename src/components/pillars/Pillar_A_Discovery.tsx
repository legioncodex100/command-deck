"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useProject } from '@/hooks/useProject';
import StandardPillarLayout from './StandardPillarLayout';
import { sendDiscoveryMessage } from '@/services/discovery';
import { loadDiscoverySession, saveDiscoverySession, deleteDiscoverySession } from '@/services/discovery_persistence';
import { ComplexityLevel } from '@/components/ComplexitySelector';
import { generateRelayArtifact } from '@/services/relay';
import { DiscoveryRoadmap } from './discovery/DiscoveryRoadmap';
import { DiscoveryChat } from './discovery/DiscoveryChat';
import { DiscoveryArtifactViewer } from './discovery/DiscoveryArtifactViewer';

export default function Pillar_A_Discovery() {
    const { project, documents, saveDocument } = useProject();
    const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string; recommendation?: any }[]>([]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [livePRD, setLivePRD] = useState('# Product Requirements Document\n\n*(Pending extraction...)*');
    const [complexity, setComplexity] = useState<ComplexityLevel>('INTERMEDIATE');
    const [phases, setPhases] = useState<string[]>([]);
    const [relayGenerated, setRelayGenerated] = useState(false);

    useEffect(() => {
        if (project?.id) {
            loadDiscoverySession(project.id).then(session => {
                if (session) {
                    setMessages(session.messages);
                    setLivePRD(session.current_prd || livePRD);
                    setPhases(session.completed_phases || []);
                }
            });
            const hasRelay = documents.some(d => d.type === 'RELAY_A');
            if (hasRelay) setRelayGenerated(true);
        }
    }, [project?.id, documents]);

    const handleSend = async (text: string) => {
        if (!text.trim() || !project) return;
        const newMsgs = [...messages, { role: 'user' as const, text }];
        setMessages(newMsgs);
        setInput('');
        setIsProcessing(true);

        try {
            const result = await sendDiscoveryMessage(text, newMsgs, livePRD, complexity);
            const updatedMsgs = [...newMsgs, { role: 'model' as const, text: result.message, recommendation: result.consultantRecommendation }];
            setMessages(updatedMsgs);
            if (result.prdUpdate) setLivePRD(result.prdUpdate);
            setPhases(result.completedPhases);

            await saveDiscoverySession({
                project_id: project.id,
                messages: updatedMsgs,
                current_prd: result.prdUpdate || livePRD,
                completed_phases: result.completedPhases,
                last_persona: 'Senior Business Analyst'
            });

            if (result.prdUpdate) {
                await saveDocument({ project_id: project.id, type: 'PRD', content: result.prdUpdate, title: 'Live Artifact' });
            }
        } catch (e) {
            console.error("Discovery Error:", e);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClear = async () => {
        if (!project) return;
        if (!confirm("Are you sure you want to clear this session? All phases will be reset.")) return;
        setIsProcessing(true);
        await deleteDiscoverySession(project.id);
        setMessages([]);
        setLivePRD('# Product Requirements Document\n\n*(Pending extraction...)*');
        setPhases([]);
        setIsProcessing(false);
    };

    const handleCompletePhase = async () => {
        if (!project || !livePRD) return;
        if (!confirm("Generate Relay Artifact and Complete Phase A? This will lock the PRD.")) return;

        setIsProcessing(true);
        try {
            const relay = await generateRelayArtifact({
                currentPhase: 'DISCOVERY (Pillar A)',
                nextPhase: 'STRATEGY (Pillar B)',
                artifactContent: livePRD,
                decisions: messages.map(m => m.text).join('\n'),
                previousRelayContent: undefined
            });

            await saveDocument({
                project_id: project.id,
                type: 'RELAY_A',
                content: relay,
                title: 'Handover Relay A->B'
            });

            setRelayGenerated(true);
            alert("Phase A Complete. Relay Artifact Generated.");
        } catch (e) {
            console.error(e);
            alert("Failed to generate relay.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <StandardPillarLayout
            themeColor="emerald"
            leftContent={
                <DiscoveryRoadmap
                    phases={phases}
                />
            }
            mainContent={
                <DiscoveryChat
                    messages={messages}
                    input={input}
                    setInput={setInput}
                    isProcessing={isProcessing}
                    complexity={complexity}
                    setComplexity={setComplexity}
                    onSend={handleSend}
                    onClear={handleClear}
                />
            }
            rightContent={
                <DiscoveryArtifactViewer
                    livePRD={livePRD}
                    relayGenerated={relayGenerated}
                    onCompletePhase={handleCompletePhase}
                    isProcessing={isProcessing}
                    complexity={complexity}
                    setComplexity={setComplexity}
                />
            }
        />
    );
}
