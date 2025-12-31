"use client";

import React, { useState, useEffect, useRef } from 'react';
import { checkStaleState } from '@/services/ripple';
import { useProject } from '@/hooks/useProject';
import { sendDesignMessage } from '@/services/design';
import { loadDesignSession, saveDesignSession, deleteDesignSession } from '@/services/design_persistence';
import { ComplexityLevel } from '@/components/ComplexitySelector';
import { generateRelayArtifact } from '@/services/relay';

import StandardPillarLayout from './StandardPillarLayout';
import { DesignDirectives } from './design/DesignDirectives';
import { DesignChat } from './design/DesignChat';
import { DesignArtifactViewer } from './design/DesignArtifactViewer';

export default function Pillar_D_Design() {
    const { activeProjectId, documents, saveDocument } = useProject();
    const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string; recommendation?: any }[]>([]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [designDoc, setDesignDoc] = useState('# Design System\n\n*(Pending Designer input...)*');
    const [pillars, setPillars] = useState<string[]>([]);
    const [complexity, setComplexity] = useState<ComplexityLevel>('INTERMEDIATE');
    const [relayGenerated, setRelayGenerated] = useState(false);
    const staleState = checkStaleState('DESIGN', documents as any);

    useEffect(() => {
        if (activeProjectId) {
            loadDesignSession(activeProjectId).then(session => {
                if (session) {
                    setMessages(session.messages || []);
                    setDesignDoc(session.current_design_doc || designDoc);
                    setPillars(session.completed_stages || []);
                }
            });
            const hasRelay = documents.some(d => d.type === 'RELAY_D');
            if (hasRelay) setRelayGenerated(true);
        }
    }, [activeProjectId, documents]);

    const handleSend = async (text: string) => {
        if (!text.trim() || !activeProjectId) return;

        // Inheritance
        const schemaDoc = documents.find(d => d.type === 'SCHEMA');
        const schemaContent = schemaDoc?.content || "No Schema available.";
        const prdDoc = documents.find(d => d.type === 'PRD');
        const prdContent = prdDoc?.content || "No PRD available.";
        const strategyDoc = documents.find(d => d.type === 'STRATEGY');
        const strategyContent = strategyDoc?.content || "No Strategy available.";

        const newMsgs = [...messages, { role: 'user' as const, text }];
        setMessages(newMsgs);
        setInput('');
        setIsProcessing(true);

        try {
            const result = await sendDesignMessage(text, newMsgs, {
                schema: schemaContent,
                prd: prdContent,
                strategy: strategyContent
            }, complexity);

            const updatedMsgs = [...newMsgs, {
                role: 'model' as const,
                text: result.message,
                recommendation: result.consultantRecommendation
            }];

            setMessages(updatedMsgs);
            if (result.designDocument) {
                setDesignDoc(result.designDocument);
                // Auto-save
                await saveDocument({ project_id: activeProjectId, type: 'DESIGN', content: result.designDocument, title: 'Design System' });
            }
            // setPillars(result.completedPillars); // Service doesn't return this yet

            await saveDesignSession({
                project_id: activeProjectId,
                messages: updatedMsgs,
                current_design_doc: result.designDocument || designDoc,
                completed_stages: pillars // Persist current pillars state or empty for now
            });

        } catch (e) {
            console.error("Design Error:", e);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClear = async () => {
        if (!activeProjectId) return;
        if (!confirm("Are you sure you want to clear the Design Studio?")) return;

        setIsProcessing(true);
        await deleteDesignSession(activeProjectId);
        setMessages([]);
        setDesignDoc('# Design System\n\n*(Pending Designer input...)*');
        setPillars([]);
        setIsProcessing(false);
    };

    const handleCompletePhase = async () => {
        if (!activeProjectId || !designDoc) return;
        if (staleState.isStale && !confirm(`WARNING: ${staleState.reason}\n\nDo you still want to proceed?`)) return;
        if (!confirm("Generate Relay Artifact and Complete Phase D? This will lock the Design System.")) return;

        setIsProcessing(true);
        try {
            const relay = await generateRelayArtifact({
                currentPhase: 'DESIGN (Pillar D)',
                nextPhase: 'PLANNING (Pillar E)',
                artifactContent: designDoc,
                decisions: messages.map(m => m.text).join('\n'),
                previousRelayContent: documents.find(d => d.type === 'RELAY_C')?.content || undefined
            });

            await saveDocument({
                project_id: activeProjectId,
                type: 'RELAY_D',
                content: relay,
                title: 'Handover Relay D->E'
            });

            setRelayGenerated(true);
            alert("Phase D Complete. Relay Artifact Generated.");
        } catch (e) {
            console.error(e);
            alert("Failed to generate relay.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleInit = () => {
        const schemaDoc = documents.find(d => d.type === 'SCHEMA');
        const initText = schemaDoc
            ? `Initialize Design Studio. Inherited Schema Context: ${schemaDoc.title || 'Database Schema'}.`
            : "Initialize Design Studio. Warning: No Schema detected.";
        handleSend(initText);
    };

    return (
        <StandardPillarLayout
            themeColor="indigo"
            leftContent={
                <DesignDirectives
                    pillars={pillars}
                    staleState={staleState}
                />
            }
            mainContent={
                <DesignChat
                    messages={messages}
                    input={input}
                    setInput={setInput}
                    isProcessing={isProcessing}
                    complexity={complexity}
                    setComplexity={setComplexity}
                    onSend={handleSend}
                    onClear={handleClear}
                    onInit={handleInit}
                />
            }
            rightContent={
                <DesignArtifactViewer
                    designDoc={designDoc}
                    relayGenerated={relayGenerated}
                    staleState={staleState}
                    isProcessing={isProcessing}
                    onCompletePhase={handleCompletePhase}
                />
            }
        />
    );
}
