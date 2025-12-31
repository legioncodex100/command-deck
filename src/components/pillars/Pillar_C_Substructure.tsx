"use client";

import React from 'react';
import { SchemaVisualizer } from '@/components/SchemaVisualizer';
import { SubstructurePillars } from './substructure/SubstructurePillars';
import { SubstructureChat } from './substructure/SubstructureChat';
import { SubstructureSchemaViewer } from './substructure/SubstructureSchemaViewer';
import { useSubstructureLogic } from './substructure/useSubstructureLogic';
import StandardPillarLayout from './StandardPillarLayout';

export default function Pillar_C_Substructure() {
    const {
        messages, input, setInput, isProcessing, liveSchema, pillars,
        showVisualizer, setShowVisualizer, complexity, setComplexity,
        relayGenerated, staleState, handleSend, handleClear,
        handleCompletePhase, handleInit
    } = useSubstructureLogic();

    return (
        <>
            <StandardPillarLayout
                themeColor="emerald"
                leftContent={
                    <SubstructurePillars
                        pillars={pillars}
                        onShowVisualizer={() => setShowVisualizer(true)}
                    />
                }
                mainContent={
                    <SubstructureChat
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
                    <SubstructureSchemaViewer
                        liveSchema={liveSchema}
                        relayGenerated={relayGenerated}
                        staleState={staleState}
                        isProcessing={isProcessing}
                        onCompletePhase={handleCompletePhase}
                    />
                }
            />
            <SchemaVisualizer sql={liveSchema} isOpen={showVisualizer} onClose={() => setShowVisualizer(false)} />
        </>
    );
}
