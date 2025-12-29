import { useState, useEffect, useRef } from 'react';
import { useProject } from '@/hooks/useProject';
import { checkStaleState } from '@/services/ripple';
import { loadSubstructureSession, saveSubstructureSession, deleteSubstructureSession } from '@/services/substructure_persistence';
import { sendSubstructureMessage } from '@/services/substructure';
import { generateRelayArtifact } from '@/services/relay';
import { ComplexityLevel } from '@/components/ComplexitySelector';

export function useSubstructureLogic() {
    const { project, documents, saveDocument } = useProject();
    const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string; recommendation?: any }[]>([]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [liveSchema, setLiveSchema] = useState('-- Pending Schema Architect...');
    const [pillars, setPillars] = useState<string[]>([]);
    const [showVisualizer, setShowVisualizer] = useState(false);
    const [complexity, setComplexity] = useState<ComplexityLevel>('INTERMEDIATE');
    const [relayGenerated, setRelayGenerated] = useState(false);
    const staleState = checkStaleState('SCHEMA', documents as any);

    useEffect(() => {
        if (project?.id) {
            loadSubstructureSession(project.id).then(session => {
                if (session) {
                    setMessages(session.messages || []);
                    setLiveSchema(session.schema_sql || liveSchema);
                    setPillars(session.completed_pillars || []);
                }
            });
            const hasRelay = documents.some(d => d.type === 'RELAY_C');
            if (hasRelay) setRelayGenerated(true);
        }
    }, [project?.id, documents]);

    const handleSend = async (text: string) => {
        if (!text.trim() || !project) return;

        const strategyDoc = documents.find(d => d.type === 'STRATEGY');
        const strategyContent = strategyDoc?.content || "No Strategy available.";
        const prdDoc = documents.find(d => d.type === 'PRD');
        const prdContent = prdDoc?.content || "No PRD available.";

        const newMsgs = [...messages, { role: 'user' as const, text }];
        setMessages(newMsgs);
        setInput('');
        setIsProcessing(true);

        try {
            const result = await sendSubstructureMessage(text, newMsgs, strategyContent, prdContent, complexity);
            const updatedMsgs = [...newMsgs, { role: 'model' as const, text: result.message, recommendation: result.consultantRecommendation }];

            setMessages(updatedMsgs);
            if (result.schemaSql) {
                setLiveSchema(result.schemaSql);
                await saveDocument({ project_id: project.id, type: 'SCHEMA', content: result.schemaSql, title: 'PostgreSQL Schema' });
            }
            setPillars(result.completedPillars);

            await saveSubstructureSession({
                project_id: project.id,
                messages: updatedMsgs,
                schema_sql: result.schemaSql || liveSchema,
                completed_pillars: result.completedPillars
            });
        } catch (e) {
            console.error("Substructure Error:", e);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClear = async () => {
        if (!project) return;
        if (!confirm("Are you sure you want to clear the Substructure Architect?")) return;
        setIsProcessing(true);
        await deleteSubstructureSession(project.id);
        setMessages([]);
        setLiveSchema('-- Pending Schema Architect...');
        setPillars([]);
        setIsProcessing(false);
    };

    const handleCompletePhase = async () => {
        if (!project || !liveSchema) return;
        if (staleState.isStale && !confirm(`WARNING: ${staleState.reason}\n\nDo you still want to proceed?`)) return;
        if (!confirm("Generate Relay Artifact and Complete Phase C? This will lock the Schema.")) return;

        setIsProcessing(true);
        try {
            const relay = await generateRelayArtifact({
                currentPhase: 'SUBSTRUCTURE (Pillar C)',
                nextPhase: 'DESIGN (Pillar D)',
                artifactContent: liveSchema,
                decisions: messages.map(m => m.text).join('\n'),
                previousRelayContent: documents.find(d => d.type === 'RELAY_B')?.content || undefined
            });

            await saveDocument({
                project_id: project.id,
                type: 'RELAY_C',
                content: relay,
                title: 'Handover Relay C->D'
            });

            setRelayGenerated(true);
            alert("Phase C Complete. Relay Artifact Generated.");
        } catch (e) {
            console.error(e);
            alert("Failed to generate relay.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleInit = () => {
        const strategyDoc = documents.find(d => d.type === 'STRATEGY');
        const initText = strategyDoc
            ? `Initialize Substructure Architect. Inherited Strategy Context: ${strategyDoc.title || 'Technical Directive'}.`
            : "Initialize Substructure Architect. Warning: No Strategy Directive detected.";
        handleSend(initText);
    };

    return {
        messages, input, setInput, isProcessing, liveSchema, pillars,
        showVisualizer, setShowVisualizer, complexity, setComplexity,
        relayGenerated, staleState, handleSend, handleClear,
        handleCompletePhase, handleInit
    };
}
