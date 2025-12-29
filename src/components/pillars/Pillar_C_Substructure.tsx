
"use client";

import React from 'react';
import { SchemaVisualizer } from '@/components/SchemaVisualizer';
import { SubstructurePillars } from './substructure/SubstructurePillars';
import { SubstructureChat } from './substructure/SubstructureChat';
import { SubstructureSchemaViewer } from './substructure/SubstructureSchemaViewer';
import { useSubstructureLogic } from './substructure/useSubstructureLogic';

export default function Pillar_C_Substructure() {
    const {
        messages, input, setInput, isProcessing, liveSchema, pillars,
        showVisualizer, setShowVisualizer, complexity, setComplexity,
        relayGenerated, staleState, handleSend, handleClear,
        handleCompletePhase, handleInit
    } = useSubstructureLogic();

    return (
        <div className="h-full w-full grid grid-cols-12 gap-0 bg-[#020402] text-zinc-300 font-mono">
            <SubstructurePillars
                pillars={pillars}
                onShowVisualizer={() => setShowVisualizer(true)}
            />

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

            <SubstructureSchemaViewer
                liveSchema={liveSchema}
                relayGenerated={relayGenerated}
                staleState={staleState}
                isProcessing={isProcessing}
                onCompletePhase={handleCompletePhase}
            />

            <SchemaVisualizer sql={liveSchema} isOpen={showVisualizer} onClose={() => setShowVisualizer(false)} />
        </div>
    );
}
