import { useState, useEffect, useRef } from 'react';
import { useProject } from '@/hooks/useProject';
import { checkStaleState } from '@/services/ripple';
import { loadStrategySession, saveStrategySession, deleteStrategySession } from '@/services/strategy_persistence';
import { sendStrategyMessage } from '@/services/strategy';
import { generateRelayArtifact } from '@/services/relay';
import { ComplexityLevel } from '@/components/ComplexitySelector';

export function useStrategyLogic() {
    const { project, documents, saveDocument } = useProject();
    const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string; recommendation?: any }[]>([]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [liveStrategy, setLiveStrategy] = useState('# Technical Strategy Directive\n\n*(Pending architectural review...)*');
    const [pillars, setPillars] = useState<string[]>([]);
    const [complexity, setComplexity] = useState<ComplexityLevel>('INTERMEDIATE');
    const [relayGenerated, setRelayGenerated] = useState(false);
    const staleState = checkStaleState('STRATEGY', documents as any);

    useEffect(() => {
        if (project?.id) {
            loadStrategySession(project.id).then(session => {
                if (session) {
                    setMessages(session.messages || []);
                    setLiveStrategy(session.current_draft || liveStrategy);
                    setPillars(session.completed_pillars || []);
                }
            });
            const hasRelay = documents.some(d => d.type === 'RELAY_B');
            if (hasRelay) setRelayGenerated(true);
        }
    }, [project?.id, documents]);

    const handleSend = async (text: string) => {
        if (!text.trim() || !project) return;

        const prdDoc = documents.find(d => d.type === 'PRD');
        const prdContent = prdDoc?.content || "No PRD available.";

        const newMsgs = [...messages, { role: 'user' as const, text }];
        setMessages(newMsgs);
        setInput('');
        setIsProcessing(true);

        try {
            const result = await sendStrategyMessage(text, newMsgs, prdContent, complexity);

            const updatedMsgs = [...newMsgs, {
                role: 'model' as const,
                text: result.message,
                recommendation: result.consultantRecommendation
            }];

            setMessages(updatedMsgs);
            if (result.draftUpdate) setLiveStrategy(result.draftUpdate);
            setPillars(result.completedPillars);

            await saveStrategySession({
                project_id: project.id,
                messages: updatedMsgs,
                current_draft: result.draftUpdate || liveStrategy,
                completed_pillars: result.completedPillars,
                last_persona: 'INTERMEDIATE'
            });

            if (result.draftUpdate) {
                await saveDocument({ project_id: project.id, type: 'STRATEGY', content: result.draftUpdate, title: 'Technical Strategy' });
            }

        } catch (e) {
            console.error("Strategy Error:", e);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClear = async () => {
        if (!project) return;
        if (!confirm("Are you sure you want to clear the Strategy Room?")) return;

        setIsProcessing(true);
        await deleteStrategySession(project.id);
        setMessages([]);
        setLiveStrategy('# Technical Strategy Directive\n\n*(Pending architectural review...)*');
        setPillars([]);
        setIsProcessing(false);
    };

    const handleCompletePhase = async () => {
        if (!project || !liveStrategy) return;
        if (staleState.isStale && !confirm(`WARNING: ${staleState.reason}\n\nDo you still want to proceed?`)) return;
        if (!confirm("Generate Relay Artifact and Complete Phase B? This will lock the Strategy.")) return;

        setIsProcessing(true);
        try {
            const relay = await generateRelayArtifact({
                currentPhase: 'STRATEGY (Pillar B)',
                nextPhase: 'SUBSTRUCTURE (Pillar C)',
                artifactContent: liveStrategy,
                decisions: messages.map(m => m.text).join('\n'),
                previousRelayContent: documents.find(d => d.type === 'RELAY_A')?.content || undefined
            });

            await saveDocument({
                project_id: project.id,
                type: 'RELAY_B',
                content: relay,
                title: 'Handover Relay B->C'
            });

            setRelayGenerated(true);
            alert("Phase B Complete. Relay Artifact Generated.");
        } catch (e) {
            console.error(e);
            alert("Failed to generate relay.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleInit = () => {
        const prdDoc = documents.find(d => d.type === 'PRD');
        const initText = prdDoc
            ? `Initialize Strategy Room. Inherited PRD Context: ${prdDoc.title || 'Standard PRD'}.`
            : "Initialize Strategy Room. Warning: No PRD detected.";
        handleSend(initText);
    };

    return {
        messages, input, setInput, isProcessing, liveStrategy, pillars,
        complexity, setComplexity, relayGenerated, staleState,
        handleSend, handleClear, handleCompletePhase, handleInit,
        currentPRDTitle: documents.find(d => d.type === 'PRD')?.title
    };
}
