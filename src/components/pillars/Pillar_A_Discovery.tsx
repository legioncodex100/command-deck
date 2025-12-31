"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useProject } from '@/hooks/useProject';
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

    const searchParams = useSearchParams();
    const router = useRouter();
    const activeDrawer = searchParams.get('mobile_view'); // 'roadmap' | 'artifacts' | null

    const closeDrawer = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('mobile_view');
        router.replace(`?${params.toString()}`);
    };

    return (
        <div className="h-full w-full relative flex lg:grid lg:grid-cols-12 gap-0 bg-black text-zinc-300 font-sans overflow-hidden">

            {/* Mobile Overlay Backdrop */}
            {activeDrawer && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={closeDrawer}
                />
            )}

            {/* Left Panel: Roadmap (Drawer on Mobile, Column on Desktop) */}
            <DiscoveryRoadmap
                phases={phases}
                onClose={closeDrawer}
                className={cn(
                    "transition-transform duration-300 ease-in-out z-50",
                    // Desktop: Static 3-col
                    "lg:col-span-3 lg:static lg:translate-x-0 lg:w-auto lg:border-r lg:border-emerald-500/20",
                    // Mobile: Fixed Drawer
                    "fixed inset-y-0 left-0 w-[85vw] border-r border-zinc-800",
                    activeDrawer === 'roadmap' ? "translate-x-0" : "-translate-x-full"
                )}
            />

            {/* Center Panel: Chat (Always Visible, Full Width on Mobile) */}
            <DiscoveryChat
                messages={messages}
                input={input}
                setInput={setInput}
                isProcessing={isProcessing}
                complexity={complexity}
                setComplexity={setComplexity}
                onSend={handleSend}
                onClear={handleClear}
                className="lg:col-span-6 w-full h-full z-0"
            />

            {/* Right Panel: Artifacts (Drawer on Mobile, Column on Desktop) */}
            <DiscoveryArtifactViewer
                livePRD={livePRD}
                relayGenerated={relayGenerated}
                onCompletePhase={handleCompletePhase}
                isProcessing={isProcessing}
                complexity={complexity}
                setComplexity={setComplexity}
                onClose={closeDrawer}
                className={cn(
                    "transition-transform duration-300 ease-in-out z-50",
                    // Desktop: Static 3-col
                    "lg:col-span-3 lg:static lg:translate-x-0 lg:w-auto lg:border-l lg:border-emerald-500/20",
                    // Mobile: Fixed Drawer
                    "fixed inset-y-0 right-0 w-[85vw] border-l border-zinc-800",
                    activeDrawer === 'artifacts' ? "translate-x-0" : "translate-x-full"
                )}
            />
        </div>
    );
}
